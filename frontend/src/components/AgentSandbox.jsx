import React, { useState, useEffect } from 'react';
import useSimulationStore from '../store/useSimulationStore';
import SimulationControls from './sandbox/SimulationControls';
import AgentNetwork from './sandbox/AgentNetwork';
import TaskChecklist from './sandbox/TaskChecklist';
import LiveConsole from './sandbox/LiveConsole';
import FinalOutput from './sandbox/FinalOutput';
import WelcomeNoticeModal from './sandbox/WelcomeNoticeModal';

export default function AgentSandbox() {
  const [showNotice, setShowNotice] = useState(() => !localStorage.getItem('hide_welcome_modal'));
  const [hideBanner, setHideBanner] = useState(() => !!localStorage.getItem('hide_welcome_banner'));

  const handleCloseNotice = () => {
    localStorage.setItem('hide_welcome_modal', 'true');
    setShowNotice(false);
  };

  const handleDismissBanner = () => {
    localStorage.setItem('hide_welcome_banner', 'true');
    setHideBanner(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <WelcomeNoticeModal isOpen={showNotice} onClose={handleCloseNotice} />
      <div className="bg-glow-spot" style={{ top: '-10%', left: '30%' }}></div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
          Agent Sandbox
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.5 }}>
          Simulate a structured multi-agent system collaborating on high-level scientific and technical research tasks.
        </p>
      </div>

      {!hideBanner && (
        <div className="glass-panel block-morphism" style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          position: 'relative'
        }}>
          <button
            onClick={handleDismissBanner}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
            title="Dismiss walkthrough"
          >
            ✕
          </button>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>👋 Welcome to Agentic Lab! Get started in 3 quick steps:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--color-accent)' }}>1. Pick or Type a Topic</strong>
              <div style={{ marginTop: '0.2rem' }}>Choose from preset scenarios, tap a suggestion chip, or type your custom research prompt.</div>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--color-accent)' }}>2. Run Simulation</strong>
              <div style={{ marginTop: '0.2rem' }}>Watch the 4 AI agents (Planner, Researcher, Writer, Editor) collaborate autonomously.</div>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--color-accent)' }}>3. Export Academic Paper</strong>
              <div style={{ marginTop: '0.2rem' }}>Download a publication-ready double-column IEEE research paper or copy the BibTeX citation.</div>
            </div>
          </div>
        </div>
      )}

      <SimulationControls />

      <div className="responsive-sandbox-grid-top">
        <AgentNetwork />
        <TaskChecklist />
      </div>

      <div className="responsive-sandbox-grid-bottom">
        <LiveConsole />
        <FinalOutput />
      </div>
    </div>
  );
}
