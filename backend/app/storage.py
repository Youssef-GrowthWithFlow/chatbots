"""
In-memory storage for generated resumes.

This module manages the in-memory storage of resume data.
In production, this should be replaced with a database (e.g., DynamoDB).
"""
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# In-memory storage: {resume_id: resume_data_dict}
_resume_storage: Dict[str, dict] = {}


def store_resume(resume_id: str, resume_data: dict) -> None:
    """
    Store resume data in memory.

    Args:
        resume_id: Unique identifier for the resume
        resume_data: Resume data as dictionary
    """
    _resume_storage[resume_id] = resume_data
    logger.info(f"✓ Stored resume: {resume_id}")


def get_resume(resume_id: str) -> Optional[dict]:
    """
    Retrieve resume data by ID.

    Args:
        resume_id: Unique identifier for the resume

    Returns:
        Resume data dictionary, or None if not found
    """
    return _resume_storage.get(resume_id)


def resume_exists(resume_id: str) -> bool:
    """
    Check if a resume exists in storage.

    Args:
        resume_id: Unique identifier for the resume

    Returns:
        True if resume exists, False otherwise
    """
    return resume_id in _resume_storage


def clear_storage() -> None:
    """Clear all stored resumes (useful for testing)."""
    _resume_storage.clear()
    logger.info("✓ Cleared resume storage")
