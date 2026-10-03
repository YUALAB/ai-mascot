import { getCharacter, listCharacters } from 'ai-mascot';

const m = document.getElementById('m')!;
const COLORS = ['#a9c6e3', '#e8bf8e', '#c9a27e', '#b9c6d3', '#c7d2ff', '#f2c6a0', '#c9b6e8', '#a8dcc0', '#f4b6c2', '#d9d9d9', '#8f8f8f'];
const groups: Record<string, string[]> = {
  character: listCharacters().map((c) => c.id),
  accessory: ['none', 'headset', 'coat', 'bowtie'],
  tone: ['polite', 'friendly', 'genki'],
  lang: ['en', 'ja'],
};

const state: Record<string, string> = { character: 'cat', color: COLORS[0]!, accessory: 'none', tone: 'friendly', lang: navigator.language.startsWith('ja') ? 'ja' : 'en', name: 'YUA' };

function apply() {
  const ch = getCharacter(state.character!);
  if (!ch.accessories.includes(state.accessory!)) state.accessory = 'none';
  document.querySelectorAll<HTMLButtonElement>('[data-k="accessory"]').forEach((b) => (b.disabled = !ch.accessories.includes(b.dataset.v!)));
  for (const [k, v] of Object.entries(state)) m.setAttribute(k, v);
  const attrs = Object.entries(state).filter(([k, v]) => !(k === 'accessory' && v === 'none') && !(k === 'character' && v === 'cat')).map(([k, v]) => ` data-${k}="${v}"`).join('');
  document.getElementById('code')!.textContent = `<script src="https://cdn.jsdelivr.net/npm/ai-mascot"\n  data-endpoint="/api/chat"${attrs}></script>`;
  document.querySelectorAll<HTMLButtonElement>('[data-k]').forEach((b) => b.setAttribute('aria-pressed', String(state[b.dataset.k!] === b.dataset.v)));
}

const sw = document.getElementById('color')!;
for (const c of COLORS) {
  const b = document.createElement('button');
  b.type = 'button'; b.style.background = c; b.dataset.k = 'color'; b.dataset.v = c; b.setAttribute('aria-label', c);
  b.onclick = () => { state.color = c; apply(); };
  sw.appendChild(b);
}
for (const [k, list] of Object.entries(groups)) {
  const box = document.getElementById(k)!;
  for (const v of list) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = v; b.dataset.k = k; b.dataset.v = v;
    b.onclick = () => {
      state[k] = v;
      if (k === 'character') { const c = getCharacter(v); state.color = c.defaultColor; state.name = c.label.split(' ')[0]!; (document.getElementById('name') as HTMLInputElement).value = state.name; }
      apply();
    };
    box.appendChild(b);
  }
}
document.getElementById('name')!.addEventListener('input', (e) => { state.name = (e.target as HTMLInputElement).value || 'YUA'; apply(); });
apply();
