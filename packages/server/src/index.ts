import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { buildSystem, cleanPersona } from './prompt.js';
import { createProvider } from './providers/index.js';
import { memoryRateLimiter, type RateLimiter } from './ratelimit.js';
import { Knowledge, type Chunk, type KnowledgeFile } from './knowledge.js';
import type { ChatMessage, Lang, Provider, ProviderOptions } from './types.js';

export interface MascotServerOptions extends Partial<ProviderOptions> {
  /** Use your own provider instead of a built-in one. */
  providerInstance?: Provider;
  /** Facts about your site the mascot may use. Plain text. */
  instructions?: string;
  /** Default mascot name when the visitor has not chosen one. */
  name?: string;
  /** Pages allowed to talk to this server, e.g. ["https://example.com"]. Empty = allow all (dev only). */
  allowedOrigins?: string[];
  /** Defaults to 20 requests per 10 minutes per IP. */
  rateLimiter?: RateLimiter;
  /** Path of the chat endpoint. Default "/api/chat". */
  path?: string;
  /** Your site's pages (from `ai-mascot-server index`). The best passages are added to each answer. */
  knowledge?: Knowledge | KnowledgeFile | Chunk[];
}

const MAX_MESSAGES = 12;
const MAX_CHARS = 1000;
const MAX_BODY = 32_000;

export function createMascotServer(o: MascotServerOptions = {}): Hono {
  const provider = o.providerInstance ?? createProvider({ provider: o.provider ?? 'mock', model: o.model, apiKey: o.apiKey, baseURL: o.baseURL, maxTokens: o.maxTokens ?? 600, fetch: o.fetch });
  const limiter = o.rateLimiter ?? memoryRateLimiter({ windowMs: 10 * 60_000, max: 20 });
  const origins = (o.allowedOrigins ?? []).map((s) => s.replace(/\/$/, ''));
  const path = o.path ?? '/api/chat';
  const kb = o.knowledge ? (o.knowledge instanceof Knowledge ? o.knowledge : Knowledge.from(o.knowledge)) : null;
  const app = new Hono();

  app.use(path, cors({ origin: (origin) => (!origins.length || origins.includes(origin) ? origin : null), allowMethods: ['POST', 'OPTIONS'], allowHeaders: ['content-type'], maxAge: 600 }));

  app.post(path, async (c) => {
    const origin = c.req.header('origin');
    if (origins.length && (!origin || !origins.includes(origin))) return c.json({ error: 'origin' }, 403);
    if (!(c.req.header('content-type') ?? '').includes('application/json')) return c.json({ error: 'type' }, 415);
    if (Number(c.req.header('content-length') ?? 0) > MAX_BODY) return c.json({ error: 'too_large' }, 413);

    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? 'local';
    if (!(await limiter.hit(ip))) return c.json({ error: 'rate' }, 429);

    let body: unknown;
    try { body = await c.req.json(); } catch { return c.json({ error: 'body' }, 400); }
    const messages = cleanMessages((body as { messages?: unknown })?.messages);
    if (!messages) return c.json({ error: 'messages' }, 400);
    const langIn = (body as { lang?: unknown }).lang;
    const lang: Lang = langIn === 'en' || langIn === 'ja' ? langIn : /[぀-ヿ一-龯]/.test(messages.at(-1)!.content) ? 'ja' : 'en';
    // Search with the latest question, plus the one before it for follow-ups like "how much is that?".
    const asked = messages.filter((m) => m.role === 'user').slice(-2).map((m) => m.content).join(' ');
    const hits = kb ? kb.search(asked, 3) : [];
    const passages = hits.map((h) => h.chunk);
    const system = buildSystem({ instructions: o.instructions, persona: cleanPersona((body as { persona?: unknown }).persona), defaultName: o.name ?? 'YUA', lang, passages });
    const sources = [...new Map(passages.map((p) => [p.url, { title: p.title || p.url, url: p.url }])).values()];

    return streamSSE(c, async (s) => {
      const ac = new AbortController();
      s.onAbort(() => ac.abort());
      try {
        if (sources.length) await s.writeSSE({ data: JSON.stringify({ sources }) });
        for await (const delta of provider.stream({ system, messages, signal: ac.signal })) {
          await s.writeSSE({ data: JSON.stringify({ delta }) });
        }
        await s.writeSSE({ data: JSON.stringify({ done: true }) });
      } catch (e) {
        // Never log the conversation itself — only the kind of failure.
        console.error('[ai-mascot] provider error:', e instanceof Error ? e.message : 'unknown');
        await s.writeSSE({ data: JSON.stringify({ error: 'upstream' }) });
      }
    });
  });

  return app;
}

function cleanMessages(v: unknown): ChatMessage[] | null {
  if (!Array.isArray(v) || !v.length) return null;
  const out: ChatMessage[] = [];
  for (const m of v.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim()) return null;
    out.push({ role, content: content.slice(0, MAX_CHARS) });
  }
  return out.at(-1)?.role === 'user' ? out : null;
}

export { createProvider, memoryRateLimiter, buildSystem, cleanPersona };
export { Knowledge, indexSite, htmlToText, chunkText } from './knowledge.js';
export type { Chunk, KnowledgeFile } from './knowledge.js';
export type { ChatMessage, Provider, ProviderOptions, RateLimiter };
