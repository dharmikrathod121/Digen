import type { Metadata } from 'next';
import Link from 'next/link';
import ChatbaseWidget from '../components/ChatbaseWidget';

const DIAGRAM_TYPES = [
  { name: 'Flowchart', desc: 'Map workflows, decisions, and processes with graph LR / TD syntax.', example: 'graph LR\nA[Start] --> B{Decision}\nB -->|Yes| C[Action]\nB -->|No| D[End]' },
  { name: 'Class Diagram (UML)', desc: 'Model classes, attributes, methods, and relationships.', example: 'classDiagram\nclass User {\n  +String name\n  +login()\n}' },
  { name: 'Sequence Diagram', desc: 'Show interactions between actors and components over time.', example: 'sequenceDiagram\nUser->>App: Login\nApp->>API: Validate' },
  { name: 'State Diagram', desc: 'Represent state transitions and lifecycle stages.', example: 'stateDiagram-v2\n[*] --> Idle\nIdle --> Processing' },
  { name: 'ER Diagram', desc: 'Visualize entities, attributes, and relationships.', example: 'erDiagram\nUSER ||--o{ ORDER : places' },
  { name: 'Component Diagram', desc: 'Show system components and their dependencies.', example: 'graph TB\nsubgraph Frontend\n  UI\nend' },
];

const PROMPT_TIPS = [
  { tip: 'Name your actors', detail: 'Use clear names like "User", "Payment Service", "Database".' },
  { tip: 'Describe the flow', detail: 'Use "first", "then", "after that" to set sequence.' },
  { tip: 'Specify relationships', detail: 'Mention "depends on", "calls", "triggers" for edges.' },
  { tip: 'Keep it focused', detail: 'One diagram per prompt produces cleaner output.' },
];

export const metadata: Metadata = {
  title: 'Features — Digen',
  description: 'Supported diagram types and prompt tips for Digen, the AI-powered Mermaid diagram generator.',
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <section className="space-y-3">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--text-3)]">Capabilities</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">Features</h1>
          <p className="text-[var(--text-2)] max-w-2xl text-base sm:text-lg">
            Digen generates production-ready Mermaid diagrams from plain English. No drawing tools, no manual layout—just describe and iterate.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIAGRAM_TYPES.map(item => (
            <div key={item.name} className="section flex flex-col gap-3">
              <h3 className="text-base font-semibold text-[var(--text)]">{item.name}</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">{item.desc}</p>
              <pre className="specimen text-[11px] leading-relaxed whitespace-pre-wrap">{item.example}</pre>
            </div>
          ))}
        </section>

        <section className="section">
          <h2 className="text-xl font-medium text-[var(--text)] mb-4">Prompt tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROMPT_TIPS.map(t => (
              <div key={t.tip} className="feature-card">
                <p className="font-semibold text-[var(--text)]">{t.tip}</p>
                <p className="mt-1.5 text-sm text-[var(--text-2)] leading-relaxed">{t.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="text-xl font-medium text-[var(--text)] mb-3">Ready to try?</h2>
          <p className="text-[var(--text-2)] mb-4">Open Digen and describe your first diagram.</p>
          <Link href="/chat" className="inline-flex items-center justify-center rounded-2xl bg-[var(--pine)] px-6 py-3 text-[var(--on-pine)] font-semibold hover:bg-[var(--pine-hover)] transition-colors">
            Launch App
          </Link>
        </section>

        <ChatbaseWidget />
      </div>
    </main>
  );
}
