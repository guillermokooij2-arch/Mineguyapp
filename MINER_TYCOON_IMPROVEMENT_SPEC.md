# Miner Tycoon Improvement Spec

This file turns the requested visual, optimization, bug, buff, item, and UX ideas
into an implementation-ready order for the current plain HTML, CSS, and vanilla
JavaScript project.

## Goal

Make mining stay smooth at high power levels, clean up information-heavy screens,
fix gear and buff stacking expectations, and prepare the forge, mission, dungeon,
and item systems for a larger matching item set.

The player-facing direction is:
- Mining should feel powerful without flooding the screen or lagging low-end laptops.
- Backpack feedback should summarize large ore gains instead of showing every ore as
  a separate flying object and text label.
- Workbench, trader, and mineshaft screens should stay activity-focused, with help
  moved into an in-world miner journal.
- Forged gear, upgrades, tavern buffs, gambling rewards, and dungeon rewards should
  stack and unlock in predictable ways.

## Assumptions

- Keep the current no-build setup: `index.html`, CSS files, and plain JS files.
- Preserve the current save key and existing save compatibility unless a migration is
  explicitly documented.
- Use existing assets first, then generate replacement art where the current item
  set no longer matches.
- The closed journal button should use `images/main-menu/miner-journal-closed.png`.
- The open journal popup needs a new generated image, but all readable text should
  be real HTML over the image for accessibility and easy editing.
- "Smooth" means the mining loop should remain responsive during fast mouse movement,
  full backpack attempts, high-yield rock breaks, and frequent auto-crits.

## Risks

- The current high-level mining problem is mostly a volume problem: too many ore
  pickups, particles, float texts, sounds, and inventory updates can be triggered by
  one powerful break chain.
- The current equipment effect path stacks simple `effect` values through
  `itemBonus(stat)`, but pickaxe chain abilities are selected as a best ability in
  `getBestPickaxeChainAbility()`. That can make extra auto-crit gear feel ignored.
- The current mission board can generate missions before the player is realistically
  ready for them. Removing or canceling active missions should not be limited only to
  expired timed contracts.
- Regenerating item art without first locking slot categories and source rules risks
  creating attractive assets that do not map cleanly to gameplay.

## Implementation Order

1. Fix stacking and mission rules first so balance work is based on correct math.
2. Replace high-volume mining visuals with capped, batched, satisfying feedback.
3. Simplify backpack item rendering and add grouped ore count-up feedback.
4. Rework the workbench layout so chances and offering controls fit cleanly.
5. Add the miner journal button and popup to mineshaft, trader, and workbench.
6. Define item source pools, unlock rules, and forge/drop restrictions.
7. Regenerate item sheets after the item taxonomy is stable.
8. Rebalance forge chances and run performance/UX verification.

## Phase 1: Gear, Buff, and Mission Logic

Status:
- [x] Stack auto-crit sources from trader pickaxe tier, equipped gear abilities,
  equipped gear `autoCritChance`, tavern buffs, and luck into one final trigger
  chance.
- [x] Keep one final auto-crit ability object for gameplay and visuals so high-level
  crit chains stay controllable before the Phase 2 visual batching pass.
- [x] Add active mission cancellation so players are not forced to finish blocked or
  unwanted contracts.
- [x] Filter generated missions by player level so beginner boards only show small
  mining contracts.
- [x] Route gambling and dungeon mission item rewards through their themed item pools
  with a normal forged gear fallback.

### 1.1 Stacking Policy

Make stacking rules explicit before changing balance numbers.

Affected files:
- `js/core/state.js`
- `js/data/crafting.js`
- `js/tavern.js`
- `js/game.js`
- `js/ui/inventory-market.js`

Rules:
- Flat stats stack additively: `power`, `chainTime`, `autoCritHits`,
  `inventoryCapacity`, `maxHp`, `dungeonRegen`, `projectileCount`.
