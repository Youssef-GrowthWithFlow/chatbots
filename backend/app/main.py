import os
import logging
import subprocess
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

@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup."""
    logger.info("Initializing RAG service...")
    
    # Check if RAG index files exist, if not, create them
    if not os.path.exists("index.faiss") or not os.path.exists("index_metadata.pkl"):
        if os.path.exists("knowledge_base") and os.path.exists("ingest.py"):
            logger.info("RAG index files not found. Creating them...")
            try:
                import subprocess
                result = subprocess.run(["python", "ingest.py"], capture_output=True, text=True)
                if result.returncode == 0:
                    logger.info("✓ RAG index created successfully")
                else:
                    logger.error(f"RAG index creation failed: {result.stderr}")
            except Exception as e:
                logger.error(f"Error creating RAG index: {e}")
    
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
                logger.info("No relevant context found, using system prompt")
                system_prompt = get_system_prompt(request.message)
                response = model.generate_content(system_prompt)
        else:
            # Fallback to direct query without RAG
            logger.info("RAG not available, using system prompt")
            system_prompt = get_system_prompt(request.message)
            response = model.generate_content(system_prompt)
            
        return ChatResponse(response=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Gemini API: {str(e)}")