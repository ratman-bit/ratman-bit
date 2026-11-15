// Material 3 Expressive shape library, approximated as polar functions r(θ).
// Every shape is sampled at the same N angles, so any two can be morphed with SMIL.
import { r1 } from './svg.mjs';

const N = 72;
const TAU = Math.PI * 2;

const polygon = (k, round) => (t) => {
  const seg = TAU / k;
  const a = ((t % seg) + seg) % seg - seg / 2;
  const poly = Math.cos(Math.PI / k) / Math.cos(a);
  return (1 - round) * poly + round;
};

export const SHAPES = {
  circle: () => 0.94,
  cookie9: (t) => 0.93 + 0.07 * Math.cos(9 * t),
  cookie12: (t) => 0.94 + 0.05 * Math.cos(12 * t),
  sunny: (t) => 0.86 + 0.14 * ((Math.cos(8 * t) + 1) / 2) ** 1.6,
  clover4: (t) => 0.7 + 0.3 * Math.abs(Math.cos(2 * t)) ** 0.5,
  flower: (t) => 0.78 + 0.22 * Math.abs(Math.cos(4 * t)) ** 0.6,
  squircle: (t) => 0.86 * (Math.abs(Math.cos(t)) ** 4 + Math.abs(Math.sin(t)) ** 4) ** -0.25,
  pentagon: (t) => 0.92 * polygon(5, 0.35)(t - Math.PI / 2),
  gem: (t) => 0.95 * polygon(6, 0.3)(t),
};

/** Closed, smooth path (Catmull-Rom -> cubic Bézier) of a shape centred on 0,0. */
export function shapePath(name, R, phase = 0) {
  const f = SHAPES[name];
  if (!f) throw new Error(`Unknown shape "${name}". Available: ${Object.keys(SHAPES).join(', ')}`);
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * TAU + phase;
    const r = f(t) * R;
    pts.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  const P = (i) => pts[(i + N) % N];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < N; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + 'Z';
}

/** <animate> that holds each shape, then morphs to the next with an emphasized ease. */
export function morph(names, R, { hold = 2.2, move = 0.9 } = {}) {
  const seq = [...names, names[0]];
  const step = hold + move;
  const total = step * names.length;
  const values = [];
  const times = [];
  const splines = [];
  seq.forEach((n, i) => {
    const d = shapePath(n, R);
    const start = i * step;
    values.push(d);
    times.push(start / total);
    if (i < names.length) {
      values.push(d);
      times.push((start + hold) / total);
      splines.push('0 0 1 1', '0.3 0 0 1');
    }
  });
  return `<animate attributeName="d" dur="${r1(total)}s" repeatCount="indefinite" calcMode="spline" values="${values.join(';')}" keyTimes="${times.map((x) => x.toFixed(4)).join(';')}" keySplines="${splines.join(';')}"/>`;
}

export const spin = (dur, reverse = false) =>
  `<animateTransform attributeName="transform" type="rotate" from="0" to="${reverse ? -360 : 360}" dur="${dur}s" repeatCount="indefinite"/>`;
