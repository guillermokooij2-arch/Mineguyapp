// ── UPGRADE DEFINITIONS ───────────────────────────────────────────────────────
const UPGRADE_DEFS = {
  // Terminal
  power: {
    name:'Power', location:'terminal', icon:'DMG',
    desc:'More damage per swing', effect:'+1 dmg / lv',
    baseCost:25, costMult:1.65, max:20,
  },
  accuracy: {
    name:'Accuracy', location:'terminal', icon:'ACC',
    desc:'Bigger weak-point circle and longer crit window',
    effect:'+circle size, +7 frames / lv',
    baseCost:40, costMult:1.75, max:10,
  },
  luck: {
    name:'Luck', location:'terminal', icon:'LCK',
    desc:'Universal fortune: better ore finds, yield rolls, forging, gambling, and auto-crits',
    effect:'+3.5% universal luck / lv',
    baseCost:160, costMult:2.25, max:15,
  },
  // Trader
  pickaxeTier: {
    name:'Pickaxe Tier', location:'trader', icon:'PCK',
    desc:'Upgrades your mining cursor and unlocks stronger auto-crit chain reactions',
    effect:'+25% yield, +5% auto-crit chance per tier',
    baseCost:80, costMult:2.0, max:6,
  },
  rareFinder: {
    name:'Rare Finder', location:'trader', icon:'RRE',
    desc:'Higher chance for rare ores to spawn', effect:'+3% rare / lv',
    baseCost:120, costMult:2.2, max:8,
  },
  stackSize: {
    name:'Stack Compression', location:'trader', icon:'STK',
    desc:'Larger max stack per ore type', effect:'+10 max / lv',
    baseCost:150, costMult:1.8, max:5,
  },
  forgeSkill: {
    name:'Forge Skill', location:'trader', icon:'FRG',
    desc:'Consumes crafted backpack parts to unlock higher-value forge tiers',
    effect:'Unlock rarities, +1% forge luck every 2 lv',
    baseCost:500, costMult:2.15, max:10,
  },
};

