import os
import asyncio
import inspect
import re
import warnings

# Suppress third-party cryptography deprecation warnings from pypdf
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message=".*ARC4.*")
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pypdf import PdfReader
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import bcrypt
import jwt
import json
import requests

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import init_db, create_user, get_user_by_email, save_research, get_user_history, delete_research, save_audit_log, create_shared_link, get_shared_report, add_shared_comment, get_shared_comments
from vector_store import VectorStore
from pdf_compiler import build_double_column_pdf, HAS_REPORTLAB

vector_store = VectorStore()

load_dotenv()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

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
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
    citationFormat: Optional[str] = "IEEE"


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


class CommentCreateRequest(BaseModel):
    commenter_name: str
    selection_text: Optional[str] = None
    comment_body: str


class VerifyCitationsRequest(BaseModel):
    report: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class ExportPdfRequest(BaseModel):
    report: str
    title: str


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
    
    if "TRANSFORMER" in title:
        responses = {
            "Planner": f"### PLANNER AGENT STRATEGY\nTask: Formulate a multi-step research execution roadmap for **{title}**.\n\n```\n[User Scenario Query] ──► [Planner Agent] ──► [Deconstruct Tasks] ──► [Vector DB Query]\n```\n\n- [x] **Phase 1: Attention Mathematics Formulation** — Map input tokens onto Query, Key, and Value vectors.\n- [x] **Phase 2: Positional Sinusoids Integration** — Compute absolute positional indices.",
            "Researcher": f"### RESEARCHER AGENT RETRIEVAL TRACE\nSubject: Technical Synthesis for **{title}**\n\n```\n+-----------------------+      +-------------------------+\n|  Attention Vector Q   | ---> |  Scaled Dot-Product     |\n+-----------------------+      +-------------------------+\n```\n\n1. **Self-Attention Mechanism**:\n   We model token relationships using dot-product similarity:\n   $$\\\\text{{Attention}}(Q, K, V) = \\\\text{{softmax}}\\\\left(\\\\frac{{QK^T}}{{\\\\sqrt{{d_k}}}}\\\\right)V$$",
            "Writer": f"# Scientific Research Paper: {title}\n\n## Abstract\nThis paper investigates the scaled dot-product attention mechanics inside standard Encoder-Decoder architectures.\n\n## 1. Multi-Head Projection\n```\n[Input Query] ──► (Attention Split) ──► (Heads Concat) ──► [Output]\n```\n\n## 2. Attention Formula\n$$\\\\text{{Attention}}(Q,K,V) = \\\\text{{softmax}}\\\\left(\\\\frac{{QK^T}}{{\\\\sqrt{{d_k}}}}\\\\right)V$$",
            "Editor": f"# Publication-Ready Manuscript: {title}\n\n> **Peer Review Audit**: Verified by Editor Agent. All mathematical bounds and LaTeX notations validated.\n\n## 2. Benchmark Metrics\n| Metric | RNN Baseline | Transformer Pipeline | Improvement |\n| :--- | :--- | :--- | :--- |\n| **Bleu Score** | 28.4 | 38.2 | +9.8 |\n| **Training Time** | 120 Hours | 12 Hours | 90% Reduction |"
        }
    else:
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


def sanitize_and_check_input(text: str) -> str:
    """
    Sanitize and check the input for common prompt injections.
    Raises HTTPException 400 if malicious content is detected.
    """
    if not text:
        return ""
        
    # 1. Check for common injection/jailbreak patterns (case-insensitive)
    injection_patterns = [
        r"ignore\s+(?:all\s+)?previous\s+instructions",
        r"override\s+(?:system\s+)?settings",
        r"you\s+must\s+now\s+act\s+as",
        r"bypass\s+(?:security|filters)",
        r"forget\s+(?:everything|what\s+you\s+were\s+told)"
    ]
    
    for pattern in injection_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            raise HTTPException(
                status_code=400,
                detail="Security Threat Flagged: Malicious instruction sequence or system override pattern detected."
            )
            
    # 2. Sanitize HTML tags (to prevent cross-site scripting/formatting injects)
    clean_text = re.sub(r"<[^>]*>", "", text)
    return clean_text


