"""
Centralized configuration for the chatbot backend.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration."""

    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Gemini Models
    CHAT_MODEL: str = "gemini-2.5-flash-lite"
    EMBEDDING_MODEL: str = "text-embedding-004"

    # Generation Config
    CHAT_TEMPERATURE: float = 0.7
    CHAT_TOP_P: float = 0.95
    CHAT_TOP_K: int = 40
    CHAT_MAX_OUTPUT_TOKENS: int = 1024

    # RAG Config
    RAG_TOP_K: int = 3
    RAG_SIMILARITY_THRESHOLD: float = 0.3
    RAG_CHUNK_SIZE: int = 1000
    RAG_CHUNK_OVERLAP: int = 200

    # Embedding Config
    EMBEDDING_BATCH_SIZE: int = 100

    # Retry Config
    MAX_RETRIES: int = 3
    RETRY_BASE_DELAY: float = 2.0  # seconds


config = Config()
