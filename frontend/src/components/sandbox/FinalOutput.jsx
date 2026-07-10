import React, { useState } from 'react';
import { FileText, Cpu, Copy, Download, Check, Share2 } from 'lucide-react';
import useSimulationStore from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export default function FinalOutput() {
  const { currentStepIndex, getSteps, getReport, promptKey, citationFormat, setCitationFormat, lastSavedRecordId } = useSimulationStore();
  const [copied, setCopied] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sharedUrl, setSharedUrl] = useState("");
  const steps = getSteps();
  const isComplete = currentStepIndex === steps.length - 1;
  const report = getReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateStyledHtmlTemplate = (title, bodyHtml, format) => {
    const formattedTitle = title.replace(/_/g, ' ').toUpperCase();
    
    let styleTag = '';
    let bodyHeader = '';
    
    if (format === 'IEEE') {
      styleTag = `
        @page {
          size: letter;
          margin: 0.5in;
        }
        body {
          font-family: "Times New Roman", Times, serif;
          margin: 0;
          line-height: 1.5;
          color: #000;
          background: #fff;
          font-size: 10pt;
        }
        .header-section {
          text-align: center;
          margin-bottom: 20pt;
        }
        h1 {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10pt;
          text-align: center;
        }
        .author-info {
          font-size: 10pt;
          font-style: italic;
          margin-bottom: 15pt;
          text-align: center;
        }
        .columns-container {
          column-count: 2;
          column-gap: 0.3in;
          text-align: justify;
        }
        h2 {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 14pt;
          margin-bottom: 6pt;
          border-bottom: 1px solid #000;
          padding-bottom: 2pt;
        }
        h3 {
          font-size: 10pt;
          font-weight: bold;
          margin-top: 10pt;
          margin-bottom: 4pt;
        }
        p {
          margin-top: 0;
          margin-bottom: 8pt;
          text-indent: 0.25in;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12pt 0;
          font-size: 8.5pt;
        }
        th, td {
          border: 1px solid #000;
          padding: 4pt;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        pre, code {
          font-family: Courier, monospace;
          font-size: 8.5pt;
        }
        pre {
          display: block;
          padding: 8pt;
          margin: 8pt 0;
          border: 1px dashed #000;
          white-space: pre-wrap;
        }
        blockquote {
          margin: 8pt 16pt;
          font-style: italic;
          border-left: 2px solid #000;
          padding-left: 8pt;
        }
      `;
      bodyHeader = `
        <div class="header-section">
          <h1>${formattedTitle}</h1>
          <div class="author-info">Agentic Lab Multi-Agent System Publication</div>
        </div>
        <div class="columns-container">
          ${bodyHtml}
        </div>
      `;
    } else if (format === 'APA') {
      styleTag = `
        @page {
          size: letter;
          margin: 1in;
        }
        body {
          font-family: "Times New Roman", Times, serif;
          margin: 1in;
          line-height: 2.0;
          color: #000;
          background: #fff;
          font-size: 12pt;
          text-align: left;
        }
        .header-section {
          text-align: center;
          margin-bottom: 30pt;
        }
        h1 {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 12pt;
          text-align: center;
        }
        .author-info {
          font-size: 12pt;
          margin-bottom: 24pt;
          text-align: center;
        }
        h2 {
          font-size: 14pt;
          font-weight: bold;
          margin-top: 24pt;
          margin-bottom: 12pt;
          text-align: center;
        }
        h3 {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 18pt;
          margin-bottom: 8pt;
          text-align: left;
        }
        p {
          margin-bottom: 18pt;
          text-indent: 0.5in;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 24pt 0;
          font-size: 11pt;
        }
        th, td {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 8pt;
          text-align: left;
        }
        th {
          font-weight: bold;
        }
        pre, code {
          font-family: Courier, monospace;
          font-size: 10pt;
        }
        pre {
          display: block;
          padding: 12pt;
          margin: 12pt 0;
          border: 1px solid #000;
          white-space: pre-wrap;
        }
        blockquote {
          margin: 18pt 0 18pt 0.5in;
          font-style: italic;
          line-height: 2.0;
        }
      `;
      bodyHeader = `
        <div class="header-section">
          <h1>${formattedTitle}</h1>
          <div class="author-info">
            Author: Agentic Lab Multi-Agent System<br>
            Department of Autonomous Research<br>
            Date: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div class="apa-content-container">
          ${bodyHtml}
        </div>
      `;
    } else { // MLA Format
      styleTag = `
        @page {
          size: letter;
          margin: 1in;
        }
        body {
          font-family: "Times New Roman", Times, serif;
          margin: 1in;
          line-height: 2.0;
          color: #000;
          background: #fff;
          font-size: 12pt;
          text-align: left;
        }
        .mla-meta-header {
          text-align: left;
          line-height: 2.0;
          margin-bottom: 24pt;
        }
        h1 {
          font-size: 14pt;
          font-weight: normal;
          margin-bottom: 24pt;
          text-align: center;
        }
        h2 {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 24pt;
          margin-bottom: 12pt;
        }
        h3 {
          font-size: 12pt;
          font-style: italic;
          margin-top: 18pt;
          margin-bottom: 8pt;
        }
        p {
          margin-bottom: 18pt;
          text-indent: 0.5in;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 24pt 0;
          font-size: 11pt;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8pt;
          text-align: left;
        }
        pre, code {
          font-family: Courier, monospace;
          font-size: 10pt;
        }
        blockquote {
          margin: 18pt 0 18pt 1.0in;
          border-left: none;
          padding-left: 0;
          line-height: 2.0;
        }
      `;
      bodyHeader = `
        <div class="mla-meta-header">
          Agentic Lab Researcher<br>
          Autonomous Systems Division<br>
          Multi-Agent System Publication<br>
          ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1>${formattedTitle}</h1>
        <div class="mla-content-container">
          ${bodyHtml}
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${formattedTitle} - ${format} Publication</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <style>
    ${styleTag}
  </style>
</head>
<body>
  ${bodyHeader}
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false},
          {left: "\\(", right: "\\)", display: false},
          {left: "\\[", right: "\\]", display: true}
        ]
      });
    });
  </script>
</body>
</html>`;
  };

  const generateShareLinkSilently = async () => {
    const title = promptKey.replace(/_/g, ' ').toUpperCase();
    const base64Data = btoa(unescape(encodeURIComponent(report)));
    const fallbackUrl = `${window.location.origin}/#/paper/local?title=${encodeURIComponent(title)}&q=${encodeURIComponent(promptKey)}&data=${encodeURIComponent(base64Data)}`;

    if (!lastSavedRecordId) {
      setSharedUrl(fallbackUrl);
      return fallbackUrl;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setSharedUrl(fallbackUrl);
        return fallbackUrl;
      }
      const res = await fetch(`http://localhost:5000/api/history/${lastSavedRecordId}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const clientUrl = `${window.location.origin}/#/paper/${data.uuid}`;
        setSharedUrl(clientUrl);
        return clientUrl;
      }
    } catch (e) {
      console.error(e);
    }
    setSharedUrl(fallbackUrl);
    return fallbackUrl;
  };

  const handleShare = async () => {
    setSharing(true);
    const link = await generateShareLinkSilently();
    setSharing(false);
    if (link) {
      navigator.clipboard.writeText(link);
      alert(`Public share URL generated and copied to clipboard: ${link}`);
    } else {
      alert("Failed to generate share link.");
    }
  };

  const handleLinkedInShare = async () => {
    setSharing(true);
    const link = await generateShareLinkSilently();
    setSharing(false);
    if (link) {
      const text = encodeURIComponent(`Check out this publication-ready research paper compiled using the Multi-Agent Research Assistant: ${promptKey.replace(/_/g, ' ').toUpperCase()}`);
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${text}`;
      window.open(shareUrl, '_blank', 'width=600,height=600');
    } else {
      alert("Failed to generate link for LinkedIn sharing.");
    }
  };

  const handleDownloadFormat = (ext) => {
    const mime = ext === 'md' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([report], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${promptKey}_report.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const htmlContent = markdownToHtml(report);
    const docHtml = generateStyledHtmlTemplate(promptKey, htmlContent, citationFormat);
    const blob = new Blob([docHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${promptKey}_${citationFormat}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportWord = () => {
    const htmlContent = markdownToHtml(report);
    const docHtml = generateStyledHtmlTemplate(promptKey, htmlContent, citationFormat);
    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${promptKey}_${citationFormat}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const htmlContent = markdownToHtml(report);
    const docHtml = generateStyledHtmlTemplate(promptKey, htmlContent, citationFormat);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(docHtml);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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
          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', alignItems: 'center' }}>
            <select
              value={citationFormat}
              onChange={(e) => setCitationFormat(e.target.value)}
              className="neo-select"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', height: 'auto', display: 'inline-block', flexGrow: 0, minWidth: '100px' }}
              title="Select citation format style"
            >
              <option value="IEEE">IEEE Style</option>
              <option value="APA">APA Style</option>
              <option value="MLA">MLA Style</option>
            </select>

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
              onClick={handleShare}
              disabled={sharing}
              className="neo-button"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
              title="Generate a public, read-only URL and copy to clipboard"
            >
              <Share2 size={14} style={{ color: sharedUrl ? 'var(--color-accent)' : 'inherit' }} />
              {sharing ? "Sharing..." : sharedUrl ? "Shared" : "Share"}
            </button>

            <button
              onClick={handleLinkedInShare}
              className="neo-button"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem', color: '#60a5fa' }}
              title="Share this report on LinkedIn"
            >
              <LinkedinIcon /> LinkedIn
            </button>

            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="neo-button"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
              title="Export Options"
            >
              <Download size={14} /> Export
            </button>

            {showExportDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.4rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  zIndex: 100,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  minWidth: '170px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <button
                  onClick={() => {
                    handleDownloadFormat('md');
                    setShowExportDropdown(false);
                  }}
                  className="neo-button secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.4rem 0.6rem', fontSize: '0.75rem', width: '100%' }}
                >
                  📄 Markdown (.md)
                </button>
                <button
                  onClick={() => {
                    handleDownloadFormat('txt');
                    setShowExportDropdown(false);
                  }}
                  className="neo-button secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.4rem 0.6rem', fontSize: '0.75rem', width: '100%' }}
                >
                  📝 Plain Text (.txt)
                </button>
                <button
                  onClick={() => {
                    handleExportHtml();
                    setShowExportDropdown(false);
                  }}
                  className="neo-button secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.4rem 0.6rem', fontSize: '0.75rem', width: '100%' }}
                >
                  🌐 Styled HTML (.html)
                </button>
                <button
                  onClick={() => {
                    handleExportWord();
                    setShowExportDropdown(false);
                  }}
                  className="neo-button secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.4rem 0.6rem', fontSize: '0.75rem', width: '100%' }}
                >
                  📘 MS Word (.doc)
                </button>
                <button
                  onClick={() => {
                    handleExportPDF();
                    setShowExportDropdown(false);
                  }}
                  className="neo-button secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.4rem 0.6rem', fontSize: '0.75rem', width: '100%' }}
                >
                  📕 PDF Document (.pdf)
                </button>
              </motion.div>
            )}
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

function markdownToHtml(md) {
  if (!md) return "";
  
  let html = md;
  
  // Replace block quotes
  html = html.replace(/^\>\s+(.*)$/gm, '<blockquote>$1</blockquote>');
  
  // Replace code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Replace inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Replace math display (double dollars)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '$$$$$1$$$$');
  
  // Replace headings (IEEE sizing)
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  
  // Replace bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Replace italics
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Replace lists
  html = html.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>'); 
  
  // Split paragraphs safely
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith('<') || trimmed.startsWith('$$') || trimmed.startsWith('\[') || trimmed.startsWith('\\(')) {
      return line;
    }
    return `<p>${trimmed}</p>`;
  }).join('\n');
  
  // Parse tables
  const lines = html.split('\n');
  let inTable = false;
  let tableLines = [];
  let parsedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      if (inTable) {
        inTable = false;
        parsedLines.push(parseMarkdownTable(tableLines));
      }
      parsedLines.push(lines[i]);
    }
  }
  if (inTable) {
    parsedLines.push(parseMarkdownTable(tableLines));
  }
  
  return parsedLines.join('\n');
}

function parseMarkdownTable(lines) {
  if (lines.length < 2) return "";
  let html = "<table>\n";
  const rows = lines.filter(l => !l.match(/^[|\s:-]+$/));
  
  rows.forEach((row, index) => {
    const cols = row.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
    html += "  <tr>\n";
    cols.forEach(col => {
      if (index === 0) {
        html += `    <th>${col}</th>\n`;
      } else {
        html += `    <td>${col}</td>\n`;
      }
    });
    html += "  </tr>\n";
  });
  
  html += "</table>";
  return html;
}
