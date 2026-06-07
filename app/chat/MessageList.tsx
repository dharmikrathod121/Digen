'use client';

import React from 'react';
import MermaidRenderer from './MermaidRenderer';

interface Message {
  id: string;
  role: string;
  content: string;
  kind?: string;
}

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-5 py-2">
      {messages.map(m => (
        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {m.role !== 'user' && (
            <div className="mr-3 mt-0.5 shrink-0 w-6 h-6 rounded-full bg-teal-400/15 border border-teal-400/30 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-teal-400">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" />
              </svg>
            </div>
          )}

          <div className={`max-w-[82%] text-sm leading-relaxed ${m.role === 'user' ? 'max-w-[70%]' : 'w-full max-w-[92%]'}`}>
            {m.kind === 'mermaid' ? (
              <MermaidRenderer code={m.content} />
            ) : m.role === 'user' ? (
              <div className="bg-[#1a2535] border border-teal-500/20 text-teal-50 rounded-2xl px-4 py-2.5 whitespace-pre-wrap break-words">
                {m.content}
              </div>
            ) : (
              <div className="bg-[#161618] border border-white/[0.07] rounded-2xl px-4 py-3 text-zinc-300 whitespace-pre-wrap break-words">
                {m.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
