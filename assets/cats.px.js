// Feed the Cats — spin-off art (pxl). Side/3-4 view cats in a garden yard. Build:
//   node <pxl>/bin/pxl.js build assets/cats.px.js
// Shares the fish game's palette keys so the UI/food sheets are reused as-is.
const TAU = Math.PI * 2

pal({
  k: "#3B2F2F", e: "#1E1A1A",
  O: "#C9641A", o: "#F28C28", p: "#FFA64D", c: "#FFE2B8", C: "#FFF4E0",   // ginger ramp, dark -> light
  A: "#5E4F6B", H: "#8A7A99", K: "#AA9BB8", U: "#D6CCE0", V: "#EFE9F3",   // plum-grey ramp: cats with a digest food
  n: "#9BB06A", w: "#FFFFFF", W: "#F6F3EA", P: "#F4A6B0", r: "#E5304A",
  y: "#FFD23F", Y: "#FFF2B0", v: "#C9971F",
  g: "#7DBF5E", G: "#A6D98A", h: "#5A9A48", d: "#4E8A40",                  // grass (muted, not the algae green)
  s: "#B9A98F", S: "#8E7F68", z: "#D9CDB5", Z: "#F0E7D4",
  l: "#3F7A48", L: "#5E9C5B", j: "#8CC074",
  x: "#A5703F", X: "#7A4E2C", f: "#C8955E", F: "#E0B57E",
  t: "#8FB8E0", T: "#B8D6EE",                                             // sky-blue bowl
  1: "#86B85E", 2: "#AED48A",   // courtyard-tier grass (yellower)
  3: "#6FB36A", 4: "#9ED495",   // lily-tier grass (lusher)
  5: "#5F9A5A", 6: "#86B883",   // temple-tier grass (deeper)
})
ramps("Oopc", "AHKUV", "dhgG", "SszZ", "lLj", "XxfF")

// ================================================================ CATS
// Three breeds told apart by silhouette, all on one ginger palette:
//   tabby  (wants one food)    slim long body, pointy ears, long thin tail, back stripes
//   chonk  (likes either)      round body, big cheeks, small ears, stubby tail
//   fluffy (combo eater)       big ruff, tufted ears, bushy tail
const SIZES = { s: { L: 26, Hh: 12, cw: 36, ch: 28 }, m: { L: 34, Hh: 15, cw: 46, ch: 34 }, l: { L: 42, Hh: 19, cw: 56, ch: 42 } }

