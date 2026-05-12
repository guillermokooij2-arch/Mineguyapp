// ── CRAFTED ITEM DEFINITIONS ──────────────────────────────────────────────────
// effect keys: power(flat dmg), luck(fraction), yield(fraction), coinMult(fraction),
//              xpMult(fraction), chainTime(integer frames), swingSpeed(integer frames faster)
const OLD_CRAFT_ITEM_DEFS = {
  // ── COMMON ──────────────────────────────────────────────────────────────────
  miners_charm: {
    name:"Miner's Charm", rarity:'common', type:'charm',
    col:'#88aa55', glow:'#aade60',
    effect:{ yield:0.08 }, desc:'+8% ore yield',
  },
  copper_ring: {
    name:'Copper Ring', rarity:'common', type:'ring',
    col:'#c06820', glow:'#e07030',
    effect:{ luck:0.03 }, desc:'+3% luck',
  },
  rough_gem: {
    name:'Rough Gem', rarity:'common', type:'gem',
    col:'#7777bb', glow:'#9999ee',
    effect:{ xpMult:0.10 }, desc:'+10% XP gain',
  },
  stone_pick: {
    name:'Stone Pickaxe', rarity:'common', type:'pickaxe',
    col:'#78768a', glow:'#9a9ab0',
    effect:{ power:1 }, desc:'+1 damage',
  },
  // ── UNCOMMON ────────────────────────────────────────────────────────────────
  iron_bangle: {
    name:'Iron Bangle', rarity:'uncommon', type:'ring',
    col:'#5a7888', glow:'#80b0c8',
    effect:{ power:1, luck:0.02 }, desc:'+1 dmg, +2% luck',
  },
  iron_pick: {
    name:'Iron Pickaxe', rarity:'uncommon', type:'pickaxe',
    col:'#5a7888', glow:'#90b8d8',
    effect:{ power:2 }, desc:'+2 damage',
  },
  focus_gem: {
    name:'Focus Gem', rarity:'uncommon', type:'gem',
    col:'#7755aa', glow:'#aa88ff',
    effect:{ chainTime:25 }, desc:'+25 chain timer',
  },
  coppersmith_cog: {
    name:"Coppersmith's Cog", rarity:'uncommon', type:'charm',
    col:'#b86018', glow:'#d88030',
    effect:{ coinMult:0.08 }, desc:'+8% sell value',
  },
  // ── RARE ────────────────────────────────────────────────────────────────────
  gold_pick: {
    name:'Gold Pickaxe', rarity:'rare', type:'pickaxe',
    col:'#b89018', glow:'#ffd040',
    effect:{ power:3, luck:0.05 }, desc:'+3 dmg, +5% luck',
  },
  gold_amulet: {
    name:'Gold Amulet', rarity:'rare', type:'amulet',
    col:'#b89018', glow:'#ffd040',
    effect:{ coinMult:0.15, xpMult:0.10 }, desc:'+15% coins, +10% XP',
  },
  bloodstone: {
    name:'Bloodstone', rarity:'rare', type:'gem',
    col:'#880020', glow:'#ff4040',
    effect:{ power:2, xpMult:0.20 }, desc:'+2 dmg, +20% XP',
  },
  swift_ring: {
    name:'Swift Ring', rarity:'rare', type:'ring',
    col:'#207888', glow:'#40d8ff',
    effect:{ swingSpeed:2, chainTime:20 }, desc:'-2 swing spd, +20 chain timer',
  },
  // ── LEGENDARY ───────────────────────────────────────────────────────────────
  void_pick: {
    name:'Void Pickaxe', rarity:'legendary', type:'pickaxe',
    col:'#5520aa', glow:'#aa44ff',
    effect:{ power:6, yield:0.40 }, desc:'+6 dmg, +40% yield',
  },
  star_pendant: {
    name:'Star Pendant', rarity:'legendary', type:'amulet',
    col:'#208898', glow:'#88eeff',
    effect:{ xpMult:0.30, coinMult:0.15 }, desc:'+30% XP, +15% coins',
  },
  cosmic_shard: {
    name:'Cosmic Shard', rarity:'legendary', type:'gem',
    col:'#aa44aa', glow:'#ffaaff',
    effect:{ power:3, luck:0.08, yield:0.20, coinMult:0.15 },
    desc:'+3 dmg, +8% luck, +20% yield, +15% coins',
  },
};

