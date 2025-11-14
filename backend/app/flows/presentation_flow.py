"""
Presentation Flow: RAG-powered Q&A about Growth With Flow.

This flow answers questions about the company using RAG
(Retrieval-Augmented Generation) with the knowledge base.
"""
import logging

from ..gemini_service import gemini_service
from ..rag_service import rag_service
from .. import prompts
from ..models import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)


async def handle_presentation_flow(request: ChatRequest) -> ChatResponse:
    """
    Handle PRESENTATION flow - RAG-powered Q&A.

    Args:
        request: ChatRequest with user question and session_id

    Returns:
        ChatResponse with answer based on knowledge base
    """
    logger.info(f"Using PRESENTATION flow with RAG for session {request.session_id}")

    # Get system instruction from prompts module
    system_instruction = prompts.PRESENTATION_SYSTEM_INSTRUCTION

    # Build message with RAG context if available
    message_to_send = request.message

    if rag_service.is_available():
        search_results = rag_service.search(request.message)
        if search_results:
            context = rag_service.format_context(search_results)
            logger.info(f"Using RAG with {len(search_results)} chunks")

            # Use prompt module to format message with context
            message_to_send = prompts.format_rag_message(context, request.message)
        else:
            logger.info("No relevant context found in RAG")
    else:
        logger.info("RAG not available")

    # Send message in multi-turn conversation
    response_text = gemini_service.send_chat_message(
        session_id=request.session_id,
        message=message_to_send,
        system_instruction=system_instruction,
    )

    return ChatResponse(
        response=response_text,
        session_id=request.session_id,
        flow_id=request.flow_id
    )
