import React, { useState } from 'react';
import { Play, RotateCcw, Key, Archive, Sparkles, Sliders, Cpu } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchArchiveModal from '../ResearchArchiveModal';

export default function SimulationControls() {
  const { promptKey, setPromptKey, customQuery, setCustomQuery, isSimulating, currentStepIndex, startSimulation, pauseSimulation, resetSimulation, apiKey, setApiKey, totalTokens, archive } = useSimulationStore();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [useCustomMode, setUseCustomMode] = useState(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel block-morphism" 
        style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexGrow: 1, maxWidth: '600px' }}>
          <button
            onClick={() => {
              setUseCustomMode(!useCustomMode);
              if (useCustomMode) setCustomQuery("");
            }}
            className={`neo-button ${useCustomMode ? 'active' : ''}`}
            title={useCustomMode ? "Switch to Scenario Presets" : "Switch to Custom Research Topic"}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', gap: '0.4rem' }}
          >
            <Sparkles size={14} style={{ color: useCustomMode ? 'var(--color-accent)' : 'inherit' }} />
            {useCustomMode ? "Custom Mode" : "Preset Mode"}
          </button>

          {useCustomMode ? (
            <input
              type="text"
              placeholder="Type any custom research topic (e.g. CRISPR Gene Therapy)..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              disabled={isSimulating}
              style={{
                flexGrow: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.5rem 0.8rem',
                color: 'var(--color-text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexGrow: 1 }}>
              <label style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scenario:</label>
              <select 
                value={promptKey} 
                onChange={(e) => setPromptKey(e.target.value)}
                disabled={isSimulating}
                className="neo-select"
                style={{ flexGrow: 1 }}
              >
                <option value="quantum_medicine">Quantum Computing in Medicine</option>
                <option value="explain_transformers">Explain Transformers from Scratch</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Controls & Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Live Token Metrics Badge */}
          {totalTokens > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <Cpu size={14} style={{ color: 'var(--color-accent)' }} />
              <span>{totalTokens} Tokens</span>
            </div>
          )}

          <button
            onClick={() => setShowArchive(true)}
            className="neo-button"
            title="View Saved Research Papers Archive"
            style={{ padding: '0.6rem', position: 'relative' }}
          >
            <Archive size={16} />
            {archive.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--color-accent)', color: '#000', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {archive.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`neo-button ${apiKey ? 'active' : ''}`}
            title="Configure Gemini API Key"
            style={{ padding: '0.6rem' }}
          >
            <Key size={16} style={{ color: apiKey ? 'var(--color-accent)' : 'inherit' }} />
          </button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isSimulating ? pauseSimulation : startSimulation}
            className={`neo-button ${isSimulating ? 'active' : ''}`}
          >
            <Play size={16} fill={isSimulating ? "none" : "currentColor"} />
            {isSimulating ? "Pause" : (currentStepIndex === -1 ? "Run Simulation" : "Resume")}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSimulation}
            className="neo-button secondary"
          >
            <RotateCcw size={16} />
            Reset
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showKeyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '1.5rem', overflow: 'hidden' }}
          >
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Key size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <input 
                type="password"
                placeholder="Enter Gemini API Key (AIzaSy...)..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                style={{
                  flexGrow: 1,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.8rem',
                  color: 'var(--color-text-main)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button 
                onClick={() => {
                  if (apiKey) alert("Gemini API Key saved and active!");
                  setShowKeyInput(false);
                }}
                className="neo-button"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResearchArchiveModal isOpen={showArchive} onClose={() => setShowArchive(false)} />
    </>
  );
}
