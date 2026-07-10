# 🧪 Agentic Lab: Multi-Agent Research Assistant

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Gemini](https://img.shields.io/badge/Gemini_API-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-00F0FF?style=for-the-badge&logo=framer&logoColor=black)](https://www.framer.com/motion/)

**Agentic Lab** is an enterprise-grade, state-of-the-art Multi-Agent Research System that automates the generation of highly detailed, academic-grade research papers. Utilizing an orchestration pipeline of four specialized AI agents (Planner, Researcher, Writer, and Editor) powered by **Google Gemini**, the system searches the web in real-time, compiles evidence-grounded reports, and persists user sessions.

---

## 🗺️ System Architecture & Workflow

The system uses a sequential multi-agent flow where each agent passes its output as context to the next, building up a detailed and cohesive final paper.

```mermaid
graph TD
    User([User Query]) -->|1. Submit Query| Controls[Simulation Controls]
    Controls -->|2. Start Pipeline| Backend{FastAPI Backend}
    
    subgraph Agentic Orchestration Pipeline
        Backend -->|Step 1: Plan| Planner[🧠 Planner Agent]
        Planner -->|Decomposed Research Plan| Researcher[🔍 Researcher Agent]
        Researcher -->|Web Search Grounding| Writer[✍️ Writer Agent]
        Writer -->|Draft Manuscript| Editor[📋 Editor Agent]
        Editor -->|Polish & Citations| Final[📄 Final Styled Paper]
    end
    
    Backend -->|Search Grounding| Google[🌐 Google Search API]
    Backend -->|Vector Embeddings RAG| Embeddings[⚡ Vector Store]
    Backend -->|Authentication| DB[(Database Engine)]
    Backend -->|Model Inference| LLM[🤖 Gemini API / SDK]
    
    Final -->|Save History| DB
    Final -->|Render Paper| UI[💻 Frontend Dashboard]
```

---

## ✨ Key Features & Upgrades

*   **🤖 Multi-Agent Orchestration Flow:** Watch the Planner, Researcher, Writer, and Editor work collaboratively in a visual SVG network graph that glows and pulses during execution.
*   **🌐 Real-Time Google Search Grounding:** The Researcher Agent uses live Google Search Grounding to extract up-to-date facts, statistics, and references.
*   **🎓 Multi-Style Academic Layout Compiler:** Exports papers formatted dynamically according to citation styles:
    *   **IEEE:** Double-column layout, Times New Roman, justified alignment, tight columns.
    *   **APA:** Single-column layout, double-spaced lines (`line-height: 2.0`), left text alignment, 1.0-inch margins.
    *   **MLA:** Single-column layout, double-spaced lines (`line-height: 2.0`), left text alignment, and top-left MLA metadata header block.
*   **⚡ Vector Database RAG Engine:** Built-in PDF/Text reference document parser. Performs semantic text chunking (600-character blocks with 150-character overlaps) and cosine similarity retrieval using Google's `text-embedding-004` API to ground prompts.
*   **🧠 Human-in-the-Loop (HITL) Checkpoint Mode:** Toggle checkpoint control that pauses the pipeline after the Planner compiles the initial roadmap, enabling users to submit revisions before subsequent agents execute.
*   **👥 Collaborative Peer Reviews & Sidebar:** Visitors can add peer review comments, annotate select lines, and view review feedback in a sliding sidebar panel.
*   **🔍 Live Citation Link Auditor:** Runs asynchronous HTTP validation checks on all URLs listed in the bibliography, appending green `[✓ Verified]` or red `[⚠ Broken]` status tags to the report view.
*   **🎨 Premium Cybernetic Theme System:** Toggle between **Light**, **Dark (Deep Space)**, and **System (Hacker Terminal)** modes with hardware-accelerated CSS color-fade transitions. Fully readable across all theme styles.
*   **⚙️ Dual-Engine Agnostic Database:** Seamlessly links to a cloud PostgreSQL database if `DATABASE_URL` is set, and automatically/silently falls back to local SQLite if running offline.
*   **🔐 Credentials-Only Authentication:** Restores secure localized user registration and session management via JWT tokens and bcrypt password hashing (eliminating unneeded Google SSO dependencies).
*   **🛡️ Enterprise Rate Limiter & Guards:** Protected by a `SlowAPI` decorator limiting requests to 15 per hour per client, plus input XSS sanitization and jailbreak prompt injection prevention.
*   **📱 Universal Device Responsiveness:** Fully optimized grid system that collapses columns on mobile and tablet screens, wraps headers gracefully, and expands max-width bounds on high-density 4K displays.
*   **📄 Onboarding Guide Modal:** Mounted onboarding welcome modal detailing custom configurations, API limits, preset fallbacks, and feedback redirection (`cjc200426@gmail.com`).

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, Zustand (State Management), Framer Motion (Animations), Lucide Icons, ReactMarkdown (Markdown + LaTeX rendering)
*   **Backend:** Python, FastAPI, SQLite / PostgreSQL (Database Engines), PyJWT (Authentication), Bcrypt (Password hashing), Requests (API streaming), SlowAPI (Rate limiting)
*   **AI Models:** Google Gemini 2.5 Flash / Gemini 3.5 Flash, `text-embedding-004` (Semantic Vector RAG)

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
*   Python 3.10+
*   Node.js 18+

### 1. Backend Setup
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # On Windows (PowerShell):
    .\venv\Scripts\Activate.ps1
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file inside the `backend/` directory:
    ```env
    PORT=5000
    SECRET_KEY=your_super_secret_jwt_key
    GEMINI_API_KEY=your_google_gemini_api_key
    # DATABASE_URL=postgresql://user:password@localhost:5432/dbname (Optional Cloud DB)
    ```
5.  Start the FastAPI server:
    ```bash
    python app.py
    ```
    *The server will run on `http://localhost:5000`.*

### 2. Frontend Setup
1.  Navigate to the `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file inside the `frontend/` directory (optional fallback):
    ```env
    VITE_GEMINI_API_KEY=your_optional_client_side_api_key
    ```
4.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *The site will run on `http://localhost:5173` (or `http://localhost:5174`).*

---

## ☁️ Deployment Guide (How to host it)

Because this application uses a stateful backend (FastAPI + SQLite/PostgreSQL), deploying it requires hosting the frontend and backend separately. 

### 🖥️ 1. Frontend Deployment (Vercel)
The React/Vite frontend is stateless and can be hosted for **free on Vercel**:
1.  Push your code to a GitHub repository.
2.  Import the repository into **Vercel**.
3.  Configure the root directory to `frontend`.
4.  Add any necessary Environment Variables.
5.  Click **Deploy**.

### ⚙️ 2. Backend Deployment (Render or Railway)
Vercel is serverless and **cannot** host long-running Python servers or write to local files persistently. Instead, use a container or service hosting provider like **Render** or **Railway**:

#### Option A: Render.com (Web Service)
1.  Create a new Web Service on Render and link your GitHub repository.
2.  Set the Root Directory to `backend`.
3.  Set the Runtime to `Python 3`.
4.  Configure the Start Command:
    ```bash
    uvicorn app:app --host 0.0.0.0 --port $PORT
    ```
5.  **Database Persistence (SQLite Fallback):**
    *   If using the SQLite fallback, add a **Persistent Disk (Volume Mount)** in the Render dashboard (e.g., mount a 1GB disk to `/data`).
    *   Set the environment database URL pointing to the volume mount directory to preserve users' history files.
6.  Add environment variables:
    *   `SECRET_KEY` (For JWT)
    *   `GEMINI_API_KEY` (Your Google Gemini key)
    *   `DATABASE_URL` (Your PostgreSQL database connection string if using Postgres)

#### Option B: Docker Deployment (Railway or Google Cloud Run)
We have included a production-ready `Dockerfile` in the `backend/` directory. You can deploy this container directly to Cloud Run or Railway:
1.  Link your GitHub repo to Railway.
2.  Railway will automatically detect the `Dockerfile` inside the `backend/` directory and deploy it as a Docker service.
3.  Link a managed PostgreSQL instance or mount a persistent volume to preserve SQLite files.

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.
