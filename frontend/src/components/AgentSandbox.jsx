import React, { useState, useEffect } from 'react';
import useSimulationStore from '../store/useSimulationStore';
import SimulationControls from './sandbox/SimulationControls';
import AgentNetwork from './sandbox/AgentNetwork';
import TaskChecklist from './sandbox/TaskChecklist';
import LiveConsole from './sandbox/LiveConsole';
import FinalOutput from './sandbox/FinalOutput';
import WelcomeNoticeModal from './sandbox/WelcomeNoticeModal';

export default function AgentSandbox() {
  const [showNotice, setShowNotice] = useState(true);

  const handleCloseNotice = () => {
    setShowNotice(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <WelcomeNoticeModal isOpen={showNotice} onClose={handleCloseNotice} />
      <div className="bg-glow-spot" style={{ top: '-10%', left: '30%' }}></div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
          Agent Sandbox
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.5 }}>
          Simulate a structured multi-agent system collaborating on high-level scientific and technical research tasks.
        </p>
      </div>

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
