import { palette } from './color.js';
import { body, cheeks, defs, eyes, headShape, headwear, neck, shadow, snout, svg } from './parts.js';
import type { Character } from './types.js';

/** KOTA — a floppy-eared puppy. */
export const dog: Character = {
  id: 'dog',
  label: 'KOTA (dog)',
  viewBox: '0 0 240 300',
  accessories: ['none', 'headset', 'coat', 'bowtie'],
  defaultColor: '#e8bf8e',
  origins: { head: '120px 190px', tail: '150px 252px', wave: '156px 214px', ear: '168px 64px' },
  render({ color, accessory }) {
    const p = palette(color);
    return svg(`${defs(p)}<defs><linearGradient id="d-ear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.dark}"/><stop offset="1" stop-color="${p.stripe}"/></linearGradient></defs>${shadow}
  <g class="m-all">
    <g class="m-tail"><path d="M150 254 C 174 254, 190 238, 186 216" fill="none" stroke="${p.mid}" stroke-width="14" stroke-linecap="round"/><circle cx="186" cy="214" r="8" fill="${p.light}"/></g>
    ${body(p, accessory)}
    ${neck(accessory)}
    <g class="m-head">
      ${headShape(p)}
      <ellipse cx="160" cy="114" rx="24" ry="22" fill="${p.dark}" opacity="0.35"/>
      ${snout({ nose: 'dog', tongue: true, big: true })}${cheeks}${eyes}
      <g><path d="M78 60 C 50 50, 20 64, 12 96 C 6 124, 12 152, 28 160 C 42 166, 54 154, 54 134 C 54 110, 62 84, 78 60 Z" fill="url(#d-ear)" stroke="${p.line}" stroke-opacity="0.6" stroke-width="1.4"/>
        <path d="M64 72 C 46 74, 32 90, 28 112 C 26 126, 29 138, 35 145" fill="none" stroke="${p.light}" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/></g>
      <g class="m-ear"><path d="M162 60 C 190 50, 220 64, 228 96 C 234 124, 228 152, 212 160 C 198 166, 186 154, 186 134 C 186 110, 178 84, 162 60 Z" fill="url(#d-ear)" stroke="${p.line}" stroke-opacity="0.6" stroke-width="1.4"/>
        <path d="M176 72 C 194 74, 208 90, 212 112 C 214 126, 211 138, 205 145" fill="none" stroke="${p.light}" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/></g>
      ${headwear(accessory)}
    </g>
  </g>`);
  },
};