- Percent bonus stats stored as fractions stack additively first, then clamp only
  where needed: `autoCritChance`, `forgeLuck`, `junkReduction`, `rareFinder`,
  `yield`, `oreValue`, `coinMult`, `forgedSellMult`, `rareOreValue`.
- Tavern multiplier buffs keep their existing system, but each buff must state
  whether duplicate stacks are `additive`, `diminishing`, `multiplicative`, or
  `instant`.
- Pickaxe tier, forge gear effects, and gear abilities should all contribute to the
  final auto-crit chance. A max trader pickaxe should not make an epic pickaxe head
  feel useless.

Acceptance:
- Equipping `ore_hook`, `cave_lantern`, `aether_ore_magnet`, or similar gear changes
  the displayed and actual auto-crit rate.
- Gear with the same effect property stacks in the stat output and in gameplay.
- Tavern buffs and gear bonuses can both influence the same stat without one silently
  replacing the other.

### 1.2 Auto-Crit Ability Stacking

Current issue:
- `getBestPickaxeChainAbility()` chooses the strongest chain ability, then merges
  some pickaxe tier values. This is good for preventing chaos, but bad when multiple
  high-tier pieces promise auto-crit power.

Recommended replacement:
- Keep one final calculated ability object, but build it from all sources.
- Add chance from:
  - trader pickaxe tier chance
  - equipped item `effect.autoCritChance`
  - tavern `autoCritChanceBonus`
  - every equipped `ability.chance` with `kind: "chain_auto_crit"`
- Clamp final trigger chance to `0.95`.
- Let hit count scale higher than today, but separate actual hits from visuals:
  - actual auto-crit cap: target `18` to `24` after testing
  - visible auto-crit impact cap: target `6` to `9`
  - grouped label: `CRIT STORM x18` instead of 18 separate labels
- Keep `AUTO_CRIT_LIMITS.allowAutoCritsToTriggerAutoCrits` false unless a dedicated
  late-game mode is added.

Acceptance:
- Max pickaxe tier plus epic or mythic auto-crit gear triggers more often than max
  pickaxe tier alone.
- High auto-crit streaks break many rocks, but the screen does not spawn one full
  VFX package for every hit.
- The stat tooltip or journal can explain the final auto-crit chance and hit range.

### 1.3 Mission Cancel and Beginner Filtering

Current issue:
- Active missions can only be removed when expired.
- Beginner players can see missions that are too hard, too expensive, or tied to
  systems they have not meaningfully unlocked.

Affected file:
- `js/tavern.js`

Rules:
- Every active mission gets a `Cancel` button.
- Canceling a mission removes it from active missions without paying rewards.
- Entry costs from risk missions are not refunded unless explicitly added later.
- The active mission cap remains 3.

Beginner mission eligibility:
- Level 0 to 2:
  - allow stone/copper ore delivery
  - allow stone/copper rock breaking
  - allow low mixed ore value
  - block timed, risk, rare-find, gambling, forged-item, and Deep Lift missions
- Level 3 to 4:
  - allow iron if it is naturally reachable
  - allow small timed contracts only if requirements are low
  - block Deep Lift missions
- Level 5 and above:
  - allow Deep Lift waves if Deep Lift is unlocked
  - allow gambling missions after the tavern station exists and the player can pay
    the smallest useful bet
- Level 10 and above:
  - allow more demanding forge, dungeon, and gambling missions

Acceptance:
- A new player can accept any visible mission and reasonably complete it.
- Any active mission can be canceled.
- Mission descriptions clearly say whether progress is from mining, gambling, forge,
  or Deep Lift.

## Phase 2: Mining Visual and Performance Pass

Status:
- [x] Replace one-ore-one-flyer behavior with bundled pickup objects capped by a
  visible pickup budget.
- [x] Add detailed inventory insertion so bundled pickups can store partial amounts
  and report rejected ore when the backpack is full.
