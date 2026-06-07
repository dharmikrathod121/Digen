'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function MermaidRenderer({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaidLib: any = mermaidModule.default ?? mermaidModule;
        mermaidLib.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            background: '#111113',
            primaryColor: '#1e293b',
            primaryTextColor: '#e2e8f0',
            primaryBorderColor: '#334155',
            lineColor: '#2dd4bf',
            secondaryColor: '#0f172a',
            tertiaryColor: '#1e293b',
            edgeLabelBackground: '#111113',
          },
        });
        const id = 'mermaid-' + Math.random().toString(36).slice(2);
        const renderResult = await mermaidLib.render(id, code);
        const svg = typeof renderResult === 'string' ? renderResult : renderResult.svg ?? String(renderResult);
        svgRef.current = svg;
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
        }
      } catch (err) {
        if (ref.current) {
          ref.current.innerHTML = `<p style="color:#f87171;font-size:12px;padding:8px">Error rendering diagram: ${String(err)}</p>`;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  function downloadSvg() {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copySvg() {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111113] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-[#161618]">
        <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">diagram</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={copySvg}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
          >
            {copied
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
            }
            {copied ? 'Copied' : 'Copy SVG'}
          </button>
          <button
            onClick={downloadSvg}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download
          </button>
        </div>
      </div>
      {/* Diagram */}
      <div ref={ref} className="overflow-auto p-4 min-h-[100px] flex items-center justify-center [&>svg]:max-w-full" />
    </div>
  );
}
