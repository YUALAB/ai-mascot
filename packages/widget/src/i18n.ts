export type Lang = 'ja' | 'en';

export const STRINGS = {
  ja: {
    open: 'AIアシスタントと話す',
    close: '閉じる',
    greeting: (name: string) => `こんにちは、${name}です。気になることを、なんでも聞いてください。`,
    placeholder: 'メッセージを入力',
    send: '送信',
    history: 'これまでの会話',
    historyEmpty: 'まだ会話はありません。',
    back: '戻る',
    thinking: '考え中…',
    you: 'あなた',
    errRate: 'たくさん話しかけてくれてありがとう。少し時間をおいてから、また聞いてください。',
    errNet: 'うまくつながりませんでした。少し時間をおいて、もう一度試してください。',
    errUpstream: 'いまうまく答えられませんでした。もう一度試してください。',
    note: 'AIの回答です。大事なことは確認してください。',
    peek: '質問してね',
    sources: '参考にしたページ',
  },
  en: {
    open: 'Chat with the AI assistant',
    close: 'Close',
    greeting: (name: string) => `Hi, I'm ${name}! Ask me anything about this site.`,
    placeholder: 'Type a message',
    send: 'Send',
    history: 'Conversation',
    historyEmpty: 'No messages yet.',
    back: 'Back',
    thinking: 'Thinking…',
    you: 'You',
    errRate: 'Thanks for all the questions! Please wait a moment and try again.',
    errNet: "I couldn't connect. Please try again in a moment.",
    errUpstream: "I couldn't answer that just now. Please try again.",
    note: 'Answers are AI-generated. Please double-check anything important.',
    peek: 'Ask me!',
    sources: 'From this site',
  },
} as const;

export function pickLang(attr: string | null): Lang {
  if (attr === 'ja' || attr === 'en') return attr;
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return nav.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}
