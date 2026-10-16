'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname?.startsWith('/chat');
  const showFooter = !hideNavbar;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main id="main-content">{children}</main>
      {showFooter && (
        <footer className="footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span> Digen by Dharmik Rathod</span>
            <div className="flex items-center gap-5">
              <a href="https://github.com/dharmikrathod21/Digen" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/iamdharmikrathod/" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors">LinkedIn</a>
              <a href="https://dharmikrathod.netlify.app" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors">Portfolio</a>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
