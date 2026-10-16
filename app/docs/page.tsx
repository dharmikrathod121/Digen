import type { Metadata } from 'next';
import Link from 'next/link';
import ChatbaseWidget from '../components/ChatbaseWidget';

const SECTIONS = [
  {
    title: 'Getting started',
    body: [
      'Open Digen at /chat. The composer is at the bottom of the screen.',
      'Type a description of the system, flow, or relationship you want to visualize.',
      'Press Enter to send, or Shift+Enter for a newline.',
      'Digen returns a Mermaid code block. Copy it directly into your docs, README, or project board.',
    ],
  },
  {
    title: 'Prompt examples',
    body: [
      'Create a flowchart for user registration: email signup, verification, onboarding.',
      'Generate a classDiagram for an e-commerce cart: User, Cart, Product, Order, Payment.',
      'Draw a sequence diagram for password reset: request, email link, token validation, reset.',
      'Create a stateDiagram for an order: created, paid, shipped, delivered, returned.',
      'Generate a mind map for AI: subfields, techniques, tools, applications.',
    ],
  },
  {
    title: 'Best practices',
    body: [
      'Name entities explicitly: "User", "Inventory Service", "Notification Queue".',
      'Describe order with transition words: "first", "then", "after success", "on failure".',
      'Keep prompts to one diagram type per message for cleaner output.',
      'If the output is too complex, split the system into smaller diagrams.',
    ],
  },
  {
    title: 'Supported syntax',
    body: [
      'flowchart / graph LR / graph TD',
      'classDiagram',
      'sequenceDiagram',
      'stateDiagram / stateDiagram-v2',
      'erDiagram',
      'mindmap',
      'gantt',
      'pie',
      'journey',
    ],
  },
  {
    title: 'FAQ',
    body: [
      'Q: Can I edit the diagram after generation? A: Yes. The output is Mermaid source, so you can tweak it directly.',
      'Q: Does Digen store my prompts? A: Prompts are sent to OpenRouter for completion and are not stored by Digen.',
      'Q: Can I use Digen offline? A: No. Digen requires an OpenRouter API key and an internet connection.',
      'Q: Is Digen free? A: Yes. It is in free beta with no paywall.',
      'Q: Who built Digen? A: Dharmik Rathod. See /creator for details.',
    ],
  },
];

export const metadata: Metadata = {
  title: 'Docs — Digen',
  description: 'Getting started, prompt examples, best practices, supported syntax, and FAQ for Digen.',
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <section className="space-y-3">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--text-3)]">Documentation</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">Docs</h1>
          <p className="text-[var(--text-2)] max-w-2xl text-base sm:text-lg">
            Learn how to describe systems, get better diagrams, and export Mermaid code for your projects.
          </p>
        </section>

        <div className="docs-layout">
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <a key={s.title} href={`#${s.title.toLowerCase().replace(/\s+/g, '-')}`} className="block px-3 py-2 rounded-lg text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--tint)] transition-colors">
                {s.title}
              </a>
            ))}
          </nav>

          <div className="space-y-8">
            {SECTIONS.map(s => (
              <section key={s.title} id={s.title.toLowerCase().replace(/\s+/g, '-')} className="section">
                <h2 className="text-xl font-medium text-[var(--text)] mb-4">{s.title}</h2>
                <ul className="space-y-3">
                  {s.body.map((line, idx) => (
                    <li key={idx} className="text-sm text-[var(--text-2)] leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <section className="section">
          <h2 className="text-xl font-medium text-[var(--text)] mb-3">Need more help?</h2>
          <p className="text-[var(--text-2)] mb-4">
            Open the app and try a prompt. If something is unclear, open an issue on GitHub.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/chat" className="inline-flex items-center justify-center rounded-2xl bg-[var(--pine)] px-6 py-3 text-[var(--on-pine)] font-semibold hover:bg-[var(--pine-hover)] transition-colors">
              Launch App
            </Link>
            <a href="https://github.com/dharmikrathod21/Digen" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] px-6 py-3 text-[var(--text)] font-semibold hover:bg-[var(--tint)] transition-colors">
              Open an issue
            </a>
          </div>
        </section>

        <ChatbaseWidget />
      </div>
    </main>
  );
}
