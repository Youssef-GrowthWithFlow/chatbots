User Story 3: Backend "Hello Gemini" Connection

Why: As a developer, I need the backend to connect to the Gemini API and return a simple response, so I can verify the API key and core AI logic are working.

Description: Create a new POST /chat endpoint in backend/app/main.py. This endpoint will:

Take a simple JSON request (e.g., {"message": "hello"}).

Read the GEMINI_API_KEY from an environment variable (which will be passed in via docker-compose.yml).

Call the Gemini API with the user's message.

Return the AI's text response in a JSON object (e.g., {"response": "Hi there!"}).

Validation:

GIVEN I have my GEMINI_API_KEY in the .env file used by docker-compose.

AND docker-compose up is running.

WHEN I send a POST request to http://localhost:8000/chat with the body {"message": "hello"} using a tool like Postman.

THEN I receive a 200 OK response.

AND the response body contains a JSON object with a real response from Gemini (e.g., {"response": "Hello! How can I help you today?"}).