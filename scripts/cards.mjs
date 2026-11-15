// Each card is a standalone SVG drawn in the style of a Pixel / Android 16 surface.
import {
  doc, text, icon, rrect, rise, pop, fade, measure, ellipsize, wrap, fitSize, r1, compact,
} from './lib/svg.mjs';
import { shapePath, morph, spin } from './lib/shapes.mjs';

const W = 840;

export const fill = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

export function vars(cfg, stats) {
  return {
    username: cfg.username,
    name: cfg.name || stats.name || cfg.username,
    repos: stats.publicRepos,
    reposPlural: stats.publicRepos === 1 ? '' : 's',
    stars: stats.stars,
    followers: stats.followers,
  };
}

const clip = (id, h, r = 36) => `<clipPath id="${id}"><rect width="${W}" height="${h}" rx="${r}"/></clipPath>`;

function chip(x, y, { icon: ic, label }, { h = 38, fillColor, stroke, strokeOpacity = 1, fg, iconColor, size = 14 }) {
  const w = 12 + 18 + 8 + measure(label, size, 500) + 16;
  const box = `<rect x="${r1(x)}" y="${y}" width="${r1(w)}" height="${h}" rx="12" fill="${fillColor || 'none'}"${stroke ? ` stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="1.2"` : ''}/>`;
  const svg = box + icon(ic, x + 12, y + (h - 18) / 2, 18, iconColor || fg)
    + text(x + 38, y + h / 2 + size * 0.36, label, { size, weight: 500, fill: fg });
  return { svg, w };
}

/* ───────────────────────── Hero: Pixel home screen ───────────────────────── */
export function hero({ t, cfg, stats, now }) {
  const H = 400;
  const v = vars(cfg, stats);
  const cx = 652, cy = 214;

  const battery = `<rect x="770" y="27" width="28" height="15" rx="5" fill="${t.onSurface}"/>
<rect x="799.5" y="31.5" width="2.5" height="6" rx="1.2" fill="${t.onSurface}"/>
${text(784, 38.6, '100', { size: 9.5, weight: 700, fill: t.surfaceContainer, anchor: 'middle' })}`;
  const statusBar = fade(0, text(44, 40, now.time, { size: 15, weight: 500, fill: t.onSurface })
    + icon('signal_cellular_alt', 722, 25, 19, t.onSurface)
    + icon('wifi', 745, 25, 19, t.onSurface) + battery);

  const dateW = measure(now.date, 22, 500);
  const glance = text(44, 104, now.date, { size: 22, weight: 500, fill: t.onSurface })
    + icon(cfg.glance?.icon || 'bolt', 44 + dateW + 14, 85, 24, t.tertiary)
    + text(44 + dateW + 44, 104, cfg.glance?.text || '', { size: 22, weight: 400, fill: t.onSurface });

  const nameSize = fitSize(v.name, 78, 700, 440, 40);
  let chipX = 44;
  const chips = (cfg.heroChips || []).map((c, i) => {
    const ch = chip(chipX, 322, { icon: c.icon, label: fill(c.label, v) }, i === 0
      ? { fillColor: t.secondaryContainer, fg: t.onSecondaryContainer }
      : { stroke: t.outlineVariant, fg: t.onSurfaceVariant, iconColor: t.primary });
    chipX += ch.w + 10;
    return rise(0.5 + i * 0.08, ch.svg);
  }).join('');

  const avatar = `<g transform="translate(${cx} ${cy})">
  <g>${spin(48)}<path d="${shapePath('cookie12', 172)}" fill="${t.primaryContainer}" transform="translate(38 -12)"/></g>
  <g>${spin(26)}<path d="${shapePath('cookie9', 120)}" fill="${t.primary}">${morph(['cookie9', 'clover4', 'sunny', 'squircle', 'flower', 'pentagon'], 120)}</path></g>
  ${text(0, 44, cfg.monogram || v.name[0], { size: 124, weight: 700, fill: t.onPrimary, anchor: 'middle' })}
</g>
<g transform="translate(496 146)"><g>${spin(18, true)}<path d="${shapePath('sunny', 22)}" fill="${t.tertiary}"/></g></g>
<g transform="translate(560 382)"><g>${spin(34)}<path d="${shapePath('clover4', 50)}" fill="${t.tertiaryContainer}"/></g></g>
<circle cx="800" cy="352" r="12" fill="${t.secondaryContainer}"/>`;

  const body = `<defs>${clip('c', H)}</defs>
<g clip-path="url(#c)">
<rect width="${W}" height="${H}" fill="${t.surfaceContainer}"/>
${pop(0.1, avatar)}
${statusBar}
${rise(0.05, glance)}
${rise(0.15, text(44, 176, cfg.greeting || "Hi, I'm", { size: 34, weight: 400, fill: t.onSurfaceVariant }))}
${rise(0.25, text(42, 256, v.name, { size: nameSize, weight: 700, fill: t.primary, tracking: -1.5 }))}
${rise(0.38, text(44, 298, ellipsize(fill(cfg.tagline || '', v), 18, 400, 470), { size: 18, weight: 400, fill: t.onSurfaceVariant }))}
${chips}
</g>`;
  return doc({ width: W, height: H, title: `${v.name}: ${fill(cfg.tagline || '', v)}`, body, t });
}

