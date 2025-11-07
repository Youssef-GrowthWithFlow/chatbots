import os
import logging
import subprocess
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
from .rag_service import rag_service

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

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    flow_id: str = "PRESENTATION"


# Configure Gemini client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
    logger.info("Gemini client initialized successfully")
else:
    logger.warning("GEMINI_API_KEY not found - API will not work")


def get_system_prompt(user_query: str) -> str:
    """Create a system prompt for direct queries without RAG context."""
    return f"""You are a helpful AI assistant for Growth With Flow, a strategic consulting company. Be concise but informative.

LANGUAGE RULE: Always respond in the same language as the user's question (French if French, English if English).

TONE GUIDELINES:
- Be concise but complete - answer fully in 2-4 sentences
- Use simple, clear language
- When asked for lists, provide them with bullet points
- Use markdown formatting for structure
- Be warm and professional

User Question: {user_query}

Provide a helpful, concise response in the same language as the question."""


async def generate_content_stream(prompt: str, model: str = "gemini-2.0-flash-exp"):
    """
    Generate content with streaming for real-time response.

    Args:
        prompt: The prompt to send to the model
        model: Model name to use

    Yields:
        Chunks of generated text
    """
    try:
        response_stream = client.models.generate_content_stream(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=1024,
            ),
        )

        for chunk in response_stream:
            if hasattr(chunk, "text") and chunk.text:
                # Send as Server-Sent Events format
                yield f"data: {chunk.text}\n\n"

        # Send end marker
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Error in streaming generation: {e}")
        yield f"data: Error: {str(e)}\n\n"
        yield "data: [DONE]\n\n"


@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup."""
    logger.info("Initializing RAG service...")

    # Check if RAG index files exist, if not, create them
    if not os.path.exists("index.faiss") or not os.path.exists("index_metadata.pkl"):
        if os.path.exists("knowledge_base") and os.path.exists("ingest.py"):
            logger.info("RAG index files not found. Creating them...")
            try:
                result = subprocess.run(
                    ["python", "ingest.py"], capture_output=True, text=True
                )
                if result.returncode == 0:
                    logger.info("✓ RAG index created successfully")
                else:
                    logger.error(f"RAG index creation failed: {result.stderr}")
            except Exception as e:
                logger.error(f"Error creating RAG index: {e}")

    if rag_service.initialize():
        logger.info("✓ RAG service initialized successfully")
    else:
        logger.warning(
            "⚠ RAG service initialization failed - operating without knowledge base"
        )


@app.get("/health")
def health_check():
    return {"status": "ok", "rag_available": rag_service.is_available()}


@app.post("/chat")
async def chat_with_gemini(request: ChatRequest):
    """Main chat endpoint - always streams responses."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized")

    try:
        # Route based on flow_id
        if request.flow_id == "ROADMAP":
            logger.info("Using ROADMAP flow")
            response_text = """**Welcome to the Roadmap Builder!** 📋

I'll help you create a strategic roadmap for your business. To get started, please tell me:

• What industry is your business in?
• What are your main business goals?
• What's your current stage (startup, growth, expansion)?

Let's build something great together!"""

            async def roadmap_stream():
                yield f"data: {response_text}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(roadmap_stream(), media_type="text/event-stream")

        elif request.flow_id == "DYNAMIC_CV":
            logger.info("Using DYNAMIC_CV flow")
            response_text = """**Dynamic CV Generator** 📄

I can help create tailored resumes based on specific job requirements. This feature will be coming soon!

For now, you can ask me about our services or get general information."""

            async def cv_stream():
                yield f"data: {response_text}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(cv_stream(), media_type="text/event-stream")

        else:  # PRESENTATION flow
            logger.info("Using PRESENTATION flow with RAG")

            # Build prompt with RAG if available
            if rag_service.is_available():
                search_results = rag_service.search(
                    request.message, top_k=3, similarity_threshold=0.3
                )
                if search_results:
                    context = rag_service.format_context(search_results)
                    prompt = rag_service.get_rag_prompt(request.message, context)
                    logger.info(f"Using RAG with {len(search_results)} chunks")
                else:
                    logger.info("No relevant context found")
                    prompt = get_system_prompt(request.message)
            else:
                logger.info("RAG not available")
                prompt = get_system_prompt(request.message)

            return StreamingResponse(
                generate_content_stream(prompt), media_type="text/event-stream"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