function drawCat(c, breed, L, Hh, o = {}) {
  const { pose = "stand", phase = 0, legs = 0, tail = 0, headDy = 0, eyes = "open", mouth = 0, paw = 0, bob = 0, hop = 0 } = o
  const cw = c.w, ch = c.h
  const cy = Math.floor(ch * 0.62) - hop, cx = Math.floor(cw / 2)
  const chonk = breed === "chonk", fluffy = breed === "fluffy", tabby = breed === "tabby"
  let rx = L / 2, ry = Hh / 2 * (chonk ? 1.2 : tabby ? 0.85 : 1)
  let bodyCy = cy, headR = Math.max(3, Math.round(Hh * (chonk ? 0.5 : 0.45)))
  let hx = cx + Math.round(rx * 0.7), hy = cy - Math.round(ry * 0.9) + headDy
  if (pose === "sit") { rx = L * 0.32; ry = Hh * 0.6; bodyCy = cy; hx = cx + Math.round(rx * 0.5); hy = cy - Math.round(ry * 1.25) + headDy }
  if (pose === "lie") { rx = L / 2; ry = Hh * 0.36; bodyCy = cy + Math.round(Hh * 0.15); hx = cx + Math.round(rx * 0.75); hy = bodyCy - Math.round(ry * 0.6) + headDy }
  bodyCy += bob
  // --- tail (behind body)
  const tx0 = cx - Math.round(rx * 0.9), ty0 = bodyCy - Math.round(ry * 0.3)
  const wag = Math.round(Math.sin(tail * TAU) * 2)
  if (chonk) { c.line(tx0, ty0, tx0 - 3, ty0 - 2 + wag, "o", 2) }
  else if (fluffy) { c.line(tx0, ty0, tx0 - Math.round(L * 0.3), ty0 - Math.round(Hh * 0.6) + wag, "o", 3); c.px(tx0 - Math.round(L * 0.3), ty0 - Math.round(Hh * 0.6) + wag - 1, "c") }
  else { c.line(tx0, ty0, tx0 - Math.round(L * 0.25), ty0 - Math.round(Hh * 0.3) + wag, "o"); c.line(tx0 - Math.round(L * 0.25), ty0 - Math.round(Hh * 0.3) + wag, tx0 - Math.round(L * 0.3), ty0 - Math.round(Hh * 0.8) + wag, "o") }
  // --- legs
  const legY = bodyCy + Math.round(ry * 0.6), legH = Math.max(2, Math.round(Hh * 0.35))
  if (pose === "stand" || pose === "walk") {
    const sw = pose === "walk" ? Math.round(Math.sin(legs * TAU) * 2) : 0
    const lx = [cx - Math.round(rx * 0.55), cx - Math.round(rx * 0.35), cx + Math.round(rx * 0.35), cx + Math.round(rx * 0.55)]
    const offs = [sw, -sw, -sw, sw]
    lx.forEach((x, i) => { c.vline(x + offs[i], legY, legH, i % 2 ? "o" : "O"); c.px(x + offs[i] + 1, legY + legH - 1, i % 2 ? "o" : "O") })
  } else if (pose === "sit") {
    c.vline(cx + Math.round(rx * 0.4), legY - 1, legH + 1, "o"); c.vline(cx + Math.round(rx * 0.6), legY - 1, legH + 1, "O")
    c.ellipse(cx - Math.round(rx * 0.3), legY + legH - 1, Math.round(rx * 0.5), 2, "O")
  } else { c.hline(cx + Math.round(rx * 0.3), bodyCy + Math.round(ry) , 4, "O") }
  // --- body
  c.ellipse(cx, bodyCy, Math.round(rx), Math.round(ry), "o")
  c.ellipse(cx, bodyCy - 1, Math.round(rx * 0.8), Math.max(1, Math.round(ry * 0.45)), "p")        // lit back
  c.ellipse(cx, bodyCy + Math.round(ry * 0.5), Math.round(rx * 0.7), Math.max(1, Math.round(ry * 0.35)), "c")   // pale belly
  if (tabby) for (let i = -1; i <= 1; i++) c.vline(cx + i * Math.round(rx * 0.35), bodyCy - Math.round(ry), 2 + (i === 0 ? 1 : 0), "O")
  if (fluffy) c.ellipse(hx - Math.round(headR * 0.6), hy + headR, Math.round(headR * 1.1), Math.round(headR * 0.7), "c")   // ruff
  // raised paw (groom)
  if (paw) c.line(hx - 2, hy + headR, hx - 4, hy + headR - 3 - paw, "o", 2)
  // --- head
  c.circ(hx, hy, headR, "o")
  c.ellipse(hx, hy - Math.round(headR * 0.4), Math.round(headR * 0.7), Math.max(1, Math.round(headR * 0.35)), "p")
  if (chonk) { c.circ(hx - Math.round(headR * 0.6), hy + 1, Math.max(1, Math.round(headR * 0.45)), "c"); c.circ(hx + Math.round(headR * 0.6), hy + 1, Math.max(1, Math.round(headR * 0.45)), "c") }
  // ears
  const eh = fluffy ? headR + 1 : chonk ? Math.max(2, headR - 2) : headR
  c.poly([hx - headR + 1, hy - headR + 2, hx - Math.round(headR * 0.4), hy - headR - eh + 2, hx - Math.round(headR * 0.1), hy - headR + 1], "o")
  c.poly([hx + headR - 1, hy - headR + 2, hx + Math.round(headR * 0.4), hy - headR - eh + 2, hx + Math.round(headR * 0.1), hy - headR + 1], "o")
  c.px(hx - Math.round(headR * 0.45), hy - headR - 1, "P"); c.px(hx + Math.round(headR * 0.45), hy - headR - 1, "P")
  // face
  const ex = Math.max(1, Math.round(headR * 0.45)), ey = hy
  if (eyes === "open") { c.px(hx - ex, ey, "k"); c.px(hx + ex, ey, "k") }
  else if (eyes === "happy") { c.hline(hx - ex - 1, ey, 3, "k"); c.hline(hx + ex - 1, ey, 3, "k"); c.px(hx - ex, ey - 1, "k"); c.px(hx + ex, ey - 1, "k") }
  else if (eyes === "shut") { c.hline(hx - ex - 1, ey, 3, "k"); c.hline(hx + ex - 1, ey, 3, "k") }
  else if (eyes === "x") { c.px(hx - ex, ey, "k"); c.px(hx + ex, ey, "k"); c.px(hx - ex - 1, ey - 1, "r"); c.px(hx + ex + 1, ey - 1, "r") }
  c.px(hx, hy + Math.round(headR * 0.4), "P")   // nose
  if (mouth > 0) { const mh = Math.max(1, Math.round(mouth * headR * 0.5)); c.rect(hx - 1, hy + Math.round(headR * 0.55), 3, mh, "k"); c.px(hx, hy + Math.round(headR * 0.55) + mh - 1, "r") }
  // whiskers
  c.hline(hx + headR - 1, hy + 1, 3, "W"); c.hline(hx - headR - 1, hy + 1, 2, "W")
}

