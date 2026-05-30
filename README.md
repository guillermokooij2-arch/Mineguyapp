# Mine Tycoon

A browser-based mining tycoon game built with plain HTML, CSS, and vanilla JavaScript canvas. No build step and no dependencies are required: open `index.html` in a modern browser.

The current product direction is an immersive painterly mining adventure/tycoon. Prefer rugged game-art assets, icon states, and environmental panels over standard web UI. Use AI image generation for buttons, icons, panel art, ore sprites, and interactive UI states when it improves immersion.

The tracked equipment, forge-item, trader, mission, and dungeon rollout order is
in `EQUIPMENT_DUNGEON_ROADMAP.md`.

---

## Story Direction

The surface premise is a rugged dwarf mining fantasy, but the deeper truth is that the player is inside a constructed reality. A superintelligent system has taken over screen-based work and trapped humans in simulated manual-labor loops because physical bodies and attention still have value. The dwarf identity, mine economy, tavern, workbench, and daily grind are all part of a makeshift containment fantasy.

The player should not learn this immediately. Early story clues should feel like atmospheric weirdness, not a reveal:
- The mine sometimes uses slightly too-formal language for a fantasy world.
- The Deep Lift should start with strange hums, worn labels, reflections, and repeated patterns. Direct system language should wait until much later dungeons.
- Some walls can briefly look smoother, brighter, or more manufactured than stone.
- Bosses begin as fantasy creatures but may expose something pale, clean, or artificial under the surface.
- Item descriptions can occasionally stutter or correct themselves, but should not explain the truth too early.

The Deep Lift is the mechanical foundation for the later cracks in the illusion. Early dungeons should mostly read as fantasy dungeon content; the deeper/later dungeons can gradually reveal that the world is stranger than it first looked.

---

## Current State

### Core Gameplay
- Full-screen canvas cave mining scene.
- Click-to-swing pickaxe cursor.
- World cursor remains the pickaxe while mining; UI surfaces switch to custom hand cursors.
- Larger pickaxe cursor size is currently `104px` wide in `render.js` and matching hit math in `game.js`.
- Rock mining uses Stone, Copper, Iron, and Gold.
- Weak-point chain system rewards accurate crit hits.
- Missing weak points or clicking empty space cancels chains.
- Ore drops arc outward and magnet into the backpack.
- Backpack button pulses when ore lands in it.
- Backpack button scales up as storage fills.

### Ore Nodes
- Ore nodes use generated image sprites from `images/ore-nodes/`.
- Each ore has 6 sprite states:
  - `0` intact
  - `1-5` progressively broken
- Current ore HP:
  - Stone: `14`
  - Copper: `21`
  - Iron: `30`
  - Gold: `42`
- Break feedback includes dust, chunks, stronger final destruction burst, and idle glow.
- Break-stage UI now empties out instead of filling up, so it reads as destruction rather than healing.

### Inventory / Backpack
- Inventory is now layered instead of using one baked grid image:
  - Layer 1: `images/inventory/backpack-frame.png`
  - Layer 2: `images/inventory/inventory-slot.png`
  - Layer 3: rendered ore/item content from `renderInventory()`
- The old `images/inventory/backpack-grid.png` is no longer the active frame.
- Inventory grid is a 5x4 layout.
- Slots are square and use the separate slot tile asset so alignment is controlled in CSS.
- Grid placement is controlled in `css/backpack.css`:
  - `.inv-ui-frame`
  - `.inventory-grid`
  - `.inventory-slot`
- Current grid tuning:
  - frame aspect ratio: `693 / 720`
  - grid left/top: `20.5% / 22%`
  - grid width: `59.5%`
- Inventory uses generated ore item icons from `images/ore-icons/`.

