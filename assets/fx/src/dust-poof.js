// Food lands on grass: a short beige dust poof, three soft puffs that swell and thin, a few grass flecks
// kicked up that fall back.
import { Rng, fit, seg, ease } from "../../core/index.js";

export const meta = {
  name: "Dust poof",
  desc: "Landing poof on grass: soft beige puffs and a few kicked-up flecks.",
  tags: ["dust", "landing", "one-shot"],
  size: [32, 24],
  origin: [16, 16],
  duration: 0.5,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#8E7F68", "#B9A98F", "#D9CDB5", "#F0E7D4"], flecks: ["#5A9A48", "#8CC074"], seed: 2 },
};

export function create(o) {
  const C = fit(o.palette, 4), F = fit(o.flecks, 2), R = new Rng(o.seed);
  const puffs = [-1, 0, 1].map((s, i) => ({ x: s * 4, d0: i * 0.03, vx: s * R.range(14, 22), r0: R.range(2, 3), g: R.range(3, 5), life: R.range(0.3, 0.42), c: i === 1 ? C[2] : C[1] }));
  const flecks = Array.from({ length: 6 }, () => ({ x: R.range(-3, 3), vx: R.range(-24, 24), vy: -R.range(20, 40), life: R.range(0.25, 0.4), c: R.pick(F) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      for (const b of puffs) {
        const a = t - b.d0;
        if (a < 0 || a > b.life) continue;
        const k = a / b.life, e = ease.outCubic(k);
        p.disc(b.x + b.vx * e * 0.4, -1 - 3 * e, b.r0 + b.g * e, b.c, 0.8 * (1 - seg(k, 0.4, 1)));
        if (k < 0.4) p.dot(b.x + b.vx * e * 0.4 - 1, -2 - 3 * e, C[3], 0.7);
      }
      for (const f of flecks) {
        if (t > f.life) continue;
        const k = t / f.life;
        p.dot(f.x + f.vx * t, f.vy * t + 120 * t * t, f.c, 1 - k * 0.5);
      }
    },
  };
}