const BREEDS = ["tabby", "chonk", "fluffy"]
const FULL = { swap: { o: "p", O: "o", p: "c", c: "C" } }
const DIG = { O: "A", o: "H", p: "K", c: "U" }, DIG_FULL = { o: "A", p: "H", c: "K", C: "U" }, DIG_LIGHT = { O: "H", o: "K", p: "U", c: "V" }
const anim2 = (name, opts, fn) => {
  anim(name, opts, fn)
  const dname = name.replace(/^([a-z]+_[sml])_/, "$1_d_")
  anim(dname, opts, fn, (c) => c.recolor(opts.swap ? DIG_LIGHT : name.endsWith("digest_full") && c.frame < 5 ? DIG_FULL : DIG))
}
for (const breed of BREEDS) for (const [sz, S] of Object.entries(SIZES)) {
  const base = { w: S.cw, h: S.ch, outline: "k" }, id = `${breed}_${sz}`
  const D = (c, o) => drawCat(c, breed, S.L, S.Hh, o)
  // walk (hungry / full) = the engine's "swim"
  anim2(`${id}_swim`, { ...base, frames: 6, fps: 10 }, (c) => D(c, { pose: "walk", legs: c.phase, tail: c.phase, bob: c.frame % 3 === 1 ? -1 : 0 }))
  anim2(`${id}_swim_full`, { ...base, ...FULL, frames: 6, fps: 7 }, (c) => D(c, { pose: "walk", legs: c.phase, tail: c.phase * 0.5, eyes: "happy", bob: c.frame % 3 === 1 ? -1 : 0 }))
  // three idles: sit + tail flick, groom (paw up, head down, eyes shut), lie down + slow tail
  anim2(`${id}_idle_a`, { ...base, frames: 4, fps: 4 }, (c) => D(c, { pose: "sit", tail: c.phase, bob: c.frame === 2 ? -1 : 0 }))
  anim2(`${id}_idle_b`, { ...base, frames: 4, fps: 5 }, (c) => D(c, { pose: "sit", tail: 0.25, eyes: "shut", headDy: 2 + (c.frame % 2), paw: 2 + (c.frame % 2) * 2 }))
  anim2(`${id}_idle_c`, { ...base, frames: 4, fps: 3 }, (c) => D(c, { pose: "lie", tail: c.phase, eyes: c.frame === 3 ? "shut" : "open" }))
  anim2(`${id}_idle_a_full`, { ...base, ...FULL, frames: 4, fps: 4 }, (c) => D(c, { pose: "sit", tail: c.phase, eyes: "happy", bob: c.frame === 2 ? -1 : 0 }))
  anim2(`${id}_idle_b_full`, { ...base, ...FULL, frames: 4, fps: 5 }, (c) => D(c, { pose: "sit", tail: 0.25, eyes: "shut", headDy: 2 + (c.frame % 2), paw: 2 + (c.frame % 2) * 2 }))
  anim2(`${id}_idle_c_full`, { ...base, ...FULL, frames: 4, fps: 3 }, (c) => D(c, { pose: "lie", tail: c.phase, eyes: "happy" }))
  // preview: head up, mouth open
  anim2(`${id}_preview_eat`, { ...base, frames: 2, fps: 5 }, (c) => D(c, { pose: "stand", headDy: -1, mouth: 0.6 + c.frame * 0.4, tail: c.frame * 0.5 }))
  // eat = the engine's "bite": lean, head down, chomp (frame 3 = contact), back up
  anim2(`${id}_bite`, { ...base, frames: 5, fps: 14, loop: false }, (c) => {
    const o = [{ headDy: -1, mouth: 0.3 }, { headDy: 2, mouth: 1 }, { headDy: 4, mouth: 1 }, { headDy: 4, mouth: 0, eyes: "shut" }, { headDy: 1, mouth: 0 }][c.frame]
    D(c, { pose: "stand", ...o })
  })
  // digest: chomp, shudder (green tint), release (frame 4), settle
  anim2(`${id}_digest`, { ...base, frames: 6, fps: 11, loop: false }, (c) => {
    const o = [{ headDy: 4, mouth: 1 }, { headDy: 2, mouth: 0.3 }, { headDy: 0, eyes: "x", bob: -1 }, { headDy: 0, eyes: "x", bob: 1 }, { headDy: -1, eyes: "x", mouth: 0.6 }, { headDy: 0 }][c.frame]
    D(c, { pose: "stand", ...o })
    if (c.frame === 2 || c.frame === 3) c.recolor({ o: "n", p: "n", O: "l" })
  })
  anim2(`${id}_digest_full`, { ...base, frames: 6, fps: 11, loop: false }, (c) => {
    const o = [{ headDy: 4, mouth: 1 }, { headDy: 2, mouth: 0.3 }, { headDy: 0, eyes: "x", bob: -1 }, { headDy: 0, eyes: "x", bob: 1 }, { headDy: -1, eyes: "x", mouth: 0.6 }, { headDy: 0 }][c.frame]
    D(c, { pose: "stand", ...o })
    if (c.frame < 5) c.recolor(FULL.swap)
    if (c.frame === 2 || c.frame === 3) c.recolor({ o: "n", p: "n", c: "n", O: "l" })
  })
  // ignore: a tail flick and a look away (= idle sit, head turned up)
  anim2(`${id}_ignore`, { ...base, frames: 3, fps: 11, loop: false }, (c) => D(c, { pose: "sit", tail: 0.25 + c.frame * 0.3, headDy: -1 - c.frame }))
  // content wiggle (full): a little bob
  anim2(`${id}_content`, { ...base, ...FULL, frames: 3, fps: 8, loop: false }, (c) => D(c, { pose: "sit", eyes: "happy", bob: c.frame === 1 ? -2 : 0, tail: c.frame / 3 }))
  // celebrate (full): hops
  anim2(`${id}_celebrate`, { ...base, ...FULL, frames: 6, fps: 12, loop: false }, (c) => D(c, { pose: "stand", eyes: "happy", hop: [0, 3, 5, 3, 0, 2][c.frame], tail: c.phase, mouth: c.frame < 2 ? 0.5 : 0 }))
  // gulp (lose screen): a sad meow
  anim2(`${id}_gulp`, { ...base, frames: 2, fps: 4 }, (c) => D(c, { pose: "sit", mouth: c.frame ? 1 : 0.4, headDy: -1 }))
}

