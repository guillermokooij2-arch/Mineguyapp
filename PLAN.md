# Mine Tycoon — Implementation Plan

Step-by-step plan for the next round of map / trader / workbench work.
Designed so any future session can pick it up cold by reading this file plus `README.md`.

> Current correction: the trader/workbench redo now follows an existing-asset-first
> rule. Prefer existing generated sprites and source sheets before creating new
> images. Shared back buttons use `images/ui-buttons/back-normal.png` and
> `back-hover.png`; context-specific `back-map-*` / `back-trader-*` files and
> simple placeholder workbench/trader assets should not be treated as required.

---

## 0 · Anchor & Guardrails

**Style anchor (every prompt should reference these):**
- Painterly mining-tycoon art. Rugged leather, aged metal, worn wood, warm amber cave light.
- Layered images, never baked grids. Transparent PNGs. No text in art.
- No build step, no modules, no bundler. Plain HTML / CSS / vanilla JS only.

**Do NOT touch unless explicitly asked:**
- `state.js` ore HP values, save key (`mineTycoonPhase2Save`), or save schema.
- `tavern.js` mission / gambling logic.
- Script load order in `index.html`.
- `MAP_LOCATIONS` coordinates (only add new fields, do not move nodes).
- Any working asset in `images/ore-nodes/`, `images/ore-icons/`, `images/inventory/`.

**Touch surfaces this round:**
- `index.html` (trader + workbench panel).
- `css/style.css` (map-node, trader, workbench rules).
- `js/shop.js` (trader state machine, workbench render, anvil click).
- `images/map-icons/`, `images/trader/`, `images/workbench/`, `images/ui-buttons/`.

---

## Phase 0 · Asset pipeline (precondition)

Generate the 14 prompt sends from `image-prompts.md` (or the chat handoff).
Drop the resulting PNGs into the paths each prompt names. Do not start Phase 1
code until at least the **map** assets exist; do not start Phase 3 code until
at least the **anvil hero + struck + hammer + strike sparks** exist. Trader
phase can start as soon as **upgrade-medallion + spark-burst + back-trader**
exist (the card frame and small speech plaque are nice-to-have).

**Acceptance for Phase 0:** all referenced files exist on disk, open without
errors, and have transparent backgrounds (verify in any image viewer).

---

## Phase 1 · Map icons (square frames + left-side back)

Goal: map node frames match the square shape of the icons inside them, and
the back button reads as part of the map art instead of a floating UI chip.

**Files:** `css/style.css`, `index.html` (back-button image swap only),
`js/shop.js` (no logic change — `MAP_LOCATIONS` untouched).

### 1.1 — Square the map-node frame
- File: `css/style.css`
- Selector: `.map-node:not([data-loc="tavern"]):not([data-loc="sys-terminal"]) .map-node-asset`
- Change: replace the round `border-radius:50%` treatment + radial gradient with
  `background-image:url('../images/map-icons/frame-square.png')`,
  `background-size:100% 100%`, `border-radius:6px`, drop the `border` and inner
  `box-shadow` in favor of letting the PNG carry the frame.
- Selector: `.map-node:not(...) .map-node-img` — keep `width:82%`, `object-fit:contain`.
- Locked / active variants: scope by `.map-node.locked .map-node-asset` and
  `.map-node.active .map-node-asset` to use `frame-square-locked.png` and
  `frame-square-active.png` respectively.
- Done = no rounded vignette behind icons, frame edges are crisp wood, square
  icons sit flush inside the wood frame.

### 1.2 — Back button matches the map art
- File: `index.html`, line ~67 (`#backpack-back`).
- Change `back-normal.png` / `back-hover.png` to `back-map-normal.png` /
  `back-map-hover.png`.
- File: `css/style.css`, `#backpack-map-panel.map-mode #backpack-back`.
- Confirm the button still sits at `left:18px; top:18px` (already correct).
- Done = back arrow on the map looks like a wood plaque, not a generic UI chip.

### 1.3 — Acceptance
- Open the map. Every node icon sits inside a square wood frame.
- Locked nodes (Deep Lift, Crystal Vein) read as faded/cracked.
- Mineshaft (current zone) reads as green-glow active.
- Back button at top-left, matches the cave-art tone.

