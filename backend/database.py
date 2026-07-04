"""
SQLite database module for Multi-Agent Research Assistant.
Handles user accounts and research history persistence.
"""

import sqlite3
import os
from typing import Optional

DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "research_assistant.db")


def _get_connection() -> sqlite3.Connection:
    """Create a database connection with row factory enabled."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _row_to_dict(row: sqlite3.Row) -> Optional[dict]:
    """Convert a sqlite3.Row to a plain dictionary."""
    if row is None:
        return None
    return dict(row)


def init_db() -> None:
    """Initialize the database by creating tables if they don't exist."""
    with _get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                provider TEXT DEFAULT 'email',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS research_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                query TEXT NOT NULL,
                report TEXT NOT NULL,
                tokens_used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)

        conn.commit()


def create_user(email: str, username: str, password_hash: str, provider: str = "email") -> Optional[dict]:
    """
    Create a new user. Returns the user dict on success, or None if email already exists.
    """
    with _get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (email, username, password_hash, provider) VALUES (?, ?, ?, ?)",
                (email, username, password_hash, provider),
            )
            conn.commit()
            user_id = cursor.lastrowid
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            return _row_to_dict(cursor.fetchone())
        except sqlite3.IntegrityError:
            return None


def get_user_by_email(email: str) -> Optional[dict]:
    """
    Retrieve a user by email. Returns user dict or None if not found.
    """
    with _get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        return _row_to_dict(cursor.fetchone())


def save_research(user_id: int, title: str, query: str, report: str, tokens_used: int = 0) -> dict:
    """
    Save a research history entry. Returns the saved record as a dict.
    """
    with _get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO research_history (user_id, title, query, report, tokens_used) VALUES (?, ?, ?, ?, ?)",
            (user_id, title, query, report, tokens_used),
        )
        conn.commit()
        record_id = cursor.lastrowid
        cursor.execute("SELECT * FROM research_history WHERE id = ?", (record_id,))
        return _row_to_dict(cursor.fetchone())


def get_user_history(user_id: int, limit: int = 50) -> list[dict]:
    """
    Get the research history for a user, ordered by most recent first.
    """
    with _get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM research_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
        return [_row_to_dict(row) for row in cursor.fetchall()]


def delete_research(research_id: int, user_id: int) -> bool:
    """
    Delete a research history item, verifying ownership.
    Returns True if deleted, False if not found or not owned by user.
    """
    with _get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM research_history WHERE id = ? AND user_id = ?",
            (research_id, user_id),
        )
        conn.commit()
        return cursor.rowcount > 0
