import React, { useState } from 'react';
import { FileText, Cpu, Copy, Download, Check } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm';

export default function FinalOutput() {
  const { currentStepIndex, getSteps, getReport, promptKey } = useSimulationStore();
  const [copied, setCopied] = useState(false);
  const steps = getSteps();
  const isComplete = currentStepIndex === steps.length - 1;
  const report = getReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${promptKey}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel block-morphism" 
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '450px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
          <FileText size={16} style={{ color: 'var(--color-accent)' }} /> Compiled Output
        </h3>

        {isComplete && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleCopy}
              className="neo-button"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
              title="Copy to Clipboard"
            >
              {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="neo-button"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
              title="Download Markdown File"
            >
              <Download size={14} /> Export
            </button>
          </div>
        )}
      </div>

      <div style={{ 
        flexGrow: 1, 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '12px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        padding: '1.5rem', 
        overflowY: 'auto',
        fontSize: '0.9rem',
        color: 'var(--color-text-main)',
        lineHeight: 1.7,
        position: 'relative'
      }}>
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="markdown-body"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({node, ...props}) => <h1 style={{fontSize: '1.4rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--color-accent)'}} {...props}/>,
                  h2: ({node, ...props}) => <h2 style={{fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem'}} {...props}/>,
                  h3: ({node, ...props}) => <h3 style={{fontSize: '1.05rem', marginTop: '0.8rem', marginBottom: '0.4rem'}} {...props}/>,
                  p: ({node, ...props}) => <p style={{marginBottom: '0.8rem'}} {...props}/>,
                  ul: ({node, ...props}) => <ul style={{marginBottom: '0.8rem', paddingLeft: '1.5rem'}} {...props}/>,
                  ol: ({node, ...props}) => <ol style={{marginBottom: '0.8rem', paddingLeft: '1.5rem'}} {...props}/>,
                  li: ({node, ...props}) => <li style={{marginBottom: '0.3rem'}} {...props}/>,
                  table: ({node, ...props}) => <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden'}} {...props}/>,
                  th: ({node, ...props}) => <th style={{background: 'var(--bg-secondary)', padding: '0.6rem 0.8rem', borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontWeight: 600, color: 'var(--color-accent)'}} {...props}/>,
                  td: ({node, ...props}) => <td style={{padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem'}} {...props}/>,
                  code: ({node, inline, ...props}) => 
                    inline ? <code style={{background: 'var(--bg-secondary)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85em', color: 'var(--color-warning)'}} {...props}/> 
                    : <pre style={{background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', marginBottom: '1rem'}}><code {...props}/></pre>,
                  blockquote: ({node, ...props}) => <blockquote style={{borderLeft: '4px solid var(--color-accent)', paddingLeft: '1rem', margin: '1rem 0', color: 'var(--color-text-muted)', fontStyle: 'italic'}} {...props} />
                }}
              >
                {report}
              </ReactMarkdown>
            </motion.div>
          ) : (
            <motion.div 
              key="waiting"
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', gap: '1.5rem' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Cpu size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </motion.div>
              <p style={{ fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Awaiting pipeline completion...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
