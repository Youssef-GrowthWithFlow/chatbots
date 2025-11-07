User Story 5: Implement Local RAG Pipeline

Why: As a developer, I need the backend to answer questions using a local knowledge base, so I can prove the RAG logic works end-to-end before adding cloud complexity (like S3).

Description:

Create a /knowledge_base directory and add at least one Markdown file with sample knowledge (e.g., services.md).

Create an ingest.py script that reads all .md files, chunks them, generates embeddings (using Gemini), and saves a index.faiss file locally.

Modify the backend (main.py or a new rag_service.py) to load this index.faiss file into memory on startup.

Update the POST /chat endpoint: when a message is received, it must first search the FAISS index for relevant context, then inject that context into the prompt sent to Gemini.

Validation:

GIVEN I have a file knowledge_base/services.md containing the text: "We offer advanced strategic consulting."

AND I have run python ingest.py to create the local index.faiss file.

AND docker-compose up is running.

WHEN I send a POST request to /chat with {"message": "what services do you offer?"}.

THEN the bot's response must include the specific phrase "advanced strategic consulting."

WHEN I ask an unrelated question (e.g., "Who is the president?").

THEN the bot gives a generic answer, as it finds no relevant RAG context.