---

## Phase 2 · Trader (back, layout, hover-button, sparks, dialogue)

Goal: trader scene feels like an in-world shop, upgrades fit on screen
without scrolling, and the trader character behaves more naturally.

**Files:** `index.html` (trader panel), `css/style.css` (trader rules),
`js/shop.js` (`TRADER_STATES`, `setTraderState`, `advanceTraderState`,
`makeUpgradeRow`, `buyUpgrade`, init wiring).

### 2.1 — Move the back button into the scene (top-left)
- File: `index.html`, `#trader-panel` block (line ~238).
- Pull `#trader-close` out of `.shop-head` and place it as the first child of
  `.trader-scene` (or absolutely positioned inside `#trader-panel`).
- Swap its image src to `back-trader-normal.png` / `back-trader-hover.png`.
- File: `css/style.css` — add `#trader-close { position:absolute; left:18px; top:18px; z-index:6; }`
  inside the trader panel scope.
- Hide the now-empty `.shop-head` for the trader (display:none or remove from markup).
- Done = back button sits inside the cart-bg on the left, no header band above it.

### 2.2 — Reuse upgrade card frame, kill stretching
- File: `css/style.css`, `#trader-panel .trader-upgrade-row`.
- Replace the gradient + ::before/::after rope strips with
  `background:url('../images/trader/upgrade-card-frame.png') center/100% 100% no-repeat;`
- Lock the row aspect ratio (`aspect-ratio:16 / 7`) so the PNG is never stretched.
- Remove the rope-strip pseudo-elements (frame already has them).
- Done = card frames look like real wood plaques; resizing the panel scales the
  whole frame proportionally instead of stretching corners.

### 2.3 — Combine upgrade icon into a hover-button
- File: `js/shop.js`, `makeUpgradeRow`.
- Wrap the existing `.trader-upgrade-art` in a `<button class="trader-upgrade-medallion">`.
- Layer the medallion bg as two stacked imgs: `upgrade-medallion-normal.png`
  (default) + `upgrade-medallion-hover.png` (opacity:0, fades in on hover).
- Inset the existing upgrade image (`upgradeImage`) at 70% size centered.
- Reuse the existing `showItemTooltip` pattern (or a new `showUpgradeTooltip`)
  on `mousemove`/`mouseleave` to surface what the upgrade gives.
- Done = hovering an upgrade lights up the medallion + shows a tooltip
  explaining the effect; clicking still buys.

### 2.4 — More space for upgrade + no-scroll layout
- File: `css/style.css`, `#trader-list`.
- Change `grid-template-columns:repeat(2,minmax(0,1fr))` → `repeat(2,minmax(0,1fr))`
  but cap visible upgrades to 4 (the current count: pickaxeTier, rareFinder,
  stackSize, forgeSkill).
- Set `#trader-list { overflow:hidden; }` and reduce `.trader-scene` height by
  ~20% so all 4 cards fit.
- Increase `.upgrade-buy` button to `width:160px` and give the medallion column
  a bit more breathing room (`grid-template-columns:120px minmax(0,1fr)`).
- Done = no scrollbar appears on the trader panel at default desktop size.

### 2.5 — Spark animation on purchase
- File: `js/shop.js`, `buyUpgrade`.
- After a successful purchase, append a `<div class="upgrade-spark-burst">`
  to the row, set `background-image:url('../images/trader/spark-burst.png')`,
  trigger CSS `@keyframes upgradeSparkBurst` (scale 0.6 → 1.4, opacity 1 → 0,
  duration 600ms), then remove the element.
- Add a quick screen-flash (existing `floatTxt` already fires "X UP" — keep it).
- Optional: 90ms button shake via `transform:translate(±2px,0)`.
- Done = upgrade purchase feels weighty: row pulses, sparks fly, text floats up.

