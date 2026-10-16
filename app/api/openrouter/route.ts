/**
 * Digen LLM proxy — OpenRouter primary, Groq fallback.
 *
 * Client sends standard OpenAI-chat body: { model, messages, stream, ... }.
 * Server tries OpenRouter first (OPENROUTER_API_KEY), falls back to Groq
 * (GROQ_API_KEY) on OpenRouter failure / missing key.
 *
 * Supported models (same ID works on both providers):
 * - openai/gpt-oss-20b  (default — ideal for Mermaid)
 * - openai/gpt-oss-120b (higher quality — used for slow mode + repairs)
 */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const DEFAULT_MODEL = 'openai/gpt-oss-20b';

// Legacy / alias map → canonical ID valid on both providers.
const MODEL_ALIASES: Record<string, string> = {
  'openai/gpt-4o-mini': DEFAULT_MODEL,
  'gpt-4o-mini': DEFAULT_MODEL,
  'qwen/qwen3-32b': 'qwen/qwen3.8-27b',
  'qwen3-32b': 'qwen/qwen3.8-27b',
};

function resolveModel(requested: unknown): string {
  if (typeof requested !== 'string' || !requested.trim()) return DEFAULT_MODEL;
  const m = requested.trim();
  return MODEL_ALIASES[m] ?? m;
}

async function tryUpstream(
  url: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>,
): Promise<Response | null> {
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return upstream;
  } catch {
    return null; // network failure → caller falls back
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const groqKey = process.env.GROQ_API_KEY;
    const orKey = process.env.OPENROUTER_API_KEY;

    if (!groqKey && !orKey) {
      return new Response(JSON.stringify({ error: 'Missing GROQ_API_KEY and OPENROUTER_API_KEY on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = { ...body, model: resolveModel((body as Record<string, unknown>)?.model) };

    // 1) Primary: OpenRouter
    if (orKey) {
      const orRes = await tryUpstream(
        OPENROUTER_URL,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${orKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Digen',
        },
        payload,
      );
      if (orRes && orRes.ok) {
        const contentType = orRes.headers.get('content-type') || 'application/octet-stream';
        return new Response(orRes.body, {
          status: orRes.status,
          headers: { 'Content-Type': contentType, 'X-Provider': 'openrouter', 'X-Model': String(payload.model) },
        });
      }
      // If OpenRouter outright succeeded we returned. Otherwise fall through
      // to Groq — but if there is no fallback key, surface OpenRouter's error.
      if (!groqKey) {
        const errText = orRes ? await orRes.text() : 'OpenRouter request failed (network)';
        const status = orRes?.status ?? 502;
        return new Response(JSON.stringify({ error: `OpenRouter error: ${errText}`, provider: 'openrouter' }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // else: fall through to Groq fallback
    }

    // 2) Fallback: Groq
    const groqRes = await tryUpstream(
      GROQ_URL,
      { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      payload,
    );
    if (!groqRes) {
      return new Response(JSON.stringify({ error: 'Both OpenRouter and Groq requests failed (network)', provider: 'none' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      return new Response(JSON.stringify({ error: `Groq error: ${errorText}`, provider: 'groq' }), {
        status: groqRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const contentType = groqRes.headers.get('content-type') || 'application/octet-stream';
    return new Response(groqRes.body, {
      status: groqRes.status,
      headers: { 'Content-Type': contentType, 'X-Provider': 'groq', 'X-Model': String(payload.model) },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
