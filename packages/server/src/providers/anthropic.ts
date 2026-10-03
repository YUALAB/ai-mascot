import { readSSE } from '../sse.js';
import type { Provider } from '../types.js';
import { UpstreamError } from './openai.js';

/** Claude via the Messages API (streaming). */
export function anthropic(o: { apiKey?: string; model: string; maxTokens?: number; baseURL?: string; fetch?: typeof fetch }): Provider {
  const f = o.fetch ?? fetch;
  return {
    async *stream({ system, messages, signal }) {
      const res = await f((o.baseURL ?? 'https://api.anthropic.com/v1').replace(/\/$/, '') + '/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': o.apiKey ?? '', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: o.model, system, max_tokens: o.maxTokens ?? 1024, stream: true, messages }),
        signal,
      });
      if (!res.ok || !res.body) throw new UpstreamError(res.status);
      for await (const data of readSSE(res.body)) {
        let j: { type?: string; delta?: { type?: string; text?: string } };
        try { j = JSON.parse(data); } catch { continue; }
        if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta' && j.delta.text) yield j.delta.text;
        if (j.type === 'message_stop') return;
      }
    },
  };
}
