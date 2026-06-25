import type { Metadata } from 'next';
import './globals.css';
import LayoutShell from './components/LayoutShell';

export const metadata: Metadata = {
  title: 'Digen — Diagram Generator',
  description: 'AI-powered Mermaid diagram generator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0c0c0e]">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
