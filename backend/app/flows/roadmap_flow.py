"""
Roadmap Flow: Strategic consulting and roadmap building.

This flow acts as a strategic consultant, helping clients create
actionable business roadmaps through multi-turn conversations.
"""
import logging

from ..gemini_service import gemini_service
from .. import prompts
from ..models import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)


async def handle_roadmap_flow(request: ChatRequest) -> ChatResponse:
    """
    Handle ROADMAP flow - strategic roadmap builder.

    Args:
        request: ChatRequest with user message and session_id

    Returns:
        ChatResponse with strategic guidance
    """
    logger.info(f"Using ROADMAP flow for session {request.session_id}")

    # Get system instruction from prompts module
    system_instruction = prompts.ROADMAP_SYSTEM_INSTRUCTION

    # Send message in multi-turn conversation
    response_text = gemini_service.send_chat_message(
        session_id=request.session_id,
        message=request.message,
        system_instruction=system_instruction,
    )

    return ChatResponse(
        response=response_text,
        session_id=request.session_id,
        flow_id=request.flow_id
    )
