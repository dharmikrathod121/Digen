import Link from 'next/link';
import ChatbaseWidget from './components/ChatbaseWidget';

const FEATURE_CARDS = [
  { title: 'Flowcharts & process maps', description: 'Turn workflows into clean Mermaid diagrams with readable structure.' },
  { title: 'UML class + system views', description: 'Generate UML class diagrams and architecture-style snapshots.' },
  { title: 'Sequences & states', description: 'Model interactions and state transitions for real-world systems.' },
];

const WORKFLOW = [
  { title: 'Describe your system', description: 'Write in plain English: actors, components, steps, and rules.' },
  { title: 'Get Mermaid code', description: 'Digen outputs copy-ready Mermaid with consistent formatting.' },
  { title: 'Iterate fast', description: 'Refine by prompting again—without starting from scratch.' },
];

const SUPPORTED = [
  'flowchart',
  'classDiagram (UML)',
  'sequenceDiagram',
  'stateDiagram',
  'component-style diagrams',
  'custom prompt-driven layouts',
];

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <section>
          <div className="hero p-7 sm:p-10">
            <div className="relative z-10 max-w-3xl space-y-5">
              <p className="font-mono text-xs tracking-widest uppercase text-[var(--text-3)]">AI-powered diagram generator</p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-[var(--text)]">
                Digen
              </h1>
              <p className="text-[var(--text-2)] max-w-2xl text-base sm:text-lg">
                An AI-powered diagram generator built from system thinking. Describe your system in plain English and get copy-ready Mermaid diagrams instantly.
              </p>

              <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-[var(--text-2)]">
                <p>
                  The idea came from a problem I faced in my Software Engineering subject. Creating diagrams such as Data Flow
                  Diagrams, Class Diagrams, and Sequence Diagrams often meant spending a lot of time searching for examples or
                  trying to generate reference images with AI tools.
                </p>
                <p>
                  Image-based outputs were often inconsistent and not suitable for actual project work—so I built something more
                  practical.
                </p>
                <p className="text-[var(--text)]">
                  Instead of generating images, Digen generates real diagrams from simple prompts using Mermaid.js.
                </p>
                <p className="text-[var(--text-2)]">For example, you can ask:</p>

                <ul className="list-disc pl-5 space-y-1">
                  <li>Create a Class Diagram for a Library Management System</li>
                  <li>Generate a Sequence Diagram for User Authentication</li>
                  <li>Create a Data Flow Diagram for an E-commerce Website</li>
                  <li>Create a Diagram for Food chain</li>
                  <li>Make a mind map for AI</li>
                </ul>

                <p>Digen generates the diagram instantly (about 2–3 seconds).</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:gap-4 pt-2">
                <Link href="/chat" className="inline-flex items-center justify-center rounded-2xl bg-[var(--pine)] px-6 py-3 text-[var(--on-pine)] font-semibold hover:bg-[var(--pine-hover)] transition-colors">
                  Launch App
                </Link>
                <a href="https://github.com/dharmikrathod21/Digen" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] px-6 py-3 text-[var(--text)] font-semibold hover:bg-[var(--tint)] transition-colors">
                  View on GitHub
                </a>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {['Copy-ready Mermaid', 'Systems-first output', '2–3s generation'].map((b) => (
                  <span key={b} className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--tint)] px-3 py-1 text-xs text-[var(--text-2)]">
                    {b}
                  </span>
                ))}
              </div>

              <div className="pt-1 max-w-2xl">
                <p className="text-[var(--text-3)] text-sm">Tech stack</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Next.js', 'React', 'Tailwind CSS', 'Mermaid.js', 'OpenRouter'].map((t) => (
                    <span key={t} className="rounded-full border border-[var(--border)] bg-[var(--tint)] px-3 py-1 text-xs text-[var(--text-2)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <section className="section">
              <div className="space-y-3">
                <h2 className="text-xl font-medium text-[var(--text)]">How Digen works</h2>
                <p className="text-[var(--text-2)] max-w-2xl">
                  I designed Digen around a simple principle: diagrams should be built from system thinking—not from random drawing.
                  You describe, Digen structures the result.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {WORKFLOW.map((step, idx) => (
                  <div key={step.title} className="feature-card">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--pine)] text-[var(--on-pine)] font-bold text-sm">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-[var(--text)]">{step.title}</p>
                    </div>
                    <p className="mt-3 text-sm text-[var(--text-2)] leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <h3 className="text-lg font-medium text-[var(--text)]">Supported diagram styles</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUPPORTED.map((s) => (
                  <span key={s} className="rounded-full border border-[var(--border)] bg-[var(--tint)] px-3 py-1 text-xs text-[var(--text-2)]">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--text-2)]">
                If you want something specific, describe relationships and steps—the prompt is the source of truth.
              </p>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <section className="section">
              <h3 className="text-lg font-medium text-[var(--text)]">What you&apos;ll get</h3>
              <div className="mt-5 space-y-4">
                {FEATURE_CARDS.map((c) => (
                  <div key={c.title} className="feature-card">
                    <p className="font-semibold text-[var(--text)]">{c.title}</p>
                    <p className="mt-2 text-sm text-[var(--text-2)] leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="creator-card">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--tint)] to-[var(--border)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text)]">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-[var(--text)]">Built by Dharmik Rathod</h3>
                  <p className="mt-1 text-sm text-[var(--text-2)]">AI Product Engineer / AI-Native Systems Builder • Rajkot, Gujarat</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/creator" className="inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--tint)] transition-colors">
                  About the creator
                </Link>
                <Link href="/chat" className="inline-flex items-center justify-center rounded-2xl bg-[var(--pine)] px-5 py-3 text-sm font-semibold text-[var(--on-pine)] hover:bg-[var(--pine-hover)] transition-colors">
                  Launch Digen
                </Link>
              </div>
            </section>
          </div>
        </div>

        <section className="section">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-9 w-9 rounded-xl bg-[var(--tint)] border border-[var(--border)] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--pine)]">
                <path d="M12 2l10 6-10 6L2 8l10-6Z" />
                <path d="M2 14l10 6 10-6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--text)]">Tip for best results</h3>
              <p className="mt-2 text-sm text-[var(--text-2)] leading-relaxed">
                Include entities (&ldquo;User&rdquo;, &ldquo;Order Service&rdquo;), actions (&ldquo;creates&rdquo;, &ldquo;verifies&rdquo;), and order (&ldquo;first&rdquo;, &ldquo;then&rdquo;). Digen turns that structure into consistent Mermaid output.
              </p>
            </div>
          </div>
        </section>

        <ChatbaseWidget />
      </div>
    </main>
  );
}
