import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digen — Diagram Generator',
  description: 'AI-powered Mermaid diagram generator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0c0c0e]">{children}</body>
    </html>
  );
}
