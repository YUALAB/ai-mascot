import { AiMascot } from './element.js';

export { AiMascot };
export { registerCharacter, getCharacter, listCharacters, renderCharacter, cat, dog, bear, robot, ghost } from './characters/index.js';
export type { Character, CharacterOptions } from './characters/index.js';

if (typeof customElements !== 'undefined' && !customElements.get('ai-mascot')) {
  customElements.define('ai-mascot', AiMascot);
}

/**
 * One-line install:
 *   <script src="https://cdn.jsdelivr.net/npm/ai-mascot" data-endpoint="/api/chat"></script>
 * Every data-* attribute on the script tag is copied onto a new <ai-mascot>.
 */
const script = typeof document !== 'undefined' ? (document.currentScript as HTMLScriptElement | null) : null;
if (script?.dataset.endpoint) {
  const add = () => {
    const el = document.createElement('ai-mascot');
    for (const [k, v] of Object.entries(script.dataset)) if (v != null) el.setAttribute(k, v);
    document.body.appendChild(el);
  };
  if (document.body) add();
  else document.addEventListener('DOMContentLoaded', add, { once: true });
}
