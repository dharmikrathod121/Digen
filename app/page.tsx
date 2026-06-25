import Link from 'next/link';

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
    <main className="min-h-screen bg-[#0c0c0e] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <section className="flex flex-col gap-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.10] bg-white/[0.03]">
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute -top-20 -left-24 h-72 w-72 rounded-full blur-3xl"
                style={{ background: 'rgba(20, 184, 166, 0.18)' }}
              />
              <div
                className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              />
            </div>

            <div className="relative p-7 sm:p-10">
              <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">Digen</h1>
                <p className="text-zinc-400 max-w-2xl text-base sm:text-lg">Digen — an AI-powered diagram generator.</p>

                {/* LinkedIn-style story */}
                <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-zinc-300">
                  <p>
                    The idea came from a problem I faced in my Software Engineering subject. Creating diagrams such as Data Flow
                    Diagrams, Class Diagrams, and Sequence Diagrams often meant spending a lot of time searching for examples or
                    trying to generate reference images with AI tools.
                  </p>
                  <p>
                    Image-based outputs were often inconsistent and not suitable for actual project work—so I built something more
                    practical.
                  </p>
                  <p className="text-zinc-200">
                    Instead of generating images, Digen generates real diagrams from simple prompts using Mermaid.js.
                  </p>
                  <p className="text-zinc-300">For example, you can ask:</p>

                  <ul className="list-disc pl-5 space-y-1">
                    <li>Create a Class Diagram for a Library Management System</li>
                    <li>Generate a Sequence Diagram for User Authentication</li>
                    <li>Create a Data Flow Diagram for an E-commerce Website</li>
                    <li>Create a Diagram for Food chain</li>
                    <li>Make a mind map for AI</li>
                  </ul>

                  <p>Digen generates the diagram instantly (about 2–3 seconds).</p>
                </div>

                {/* CTA row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:gap-4 pt-2">
                  <Link
                    href="/chat"
                    className="inline-flex items-center justify-center rounded-2xl bg-teal-400 px-6 py-3 text-black font-semibold hover:bg-teal-300 transition-colors shadow-lg shadow-teal-900/25"
                  >
                    Launch App
                  </Link>

                  <a
                    href="https://dharmikrathod.netlify.app"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-zinc-200 font-semibold hover:bg-white/[0.06] transition-colors"
                  >
                    Portfolio
                  </a>
                </div>

                {/* Small badges */}
                <div className="pt-1 flex flex-wrap gap-2">
                  {['Copy-ready Mermaid', 'Systems-first output', '2–3s generation'].map((b) => (
                    <span key={b} className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-200">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Tech stack */}
                <div className="pt-1 max-w-2xl">
                  <p className="text-zinc-400 text-sm">Tech stack</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Next.js', 'React', 'Tailwind CSS', 'Mermaid.js', 'OpenRouter'].map((t) => (
                      <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                <div className="space-y-3">
                  <h2 className="text-xl font-medium">How Digen works</h2>
                  <p className="text-zinc-400 max-w-2xl">
                    I designed Digen around a simple principle: diagrams should be built from system thinking—not from random drawing.
                    You describe, Digen structures the result.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {WORKFLOW.map((step, idx) => (
                    <div key={step.title} className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400 text-black font-bold text-sm">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-zinc-100">{step.title}</p>
                      </div>
                      <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                <h3 className="text-lg font-medium">Supported diagram styles</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUPPORTED.map((s) => (
                    <span key={s} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-200">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-zinc-400">
                  If you want something specific, describe relationships and steps—the prompt is the source of truth.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                <h3 className="text-lg font-medium">What you’ll get</h3>
                <div className="mt-5 space-y-4">
                  {FEATURE_CARDS.map((c) => (
                    <div key={c.title} className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-4">
                      <p className="font-semibold text-zinc-100">{c.title}</p>
                      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white/[0.10] to-teal-400/[0.12] border border-white/[0.12] flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-medium">Built by Dharmik Rathod</h3>
                    <p className="mt-1 text-sm text-zinc-400">AI Systems Builder &amp; SEO Specialist • Rajkot, Gujarat</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/creator"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/[0.06] transition-colors"
                  >
                    About the creator
                  </Link>

                  <Link
                    href="/chat"
                    className="inline-flex items-center justify-center rounded-2xl bg-teal-400 px-5 py-3 text-sm font-semibold text-black hover:bg-teal-300 transition-colors shadow-lg shadow-teal-900/25"
                  >
                    Launch Digen
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick disclaimer */}
          <div className="rounded-3xl border border-white/[0.10] bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-9 w-9 rounded-xl bg-white/[0.05] border border-white/[0.10] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300">
                  <path d="M12 2l10 6-10 6L2 8l10-6Z" />
                  <path d="M2 14l10 6 10-6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Tip for best results</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Include entities (“User”, “Order Service”), actions (“creates”, “verifies”), and order (“first”, “then”). Digen turns that structure into consistent Mermaid output.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

