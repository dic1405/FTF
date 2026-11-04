// Feed the Fishes — pixel art source (pxl). Build: node <pxl>/bin/pxl.js build assets/art.px.js
// Top-down pond, 270x480 logical. All fish share one orange/cream palette; the type reads from silhouette only.
const TAU = Math.PI * 2

pal({
  k: "#3B2F2F",                      // fish outline
  e: "#1E1A1A",                      // food / UI outline (near-black)
  O: "#C9641A", o: "#F28C28", p: "#FFA64D", c: "#FFE2B8", C: "#FFF4E0",   // fish ramp, dark -> light
  n: "#9BB06A",                      // digest tint (muted green, not a food hue)
  w: "#FFFFFF", W: "#F6F3EA",        // white, warm white
  r: "#E5304A", R: "#B01F38",        // hearts
  y: "#FFD23F", Y: "#FFF2B0", v: "#C9971F",   // pellet
  g: "#4FD66B", G: "#B8F5C4", h: "#2E9A47",   // algae
  b: "#3D9BFF", B: "#A9D4FF", N: "#2465B8",   // krill
  m: "#8B4FE0", M: "#C9A6FF", u: "#5A2E9E",   // worm
  t: "#5FA3A8", T: "#74B7BA", q: "#9AD0CF", d: "#4A8A90", D: "#386F76",   // water
  s: "#B9A98F", S: "#8E7F68", z: "#D9CDB5", Z: "#F0E7D4",   // stone
  l: "#3F7A48", L: "#5E9C5B", j: "#8CC074",   // plants
  x: "#A5703F", X: "#7A4E2C", f: "#C8955E", F: "#E0B57E",   // wood
  i: "#7ED6A6", I: "#55B784", J: "#3C8F65",   // mint button
  P: "#F4A6B0", a: "#9AD7F0",        // pink cheeks, sweat drop blue
  E: "#6B5A3A", Q: "#8A7A4A",        // poop brown-green
  A: "#5E4F6B", H: "#8A7A99", K: "#AA9BB8", U: "#D6CCE0", V: "#EFE9F3",   // plum-grey ramp: fish with a digest food
  1: "#6E9EA8", 2: "#86B2BA",        // courtyard water (greyer)
  3: "#4FA092", 4: "#6BB8A8",        // lily pond water (greener)
  5: "#3E6F84", 6: "#507F93",        // temple water (deeper)
  7: "#E8C070", 8: "#F7E3A0",        // lantern light
})
ramps("Oopc", "AHKUV", "DdtTq", "SszZ", "lLj", "XxfF", "JIi", "Rr", "vyY", "hgG", "Nbb", "umM")

// ================================================================ FISH
// Every fish is drawn by one function so swim / bite / digest / celebrate frames are parameters, not grids.
const SIZES = { s: { L: 32, W: 10, cw: 40, ch: 20 }, m: { L: 44, W: 13, cw: 52, ch: 24 }, l: { L: 56, W: 16, cw: 64, ch: 28 } }

