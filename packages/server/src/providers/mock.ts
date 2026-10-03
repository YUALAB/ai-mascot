import type { Provider } from '../types.js';

/** Offline provider for demos and tests. Replies with a short canned answer, streamed word by word. */
export function mock(o: { delayMs?: number } = {}): Provider {
  return {
    async *stream({ messages, signal }) {
      const last = messages[messages.length - 1]?.content ?? '';
      const ja = /[぀-ヿ一-龯]/.test(last);
      const text = ja
        ? `「${last.slice(0, 40)}」ですね。これはデモ用の返事です。サーバーにAIをつなぐと、ここに本物の答えが流れます。`
        : `You said "${last.slice(0, 40)}". This is a demo reply — connect a provider and real answers will stream here.`;
      for (const piece of text.match(/.{1,3}/gsu) ?? []) {
        if (signal?.aborted) return;
        await new Promise((r) => setTimeout(r, o.delayMs ?? 35));
        yield piece;
      }
    },
  };
}