### Travel Map
- Map uses `images/mineshaftmap-expanded.png`.
- Map panel expands to a full-screen travel surface using `.map-mode`.
- The map preserves the generated image's 3:2 aspect ratio so the art is not cropped.
- The backpack back button is positioned inside the map corner during map mode.
- The world map opens through `openWorldMap()` and runs above normal panels at `z-index:260`.
- Location data is in `MAP_LOCATIONS` in `js/data/ui-data.js`.
- Map nodes use generated icons from `images/map-icons/`.
- Non-Tavern / non-SYS map nodes use square generated frames:
  - `frame-square.png`
  - `frame-square-active.png`
  - `frame-square-locked.png`
- Current locations:
  - Mineshaft
  - Market
  - Workbench
  - Trader
  - Tavern
  - SYS Terminal
  - Deep Lift level 5 dungeon test
  - Crystal Vein locked
- Tavern appears as a world node and opens the full-screen underground saloon zone.
- SYS Terminal appears as a world node and routes through `openTerminalScreen()` to the terminal upgrade screen.

### Marketplace
- Marketplace is now an immersive full-screen cave market scene.
- Background art:
  - `images/market/market-stall.png`
- Item box art:
  - `images/market/market-box-ore.png`
  - `images/market/market-box-forged.png`
- Layout is split into two physical shelves:
  - left: ore trading, 4 columns x 2 rows for current and future ores
  - right: forged item trading, 4 columns x 3 rows
- The left shelf has `Sell All Ores`; the right shelf has `Sell All Forged Items`.
- Ore sell icons:
  - `images/ore-icons/stone.png`
  - `images/ore-icons/copper.png`
  - `images/ore-icons/iron.png`
  - `images/ore-icons/gold.png`
- Sell button art:
  - market sell buttons are CSS-carved wood so they do not stretch plaque art
- Price and amount are separated:
  - ore image
  - item name
  - highlighted gold price
  - subtler bag amount
  - wooden sell button

### UI Buttons
- Map, SYS terminal, and back buttons use generated normal/hover image states from `images/ui-buttons/`.
- Custom UI hand cursors live in `images/cursors/`:
  - `hand-open.png` for open UI areas.
  - `hand-point.png` for hover over clickable UI controls.
- Current button assets:
  - `map-normal.png`
  - `map-hover.png`
  - `terminal-normal.png`
  - `terminal-hover.png`
  - `back-normal.png`
  - `back-hover.png`
- Buttons swap state on hover/focus with CSS.
- Buttons scale on hover and click.
- The browser cursor is suppressed across buttons and panels so the canvas cursor always owns mouse feedback.
- UI buttons use slightly larger hitboxes than their visible art by keeping the button box larger and insetting the icon image.
- Back/close buttons should use arrow art, not `X`.
- Visible headings like `Backpack / Map` and `Trade / Marketplace` are intentionally hidden so the UI relies more on icon/art language.

### Command Bar
- Bottom command bar uses generated RPG frame assets:
  - `images/ui/command-bar-frame.png`
  - `images/ui/command-identity-panel.png`
  - `images/ui/command-buffs-frame.png`
- Main miner and portrait UI use redesigned generated sprites:
  - `images/miner-main-v2.png`
  - `images/miner-portrait-bust.png`
- The backpack icon sits directly inside the base bar without a frame. Miner portrait, level, and stats open share the identity panel interaction. Command bar text remains live HTML for accessibility and dynamic XP/buff timers.

### SYS Terminal
- SYS screen is styled as a rugged mining Pip-Boy style terminal.
- Green monochrome look, scanlines, flicker, dark industrial casing.
- Upgrade rows are simplified for terminal readability.
- SYS Terminal is a backpack/map sub-screen, not a separate detail panel.
- It opens through `.terminal-mode` at the same high interaction layer as the world map.
- The back button should return to the map when opened from the map node, and to inventory when opened from backpack inventory.