function drawFish(c, type, L, Wd, o = {}) {
  const { phase = 0, mouth = 0, eyes = "open", stretch = 0, flick = 0, amp = 1, whisk = 0 } = o
  const cx = Math.floor(c.w / 2), cy = Math.floor(c.h / 2)
  const nose = cx + Math.floor(L / 2) + stretch, tailTip = cx - Math.ceil(L / 2)
  const hw = Wd / 2
  const wag = (u) => amp * (1 - u) * (1 - u) * (Math.sin(phase * TAU + u * 2.2) * (Wd * 0.28) + flick * (1 - u) * 1.5)

  // --- body profile: half width at u (0 = tail base, 1 = nose)
  let bodyStart, prof
  if (type === "koi") {
    bodyStart = tailTip + Math.round(L * 0.2)
    prof = (u) => { const a = Math.max(0, 1 - ((u - 0.6) / 0.62) ** 2); return Math.sqrt(a) * Math.min(1, (1 - u) * 9 + 0.15) }
  } else if (type === "goldfish") {
    bodyStart = tailTip + Math.round(L * 0.45)
    prof = (u) => { const a = Math.max(0, 1 - ((u - 0.55) / 0.55) ** 2); return Math.sqrt(a) * Math.min(1, (1 - u) * 7 + 0.2) }
  } else {
    bodyStart = tailTip + Math.round(L * 0.14)
    prof = (u) => u < 0.5 ? 0.3 + u * 1.3 : Math.min(1, 0.95 + (u - 0.5) * 0.3) * Math.min(1, (1 - u) * 6 + 0.25)
  }
  const bodyLen = nose - bodyStart

  // --- tail fin (behind the body)
  const tb = bodyStart, ty = cy + Math.round(wag(0) * 1.4)
  if (type === "koi") {
    const tl = Math.round(L * 0.2), sp = Math.round(hw * 0.9)
    c.poly([tb + 1, ty, tb - tl, ty - sp, tb - Math.round(tl * 0.45), ty, tb - tl, ty + sp], "c")
    c.line(tb + 1, ty, tb - tl + 1, ty - sp + 1, "o"); c.line(tb + 1, ty, tb - tl + 1, ty + sp - 1, "o")
  } else if (type === "goldfish") {
    const tl = Math.round(L * 0.45), sw = Math.round(wag(0) * 1.2)
    const sp = Math.round(Wd * 0.95)
    // two big fan lobes, swinging
    c.poly([tb + 2, ty - 1, tb - tl + 2, ty - sp + sw, tb - tl, ty - Math.round(sp * 0.45) + sw, tb - Math.round(tl * 0.45), ty], "c")
    c.poly([tb + 2, ty + 1, tb - tl + 2, ty + sp + sw, tb - tl, ty + Math.round(sp * 0.45) + sw, tb - Math.round(tl * 0.45), ty], "c")
    c.line(tb + 1, ty - 1, tb - tl + 3, ty - sp + 1 + sw, "o"); c.line(tb + 1, ty + 1, tb - tl + 3, ty + sp - 1 + sw, "o")
    c.line(tb, ty, tb - Math.round(tl * 0.8), ty - Math.round(sp * 0.3) + sw, "p"); c.line(tb, ty, tb - Math.round(tl * 0.8), ty + Math.round(sp * 0.3) + sw, "p")
  } else {
    const tl = Math.round(L * 0.14), sp = Math.round(hw * 0.7)
    c.poly([tb + 1, ty, tb - tl, ty - sp, tb - tl + 1, ty, tb - tl, ty + sp], "c")
  }

  // --- body, column by column, with the tail-end wag
  for (let x = bodyStart; x <= nose; x++) {
    const u = (x - bodyStart) / bodyLen
    const w = Math.max(0.5, prof(u) * hw), yo = Math.round(wag(u))
    const top = Math.round(cy + yo - w), h = Math.round(w * 2)
    c.vline(x, top, Math.max(1, h), u > 0.78 ? "p" : "o")
    // dorsal line: a darker ridge down the middle, lit left/top
    if (h > 2) c.px(x, top, "p")
    if (h > 3) c.px(x, top + h - 1, "O")
  }
  // --- pectoral fins (either side, near the head)
  const fu = type === "goldfish" ? 0.62 : 0.68, fx = bodyStart + Math.round(bodyLen * fu), fw = Math.max(1, Math.round(prof(fu) * hw))
  const fl = Math.max(2, Math.round(Wd * 0.3))
  c.poly([fx, cy - fw + 1, fx - fl, cy - fw - fl + 1, fx + 2, cy - fw - 1], "c")
  c.poly([fx, cy + fw - 1, fx - fl, cy + fw + fl - 1, fx + 2, cy + fw + 1], "c")

  // --- type details
  if (type === "koi") {
    // 2-3 darker patches along the back
    const px = bodyStart + Math.round(bodyLen * 0.35), px2 = bodyStart + Math.round(bodyLen * 0.75)
    c.clip((x, y) => c.is(x, y, "oOp"), () => { c.ellipse(px, cy - 1, Math.max(2, Math.round(L * 0.08)), Math.max(1, Math.round(hw * 0.5)), "O")
      c.ellipse(px2, cy + 1, Math.max(2, Math.round(L * 0.06)), Math.max(1, Math.round(hw * 0.4)), "O") })
  } else if (type === "goldfish") {
    c.clip((x, y) => c.is(x, y, "oOp"), () => c.ellipse(bodyStart + Math.round(bodyLen * 0.5), cy, Math.round(bodyLen * 0.3), Math.max(1, Math.round(hw * 0.45)), "p"))
  } else {
    // flat head: a lighter plate and two whiskers
    const hx = bodyStart + Math.round(bodyLen * 0.75), hwid = Math.round(prof(0.75) * hw)
    c.clip((x, y) => c.is(x, y, "oOp"), () => c.ellipse(hx, cy, Math.round(bodyLen * 0.2), Math.max(1, hwid - 1), "p"))
    const wy = Math.round(Math.sin(phase * TAU) * 1.5 + whisk)
    c.line(nose - 2, cy - hwid + 1, nose + 3, cy - hwid - 4 + wy, "W")
    c.line(nose - 2, cy + hwid - 1, nose + 3, cy + hwid + 4 - wy, "W")
  }
  // --- eyes
  const ex = nose - Math.max(3, Math.round(L * 0.1)), ew = Math.max(1, Math.round(prof((ex - bodyStart) / bodyLen) * hw) - 1)
  if (eyes === "open") { c.px(ex, cy - ew, "k"); c.px(ex, cy + ew, "k") }
  else if (eyes === "happy") { c.hline(ex - 1, cy - ew, 3, "k"); c.hline(ex - 1, cy + ew, 3, "k") }
  else if (eyes === "x") { c.px(ex, cy - ew, "k"); c.px(ex, cy + ew, "k"); c.px(ex - 1, cy - ew, "R"); c.px(ex - 1, cy + ew, "R") }
  // --- mouth: a notch at the nose when open
  if (mouth > 0) {
    const mh = Math.max(1, Math.round(mouth * Math.max(1, hw * 0.45)))
    c.rect(nose - mh + 1, cy - Math.floor(mh / 2), mh, Math.max(1, mh), "_")
    c.rect(nose - mh + 1, cy - Math.floor(mh / 2), mh, Math.max(1, mh), "k")
    c.rect(nose - mh + 1, cy - Math.floor(mh / 2), 1, Math.max(1, mh), "R")
  }
}

