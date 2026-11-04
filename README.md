# Feed the Fishes — prototype v2

Playable web prototype of the Notion GDD (turn-based koi-pond puzzle, 10 levels). Logical 270×480, integer scaling, nearest-neighbour.

## Play online

- Fish: https://dic1405.github.io/FTF/
- Cats spin-off: https://dic1405.github.io/FTF/cats.html

## Cats spin-off

`cats.html` loads the same engine with `window.THEME = "cats"` (see `game/themes.js`): side-view cats in a fenced yard, same rules and levels. Cats don't differ by speed; each has a **temperament** that sets how long it stands still between short walks (lazy 4–8 s, normal 2–4 s, restless 0.3–1 s). Restless cats only appear from level 6. Art: `assets/cats.px.js` → `assets/cats_out/` (3 breeds × 3 sizes × 3 idles + walk, eat, digest and the full/digest-colour variants).

## Run

```bash
npx -y serve -l 4173 .
```

Open http://localhost:4173. Controls: tap a food card to fill the first empty slot, or drag it onto a slot; tap a filled slot to clear it; Feed throws the food. Top bar: Menu, Restart (left), Undo, Hint (right). Tapping during a feed skips to the end state.

## Layout

| Path | What |
|---|---|
| `index.html`, `game/main.js` | The game (canvas, no dependencies) |
| `game/logic.js` | Pure rules module from the Build Brief (feed, wasted slots, solver, stars) |
| `game/levels.js` | Level Data v2 |
| `game/test.mjs` | `node game/test.mjs` — hint playthrough gives 3 stars and the solver reproduces par on all 10 levels |
| `assets/art.px.js` | **PXL** source for every sprite: 9 fish body sets × 10 animation tags, food icons/pieces, UI, 16×16 pond tileset, set-dressing props |
| `assets/out/` | PXL output: `fish`, `food`, `ui`, `tiles`, `props` sheets (+ TexturePacker-style JSON with frame tags) and `_preview/` |
| `assets/fx/src/` | **pixelfx** effect sources (splash, heart-pop, full-burst, poop-puff, combo-burst, sink); copy into a pixelfx checkout at `tools/pixelfx/src/fx/pond/` to re-render (`git clone https://github.com/patch-gg/pixelfx tools/pixelfx`, not committed) |
| `assets/fx/` | pixelfx sprite sheets (Aseprite JSON) used by the game; `sink_{P,A,K,W}` are the same effect with each food's palette |

## Rebuild assets

```bash
node %USERPROFILE%/.claude/skills/pxl-pixel-art/bin/pxl.js build assets/art.px.js
```

```bash
cd tools/pixelfx && node tools/render.mjs pond/splash --sheet --no-actor --out ../../assets/fx/_r
```

(then copy `_r/pond/<id>/<id>.png|json` to `assets/fx/`; `sink` is rendered 4× with `--opts '{"palette":[...]}'`).

## Art direction notes

- All fish share one orange/cream palette; the type reads from silhouette only: koi = long tapered body + small forked tail, goldfish = egg body + fan tail as long as the body, catfish = flat wide head + whiskers + slim tail. Size (1/2/3 hearts) = 32/44/56 px.
- Full fish are one palette step lighter and 2 px rounder, with content eyes.
- The pond is composed in-game from a 16×16 tileset (water variants, rim edges/corners) plus prop sprites (lilies, reeds, grass, rocks, planters); the caustic shimmer is a 48×48 4-frame tile drawn at low alpha.
- Food throw: lift (80 ms) → curved lob (420 ms: parabola + an up/down wave + lateral sway, spinning) → two decaying hops on the water → split into pieces that hop to each eater.