### Trader
- Trader uses a centered mysterious merchant scene with layered UI:
  - Layer 1: `images/trader/trader-cart-bg.png`
  - Layer 2: `images/market/market-box-forged.png` upgrade item cards
  - Layer 3: existing generated upgrade icons and wood-plaque buy buttons
  - Layer 4: clickable trader character and speech plaque
- Trader character uses the 4 matching generated states in `TRADER_STATES` in `js/data/ui-data.js`:
  - `images/trader/trader-idle.png`
  - `images/trader/trader-interested.png`
  - `images/trader/trader-persuasive.png`
  - `images/trader/trader-dangerous.png`
- Hovering or clicking the trader advances dialogue. While the panel is open, the trader auto-cycles every 15 seconds.
- Pickaxe Tier has generated progression art:
  - `images/trader/pickaxe-tier-0.png`
  - `images/trader/pickaxe-tier-1.png`
  - `images/trader/pickaxe-tier-2.png`
  - `images/trader/pickaxe-tier-3.png`
  - `images/trader/pickaxe-tier-4.png`
  - `images/trader/pickaxe-tier-5.png`
  - `images/trader/pickaxe-tier-6.png`
- Other trader upgrade art:
  - `images/trader/upgrade-rare-finder.png`
  - `images/trader/upgrade-stack-compression.png`
  - `images/trader/upgrade-forge-skill.png`
- Dialogue plaque art:
  - `images/trader/trader-speech-plaque.png`
- The speech plaque keeps its natural 437:180 aspect ratio.
- Upgrade icons are clickable, show tooltips, upgrade items use `images/market/market-box-forged.png`, and buy actions use `images/ui/wood-plaque.png`.

### Workbench
- Workbench uses `images/workbench/forge-workstation-bg.png` as the scene background.
- The recipe card uses the anvil art as the forge button:
  - `anvil-normal.png`
  - `anvil-hover.png`
  - `anvil-states-source.png`
- Pressing the anvil plays `images/workbench/forginganimated.webm`, with MP4/older WebM fallbacks.
- `images/workbench/hammer.png` overlays the video during forging, and results reveal from the video `ended` event.
- Forge result, backpack, and market views use generated item icons from `images/workbench/items/`.
- Forge tier headers use generated tier icons from `images/workbench/tiers/`.
- Forged backpack slots show icon-only items; hover the slot to inspect name, rarity, passive, and value.
- Recipe text surfaces use generated market box/plaque art through CSS border-image so live HTML text remains accessible.

### Tavern
- Tavern is a full-screen immersive zone opened from the Tavern map node.
- Background art:
  - `images/tavern/tavern-background.png`
  - `images/tavern/tavern-background-v2.png`
  - `images/tavern/approach/bar-approach.png`
  - `images/tavern/approach/missions-approach.png`
  - `images/tavern/approach/slots-approach.png`
  - `images/tavern/approach/tables-approach.png`
  - `images/tavern/slots/slot-console-foreground.png`
  - `images/tavern/slots/skull-symbol.png`
  - `images/tavern/slots/slot-lever-normal.png`
  - `images/tavern/slots/slot-lever-hover.png`
  - `images/tavern/slots/slot-lever-pulled.png`
- Interactive hotspots:
  - Bar station for stackable backpack consumables that become temporary buffs
    when consumed.
  - Mission board station for mining contracts.
  - Slot machine station for quick bets.
  - Gambling tables station for blackjack, dice, and Devil's Draw.
- Tavern interaction model:
  - Entrance mode shows the full tavern and four hotspots.
  - Station mode swaps in a generated approach background and themed popup content.
  - The station back button returns to the tavern entrance without closing the tavern.
  - The slot station uses a centered foreground console layer instead of the bottom content card.
  - Bar, slot, and gambling table side UI uses art-backed plaques and prop surfaces while keeping dynamic text in HTML.