const TYPES = ["koi", "goldfish", "catfish"]
const FULL = { swap: { o: "p", O: "o", p: "c", c: "C" } }
// fish with a digest food get a plum-grey body: every anim is built twice, the "_d" variant recoloured as a last step
const DIG = { O: "A", o: "H", p: "K", c: "U" }, DIG_FULL = { o: "A", p: "H", c: "K", C: "U" }, DIG_LIGHT = { O: "H", o: "K", p: "U", c: "V" }
const anim2 = (name, opts, fn) => {
  anim(name, opts, fn)
  const dname = name.replace(/^([a-z]+_[sml])_/, "$1_d_")
  // opts.swap (the FULL palette) is applied after this recolor, so full-body anims map straight to the lighter plum ramp
  anim(dname, opts, fn, (c) => c.recolor(opts.swap ? DIG_LIGHT : name.endsWith("digest_full") && c.frame < 5 ? DIG_FULL : DIG))
}
for (const type of TYPES) for (const [sz, S] of Object.entries(SIZES)) {
  const base = { w: S.cw, h: S.ch, outline: "k" }
  const id = `${type}_${sz}`
  // hungry / full swim loops
  anim2(`${id}_swim`, { ...base, frames: 6, fps: 10 }, (c) => drawFish(c, type, S.L, S.W, { phase: c.phase }))
  anim2(`${id}_swim_full`, { ...base, ...FULL, frames: 6, fps: 7 }, (c) => drawFish(c, type, S.L, S.W + 2, { phase: c.phase, eyes: "happy", amp: 0.7 }))
  // preview: head up, mouth open (2 frames)
  anim2(`${id}_preview_eat`, { ...base, frames: 2, fps: 5 }, (c) => drawFish(c, type, S.L, S.W, { phase: c.frame * 0.5, mouth: 0.6 + c.frame * 0.4 }))
  // bite: anticipate, open, lunge, SNAP (frame 3 = contact), recover
  anim2(`${id}_bite`, { ...base, frames: 5, fps: 14, loop: false }, (c) => {
    const f = c.frame
    const o = [{ stretch: -1, mouth: 0.3 }, { stretch: 0, mouth: 1 }, { stretch: 1, mouth: 1, phase: 0.25 }, { stretch: 1, mouth: 0, phase: 0.5 }, { stretch: 0, mouth: 0, phase: 0.75 }][f]
    drawFish(c, type, S.L, S.W, o)
  })
  // digest: bite (2), shudder with a green tint (2), release (frame 4 = heart lost), settle
  anim2(`${id}_digest`, { ...base, frames: 6, fps: 11, loop: false }, (c) => {
    const f = c.frame
    const o = [{ mouth: 1, stretch: 1 }, { mouth: 0.3 }, { phase: 0.25, flick: 1, eyes: "x" }, { phase: 0.75, flick: -1, eyes: "x" }, { phase: 0.5, eyes: "x", amp: 1.4 }, { phase: 0 }][f]
    drawFish(c, type, S.L, S.W, o)
    if (f === 2 || f === 3) c.recolor({ o: "n", p: "n", O: "l" })
  })
  anim2(`${id}_digest_full`, { ...base, frames: 6, fps: 11, loop: false }, (c) => {
    const f = c.frame
    const o = [{ mouth: 1, stretch: 1 }, { mouth: 0.3 }, { phase: 0.25, flick: 1, eyes: "x" }, { phase: 0.75, flick: -1, eyes: "x" }, { phase: 0.5, eyes: "x", amp: 1.4 }, { phase: 0 }][f]
    drawFish(c, type, S.L, f < 5 ? S.W + 2 : S.W, o)
    if (f < 5) c.recolor(FULL.swap)
    if (f === 2 || f === 3) c.recolor({ o: "n", p: "n", c: "n", O: "l" })
  })
  // ignore: tail flick, turn away
  anim2(`${id}_ignore`, { ...base, frames: 3, fps: 11, loop: false }, (c) => drawFish(c, type, S.L, S.W, { phase: 0.25 + c.frame * 0.25, flick: c.frame === 1 ? 2 : 0, amp: 1.5 }))
  // content wiggle (full body)
  anim2(`${id}_content`, { ...base, ...FULL, frames: 3, fps: 8, loop: false }, (c) => drawFish(c, type, S.L, S.W + 2, { phase: c.frame / 3, eyes: "happy", amp: 1.6 }))
  // celebrate (full body): the engine adds the 360 turn
  anim2(`${id}_celebrate`, { ...base, ...FULL, frames: 6, fps: 12, loop: false }, (c) => drawFish(c, type, S.L, S.W + 2 + (c.frame % 2), { phase: c.phase, eyes: "happy", amp: 1.8, mouth: c.frame < 2 ? 0.5 : 0 }))
  // gulp at the surface (lose screen)
  anim2(`${id}_gulp`, { ...base, frames: 2, fps: 4 }, (c) => drawFish(c, type, S.L, S.W, { mouth: c.frame ? 1 : 0.4, amp: 0.3 }))
}

