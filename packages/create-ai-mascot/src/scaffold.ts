import { chmodSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type Provider = 'ollama' | 'openai' | 'anthropic' | 'gemini';

export interface Answers {
  dir: string;
  provider: Provider;
  apiKey?: string;
  model?: string;
  site?: string;
  name?: string;
  /** Version or path for the ai-mascot-server dependency. */
  serverVersion?: string;
}

const KEY_VAR: Record<Exclude<Provider, 'ollama'>, string> = { openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY', gemini: 'GEMINI_API_KEY' };

/** Writes a ready-to-run server folder. Returns the files it created. */
export function scaffold(a: Answers): string[] {
  if (existsSync(a.dir) && readdirSync(a.dir).length) throw new Error(`"${a.dir}" already exists and is not empty`);
  mkdirSync(a.dir, { recursive: true });
  const origin = a.site ? safeOrigin(a.site) : '';
  const env = [
    '# Keep this file secret. Never commit it.',
    `AI_MASCOT_PROVIDER=${a.provider}`,
    a.model ? `AI_MASCOT_MODEL=${a.model}` : a.provider === 'ollama' ? 'AI_MASCOT_MODEL=llama3.2' : '# AI_MASCOT_MODEL=',
    a.provider !== 'ollama' ? `${KEY_VAR[a.provider]}=${a.apiKey ?? ''}` : '',
    `AI_MASCOT_NAME=${a.name ?? 'YUA'}`,
    `AI_MASCOT_ORIGINS=${origin ? `${origin},http://localhost:5173` : 'http://localhost:5173'}`,
    'AI_MASCOT_INSTRUCTIONS_FILE=instructions.txt',
    a.site ? 'AI_MASCOT_KNOWLEDGE=knowledge.json' : '# AI_MASCOT_KNOWLEDGE=knowledge.json',
    'PORT=8787',
    '',
  ].filter((l) => l !== '').join('\n') + '\n';

  const run = 'node --env-file=.env ./node_modules/ai-mascot-server/dist/cli.js';
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: 'my-ai-mascot', private: true, type: 'module',
      scripts: { start: run, ...(a.site ? { index: `${run} index ${a.site} --out knowledge.json` } : {}) },
      dependencies: { 'ai-mascot-server': a.serverVersion ?? '^0.1.0' },
    }, null, 2) + '\n',
    '.env': env,
    '.gitignore': '.env\nnode_modules\n',
    'instructions.txt': '# Write facts about your business here. The mascot only answers from these and your site pages.\n# 例：営業時間は平日9時〜18時です。駐車場はありません。\n',
    'README.md': readme(a, origin),
  };
  for (const [name, body] of Object.entries(files)) writeFileSync(join(a.dir, name), body);
  chmodSync(join(a.dir, '.env'), 0o600);
  return Object.keys(files);
}

function safeOrigin(u: string): string {
  try { return new URL(u).origin; } catch { return ''; }
}

function readme(a: Answers, origin: string): string {
  return `# My ai-mascot server

## Start

\`\`\`bash
npm install${a.site ? '\nnpm run index      # read your site once (run again after big updates)' : ''}
npm start          # http://localhost:8787/api/chat
\`\`\`
${a.provider === 'ollama' ? '\nOllama must be running with a model: `ollama pull llama3.2`\n' : ''}
## Add to your website

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/ai-mascot" data-endpoint="https://YOUR-SERVER/api/chat" data-name="${a.name ?? 'YUA'}"></script>
\`\`\`

- Facts the mascot may use: \`instructions.txt\`${a.site ? ' and `knowledge.json` (your site pages)' : ''}
- Sites allowed to call this server: \`AI_MASCOT_ORIGINS\` in \`.env\`${origin ? ` (now: ${origin})` : ''}
- Keep \`.env\` secret. It holds your API key.

Docs: https://github.com/YUALAB/ai-mascot
`;
}