/* ───────────────────────── Quick Settings shade ───────────────────────── */
export function quickSettings({ t, cfg, stats, now }) {
  const v = vars(cfg, stats);
  const qs = cfg.quickSettings || {};
  const tiles = qs.tiles || [];
  const cols = 3, tileH = 80, gap = 12, x0 = 32, x1 = W - 32;
  const tileW = (x1 - x0 - gap * (cols - 1)) / cols;
  const top = 164;
  const rows = Math.ceil(tiles.length / cols);
  const H = top + rows * tileH + (rows - 1) * gap + 32;

  // Header + "updated" pill
  const upd = `Updated ${now.long}, ${now.time}`;
  const pillW = 14 + 18 + 8 + measure(upd, 13, 500) + 16;
  const header = text(x0, 58, 'Quick settings', { size: 22, weight: 500, fill: t.onSurface })
    + `<rect x="${r1(x1 - pillW)}" y="36" width="${r1(pillW)}" height="32" rx="16" fill="${t.surfaceContainerHighest}"/>`
    + icon('schedule', x1 - pillW + 14, 43, 18, t.onSurfaceVariant)
    + text(x1 - pillW + 40, 56.5, upd, { size: 13, weight: 500, fill: t.onSurfaceVariant });

  // Brightness-style slider (Android 16: active track · gap · handle · gap · inactive track)
  const s = qs.slider || { icon: 'lightbulb', label: 'Curiosity', value: 0.9 };
  const sy = 84, sh = 56;
  const vx = x0 + Math.min(Math.max(s.value, 0.25), 0.97) * (x1 - x0);
  const slider = `<path d="${rrect(x0, sy, vx - 6 - x0, sh, [28, 8, 8, 28])}" fill="${t.primary}"/>
<rect x="${r1(vx - 2)}" y="${sy - 6}" width="4" height="${sh + 12}" rx="2" fill="${t.primary}"/>
<path d="${rrect(vx + 6, sy, x1 - vx - 6, sh, [8, 28, 28, 8])}" fill="${t.secondaryContainer}"/>
<circle cx="${x1 - 16}" cy="${sy + sh / 2}" r="3" fill="${t.onSecondaryContainer}"/>
${icon(s.icon || 'lightbulb', x0 + 18, sy + 16, 24, t.onPrimary)}
${text(x0 + 52, sy + 34, s.label, { size: 16, weight: 500, fill: t.onPrimary })}
${s.valueLabel ? text(vx - 22, sy + 34, s.valueLabel, { size: 14, weight: 500, fill: t.onPrimary, anchor: 'end', extra: 'opacity=".8"' }) : ''}`;

  const tileSvg = tiles.map((tile, i) => {
    const x = x0 + (i % cols) * (tileW + gap);
    const y = top + Math.floor(i / cols) * (tileH + gap);
    const on = tile.active !== false;
    const bg = on ? t.primary : t.surfaceContainerHighest;
    const fg = on ? t.onPrimary : t.onSurface;
    const sub = on ? t.onPrimary : t.onSurfaceVariant;
    const maxT = tileW - 76 - 18;
    const label = ellipsize(fill(tile.label, v), 15, 500, maxT);
    const state = ellipsize(fill(tile.state || (on ? 'On' : 'Off'), v), 13, 400, maxT);
    return rise(0.12 + i * 0.06, `<rect x="${r1(x)}" y="${y}" width="${r1(tileW)}" height="${tileH}" rx="${on ? tileH / 2 : 22}" fill="${bg}"/>
<circle cx="${r1(x + 40)}" cy="${y + tileH / 2}" r="24" fill="${on ? t.onPrimary : t.surfaceContainerLow}"/>
${icon(tile.icon, x + 28, y + tileH / 2 - 12, 24, on ? t.primary : t.onSurfaceVariant)}
${text(x + 76, y + 36, label, { size: 15, weight: 500, fill: fg })}
${text(x + 76, y + 57, state, { size: 13, weight: 400, fill: sub, extra: on ? 'opacity=".8"' : '' })}`);
  }).join('\n');

  const body = `<rect width="${W}" height="${H}" rx="36" fill="${t.surfaceContainer}"/>
${fade(0, header)}
${rise(0.05, slider)}
${tileSvg}`;
  return doc({ width: W, height: H, title: 'Quick settings', body, t });
}

