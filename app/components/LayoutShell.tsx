'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide the site navbar inside the chat app (BackTopNav remains)
  const hideNavbar = pathname?.startsWith('/chat');

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
