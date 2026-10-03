import type { palette } from './color.js';

/** Shared SVG pieces for the "chibi" characters (big head, small body, viewBox 0 0 240 300). */
export type Palette = ReturnType<typeof palette>;

export function defs(p: Palette): string {
  return `<defs>
    <radialGradient id="m-fur" cx="42%" cy="34%" r="70%"><stop offset="0" stop-color="${p.light}"/><stop offset="0.55" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></radialGradient>
    <radialGradient id="m-body" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="${p.light}"/><stop offset="1" stop-color="${p.dark}"/></radialGradient>
    <radialGradient id="m-muz" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e9f1f8"/></radialGradient>
    <radialGradient id="m-iris" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#2f5d7c"/><stop offset="0.6" stop-color="#172a3b"/><stop offset="1" stop-color="#0c1620"/></radialGradient>
    <linearGradient id="m-coat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe9f1"/></linearGradient>
    <radialGradient id="m-mirror" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="0.45" stop-color="#d7e4ee"/><stop offset="1" stop-color="#8fa6b8"/></radialGradient>
    <filter id="m-fuzz" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.10 0" result="w"/>
      <feComposite in="w" in2="SourceGraphic" operator="in" result="wi"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="wi"/></feMerge>
    </filter>
    <filter id="m-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>`;
}

export const shadow = '<ellipse cx="120" cy="288" rx="58" ry="8" fill="#0f2733" opacity="0.18" filter="url(#m-soft)"/>';

/** Body, feet and arms. `belly` is the color of the tummy patch. */
export function body(p: Palette, accessory: string, belly = '#f4f8fc'): string {
  const coat = accessory === 'coat';
  const torso = coat
    ? `<path d="M76 222 C 74 194, 96 180, 120 180 C 144 180, 166 194, 164 222 L 167 264 C 167 276, 152 281, 120 281 C 88 281, 73 276, 73 264 Z" fill="url(#m-coat)" stroke="#b9cbd9" stroke-width="1.6"/>
      <path d="M104 184 L 120 214 L 136 184 C 131 182, 109 182, 104 184 Z" fill="#3fb6c9"/>
      <path d="M100 184 L 120 222 L 106 230 L 92 196 Z" fill="#f4f8fb" stroke="#b9cbd9" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M140 184 L 120 222 L 134 230 L 148 196 Z" fill="#f4f8fb" stroke="#b9cbd9" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M120 222 L 120 278" stroke="#c6d5e1" stroke-width="1.4"/>
      <rect x="134" y="232" width="20" height="16" rx="3" fill="#eef4f8" stroke="#b9cbd9" stroke-width="1.2"/>
      <rect x="138" y="225" width="3.5" height="14" rx="1.5" fill="#046e8b"/><rect x="144" y="227" width="3.5" height="12" rx="1.5" fill="#ff8fa6"/>`
    : `<path d="M78 222 C 76 196, 96 182, 120 182 C 144 182, 164 196, 162 222 L 164 262 C 164 274, 152 280, 120 280 C 88 280, 76 274, 76 262 Z" fill="url(#m-body)" filter="url(#m-fuzz)" stroke="${p.line}" stroke-opacity="0.55" stroke-width="1.6"/>
      <ellipse cx="120" cy="240" rx="24" ry="30" fill="${belly}" opacity="0.92"/>`;
  const sleeve = coat ? '#f4f8fb' : p.arm;
  const arm = (d: string) => (coat ? `<path d="${d}" fill="none" stroke="#b9cbd9" stroke-width="18" stroke-linecap="round"/>` : '') + `<path d="${d}" fill="none" stroke="${sleeve}" stroke-width="15" stroke-linecap="round"/>`;
  return `<g>${torso}
      <ellipse cx="100" cy="279" rx="17" ry="9" fill="${p.foot}"/><ellipse cx="140" cy="279" rx="17" ry="9" fill="${p.foot}"/>
      ${arm('M84 214 C 72 226, 70 242, 80 250')}<circle cx="80" cy="250" r="8.5" fill="${belly}"/>
      <g class="m-wave">${arm('M156 214 C 168 226, 170 242, 160 250')}<circle cx="160" cy="250" r="8.5" fill="${belly}"/></g>
    </g>`;
}

/** Things worn around the neck. */
export function neck(accessory: string): string {
  if (accessory === 'bowtie')
    return `<g transform="translate(0 14)"><path d="M120 192 L 96 180 C 90 178, 86 182, 86 192 C 86 202, 90 206, 96 204 Z" fill="#3fb6d8"/>
      <path d="M120 192 L 144 180 C 150 178, 154 182, 154 192 C 154 202, 150 206, 144 204 Z" fill="#3fb6d8"/><rect x="112" y="184" width="16" height="16" rx="5" fill="#0b4f66"/></g>`;
  if (accessory === 'coat')
    return `<g><path d="M94 188 C 86 210, 92 236, 108 244" fill="none" stroke="#2a3f4f" stroke-width="4" stroke-linecap="round"/>
      <path d="M146 188 C 150 204, 146 216, 136 222" fill="none" stroke="#2a3f4f" stroke-width="4" stroke-linecap="round"/>
      <circle cx="110" cy="248" r="8" fill="#e3ecf2" stroke="#5d7385" stroke-width="1.6"/></g>`;
  return '';
}

