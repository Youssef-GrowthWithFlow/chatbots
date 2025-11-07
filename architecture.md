# Project: Chatbots Growth With Flow

This document outlines the pragmatic technical architecture chosen for the "Chatbots Growth With Flow" project, an AI chatbot integrated with Framer.

## 1. Technology Stack 🚀

* **Frontend:** React (Vite.js)
* **Frontend Hosting:** AWS Amplify (for CI/CD and CDN)
* **Integration:** Framer (via an Iframe "Code Component")
* **Backend:** FastAPI (Python)
* **Backend Hosting:** AWS App Runner (provisioned container)
* **AI (LLM):** Google Gemini
* **Database (History):** AWS DynamoDB (On-Demand)
* **RAG (Vectors):** FAISS (in-memory index)
* **File Storage (RAG):** AWS S3 (for `index.faiss` and source docs)
* **Security (API Keys):** AWS Secrets Manager

---

## 2. Architecture Diagram 🏗️

[An architecture diagram showing the flow from Framer to a React App (Amplify), which calls the FastAPI backend (App Runner). App Runner communicates with S3, DynamoDB, Secrets Manager, and the Gemini API.]

---

## 3. Key Design Choices 🎯

### 1. Backend: FastAPI on AWS App Runner

This is the most critical choice for performance.

* **Problem Avoided:** The "cold start" latency of AWS Lambda (5-15 seconds) is unacceptable for a chatbot, as it includes the time to download the RAG index (FAISS) from S3.
* **Solution:** App Runner uses a provisioned ("warm") container. The FAISS index is loaded into RAM **once** at startup.
* **Result:** RAG searches are instant (in-memory), providing near-zero latency.

### 2. Frontend: React on Amplify + Iframe

* **Decoupling:** The React application is completely independent of the Framer site.
* **Easy Deploys:** A `git push` to Amplify updates the chatbot without ever touching the Framer site.
* **Isolation:** The Iframe prevents any style (CSS) or script (JS) conflicts between the chatbot and the main site.

### 3. Database: DynamoDB (On-Demand)

* **Cost:** The `PAY_PER_REQUEST` mode stays within the AWS Free Tier (free) for low traffic.
* **Performance:** Perfect for reading/writing chat session history with very low latency.