- [x] Replace per-ore backpack labels, sparks, and rings with grouped backpack
  count-up rows by ore type.
- [x] Add cooldowns for backpack bounce and full-backpack messages.
- [x] Reduce normal hit, crit, break, and auto-crit storm effects when the mining
  scene is under load.

### 2.1 Replace High-Volume Ore Flyers With Batches

Current issue:
- `spawnOre(x, y, type, n)` creates one pickup object per ore.
- `updateOrePickups()` adds inventory one ore at a time and creates per-ore text,
  sound, backpack pulse, spark, and ring feedback.
- At high yield, this can become too much.

Affected files:
- `js/effects.js`
- `js/core/state.js`
- `js/game.js`
- `js/render.js`

Recommended behavior:
- Introduce ore pickup bundles:
  - one visual pickup can represent `count > 1`
  - cap visible pickups per rock break, for example `MAX_VISIBLE_ORE_PICKUPS = 12`
  - distribute the real ore count across visible bundles
  - on arrival, add the full bundle count to inventory in one operation
- Add a helper that can report partial storage:
  - `addToInventoryDetailed(type, count)` returns `{ added, rejected }`
  - use it for large pickup bundles
  - keep the old `addToInventory(type, count)` wrapper for compatibility
- If inventory is already full, skip most pickup creation and show one cooldown-based
  `Backpack Full` message.

Acceptance:
- Breaking a high-yield rock may create 6 to 12 visible pickups, not 40+.
- Inventory still receives the correct total ore amount when space exists.
- If only partial space exists, the accepted amount is stored and rejected amount is
  communicated once.

### 2.2 Backpack Count-Up Column

Requested direction:
- Keep the backpack bounce.
- Remove noisy color effects.
- Replace individual ore float texts with count-up rows near the backpack.

Affected files:
- `js/effects.js`
- `css/backpack.css`
- possibly `index.html`

Recommended behavior:
- Maintain a short-lived queue by ore type:
  - `pendingBackpackCounts[type] += added`
  - flush to UI at most once per animation frame or every 80 ms
- Display a vertical column near the backpack:
  - `+12 Copper`
  - `+6 Iron`
  - `+2 Gold`
- If another pickup of the same type arrives before the row fades, update the number
  instead of creating a new row.
- Pulse or bounce the backpack at most once every 120 ms.

Acceptance:
- A large auto-crit chain creates readable stacked ore gain rows.
- The backpack bounce remains satisfying.
- There are no per-ore labels during large streaks.

### 2.3 Cheaper Rock Hit, Crit, and Break Effects

Requested direction:
- Redo rock hitting, critting, and breaking effects.
- Make them more smoke-like, cheaper, and still satisfying.

Current implementation:
- `spawnRockHitEffect()`
- `spawnStageFractureEffect()`
- `spawnRockBreakEffect()`
- `spawnAutoCritImpact()`

Recommended visual language:
- Normal hit:
  - small dust puff at hit point
  - rock flash
  - short rock shake
  - 1 to 3 tiny chips max
- Crit:
  - sharper dust burst
  - short bright flash
  - one thin ring or arc only if under budget
  - grouped label for strong chains
- Break:
  - expanding smoke cloud
  - 3 to 6 chunks max
  - final rock sprite state and quick collapse feel
  - one strong but short screen shake, clamped
- Auto-crit storm:
  - draw lightweight paths or arcs for only a subset of hits
  - summarize the rest through one smoke pulse and one count label

Performance rules:
- Keep `PERF_LIMITS`, but add separate budgets for:
  - visible ore pickups
  - float text per second
  - backpack pulses per second
  - auto-crit visual impacts per chain
- Use reduced visuals automatically when:
  - active particles are near cap
  - ore pickups are near cap
  - inventory is full
  - frame delta is consistently high

Acceptance:
- Rapid mouse movement over a full inventory does not stutter.
- A large auto-crit chain feels powerful but does not fill the screen with dozens of
  independent effects.
