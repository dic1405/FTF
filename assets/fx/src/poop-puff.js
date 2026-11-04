// Digest: a small brown-green cloud puffs out of the tail end (to the left, the effect faces right like the
// fish) in three soft blobs that drift, swell, thin out and fade, with a few dark flecks sinking.
import { Rng, fit, seg, ease } from "../../core/index.js";

export const meta = {
  name: "Poop puff",
  desc: "A small brown-green cloud drifting off the tail, fading.",
  tags: ["status", "digest", "cloud", "one-shot"],
  size: [24, 20],
  origin: [16, 10],
  duration: 0.7,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#33301C", "#55533A", "#6F7048", "#8A8C5A"], seed: 3 },
};

export function create(o) {
  const C = fit(o.palette, 4), R = new Rng(o.seed);
  const blobs = Array.from({ length: 4 }, (_, i) => ({ d0: i * 0.05, vx: -R.range(10, 20), vy: R.range(-5, 5), r0: R.range(1.5, 2.5), g: R.range(1.5, 3), life: R.range(0.45, 0.6), c: i % 2 ? C[2] : C[1] }));
  const flecks = Array.from({ length: 5 }, () => ({ d0: R.range(0, 0.1), vx: -R.range(6, 14), vy: R.range(-6, 6), life: R.range(0.3, 0.5) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      for (const b of blobs) {
        const a = t - b.d0;
        if (a < 0 || a > b.life) continue;
        const k = a / b.life, e = ease.outCubic(k);
        const x = -2 + b.vx * e * 0.5, y = b.vy * e * 0.5, r = b.r0 + b.g * e;
        p.disc(x, y, r, b.c, 0.85 * (1 - seg(k, 0.45, 1)));
        if (k < 0.5) p.dot(x - 1, y - 1, C[3], 0.6 * (1 - k * 2));
      }
      for (const f of flecks) {
        const a = t - f.d0;
        if (a < 0 || a > f.life) continue;
        const k = a / f.life;
        p.dot(-1 + f.vx * a, f.vy * a + 8 * k * k, C[0], 1 - k);
      }
    },
  };
}
