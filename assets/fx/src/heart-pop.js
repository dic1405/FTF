// A bite fills a heart: a tiny heart pops up over the fish, bounces once, and drifts up fading, with
// four sparks thrown out at the moment of the pop.
import { fit, ease, seg, TAU, WHITE } from "../../core/index.js";

export const meta = {
  name: "Heart pop",
  desc: "A tiny heart pops up, bounces and drifts away; sparks at the pop.",
  tags: ["ui", "heart", "pickup", "one-shot"],
  size: [20, 26],
  origin: [10, 20],
  duration: 0.5,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#B01F38", "#E5304A", "#FF7A88", "#FFD2D8", "#FFFFFF"], seed: 1 },
};

const HEART = ["_x_x_", "xxxxx", "xxxxx", "_xxx_", "__x__"];

export function create(o) {
  const C = fit(o.palette, 5);
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      const u = t / meta.duration;
      // pop: scale up fast with an overshoot, then rise and fade
      const sc = t < 0.08 ? ease.outBack(t / 0.08) : 1;
      const rise = -10 * ease.outQuad(u), fade = 1 - seg(u, 0.6, 1);
      const bounce = t > 0.08 ? Math.abs(Math.sin((t - 0.08) * 14)) * 1.5 * (1 - u) : 0;
      const y = rise - bounce;
      if (sc > 0.2) {
        const pal = { x: u < 0.15 ? WHITE : C[1] };
        p.sprite(HEART, pal, -2, y - 2, { a: fade });
        if (u >= 0.15) { p.dot(-1, y - 1, C[3], fade); p.dot(1, y + 1, C[0], fade * 0.7); }
        p.glow(0, y, 6, C[2], 0.35 * fade);
      }
      // sparks
      if (t < 0.22) {
        const k = t / 0.22;
        for (let i = 0; i < 4; i++) {
          const a = i * (TAU / 4) + 0.6, d = 3 + 6 * ease.outCubic(k);
          p.dot(Math.cos(a) * d, Math.sin(a) * d - 1, k < 0.5 ? WHITE : C[2], 1 - k);
        }
      }
    },
  };
}
