import React, { useEffect } from 'react';
import useSimulationStore from '../store/useSimulationStore';
import SimulationControls from './sandbox/SimulationControls';
import AgentNetwork from './sandbox/AgentNetwork';
import TaskChecklist from './sandbox/TaskChecklist';
import LiveConsole from './sandbox/LiveConsole';
import FinalOutput from './sandbox/FinalOutput';

export default function AgentSandbox() {
  const { isSimulating, advanceStep } = useSimulationStore();

  useEffect(() => {
    let timer;
    if (isSimulating) {
      const speed = useSimulationStore.getState().simSpeed;
      timer = setTimeout(() => {
        advanceStep();
      }, speed);
    }
    return () => clearTimeout(timer);
  }, [isSimulating, advanceStep, useSimulationStore.getState().currentStepIndex]);

  return (
    <div style={{ position: 'relative' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <AgentNetwork />
        <TaskChecklist />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <LiveConsole />
        <FinalOutput />
      </div>
    </div>
  );
}
