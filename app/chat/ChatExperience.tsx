'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  validateMermaid,
  buildRepairPrompt,
  type Violation,
} from './validator';
import {
  detectDiagramKind,
  SYSTEM_PROMPTS,
  KIND_LABELS,
  FAST_SYSTEM_PROMPT,
  type DiagramKind,
} from './prompts';

type ValidationInfo = {
  passed: number;
  total: number;
  score: number;
  violations: Violation[];
  /** True when exactly one repair round-trip happened for this diagram. */
  repaired: boolean;
  /** True for non-flowchart code (flowchart rules don't apply). */
  skipped: boolean;
};

type Mode = 'fast' | 'slow';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  kind?: 'text' | 'mermaid';
  number: number;
  validation?: ValidationInfo;
  /** Which system prompt produced this diagram (router decision). */
  promptKind?: DiagramKind;
};

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 22C5 18 4 11.5 7 7 9.5 3.2 13.5 2 15 2c3 3 4.8 8 4 12-.8 3.5-4 6.5-9 8Z" fill="var(--leaf)" opacity="0.18" />
      <path d="M10 22C5 18 4 11.5 7 7 9.5 3.2 13.5 2 15 2c3 3 4.8 8 4 12-.8 3.5-4 6.5-9 8Z" stroke="var(--leaf)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M10 21.5C8 15 12 6.5 14.6 2.6" stroke="var(--leaf)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.7 16.4C12 15.5 13.5 15.2 15.3 15.6" stroke="var(--leaf)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M11.3 11.2C12.7 10.4 14.5 10.3 16.3 10.9" stroke="var(--leaf)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12.2 6.6C13.3 6 14.6 5.8 15.9 6.2" stroke="var(--leaf)" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

const STARTER_PROMPTS = [
  {
    q: 'Create a Class Diagram for a Library Management System with Book, Member, Loan, and Librarian classes',
    label: 'Library class diagram',
    type: 'classDiagram',
    icon: '01',
  },
  {
    q: 'Generate a Sequence Diagram for User Authentication with User, Frontend, Auth Service, and Database',
    label: 'Auth sequence diagram',
    type: 'sequenceDiagram',
    icon: '02',
  },
  {
    q: 'Create a Flowchart for E-commerce Checkout: cart, payment, inventory check, order confirmation',
    label: 'Checkout flowchart',
    type: 'flowchart',
    icon: '03',
  },
];

const TYPE_CHIPS = [
  { prefix: 'Create a flowchart for ', label: 'Flow' },
  { prefix: 'Create a class diagram for ', label: 'Class' },
  { prefix: 'Create a sequence diagram for ', label: 'Sequence' },
  { prefix: 'Create a state diagram for ', label: 'State' },
];

const EXAMPLE_PROMPT =
  'Create a flowchart for a food delivery app: user browses restaurants, places order, restaurant confirms, delivery partner picks up, user receives order';

function getTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export default function ChatExperience() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(true);
  const [mode, setMode] = useState<Mode>('fast');
  const [slowPhase, setSlowPhase] = useState<'validating' | 'repairing' | null>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nRef = useRef(0);
  const idRef = useRef(0);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, streaming]);

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('digen-theme', next); } catch {}
  }

  function timeNow() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function setEmptyState() {
    setMessages([]);
    setInput('');
    setWordCount(0);
    setComposerOpen(true);
    nRef.current = 0;
    idRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  /**
   * Raw generation helper — Groq primary, OpenRouter fallback (server
   * decides provider; same model ID works on both). Used for both the
   * initial generation and the single validation repair round-trip.
   * Returns null when the response has no body.
   *
   * Model picks (all valid on Groq + OpenRouter):
   * - openai/gpt-oss-20b  → fast, ~1000 tok/s (default / Fast mode)
   * - openai/gpt-oss-120b → highest quality (Slow mode + repairs)
   * - qwen/qwen3.8-27b    → alternative reasoning/vision model
   */
  /** Hard budget: the whole send() must finish inside this, keeping us <30s. */
  const HARD_BUDGET_MS = 27000;
  const FAST_TIMEOUT_MS = 20000;

  async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(t);
    }
  }

  async function requestMermaidRaw(
    apiMessages: { role: string; content: string }[],
    model = 'openai/gpt-oss-20b',
    timeoutMs = FAST_TIMEOUT_MS,
    deadline = 0,
  ): Promise<string | null> {
    let res: Response;
    try {
      res = await fetchWithTimeout(
        '/api/openrouter',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            stream: true,
            temperature: 0.2,
            // Keep reasoning-model thinking short and exclude it from deltas
            // where the provider supports it (ignored otherwise).
            reasoning_effort: 'low',
            reasoning: { effort: 'low', exclude: true },
          }),
        },
        timeoutMs,
      );
    } catch {
      return null; // timeout / abort → caller falls back, never hangs
    }

    if (!res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let sseBuffer = '';

    function pushContent(val: unknown) {
      if (typeof val === 'string' && val) {
        chunks.push(val);
        return;
      }
      // Some providers stream content as parts: [{ type: 'text', text: '...' }]
      if (Array.isArray(val)) {
        for (const p of val) {
          if (typeof p === 'string' && p) chunks.push(p);
          else if (p && typeof p === 'object' && typeof (p as { text?: unknown }).text === 'string') {
            chunks.push((p as { text: string }).text);
          }
        }
      }
    }

    function handleSseLine(line: string) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) return;
      const data = trimmed.slice(6).trim();
      if (!data || data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const choice = parsed.choices?.[0] ?? {};
        const delta = choice.delta ?? {};
        const msg = choice.message ?? {};
        pushContent(delta.content ?? msg.content ?? choice.text ?? parsed.content ?? '');
        // NOTE: reasoning deltas (gpt-oss thinking) are deliberately ignored —
        // they must never be shown or treated as diagram code.
      } catch {}
    }

    try {
      while (true) {
        // Stop reading once the hard deadline is hit — return partial code
        // immediately instead of hanging past 30s. The read itself is raced
        // so a stalled mid-stream chunk can't hang us either.
        const remaining = deadline ? deadline - Date.now() : 0;
        if (deadline && remaining <= 0) {
          try { await reader.cancel(); } catch {}
          break;
        }
        const readP = reader.read();
        const timeoutP = deadline
          ? new Promise<{ value: undefined; done: boolean; timedOut: true }>(resolve =>
              setTimeout(() => resolve({ value: undefined, done: false, timedOut: true }), Math.max(500, remaining)),
            )
          : null;
        const raced = timeoutP
          ? await Promise.race([readP, timeoutP])
          : await readP;
        if ((raced as { timedOut?: boolean }).timedOut) {
          try { await reader.cancel(); } catch {}
          break;
        }
        const { value, done } = raced as { value: Uint8Array | undefined; done: boolean };
        if (done) break;
        if (value) {
          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() ?? '';
          for (const line of lines) handleSseLine(line);
        }
      }
      sseBuffer += decoder.decode();
      for (const line of sseBuffer.split('\n')) handleSseLine(line);
    } catch (err) {
      console.error('Stream error:', err);
    } finally {
      try { reader.releaseLock(); } catch {}
    }

    const content = chunks.join('');
    // Never fall back to reasoning text — if content is empty, return ''
    // so the caller falls back to a local diagram instead of leaking thought.
    return content;
  }

  /**
   * Fast path — simple non-streaming API call with the minimal prompt.
   * No router rules, no validation, no SSE parsing: one JSON round-trip,
   * which is both faster and far less likely to return "no diagram".
   */
  async function requestMermaidFast(userText: string, extraHint?: string, timeoutMs = FAST_TIMEOUT_MS): Promise<string | null> {
    try {
      const res = await fetchWithTimeout(
        '/api/openrouter',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              { role: 'system', content: FAST_SYSTEM_PROMPT },
              { role: 'user', content: extraHint ? `${userText}\n\n${extraHint}` : userText },
            ],
            stream: false,
            temperature: 0.2,
            // 2000 tokens still streams in ~2-4s on gpt-oss-20b but fits a
            // full 8-class diagram; 800 truncated mid-class leaving an
            // unclosed `class X {` → "got EOF_IN_STRUCT" parse error.
            max_tokens: 2000,
            // Keep gpt-oss thinking short and out of the response.
            reasoning_effort: 'low',
            reasoning: { effort: 'low', exclude: true },
          }),
        },
        timeoutMs,
      );
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      // Standard OpenAI-chat shape (Groq + OpenRouter non-stream).
      // Handle both string and content-parts array shapes.
      const raw: unknown =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        data?.content ??
        '';
      if (typeof raw === 'string') return raw;
      if (Array.isArray(raw)) {
        const joined = raw
          .map(p => (typeof p === 'string' ? p : (p as { text?: unknown })?.text))
          .filter((t): t is string => typeof t === 'string')
          .join('');
        return joined;
      }
      // Reasoning fields are deliberately ignored — never treat
      // chain-of-thought as diagram output.
      return '';
    } catch {
      return null;
    }
  }

  /**
   * Diagrams-only send with a hard time budget.
   * Guarantees: finishes inside HARD_BUDGET_MS (<30s) and NEVER creates an
   * assistant text message — the user only ever sees rendered diagrams.
   * Any LLM failure / timeout / reasoning leak falls back to an instant
   * locally-built flowchart, so output is 100% guaranteed.
   */
  async function send(text?: string) {
    const v = (text !== undefined ? text : input).trim();
    if (!v || streaming) return;
    setInput('');
    setWordCount(0);
    if (inputRef.current) inputRef.current.style.height = 'auto';
    const userNumber = ++nRef.current;
    const userId = String(++idRef.current);
    setMessages(prev => [...prev, { id: userId, role: 'user', content: v, kind: 'text', number: userNumber }]);

    setStreaming(true);
    const assistantId = `a-${++idRef.current}`;
    const assistantNumber = ++nRef.current;
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', kind: 'text', number: assistantNumber }]);

    const deadline = Date.now() + HARD_BUDGET_MS;
    const timeLeft = () => deadline - Date.now();
    const route = detectDiagramKind(v);

    // Shared exit: drop placeholder, show ONLY diagram(s), collapse composer.
    // Never appends `plain`/prose — diagrams only.
    const showDiagrams = (codes: string[]) => {
      setMessages(prev => prev.filter(m => m.id !== assistantId));
      nRef.current = assistantNumber - 1;
      for (const code of codes) {
        const entry: Message = {
          id: `m-${++idRef.current}`,
          role: 'assistant',
          content: code,
          kind: 'mermaid',
          number: ++nRef.current,
          promptKind: route.kind,
        };
        setMessages(prev => [...prev, entry]);
      }
      setComposerOpen(false);
    };
    const showFallback = () => showDiagrams([buildLocalFallbackForPrompt(v)]);

    try {
      const isSlow = mode === 'slow';
      const kindPrompt = isSlow ? SYSTEM_PROMPTS[route.kind] : FAST_SYSTEM_PROMPT;
      const genModel = isSlow ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b';

      let acc: string | null = null;
      if (!isSlow) {
        acc = await requestMermaidFast(v, undefined, Math.min(FAST_TIMEOUT_MS, Math.max(1000, timeLeft() - 2000)));
        // Streaming fallback only if budget remains.
        if ((acc === null || !extractMermaidBlocks(acc).length) && timeLeft() > 6000) {
          const s = await requestMermaidRaw(
            [
              { role: 'system', content: kindPrompt },
              { role: 'user', content: v },
            ],
            genModel,
            Math.min(12000, timeLeft() - 1000),
            deadline,
          );
          if (s !== null && extractMermaidBlocks(s).length > 0) acc = s;
          else if (acc === null) acc = s;
        }
      } else {
        acc = await requestMermaidRaw(
          [{ role: 'system', content: kindPrompt }, { role: 'user', content: v }],
          genModel,
          Math.min(FAST_TIMEOUT_MS, Math.max(1000, timeLeft() - 2000)),
          deadline,
        );
      }

      // No response (timeout / network) → instant local diagram. No text.
      if (acc === null || !acc.trim() || timeLeft() <= 500) {
        showFallback();
        return;
      }

      // Sanitize right after extraction so stored + copied code is the fixed
      // version (angle brackets, comma generics, unclosed braces).
      let blocks = extractMermaidBlocks(acc).map(sanitizeForRender);

      // One strict retry on reasoning leak / unsupported type, budget permitting.
      if (blocks.length === 0 && timeLeft() > 8000 && (isReasoningLeak(acc) || hasUnsupportedDiagram(acc) || !isSlow)) {
        const retry = await requestMermaidFast(
          v,
          'Reminder: output ONLY Mermaid code starting with flowchart TD (use flowchart TD for use case diagrams). No thinking, no prose.',
          Math.min(12000, timeLeft() - 1000),
        );
        if (retry && extractMermaidBlocks(retry).length > 0) {
          acc = retry;
          blocks = extractMermaidBlocks(acc).map(sanitizeForRender);
        }
      }

      // Still nothing usable → local diagram. Diagrams only, never prose.
      if (blocks.length === 0) {
        showFallback();
        return;
      }

      // Slow-mode repair: only when it fits inside the remaining budget,
      // otherwise ship the original diagram immediately.
      const useValidation = isSlow && route.kind === 'flowchart' && timeLeft() > 9000;
      for (const code of blocks) {
        let finalCode = code;
        let validation: ValidationInfo | undefined;
        if (useValidation) {
          setSlowPhase('validating');
          let result = validateMermaid(code);
          if (!result.skipped && result.violations.length > 0 && timeLeft() > 8000) {
            setSlowPhase('repairing');
            try {
              const repairAcc = await requestMermaidRaw(
                [
                  { role: 'system', content: kindPrompt },
                  { role: 'user', content: buildRepairPrompt(v, code, result.violations) },
                ],
                'openai/gpt-oss-120b',
                Math.min(10000, timeLeft() - 1000),
                deadline,
              );
              if (repairAcc !== null) {
                const repairedBlocks = extractMermaidBlocks(repairAcc).map(sanitizeForRender);
                const repaired = repairedBlocks.find(b => validateMermaid(b).parsed.diagramType === 'flowchart') ?? repairedBlocks[0];
                if (repaired) {
                  finalCode = repaired;
                  result = validateMermaid(repaired);
                }
              }
            } catch (repairErr) {
              console.error('Repair round failed, keeping original:', repairErr);
            }
            validation = {
              passed: result.score.passed,
              total: result.score.total,
              score: result.score.score,
              violations: result.violations,
              repaired: true,
              skipped: result.skipped,
            };
          } else {
            validation = {
              passed: result.score.passed,
              total: result.score.total,
              score: result.score.score,
              violations: result.violations,
              repaired: false,
              skipped: result.skipped,
            };
          }
        } else if (isSlow) {
          validation = { passed: 0, total: 0, score: 100, violations: [], repaired: false, skipped: true };
        }
        const entry: Message = { id: `m-${++idRef.current}`, role: 'assistant', content: finalCode, kind: 'mermaid', number: ++nRef.current, promptKind: route.kind };
        if (validation) entry.validation = validation;
        setMessages(prev => [...prev, entry]);
      }
      // Drop placeholder if blocks were handled above (multi-entry path).
      setMessages(prev => prev.filter(m => m.id !== assistantId || m.content !== ''));
      setComposerOpen(false);
      // NOTE: leftover prose (`plain`) is intentionally discarded — diagrams only.
    } catch {
      // Any crash → still a diagram, never a text error.
      try {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        nRef.current = assistantNumber - 1;
      } catch {}
      showFallback();
    } finally {
      setSlowPhase(null);
      setStreaming(false);
    }
  }

  function autoresize(value: string) {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function insertPrefix(prefix: string) {
    setComposerOpen(true);
    const cur = inputRef.current?.value ?? input;
    // Don't duplicate prefix
    if (cur.toLowerCase().startsWith(prefix.slice(0, 8).toLowerCase())) return;
    const next = prefix + cur;
    setInput(next);
    setWordCount(next.trim() ? next.trim().split(/\s+/).length : 0);
    inputRef.current?.focus();
  }

  function fillExample() {
    setComposerOpen(true);
    setInput(EXAMPLE_PROMPT);
    setWordCount(EXAMPLE_PROMPT.split(/\s+/).length);
    inputRef.current?.focus();
  }

  const dateline = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' · text → mermaid → diagram';
  const hasMessages = messages.length > 0;

  return (
    <div className={`chat-app${hasMessages ? ' chatting' : ''}`}>
      <header>
        <button className="brand" onClick={setEmptyState} aria-label="Digen home" type="button">
          <span className="leaf" aria-hidden="true"><LeafIcon /></span>
          <b>Digen</b>
          <em>diagram generator</em>
        </button>

        <div className="top-right">
          <button className="new-btn" onClick={setEmptyState} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New diagram
          </button>
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme" type="button">
            <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.9" y1="4.9" x2="7" y2="7" />
              <line x1="17" y1="17" x2="19.1" y2="19.1" />
              <line x1="4.9" y1="19.1" x2="7" y2="17" />
              <line x1="17" y1="7" x2="19.1" y2="4.9" />
            </svg>
            <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </button>
          <button className="avatar-btn" title="Account" aria-label="Account" type="button">J</button>
        </div>
      </header>

      <main className={`stage${hasMessages ? ' chatting' : ' empty'}`} id="stage">
        {!hasMessages && (
          <div className="greet">
            <div className="over">
              <span className="pulse" aria-hidden="true" />
              <span id="dateline">{dateline}</span>
            </div>
            <h1 id="greetTitle">Turn words into diagrams<i>.</i></h1>
            <p>Describe your system in plain English — actors, steps, relationships. Digen generates Mermaid.js code + a live diagram in ~2–3s.</p>
            <div className="pipe" aria-label="How Digen works">
              <span className="pipe-step"><b>1</b> Describe</span>
              <span className="pipe-arrow" aria-hidden="true">→</span>
              <span className="pipe-step"><b>2</b> Mermaid code</span>
              <span className="pipe-arrow" aria-hidden="true">→</span>
              <span className="pipe-step"><b>3</b> Diagram</span>
            </div>
          </div>
        )}

        <div className="msgs-wrap" id="msgs" ref={msgsRef}>
          {messages.map(m => {
            if (m.role === 'user') {
              return (
                <div key={m.id} className="entry user">
                  <div className="e-head">
                    <span>You · prompt</span>
                    <span>{timeNow()}</span>
                    <span className="rule" />
                  </div>
                  <div className="e-body">{m.content}</div>
                </div>
              );
            }
            if (m.kind === 'mermaid') {
              return (
                <div key={m.id} className="entry agent">
                  <div className="e-head">
                    <span>Digen · diagram</span>
                    <span>{timeNow()}</span>
                    {m.promptKind && <span className="kind-chip">{KIND_LABELS[m.promptKind]}</span>}
                    <span className="rule" />
                    <button className="copy" onClick={() => { navigator.clipboard.writeText(m.content); setCopiedId(m.id); setTimeout(() => setCopiedId(null), 1200); }} type="button">
                      {copiedId === m.id ? 'Copied' : 'Copy code'}
                    </button>
                  </div>
                  <div className="e-body">
                    <MermaidBlock code={m.content} validation={m.validation} />
                  </div>
                </div>
              );
            }
            if (!m.content) return null;
            return (
              <div key={m.id} className="entry agent">
                <div className="e-head">
                  <span>Digen · note</span>
                  <span>{timeNow()}</span>
                  <span className="rule" />
                </div>
                <div className="e-body">{m.content}</div>
              </div>
            );
          })}
          {streaming && (
            <div className="entry agent" aria-label="Digen is generating">
              <div className="e-head">
                <span>Digen · generating</span>
                <span className="rule" />
              </div>
              <div className="gen-status">
                <div className="typing-dots show" aria-hidden="true"><i /><i /><i /></div>
                <span>{slowPhase === 'repairing' ? 'Repairing flagged issues…' : slowPhase === 'validating' ? 'Validating structure…' : 'Writing Mermaid.js… rendering diagram…'}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`composer-block${hasMessages && !composerOpen ? ' is-collapsed' : ''}`}>
          {hasMessages && !composerOpen ? (
            <div className="composer-collapsed">
              <button
                type="button"
                className="composer-pill"
                onClick={() => { setComposerOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                aria-label="Open prompt box"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m18 15-6-6-6 6" />
                </svg>
                New prompt — click to expand
              </button>
            </div>
          ) : (
          <>
          <div className="composer">
            <div className="c-top">
              <span className="l">New diagram</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span id="wc">{wordCount} word{wordCount === 1 ? '' : 's'} · mermaid live</span>
                {hasMessages && (
                  <button type="button" className="collapse-btn" onClick={() => setComposerOpen(false)} title="Minimize prompt box" aria-label="Minimize prompt box">∨ hide</button>
                )}
              </span>
            </div>
            <div className="mode-row" role="group" aria-label="Generation mode">
              <button
                type="button"
                className={`mode-btn${mode === 'fast' ? ' active' : ''}`}
                onClick={() => setMode('fast')}
                title="Fast — no validation"
                aria-pressed={mode === 'fast'}
              >
                Fast <span>no validation</span>
              </button>
              <button
                type="button"
                className={`mode-btn${mode === 'slow' ? ' active' : ''}`}
                onClick={() => setMode('slow')}
                title="Self-validating — slow but accurate"
                aria-pressed={mode === 'slow'}
              >
                Self-validating <span>slow · high quality</span>
              </button>
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoresize(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="Describe a system… e.g. Create a sequence diagram for user login with frontend, auth service, database…"
              aria-label="Describe your diagram"
              rows={1}
            />
            <div className="c-bar">
              <div className="type-chips" role="group" aria-label="Diagram type shortcuts">
                {TYPE_CHIPS.map(t => (
                  <button key={t.label} type="button" className="chip" onClick={() => insertPrefix(t.prefix)} title={`Start a ${t.label} diagram`}>
                    {t.label}
                  </button>
                ))}
                <button type="button" className="chip ghost" onClick={fillExample} title="Insert an example prompt">
                  Example
                </button>
              </div>
              <button className={`send${input.trim() && !streaming ? ' ready' : ''}`} onClick={() => send()} disabled={!input.trim() || streaming} type="button">
                {streaming ? 'Generating…' : 'Generate'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </button>
            </div>
            <div className="c-hint-row"><span className="c-hint"><b>Enter</b> generate · <b>Shift+Enter</b> newline</span></div>
          </div>

          {!hasMessages && (
            <div className="index" id="index">
              <div className="index-label">Try a diagram prompt</div>
              {STARTER_PROMPTS.map(s => (
                <button key={s.q} onClick={() => send(s.q)} type="button">
                  <i>{s.icon}</i>
                  <span className="index-text">
                    <span className="index-title">{s.label}</span>
                    <span className="index-type">{s.type}</span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          </>
          )}
        </div>
      </main>
    </div>
  );
}

function sanitizeMermaid(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .replace(/[​-⁠﻿]/g, '')
    .split('\n')
    .map(l => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .trim();
}

/**
 * Repair the four classDiagram failure modes before render:
 * 1. `<Generic>` angle brackets → tilde syntax (Mermaid only accepts ~T~).
 *    Relationship arrows (<|--, -->, etc.) are preserved.
 * 2. Commas inside ~generics~ (unsupported) → dropped.
 * 3. Unclosed `class X {` blocks (truncated output) → close with }.
 * 4. Trailing garbage after the last valid line → trimmed.
 * Pure string ops, no network — safe to run on every class diagram.
 */
function sanitizeClassDiagram(code: string): string {
  let out = code;
  // 1. Angle-bracket generics → tilde. Only matches <Alnum...str> where the
  // content is a plausible type list (no |, -, >, " chars), so arrows survive.
  out = out.replace(/<([A-Za-z_][A-Za-z0-9_\s.,?[\]]{0,60})>/g, (match, inner, offset, full) => {
    const before = full.slice(Math.max(0, offset - 2), offset);
    const after = full.slice(offset + match.length, offset + match.length + 1);
    // Skip relationship operators: <|--, -->, <|, etc.
    if (before.includes('|') || before.includes('-') || after === '|' || after === '-') return match;
    const cleaned = String(inner).replace(/\s+/g, '');
    if (!cleaned || /^(|--|\||-->)/.test(cleaned)) return match;
    return `~${cleaned}~`;
  });
  // 2. Commas inside tilde generics are unsupported → drop them.
  out = out.replace(/~([^~\n]*),([^~\n]*)~/g, '~$1$2~');
  out = out.replace(/~([^~\n]*),([^~\n]*)~/g, '~$1$2~');
  // 3. Balance braces: every `class X {` needs a closing }.
  const open = (out.match(/\{/g) || []).length;
  const close = (out.match(/\}/g) || []).length;
  if (open > close) out += '\n' + '}\n'.repeat(open - close);
  return out.trim();
}

/** Route to the per-type sanitizer based on the first line. */
function sanitizeForRender(code: string): string {
  const clean = sanitizeMermaid(code);
  const first = clean.split('\n')[0]?.trim() ?? '';
  if (/^classDiagram/.test(first)) return sanitizeClassDiagram(clean);
  return clean;
}

const MERMAID_HEAD_RE = /^(flowchart|graph|classDiagram|sequenceDiagram|stateDiagram(?:-v2)?|erDiagram|mindmap|gantt|pie|journey|gitGraph|C4Context|requirementDiagram|timeline|zenuml|sankey-beta|xyChart-beta|block-beta|packet-beta|kanban|architecture-beta|radar-beta)\b/;

/** Diagram keywords the model sometimes emits but Mermaid cannot render. */
const UNSUPPORTED_HEAD_RE = /^(usecaseDiagram|usecase)\b/i;

/** True when text contains an unsupported diagram type anywhere. */
function hasUnsupportedDiagram(text: string): boolean {
  return text.split('\n').some(l => UNSUPPORTED_HEAD_RE.test(l.trim()));
}

/**
 * Heuristic for chain-of-thought / reasoning leaks ("We need to output…",
 * "The user wants…", "Let's recall…"). Such text must never be shown as a
 * note — it means the model thought out loud instead of emitting code.
 */
function isReasoningLeak(text: string): boolean {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 60) return false;
  if (looksLikeMermaid(t)) return false;
  return /^(we need to|the user wants|so we need to|i need to|i should|let'?s (recall|check|think|produce)|actually mermaid|checking memory|but i need to|okay,?\s*(so|i)|here'?s my thinking|my reasoning|thinking:)/i.test(t)
    || /mermaid supports .* with syntax/i.test(t.slice(0, 500));
}

function looksLikeMermaid(code: string): boolean {
  const lines = code.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return false;
  return MERMAID_HEAD_RE.test(lines[0]);
}

/**
 * Class-name-safe token: alphanumeric only (Mermaid requirement).
 */
function toClassName(w: string, fallback: string): string {
  const c = w.replace(/[^A-Za-z0-9]/g, '');
  const cap = c ? c.charAt(0).toUpperCase() + c.slice(1, 19) : fallback;
  return /^[A-Za-z][A-Za-z0-9]*$/.test(cap) ? cap : fallback;
}

/**
 * Kind-aware local fallback — guarantees the user gets a *diagram of the
 * requested type* even on total LLM failure. Zero network, always valid.
 */
function buildLocalFallbackForPrompt(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/\bclass\b/.test(p)) return buildLocalClassFallback(prompt);
  if (/\bsequence\b/.test(p)) {
    return [
      'sequenceDiagram',
      '  participant U as User',
      '  participant S as System',
      '  U->>S: Request',
      '  S->>S: Process',
      '  S-->>U: Response',
    ].join('\n');
  }
  if (/\bstate\b/.test(p)) {
    return ['stateDiagram-v2', '  [*] --> Active', '  Active --> Idle', '  Idle --> Active', '  Active --> [*]'].join('\n');
  }
  if (/\ber\b|entity/.test(p)) {
    return ['erDiagram', '  CUSTOMER ||--o{ ORDER : places', '  ORDER ||--|{ ITEM : contains'].join('\n');
  }
  return buildLocalFallbackDiagram(prompt);
}

/** Bank/library-aware class fallback so "bms" still yields topical classes. */
function buildLocalClassFallback(prompt: string): string {
  const p = prompt.toLowerCase();
  let names: string[];
  if (/bms|bank/.test(p)) names = ['Account', 'Customer', 'Transaction', 'Branch'];
  else if (/librar/.test(p)) names = ['Book', 'Member', 'Loan', 'Librarian'];
  else {
    const words = prompt
      .replace(/[^A-Za-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 2 && !/^(class|diagram|create|make|generate|draw|show|system|please|give|for|with|from)$/i.test(w));
    names = [];
    for (const w of words) {
      const c = toClassName(w, '');
      if (c && !names.includes(c)) names.push(c);
      if (names.length >= 4) break;
    }
    while (names.length < 3) names.push(`Class${names.length + 1}`);
  }
  const [a, b, c, d] = names;
  const lines = [
    'classDiagram',
    `  class ${a} {`,
    '    +String id',
    '    +String name',
    `    +create()`,
    '  }',
    `  class ${b} {`,
    '    +String id',
    `    +register()`,
    '  }',
    `  class ${c} {`,
    '    +String id',
    `    +process()`,
    '  }',
  ];
  lines.push(`  ${a} --> ${b} : serves`);
  lines.push(`  ${b} --> ${c} : uses`);
  if (d) {
    lines.push(`  class ${d} {`, '    +String id', '  }', `  ${a} --> ${d} : linked`);
  }
  return lines.join('\n');
}

/**
 * Instant local fallback — guarantees the user gets a *diagram* even when the
 * LLM times out, errors, or leaks reasoning. Zero network, always valid
 * flowchart TD. Keywords are pulled from the prompt so it still looks topical.
 */
function buildLocalFallbackDiagram(prompt: string): string {
  const stop = new Set(
    'a,an,the,of,for,with,and,or,to,in,on,make,create,generate,draw,show,diagram,flowchart,flow,chart,system,app,application,use,case,please,give,me,my'.split(','),
  );
  const words = prompt
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !stop.has(w.toLowerCase()));
  const picks: string[] = [];
  for (const w of words) {
    const cap = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    if (!picks.includes(cap)) picks.push(cap);
    if (picks.length >= 4) break;
  }
  while (picks.length < 3) picks.push(`Step ${picks.length + 1}`);
  const ids = picks.map((_, i) => `s${i + 1}`);
  const lines = ['flowchart TD', '  start([Start])'];
  picks.forEach((label, i) => {
    const safe = label.replace(/["#<>`]/g, '').slice(0, 24) || `Step ${i + 1}`;
    lines.push(`  ${ids[i]}[${safe}]`);
  });
  lines.push('  fin([End])');
  lines.push(`  start --> ${ids[0]}`);
  for (let i = 0; i < ids.length - 1; i++) lines.push(`  ${ids[i]} --> ${ids[i + 1]}`);
  lines.push(`  ${ids[ids.length - 1]} --> fin`);
  return lines.join('\n');
}



/**
 * Slice out a bare (fence-less) Mermaid block from mixed text: find the first
 * line that starts a Mermaid diagram, then keep everything from there until a
 * line that clearly ends it (or end of text). Handles reasoning models that
 * emit prose around the diagram.
 */
function sliceBareMermaid(text: string): string | null {
  // Drop a lone language-tag line ("mermaid") left behind without fences.
  const lines = text
    .replace(/```/g, '')
    .split('\n')
    .filter((l, i, arr) => !(l.trim().toLowerCase() === 'mermaid' && (i === 0 || !MERMAID_HEAD_RE.test(arr[i - 1]?.trim() ?? ''))));
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (MERMAID_HEAD_RE.test(lines[i].trim())) { start = i; break; }
  }
  if (start < 0) return null;
  const kept: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const t = lines[i].trim();
    // Stop at likely prose after the diagram began. NOTE: `note` intentionally
    // excluded — `note for X "..."` is valid Mermaid (class/state diagrams).
    if (kept.length > 0 && /^(here'?s? (is|the)|explanation|this diagram|the above|hope|let me|i hope|in summary|to use)\b/i.test(t)) break;
    kept.push(lines[i]);
  }
  const clean = sanitizeMermaid(kept.join('\n'));
  return clean && looksLikeMermaid(clean) ? clean : null;
}

function extractMermaidBlocks(acc: string): string[] {
  const blocks: string[] = [];
  const fenceRe = /```\s*mermaid\s*\n?([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(acc)) !== null) {
    const clean = sanitizeMermaid(m[1]);
    if (clean) blocks.push(clean);
  }
  if (blocks.length > 0) return blocks;
  // Generic fences that happen to contain mermaid
  const genericRe = /```(?:\w+)?\s*\n?([\s\S]*?)```/g;
  while ((m = genericRe.exec(acc)) !== null) {
    const clean = sanitizeMermaid(m[1]);
    if (clean && looksLikeMermaid(clean)) blocks.push(clean);
  }
  if (blocks.length > 0) return blocks;
  // Unclosed fence (model cut off before ```): take everything after ```mermaid
  const unclosed = acc.match(/```\s*mermaid\s*\n?([\s\S]*)$/i);
  if (unclosed) {
    const clean = sanitizeMermaid(unclosed[1]);
    if (clean && looksLikeMermaid(clean)) return [clean];
  }
  // Bare, fence-less mermaid possibly wrapped in prose/reasoning.
  const bare = sliceBareMermaid(acc);
  if (bare) blocks.push(bare);
  return blocks;
}

/**
 * Leftover prose after removing diagram code. Returns '' when the response
 * was pure mermaid (the common fast-mode case) so we never render code
 * as a text note underneath the diagram.
 */
function extractPlainText(acc: string, blocks: string[]): string {
  let plain = acc;
  // Strip fenced blocks first.
  plain = plain.replace(/```\s*mermaid\s*\n?([\s\S]*?)```/gi, '');
  plain = plain.replace(/```[\s\S]*?```/g, '');
  // Strip each extracted bare block (exact + trimmed containment).
  for (const b of blocks) {
    if (!b) continue;
    if (plain.includes(b)) {
      plain = plain.split(b).join('');
    } else {
      const flat = b.trim();
      // Fallback: remove line-by-line for whitespace-mismatched bare blocks.
      for (const line of flat.split('\n')) {
        const t = line.trim();
        if (t) plain = plain.split(line).join('');
      }
    }
  }
  plain = plain
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .split('\n')
    .map(l => l.trim())
    // Drop empty lines and bare fence remnants.
    .filter(l => l && l !== '```' && l !== 'mermaid')
    .join('\n')
    .trim();
  // If what's left still looks like mermaid, it IS code — suppress it.
  if (plain && looksLikeMermaid(plain)) return '';
  if (plain && sliceBareMermaid(plain)) return '';
  return plain;
}

function detectDiagramType(code: string): string {
  const first = code.trim().split('\n')[0]?.trim() ?? '';
  if (/^classDiagram/.test(first)) return 'classDiagram';
  if (/^sequenceDiagram/.test(first)) return 'sequenceDiagram';
  if (/^stateDiagram/.test(first)) return 'stateDiagram-v2';
  if (/^erDiagram/.test(first)) return 'erDiagram';
  if (/^mindmap/.test(first)) return 'mindmap';
  if (/^(flowchart|graph)/.test(first)) return 'flowchart';
  return 'mermaid';
}

function MermaidBlock({ code, validation }: { code: string; validation?: ValidationInfo }) {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<string>('');
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);
  const [zoom, setZoom] = useState(0.85);
  // Sanitized upfront: fixes <Generic> → ~Generic~, comma generics, and
  // unclosed class { blocks so most LLM slips render instead of erroring.
  const cleanCode = sanitizeForRender(code);
  const dtype = detectDiagramType(cleanCode);

  function applyZoom() {
    const svgEl = ref.current?.querySelector('svg');
    if (svgEl) {
      (svgEl as SVGSVGElement).style.maxHeight = `${Math.round(336 * zoom)}px`;
      (svgEl as SVGSVGElement).style.maxWidth = '100%';
    }
  }

  useEffect(() => { applyZoom(); }, [zoom]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaidModule = await import('mermaid');
        const lib = (mermaidModule.default ?? mermaidModule) as unknown as {
          initialize(options: Record<string, unknown>): void;
          parse(code: string): Promise<unknown>;
          render(id: string, code: string): Promise<{ svg?: string } | string>;
        };
        const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
        lib.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          securityLevel: 'loose',
          theme: isDark ? 'dark' : 'default',
          themeVariables: isDark ? {
            background: '#182019',
            primaryColor: '#1C251D',
            primaryTextColor: '#E9EEE5',
            primaryBorderColor: '#3A473C',
            lineColor: '#8FB694',
            secondaryColor: '#10160F',
            tertiaryColor: '#1C251D',
            edgeLabelBackground: '#182019',
            fontFamily: "'Hanken Grotesk', sans-serif",
          } : {
            background: '#FCFDF9',
            primaryColor: '#F4F6F0',
            primaryTextColor: '#17211B',
            primaryBorderColor: '#C3CDB6',
            lineColor: '#4F7A45',
            secondaryColor: '#F4F6F0',
            tertiaryColor: '#E9EEE1',
            edgeLabelBackground: '#FCFDF9',
            fontFamily: "'Hanken Grotesk', sans-serif",
          },
        });
        // Validate first so we show our own inline error instead of mermaid's global toast
        try {
          await lib.parse(cleanCode);
        } catch (parseErr) {
          throw parseErr;
        }
        const id = 'digen-' + Math.random().toString(36).slice(2, 10);
        const renderResult = await lib.render(id, cleanCode);
        const svg = typeof renderResult === 'string' ? renderResult : (renderResult as { svg?: string }).svg ?? String(renderResult);
        svgRef.current = svg;
        if (!cancelled) {
          setError(null);
          // Wait a tick so the preview div exists even if user is on Code tab
          requestAnimationFrame(() => {
            if (!cancelled && ref.current) {
              ref.current.innerHTML = svg;
              applyZoom();
            }
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          if (ref.current) {
            ref.current.innerHTML = '';
          }
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cleanCode]);

  // Re-attach cached SVG when switching back from Code → Preview
  // (the preview div stays mounted but innerHTML can be lost)
  useEffect(() => {
    if (view === 'preview' && svgRef.current && ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = svgRef.current;
      applyZoom();
    }
  }, [view]);

  function downloadSvg() {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'digen-diagram.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copySvg() {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  return (
    <div className="diagram-card">
      <div className="diagram-toolbar">
        <span className="diagram-label">{dtype} · {view === 'preview' ? 'preview' : 'mermaid.js'}</span>
        <div className="diagram-actions">
          <div className="view-tabs" role="tablist" aria-label="Diagram view">
            <button type="button" role="tab" aria-selected={view === 'preview'} className={view === 'preview' ? 'active' : ''} onClick={() => setView('preview')}>Preview</button>
            <button type="button" role="tab" aria-selected={view === 'code'} className={view === 'code' ? 'active' : ''} onClick={() => setView('code')}>Code</button>
          </div>
          {view === 'code' ? (
            <button onClick={copyCode} type="button" className="diagram-action">
              {codeCopied ? 'Copied' : 'Copy code'}
            </button>
          ) : (
            <>
              <div className="diagram-zoom" role="group" aria-label="Diagram zoom">
                <button type="button" onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))} disabled={zoom <= 0.5} title="Zoom out" aria-label="Zoom out">−</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom(z => Math.min(1.5, +(z + 0.15).toFixed(2)))} disabled={zoom >= 1.5} title="Zoom in" aria-label="Zoom in">+</button>
              </div>
              <button onClick={copySvg} type="button" className="diagram-action">
                {copied ? 'Copied' : 'Copy SVG'}
              </button>
              <button onClick={downloadSvg} type="button" className="diagram-action">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Download
              </button>
            </>
          )}
        </div>
      </div>
      {validation && !validation.skipped && (
        <div className="quality-bar">
          <span className={`quality-score ${validation.score >= 80 ? 'good' : validation.score >= 60 ? 'warn' : 'bad'}`}>
            Quality {validation.score}% · {validation.passed}/{validation.total}
          </span>
          {validation.repaired && <span className="repair-badge">Repaired</span>}
          {!validation.repaired && validation.violations.length === 0 && (
            <span className="repair-badge ok">Passed</span>
          )}
          {!validation.repaired && validation.violations.length > 0 && (
            <span className="repair-badge issues">Needs attention</span>
          )}
        </div>
      )}
      {validation?.skipped && (
        <div className="quality-bar">
          <span className="quality-skip">Validation applies to flowcharts</span>
        </div>
      )}
      {validation && !validation.skipped && validation.violations.length > 0 && (
        <details className="viol-list">
          <summary>
            Issues ({validation.violations.length}) — {validation.repaired ? 'after repair' : 'found'}
          </summary>
          <ul>
            {validation.violations.map((x, i) => (
              <li key={i}>
                <b>{x.rule}</b> — {x.message}
              </li>
            ))}
          </ul>
        </details>
      )}
      {/* Keep preview mounted so switching tabs never loses the rendered SVG */}
      <div style={{ display: view === 'preview' ? 'block' : 'none' }}>
        {rendering && !error ? (
          <div className="diagram-loading">
            <div className="typing-dots show" aria-hidden="true"><i /><i /><i /></div>
            <span>Rendering diagram…</span>
          </div>
        ) : error ? (
          <div className="diagram-error">
            <p>Couldn&apos;t render this diagram. The Mermaid syntax may be invalid.</p>
            <p className="diagram-error-detail">{error.slice(0, 300)}</p>
            <button type="button" onClick={() => setView('code')}>View code</button>
          </div>
        ) : null}
        <div ref={ref} className="diagram-canvas" style={{ display: error ? 'none' : 'flex' }} />
      </div>
      {view === 'code' && (
        <pre className="diagram-code"><code>{cleanCode}</code></pre>
      )}
    </div>
  );
}