// ================================================================ FOOD
// icons 12x12 (10x10 + outline), pieces 6-8px (+ outline). Same silhouettes at two sizes.
sprite("_pellet10", { w: 10, h: 10, outline: "e" }, (c) => { c.circ(4, 4, 4, "y"); c.px(3, 3, "Y"); c.px(2, 3, "Y"); c.px(3, 2, "Y"); c.line(2, 7, 6, 7, "v"); c.px(7, 6, "v") })
sprite("_algae10", { w: 10, h: 10, outline: "e" }, (c) => { c.poly([0, 8, 2, 3, 6, 0, 9, 1, 8, 5, 4, 8], "g"); c.line(1, 7, 7, 2, "h"); c.px(5, 1, "G"); c.px(3, 4, "G") })
sprite("_krill10", { w: 10, h: 10, outline: "e" }, (c) => { c.ring(4, 4, 3, "b"); c.rect(5, 3, 3, 3, "_"); c.px(6, 1, "B"); c.px(2, 2, "B"); c.px(2, 6, "N"); c.poly([7, 2, 10, 0, 9, 4], "b"); c.px(1, 4, "w"); c.px(5, 0, "N") })
sprite("_worm10", { w: 10, h: 10, outline: "e" }, (c) => { c.line(0, 2, 3, 0, "m", 2); c.line(3, 0, 5, 4, "m", 2); c.line(5, 4, 8, 7, "m", 2); c.line(8, 7, 10, 5, "m", 2); c.px(2, 1, "M"); c.px(4, 2, "u"); c.px(6, 5, "u"); c.px(9, 6, "M") })
sprite("icon_P", { base: "_pellet10" }); sprite("icon_A", { base: "_algae10" }); sprite("icon_K", { base: "_krill10" }); sprite("icon_W", { base: "_worm10" })

// pieces: 2-frame float wobble
anim("piece_P", { outline: "e", w: 7, h: 7, frames: 2, fps: 4 }, (c) => { c.circ(3, 3, 2, "y"); c.px(2, 2, "Y"); c.px(c.frame ? 3 : 4, 5, "v") })
anim("piece_A", { outline: "e", w: 8, h: 7, frames: 2, fps: 4 }, (c) => { const k = c.frame; c.poly([0, 6 - k, 2, 2, 5, 0 + k, 7, 1, 6, 4, 3, 6], "g"); c.line(1, 5, 5, 2, "h"); c.px(4, 1 + k, "G") })
anim("piece_K", { outline: "e", w: 8, h: 7, frames: 2, fps: 4 }, (c) => { const k = c.frame; c.ring(3, 3, 2, "b"); c.px(5, 3, "_"); c.px(5, 2 + k, "b"); c.poly([5, 1, 7, 0 + k, 7, 3], "b"); c.px(1, 3, "B") })
anim("piece_W", { outline: "e", w: 9, h: 6, frames: 2, fps: 4 }, (c) => { const k = c.frame; c.line(0, 1 + k, 3, 0, "m", 2); c.line(3, 0, 5, 3, "m", 2); c.line(5, 3, 8, 4 - k, "m", 2); c.px(1, 1, "M"); c.px(4, 2, "u") })

// mixed icons: a capsule split diagonally, each half its food colour with a mini silhouette
const FOODC = { P: ["y", "Y", "v"], A: ["g", "G", "h"], K: ["b", "B", "N"], W: ["m", "M", "u"] }
const MINI = {
  P: (c, x, y, col) => { c.circ(x, y, 1, col[0]); c.px(x - 1, y - 1, col[1]) },
  A: (c, x, y, col) => { c.poly([x - 2, y + 2, x - 1, y - 1, x + 2, y - 2, x + 1, y + 1], col[0]); c.px(x, y, col[2]) },
  K: (c, x, y, col) => { c.ring(x, y, 1, col[0]); c.px(x + 1, y, "_"); c.px(x + 2, y - 1, col[0]) },
  W: (c, x, y, col) => { c.line(x - 2, y + 1, x - 1, y - 1, col[0]); c.line(x - 1, y - 1, x + 1, y + 1, col[0]); c.line(x + 1, y + 1, x + 2, y - 1, col[0]) },
}
for (const [a, b] of [["P", "A"], ["P", "K"], ["P", "W"], ["A", "K"], ["A", "W"], ["K", "W"]]) {
  sprite(`icon_${a}${b}`, { w: 10, h: 10, outline: "e" }, (c) => {
    c.poly([0, 0, 10, 0, 0, 10], FOODC[a][2]); c.poly([10, 0, 10, 10, 0, 10], FOODC[b][2])
    c.poly([0, 0, 8, 0, 0, 8], FOODC[a][0]); c.poly([10, 2, 10, 10, 2, 10], FOODC[b][0])
    c.line(0, 9, 9, 0, "e")
    MINI[a](c, 3, 3, FOODC[a]); MINI[b](c, 7, 7, FOODC[b])
  })
}

