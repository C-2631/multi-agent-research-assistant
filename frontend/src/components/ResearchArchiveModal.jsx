import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, X, Download, FileText, Search, Trash2, Share2 } from 'lucide-react';
import useSimulationStore from '../store/useSimulationStore';
import { API_API_URL } from '../config';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';

export default function ResearchArchiveModal({ isOpen, onClose }) {
  const { archive, deleteArchiveItem } = useSimulationStore();
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingId, setSharingId] = useState(null);

  if (!isOpen) return null;

  const filteredArchive = archive.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (paper) => {
    const blob = new Blob([paper.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareArchiveItem = async (paper) => {
    const fallbackShare = () => {
      try {
        const base64Data = btoa(unescape(encodeURIComponent(paper.report)));
        const url = `${window.location.origin}/paper/local?title=${encodeURIComponent(paper.title)}&data=${encodeURIComponent(base64Data)}`;
        navigator.clipboard.writeText(url);
        alert(`Offline public share URL generated and copied to clipboard!`);
      } catch (e) {
        console.error(e);
        alert("Failed to compile local share link.");
      }
    };

    if (paper.id > 1000000000000) {
      fallbackShare();
      return;
    }

    setSharingId(paper.id);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        fallbackShare();
        setSharingId(null);
        return;
      }
      const res = await fetch(`${API_API_URL}/history/${paper.id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        navigator.clipboard.writeText(data.url);
        alert(`Public share URL copied to clipboard: ${data.url}`);
      } else {
        fallbackShare();
      }
    } catch (e) {
      console.error(e);
      fallbackShare();
    } finally {
      setSharingId(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-panel block-morphism"
          style={{
            width: '100%',
            maxWidth: '1000px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
              <Archive size={20} style={{ color: 'var(--color-accent)' }} /> Research Papers Archive
            </h2>
            <button onClick={onClose} className="neo-button" style={{ padding: '0.4rem' }}><X size={16} /></button>
          </div>

          {/* Body Split View */}
          <div className="responsive-archive-grid">
            {/* Sidebar List */}
            <div style={{ borderRight: '1px solid var(--border-color)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', overflowY: 'auto' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Search saved papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              {filteredArchive.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                  No archived papers found. Run simulations to automatically save reports!
                </p>
              ) : (
                filteredArchive.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedPaper(item)}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      background: selectedPaper?.id === item.id ? 'var(--bg-card)' : 'transparent',
                      border: selectedPaper?.id === item.id ? '1px solid var(--color-accent)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{item.date}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                          deleteArchiveItem(item.id);
                          if (selectedPaper?.id === item.id) {
                            setSelectedPaper(null);
                          }
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(239, 68, 68, 0.7)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)'}
                      title="Delete paper"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Main Content Viewer */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
              {selectedPaper ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', color: 'var(--color-accent)' }}>{selectedPaper.title}</h2>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Saved on {selectedPaper.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleShareArchiveItem(selectedPaper)} 
                        disabled={sharingId !== null}
                        className="neo-button" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.3rem' }}
                        title="Generate shareable URL and copy to clipboard"
                      >
                        <Share2 size={14} />
                        {sharingId === selectedPaper.id ? "Sharing..." : "Share Link"}
                      </button>
                      <button onClick={() => handleDownload(selectedPaper)} className="neo-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Download size={14} /> Export MD
                      </button>
                    </div>
                  </div>

                  <div className="markdown-body">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {selectedPaper.report}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', gap: '1rem' }}>
                  <FileText size={48} style={{ opacity: 0.3 }} />
                  <p style={{ fontSize: '0.9rem' }}>Select a paper from the list on the left to read and inspect.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
