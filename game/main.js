// Feed the Fishes — prototype v2. Plain canvas, logical 270x480, integer scaling, nearest neighbour.
import { LEVELS } from './levels.js';
import { initPond, feed, isWin, wastedSlots, solveFrom, stars as starsFor } from './logic.js';

const W = 270, H = 480, POND_H = 370, TS = 16;
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
// the backing store is 2x the logical size, so 1.5x UI sprites still land on whole device pixels
const BK = 2;
let scale = 1;   // css px per logical px
function fit() {
  scale = Math.max(1, Math.floor(Math.min(innerWidth / W, innerHeight / H)));
  cv.style.width = W * scale + 'px'; cv.style.height = H * scale + 'px';
}
addEventListener('resize', fit); fit();

// ------------------------------------------------------------------ assets
async function loadAtlas(png, json) {
  const [img, meta] = await Promise.all([
    new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = png; }),
    fetch(json).then(r => r.json()),
  ]);
  const frames = {}, order = [];
  if (Array.isArray(meta.frames)) meta.frames.forEach((f, i) => { frames[f.filename] = { ...f.frame, duration: f.duration }; order.push(f.filename); });
  else for (const k in meta.frames) { frames[k] = { ...meta.frames[k].frame, duration: meta.frames[k].duration }; order.push(k); }
  const tags = {};
  for (const t of meta.meta.frameTags || []) tags[t.name] = order.slice(t.from, t.to + 1).map(n => frames[n]);
  return { img, frames, tags, order, pixelfx: meta.meta.pixelfx };
}
const A = {};
async function loadAll() {
  const list = { fish: 'assets/out/fish', food: 'assets/out/food', ui: 'assets/out/ui', tiles: 'assets/out/tiles', props: 'assets/out/props',
    splash: 'assets/fx/splash', heartpop: 'assets/fx/heart-pop', fullburst: 'assets/fx/full-burst', poop: 'assets/fx/poop-puff', combo: 'assets/fx/combo-burst',
    sink_P: 'assets/fx/sink_P', sink_A: 'assets/fx/sink_A', sink_K: 'assets/fx/sink_K', sink_W: 'assets/fx/sink_W' };
  await Promise.all(Object.entries(list).map(async ([k, p]) => { A[k] = await loadAtlas(p + '.png', p + '.json'); }));
  // pixelfx sheets: one tag with all frames
  for (const k of ['splash', 'heartpop', 'fullburst', 'poop', 'combo', 'sink_P', 'sink_A', 'sink_K', 'sink_W']) A[k].all = A[k].order.map(n => A[k].frames[n]);
}
function spr(atlas, name, x, y, o = {}) {
  const f = typeof name === 'string' ? atlas.frames[name] : name;
  if (!f) return;
  const sc = o.scale || 1, dw = f.w * sc, dh = f.h * sc;
  const ox = o.cx ? -Math.floor(dw / 2) : 0, oy = o.cx ? -Math.floor(dh / 2) : 0;
  if (o.rot || o.alpha != null || o.flip) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (o.rot) ctx.rotate(o.rot);
    if (o.flip) ctx.scale(-1, 1);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.drawImage(atlas.img, f.x, f.y, f.w, f.h, ox, oy, dw, dh);
    ctx.restore();
  } else ctx.drawImage(atlas.img, f.x, f.y, f.w, f.h, Math.round(x) + ox, Math.round(y) + oy, dw, dh);
}
function nine(name, x, y, w, h) {
  const f = A.ui.frames[name], c = 8, im = A.ui.img;
  const d = (sx, sy, sw, sh, dx, dy, dw, dh) => ctx.drawImage(im, f.x + sx, f.y + sy, sw, sh, x + dx, y + dy, dw, dh);
  d(0, 0, c, c, 0, 0, c, c); d(f.w - c, 0, c, c, w - c, 0, c, c); d(0, f.h - c, c, c, 0, h - c, c, c); d(f.w - c, f.h - c, c, c, w - c, h - c, c, c);
  d(c, 0, f.w - 2 * c, c, c, 0, w - 2 * c, c); d(c, f.h - c, f.w - 2 * c, c, c, h - c, w - 2 * c, c);
  d(0, c, c, f.h - 2 * c, 0, c, c, h - 2 * c); d(f.w - c, c, c, f.h - 2 * c, w - c, c, c, h - 2 * c);
  d(c, c, f.w - 2 * c, f.h - 2 * c, c, c, w - 2 * c, h - 2 * c);
}

// ------------------------------------------------------------------ tiny pixel font (3x5)
const GL = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101011', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
  0: '010101101101010', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100110101010', 7: '111001010010010', 8: '010101010101010', 9: '010101011001110',
  ' ': '000000000000000', '.': '000000000000010', ',': '000000000010100', ':': '000010000010000', '!': '010010010000010', '?': '110001010000010', '-': '000000111000000', '+': '000010111010000', '/': '001001010100100', '(': '010100100100010', ')': '010001001001010', '★': '010111111010101', '&': '010101010101011', "'": '010010000000000',
};
function text(s, x, y, col, o = {}) {
  const sc = o.scale || 1, gap = sc;
  s = String(s).toUpperCase();
  let w = 0; for (const ch of s) w += 3 * sc + gap; w -= gap;
  let px = o.align === 'c' ? Math.round(x - w / 2) : o.align === 'r' ? Math.round(x - w) : Math.round(x);
  const draw = (dx, dy, c) => {
    let cx = px + dx;
    for (const ch of s) {
      const g = GL[ch] || GL['?'];
      for (let i = 0; i < 15; i++) if (g[i] === '1') { ctx.fillStyle = c; ctx.fillRect(cx + (i % 3) * sc, y + dy + Math.floor(i / 3) * sc, sc, sc); }
      cx += 3 * sc + gap;
    }
  };
  if (o.shadow) draw(sc, sc, o.shadow);
  draw(0, 0, col);
  return w;
}
function textW(s, sc = 1) { return String(s).length * (4 * sc) - sc; }

// ------------------------------------------------------------------ audio (tiny synth, no files)
let AC = null;
function beep(freq, dur = 0.08, type = 'square', vol = 0.08, slide = 0) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, AC.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), AC.currentTime + dur);
    g.gain.setValueAtTime(vol, AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + dur);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + dur);
  } catch (e) { }
}
const SFX = { tick: () => beep(900, 0.05, 'square', 0.05), pick: () => beep(500, 0.05, 'triangle', 0.05, 200), whoosh: () => beep(300, 0.25, 'sawtooth', 0.03, 600), splash: () => beep(200, 0.15, 'triangle', 0.05, -120),
  chomp: () => beep(160, 0.07, 'square', 0.08, -60), chime: () => { beep(660, 0.12, 'triangle', 0.06); setTimeout(() => beep(880, 0.18, 'triangle', 0.06), 90); }, plop: () => beep(120, 0.18, 'sine', 0.1, -60),
  combo: () => { [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'triangle', 0.06), i * 70)); }, flip: () => beep(400, 0.05, 'square', 0.04), fail: () => beep(220, 0.3, 'sawtooth', 0.05, -120),
  win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.07), i * 110)); }, undo: () => beep(700, 0.15, 'triangle', 0.05, -400), hint: () => beep(1000, 0.1, 'sine', 0.06, 300) };

