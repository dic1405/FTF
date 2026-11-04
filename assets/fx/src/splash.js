// Food lands on the pond, seen from above: a white hit, a ring spreading out, droplets thrown outward that
// shrink and plink down, a second fainter ring behind.
import { Rng, fit, ease, seg, TAU, WHITE } from "../../core/index.js";

export const meta = {
  name: "Pond splash",
  desc: "Top-down landing splash: white hit, spreading ring, outward droplets.",
  tags: ["water", "splash", "pond", "one-shot", "top-down"],
  size: [32, 32],
  origin: [16, 16],
  duration: 0.55,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#4A8A90", "#74B7BA", "#9AD0CF", "#D9F2F0", "#FFFFFF"], seed: 1 },
};

export function create(o) {
  const C = fit(o.palette, 5), R = new Rng(o.seed);
  const drops = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * TAU + R.range(-0.3, 0.3), sp = R.range(26, 48);
    return { a, sp, life: R.range(0.28, 0.42), d: R.range(0, 0.05), big: i % 3 === 0 };
  });
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      // hit flash
      if (t < 0.06) { p.circle(0, 0, 2.5 - t * 20, WHITE); p.glow(0, 0, 8, C[3], 0.5); }
      // main ring, fast out, thinning and fading
      const u = t / 0.45;
      if (u < 1) {
        const r = 1.5 + 11 * ease.outCubic(u);
        p.ring(0, 0, r, u < 0.35 ? 1.6 : 1, u < 0.2 ? WHITE : u < 0.6 ? C[3] : C[2], 1.3 - u * 1.1);
        p.glowRing(0, 0, r, 3, C[2], 0.25 * (1 - u));
      }
      // a second ring following
      const u2 = (t - 0.1) / 0.45;
      if (u2 > 0 && u2 < 1) p.ring(0, 0, 1 + 7 * ease.outQuad(u2), 1, C[2], (1 - u2) * 0.8);
      // droplets outward, slowing, shrinking, winking out
      for (const d of drops) {
        const a = t - d.d;
        if (a < 0 || a > d.life) continue;
        const k = a / d.life, dist = d.sp * (1 - Math.pow(1 - k, 2)) * 0.32 + 2;
        const x = Math.cos(d.a) * dist, y = Math.sin(d.a) * dist;
        const c = k < 0.3 ? WHITE : k < 0.7 ? C[3] : C[2];
        if (d.big && k < 0.5) { p.px(x, y, c); p.dot(x + 1, y, c, 0.7); p.dot(x, y + 1, c, 0.7); }
        else p.dot(x, y, c, 1 - k * 0.6);
      }
      // the settling centre: a dark dimple filling back in
      const s = seg(t, 0.05, 0.4);
      if (s < 1) p.circle(0, 0, 1.5 * (1 - s), C[0], 0.8 * (1 - s));
    },
  };
}
