# Equipment, Forge, and Dungeon Roadmap

This checklist tracks the next system pass for forged items, equipment, trader
upgrades, tavern consumables, missions, and Deep Lift combat.

## Product Direction

- The dungeon loop should overtake mining as the main late-game progression loop
  once the player has forged stronger gear.
- Forged items should become meaningful build choices instead of passive stats
  gained by filling the whole backpack.
- Mining, forge, trader, tavern, and dungeon rewards should feed each other
  without making one screen solve every progression problem.

## Implementation Order

### 1. Inventory and consumable foundation

- [x] Track this rollout order in the repo.
- [x] Make barkeep purchases enter the backpack as stackable consumables.
- [x] Require the player to consume backpack tavern items before their buff starts.
- [x] Preserve the cap of 7 active tavern buffs.
- [x] Split backpack slot logic into stable item categories that can support
  equipment and dungeon drops.

### 2. Forged item and equipment model

- [x] Stop treating every forged item in storage as an always-active passive.
- [x] Add an equipment bar separate from backpack storage.
- [x] Start with a small equipment slot count and add slot unlock rules through
  levels, upgrades, or dungeon progression.
- [x] Define equipment slot rules for mining gear, dungeon weapons, armor, and
  utility pieces.
- [x] Rebalance forged item power upward after passive inventory stacking is
  removed.

Current slot pass:
- Tool slot for forged mining tools.
- Utility slots for rings, charms, amulets, relics, gems, and future utility gear.
- Future armor slot for defensive dungeon drops.
- Future weapon slot for melee, ranged, wand, bow, and projectile gear.

### 3. Trader forge-part economy

- [x] Keep trader upgrade costs based on forged item value, but replace automatic
  spending with explicit trader turn-ins.
- [x] Let the player select which forged items are traded into an upgrade before
  the current forged value is consumed.
- [x] Add trader combining so lower rarities can roll upward, starting from
  examples such as 20 junk into 1 common and 5 common into 1 uncommon.
- [ ] Tune combine inputs against real forge output and the current sell-value
  ladder before adding separate rarity part values.

Current trader pass:
- Upgrade props open a turn-in tray instead of automatically eating the cheapest
  forged backpack stock.
- Equipped forged items are not offered to the trader turn-in tray.
- The first combine recipes consume the lowest-value matching backpack rarity and
  roll a random result from the next rarity tier.

### 4. Dungeon equipment and rewards

- [x] Add dungeon-exclusive drops.
- [x] Add armor pieces for defense and survival builds.
- [x] Add melee damage gear and projectile weapons such as wands or bows.
- [x] Add forgeable dungeon support gear so the workbench still matters after
  dungeon progression becomes dominant.
- [x] Support weapon switching during battle when the player has melee and
  projectile options equipped.
- [x] Allow between-wave inventory use for equipment swaps, health potions, and
  other consumables.

### 5. Missions and reward routing

- [x] Add dungeon-focused tavern quests.
- [x] Move forged-item delivery requirements away from tavern contracts where
  they belong better in trader upgrade/trade flows.
- [x] Review mission rewards that grant tavern consumables so reward timing stays
  clear after consumables live in the backpack.

### 6. Deep Lift HUD and between-wave UI

- [x] Use wood plaque surfaces only for real buttons and the health bar.
- [x] Remove the health number from the dungeon HP panel.
- [x] Place floor, wave, loot, and best over the command level panel asset.
- [x] Make the command level panel open inventory between waves.
- [x] Keep combat HUD dense and readable on desktop and mobile.

## Asset Direction

- Prefer real transparency for generated item assets when the output is clean.
- Do not default to a green chroma-key background for new item assets. Green
  residue is especially visible around detailed corners and worn edges.
- When a removable key background is needed, choose a subject-safe contrast color
  such as magenta, cyan, or a neutral flat tone that does not overlap the item.
- Inspect cutout edges before committing assets into gameplay UI.
