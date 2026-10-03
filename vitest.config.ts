import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'server', include: ['packages/server/test/**/*.test.ts'], environment: 'node' } },
      { test: { name: 'create', include: ['packages/create-ai-mascot/test/**/*.test.ts'], environment: 'node' } },
      { test: { name: 'widget', include: ['packages/widget/test/**/*.test.ts'], environment: 'happy-dom' } },
    ],
  },
});
