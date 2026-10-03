export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export interface Source { title: string; url: string }
export type StreamEvent = { delta: string } | { done: true } | { error: string } | { sources: Source[] };

/**
 * POSTs the conversation and yields events from the server's SSE stream.
 * Throws `HttpError` for non-2xx responses so the UI can show a friendly message.
 */
export async function* chatStream(endpoint: string, body: unknown, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
  const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal });
  if (!res.ok || !res.body) throw new HttpError(res.status);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.search(/\r?\n\r?\n/)) !== -1) {
      const block = buf.slice(0, i);
      buf = buf.slice(buf[i] === '\r' ? i + 4 : i + 2);
      const data = block.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('');
      if (!data) continue;
      try { yield JSON.parse(data) as StreamEvent; } catch { /* ignore broken lines */ }
    }
  }
}

export class HttpError extends Error {
  constructor(readonly status: number) { super(`http ${status}`); }
}
