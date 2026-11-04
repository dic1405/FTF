// An uneaten piece sinks: it darkens, shrinks, and breaks into crumbs that drift down and dissolve.
// Palette is the food's ramp (dark -> light); rendered once per food.
import { Rng, fit, seg, ease } from "../../core/index.js";

export const meta = {
  name: "Sink and dissolve",
  desc: "A food piece darkens, sinks and crumbles away.",
  tags: ["food", "sink", "dissolve", "one-shot"],
  size: [14, 16],
  origin: [7, 6],
  duration: 0.8,
  loop: false,
  fps: 20,
  bg: "dark",
  options: { palette: ["#1E1A1A", "#C9971F", "#FFD23F", "#FFF2B0"], seed: 5 },
};

export function create(o) {
  const C = fit(o.palette, 4), R = new Rng(o.seed);
  const crumbs = Array.from({ length: 6 }, () => ({ x: R.range(-2, 2), vx: R.range(-6, 6), vy: R.range(6, 14), d0: R.range(0.2, 0.4), life: R.range(0.3, 0.45) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      const k = seg(t, 0, 0.45);
      if (k < 1) {
        const r = 2.5 * (1 - ease.inQuad(k) * 0.7), y = 3 * k;
        const c = k < 0.35 ? C[2] : k < 0.7 ? C[1] : C[0];
        p.circle(0, y, r, c, 1 - k * 0.5);
        if (k < 0.5) p.px(-1, y - 1, C[3]);
        p.ring(0, y, r + 0.5, 1, C[0], 0.5 * (1 - k));
      }
      for (const c of crumbs) {
        const a = t - c.d0;
        if (a < 0 || a > c.life) continue;
        const q = a / c.life;
        p.dot(c.x + c.vx * a, 2 + c.vy * a, q < 0.5 ? C[1] : C[0], 1 - q);
      }
    },
  };
}