- Barkeep states:
  - `images/tavern/barkeep/barkeep-idle.png`
  - `images/tavern/barkeep/barkeep-hover.png`
  - `images/tavern/barkeep/barkeep-selling.png`
  - `images/tavern/barkeep/barkeep-warning.png`
  - active no-counter v2 states:
    - `images/tavern/barkeep/barkeep-idle-v2.png`
    - `images/tavern/barkeep/barkeep-greet-v2.png`
    - `images/tavern/barkeep/barkeep-serving-v2.png`
    - `images/tavern/barkeep/barkeep-warning-v2.png`
- Tavern shop items are defined in `TAVERN_ITEMS` in `js/tavern.js`.
- Active buff modifiers currently integrate with:
  - ore yield
  - hit damage
  - swing speed
  - weak point radius
  - rare ore chance
  - gambling luck
- Mission behavior:
  - Ore and crafted delivery missions can use current inventory stock and consume it on turn-in.
  - Break, rare-find, timed, and risk missions only progress after acceptance.
  - Three available missions refresh every 10 minutes.
  - Up to three active contracts can be accepted.
- Gambling games:
  - Slots with weighted ore/special symbols using existing ore, lantern, and pickaxe assets plus a generated skull symbol.
  - Gambling Tables open dedicated Blackjack, Dice Table, and Devil's Draw popups over the tavern table scene.
  - Blackjack has chip betting, Deal, Hit, Stand, Double, Split, dealer reveal/play, and replay.
  - Dice Table has chip betting, Low/Seven/High prediction, cup shake, dice reveal, and replay.
  - Devil's Draw has paid shuffle, three-card choice, one-card reveal, and replay.
- Gambling popup assets:
  - `images/tavern/gambling/blackjack/`
  - `images/tavern/gambling/dice/`
  - `images/tavern/gambling/devils-draw/`
- Tavern/SYS map icons in `images/map-icons/` were reprocessed with extra padding and cleaner background removal while preserving map node coordinates.

### Deep Lift MVP
- Deep Lift unlocks from the travel map at level 5.
- It opens as a full-screen test dungeon mode, not a normal side panel.
- Current implementation uses placeholder emoji/symbol art so the combat loop can be tested before final sprites.
- Entering Deep Lift opens a full-screen dungeon route map first. Combat starts only after selecting an unlocked dungeon route.
- Dungeon route nodes are placeholders for future map art/icons. Hovering a route shows enemy types, clear status, lock status, and an enter action.
- Controls:
  - WASD / arrow keys move the player.
  - Click enemies to attack.
  - Click glowing weak points for critical damage.
  - A small hit dot/crosshair shows the exact attack point.
- Dungeon combat has its own crit chain counter:
  - consecutive weak-point hits increase the chain
  - misses, glancing body hits, taking damage, wave clear, or timeout reset it
  - crit chains add modest bonus damage so accuracy matters
- Attack pacing:
  - Attacks have a cooldown so spam-clicking is heavily reduced.
  - Body hits are weak glancing blows.
  - Weak-point accuracy is the main damage source.
- Current weapon behavior:
  - Combat uses the active pickaxe tier for damage scaling and cursor/weapon visuals.
  - The player sprite remains a simple circle with a placeholder pickaxe emoji.
- Current enemies:
  - Cave Spider placeholder
  - Bone Guard placeholder
  - Deep Goblin placeholder with projectiles
  - Lift Warden boss placeholder every 5 floors
- Melee chase enemies can perform short straight-line charge bursts with `CHARGE` feedback and a small trail. During the burst they commit to their lane so the player can dodge instead of being perfectly tracked.
- Current run loop:
  - Open the Deep Lift dungeon map
  - Select an unlocked dungeon
  - Start from floor 1 every run
  - Clear required waves for each floor
  - Between waves, choose Next Wave or Extract
  - Clear all 5 floors in one go to complete the dungeon
  - Floor 5 is the current dungeon boss floor
  - Completing Dungeon 1 unlocks Dungeon 2
  - Extraction shows a run-haul popup
  - Extract converts run loot into saved Deep Lift materials, coins, and XP
