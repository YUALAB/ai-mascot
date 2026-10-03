import { describe, expect, it } from 'vitest';
import { createMascotServer } from '../src/index.js';
import { chunkText, htmlToText, indexSite, Knowledge, terms } from '../src/knowledge.js';
import { readSSE } from '../src/sse.js';

const pages: Record<string, string> = {
  'https://shop.example/sitemap.xml': '<urlset><url><loc>https://shop.example/</loc></url><url><loc>https://shop.example/hours/</loc></url><url><loc>https://other.example/x</loc></url></urlset>',
  'https://shop.example/': '<html><head><title>Shinagawa Bakery</title></head><body><nav>Home | Menu</nav><main><h1>Welcome</h1><p>We bake bread every morning in Shinagawa. Our melon pan is the most popular item.</p></main><footer>© shop</footer></body></html>',
  'https://shop.example/hours/': '<html><head><title>営業時間</title></head><body><main><p>営業時間は朝8時から夕方6時までです。毎週月曜日は定休日です。</p><script>var secret=1</script></main></body></html>',
};
const fakeFetch = (async (u: string) => (pages[u] ? new Response(pages[u]) : new Response('nf', { status: 404 }))) as typeof fetch;

describe('text tools', () => {
  it('extracts readable text, skipping nav, footer and scripts', () => {
    const r = htmlToText(pages['https://shop.example/hours/']!);
    expect(r.title).toBe('営業時間');
    expect(r.text).toContain('定休日');
    expect(r.text).not.toContain('secret');
    expect(htmlToText(pages['https://shop.example/']!).text).not.toContain('Home | Menu');
  });
  it('splits text into passages', () => {
    const parts = chunkText('あ'.repeat(30) + '。' + 'い'.repeat(500) + '。', 200);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((p) => p.length <= 300)).toBe(true);
  });
  it('makes words for English and two-character pieces for Japanese', () => {
    expect([...terms('Melon pan')].map(([t]) => t)).toEqual(['melon', 'pan']);
    expect([...terms('定休日')].map(([t]) => t)).toEqual(['定休', '休日']);
  });
});

describe('indexSite + Knowledge', () => {
  it('reads the sitemap, stays on the same site, and finds the right page', async () => {
    const kb = await indexSite('https://shop.example/', { fetch: fakeFetch, delayMs: 0 });
    expect(new Set(kb.chunks.map((c) => c.url))).toEqual(new Set(['https://shop.example/', 'https://shop.example/hours/']));
    const k = Knowledge.from(kb);
    expect(k.search('月曜日は休みですか？')[0]?.chunk.url).toBe('https://shop.example/hours/');
    expect(k.search('what is your most popular bread?')[0]?.chunk.url).toBe('https://shop.example/');
    expect(k.search('xyzzy')).toEqual([]);
  });
  it('falls back to following links when there is no sitemap', async () => {
    const site: Record<string, string> = {
      'https://a.example/': '<body><main><p>Start page with enough text to be kept as a passage.</p><a href="/b">b</a><a href="https://evil.example/">x</a></main></body>',
      'https://a.example/b': '<body><main><p>Second page with enough text to be kept as a passage.</p></main></body>',
    };
    const f = (async (u: string) => (site[u] ? new Response(site[u]) : new Response('', { status: 404 }))) as typeof fetch;
    const kb = await indexSite('https://a.example/', { fetch: f, delayMs: 0 });
    expect(kb.chunks.map((c) => c.url)).toEqual(['https://a.example/', 'https://a.example/b']);
  });
});

describe('server with knowledge', () => {
  it('sends the matching pages as sources and puts them in the prompt', async () => {
    const kb = await indexSite('https://shop.example/', { fetch: fakeFetch, delayMs: 0 });
    let system = '';
    const app = createMascotServer({ knowledge: kb, providerInstance: { async *stream(i) { system = i.system; yield 'ok'; } } });
    const res = await app.request('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: '定休日はいつ？' }] }) });
    const ev: { sources?: { url: string }[] }[] = [];
    for await (const d of readSSE(res.body!)) ev.push(JSON.parse(d));
    expect(ev[0]?.sources?.[0]?.url).toBe('https://shop.example/hours/');
    expect(system).toContain('毎週月曜日は定休日');
  });
});