- The player can still tell the difference between hit, crit, fracture, and break.

## Phase 3: Backpack Inventory Cleanup

Status:
- [x] Remove visible ore names from backpack slots.
- [x] Remove visible consumable names from backpack slots.
- [x] Keep stack counts as compact badges.
- [x] Keep full item names and details in the existing hover/focus tooltips.
- [x] Rebalance Stack Compression from flat `+10` per level to a multiplier
  curve that reaches about `999` stone per stack at max upgrade level.

### 3.1 Remove Names From Inventory Slots

Requested direction:
- Items sitting in inventory should only show the icon.
- Stackable items should show numbering only.
- Names should move to hover tooltips.

Affected files:
- `js/ui/inventory-market.js`
- `css/backpack.css`

Current render helpers:
- `inventoryOreItemHtml()`
- `inventoryConsumableItemHtml()`
- `inventoryForgedItemHtml()`
- `showItemTooltip()`
- `showOreTooltip()`
- `showConsumableTooltip()`

Rules:
- Ore slot: icon plus `x<count>` only.
- Tavern consumable slot: icon plus `x<count>` only.
- Forged gear slot: icon only unless stacked later.
- Tooltip keeps full name, rarity, sell value, source, and effect.
- Equipment slots can keep slot labels because they communicate slot purpose.

Acceptance:
- The backpack grid reads as a clean icon inventory.
- Long item names cannot overflow or shrink the slot.
- Hover or focus still gives full item information.

## Phase 4: Workbench Layout and Chance Readability

Status:
- [x] Move ore offering controls into the top workbench card area above the
  anvil, using a two-column grid that adds rows as ore types increase.
- [x] Shift the anvil into the center action area with chance information kept
  in the left-side information stack.
- [x] Replace long inline chance strings with compact rarity-percentage rows.
- [x] Keep junk and common possible through explicit forge chance floors while
  still letting forge skill, ore quality, forge luck, and junk reduction improve
  the table.
- [x] Remove the extra static workbench explanation because the journal now
  carries the system explanation.
- [x] Remove the separate unlockable-rarity chip box because the chance list
  already shows available rarities and percentages.

### 4.1 Layout Goal

Requested direction:
- Move the ore offering box above the anvil.
- Place it next to forge tier naming.
- Split offering controls into 2 columns.
- Add rows automatically as item/ore count increases.
- Move the anvil more left, almost center screen, while keeping distance from left
  information boxes.
- Reduce scrolling, especially for percentage chances.

Affected files:
- `js/ui/workbench.js`
- `css/workbench.css`
- `index.html`

Current key elements:
- `.craft-card-top`
- `.craft-cost-row`
- `.craft-offer-row`
- `.craft-tier-row`
- `.craft-rar-row`
- `.craft-chance-row`
- `.craft-anvil-wrap`

Recommended layout:
- Left column: forge tier name, short tier status, next unlock.
- Center/right top: ore offering controls in a 2-column box.
- Center: anvil, shifted left from the current far-right position.
- Bottom or side strip: rarity chips and chance list.

Chance readability:
- Render chance rows as a compact two-column list:
  - `Junk 34%`
  - `Common 29%`
  - `Uncommon 20%`
  - `Rare 11%`
- Avoid long inline strings that force wrapping.
- Keep exact percentages in the UI, but put explanation in the journal.

Offering controls:
- Use `grid-template-columns: repeat(2, minmax(180px, 1fr))`.
- New ore types should add rows instead of increasing horizontal width.
- On mobile or narrow screens, collapse to 1 column.

Acceptance:
- All current ore offering controls fit without awkward scrolling on desktop.
- Chance percentages fit in their box.
- The anvil remains the visual action point of the screen.
- Static explanatory text is reduced because the journal explains the system.

### 4.2 Forge Chance Direction

