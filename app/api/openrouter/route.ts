export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing OpenRouter API key on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Digen',
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return new Response(JSON.stringify({ error: `OpenRouter error: ${errorText}` }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    return new Response(upstream.body, { status: upstream.status, headers: { 'Content-Type': contentType } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
