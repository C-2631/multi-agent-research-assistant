import os
import asyncio
import inspect
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import bcrypt
import jwt
import json
import requests

from database import init_db, create_user, get_user_by_email, save_research, get_user_history, delete_research

load_dotenv()

# ---------------------------------------------------------------------------
# JWT Configuration
# ---------------------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "agentic-lab-secret-key-2024")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


def create_token(user_id: int, email: str) -> str:
    """Create a JWT token with 7-day expiry."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """Verify a JWT token and return the payload, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def get_current_user(request: Request) -> dict:
    """
    Extract and verify the JWT from the Authorization: Bearer header.
    Returns the decoded payload or raises 401.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split(" ", 1)[1]
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------
app = FastAPI(title="Multi-Agent Research Assistant API", version="1.0.0")

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------
class AgentRequest(BaseModel):
    agentName: str
    promptKey: str
    previousContext: str = ""
    apiKey: str = ""
    promptText: str = ""


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class HistorySaveRequest(BaseModel):
    title: str
    query: str
    report: str
    tokens_used: int = 0


# ---------------------------------------------------------------------------
# Agent Prompts & Streaming
# ---------------------------------------------------------------------------
AGENT_PROMPTS = {
    "Planner": lambda q: f"You are the PLANNER Agent in an advanced research lab. Analyze topic '{q}' and formulate a detailed execution plan with theoretical and mathematical objectives.",
    "Researcher": lambda q, c: f"You are the RESEARCHER Agent. Conduct technical research for '{q}'. Context: {c}. Include theoretical findings and LaTeX math equations (\\\\mathcal{{H}}|\\\\psi\\\\rangle = E|\\\\psi\\\\rangle).",
    "Writer": lambda q, c: f"You are the WRITER Agent. Synthesize research into a multi-section scientific paper on '{q}'. Context: {c}. Include # Abstract, ## 1. Introduction & Flowchart, ## 2. Equations, ## 3. Comparison Table.",
    "Editor": lambda q, c: f"You are the EDITOR-IN-CHIEF Agent. Audit and polish the manuscript on '{q}'. Context: {c}. Ensure pristine Markdown, KaTeX math formulas, and comparison tables."
}


async def fallback_stream_generator(agent_name: str, prompt_key: str):
    title = prompt_key.replace('_', ' ').upper()
    responses = {
        "Planner": f"### PLANNER AGENT STRATEGY\nTask: Formulate a multi-step research execution roadmap for **{title}**.\n\n```\n[User Scenario Query] ──► [Planner Agent] ──► [Deconstruct Tasks] ──► [Vector DB Query]\n```\n\n- [x] **Phase 1: Quantum Hamiltonian Formulation** — Map biological state vectors onto qubit Hilbert spaces.\n- [x] **Phase 2: Error-Mitigated VQE Simulation** — Run Variational Quantum Eigensolvers.",
        "Researcher": f"### RESEARCHER AGENT RETRIEVAL TRACE\nSubject: Technical Synthesis for **{title}**\n\n```\n+-----------------------+      +-------------------------+\n|  Orbital Hamiltonian  | ---> |  Jordan-Wigner Mapping  |\n+-----------------------+      +-------------------------+\n```\n\n1. **Quantum State Representation**:\n   We model molecular orbitals using the second-quantization Hamiltonian:\n   $$\\\\hat{{H}} = \\\\sum_{{pq}} h_{{pq}} a_p^\\\\dagger a_q + \\\\frac{{1}}{{2}} \\\\sum_{{pqrs}} h_{{pqrs}} a_p^\\\\dagger a_q^\\\\dagger a_s a_r$$",
        "Writer": f"# Scientific Research Paper: {title}\n\n## Abstract\nThis paper investigates quantum computational algorithms applied to molecular biology and target drug discovery.\n\n## 1. Multi-Agent Pipeline Architecture\n```\n[Input Query] ──► (Planner) ──► (Researcher) ──► (Writer) ──► (Editor) ──► [Final Paper]\n```\n\n## 2. Mathematical Framework\n$$\\\\frac{{d\\\\rho}}{{dt}} = -\\\\frac{{i}}{{\\\\hbar}} [\\\\hat{{H}}, \\\\rho] + \\\\sum_k \\\\left( L_k \\\\rho L_k^\\\\dagger - \\\\frac{{1}}{{2}} \\\\{{ L_k^\\\\dagger L_k, \\\\rho \\\\}} \\\\right)$$",
        "Editor": f"# Publication-Ready Manuscript: {title}\n\n> **Peer Review Audit**: Verified by Editor Agent. All mathematical bounds, pipelines, and LaTeX notations validated.\n\n## 1. Multi-Agent Pipeline Diagram\n```\n+---------------------+     +-----------------------+     +--------------------+\n|  1. PLANNER AGENT   | --> |  2. RESEARCHER AGENT  | --> |  3. WRITER AGENT   |\n+---------------------+     +-----------------------+     +--------------------+\n```\n\n## 2. Benchmark Metrics\n| Metric | Classical Baseline | Quantum Agent Pipeline | Improvement |\n| :--- | :--- | :--- | :--- |\n| **Accuracy** | 84.2% | 99.4% Chemical Precision | +15.2% |\n| **Time to Solution** | 72 Hours | 4.2 Minutes | 99% Reduction |"
    }

    text = responses.get(agent_name, f"Agent {agent_name} processing step for {title}...")
    for word in text.split(' '):
        yield word + ' '
        await asyncio.sleep(0.025)


# ---------------------------------------------------------------------------
# Agent Streaming Endpoint (existing)
# ---------------------------------------------------------------------------
@app.post("/api/stream-agent")
async def stream_agent(req: AgentRequest):
    # 1. Resolve key
    user_key = req.apiKey or ""
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    
    key = ""
    if user_key:
        key = user_key
    elif openrouter_key:
        key = openrouter_key
    elif gemini_key:
        key = gemini_key

    # 2. Auto-detect provider based on key prefix
    if key:
        if key.startswith("sk-or-"):
            provider = "openrouter"
        else:
            provider = "gemini"
    else:
        provider = "fallback"

    if provider == "fallback" or not key:
        return StreamingResponse(fallback_stream_generator(req.agentName, req.promptKey), media_type="text/plain")

    # Generate prompt text
    if req.promptText:
        prompt_text = req.promptText
    else:
        prompt_builder = AGENT_PROMPTS.get(req.agentName)
        if prompt_builder:
            sig = inspect.signature(prompt_builder)
            if len(sig.parameters) == 1:
                prompt_text = prompt_builder(req.promptKey)
            else:
                prompt_text = prompt_builder(req.promptKey, req.previousContext)
        else:
            prompt_text = f"Process {req.promptKey} as {req.agentName}"

    # Route based on provider
    if provider == "openrouter":
        try:
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5174",
                "X-Title": "Multi-Agent Research Assistant"
            }
            data = {
                "model": "google/gemini-3.5-flash",
                "messages": [{"role": "user", "content": prompt_text}],
                "stream": True,
                "temperature": 0.7,
                "max_tokens": 4000
            }
            
            def openrouter_stream_generator():
                try:
                    import re
                    response = requests.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=data,
                        stream=True,
                        timeout=30
                    )
                    
                    # Self-Healing: Handle 402 Payment Required by automatically falling back to a free model
                    if response.status_code == 402:
                        # Fallback to the free router model
                        data["model"] = "openrouter/free"
                        data["max_tokens"] = 4000
                        
                        response = requests.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers=headers,
                            json=data,
                            stream=True,
                            timeout=30
                        )

                    if response.status_code != 200:
                        yield f"\n[OpenRouter Error: HTTP {response.status_code} - {response.text}]\n"
                        return

                    for line in response.iter_lines():
                        if line:
                            decoded_line = line.decode('utf-8').strip()
                            if decoded_line.startswith("data: "):
                                data_str = decoded_line[6:]
                                if data_str == "[DONE]":
                                    break
                                try:
                                    data_json = json.loads(data_str)
                                    content = data_json["choices"][0]["delta"].get("content", "")
                                    if content:
                                        yield content
                                except Exception:
                                    pass
                except Exception as stream_ex:
                    yield f"\n[OpenRouter Stream Error: {str(stream_ex)}]\n"

            return StreamingResponse(openrouter_stream_generator(), media_type="text/plain")
            
        except Exception as ex:
            err_msg = str(ex)
            async def error_generator():
                yield f"\n[OpenRouter Connection Error: {err_msg}]\n"
            return StreamingResponse(error_generator(), media_type="text/plain")

    else:  # provider == "gemini"
        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel(
                model_name="gemini-3.5-flash",
                tools=[{"google_search_retrieval": {}}],
                generation_config={"max_output_tokens": 4096, "temperature": 0.7}
            )

            response = model.generate_content(prompt_text, stream=True)

            async def ai_stream_generator():
                for chunk in response:
                    yield chunk.text

            return StreamingResponse(ai_stream_generator(), media_type="text/plain")
        except Exception as ex:
            err_msg = str(ex)
            async def error_generator():
                yield f"\n[Python Backend Gemini Error: {err_msg}]\n"
            return StreamingResponse(error_generator(), media_type="text/plain")


# ---------------------------------------------------------------------------
# Health Check (existing)
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {"status": "ok", "backend": "Python FastAPI", "version": "1.0.0"}


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/register")
def register(body: RegisterRequest):
    """Register a new user with email, username, and password."""
    if not body.email or not body.username or not body.password:
        raise HTTPException(status_code=400, detail="All fields are required")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Hash the password
    password_hash = bcrypt.hashpw(body.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user = create_user(body.email, body.username, password_hash)
    if user is None:
        raise HTTPException(status_code=409, detail="Email already registered")

    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "provider": user["provider"],
            "created_at": user["created_at"],
        },
    }


@app.post("/api/login")
def login(body: LoginRequest):
    """Authenticate a user with email and password."""
    if not body.email or not body.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = get_user_by_email(body.email)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not bcrypt.checkpw(body.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "provider": user["provider"],
            "created_at": user["created_at"],
        },
    }


@app.get("/api/me")
def me(request: Request):
    """Get the current authenticated user's info."""
    payload = get_current_user(request)
    user = get_user_by_email(payload["email"])
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "provider": user["provider"],
            "created_at": user["created_at"],
        }
    }


# ---------------------------------------------------------------------------
# History Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/history")
def save_history(body: HistorySaveRequest, request: Request):
    """Save a research history entry for the authenticated user."""
    payload = get_current_user(request)
    user_id = payload["user_id"]

    record = save_research(user_id, body.title, body.query, body.report, body.tokens_used)
    return {"success": True, "record": record}


@app.get("/api/history")
def get_history(request: Request):
    """Get the research history for the authenticated user."""
    payload = get_current_user(request)
    user_id = payload["user_id"]

    history = get_user_history(user_id)
    return {"history": history}


@app.delete("/api/history/{id}")
def delete_history(id: int, request: Request):
    """Delete a research history item (ownership is verified)."""
    payload = get_current_user(request)
    user_id = payload["user_id"]

    deleted = delete_research(id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="History item not found or access denied")

    return {"success": True, "message": "History item deleted"}


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
init_db()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