// ── CRAFTING RECIPES ──────────────────────────────────────────────────────────
// table entries: { id: craftItemId or null(=no result), w: weight }
const OLD_CRAFT_RECIPES = [
  {
    id:'basic', name:'Basic Smelt', icon:'STN',
    desc:'Rough stone into something useful.',
    cost:{ stone:15 },
    table:[
      {id:'miners_charm', w:35},
      {id:'copper_ring',  w:25},
      {id:'stone_pick',   w:20},
      {id:'rough_gem',    w:10},
      {id:null,           w:10},
    ],
  },
  {
    id:'copper', name:'Copper Work', icon:'CU',
    desc:'Shape copper ore into basic gear.',
    cost:{ copper:8 },
    table:[
      {id:'copper_ring',    w:30},
      {id:'miners_charm',   w:25},
      {id:'coppersmith_cog',w:20},
      {id:'iron_bangle',    w:10},
      {id:'stone_pick',     w:5 },
      {id:null,             w:10},
    ],
  },
  {
    id:'iron', name:'Iron Forge', icon:'FE',
    desc:'Forge iron into refined equipment.',
    cost:{ iron:5 },
    table:[
      {id:'iron_bangle',    w:25},
      {id:'iron_pick',      w:20},
      {id:'focus_gem',      w:15},
      {id:'coppersmith_cog',w:15},
      {id:'copper_ring',    w:10},
      {id:null,             w:15},
    ],
  },
  {
    id:'gold', name:'Gold Casting', icon:'AU',
    desc:'Cast gold into precious artifacts.',
    cost:{ gold:3 },
    table:[
      {id:'gold_amulet', w:18},
      {id:'gold_pick',   w:15},
      {id:'bloodstone',  w:10},
      {id:'swift_ring',  w:8 },
      {id:'focus_gem',   w:18},
      {id:'iron_pick',   w:15},
      {id:null,          w:16},
    ],
  },
  {
    id:'grand', name:'Grand Alloy', icon:'ALL',
    desc:'All ores, one crucible. Rare results possible.',
    cost:{ stone:10, copper:5, iron:3, gold:1 },
    table:[
      {id:'void_pick',    w:3 },
      {id:'star_pendant', w:4 },
      {id:'cosmic_shard', w:2 },
      {id:'bloodstone',   w:14},
      {id:'gold_pick',    w:12},
      {id:'gold_amulet',  w:12},
      {id:'swift_ring',   w:12},
      {id:'iron_pick',    w:12},
      {id:null,           w:29},
    ],
  },
];

// ── UPGRADE HELPERS ───────────────────────────────────────────────────────────
const PICKAXE_CHAIN_REACTION = {
  common:{chance:0.08,minHits:1,maxHits:2,effect:'earth'},
  uncommon:{chance:0.13,minHits:2,maxHits:3,effect:'earth'},
  rare:{chance:0.18,minHits:3,maxHits:5,effect:'lightning'},
  epic:{chance:0.25,minHits:4,maxHits:7,effect:'fire'},
  legendary:{chance:0.34,minHits:6,maxHits:9,effect:'gold'},
  mythic:{chance:0.45,minHits:8,maxHits:9,effect:'lightning'},
  god:{chance:0.55,minHits:9,maxHits:10,effect:'lightning'},
};

