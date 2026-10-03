export const css = /* css */ `
:host {
  --m-accent: #0a7ea4;
  --m-accent-ink: #fff;
  --m-bg: #ffffff;
  --m-surface: #f3f7fa;
  --m-text: #0f2733;
  --m-sub: #557083;
  --m-line: #dbe5ec;
  --m-bubble: #ffffff;
  --m-radius: 22px;
  --m-shadow: 0 30px 80px -24px rgba(8, 30, 45, 0.45), 0 4px 14px rgba(8, 30, 45, 0.08);
  --m-font: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Segoe UI", Roboto, sans-serif;
  --m-ease: cubic-bezier(0.22, 1, 0.36, 1);
  all: initial;
  font-family: var(--m-font);
  color: var(--m-text);
}
:host([theme="dark"]) { --m-bg: #0d161c; --m-surface: #15222b; --m-text: #eef5f9; --m-sub: #9ab1bf; --m-line: #22333e; --m-bubble: #1b2b35; --m-accent: #7fe4ff; --m-accent-ink: #04070a; }
@media (prefers-color-scheme: dark) {
  :host([theme="auto"]) { --m-bg: #0d161c; --m-surface: #15222b; --m-text: #eef5f9; --m-sub: #9ab1bf; --m-line: #22333e; --m-bubble: #1b2b35; --m-accent: #7fe4ff; --m-accent-ink: #04070a; }
}
*, *::before, *::after { box-sizing: border-box; }
button, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid var(--m-accent); outline-offset: 2px; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* ---------- launcher (floating mode) ---------- */
.launcher { position: fixed; z-index: 2147483000; right: max(18px, env(safe-area-inset-right)); bottom: max(18px, env(safe-area-inset-bottom)); width: 68px; height: 68px; padding: 0; border: 0; border-radius: 50%;
  background: radial-gradient(circle at 50% 35%, #fff, var(--m-surface)); box-shadow: 0 14px 34px -10px rgba(8,30,45,0.55), 0 0 0 1px rgba(8,30,45,0.06); overflow: hidden; transition: transform 0.4s var(--m-ease), opacity 0.3s; }
:host([position="left"]) .launcher { right: auto; left: max(18px, env(safe-area-inset-left)); }
.launcher svg { width: 118%; height: auto; margin: 6% 0 0 -9%; }
.launcher:hover { transform: translateY(-3px) scale(1.04); }
:host([data-open]) .launcher { transform: scale(0.6); opacity: 0; pointer-events: none; }
.peek { position: fixed; z-index: 2147483000; right: calc(max(18px, env(safe-area-inset-right)) + 78px); bottom: calc(max(18px, env(safe-area-inset-bottom)) + 20px); padding: 8px 12px; border-radius: 14px 14px 4px 14px;
  background: var(--m-bg); color: var(--m-text); font-size: 13px; box-shadow: 0 10px 30px -10px rgba(8,30,45,0.45); animation: peek 0.6s var(--m-ease) both 1.2s; pointer-events: none; }
:host([position="left"]) .peek { right: auto; left: calc(max(18px, env(safe-area-inset-left)) + 78px); border-radius: 14px 14px 14px 4px; }
:host([data-open]) .peek, :host([data-peeked]) .peek { display: none; }
@keyframes peek { from { opacity: 0; transform: translateY(6px) scale(0.96); } }

/* ---------- panel ---------- */
.panel { display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--m-bg); border-radius: var(--m-radius); overflow: hidden; }
:host([mode="floating"]) .panel { position: fixed; z-index: 2147483001; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); width: min(380px, calc(100vw - 32px)); height: min(600px, calc(100vh - 32px)); height: min(600px, calc(100dvh - 32px));
  box-shadow: var(--m-shadow); transform-origin: bottom right; opacity: 0; transform: translateY(16px) scale(0.96); pointer-events: none; transition: opacity 0.35s var(--m-ease), transform 0.45s var(--m-ease); }
:host([mode="floating"][position="left"]) .panel { right: auto; left: max(16px, env(safe-area-inset-left)); transform-origin: bottom left; }
:host([mode="floating"][data-open]) .panel { opacity: 1; transform: none; pointer-events: auto; }
:host([mode="inline"]) { display: block; height: 560px; }
:host([mode="inline"]) .panel { border: 1px solid var(--m-line); }
@media (max-width: 480px) {
  :host([mode="floating"]) .panel { right: 0 !important; left: 0 !important; bottom: 0; width: 100vw; height: min(88vh, 640px); height: min(88dvh, 640px); border-radius: var(--m-radius) var(--m-radius) 0 0; }
}

.head { display: flex; align-items: center; gap: 10px; padding: 14px 14px 10px 18px; }
.head b { font-size: 15px; font-weight: 700; letter-spacing: 0.01em; }
.head .dot { width: 8px; height: 8px; border-radius: 50%; background: #2ecc8f; box-shadow: 0 0 0 3px rgba(46,204,143,0.18); }
.head .sp { flex: 1; }
.icon { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 50%; background: transparent; color: var(--m-sub); transition: background-color 0.2s; }
.icon:hover { background: var(--m-surface); color: var(--m-text); }
.icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.icon[aria-pressed="true"] { background: var(--m-surface); color: var(--m-accent); }

/* stage: the character and its speech bubble */
.stage { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: clamp(116px, 36%, 240px) minmax(0, 1fr); align-items: end; gap: 6px; padding: 6px 16px 10px 8px;
  background: radial-gradient(120% 90% at 0% 100%, color-mix(in srgb, var(--m-accent) 12%, transparent), transparent 60%); }
.char { width: 100%; align-self: end; }
.char svg { width: 100%; height: auto; overflow: visible; display: block; }
.bubble { position: relative; align-self: stretch; display: flex; flex-direction: column; justify-content: flex-end; min-height: 0; }
.say { position: relative; max-height: 100%; overflow-y: auto; overscroll-behavior: contain; padding: 14px 16px; border-radius: 18px 18px 18px 6px; background: var(--m-bubble); color: var(--m-text);
  font-size: 14.5px; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; box-shadow: 0 10px 30px -14px rgba(8,30,45,0.35), 0 0 0 1px var(--m-line); margin-bottom: 26px; scrollbar-width: thin; }
.say::after { content: ''; position: absolute; left: -7px; bottom: 14px; width: 14px; height: 14px; background: var(--m-bubble); transform: rotate(45deg); box-shadow: -1px 1px 0 var(--m-line); }
.say.pop { animation: pop 0.35s var(--m-ease); }
.say:has(+ .src:not([hidden])) { margin-bottom: 8px; }
.src { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0 0 22px 4px; font-size: 12px; }
.src[hidden] { display: none; }
.src small { width: 100%; color: var(--m-sub); font-size: 11px; }
.src a { max-width: 100%; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--m-line); color: var(--m-text); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.src a:hover { border-color: var(--m-accent); color: var(--m-accent); }
@keyframes pop { from { transform: scale(0.96); opacity: 0.4; } }
.dots { display: inline-flex; gap: 5px; padding: 6px 2px; }
.dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--m-sub); animation: dot 1s infinite ease-in-out; }
.dots i:nth-child(2) { animation-delay: 0.15s; } .dots i:nth-child(3) { animation-delay: 0.3s; }
@keyframes dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
.me { align-self: flex-end; max-width: 90%; margin: 0 0 8px; padding: 7px 12px; border-radius: 14px 14px 4px 14px; background: var(--m-accent); color: var(--m-accent-ink); font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }

/* history */
.log { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 16px 12px; display: flex; flex-direction: column; gap: 10px; }
.log[hidden], .stage[hidden], .chips[hidden] { display: none; }
.log p { margin: 0; max-width: 88%; padding: 9px 13px; border-radius: 16px; font-size: 13.5px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.log .u { align-self: flex-end; background: var(--m-accent); color: var(--m-accent-ink); border-bottom-right-radius: 4px; }
.log .a { align-self: flex-start; background: var(--m-surface); border-bottom-left-radius: 4px; }
.log .empty { align-self: center; color: var(--m-sub); background: none; }

/* suggestions + input */
.chips { display: flex; gap: 6px; overflow-x: auto; padding: 0 14px 10px; scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
.chips button { flex-shrink: 0; padding: 7px 12px; border: 1px solid var(--m-line); border-radius: 999px; background: var(--m-bg); font-size: 12.5px; color: var(--m-text); white-space: nowrap; transition: border-color 0.2s, background-color 0.2s; }
.chips button:hover { border-color: var(--m-accent); }
.form { display: flex; align-items: flex-end; gap: 8px; margin: 0 12px; padding: 6px 6px 6px 14px; border: 1px solid var(--m-line); border-radius: 22px; background: var(--m-surface); transition: border-color 0.2s; }
.form:focus-within { border-color: var(--m-accent); }
textarea:focus-visible { outline: none; }
textarea { flex: 1; min-width: 0; max-height: 120px; padding: 8px 0; border: 0; background: transparent; resize: none; outline: none; font-size: 16px; line-height: 1.5; }
textarea::placeholder { color: var(--m-sub); }
.send { flex-shrink: 0; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 50%; background: var(--m-accent); color: var(--m-accent-ink); transition: transform 0.2s, opacity 0.2s; }
.send svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.send:disabled { opacity: 0.4; cursor: default; }
.send:not(:disabled):hover { transform: scale(1.06); }
.foot { display: flex; justify-content: space-between; gap: 10px; padding: 8px 18px 12px; font-size: 11px; color: var(--m-sub); }
.foot a { color: inherit; text-decoration: none; white-space: nowrap; }
.foot a:hover { color: var(--m-accent); }

/* ---------- character animation ---------- */
.m-head { transform-origin: var(--o-head); } .m-tail { transform-origin: var(--o-tail); } .m-wave { transform-origin: var(--o-wave); } .m-ear { transform-origin: var(--o-ear); }
.m-all { animation: breath 3.4s ease-in-out infinite; }
@keyframes breath { 50% { transform: translateY(-2.5px); } }
.m-head { transition: transform 0.6s var(--m-ease); }
.m-eye { animation: blink 4.6s infinite; }
@keyframes blink { 0%, 93%, 100% { transform: scaleY(1); } 95.5% { transform: scaleY(0.08); } }
.m-eyes { transition: transform 0.25s ease-out; }
.m-tail { animation: wag 2.6s ease-in-out infinite; }
@keyframes wag { 50% { transform: rotate(-7deg); } }
.m-ear { animation: ear 7s ease-in-out infinite; }
@keyframes ear { 0%, 88%, 100% { transform: rotate(0); } 91% { transform: rotate(8deg); } 94% { transform: rotate(-2deg); } }
.m-open { opacity: 0; }
.think .m-head { transform: rotate(-7deg); }
.talk .m-mouth { animation: mA 0.26s steps(1) infinite; }
.talk .m-open { animation: mB 0.26s steps(1) infinite; }
@keyframes mA { 50% { opacity: 0; } }
@keyframes mB { 0% { opacity: 0; } 50% { opacity: 1; } }
.wave .m-wave { animation: wave 1.6s var(--m-ease) both; }
@keyframes wave { 0%, 100% { transform: rotate(0); } 22% { transform: rotate(-115deg); } 40% { transform: rotate(-140deg); } 58% { transform: rotate(-112deg); } 76% { transform: rotate(-138deg); } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;
