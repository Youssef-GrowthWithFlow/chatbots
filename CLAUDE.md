# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom AI chatbot project called "Chatbots Growth With Flow" that provides three specialized chatbot flows:

1. **General Information Flow**: Acts as an expert assistant answering questions about the company's services, culture, and projects using RAG
2. **Strategic Roadmap Flow**: Acts as a strategic consultant, gathering client requirements and generating customized roadmaps and quotes
3. **Dynamic Resume Generator Flow**: Acts as a personal agent for recruiters, generating tailored resumes from a master database

## Architecture

- **Frontend**: React (Vite.js) hosted on AWS Amplify, integrated into Framer via iframe
- **Backend**: FastAPI (Python) on AWS App Runner (provisioned container for instant response)
- **AI/LLM**: Google Gemini
- **Database**: AWS DynamoDB (On-Demand for chat history)
- **RAG**: FAISS (in-memory index) with documents stored in AWS S3
- **Security**: AWS Secrets Manager for API keys

## Development Commands

Note: This repository currently contains only documentation files. When the actual codebase is implemented:

### Backend (FastAPI/Python)
- Formatting: `black .` (required, no exceptions)
- Import sorting: `isort .`
- Testing: Use pytest for service logic and FastAPI TestClient for API endpoints

### Frontend (React)
- Formatting: `prettier .` (required, no exceptions)
- Development server: `npm run dev` or `yarn dev`
- Build: `npm run build` or `yarn build`
- Testing: Use React Testing Library for component interactions

### Infrastructure (AWS CDK)
- Check changes: `cdk diff` (ALWAYS run before deploy to check costs)
- Deploy: `cdk deploy` (only from feature branches, never main)
- Destroy: `cdk destroy`

## Code Conventions

### Backend (Python)
- Use `snake_case` for all .py files
- Type hints required for all functions and FastAPI models
- Use Google-style docstrings for non-obvious functions
- Format: `def get_rag_context(query: str) -> list[str]:`

### Frontend (React)
- Use `PascalCase` for component .jsx files
- Use `camelCase` or `kebab-case` for services/utils
- Functional components with Hooks only
- Destructure props: `function MyComponent({ title, onSend })`
- Keep components under 150 lines

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

## Cost Management (Critical)

This project MUST stay within AWS Free Tier limits:
- Only accepted fixed cost: AWS App Runner instance (~5-10 €/month)
- DynamoDB: Use PAY_PER_REQUEST mode
- S3: Store only RAG index files
- Secrets Manager: Minimize number of secrets
- ALWAYS check `cdk diff` before deploying to avoid unexpected costs

## Testing Strategy

Focus on testing logic, not boilerplate:
- **Backend**: Test service functions and API contracts using TestClient
- **Frontend**: Test user interactions, not component appearance
- Example test: "When user types 'hello' and clicks 'Send', is apiService.postMessage called correctly?"

## Region Requirements

All AWS resources must be deployed in European regions:
- Primary: `eu-west-3` (Paris)  
- Alternative: `eu-central-1` (Frankfurt)