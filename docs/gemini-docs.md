Here is the updated guide, now including a reference table with links to the official documentation for each feature.

-----

# The Complete Developer Guide to the Gemini API

This guide provides a comprehensive overview for developers looking to build applications with the Google Gemini API. It covers everything from initial setup and basic text generation to advanced features like function calling, structured output, and Retrieval-Augmented Generation (RAG) with external data sources.

-----

## 1\. Getting Started

Follow these steps to make your first API call in minutes.

### Step 1: Get an API Key

Before you can use the Gemini API, you need an API key. You can get one for free from **Google AI Studio**.

[Get an API key in Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 2: Install the Client SDK

We recommend using the official Google GenAI SDK for your language. These are production-ready, stable, and actively maintained.

  * **Python** (v3.9+):
    ```bash
    pip install -q -U google-genai
    ```
  * **JavaScript / TypeScript** (Node.js v18+):
    ```bash
    npm install @google/genai
    ```
  * **Go**:
    ```bash
    go get google.golang.org/genai
    ```
  * **Java** (Maven):
    ```xml
    <dependencies>
      <dependency>
        <groupId>com.google.genai</groupId>
        <artifactId>google-genai</artifactId>
        <version>1.0.0</version>
      </dependency>
    </dependencies>
    ```

**Note on Legacy Libraries:** If you are using older libraries (like `google-generativeai`), it is highly recommended to migrate to the new `google-genai` SDKs to access the latest features.

### Step 3: Set Your API Key

Your SDK needs the API key to authenticate. The simplest way is to set it as an environment variable named `GEMINI_API_KEY`. The client libraries will automatically detect and use it.

```bash
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### Step 4: Make Your First Request

With the SDK installed and your key set, you can now generate content. Here’s a "Hello World" example using the `gemini-2.5-flash` model.

**Python**

```python
from google import genai

# The client automatically finds the API key in the environment variable
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in a few words"
)

print(response.text)
```

**JavaScript**

```javascript
import { GoogleGenAI } from "@google/genai";

// The client automatically finds the API key in the environment variable
const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
```

-----

## 2\. Core Capabilities

Understand the fundamental features of the API.

### Available Models

The API provides access to several models optimized for different tasks:

  * **Gemini 2.5 Pro:** The most powerful and capable model for complex reasoning.
  * **Gemini 2.5 Flash:** A balanced model, optimized for speed and cost-efficiency.
  * **Gemini 2.5 Flash-Lite:** The fastest and most cost-efficient model for high-frequency tasks.
  * **Gemini Embeddings:** A model for generating text embeddings.

### Text & Chat Generation

You can generate text in two main ways: a simple prompt-response or a continuous multi-turn chat.

**Simple Text Generation (`generateContent`)**
This is for single-shot questions.

```python
from google import genai
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What are the top 5 most popular programming languages?"
)
print(response.text)
```

**Multi-Turn Chat (`start_chat`)**
For conversational applications, use a chat session, which maintains the history.

```python
from google import genai
client = genai.Client()

chat = client.models.start_chat(
    model="gemini-2.5-flash",
    history=[]
)

response = chat.send_message("What is the capital of France?")
print(response.text)
# Output: The capital of France is Paris.

response = chat.send_message("What about Germany?")
print(response.text)
# Output: The capital of Germany is Berlin.
```

### Streaming Responses

For a more responsive experience, you can stream the response as it's being generated, word by word. Use `generate_content_stream`.

```python
from google import genai
client = genai.Client()

response_stream = client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="Write a short story about a robot who discovers music."
)

for chunk in response_stream:
    print(chunk.text, end="", flush=True)
```

### System Instructions

You can guide the model's behavior, tone, and persona by providing a `system_instruction`. This sets the ground rules for all subsequent requests in a chat.

```python
from google import genai
from google.genai import types
client = genai.Client()

config = types.GenerateContentConfig(
    system_instruction="You are a helpful pirate. You answer all questions with a pirate accent."
)

chat = client.models.start_chat(
    model="gemini-2.5-flash",
    config=config,
    history=[]
)