// ------------------------------------------------------------------ helpers
const lerp = (a, b, t) => a + (b - a) * t, clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const easeOut = t => 1 - (1 - t) * (1 - t), easeIn = t => t * t, easeInOut = t => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
const rnd = (a, b) => a + Math.random() * (b - a);
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
const fishType = f => f.both ? 'catfish' : f.any.length === 2 ? 'goldfish' : 'koi';
const sizeKey = h => h === 1 ? 's' : h === 2 ? 'm' : 'l';
const SIZE = { s: { L: 32, W: 10 }, m: { L: 44, W: 13 }, l: { L: 56, W: 16 } };
// swim speed (px/s at 1x) per fish type, scaled by size (small fish dart, big fish cruise); turn = ms to settle a heading change
const SPEED = {
  koi:      { min: 14, max: 20, turn: 700 },   // quick, long body
  goldfish: { min: 5,  max: 8,  turn: 1200 },  // slow, drifting fan tail
  catfish:  { min: 8,  max: 12, turn: 900 },   // steady bottom cruiser
};
const SIZE_SPEED = { s: 1.25, m: 1, l: 0.8 };
function fishSpeed(type, sz) { const S = SPEED[type]; return rnd(S.min, S.max) * SIZE_SPEED[sz]; }
const save = JSON.parse(localStorage.getItem('ftf_stars') || '{}');

// ------------------------------------------------------------------ layout
const POND = { x0: 22, y0: 40, x1: 248, y1: 352 };
const SLOT = 33, SLOT_Y = 376, SLOT_X0 = 8, SLOT_DX = 37, CARD = 40, CARD_DX = 43, CARD_Y = 426, ICON = 1.5, BTN_FEED = { x: 158, y: 375, w: 110, h: 34 };
const BTNS = { menu: { x: 4, y: 4 }, restart: { x: 27, y: 4 }, undo: { x: 223, y: 4 }, hint: { x: 246, y: 4 } };
function cardX(n, i) { const w = n * CARD_DX - 3; return Math.round((W - w) / 2) + i * CARD_DX; }
function slotPos(i) { return { x: SLOT_X0 + i * SLOT_DX, y: SLOT_Y }; }

// pond tilemap: 17 x 23 tiles, rim all round
const COLS = 17, ROWS = 23;
const TILEMAP = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  let t;
  if (r === 0) t = c === 0 ? 'tile_rim_nw' : c === COLS - 1 ? 'tile_rim_ne' : 'tile_rim_n';
  else if (r === ROWS - 1) t = c === 0 ? 'tile_rim_sw' : c === COLS - 1 ? 'tile_rim_se' : 'tile_rim_s';
  else if (c === 0) t = 'tile_rim_w'; else if (c === COLS - 1) t = 'tile_rim_e';
  else t = (r * 7 + c * 3) % 11 === 0 ? 'tile_water_b' : (r * 5 + c * 2) % 13 === 0 ? 'tile_water_c' : 'tile_water_a';
  TILEMAP.push(t);
}
const PROPS = [['prop_planter', 2, 0], ['prop_planter_b', 222, 4], ['prop_lily_big', 30, 300], ['prop_lily_a', 48, 314], ['prop_lily_b', 226, 296], ['prop_lily_flower', 240, 312], ['prop_lily_a', 10, 180], ['prop_lily_flower', 250, 150], ['prop_rock', 120, 352], ['prop_grass', 60, 356], ['prop_grass', 200, 358], ['prop_reed', 150, 346]];
const TIERS = [
  { sfx: '', props: PROPS },
  { sfx: '_c', props: [['prop_planter', 2, 0], ['prop_planter_b', 222, 4], ['prop_spout', 118, 344], ['prop_moss_rock', 40, 320], ['prop_moss_rock', 214, 300], ['prop_rock', 60, 60], ['prop_moss_rock', 200, 70], ['prop_grass', 20, 200], ['prop_grass', 244, 240], ['prop_lily_a', 236, 180]] },
  { sfx: '_l', props: [['prop_planter', 2, 0], ['prop_planter_b', 222, 4], ['prop_lily_big', 26, 290], ['prop_lily_flower', 44, 308], ['prop_lily_a', 36, 322], ['prop_lily_big', 226, 300], ['prop_lily_flower', 244, 286], ['prop_lily_b', 232, 320], ['prop_lily_flower', 12, 150], ['prop_lily_a', 248, 120], ['prop_lily_flower', 128, 352], ['prop_lily_b', 14, 230], ['prop_grass', 100, 356], ['prop_grass', 180, 358]] },
  { sfx: '_t', props: [['prop_lantern', 8, 2], ['prop_lantern', 250, 2], ['prop_lantern', 8, 334], ['prop_lantern', 250, 334], ['prop_lily_big', 120, 10], ['prop_lily_a', 24, 180], ['prop_lily_b', 240, 200], ['prop_rock', 40, 340], ['prop_grass', 200, 356]] },
];
const tierFor = L => TIERS[L.id <= 3 ? 0 : L.id <= 6 ? 1 : L.id <= 8 ? 2 : 3];
let pondLayer = null, bakedTier = null;
function bakePond(tier = TIERS[0]) {
  bakedTier = tier;
  pondLayer = document.createElement('canvas'); pondLayer.width = W; pondLayer.height = POND_H;
  const c = pondLayer.getContext('2d'); c.imageSmoothingEnabled = false;
  TILEMAP.forEach((t, i) => { const f = A.tiles.frames[t + tier.sfx] || A.tiles.frames[t]; c.drawImage(A.tiles.img, f.x, f.y, f.w, f.h, (i % COLS) * TS - 1, Math.floor(i / COLS) * TS, TS, TS); });
  for (const [n, x, y] of tier.props) { const f = A.props.frames[n]; c.drawImage(A.props.img, f.x, f.y, f.w, f.h, x, y, f.w, f.h); }
}

// ------------------------------------------------------------------ game state
const G = {
  screen: 'menu', level: null, pond: null, turnsUsed: 0, foodUsed: 0, slots: [], history: [], fish: [], pieces: [], fx: [], popups: [],
  seq: null, drag: null, hover: -1, pressed: null, card: null, time: 0, result: null, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
};
function startLevel(L) {
  G.level = L; G.pond = initPond(L); G.turnsUsed = 0; G.foodUsed = 0; G.slots = []; G.history = []; G.pieces = []; G.fx = []; G.popups = []; G.seq = null; G.drag = null; G.result = null;
  G.screen = 'intro';
  if (bakedTier !== tierFor(L)) bakePond(tierFor(L));
  // fish entities in swim zones
  const n = L.fish.length, cols = n >= 7 ? 3 : 2, rows = Math.ceil(n / cols);
  const zw = (POND.x1 - POND.x0) / cols, zh = (POND.y1 - POND.y0) / rows;
  G.fish = G.pond.map((f, i) => {
    const zc = i % cols, zr = Math.floor(i / cols);
    const zone = { x0: POND.x0 + zc * zw, y0: POND.y0 + zr * zh, x1: POND.x0 + (zc + 1) * zw, y1: POND.y0 + (zr + 1) * zh };
    const S = SIZE[sizeKey(f.hearts)];
    return { id: i, data: f, type: fishType(f) + (f.digest ? '_' + sizeKey(f.hearts) + '_d' : '_' + sizeKey(f.hearts)), sz: sizeKey(f.hearts), L: S.L, Wd: S.W, zone, x: (zone.x0 + zone.x1) / 2 + rnd(-10, 10), y: (zone.y0 + zone.y1) / 2 + rnd(-8, 8), a: rnd(0, Math.PI * 2),
      target: null, speed: fishSpeed(fishType(f), sizeKey(f.hearts)), turn: SPEED[fishType(f)].turn, shown: f.fill, full: f.fill === f.hearts, anim: null, preview: null, tagDy: 0, tagDy2: 0, spin: 0, dash: { x: 0, y: 0 }, glow: 0, idle: 0 };
  });
}
function fishEats(f, food) { return f.both ? f.both.includes(food) : f.any.includes(food); }