/* ───────────────────────── Featured repo as a media player ───────────────────────── */
function hexRows(n) {
  let seed = 0x1b2c3d;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 8) & 0xff;
  const rows = ['AF 1B B1 FA 1D 00 00 00'];
  for (let i = 1; i < n; i++) rows.push(Array.from({ length: 8 }, rnd).map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '));
  return rows;
}

export function nowPlaying({ t, cfg, stats }) {
  const H = 272;
  const f = cfg.featured || {};
  const repo = stats.featured || { name: f.repo, description: '', stars: 0, language: '' };
  const title = f.title || repo.name;
  const stripped = (f.description || repo.description || '').replace(new RegExp(`^${title}\\s*[:\\-–—]\\s*`, 'i'), '');
  const desc = stripped.charAt(0).toUpperCase() + stripped.slice(1);
  const bg = t.secondaryContainer, fg = t.onSecondaryContainer;

  // Album art: gradient + scrolling hex dump + spinning disc
  const ax = 28, ay = 28, as = 216;
  const rows = hexRows(13);
  const hex = [...rows, ...rows].map((r, i) => text(ax + 16, ay + 22 + i * 18, r, { size: 13, weight: 400, fill: t.onPrimary, cls: 'mono' })).join('');
  const art = `<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.primary}"/><stop offset="1" stop-color="${t.tertiary}"/></linearGradient>
<clipPath id="art"><rect x="${ax}" y="${ay}" width="${as}" height="${as}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#art)">
<rect x="${ax}" y="${ay}" width="${as}" height="${as}" fill="url(#g)"/>
<g opacity=".26"><g>${hex}<animateTransform attributeName="transform" type="translate" from="0 0" to="0 ${-rows.length * 18}" dur="16s" repeatCount="indefinite"/></g></g>
<g transform="translate(${ax + as / 2} ${ay + as / 2})"><g>${spin(14)}<path d="${shapePath('sunny', 62)}" fill="${t.onPrimary}"/></g>
${icon('fast_rewind', -26, -26, 52, t.primary)}</g>
</g>`;

  // Text
  const x0 = 272, x1 = W - 28, tw = x1 - x0;
  const meta = icon('book', x0, 44, 18, fg, ' opacity=".75"')
    + text(x0 + 26, 58, ellipsize(`${stats.login || cfg.username} / ${repo.name}`, 13, 500, tw - 30), { size: 13, weight: 500, fill: fg, extra: 'opacity=".75"' });
  const titleSize = fitSize(title, 32, 600, tw, 20);
  const lines = wrap(desc, 15, 400, tw, 2);
  const txt = text(x0, 104, title, { size: titleSize, weight: 600, fill: fg, tracking: -0.3 })
    + lines.map((l, i) => text(x0, 134 + i * 22, l, { size: 15, weight: 400, fill: fg, extra: 'opacity=".8"' })).join('');

  // Squiggly (wavy) progress — M3 Expressive
  const py = 196;
  const fromL = f.from || '0:00', toL = f.to || '';
  const xs = x0 + measure(fromL, 12, 600) + 14;
  const xe = x1 - (toL ? measure(toL, 12, 600) + 14 : 0);
  const el = (xe - xs) * Math.min(Math.max(f.progress ?? 0.6, 0.08), 0.92);
  const lambda = 22, amp = 3.6;
  let wave = `M${r1(xs - 2 * lambda)} ${py}`;
  for (let x = xs - 2 * lambda; x < xs + el + lambda; x += lambda / 2) {
    const up = Math.round((x - xs) / (lambda / 2)) % 2 === 0;
    wave += `Q${r1(x + lambda / 4)} ${r1(py + (up ? -amp * 2 : amp * 2))} ${r1(x + lambda / 2)} ${py}`;
  }
  const progress = `<defs><clipPath id="wv"><rect x="${r1(xs)}" y="${py - 12}" width="${r1(el)}" height="24"/></clipPath></defs>
${text(x0, py + 4.5, fromL, { size: 12, weight: 600, fill: fg, extra: 'opacity=".75"' })}
${toL ? text(x1, py + 4.5, toL, { size: 12, weight: 600, fill: fg, anchor: 'end', extra: 'opacity=".75"' }) : ''}
<g clip-path="url(#wv)"><path d="${wave}" fill="none" stroke="${t.primary}" stroke-width="4" stroke-linecap="round">
<animateTransform attributeName="transform" type="translate" from="0 0" to="${lambda} 0" dur="1.1s" repeatCount="indefinite"/></path></g>
<circle cx="${r1(xs)}" cy="${py}" r="2" fill="${t.primary}"/>
<rect x="${r1(xs + el - 2)}" y="${py - 11}" width="4" height="22" rx="2" fill="${t.primary}"/>
<line x1="${r1(xs + el + 8)}" y1="${py}" x2="${r1(xe)}" y2="${py}" stroke="${fg}" stroke-opacity=".22" stroke-width="4" stroke-linecap="round"/>
<circle cx="${r1(xe)}" cy="${py}" r="2.4" fill="${t.primary}"/>`;

  // Chips + transport controls
  const cy = 236;
  const starL = `${compact(repo.stars || 0)} star${repo.stars === 1 ? '' : 's'}`;
  const c1 = chip(x0, cy - 17, { icon: 'star', label: starL }, { h: 34, stroke: fg, strokeOpacity: 0.3, fg, iconColor: t.primary, size: 13 });
  const c2 = repo.language ? chip(x0 + c1.w + 8, cy - 17, { icon: 'code', label: repo.language }, { h: 34, stroke: fg, strokeOpacity: 0.3, fg, iconColor: t.primary, size: 13 }) : { svg: '' };
  const bx = x1 - 196;
  const controls = `<circle cx="${bx + 26}" cy="${cy}" r="26" fill="${fg}" fill-opacity=".08"/>
${icon('fast_rewind', bx + 12, cy - 14, 28, fg)}
<rect x="${bx + 60}" y="${cy - 28}" width="76" height="56" rx="18" fill="${t.primary}">
<animate attributeName="rx" values="18;28;18" dur="2.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines="0.3 0 0 1;0.3 0 0 1"/></rect>
${icon('pause', bx + 82, cy - 16, 32, t.onPrimary)}
<circle cx="${bx + 170}" cy="${cy}" r="26" fill="${fg}" fill-opacity=".08"/>
${icon('fast_forward', bx + 156, cy - 14, 28, fg)}`;

  const body = `<rect width="${W}" height="${H}" rx="36" fill="${bg}"/>
${pop(0.05, art)}
${rise(0.1, meta)}
${rise(0.18, txt)}
${fade(0.3, progress)}
${rise(0.4, c1.svg + c2.svg + controls)}`;
  return doc({ width: W, height: H, title: `${title}: ${desc}`, body, t });
}

