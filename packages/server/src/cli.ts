#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { serve } from '@hono/node-server';
import { createMascotServer } from './index.js';
import { indexSite, type KnowledgeFile } from './knowledge.js';
import type { ProviderName } from './types.js';

const env = process.env;
const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'index') {
  // ai-mascot-server index https://example.com [--out knowledge.json] [--max 50]
  const url = args.find((a) => /^https?:\/\//.test(a));
  const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  if (!url) { console.error('usage: ai-mascot-server index https://your-site.example [--out knowledge.json] [--max 50]'); process.exit(1); }
  const out = flag('--out') ?? 'knowledge.json';
  console.log(`Reading ${url} …`);
  const kb = await indexSite(url, { maxPages: Number(flag('--max') ?? 50), onPage: (u, n) => console.log(`  ${String(n).padStart(3)}  ${u}`) });
  writeFileSync(out, JSON.stringify(kb));
  console.log(`\nSaved ${kb.chunks.length} passages from ${new Set(kb.chunks.map((c) => c.url)).size} pages → ${out}`);
  console.log(`Start the server with:  AI_MASCOT_KNOWLEDGE=${out} npx ai-mascot-server`);
  process.exit(0);
}

const provider = (env.AI_MASCOT_PROVIDER ?? (env.OPENAI_API_KEY ? 'openai' : env.ANTHROPIC_API_KEY ? 'anthropic' : env.GEMINI_API_KEY ? 'gemini' : 'mock')) as ProviderName;
const apiKey = env.AI_MASCOT_API_KEY ?? { openai: env.OPENAI_API_KEY, anthropic: env.ANTHROPIC_API_KEY, gemini: env.GEMINI_API_KEY }[provider as 'openai'];
const instructions = env.AI_MASCOT_INSTRUCTIONS_FILE ? readFileSync(env.AI_MASCOT_INSTRUCTIONS_FILE, 'utf8') : env.AI_MASCOT_INSTRUCTIONS;
const knowledge = env.AI_MASCOT_KNOWLEDGE ? (JSON.parse(readFileSync(env.AI_MASCOT_KNOWLEDGE, 'utf8')) as KnowledgeFile) : undefined;
const allowedOrigins = env.AI_MASCOT_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
const port = Number(env.PORT ?? 8787);

const app = createMascotServer({ provider, model: env.AI_MASCOT_MODEL, apiKey, baseURL: env.AI_MASCOT_BASE_URL, instructions, knowledge, name: env.AI_MASCOT_NAME, allowedOrigins });
app.get('/', (c) => c.text('ai-mascot server is running. POST /api/chat'));

serve({ fetch: app.fetch, port }, () => {
  console.log(`ai-mascot server  http://localhost:${port}/api/chat  (provider: ${provider}${env.AI_MASCOT_MODEL ? ', model: ' + env.AI_MASCOT_MODEL : ''})`);
  if (knowledge) console.log(`  📚 ${knowledge.chunks.length} passages from ${knowledge.source}`);
  if (!allowedOrigins?.length) console.log('  ⚠ AI_MASCOT_ORIGINS is not set — any site can call this server. Set it before going live.');
  if (provider === 'mock') console.log('  ℹ Using the offline demo provider. Set AI_MASCOT_PROVIDER=ollama|openai|anthropic|gemini to use a real model.');
});
