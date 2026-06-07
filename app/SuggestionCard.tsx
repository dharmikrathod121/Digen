'use client';

import React from 'react';

interface SuggestionCardProps {
  title: string;
  description: string;
  onClick: () => void;
  accent?: 'teal' | 'pink' | 'green';
}

const accentStyles = {
  teal: {
    pill: 'bg-teal-400/15 text-teal-300 border-teal-400/30 hover:bg-teal-400/22',
    card: 'hover:border-teal-500/25',
  },
  pink: {
    pill: 'bg-pink-400/15 text-pink-300 border-pink-400/30 hover:bg-pink-400/22',
    card: 'hover:border-pink-500/25',
  },
  green: {
    pill: 'bg-green-400/15 text-green-300 border-green-400/30 hover:bg-green-400/22',
    card: 'hover:border-green-500/25',
  },
};

export default function SuggestionCard({ title, description, onClick, accent = 'teal' }: SuggestionCardProps) {
  const s = accentStyles[accent];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2.5 p-4 rounded-xl text-left bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-all duration-200 ${s.card} group`}
    >
      <span className={`self-start text-[11px] font-medium px-2.5 py-[3px] rounded-md border transition-all duration-200 tracking-wide ${s.pill}`}>
        {title}
      </span>
      <span className="text-[12px] text-zinc-500 group-hover:text-zinc-400 transition-colors leading-snug">
        {description}
      </span>
    </button>
  );
}