const CRAFT_ITEM_DEFS = {
  trash_metal:{name:'Hunk of Trash Metal',rarity:'junk',type:'junk',sell:5,col:'#6f6a61',glow:'#8a8070',effect:{},desc:'Sells for a little. No passive effect.',sources:['basic','copper','grand']},
  burnt_slag:{name:'Burnt Slag',rarity:'junk',type:'junk',sell:3,col:'#4e4138',glow:'#8a4f2e',effect:{},desc:'Sells for almost nothing.',sources:['basic','copper','grand']},
  bent_nails:{name:'Bent Nail Cluster',rarity:'junk',type:'junk',sell:8,col:'#686d72',glow:'#8a949a',effect:{},desc:'Sells for a little. No passive effect.',sources:['basic','copper','grand']},
  cracked_alloy:{name:'Cracked Alloy Lump',rarity:'junk',type:'junk',sell:12,col:'#6e5a48',glow:'#a07852',effect:{},desc:'A failed alloy. Low sell value.',sources:['grand']},
  failed_relic:{name:'Failed Relic Shell',rarity:'junk',type:'relic',sell:20,col:'#7a6850',glow:'#b89a68',effect:{},desc:'Almost magical. Almost.',sources:['gold','grand']},
  dull_stone_pick:{name:'Dull Stone Pickaxe',rarity:'common',type:'pickaxe',sell:40,col:'#88848f',glow:'#aaa8b8',effect:{power:1},ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.common},desc:'+1 mining power. Small chance for 1-2 auto-crits after a weak-point hit.',sources:['basic']},
  pebble_ring:{name:"Miner's Pebble Ring",rarity:'common',type:'ring',sell:35,col:'#8a8172',glow:'#c0b28a',effect:{oreValue:0.01},desc:'+1% ore value',sources:['basic']},
  cracked_charm:{name:'Cracked Stone Charm',rarity:'common',type:'charm',sell:30,col:'#7c835e',glow:'#a2bd72',effect:{stoneValue:0.01},desc:'+1% stone value',sources:['basic']},
  copper_button:{name:'Copper Button',rarity:'common',type:'relic',sell:45,col:'#c06820',glow:'#e07030',effect:{yield:0.02},desc:'+2% ore yield',sources:['copper']},
  rusty_gear:{name:'Rusty Gear',rarity:'common',type:'relic',sell:50,col:'#9d6231',glow:'#c77a3a',effect:{upgradeDiscount:0.01},desc:'+1% upgrade discount',sources:['copper','iron']},
  copper_ring:{name:"Copper Miner's Ring",rarity:'uncommon',type:'ring',sell:120,col:'#c06820',glow:'#e07030',effect:{oreValue:0.03},desc:'+3% ore value',sources:['copper']},
  spark_charm:{name:'Spark Charm',rarity:'uncommon',type:'charm',sell:150,col:'#d47a28',glow:'#ff9a35',effect:{forgeLuck:0.02},desc:'+2% forge luck',sources:['copper','iron']},
  copper_pick:{name:'Reinforced Copper Pickaxe',rarity:'uncommon',type:'pickaxe',sell:180,col:'#c07932',glow:'#ef9a4a',effect:{power:4},ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.uncommon},desc:'+4 mining power. Chance for 2-3 auto-crits after a weak-point hit.',sources:['copper']},
  pouch_buckle:{name:'Deep Pouch Buckle',rarity:'uncommon',type:'charm',sell:160,col:'#887250',glow:'#c8aa70',effect:{inventoryCapacity:1},desc:'+1 inventory slot',sources:['copper','iron']},
  lantern_shard:{name:'Lucky Lantern Shard',rarity:'uncommon',type:'relic',sell:200,col:'#c9b466',glow:'#ffe48a',effect:{rareFinder:0.03},desc:'+3% rare ore chance',sources:['iron']},
  iron_pick:{name:'Ironbound Pickaxe',rarity:'rare',type:'pickaxe',sell:500,col:'#668090',glow:'#9fc8e0',effect:{power:10},ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.rare},desc:'+10 mining power. Chance for 2-4 lightning auto-crits.',sources:['iron']},
  gold_necklace:{name:'Gold Vein Necklace',rarity:'rare',type:'amulet',sell:650,col:'#d6a92a',glow:'#ffd040',effect:{oreValue:0.08},desc:'+8% ore value',sources:['gold']},
  cave_lantern:{name:'Deep Cave Lantern',rarity:'rare',type:'relic',sell:700,col:'#7b92a0',glow:'#a8dcff',effect:{rareFinder:0.05},desc:'+5% rare cave ore chance',sources:['iron','grand']},
  ore_hook:{name:'Magnetic Ore Hook',rarity:'rare',type:'relic',sell:600,col:'#7e9ea8',glow:'#8eeaff',effect:{autoCritChance:0.06},desc:'+6% auto-crit chain chance',sources:['iron']},
  royal_ring:{name:"Royal Miner's Ring",rarity:'rare',type:'ring',sell:800,col:'#d9a93a',glow:'#ffe070',effect:{coinMult:0.05},desc:'+5% all income',sources:['gold','grand']},
  sunlit_pick:{name:'Sunlit Pickaxe Head',rarity:'epic',type:'pickaxe',sell:2000,col:'#e7b942',glow:'#ffe47a',effect:{power:20,goldValue:0.05},ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.epic},desc:'+20 power, +5% gold value. Chance for 3-5 fiery auto-crits.',sources:['gold']},
  gearwheel:{name:'Ancient Gearwheel',rarity:'epic',type:'relic',sell:2500,col:'#9e8b75',glow:'#d8c0a0',effect:{swingSpeed:2},desc:'Faster swing speed',sources:['iron','grand']},
  compass:{name:'Crystal Ore Compass',rarity:'epic',type:'relic',sell:3000,col:'#70a8d0',glow:'#a8f0ff',effect:{rareFinder:0.08},desc:'+8% rare ore spawn chance',sources:['grand']},
  cave_bell:{name:'Echoing Cave Bell',rarity:'epic',type:'relic',sell:2750,col:'#8e789d',glow:'#d2a8ff',effect:{coinMult:0.12},desc:'+12% cave income',sources:['iron','grand']},
  alloy_crown:{name:'Molten Alloy Crown',rarity:'epic',type:'relic',sell:3500,col:'#d98230',glow:'#ff9a40',effect:{oreValue:0.10},desc:'+10% all ore value',sources:['grand']},
  alloy_king_pick:{name:"Alloy King's Pickaxe",rarity:'legendary',type:'pickaxe',sell:10000,col:'#d0b060',glow:'#fff090',effect:{power:50,oreValue:0.15},ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.legendary},desc:'+50 power, +15% ore value. Chance for 5-7 golden auto-crits.',sources:['grand']},
  gold_idol:{name:'Blessed Gold Idol',rarity:'legendary',type:'relic',sell:12000,col:'#d6a92a',glow:'#fff080',effect:{forgedSellMult:0.20},desc:'+20% forged item sell value',sources:['gold','grand']},
  forgotten_crown:{name:'Forgotten Crown of the Depths',rarity:'legendary',type:'relic',sell:15000,col:'#b48ce0',glow:'#e8c8ff',effect:{coinMult:0.15},desc:'+15% all income',sources:['grand']},
  relic_core:{name:'Ancient Relic Core',rarity:'legendary',type:'relic',sell:18000,col:'#78b8d8',glow:'#b8f0ff',effect:{forgeLuck:0.10},desc:'+10% forge luck',sources:['grand']},
  heart_mine:{name:'Heart of the Mine',rarity:'legendary',type:'relic',sell:25000,col:'#b83050',glow:'#ff6070',effect:{rareOreValue:0.25},desc:'+25% rare ore value',sources:['grand']},
  first_miner_relic:{name:'Blessed Relic of the First Miner',rarity:'mythic',type:'relic',sell:100000,col:'#f0e6b0',glow:'#fff8c8',effect:{coinMult:0.25,forgeLuck:0.10},desc:'+25% income, +10% forge luck',sources:['grand']},
  mine_heart:{name:'Crystalized Mine Heart',rarity:'mythic',type:'relic',sell:125000,col:'#72d0e0',glow:'#b8ffff',effect:{rareOreValue:0.35},desc:'+35% rare ore value',sources:['grand']},
  buried_king_crown:{name:'Crown of the Buried King',rarity:'mythic',type:'relic',sell:150000,col:'#d0a050',glow:'#ffe58a',effect:{coinMult:0.20,forgedSellMult:0.20},desc:'+20% income, +20% forged sell value',sources:['grand']},
  starforged_pick:{name:'Starforged Pickaxe',rarity:'mythic',type:'pickaxe',sell:200000,col:'#a8b8ff',glow:'#d8e2ff',effect:{power:100,rareFinder:0.15},ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.mythic},desc:'+100 power, +15% rare ore chance. Chance for 6-9 lightning auto-crits.',sources:['grand']},
  living_anvil:{name:'The Living Anvil',rarity:'mythic',type:'relic',sell:250000,col:'#f06a3a',glow:'#ffb070',effect:{forgeLuck:0.20,junkReduction:0.06},desc:'+20% forge luck, fewer junk results',sources:['grand']},
  amber_yield_totem:{name:'Amber Yield Totem',rarity:'uncommon',type:'relic',sell:900,col:'#d48a32',glow:'#ffbd5c',effect:{yield:0.18,oreValue:0.05},desc:'+18% ore yield, +5% ore value',sources:['copper','iron','gold','grand']},
  crystal_rarity_lens:{name:'Crystal Rarity Lens',rarity:'rare',type:'relic',sell:2400,col:'#67c8ff',glow:'#b6f0ff',effect:{rareFinder:0.16,forgeLuck:0.05},desc:'+16% rare ore chance, +5% forge luck',sources:['iron','gold','grand']},
  clockwork_strike_gauntlet:{name:'Clockwork Strike Gauntlet',rarity:'epic',type:'charm',sell:7000,col:'#c48a48',glow:'#ffd078',effect:{power:35,swingSpeed:3},ability:{kind:'chain_auto_crit',chance:0.22,minHits:4,maxHits:6,effect:'lightning'},desc:'+35 power, faster swings, and a strong auto-strike chain chance',sources:['iron','gold','grand']},
  reinforced_storage_satchel:{name:'Reinforced Storage Satchel',rarity:'rare',type:'charm',sell:3000,col:'#8a6a45',glow:'#d7b16f',effect:{inventoryCapacity:8},desc:'+8 backpack storage slots',sources:['copper','iron','grand']},
  ruby_damage_idol:{name:'Ruby Damage Idol',rarity:'epic',type:'relic',sell:9000,col:'#c22f46',glow:'#ff6c7d',effect:{power:45,proxyDamage:0.18,coinMult:0.08},desc:'+45 power, +8% income, and crits echo damage into nearby rocks',sources:['gold','grand']},
  echo_proxy_lantern:{name:'Echo Proxy Lantern',rarity:'legendary',type:'relic',sell:30000,col:'#4ccbd0',glow:'#b5ffff',effect:{proxyDamage:0.35,autoCritChance:0.16,autoCritHits:1,chainTime:45},desc:'Crits echo heavy damage, +16% auto-crit chance, +1 auto-crit hit, and longer weak-point streaks',sources:['grand']},
  cursed_blackjack_chip:{name:'Cursed Blackjack Chip',rarity:'rare',type:'charm',sell:4500,col:'#4b2b60',glow:'#df80ff',effect:{luck:0.10,coinMult:0.08,gamblingLuck:0.12},desc:'+10% luck, +8% income, and +12% gambling luck',sources:['gold','grand']},
  devil_contract_seal:{name:'Devil Contract Seal',rarity:'epic',type:'relic',sell:15000,col:'#8a1f28',glow:'#ff5b66',effect:{forgeLuck:0.14,junkReduction:0.07,forgedSellMult:0.15},desc:'+14% forge luck, less junk, and +15% forged sell value',sources:['gold','grand']},
  aether_ore_magnet:{name:'Aether Ore Magnet',rarity:'legendary',type:'relic',sell:45000,col:'#64b9ff',glow:'#d8ffff',effect:{rareFinder:0.22,rareOreValue:0.30,autoCritChance:0.18,autoCritHits:1,yield:0.12},desc:'+22% rare ore chance, +30% rare ore value, +18% auto-crit chance, +1 auto-crit hit, +12% yield',sources:['grand']},
  tennet:{name:'TenneT',rarity:'god',type:'relic',sell:1000000,col:'#ffffff',glow:'#66f7ff',effect:{power:250,coinMult:0.50,forgeLuck:0.25,rareFinder:0.25,oreValue:0.50,forgedSellMult:0.50,junkReduction:0.10},desc:'Breaks you out of the Miner Tycoon matrix.',sources:['grand']},
};

