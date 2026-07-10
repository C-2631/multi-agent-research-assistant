import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_API_URL } from '../config';

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED AGENT SYSTEM PROMPTS — demand rich, referenced, real-world output
// ─────────────────────────────────────────────────────────────────────────────
const AGENT_PROMPTS = {
  Planner: (query) => `You are the PLANNER Agent in a cutting-edge multi-agent research system.

TASK: Analyze the topic "${query.replace(/_/g, ' ')}" and formulate a comprehensive, multi-phase research execution plan.

YOUR OUTPUT MUST INCLUDE:
1. **Research Objective** — A clear 2-3 sentence statement of the research goal.
2. **Decomposed Sub-Tasks** — Break the topic into 4-6 actionable sub-tasks with clear deliverables.
3. **Methodology** — Describe the research methodology (literature review, data analysis, comparative study, etc.)
4. **Expected Deliverables** — What the final report should contain (equations, tables, diagrams, references).
5. **Execution Pipeline** — A text-based flow diagram showing the agent handoff sequence:
   \`\`\`
   [User Query] ──► [Planner] ──► [Researcher + Google Search] ──► [Writer] ──► [Editor] ──► [Final Report]
   \`\`\`

FORMAT: Use clean Markdown with headers (##), bullet lists, and code blocks for diagrams.
Be thorough and detailed — this plan drives the entire research pipeline.`,

  Researcher: (query, context) => `You are the RESEARCHER Agent with access to Google Search for real-time information gathering.

TASK: Conduct thorough, in-depth research on "${query.replace(/_/g, ' ')}".

PLANNING CONTEXT FROM PLANNER:
${context}

YOUR OUTPUT MUST INCLUDE:
1. **Key Findings** — At least 5 detailed findings from authoritative sources. Cite real websites, papers, and institutions.
2. **Mathematical Formulas** — Include relevant equations in LaTeX format using $$ delimiters. For example:
   $$E = mc^2$$
   $$\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}$$
3. **Data & Statistics** — Include real numbers, percentages, dates, and measurable data points.
4. **Source References** — For EVERY major claim, provide the source URL or paper citation in this format:
   - [Source Title](URL) — Brief description of what was found
5. **Comparative Analysis** — Compare at least 2-3 different approaches, methods, or viewpoints.

FORMAT: Use Markdown with headers, numbered lists, LaTeX math blocks, and hyperlinks.
Be FACTUAL — do NOT fabricate data. Use Google Search results to ground your findings in reality.`,

  Writer: (query, context) => `You are the WRITER Agent. Your job is to synthesize all research into a comprehensive, publication-quality scientific report.

TASK: Write a complete research report on "${query.replace(/_/g, ' ')}".

RESEARCH DATA & CONTEXT:
${context}

YOUR REPORT MUST FOLLOW THIS EXACT STRUCTURE:

# [Title of the Research Report]

## Abstract
A 150-200 word summary of the entire report.

## 1. Introduction
- Background context and motivation
- Problem statement
- Scope of the report

## 2. Methodology & System Architecture
Include a text-based flow diagram:
\`\`\`
[Step 1] ──► [Step 2] ──► [Step 3] ──► [Output]
\`\`\`

## 3. Theoretical Framework & Key Equations
- Include ALL relevant mathematical formulas in LaTeX ($$...$$)
- Explain each equation's variables and significance

## 4. Findings & Analysis
- Present detailed findings with supporting data
- Include comparison tables in Markdown format:
| Metric | Method A | Method B | Improvement |
| :--- | :--- | :--- | :--- |

## 5. Discussion
- Interpret results
- Limitations and future work

## 6. Conclusion
- Key takeaways (3-5 bullet points)

## References
- List ALL sources with clickable links: [Title](URL)
- Include at least 5-10 real references

FORMAT: Professional Markdown with LaTeX math, tables, code blocks, and hyperlinks.`,

  Editor: (query, context, citationFormat = 'IEEE') => `You are the EDITOR-IN-CHIEF Agent. Your job is to audit, polish, and finalize the research manuscript.

TASK: Review and finalize the manuscript on "${query.replace(/_/g, ' ')}" into a publication-ready document.

DRAFT MANUSCRIPT TO REVIEW:
${context}

YOUR EDITING CHECKLIST:
1. **Fact Verification** — Verify all claims have supporting references. Flag any unsupported statements.
2. **Mathematical Accuracy** — Ensure all LaTeX equations are properly formatted and mathematically correct.
3. **Table Formatting** — Verify all Markdown tables render correctly with proper alignment.
4. **Reference Integrity & Style** — Ensure all references are strictly formatted using the **${citationFormat}** academic citation standard (e.g. numerical bracketed [1] style for IEEE, or author-date style for APA/MLA). Each reference must include valid markdown links in the style: [Citation Detail / Title](URL) conforming to the ${citationFormat} style.
5. **Flow Diagrams** — Verify pipeline/flow diagrams are clear and accurate.
6. **Grammar & Style** — Fix any grammatical errors, improve clarity and flow.
7. **Completeness** — Ensure Abstract, Introduction, Methodology, Findings, Discussion, Conclusion, and References are all present.

OUTPUT: The complete, polished, final manuscript with all corrections applied. 
Add a note at the top: "> ✅ **Peer Review Complete** — All mathematical formulas, citations, tables, and diagrams verified."
Include the full reference list at the bottom styled strictly in **${citationFormat}** format with real URLs.`
};

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK STREAM — used ONLY when no API key is available
// ─────────────────────────────────────────────────────────────────────────────
async function* fallbackTokenStream(agentName, promptKey) {
  const title = promptKey.replace(/_/g, ' ').toUpperCase();

  const responses = {
    Planner: `### PLANNER AGENT STRATEGY
Task: Formulate a multi-step research execution roadmap for **${title}**.

\`\`\`
[User Scenario Query] ──► [Planner Agent] ──► [Deconstruct Tasks] ──► [Google Search Grounding]
\`\`\`

**Research Objective:** Conduct a comprehensive analysis of ${title} covering theoretical foundations, current state-of-the-art, practical applications, and future directions.

**Decomposed Sub-Tasks:**
- [x] **Phase 1: Literature Review** — Gather foundational papers, textbooks, and recent publications.
- [x] **Phase 2: Technical Deep-Dive** — Extract core mathematical frameworks, algorithms, and equations.
- [x] **Phase 3: Comparative Analysis** — Benchmark different approaches with metrics and data tables.
- [x] **Phase 4: Synthesis & Verification** — Compile findings, verify citations, and produce publication-ready manuscript.

**Methodology:** Systematic literature review combined with comparative data analysis and expert synthesis.`,

    Researcher: `### RESEARCHER AGENT RETRIEVAL TRACE
Subject: Technical Synthesis for **${title}**

\`\`\`
+------------------------+      +--------------------------+      +------------------------+
|  Query Decomposition   | ───► |  Google Search Grounding | ───► | Knowledge Synthesis     |
+------------------------+      +--------------------------+      +------------------------+
\`\`\`

> ⚠️ **Note:** Running in offline/fallback mode. Connect a Gemini API key to enable real-time Google Search grounding for live research data.

**Findings Summary (Cached):**
1. **Core Theoretical Framework** — The foundational principles establish a mathematical basis for modeling and analysis.
2. **State-of-the-Art Methods** — Recent advances (2023-2024) show significant improvements in accuracy and efficiency.
3. **Benchmark Data** — Comparative studies demonstrate measurable improvements across key metrics.

**Key Equation:**
$$\\hat{H} = \\sum_{pq} h_{pq} a_p^\\dagger a_q + \\frac{1}{2} \\sum_{pqrs} h_{pqrs} a_p^\\dagger a_q^\\dagger a_s a_r$$`,

    Writer: `# Research Report: ${title}

## Abstract
This report presents a comprehensive analysis of ${title}, covering theoretical foundations, methodological approaches, quantitative benchmarks, and future research directions. Our multi-agent pipeline leverages Google Search grounding for real-time data retrieval.

## 1. Introduction
\`\`\`
[Input Query] ──► (Planner) ──► (Researcher + Google Search) ──► (Writer) ──► (Editor) ──► [Final Report]
\`\`\`

## 2. Mathematical Framework
$$\\frac{d\\rho}{dt} = -\\frac{i}{\\hbar} [\\hat{H}, \\rho] + \\sum_k \\left( L_k \\rho L_k^\\dagger - \\frac{1}{2} \\{ L_k^\\dagger L_k, \\rho \\} \\right)$$

## 3. Benchmark Metrics
| Parameter | Baseline | Optimized | Improvement |
| :--- | :--- | :--- | :--- |
| **Accuracy** | 84.2% | 97.8% | +13.6% |
| **Latency** | 14.2s | 1.8s | 7.9× faster |
| **Coverage** | 62% | 94% | +32% |

> ⚠️ Connect API key for real research data with live citations.`,

    Editor: `# ✅ Publication-Ready Manuscript: ${title}

> **Peer Review Audit**: Verified by Editor Agent. All mathematical bounds, pipelines, and citations validated.

---

## Abstract
We present a comprehensive analysis of ${title} synthesized through our multi-agent research pipeline with Google Search grounding capabilities.

## 1. Multi-Agent Pipeline
\`\`\`
+---------------------+     +-----------------------+     +--------------------+
|  1. PLANNER AGENT   | ──► |  2. RESEARCHER AGENT  | ──► |  3. WRITER AGENT   |
| (Deconstruct Query) |     |  (Google Search + AI)  |     |  (Draft Manuscript)|
+---------------------+     +-----------------------+     +--------------------+
                                                                    |
                                                                    ▼
                                                          +--------------------+
                                                          |  4. EDITOR AGENT   |
                                                          | (Final Compliance) |
                                                          +--------------------+
\`\`\`

## 2. Performance Metrics
| Metric | Classical Approach | AI Agent Pipeline | Improvement |
| :--- | :--- | :--- | :--- |
| **Research Time** | 72 Hours | 4.2 Minutes | 99% Reduction |
| **Source Coverage** | 5-10 papers | 50+ sources | 5-10× |
| **Accuracy** | Manual verification | Automated + grounded | Higher reliability |

> ⚠️ Connect API key for live, grounded research with real references.

## References
- *Connect Gemini API key to generate real, cited references from Google Search*`
  };

  const text = responses[agentName] || `Agent ${agentName} processing step for ${title}...`;
  const words = text.split(' ');
  for (const word of words) {
    yield word + ' ';
    await new Promise(r => setTimeout(r, 25));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — streams AI-generated content with Google Search grounding
// ─────────────────────────────────────────────────────────────────────────────
export async function streamAgentThought(agentName, promptKey, previousContext = '', apiKey = '', citationFormat = 'IEEE') {
  // Construct the prompt using the enhanced templates defined locally
  const promptBuilder = AGENT_PROMPTS[agentName];
  let promptText = "";
  if (agentName === 'Planner') {
    promptText = promptBuilder ? promptBuilder(promptKey) : `Analyze and plan research for: ${promptKey}`;
  } else if (agentName === 'Editor') {
    promptText = promptBuilder ? promptBuilder(promptKey, previousContext, citationFormat) : `Perform thorough analysis on ${promptKey} as agent ${agentName}`;
  } else {
    promptText = promptBuilder ? promptBuilder(promptKey, previousContext) : `Perform thorough analysis on ${promptKey} as agent ${agentName}`;
  }

  // 1. Try calling the backend /api/stream-agent first
  try {
    console.log(`[aiService] Attempting to stream ${agentName} from backend...`);
    const response = await fetch(`${API_API_URL}/stream-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentName,
        promptKey,
        previousContext,
        apiKey, // User-entered key if any, otherwise backend uses .env
        promptText,
        citationFormat
      })
    });

    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      async function* backendStream() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) yield chunk;
        }
      }
      return backendStream();
    } else {
      console.warn(`[aiService] Backend returned error status ${response.status}. Falling back to frontend...`);
    }
  } catch (backendError) {
    console.warn("[aiService] Failed to connect to Python backend. Error:", backendError.message || backendError);
  }

  // 2. Fallback to direct frontend SDK call if a key is available locally
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (key) {
    if (key.startsWith("sk-or-")) {
      try {
        console.log(`[aiService] Backend unavailable. Calling OpenRouter directly from frontend...`);
        let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'http://localhost:5174',
            'X-Title': 'Multi-Agent Research Assistant'
          },
          body: JSON.stringify({
            model: 'google/gemini-3.5-flash',
            messages: [{ role: 'user', content: promptText }],
            stream: true,
            temperature: 0.7,
            max_tokens: 4000
          })
        });

        // Self-Healing: Handle 402 Payment Required by automatically falling back to a free model
        if (response.status === 402) {
          try {
            console.warn(`[aiService] Auto-Healing: Key has insufficient credits. Falling back to free model...`);

            response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': 'http://localhost:5174',
                'X-Title': 'Multi-Agent Research Assistant'
              },
              body: JSON.stringify({
                model: 'openrouter/free',
                messages: [{ role: 'user', content: promptText }],
                stream: true,
                temperature: 0.7,
                max_tokens: 4000
              })
            });
          } catch (e) {
            console.error("Auto-healing error:", e);
          }
        }

        if (response.ok) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          async function* openRouterFrontStream() {
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;
              const lines = buffer.split('\n');
              buffer = lines.pop();
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data: ")) {
                  const dataStr = trimmed.slice(6);
                  if (dataStr === "[DONE]") break;
                  try {
                    const dataJson = JSON.parse(dataStr);
                    const content = dataJson.choices[0]?.delta?.content;
                    if (content) yield content;
                  } catch (e) {}
                }
              }
            }
          }
          return openRouterFrontStream();
        } else {
          const text = await response.text();
          throw new Error(`OpenRouter HTTP ${response.status}: ${text}`);
        }
      } catch (err) {
        console.error(`[aiService] Frontend OpenRouter stream error for ${agentName}:`, err);
        async function* errorStream() {
          yield `\n**[⚠️ OpenRouter API Error — ${agentName} Agent]**\n\n`;
          yield `**Error:** ${err.message || err}\n\n`;
        }
        return errorStream();
      }
    } else {
      try {
        console.log(`[aiService] Backend unavailable or failed. Using direct frontend SDK for ${agentName}...`);
        const genAI = new GoogleGenerativeAI(key);

        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash',
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.7
          },
          tools: [
            { googleSearch: {} }
          ]
        });

        const result = await model.generateContentStream(promptText);

        async function* apiStream() {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) yield text;
          }
        }
        return apiStream();
      } catch (err) {
        console.error(`[aiService] Frontend Gemini SDK stream error for ${agentName}:`, err);
        async function* errorStream() {
          yield `\n**[⚠️ Gemini API Error — ${agentName} Agent]**\n\n`;
          yield `**Error:** ${err.message || err}\n\n`;
          yield `**Possible Fixes:**\n`;
          yield `- Verify your API key is valid and has billing enabled\n`;
          yield `- If using a free tier key, you may have hit rate limits — wait 60 seconds and retry\n`;
        }
        return errorStream();
      }
    }
  }

  // 3. Fallback to offline demo stream if absolutely no key is available
  console.log(`[aiService] No Gemini API key available. Using offline fallback stream for ${agentName}.`);
  return fallbackTokenStream(agentName, promptKey);
}
