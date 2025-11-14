"""
RAG (Retrieval-Augmented Generation) service for knowledge base search.
"""
import os
import faiss
import numpy as np
import pickle
from typing import List, Dict
import logging
from .gemini_service import gemini_service
from .config import config

logger = logging.getLogger(__name__)


class RAGService:
    """Service for retrieving relevant context from the knowledge base."""

    def __init__(
        self, index_path: str = "index.faiss", metadata_path: str = "index_metadata.pkl"
    ):
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.index = None
        self.metadata = None
        self.chunks = None
        self.is_initialized = False

    def initialize(self) -> bool:
        """Initialize the RAG service by loading index and metadata."""
        try:
            # Load FAISS index
            if not os.path.exists(self.index_path):
                logger.warning(f"FAISS index not found at {self.index_path}")
                return False

            self.index = faiss.read_index(self.index_path)
            logger.info(f"✓ Loaded FAISS index with {self.index.ntotal} vectors")

            # Load metadata and chunks
            if not os.path.exists(self.metadata_path):
                logger.warning(f"Metadata file not found at {self.metadata_path}")
                return False

            with open(self.metadata_path, "rb") as f:
                data = pickle.load(f)
                self.metadata = data["metadata"]
                self.chunks = data["chunks"]

            logger.info(f"✓ Loaded metadata for {len(self.chunks)} chunks")

            self.is_initialized = True
            return True

        except Exception as e:
            logger.error(f"Error initializing RAG service: {e}")
            return False

    def search(
        self,
        query: str,
        top_k: int = None,
        similarity_threshold: float = None,
    ) -> List[Dict]:
        """
        Search for relevant chunks in the knowledge base.

        Args:
            query: The search query
            top_k: Number of top results to return (defaults to config value)
            similarity_threshold: Minimum similarity score (defaults to config value)

        Returns:
            List of relevant chunks with metadata and scores
        """
        if not self.is_initialized:
            logger.warning("RAG service not initialized")
            return []

        if not gemini_service.is_available():
            logger.warning("Gemini service not available for embeddings")
            return []

        # Use config defaults if not specified
        top_k = top_k or config.RAG_TOP_K
        similarity_threshold = similarity_threshold or config.RAG_SIMILARITY_THRESHOLD

        try:
            # Create embedding for query using gemini_service
            embedding_values = gemini_service.create_embedding(
                query, task_type="RETRIEVAL_QUERY"
            )

            if embedding_values is None:
                logger.error("Failed to create query embedding")
                return []

            query_embedding = np.array([embedding_values]).astype("float32")

            # Normalize for cosine similarity
            faiss.normalize_L2(query_embedding)

            # Search the index
            scores, indices = self.index.search(query_embedding, top_k)

            # Prepare results
            results = []
            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if score >= similarity_threshold and idx < len(self.chunks):
                    results.append(
                        {
                            "chunk": self.chunks[idx],
                            "metadata": self.metadata[idx],
                            "score": float(score),
                            "rank": i + 1,
                        }
                    )

            logger.info(
                f"Found {len(results)} relevant chunks for query: '{query[:50]}...'"
            )
            return results

        except Exception as e:
            logger.error(f"Error searching knowledge base: {e}")
            return []

    def format_context(
        self, search_results: List[Dict], max_context_length: int = 2000
    ) -> str:
        """
        Format search results into context string for the LLM prompt.

        Args:
            search_results: Results from search method
            max_context_length: Maximum length of context string

        Returns:
            Formatted context string
        """
        if not search_results:
            return ""

        context_parts = []
        current_length = 0

        for result in search_results:
            chunk = result["chunk"]
            metadata = result["metadata"]

            # Format chunk with source information
            formatted_chunk = f"[Source: {metadata['filename']}]\n{chunk.strip()}\n"

            # Check if adding this chunk would exceed the limit
            if current_length + len(formatted_chunk) > max_context_length:
                break

            context_parts.append(formatted_chunk)
            current_length += len(formatted_chunk)

        context = "\n".join(context_parts)

        if context:
            logger.info(
                f"Generated context with {len(context_parts)} chunks ({current_length} characters)"
            )

        return context

    def is_available(self) -> bool:
        """Check if RAG service is available and initialized."""
        return self.is_initialized


# Global RAG service instance
rag_service = RAGService()
