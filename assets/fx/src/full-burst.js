// A fish becomes full: a white flash, a ring snapping out, sparkles thrown wide that twinkle and hang,
// and little hearts rising on wobbly paths. Centred on the fish.
import { Rng, fit, ease, seg, TAU, WHITE, sparkle } from "../../core/index.js";

export const meta = {
  name: "Full burst",
  desc: "Celebration burst: flash, ring, twinkles and rising mini hearts.",
  tags: ["sparkle", "celebrate", "reward", "one-shot"],
  size: [48, 48],
  origin: [24, 24],
  duration: 1.0,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#F28C28", "#FFC46B", "#FFF2B0", "#FFFFFF"], hearts: ["#E5304A", "#FF7A88"], seed: 2 },
};

const HEART = ["x_x", "xxx", "_x_"];

export function create(o) {
  const C = fit(o.palette, 4), H = fit(o.hearts, 2), R = new Rng(o.seed);
  const stars = Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * TAU + R.range(-0.25, 0.25), d: R.range(11, 19), life: R.range(0.5, 0.85), d0: R.range(0, 0.1), ph: R.range(0, TAU), big: i % 3 === 0 }));
  const hearts = Array.from({ length: 5 }, (_, i) => ({ x: R.range(-9, 9), d0: 0.08 + i * 0.06, life: R.range(0.4, 0.55), w: R.range(0, TAU), sp: R.range(14, 22) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t < 0.07) { p.circle(0, 0, 4 * (1 - t / 0.07) + 1, WHITE); p.glow(0, 0, 14, C[2], 0.6); }
      const u = t / 0.4;
      if (u < 1) {
        const r = 2 + 15 * ease.outExpo(u);
        p.ring(0, 0, r, 1, u < 0.3 ? WHITE : C[2], 1.2 - u);
        p.glowRing(0, 0, r, 4, C[1], 0.3 * (1 - u));
      }
      for (const s of stars) {
        const a = t - s.d0;
        if (a < 0 || a > s.life) continue;
        const k = a / s.life, dist = s.d * ease.outCubic(Math.min(1, a / 0.3));
        const x = Math.cos(s.a) * dist, y = Math.sin(s.a) * dist + 4 * k * k;
        const tw = 0.6 + 0.4 * Math.sin(a * 24 + s.ph);
        if (k > 0.65 && Math.sin(a * 40 + s.ph) < 0) continue;
        const arm = Math.round((s.big ? 2.2 : 1.3) * tw * (1 - k * 0.5));
        sparkle(p, x, y, arm, k < 0.4 ? WHITE : C[2], C[1], 0.3 * (1 - k));
      }
      for (const h of hearts) {
        const a = t - h.d0;
        if (a < 0 || a > h.life) continue;
        const k = a / h.life, x = h.x + Math.sin(a * 7 + h.w) * 2, y = -4 - h.sp * a;
        p.sprite(HEART, { x: k < 0.2 ? WHITE : H[0] }, x - 1, y - 1, { a: 1 - seg(k, 0.6, 1) });
        p.glow(x, y, 4, H[1], 0.25 * (1 - k));
      }
    },
  };
}
