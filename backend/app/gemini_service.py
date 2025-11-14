"""
Centralized Gemini API service with retry logic and chat session management.
"""
import logging
import time
from typing import List, Optional, Dict
from google import genai
from google.genai import types
from .config import config

logger = logging.getLogger(__name__)


class GeminiService:
    """Singleton service for all Gemini API operations."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.client: Optional[genai.Client] = None
        self.chat_sessions: Dict[str, any] = {}  # session_id -> chat object
        self._initialized = True

        if config.GEMINI_API_KEY:
            self.client = genai.Client(api_key=config.GEMINI_API_KEY)
            logger.info("✓ Gemini client initialized successfully")
        else:
            logger.warning("⚠ GEMINI_API_KEY not found - API will not work")

    def is_available(self) -> bool:
        """Check if the Gemini client is available."""
        return self.client is not None

    def _retry_with_backoff(self, func, *args, **kwargs):
        """
        Execute a function with exponential backoff retry logic.

        Args:
            func: Function to execute
            *args, **kwargs: Arguments to pass to the function

        Returns:
            Result of the function call

        Raises:
            Exception: If all retries fail
        """
        last_exception = None

        for attempt in range(config.MAX_RETRIES):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                if attempt < config.MAX_RETRIES - 1:
                    wait_time = config.RETRY_BASE_DELAY**attempt
                    logger.warning(
                        f"Attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s..."
                    )
                    time.sleep(wait_time)
                else:
                    logger.error(
                        f"All {config.MAX_RETRIES} attempts failed: {last_exception}"
                    )

        raise last_exception

    def get_or_create_chat_session(
        self, session_id: str, system_instruction: Optional[str] = None
    ):
        """
        Get existing chat session or create a new one.

        Args:
            session_id: Unique identifier for the chat session
            system_instruction: Optional system instruction for new sessions

        Returns:
            Chat session object
        """
        if not self.is_available():
            raise ValueError("Gemini client not initialized")

        if session_id not in self.chat_sessions:
            logger.info(f"Creating new chat session: {session_id}")

            chat_config = {
                "model": config.CHAT_MODEL,
            }

            if system_instruction:
                chat_config["config"] = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=config.CHAT_TEMPERATURE,
                    top_p=config.CHAT_TOP_P,
                    top_k=config.CHAT_TOP_K,
                    max_output_tokens=config.CHAT_MAX_OUTPUT_TOKENS,
                )

            self.chat_sessions[session_id] = self.client.chats.create(**chat_config)
            logger.info(f"✓ Chat session created: {session_id}")

        return self.chat_sessions[session_id]

    def send_chat_message(
        self, session_id: str, message: str, system_instruction: Optional[str] = None
    ) -> str:
        """
        Send a message in a multi-turn conversation.

        Args:
            session_id: Unique identifier for the chat session
            message: User message to send
            system_instruction: Optional system instruction (only used for new sessions)

        Returns:
            Model's response text

        Raises:
            Exception: If message sending fails after retries
        """
        chat = self.get_or_create_chat_session(session_id, system_instruction)

        def _send():
            response = chat.send_message(message)
            return response.text if hasattr(response, "text") else ""

        return self._retry_with_backoff(_send)

    def get_chat_history(self, session_id: str) -> List[Dict]:
        """
        Get conversation history for a session.

        Args:
            session_id: Session identifier

        Returns:
            List of messages with role and content
        """
        if session_id not in self.chat_sessions:
            return []

        chat = self.chat_sessions[session_id]
        history = []

        for message in chat.get_history():
            history.append(
                {"role": message.role, "content": message.parts[0].text}
            )

        return history

    def clear_chat_session(self, session_id: str) -> bool:
        """
        Clear a chat session from memory.

        Args:
            session_id: Session identifier

        Returns:
            True if session was cleared, False if it didn't exist
        """
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]
            logger.info(f"✓ Cleared chat session: {session_id}")
            return True
        return False

    def generate_structured_output(
        self, prompt: str, response_schema: dict, temperature: float = 0.3
    ) -> Optional[dict]:
        """
        Generate structured output using Gemini's structured output feature.

        Args:
            prompt: The prompt to send to Gemini
            response_schema: JSON schema for the expected response structure
            temperature: Temperature for generation (lower = more deterministic)

        Returns:
            Structured response as a dictionary, or None if generation fails
        """
        if not self.is_available():
            logger.error("Gemini client not initialized")
            return None

        try:
            logger.info("Generating structured output...")

            def _generate():
                response = self.client.models.generate_content(
                    model=config.CHAT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=temperature,
                        response_mime_type="application/json",
                        response_schema=response_schema,
                    ),
                )
                return response.text if hasattr(response, "text") else None

            result = self._retry_with_backoff(_generate)
            if result:
                import json

                return json.loads(result)
            return None

        except Exception as e:
            logger.error(f"Error generating structured output: {e}")
            return None

    def generate_structured_output_with_url(
        self, prompt: str, response_schema: dict, temperature: float = 0.3
    ) -> Optional[dict]:
        """
        Generate structured output using Gemini's URL context feature.

        This method enables Gemini to directly fetch and analyze content from URLs
        mentioned in the prompt. Since tools cannot be used with structured output,
        this method makes two API calls:
        1. First call with URL context to fetch content
        2. Second call with structured output to format the response

        Args:
            prompt: The prompt to send to Gemini (should include URLs)
            response_schema: JSON schema for the expected response structure
            temperature: Temperature for generation (lower = more deterministic)

        Returns:
            Structured response as a dictionary, or None if generation fails

        Note:
            - Supports up to 20 URLs per request
            - Maximum 34MB per URL
            - Does not work with: paywalled content, YouTube videos, Google Workspace files
            - Retrieved content counts toward input token usage
        """
        if not self.is_available():
            logger.error("Gemini client not initialized")
            return None

        try:
            logger.info("Fetching content using URL context...")

            # Step 1: Fetch content using URL context tool
            def _fetch_url_content():
                url_context_tool = types.Tool(
                    url_context=types.UrlContext()
                )

                response = self.client.models.generate_content(
                    model=config.CHAT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        tools=[url_context_tool],
                        temperature=temperature,
                    ),
                )
                return response.text if hasattr(response, "text") else None

            raw_content = self._retry_with_backoff(_fetch_url_content)
            if not raw_content:
                logger.warning("Failed to fetch URL content")
                return None

            logger.info(f"✓ Fetched {len(raw_content)} characters from URL")

            # Step 2: Convert raw content to structured format
            logger.info("Converting to structured format...")
            structured_prompt = f"""Based on the following information, extract and format it according to the schema.

