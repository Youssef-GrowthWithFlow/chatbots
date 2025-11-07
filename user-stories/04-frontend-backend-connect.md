User Story 4: Connect Frontend UI to Backend API

Why: As a user, I want to type a message, press send, and see a real response from the AI in the chat window, so the chatbot is fully functional.

Description: Wire up the static ChatbotUI.jsx component.

Add state (using useState) to manage the message list, the current input, and a loading status.

Create an apiService.js file that uses fetch to call the POST /chat endpoint on the backend.

When the "Send" button is clicked:

Add the user's message to the message list.

Set isLoading to true.

Call the API service with the user's message.

When the response arrives, add the bot's message to the list and set isLoading to false.

Validation:

GIVEN docker-compose up is running.

WHEN I open the frontend app in my browser (http://localhost:5173).

AND I type "Hello" and press "Send".

THEN I immediately see my "Hello" message appear in the chat.

AND I see a loading indicator.

THEN, after a moment, the loading indicator disappears.

AND a new message from the bot (the Gemini response) appears in the chat list.