import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    lib: { entry: 'src/index.ts', name: 'AiMascot', formats: ['es', 'iife'], fileName: (f) => (f === 'es' ? 'ai-mascot.js' : 'ai-mascot.iife.js') },
    minify: 'esbuild',
    sourcemap: true,
  },
});
