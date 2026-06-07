Digen — Deployment Plan

Overview
- Digen is a Next.js app (App Router) that proxies requests to OpenRouter and renders mermaid diagrams client-side.

Prerequisites
- Git repository for your project
- OpenRouter API key
- Vercel account (recommended) or other Node-capable host

Environment variables
- Create a `.env.local` locally with:

  OPENROUTER_API_KEY=sk-...

- On Vercel, set a project environment variable `OPENROUTER_API_KEY` (in Project Settings → Environment Variables). Use the same key value.

Build & Run (local)
- Install deps:

```bash
cd my-app
npm install
```

- Start dev server:

```bash
npm run dev
```

- For production build test:

```bash
npm run build
npm start
```

Vercel deployment (recommended)
1. Push your repo to GitHub/GitLab/Bitbucket.
2. Sign in to Vercel and "Import Project" → select the repo.
3. Set the root directory to the repository root (it will detect Next.js).
4. In Environment Variables, add `OPENROUTER_API_KEY` (for Preview and Production as appropriate).
5. Deploy — Vercel will run `npm run build` automatically.

Notes & Tips
- Do not commit `.env.local` (it's ignored by default). Keep secrets out of source.
- If streaming is used, ensure Vercel's Edge/Serverless environment supports proxying streaming responses. The current implementation proxies the upstream response body. If you encounter streaming issues on Vercel, fallback to non-streaming request/response or implement chunked SSE via edge functions.
- Test production build locally (`npm run build && npm start`) to catch runtime issues.

Troubleshooting
- If OpenRouter returns CORS or auth errors, verify the key and endpoint. The server route uses the server-side env var and should not face CORS.
- If diagrams don't render: check client console for mermaid errors and ensure `mermaid` package is present.

Optional improvements before deploy
- Add logging and error reporting
- Add authentication or rate-limiting if you expect public usage
- Add a small analytics or usage dashboard

Contact
- Keep your OpenRouter credentials private. If you need help configuring Vercel settings, I can provide step-by-step screenshots or commands.