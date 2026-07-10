import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Cpu, HelpCircle, Mail, AlertTriangle, CheckCircle } from 'lucide-react';

export default function WelcomeNoticeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="glass-panel block-morphism"
          style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--bg-secondary)', // Fully opaque matching theme
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            padding: 0
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-primary)' // Header contrast
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <HelpCircle size={20} style={{ color: 'var(--color-accent)' }} />
              Quick Getting Started Guide
            </h2>
            <button
              onClick={onClose}
              className="neo-button"
              style={{ padding: '0.4rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              title="Close guide"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div style={{
            padding: '1.5rem',
            overflowY: 'auto',
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--color-text-main)'
          }}>
            
            {/* Note text */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--color-text-main)',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '0.2rem' }}>ℹ️ GENERAL NOTE</span>
              We built this multi-agent sandbox to let you explore how cooperative AI networks collaborate on scientific papers. Please review the instructions below to get the best experience!
            </div>

            {/* API Key */}
            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 700, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={14} /> 1. Configuring API Keys
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', paddingLeft: '1.2rem' }}>
                <strong>If you have an API key:</strong> Set your Gemini or OpenRouter API key by clicking the ⚙️ icon in the toolbar. This enables real-time LLM agent generation.
                <br />
                <strong>If you do not have a key:</strong> You can still run the simulation! The system will automatically fall back to high-quality preset answers to demonstrate the multi-agent orchestration flow.
              </p>
            </div>

            {/* HITL & Custom Mode */}
            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 700, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={14} /> 2. Human-In-The-Loop (HITL) Checkpoints
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', paddingLeft: '1.2rem' }}>
                Toggle <strong>"Enable HITL Checkpoint"</strong> to pause execution after the Planner agent generates the initial roadmap. You can edit the plan before sending it to the Researcher, saving token usage and directing the agents.
                <br />
                Use <strong>"Custom Mode"</strong> in the prompt dropdown to type your own custom topics and query inputs!
              </p>
            </div>

            {/* Quota limit warning */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--color-warning)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
            }}>
              <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 700, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={14} /> 3. Usage & Quota Limits
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                If a run finishes with missing or empty outputs, the shared API keys might have reached their daily usage limit. Please add your own API key to bypass this restriction, or wait for the quota to reset.
              </p>
            </div>

            {/* Feedback / Email */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem',
              color: 'var(--color-text-muted)'
            }}>
              <Mail size={14} />
              <span>Have suggestions? Contact us at: <a href="mailto:cjc200426@gmail.com" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>cjc200426@gmail.com</a></span>
            </div>

          </div>

          {/* Footer Action */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              className="neo-button"
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Get Started
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