// ================================================================ UI
sprite("heart_full", `
.kk...kk.
kwrkkkrrk
krrrrrrrk
krrrrrrrk
.krrrrrk.
..krrrk..
...krk...
....k....`)
sprite("heart_empty", { base: "heart_full", swap: { r: "k", w: "k", k: "z" } })
sprite("heart_crack", { base: "heart_full", swap: { r: "R" } }, (c) => { c.px(4, 1, "k"); c.px(4, 2, "k"); c.px(3, 3, "k"); c.px(4, 4, "k"); c.px(4, 5, "k") })

sprite("bubble", { w: 16, h: 16 }, (c) => { c.circ(7, 7, 7, "e"); c.circ(7, 7, 6, "W"); c.px(3, 3, "w"); c.px(4, 2, "w") })
sprite("bubble_joined", { w: 30, h: 16 }, (c) => { c.circ(7, 7, 7, "e"); c.circ(22, 7, 7, "e"); c.rect(7, 0, 16, 15, "e"); c.circ(7, 7, 6, "W"); c.circ(22, 7, 6, "W"); c.rect(7, 1, 16, 13, "W"); c.px(3, 3, "w"); c.hline(13, 7, 4, "e"); c.vline(14, 6, 3, "e"); c.px(15, 6, "e"); c.px(15, 8, "e"); c.hline(13, 7, 4, "e"); c.vline(14, 5, 5, "e") })
sprite("badge_happy", { base: "bubble" }, (c) => { c.px(5, 6, "e"); c.px(9, 6, "e"); c.px(4, 8, "P"); c.px(10, 8, "P"); c.hline(5, 9, 5, "e"); c.px(5, 8, "e"); c.px(9, 8, "e") })
sprite("badge_happy_small", { w: 8, h: 8 }, (c) => { c.circ(3, 3, 3, "e"); c.circ(3, 3, 2, "y"); c.px(2, 2, "e"); c.px(4, 2, "e"); c.hline(2, 4, 3, "v"); c.px(2, 4, "e"); c.px(4, 4, "e"); c.px(3, 5, "e"); c.px(1, 1, "Y") })
sprite("digest_cross", { w: 16, h: 16 }, (c) => { c.line(2, 2, 12, 12, "r", 2); c.line(12, 2, 2, 12, "r", 2); c.line(2, 2, 12, 12, "R"); c.line(12, 2, 2, 12, "R") })
sprite("slash", `
..e
..e
.e.
.e.
e..
e..`)
anim("sweat", { w: 4, h: 6, frames: 2, fps: 5 }, (c) => { const k = c.frame; c.px(1, 0 + k, "a"); c.vline(0, 1 + k, 3, "a"); c.vline(1, 1 + k, 4 - k, "a"); c.vline(2, 1 + k, 3, "a"); c.px(1, 5, k ? "a" : "."); c.px(0, 2 + k, "w") })