const CRAFT_ITEM_EFFECT_UPGRADES = {
  dull_stone_pick:{effect:{power:3},desc:'+3 mining power. Chance for 1-2 auto-crits after a weak-point hit.',ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.common}},
  pebble_ring:{effect:{oreValue:0.04},desc:'+4% ore value'},
  cracked_charm:{effect:{stoneValue:0.06,yield:0.04},desc:'+6% stone value, +4% ore yield'},
  copper_button:{effect:{yield:0.08},desc:'+8% ore yield'},
  rusty_gear:{effect:{upgradeDiscount:0.04},desc:'+4% upgrade discount'},
  copper_ring:{effect:{oreValue:0.08},desc:'+8% ore value'},
  spark_charm:{effect:{forgeLuck:0.06},desc:'+6% forge luck'},
  copper_pick:{effect:{power:10},desc:'+10 mining power. Chance for 2-3 auto-crits after a weak-point hit.',ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.uncommon}},
  pouch_buckle:{effect:{inventoryCapacity:3},desc:'+3 inventory slots'},
  lantern_shard:{effect:{rareFinder:0.08},desc:'+8% rare ore chance'},
  iron_pick:{effect:{power:22},desc:'+22 mining power. Chance for 3-5 lightning auto-crits.',ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.rare}},
  gold_necklace:{effect:{oreValue:0.16,coinMult:0.06},desc:'+16% ore value, +6% income'},
  cave_lantern:{effect:{rareFinder:0.12,autoCritChance:0.05},desc:'+12% rare ore chance, +5% auto-crit chain chance'},
  ore_hook:{effect:{autoCritChance:0.10,yield:0.06},desc:'+10% auto-crit chain chance, +6% ore yield'},
  royal_ring:{effect:{coinMult:0.12},desc:'+12% all income'},
  sunlit_pick:{effect:{power:45,goldValue:0.14,yield:0.12},desc:'+45 power, +14% gold value, +12% yield. Chance for 4-7 fiery auto-crits.',ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.epic}},
  gearwheel:{effect:{swingSpeed:5,chainTime:35},desc:'Much faster swings and a longer weak-point streak window'},
  compass:{effect:{rareFinder:0.18},desc:'+18% rare ore spawn chance'},
  cave_bell:{effect:{coinMult:0.22},desc:'+22% cave income'},
  alloy_crown:{effect:{oreValue:0.22},desc:'+22% all ore value'},
  alloy_king_pick:{effect:{power:120,oreValue:0.30,proxyDamage:0.18},desc:'+120 power, +30% ore value. Crits echo damage into nearby rocks.',ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.legendary}},
  gold_idol:{effect:{forgedSellMult:0.35,forgeLuck:0.12},desc:'+35% forged item sell value, +12% forge luck'},
  forgotten_crown:{effect:{coinMult:0.32,rareFinder:0.12},desc:'+32% all income, +12% rare ore chance'},
  relic_core:{effect:{forgeLuck:0.24,junkReduction:0.09},desc:'+24% forge luck, fewer junk results'},
  heart_mine:{effect:{rareOreValue:0.50,yield:0.18},desc:'+50% rare ore value, +18% ore yield'},
  first_miner_relic:{effect:{coinMult:0.45,forgeLuck:0.22},desc:'+45% income, +22% forge luck'},
  mine_heart:{effect:{rareOreValue:0.65,rareFinder:0.18},desc:'+65% rare ore value, +18% rare ore chance'},
  buried_king_crown:{effect:{coinMult:0.38,forgedSellMult:0.38},desc:'+38% income, +38% forged sell value'},
  starforged_pick:{effect:{power:240,rareFinder:0.30,proxyDamage:0.28},desc:'+240 power, +30% rare ore chance. Crits echo heavy damage.',ability:{kind:'chain_auto_crit',...PICKAXE_CHAIN_REACTION.mythic}},
  living_anvil:{effect:{forgeLuck:0.35,junkReduction:0.16,forgedSellMult:0.20},desc:'+35% forge luck, much fewer junk results, +20% forged sell value'},
  tennet:{effect:{power:500,coinMult:0.85,forgeLuck:0.45,rareFinder:0.45,oreValue:0.85,forgedSellMult:0.85,junkReduction:0.25,proxyDamage:0.50},desc:'Breaks you out of the Miner Tycoon matrix harder.'},
};
Object.entries(CRAFT_ITEM_EFFECT_UPGRADES).forEach(([id,patch])=>{
  const def=CRAFT_ITEM_DEFS[id];
  if(!def)return;
  CRAFT_ITEM_DEFS[id]={...def,...patch,effect:{...(def.effect||{}),...(patch.effect||{})},ability:patch.ability||def.ability};
});