- Current materials:
  - Echo Shards
  - Bone Scrap
  - Glitch Ore
- The mode stores best floor, total runs, materials, and story flags in the main save.
- Deep Lift story hints should stay almost invisible in the first dungeon. The larger reveal belongs to later dungeons after the combat loop is already familiar.

---

## File Structure

```text
index.html
css/
  style.css      - ordered CSS import manifest
  base.css       - reset, canvas, start screen, HUD, shared button motion
  backpack.css   - backpack button, backpack/map panel, travel map, SYS terminal
  character.css  - character stats panel
  panels.css     - shared panel shell positioning
  market.css     - marketplace scene and sell shelves
  workbench.css  - workbench, crafting, forge result, item tooltip
  tavern.css     - tavern scene, missions, shop, gambling views
  trader.css     - trader scene and upgrade cards
  deep-lift.css  - full-screen Deep Lift dungeon test mode
  responsive.css - mobile and small-screen overrides
js/
  tavern.js     - tavern buffs, missions, barkeep states, slots, blackjack, dice, Devil's Draw
  layout.js     - ore layout, rock creation, break-stage helper, weak-point placement
  effects.js    - particles, ore pickup movement, backpack receive pulse
  render.js     - canvas drawing, ore sprites, pickaxe cursor, particles
  data/
    ores.js     - ore definitions and ore key order
    upgrades.js - terminal/trader upgrade definitions
    crafting.js - crafted item definitions, rarities, and forge recipes
    ui-data.js  - map locations, market icon paths, trader UI asset mappings
  core/
    state.js    - canvas refs, image loading, player state, helpers, save/load
  shop.js       - shared UI DOM refs and runtime panel state
  ui/
    panels.js           - panel toggles, backpack navigation, travel map routing
    economy-upgrades.js - selling actions and upgrade rendering
    workbench.js        - crafting and forge flow
    inventory-market.js - character, inventory, tooltip, and marketplace rendering
    init-ui.js          - panel event wiring and per-frame UI updates
  deep-lift.js  - Deep Lift dungeon MVP: movement, enemies, boss, loot, story hints
  game.js       - input, swing logic, hit resolution, main loop
images/
  cursors/
    hand-open.png
    hand-point.png
  inventory/
    backpack-frame.png
    inventory-slot.png
  map-icons/
    frame-square.png
    frame-square-active.png
    frame-square-locked.png
  market/
  ore-icons/
  ore-nodes/
  trader/
    pickaxe-tier-*.png
    trader-cart-bg.png
    trader-*.png
    upgrade-*.png
    trader-speech-plaque.png
  workbench/
    forge-workstation-bg.png
    anvil-*.png
  tavern/
    tavern-background.png
    tavern-background-v2.png
    approach/
    barkeep/
    items/
    missions/
    gambling/
    slots/
  ui/
  ui-buttons/
    back-*.png
    map-*.png
    terminal-*.png
```

---

## Important Architecture Notes

- Scripts are loaded as classic browser scripts, not ES modules.
- Do not add `export` / `import` unless the whole app is migrated to modules.
- Script order in `index.html` matters:
  - `data/ores.js`
  - `data/upgrades.js`
  - `data/crafting.js`
  - `core/state.js`
  - `tavern.js`
  - `effects.js`
  - `layout.js`
  - `render.js`
  - `data/ui-data.js`
  - `shop.js`
  - `ui/panels.js`
  - `deep-lift.js`
  - `ui/economy-upgrades.js`
  - `ui/workbench.js`
  - `ui/inventory-market.js`
  - `ui/init-ui.js`
  - `game.js`