// slots 33x33: empty (dashed), filled plate, hover, wasted (red dashed)
const SL = 33
sprite("slot_empty", { w: SL, h: SL }, (c) => { c.rect(0, 0, SL, SL, "S"); c.rect(1, 1, SL - 2, SL - 2, "D"); for (let i = 3; i < SL - 4; i += 5) { c.hline(i, 3, 3, "s"); c.hline(i, SL - 4, 3, "s"); c.vline(3, i, 3, "s"); c.vline(SL - 4, i, 3, "s") } })
sprite("slot_filled", { w: SL, h: SL }, (c) => { c.rect(0, 0, SL, SL, "S"); c.rect(1, 1, SL - 2, SL - 2, "d"); c.rect(2, 2, SL - 4, SL - 4, "t"); c.hline(2, 2, SL - 4, "T"); c.vline(2, 2, SL - 4, "T") })
sprite("slot_hover", { base: "slot_filled", swap: { t: "q", T: "Z" } })
sprite("slot_wasted", { base: "slot_empty", swap: { s: "r", D: "d" } })
// tray card 40x40: normal, pressed, empty
const CD = 40
sprite("card", { w: CD, h: CD }, (c) => { c.rect(0, 0, CD, CD, "X"); c.rect(1, 1, CD - 2, CD - 2, "F"); c.rect(2, 2, CD - 4, CD - 4, "Z"); c.hline(2, CD - 3, CD - 4, "z"); c.vline(CD - 3, 2, CD - 4, "z"); c.hline(2, 2, CD - 4, "w"); c.vline(2, 2, CD - 4, "w") })
sprite("card_pressed", { base: "card", swap: { Z: "z", w: "z", z: "s" } })
sprite("card_empty", { w: CD, h: CD }, (c) => { c.rect(0, 0, CD, CD, "X"); c.rect(1, 1, CD - 2, CD - 2, "x"); c.rect(2, 2, CD - 4, CD - 4, "X") })
// feed button 110x34: normal / pressed / disabled (text is drawn by the game)
const BW = 110, BH = 34
sprite("btn_feed", { w: BW, h: BH }, (c) => { c.rect(0, 0, BW, BH, "J"); c.rect(1, 1, BW - 2, BH - 2, "I"); c.rect(2, 2, BW - 4, BH - 6, "i"); c.hline(2, 2, BW - 4, "G"); c.rect(2, BH - 4, BW - 4, 2, "I"); c.px(1, 1, "J"); c.px(BW - 2, 1, "J"); c.px(1, BH - 2, "J"); c.px(BW - 2, BH - 2, "J") })
sprite("btn_feed_pressed", { base: "btn_feed", swap: { i: "I", G: "i" } })
sprite("btn_feed_off", { base: "btn_feed", swap: { i: "s", I: "S", J: "S", G: "z" } })
// icon buttons 15x15 (secondary: half the size of the main controls)
const IB = 15
sprite("btn_base", { w: IB, h: IB }, (c) => { c.rect(1, 0, IB - 2, IB, "e"); c.rect(0, 1, IB, IB - 2, "e"); c.rect(1, 1, IB - 2, IB - 2, "s"); c.rect(2, 2, IB - 4, IB - 4, "z"); c.hline(2, 2, IB - 4, "Z"); c.hline(2, IB - 3, IB - 4, "s") })
sprite("btn_undo", { base: "btn_base" }, (c) => { c.hline(5, 6, 5, "e"); c.px(4, 6, "e"); c.px(5, 5, "e"); c.px(5, 7, "e"); c.px(10, 7, "e"); c.px(10, 8, "e"); c.hline(7, 9, 3, "e") })
sprite("btn_hint", { base: "btn_base" }, (c) => { c.circ(7, 6, 2, "y"); c.ring(7, 6, 3, "e"); c.rect(6, 9, 3, 1, "e"); c.rect(6, 11, 3, 1, "e"); c.px(6, 5, "Y") })
sprite("btn_restart", { base: "btn_base" }, (c) => { c.ring(7, 7, 3, "e"); c.rect(7, 3, 4, 3, "_"); c.rect(7, 3, 4, 3, "z"); c.px(8, 4, "e"); c.px(9, 5, "e"); c.px(9, 3, "e") })
sprite("btn_menu", { base: "btn_base" }, (c) => { c.hline(4, 4, 7, "e"); c.hline(4, 7, 7, "e"); c.hline(4, 10, 7, "e") })
// stars 12x12
sprite("star_full", { w: 10, h: 10, outline: "e" }, (c) => c.poly([5, 0, 6, 3, 9, 3, 7, 5, 8, 9, 5, 7, 2, 9, 3, 5, 1, 3, 4, 3], "y"), (c) => { c.px(4, 3, "Y") })
sprite("star_empty", { base: "star_full", swap: { y: "S", Y: "s" } })
sprite("star_struck", { base: "star_empty" }, (c) => c.line(1, 10, 10, 1, "r"))
// 9-slice panels (24x24: 8px corners)
sprite("panel_wood", { w: 24, h: 24 }, (c) => { c.rect(0, 0, 24, 24, "X"); c.rect(1, 1, 22, 22, "x"); c.rect(2, 2, 20, 20, "f"); for (let y = 2; y < 22; y += 5) c.hline(2, y, 20, "x"); c.hline(2, 2, 20, "F") })
sprite("panel_stone", { w: 24, h: 24 }, (c) => { c.rect(0, 0, 24, 24, "e"); c.rect(1, 1, 22, 22, "S"); c.rect(2, 2, 20, 20, "s"); c.hline(2, 2, 20, "z"); c.rect(2, 20, 20, 2, "S") })
sprite("panel_card", { w: 24, h: 24 }, (c) => { c.rect(0, 0, 24, 24, "e"); c.rect(1, 1, 22, 22, "x"); c.rect(2, 2, 20, 20, "W"); c.hline(2, 21, 20, "Z"); c.vline(21, 2, 20, "Z") })
sprite("panel_red", { base: "panel_stone", swap: { s: "R", S: "r", z: "r" } })
sprite("ribbon", { w: 24, h: 24 }, (c) => { c.rect(0, 0, 24, 24, "e"); c.rect(1, 1, 22, 22, "J"); c.rect(2, 2, 20, 20, "i"); c.hline(2, 2, 20, "G") })
sprite("ribbon_strong", { base: "ribbon", swap: { i: "y", G: "Y", J: "v" } })

// ================================================================ ENVIRONMENT: 16x16 tileset + set dressing
// The game composes the pond from tiles (water, stone rim edges/corners, bank fill) and places props from a list.
const TS = 16
sprite("_stone_a", { w: 9, h: 7, outline: "S" }, (c) => { c.ellipse(4, 3, 4, 3, "s"); c.px(2, 1, "z"); c.px(3, 1, "z"); c.hline(2, 5, 4, "S") })
sprite("_stone_b", { w: 7, h: 5, outline: "S" }, (c) => { c.ellipse(3, 2, 3, 2, "z"); c.px(2, 1, "Z"); c.hline(2, 4, 3, "s") })
sprite("_stone_c", { w: 11, h: 7, outline: "S" }, (c) => { c.ellipse(5, 3, 5, 3, "s"); c.px(3, 1, "z"); c.hline(3, 5, 4, "S"); c.px(8, 4, "S") })
sprite("_pebble", { w: 3, h: 2 }, `zs
sS`)
group("stones", ["_stone_a", "_stone_b", "_stone_c", "_stone_a"])

