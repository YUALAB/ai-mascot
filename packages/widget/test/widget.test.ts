import { afterEach, describe, expect, it, vi } from 'vitest';
import '../src/index.js';
import { palette, safeColor } from '../src/characters/color.js';

const enc = new TextEncoder();
function sse(events: unknown[]) {
  return new Response(new ReadableStream({ start(c) { for (const e of events) c.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`)); c.close(); } }), { headers: { 'content-type': 'text/event-stream' } });
}
const tick = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

describe('<ai-mascot>', () => {
  it('renders the character, name and greeting', () => {
    document.body.innerHTML = '<ai-mascot mode="inline" endpoint="/api/chat" name="ミケ" lang="ja"></ai-mascot>';
    const r = document.querySelector('ai-mascot')!.shadowRoot!;
    expect(r.querySelector('.char svg .m-eyes')).toBeTruthy();
    expect(r.querySelector('.nm')!.textContent).toBe('ミケ');
    expect(r.querySelector('.say')!.textContent).toContain('ミケ');
    expect(r.querySelector('.launcher')).toBeNull();
  });

  it('streams a reply into the bubble and keeps the conversation', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse([{ delta: 'Hel' }, { delta: 'lo!' }, { done: true }]));
    document.body.innerHTML = '<ai-mascot mode="inline" endpoint="/api/chat" lang="en" tone="genki"></ai-mascot>';
    const el = document.querySelector('ai-mascot') as HTMLElement & { ask(t: string): void };
    const got = new Promise<string>((res) => el.addEventListener('ai-mascot:reply', (e) => res((e as CustomEvent).detail.text)));
    el.ask('Hi there');
    expect(await got).toBe('Hello!');
    expect(el.shadowRoot!.querySelector('.say')!.textContent).toBe('Hello!');
    const sent = JSON.parse(String((fetchMock.mock.calls[0]![1] as RequestInit).body));
    expect(sent.messages).toEqual([{ role: 'user', content: 'Hi there' }]);
    expect(sent.persona).toEqual({ name: 'YUA', tone: 'genki' });
  });

  it('shows a friendly message when rate limited', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 429 }));
    document.body.innerHTML = '<ai-mascot mode="inline" endpoint="/api/chat" lang="en"></ai-mascot>';
    const el = document.querySelector('ai-mascot') as HTMLElement & { ask(t: string): void };
    el.ask('x');
    for (let i = 0; i < 10; i++) await tick();
    expect(el.shadowRoot!.querySelector('.say')!.textContent).toContain('wait a moment');
  });

  it('escapes user text in history', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse([{ delta: 'ok' }, { done: true }]));
    document.body.innerHTML = '<ai-mascot mode="inline" endpoint="/api/chat" lang="en"></ai-mascot>';
    const el = document.querySelector('ai-mascot') as HTMLElement & { ask(t: string): void };
    const done = new Promise((r) => el.addEventListener('ai-mascot:reply', r));
    el.ask('<img src=x onerror=alert(1)>');
    await done;
    (el.shadowRoot!.querySelector('.hist') as HTMLButtonElement).click();
    expect(el.shadowRoot!.querySelector('.log img')).toBeNull();
    expect(el.shadowRoot!.querySelector('.log .u')!.textContent).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('colors', () => {
  it('only accepts hex colors', () => {
    expect(safeColor('#abc', '#000')).toBe('#abc');
    expect(safeColor('red;background:url(x)', '#000')).toBe('#000');
  });
  it('builds a palette', () => {
    expect(palette('#a9c6e3').light).toMatch(/^hsl\(/);
  });
});

describe('language switch', () => {
  it('relabels the UI and keeps the conversation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse([{ delta: 'やあ' }, { done: true }]));
    document.body.innerHTML = '<ai-mascot mode="inline" endpoint="/api/chat" lang="ja"></ai-mascot>';
    const el = document.querySelector('ai-mascot') as HTMLElement & { ask(t: string): void };
    const done = new Promise((r) => el.addEventListener('ai-mascot:reply', r));
    el.ask('こんにちは');
    await done;
    el.setAttribute('lang', 'en');
    const r = el.shadowRoot!;
    expect((r.querySelector('textarea') as HTMLTextAreaElement).placeholder).toBe('Type a message');
    expect(r.querySelector('.say')!.textContent).toBe('やあ');
  });
});

describe('sources', () => {
  it('shows safe links to the pages the answer used', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(sse([{ sources: [{ title: 'Hours', url: 'https://shop.example/hours/' }, { title: 'bad', url: 'javascript:alert(1)' }] }, { delta: 'Closed Mondays.' }, { done: true }]));
    document.body.innerHTML = '<ai-mascot mode="inline" endpoint="/api/chat" lang="en"></ai-mascot>';
    const el = document.querySelector('ai-mascot') as HTMLElement & { ask(t: string): void };
    const done = new Promise((r) => el.addEventListener('ai-mascot:reply', r));
    el.ask('When are you closed?');
    await done;
    const links = [...el.shadowRoot!.querySelectorAll('.src a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['https://shop.example/hours/']);
  });
});
