import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
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

class ChatResponse(BaseModel):
    response: str

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash-lite')

@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup."""
    logger.info("Initializing RAG service...")
    if rag_service.initialize():
        logger.info("✓ RAG service initialized successfully")
    else:
        logger.warning("⚠ RAG service initialization failed - operating without knowledge base")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "rag_available": rag_service.is_available()
    }


@app.post("/chat", response_model=ChatResponse)
def chat_with_gemini(request: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    
    try:
        # Use RAG if available
        if rag_service.is_available():
            # Search knowledge base for relevant context
            search_results = rag_service.search(request.message, top_k=3, similarity_threshold=0.3)
            
            if search_results:
                # Format context and create RAG-enhanced prompt
                context = rag_service.format_context(search_results)
                enhanced_prompt = rag_service.get_rag_prompt(request.message, context)
                
                logger.info(f"Using RAG with {len(search_results)} relevant chunks")
                response = model.generate_content(enhanced_prompt)
            else:
                logger.info("No relevant context found, using original query")
                response = model.generate_content(request.message)
        else:
            # Fallback to direct query without RAG
            logger.info("RAG not available, using direct query")
            response = model.generate_content(request.message)
            
        return ChatResponse(response=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Gemini API: {str(e)}")