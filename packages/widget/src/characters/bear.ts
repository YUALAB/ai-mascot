import { palette } from './color.js';
import { body, cheeks, defs, eyes, headShape, headwear, neck, shadow, snout, svg } from './parts.js';
import type { Character } from './types.js';

/** MOCHI — a round teddy bear. */
export const bear: Character = {
  id: 'bear',
  label: 'MOCHI (bear)',
  viewBox: '0 0 240 300',
  accessories: ['none', 'headset', 'coat', 'bowtie'],
  defaultColor: '#c9a27e',
  origins: { head: '120px 190px', tail: '158px 262px', wave: '156px 214px', ear: '178px 68px' },
  render({ color, accessory }) {
    const p = palette(color);
    const ear = (cx: number) => `<circle cx="${cx}" cy="66" r="26" fill="url(#m-fur)" stroke="${p.line}" stroke-opacity="0.5" stroke-width="1.4"/><circle cx="${cx}" cy="68" r="14" fill="${p.dark}" opacity="0.7"/>`;
    return svg(`${defs(p)}${shadow}
  <g class="m-all">
    <g class="m-tail"><circle cx="160" cy="262" r="11" fill="${p.mid}"/></g>
    ${body(p, accessory, '#f6ead9')}
    ${neck(accessory)}
    <g class="m-head">
      <g>${ear(62)}</g><g class="m-ear">${ear(178)}</g>
      ${headShape(p)}
      ${snout({ nose: 'dog', big: true })}${cheeks}${eyes}
      ${headwear(accessory)}
    </g>
  </g>`);
  },
};
