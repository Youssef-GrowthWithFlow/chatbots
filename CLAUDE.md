# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom AI chatbot project called "Chatbots Growth With Flow" that provides three specialized chatbot flows:

1. **General Information Flow (PRESENTATION)**: Acts as an expert assistant answering questions about the company's services, culture, and projects using RAG
2. **Strategic Roadmap Flow (ROADMAP)**: Acts as a strategic consultant, gathering client requirements and generating customized roadmaps and quotes
3. **Dynamic Resume Generator Flow (DYNAMIC_CV)**: Acts as a personal agent for recruiters, generating tailored resumes from a master database

## Architecture Overview

- **Frontend**: React (Vite.js) hosted on AWS Amplify, integrated into Framer via iframe
- **Backend**: FastAPI (Python) on AWS App Runner (provisioned container for instant response)
- **AI/LLM**: Google Gemini (currently using `gemini-2.5-flash-lite`)
- **Database**: AWS DynamoDB (On-Demand for chat history) - not yet implemented
- **RAG**: FAISS (in-memory index) loaded at startup
- **Security**: AWS Secrets Manager for API keys (production), `.env` for local development

### Key Architecture Decisions

1. **RAG Pipeline**: FAISS index is loaded into memory at application startup (`backend/app/main.py:startup_event`). If index files don't exist, they're generated from markdown files in `knowledge_base/` using `ingest.py`.

2. **Flow Routing**: The backend routes requests based on `flow_id` in `ChatRequest` (PRESENTATION, ROADMAP, DYNAMIC_CV). PRESENTATION flow uses RAG, others have placeholder responses.

3. **Embedding Strategy**: Uses Google Gemini's `text-embedding-004` model via API for both ingestion and search queries (no local embeddings).

4. **Cold Start Avoidance**: App Runner keeps container warm with FAISS index in memory, avoiding Lambda's 5-15 second cold start penalty.

## Development Commands

### Local Development (Docker Compose)

Start both frontend and backend:
```bash
docker-compose up
```

- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:8000`
- Backend API docs: `http://localhost:8000/docs`

### Backend (FastAPI/Python)

Run locally without Docker:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Rebuild RAG index from knowledge base:
```bash
cd backend
python ingest.py
```

Formatting (required):
```bash
black .
isort .
```

### Frontend (React/Vite)

Run locally without Docker:
```bash
cd frontend
npm run dev
```

Build for production:
```bash
npm run build
npm run preview  # Preview production build
```

Linting:
```bash
npm run lint
```

### Infrastructure (AWS CDK)

**Note**: AWS CDK infrastructure is not yet implemented. When implemented:
```bash
cdk diff    # ALWAYS run before deploy to check costs
cdk deploy  # Only from feature branches, never main
cdk destroy
```

## Key Files and Their Roles

### Backend (`backend/`)
- `app/main.py`: FastAPI application entry point, defines routes (`/health`, `/chat`), handles flow routing, loads RAG index at startup
- `app/gemini_service.py`: Centralized Gemini API service singleton with retry logic for all API calls (chat, streaming, embeddings)
- `app/rag_service.py`: RAG service singleton that loads FAISS index, performs vector search, formats context for LLM prompts
- `app/config.py`: Centralized configuration for all settings (model names, temperatures, batch sizes, etc.)
- `ingest.py`: Standalone script to build FAISS index from markdown files in `knowledge_base/`, generates `index.faiss` and `index_metadata.pkl`
- `Dockerfile`: Builds backend container image

### Frontend (`frontend/src/`)
- `App.jsx`: Root component, minimal wrapper for ChatbotUI
- `components/ChatbotUI.jsx`: Main chat component managing state, messages, and flow selection
- `components/WelcomeScreen.jsx`: Initial screen with flow selection buttons
- `components/ChatHeader.jsx`, `ChatInput.jsx`, `MessageList.jsx`: UI subcomponents
- `services/apiService.js`: Service for `/chat` API calls with automatic session management
- `utils/`: Helper functions and constants

