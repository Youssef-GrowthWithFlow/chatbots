"""
Pydantic models for API requests and responses.
"""
from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str
    flow_id: str = "PRESENTATION"
    session_id: str  # Required: unique session identifier for multi-turn conversations
    form_data: dict = None  # Optional form data for multi-step flows


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    session_id: str
    flow_id: str
    next_action: str = None  # Optional: "RENDER_WIDGET_FORM", "RENDER_LOADING", "RENDER_ANALYSIS"
    widget_data: dict = None  # Optional: widget configuration data


class JobScrapingRequest(BaseModel):
    """Request model for job URL scraping."""
    job_url: str


class JobScrapingResponse(BaseModel):
    """Response model for job scraping."""
    company_name: str = ""
    job_title: str = ""
    job_description: str
    main_missions: str
    qualifications: str
    additional_info: str
