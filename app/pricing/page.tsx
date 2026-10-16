import type { Metadata } from 'next';
import Link from 'next/link';
import ChatbaseWidget from '../components/ChatbaseWidget';

export const metadata: Metadata = {
  title: 'Pricing — Digen',
  description: 'Digen is free in beta with no paywall. Early access plans coming soon.',
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <section className="space-y-3">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--text-3)]">Pricing</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">Simple, open pricing</h1>
          <p className="text-[var(--text-2)] max-w-2xl text-base sm:text-lg">
            Digen is currently in free beta. No credit card, no paywall—just try it and share feedback.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="pricing-card">
            <p className="text-xs font-mono tracking-widest uppercase text-[var(--text-3)]">Free beta</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[var(--text)]">$0</span>
              <span className="text-sm text-[var(--text-3)]">/month</span>
            </div>
            <p className="text-sm text-[var(--text-2)] mt-2">
              Full access to the diagram generator while we refine the experience.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--text-2)]">
              <li>Unlimited diagram prompts</li>
              <li>Copy-ready Mermaid output</li>
              <li>Light and dark theme</li>
              <li>SVG download</li>
            </ul>
            <Link href="/chat" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--pine)] px-6 py-3 text-[var(--on-pine)] font-semibold hover:bg-[var(--pine-hover)] transition-colors">
              Launch App
            </Link>
          </div>

          <div className="pricing-card opacity-80">
            <p className="text-xs font-mono tracking-widest uppercase text-[var(--text-3)]">Early access</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[var(--text)]">Soon</span>
            </div>
            <p className="text-sm text-[var(--text-2)] mt-2">
              Paid tiers with team workspaces, templates, and integrations are planned.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--text-2)]">
              <li>Team collaboration</li>
              <li>Saved diagram library</li>
              <li>API access</li>
              <li>Priority support</li>
            </ul>
            <a href="https://github.com/dharmikrathod21/Digen" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] px-6 py-3 text-[var(--text)] font-semibold hover:bg-[var(--tint)] transition-colors">
              Star the repo
            </a>
          </div>
        </section>

        <section className="section">
          <h2 className="text-xl font-medium text-[var(--text)] mb-3">Join the beta</h2>
          <p className="text-[var(--text-2)] mb-4">
            Digen is built in the open. Star the repo, open an issue, or reach out with feedback.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/dharmikrathod21/Digen" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--tint)] transition-colors">
              GitHub repository
            </a>
            <Link href="/docs" className="inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--tint)] transition-colors">
              Read the docs
            </Link>
          </div>
        </section>

        <ChatbaseWidget />
      </div>
    </main>
  );
}
