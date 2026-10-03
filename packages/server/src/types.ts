export type Role = 'user' | 'assistant';
export interface ChatMessage { role: Role; content: string }

export type Tone = 'polite' | 'friendly' | 'genki';
export interface Persona { name?: string; tone?: Tone }

export type Lang = 'ja' | 'en';

/** A provider turns a conversation into a stream of text pieces. */
export interface Provider {
  stream(input: { system: string; messages: ChatMessage[]; signal?: AbortSignal }): AsyncIterable<string>;
}

export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openai-compatible' | 'mock';

export interface ProviderOptions {
  provider: ProviderName;
  model?: string;
  apiKey?: string;
  /** Override the API base URL (OpenAI-compatible providers only). */
  baseURL?: string;
  /** Upper bound for the reply length. */
  maxTokens?: number;
  /** Swap in your own fetch (tests, proxies). */
  fetch?: typeof fetch;
}
