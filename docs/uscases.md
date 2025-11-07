# Project: Chatbots Growth With Flow
# Use Cases

This document outlines the primary functions (use cases) for the "Growth With Flow" chatbot. Each use case provides a specific, valuable interaction.

---

## 1. General Information (Presentation Flow) ℹ️

This is the main "public-facing" chatbot.

* **Purpose:** To act as an intelligent assistant for the "Growth With Flow" website.
* **Function:** Answers common questions from visitors about the company, its services, and its culture.
* **Technology:** Uses RAG (Retrieval-Augmented Generation) to pull answers from a private knowledge base, ensuring all responses are accurate and on-brand.

---

## 2. Strategic Roadmap (Roadmap Flow) 🗺️

This flow acts as an interactive strategic consultant to convert potential clients.

* **Purpose:** To understand a client's needs, map them to specific services, and generate a concrete action plan and quote.
* **Function:**
    1.  The bot first gathers generic info from the user (name, project).
    2.  It asks targeted questions to deeply understand the user's **"Current Situation"** (the problem).
    3.  It asks goal-oriented questions to define their **"Desired Situation"** (e.g., "#1 goal in 6 months").
    4.  It generates a simple `Current / Desired` table for the user to review and customize.
    5.  The bot then accesses an **Offers Catalog** (RAG) and proposes relevant services that bridge the gap. The user can ask questions or select offers.
    6.  Based on the selected offers, the bot checks its knowledge base for those offers and asks any final, necessary follow-up questions.
    7.  Once all information is collected, it generates a **step-by-step roadmap**.
    8.  If the user agrees with the roadmap, the bot generates an **informative quote** and provides clear next steps (e.g., receive by email, schedule a call, ask more questions).
* **Goal:** To automate lead qualification and create a high-value, customized proposal.

---

## 3. Dynamic Resume Generator (Rec