// ------------------------------------------------------------------ fish anim
function play(f, tag, loop = false, speed = 1, onFrame) { f.anim = { tag: `${f.type}_${tag}`, t0: G.time, loop, speed, onFrame, fired: new Set() }; }
function curFrame(f) {
  const an = f.anim, def = `${f.type}_${f.full ? 'swim_full' : 'swim'}`;
  if (!an) { f.frameIdx = -1; const fr = A.fish.tags[def]; return fr[Math.floor(G.time / fr[0].duration) % fr.length]; }
  const fr = A.fish.tags[an.tag]; if (!fr) { f.anim = null; return curFrame(f); }
  let t = (G.time - an.t0) * an.speed, i = 0;
  const total = fr.reduce((s, x) => s + x.duration, 0);
  if (an.loop) t %= total; else if (t >= total) { f.anim = null; return curFrame(f); }
  let acc = 0; for (i = 0; i < fr.length; i++) { acc += fr[i].duration; if (t < acc) break; }
  i = Math.min(i, fr.length - 1); f.frameIdx = i;
  if (an.onFrame && !an.fired.has(i)) { an.fired.add(i); an.onFrame(i); }
  return fr[i];
}

// ------------------------------------------------------------------ feed sequence (timeline)
// Food flight: lift from the slot, then a curved, bouncy path into the pond: a high arc with an extra
// up/down wave bending it, a spin, and two decaying hops on the water before it settles.
const LIFT = 140, FLY = 900, HOP1 = 260, HOP2 = 180;
function flightPos(fl, t) {
  const { sx, sy, ex, ey } = fl;
  if (t < LIFT) { const u = t / LIFT; return { x: sx, y: sy - 6 * easeOut(u), rot: 0, h: 0 }; }
  t -= LIFT;
  const dx = ex - sx, dy = ey - sy, dist = Math.hypot(dx, dy), nx = -dy / dist, ny = dx / dist;
  if (t < FLY) {
    const u = t / FLY;
    const bx = lerp(sx, ex, easeInOut(u)), by = lerp(sy - 6, ey, u);
    const arcH = 70 + dist * 0.15, arc = -Math.sin(Math.PI * u) * arcH;              // the big lob
    const wave = Math.sin(u * Math.PI * 3) * 14 * (1 - u);                               // the curve bending up and down along the way
    const side = Math.sin(u * Math.PI * 2) * 6 * fl.side;                               // and a lateral sway
    return { x: bx + nx * side, y: by + arc + wave, rot: u * Math.PI * 3 * fl.side, h: -arc };
  }
  t -= FLY;
  // bounces: two hops, each shorter, drifting a little further along the throw direction
  const ux = dx / dist, uy = dy / dist;
  if (t < HOP1) { const u = t / HOP1; return { x: ex + ux * 6 * u, y: ey + uy * 6 * u - Math.sin(Math.PI * u) * 12, rot: fl.side * 0.4 * (1 - u), h: 1, hop: 1 }; }
  t -= HOP1;
  if (t < HOP2) { const u = t / HOP2; return { x: ex + ux * (6 + 3 * u), y: ey + uy * (6 + 3 * u) - Math.sin(Math.PI * u) * 5, rot: 0, h: 1, hop: 2 }; }
  return { x: ex + ux * 9, y: ey + uy * 9, rot: 0, h: 0, done: true };
}
function hopPos(pc, t) {
  const u = clamp(t / pc.dur, 0, 1), e = easeOut(u);
  return { x: pc.sx + (pc.ex - pc.sx) * e, y: pc.sy + (pc.ey - pc.sy) * e - Math.sin(Math.PI * u) * 9 };
}

