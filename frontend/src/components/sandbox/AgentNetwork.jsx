import React from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import { motion } from 'framer-motion';

const getAgentColor = (name) => {
  switch (name) {
    case "Planner": return "#3b82f6";
    case "Researcher": return "#8b5cf6";
    case "Writer": return "#10b981";
    case "Editor": return "#f59e0b";
    default: return "#94a3b8";
  }
};

export default function AgentNetwork() {
  const { activeAgent, isSimulating, currentStepIndex, getSteps } = useSimulationStore();
  const steps = getSteps();
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  const agents = [
    { name: "Planner", desc: "Formulates goals" },
    { name: "Researcher", desc: "Fetches papers" },
    { name: "Writer", desc: "Compiles drafts" },
    { name: "Editor", desc: "Polishes format" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel block-morphism" 
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} style={{ color: 'var(--color-accent)' }} /> Orchestration Flow
         </h3>
      </div>

      <div style={{ position: 'relative', height: '200px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)' }}>
        {/* SVG Connectors */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="12.5%" y1="50%" x2="37.5%" y2="50%" stroke="var(--border-color)" strokeWidth="2" style={{ opacity: 0.3 }} />
          <line x1="37.5%" y1="50%" x2="62.5%" y2="50%" stroke="var(--border-color)" strokeWidth="2" style={{ opacity: 0.3 }} />
          <line x1="62.5%" y1="50%" x2="87.5%" y2="50%" stroke="var(--border-color)" strokeWidth="2" style={{ opacity: 0.3 }} />

          {activeAgent === "Planner" && isSimulating && <line className="flow-line" x1="12.5%" y1="50%" x2="37.5%" y2="50%" stroke="#3b82f6" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 6px #3b82f6)' }} />}
          {activeAgent === "Researcher" && isSimulating && <line className="flow-line" x1="37.5%" y1="50%" x2="62.5%" y2="50%" stroke="#8b5cf6" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 6px #8b5cf6)' }} />}
          {activeAgent === "Writer" && isSimulating && <line className="flow-line" x1="62.5%" y1="50%" x2="87.5%" y2="50%" stroke="#10b981" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 6px #10b981)' }} />}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%', padding: '0 1rem', perspective: '1000px' }}>
          {agents.map((ag, i) => {
            const isActive = activeAgent === ag.name;
            const color = getAgentColor(ag.name);
            return (
              <motion.div 
                key={i} 
                animate={isActive ? { z: 40, scale: 1.15 } : { z: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  zIndex: isActive ? 10 : 2, 
                  textAlign: 'center',
                  transformStyle: 'preserve-3d'
                }}
              >
                <motion.div 
                  whileHover={{ rotateY: 15, rotateX: -15, scale: 1.1 }}
                  className={`agent-node ${isActive ? "active" : ""}`}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px', // Squircle instead of perfect circle for neuromorphic feel
                    background: isActive ? `linear-gradient(135deg, ${color}44, ${color}11)` : 'var(--bg-secondary)',
                    border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                    fontSize: '1.25rem',
                    boxShadow: isActive 
                      ? `0 10px 30px ${color}55, inset 0 2px 10px rgba(255,255,255,0.2)` 
                      : '4px 4px 10px rgba(0,0,0,0.5), -4px -4px 10px rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                    textShadow: isActive ? `0 0 10px ${color}` : 'none',
                    position: 'relative'
                  }}
                >
                  {/* Glowing concentric pulse rings for enterprise branding */}
                  {isActive && (
                    <>
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: -6, left: -6, right: -6, bottom: -6,
                          borderRadius: '20px',
                          border: `2px solid ${color}`,
                          pointerEvents: 'none',
                          zIndex: -1
                        }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      />
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: -12, left: -12, right: -12, bottom: -12,
                          borderRadius: '24px',
                          border: `1.5px dashed ${color}88`,
                          pointerEvents: 'none',
                          zIndex: -2
                        }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.6, 0.2] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      />
                    </>
                  )}
                  {ag.name[0]}
                </motion.div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? color : 'var(--color-text-main)', letterSpacing: '0.05em' }}>{ag.name}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', opacity: isActive ? 1 : 0.5 }}>{ag.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div 
        layout
        className="neo-message-box"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          background: 'var(--bg-secondary)', 
          padding: '1.25rem', 
          borderRadius: '12px', 
          borderLeft: `4px solid ${activeAgent ? getAgentColor(activeAgent) : 'rgba(255,255,255,0.1)'}`,
          boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: activeAgent ? `${getAgentColor(activeAgent)}22` : 'rgba(255,255,255,0.05)' }}>
          {activeAgent ? (
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: '10px', height: '10px', borderRadius: '50%', background: getAgentColor(activeAgent) }}
            ></motion.div>
          ) : (
            <HelpCircle size={16} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: activeAgent ? getAgentColor(activeAgent) : 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            {activeAgent ? `${activeAgent} Processing` : 'System Idle'}
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
            {currentStep ? currentStep.message : "Launch simulation to observe agent orchestration."}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
