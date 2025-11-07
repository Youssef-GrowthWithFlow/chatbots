Why: As a user, I want a clear welcome message and starting options, so I can immediately choose the chatbot "personality" I need or just start typing.

Description:

Frontend (ChatbotUI.jsx): When the message list is empty, conditionally render a "Welcome" message (e.g., "Hi! I'm GrowthBot. How can I help you?") and three clickable buttons: "General Info", "Build a Roadmap", "Dynamic CV".

Frontend: The main text input must remain visible, allowing the user to ignore the buttons and type a general question.

Frontend (State): Add a flow_id to the React state.

If the user just types, the flow_id sent to the backend is "PRESENTATION".

If the user clicks "Build a Roadmap", set the flow_id to "ROADMAP" (and hide the buttons).

Backend (API): Update the POST /chat endpoint to require the flow_id (this was part of the plan for US 6/7). The backend must now route its logic:

If flow_id == "PRESENTATION", use RAG.

If flow_id == "ROADMAP", use the (temporary) hardcoded "Roadmap flow" response.

Validation:

GIVEN I open the chat for the first time... THEN I see the welcome message and the three flow-selection buttons.

WHEN I type "What are your services?" and press send... THEN the backend receives flow_id: "PRESENTATION" and gives a RAG answer.

WHEN I click the "Build a Roadmap" button... THEN the buttons disappear.

AND WHEN I then type "Let's start"... THEN the backend receives flow_id: "ROADMAP" and gives the hardcoded "You are in the Roadmap flow" response.