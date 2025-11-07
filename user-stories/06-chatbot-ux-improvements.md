You are absolutely right. My mistake. User Stories should always be in English for clarity and consistency.

Here is the corrected version.

File: 06-ux-improvements.md

User Story 6: UX Improvements (Tone, Formatting, & Responsive)

Why: As a user, I want the chatbot to be pleasant to read and easy to use on any device, so I have a clear and professional experience.

Description: This story has three tasks:

Tone (Backend): Update the system_prompt sent to Gemini. It must be instructed to adopt a tone that is "clear, reassuring, simple, educational, and empathetic, similar to Alan.com, but without jargon."

Formatting (Frontend): The backend sends Markdown (e.g., **Title**), but the frontend shows it as plain text. Install a lightweight library (like react-markdown) and use it in ChatbotUI.jsx to render the bot's messages.

Responsive (Frontend): Update the CSS for ChatbotUI.jsx to use flexible sizes (e.g., width: 100%, max-width: 100%) so it adapts perfectly to the size of the <iframe> it will live in.

Validation:

(Tone): WHEN I ask a question, THEN the bot's response is clear, reassuring, and avoids complex jargon.

(Formatting): GIVEN the bot responds with **Strategic Consulting:**. THEN the text "Strategic Consulting:" appears as bold in the chat.

(Formatting): GIVEN the bot responds with a bulleted list. THEN it renders as a proper <ul> list, not plain text.

(Responsive): WHEN I resize the window (simulating the screen changing size), THEN the chat UI adapts cleanly without overflowing or breaking.