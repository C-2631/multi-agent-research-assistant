import { create } from 'zustand';
import { MOCK_SIMULATION_STEPS, FINAL_REPORTS } from '../data/mockData';
import { streamAgentThought } from '../services/aiService';
import { useAuthStore } from './useAuthStore';

const loadArchiveFromStorage = () => {
  try {
    const saved = localStorage.getItem('agentic_research_archive');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const useSimulationStore = create((set, get) => ({
  promptKey: "quantum_medicine",
  customQuery: "",
  currentStepIndex: -1,
  lastCompletedStepIndex: -1,
  isSimulating: false,
  simSpeed: 1000,
  apiKey: "",
  citationFormat: "IEEE",
  isHitlActive: false,
  hitlWaiting: false,
  uploadedFileName: "",
  uploadedContext: "",
  logs: [],
  dynamicReport: "",
  totalTokens: 0,
  totalCost: 0.0,
  agentLatencies: {},
  lastSavedRecordId: null,
  archive: loadArchiveFromStorage(),
  tasks: [
    { id: 1, name: "Initialize planner and define objective", status: "pending" },
    { id: 2, name: "Retrieve literature and facts", status: "pending" },
    { id: 3, name: "Compile and audit final report", status: "pending" }
  ],
  activeAgent: null,

  setApiKey: (key) => set({ apiKey: key }),
  setCitationFormat: (format) => set({ citationFormat: format }),
  setHitlActive: (active) => set({ isHitlActive: active }),
  setUploadedDocument: (name, text) => set({ uploadedFileName: name, uploadedContext: text }),
  submitHitlFeedback: (feedback) => {
    const { logs } = get();
    if (feedback.trim()) {
      // Append user revision instructions to the Planner's log context
      const plannerLog = logs.find(l => l.agent === "Planner");
      if (plannerLog) {
        plannerLog.log += `\n\n[USER REVISION FEEDBACK]:\n${feedback}`;
        set({ logs: [...logs] });
      }
    }
    set({ hitlWaiting: false });
    get().startSimulation();
  },
  setPromptKey: (key) => {
    set({ promptKey: key, customQuery: "" });
    get().resetSimulation();
  },
  setCustomQuery: (query) => {
    set({ customQuery: query });
    get().resetSimulation();
  },
  setSimSpeed: (speed) => set({ simSpeed: speed }),
  
  startSimulation: async () => {
    const { currentStepIndex, getSteps, lastCompletedStepIndex } = get();
    const steps = getSteps();
    
    if (currentStepIndex === steps.length - 1) {
      get().resetSimulation();
    } else {
      // Re-sync currentStepIndex to the last completed step index to avoid skipping paused steps
      set({ currentStepIndex: lastCompletedStepIndex });
    }
    
    set({ isSimulating: true });
    
    // Sequential async loop to prevent step collision and context cutoff
    while (get().isSimulating && get().currentStepIndex < steps.length - 1) {
      await get().advanceStep();
      
      // Human-in-the-Loop Interruption: pause after Planner (step 0) completes successfully
      if (get().currentStepIndex === 0 && get().isHitlActive) {
        set({ hitlWaiting: true, isSimulating: false });
        break;
      }
      
      // Delay before the next step starts
      if (get().isSimulating && get().currentStepIndex < steps.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, get().simSpeed));
      }
    }
  },

  pauseSimulation: () => set({ isSimulating: false }),

  resetSimulation: () => set({
    isSimulating: false,
    currentStepIndex: -1,
    lastCompletedStepIndex: -1,
    hitlWaiting: false,
    logs: [],
    dynamicReport: "",
    totalTokens: 0,
    totalCost: 0.0,
    agentLatencies: {},
    lastSavedRecordId: null,
    tasks: [
      { id: 1, name: "Initialize planner and define objective", status: "pending" },
      { id: 2, name: "Retrieve literature and facts", status: "pending" },
      { id: 3, name: "Compile and audit final report", status: "pending" }
    ],
    activeAgent: null,
  }),

  advanceStep: async () => {
    const { currentStepIndex, promptKey, customQuery, logs, apiKey, getSteps } = get();
    const steps = getSteps();
    const activeQuery = customQuery || promptKey;
    
    if (currentStepIndex >= steps.length - 1) {
      set({ isSimulating: false, activeAgent: null });
      return;
    }

    const nextIndex = currentStepIndex + 1;
    const nextStep = steps[nextIndex];
    const logId = Date.now();

    // 1. Calculate input token estimate & input cost ($0.0015/1k tokens)
    const { uploadedContext } = get();
    let previousContext = logs.map(l => `[Agent ${l.agent}]: ${l.log}`).join('\n\n');
    if (uploadedContext) {
      previousContext += `\n\n[UPLOADED REFERENCE DOCUMENT GROUND-TRUTH]:\n${uploadedContext}`;
    }
    const inputTokenEstimate = Math.ceil((activeQuery.length + previousContext.length) / 4);
    const stepInputCost = (inputTokenEstimate / 1000) * 0.0015;

    // Initialize log entry for streaming
    set((state) => ({
      currentStepIndex: nextIndex,
      activeAgent: nextStep.agent,
      tasks: nextStep.tasks,
      totalTokens: state.totalTokens + inputTokenEstimate,
      totalCost: state.totalCost + stepInputCost,
      logs: [...state.logs, {
        id: logId,
        agent: nextStep.agent,
        status: nextStep.status,
        message: nextStep.message,
        log: ""
      }]
    }));

    const startTime = performance.now();

    // Stream real AI thoughts/logs with accumulated context
    try {
      const { citationFormat } = get();
      const tokenStream = await streamAgentThought(nextStep.agent, activeQuery, previousContext, apiKey, citationFormat);
      let streamedLog = "";
      
      for await (const chunk of tokenStream) {
        if (!get().isSimulating) break;
        
        streamedLog += chunk;
        const chunkTokens = chunk.trim().split(/\s+/).filter(Boolean).length;
        const chunkCost = (chunkTokens / 1000) * 0.0020; // $0.0020/1k tokens for output
        const elapsed = parseFloat(((performance.now() - startTime) / 1000).toFixed(1));
        
        set((state) => ({
          totalTokens: state.totalTokens + chunkTokens,
          totalCost: state.totalCost + chunkCost,
          agentLatencies: {
            ...state.agentLatencies,
            [nextStep.agent]: elapsed
          },
          logs: state.logs.map(l => l.id === logId ? { ...l, log: streamedLog } : l),
          ...(nextStep.agent === "Editor" || nextStep.agent === "Writer" ? { dynamicReport: streamedLog } : {})
        }));
      }
    } catch (err) {
      console.error("Streaming error in store:", err);
    }

    // Verify if simulation is still active (not paused mid-step)
    if (get().isSimulating) {
      set({ lastCompletedStepIndex: nextIndex });
    } else {
      // If paused, remove the incomplete/empty log from logs to keep the display clean
      set((state) => ({
        logs: state.logs.filter(l => l.id !== logId)
      }));
      return;
    }

    // Complete step and archive paper on last step
    if (nextIndex === steps.length - 1) {
      const finalPaper = get().getReport();
      const newArchiveItem = {
        id: Date.now(),
        title: activeQuery.replace(/_/g, ' ').toUpperCase(),
        date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        report: finalPaper
      };
      
      // Also save to backend database if user is authenticated and get the database ID
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const res = await fetch('http://localhost:5000/api/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: newArchiveItem.title,
              query: activeQuery,
              report: finalPaper,
              tokens_used: get().totalTokens
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.record && data.record.id) {
              newArchiveItem.id = data.record.id;
              set({ lastSavedRecordId: data.record.id });
            }
          }
        }
      } catch (e) {
        console.error("Failed to save research to database:", e);
      }

      const updatedArchive = [newArchiveItem, ...get().archive];

      // Save to localStorage (always, as backup)
      try {
        localStorage.setItem('agentic_research_archive', JSON.stringify(updatedArchive));
      } catch (e) { /* ignore storage quota */ }

      set({ 
        isSimulating: false, 
        activeAgent: null,
        archive: updatedArchive
      });
    }
  },

  deleteArchiveItem: async (id) => {
    const { archive } = get();
    const updatedArchive = archive.filter(item => item.id !== id);
    set({ archive: updatedArchive });
    try {
      localStorage.setItem('agentic_research_archive', JSON.stringify(updatedArchive));
    } catch (e) {}

    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await useAuthStore.getState().deleteHistoryItem(id);
      }
    } catch (e) {
      console.error("Failed to delete archive item:", e);
    }
  },

  syncHistory: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const backendHistory = await useAuthStore.getState().fetchHistory();
        if (backendHistory && backendHistory.history) {
          const mapped = backendHistory.history.map(item => {
            const rawDate = item.created_at;
            // SQLite defaults to UTC. Force parse as UTC if it doesn't contain timezone indicators
            const utcDateString = (rawDate.includes('T') || rawDate.includes('Z')) 
              ? rawDate 
              : rawDate.replace(' ', 'T') + 'Z';
            return {
              id: item.id,
              title: item.title,
              date: new Date(utcDateString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
              report: item.report
            };
          });
          set({ archive: mapped });
          localStorage.setItem('agentic_research_archive', JSON.stringify(mapped));
        }
      }
    } catch (e) {
      console.error("Failed to sync history:", e);
    }
  },

  getReport: () => {
    const { dynamicReport, promptKey, customQuery, citationFormat } = get();
    if (customQuery) {
      return dynamicReport || "Awaiting custom research synthesis...";
    }
    const baseReport = dynamicReport || FINAL_REPORTS[promptKey] || "Processing custom paper draft...";
    
    // Inject correct preset citation style if available
    const presetCitations = PRESET_REFERENCES[promptKey]?.[citationFormat];
    if (presetCitations && (baseReport.includes("## References") || baseReport.includes("### References"))) {
      const parts = baseReport.split(/###? References/);
      return parts[0] + presetCitations;
    }
    return baseReport;
  },
  
  getSteps: () => {
    const { customQuery, promptKey } = get();
    if (customQuery) {
      return [
        { agent: "Planner", status: "planning", message: `Formulating dynamic plan for: "${customQuery}"`, tasks: [{ id: 1, name: `Plan objectives for ${customQuery}`, status: "active" }, { id: 2, name: "Fetch relevant facts", status: "pending" }, { id: 3, name: "Synthesize report", status: "pending" }] },
        { agent: "Researcher", status: "retrieving", message: `Retrieving formulas & parameters for "${customQuery}"`, tasks: [{ id: 1, name: `Plan objectives for ${customQuery}`, status: "completed" }, { id: 2, name: "Fetch relevant facts", status: "active" }, { id: 3, name: "Synthesize report", status: "pending" }] },
        { agent: "Writer", status: "drafting", message: `Drafting paper manuscript on "${customQuery}"`, tasks: [{ id: 1, name: `Plan objectives for ${customQuery}`, status: "completed" }, { id: 2, name: "Fetch relevant facts", status: "completed" }, { id: 3, name: "Synthesize report", status: "active" }] },
        { agent: "Editor", status: "auditing", message: `Auditing LaTeX math & markdown compliance`, tasks: [{ id: 1, name: `Plan objectives for ${customQuery}`, status: "completed" }, { id: 2, name: "Fetch relevant facts", status: "completed" }, { id: 3, name: "Synthesize report", status: "completed" }] }
      ];
    }
    return MOCK_SIMULATION_STEPS[promptKey];
  }
}));

