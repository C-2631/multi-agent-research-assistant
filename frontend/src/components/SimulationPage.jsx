import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ArrowLeft, Activity, Cpu, CheckCircle } from 'lucide-react';
import useSimulationStore from '../store/useSimulationStore';
import AgentNetwork from './sandbox/AgentNetwork';
import LiveConsole from './sandbox/LiveConsole';
import TaskChecklist from './sandbox/TaskChecklist';
import FinalOutput from './sandbox/FinalOutput';

export default function SimulationPage({ onBack }) {
  const { promptKey, setPromptKey, isSimulating, startSimulation, pauseSimulation, resetSimulation } = useSimulationStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Show 3D Initialization loader on entering page
    const timer = setTimeout(() => {
      setIsInitializing(false);
      startSimulation(); // Auto-run simulation on page load
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: 0, left: '200px', right: 0, bottom: 0,
              background: 'var(--bg-primary)',
              zIndex: 500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="orbital-3d-spinner">
              <div className="orbit ring-1"></div>
              <div className="orbit ring-2"></div>
              <div className="orbit ring-3"></div>
              <Cpu size={32} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 style={{ marginTop: '2rem', color: 'var(--color-accent)', letterSpacing: '0.05em' }}>
              INITIALIZING QUANTUM SIMULATION ENVIRONMENT...
            </h3>
            <style>{`
              .orbital-3d-spinner {
                position: relative;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                perspective: 800px;
              }
              .orbit {
                position: absolute;
                width: 100%; height: 100%;
                border-radius: 50%;
                border: 2px solid transparent;
              }
              .ring-1 {
                border-top-color: var(--color-accent);
                border-bottom-color: var(--color-accent);
                animation: spin3D1 1.5s linear infinite;
              }
              .ring-2 {
                border-left-color: var(--color-warning);
                border-right-color: var(--color-warning);
                animation: spin3D2 2s linear infinite;
              }
              .ring-3 {
                border-top-color: var(--color-secondary);
                animation: spin3D3 2.5s linear infinite;
              }
              @keyframes spin3D1 {
                0% { transform: rotateX(35deg) rotateY(45deg) rotateZ(0deg); }
                100% { transform: rotateX(35deg) rotateY(45deg) rotateZ(360deg); }
              }
              @keyframes spin3D2 {
                0% { transform: rotateX(50deg) rotateY(-30deg) rotateZ(0deg); }
                100% { transform: rotateX(50deg) rotateY(-30deg) rotateZ(360deg); }
              }
              @keyframes spin3D3 {
                0% { transform: rotateX(15deg) rotateY(80deg) rotateZ(0deg); }
                100% { transform: rotateX(15deg) rotateY(80deg) rotateZ(360deg); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header with Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onBack}
            className="neo-button"
            style={{ padding: '0.5rem 0.8rem' }}
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity style={{ color: 'var(--color-accent)' }} /> Live Simulation Run
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Real-time multi-agent execution pipeline & trace monitoring.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select 
            value={promptKey} 
            onChange={(e) => setPromptKey(e.target.value)}
            disabled={isSimulating}
            className="neo-select"
          >
            <option value="quantum_medicine">Quantum Computing in Medicine</option>
            <option value="explain_transformers">Explain Transformers from Scratch</option>
          </select>

          <button 
            onClick={isSimulating ? pauseSimulation : startSimulation}
            className={`neo-button ${isSimulating ? 'active' : ''}`}
          >
            <Play size={16} fill={isSimulating ? "none" : "currentColor"} />
            {isSimulating ? "Pause" : "Run Simulation"}
          </button>

          <button onClick={resetSimulation} className="neo-button secondary">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Grid Layout for Full Page Simulation */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
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