// ================================================================ YARD TILESET + PROPS
const TS = 16
sprite("_tuft", { w: 3, h: 2 }, `.h.\nh.h`)
sprite("tile_water_a", { w: TS, h: TS }, rect(0, 0, TS, TS, "g"))
sprite("tile_water_b", { w: TS, h: TS }, rect(0, 0, TS, TS, "g"), stamp("_tuft", 3, 4), stamp("_tuft", 10, 9))
sprite("tile_water_c", { w: TS, h: TS }, rect(0, 0, TS, TS, "g"), px(5, 11, "G"), px(12, 3, "G"), stamp("_tuft", 7, 6))
sprite("tile_shallow", { w: TS, h: TS }, rect(0, 0, TS, TS, "G"), dither(0, 0, TS, TS, "G", "g", 0.3))
sprite("tile_bank", { w: TS, h: TS }, rect(0, 0, TS, TS, "s"), noise(0, 0, TS, TS, "sz", 0.2, 3))
// picket fence rim: wood on the outer side, a thin dirt strip, grass inside
const fenceH = (c, y) => { c.rect(0, y, TS, 6, "x"); c.hline(0, y, TS, "f"); c.hline(0, y + 5, TS, "X"); for (let x = 1; x < TS; x += 4) { c.rect(x, y - 2, 2, 9, "f"); c.px(x, y - 3, "f"); c.px(x + 1, y - 3, "f"); c.vline(x + 1, y - 2, 9, "x") } }
const fenceV = (c, x) => { c.rect(x, 0, 6, TS, "x"); c.vline(x, 0, TS, "f"); c.vline(x + 5, 0, TS, "X"); for (let y = 1; y < TS; y += 4) { c.rect(x - 2, y, 9, 2, "f"); c.px(x - 3, y, "f"); c.px(x - 3, y + 1, "f"); c.hline(x - 2, y + 1, 9, "x") } }
const rim = (name, fn) => sprite(name, { w: TS, h: TS }, rect(0, 0, TS, TS, "g"), (c) => fn(c))
rim("tile_rim_n", (c) => { c.rect(0, 0, TS, 2, "S"); fenceH(c, 2); c.rect(0, 8, TS, 2, "s") })
rim("tile_rim_s", (c) => { c.rect(0, 6, TS, 2, "s"); fenceH(c, 8); c.rect(0, 14, TS, 2, "S") })
rim("tile_rim_w", (c) => { c.rect(0, 0, 2, TS, "S"); fenceV(c, 2); c.rect(8, 0, 2, TS, "s") })
rim("tile_rim_e", (c) => { c.rect(14, 0, 2, TS, "S"); fenceV(c, 8); c.rect(6, 0, 2, TS, "s") })
rim("tile_rim_nw", (c) => { c.rect(0, 0, TS, 8, "S"); c.rect(0, 0, 8, TS, "S"); fenceH(c, 2); fenceV(c, 2); c.rect(8, 8, 2, 8, "s"); c.rect(8, 8, 8, 2, "s") })
rim("tile_rim_ne", (c) => { c.rect(0, 0, TS, 8, "S"); c.rect(8, 0, 8, TS, "S"); fenceH(c, 2); fenceV(c, 8); c.rect(6, 8, 2, 8, "s"); c.rect(0, 8, 8, 2, "s") })
rim("tile_rim_sw", (c) => { c.rect(0, 8, TS, 8, "S"); c.rect(0, 0, 8, TS, "S"); fenceH(c, 8); fenceV(c, 2); c.rect(8, 0, 2, 8, "s"); c.rect(8, 6, 8, 2, "s") })
rim("tile_rim_se", (c) => { c.rect(0, 8, TS, 8, "S"); c.rect(8, 0, 8, TS, "S"); fenceH(c, 8); fenceV(c, 8); c.rect(6, 0, 2, 8, "s"); c.rect(0, 6, 8, 2, "s") })
const GRASS = { _c: { g: "1", G: "2" }, _l: { g: "3", G: "4" }, _t: { g: "5", G: "6" } }
for (const sfx of ["_c", "_l", "_t"]) {
  for (const n of ["tile_water_a", "tile_water_b", "tile_water_c", "tile_shallow", "tile_rim_n", "tile_rim_s", "tile_rim_w", "tile_rim_e", "tile_rim_nw", "tile_rim_ne", "tile_rim_sw", "tile_rim_se"]) sprite(n + sfx, { base: n, swap: GRASS[sfx] })
  sprite("tile_bank" + sfx, { base: "tile_bank" })
}
// props
sprite("prop_bush", { w: 22, h: 16, outline: "l" }, (c) => { c.ellipse(11, 9, 10, 6, "L"); c.ellipse(7, 7, 5, 4, "j"); c.ellipse(14, 6, 6, 4, "L"); c.ellipse(13, 5, 3, 2, "j"); c.px(4, 12, "l"); c.px(16, 12, "l") })
sprite("prop_flowers", { w: 14, h: 10 }, (c) => { c.line(3, 9, 3, 4, "L"); c.line(7, 9, 7, 2, "L"); c.line(11, 9, 11, 5, "L"); c.circ(3, 3, 1, "P"); c.circ(7, 1, 1, "y"); c.circ(11, 4, 1, "w"); c.px(3, 3, "Y"); c.px(7, 1, "v"); c.px(11, 4, "P") })
sprite("prop_pot", { w: 14, h: 16 }, (c) => { c.poly([2, 6, 12, 6, 10, 15, 4, 15], "x"); c.rect(1, 4, 12, 3, "f"); c.hline(1, 4, 12, "F"); c.vline(4, 7, 8, "X"); c.ellipse(7, 3, 5, 3, "L"); c.ellipse(6, 2, 3, 2, "j"); c.px(9, 1, "P"); c.px(4, 1, "P") })
sprite("prop_stump", { w: 16, h: 12, outline: "X" }, (c) => { c.rect(2, 4, 12, 7, "x"); c.ellipse(8, 4, 6, 3, "f"); c.ellipse(8, 4, 3, 1, "x"); c.px(8, 4, "f"); c.vline(5, 6, 4, "X"); c.vline(11, 6, 4, "X") })
sprite("prop_bowl", { w: 14, h: 8 }, (c) => { c.ellipse(7, 4, 6, 3, "t"); c.ellipse(7, 3, 5, 2, "T"); c.ellipse(7, 3, 3, 1, "t"); c.hline(3, 7, 8, "S") })
sprite("prop_rock", { w: 14, h: 10, outline: "S" }, (c) => { c.ellipse(6, 5, 6, 4, "s"); c.ellipse(5, 3, 4, 2, "z"); c.hline(3, 8, 7, "S"); c.px(4, 2, "Z") })
sprite("prop_moss_rock", { base: "prop_rock", swap: { z: "j", Z: "j" } })
sprite("prop_lantern", { w: 14, h: 14 }, (c) => { c.circ(7, 7, 7, "Y"); c.rect(3, 3, 8, 8, "S"); c.rect(4, 4, 6, 6, "s"); c.rect(5, 5, 4, 4, "y"); c.rect(6, 6, 2, 2, "Y"); c.px(3, 3, "z"); c.px(10, 3, "z"); c.px(3, 10, "z"); c.px(10, 10, "z") })
sprite("prop_planter", { base: "prop_bush" })   // name-compatible stand-ins so the theme prop lists can share names
sprite("prop_planter_b", { base: "prop_bush", flip: "x" })
sprite("prop_grass", { w: 7, h: 6 }, (c) => { c.line(3, 5, 0, 1, "L"); c.line(3, 5, 3, 0, "j"); c.line(3, 5, 6, 0, "L") })
sprite("prop_lily_a", { base: "prop_flowers" }); sprite("prop_lily_b", { base: "prop_flowers", flip: "x" }); sprite("prop_lily_flower", { base: "prop_pot" }); sprite("prop_lily_big", { base: "prop_stump" }); sprite("prop_reed", { base: "prop_grass" }); sprite("prop_spout", { base: "prop_bowl" })