export default useSimulationStore;

const PRESET_REFERENCES = {
  "quantum_medicine": {
    "IEEE": `## References
[1] Y. Cao, et al., "Quantum Chemistry in the Age of Quantum Computing," *Chemical Reviews*, 2019. [Source](https://doi.org/10.1021/acs.chemrev.8b00803)
[2] S. Sen, et al., "Breast Cancer Diagnostics on Quantum Neural Grids," *IEEE Transactions on Quantum Engineering*, 2024. [Source](https://doi.org/10.1109/TQE.2024.1234567)`,
    "APA": `## References
Cao, Y., et al. (2019). Quantum Chemistry in the Age of Quantum Computing. *Chemical Reviews*. https://doi.org/10.1021/acs.chemrev.8b00803
Sen, S., et al. (2024). Breast Cancer Diagnostics on Quantum Neural Grids. *IEEE Transactions on Quantum Engineering*. https://doi.org/10.1109/TQE.2024.1234567`,
    "MLA": `## References
Cao, Y., et al. "Quantum Chemistry in the Age of Quantum Computing." *Chemical Reviews*, 2019, https://doi.org/10.1021/acs.chemrev.8b00803.
Sen, S., et al. "Breast Cancer Diagnostics on Quantum Neural Grids." *IEEE Transactions on Quantum Engineering*, 2024, https://doi.org/10.1109/TQE.2024.1234567.`
  },
  "explain_transformers": {
    "IEEE": `## References
[1] A. Vaswani, et al., "Attention Is All You Need," in *NeurIPS*, 2017. [Source](https://arxiv.org/abs/1706.03762)`,
    "APA": `## References
Vaswani, A., et al. (2017). Attention Is All You Need. *NeurIPS 2017*. https://arxiv.org/abs/1706.03762`,
    "MLA": `## References
Vaswani, A., et al. "Attention Is All You Need." *NeurIPS*, 2017, https://arxiv.org/abs/1706.03762.`
  }
};
