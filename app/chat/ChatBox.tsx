'use client';

import React, { useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import WelcomePage from '../WelcomePage';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  kind?: 'text' | 'mermaid';
};

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendPrompt(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || streaming) return;
    const prompt = input;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: prompt, kind: 'text' };
    setMessages(prev => [...prev, userMsg]);

    setStreaming(true);
    const res = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a Mermaid diagram generator. Respond ONLY with valid Mermaid source wrapped in a \`\`\`mermaid\n...\n\`\`\` code block. Do not include any explanatory text, preamble, or extra output.

Use varied node shapes whenever possible:
- Rectangle: [label]
- Rounded: (label)
- Stadium: ([label])
- Circle: ((label))
- Diamond: {label}
- Asymmetric: >label]
- Subroutine: [[label]]
- Hexagon: {{label}}

For UML requests use Mermaid types like classDiagram, sequenceDiagram, stateDiagram, and erDiagram. For DFD-style diagrams, use flowchart syntax such as graph LR and expressive data flow arrows.

Always produce only the Mermaid diagram and nothing else.`,
          },
          { role: 'user', content: prompt },
        ],
        stream: true,
      }),
    });

    if (!res.body) {
      const text = await res.text();
      handleAssistantText(text);
      setStreaming(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const assistantId = Date.now().toString() + '-a';
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', kind: 'text' }]);
    let acc = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.text ?? '';
                if (content) {
                  acc += content;
                  setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: acc } : m)));
                }
              } catch (_) {
                // ignore parse errors
              }
            }
          }
        }
        if (done) break;
      }
    } catch (err) {
      console.error('Stream error:', err);
    }

    setStreaming(false);
    handleAssistantText(acc, assistantId);
  }

  function handleAssistantText(text: string, assistantId?: string) {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let match;
    const blocks: string[] = [];
    while ((match = mermaidRegex.exec(text)) !== null) {
      blocks.push(match[1]);
    }
    const plain = text.replace(/```mermaid\n([\s\S]*?)```/g, '').trim();
    if (assistantId) {
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: plain, kind: 'text' } : m)));
    } else {
      setMessages(prev => [...prev, { id: Date.now().toString() + '-a', role: 'assistant', content: plain, kind: 'text' }]);
    }
    blocks.forEach(code => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: code, kind: 'mermaid' }]);
    });
  }

  function handleSuggestion(prompt: string) {
    setInput(prompt);
    // small delay so state is set, then submit
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      setInput('');
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: prompt, kind: 'text' };
      setMessages(prev => [...prev, userMsg]);
      setStreaming(true);

      fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a Mermaid diagram generator. Respond ONLY with valid Mermaid source wrapped in a \`\`\`mermaid\n...\n\`\`\` code block.`,
            },
            { role: 'user', content: prompt },
          ],
          stream: true,
        }),
      }).then(async res => {
        if (!res.body) {
          const text = await res.text();
          handleAssistantText(text);
          setStreaming(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const assistantId = Date.now().toString() + '-a';
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', kind: 'text' }]);
        let acc = '';
        while (true) {
          const { value, done } = await reader.read();
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content ?? '';
                  if (content) {
                    acc += content;
                    setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: acc } : m)));
                  }
                } catch (_) {}
              }
            }
          }
          if (done) break;
        }
        setStreaming(false);
        handleAssistantText(acc, assistantId);
      }).catch(() => setStreaming(false));
    }, 0);
  }

  return (
    <div className="flex h-full bg-[#0c0c0e] text-white overflow-hidden">

      <div className="flex-1 flex flex-col px-6 relative min-w-0">
        {!hasMessages ? (
          /* ── Welcome screen ── */
          <div className="flex-1 flex items-center overflow-y-auto">
<WelcomePage
                input={input}
                onInputChange={setInput}
                onSuggestionClick={handleSuggestion}
                onSubmit={sendPrompt}
                streaming={streaming}
                onClear={() => setMessages([])}
              />
            </div>
          ) : (
          /* ── Chat view ── */
          <>
            {/* Top bar */}
            <header className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05] shrink-0">
              <div className="w-5 h-5 rounded bg-teal-400/15 border border-teal-400/30 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-teal-400">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-300">Digen</span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Clear
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-3xl mx-auto">
                <MessageList messages={messages} />

                {/* Streaming indicator */}
                {streaming && (
                  <div className="flex items-center gap-3 mt-5">
                    <div className="w-6 h-6 rounded-full bg-teal-400/15 border border-teal-400/30 flex items-center justify-center shrink-0">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-teal-400 animate-spin">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" />
                      </svg>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-teal-400/40 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input bar */}
            <div className="shrink-0 px-6 pb-6">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={sendPrompt}>
                  <div className="rounded-2xl border border-white/[0.09] bg-[#161618] shadow-xl shadow-black/30 overflow-hidden">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendPrompt(e as any);
                        }
                      }}
                      placeholder="Enter a prompt to generate a Diagram......"
                      rows={1}
                      className="w-full bg-transparent px-4 pt-3 pb-1 text-white text-[14px] placeholder-zinc-600 outline-none resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-end px-3 py-2.5 border-t border-white/[0.06]">
                      <button
                        type="submit"
                        disabled={!input.trim() || streaming}
                        className="w-8 h-8 rounded-lg bg-teal-400 hover:bg-teal-300 disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150"
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
