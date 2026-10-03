import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scaffold } from '../src/scaffold.js';

describe('scaffold', () => {
  it('writes a server folder with a private .env', () => {
    const dir = join(mkdtempSync(join(tmpdir(), 'cam-')), 'app');
    const files = scaffold({ dir, provider: 'anthropic', apiKey: 'sk-ant-secret', site: 'https://shop.example/about', name: 'ミケ' });
    expect(files).toEqual(['package.json', '.env', '.gitignore', 'instructions.txt', 'README.md']);
    const env = readFileSync(join(dir, '.env'), 'utf8');
    expect(env).toContain('ANTHROPIC_API_KEY=sk-ant-secret');
    expect(env).toContain('AI_MASCOT_ORIGINS=https://shop.example,http://localhost:5173');
    expect(env).toContain('AI_MASCOT_KNOWLEDGE=knowledge.json');
    expect(statSync(join(dir, '.env')).mode & 0o777).toBe(0o600);
    expect(readFileSync(join(dir, '.gitignore'), 'utf8')).toContain('.env');
    expect(readFileSync(join(dir, 'README.md'), 'utf8')).not.toContain('sk-ant-secret');
    expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).scripts.index).toContain('index https://shop.example/about');
  });
  it('refuses to overwrite a folder that has files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cam-'));
    scaffold({ dir: join(dir, 'a'), provider: 'ollama' });
    expect(() => scaffold({ dir: join(dir, 'a'), provider: 'ollama' })).toThrow('not empty');
  });
});