### Knowledge Base (`knowledge_base/`)
Markdown files containing company information used by RAG:
- `company_info.md`: Company details, culture, values
- `services.md`: Service offerings
- `projects.md`: Past projects and case studies

### Configuration
- `.env`: Environment variables (GEMINI_API_KEY), **never commit this file**
- `docker-compose.yml`: Local development orchestration
- `frontend/vite.config.js`: Vite build configuration

## Code Conventions

### Backend (Python)
- Use `snake_case` for all .py files
- Type hints required for all functions and FastAPI models
- Use Google-style docstrings for non-obvious functions
- Format: `def get_rag_context(query: str) -> list[str]:`
- **Formatting**: Use `black` (required, no exceptions) and `isort`

### Frontend (React)
- Use `PascalCase` for component .jsx files (e.g., `ChatbotUI.jsx`)
- Use `camelCase` or `kebab-case` for services/utils (e.g., `apiService.js`)
- Functional components with Hooks only (no class components)
- Destructure props: `function MyComponent({ title, onSend })`
- Keep components under 150 lines
- **Formatting**: Use `prettier` (required, no exceptions)

### Directory Structure
- Use `kebab-case` for all directories

## Git Conventions

Format: `<type>: <description>`
- `feat:` New feature or flow
- `fix:` Bug fix
- `refactor:` Code structure changes
- `style:` Formatting changes
- `docs:` Documentation updates
- `chore:` Dependencies or tooling

## Testing Strategy

**IMPORTANT: Always use Docker Compose for testing. DO NOT run Python commands directly.**

### Local Testing
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

**Why Docker Compose?**
- Python dependencies are only installed in Docker containers, not locally
- Ensures consistent environment between development and production
- Tests the actual containerized application that will be deployed

### Unit/Integration Testing
Focus on testing logic, not boilerplate:
- **Backend**: Test service functions (e.g., `rag_service.search()`) and API contracts using FastAPI TestClient
- **Frontend**: Test user interactions with React Testing Library, not component appearance
- Example: "When user types 'hello' and clicks 'Send', is apiService.postMessage called correctly?"

## Important Constraints

### Cost Management (Critical)
This project MUST stay within AWS Free Tier limits:
- Only accepted fixed cost: AWS App Runner instance (~5-10 €/month)
- DynamoDB: Use PAY_PER_REQUEST mode
- S3: Store only RAG index files
- Secrets Manager: Minimize number of secrets
- ALWAYS check `cdk diff` before deploying to avoid unexpected costs

### Region Requirements
All AWS resources must be deployed in European regions:
- Primary: `eu-west-3` (Paris)
- Alternative: `eu-central-1` (Frankfurt)

