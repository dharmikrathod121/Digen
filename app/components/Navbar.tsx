'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/creator', label: 'Creator' },
];

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 22C5 18 4 11.5 7 7 9.5 3.2 13.5 2 15 2c3 3 4.8 8 4 12-.8 3.5-4 6.5-9 8Z" fill="var(--leaf)" opacity="0.18" />
      <path d="M10 22C5 18 4 11.5 7 7 9.5 3.2 13.5 2 15 2c3 3 4.8 8 4 12-.8 3.5-4 6.5-9 8Z" stroke="var(--leaf)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M10 21.5C8 15 12 6.5 14.6 2.6" stroke="var(--leaf)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.7 16.4C12 15.5 13.5 15.2 15.3 15.6" stroke="var(--leaf)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M11.3 11.2C12.7 10.4 14.5 10.3 16.3 10.9" stroke="var(--leaf)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12.2 6.6C13.3 6 14.6 5.8 15.9 6.2" stroke="var(--leaf)" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="site-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="site-brand">
            <span className="leaf" aria-hidden="true"><LeafIcon /></span>
            <b>Digen</b>
            <em>herbarium</em>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={active ? 'site-nav-link text-[var(--text)] bg-[var(--tint)]' : 'site-nav-link'}
                >
                  {label}
                </Link>
              );
            })}
            <a
              href="https://github.com/dharmikrathod21/Digen"
              target="_blank"
              rel="noreferrer"
              className="site-nav-link inline-flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/chat" className="site-nav-cta">
              Launch App
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--tint)] transition-colors"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]">
          <div className="px-4 pt-3 pb-5 space-y-1.5">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${active ? 'border-[var(--border-strong)] bg-[var(--tint)] text-[var(--text)]' : 'border-transparent text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--tint)]'}`}
                >
                  {label}
                </Link>
              );
            })}
            <a
              href="https://github.com/dharmikrathod21/Digen"
              target="_blank"
              rel="noreferrer"
              className="block px-3 py-2.5 rounded-xl text-sm font-medium border border-transparent text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--tint)] transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 text-center site-nav-cta"
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