function doFeed() {
  if (G.seq || !G.slots.length) return;
  const L = G.level, res = feed(L, G.pond, G.slots);
  G.history.push({ pond: G.pond, turnsUsed: G.turnsUsed, foodUsed: G.foodUsed, slots: [...G.slots], shown: G.fish.map(f => f.shown) });
  const slots = [...G.slots];
  G.pond = res.pond; G.turnsUsed++; G.foodUsed += slots.length; G.slots = [];
  SFX.whoosh();
  const seq = { t: 0, events: [], flights: [], end: 0, res, slots };
  // landing points, spread round the pond centre
  const cx = (POND.x0 + POND.x1) / 2, cy = (POND.y0 + POND.y1) / 2 + 20;
  slots.forEach((idx, i) => {
    const item = L.items[idx], s = slotPos(i), ang = (i / slots.length) * Math.PI * 2 + 0.7;
    const fl = { item, sx: s.x + SLOT / 2, sy: s.y + SLOT / 2, ex: cx + Math.cos(ang) * 34 + rnd(-6, 6), ey: cy + Math.sin(ang) * 26 + rnd(-6, 6), t0: i * 160, side: i % 2 ? 1 : -1 };
    fl.land = fl.t0 + LIFT + FLY; fl.settle = fl.land + HOP1 + HOP2;
    seq.flights.push(fl);
    seq.events.push({ at: fl.land, fn: () => { spawnFx('splash', fl.ex, fl.ey); SFX.splash(); } });
    seq.events.push({ at: fl.land + HOP1, fn: () => spawnFx('splash', fl.ex + 6 * Math.sign(fl.ex - fl.sx || 1), fl.ey - 6, 0.7) });
  });
  // pieces: for every serving, one piece ahead of every fish that bites it, plus a stray one
  const perFish = G.fish.map(() => []);
  slots.forEach((idx, i) => {
    const item = L.items[idx], fl = seq.flights[i], land = { x: fl.ex + 9 * (fl.ex - fl.sx) / Math.hypot(fl.ex - fl.sx, fl.ey - fl.sy), y: fl.ey + 9 * (fl.ey - fl.sy) / Math.hypot(fl.ex - fl.sx, fl.ey - fl.sy) };
    for (const food of item.foods) {
      G.fish.forEach((f, k) => {
        const ev = res.events[k], d = f.data;
        const bad = (d.digest || []).includes(food);
        if (ev.outcome.startsWith('digest') ? bad : (ev.outcome === 'eat' || ev.outcome === 'fullIgnore') && fishEats(d, food))
          perFish[k].push({ food, bad, from: land, settle: fl.settle });
      });
      const pc = { food, sx: land.x, sy: land.y, ex: land.x + rnd(-18, 18), ey: land.y + rnd(-14, 14), t0: fl.settle, dur: 420, alive: true, stray: true };
      seq.events.push({ at: fl.settle, fn: () => G.pieces.push(pc) });
      seq.events.push({ at: fl.settle + 900, fn: () => sinkPiece(pc) });
    }
  });
  // per-fish choreography
  let endT = Math.max(...seq.flights.map(f => f.settle));
  G.fish.forEach((f, k) => {
    const ev = res.events[k], mine = perFish[k];
    if (!mine.length && ev.outcome === 'ignore') {
      const t0 = Math.min(...seq.flights.map(fl => fl.settle)) + 100 + k * 40;
      seq.events.push({ at: t0, fn: () => { play(f, 'ignore'); f.target = null; f.turnAway = true; } });
      endT = Math.max(endT, t0 + 300); return;
    }
    if (!mine.length) return;
    // pieces hop to a spot ahead of the fish; the fish reacts with a stagger by distance
    const ahead = () => ({ x: f.x + Math.cos(f.a) * (f.L / 2 + 7), y: f.y + Math.sin(f.a) * (f.L / 2 + 7) });
    const start = Math.max(...mine.map(m => m.settle));
    const dist = Math.hypot(f.x - mine[0].from.x, f.y - mine[0].from.y), stagger = 40 + Math.min(1, dist / 220) * 20;
    const pcs = mine.map((m, j) => ({ food: m.food, bad: m.bad, sx: m.from.x, sy: m.from.y, ex: 0, ey: 0, t0: m.settle, dur: 420, alive: true, fishId: k, j }));
    pcs.forEach((pc, j) => seq.events.push({ at: pc.t0, fn: () => { const p = ahead(); const sp = Math.cos(f.a + Math.PI / 2), cp = Math.sin(f.a + Math.PI / 2); pc.ex = p.x + sp * (j - (pcs.length - 1) / 2) * 7; pc.ey = p.y + cp * (j - (pcs.length - 1) / 2) * 7; G.pieces.push(pc); } }));
    let t = start + 420 + stagger;
    seq.events.push({ at: t, fn: () => { f.target = null; f.notice = pcs[0]; } });
    t += 100;
    const BITE = 260, CONTACT = 150;
    if (ev.outcome === 'eat' || ev.outcome === 'fullIgnore') {
      let heartsLeft = ev.gained, pairs = 0;
      pcs.forEach((pc, j) => {
        const tb = t;
        const fills = f.data.both ? (++pairs % 2 === 0 && heartsLeft > 0) : heartsLeft > 0;
        if (fills) heartsLeft--;
        const overflow = !fills && ev.outcome === 'fullIgnore';
        seq.events.push({ at: tb, fn: () => { f.notice = pc; if (overflow) play(f, 'content', false, 1.2); else play(f, 'bite', false, 357 / BITE); f.dashTo = pc; } });
        seq.events.push({ at: tb + CONTACT, fn: () => { pc.alive = false; if (fills) { f.shown++; spawnFx('heartpop', f.x, f.y - f.Wd); SFX.chomp(); f.heartPop = G.time; } else if (overflow) { sinkPiece(pc); } else SFX.chomp(); } });
        t = tb + BITE;
      });
      if (ev.becameFull) {
        const tc = t;
        seq.events.push({ at: tc, fn: () => { f.full = true; f.spinT0 = G.time; f.glow = G.time; play(f, 'celebrate', false, 1); spawnFx('fullburst', f.x, f.y); SFX.chime(); } });
        t += 500;
      }
    } else if (ev.outcome === 'digest' || ev.outcome === 'digestEmpty') {
      let lost = ev.lost;
      pcs.forEach((pc) => {
        const tb = t;
        seq.events.push({ at: tb, fn: () => { f.notice = pc; play(f, f.full ? 'digest_full' : 'digest', false, 545 / 560); f.dashTo = pc; } });
        seq.events.push({ at: tb + 90, fn: () => { pc.alive = false; SFX.chomp(); } });
        seq.events.push({ at: tb + 180, fn: () => { f.shudder = G.time; } });
        const loses = lost > 0; if (loses) lost--;
        seq.events.push({ at: tb + 380, fn: () => {
          spawnFx('poop', f.x - Math.cos(f.a) * (f.L / 2), f.y - Math.sin(f.a) * (f.L / 2), 1, f.a); SFX.plop();
          if (loses) { f.shown--; f.crack = G.time; }
          if (f.full && f.shown < f.data.hearts) f.full = false;
        } });
        t = tb + 560;
      });
    }
    endT = Math.max(endT, t);
  });
  seq.end = endT + 250;
  // 1.8 s cap: play faster if the whole feed would take longer
  seq.rate = seq.end > 4500 ? seq.end / 4500 : 1;
  seq.events.push({ at: seq.end - 200, fn: () => {
    SFX.flip();
    if (res.fedFish >= 4) { SFX.combo(); spawnFx('combo', W / 2, 200); }
  } });
  seq.events.sort((a, b) => a.at - b.at);
  G.seq = seq;
}
function finishSeq() {
  const seq = G.seq; if (!seq) return;
  for (const e of seq.events) if (!e.done) { e.done = true; e.fn(); }
  G.fish.forEach((f, k) => { f.shown = G.pond[k].fill; f.full = f.shown === f.data.hearts; f.notice = null; f.dashTo = null; });
  for (const pc of G.pieces) if (pc.alive) sinkPiece(pc);
  G.seq = null;
  resolveTurn();
}
function resolveTurn() {
  const L = G.level;
  if (isWin(G.pond)) { G.result = { won: true, stars: starsFor(L, G.turnsUsed, G.foodUsed, true) }; save[L.id] = Math.max(save[L.id] || 0, G.result.stars); localStorage.setItem('ftf_stars', JSON.stringify(save)); G.resultT = G.time; SFX.win(); G.fish.forEach(f => { f.spinT0 = G.time + Math.random() * 200; play(f, 'celebrate'); }); }
  else if (G.turnsUsed >= L.turnLimit) { G.result = { won: false }; G.resultT = G.time; SFX.fail(); G.fish.forEach(f => { if (!f.full) play(f, 'gulp', true); }); }
}
function sinkPiece(pc) { if (!pc.alive) return; pc.alive = false; spawnFx('sink_' + pc.food, pc.ex, pc.ey); }
function spawnFx(kind, x, y, alpha = 1, rot = 0) { G.fx.push({ kind, x, y, t0: G.time, alpha, rot }); }
function undo() {
  if (G.seq) finishSeq();
  const h = G.history.pop(); if (!h) return;
  G.pond = h.pond; G.turnsUsed = h.turnsUsed; G.foodUsed = h.foodUsed; G.slots = h.slots; G.result = null;
  G.fish.forEach((f, k) => { f.shown = h.shown[k]; f.full = f.shown === f.data.hearts; f.anim = null; f.rewind = G.time; });
  G.pieces = []; SFX.undo();
}
function hint() {
  if (G.seq || G.result) return;
  const s = solveFrom(G.level, G.pond, G.level.turnLimit - G.turnsUsed);
  if (!s) { G.popups.push({ text: 'NO WAY TO WIN FROM HERE. UNDO!', x: W / 2, y: 200, t0: G.time, dur: 1500, col: '#FFD2D8' }); return; }
  G.slots = [...s.first]; SFX.hint();
  G.popups.push({ text: `BEST: ${s.turns} TURNS, ${s.food} FOOD`, x: W / 2, y: 200, t0: G.time, dur: 1400, col: '#FFF4E0' });
}

// ------------------------------------------------------------------ preview
function previewSlots() {
  if (G.drag && G.hover >= 0) { const s = [...G.slots]; s[Math.min(G.hover, s.length)] = G.drag.card; return s.filter(v => v != null); }
  return G.slots;
}
function computePreview() {
  const s = previewSlots();
  if (!s.length || G.seq || G.result) { G.fish.forEach(f => f.preview = null); return; }
  const r = feed(G.level, G.pond, s);
  G.fish.forEach((f, k) => { const ev = r.events[k]; f.preview = ev.gained > 0 ? { kind: 'eat', n: ev.gained } : ev.lost > 0 ? { kind: 'digest', n: ev.lost } : null; });
}

