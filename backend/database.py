"""
Database module for Multi-Agent Research Assistant.
Supports both PostgreSQL (production) and SQLite (local fallback) dynamically.
"""

import sqlite3
import os
from typing import Optional

DATABASE_PATH = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "research_assistant.db"))
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    import psycopg2
    import psycopg2.extras
    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False


def _is_postgres() -> bool:
    """Check if the database connection should use PostgreSQL."""
    return bool(HAS_POSTGRES and DATABASE_URL and (DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")))


def _get_connection():
    """Create a database connection based on environment configuration."""
    if _is_postgres():
        db_url = DATABASE_URL
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        return psycopg2.connect(db_url)
    else:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn


def _get_cursor(conn):
    """Retrieve an appropriate database cursor."""
    if _is_postgres():
        return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    else:
        return conn.cursor()


def _row_to_dict(row) -> Optional[dict]:
    """Convert a database row representation to a dictionary."""
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    return dict(row)


def _execute(cursor, query: str, params=()):
    """Execute query with parameters normalized for SQL dialect placeholder difference."""
    if _is_postgres():
        query = query.replace("?", "%s")
    cursor.execute(query, params)


def init_db() -> None:
    """Initialize database tables with appropriate schemas for SQLite or Postgres."""
    is_pg = _is_postgres()
    
    with _get_connection() as conn:
        cursor = _get_cursor(conn)

        # Users table
        id_type = "SERIAL PRIMARY KEY" if is_pg else "INTEGER PRIMARY KEY AUTOINCREMENT"
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS users (
                id {id_type},
                email TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                provider TEXT DEFAULT 'email',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Research history table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS research_history (
                id {id_type},
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                query TEXT NOT NULL,
                report TEXT NOT NULL,
                tokens_used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)

        # Audit logs table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id {id_type},
                user_id INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                action TEXT NOT NULL,
                ip_address TEXT,
                status TEXT NOT NULL,
                tokens_used INTEGER DEFAULT 0
            )
        """)

        # Shared reports table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS shared_reports (
                id {id_type},
                uuid TEXT UNIQUE NOT NULL,
                history_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (history_id) REFERENCES research_history (id) ON DELETE CASCADE
            )
        """)

        # Report comments table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS report_comments (
                id {id_type},
                shared_uuid TEXT NOT NULL,
                commenter_name TEXT NOT NULL,
                selection_text TEXT,
                comment_body TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (shared_uuid) REFERENCES shared_reports (uuid) ON DELETE CASCADE
            )
        """)

        conn.commit()


def save_audit_log(user_id: Optional[int], action: str, ip_address: Optional[str], status: str, tokens_used: int = 0) -> None:
    """Save an audit log entry for security monitoring."""
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        _execute(
            cursor,
            "INSERT INTO audit_logs (user_id, action, ip_address, status, tokens_used) VALUES (?, ?, ?, ?, ?)",
            (user_id, action, ip_address, status, tokens_used),
        )
        conn.commit()


def create_user(email: str, username: str, password_hash: str, provider: str = "email") -> Optional[dict]:
    """Create a new user. Returns user record on success, or None on failure."""
    email = email.strip().lower()
    username = username.strip()
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        try:
            if _is_postgres():
                cursor.execute(
                    "INSERT INTO users (email, username, password_hash, provider) VALUES (%s, %s, %s, %s) RETURNING id",
                    (email, username, password_hash, provider),
                )
                conn.commit()
                user_id = cursor.fetchone()["id"]
            else:
                cursor.execute(
                    "INSERT INTO users (email, username, password_hash, provider) VALUES (?, ?, ?, ?)",
                    (email, username, password_hash, provider),
                )
                conn.commit()
                user_id = cursor.lastrowid
                
            _execute(cursor, "SELECT * FROM users WHERE id = ?", (user_id,))
            return _row_to_dict(cursor.fetchone())
        except Exception:
            return None


def get_user_by_email(email: str) -> Optional[dict]:
    """Retrieve a user by email."""
    email = email.strip().lower()
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        if _is_postgres():
            cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
        else:
            cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email,))
        return _row_to_dict(cursor.fetchone())


def save_research(user_id: int, title: str, query: str, report: str, tokens_used: int = 0) -> dict:
    """Save a research history entry. Returns the saved record."""
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        if _is_postgres():
            cursor.execute(
                "INSERT INTO research_history (user_id, title, query, report, tokens_used) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (user_id, title, query, report, tokens_used),
            )
            conn.commit()
            record_id = cursor.fetchone()["id"]
        else:
            cursor.execute(
                "INSERT INTO research_history (user_id, title, query, report, tokens_used) VALUES (?, ?, ?, ?, ?)",
                (user_id, title, query, report, tokens_used),
            )
            conn.commit()
            record_id = cursor.lastrowid
            
        _execute(cursor, "SELECT * FROM research_history WHERE id = ?", (record_id,))
        return _row_to_dict(cursor.fetchone())


def get_user_history(user_id: int, limit: int = 50) -> list[dict]:
    """Get the research history for a user, ordered by most recent first."""
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        _execute(
            cursor,
            "SELECT * FROM research_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
        return [_row_to_dict(row) for row in cursor.fetchall()]


def delete_research(research_id: int, user_id: int) -> bool:
    """Delete a research history item, verifying ownership."""
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        _execute(
            cursor,
            "DELETE FROM research_history WHERE id = ? AND user_id = ?",
            (research_id, user_id),
        )
        conn.commit()
        return cursor.rowcount > 0


def create_shared_link(history_id: int) -> str:
    """Generate a UUID shareable link for a research history record."""
    import uuid
    new_uuid = str(uuid.uuid4())
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        _execute(cursor, "SELECT uuid FROM shared_reports WHERE history_id = ?", (history_id,))
        existing = cursor.fetchone()
        if existing:
            row = _row_to_dict(existing)
            return row["uuid"]
        
        if _is_postgres():
            cursor.execute(
                "INSERT INTO shared_reports (uuid, history_id) VALUES (%s, %s)",
                (new_uuid, history_id)
            )
        else:
            cursor.execute(
                "INSERT INTO shared_reports (uuid, history_id) VALUES (?, ?)",
                (new_uuid, history_id)
            )
        conn.commit()
        return new_uuid


def get_shared_report(shared_uuid: str) -> Optional[dict]:
    """Retrieve shared report details bypassing auth checks."""
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        _execute(cursor, """
            SELECT rh.title, rh.query, rh.report, rh.created_at, rh.tokens_used
            FROM shared_reports sr
            JOIN research_history rh ON sr.history_id = rh.id
            WHERE sr.uuid = ?
        """, (shared_uuid,))
        return _row_to_dict(cursor.fetchone())


def add_shared_comment(shared_uuid: str, commenter_name: str, selection_text: Optional[str], comment_body: str) -> dict:
    """Add a peer review comment to a shared report."""
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        if _is_postgres():
            cursor.execute(
                "INSERT INTO report_comments (shared_uuid, commenter_name, selection_text, comment_body) VALUES (%s, %s, %s, %s) RETURNING id",
                (shared_uuid, commenter_name, selection_text, comment_body)
            )
            conn.commit()
            comment_id = cursor.fetchone()["id"]
        else:
            cursor.execute(
                "INSERT INTO report_comments (shared_uuid, commenter_name, selection_text, comment_body) VALUES (?, ?, ?, ?)",
                (shared_uuid, commenter_name, selection_text, comment_body)
            )
            conn.commit()
            comment_id = cursor.lastrowid
            
        _execute(cursor, "SELECT * FROM report_comments WHERE id = ?", (comment_id,))
        return _row_to_dict(cursor.fetchone())


def get_shared_comments(shared_uuid: str) -> list[dict]:
    """Get all peer comments for a shared report, sorted chronologically."""
    with _get_connection() as conn:
        cursor = _get_cursor(conn)
        _execute(
            cursor,
            "SELECT * FROM report_comments WHERE shared_uuid = ? ORDER BY created_at ASC",
            (shared_uuid,)
        )
        return [_row_to_dict(row) for row in cursor.fetchall()]
