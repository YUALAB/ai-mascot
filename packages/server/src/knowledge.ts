/**
 * Site knowledge: read a website once, keep the text in a small JSON file,
 * and find the most relevant passages for each question.
 *
 * Search is BM25 over words (Latin script) and two-character pieces (Japanese/Chinese),
 * so it works for both without any dictionary or extra dependency.
 */

export interface Chunk { url: string; title: string; text: string }
export interface KnowledgeFile { version: 1; createdAt: string; source: string; chunks: Chunk[] }
export interface Hit { chunk: Chunk; score: number }

export class Knowledge {
  private docs: Map<string, number>[];
  private df = new Map<string, number>();
  private avg: number;

  constructor(readonly chunks: Chunk[]) {
    this.docs = chunks.map((c) => {
      const g = terms(c.text);
      for (const [t, v] of terms(c.title)) g.set(t, (g.get(t) ?? 0) + 3 * v);
      return g;
    });
    let total = 0;
    for (const g of this.docs) {
      for (const [t, v] of g) { total += v; this.df.set(t, (this.df.get(t) ?? 0) + 1); }
    }
    this.avg = total / Math.max(1, this.docs.length);
  }

  static from(file: KnowledgeFile | Chunk[]): Knowledge {
    return new Knowledge(Array.isArray(file) ? file : file.chunks);
  }

  search(query: string, k = 3): Hit[] {
    const q = terms(query);
    if (!q.size) return [];
    const N = this.docs.length, k1 = 1.2, b = 0.75;
    const hits: Hit[] = [];
    this.docs.forEach((g, i) => {
      let len = 0;
      for (const v of g.values()) len += v;
      let score = 0;
      for (const t of q.keys()) {
        const tf = g.get(t);
        if (!tf) continue;
        const df = this.df.get(t) ?? 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * len) / this.avg));
      }
      if (score > 0.4) hits.push({ chunk: this.chunks[i]!, score });
    });
    return hits.sort((a, z) => z.score - a.score).slice(0, k);
  }
}

const CJK = /[぀-ヿ㐀-鿿豈-﫿가-힯]/;

/** Words for Latin text, overlapping two-character pieces for CJK text. */
export function terms(s: string): Map<string, number> {
  const out = new Map<string, number>();
  const add = (t: string, n = 1) => out.set(t, (out.get(t) ?? 0) + n);
  for (const w of s.toLowerCase().normalize('NFKC').split(/[^\p{L}\p{N}ー]+/u)) {
    if (!w) continue;
    if (!CJK.test(w)) { if (w.length > 1 && !STOP.has(w)) add(w, 2); continue; }
    const chars = [...w];
    if (chars.length === 1) add(w);
    for (let i = 0; i < chars.length - 1; i++) add(chars[i]! + chars[i + 1]!);
  }
  return out;
}

const STOP = new Set('the a an and or of to in on for is are was be it this that with as at by from you your we our can do does how what'.split(' '));

/** Turns an HTML page into its readable text and title. No dependencies, good enough for most sites. */
export function htmlToText(html: string): { title: string; text: string } {
  const title = decode((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').trim());
  let body = /<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? /<body[\s\S]*<\/body>/i.exec(html)?.[0] ?? html;
  body = body
    .replace(/<(script|style|noscript|svg|template|iframe|nav|footer|header|form)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article|\/dd|\/dt|\/summary)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  const text = decode(body).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
  return { title, text };
}

function decode(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)));
}

/** Splits text into passages of roughly `size` characters, breaking at sentence ends. */
export function chunkText(text: string, size = 420): string[] {
  const sentences = text.split(/(?<=[。．！？!?.])\s*|\n+/u).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if (cur && cur.length + s.length > size) { out.push(cur); cur = ''; }
    cur += (cur ? ' ' : '') + s;
    while (cur.length > size * 1.5) { out.push(cur.slice(0, size)); cur = cur.slice(size); }
  }
  if (cur) out.push(cur);
  return out.filter((c) => c.length > 20);
}

export interface IndexOptions {
  /** Most pages to read. Default 50. */
  maxPages?: number;
  /** Wait between requests, to be gentle with the site. Default 300 ms. */
  delayMs?: number;
  fetch?: typeof fetch;
  onPage?: (url: string, n: number) => void;
}

/** Reads a site (sitemap.xml first, otherwise links from the home page) and builds a knowledge file. */
export async function indexSite(start: string, o: IndexOptions = {}): Promise<KnowledgeFile> {
  const f = o.fetch ?? fetch;
  const max = o.maxPages ?? 50;
  const origin = new URL(start).origin;
  const get = async (u: string) => {
    try {
      const r = await f(u, { headers: { 'user-agent': 'ai-mascot-indexer (+https://github.com/YUALAB/ai-mascot)' }, redirect: 'follow' });
      return r.ok ? await r.text() : null;
    } catch { return null; }
  };
  const sameSite = (u: string) => { try { const x = new URL(u, start); return x.origin === origin ? x.href.split('#')[0]! : null; } catch { return null; } };

  // 1) sitemap(s)
  const queue: string[] = [];
  const sitemaps = [origin + '/sitemap.xml'];
  for (let i = 0; i < sitemaps.length && i < 10 && queue.length < max; i++) {
    const xml = await get(sitemaps[i]!);
    if (!xml) continue;
    for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      const u = sameSite(decode(m[1]!));
      if (!u) continue;
      if (/\.xml(\?|$)/.test(u)) {
        // Fixed pages (about, services, pricing) matter more than old posts, so read page sitemaps first.
        if (/page/i.test(u)) sitemaps.splice(i + 1, 0, u); else sitemaps.push(u);
      } else if (!queue.includes(u)) queue.push(u);
    }
  }
  // 2) fall back to following links from the start page
  const crawl = !queue.length;
  if (crawl) queue.push(sameSite(start) ?? start);

  const seen = new Set<string>();
  const chunks: Chunk[] = [];
  while (queue.length && seen.size < max) {
    const url = queue.shift()!;
    if (seen.has(url) || /\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4|mov|css|js)(\?|$)/i.test(url)) continue;
    seen.add(url);
    const html = await get(url);
    if (!html) continue;
    o.onPage?.(url, seen.size);
    const { title, text } = htmlToText(html);
    for (const t of chunkText(text)) chunks.push({ url, title, text: t });
    if (crawl) for (const m of html.matchAll(/href="([^"]+)"/g)) { const u = sameSite(m[1]!); if (u && !seen.has(u)) queue.push(u); }
    if (o.delayMs !== 0) await new Promise((r) => setTimeout(r, o.delayMs ?? 300));
  }
  return { version: 1, createdAt: new Date().toISOString(), source: start, chunks };
}