// ------------------------------------------------------------------ update
let last = performance.now();
function update(now) {
  const dt = Math.min(50, now - last); last = now; G.time += dt;
  if (G.screen !== 'play') return;
  // sequence
  if (G.seq) {
    const seq = G.seq; seq.t += dt * seq.rate; G.seqT = seq.t;
    for (const e of seq.events) if (!e.done && e.at <= seq.t) { e.done = true; e.fn(); }
    if (seq.t >= seq.end) { G.seq = null; resolveTurn(); }
  }
  // fish movement
  for (const f of G.fish) {
    if (f.held) continue;
    const sp = f.full ? f.speed * 0.7 : f.speed;
    if (f.notice && f.notice.alive) {
      const ta = Math.atan2(f.notice.ey - f.y, f.notice.ex - f.x);
      f.a += angDiff(f.a, ta) * Math.min(1, dt / 90);
    } else if (f.dashTo && !f.dashTo.alive) { f.dashTo = null; }
    else if (f.preview && f.preview.kind === 'eat' && !G.seq) {
      const ta = Math.PI / 2;    // turn toward the feed bar (down)
      f.a += angDiff(f.a, ta) * Math.min(1, dt / 600);
    } else {
      // free wandering: drift the heading slowly, with a gentle pull back toward the pond centre
      if (!f.target || G.time > f.target.until) f.target = { a: f.a + rnd(-1.2, 1.2), until: G.time + rnd(1500, 4000) };
      f.a += angDiff(f.a, f.target.a) * Math.min(1, dt / f.turn);
      f.x += Math.cos(f.a) * sp * dt / 1000; f.y += Math.sin(f.a) * sp * dt / 1000;
      if (f.turnAway) { f.x -= Math.cos(f.a) * 10 * dt / 1000; if (!f.anim) f.turnAway = false; }
    }
    // lunge toward the piece during a bite
    if (f.dashTo && f.dashTo.alive) {
      const d = Math.hypot(f.dashTo.ex - f.x, f.dashTo.ey - f.y), want = f.L / 2 + 2;
      if (d > want) { const k = Math.min(1, dt / 120); f.x += (f.dashTo.ex - f.x) * (1 - want / d) * k; f.y += (f.dashTo.ey - f.y) * (1 - want / d) * k; }
    }
    // looping pond: swim off one edge, come back on the other
    const m = f.L / 2 + 2; if (f.x < -m) f.x += W + 2 * m; else if (f.x > W + m) f.x -= W + 2 * m; if (f.y < 30 - m) f.y += POND_H - 30 + 2 * m; else if (f.y > POND_H + m) f.y -= POND_H - 30 + 2 * m;
  }
  // pieces that finished hopping and nobody will bite within the sequence sink after it
  G.fx = G.fx.filter(e => { const at = A[e.kind], tot = at.all.reduce((s, x) => s + x.duration, 0); return G.time - e.t0 < tot; });
  G.popups = G.popups.filter(p => G.time - p.t0 < p.dur);
  G.pieces = G.pieces.filter(pc => pc.alive);
}