// water tiles: flat teal, a couple with a still highlight; the caustic anim overlays them in-game
sprite("tile_water_a", { w: TS, h: TS }, rect(0, 0, TS, TS, "t"))
sprite("tile_water_b", { w: TS, h: TS }, rect(0, 0, TS, TS, "t"), hline(3, 5, 7, "T"), px(11, 6, "T"))
sprite("tile_water_c", { w: TS, h: TS }, rect(0, 0, TS, TS, "t"), hline(6, 11, 5, "T"), hline(1, 2, 3, "T"))
sprite("tile_shallow", { w: TS, h: TS }, rect(0, 0, TS, TS, "T"), dither(0, 0, TS, TS, "T", "t", 0.3))
// bank fill: packed pebbles on sand
sprite("tile_bank", { w: TS, h: TS }, rect(0, 0, TS, TS, "s"), scatter("stones", -2, -2, TS + 4, TS + 4, 7, { seed: 2, rflip: "xy" }), scatter("_pebble", 0, 0, TS, TS, 4, { seed: 9 }))
// rim edges: stones on the outer side, shallow water inside. N edge = bank above, water below.
const rim = (name, items) => sprite(name, { w: TS, h: TS }, rect(0, 0, TS, TS, "T"), ...items)
rim("tile_rim_n", [rect(0, 0, TS, 7, "s"), scatter("stones", -2, -3, TS + 4, 9, 5, { seed: 3, rflip: "x" }), dither(0, 7, TS, 2, "T", "s", 0.5)])
rim("tile_rim_s", [rect(0, 9, TS, 7, "s"), scatter("stones", -2, 10, TS + 4, 9, 5, { seed: 4, rflip: "x" }), dither(0, 7, TS, 2, "T", "s", 0.5)])
rim("tile_rim_w", [rect(0, 0, 7, TS, "s"), scatter("stones", -3, -2, 9, TS + 4, 5, { seed: 5, rflip: "y" }), dither(7, 0, 2, TS, "T", "s", 0.5)])
rim("tile_rim_e", [rect(9, 0, 7, TS, "s"), scatter("stones", 10, -2, 9, TS + 4, 5, { seed: 6, rflip: "y" }), dither(7, 0, 2, TS, "T", "s", 0.5)])
rim("tile_rim_nw", [rect(0, 0, TS, 7, "s"), rect(0, 0, 7, TS, "s"), scatter("stones", -2, -3, TS + 4, 9, 4, { seed: 7 }), scatter("stones", -3, 4, 9, TS, 4, { seed: 8 })])
rim("tile_rim_ne", [rect(0, 0, TS, 7, "s"), rect(9, 0, 7, TS, "s"), scatter("stones", -2, -3, TS + 4, 9, 4, { seed: 7 }), scatter("stones", 10, 4, 9, TS, 4, { seed: 8 })])
rim("tile_rim_sw", [rect(0, 9, TS, 7, "s"), rect(0, 0, 7, TS, "s"), scatter("stones", -2, 10, TS + 4, 9, 4, { seed: 7 }), scatter("stones", -3, -2, 9, TS, 4, { seed: 8 })])
rim("tile_rim_se", [rect(0, 9, TS, 7, "s"), rect(9, 0, 7, TS, "s"), scatter("stones", -2, 10, TS + 4, 9, 4, { seed: 7 }), scatter("stones", 10, -2, 9, TS, 4, { seed: 8 })])

// set dressing props (placed by the game)
sprite("prop_lily_a", { w: 11, h: 11, outline: "l" }, (c) => { c.circ(5, 5, 5, "L"); c.poly([5, 5, 11, 2, 11, 8], "_"); c.circ(5, 5, 3, "j"); c.poly([5, 5, 9, 2, 9, 8], "_"); c.circ(5, 5, 5, "."); c.px(3, 3, "j") })
sprite("prop_lily_b", { base: "prop_lily_a", flip: "x" })
sprite("prop_lily_flower", { base: "prop_lily_a" }, (c) => { c.px(4, 5, "P"); c.px(5, 4, "P"); c.px(6, 5, "P"); c.px(5, 6, "P"); c.px(5, 5, "W") })
sprite("prop_lily_big", { w: 15, h: 15, outline: "l" }, (c) => { c.circ(7, 7, 7, "L"); c.poly([7, 7, 15, 3, 15, 11], "_"); c.circ(7, 7, 4, "j"); c.poly([7, 7, 12, 3, 12, 11], "_"); c.px(4, 4, "j"); c.px(5, 3, "j") })
sprite("prop_reed", { w: 9, h: 14 }, (c) => { c.line(4, 13, 2, 1, "L"); c.line(4, 13, 6, 2, "l"); c.line(4, 13, 4, 0, "j"); c.px(2, 0, "L"); c.px(6, 1, "l") })
sprite("prop_grass", { w: 7, h: 6 }, (c) => { c.line(3, 5, 0, 1, "L"); c.line(3, 5, 3, 0, "j"); c.line(3, 5, 6, 0, "L") })
sprite("prop_rock", { w: 14, h: 10, outline: "S" }, (c) => { c.ellipse(6, 5, 6, 4, "s"); c.ellipse(5, 3, 4, 2, "z"); c.hline(3, 8, 7, "S"); c.px(4, 2, "Z") })
sprite("prop_planter", { w: 48, h: 30 }, (c) => { c.ellipse(24, 16, 23, 13, "S"); c.ellipse(24, 14, 21, 11, "s"); c.ellipse(24, 12, 17, 8, "l"); c.hline(10, 9, 28, "z"); c.scatter("prop_reed", 8, 0, 32, 14, 7, { seed: 3 }); c.scatter("prop_grass", 6, 6, 36, 10, 5, { seed: 4 }) })
sprite("prop_planter_b", { base: "prop_planter", flip: "x" })