const RARITY_ORDER = ['junk','common','uncommon','rare','epic','legendary','mythic','god'];
const RARITY_LABELS = { junk:'Junk', common:'Common', uncommon:'Uncommon', rare:'Rare', epic:'Epic', legendary:'Legendary', mythic:'Mythic', god:'God Tier' };
const CRAFT_RECIPES = [
  { id:'basic', name:'Coal-Soot Forge', icon:'STN', minForgeLevel:0, minValue:15, desc:'Low-value offerings mostly become junk, with a small chance at common gear.', rarities:['junk','common'] },
  { id:'copper', name:'Copper Heat', icon:'CU', minForgeLevel:1, minValue:30, desc:'A hotter forge can produce uncommon goods when the offering has enough value.', rarities:['junk','common','uncommon'] },
  { id:'iron', name:'Iron Bellows', icon:'FE', minForgeLevel:3, minValue:70, desc:'Better heat and richer ore can push results into rare equipment.', rarities:['junk','common','uncommon','rare'] },
  { id:'gold', name:'Gold Crucible', icon:'AU', minForgeLevel:5, minValue:140, desc:'High-value offerings start to reach epic artifacts.', rarities:['junk','common','uncommon','rare','epic'] },
  { id:'relic', name:'Relic Furnace', icon:'RLC', minForgeLevel:7, minValue:280, desc:'Precious ore can carry the forge toward legendary results.', rarities:['junk','common','uncommon','rare','epic','legendary'] },
  { id:'grand', name:'Grand Alloy', icon:'ALL', minForgeLevel:9, minValue:520, desc:'The deepest forge tier can produce mythic and god-tier artifacts from elite offerings.', rarities:['junk','common','uncommon','rare','epic','legendary','mythic','god'] },
];