response = chat.send_message("What's the weather like today?")
print(response.text)
# Output: Arrr, the skies be clear and the winds be calm! A fine day for sailin'!
```

### Text Embeddings

Embeddings are numerical representations of text, essential for tasks like semantic search, classification, and Retrieval-Augmented Generation (RAG).

Use the `gemini-embedding-001` model and the `embedContent` method.

**Key Parameters:**

  * **`task_type`**: Optimizes the embedding for a specific job.
      * `RETRIEVAL_QUERY`: For the user's search query.
      * `RETRIEVAL_DOCUMENT`: For the documents you are searching over.
      * `SEMANTIC_SIMILARITY`: For comparing the likeness of two texts.
  * **`output_dimensionality`**: Truncates the embedding size to save on storage and computation (e.g., `768`, `1536`, or `3072`).

**Python Example:**

```python
from google import genai
from google.genai import types
client = genai.Client()

# Embedding documents for a RAG system
documents = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question."
]

result = client.models.embed_content(
    model="gemini-embedding-001",
    contents=documents,
    config=types.EmbedContentConfig(
        task_type="RETRIEVAL_DOCUMENT",
        output_dimensionality=768
    )
)

# result.embeddings is a list of embeddings (lists of floats)
for embedding in result.embeddings:
    print(f"Embedding length: {len(embedding.values)}")
```

-----

## 3\. Advanced Reasoning & Output

Control how the model thinks and what format it responds in.

### Gemini "Thinking"

Gemini 2.5 models use an internal "thinking process" to improve reasoning for complex tasks. This is enabled by default on 2.5 Pro and 2.5 Flash.

  * **Thinking Budget (`thinkingBudget`)**: You can control the token budget for this process. Set to `0` to disable it on 2.5 Flash (for faster, less complex tasks) or `-1` for a dynamic budget.
  * **Thought Summaries (`includeThoughts`)**: You can ask the model to include its reasoning process in the response. This is great for debugging and transparency.

**Python Example (with Thought Summaries):**

```python
from google import genai
from google.genai import types
client = genai.Client()

prompt = "Alice, Bob, and Carol live in red, green, and blue houses. Bob does not live in the green house. Carol owns a dog. The green house is left of the red house. Who lives where?"

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=prompt,
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            include_thoughts=True
        )
    )
)

for part in response.candidates[0].content.parts:
    if part.thought:
        print("--- Thought Summary ---")
        print(part.text)
        print("-----------------------")
    else:
        print("--- Final Answer ---")
        print(part.text)
```

### Structured Output (JSON Mode)

You can force the model to respond with a valid JSON string that conforms to a specific JSON Schema. This is perfect for data extraction, classification, or populating UI components.

1.  Set `response_mime_type` to `"application/json"`.
2.  Provide a `response_json_schema`.

The Python and JavaScript SDKs have helpers to generate the schema from Pydantic models and Zod schemas, respectively.

**Python Example (using Pydantic):**

```python
from google import genai
from pydantic import BaseModel, Field
from typing import List

class Ingredient(BaseModel):
    name: str = Field(description="Name of the ingredient.")
    quantity: str = Field(description="Quantity and unit.")

class Recipe(BaseModel):
    recipe_name: str = Field(description="The name of the recipe.")
    ingredients: List[Ingredient]
    instructions: List[str]

client = genai.Client()

