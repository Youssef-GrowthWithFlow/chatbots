"""
FastAPI backend for Growth With Flow chatbots.

This module defines the API routes and application startup logic.
Business logic is delegated to flow handlers in the flows/ directory.
"""
import os
import logging
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .rag_service import rag_service
from .gemini_service import gemini_service
from .models import ChatRequest, ChatResponse, JobScrapingRequest, JobScrapingResponse
from . import storage
from .flows import (
    handle_job_scraping,
    handle_cv_generation,
    handle_roadmap_flow,
    handle_presentation_flow,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="Growth With Flow Chatbots API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup."""
    logger.info("Initializing RAG service...")

    # Check if RAG index files exist, if not, create them
    index_path = "index.faiss"
    metadata_path = "index_metadata.pkl"

    if not os.path.exists(index_path) or not os.path.exists(metadata_path):
        logger.info("RAG index files not found. Creating them...")
        try:
            subprocess.run(["python", "ingest.py"], check=True, cwd=".")
            logger.info("✓ RAG index created successfully")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to create RAG index: {e}")
            raise RuntimeError("Failed to initialize RAG service")

    # Initialize RAG service (loads index and metadata)
    if rag_service.initialize():
        logger.info("✓ RAG service initialized successfully")
    else:
        logger.error("Failed to initialize RAG service")
        raise RuntimeError("Failed to initialize RAG service")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "rag_available": rag_service.is_available(),
        "gemini_available": gemini_service.is_available(),
    }


@app.post("/scrape-job-url", response_model=JobScrapingResponse)
async def scrape_job_url(request: JobScrapingRequest):
    """
    Extract job information from URL using Gemini's URL context feature.

    This is part of the CV generation flow.
    """
    return await handle_job_scraping(request)


@app.get("/resume/{resume_id}")
async def get_resume(resume_id: str):
    """Retrieve generated resume data by ID."""
    resume_data = storage.get_resume(resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume_data


@app.post("/chat", response_model=ChatResponse)
async def chat_with_gemini(request: ChatRequest):
    """
    Main chat endpoint - routes to appropriate flow handler.

    Supports multi-turn conversations (no streaming).
    """
    if not gemini_service.is_available():
        raise HTTPException(status_code=500, detail="Gemini service not initialized")

    try:
        # Route based on flow_id
        if request.flow_id == "ROADMAP":
            return await handle_roadmap_flow(request)

        elif request.flow_id == "DYNAMIC_CV":
            # CV generation flow
            if not request.form_data:
                raise HTTPException(
                    status_code=400,
                    detail="form_data is required for DYNAMIC_CV flow"
                )
            return await handle_cv_generation(request.form_data)

        elif request.flow_id == "PRESENTATION":
            return await handle_presentation_flow(request)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown flow_id: {request.flow_id}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
