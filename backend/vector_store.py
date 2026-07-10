"""
Vector store RAG module for Multi-Agent Research Assistant.
Provides text chunking, Gemini API semantic embedding generation, and cosine similarity lookup.
"""

import os
import requests
import numpy as np
from typing import List, Dict

class VectorStore:
    def __init__(self):
        self.chunks = []
        self.embeddings = []

    def chunk_text(self, text: str, chunk_size: int = 600, overlap: int = 150) -> List[str]:
        """Split text into overlapping semantic character chunks."""
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunks.append(text[start:end])
            start += chunk_size - overlap
            
        return chunks

    def _get_embedding(self, text: str, api_key: str) -> np.ndarray:
        """Call Google's Gemini Embedding API, or fall back to keyword hashing vector."""
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "model": "models/text-embedding-004",
                    "content": {
                        "parts": [{"text": text}]
                    }
                }
                res = requests.post(url, headers=headers, json=payload, timeout=5.0)
                if res.status_code == 200:
                    vector = res.json()["embedding"]["values"]
                    return np.array(vector, dtype=np.float32)
            except Exception as e:
                # Silently log and trigger fallback
                pass

        # Fallback word-hash vector (128 dimensions)
        vector = np.zeros(128, dtype=np.float32)
        words = text.lower().split()
        for word in words:
            idx = hash(word) % 128
            vector[idx] += 1.0
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector /= norm
        return vector

    def add_document(self, text: str, api_key: str):
        """Index a document's chunks and calculate their embeddings."""
        new_chunks = self.chunk_text(text)
        self.chunks = new_chunks
        self.embeddings = [self._get_embedding(chunk, api_key) for chunk in new_chunks]

    def query(self, search_query: str, api_key: str, top_k: int = 3) -> str:
        """Query the vector index using cosine similarity and return combined context."""
        if not self.chunks or not self.embeddings:
            return ""
            
        query_vector = self._get_embedding(search_query, api_key)
        
        scores = []
        for emb in self.embeddings:
            dot = np.dot(query_vector, emb)
            norm_q = np.linalg.norm(query_vector)
            norm_e = np.linalg.norm(emb)
            score = dot / (norm_q * norm_e) if (norm_q > 0 and norm_e > 0) else 0.0
            scores.append(score)
            
        top_indices = np.argsort(scores)[::-1][:top_k]
        retrieved = [self.chunks[idx] for idx in top_indices]
        return "\n\n---\n\n".join(retrieved)