/* ───────────────────────── Stat widgets in expressive shapes ───────────────────────── */
export function stats({ t, stats: s }) {
  const H = 196, gap = 16, n = 4;
  const w = (W - gap * (n - 1)) / n;
  const items = [
    { value: s.publicRepos, label: 'Public repos', shape: 'cookie9', bg: t.primaryContainer, fg: t.onPrimaryContainer, dur: 40 },
    { value: s.stars, label: 'Stars earned', shape: 'sunny', bg: t.tertiaryContainer, fg: t.onTertiaryContainer, dur: 30 },
    { value: s.followers, label: 'Followers', shape: 'clover4', bg: t.secondaryContainer, fg: t.onSecondaryContainer, dur: 36 },
    { value: s.contributions?.total ?? '—', label: 'Contributions', shape: 'flower', bg: t.primary, fg: t.onPrimary, dur: 44 },
  ];
  const body = items.map((it, i) => {
    const x = i * (w + gap);
    const val = typeof it.value === 'number' ? compact(it.value) : it.value;
    const size = fitSize(val, 44, 700, 92, 20);
    return pop(0.06 + i * 0.08, `<rect x="${r1(x)}" width="${r1(w)}" height="${H}" rx="32" fill="${t.surfaceContainer}"/>
<g transform="translate(${r1(x + w / 2)} 84)"><g>${spin(it.dur, i % 2 === 1)}<path d="${shapePath(it.shape, 60)}" fill="${it.bg}"/></g>
${text(0, size * 0.36, val, { size, weight: 700, fill: it.fg, anchor: 'middle', tracking: -0.5 })}</g>
${text(x + w / 2, 172, it.label, { size: 15, weight: 500, fill: t.onSurfaceVariant, anchor: 'middle' })}`);
  }).join('\n');
  return doc({ width: W, height: H, title: `Stats: ${items.map((i) => `${i.value} ${i.label}`).join(', ')}`, body, t });
}

