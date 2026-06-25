import Link from 'next/link';
import ChatbaseWidget from '../components/ChatbaseWidget';

export default function CreatorPage() {

  return (
    <main className="min-h-screen bg-[#0c0c0e] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <section className="space-y-7">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-teal-400" />
              <p className="text-sm text-zinc-300 font-medium">Built by a systems-first engineer</p>
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Meet Dharmik Rathod</h1>
            <p className="text-zinc-400 text-base sm:text-lg">
              AI Systems Builder &amp; SEO Specialist — turning ideas into real-world automation and MVPs.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Profile card */}
            <div className="lg:col-span-5 rounded-3xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/[0.10] to-teal-400/[0.12] border border-white/[0.12] flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-semibold leading-tight">Dharmik Rathod</p>
                  <p className="text-zinc-400">AI Systems Builder &amp; SEO Specialist</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-zinc-300 leading-relaxed">
                  Computer Engineering diploma student at A.V.P.T.I Rajkot (GTU), graduating in 2027.
                  I focus on building AI-powered digital systems and real-world automation tools.
                </p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-zinc-400">Philosophy</p>
                  <p className="mt-1 text-zinc-200 font-medium italic">“I build systems, not just code.”</p>
                </div>
                <p className="text-zinc-400">Rajkot, Gujarat, India</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { label: 'LLM Fine-tuning', tone: 'teal' },
                  { label: 'SEO-driven systems', tone: 'pink' },
                  { label: 'AI agents', tone: 'green' },
                ].map((t) => (
                  <span
                    key={t.label}
                    className="text-xs font-medium rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-200"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                <h2 className="text-xl font-medium">Key Focus Areas</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Large Language Models (LLM Fine-tuning)',
                    'SEO-driven web systems',
                    'AI Product Development',
                    'On-Page SEO',
                    'Web Systems & MVP Engineering',
                    'AI Agent Development',
                    'Python, NumPy, Pandas',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-sm text-zinc-200">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.10] bg-white/[0.03] p-6 sm:p-8">
                <h3 className="text-lg font-medium">Social &amp; Contact</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    className="rounded-2xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors text-zinc-200 text-sm"
                    href="https://github.com/dharmikrathod21"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                  <a
                    className="rounded-2xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors text-zinc-200 text-sm"
                    href="https://www.linkedin.com/in/iamdharmikrathod/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a
                    className="rounded-2xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors text-zinc-200 text-sm"
                    href="https://www.youtube.com/@IamDharmikRathod"
                    target="_blank"
                    rel="noreferrer"
                  >
                    YouTube
                  </a>
                  <a
                    className="rounded-2xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors text-zinc-200 text-sm"
                    href="mailto:dharmikrathod121@gmail.com"
                  >
                    Email
                  </a>
                  <a
                    className="rounded-2xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors text-zinc-200 text-sm sm:col-span-2"
                    href="tel:+919023504151"
                  >
                    Phone
                  </a>
                  <a
                    className="rounded-2xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors text-zinc-200 text-sm sm:col-span-2"
                    href="https://dharmikrathod.netlify.app"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Portfolio
                  </a>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/[0.06] transition-colors"
                  >
                    Back to Home
                  </Link>
                  <Link
                    href="/chat"
                    className="inline-flex items-center justify-center rounded-2xl bg-teal-400 px-5 py-3 text-black text-sm font-semibold hover:bg-teal-300 transition-colors shadow-lg shadow-teal-900/20"
                  >
                    Launch Digen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chatbot (Chatbase) */}
        <div className="mt-8">
          <ChatbaseWidget />
        </div>
      </div>
    </main>
  );
}