/** Things worn on the head (drawn on top of the face). */
export function headwear(accessory: string): string {
  if (accessory === 'headset')
    return `<g><path d="M40 120 C 38 46, 202 46, 200 120" fill="none" stroke="#0b4f66" stroke-width="8" stroke-linecap="round"/>
      <rect x="24" y="104" width="24" height="40" rx="10" fill="#0b4f66"/><rect x="192" y="104" width="24" height="40" rx="10" fill="#0b4f66"/>
      <rect x="28" y="112" width="6" height="24" rx="3" fill="#7fe4ff" opacity="0.8"/><rect x="206" y="112" width="6" height="24" rx="3" fill="#7fe4ff" opacity="0.8"/>
      <path d="M206 140 C 204 172, 178 182, 152 178" fill="none" stroke="#0b4f66" stroke-width="5" stroke-linecap="round"/><circle cx="149" cy="177" r="6.5" fill="#7fe4ff"/></g>`;
  if (accessory === 'coat')
    return `<g><path d="M38 96 C 52 62, 188 62, 202 96" fill="none" stroke="#2a3f4f" stroke-width="6" stroke-linecap="round"/>
      <circle cx="120" cy="64" r="18" fill="#2a3f4f"/><circle cx="120" cy="64" r="15" fill="url(#m-mirror)"/><circle cx="120" cy="64" r="3.2" fill="#2a3f4f"/></g>`;
  return '';
}

/** The round head shape shared by the animals. */
export function headShape(p: Palette): string {
  return `<path d="M120 50 C 182 50, 214 84, 214 128 C 214 170, 176 196, 120 196 C 64 196, 26 170, 26 128 C 26 84, 58 50, 120 50 Z" fill="url(#m-fur)" filter="url(#m-fuzz)" stroke="${p.line}" stroke-opacity="0.55" stroke-width="1.6"/>`;
}

/** Big shiny eyes. */
export const eyes = `<g class="m-eyes">
  <g class="m-eye" style="transform-origin:84px 120px"><ellipse cx="84" cy="119" rx="17" ry="20.5" fill="url(#m-iris)"/><ellipse cx="84" cy="128" rx="11.5" ry="7" fill="#4fc8e8" opacity="0.35"/><ellipse cx="78" cy="110" rx="6.8" ry="8" fill="#fff"/><circle cx="91" cy="129" r="3" fill="#fff" opacity="0.9"/></g>
  <g class="m-eye" style="transform-origin:156px 120px"><ellipse cx="156" cy="119" rx="17" ry="20.5" fill="url(#m-iris)"/><ellipse cx="156" cy="128" rx="11.5" ry="7" fill="#4fc8e8" opacity="0.35"/><ellipse cx="150" cy="110" rx="6.8" ry="8" fill="#fff"/><circle cx="163" cy="129" r="3" fill="#fff" opacity="0.9"/></g>
</g>`;

export const cheeks = `<ellipse cx="66" cy="152" rx="13" ry="8" fill="#ff9fb2" opacity="0.45" filter="url(#m-soft)"/><ellipse cx="174" cy="152" rx="13" ry="8" fill="#ff9fb2" opacity="0.45" filter="url(#m-soft)"/>`;

/** Muzzle, nose and a mouth that opens while talking. */
export function snout(o: { nose?: string; tongue?: boolean; big?: boolean } = {}): string {
  const muzzle = o.big
    ? '<ellipse cx="120" cy="158" rx="38" ry="28" fill="url(#m-muz)"/>'
    : '<path d="M120 134 C 140 134, 152 145, 152 158 C 152 172, 138 180, 120 180 C 102 180, 88 172, 88 158 C 88 145, 100 134, 120 134 Z" fill="url(#m-muz)"/>';
  const nose = o.nose === 'dog'
    ? '<path d="M109 141 C 109 134, 131 134, 131 141 C 131 148, 124 152, 120 152 C 116 152, 109 148, 109 141 Z" fill="#2b2b33"/><ellipse cx="115" cy="139" rx="3.5" ry="2" fill="#fff" opacity="0.6"/>'
    : '<path d="M114 142 C 114 139, 126 139, 126 142 C 126 145, 122 148, 120 148 C 118 148, 114 145, 114 142 Z" fill="#f08aa0"/>';
  const tongue = o.tongue ? '<path d="M114 160 C 114 172, 126 172, 126 160 Z" fill="#ff8fa6" stroke="#e0607c" stroke-width="1"/>' : '';
  return `${muzzle}${nose}
    <path class="m-mouth" d="M107 154 C 110 160, 117 160, 120 153 C 123 160, 130 160, 133 154" fill="none" stroke="#3a4d5e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="m-open"><path d="M110 153 C 112 167, 128 167, 130 153 C 124 156, 116 156, 110 153 Z" fill="#5a2a35"/><path d="M114 160 C 117 164, 123 164, 126 160 C 122 158, 118 158, 114 160 Z" fill="#ff8fa6"/></g>
    ${tongue}`;
}

export function whiskers(p: Palette): string {
  return `<g stroke="${p.line}" stroke-width="1.6" stroke-linecap="round" opacity="0.8"><path d="M84 158 L 50 152"/><path d="M85 166 L 52 168"/><path d="M156 158 L 190 152"/><path d="M155 166 L 188 168"/></g>`;
}

export function svg(inner: string): string {
  return `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${inner}</svg>`;
}
