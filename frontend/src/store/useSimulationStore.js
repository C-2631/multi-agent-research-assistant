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
  isSimulating: false,
  simSpeed: 1000,
  apiKey: "",
  logs: [],
  dynamicReport: "",
  totalTokens: 0,
  archive: loadArchiveFromStorage(),
  tasks: [
    { id: 1, name: "Initialize planner and define objective", status: "pending" },
    { id: 2, name: "Retrieve literature and facts", status: "pending" },
    { id: 3, name: "Compile and audit final report", status: "pending" }
  ],
  activeAgent: null,

  setApiKey: (key) => set({ apiKey: key }),
  setPromptKey: (key) => set({ promptKey: key, customQuery: "" }),
  setCustomQuery: (query) => set({ customQuery: query }),
  setSimSpeed: (speed) => set({ simSpeed: speed }),
  
  startSimulation: () => {
    const { currentStepIndex, getSteps } = get();
    const steps = getSteps();
    
    if (currentStepIndex === steps.length - 1) {
      get().resetSimulation();
      setTimeout(() => set({ isSimulating: true }), 100);
    } else {
      set({ isSimulating: true });
    }
  },

  pauseSimulation: () => set({ isSimulating: false }),

  resetSimulation: () => set({
    isSimulating: false,
    currentStepIndex: -1,
    logs: [],
    dynamicReport: "",
    totalTokens: 0,
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

    // Initialize log entry for streaming
    set({
      currentStepIndex: nextIndex,
      activeAgent: nextStep.agent,
      tasks: nextStep.tasks,
      logs: [...logs, {
        id: logId,
        agent: nextStep.agent,
        status: nextStep.status,
        message: nextStep.message,
        log: ""
      }]
    });

    // Stream real AI thoughts/logs with accumulated context
    try {
      const previousContext = logs.map(l => `[Agent ${l.agent}]: ${l.log}`).join('\n\n');
      const tokenStream = await streamAgentThought(nextStep.agent, activeQuery, previousContext, apiKey);
      let streamedLog = "";
      
      for await (const chunk of tokenStream) {
        if (!get().isSimulating && get().currentStepIndex !== nextIndex) break;
        
        streamedLog += chunk;
        const chunkTokens = chunk.trim().split(/\s+/).filter(Boolean).length;
        
        set((state) => ({
          totalTokens: state.totalTokens + chunkTokens,
          logs: state.logs.map(l => l.id === logId ? { ...l, log: streamedLog } : l),
          ...(nextStep.agent === "Editor" || nextStep.agent === "Writer" ? { dynamicReport: streamedLog } : {})
        }));
      }
    } catch (err) {
      console.error("Streaming error in store:", err);
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
    const { dynamicReport, promptKey, customQuery } = get();
    if (customQuery) {
      return dynamicReport || "Awaiting custom research synthesis...";
    }
    return dynamicReport || FINAL_REPORTS[promptKey] || "Processing custom paper draft...";
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
