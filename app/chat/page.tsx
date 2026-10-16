import type { Metadata } from 'next';
import ChatExperience from './ChatExperience';

export const metadata: Metadata = {
  title: 'New diagram — Digen',
  description: 'Describe your system in plain English — Digen generates Mermaid.js code and a live diagram.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ChatExperience />;
}