// ------------------------------------------------------------------ draw
function draw() {
  ctx.setTransform(BK, 0, 0, BK, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#5FA3A8'; ctx.fillRect(0, 0, W, H);
  if (G.screen === 'menu') return drawMenu();
  drawPond();
  if (G.screen === 'intro') { drawHud(); drawFeedBar(); drawPanel(); drawIntro(); return; }
  drawHud(); drawFeedBar(); drawPanel(); drawDrag(); drawPopups();
  if (G.result) drawResult();
}
function drawPond() {
  ctx.drawImage(pondLayer, 0, 0);
  // caustic shimmer, tiled at low alpha
  const cf = A.ui.tags.caustic, fr = cf[Math.floor(G.time / 250) % 4];
  ctx.globalAlpha = 0.28;
  for (let y = 8; y < POND_H - 8; y += 48) for (let x = 8; x < W - 8; x += 48) ctx.drawImage(A.ui.img, fr.x, fr.y, fr.w, fr.h, x, y, 48, 48);
  ctx.globalAlpha = 1;
  // ambient bubbles
  const bf = A.ui.tags.ambient_bubble;
  for (let i = 0; i < 5; i++) { const ph = ((G.time / 4000) + i * 0.2) % 1; const x = 40 + i * 48, y = 330 - ph * 280; spr(A.ui, bf[Math.min(2, Math.floor(ph * 3))], x + Math.sin(ph * 9) * 2, y); }
  // fish
  const fishes = [...G.fish].sort((a, b) => (a.held - b.held) || (a.y - b.y));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, POND_H); ctx.clip();
  for (const f of fishes) {
    const fr = curFrame(f);
    let rot = f.a;
    if (f.spinT0 != null) { const u = (G.time - f.spinT0) / 500; if (u < 1) rot += easeInOut(u) * Math.PI * 2; else f.spinT0 = null; }
    let ox = 0, oy = 0;
    if (f.shudder && G.time - f.shudder < 220) ox = Math.sin((G.time - f.shudder) / 18) * 2;
    // lunge: the body snaps forward on the bite frames and eases back on recover
    if (f.anim && f.frameIdx >= 0) {
      const tag = f.anim.tag, L = tag.endsWith('_bite') ? [-2, 0, 4, 5, 1] : tag.endsWith('_digest') || tag.endsWith('_digest_full') ? [4, 2, -1, 1, -2, 0] : null;
      if (L) { const d = L[Math.min(f.frameIdx, L.length - 1)]; ox += Math.cos(f.a) * d; oy += Math.sin(f.a) * d; }
    }
    if (f.glow && G.time - f.glow < 1000 && !G.reduced) { ctx.save(); ctx.globalAlpha = 0.35 * (1 - (G.time - f.glow) / 1000); ctx.fillStyle = '#FFF4E0'; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.L / 2 + 4, f.L / 2 + 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    const m = f.L / 2 + 2, copies = [[0, 0]];
    if (f.x < m) copies.push([W + 2 * m, 0]); else if (f.x > W - m) copies.push([-(W + 2 * m), 0]);
    if (f.y < 30 + m) copies.push([0, POND_H - 30 + 2 * m]); else if (f.y > POND_H - m) copies.push([0, -(POND_H - 30 + 2 * m)]);
    if (f.held) { ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#1E1A1A'; ctx.beginPath(); ctx.ellipse(f.x + 3, f.y + 5, f.L / 2, f.Wd / 2 + 2, f.a, 0, Math.PI * 2); ctx.fill(); ctx.restore(); oy -= 3; }
    for (const [wx, wy] of copies) spr(A.fish, fr, f.x + ox + wx, f.y + oy + wy, { cx: true, rot });
    if (f.preview && f.preview.kind === 'digest' && !G.seq) { const sf = A.ui.tags.sweat[Math.floor(G.time / 200) % 2]; spr(A.ui, sf, f.x + Math.cos(f.a) * (f.L / 2) + 4, f.y + Math.sin(f.a) * (f.L / 2) - 6); }
  }
  ctx.restore();
  // flights (food icons in the air) draw above fish; their shadow below
  if (G.seq) for (const fl of G.seq.flights) {
    const t = G.seq.t - fl.t0; if (t < 0) continue;
    const p = flightPos(fl, t); if (p.done && t > fl.settle - fl.t0 + 120) continue;
    const icon = 'icon_' + fl.item.foods.join('');
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#1E1A1A'; ctx.beginPath(); ctx.ellipse(p.x, p.y + p.h + 3, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    spr(A.food, icon, p.x, p.y, { cx: true, rot: p.rot, scale: ICON });
  }
  // pieces
  for (const pc of G.pieces) {
    const t = G.seqT - pc.t0, pos = t < pc.dur ? hopPos(pc, t) : { x: pc.ex, y: pc.ey };
    const fr = A.food.tags['piece_' + pc.food][Math.floor(G.time / 250) % 2];
    spr(A.food, fr, pos.x, pos.y, { cx: true, alpha: pc.bad ? 0.9 : 1 });
  }
  // fx
  for (const e of G.fx) {
    const at = A[e.kind]; let t = G.time - e.t0, i = 0; for (; i < at.all.length - 1; i++) { if (t < at.all[i].duration) break; t -= at.all[i].duration; }
    const fr = at.all[i], pv = at.pixelfx.pivot;
    ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y)); if (e.rot) ctx.rotate(e.rot); ctx.globalAlpha = e.alpha;
    ctx.drawImage(at.img, fr.x, fr.y, fr.w, fr.h, -pv[0], -pv[1], fr.w, fr.h); ctx.restore();
  }
  drawTags();
}
function tagBox(f) {
  const a = f.a, hh = Math.abs(Math.sin(a)) * f.L / 2 + Math.abs(Math.cos(a)) * f.Wd / 2;
  const d = f.data, bubbles = d.both ? 1 : d.any.length, bw = (d.both ? 30 : bubbles * 16 + (bubbles - 1) * 5) + (d.digest ? 18 : 0);
  const hw = d.hearts * 10;
  const top = { x: f.x - hw / 2, y: f.y - hh - 6 - 8 + f.tagDy, w: hw, h: 8 }, bot = { x: f.x - bw / 2, y: f.y + hh + 6 + f.tagDy2, w: bw, h: 16 };
  return { top, bot };
}
function drawTags() {
  const boxes = G.fish.map(f => ({ f, ...tagBox(f) }));
  for (const bx of boxes) {
    const f = bx.f, d = f.data;
    let ty = clamp(bx.top.y, 34, POND_H - 40), by = clamp(bx.bot.y, 34, POND_H - 20);
    const tx = clamp(bx.top.x, 2, W - bx.top.w - 2), bxx = clamp(bx.bot.x, 2, W - bx.bot.w - 2);
    // hearts
    const blink = Math.floor(G.time / 250) % 2 === 0;
    const hideHearts = f.full && !d.digest;   // a full fish with no digest food: the smiley says it all
    for (let i = 0; i < d.hearts && !hideHearts; i++) {
      const filled = i < f.shown, x = tx + i * 10;
      let name = filled ? 'heart_full' : 'heart_empty';
      if (f.crack && G.time - f.crack < 350 && i === f.shown) name = 'heart_crack';
      if (f.preview && !G.seq) {
        if (f.preview.kind === 'eat' && !filled && i < f.shown + f.preview.n) { ctx.fillStyle = blink ? '#E5304A' : '#FF7A88'; ctx.fillRect(x - 1, ty - 1, 11, 10); }
        if (f.preview.kind === 'digest' && filled && i >= f.shown - f.preview.n && !blink) name = 'heart_empty';
      }
      let sy = 0; if (f.shudder && G.time - f.shudder < 300) sy = Math.sin((G.time - f.shudder) / 20) * 1.5;
      if (f.heartPop && G.time - f.heartPop < 200 && i === f.shown - 1) sy -= 2;
      spr(A.ui, name, x, ty + sy);
    }
    if (d.start && d.digest) { ctx.strokeStyle = '#E5304A'; ctx.setLineDash([2, 2]); ctx.strokeRect(tx - 2.5, ty - 2.5, d.hearts * 10 + 4, 12); ctx.setLineDash([]); }
    // bubbles
    let x = bxx;
    if (f.full) { x = Math.round(f.x - (d.digest ? 13 : 4)); spr(A.ui, 'badge_happy_small', x, by + 4); x += 10; }
    else if (d.both) { spr(A.ui, 'bubble_joined', x, by); spr(A.food, 'icon_' + d.both[0], x + 1, by + 2); spr(A.food, 'icon_' + d.both[1], x + 16, by + 2); x += 30; }
    else {
      d.any.forEach((food, i) => { if (i) { spr(A.ui, 'slash', x + 1, by + 4); x += 5; } spr(A.ui, 'bubble', x, by); spr(A.food, 'icon_' + food, x + 2, by + 2); x += 16; });
    }
    if (d.digest) { x += 2; spr(A.ui, 'bubble', x, by); spr(A.food, 'icon_' + d.digest[0], x + 2, by + 2); spr(A.ui, 'digest_cross', x, by); }
  }
}
function drawHud() {
  const L = G.level;
  text(`LVL ${L.id}`, W / 2, 5, '#FFF4E0', { align: 'c', scale: 2, shadow: '#1E1A1A' });
  const t2 = G.turnsUsed > L.parTurns, t3 = t2 || G.foodUsed > L.parFood;
  const s2 = `${'★★'} ${L.parTurns} TURNS (${G.turnsUsed}/${L.parTurns})`, s3 = `${'★★★'} ${L.parFood} FOOD (${G.foodUsed}/${L.parFood})`;
  const w2 = text(s2, W / 2, 19, t2 ? '#B9A98F' : '#FFF2B0', { align: 'c', shadow: '#1E1A1A' });
  const w3 = text(s3, W / 2, 27, t3 ? '#B9A98F' : '#FFF2B0', { align: 'c', shadow: '#1E1A1A' });
  ctx.fillStyle = '#E5304A';
  if (t2) ctx.fillRect(W / 2 - w2 / 2, 21, w2, 1);
  if (t3) ctx.fillRect(W / 2 - w3 / 2, 29, w3, 1);
  for (const [k, b] of Object.entries(BTNS)) { const dis = (k === 'undo' && !G.history.length); spr(A.ui, 'btn_' + k, b.x, b.y + (G.pressed === k ? 1 : 0), { alpha: dis ? 0.5 : 1 }); }
}
function drawFeedBar() {
  const L = G.level, plateW = L.slots * SLOT_DX + 4;
  nine('panel_stone', 4, 371, plateW, 44);
  const wasted = (!G.seq && G.slots.length) ? wastedSlots(L, G.pond, previewSlots()) : [];
  for (let i = 0; i < L.slots; i++) {
    const p = slotPos(i), idx = previewSlots()[i], item = idx == null ? null : L.items[idx];
    const name = G.drag && G.hover === i ? 'slot_hover' : wasted.includes(i) ? 'slot_wasted' : item ? 'slot_filled' : 'slot_empty';
    spr(A.ui, name, p.x, p.y);
    if (item) spr(A.food, 'icon_' + item.foods.join(''), p.x + 7, p.y + 7, { scale: ICON, alpha: wasted.includes(i) ? 0.5 : 1 });
  }
  if (wasted.length) text('NO ONE NEW EATS THIS', 6, 410, '#FFD2D8', { shadow: '#1E1A1A' });
  // compact turn indicator between the plate and the Feed button
  const left = L.turnLimit - G.turnsUsed, lastTurn = left === 1 && !G.result, tx = 4 + plateW + 4, tw = BTN_FEED.x - 4 - tx;
  nine(lastTurn && Math.floor(G.time / 400) % 2 ? 'panel_red' : 'panel_stone', tx, 371, tw, 44);
  text(String(left), tx + tw / 2, 378, lastTurn ? '#FFD2D8' : '#FFF4E0', { align: 'c', scale: 3, shadow: '#1E1A1A' });
  text(left === 1 ? 'TURN' : 'TURNS', tx + tw / 2, 398, '#D9CDB5', { align: 'c' });
  text(`${'★★'}${L.parTurns}`, tx + tw / 2, 406, '#D9CDB5', { align: 'c' });
  const can = G.slots.length && !G.seq && !G.result;
  spr(A.ui, !can ? 'btn_feed_off' : G.pressed === 'feed' ? 'btn_feed_pressed' : 'btn_feed', BTN_FEED.x, BTN_FEED.y);
  text('FEED', BTN_FEED.x + BTN_FEED.w / 2, BTN_FEED.y + 10, can ? '#1E3A2C' : '#5E5E58', { align: 'c', scale: 3 });
}
function drawPanel() {
  const L = G.level;
  nine('panel_wood', 0, 416, W, 64);
  L.items.forEach((item, i) => {
    const x = cardX(L.items.length, i), pressed = G.card === i;
    spr(A.ui, pressed ? 'card_pressed' : 'card', x, CARD_Y);
    if (!(G.drag && G.drag.card === i && G.drag.moved)) spr(A.food, 'icon_' + item.foods.join(''), x + 11, CARD_Y + 11 + (pressed ? 1 : 0), { scale: ICON });
  });
}
function drawDrag() {
  if (!G.drag || !G.drag.moved) return;
  ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#1E1A1A'; ctx.beginPath(); ctx.ellipse(G.drag.x, G.drag.y + 10, 8, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  spr(A.food, 'icon_' + G.drag.item.foods.join(''), G.drag.x, G.drag.y - 6, { cx: true, scale: ICON });
}
function drawPopups() {
  for (const p of G.popups) {
    const u = (G.time - p.t0) / p.dur, y = p.y - easeOut(u) * 14, a = u > 0.75 ? 1 - (u - 0.75) / 0.25 : 1;
    ctx.save(); ctx.globalAlpha = a;
    if (p.ribbon) { const w = textW(p.text, 1) + 20, sc = p.strong ? 2 : 1, ww = textW(p.text, sc) + 24; nine(p.strong ? 'ribbon_strong' : 'ribbon', Math.round(p.x - ww / 2), Math.round(y - 4), ww, 10 + 6 * sc); text(p.text, p.x, y + 2, p.strong ? '#3B2F2F' : '#1E3A2C', { align: 'c', scale: sc }); }
    else text(p.text, p.x, y, p.col || '#FFF', { align: 'c', scale: 2, shadow: '#1E1A1A' });
    ctx.restore();
  }
}
function drawCardBox(y, h) { nine('panel_card', 20, y, W - 40, h); }
function wrap(s, maxChars) { const words = s.split(' '), lines = []; let cur = ''; for (const w of words) { if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; } if (cur.trim()) lines.push(cur.trim()); return lines; }
function drawIntro() {
  const L = G.level, lines = wrap(L.intro, 46), LH = 11;
  const h = 70 + lines.length * LH + 44; drawCardBox(110, h);
  text(L.title, W / 2, 120, '#3B2F2F', { align: 'c', scale: 2 });
  text(`${L.fish.length} FISH  ${L.slots} SLOTS  ${L.turnLimit} TURNS`, W / 2, 136, '#7A4E2C', { align: 'c' });
  text(`${'★★'} ${L.parTurns} TURNS   ${'★★★'} ${L.parFood} FOOD`, W / 2, 146, '#7A4E2C', { align: 'c' });
  lines.forEach((l, i) => text(l, W / 2, 162 + i * LH, '#3B2F2F', { align: 'c' }));
  const by = 110 + h - 44; spr(A.ui, G.pressed === 'go' ? 'btn_feed_pressed' : 'btn_feed', 80, by); text('START', W / 2, by + 12, '#1E3A2C', { align: 'c', scale: 2 });
  G.introBtn = { x: 80, y: by, w: 110, h: 34 };
}
function drawResult() {
  const r = G.result, u = clamp((G.time - G.resultT) / 400, 0, 1), L = G.level;
  const y = 120 + (1 - easeOut(u)) * 40; drawCardBox(Math.round(y), 150);
  if (r.won) {
    text('ALL FISH FULL!', W / 2, y + 10, '#3B2F2F', { align: 'c', scale: 2 });
    for (let i = 0; i < 3; i++) { const on = i < r.stars && G.time - G.resultT > 500 + i * 250; spr(A.ui, on ? 'star_full' : 'star_empty', W / 2 - 22 + i * 16, y + 28); }
    const why = r.stars === 3 ? 'PERFECT: PAR TURNS AND PAR FOOD.' : r.stars === 2 ? `PAR TURNS, BUT ${G.foodUsed} FOOD (PAR ${L.parFood}). FEWER SERVINGS COULD COVER THE SAME FISH.` : `${G.turnsUsed} TURNS (PAR ${L.parTurns}). FIND FEEDS THAT FILL SEVERAL FISH AT ONCE.`;
    wrap(why, 50).forEach((l, i) => text(l, W / 2, y + 48 + i * 7, '#3B2F2F', { align: 'c' }));
    text(`${G.turnsUsed} TURNS  ${G.foodUsed} FOOD`, W / 2, y + 74, '#7A4E2C', { align: 'c' });
  } else {
    text('OUT OF TURNS', W / 2, y + 10, '#B01F38', { align: 'c', scale: 2 });
    const hungry = G.fish.filter(f => !f.full).map(f => `${f.data.name} (${f.shown}/${f.data.hearts})`).join(', ');
    wrap('STILL HUNGRY: ' + hungry + '.', 50).forEach((l, i) => text(l, W / 2, y + 30 + i * 7, '#3B2F2F', { align: 'c' }));
    wrap('TRY: FEED FISH THAT SHARE A FOOD TOGETHER, AND KEEP BAD FOOD OUT.', 50).forEach((l, i) => text(l, W / 2, y + 56 + i * 7, '#7A4E2C', { align: 'c' }));
  }
  const by = y + 112;
  G.resultBtns = [{ k: 'retry', x: 30, y: by, w: 64, h: 24, label: 'RETRY' }, { k: 'menu', x: 103, y: by, w: 64, h: 24, label: 'MENU' }];
  if (r.won && L.id < LEVELS.length) G.resultBtns.push({ k: 'next', x: 176, y: by, w: 64, h: 24, label: 'NEXT' });
  for (const b of G.resultBtns) { nine(G.pressed === b.k ? 'ribbon_strong' : 'ribbon', b.x, Math.round(b.y), b.w, b.h); text(b.label, b.x + b.w / 2, Math.round(b.y) + 9, '#1E3A2C', { align: 'c' }); }
}
function drawMenu() {
  if (bakedTier !== TIERS[0]) bakePond(TIERS[0]);
  ctx.drawImage(pondLayer, 0, 0);
  nine('panel_wood', 0, 370, W, 110);
  drawCardBox(30, 320);
  text('FEED THE', W / 2, 44, '#3B2F2F', { align: 'c', scale: 3 });
  text('FISHES', W / 2, 64, '#F28C28', { align: 'c', scale: 3 });
  text('A CALM TURN-BASED POND PUZZLE', W / 2, 88, '#7A4E2C', { align: 'c' });
  G.menuBtns = [];
  LEVELS.forEach((L, i) => {
    const x = 36 + (i % 2) * 102, y = 104 + Math.floor(i / 2) * 44, st = save[L.id] || 0;
    G.menuBtns.push({ x, y, w: 96, h: 36, L });
    nine(G.pressed === 'lv' + L.id ? 'ribbon_strong' : 'ribbon', x, y, 96, 36);
    text(`${L.id}. ${L.title}`, x + 48, y + 8, '#1E3A2C', { align: 'c' });
    for (let s = 0; s < 3; s++) spr(A.ui, s < st ? 'star_full' : 'star_empty', x + 29 + s * 14, y + 18);
  });
  text('DRAG FOOD INTO THE SLOTS. PRESS FEED.', W / 2, 400, '#FFF4E0', { align: 'c' });
  text('FILL EVERY HEART BEFORE THE TURNS RUN OUT.', W / 2, 410, '#FFF4E0', { align: 'c' });
  const fr = A.fish.tags.goldfish_m_swim[Math.floor(G.time / 100) % 6]; spr(A.fish, fr, 60, 445, { cx: true, rot: Math.sin(G.time / 900) * 0.3 });
  const fr2 = A.fish.tags.koi_l_swim[Math.floor(G.time / 100) % 6]; spr(A.fish, fr2, 200, 445, { cx: true, rot: Math.PI + Math.sin(G.time / 1100) * 0.3 });
}

