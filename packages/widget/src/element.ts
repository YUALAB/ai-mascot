import { getCharacter, renderCharacter } from './characters/index.js';
import { safeColor } from './characters/color.js';
import { pickLang, STRINGS, type Lang } from './i18n.js';
import { chatStream, HttpError, type ChatMessage } from './stream.js';
import { css } from './styles.js';

const ICON = {
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};
const TONES = ['polite', 'friendly', 'genki'] as const;
const CREDIT_URL = 'https://github.com/YUALAB/ai-mascot';

/**
 * <ai-mascot endpoint="/api/chat"></ai-mascot>
 *
 * Attributes: endpoint, character, color, accessory, name, tone, lang,
 * mode ("floating" | "inline"), position ("right" | "left"), theme ("auto" | "light" | "dark"),
 * greeting, placeholder, suggestions ("a|b|c"), credit ("false" hides it).
 */
export class AiMascot extends HTMLElement {
  static observedAttributes = ['character', 'color', 'accessory', 'name', 'tone', 'lang', 'greeting'];

  private root: ShadowRoot;
  private messages: ChatMessage[] = [];
  private busy = false;
  private abort?: AbortController;
  private talkTimer = 0;
  private built = false;
  private $ = <T extends Element = HTMLElement>(sel: string) => this.root.querySelector(sel) as T;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  private get language(): Lang { return pickLang(this.getAttribute('lang')); }
  private get t() { return STRINGS[this.language]; }
  /** The name attribute, or the character's own name (YUA, KOTA, MOCHI…). */
  private get mascotName() { return (this.getAttribute('name') ?? '').trim().slice(0, 16) || getCharacter(this.getAttribute('character')).label.split(' ')[0]!; }
  private get reduce() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }

  connectedCallback() {
    if (!this.hasAttribute('mode')) this.setAttribute('mode', 'floating');
    if (!this.hasAttribute('theme')) this.setAttribute('theme', 'auto');
    if (!this.built) this.build();
    window.addEventListener('pointermove', this.onPointer, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('pointermove', this.onPointer);
    this.abort?.abort();
  }

  attributeChangedCallback(name: string, oldValue: string | null, value: string | null) {
    if (!this.built || oldValue === value) return;
    // A new language changes every label, so rebuild the UI (the conversation is kept).
    if (name === 'lang') { this.build(); return; }
    this.drawCharacter();
    if (!this.messages.length) this.showGreeting();
  }

  /** Opens the floating panel. */
  open() {
    this.setAttribute('data-open', '');
    this.setAttribute('data-peeked', '');
    this.$('.launcher')?.setAttribute('aria-expanded', 'true');
    this.wave();
    setTimeout(() => this.$<HTMLTextAreaElement>('textarea').focus(), 250);
  }

  close() {
    this.removeAttribute('data-open');
    const l = this.$<HTMLButtonElement>('.launcher');
    l?.setAttribute('aria-expanded', 'false');
    l?.focus();
  }

  /** Sends a message as if the visitor typed it. */
  ask(text: string) { void this.send(text); }

  private build() {
    this.built = true;
    const t = this.t;
    const floating = this.getAttribute('mode') !== 'inline';
    const chips = (this.getAttribute('suggestions') ?? '').split('|').map((s) => s.trim()).filter(Boolean).slice(0, 4);
    this.root.innerHTML = `<style>${css}</style>
${floating ? `<button class="launcher" type="button" aria-expanded="false" aria-label="${esc(t.open)}"><span class="mini"></span></button><div class="peek" aria-hidden="true">${esc(t.peek)}</div>` : ''}
<section class="panel" role="${floating ? 'dialog' : 'region'}" aria-label="${esc(this.mascotName)}">
  <div class="head"><span class="dot" aria-hidden="true"></span><b class="nm"></b><span class="sp"></span>
    <button class="icon hist" type="button" aria-pressed="false" aria-label="${esc(t.history)}" title="${esc(t.history)}">${ICON.history}</button>
    ${floating ? `<button class="icon x" type="button" aria-label="${esc(t.close)}" title="${esc(t.close)}">${ICON.close}</button>` : ''}
  </div>
  <div class="stage">
    <div class="char"></div>
    <div class="bubble"><div class="me" hidden></div><div class="say"></div><div class="src" hidden></div></div>
  </div>
  <div class="log" hidden></div>
  <div class="chips"${chips.length ? '' : ' hidden'}>${chips.map((c) => `<button type="button">${esc(c)}</button>`).join('')}</div>
  <form class="form"><label class="sr" for="m-in">${esc(t.placeholder)}</label>
    <textarea id="m-in" rows="1" maxlength="1000" placeholder="${esc(this.getAttribute('placeholder') ?? t.placeholder)}" enterkeyhint="send"></textarea>
    <button class="send" type="submit" aria-label="${esc(t.send)}" disabled>${ICON.send}</button>
  </form>
  <div class="foot"><span>${esc(t.note)}</span>${this.getAttribute('credit') === 'false' ? '' : `<a href="${CREDIT_URL}" target="_blank" rel="noopener">Made by AQUA</a>`}</div>
  <div class="sr" aria-live="polite"></div>
</section>`;

    this.drawCharacter();
    const last = this.messages.at(-1);
    if (last?.role === 'assistant') this.$('.say').textContent = last.content;
    else this.showGreeting();
    if (this.messages.length) this.$('.chips').hidden = true;

    const ta = this.$<HTMLTextAreaElement>('textarea');
    const sendBtn = this.$<HTMLButtonElement>('.send');
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
      sendBtn.disabled = this.busy || !ta.value.trim();
    });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); this.$<HTMLFormElement>('.form').requestSubmit(); }
    });
    this.$<HTMLFormElement>('.form').addEventListener('submit', (e) => { e.preventDefault(); void this.send(ta.value); });
    this.root.querySelectorAll<HTMLButtonElement>('.chips button').forEach((b) => b.addEventListener('click', () => void this.send(b.textContent ?? '')));
    this.$('.hist').addEventListener('click', () => this.toggleHistory());
    this.$('.launcher')?.addEventListener('click', () => this.open());
    this.$('.x')?.addEventListener('click', () => this.close());
    this.root.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Escape' && this.hasAttribute('data-open')) this.close(); });
    if (this.hasAttribute('open') || this.hasAttribute('data-open')) this.open();
  }

  private drawCharacter() {
    const ch = getCharacter(this.getAttribute('character'));
    const accessory = ch.accessories.includes(this.getAttribute('accessory') ?? '') ? this.getAttribute('accessory')! : 'none';
    const opts = { color: safeColor(this.getAttribute('color'), ch.defaultColor), accessory };
    const svg = renderCharacter(ch, opts);
    const host = this.$('.char');
    host.innerHTML = svg;
    host.style.cssText = `--o-head:${ch.origins.head};--o-tail:${ch.origins.tail};--o-wave:${ch.origins.wave};--o-ear:${ch.origins.ear}`;
    const mini = this.$('.mini');
    if (mini) mini.innerHTML = renderCharacter(ch, opts).replace(`viewBox="${ch.viewBox}"`, 'viewBox="20 8 200 200"');
    this.$('.nm').textContent = this.mascotName;
    this.$('.panel').setAttribute('aria-label', this.mascotName);
  }

  private showGreeting() {
    const g = this.getAttribute('greeting') ?? this.t.greeting(this.mascotName);
    this.$('.say').textContent = g;
    this.$('.me').hidden = true;
  }

  private async send(raw: string) {
    const text = raw.trim().slice(0, 1000);
    if (!text || this.busy) return;
    const endpoint = this.getAttribute('endpoint');
    const ta = this.$<HTMLTextAreaElement>('textarea');
    ta.value = ''; ta.style.height = 'auto';
    this.$('.chips').hidden = true;
    if (this.$('.log').hidden === false) this.toggleHistory(false);

    this.messages.push({ role: 'user', content: text });
    const me = this.$('.me');
    me.textContent = text; me.hidden = false;
    const say = this.$('.say');
    say.innerHTML = `<span class="dots" aria-label="${esc(this.t.thinking)}"><i></i><i></i><i></i></span>`;
    this.showSources([]);
    this.setBusy(true);
    this.state('think');

    let reply = '';
    let failed: string | null = null;
    this.abort = new AbortController();
    try {
      if (!endpoint) throw new Error('missing endpoint attribute');
      const tone = TONES.find((x) => x === this.getAttribute('tone'));
      const body = { messages: this.messages.slice(-12), persona: { name: this.mascotName, tone }, lang: this.language };
      for await (const ev of chatStream(endpoint, body, this.abort.signal)) {
        if ('sources' in ev) { this.showSources(ev.sources); continue; }
        if ('delta' in ev) {
          if (!reply) { say.textContent = ''; say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop'); }
          reply += ev.delta;
          say.textContent = reply;
          say.scrollTop = say.scrollHeight;
          this.talk();
        } else if ('error' in ev) { failed = this.t.errUpstream; break; }
        else if ('done' in ev) break;
      }
      if (!reply && !failed) failed = this.t.errUpstream;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      failed = e instanceof HttpError && e.status === 429 ? this.t.errRate : this.t.errNet;
    } finally {
      this.setBusy(false);
      this.state(null);
    }

    if (failed) {
      say.textContent = failed;
      this.messages.pop();
    } else {
      this.messages.push({ role: 'assistant', content: reply });
      this.$('.sr[aria-live]').textContent = reply;
      this.dispatchEvent(new CustomEvent('ai-mascot:reply', { detail: { text: reply }, bubbles: true, composed: true }));
    }
  }

  /** Links to the pages the answer was based on. Only http(s) links are shown. */
  private showSources(list: { title: string; url: string }[]) {
    const box = this.$('.src');
    const safe = list.filter((s) => /^https?:\/\//i.test(s.url)).slice(0, 3);
    box.hidden = !safe.length;
    box.innerHTML = safe.length
      ? `<small>${esc(this.t.sources)}</small>` + safe.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title.slice(0, 60))}</a>`).join('')
      : '';
  }

  private setBusy(v: boolean) {
    this.busy = v;
    const ta = this.$<HTMLTextAreaElement>('textarea');
    this.$<HTMLButtonElement>('.send').disabled = v || !ta.value.trim();
  }

  /** Mouth moves while text is arriving, and stops shortly after the last piece. */
  private talk() {
    const c = this.$('.char');
    c.classList.remove('think');
    c.classList.add('talk');
    clearTimeout(this.talkTimer);
    this.talkTimer = window.setTimeout(() => c.classList.remove('talk'), 320);
  }

  private state(s: 'think' | null) {
    const c = this.$('.char');
    c.classList.toggle('think', s === 'think');
  }

  private wave() {
    if (this.reduce) return;
    const c = this.$('.char');
    c.classList.remove('wave'); void c.getBoundingClientRect(); c.classList.add('wave');
    setTimeout(() => c.classList.remove('wave'), 1700);
  }

  private toggleHistory(force?: boolean) {
    const log = this.$('.log');
    const show = force ?? log.hidden;
    log.hidden = !show;
    this.$('.stage').hidden = show;
    this.$('.hist').setAttribute('aria-pressed', String(show));
    if (!show) return;
    log.innerHTML = this.messages.length
      ? this.messages.map((m) => `<p class="${m.role === 'user' ? 'u' : 'a'}">${esc(m.content)}</p>`).join('')
      : `<p class="empty">${esc(this.t.historyEmpty)}</p>`;
    log.scrollTop = log.scrollHeight;
  }

  /** Eyes follow the pointer a little. */
  private raf = 0;
  private onPointer = (e: PointerEvent) => {
    if (this.reduce || e.pointerType !== 'mouse' || this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      const eyes = this.root.querySelectorAll<SVGGElement>('.m-eyes');
      eyes.forEach((g) => {
        const r = g.closest('svg')!.getBoundingClientRect();
        if (!r.width) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.4);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 300);
        g.style.transform = `translate(${((dx / d) * 5 * k).toFixed(2)}px, ${((dy / d) * 4 * k).toFixed(2)}px)`;
      });
    });
  };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
