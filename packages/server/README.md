# ai-mascot-server

The tiny streaming backend for [ai-mascot](https://github.com/YUALAB/ai-mascot) — an animated AI character for any website.
Keeps your API key off the browser. Works with OpenAI, Claude, Gemini, Ollama and any OpenAI-compatible API.

```bash
AI_MASCOT_PROVIDER=ollama npx ai-mascot-server           # free and local
OPENAI_API_KEY=sk-... npx ai-mascot-server               # or OpenAI / ANTHROPIC_API_KEY / GEMINI_API_KEY

npx ai-mascot-server index https://your-site.example     # answer from your own pages
AI_MASCOT_KNOWLEDGE=knowledge.json npx ai-mascot-server
```

Or mount it in your app (Node, Cloudflare Workers, Vercel, Deno, Bun):

```ts
import { createMascotServer } from 'ai-mascot-server';
export default createMascotServer({ provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY, allowedOrigins: ['https://your-site.example'] });
```

Full docs: https://github.com/YUALAB/ai-mascot · MIT © AQUA LLC
