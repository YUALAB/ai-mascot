/**
 * Reads a Server-Sent Events body and yields each `data:` payload.
 * Handles events split across network chunks and CRLF line endings.
 */
export async function* readSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = buf.search(/\r?\n\r?\n/)) !== -1) {
        const raw = buf.slice(0, sep);
        buf = buf.slice(buf[sep] === '\r' ? sep + 4 : sep + 2);
        const data = raw
          .split(/\r?\n/)
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).replace(/^ /, ''))
          .join('\n');
        if (data) yield data;
      }
    }
    buf += decoder.decode();
    const tail = buf.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).replace(/^ /, '')).join('\n');
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
