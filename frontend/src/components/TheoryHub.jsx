import React, { useState } from 'react';
import { ArrowRight, Layers, Cpu, Server, Workflow, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TheoryHub() {
  const [activeTab, setActiveTab] = useState("react");
  const [reactStep, setReactStep] = useState(0);

  const reactPatternSteps = [
    {
      title: "1. User Request (Input)",
      desc: "The human operator provides a query or problem statement.",
      prompt: "Find the molecular mass of a chemical compound with caffeine structural backbone."
    },
    {
      title: "2. Thought (Reasoning)",
      desc: "The LLM generates a hidden reasoning trace explaining what it needs to do next.",
      thought: "Thought: I need to lookup the exact chemical formula of caffeine, compute its molecular mass by summing constituent elements, and format the output."
    },
    {
      title: "3. Action (Tool Execution)",
      desc: "The LLM decides to trigger a tool with specific arguments.",
      action: "Action: pubchem_database_search(query='caffeine') -> Returns Chemical Formula: C8H10N4O2"
    },
    {
      title: "4. Observation (Fact Integration)",
      desc: "The environment returns the tool output, which is appended to the prompt context.",
      observation: "Observation: Formula is C8H10N4O2. Element masses: C=12.011, H=1.008, N=14.007, O=15.999."
    },
    {
      title: "5. Thought / Refinement",
      desc: "The LLM reads the observation and decides whether it has enough data to formulate a final answer.",
      thought: "Thought: I now have the formula and atomic masses. Let's calculate the molecular mass: 8*12.011 + 10*1.008 + 4*14.007 + 2*15.999 = 194.19 g/mol."
    },
    {
      title: "6. Final Answer (Response)",
      desc: "The LLM output is delivered to the user, terminating the loop.",
      answer: "Final Answer: The molecular mass of caffeine is approximately 194.19 g/mol."
    }
  ];

  const workflowSteps = [
    {
      title: "User Input",
      icon: "📝",
      color: "#6366f1",
      description: "The user enters their research topic or question into the application's interface. This can be any subject — from scientific topics like quantum computing to current events like market analysis. The system accepts natural language queries and treats them as the seed for a comprehensive, multi-agent research pipeline. The user can also specify the desired depth, tone, and structure of the final report.",
      detail: "Supported input: free-form text queries, topic keywords, or structured research questions."
    },
    {
      title: "Authentication",
      icon: "🔐",
      color: "#f59e0b",
      description: "Before any agents are invoked, the system verifies the user's identity via Firebase Authentication. This ensures that only authorized users can consume API resources (Gemini API calls, Google Search quota). The authentication layer also associates each research session with the user's account so that past reports can be retrieved later from the dashboard.",
      detail: "Backend validates Firebase ID tokens on every request to the /research endpoint."
    },
    {
      title: "Planner Agent",
      icon: "🧠",
      color: "#8b5cf6",
      description: "The Planner Agent is the first AI agent in the pipeline. It receives the raw user query and decomposes it into a structured research plan. This plan includes a list of sub-topics to investigate, the order in which they should be researched, and any specific angles or perspectives to cover. The Planner essentially acts as the 'project manager' — it ensures the research is comprehensive and well-organized before any searching begins.",
      detail: "Uses Gemini 2.0 Flash to generate a structured JSON research plan with sub-queries."
    },
    {
      title: "Researcher Agent",
      icon: "🔍",
      color: "#10b981",
      description: "The Researcher Agent is the core data-gathering component. For each sub-topic identified by the Planner, the Researcher invokes Google Search Grounding through the Gemini API. Instead of relying on the model's static training data, it performs live Google searches to retrieve the most current information from the internet. Each search result is processed, and the agent extracts key facts, statistics, quotes, and source URLs. This is what makes the system's output accurate and up-to-date — it's grounded in real-time web data, not stale training knowledge.",
      detail: "Powered by Gemini API with google_search_retrieval tool for real-time web grounding."
    },
    {
      title: "Writer Agent",
      icon: "✍️",
      color: "#ec4899",
      description: "The Writer Agent receives all the raw research data collected by the Researcher and synthesizes it into a coherent, well-structured report. It organizes the information into logical sections with headings, writes clear prose that connects different findings, integrates statistics and quotes naturally, and appends proper source citations. The Writer is optimized for producing long-form content that reads like a professional research document rather than a disjointed list of facts.",
      detail: "Generates a complete Markdown report with sections, citations, and a references list."
    },
    {
      title: "Editor Agent",
      icon: "📋",
      color: "#f97316",
      description: "The Editor Agent performs a final quality-assurance pass on the Writer's output. It checks for factual consistency between the cited sources and the claims made in the report, corrects grammatical errors, improves sentence flow, ensures the tone is consistent throughout, and verifies that all source links are properly formatted. The Editor acts as a human-like proofreader, polishing the report to publication quality before it reaches the user.",
      detail: "Reviews for accuracy, coherence, grammar, and proper citation formatting."
    },
    {
      title: "Final Report",
      icon: "📄",
      color: "#06b6d4",
      description: "The polished, fully cited research report is delivered back to the user's dashboard. It includes structured sections with headings, inline citations linked to real web sources, and a comprehensive references list at the bottom. The report is rendered in rich Markdown format and can be saved, downloaded, or revisited at any time from the user's report history. Each report represents the combined work of four specialized AI agents collaborating in sequence.",
      detail: "Stored in Firestore and rendered on the dashboard with full Markdown support."
    }
  ];

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="bg-glow-spot" style={{ top: '20%', left: '-10%' }}></div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '3rem' }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>
          Theory & Core Concepts
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '600px' }}>
          Deepen your theoretical understanding of how AI Agents operate, reason, retrieve data, and collaborate.
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        {[
          { id: "react", label: "ReAct Pattern", icon: <Cpu size={16} /> },
          { id: "memory", label: "Memory Systems", icon: <Server size={16} /> },
          { id: "architectures", label: "Orchestration Models", icon: <Layers size={16} /> },
          { id: "workflow", label: "Our System Workflow", icon: <Workflow size={16} /> },
          { id: "grounding", label: "Search Grounding", icon: <Globe size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 0',
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? 'var(--color-text-main)' : 'var(--color-text-muted)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)',
              transform: 'translateY(1px)', // cover the border
              position: 'relative'
            }}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="theoryActiveTabUnderline"
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '2px',
                  background: 'var(--color-accent)',
                  boxShadow: '0 0 8px var(--color-accent)'
                }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Tab Content: ReAct Pattern */}
        {activeTab === "react" && (
          <motion.div key="react" variants={variants} initial="hidden" animate="visible" exit="exit" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            <div className="glass-panel block-morphism" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>The ReAct Framework</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                The **ReAct** (Reason + Action) framework decouples reasoning from action execution. 
                Instead of generating a straight answer directly, the agent behaves in an iterative loop: **Thought → Action → Observation**. 
                This allows the LLM to write down intermediate steps and call external APIs before deciding on the final output.
              </p>
              
              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.75rem' }}>Core Value Propositions:</h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><strong>Reduces Hallucination:</strong> Grounding outputs on external APIs.</li>
                  <li><strong>Explainable AI:</strong> Humans can inspect the thought logs to debug logic.</li>
                  <li><strong>Dynamic Planning:</strong> Agents can recover from errors dynamically.</li>
                </ul>
              </div>
            </div>

            {/* Interactive Stepper */}
            <div className="glass-panel block-morphism" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Interactive Trace</h3>
                
                <motion.div 
                  layout
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', height: '240px', overflowY: 'auto' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={reactStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {reactPatternSteps[reactStep].title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        {reactPatternSteps[reactStep].desc}
                      </p>
                      
                      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-main)' }}>
                        {reactStep === 0 && reactPatternSteps[0].prompt}
                        {(reactStep === 1 || reactStep === 4) && reactPatternSteps[reactStep].thought}
                        {reactStep === 2 && reactPatternSteps[2].action}
                        {reactStep === 3 && reactPatternSteps[3].observation}
                        {reactStep === 5 && reactPatternSteps[5].answer}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {reactPatternSteps.map((_, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => setReactStep(idx)}
                      whileHover={{ scale: 1.2 }}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: reactStep === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'background 0.3s',
                        boxShadow: reactStep === idx ? '0 0 10px var(--color-accent)' : 'none'
                      }}
                    />
                  ))}
                </div>
                
                <motion.button
                  whileHover={reactStep < reactPatternSteps.length - 1 ? { scale: 1.05 } : {}}
                  whileTap={reactStep < reactPatternSteps.length - 1 ? { scale: 0.95 } : {}}
                  disabled={reactStep === reactPatternSteps.length - 1}
                  onClick={() => setReactStep(prev => prev + 1)}
                  className={`neo-button ${reactStep === reactPatternSteps.length - 1 ? 'disabled' : ''}`}
                  style={{ opacity: reactStep === reactPatternSteps.length - 1 ? 0.5 : 1 }}
                >
                  Next <ArrowRight size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content: Memory Systems */}
        {activeTab === "memory" && (
          <motion.div key="memory" variants={variants} initial="hidden" animate="visible" exit="exit" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            <div className="glass-panel block-morphism" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                Short-Term vs. Long-Term Memory
              </h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                LLMs are stateless. To enable continuity in execution, agentic systems maintain two primary classes of memory.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <motion.div whileHover={{ scale: 1.02 }} style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Short-Term Memory</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Maintained completely within the LLM's active context window. Contains the conversational history, immediate thought logs, and recent tool return observations. Lost once the request session ends.
                  </p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Long-Term Memory</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Stored persistently in databases. Typically uses vector embeddings of past research, code bases, or documents. Retrieved dynamically using similarity search when the agent queries.
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="glass-panel block-morphism" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '2rem', color: '#fff', alignSelf: 'flex-start' }}>Vector Similarity Flow</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <motion.div 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ width: '85%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
                >
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Query:</span> "How does self-attention prevent memory decay?"
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight size={16} style={{ transform: 'rotate(90deg)', color: 'var(--color-accent)' }} />
                </motion.div>

                <motion.div 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ width: '85%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
                >
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Vector:</span> [0.12, -0.42, 0.98, ..., 0.04]
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                >
                  <ArrowRight size={16} style={{ transform: 'rotate(90deg)', color: 'var(--color-accent)' }} />
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ width: '85%', padding: '1.25rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--color-accent)', textAlign: 'center', boxShadow: '0 0 20px var(--color-accent-glow)' }}
                >
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.9rem' }}>Vector DB Search</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '0.4rem', opacity: 0.8 }}>Top K Similarity &gt; 0.85 retrieved and injected.</p>
                </motion.div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab Content: Architectures */}
        {activeTab === "architectures" && (
          <motion.div key="architectures" variants={variants} initial="hidden" animate="visible" exit="exit" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            <div className="glass-panel block-morphism" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Orchestration Topologies</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Multi-agent systems structure their communications in different ways depending on task complexity.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>1. Sequential Workflow</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    Linear chain of handoffs where Agent A processes data, hands the output to Agent B. Best for deterministic pipelines.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>2. Hierarchical Router (Supervisor)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    A central "Supervisor" agent delegates sub-tasks to specialist agents (Researcher, Designer, Writer) and routes follow-up requests.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>3. Collaborative Consensus</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    Multiple agents debate, review, and consensus-vote on output. Used in complex coding and reasoning challenges.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel block-morphism" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>Supervisor Architecture</h3>
              
              <div style={{ position: 'relative', height: '260px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--color-accent)', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 10px 20px var(--color-accent-glow)' }}
                  >
                    Supervisor Agent
                  </motion.div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  {[
                    { name: "Researcher", color: "#8b5cf6" },
                    { name: "Code Writer", color: "#10b981" },
                    { name: "Debugger", color: "#f59e0b" }
                  ].map((wk, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.1 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <div style={{ width: '2px', height: '30px', background: `linear-gradient(to bottom, var(--color-accent), ${wk.color}88)`, marginBottom: '0.5rem' }}></div>
                      <div style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: `1px solid ${wk.color}55`, background: 'var(--bg-card)', fontSize: '0.8rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                        {wk.name}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '3rem' }}>
                  Lines represent message buses and state dictionary synchronization.
                </p>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab Content: Our System Workflow */}
        {activeTab === "workflow" && (
          <motion.div key="workflow" variants={variants} initial="hidden" animate="visible" exit="exit">
            
            <div className="glass-panel block-morphism" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>How This Application Works</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '800px' }}>
                This Multi-Agent Research Assistant uses a sequential pipeline of four specialized AI agents — each powered by Google's Gemini 2.0 Flash model — to transform a simple user query into a comprehensive, fully-cited research report. The pipeline follows a strict sequential workflow: each agent receives the output of the previous agent, processes it according to its specialized role, and passes its result forward. Below is a step-by-step breakdown of the entire data flow, from the moment you type your query to the final report appearing on your dashboard.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}
                >
                  {/* Step Number + Connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px', position: 'relative' }}>
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `${step.color}22`,
                        border: `2px solid ${step.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        zIndex: 2,
                        boxShadow: `0 0 15px ${step.color}44`,
                        flexShrink: 0,
                        marginTop: '1.5rem'
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    {idx < workflowSteps.length - 1 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                        style={{
                          width: '2px',
                          background: `linear-gradient(to bottom, ${step.color}88, ${workflowSteps[idx + 1].color}88)`,
                          flex: 1,
                          marginTop: '4px'
                        }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ scale: 1.01, boxShadow: `0 4px 25px ${step.color}22` }}
                    className="glass-panel block-morphism"
                    style={{
                      padding: '1.5rem 2rem',
                      flex: 1,
                      borderLeft: `3px solid ${step.color}`,
                      transition: 'box-shadow 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {step.title}
                      </h4>
                      {idx < workflowSteps.length - 1 && (
                        <ArrowRight size={14} style={{ color: step.color, opacity: 0.7 }} />
                      )}
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                      {step.description}
                    </p>
                    <div style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                      {step.detail}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Data Flow Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-panel block-morphism"
              style={{ padding: '2rem', marginTop: '2rem' }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Data Flow Between Agents</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {[
                  { label: 'User Query', color: '#6366f1' },
                  { label: 'Research Plan', color: '#8b5cf6' },
                  { label: 'Raw Data + Sources', color: '#10b981' },
                  { label: 'Draft Report', color: '#ec4899' },
                  { label: 'Polished Report', color: '#f97316' },
                  { label: 'Dashboard', color: '#06b6d4' }
                ].map((item, idx, arr) => (
                  <React.Fragment key={idx}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}55`,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </motion.div>
                    {idx < arr.length - 1 && (
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.15 }}
                      >
                        <ArrowRight size={14} style={{ color: 'var(--color-accent)', opacity: 0.6 }} />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '1rem', lineHeight: 1.6 }}>
                Each arrow represents a handoff. The output of one agent becomes the input for the next agent in the pipeline. The Researcher agent is the only agent that reaches out to the external internet via Google Search Grounding — all other agents operate purely on the data passed to them.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Tab Content: Search Grounding */}
        {activeTab === "grounding" && (
          <motion.div key="grounding" variants={variants} initial="hidden" animate="visible" exit="exit">
            
            {/* Header explanation */}
            <div className="glass-panel block-morphism" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>What is Google Search Grounding?</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                Google Search Grounding is a capability provided by the Gemini API that allows a language model to perform real-time Google searches as part of its response generation. Instead of relying solely on its training data — which has a fixed knowledge cutoff date and can become outdated — the model actively queries Google's search index to retrieve the latest information from across the web. This means the model's responses are "grounded" in real, verifiable web sources rather than in memorized patterns from its training corpus.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                In our application, the Researcher Agent is configured with the <code style={{ background: 'var(--bg-secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--color-accent)' }}>google_search_retrieval</code> tool in its Gemini API configuration. When the Researcher processes each sub-topic from the Planner's research plan, Gemini automatically searches Google, retrieves relevant snippets and URLs, and weaves that real-time information into its response — complete with source citations.
              </p>
            </div>

            {/* How it works - technical detail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div className="glass-panel block-morphism" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>How It Works Technically</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>1. Tool Declaration</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      When initializing the Gemini model for the Researcher agent, we pass <code style={{ background: 'var(--bg-card)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.8rem', color: 'var(--color-accent)' }}>tools="google_search_retrieval"</code> to the <code style={{ background: 'var(--bg-card)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.8rem', color: 'var(--color-accent)' }}>GenerativeModel</code> constructor. This tells Gemini that it has permission to search Google during generation.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>2. Automatic Search Invocation</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      When the model determines that its training data is insufficient or outdated for a query, it automatically formulates search queries and sends them to Google. The model decides when and what to search — the developer does not need to manually trigger searches. This is a key differentiator from manual RAG pipelines.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>3. Response with Citations</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      The model's response includes the searched information woven naturally into the text. The API response also contains a <code style={{ background: 'var(--bg-card)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.8rem', color: 'var(--color-accent)' }}>grounding_metadata</code> field with the source URLs, page titles, and the specific chunks that were used. Our Researcher extracts these and passes them to the Writer as reference material.
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="glass-panel block-morphism" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Why This Matters</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>🎯 Accuracy</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      By pulling data directly from the web, the model avoids the "hallucination" problem where it fabricates plausible-sounding but factually incorrect information. Every claim can be traced back to a real source URL, making the output verifiable and trustworthy.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>⏱️ Real-Time Freshness</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      Standard LLMs have a knowledge cutoff — they don't know about events that happened after their training data was collected. Google Search Grounding eliminates this limitation entirely. Whether you're researching a news event from yesterday or a paper published last week, the Researcher agent can find and cite it.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>🔗 Verifiable References</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      Each piece of information comes with clickable source links. Your final report doesn't just make claims — it provides the evidence. Readers can click through to the original articles, papers, and websites to verify any statement in the report.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Visual Comparison: Without vs With Grounding */}
            <div className="glass-panel block-morphism" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-main)', textAlign: 'center' }}>
                Visual Comparison: Without vs. With Google Search Grounding
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                
                {/* Without Grounding */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid #ef444455' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef444488' }}></div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ef4444' }}>Without Grounding</h4>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>Prompt:</span> "What is the current market cap of NVIDIA?"
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>Response:</span> "As of my last update, NVIDIA's market cap is approximately $1.2 trillion..."
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>❌</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Data frozen at training cutoff date</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>❌</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>No source links or citations provided</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>❌</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>May confidently state outdated or wrong info</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>❌</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Cannot verify claims against real sources</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* With Grounding */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid #10b98155' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <motion.div
                      animate={{ boxShadow: ['0 0 10px #10b98188', '0 0 20px #10b981aa', '0 0 10px #10b98188'] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}
                    ></motion.div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>With Google Search Grounding</h4>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Prompt:</span> "What is the current market cap of NVIDIA?"
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Response:</span> "As of July 2025, NVIDIA's market cap is $3.4 trillion [source: reuters.com]..."
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>✅</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Live data from Google search results</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>✅</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Clickable source URLs for every claim</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>✅</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Up-to-the-minute accuracy on any topic</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>✅</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Reduced hallucination through evidence grounding</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Grounding Flow Diagram */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '1.25rem', textAlign: 'center' }}>Grounding Data Flow</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Researcher Prompt', bg: '#8b5cf622', border: '#8b5cf655' },
                    { label: 'Gemini API', bg: '#6366f122', border: '#6366f155' },
                    { label: 'Google Search', bg: '#10b98122', border: '#10b98155' },
                    { label: 'Web Results', bg: '#f59e0b22', border: '#f59e0b55' },
                    { label: 'Grounded Response', bg: '#ec489922', border: '#ec489955' },
                    { label: 'Citations Extracted', bg: '#06b6d422', border: '#06b6d455' }
                  ].map((item, idx, arr) => (
                    <React.Fragment key={idx}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                          padding: '0.5rem 0.9rem',
                          borderRadius: '8px',
                          background: item.bg,
                          border: `1px solid ${item.border}`,
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.label}
                      </motion.div>
                      {idx < arr.length - 1 && (
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.12 }}
                        >
                          <ArrowRight size={13} style={{ color: 'var(--color-accent)', opacity: 0.6 }} />
                        </motion.div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '1rem', lineHeight: 1.5 }}>
                  The Gemini API acts as an intermediary — it receives the prompt, decides what to search, queries Google, ingests the results, and returns a response that seamlessly integrates the searched information with proper source attribution.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