// ------------------------------------------------------------------ input
function pt(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }
const inBox = (p, b) => p.x >= b.x && p.x < b.x + b.w && p.y >= b.y && p.y < b.y + b.h;
function hitBtn(p) { for (const [k, b] of Object.entries(BTNS)) if (inBox(p, { x: b.x - 3, y: b.y - 3, w: 26, h: 26 })) return k; return null; }
function hitCard(p) { const L = G.level; for (let i = 0; i < L.items.length; i++) if (inBox(p, { x: cardX(L.items.length, i), y: CARD_Y, w: CARD, h: CARD })) return i; return -1; }
function hitFish(p) { let best = null, bd = 1e9; for (const f of G.fish) { const d = Math.hypot(p.x - f.x, p.y - f.y); if (d < f.L / 2 + 6 && d < bd) { bd = d; best = f; } } return best; }
function hitSlot(p) { for (let i = 0; i < G.level.slots; i++) { const s = slotPos(i); if (Math.hypot(p.x - (s.x + SLOT / 2), p.y - (s.y + SLOT / 2)) < 22) return i; } return -1; }
cv.addEventListener('pointerdown', e => {
  const p = pt(e); cv.setPointerCapture(e.pointerId);
  if (G.screen === 'menu') { for (const b of G.menuBtns || []) if (inBox(p, b)) G.pressed = 'lv' + b.L.id; return; }
  if (G.screen === 'intro') { if (G.introBtn && inBox(p, G.introBtn)) G.pressed = 'go'; return; }
  if (G.result) { for (const b of G.resultBtns || []) if (inBox(p, b)) G.pressed = b.k; const k = hitBtn(p); if (k === 'menu' || k === 'restart') G.pressed = k; return; }
  if (G.seq) { finishSeq(); return; }
  const k = hitBtn(p); if (k) { G.pressed = k; return; }
  if (inBox(p, BTN_FEED) && G.slots.length) { G.pressed = 'feed'; return; }
  const c = hitCard(p); if (c >= 0) { G.card = c; G.drag = { card: c, item: G.level.items[c], x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }; SFX.pick(); return; }
  const s = hitSlot(p); if (s >= 0 && G.slots[s]) { G.slots.splice(s, 1); SFX.tick(); computePreview(); return; }
  if (p.y < POND_H) { const f = hitFish(p); if (f) { G.fishDrag = { f, ox: f.x - p.x, oy: f.y - p.y }; f.held = true; SFX.pick(); } }
});
cv.addEventListener('pointermove', e => {
  const p = pt(e);
  if (G.fishDrag) { const d = G.fishDrag; d.f.x = clamp(p.x + d.ox, 4, W - 4); d.f.y = clamp(p.y + d.oy, 34, POND_H - 6); return; }
  if (G.drag) { G.drag.x = p.x; G.drag.y = p.y; if (Math.hypot(p.x - G.drag.sx, p.y - G.drag.sy) > 4) G.drag.moved = true; const h = hitSlot(p); if (h !== G.hover) { G.hover = h; computePreview(); } }
});
cv.addEventListener('pointerup', e => {
  const p = pt(e), pressed = G.pressed; G.pressed = null;
  if (G.fishDrag) { G.fishDrag.f.held = false; G.fishDrag.f.target = null; G.fishDrag = null; SFX.tick(); return; }
  if (G.screen === 'menu') { for (const b of G.menuBtns || []) if (inBox(p, b) && pressed === 'lv' + b.L.id) startLevel(b.L); return; }
  if (G.screen === 'intro') { if (pressed === 'go' && G.introBtn && inBox(p, G.introBtn)) { G.screen = 'play'; SFX.tick(); } else if (hitBtn(p) === 'menu') G.screen = 'menu'; return; }
  if (G.result) {
    for (const b of G.resultBtns || []) if (inBox(p, b) && pressed === b.k) { if (b.k === 'retry') startLevel(G.level); else if (b.k === 'menu') G.screen = 'menu'; else startLevel(LEVELS[G.level.id]); }
    if (pressed === 'menu' && hitBtn(p) === 'menu') G.screen = 'menu'; if (pressed === 'restart' && hitBtn(p) === 'restart') startLevel(G.level);
    return;
  }
  if (G.drag) {
    const d = G.drag; G.drag = null; G.card = null; G.hover = -1;
    if (d.moved) { const s = hitSlot(p); if (s >= 0) { G.slots[s] = d.card; if (G.slots.length > G.level.slots) G.slots.length = G.level.slots; SFX.tick(); } }
    else if (G.slots.length < G.level.slots) { G.slots.push(d.card); SFX.tick(); }
    // keep slots dense (no holes)
    G.slots = G.slots.filter(v => v != null);
    computePreview(); return;
  }
  if (pressed === 'feed' && inBox(p, BTN_FEED)) { doFeed(); computePreview(); return; }
  const k = hitBtn(p);
  if (pressed && pressed === k) { if (k === 'undo') undo(); else if (k === 'hint') hint(); else if (k === 'restart') startLevel(G.level); else if (k === 'menu') G.screen = 'menu'; computePreview(); }
});
cv.addEventListener('pointercancel', () => { if (G.fishDrag) G.fishDrag.f.held = false; G.fishDrag = null; G.drag = null; G.card = null; G.pressed = null; G.hover = -1; });

// ------------------------------------------------------------------ boot
loadAll().then(() => {
  bakePond();
  const loop = now => { update(now); draw(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  window.FTF = G; // for debugging / tests
}).catch(e => { ctx.fillStyle = '#fff'; ctx.font = '10px monospace'; ctx.fillText('Asset load failed: ' + e, 4, 20); console.error(e); });
