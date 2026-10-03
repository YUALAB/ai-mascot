/** Builds a soft fur palette from one hex color. */
export function palette(hex: string) {
  const [h, s] = toHsl(hex);
  const sat = Math.min(s, 60);
  const c = (l: number, sd = 0) => `hsl(${h} ${Math.max(0, sat + sd)}% ${l}%)`;
  return {
    light: c(93, -8),
    mid: c(83),
    dark: c(72, 4),
    stripe: c(63, 6),
    line: c(64, -6),
    foot: c(88, -6),
    arm: c(79),
  };
}

export function toHsl(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  let v = m?.[1] ?? 'a9c6e3';
  if (v.length === 3) v = v.split('').map((x) => x + x).join('');
  const r = parseInt(v.slice(0, 2), 16) / 255, g = parseInt(v.slice(2, 4), 16) / 255, b = parseInt(v.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round(hue * 60), Math.round(s * 100), Math.round(l * 100)];
}

/** Only accept plain hex colors so nothing unexpected reaches the SVG. */
export function safeColor(v: string | null | undefined, fallback: string): string {
  return v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim()) ? v.trim() : fallback;
}
