import { readFileSync } from 'node:fs';
import { ICONS } from '../icons.mjs';

const ROOT = new URL('../../', import.meta.url);
const METRICS = JSON.parse(readFileSync(new URL('scripts/metrics.json', ROOT), 'utf8'));
// Google Sans Flex (OFL), ASCII subset, ROND=100 (fully rounded), wght 400-700.
// Embedded as a data URI because GitHub renders SVGs as <img>, which blocks external fonts.
const FONT_B64 = readFileSync(new URL('assets/fonts/google-sans-flex-rounded.woff2', ROOT)).toString('base64');

export const FONT_STACK = `'GSF','Google Sans Flex','Google Sans',Roboto,'Segoe UI',system-ui,-apple-system,sans-serif`;
export const MONO_STACK = `ui-monospace,'Roboto Mono','JetBrains Mono','Cascadia Mono',Consolas,Menlo,monospace`;

// Material motion. Overshooting curve stands in for the M3 Expressive spatial spring.
export const SPRING = 'cubic-bezier(.34,1.45,.64,1)';
export const EMPHASIZED = '0.3 0 0 1'; // SMIL keySplines form of the emphasized decelerate curve

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const r1 = (n) => Math.round(n * 10) / 10;

function table(weight) {
  const ws = [400, 500, 600, 700];
  const w = ws.reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a));
  return METRICS[w];
}

/** Width in px of `str` set in the embedded font. */
export function measure(str, size, weight = 400, tracking = 0) {
  const t = table(weight);
  let w = 0;
  for (const ch of String(str)) w += (t[ch] ?? 0.56) * size + tracking;
  return w;
}

export function ellipsize(str, size, weight, maxW) {
  str = String(str);
  if (measure(str, size, weight) <= maxW) return str;
  let out = str;
  while (out.length > 1 && measure(out + '…', size, weight) > maxW) out = out.slice(0, -1);
  return out.trimEnd() + '…';
}

export function wrap(str, size, weight, maxW, maxLines = 2) {
  const words = String(str).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (let i = 0; i < words.length; i++) {
    const next = cur ? `${cur} ${words[i]}` : words[i];
    if (measure(next, size, weight) <= maxW || !cur) { cur = next; continue; }
    lines.push(cur);
    cur = words[i];
    if (lines.length === maxLines - 1) {
      cur = words.slice(i).join(' ');
      break;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) lines.length = maxLines;
  lines[lines.length - 1] = ellipsize(lines[lines.length - 1], size, weight, maxW);
  return lines;
}

/** Fit a font size so `str` stays within maxW. */
export function fitSize(str, size, weight, maxW, min = 10) {
  while (size > min && measure(str, size, weight) > maxW) size -= 1;
  return size;
}

export function icon(name, x, y, size, fill, extra = '') {
  const ic = ICONS[name];
  if (!ic) throw new Error(`Unknown icon "${name}". Available: ${Object.keys(ICONS).join(', ')}`);
  return `<svg x="${r1(x)}" y="${r1(y)}" width="${size}" height="${size}" viewBox="${ic.vb.join(' ')}"${extra}><path d="${ic.d}" fill="${fill}"/></svg>`;
}

/** Rounded rect path with per-corner radii [tl, tr, br, bl]. */
export function rrect(x, y, w, h, [tl, tr, br, bl]) {
  return `M${r1(x + tl)} ${r1(y)}H${r1(x + w - tr)}A${tr} ${tr} 0 0 1 ${r1(x + w)} ${r1(y + tr)}V${r1(y + h - br)}A${br} ${br} 0 0 1 ${r1(x + w - br)} ${r1(y + h)}H${r1(x + bl)}A${bl} ${bl} 0 0 1 ${r1(x)} ${r1(y + h - bl)}V${r1(y + tl)}A${tl} ${tl} 0 0 1 ${r1(x + tl)} ${r1(y)}Z`;
}

export function text(x, y, str, { size = 14, weight = 400, fill, anchor, tracking, cls, extra = '' } = {}) {
  const attrs = [
    `x="${r1(x)}"`, `y="${r1(y)}"`, `font-size="${size}"`, `font-weight="${weight}"`,
    fill && `fill="${fill}"`, anchor && `text-anchor="${anchor}"`,
    tracking && `letter-spacing="${tracking}"`, cls && `class="${cls}"`, extra,
  ].filter(Boolean).join(' ');
  return `<text ${attrs}>${esc(str)}</text>`;
}

/** Staggered spring entrance. Transform-only (never opacity) so a renderer that freezes frame 0 still shows the content. */
export const rise = (delay, inner) => `<g class="rise" style="animation-delay:${delay}s">${inner}</g>`;
export const pop = (delay, inner) => `<g class="pop" style="animation-delay:${delay}s">${inner}</g>`;
export const fade = (delay, inner) => inner;

export function doc({ width, height, title, body, css = '', t }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
@font-face{font-family:'GSF';src:url(data:font/woff2;base64,${FONT_B64}) format('woff2');font-weight:100 1000;font-display:block}
text{font-family:${FONT_STACK}}
.mono{font-family:${MONO_STACK}}
@keyframes rise{from{transform:translateY(14px)}to{transform:none}}
@keyframes pop{from{transform:scale(.86)}to{transform:none}}
@keyframes grow{from{transform:scaleY(.2)}to{transform:none}}
.rise{animation:rise .9s ${SPRING} both}
.pop{animation:pop 1.1s ${SPRING} both;transform-box:fill-box;transform-origin:center}
.grow{animation:grow 1s ${SPRING} both;transform-box:fill-box;transform-origin:50% 100%}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}${process.env.PROFILE_STATIC ? '*{animation:none!important}' : ''}
</style>
${body}
</svg>
`;
}

export function compact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e4) return Math.round(n / 1e3) + 'k';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}
