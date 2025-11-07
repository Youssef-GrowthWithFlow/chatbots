User Story 1: Frontend Project Setup & Static UI

Why: As a developer, I need to set up the React project and create a static chatbot UI so I have the visual foundation to build on.

Description: Initialize a new React (Vite.js) app in the /frontend directory. Create a ChatbotUI.jsx component that renders a "dumb" visual-only chat window. This includes a message list area, a text input, and a "Send" button. No state or logic is needed.

Validation:

GIVEN I run npm install and npm run dev in the /frontend folder.

THEN the React app launches in the browser without errors.

GIVEN I look at the app.

THEN I can see a chat input box, a send button, and an area for messages.

THEN I can type in the box, but nothing happens when I click "Send".