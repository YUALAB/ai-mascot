import { palette } from './color.js';
import { body, cheeks, defs, eyes, headShape, headwear, neck, shadow, snout, svg, whiskers } from './parts.js';
import type { Character } from './types.js';

/** YUA — the striped cat. The first character of ai-mascot. */
export const cat: Character = {
  id: 'cat',
  label: 'YUA (cat)',
  viewBox: '0 0 240 300',
  accessories: ['none', 'headset', 'coat', 'bowtie'],
  defaultColor: '#a9c6e3',
  origins: { head: '120px 190px', tail: '150px 250px', wave: '156px 214px', ear: '160px 80px' },
  render({ color, accessory }) {
    const p = palette(color);
    const crown = accessory === 'coat' || accessory === 'headset'
      ? ''
      : `<path d="M113 52 C 113 60, 114 70, 120 78 C 126 70, 127 60, 127 52 C 122 51, 118 51, 113 52 Z"/>
         <path d="M92 56 C 92 64, 95 72, 101 77 C 104 70, 104 61, 102 54 C 98 54, 95 55, 92 56 Z"/>
         <path d="M148 56 C 148 64, 145 72, 139 77 C 136 70, 136 61, 138 54 C 142 54, 145 55, 148 56 Z"/>`;
    return svg(`${defs(p)}${shadow}
  <g class="m-all">
    <g class="m-tail">
      <path d="M150 250 C 190 252, 208 228, 202 198 C 199 182, 210 172, 220 178" fill="none" stroke="${p.mid}" stroke-width="11" stroke-linecap="round"/>
      <path d="M150 250 C 190 252, 208 228, 202 198 C 199 182, 210 172, 220 178" fill="none" stroke="${p.stripe}" stroke-width="11" stroke-dasharray="6 14" stroke-dashoffset="-30"/>
    </g>
    ${body(p, accessory)}
    ${neck(accessory)}
    <g class="m-head">
      <g><path d="M46 92 C 40 58, 48 26, 62 18 C 72 22, 92 46, 102 66 Z" fill="url(#m-fur)"/><path d="M56 78 C 54 56, 58 38, 64 32 C 72 38, 84 54, 90 66 Z" fill="#f7c4cd"/></g>
      <g class="m-ear"><path d="M194 92 C 200 58, 192 26, 178 18 C 168 22, 148 46, 138 66 Z" fill="url(#m-fur)"/><path d="M184 78 C 186 56, 182 38, 176 32 C 168 38, 156 54, 150 66 Z" fill="#f7c4cd"/></g>
      ${headShape(p)}
      <g fill="${p.stripe}" opacity="0.85">${crown}
        <path d="M27 118 C 36 116, 44 118, 50 122 C 44 126, 36 128, 28 127 Z"/><path d="M30 136 C 38 134, 46 136, 51 140 C 45 143, 38 144, 32 143 Z"/>
        <path d="M213 118 C 204 116, 196 118, 190 122 C 196 126, 204 128, 212 127 Z"/><path d="M210 136 C 202 134, 194 136, 189 140 C 195 143, 202 144, 208 143 Z"/>
      </g>
      ${snout()}${cheeks}${eyes}${whiskers(p)}
      ${headwear(accessory)}
    </g>
  </g>`);
  },
};
