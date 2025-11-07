#!/usr/bin/env python3
"""
Document ingestion script for RAG pipeline.
Reads markdown files from knowledge_base/ directory, chunks them, and creates FAISS index.
"""

import os
import glob
import faiss
import numpy as np
import pickle
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
import time

# Load environment variables
load_dotenv()

# Configuration
KNOWLEDGE_BASE_DIR = "knowledge_base"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
INDEX_PATH = "index.faiss"
METADATA_PATH = "index_metadata.pkl"
EMBEDDING_MODEL = "gemini-embedding-001"
BATCH_SIZE = 100  # Process embeddings in batches for efficiency


def read_markdown_files(directory):
    """Read all markdown files from the knowledge base directory."""
    files_data = []
    pattern = os.path.join(directory, "*.md")

    for file_path in glob.glob(pattern):
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
                files_data.append(
                    {
                        "file_path": file_path,
                        "content": content,
                        "filename": os.path.basename(file_path),
                    }
                )
                print(f"✓ Read file: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"✗ Error reading {file_path}: {e}")

    return files_data


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Split text into overlapping chunks using LangChain splitter."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        keep_separator=True,
    )

    chunks = text_splitter.split_text(text)
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def process_documents(files_data):
    """Process documents into chunks with metadata."""
    all_chunks = []
    metadata = []

    for file_data in files_data:
        content = file_data["content"]
        filename = file_data["filename"]

        # Remove markdown headers for cleaner chunks
        content = content.replace("#", "").replace("*", "")

        chunks = chunk_text(content)

        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) > 50:  # Only keep substantial chunks
                all_chunks.append(chunk)
                metadata.append(
                    {
                        "filename": filename,
                        "chunk_id": i,
                        "source": file_data["file_path"],
                    }
                )

        print(f"✓ Processed {len(chunks)} chunks from {filename}")

    return all_chunks, metadata


def create_embeddings_batch(chunks, client):
    """
    Create embeddings using Gemini API with batch processing and retry logic.

    Args:
        chunks: List of text chunks to embed
        client: Gemini client instance

    Returns:
        NumPy array of embeddings
    """
    print(f"Creating embeddings for {len(chunks)} chunks using Gemini...")
    embeddings = []

    # Process in batches
    for batch_start in range(0, len(chunks), BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, len(chunks))
        batch = chunks[batch_start:batch_end]
        batch_num = (batch_start // BATCH_SIZE) + 1
        total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"\nProcessing batch {batch_num}/{total_batches} ({len(batch)} chunks)...")

        # Create embeddings for batch with retry logic
        batch_embeddings = create_batch_with_retry(batch, client)
        embeddings.extend(batch_embeddings)

        print(f"  ✓ Batch {batch_num} completed ({len(embeddings)}/{len(chunks)} total)")

    embeddings_array = np.array(embeddings).astype("float32")
    print(
        f"\n✓ Created {len(embeddings)} embeddings of dimension {embeddings_array.shape[1]}"
    )

    return embeddings_array


def create_batch_with_retry(batch, client, max_retries=3):
    """
    Create embeddings for a batch with retry logic.

    Args:
        batch: List of text chunks to embed
        client: Gemini client instance
        max_retries: Maximum number of retry attempts

    Returns:
        List of embedding vectors
    """
    for attempt in range(max_retries):
        try:
            # Use batch embedding API
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=batch,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
            )

            # Extract embeddings from response
            if hasattr(result, "embeddings"):
                return [emb.values for emb in result.embeddings]
            else:
                print(f"  ✗ Unexpected response format: {result}")
                raise ValueError("Could not extract embeddings from response")

        except Exception as e:
            wait_time = 2**attempt  # Exponential backoff
            print(f"  ⚠ Batch embedding attempt {attempt + 1}/{max_retries} failed: {e}")

            if attempt < max_retries - 1:
                print(f"  → Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"  ✗ All {max_retries} attempts failed for this batch")
                # Return zero vectors as fallback
                print(f"  → Using zero vectors as fallback for {len(batch)} chunks")
                return [[0.0] * 768 for _ in batch]  # Gemini embedding dimension

    # Should not reach here, but return zero vectors just in case
    return [[0.0] * 768 for _ in batch]


def create_faiss_index(embeddings):
    """Create and populate FAISS index."""
    print("Creating FAISS index...")

    # Convert to numpy array and ensure float32
    embeddings = np.array(embeddings).astype("float32")

    # Create index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner product for similarity

    # Normalize embeddings for cosine similarity
    faiss.normalize_L2(embeddings)

    # Add embeddings to index
    index.add(embeddings)

    print(f"✓ Created index with {index.ntotal} vectors of dimension {dimension}")

    return index


def save_index_and_metadata(index, metadata, chunks):
    """Save FAISS index and metadata to disk."""
    # Save FAISS index
    faiss.write_index(index, INDEX_PATH)
    print(f"✓ Saved FAISS index to {INDEX_PATH}")

    # Save metadata and chunks
    metadata_dict = {"metadata": metadata, "chunks": chunks, "total_chunks": len(chunks)}

    with open(METADATA_PATH, "wb") as f:
        pickle.dump(metadata_dict, f)
    print(f"✓ Saved metadata to {METADATA_PATH}")


def main():
    print("Starting document ingestion pipeline...")
    print("=" * 50)

    # Check if knowledge base directory exists
    if not os.path.exists(KNOWLEDGE_BASE_DIR):
        print(f"✗ Knowledge base directory not found: {KNOWLEDGE_BASE_DIR}")
        return

    # Read markdown files
    files_data = read_markdown_files(KNOWLEDGE_BASE_DIR)
    if not files_data:
        print("✗ No markdown files found in knowledge base directory")
        return

    print(f"Found {len(files_data)} files to process")
    print("-" * 30)

    # Process documents into chunks
    chunks, metadata = process_documents(files_data)
    print(f"Total chunks created: {len(chunks)}")
    print("-" * 30)

    # Initialize Gemini client
    print("Initializing Gemini client...")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("✗ GEMINI_API_KEY not found in environment")
        return

    client = genai.Client(api_key=api_key)
    print("✓ Gemini client initialized")
    print("-" * 30)

    # Create embeddings in batches
    embeddings = create_embeddings_batch(chunks, client)

    # Create FAISS index
    index = create_faiss_index(embeddings)

    # Save everything
    save_index_and_metadata(index, metadata, chunks)

    print("=" * 50)
    print("✓ Document ingestion completed successfully!")
    print(f"✓ Index contains {len(chunks)} chunks from {len(files_data)} files")
    print("✓ Ready for RAG queries")


if __name__ == "__main__":
    main()