Requested direction:
- All rarities stay available as forge tier improves.
- Junk becomes less common at higher forge levels.
- Common items should always remain possible.

Affected file:
- `js/core/state.js`, especially `forgeRarityWeights()`

Rules:
- Unlock tiers still control which rarities can appear.
- Once a rarity is unlocked for the current recipe, it can remain in the chance table.
- At high forge levels:
  - junk chance should trend down but not always reach zero
  - common chance should never reach zero
  - better ore quality should push weight upward
  - `forgeLuck` and `junkReduction` should feel visible in the chance list

Suggested minimums after unlock:
- Junk: never below 3% unless a special late-game item explicitly says otherwise.
- Common: never below 8%.
- God tier: always extremely low and only on the deepest tier.

Acceptance:
- Upgrading forge skill visibly improves the chance list.
- High-value offerings still sometimes produce common items.
- Junk becomes less frequent but not impossible by default.

## Phase 5: Miner Journal

Status:
- [x] Generate and save the open book journal asset at
  `images/ui/miner-journal-open.png`.
- [x] Add one shared closed-book journal button using
  `images/main-menu/miner-journal-closed.png`.
- [x] Show the journal button in the mineshaft, workbench, and trader.
- [x] Add a shared journal popup with real HTML text layered over the generated
  open book.
- [x] Add destination pages for mineshaft, workbench, and trader.
- [x] Wire keyboard access, Escape close, page tabs, and click-away close.

### 5.1 Journal Button

Requested direction:
- Add a book in an empty corner, preferably bottom right.
- Use `images/main-menu/miner-journal-closed.png` as the button.
- Add it to trader, workbench, and mineshaft.

Affected files:
- `index.html`
- `css/panels.css` or a new `css/journal.css`
- `js/ui/panels.js` or a new `js/ui/journal.js`

Rules:
- The button should not block core controls.
- The button should be visible in:
  - mineshaft
  - trader
  - workbench
- The button can be hidden in screens where it would conflict with modal controls,
  unless journal support is explicitly added there.
- Use a shared component rather than three separate copies if possible.

Acceptance:
- The same journal button opens in each supported destination.
- Keyboard focus can reach it.
- It has an accessible label, for example `Open miner journal`.

### 5.2 Open Journal Popup

Requested direction:
- Use image generation for the open book popup.
- Keep screens clean by moving explanations and tips into the journal.

Asset direction:
- Generate `images/ui/miner-journal-open.png`.
- Open worn miner journal, warm cave light, transparent background, no baked text.
- Leave clear page areas for HTML text.
- Match the painterly mining fantasy style.

Implementation rules:
- The open-book image is the background.
- Text is real HTML layered over the pages.
- The modal supports tabs or pages by destination.
- Close button uses existing back/close art style where possible.

Suggested journal pages:
- Mineshaft:
  - weak points
  - crit chains
  - auto-crits
  - ore pickups
  - backpack full behavior
  - rare ore basics
- Workbench:
  - offering value
  - ore quality
  - forge tier unlocks
  - rarity chances
  - why junk and common can still happen
  - equipping forged items versus storing or selling them
- Trader:
  - pickaxe tier upgrades
  - rare finder and stack upgrades
  - forge skill upgrades
  - forged item turn-ins
  - combining lower rarity forged items
- Deep Lift, later:
  - waves
  - dungeon drops
  - enemy and boss-specific rewards
  - when to swap gear

Acceptance:
- Workbench and trader can remove extra static explanatory text without losing
  player understanding.
- The journal opens fast and does not rebuild heavy DOM every frame.
- On mobile, journal text remains readable and scrolls inside the book area if needed.

## Phase 6: Item Sources, Slots, and Unlock Rules

Status:
- [x] Add explicit item source helpers for forge, gambling, dungeon, and boss
  pools instead of relying on a broad reward-only source exclusion.
- [x] Keep gambling gear out of normal forge rolls while allowing gambling
  missions to fall back to normal forged gear when needed.
