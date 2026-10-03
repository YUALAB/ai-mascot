#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { scaffold, type Answers, type Provider } from './scaffold.js';

const args = process.argv.slice(2);
const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const yes = args.includes('--yes') || args.includes('-y');
const PROVIDERS: { id: Provider; label: string }[] = [
  { id: 'ollama', label: 'Ollama — free, runs on your computer, no API key' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Claude (Anthropic)' },
  { id: 'gemini', label: 'Gemini (Google)' },
];

const rl = yes ? null : createInterface({ input: stdin, output: stdout });
const ask = async (q: string, def = '') => (rl ? (await rl.question(`${q}${def ? ` (${def})` : ''}: `)).trim() || def : def);

console.log('\n  🐱 create-ai-mascot\n');
const valueOf = new Set(['--dir', '--provider', '--site', '--name'].map((n) => flag(n)).filter(Boolean));
const positional = args.find((a) => !a.startsWith('-') && !valueOf.has(a));
const dir = flag('--dir') ?? positional ?? (await ask('Folder', 'my-ai-mascot'));

let provider = flag('--provider') as Provider | undefined;
if (!provider) {
  if (rl) PROVIDERS.forEach((p, i) => console.log(`  ${i + 1}) ${p.label}`));
  const n = Number(await ask('Which AI?', '1'));
  provider = PROVIDERS[Math.min(Math.max(n, 1), 4) - 1]!.id;
}
const keyVar = { openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY', gemini: 'GEMINI_API_KEY' }[provider as 'openai'];
const apiKey = provider === 'ollama' ? undefined : process.env[keyVar] || (await ask(`${keyVar} (saved only in .env)`));
const site = flag('--site') ?? (await ask('Your website URL, to answer from its pages (optional)'));
const name = flag('--name') ?? (await ask("Mascot's name", 'YUA'));
rl?.close();

const answers: Answers = { dir, provider, apiKey, site: site || undefined, name, serverVersion: process.env.CREATE_AI_MASCOT_SERVER };
const files = scaffold(answers);

console.log(`\n  ✔ Created ${dir}/  (${files.join(', ')})\n`);
if (!args.includes('--no-install')) {
  console.log('  Installing…');
  const r = spawnSync('npm', ['install', '--silent'], { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) console.log('  (npm install failed — run it yourself inside the folder)');
}
console.log(`  Next:\n    cd ${dir}${site ? '\n    npm run index' : ''}\n    npm start\n`);
console.log('  Then add this to your website:');
console.log(`    <script src="https://cdn.jsdelivr.net/npm/ai-mascot" data-endpoint="http://localhost:8787/api/chat" data-name="${name}"></script>\n`);