- `data/ores.js`, `data/upgrades.js`, and `data/crafting.js` define balance data before runtime state initializes.
- `core/state.js` defines shared runtime globals, image loading, player state, progression helpers, inventory helpers, and save/load.
- `tavern.js` must load after `core/state.js` because it extends player state behavior and exposes buff helpers used by mining.
- `ORE_NODE_IMAGES` is loaded in `core/state.js`.
- `rockBreakStage(rock)` lives in `layout.js`.
- `MAP_LOCATIONS`, `MARKET_ORE_ICONS`, and trader UI asset mappings live in `data/ui-data.js`.
- `pulseBackpackReceive()` lives in `effects.js`.
- Cursor mode detection lives in `game.js` and rendering lives in `render.js`.
- Deep Lift is intentionally isolated in `js/deep-lift.js` and should stay separate from mining hit logic until the combat rules settle.
- The game still has no bundler, package manager, or build step.

---

## UI Interaction System

The game uses a canvas-rendered cursor layer instead of the normal browser cursor.

Cursor behavior:
- Mining/world area: pickaxe cursor with hit marker.
- Start screen, backpack, map, market, workbench, trader, character panel, and backdrop: open hand cursor.
- Tavern surfaces also use the UI hand cursor; clicking in the Tavern should never trigger mining swings.
- Clickable UI controls: pointing hand cursor.
- Pressing a UI control briefly scales the control down, then releases back up.

Layering rules:
- Background canvas is the lowest layer.
- World objects are drawn above the background inside the game canvas.
- HUD and UI buttons sit above the world.
- Panels and modal-style popups sit above HUD buttons.
- Full-screen world map and SYS Terminal sub-screens use `#backpack-map-panel.map-mode.open` / `.terminal-mode.open` at `z-index:260`.
- Detail-panel backdrops use `body.map-detail-open #ui-backdrop` at `z-index:270`.
- Detail panels opened from the map, including Market, Workbench, Trader, Tavern, and Deep Lift, use `body.map-detail-open ... .open` at `z-index:280`.
- `#cursor-canvas` is intentionally highest at `z-index:300` and has `pointer-events:none`.

Interaction rules:
- Hoverable game objects should scale around `1.05` and add a soft glow.
- UI buttons should scale around `1.05-1.1`, glow softly, and use `:active` / `.ui-pressed` for quick press feedback.
- Hitboxes should be larger than visible art. For image buttons, keep the button element larger and inset the image.
- Panel and tab changes should fade and move slightly instead of appearing instantly.
- World map entry points should call `openWorldMap()`.
- SYS Terminal entry points should call `openTerminalScreen()`.
- Map destinations that open separate screens should call `openMapDetail(panel)` so they receive the detail-panel layer and do not sit underneath the map/backdrop.

---

## Quality Control Checks

Run these checks after changing map, panel, cursor, or dungeon code:

1. Continue flow:
   - Hard refresh.
   - Press Continue.
   - Confirm the first screen after the menu is the world map, without a visible mine flash.
   - Confirm map nodes hover and click.

2. Map destination click stack:
   - From the world map, open Market, Workbench, Trader, Tavern, SYS Terminal, and Deep Lift.
   - In each destination, click at least one primary action and the back/close control.
   - Return to the world map and open a second destination without refreshing.

3. SYS Terminal:
   - Open SYS from the map node.
   - Click an affordable upgrade or confirm disabled upgrades visually read as disabled.
   - Press back and confirm it returns to the map.
   - Open SYS from backpack inventory and confirm back returns to inventory.

4. Deep Lift:
   - Open Deep Lift from the map.
   - Enter Dungeon 1, fight one wave, then extract or exit.
   - Return to the main map, re-enter Deep Lift, and confirm dungeon routes still render and can be selected.
   - Confirm the Deep Lift back/actions buttons stay clickable over the route map.

5. Cursor layers:
   - World mine should show the pickaxe cursor and mine nodes should be clickable.
   - Map/panels should show the UI hand cursor.
   - Deep Lift combat should hide the normal cursor canvas and show the dungeon dot cursor.

