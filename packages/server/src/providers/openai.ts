import { readSSE } from '../sse.js';
import type { ChatMessage, Provider } from '../types.js';

/** Any API that speaks the OpenAI Chat Completions format: OpenAI, Gemini, Ollama, LM Studio, vLLM, OpenRouter… */
export function openAICompatible(o: { baseURL: string; apiKey?: string; model: string; maxTokens?: number; fetch?: typeof fetch }): Provider {
  const f = o.fetch ?? fetch;
  return {
    async *stream({ system, messages, signal }) {
      const res = await f(o.baseURL.replace(/\/$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(o.apiKey ? { authorization: `Bearer ${o.apiKey}` } : {}) },
        body: JSON.stringify({
          model: o.model,
          stream: true,
          max_tokens: o.maxTokens,
          messages: [{ role: 'system', content: system }, ...messages.map((m: ChatMessage) => ({ role: m.role, content: m.content }))],
        }),
        signal,
      });
      if (!res.ok || !res.body) throw new UpstreamError(res.status);
      for await (const data of readSSE(res.body)) {
        if (data === '[DONE]') return;
        let j: { choices?: { delta?: { content?: string | null } }[] };
        try { j = JSON.parse(data); } catch { continue; }
        const t = j.choices?.[0]?.delta?.content;
        if (t) yield t;
      }
    },
  };
}

export class UpstreamError extends Error {
  constructor(readonly status: number) { super(`upstream ${status}`); }
}