### 2.6 — Trader dialogue + state behavior
- File: `js/shop.js`, `TRADER_STATES`.
- Expand to 7 entries (idle, interested, persuasive, dangerous, thinking,
  amused, weary) and rewrite text to feel more natural / character-voiced:
  ```
  idle:        "Light's bad in here. So are most of the deals."
  interested:  "Oh — you've got an eye for it."
  persuasive:  "I've held onto this longer than I should've."
  dangerous:   "Some prices aren't paid in coin."
  thinking:    "Hmm... let me see what I've still got."
  amused:      "Not your first cave, is it."
  weary:       "Long shift. Make it worth my while."
  ```
- File: `js/shop.js`, init wiring (`initPanels`, line ~827).
- Replace the `click → advanceTraderState` listener with `mouseenter →
  advanceTraderState` (still keeps the click as a fallback if you want).
- Add a new `setInterval(advanceTraderState, 15000)` started when the trader
  panel opens (`toggleTrader(true)`) and cleared when it closes. Store the
  handle on a module-level `traderAutoTimer` variable so it doesn't double-fire.
- Done = trader cycles mood every 15s while open; hovering him flips state
  immediately; dialogue feels less robotic.

### 2.7 — Acceptance
- Open trader → back button on left, no header strip.
- All 4 upgrades visible, no scroll.
- Hover an upgrade medallion → it glows, tooltip explains the effect.
- Click upgrade → row sparks, coins deduct, level ticks up.
- Hover trader portrait → pose + line change instantly.
- Idle 15s → trader cycles to next mood automatically.

---

## Phase 3 · Workbench (bigger anvil, hammer-click, info redesign)

Goal: forge feels physical. Anvil dominates the scene, clicking it does
something visible/satisfying, info reads like in-world parchment.

**Files:** `index.html` (workbench panel), `css/style.css` (workbench rules),
`js/shop.js` (`renderCraftRecipes`, `attemptCraft`, new anvil-tap handler).

### 3.1 — Hero anvil swap + scale
- File: `css/style.css`, `.craft-anvil-button` and `#workbench-panel .craft-anvil-icon`.
- Bump `.craft-anvil-button { width:min(560px,52vw); aspect-ratio:2 / 1.5; }`.
- Replace the three current src refs in `renderCraftRecipes` (`anvil-normal.png`,
  `anvil-hover.png`, `anvil-forging.png`) with `anvil-hero.png` + `anvil-hero-struck.png`.
  Keep `anvil-forging.png` as the in-progress state during `attemptCraft`.
- Done = anvil takes center stage of the recipe card, dwarfs the surrounding
  info instead of being a small thumbnail.

### 3.2 — Hammer-click strike interaction
- File: `js/shop.js`, `renderCraftRecipes`.
- Add a separate `.craft-anvil-tap` overlay button on top of the anvil that
  fires on click WITHOUT triggering `attemptCraft`. Disambiguate: the tap zone
  is the anvil face only (`top:60%; height:30%; width:60%; left:20%`), the
  rest of the button still triggers the forge.
- On tap: append `<img class="anvil-strike-fx" src="images/workbench/hammer.png">`
  positioned above the anvil, animate it down with `@keyframes hammerDrop`
  (translateY -120px → 10px, rotate -32° → 12°, 320ms ease-in), then on
  animation-end swap `anvil-hero.png` → `anvil-hero-struck.png` for 180ms,
  spawn a `<div class="strike-sparks-burst">` with `strike-sparks.png` bg
  (scale 0.7 → 1.5, opacity 1 → 0, 480ms).
- Add a small reward: every 10 taps grants +1 coin OR +1 XP (low value, just
  flavor — pick one and write a one-liner: `if(++gs.anvilTaps % 10 === 0) { player.coins++; saveGame(); }`).
- Done = clicking the anvil face plays a hammer drop, anvil flashes, sparks
  fly, and over time the small reward feels like a tiny incremental.

