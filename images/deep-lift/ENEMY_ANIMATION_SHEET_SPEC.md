# Deep Lift Enemy Authored Sheet Spec

The generated `*-v2.png` sheets are not the visual target. They were a wiring
baseline derived from the old rotated sheets and should not be used for final
enemy animation.

This spec is intentionally production-efficient. Do not generate every possible
state and direction if the game can reuse a row or add the effect in code.

## Output Files

Create authored replacement sheets with these filenames:

- `images/deep-lift/mob-spider-authored.png`
- `images/deep-lift/mob-bone-guard-authored.png`
- `images/deep-lift/mob-deep-goblin-authored.png`
- `images/deep-lift/boss-warden-authored.png`

The game should prefer these authored files when they exist and fall back to the
current enemy sheets otherwise.

## Shared Rules

- Cell size: `128x128`
- Columns: `6` frames per row
- Background: transparent PNG
- Direction order when a state needs all directions:
  1. `south`
  2. `southwest`
  3. `west`
  4. `northwest`
  5. `north`
  6. `northeast`
  7. `east`
  8. `southeast`
- Front-facing idle is only needed for the post-death/player-failed state, when
  enemies stand around before the player leaves/restarts the lift.
- Hurt reactions, hit flashes, impact sparks, weapon trails, projectile glow,
  and extra strike/shoot effects should be coded effects, not extra generated
  sprite rows.
- Keep actor feet/body center consistent inside the `128x128` cell so movement
  does not drift like the old rotated sheets.

## Restart: Consistency-First Source Pass

The previous generated enemy sheets are archived and should not be treated as
the new target. The player sheet is approved and should not be regenerated for
this pass.

The live game should use static enemy PNGs until a new actor animation set is
validated:

- `images/deep-lift/dungeon1/actors/spider/spider-static.png`
- `images/deep-lift/dungeon1/actors/skeleton/skeleton-static.png`
- `images/deep-lift/dungeon1/actors/goblin/goblin-static.png`
- `images/deep-lift/dungeon1/actors/boss/boss-static.png`

New enemy animations must solve consistency before variety:

1. Pick one actor only.
2. Generate only movement first.
3. Approve `run_south`, `run_west`, and `run_north` before any dash, attack, or
   death state.
4. Compare the packed `128x128` result with overlay guides before wiring it into
   the live game.
5. Reject any direction if the actor reads as a different body size, even if the
   animation itself looks good.

For each actor, make a size lock before generation:

- Desired packed actor height range for ground enemies: roughly `60-66px`.
- Side-facing width may be wider than south/north, but side-facing height should
  not collapse into a crawler silhouette unless the actor is actually a crawler.
- Feet/contact points should land on the same baseline per state.
- The shield, weapon, cloak, limbs, and skull must stay fully inside the source
  frame with extra padding.
- South, west, and north prompts must all explicitly request the same on-screen
  body height and same game-scale readability.

Do not accept a strip just because it is not clipped. The strip must also pass
visual size consistency against the other approved directions.

## Source Strip Rules For Next Attempt

Do not generate full actor sheets directly. Generate and approve movement source
strips first, then pack the final sheet from approved strips by script.

Current priority:

- `run`
- `dash`

Do not generate idle, strike, shoot, hurt, or death rows until movement quality is
locked. The packer can fill unused final-sheet rows with temporary movement
placeholders while the run/dash pass is being reviewed.

Source strip rules:

- One state and one cardinal direction per source image.
- `6` frames in one horizontal row.
- Source cells should be larger than the final game cell through generous empty
  padding; the packer downfits into `128x128`.
- Generate only cardinal directions first:
  - `south`
  - `west`
  - `north`
- `east` can mirror `west` if the actor reads well enough in motion.
- Diagonals should reuse the nearest cardinal during the movement pass:
  - `southwest` -> `west`
  - `northwest` -> `west`
  - `northeast` -> mirrored `west` / `east`
  - `southeast` -> mirrored `west` / `east`
- Reject a strip before packing if any body part, weapon, shield, cloak, leg,
  or corpse edge is cropped or visually touches the frame edge.
- Reject a strip if the actor scale differs noticeably from approved strips in
  another direction.

Bone guard movement strip filenames:

- `images/deep-lift/_source/generated/strips/bone-guard/run_south.png`
- `images/deep-lift/_source/generated/strips/bone-guard/run_west.png`
- `images/deep-lift/_source/generated/strips/bone-guard/run_north.png`
- `images/deep-lift/_source/generated/strips/bone-guard/dash_south.png`
- `images/deep-lift/_source/generated/strips/bone-guard/dash_west.png`
- `images/deep-lift/_source/generated/strips/bone-guard/dash_north.png`

## Melee Ground Troops

Applies to:

- `mob-spider-authored.png`
- `mob-bone-guard-authored.png`

Required rows:

1. `idle_south`
   - One front-facing idle row only.
   - Used when the player is dead/failed and enemies stop active combat.
2. `run`
   - 8 direction rows.
   - Real directional locomotion, not rotated frames.
3. `charge`
   - 8 direction rows.
   - More committed forward motion than `run`.
4. `strike`
   - 4 cardinal rows only: `south`, `west`, `north`, `east`.
   - Diagonal strikes can reuse the nearest cardinal row in code.
5. `dead`
   - 3 rows for death variety.
   - Each row can be direction-neutral collapsed ground poses.

Generation target:

- `1 + 8 + 8 + 4 + 3 = 24` rows
- `24 rows x 128px = 3072px` high
- Final sheet size: `768x3072`

## Projectile Ground Troops

Applies to:

- `mob-deep-goblin-authored.png`

Required rows:

1. `idle_south`
   - One front-facing idle row only.
   - Used when the player is dead/failed.
2. `run`
   - 8 direction rows.
   - Used for normal repositioning.
3. `charge`
   - 8 direction rows.
   - Used for aggressive repositioning or rushing behavior if enabled.
4. `shoot`
   - 4 cardinal rows only: `south`, `west`, `north`, `east`.
   - Diagonal shooting can reuse the nearest cardinal row in code.
5. `dead`
   - 3 rows for death variety.
   - Direction-neutral collapsed poses are fine.

Backwalk rule:

- Do not generate a separate `backwalk` state.
- Reuse the front-facing walking/running animation while movement code moves the
  actor backward from the player.

Generation target:

- `1 + 8 + 8 + 4 + 3 = 24` rows
- `24 rows x 128px = 3072px` high
- Final sheet size: `768x3072`

## Boss Warden

Applies to:

- `boss-warden-authored.png`

The Warden is a large floating character, not a legged ground troop. Do not
produce a full walking sheet.

Required rows:

1. `idle_south`
   - One front-facing hover/idle row.
2. `float_move`
   - One front-facing row with subtle floating/body drift.
   - Movement code can slowly move the boss toward the player.
3. `attack`
   - 4 cardinal rows only: `south`, `west`, `north`, `east`.
   - Minimal body movement with readable arm/lantern/weapon motion.
4. `dead`
   - 3 rows for death variety.
   - Large collapsed/fallen/energy-drained poses.

Generation target:

- `1 + 1 + 4 + 3 = 9` rows
- `9 rows x 128px = 1152px` high
- Final sheet size: `768x1152`

## Quality Bar

- Match the player sheet direction quality: each required movement direction
  needs a real pose, not a rotated version of another pose.
- Death rows must read as lifeless and grounded.
- Strike/shoot rows need a clear anticipation, active, and recovery feel across
  the 6 frames.
- Projectile and melee VFX should stay out of the sheet unless they are attached
  to the actor silhouette; free-floating effects belong in code.