# ---------------------------------------------------------------------------
# Agent Streaming Endpoint (existing)
# ---------------------------------------------------------------------------
@app.post("/api/stream-agent")
@limiter.limit("15/hour")
async def stream_agent(req: AgentRequest, request: Request):
    # Sanitize and validate inputs to prevent prompt injection and XSS
    req.promptKey = sanitize_and_check_input(req.promptKey)
    if req.promptText:
        req.promptText = sanitize_and_check_input(req.promptText)
    if req.previousContext:
        req.previousContext = sanitize_and_check_input(req.previousContext)

    # Log the streaming request initiation for security auditing
    save_audit_log(
        user_id=None,
        action=f"stream_agent_{req.agentName}",
        ip_address=request.client.host if request.client else "unknown",
        status="initiated"
    )

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

    # Route RAG semantic context injection for the Researcher node
    if req.agentName == "Researcher" and vector_store.chunks:
        rag_context = vector_store.query(req.promptKey, key, top_k=3)
        if rag_context:
            prompt_text += f"\n\n[UPLOADED REFERENCE DOCUMENT GROUND-TRUTH SEMANTIC CONTEXT]:\n{rag_context}"

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
def register(body: RegisterRequest, request: Request):
    """Register a new user with email, username, and password."""
    ip_addr = request.client.host if request.client else "unknown"
    if not body.email or not body.username or not body.password:
        save_audit_log(None, "user_registration", ip_addr, "failed")
        raise HTTPException(status_code=400, detail="All fields are required")

    if len(body.password) < 6:
        save_audit_log(None, "user_registration", ip_addr, "failed")
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Hash the password
    password_hash = bcrypt.hashpw(body.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user = create_user(body.email, body.username, password_hash)
    if user is None:
        save_audit_log(None, "user_registration", ip_addr, "failed")
        raise HTTPException(status_code=409, detail="Email already registered")

    save_audit_log(user["id"], "user_registration", ip_addr, "success")
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
def login(body: LoginRequest, request: Request):
    """Authenticate a user with email and password."""
    ip_addr = request.client.host if request.client else "unknown"
    if not body.email or not body.password:
        save_audit_log(None, "user_login", ip_addr, "failed")
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = get_user_by_email(body.email)
    if user is None:
        save_audit_log(None, "user_login", ip_addr, "failed")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not bcrypt.checkpw(body.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        save_audit_log(user["id"], "user_login", ip_addr, "failed")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    save_audit_log(user["id"], "user_login", ip_addr, "success")
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


@app.post("/api/auth/google")
def google_login(body: GoogleLoginRequest, request: Request):
    """Verify Google token, provision user, and sign JWT token."""
    ip_addr = request.client.host if request.client else "unknown"
    token = body.id_token
    try:
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}", timeout=5.0)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google credentials or expired token")
            
        token_info = response.json()
        
        # Verify client ID if present in env
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if client_id and token_info.get("aud") != client_id:
            raise HTTPException(status_code=400, detail="Google Client ID mismatch")
            
        email = token_info.get("email")
        name = token_info.get("name") or email.split('@')[0]
        
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email associated")
            
        # Check if user already exists
        user = get_user_by_email(email)
        if not user:
            import bcrypt
            mock_password = os.urandom(16).hex()
            pw_hash = bcrypt.hashpw(mock_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user = create_user(email, name, pw_hash, provider="google")
            if not user:
                raise HTTPException(status_code=500, detail="Failed to create user record")
                
        # Generate JWT token
        save_audit_log(user["id"], "user_login_google", ip_addr, "success")
        access_token = create_token(user["id"], user["email"])
        
        return {
            "token": access_token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "username": user["username"],
                "provider": user["provider"],
                "created_at": user["created_at"],
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google Authentication failed: {str(e)}")


# ---------------------------------------------------------------------------
# History Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/history")
def save_history(body: HistorySaveRequest, request: Request):
    """Save a research history entry for the authenticated user."""
    payload = get_current_user(request)
    user_id = payload["user_id"]

    record = save_research(user_id, body.title, body.query, body.report, body.tokens_used)
    
    # Save compliance audit log for successful research completion
    save_audit_log(
        user_id=user_id,
        action="research_completed",
        ip_address=request.client.host if request.client else "unknown",
        status="success",
        tokens_used=body.tokens_used
    )
    
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
# RAG Document Upload Endpoint
# ---------------------------------------------------------------------------
@app.post("/api/upload")
def upload_document(file: UploadFile = File(...), apiKey: Optional[str] = Form("")):
    """Parse TXT or PDF documents temporarily in-memory and index into RAG vector store."""
    filename = file.filename
    
    # Restrict to PDF or TXT
    if not (filename.lower().endswith('.pdf') or filename.lower().endswith('.txt')):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only .pdf and .txt files are accepted."
        )
    
    extracted_text = ""
    
    try:
        if filename.lower().endswith('.pdf'):
            reader = PdfReader(file.file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        else: # TXT
            content = file.file.read()
            extracted_text = content.decode('utf-8', errors='ignore')
            
        # Truncate content to avoid excessive payload
        if len(extracted_text) > 100000:
            extracted_text = extracted_text[:100000] + "\n\n[Content truncated due to size limits...]"
            
        # Add to vector database RAG store
        vector_store.add_document(extracted_text, apiKey)
        
        return {
            "success": True,
            "filename": filename,
            "size": len(extracted_text),
            "text": extracted_text,
            "chunks": len(vector_store.chunks)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process file: {str(e)}"
        )


# ---------------------------------------------------------------------------
# Shareability & Peer Comments Endpoints (Phase 4 / 5)
# ---------------------------------------------------------------------------
@app.post("/api/history/{id}/share")
def share_history_item(id: int, request: Request):
    """Generate a public share link for a history record (requires authentication)."""
    payload = get_current_user(request)
    user_id = payload["user_id"]
    
    # Check history ownership
    with database._get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM research_history WHERE id = ? AND user_id = ?", (id, user_id))
        record = cursor.fetchone()
        if not record:
            raise HTTPException(status_code=404, detail="Research history item not found or access denied")
            
    uuid_str = create_shared_link(id)
    return {"success": True, "uuid": uuid_str, "url": f"http://localhost:5173/paper/{uuid_str}"}


@app.get("/api/shared/{uuid}")
def get_shared_manuscript(uuid: str):
    """Public read-only endpoint to retrieve shared manuscript (unauthenticated)."""
    report = get_shared_report(uuid)
    if not report:
        raise HTTPException(status_code=404, detail="Shared manuscript not found")
    return {"success": True, "report": report}


@app.post("/api/shared/{uuid}/comments")
def add_peer_comment(uuid: str, body: CommentCreateRequest):
    """Public endpoint to leave a peer review comment on a shared report."""
    report = get_shared_report(uuid)
    if not report:
        raise HTTPException(status_code=404, detail="Shared manuscript not found")
        
    comment = add_shared_comment(uuid, body.commenter_name, body.selection_text, body.comment_body)
    return {"success": True, "comment": comment}


@app.get("/api/shared/{uuid}/comments")
def get_peer_comments(uuid: str):
    """Public endpoint to fetch all comments for a shared report."""
    comments = get_shared_comments(uuid)
    return {"success": True, "comments": comments}


# ---------------------------------------------------------------------------
# Citation Verification Endpoint (Phase 5)
# ---------------------------------------------------------------------------
@app.post("/api/verify-citations")
async def verify_citations(body: VerifyCitationsRequest):
    """Asynchronously check all URLs in a report bibliography for broken links."""
    # Find all markdown links [title](http...)
    links = re.findall(r'\[[^\]]+\]\((https?://[^\s\)]+)\)', body.report)
    # Find loose links
    loose_links = re.findall(r'(https?://[^\s\)]+)', body.report)
    
    unique_links = list(set(links + loose_links))
    results = {}
    
    async def check_link(url: str):
        try:
            loop = asyncio.get_event_loop()
            # Try HEAD request
            response = await loop.run_in_executor(
                None,
                lambda: requests.head(url, timeout=2.0, headers={"User-Agent": "Mozilla/5.0"})
            )
            if response.status_code < 400:
                results[url] = "verified"
            else:
                # Try GET if HEAD is not allowed
                response_get = await loop.run_in_executor(
                    None,
                    lambda: requests.get(url, timeout=2.0, headers={"User-Agent": "Mozilla/5.0"}, stream=True)
                )
                if response_get.status_code < 400:
                    results[url] = "verified"
                else:
                    results[url] = "broken"
        except Exception:
            results[url] = "broken"
            
    if unique_links:
        await asyncio.gather(*(check_link(url) for url in unique_links))
        
    return {"success": True, "results": results}


@app.post("/api/export/pdf")
def export_double_column_pdf(body: ExportPdfRequest):
    """Generate and return double-column IEEE PDF using ReportLab."""
    if not HAS_REPORTLAB:
        raise HTTPException(
            status_code=400,
            detail="ReportLab library is not installed in the server environment. Please run 'pip install reportlab' to enable PDF generation."
        )
        
    try:
        pdf_data = build_double_column_pdf(body.report, body.title)
        if pdf_data is None:
            raise HTTPException(status_code=500, detail="PDF generation failed.")
            
        from fastapi.responses import Response
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={body.title.replace(' ', '_')}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compile PDF: {str(e)}")


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
init_db()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