prompt = """
Extract the recipe from this text: 
To make guacamole, you need 3 ripe avocados, 1/2 cup diced onion, 
1/2 cup chopped cilantro, 2 tbsp lime juice, and 1 tsp salt. 
First, mash the avocados. Then, mix in the other ingredients.
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config={
        "response_mime_type": "application/json",
        "response_json_schema": Recipe.model_json_schema(),
    },
)

# response.text is a guaranteed valid JSON string
print(response.text)

# You can validate and parse it
recipe_data = Recipe.model_validate_json(response.text)
print(recipe_data.recipe_name)
```

### Function Calling

Function calling connects the Gemini model to your own external tools and APIs. The model doesn't run your code; instead, it tells you *which* function to run and *what arguments* to use.

**The flow is a 4-step process:**

1.  **Define Function & Ask:** Define your function's schema (its name, description, and parameters) and pass it to the model in the `tools` config.
2.  **Model Responds with a `FunctionCall`:** The model analyzes the prompt and, instead of answering, returns a `FunctionCall` object (e.g., `name='get_weather'`, `args={'location': 'Boston'}`).
3.  **Execute Your Code:** Your application receives this object, looks up the function `get_weather`, and executes it with the provided arguments.
4.  **Send Back the `FunctionResponse`:** You send the result of your function (e.g., `{"result": "It is 72°F and sunny in Boston"}`) back to the model.
5.  **Model Generates Final Answer:** The model uses the function's output to generate a final, natural language response for the user (e.t., "The weather in Boston is 72°F and sunny.").

**Python Example:**

```python
from google import genai
from google.genai import types
import json

# --- Your Application's Function ---
def get_current_weather(location: str):
    """Gets the current weather for a specified location."""
    # In a real app, this would call an weather API
    return {"location": location, "temperature": "72°F", "forecast": "sunny"}

# --- 1. Define Function Schema ---
get_weather_declaration = {
    "name": "get_current_weather",
    "description": "Gets the current weather for a specified location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city and state, e.g., 'San Francisco, CA'",
            },
        },
        "required": ["location"],
    },
}

client = genai.Client()
tools = types.Tool(function_declarations=[get_weather_declaration])
model = client.models.GenerativeModel(
    model_name="gemini-2.5-flash", 
    tools=[tools]
)
chat = model.start_chat()

# Ask the model a question that triggers the tool
prompt = "What's the weather like in Boston?"
response = chat.send_message(prompt)

# --- 2. Model Responds with a FunctionCall ---
part = response.candidates[0].content.parts[0]
print(f"Model wants to call: {part.function_call.name}")

# --- 3. Execute Your Code ---
function_call = part.function_call
if function_call.name == "get_current_weather":
    args = function_call.args
    function_result = get_current_weather(location=args["location"])

    # --- 4. Send Back the FunctionResponse ---
    function_response_part = types.Part.from_function_response(
        name="get_current_weather",
        response={"result": function_result},
    )
    
    # --- 5. Model Generates Final Answer ---
    final_response = chat.send_message(contents=[function_response_part])
    print(final_response.text)
```

-----

## 4\. Grounding with External Data (Tools)

Ground the model's responses in real-time or private data using built-in tools.

### Tool 1: Grounding with Google Search

This tool connects the model to Google Search, allowing it to access real-time information from the web. The model automatically decides when to search, what to query, and how to synthesize the results.

Simply enable the tool in the configuration.

**Python Example:**

```python
from google import genai
from google.genai import types
client = genai.Client()

grounding_tool = types.Tool(google_search=types.GoogleSearch())
config = types.GenerateContentConfig(tools=[grounding_tool])

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Who won the last F1 race and when was it?",
    config=config,
)

print(response.text)

# --- Accessing Citations ---
if response.candidates[0].grounding_metadata:
    print("\n--- Sources ---")
    metadata = response.candidates[0].grounding_metadata
    
    # webSearchQueries lists the queries the model used
    print(f"Search Queries: {metadata.web_search_queries}")
    
    # groundingChunks lists the source snippets
    for i, chunk in enumerate(metadata.grounding_chunks):
        print(f"[{i+1}] {chunk.web.title}: {chunk.web.uri}")
```

### Tool 2: Grounding with URL Context

This tool allows you to provide a list of specific URLs (up to 20) in your prompt. The model will fetch content from those pages to answer your question. This is ideal for summarizing articles, comparing documents, or answering questions about a specific webpage.

**Supported formats:** Text, HTML, PDF, and images.
**Unsupported:** YouTube videos, paywalled content.

**Python Example:**

```python
from google import genai
from google.genai import types
client = genai.Client()

tools = [types.Tool(url_context={})]
config = types.GenerateContentConfig(tools=tools)

url1 = "https://www.foodnetwork.com/recipes/ina-garten/perfect-roast-chicken-recipe-1940592"
url2 = "https://www.allrecipes.com/recipe/21151/simple-whole-roast-chicken/"

prompt = f"""
Compare the ingredients and cooking times 
from the recipes at {url1} and {url2}
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config=config,
)

