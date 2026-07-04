export const MOCK_SIMULATION_STEPS = {
  "quantum_medicine": [
    {
      agent: "Planner",
      status: "thinking",
      message: "Analyzing research request: 'Quantum Computing Applications in Medicine'",
      log: "Thought: To research this thoroughly, I need to break this down into three key areas:\n1. Quantum simulation of molecular dynamics for drug discovery.\n2. Quantum machine learning in diagnostic imaging.\n3. Hardware requirements & timeline for clinical adoption.\nCreating task list...",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "pending" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "pending" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "pending" }
      ]
    },
    {
      agent: "Planner",
      status: "done",
      message: "Task list created. Delegating Task 1 & 2 to Researcher.",
      log: "Action: delegate_tasks(agent='Researcher', tasks=[1, 2])\nObservation: Researcher agent has accepted the tasks.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "active" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "active" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "pending" }
      ]
    },
    {
      agent: "Researcher",
      status: "thinking",
      message: "Querying biomedical databases for molecular simulations and VQE algorithms",
      log: "Thought: I should look up Variational Quantum Eigensolver (VQE) applications on quantum hardware for simulating caffeine and small pharmaceutical molecules.\nAction: search_pubmed(query='VQE drug discovery quantum chemistry')\nResult: Found 12 papers. Key concept: VQE helps find the ground state energy of molecular Hamiltonians, bypassing exponential classical complexity.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "completed" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "active" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "pending" }
      ]
    },
    {
      agent: "Researcher",
      status: "thinking",
      message: "Researching quantum neural networks (QNN) and image analysis",
      log: "Thought: Now investigating diagnostic imaging. Quantum Convolutional Neural Networks (QCNN) can process high-dimensional medical image features.\nAction: search_arxiv(query='Quantum Convolutional Neural Network medical imaging')\nResult: Highlighted paper by Sen et al. (2024) shows QCNN achieves 91% accuracy on mammogram classification using only 8 qubits with amplitude encoding.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "completed" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "completed" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "active" }
      ]
    },
    {
      agent: "Researcher",
      status: "done",
      message: "Collected all raw data. Returning facts to Planner.",
      log: "Observation: Retrieved VQE and QCNN papers. For Task 3: Noisy Intermediate-Scale Quantum (NISQ) systems limit current qubits to <1000 with high error rates; error correction is required for full molecular simulation. Sending data payload to Planner.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "completed" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "completed" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "completed" }
      ]
    },
    {
      agent: "Writer",
      status: "thinking",
      message: "Drafting report outline and integrating research notes",
      log: "Thought: I need to structure the report into an Introduction, Molecular Simulation section, Diagnostics section, and Hardware Challenges. Creating drafts and formatting citations.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "completed" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "completed" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "completed" }
      ]
    },
    {
      agent: "Writer",
      status: "done",
      message: "Initial draft generated. Forwarding to Editor for review.",
      log: "Action: compile_draft(sections=['Introduction', 'Molecular Simulation', 'QML Diagnostics', 'Future Hurdles'])\nDraft size: 840 words. Sent to Editor.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "completed" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "completed" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "completed" }
      ]
    },
    {
      agent: "Editor",
      status: "thinking",
      message: "Reviewing text accuracy, flow, and formatting citation standards",
      log: "Thought: The molecular simulation section should emphasize that classical supercomputers struggle with exact electron correlation. Added detail on NISQ limitations. Formatting LaTeX equations for ground state energy.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "completed" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "completed" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "completed" }
      ]
    },
    {
      agent: "Editor",
      status: "done",
      message: "Review complete. Report approved and exported.",
      log: "Finalizing markdown, creating table of contents, and appending references. Compilation SUCCESS.",
      tasks: [
        { id: 1, name: "Investigate molecular simulation for drug design", status: "completed" },
        { id: 2, name: "Analyze quantum neural networks for MRI/CT classification", status: "completed" },
        { id: 3, name: "Determine timeline and hardware bottlenecks", status: "completed" }
      ]
    }
  ],
  "explain_transformers": [
    {
      agent: "Planner",
      status: "thinking",
      message: "Analyzing request: 'Explain Transformers from Scratch'",
      log: "Thought: Explaining transformers requires a clear conceptual layout:\n1. Self-Attention mechanism (Q, K, V matrices).\n2. Multi-Head Attention and Positional Encoding.\n3. The Encoder-Decoder architecture.\nCreating task list...",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "pending" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "pending" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "pending" }
      ]
    },
    {
      agent: "Planner",
      status: "done",
      message: "Task list created. Sending Task 1 & 2 to Researcher.",
      log: "Action: delegate_tasks(agent='Researcher', tasks=[1, 2])",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "active" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "active" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "pending" }
      ]
    },
    {
      agent: "Researcher",
      status: "thinking",
      message: "Retrieving 'Attention Is All You Need' paper and math formula details",
      log: "Thought: I must fetch the exact formula for Scaled Dot-Product Attention: Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V.\nAction: retrieve_arxiv(id='1706.03762')\nResult: Extracted the scaled dot product equation and the explanation for why scaling by sqrt(d_k) prevents softmax from saturating.",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "completed" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "active" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "pending" }
      ]
    },
    {
      agent: "Researcher",
      status: "thinking",
      message: "Analyzing Positional Encoding sinusoids",
      log: "Thought: Positional encoding adds sequence order details because attention is permutation-invariant. Finding the sine and cosine formulas.\nObservation: Sinusoid frequencies allow the model to learn to attend by relative positions.",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "completed" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "completed" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "active" }
      ]
    },
    {
      agent: "Researcher",
      status: "done",
      message: "Research complete. Summarized mathematics sent to Writer.",
      log: "Observation: Synthesized positional encoding, multi-head attention projection matrices, and decoder's masked self-attention details.",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "completed" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "completed" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "completed" }
      ]
    },
    {
      agent: "Writer",
      status: "thinking",
      message: "Writing detailed mathematical explanations and drafting layout",
      log: "Thought: I will structure the explanation step-by-step with code/math definitions. Explaining Q, K, V vectors using a real-world analogy (database lookup).",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "completed" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "completed" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "completed" }
      ]
    },
    {
      agent: "Writer",
      status: "done",
      message: "Draft written with LaTeX formatting. Sending to Editor.",
      log: "Action: compile_draft(). Status: Completed. Content is ready for proofreading.",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "completed" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "completed" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "completed" }
      ]
    },
    {
      agent: "Editor",
      status: "thinking",
      message: "Polishing wording and adding code snippet for self-attention",
      log: "Thought: Let's add a clean PyTorch snippet of scaled dot-product attention to make the theory extremely practical for web-developers.",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "completed" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "completed" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "completed" }
      ]
    },
    {
      agent: "Editor",
      status: "done",
      message: "Refining math equations. Documentation complete.",
      log: "Formatted Python code blocks and added cross-links. Output complete.",
      tasks: [
        { id: 1, name: "Detail Self-Attention mathematics", status: "completed" },
        { id: 2, name: "Explain Multi-Head & Positional Encoding", status: "completed" },
        { id: 3, name: "Draw/Explain full Encoder-Decoder workflow", status: "completed" }
      ]
    }
  ]
};