- [x] Split Deep Lift drops into normal dungeon enemy drops and boss-only drops.
- [x] Mark selected common-to-rare dungeon support gear as forgeable through
  explicit `forgeable` and `forgeSources` fields.
- [x] Add display categories and equipment groups for new gear so names,
  tooltips, and slots stay predictable.
- [x] Add 25 new Deep Lift/dungeon gear definitions, including more rare, epic,
  legendary, and mythic rewards.

### 6.1 Slot Naming and Categories

Requested direction:
- Forge gears need to match the slot they go into.
- Names should make sense:
  - trinkets are jewelry
  - relics are rare ancient-looking items
  - utility and gear should be distinct

Recommended categories:
- Tool:
  - pickaxe heads, forged pickaxes, mining tools
  - primary mining power and auto-crit identity
- Jewelry:
  - rings, necklaces, amulets
  - luck, income, ore value, small universal bonuses
- Relic:
  - ancient idols, crowns, cores, strange artifacts
  - rare, build-defining, magical or lore-heavy effects
- Utility:
  - satchels, hooks, compasses, lanterns, magnets
  - storage, pickup, rare finder, forge utility
- Armor:
  - dungeon defense and survival
- Weapon:
  - melee, bow, wand, projectile gear for Deep Lift
- Junk:
  - failed forge results, not equippable

Implementation note:
- The current equipment groups in `EQUIPMENT_SLOT_DEFS` can remain simple, but item
  display labels and item `type` values should become more consistent.
- Consider adding a display category separate from equip group:
  - `type: "ring"`
  - `displayCategory: "jewelry"`
  - `equipGroup: "utility"`

Acceptance:
- A player can predict where an item equips from its name and tooltip.
- Junk never looks like a rare relic unless intentionally comedic or cursed.
- Dungeon weapons and mining tools do not compete for unclear slots.

### 6.2 Source Pools

Requested direction:
- Gambling gear buffs only come from gambling missions.
- Completing gambling missions can still sometimes reward normal forged gear.
- Dungeon gear can come from low-chance enemy drops and boss-specific drops.
- Some common-to-rare dungeon support gear should be forgeable at the workbench.

Recommended source model:
- Standard forge pool:
  - normal mining tools
  - jewelry
  - utility
  - forge relics
  - selected common-to-rare dungeon support gear if marked `forgeable: true`
- Gambling pool:
  - luck, risk, cursed reward, card, dice, and betting-themed gear
  - source should be `gambling`
  - not available from normal forge
- Dungeon enemy pool:
  - armor, weapons, dungeon utility
  - source should be `dungeon`
  - common and uncommon can drop from normal enemies
  - rare can drop from tougher enemies
- Boss pool:
  - boss-specific weapons, relics, and armor
  - source should be `boss`
  - not forgeable unless explicitly marked

Reward fallback rule:
- Gambling mission item reward:
  - 70% gambling-specific item of the target rarity if available
  - 30% standard forged item of the target rarity
  - if no gambling item exists for that rarity, use standard forged item
- Dungeon mission item reward:
  - 70% dungeon item of the target rarity if available
  - 30% standard forged item of the target rarity
  - if no dungeon item exists for that rarity, use standard forged item

Important code note:
- The current `REWARD_ONLY_ITEM_SOURCES` blanket exclusion should become more
  explicit. Use item flags such as:
  - `forgeable: true`
  - `rewardOnly: true`
  - `dropOnly: true`
  - `bossOnly: true`

Acceptance:
- Gambling-themed gear never appears from normal forging.
- Gambling mission rewards can still produce normal forged gear.
- Dungeon-specific gear can drop from Deep Lift reward tables.
- Forgeable dungeon support gear appears only when marked for the forge.

## Phase 7: Item Art Regeneration

Status:
- [x] Archive the previous forged item PNG set under
  `images/_archive/workbench-items-pre-phase-7-2026-05-30/`.
