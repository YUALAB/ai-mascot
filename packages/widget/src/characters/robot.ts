import { palette } from './color.js';
import { neck, svg } from './parts.js';
import type { Character } from './types.js';

/** BOLT — a small robot with a visor face. */
export const robot: Character = {
  id: 'robot',
  label: 'BOLT (robot)',
  viewBox: '0 0 240 300',
  accessories: ['none', 'bowtie'],
  defaultColor: '#b9c6d3',
  origins: { head: '120px 192px', tail: '120px 240px', wave: '158px 212px', ear: '120px 58px' },
  render({ color, accessory }) {
    const p = palette(color);
    const arm = (d: string) => `<path d="${d}" fill="none" stroke="${p.dark}" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${p.light}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
    return svg(`<defs>
    <linearGradient id="r-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.light}"/><stop offset="0.6" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>
    <linearGradient id="r-visor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16303f"/><stop offset="1" stop-color="#08141c"/></linearGradient>
    <filter id="r-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="m-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <ellipse cx="120" cy="288" rx="54" ry="8" fill="#0f2733" opacity="0.18" filter="url(#m-soft)"/>
  <g class="m-all">
    <g>
      <rect x="92" y="264" width="22" height="18" rx="6" fill="${p.dark}"/><rect x="126" y="264" width="22" height="18" rx="6" fill="${p.dark}"/>
      <rect x="80" y="186" width="80" height="84" rx="20" fill="url(#r-metal)" stroke="${p.line}" stroke-width="1.6"/>
      <rect x="98" y="206" width="44" height="34" rx="10" fill="url(#r-visor)"/>
      <circle cx="120" cy="223" r="8" fill="#7fe4ff" filter="url(#r-glow)"><animate attributeName="opacity" values="1;0.45;1" dur="2.4s" repeatCount="indefinite"/></circle>
      <circle cx="90" cy="256" r="3" fill="${p.dark}"/><circle cx="150" cy="256" r="3" fill="${p.dark}"/>
      ${arm('M82 206 C 66 216, 62 236, 70 248')}<circle cx="70" cy="252" r="9" fill="${p.light}" stroke="${p.dark}" stroke-width="2"/>
      <g class="m-wave">${arm('M158 206 C 174 216, 178 236, 170 248')}<circle cx="170" cy="252" r="9" fill="${p.light}" stroke="${p.dark}" stroke-width="2"/></g>
    </g>
    ${neck(accessory)}
    <g class="m-head">
      <rect x="110" y="180" width="20" height="12" rx="4" fill="${p.dark}"/>
      <g class="m-ear"><path d="M120 58 L 120 30" stroke="${p.dark}" stroke-width="5" stroke-linecap="round"/><circle cx="120" cy="26" r="8" fill="#ff8fa6" filter="url(#r-glow)"/></g>
      <circle cx="32" cy="124" r="15" fill="${p.dark}"/><circle cx="32" cy="124" r="6" fill="${p.light}"/>
      <circle cx="208" cy="124" r="15" fill="${p.dark}"/><circle cx="208" cy="124" r="6" fill="${p.light}"/>
      <rect x="34" y="56" width="172" height="130" rx="48" fill="url(#r-metal)" stroke="${p.line}" stroke-width="1.6"/>
      <rect x="52" y="82" width="136" height="84" rx="36" fill="url(#r-visor)"/>
      <path d="M64 96 C 80 86, 104 84, 122 86" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.18"/>
      <g class="m-eyes" filter="url(#r-glow)">
        <g class="m-eye" style="transform-origin:92px 120px"><ellipse cx="92" cy="120" rx="12" ry="15" fill="#7fe4ff"/><ellipse cx="88" cy="114" rx="4" ry="5" fill="#fff"/></g>
        <g class="m-eye" style="transform-origin:148px 120px"><ellipse cx="148" cy="120" rx="12" ry="15" fill="#7fe4ff"/><ellipse cx="144" cy="114" rx="4" ry="5" fill="#fff"/></g>
      </g>
      <ellipse cx="72" cy="146" rx="9" ry="5" fill="#ff8fa6" opacity="0.5"/><ellipse cx="168" cy="146" rx="9" ry="5" fill="#ff8fa6" opacity="0.5"/>
      <path class="m-mouth" d="M110 148 C 115 154, 125 154, 130 148" fill="none" stroke="#7fe4ff" stroke-width="3" stroke-linecap="round"/>
      <g class="m-open" fill="#7fe4ff"><rect x="104" y="144" width="5" height="10" rx="2"/><rect x="112" y="140" width="5" height="18" rx="2"/><rect x="120" y="143" width="5" height="12" rx="2"/><rect x="128" y="139" width="5" height="20" rx="2"/><rect x="136" y="145" width="5" height="8" rx="2"/></g>
    </g>
  </g>`);
  },
};
