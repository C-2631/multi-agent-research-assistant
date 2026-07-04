import { create } from 'zustand';

const API_BASE = 'http://localhost:5000/api';

const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token && user) {
      return { token, user: JSON.parse(user), isAuthenticated: true };
    }
  } catch (e) { /* ignore */ }
  return { token: null, user: null, isAuthenticated: false };
};

export const useAuthStore = create((set, get) => ({
  ...loadAuthFromStorage(),
  isLoading: false,
  error: null,

  // ── Register ──────────────────────────────────────────────────────────
  register: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  // ── Login ─────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  // ── Clear Error ───────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ── Save Research to Backend ──────────────────────────────────────────
  saveResearch: async (title, query, report, tokensUsed) => {
    const { token } = get();
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, query, report, tokens_used: tokensUsed })
      });
      return res.ok;
    } catch { return false; }
  },

  // ── Fetch History from Backend ────────────────────────────────────────
  fetchHistory: async () => {
    const { token } = get();
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  },

  // ── Delete History Item ───────────────────────────────────────────────
  deleteHistoryItem: async (id) => {
    const { token } = get();
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch { return false; }
  }
}));

export default useAuthStore;