6. Regression console check:
   - Keep DevTools Console open while testing.
   - Any `UI action failed`, `Map travel failed`, or `Game initialization failed` message should be treated as a blocker.

---

## AI Image Generation Guidance

Use image generation when a coded UI element feels too flat or modern. This project benefits from art-driven UI.

Good candidates for image generation:
- button normal/hover states
- map/location icons
- marketplace props
- workbench/trader/character panel backgrounds
- crafted item icons
- upgrade icons
- hover/selected UI states
- ore sprites and pickups
- wooden/metal plaques instead of flat buttons

Style rules:
- semi-realistic painterly mining game art
- rugged leather, aged metal, worn wood
- warm amber cave lighting
- dark brown and black materials
- clean silhouette
- transparent or chroma-key background when used as UI assets
- no text unless explicitly required

Avoid:
- modern SaaS styling
- flat vector look
- neon colors
- white backgrounds
- over-detailed tiny objects
- visible labels baked into images

Generated assets should be copied into the project under `images/...` and referenced locally. Do not leave project-used assets only in the Codex generated image folder.

---

## Current Tuning Values

```js
// ORE HP in js/data/ores.js
stone: 14
copper: 21
iron: 30
gold: 42

// Chain crit damage in game.js
8 + powerBonus() + floor(chain.combo * 0.8)

// Pickaxe cursor width in render.js and swing math in game.js
104
```

Backpack storage scaling:
- `--bag-load` is set in `renderInventory()`.
- `.backpack-btn.receiving` is added when ore reaches the backpack.

---

## Save Data

Stored in `localStorage` under:

```text
mineTycoonPhase2Save
```

Includes:
- coins
- XP
- rare parts earned from Tavern contracts
- anvil tap count
- upgrades
- inventory
- crafted items
- tavern active buffs, available missions, active missions, and next mission refresh timestamp
- Deep Lift best floor, total runs, materials, and story flags

---

## Recommended Next Session Tasks

1. Playtest the Deep Lift MVP.
   - Confirm level 5 unlock feels early enough.
   - Tune player speed, enemy speed, projectile pressure, and weak-point size.
   - Decide whether click attacks should be melee range, ranged, or weapon-specific.

2. Decide the first real Deep Lift weapon set.
   - Starter pickaxe combat.
   - Hammer for slow stun damage.
   - Dagger or short blade for fast crit-chain play.

3. Connect Deep Lift loot to forge recipes.
   - Bone Scrap for early weapon upgrades.
   - Echo Shards for weak-point and dodge upgrades.
   - Glitch Ore for story/progression unlocks.

4. Expand Tavern buffs for dungeon runs.
   - Max HP.
   - Dodge speed.
   - Projectile resistance.
   - Boss loot chance.
   - One-time revive.

5. Visually test inventory alignment in browser.
   - If needed, tune `.inv-ui-frame` padding and `.inventory-grid` transform.

6. Continue replacing flat UI with generated assets.
   - Character panel
   - Crafting result screen
   - Remaining terminal upgrade buttons/icons

7. Tune Tavern balancing after playtesting.
   - Buff prices and durations.
   - Mission payouts and refresh cadence.
   - Gambling payout weights.

8. Improve interactive button states.
   - Add more hover/selected image pairs.
   - Add optional hover sound by setting `window.UI_HOVER_SOUND_SRC`.
   - Mirror generated plaque treatments into any remaining non-image action buttons.

9. Optimize large generated PNGs.
   - Some source sheets are kept for slicing but are not loaded by the game.
   - Consider converting large non-transparent backgrounds to WebP later.

10. Keep game logic data-driven.
   - New locations should be added to `MAP_LOCATIONS` in `js/data/ui-data.js`.
   - New ore icons should be added to `MARKET_ORE_ICONS` in `js/data/ui-data.js`.
   - New ore node sprites should follow `images/ore-nodes/{type}-{stage}.png`.
