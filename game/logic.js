// Feed the Fishes v2 rules (pure, no DOM). Ported from the Prototype Build Brief.
// A feed is a list of servings, one per filled slot. The same food may fill several slots.
// Foods: P Pellet (yellow), A Algae (green), K Krill (blue), W Worm (violet).
export const FOODS = ['P', 'A', 'K', 'W'];

export function servings(level, slots) { const c = { P: 0, A: 0, K: 0, W: 0 }; for (const i of slots) for (const f of level.items[i].foods) c[f]++; return c; }
export function reaction(fish, c) {
  const bad = (fish.digest || []).reduce((n, f) => n + c[f], 0);
  if (bad > 0) return -bad;
  if (fish.both) return Math.min(c[fish.both[0]], c[fish.both[1]]);
  return fish.any.reduce((n, f) => n + c[f], 0);
}
export function initPond(level) { return level.fish.map((f, i) => ({ ...f, id: i, fill: f.start || 0 })); }
export function feed(level, pond, slots) {
  const c = servings(level, slots);
  const events = []; let fedFish = 0;
  const next = pond.map(f => {
    const r = reaction(f, c);
    const fill = Math.max(0, Math.min(f.hearts, f.fill + r));
    const gained = Math.max(0, fill - f.fill), lost = Math.max(0, f.fill - fill);
    if (gained > 0) fedFish++;
    const outcome = r < 0 ? (lost > 0 ? 'digest' : 'digestEmpty') : r > 0 ? (gained > 0 ? 'eat' : 'fullIgnore') : 'ignore';
    events.push({ id: f.id, outcome, bites: r > 0 ? r : 0, gained, lost, from: f.fill, to: fill, becameFull: fill === f.hearts && f.fill < f.hearts, overflow: r > 0 ? r - gained : 0, bad: r < 0 ? -r : 0 });
    return { ...f, fill };
  });
  return { pond: next, events, counts: c, fedFish };
}
export const fullCount = pond => pond.filter(f => f.fill === f.hearts).length;
export const isWin = pond => fullCount(pond) === pond.length;

export function gains(level, pond, slots) { const c = servings(level, slots); return pond.map(f => { const r = reaction(f, c); return r > 0 ? Math.min(f.hearts, f.fill + r) - f.fill : 0; }); }
export function wastedSlots(level, pond, slots) {
  const full = gains(level, pond, slots), out = [];
  slots.forEach((item, k) => {
    if (slots.lastIndexOf(item) !== k) return;
    const rest = slots.filter((_, j) => j !== k), g = gains(level, pond, rest);
    if (g.every((v, i) => v >= full[i])) out.push(k);
  });
  return out;
}
export function feeds(level, maxSlots = level.slots, noRepeat = false) {
  const n = level.items.length, out = [];
  const rec = (start, cur) => {
    if (cur.length) out.push([...cur]);
    if (cur.length === maxSlots) return;
    for (let i = start; i < n; i++) { cur.push(i); rec(noRepeat ? i + 1 : i, cur); cur.pop(); }
  };
  rec(0, []);
  return out;
}
export function model(level, maxSlots, noRepeat) {
  const acts = feeds(level, maxSlots, noRepeat), n = level.fish.length, belly = level.fish.map(f => f.hearts);
  const deltas = acts.map(a => { const c = servings(level, a); return level.fish.map(f => reaction(f, c)); });
  const apply = (s, d) => { let o = 0; for (let i = 0; i < n; i++) { let h = ((s >> (2 * i)) & 3) + d[i]; if (h < 0) h = 0; else if (h > belly[i]) h = belly[i]; o |= h << (2 * i); } return o; };
  const full = s => { for (let i = 0; i < n; i++) if (((s >> (2 * i)) & 3) !== belly[i]) return false; return true; };
  const encode = pond => pond.reduce((o, f, i) => o | (f.fill << (2 * i)), 0);
  return { acts, deltas, apply, full, encode, n };
}
export function solveFrom(level, pond, turnsLeft) {
  const M = model(level);
  const start = M.encode(pond);
  if (M.full(start)) return { turns: 0, food: 0, first: [] };
  let layer = new Map([[start, { food: 0, first: null }]]); const seen = new Set([start]);
  for (let t = 1; t <= turnsLeft; t++) {
    const next = new Map();
    for (const [s, info] of layer) M.acts.forEach((a, k) => {
      const s2 = M.apply(s, M.deltas[k]);
      if (seen.has(s2) && !next.has(s2)) return;
      const food = info.food + a.length, cur = next.get(s2);
      if (!cur || food < cur.food) next.set(s2, { food, first: info.first || a });
    });
    for (const s of next.keys()) seen.add(s);
    let best = null; for (const [s, info] of next) if (M.full(s) && (!best || info.food < best.food)) best = info;
    if (best) return { turns: t, food: best.food, first: best.first };
    layer = next;
  }
  return null;
}
export function stars(level, turns, food, won) { if (!won) return 0; if (turns > level.parTurns) return 1; return food <= level.parFood ? 3 : 2; }