// ---- tier variants: water tint swaps, mossy / wooden rims, extra props
const WATER = { _c: { t: "1", T: "2" }, _l: { t: "3", T: "4" }, _t: { t: "5", T: "6" } }
const RIM = { _c: { Z: "j", z: "s" }, _l: { Z: "j" }, _t: { s: "x", S: "X", z: "f", Z: "F" } }
for (const sfx of ["_c", "_l", "_t"]) {
  for (const n of ["tile_water_a", "tile_water_b", "tile_water_c", "tile_shallow"]) sprite(n + sfx, { base: n, swap: WATER[sfx] })
  for (const n of ["tile_rim_n", "tile_rim_s", "tile_rim_w", "tile_rim_e", "tile_rim_nw", "tile_rim_ne", "tile_rim_sw", "tile_rim_se"]) sprite(n + sfx, { base: n, swap: { ...WATER[sfx], ...RIM[sfx] } })
  sprite("tile_bank" + sfx, { base: "tile_bank", swap: RIM[sfx] })
}
sprite("prop_moss_rock", { base: "prop_rock", swap: { z: "j", Z: "j" } })
// bamboo spout on a stone, water trickling into the pond
sprite("prop_spout", { w: 22, h: 18 }, (c) => { c.ellipse(11, 13, 10, 4, "S"); c.ellipse(11, 12, 9, 3, "s"); c.px(6, 10, "z"); c.rect(3, 4, 12, 4, "l"); c.rect(3, 4, 12, 1, "j"); c.rect(3, 7, 12, 1, "L"); c.vline(7, 4, 4, "l"); c.vline(11, 4, 4, "l"); c.rect(14, 3, 4, 6, "l"); c.rect(14, 3, 4, 1, "j"); c.rect(2, 8, 2, 6, "l"); c.px(16, 9, "q"); c.px(16, 10, "q"); c.px(17, 11, "Z"); c.px(16, 12, "q") })
// stone lantern seen from above: square cap with a warm glow
sprite("prop_lantern", { w: 14, h: 14 }, (c) => { c.circ(7, 7, 7, "7"); c.circ(7, 7, 6, "8"); c.rect(3, 3, 8, 8, "S"); c.rect(4, 4, 6, 6, "s"); c.rect(5, 5, 4, 4, "7"); c.rect(6, 6, 2, 2, "8"); c.px(3, 3, "z"); c.px(10, 3, "z"); c.px(3, 10, "z"); c.px(10, 10, "z") })

anim("caustic", { w: 48, h: 48, frames: 4, fps: 4 }, (c) => {
  const k = c.frame
  for (let i = 0; i < 6; i++) {
    const y = (i * 8 + k * 2) % 48, x = (i * 13 + k * 3) % 48
    c.line(x, y, x + 6, y + 2, "q"); c.line(x + 8, y + 5, x + 11, y + 4, "q"); c.px((x + 20) % 48, (y + 9) % 48, "T")
  }
})
anim("ambient_bubble", { w: 4, h: 4, frames: 3, fps: 4 }, (c) => { if (c.frame < 2) { c.ring(1, 1 + (1 - c.frame), 1, "q"); c.px(0, 0 + (1 - c.frame), "Z") } else { c.px(0, 0, "q"); c.px(2, 0, "q"); c.px(1, 1, "Z") } })

// a preview of the composed pond, so the tiles can be judged together (the game composes its own)
scene("pond_preview", { w: 272, h: 368 },
  tilemap(
    ["1" + "n".repeat(15) + "2", ...Array(21).fill("w" + "a".repeat(15) + "e"), "3" + "s".repeat(15) + "4"].join(String.fromCharCode(10)),
    { map: { n: "tile_rim_n", s: "tile_rim_s", w: "tile_rim_w", e: "tile_rim_e", 1: "tile_rim_nw", 2: "tile_rim_ne", 3: "tile_rim_sw", 4: "tile_rim_se", a: "tile_water_*" }, size: TS }),
  stamp("prop_planter", 4, 2), stamp("prop_planter_b", 220, 6), stamp("prop_lily_big", 40, 300), stamp("prop_lily_a", 58, 312), stamp("prop_lily_flower", 230, 290), stamp("prop_rock", 200, 330))

sheet("tiles", ["tile_*"], { pad: 0 })
sheet("props", ["prop_*"], { pad: 1 })
sheet("fish", ["koi_*", "goldfish_*", "catfish_*"], { pad: 1 })
sheet("food", ["icon_*", "piece_*"], { pad: 1 })
sheet("ui", ["heart_*", "bubble*", "badge_*", "digest_cross", "slash", "sweat", "slot_*", "card*", "btn_*", "star_*", "panel_*", "ribbon*", "caustic", "ambient_bubble"], { pad: 1 })