/* ───────────────────────── Digital Wellbeing-style activity + languages ───────────────────────── */
export function activity({ t, cfg, stats: s }) {
  const H = 252, gap = 16, w = (W - gap) / 2, pad = 28;

  // Left: last 7 days
  const days = s.contributions?.last7 || [];
  const total7 = days.reduce((a, d) => a + d.contributionCount, 0);
  const max = Math.max(1, ...days.map((d) => d.contributionCount));
  const cw = w - pad * 2, bw = 30, bgap = (cw - 7 * bw) / 6, base = 196, maxH = 76;
  const bars = days.map((d, i) => {
    const x = pad + i * (bw + bgap);
    const today = i === days.length - 1;
    const day = 'SMTWTFS'[new Date(`${d.date}T00:00:00Z`).getUTCDay()];
    const label = text(x + bw / 2, 226, day, { size: 12, weight: today ? 700 : 500, fill: today ? t.primary : t.onSurfaceVariant, anchor: 'middle' });
    if (!d.contributionCount) return `<rect x="${r1(x)}" y="${base - 8}" width="${bw}" height="8" rx="4" fill="${t.surfaceContainerHighest}"/>${label}`;
    const h = Math.max(14, (d.contributionCount / max) * maxH);
    return `<rect class="grow" style="animation-delay:${r1(0.2 + i * 0.05)}s" x="${r1(x)}" y="${r1(base - h)}" width="${bw}" height="${r1(h)}" rx="${Math.min(15, h / 2)}" fill="${t.primary}"/>${label}`;
  }).join('');
  const bigN = String(total7);
  const left = `<rect width="${r1(w)}" height="${H}" rx="32" fill="${t.surfaceContainer}"/>
${text(pad, 44, 'Last 7 days', { size: 14, weight: 500, fill: t.onSurfaceVariant })}
${text(pad, 94, bigN, { size: 44, weight: 600, fill: t.onSurface, tracking: -0.5 })}
${text(pad + measure(bigN, 44, 600, -0.5) + 10, 94, `contribution${total7 === 1 ? '' : 's'}`, { size: 16, weight: 400, fill: t.onSurfaceVariant })}
${s.contributions?.streak > 1 ? text(w - pad, 44, `${s.contributions.streak}-day streak`, { size: 13, weight: 600, fill: t.tertiary, anchor: 'end' }) : ''}
${bars}`;

  // Right: languages
  const exclude = new Set(cfg.languages?.exclude || []);
  const entries = Object.entries(s.languages || {}).filter(([k]) => !exclude.has(k)).sort((a, b) => b[1] - a[1]);
  const sum = entries.reduce((a, [, v]) => a + v, 0) || 1;
  const maxL = cfg.languages?.max || 5;
  let langs = entries.slice(0, maxL).map(([k, v]) => ({ name: k, pct: v / sum }));
  const rest = entries.slice(maxL).reduce((a, [, v]) => a + v, 0);
  if (rest) langs.push({ name: 'Other', pct: rest / sum });
  if (!langs.length) langs = [{ name: '—', pct: 1 }];
  const colors = [t.primary, t.tertiary, t.secondary, t.onSurfaceVariant, t.outline, t.outlineVariant];
  const pctS = (p) => `${(p * 100).toFixed(p >= 0.995 || p < 0.1 ? 0 : 1)}%`.replace(/^0%$/, '<1%');
  const by = 122, bh = 14, sg = 4;
  const usable = cw - sg * (langs.length - 1);
  let bxp = pad;
  const seg = langs.map((l, i) => {
    const sw = Math.max(bh, l.pct * usable);
    const r = `<rect x="${r1(bxp)}" y="${by}" width="${r1(sw)}" height="${bh}" rx="${bh / 2}" fill="${colors[i]}"/>`;
    bxp += sw + sg;
    return r;
  }).join('');
  const twoCol = langs.length > 3;
  const colW = twoCol ? (cw - 20) / 2 : cw;
  const legend = langs.map((l, i) => {
    const col = twoCol ? i % 2 : 0, row = twoCol ? Math.floor(i / 2) : i;
    const lx = pad + col * (colW + 20), ly = 172 + row * 28;
    return `<circle cx="${r1(lx + 6)}" cy="${ly - 5}" r="6" fill="${colors[i]}"/>
${text(lx + 20, ly, ellipsize(l.name, 14, 500, colW - 80), { size: 14, weight: 500, fill: t.onSurface })}
${text(lx + colW, ly, pctS(l.pct), { size: 14, weight: 400, fill: t.onSurfaceVariant, anchor: 'end' })}`;
  }).join('');
  const top = langs[0];
  const right = `<g transform="translate(${r1(w + gap)} 0)">
<rect width="${r1(w)}" height="${H}" rx="32" fill="${t.surfaceContainer}"/>
${text(pad, 44, 'Top languages', { size: 14, weight: 500, fill: t.onSurfaceVariant })}
${text(pad, 94, top.name, { size: fitSize(top.name, 44, 600, 230, 22), weight: 600, fill: t.onSurface, tracking: -0.5 })}
${text(pad + Math.min(230, measure(top.name, fitSize(top.name, 44, 600, 230, 22), 600, -0.5)) + 10, 94, pctS(top.pct), { size: 16, weight: 400, fill: t.onSurfaceVariant })}
${seg}
${legend}
${langs.length <= 2 ? text(pad, H - 28, `${bytes(sum)} of code across ${s.ownRepos ?? s.publicRepos} repo${(s.ownRepos ?? s.publicRepos) === 1 ? '' : 's'}`, { size: 13, weight: 400, fill: t.onSurfaceVariant }) : ''}
</g>`;

  return doc({ width: W, height: H, title: `Activity: ${total7} contributions in the last 7 days. Top languages: ${langs.map((l) => `${l.name} ${pctS(l.pct)}`).join(', ')}`, body: `${rise(0.05, left)}\n${rise(0.15, right)}`, t });
}

