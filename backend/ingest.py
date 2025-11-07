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
import google.generativeai as genai
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load environment variables
load_dotenv()

# Configuration
KNOWLEDGE_BASE_DIR = "knowledge_base"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
INDEX_PATH = "index.faiss"
METADATA_PATH = "index_metadata.pkl"
EMBEDDING_MODEL = "models/text-embedding-004"

def read_markdown_files(directory):
    """Read all markdown files from the knowledge base directory."""
    files_data = []
    pattern = os.path.join(directory, "*.md")
    
    for file_path in glob.glob(pattern):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                files_data.append({
                    'file_path': file_path,
                    'content': content,
                    'filename': os.path.basename(file_path)
                })
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
        keep_separator=True
    )
    
    chunks = text_splitter.split_text(text)
    return [chunk.strip() for chunk in chunks if chunk.strip()]

def process_documents(files_data):
    """Process documents into chunks with metadata."""
    all_chunks = []
    metadata = []
    
    for file_data in files_data:
        content = file_data['content']
        filename = file_data['filename']
        
        # Remove markdown headers for cleaner chunks
        content = content.replace('#', '').replace('*', '')
        
        chunks = chunk_text(content)
        
        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) > 50:  # Only keep substantial chunks
                all_chunks.append(chunk)
                metadata.append({
                    'filename': filename,
                    'chunk_id': i,
                    'source': file_data['file_path']
                })
        
        print(f"✓ Processed {len(chunks)} chunks from {filename}")
    
    return all_chunks, metadata

def create_embeddings(chunks):
    """Create embeddings using Gemini API."""
    print("Configuring Gemini API for embeddings...")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment")
    
    genai.configure(api_key=api_key)
    
    print(f"Creating embeddings for {len(chunks)} chunks using Gemini...")
    embeddings = []
    
    for i, chunk in enumerate(chunks):
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=chunk,
                task_type="retrieval_document"
            )
            embeddings.append(result['embedding'])
            
            if (i + 1) % 10 == 0:
                print(f"  Processed {i + 1}/{len(chunks)} chunks...")
                
        except Exception as e:
            print(f"  Error creating embedding for chunk {i}: {e}")
            # Create zero vector as fallback
            embeddings.append([0.0] * 768)  # Gemini embedding dimension
    
    embeddings_array = np.array(embeddings).astype('float32')
    print(f"✓ Created {len(embeddings)} embeddings of dimension {embeddings_array.shape[1]}")
    
    return embeddings_array

def create_faiss_index(embeddings):
    """Create and populate FAISS index."""
    print("Creating FAISS index...")
    
    # Convert to numpy array and ensure float32
    embeddings = np.array(embeddings).astype('float32')
    
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
    metadata_dict = {
        'metadata': metadata,
        'chunks': chunks,
        'total_chunks': len(chunks)
    }
    
    with open(METADATA_PATH, 'wb') as f:
        pickle.dump(metadata_dict, f)
    print(f"✓ Saved metadata to {METADATA_PATH}")

def main():
    print("Starting document ingestion pipeline...")
    print("="*50)
    
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
    
    # Create embeddings
    embeddings = create_embeddings(chunks)
    
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