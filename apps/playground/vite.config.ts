import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Uses the widget source directly, and proxies /api to the ai-mascot server (default http://localhost:8787).
export default defineConfig({
  resolve: { alias: { 'ai-mascot': fileURLToPath(new URL('../../packages/widget/src/index.ts', import.meta.url)) } },
  server: { port: 5173, proxy: { '/api': process.env.AI_MASCOT_URL ?? 'http://localhost:8787' } },
});