### 3.3 — Info parchment redesign
- File: `css/style.css`, the six `#workbench-panel .craft-*-row` rules.
- Replace gradient backgrounds with the new parchment frames:
  - `.craft-card-top` → no background, just text on the panel (already has bg).
  - `.craft-cost-row` → `parchment-4x3.png` (it's tall-ish).
  - `.craft-offer-row` → `parchment-5x2.png` (wide single-line readout).
  - `.craft-tier-row` → `parchment-5x2.png`.
  - `.craft-rar-row` → `parchment-5x2.png`.
  - `.craft-chance-row` → `parchment-5x2.png`.
- Use `background:url(...) center/100% 100% no-repeat` and lock aspect-ratio
  per row so the parchment never stretches.
- Done = each info block reads as a parchment scrap pinned to the workbench.

### 3.4 — Strike button image plate
- File: `js/shop.js`, `renderCraftRecipes` — the existing
  `<button class="craft-anvil-button craft-forge-btn">`.
- Add three layered img children using `strike-btn-normal.png`,
  `strike-btn-hover.png`, `strike-btn-active.png`, mirroring the existing
  anvil three-state image swap pattern (`.craft-anvil-normal` → `.strike-btn-normal` etc.).
- Move the button OUT of the anvil image area into its own slot below the anvil
  (`grid-area: strike;` — add a new row to the recipe card grid).
- Replace the `<span>Strike Anvil</span>` text with the image (text label is
  baked into the asset).
- Done = striking the anvil reads as pressing a forge plaque, three states swap.

### 3.5 — Forge ambience overlay
- File: `css/style.css`, `#workbench-panel::before` (already exists).
- Add a second pseudo-layer or direct child img with
  `images/workbench/forge-ambience.png` at `mix-blend-mode:screen; opacity:.5;
  pointer-events:none; position:absolute; inset:0; z-index:1;`.
- Done = ambient embers and heat haze drift across the workbench backdrop.

### 3.6 — Acceptance
- Open workbench → anvil dominates center, parchment scraps hold info.
- Click the anvil face → hammer drops, anvil flashes, sparks burst.
- Tap 10 times → small reward fires (coin or XP).
- Click the strike-btn plate → existing forge sequence plays unchanged.
- No assets are stretched; resizing the panel keeps proportions clean.

---

## Phase 4 · Polish & verification

### 4.1 — Save compatibility
- Verify existing saves still load: open a save with the old layout, confirm
  no JS errors in console, confirm coins / XP / inventory survive.
- The only new field is optional `gs.anvilTaps`; default to 0 if missing.

### 4.2 — Cursor coverage
- File: `js/game.js`, cursor mode detection.
- Confirm new buttons (`.trader-upgrade-medallion`, `.craft-anvil-tap`,
  `.strike-btn-*`) get the pointing-hand cursor, not the pickaxe.
- The existing `#cursor-canvas` rule should already cover them, but smoke-test.

### 4.3 — Responsive sanity
- File: `css/style.css`, `@media (max-width:760px)`.
- Add overrides for the new selectors so mobile doesn't break:
  - Anvil scales to `width:min(360px,90vw)`.
  - Trader medallion drops to `90px`.
  - Parchment rows go single-column.

### 4.4 — README sync
- After all phases land, update `README.md`:
  - Add `frame-square*.png`, `back-map-*.png`, `back-trader-*.png`,
    `upgrade-medallion-*.png`, `spark-burst.png`, `upgrade-card-frame.png`,
    `trader-thinking.png`, `trader-amused.png`, `trader-weary.png`,
    `trader-speech-plaque-small.png`, `anvil-hero*.png`, `hammer.png`,
    `strike-sparks.png`, `parchment-*.png`, `strike-btn-*.png`,
    `forge-ambience.png` to the file structure list.
  - Update **Trader** section to mention 7 states + hover-cycle + 15s autocycle.
  - Update **Workbench** section to mention hammer-tap mini-interaction.
  - Add **Recommended Next Session Tasks** entry: replace remaining flat
    upgrade-buy buttons with the `wood-plaque.png` treatment (already done
    for sell buttons; mirror the pattern into trader/workbench).

---

## Suggested execution order in one session

If you want to do this in a single Claude session after assets are generated:

1. Phase 1.1 + 1.2 (~10 min) — quick win, validates asset pipeline.
2. Phase 2.1 + 2.2 + 2.4 (~20 min) — trader layout reset.
3. Phase 2.3 + 2.5 (~25 min) — hover-button + sparks (the showpiece).
4. Phase 2.6 (~15 min) — dialogue + cycling.
5. Phase 3.1 + 3.4 (~20 min) — anvil + strike button swap.
6. Phase 3.2 (~25 min) — hammer-click interaction (the trickiest piece).
7. Phase 3.3 + 3.5 (~15 min) — parchment + ambience.
8. Phase 4 (~15 min) — polish, README, smoke test.

Total: ~2.5 hours of code work, assuming assets are ready. Split into 2–3
prompts of 4–6 phases each if you want me to bundle without crossing scope.

# Image generation prompts — copy each block in order

> Style header is baked into every send so each one is self-contained. Paste one block per generation.

---

## Send 1 — Map: square frame, 3 states

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1024x1024. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

Three square wooden plaque frames for a fantasy mining map icon, same carved-oak plaque with iron rivets at the four corners, identical crop and lighting across all three. Empty center for an inset image (no content inside). Square aspect 1:1. Variants:
  - normal: warm amber inner-edge glow, slightly worn
  - locked: cracked, dusted, faded, hairline iron chain across one corner, no glow
  - active (current zone): faint green ember glow in inner bevel, tiny moss at one corner
Save as: images/map-icons/frame-square.png, frame-square-locked.png, frame-square-active.png
```

---

## Send 2 — Map: back-arrow plaque, 2 states

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1024x1024. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A small wooden left-pointing arrow plaque, carved oak with iron strap and a single rivet, hand-painted, fits a 1:1 button slot. Same composition for both states.
  - normal: warm cave-lit
  - hover: amber rim glow, faint ember at the rivet
Save as: images/ui-buttons/back-map-normal.png, back-map-hover.png
```

---

## Send 3 — Trader: back button, 2 states

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1024x1024. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A small ornate brass-and-leather left-pointing arrow button, mysterious merchant aesthetic, deep blue/purple lacquer with gold filigree, slight candle reflection. Square 1:1, hand-painted. Same composition for both states.
  - normal: quiet brass tone
  - hover: rim glows soft gold
Save as: images/ui-buttons/back-trader-normal.png, back-trader-hover.png
```

---

## Send 4 — Trader: upgrade card frame (solo)

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A wide horizontal upgrade card frame: aged dark-brown wood with iron corner brackets, two stacked rope strips top and bottom, recessed leather inner surface, faint torchlight from above. NO content inside — this is a frame for code to layer text and icon over later. Aspect 16:7, designed to hold its proportions and NOT be stretched. No imagery in the center.
Save as: images/trader/upgrade-card-frame.png  (1456x640, transparent)
```

---

## Send 5 — Trader: upgrade medallion, 2 states

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1024x1024. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A circular brass-rimmed wooden medallion with a deep recessed center where an icon will be inset later. Inner bevel catches warm candlelight. Square 1:1. Same composition for both states.
  - normal: warm but quiet
  - hover: brass rim glows amber, tiny embers at the rim, inner wood lit
Save as: images/trader/upgrade-medallion-normal.png, upgrade-medallion-hover.png
```

---

## Send 6 — Trader: spark burst FX (solo)

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, dark brown and black materials. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1024x1024. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A radial burst of warm orange-gold sparks and ember motes exploding outward from a central point, painterly, on transparent background. No central object — pure FX. Used as a short flash overlay when an upgrade is bought. Slight motion blur on outer sparks, brightest at center fading to fully transparent at the edges.
Save as: images/trader/spark-burst.png
```

---

## Send 7 — Trader: 3 portrait states

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

The same hooded mysterious cave-trader character used in trader-idle.png, matched lighting, pose framing, crop and clothing. Three NEW emotional states:
  - thinking: one hand on chin, slight side-glance, lantern half-lit
  - amused:   small knowing smirk, one eyebrow raised, lantern bright
  - weary:    eyes lowered, shoulders slightly slumped, lantern dim
Identical crop across all three so they swap cleanly in code.
Save as: images/trader/trader-thinking.png, trader-amused.png, trader-weary.png
```

---

## Send 8 — Trader: small speech plaque (solo)

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. No UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A small ornate wooden speech plaque, carved oak with brass corners and a leather pad inset, painterly. NO text inside. Aspect 5:2, designed for short single-line dialogue overlay later in code.
Save as: images/trader/trader-speech-plaque-small.png  (1280x512, transparent)
```

---

## Send 9 — Workbench: anvil hero + struck, 2 states

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A massive blackened iron anvil on a heavy oak block, cooling rivulets of red-orange heat across its face, single hairline crack on the horn, fine hammer-pock texture on the surface. Painterly, dramatic side-lit forge glow from below. Centered, full subject. Aspect 2:1.5. Same camera, same crop, same lighting position across BOTH states.
  - idle: cooled, ambient warm glow only
  - struck: bright yellow-white heat spike at the strike point, sharp burst of sparks fanning upward, faint heat ripple in the air above
Save as: images/workbench/anvil-hero.png, anvil-hero-struck.png  (2048x1536, transparent)
```

---

## Send 10 — Workbench: hammer (solo)

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1024x1024. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A heavy blacksmith's two-handed forging hammer, dark iron head with worn leather-bound oak handle, painterly, slightly tilted as if mid-swing. Side view, clean silhouette. The hammer head faces lower-left so it animates as a top-down strike from above.
Save as: images/workbench/hammer.png
```

---

## Send 11 — Workbench: strike sparks (solo)

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, dark brown and black materials. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1024x1024. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A burst of white-hot, yellow, and orange sparks radiating from a central strike point, with small fragments of glowing metal flying outward. Painterly, short trails on outermost sparks. Pure FX, no central object. Hotter and whiter than the trader spark burst.
Save as: images/workbench/strike-sparks.png
```

---

## Send 12 — Workbench: parchment frames, 3 sizes

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged worn paper and dark leather, clean silhouette. NO UI text, NO labels, no content inside, no watermark, no border. Background: fully transparent PNG (alpha channel). Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

Small worn parchment scraps with leather-cord binding and brass corner nails, slight burn marks at one edge, painterly. NO text or imagery inside — these are code-overlay frames. Same paper material and brass nail treatment across all three so they read as a set. Three different aspect ratios:
  - 4:3 (for stat boxes)
  - 5:2 (for single-line readouts)
  - 3:4 (for tall forge-level callouts)
Save as: images/workbench/parchment-4x3.png, parchment-5x2.png, parchment-3x4.png
```

---

## Send 13 — Workbench: strike button, 3 states

```
Semi-realistic painterly mining-tycoon game asset. Rugged hand-painted texture, warm amber cave lighting, aged metal, worn wood, dark brown and black materials, clean silhouette. Centered subject, no UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A heavy iron-banded oak button plate shaped like a forge command plaque, glowing red rivets, slight smoke residue at the bottom edge. Painterly. Aspect 5:2. Same crop and lighting position across all three states.
  - normal: warm but cooled
  - hover:  rivets pulse brighter, heat shimmer above
  - active: fully glowing orange-white, sparks at corners
Save as: images/workbench/strike-btn-normal.png, strike-btn-hover.png, strike-btn-active.png
```

---

## Send 14 — Workbench: forge ambience overlay (solo)

```
Semi-realistic painterly mining-tycoon game asset. Painterly atmospheric overlay. No UI text, no labels, no watermark, no border. Background: fully transparent PNG (alpha channel). 1920x1080. Avoid: modern SaaS look, flat vector art, neon colors, white background, tiny clutter.

A semi-transparent overlay layer of forge atmosphere: drifting embers, thin smoke wisps, and faint heat distortion lines, no light source of its own. Designed to multiply or screen-blend over the existing forge-workstation-bg in code. Edges fade to fully transparent. No central subject, no foreground objects.
Save as: images/workbench/forge-ambience.png
```
---

## Out-of-scope for this round (next round candidates)

- Character panel art pass (placeholder portrait still flat).
- Crafting result screen art pass.
- Tavern slot/blackjack/dice asset pass.
- Mobile cursor tuning.
- WebP conversion of large backgrounds.
- New ore type beyond gold.