- [x] Generate four 20-item phase 7 source sheets saved in
  `images/workbench/_source/`.
- [x] Use a flat magenta chroma-key background instead of green to avoid the
  green edge residue seen on prior generated assets.
- [x] Slice 80 icons into `images/workbench/items/` with transparent corners,
  softened matte cleanup, and extra padding so assets are less likely to be cut
  off.
- [x] Switch dungeon item rendering from placeholder letters to the generated
  PNG art.

### 7.1 Why This Should Wait Until After Source Rules

The current forged items are cool, but their assets no longer match each other. The
best order is to lock the item taxonomy first, then regenerate item sheets so every
asset has a clear gameplay slot and source.

### 7.2 Asset Direction

Rules for generated item sheets:
- Transparent background.
- No text baked into icons.
- Same painterly mining-fantasy style.
- Same camera angle and lighting across the sheet.
- Strong silhouettes at inventory size.
- Distinct category language:
  - jewelry is small, polished, wearable
  - relics are ancient, rare, strange, heavier
  - utility items are practical miner tools
  - weapons and armor are readable as Deep Lift combat gear
  - junk looks failed, burnt, cracked, or bent

Recommended technical targets:
- Generate sheets at high resolution.
- Slice into individual PNG files under `images/workbench/items/`.
- Keep source sheets in `images/workbench/_source/`.
- Use stable ids that match `CRAFT_ITEM_DEFS`.
- Audit edge transparency before committing.

Acceptance:
- Inventory icons look like they belong to the same art set.
- Item category is understandable from silhouette before reading the tooltip.
- No green/cyan/magenta residue remains around item edges.

## Phase 8: Verification Checklist

### Performance

- Start a high-level save with max pickaxe tier and multiple auto-crit gear pieces.
- Break rocks until a large auto-crit chain happens.
- Confirm active particles, ore pickups, and float texts stay under budget.
- Fill the backpack, then rapidly move and click around the mine.
- Confirm no repeated full-inventory spam or visible stutter.

### Stacking

- Equip multiple gear pieces with `autoCritChance`.
- Confirm final auto-crit behavior is more frequent.
- Equip multiple gear pieces with `forgeLuck`.
- Confirm workbench chance display changes.
- Use tavern auto-crit tonic while gear is equipped.
- Confirm buff and gear bonuses both apply.

### Workbench

- Test with every current ore type in the backpack.
- Confirm offering controls wrap into 2 columns on desktop.
- Confirm mobile collapses cleanly.
- Confirm chance rows fit without horizontal overflow.
- Confirm anvil remains easy to click and visually central.

### Inventory

- Confirm ore slots show icon plus count only.
- Confirm consumables show icon plus count only.
- Confirm forged items show icon only.
- Confirm hover and keyboard focus reveal full tooltip information.

### Journal

- Confirm journal button appears in mineshaft, trader, and workbench.
- Confirm it opens and closes without breaking panel state.
- Confirm each page explains the local mechanics briefly.
- Confirm text is readable on desktop and mobile.

### Missions

- New player mission list contains only beginner-appropriate tasks.
- Active missions can be canceled.
- Canceling does not pay rewards.
- Timed missions still expire normally.
- Gambling and dungeon gear rewards respect source pools.

## Non-Blocking Questions For Final Tuning

These are not required before starting implementation, but they should be answered
before final balance and art generation:

- Should canceled paid risk contracts refund anything, or should the entry cost be
  treated as lost?
- What should the late-game actual auto-crit hit cap be: 18, 24, or uncapped with
  strict visual batching?
- Should the journal be a single shared popup with destination tabs, or should each
  destination open directly to its own page?
- How many new item icons should be generated in the first art pass: small refresh
  around 30, medium around 60, or large around 100+?
- Should boss-specific drops exist before the next Deep Lift enemy pass, or should
  they wait until boss behavior is more developed?