anim("caustic", { w: 48, h: 48, frames: 4, fps: 4 }, (c) => {
  // drifting light dapple on the grass, drawn at low alpha by the game
  const k = c.frame
  for (let i = 0; i < 5; i++) { const y = (i * 9 + k * 3) % 48, x = (i * 11 + k * 2) % 48; c.ellipse(x, y, 4, 2, "G"); c.px((x + 20) % 48, (y + 12) % 48, "G") }
})
anim("ambient_bubble", { w: 4, h: 4, frames: 3, fps: 4 }, (c) => { c.px(1, 3 - c.frame, "w"); c.px(2, 2 - c.frame + (c.frame === 2 ? 2 : 0), "Y") })   // a drifting petal/butterfly speck

scene("yard_preview", { w: 272, h: 368 },
  tilemap(["1" + "n".repeat(15) + "2", ...Array(21).fill("w" + "a".repeat(15) + "e"), "3" + "s".repeat(15) + "4"].join(String.fromCharCode(10)),
    { map: { n: "tile_rim_n", s: "tile_rim_s", w: "tile_rim_w", e: "tile_rim_e", 1: "tile_rim_nw", 2: "tile_rim_ne", 3: "tile_rim_sw", 4: "tile_rim_se", a: "tile_water_*" }, size: TS }),
  stamp("prop_bush", 14, 14), stamp("prop_pot", 236, 12), stamp("prop_stump", 30, 300), stamp("prop_flowers", 220, 300), stamp("prop_bowl", 128, 340),
  stamp("tabby_l_swim", 70, 120), stamp("chonk_m_idle_a", 150, 180), stamp("fluffy_s_idle_c", 200, 240), stamp("tabby_m_d_idle_b", 90, 230))

sheet("cats", ["tabby_*", "chonk_*", "fluffy_*"], { pad: 1 })
sheet("tiles", ["tile_*"], { pad: 0 })
sheet("props", ["prop_*"], { pad: 1 })
sheet("ui_extra", ["caustic", "ambient_bubble"], { pad: 1 })