function bytes(n) {
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return `${n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)} ${u[i]}`;
}

/* ───────────────────────── Toolbox: filter chips ───────────────────────── */
export function toolbox({ t, cfg }) {
  const tb = cfg.toolbox || { title: 'Toolbox', chips: [] };
  const x0 = 32, x1 = W - 32, h = 42, gap = 10, top = 84;
  let x = x0, y = top;
  const placed = tb.chips.map((c) => {
    const w = 14 + 20 + 8 + measure(c.label, 15, 500) + 18;
    if (x + w > x1 && x > x0) { x = x0; y += h + gap; }
    const p = { ...c, x, y, w };
    x += w + gap;
    return p;
  });
  const H = y + h + 32;
  const chips = placed.map((c, i) => {
    const sel = !!c.selected;
    return rise(0.08 + i * 0.05, `<rect x="${r1(c.x)}" y="${c.y}" width="${r1(c.w)}" height="${h}" rx="12" fill="${sel ? t.secondaryContainer : 'none'}"${sel ? '' : ` stroke="${t.outlineVariant}" stroke-width="1.2"`}/>
${icon(c.icon, c.x + 14, c.y + 11, 20, sel ? t.onSecondaryContainer : t.primary)}
${text(c.x + 42, c.y + 26.5, c.label, { size: 15, weight: 500, fill: sel ? t.onSecondaryContainer : t.onSurfaceVariant })}`);
  }).join('\n');
  const body = `<defs>${clip('c', H)}</defs>
<g clip-path="url(#c)">
<rect width="${W}" height="${H}" fill="${t.surfaceContainer}"/>
<g transform="translate(${W - 34} 30)"><g>${spin(50)}<path d="${shapePath('cookie12', 70)}" fill="${t.tertiaryContainer}"/></g></g>
${icon('auto_awesome', W - 52, 14, 30, t.onTertiaryContainer)}
${fade(0, text(x0, 56, tb.title || 'Toolbox', { size: 22, weight: 500, fill: t.onSurface }))}
${chips}
</g>`;
  return doc({ width: W, height: H, title: `${tb.title}: ${tb.chips.map((c) => c.label).join(', ')}`, body, t });
}

