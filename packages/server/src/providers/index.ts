import type { Provider, ProviderOptions } from '../types.js';
import { anthropic } from './anthropic.js';
import { mock } from './mock.js';
import { openAICompatible } from './openai.js';

const DEFAULTS = {
  openai: { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  gemini: { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' },
  ollama: { baseURL: 'http://localhost:11434/v1', model: 'llama3.2' },
  anthropic: { baseURL: 'https://api.anthropic.com/v1', model: 'claude-haiku-4-5' },
} as const;

export function createProvider(o: ProviderOptions): Provider {
  switch (o.provider) {
    case 'mock':
      return mock();
    case 'anthropic':
      return anthropic({ apiKey: o.apiKey, model: o.model ?? DEFAULTS.anthropic.model, maxTokens: o.maxTokens, baseURL: o.baseURL, fetch: o.fetch });
    case 'openai':
    case 'gemini':
    case 'ollama': {
      const d = DEFAULTS[o.provider];
      return openAICompatible({ baseURL: o.baseURL ?? d.baseURL, apiKey: o.apiKey, model: o.model ?? d.model, maxTokens: o.maxTokens, fetch: o.fetch });
    }
    case 'openai-compatible':
      if (!o.baseURL || !o.model) throw new Error('openai-compatible needs baseURL and model');
      return openAICompatible({ baseURL: o.baseURL, apiKey: o.apiKey, model: o.model, maxTokens: o.maxTokens, fetch: o.fetch });
    default:
      throw new Error(`unknown provider: ${String((o as { provider: unknown }).provider)}`);
  }
}

export { anthropic, mock, openAICompatible };
