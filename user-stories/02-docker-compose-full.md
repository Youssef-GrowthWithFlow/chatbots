User Story 2: Full Local Dev Environment with Docker Compose

Why: As a developer, I need a single docker-compose command to run both the frontend and backend, so I can have a complete, easy-to-use local development environment.

Description: Create a docker-compose.yml file at the project root. This file will define two services:

backend: Builds from a new backend/Dockerfile and runs the FastAPI app.

frontend: Builds from a new frontend/Dockerfile and runs the React (Vite) dev server.

Also, create the initial backend/app/main.py with a GET /health endpoint ({"status": "ok"}) and the required Dockerfiles for both services.

Validation:

GIVEN I run docker-compose up --build from the project root.

THEN both the frontend and backend containers build and start without errors.

GIVEN I open http://localhost:8000/health (or the backend port).

THEN I see the JSON response {"status": "ok"}.

GIVEN I open http://localhost:5173 (or the Vite port).

THEN I see the static React chatbot UI from User Story 1.