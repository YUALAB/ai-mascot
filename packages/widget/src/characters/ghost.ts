import { palette } from './color.js';
import { cheeks, eyes, headwear, neck, svg } from './parts.js';
import type { Character } from './types.js';

/** BOO — a friendly little ghost that floats. */
export const ghost: Character = {
  id: 'ghost',
  label: 'BOO (ghost)',
  viewBox: '0 0 240 300',
  accessories: ['none', 'headset', 'bowtie'],
  defaultColor: '#c7d2ff',
  origins: { head: '120px 200px', tail: '120px 236px', wave: '196px 178px', ear: '120px 60px' },
  render({ color, accessory }) {
    const p = palette(color);
    // The hem: six soft waves from right to left.
    const hem = Array.from({ length: 6 }, () => 'q -14.33 22 -28.67 0').join(' ');
    return svg(`<defs>
    <radialGradient id="g-body" cx="40%" cy="28%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.65" stop-color="${p.light}"/><stop offset="1" stop-color="${p.mid}"/></radialGradient>
    <radialGradient id="m-iris" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#3a4d7c"/><stop offset="0.6" stop-color="#1a2240"/><stop offset="1" stop-color="#0c1020"/></radialGradient>
    <radialGradient id="m-mirror" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#8fa6b8"/></radialGradient>
    <filter id="m-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <style>.m-all{animation:boo-float 3.2s ease-in-out infinite}@keyframes boo-float{50%{transform:translateY(-9px)}}</style>
  <ellipse cx="120" cy="290" rx="46" ry="6" fill="#0f2733" opacity="0.14" filter="url(#m-soft)"/>
  <g class="m-all">
    <g class="m-head">
      <ellipse cx="42" cy="186" rx="13" ry="18" transform="rotate(30 42 186)" fill="url(#g-body)" stroke="${p.line}" stroke-opacity="0.45" stroke-width="1.4"/>
      <g class="m-wave"><ellipse cx="198" cy="186" rx="13" ry="18" transform="rotate(-30 198 186)" fill="url(#g-body)" stroke="${p.line}" stroke-opacity="0.45" stroke-width="1.4"/></g>
      <path d="M120 40 C 180 40, 206 88, 206 150 L 206 236 ${hem} L 34 150 C 34 88, 60 40, 120 40 Z" fill="url(#g-body)" stroke="${p.line}" stroke-opacity="0.45" stroke-width="1.6"/>
      ${cheeks}${eyes}
      <path class="m-mouth" d="M110 152 C 114 158, 126 158, 130 152" fill="none" stroke="#3a4d5e" stroke-width="2.6" stroke-linecap="round"/>
      <g class="m-open"><ellipse cx="120" cy="156" rx="9" ry="8" fill="#5a2a35"/><ellipse cx="120" cy="160" rx="5" ry="3" fill="#ff8fa6"/></g>
      ${neck(accessory)}
      ${headwear(accessory)}
    </g>
  </g>`);
  },
};
