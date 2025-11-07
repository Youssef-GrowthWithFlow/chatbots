# Pragmatic Developer Guide
# Project: Chatbots Growth With Flow

## 1. Philosophy: "Simple, Consistent, Pragmatic"

This project is managed by one person. The goal is not to follow dogmatic rules, but to maintain a codebase that is clean, consistent, and easy to return to after a break.

1.  **Clarity > Cleverness:** Write code that is easy to read.
2.  **Consistency > Perfection:** A consistent-but-imperfect style is better than a mix of styles.
3.  **Automate > Argue:** Use auto-formatters (`black`, `prettier`) to end all debates.

---

## 2. File & Directory Naming

* **Backend (Python):** Use `snake_case` for all `.py` files (e.g., `rag_service.py`, `api_models.py`).
* **Frontend (React):** Use `PascalCase` for component `.jsx` files (e.g., `ChatbotUI.jsx`, `WidgetForm.jsx`). Use `camelCase` or `kebab-case` for services or utils (e.g., `apiService.js`).
* **Directories:** Use `kebab-case` for all new directories (e.g., `src/components`, `backend/app`).

---

## 3. Coding Conventions

### Backend (Python / FastAPI)

* **Formatting:** **Use `black`**. No exceptions. This is the only formatting rule.
* **Imports:** **Use `isort`** (or let `black` handle it).
* **Type Hints:** **USE type hints** for all function definitions and FastAPI models. This is critical for FastAPI's validation and your own sanity. For example, a function signature should look like `def get_rag_context(query: str) -> list[str]:`.
* **Docstrings:** Use simple Google-style docstrings for any non-obvious function, explaining the args and what it returns.

### Frontend (React)

* **Formatting:** **Use `prettier`**. No exceptions.
* **Style:** **Functional components with Hooks only.** No class components.
* **State:** Use `const` by default. Use `let` only if a variable *must* be reassigned.
* **Components:** Keep components small and focused. If a component gets too big (e.g., > 150 lines), it's time to split it.
* **Props:** Destructure props for clarity. Instead of `function MyComponent(props)`, use `function MyComponent({ title, onSend })`.

---

## 4. Git Commit Conventions

Use a simple prefix to make the `git log` readable.

**Format:** `<type>: <description>`

* `feat:` A new feature or flow (e.g., `feat: Add roadmap generation flow`).
* `fix:` A bug fix (e.g., `fix: Correctly handle empty chat history`).
* `refactor:` Changing code structure, not behavior (e.g., `refactor: Move RAG logic into its own service`).
* `style:` Formatting changes from `black` or `prettier` (e.g., `style: Run black on backend`).
* `docs:` Changes to READMEs or this guide (e.g., `docs: Update use cases`).
* `chore:` Dependencies, build scripts, or other tooling (e.g., `chore: Add faiss-cpu to requirements.txt`).

---

## 5. Testing Philosophy: "Test Logic, Not Boilerplate"

As a solo dev, we can't test everything. Focus on what breaks.

* **Backend (FastAPI):**
    * **Test the "service" logic:** Test the functions *inside* your services. Does `rag_service.py` find the right documents?
    * **Test the "contract":** Use FastAPI's `TestClient` to test the API endpoints. Send a mock request and assert that you get the *exact* response shape and status code you expect.

* **Frontend (React):**
    * **Test the "interactions":** Use React Testing Library. Don't test *how* the component looks. Test *what it does*. A good test asks: "When a user types 'hello' and clicks 'Send', is `apiService.postMessage` called with `{ message: 'hello' }`?"