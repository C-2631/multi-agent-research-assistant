import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import { motion } from 'framer-motion';

export default function TaskChecklist() {
  const { tasks } = useSimulationStore();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel block-morphism" 
      style={{ padding: '2rem' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
        <CheckCircle size={16} style={{ color: 'var(--color-accent)' }} /> Execution Tasks
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map((task) => {
          const isActive = task.status === 'active';
          const isCompleted = task.status === 'completed';
          return (
            <motion.div 
              key={task.id} 
              layout
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '1rem', 
                padding: '1rem', 
                borderRadius: '12px', 
                background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02))' : 'var(--bg-secondary)',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'inset 2px 2px 5px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isActive && (
                <motion.div 
                  className="bg-glow-spot" 
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', opacity: 0.5, background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)' }}
                />
              )}
              
              <div style={{ marginTop: '0.15rem', zIndex: 1 }}>
                {isCompleted ? (
                  <CheckCircle size={18} style={{ color: '#10b981', filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))' }} />
                ) : isActive ? (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--color-accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  <Circle size={18} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                )}
              </div>
              <div style={{ zIndex: 1 }}>
                <p style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: isActive ? 600 : 500, 
                  color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  opacity: isCompleted ? 0.6 : 1
                }}>
                  {task.name}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
