import React, { useState, useEffect } from 'react';
import { Layers, Sun, Moon, Monitor, MessageSquare, Send, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { useThemeStore } from '../store/themeStore';
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery';
import { API_API_URL } from '../config';

export default function SharedPaperViewer({ uuid }) {
  const { theme, setTheme, initTheme } = useThemeStore();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [newCommenter, setNewCommenter] = useState("");
  const [newCommentBody, setNewCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(true);
  
  // Citation Auditor states
  const [verificationMap, setVerificationMap] = useState({});
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    initTheme();
    fetchReport();
    fetchComments();
  }, [uuid, initTheme]);

  const fetchReport = async () => {
    if (uuid === 'local') {
      try {
        const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const searchStr = window.location.search || ('?' + hashQuery);
        const params = new URLSearchParams(searchStr);
        const title = params.get('title') || 'Shared Research Report';
        const query = params.get('q') || '';
        const rawData = params.get('data') || '';
        const reportText = decodeURIComponent(escape(atob(rawData)));
        const mockReport = {
          title,
          query,
          report: reportText,
          created_at: new Date().toISOString()
        };
        setReportData(mockReport);
        auditCitations(reportText);
      } catch (e) {
        setError("Failed to decode local shared report data. Ensure the URL is complete.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(`${API_API_URL}/shared/${uuid}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data.report);
        // Automatically trigger live citation check
        auditCitations(data.report.report);
      } else {
        setError("Shared manuscript not found or expired.");
      }
    } catch (e) {
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (uuid === 'local') return;
    try {
      const res = await fetch(`${API_API_URL}/shared/${uuid}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    }
  };

  const auditCitations = async (markdownText) => {
    setAuditing(true);
    try {
      const res = await fetch(`${API_API_URL}/verify-citations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: markdownText })
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationMap(data.results || {});
      }
    } catch (e) {
      console.error("Citation auditing failed:", e);
    } finally {
      setAuditing(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommenter.trim() || !newCommentBody.trim()) return;

    if (uuid === 'local') {
      const mockComment = {
        id: Date.now(),
        commenter_name: newCommenter,
        comment_body: newCommentBody,
        created_at: new Date().toISOString()
      };
      setComments(prev => [...prev, mockComment]);
      setNewCommentBody("");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_API_URL}/shared/${uuid}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commenter_name: newCommenter,
          comment_body: newCommentBody
        })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewCommentBody("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Custom Markdown renderer to inject citation verification status chips
  const customMarkdownComponents = {
    h1: ({node, ...props}) => <h1 style={{fontSize: '16pt', fontFamily: 'Times New Roman, serif', fontWeight: 'bold', textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem', color: '#000'}} {...props}/>,
    h2: ({node, ...props}) => <h2 style={{fontSize: '14pt', fontFamily: 'Times New Roman, serif', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '0.3rem', marginTop: '1.5rem', marginBottom: '0.8rem', color: '#000'}} {...props}/>,
    h3: ({node, ...props}) => <h3 style={{fontSize: '12pt', fontFamily: 'Times New Roman, serif', fontWeight: 'bold', marginTop: '1.2rem', marginBottom: '0.6rem', color: '#000'}} {...props}/>,
    p: ({node, ...props}) => <p style={{marginBottom: '0.8rem', textAlign: 'justify', lineHeight: 1.6}} {...props}/>,
    a: ({node, href, children, ...props}) => {
      const status = verificationMap[href];
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }} {...props}>
            {children}
          </a>
          {status === 'verified' && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '0.05rem 0.25rem', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 600 }} title="Citation URL validated successfully">
              ✓ Verified
            </span>
          )}
          {status === 'broken' && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '0.05rem 0.25rem', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 600 }} title="Broken or offline citation URL">
              ⚠ Broken
            </span>
          )}
        </span>
      );
    },
    table: ({node, ...props}) => <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', border: '1px solid #000'}} {...props}/>,
    th: ({node, ...props}) => <th style={{background: '#f2f2f2', padding: '0.5rem', border: '1px solid #000', fontWeight: 'bold', color: '#000'}} {...props}/>,
    td: ({node, ...props}) => <td style={{padding: '0.4rem', border: '1px solid #000', fontSize: '0.85rem', color: '#333'}} {...props}/>
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--color-text-main)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '3px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', letterSpacing: '0.05em' }}>FETCHING SHARED MANUSCRIPT...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--color-text-main)', padding: '2rem' }}>
        <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Error Loading Document</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header className="top-navbar" style={{ flexShrink: 0 }}>
        <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="sidebar-logo" style={{ marginBottom: 0 }}>
            <Layers size={24} style={{ color: 'var(--color-accent)' }} />
            <span>Agentic Lab</span>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '6px', color: 'var(--color-text-muted)' }}>
            📁 Public Archive
          </span>
        </div>

        <div style={{ flexGrow: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)', letterSpacing: '0.02em' }}>
            {reportData.title}
          </span>
        </div>

        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {auditing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--color-warning)' }}>
              <ShieldCheck size={14} className="pulse-active" />
              <span>Verifying Citation Links...</span>
            </div>
          )}

          {/* Theme switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'light', icon: <Sun size={14} /> },
              { id: 'dark', icon: <Moon size={14} /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.35rem 0.6rem',
                  background: theme === t.id ? 'var(--bg-card)' : 'transparent',
                  color: theme === t.id ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
            className={`neo-button ${showCommentsSidebar ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
          >
            <MessageSquare size={14} /> Reviews
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexGrow: 1, overflow: 'hidden' }}>
        {/* Manuscript Document Panel */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: isMobile ? '1.5rem 1rem' : (isTablet ? '2rem' : '3rem 4rem'),
          background: '#fff', // Enforce classic white academic page background
          color: '#000',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '800px', width: '100%', fontFamily: 'Times New Roman, Georgia, serif' }}>
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              components={customMarkdownComponents}
            >
              {reportData.report}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sidebar Comments Panel */}
        <AnimatePresence>
          {showCommentsSidebar && (
            <motion.div
              initial={isMobile ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
              animate={isMobile ? { height: '380px', width: '100%', opacity: 1 } : { width: isTablet ? '280px' : '380px', opacity: 1 }}
              exit={isMobile ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
              style={{
                flexShrink: 0,
                borderLeft: isMobile ? 'none' : '1px solid var(--border-color)',
                borderTop: isMobile ? '1px solid var(--border-color)' : 'none',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: isMobile ? '100%' : (isTablet ? '280px' : '380px')
              }}
            >
              {/* Sidebar Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} style={{ color: 'var(--color-accent)' }} /> Peer Review Comments ({comments.length})
                </h4>
              </div>

              {/* Comments List */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {comments.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>No review annotations yet. Leave the first comment below!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{c.commenter_name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--color-text-main)', lineHeight: 1.5 }}>{c.comment_body}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Submission Form */}
              <form onSubmit={handleSubmitComment} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'var(--bg-secondary)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)' }}>LEAVE A REVIEW COMMENT</span>
                <input
                  type="text"
                  placeholder="Your Name / Affiliation"
                  value={newCommenter}
                  onChange={(e) => setNewCommenter(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--color-text-main)', fontSize: '0.8rem', outline: 'none' }}
                  required
                />
                <textarea
                  placeholder="Review feedback text..."
                  value={newCommentBody}
                  onChange={(e) => setNewCommentBody(e.target.value)}
                  style={{ width: '100%', height: '80px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--color-text-main)', fontSize: '0.8rem', outline: 'none', resize: 'none' }}
                  required
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="neo-button"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', gap: '0.4rem', justifyContent: 'center' }}
                >
                  <Send size={12} />
                  {submittingComment ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
