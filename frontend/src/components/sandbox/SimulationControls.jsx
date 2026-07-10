import React, { useState } from 'react';
import { Play, RotateCcw, Key, Archive, Sparkles, Sliders, Cpu, Paperclip } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchArchiveModal from '../ResearchArchiveModal';
import HitlReviewModal from './HitlReviewModal';

const DICTIONARY = [
  "Linear Regression",
  "Quantum Computing in Medicine",
  "Explain Transformers from Scratch",
  "CRISPR Gene Therapy",
  "Federated Learning",
  "Deep Neural Networks",
  "Reinforcement Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Support Vector Machines",
  "Genomic Sequencing",
  "Bioinformatics",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Analytics",
  "Cloud Computing",
  "Blockchain Technology",
  "Cybersecurity Enclave",
  "Information Security"
];

function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export default function SimulationControls() {
  const { promptKey, setPromptKey, customQuery, setCustomQuery, isSimulating, currentStepIndex, startSimulation, pauseSimulation, resetSimulation, apiKey, setApiKey, totalTokens, totalCost = 0.0, agentLatencies = {}, archive, isHitlActive, setHitlActive, uploadedFileName, setUploadedDocument } = useSimulationStore();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [useCustomMode, setUseCustomMode] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleInputChange = (val) => {
    setCustomQuery(val);
    if (!val || val.length < 4) {
      setSuggestion(null);
      return;
    }

    const query = val.toLowerCase();
    let bestMatch = null;
    let highestSim = 0;

    for (const item of DICTIONARY) {
      const target = item.toLowerCase();
      const dist = getEditDistance(query, target);
      const maxLen = Math.max(query.length, target.length);
      const sim = 1 - (dist / maxLen);

      // Trigger did-you-mean suggestion if similarity is between 65% and 100%
      if (sim >= 0.65 && sim < 1.0) {
        if (sim > highestSim) {
          highestSim = sim;
          bestMatch = item;
        }
      }
    }

    setSuggestion(bestMatch);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploadedDocument(file.name, "Extracting text...");
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUploadedDocument(file.name, data.text);
          alert(`Successfully attached reference file "${file.name}" for grounding!`);
        } else {
          alert(`Error uploading file: ${data.detail || 'unknown error'}`);
          setUploadedDocument("", "");
        }
      } else {
        const err = await response.json();
        alert(`Upload failed: ${err.detail || response.statusText}`);
        setUploadedDocument("", "");
      }
    } catch (err) {
      console.error(err);
      alert("Network error uploading file");
      setUploadedDocument("", "");
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel block-morphism" 
        style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'visible' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexGrow: 1, maxWidth: '600px' }}>
          <button
            onClick={() => {
              setUseCustomMode(!useCustomMode);
              if (useCustomMode) {
                setCustomQuery("");
                setSuggestion(null);
              }
            }}
            className={`neo-button ${useCustomMode ? 'active' : ''}`}
            title={useCustomMode ? "Switch to Scenario Presets" : "Switch to Custom Research Topic"}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', gap: '0.4rem' }}
          >
            <Sparkles size={14} style={{ color: useCustomMode ? 'var(--color-accent)' : 'inherit' }} />
            {useCustomMode ? "Custom Mode" : "Preset Mode"}
          </button>

          <button
            onClick={() => setHitlActive(!isHitlActive)}
            disabled={isSimulating}
            className={`neo-button ${isHitlActive ? 'active' : ''}`}
            title={isHitlActive ? "Disable Human-in-the-Loop checkpoint review" : "Enable Human-in-the-Loop checkpoint review"}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', gap: '0.4rem' }}
          >
            <Sliders size={14} style={{ color: isHitlActive ? 'var(--color-accent)' : 'inherit' }} />
            {isHitlActive ? "HITL Active" : "Enable HITL"}
          </button>
          {useCustomMode ? (
            <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Type any custom research topic (e.g. CRISPR Gene Therapy)..."
                value={customQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isSimulating}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.5rem 2.2rem 0.5rem 0.8rem',
                  color: 'var(--color-text-main)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <label 
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: isSimulating ? 'not-allowed' : 'pointer',
                  color: uploadedFileName ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.2rem'
                }}
                title={uploadedFileName ? `Attached: ${uploadedFileName}` : "Attach reference PDF/TXT document for in-memory RAG grounding"}
              >
                <Paperclip size={16} />
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  onChange={handleFileUpload} 
                  disabled={isSimulating} 
                  style={{ display: 'none' }} 
                />
              </label>

              {uploadedFileName && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '4px',
                  padding: '0.2rem 0.4rem',
                  fontSize: '0.7rem',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  zIndex: 40
                }}>
                  <span>📄 {uploadedFileName}</span>
                  <button 
                    onClick={() => setUploadedDocument("", "")}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: 0, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
                    title="Remove attachment"
                  >
                    ×
                  </button>
                </div>
              )}

              {suggestion && !isSimulating && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    marginTop: '0.4rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    zIndex: 50,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <span>💡 Did you mean:</span>
                  <button
                    onClick={() => {
                      setCustomQuery(suggestion);
                      setSuggestion(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      color: 'var(--color-accent)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    {suggestion}
                  </button>
                  <span>?</span>
                </motion.div>
              )}
            </div>
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
          {/* Live Token, Cost & Latency Metrics Badges */}
          {totalTokens > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--color-text-main)' }} title="Cumulative Token Count">
                <Cpu size={13} style={{ color: 'var(--color-accent)' }} />
                <span>{totalTokens.toLocaleString()} Tokens</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34, 197, 94, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.25)', fontSize: '0.75rem', color: '#4ade80' }} title="Estimated Session API Cost">
                <span style={{ fontWeight: 700 }}>$</span>
                <span>{totalCost.toFixed(4)} USD</span>
              </div>
              {Object.keys(agentLatencies).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }} title="Agent Execution Durations">
                  <span>⏱️</span>
                  <span>
                    {Object.entries(agentLatencies).map(([agent, latency]) => `${agent[0]}: ${latency}s`).join(' | ')}
                  </span>
                </div>
              )}
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
      <HitlReviewModal />
    </>
  );
}
