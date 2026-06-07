'use client';

import React from 'react';
import SuggestionCard from './SuggestionCard';
import BackgroundGrid from './BackgroundGrid';

interface WelcomePageProps {
  input: string;
  onInputChange: (value: string) => void;
  onSuggestionClick: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  streaming: boolean;
  onClear?: () => void;
}

const SUGGESTIONS = [
  {
    title: 'Flowchart',
    description: 'Create a flowchart for a login system',
    prompt: 'Create a mermaid flowchart for a login system',
    accent: 'teal' as const,
  },
  {
    title: 'Class Diagram',
    description: 'Generate a UML class diagram for User, Product, Order',
    prompt: 'Generate a classDiagram for User, Product, Order',
    accent: 'pink' as const,
  },
  {
    title: 'Sequence Diagram',
    description: 'Draw a sequence diagram for checkout flow',
    prompt: 'Draw a sequenceDiagram for checkout flow',
    accent: 'green' as const,
  },
];

export default function WelcomePage({ input, onInputChange, onSuggestionClick, onSubmit, streaming }: WelcomePageProps) {
  return (
    <div className="relative flex flex-col justify-center min-h-screen px-16 py-12 max-w-3xl">
      <BackgroundGrid />

      {/* Heading — left aligned like reference */}
      <div className="mb-8 mt-20">
        <h1 className="text-[2.5rem] font-semibold text-white leading-tight tracking-tight">
          Hey! Welcome to Digen
        </h1>
        <p className="text-[1.25rem] font-normal text-white/70 mt-1.5">
          What diagram can I help you create?
        </p>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 w-full">
        {SUGGESTIONS.map((s, i) => (
          <SuggestionCard
            key={i}
            title={s.title}
            description={s.description}
            onClick={() => onSuggestionClick(s.prompt)}
            accent={s.accent}
          />
        ))}
      </div>

      {/* Input card — dark frosted glass */}
      <form onSubmit={onSubmit} className="w-full">
        <div className="rounded-2xl border border-white/[0.09] bg-[#161618]/95 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
          {/* Sparkle */}
          <div className="px-4 pt-3.5 pb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-teal-400">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" opacity="0.95" />
              <path d="M19 2L19.75 5.25L23 6L19.75 6.75L19 10L18.25 6.75L15 6L18.25 5.25L19 2Z" fill="currentColor" opacity="0.45" />
            </svg>
          </div>

          <textarea
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as any);
              }
            }}
            placeholder=" Enter a prompt to generate a Diagram...."
            rows={2}
            className="w-full bg-transparent px-4 pb-3 text-white text-[14px] placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />

{/* Bottom toolbar */}
           <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/[0.06]">
             <button
               type="button"
               className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
             >
               
               
             </button>

             <button
               type="submit"
               disabled={!input.trim() || streaming}
               className="w-8 h-8 rounded-lg bg-teal-400 hover:bg-teal-300 disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 shadow-lg shadow-teal-900/30"
             >
               {streaming ? (
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-black animate-spin">
                   <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                 </svg>
               ) : (
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                   <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
                 </svg>
               )}
             </button>
           </div>
         </div>
       </form>
     </div>
   );
}