/* ───────────────────────── Buttons + footer ───────────────────────── */
export function button({ t, cfg, stats: s }, b) {
  const label = fill(b.label, vars(cfg, s));
  const h = 56, size = 16;
  const w = Math.ceil(24 + 22 + 10 + measure(label, size, 600) + 28);
  const [bg, fg] = b.style === 'tonal' ? [t.secondaryContainer, t.onSecondaryContainer]
    : b.style === 'outlined' ? ['none', t.primary] : [t.primary, t.onPrimary];
  const body = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" fill="${bg}"${b.style === 'outlined' ? ` stroke="${t.outline}" stroke-width="1.2"` : ''}/>
${icon(b.icon, 24, (h - 22) / 2, 22, fg)}
${text(56, h / 2 + size * 0.36, label, { size, weight: 600, fill: fg })}`;
  return doc({ width: w, height: h, title: label, body, t });
}

export function footer({ t, cfg, now }) {
  const H = 64;
  const line = `Updated ${now.date} · ${now.time} ${now.zone} · Material You, seed ${cfg.theme?.seed || ''}`;
  const body = `${text(W / 2, 22, line, { size: 13, weight: 500, fill: t.onSurfaceVariant, anchor: 'middle' })}
<rect x="${W / 2 - 64}" y="46" width="128" height="5" rx="2.5" fill="${t.onSurface}" opacity=".4"/>`;
  return doc({ width: W, height: H, title: line, body, t });
}

export const CARDS = { hero, 'quick-settings': quickSettings, 'now-playing': nowPlaying, stats, activity, toolbox, footer };
