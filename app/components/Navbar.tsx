'use client'; // Needed because we use client‑side navigation (Link) and a toggle

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname(); // current URL
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/creator', label: 'Creator' },
  ];

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0c0e]/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.10]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h6v6H4z" />
                  <path d="M14 4h6v6h-6z" />
                  <path d="M4 14h6v6H4z" />
                  <path d="M14 14h6v6h-6z" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight text-white">Digen</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'pb-1 text-sm font-medium transition-colors',
                    active ? 'text-white border-b border-white/60' : 'text-zinc-400 hover:text-zinc-200',
                  ].join(' ')}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center rounded-2xl bg-teal-400 px-5 py-3 text-black font-semibold hover:bg-teal-300 transition-colors shadow-lg shadow-teal-900/20"
            >
              Launch App
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMobile}
              className="text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-2 pt-2 pb-4 space-y-2">
            {navItems.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'block px-3 py-2 rounded-xl text-sm font-medium transition-colors border',
                    active ? 'border-white/40 bg-white/[0.06] text-white' : 'border-transparent text-zinc-300 hover:text-white hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="block mt-1 text-center rounded-2xl bg-teal-400 px-5 py-3 text-black font-semibold hover:bg-teal-300 transition-colors shadow-lg shadow-teal-900/20"
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