print(response.text)

# You can verify which URLs were successfully retrieved
print(response.candidates[0].url_context_metadata)
```

### Tool 3: File Search (RAG)

File Search is a powerful tool for building RAG applications. It allows you to upload your own documents (PDF, TXT, etc.), and the model will perform a semantic search over your private data to answer questions.

The API handles the entire RAG pipeline for you: chunking, embedding, indexing, and retrieval.

**Workflow:**

1.  **Create a `FileSearchStore`:** This is a container for your files.
2.  **Upload Files:** Use `upload_to_file_search_store` to add your documents. This is an asynchronous operation.
3.  **Query with the Tool:** Enable the `file_search` tool in your request, pointing it to your store.

**Python Example:**

```python
from google import genai
from google.genai import types
import time

client = genai.Client()

# --- 1. Create a File Search Store ---
file_search_store = client.file_search_stores.create(
    config={'display_name': 'My Company Knowledge Base'}
)

# --- 2. Upload Files ---
# (Assuming you have a 'company-handbook.pdf' file)
print("Uploading file...")
operation = client.file_search_stores.upload_to_file_search_store(
    file='path/to/your/company-handbook.pdf',
    file_search_store_name=file_search_store.name,
    config={'display_name': 'Company Handbook 2024'}
)

# Wait for the file to be indexed
while not operation.done:
    print("Indexing file...")
    time.sleep(5)
    operation = client.operations.get(operation)

print("File indexed successfully.")

# --- 3. Query with the File Search Tool ---
tools = [types.Tool(
    file_search=types.FileSearch(
        file_search_store_names=[file_search_store.name]
    )
)]
config = types.GenerateContentConfig(tools=tools)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What is the company's policy on remote work?",
    config=config
)

print(response.text)

# The response will include citations from your document
if response.candidates[0].grounding_metadata:
    print("\n--- Citations from your document ---")
    print(response.candidates[0].grounding_metadata)
```

-----

## 5\. Official Documentation Links

This guide is a comprehensive snapshot. For the most up-to-date information, feature additions, and API references, always consult the official documentation.

| Feature / Topic | Official Documentation Link |
| :--- | :--- |
| **Main Overview** | [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs) |
| **Quickstart Guide** | [ai.google.dev/gemini-api/docs/quickstart](https://ai.google.dev/gemini-api/docs/quickstart) |
| **SDK Libraries** | [ai.google.dev/gemini-api/docs/libraries](https://ai.google.dev/gemini-api/docs/libraries) |
| **Text Embeddings** | [ai.google.dev/gemini-api/docs/embeddings](https://ai.google.dev/gemini-api/docs/embeddings) |
| **Text & Chat Generation**| [ai.google.dev/gemini-api/docs/text-generation](https://ai.google.dev/gemini-api/docs/text-generation) |
| **Gemini "Thinking"** | [ai.google.dev/gemini-api/docs/thinking](https://ai.google.dev/gemini-api/docs/thinking) |
| **Structured Output (JSON)**| [ai.google.dev/gemini-api/docs/structured-output](https://ai.google.dev/gemini-api/docs/structured-output?example=recipe) |
| **Function Calling** | [ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling?example=meeting) |
| **Google Search Tool** | [ai.google.dev/gemini-api/docs/google-search](https://ai.google.dev/gemini-api/docs/google-search) |
| **URL Context Tool** | [ai.google.dev/gemini-api/docs/url-context](https://ai.google.dev/gemini-api/docs/url-context) |
| **File Search Tool (RAG)**| [ai.google.dev/gemini-api/docs/file-search](https://ai.google.dev/gemini-api/docs/file-search) |