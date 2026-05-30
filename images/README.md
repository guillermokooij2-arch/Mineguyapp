# Image Asset Organization

Use `node scripts/audit-images.js` before moving, deleting, or converting assets.

The audit writes:

- `tmp/image-asset-audit.md` for a readable cleanup list.
- `tmp/image-asset-audit.json` for exact usage data.

Audit categories:

- Used assets: referenced directly or loaded through known dynamic game paths.
- Referenced only by preload: listed in `GAME_ASSET_GROUPS`, but not otherwise found in runtime code.
- Referenced only by fallback/reference code: present as a fallback or optional default, not a primary runtime load.
- Unused runtime candidates: active assets not currently wired to code.
- Unused source/reference assets: `*-source*` and `_source/` files kept for art reference.
- Duplicate runtime files: identical active files that may be safe to consolidate.
- WebP conversion candidates: used PNG/JPG assets without a `.webp` sibling.
- Archived assets: everything in `_archive/`, excluded from runtime analysis.

## Cleanup workflow

1. Run `node scripts/audit-images.js`.
2. Fix **Missing References To Fix First** before any cleanup. These are broken runtime paths.
3. Review **Referenced Only By Preload**. These may be stale entries in `GAME_ASSET_GROUPS`, but do not remove them until the screen that owns them has been tested.
4. Review **Unused Runtime Candidates**. Move uncertain files to `images/_archive/`, then rerun the audit.
5. Review **Duplicate Runtime Files By Content**. Keep the file with the clearest domain path and update code before archiving duplicates.
6. Convert **WebP Conversion Candidates** in batches by screen or feature, not all at once.

Do not delete directly from `images/` until the audit has zero missing references and the affected screen has been opened once.

## Folder Structure

| Folder | Contents |
|---|---|
| `main-menu/` | Title screen, menu props, and menu video |
| `miner/` | Miner character sprites and portrait |
| `mines/` | Mine backgrounds and travel map backgrounds |
| `map-icons/` | Travel map destination icons |
| `inventory/` | Backpack frame, backpack icons, and slot UI |
| `ore-icons/` | Collected ore icons |
| `ore-nodes/` | Breakable ore node stage sprites (`round-<ore>-<0-5>.png`) |
| `workbench/` | Forge scene, tiers, animation, and crafted item art |
| `trader/` | Trader scene, NPC states, and upgrade props |
| `tavern/` | Tavern scene, barkeep, items, gambling, and missions |
| `deep-lift/` | Dungeon route, battle map, mobs, bosses, and dungeon player art |
| `cursors/` | Cursor-specific hand and pickaxe assets |
| `sys-terminal/` | SYS room and terminal screen assets |
| `ui/` | Shared HUD frames |
| `ui-buttons/` | Navigation buttons |

## Special Subdirectories

- `<category>/_source/`: Original artwork sheets and source PNGs. Kept for reference; never loaded at runtime.
- `_archive/`: Superseded or inactive assets moved here for safe keeping. Excluded from runtime analysis. Batch-delete only after a final audit and manual check.

## WebP Conversion

The audit lists all active PNG/JPG assets without a `.webp` sibling under **WebP Conversion Candidates**. Convert those files, add the `.webp` alongside the original, update the code reference to point to `.webp`, then move the old PNG/JPG to `_archive/` only after the screen has been tested.

## Adding New Feature Art

New feature gear should use letter placeholders in data until unique transparent assets are created. Do not point new placeholder gear at existing forged item art.