export const FINAL_REPORTS = {
  "quantum_medicine": `# Quantum Computing in Medicine: Drug Discovery & Diagnostics\n\nQuantum computing offers a paradigm shift in medical sciences by overcoming the computational boundaries of classical silicon hardware.\n\n## 1. Molecular Simulation in Drug Discovery\nTraditional drug discovery is constrained by the difficulty of simulating molecular quantum states. To model a molecule with N electrons accurately, classical hardware requires memory that scales exponentially (2^N).\n\nQuantum systems use **superposition** and **entanglement** to model molecular orbitals directly.\n- **VQE (Variational Quantum Eigensolver)**: A hybrid quantum-classical algorithm used to find the ground state energy of a molecular Hamiltonian.\n\n## 2. Quantum Machine Learning (QML) in Diagnostics\nModern MRI and CT scans produce gigabytes of high-dimensional raw pixel data. Quantum Convolutional Neural Networks (QCNNs) utilize **amplitude encoding** to compress 2^n classical data points into n qubits.\n\n## 3. Current Hardware Hurdles (NISQ Era)\nWe currently reside in the **Noisy Intermediate-Scale Quantum (NISQ)** era.\n- **Qubit Count**: Current devices have 50-1000 physical qubits.\n- **Error Rates**: Thermal noise and decoherence destroy quantum states in milliseconds, requiring Quantum Error Correction (QEC).\n\n---\n### References\n- *Cao, Y. et al. (2019). Quantum Chemistry in the Age of Quantum Computing. Chemical Reviews.*\n- *Sen, S. et al. (2024). Breast Cancer Diagnostics on Quantum Neural Grids.*`,

  "explain_transformers": `# Transformers Explained from First Principles\n\nThe Transformer architecture, introduced in the paper *"Attention Is All You Need"* (2017), replaced recurrent architectures (LSTMs) with a highly parallelizable **Self-Attention** mechanism.\n\n## 1. Scaled Dot-Product Self-Attention\nSelf-attention calculates the relationships between words in a sequence. Each input token is projected into three vector spaces: **Query (Q)**, **Key (K)**, and **Value (V)**.\n\n### Simple PyTorch Implementation:\n\`\`\`python\nimport torch\nimport torch.nn.functional as F\n\ndef self_attention(Q, K, V):\n    d_k = Q.size(-1)\n    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)\n    attention_weights = F.softmax(scores, dim=-1)\n    return torch.matmul(attention_weights, V), attention_weights\n\`\`\`\n\n## 2. Multi-Head Attention\nInstead of performing a single attention operation, **Multi-Head Attention** splits Q, K, and V into multiple sub-vectors, allowing the model to attend to information from different representation subspaces simultaneously.\n\n## 3. Positional Encoding\nSince transformers do not use RNN recurrent loops or CNN convolutions, they are order-invariant. We add a **Positional Encoding** vector to the input embeddings using sine and cosine waves.\n\n---\n### References\n- *Vaswani, A. et al. (2017). Attention Is All You Need. NeurIPS 2017.*`
};