{raw_content}

Please extract and structure this information."""

            return self.generate_structured_output(
                prompt=structured_prompt,
                response_schema=response_schema,
                temperature=temperature
            )

        except Exception as e:
            logger.error(f"Error generating structured output with URL context: {e}")
            return None

    def create_embedding(
        self, content: str, task_type: str = "RETRIEVAL_QUERY"
    ) -> Optional[List[float]]:
        """
        Create a single embedding for the given content.

        Args:
            content: Text to embed
            task_type: One of RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, SEMANTIC_SIMILARITY,
                      CLASSIFICATION, CLUSTERING

        Returns:
            Embedding vector, or None if creation fails

        Raises:
            Exception: If embedding fails after retries
        """
        if not self.is_available():
            raise ValueError("Gemini client not initialized")

        def _embed():
            result = self.client.models.embed_content(
                model=config.EMBEDDING_MODEL,
                contents=content,
                config=types.EmbedContentConfig(task_type=task_type),
            )
            if hasattr(result, "embeddings") and len(result.embeddings) > 0:
                return result.embeddings[0].values
            return None

        return self._retry_with_backoff(_embed)

    def create_embeddings_batch(
        self, contents: List[str], task_type: str = "RETRIEVAL_DOCUMENT"
    ) -> List[List[float]]:
        """
        Create embeddings for multiple contents in batch.

        Args:
            contents: List of texts to embed
            task_type: Embedding task type

        Returns:
            List of embedding vectors

        Raises:
            Exception: If batch embedding fails after retries
        """
        if not self.is_available():
            raise ValueError("Gemini client not initialized")

        if not contents:
            return []

        def _embed_batch():
            result = self.client.models.embed_content(
                model=config.EMBEDDING_MODEL,
                contents=contents,
                config=types.EmbedContentConfig(task_type=task_type),
            )
            if hasattr(result, "embeddings") and len(result.embeddings) > 0:
                return [emb.values for emb in result.embeddings]
            return []

        return self._retry_with_backoff(_embed_batch)


# Singleton instance
gemini_service = GeminiService()
