// Combo (4+ fish fed): a pond-wide burst of bubbles rising from the centre, swelling, wobbling and popping
// into little rings, with a soft flash at the start.
import { Rng, fit, ease, seg, TAU, WHITE } from "../../core/index.js";

export const meta = {
  name: "Combo bubbles",
  desc: "A burst of bubbles rising and popping into rings.",
  tags: ["water", "bubble", "combo", "celebrate", "one-shot"],
  size: [64, 72],
  origin: [32, 44],
  duration: 1.2,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#74B7BA", "#9AD0CF", "#D9F2F0", "#FFFFFF"], seed: 4 },
};

export function create(o) {
  const C = fit(o.palette, 4), R = new Rng(o.seed);
  const bubbles = Array.from({ length: 16 }, (_, i) => {
    const a = R.range(0, TAU), sp = R.range(8, 26);
    return { x0: Math.cos(a) * sp * 0.4, y0: Math.sin(a) * sp * 0.25 + 4, vx: Math.cos(a) * sp * 0.6, up: R.range(18, 34), d0: R.range(0, 0.3), life: R.range(0.45, 0.75), r: R.range(1, 3), w: R.range(0, TAU) };
  });
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t < 0.1) p.glow(0, 0, 22 * (1 - t / 0.1), C[2], 0.4);
      const u = t / 0.5;
      if (u < 1) p.ring(0, 2, 3 + 18 * ease.outCubic(u), 1, u < 0.2 ? WHITE : C[1], 0.9 * (1 - u));
      for (const b of bubbles) {
        const a = t - b.d0;
        if (a < 0 || a > b.life + 0.12) continue;
        const k = Math.min(1, a / b.life), x = b.x0 + b.vx * ease.outCubic(k) + Math.sin(a * 9 + b.w) * 1.2, y = b.y0 - b.up * a;
        if (a <= b.life) {
          const r = b.r * (0.5 + 0.5 * k);
          if (r < 1.2) p.px(x, y, C[2]);
          else { p.ring(x, y, r, 1, C[1]); p.px(x - r * 0.5, y - r * 0.5, WHITE); }
        } else {
          // pop: a ring that expands and vanishes
          const q = (a - b.life) / 0.12;
          p.ring(x, y, b.r + 2 * q, 1, C[2], 1 - q);
        }
      }
    },
  };
}
