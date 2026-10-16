import type { Metadata } from 'next';
import Link from 'next/link';
import ChatbaseWidget from '../components/ChatbaseWidget';

export const metadata: Metadata = {
  title: 'Creator — Digen',
  description: 'Meet Dharmik Rathod, the AI Product Engineer who built Digen.',
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-7">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--tint)] px-4 py-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--leaf)]" />
            <p className="text-sm text-[var(--text-2)] font-medium">Built by a systems-first engineer</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text)]">Meet Dharmik Rathod</h1>
          <p className="text-[var(--text-2)] text-base sm:text-lg">
            AI Product Engineer / AI-Native Systems Builder — turning ideas into real-world automation and MVPs.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 section flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--tint)] to-[var(--border)] border border-[var(--border)] flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text)]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold leading-tight text-[var(--text)]">Dharmik Rathod</p>
                <p className="text-[var(--text-2)]">AI Product Engineer / AI-Native Systems Builder</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[var(--text-2)] leading-relaxed">
                Computer Engineering diploma student at A.V.P.T.I Rajkot (GTU), graduating in 2027.
                I focus on building AI-powered digital systems and real-world automation tools.
              </p>
              <div className="feature-card">
                <p className="text-sm text-[var(--text-3)]">Philosophy</p>
                <p className="mt-1 text-[var(--text)] font-medium italic">&ldquo;I build systems, not just code.&rdquo;</p>
              </div>
              <p className="text-[var(--text-2)]">Rajkot, Gujarat, India</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['LLM Fine-tuning', 'SEO-driven systems', 'AI agents'].map(t => (
                <span key={t} className="text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--tint)] px-3 py-1 text-[var(--text-2)]">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <section className="section">
              <h2 className="text-xl font-medium text-[var(--text)]">Key Focus Areas</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Large Language Models (LLM Fine-tuning)',
                  'SEO-driven web systems',
                  'AI Product Development',
                  'On-Page SEO',
                  'Web Systems & MVP Engineering',
                  'AI Agent Development',
                  'Python, NumPy, Pandas',
                ].map(item => (
                  <div key={item} className="feature-card">
                    <p className="text-sm text-[var(--text)]">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <h3 className="text-lg font-medium text-[var(--text)]">Social & Contact</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a className="feature-card hover:bg-[var(--tint)] transition-colors text-[var(--text-2)] text-sm" href="https://github.com/dharmikrathod21/Digen" target="_blank" rel="noreferrer">
                  Digen on GitHub
                </a>
                <a className="feature-card hover:bg-[var(--tint)] transition-colors text-[var(--text-2)] text-sm" href="https://github.com/dharmikrathod21" target="_blank" rel="noreferrer">
                  GitHub profile
                </a>
                <a className="feature-card hover:bg-[var(--tint)] transition-colors text-[var(--text-2)] text-sm" href="https://www.linkedin.com/in/iamdharmikrathod/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a className="feature-card hover:bg-[var(--tint)] transition-colors text-[var(--text-2)] text-sm" href="https://www.youtube.com/@IamDharmikRathod" target="_blank" rel="noreferrer">
                  YouTube
                </a>
                <a className="feature-card hover:bg-[var(--tint)] transition-colors text-[var(--text-2)] text-sm sm:col-span-2" href="mailto:dharmikrathod121@gmail.com">
                  dharmikrathod121@gmail.com
                </a>
                <a className="feature-card hover:bg-[var(--tint)] transition-colors text-[var(--text-2)] text-sm sm:col-span-2" href="tel:+919023504151">
                  +91 9023504151
                </a>
                <a className="feature-card hover:bg-[var(--tint)] transition-colors text-[var(--text-2)] text-sm sm:col-span-2" href="https://dharmikrathod.netlify.app" target="_blank" rel="noreferrer">
                  Portfolio
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/" className="inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--tint)] transition-colors">
                  Back to Home
                </Link>
                <Link href="/chat" className="inline-flex items-center justify-center rounded-2xl bg-[var(--pine)] px-5 py-3 text-sm font-semibold text-[var(--on-pine)] hover:bg-[var(--pine-hover)] transition-colors">
                  Launch Digen
                </Link>
              </div>
            </section>
          </div>
        </div>

        <ChatbaseWidget />
      </div>
    </main>
  );
}