### Environment Variables
Required in `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

## Common Workflows

### Adding New Knowledge to RAG
1. Add or edit markdown files in `knowledge_base/`
2. Run `python backend/ingest.py` to rebuild the index
3. Restart backend to load new index (or use Docker restart)

### Adding a New Flow
1. Add flow constant (e.g., `"NEW_FLOW"`) to frontend flow selection
2. Update `backend/app/main.py` `/chat` endpoint to handle new `flow_id`
3. Implement flow-specific logic (RAG, prompts, state management)

### Modifying RAG Behavior
- **Search parameters**: Adjust `top_k` and `similarity_threshold` in `main.py:chat_with_gemini()`
- **Chunk size**: Modify `CHUNK_SIZE` and `CHUNK_OVERLAP` in `ingest.py`
- **Prompt engineering**: Edit `rag_service.get_rag_prompt()` or `get_system_prompt()` in `main.py`

## Gemini API Integration

### SDK Version
This project uses the **new `google-genai` SDK** (v1.0.0+), which reached General Availability in May 2025. The legacy `google-generativeai` library is deprecated and will stop receiving updates on November 30, 2025.

### Model Selection
- **Current model**: `gemini-2.0-flash-exp` (configurable in `config.py`)
- **Embedding model**: `gemini-embedding-001` (configurable in `config.py`)
- Models can be changed by updating values in `app/config.py`

### Architecture: Centralized GeminiService

All Gemini API interactions go through `app/gemini_service.py`, a singleton service that provides:

- `send_chat_message()`: Send message in multi-turn conversation (with retry logic)
- `get_or_create_chat_session()`: Manage chat sessions by session_id
- `get_chat_history()`: Retrieve conversation history for a session
- `clear_chat_session()`: Clear a session from memory
- `fetch_url_content()`: Fetch content from URLs using url_context tool
- `create_embedding()`: Single embedding with retry logic
- `create_embeddings_batch()`: Batch embeddings with retry logic

**Key Benefits:**
- Single point of configuration
- Consistent retry logic across all API calls
- Automatic conversation history management
- No duplicate client initialization
- Easy to mock for testing

**Multi-Turn Conversations:**
- Uses Gemini's built-in chat session API (`client.chats.create()`)
- Conversation history is automatically maintained by the SDK
- Sessions are stored in memory (keyed by `session_id`)
- Frontend generates unique `session_id` per browser tab using sessionStorage

### Best Practices Implemented

1. **Centralized Configuration** (`app/config.py`)
   - All model names, temperatures, batch sizes in one place
   - Environment variables loaded once at startup
   - Single source of truth for all settings

2. **Error Handling with Retry Logic**
   - All Gemini API calls use exponential backoff retry (3 attempts)
   - Implemented in `gemini_service._retry_with_backoff()`
   - Prevents transient failures from breaking the user experience

3. **Batch Embedding Processing**
   - `ingest.py` processes embeddings in batches (configurable via `config.EMBEDDING_BATCH_SIZE`)
   - Significantly faster than one-by-one processing
   - Reduces API calls and improves efficiency

4. **Multi-Turn Conversations (No Streaming)**
   - Chat endpoint uses Gemini's built-in multi-turn conversation API
   - Conversation history is automatically maintained across messages
   - Simple JSON request/response (no Server-Sent Events)
   - Each session maintains full context for coherent conversations
   - Reduces complexity compared to manual streaming implementation

5. **Proper Task Types for Embeddings**
   - `RETRIEVAL_DOCUMENT`: Used when indexing documents in `ingest.py`
   - `RETRIEVAL_QUERY`: Used when searching with user queries in `rag_service.py`
   - This optimization improves RAG search accuracy per official docs

6. **URL Context Tool**
   - Uses official `url_context` tool instead of grounding for URL fetching
   - Cleaner, more reliable than previous google_search approach
   - Follows official Gemini API documentation

### Using the GeminiService

```python
from app.gemini_service import gemini_service
from app.config import config

# Check availability
if gemini_service.is_available():
    # Multi-turn conversation
    session_id = "user_123"
    system_instruction = "You are a helpful assistant."

    response = gemini_service.send_chat_message(
        session_id=session_id,
        message="Hello!",
        system_instruction=system_instruction  # Only used for new sessions
    )
    print(response)

    # Get conversation history
    history = gemini_service.get_chat_history(session_id)
    for msg in history:
        print(f"{msg['role']}: {msg['content']}")

    # Clear session when done
    gemini_service.clear_chat_session(session_id)

    # Single embedding
    embedding = gemini_service.create_embedding(text, task_type="RETRIEVAL_QUERY")

    # Batch embeddings
    embeddings = gemini_service.create_embeddings_batch(texts, task_type="RETRIEVAL_DOCUMENT")
```

### Frontend Session Management

The frontend automatically manages session IDs using sessionStorage:

```javascript
import { sendMessage, clearSession } from './services/apiService';

// Send a message (session_id is automatically managed)
const response = await sendMessage("Hello!", "PRESENTATION");

// Start a new conversation (clear session)
clearSession();
```

Session IDs are unique per browser tab and persist across page refreshes within the same tab.