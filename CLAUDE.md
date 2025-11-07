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
- `app/rag_service.py`: RAG service singleton that loads FAISS index, performs vector search, formats context for LLM prompts
- `ingest.py`: Standalone script to build FAISS index from markdown files in `knowledge_base/`, generates `index.faiss` and `index_metadata.pkl`
- `Dockerfile`: Builds backend container image

### Frontend (`frontend/src/`)
- `App.jsx`: Root component, minimal wrapper for ChatbotUI
- `components/ChatbotUI.jsx`: Main chat component managing state, messages, and flow selection
- `components/WelcomeScreen.jsx`: Initial screen with flow selection buttons
- `components/ChatHeader.jsx`, `ChatInput.jsx`, `MessageList.jsx`: UI subcomponents
- `services/apiService.js`: Axios-based service for `/chat` API calls
- `utils/`: Helper functions (if any)

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
- **Current model**: `gemini-2.0-flash-exp` (configurable in `main.py`)
- **Embedding model**: `gemini-embedding-001` (for RAG)
- Models can be changed by updating the model name in API calls

### Best Practices Implemented

1. **Error Handling with Retry Logic**
   - All Gemini API calls use exponential backoff retry (3 attempts)
   - Implemented in `rag_service._create_embedding_with_retry()` and `main.generate_content_with_retry()`
   - Prevents transient failures from breaking the user experience

2. **Batch Embedding Processing**
   - `ingest.py` processes embeddings in batches of 100 chunks
   - Significantly faster than one-by-one processing
   - Reduces API calls and improves efficiency

3. **Streaming Responses**
   - Chat endpoint supports streaming via `stream: true` parameter
   - Frontend uses Server-Sent Events (SSE) to display responses in real-time
   - Improves perceived performance and UX
   - Toggle streaming in `apiService.js` (currently enabled by default)

4. **Proper Task Types for Embeddings**
   - `RETRIEVAL_DOCUMENT`: Used when indexing documents in `ingest.py`
   - `RETRIEVAL_QUERY`: Used when searching with user queries in `rag_service.py`
   - This optimization improves RAG search accuracy

5. **Environment-Based API Key Management**
   - Client automatically reads `GEMINI_API_KEY` from environment
   - Never hardcode API keys in source code

### Streaming vs Non-Streaming

**Backend** (`main.py`):
- Non-streaming: `generate_content_with_retry()` - returns full text
- Streaming: `generate_content_stream()` - yields chunks via SSE

**Frontend** (`apiService.js`):
- Non-streaming: `sendMessage()` - waits for full response
- Streaming: `sendMessageStream()` - calls `onChunk` callback for each chunk

To disable streaming, set `stream: false` in the ChatRequest model.