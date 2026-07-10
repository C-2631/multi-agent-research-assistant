import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ClipboardList, Send, AlertTriangle } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import ReactMarkdown from 'react-markdown';

export default function HitlReviewModal() {
  const { hitlWaiting, logs, submitHitlFeedback } = useSimulationStore();
  const [feedback, setFeedback] = useState('');

  if (!hitlWaiting) return null;

  // Retrieve Planner's generated roadmap plan
  const plannerLog = logs.find(l => l.agent === "Planner")?.log || "Loading plan...";

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
            maxWidth: '650px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            padding: '1.75rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            border: '1px solid var(--color-accent)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <ClipboardList size={22} style={{ color: 'var(--color-accent)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>Human-in-the-Loop Review Checkpoint</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>The Planner agent has generated the roadmap. Please review and suggest adjustments.</p>
            </div>
          </div>

          {/* Plan Viewer */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            maxHeight: '220px',
            overflowY: 'auto',
            fontSize: '0.85rem'
          }} className="markdown-body">
            <ReactMarkdown>{plannerLog}</ReactMarkdown>
          </div>

          {/* Instructions Alert */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '6px',
            padding: '0.6rem 0.8rem',
            fontSize: '0.75rem',
            color: '#fbbf24'
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>Revisions will be fed directly to the Researcher and Writer to customize the research compile direction.</span>
          </div>

          {/* Feedback Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>REVISION FEEDBACK (OPTIONAL):</label>
            <textarea
              placeholder="e.g. Include detailed information about NISQ era constraints, focus less on CT scans, or add formulas..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                color: 'var(--color-text-main)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <button
              onClick={() => {
                submitHitlFeedback('');
                setFeedback('');
              }}
              className="neo-button secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
            >
              Approve Without Revisions
            </button>
            <button
              onClick={() => {
                submitHitlFeedback(feedback);
                setFeedback('');
              }}
              className="neo-button"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1.2rem', gap: '0.4rem' }}
            >
              <Send size={13} />
              Apply & Resume
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
