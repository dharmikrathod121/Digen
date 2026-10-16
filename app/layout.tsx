import type { Metadata } from 'next';
import './globals.css';
import LayoutShell from './components/LayoutShell';
import JsonLd from './components/JsonLd';

export const metadata: Metadata = {
  title: {
    default: 'Digen — AI-Powered Diagram Generator',
    template: '%s | Digen',
  },
  description: 'Digen is an AI-powered diagram generator built on system thinking. Describe your system in plain English and get copy-ready Mermaid diagrams for flowcharts, UML, sequences, state machines, and more.',
  keywords: ['AI diagram generator', 'Mermaid diagrams', 'flowchart generator', 'UML diagrams', 'system thinking', 'Digen', 'AI diagram tool', 'Mermaid.js'],
  authors: [{ name: 'Dharmik Rathod', url: 'https://github.com/dharmikrathod21' }],
  creator: 'Dharmik Rathod',
  publisher: 'Dharmik Rathod',
  formatDetection: { email: true, telephone: true, address: true },
  metadataBase: new URL('https://digen.vercel.app'),
  alternates: { canonical: '/', languages: { en: '/en' } },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://digen.vercel.app',
    siteName: 'Digen',
    title: 'Digen — AI-Powered Diagram Generator',
    description: 'Generate flowcharts, UML, sequence diagrams, and more from plain English prompts using Mermaid.',
    images: [{ url: 'https://digen.vercel.app/og.png', width: 1200, height: 630, alt: 'Digen' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digen — AI-Powered Diagram Generator',
    description: 'Generate Mermaid diagrams from plain English prompts.',
    images: ['https://digen.vercel.app/og.png'],
    creator: '@iamdharmikrathod',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('digen-theme');
                  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', t);
                } catch (e) { document.documentElement.setAttribute('data-theme', 'light'); }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <LayoutShell>
          {children}
          <JsonLd />
        </LayoutShell>
      </body>
    </html>
  );
}
