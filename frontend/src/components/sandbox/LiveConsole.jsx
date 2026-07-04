import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';

const getAgentColor = (name) => {
  switch (name) {
    case "Planner": return "#3b82f6";
    case "Researcher": return "#8b5cf6";
    case "Writer": return "#10b981";
    case "Editor": return "#f59e0b";
    default: return "#94a3b8";
  }
};

export default function LiveConsole() {
  const { logs } = useSimulationStore();
  const consoleBodyRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Check if the user is near the bottom (within 50px)
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  useEffect(() => {
    if (consoleBodyRef.current && isAtBottomRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel block-morphism" 
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '450px' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
        <Terminal size={16} style={{ color: 'var(--color-accent)' }} /> Live Trace Log
      </h3>
      
      <div 
        ref={consoleBodyRef}
        onScroll={handleScroll}
        style={{ 
          flexGrow: 1, 
          background: 'var(--bg-primary)', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.05)', 
          padding: '1.25rem', 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.8rem', 
          lineHeight: 1.6,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative'
        }}
      >
        <div className="scanner-line"></div>
        <AnimatePresence>
          {logs.length === 0 ? (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              style={{ color: 'var(--color-text-muted)' }}
            >
              System initialized. Waiting for execution...
            </motion.span>
          ) : (
            logs.map((log) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ borderLeft: `3px solid ${getAgentColor(log.agent)}`, paddingLeft: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: getAgentColor(log.agent), fontWeight: 700, letterSpacing: '0.05em' }}>{log.agent}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>[{log.status}]</span>
                </div>
                <pre style={{ color: 'var(--color-text-main)', whiteSpace: 'pre-wrap', background: 'transparent', marginTop: '0.25rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  {log.log}
                </pre>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
