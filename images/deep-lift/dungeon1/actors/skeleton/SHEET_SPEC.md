# Skeleton Compact Animation Sheet

This is the execution plan for the next skeleton animation pass. The goal is to
avoid one large generated sheet, keep proportions stable, and make each bad
direction easy to replace without touching the whole set.

## Runtime Sheet

- File: `skeleton-animations.png`
- Cell size: `128x128`
- Columns: `2`
- Rows: `15`
- Sheet size: `256x1920`
- Background: transparent PNG

There is no idle section in this sheet. Runtime fallback may map temporary
idle/hurt states to the first run frame.

## Direction Order

When a state uses all directions, row order is:

1. `south`
2. `southwest`
3. `west`
4. `northwest`
5. `north`
6. `northeast`
7. `east`
8. `southeast`

## Runtime Rows

- `0-7`: `run`, 2 frames per direction
- `8-11`: `strike`, 2 frames per cardinal direction
- `12-14`: `death`, 3 existing death variations, 1 frame each

Charge does not need its own generated rows. Runtime should reuse the current
run direction as a held/paused leap pose for the charge duration. If the charge
ends close enough to the player, runtime can transition into `strike`.

Strike row order:

1. `south`
2. `west`
3. `north`
4. `east`

## Source Generation Plan

Generate and approve one state family at a time, using separate strips instead
of one large sheet.

## Camera And View Lock

All generated skeleton animation sources must use the same game camera:

- Top-side / three-quarter overhead dungeon arena view.
- The actor is seen slightly from above, matching the in-game Deep Lift combat
  view.
- Feet/contact points should read on an implied ground plane, but source images
  still use a flat chroma-key background.
- Head, shoulders, shield, ribs, cloak, legs, and hook/scythe must stay readable
  from the overhead angle.

Avoid:

- Straight front-facing portrait poses.
- Side-scroller profile poses.
- Low camera hero art.
- Rotated flat sprites pretending to be new directions.
- Large perspective changes between directions.

### Pass 1: Run

Generate 8 separate 2-frame strips:

- `run_south`
- `run_southwest`
- `run_west`
- `run_northwest`
- `run_north`
- `run_northeast`
- `run_east`
- `run_southeast`

Each strip:

- 2 frames in one row
- Frame 1: right-leg plant / left-leg lift with shoulder counter-sway
- Frame 2: left-leg plant / right-leg lift with opposite shoulder counter-sway
- Must loop as `1 -> 2 -> 1`
- Same skull size, body height, shield size, weapon length, and foot baseline
- Must preserve the top-side / three-quarter overhead view for the direction.

### Pass 2: Strike

Generate only cardinal attack strips:

- `strike_south`
- `strike_west`
- `strike_north`
- `strike_east`

Each strip:

- 2 frames in one row
- Frame 1: big swing wind-up
- Frame 2: big swing follow-through
- No free-floating VFX; only actor pose
- Must preserve the top-side / three-quarter overhead view for the direction.

Diagonal strikes should reuse the nearest cardinal strike in runtime mapping.

### Pass 3: Death

Reuse the existing source:

- `_source/skeleton-death-raw.png`

Pack it into runtime rows `12-14`.

## Current Run Strip Review Notes

The current run generation pass needs targeted replacement before packing:

- Regenerate `run_south`
- Regenerate `run_southwest`
- Regenerate `run_west`
- Regenerate `run_northwest`
- Regenerate `run_east`

Reason: the two-frame step does not read clearly enough as right-side/left-side
foot alternation with shoulder counter-sway.

Keep for now unless later review rejects them:

- `run_north`
- `run_northeast`
- `run_southeast`

## Acceptance Checks

Before packing a strip into the runtime sheet:

- Actor is the same skeleton guard from `skeleton-static.png`.
- No idle standing poses in run strips.
- Feet visibly alternate in the 2-frame run cycle.
- Skull, shield, torso, and weapon proportions match the approved reference.
- No crop touching the cell edge after normalization.
- Foot/contact baseline is consistent across frames in the same state.
- Direction reads correctly without relying on rotation.
- Camera angle stays top-side / three-quarter overhead, not portrait-front or
  side-scroller profile.

If a direction fails, regenerate only that strip and keep the approved strips.

Consistency of the proportions as I imagened did not follow through I think the better approach will to still keep reiterating the sheets until they come out right and approved for implementation.
