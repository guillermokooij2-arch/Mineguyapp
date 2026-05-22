// Canvas, runtime state, progression helpers, inventory, and save/load
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');
// Cursor overlay — separate canvas at z-index 150 so the pickaxe always renders above all panels
const cursorCanvas = document.getElementById('cursor-canvas');
const cursorCtx    = cursorCanvas.getContext('2d');
const WORLD_W = 1280;
const WORLD_H = 720;
const BASE_FPS = 60;
const BASE_FRAME_SECONDS = 1 / BASE_FPS;
const MAX_DELTA_SECONDS = 0.05;
const MAX_CANVAS_DPR = 2;
let W = WORLD_W, H = WORLD_H;
let screenW = 0, screenH = 0, dpr = 1;
let viewScale = 1, viewX = 0, viewY = 0, viewW = WORLD_W, viewH = WORLD_H;
let frameTime = 0;
let lastFrameTime = 0;
let dt = BASE_FRAME_SECONDS;
let dtScale = 1;

function secondsFromFrames(frames){ return frames * BASE_FRAME_SECONDS; }
function framesFromSeconds(seconds){ return seconds / BASE_FRAME_SECONDS; }
function screenToWorld(x,y){
  return { x:(x - viewX) / viewScale, y:(y - viewY) / viewScale };
}
function worldToScreen(x,y){
  return { x:viewX + x * viewScale, y:viewY + y * viewScale };
}
function isScreenInWorld(x,y){
  return x >= viewX && x <= viewX + viewW && y >= viewY && y <= viewY + viewH;
}

// ── IMAGES ───────────────────────────────────────────────────────────────────
function loadImg(src){ const i=new Image(); i.src=src; return i; }
const imgBg    = loadImg('images/backgroundhero-remake.png');
const imgFront = loadImg('images/miner-main-v2.webp');
const imgBack  = loadImg('images/miner-main-v2.webp');
const PICKAXE_CURSOR_PATHS = [
  'images/trader/pickaxe-tier-0.png',
  'images/cursors/pickaxe-tier-1.png',
  'images/cursors/pickaxe-tier-2.png',
  'images/cursors/pickaxe-tier-3.png',
  'images/cursors/pickaxe-tier-4.png',
  'images/cursors/pickaxe-tier-5.png',
  'images/cursors/pickaxe-tier-6.png',
];
const PICKAXE_TIER_AUTO_CRITS = [0,1,2,3,5,6,8];
const PICKAXE_CURSOR_IMAGES = PICKAXE_CURSOR_PATHS.map(loadImg);
const PICKAXE_CURSOR_DRAW_HEIGHT = 68;
const imgPick  = PICKAXE_CURSOR_IMAGES[0];
const imgHandOpen  = loadImg('images/cursors/hand-open.png');
const imgHandPoint = loadImg('images/cursors/hand-point.png');
const ORE_NODE_IMAGES={};
(typeof ORE_KEYS!=='undefined'?ORE_KEYS:['stone','copper','iron','gold']).forEach(type=>{
  ORE_NODE_IMAGES[type]=[];
  const spritePrefix=typeof ORE!=='undefined'&&ORE[type]&&ORE[type].spritePrefix?ORE[type].spritePrefix:type;
  for(let stage=0;stage<=5;stage++) ORE_NODE_IMAGES[type][stage]=loadImg(`images/ore-nodes/${spritePrefix}-${stage}.png`);
});


const LAYOUT = {
  playerFx: 0.12, groundFy: 0.88, oreMinFx: 0.28, oreMaxFx: 0.91,
  oreMinFy: 0.08, oreMaxFy: 0.55, edgeFy: 0.08, cleanRadiusFx: 0.22,
  minOres: 7, maxOres: 11,
  minOreDist: 145, clusterRadius: 130, minerScale: 0.14, minerYOffset: 60,
};

// ── GAME STATE ───────────────────────────────────────────────────────────────
const INVENTORY_SIZE    = 20;
const MAX_CRAFTED_ITEMS = 8;
const gs = { breaks:0, shakeX:0, shakeY:0, shakeAmt:0, mx:600, my:300, wx:600, wy:300 };
const uiCursor = { mode:'world', overInteractive:false, pressed:false, pressT:0 };
const SAVE_KEY        = 'mineTycoonPhase2Save';
const BASE_SWING_DUR  = 18;
const BASE_CHAIN_TIMEOUT = 72;
const CRIT_STATIONARY_STREAK = 5;
const CRIT_RADIUS_DECAY_PER_STREAK = 0.008;
const CRIT_MIN_RADIUS_SCALE = 0.70;
const DEFAULT_STATS = {
  rocksBroken: 0,
  totalRocksBroken: 0,
  highestCritChain: 0,
  totalCritStrikes: 0,
  totalXpEarned: 0,
  totalCoinsEarned: 0,
  totalForgedItems: 0,
  bestForgedRarity: 'common',
};
const MINE_ZONES = {
  starter:{id:'starter',name:'Mineshaft',background:'images/backgroundhero-remake.png',ambience:'oldMine'},
  crystal:{id:'crystal',name:'Crystal Vein',background:'images/crystal-vein-mineshaft.png',ambience:'dangerousMine',minLevel:30},
};
let currentMineZoneId='starter';
function currentMineZone(){ return MINE_ZONES[currentMineZoneId]||MINE_ZONES.starter; }
function setMineZone(id){
  const zone=MINE_ZONES[id]||MINE_ZONES.starter;
  if(currentMineZoneId===zone.id)return;
  currentMineZoneId=zone.id;
  imgBg.src=zone.background;
  rocks=[];
  spawnRocks();
  if(window.GameAudio){
    if(zone.ambience==='dangerousMine')GameAudio.setDangerousMineAmbience(true);
    else GameAudio.setMineAmbience(true);
  }
}
const DEFAULT_TAVERN_STATE = {
  activeBuffs: [],
  activeBarItems: [],
  availableMissions: [],
  activeMissions: [],
  missionRefreshAt: 0,
};
const DEFAULT_DEEP_LIFT_STATE = {
  bestFloor: 0,
  bestDungeon: 0,
  unlockedDungeon: 1,
  selectedDungeon: 1,
  totalRuns: 0,
  completedDungeons: [],
  materials: {
    echoShards: 0,
    boneScrap: 0,
    glitchOre: 0,
  },
  storyFlags: {},
};
const AUTO_CRIT_LIMITS = {
  maxAutoCritsPerSwing: 9,
  delayBetweenAutoCritsMs: 85,
  allowAutoCritsToTriggerAutoCrits: false,
};

const player = {
  username: 'Miner',
  coins: 0,
  xp: 0,
  rareParts: 0,
  anvilTaps: 0,
  upgrades: {
    // Terminal — early game core
    power: 0, accuracy: 0, luck: 0,
    // Trader — pickaxe / yield / quality of life
    pickaxeTier: 0, rareFinder: 0, stackSize: 0, forgeSkill: 0,
  },
  stats: {...DEFAULT_STATS},
  inventory:    new Array(INVENTORY_SIZE).fill(null),
  craftedItems: new Array(MAX_CRAFTED_ITEMS).fill(null),
  tavern: {...DEFAULT_TAVERN_STATE},
  deepLift: {
    ...DEFAULT_DEEP_LIFT_STATE,
    materials: {...DEFAULT_DEEP_LIFT_STATE.materials},
    storyFlags: {},
  },
};


function upgradeCost(id){
  const def=UPGRADE_DEFS[id], level=player.upgrades[id]||0;
  if(id==='forgeSkill')return forgeSkillPartCost(level);
  return Math.max(1,Math.round(def.baseCost*Math.pow(def.costMult,level)*(1-upgradeDiscountBonus())));
}
function upgradesByLocation(loc){
  return Object.entries(UPGRADE_DEFS).filter(([,d])=>d.location===loc);
}

// ── ITEM HELPERS ──────────────────────────────────────────────────────────────
function itemBonus(stat){
  let t=0;
  for(const s of player.inventory){
    if(!s||s.kind!=='item')continue;
    const d=CRAFT_ITEM_DEFS[s.itemId];
    if(d&&d.effect[stat])t+=d.effect[stat];
  }
  for(const s of player.craftedItems){
    if(!s)continue;
    const d=CRAFT_ITEM_DEFS[s.id];
    if(d&&d.effect[stat])t+=d.effect[stat];
  }
  return t;
}

function tavernBuffMult(key){ return typeof getBuffMultiplier==='function'?getBuffMultiplier(key):1; }
function tavernBuffBonus(key){ return typeof getBuffBonus==='function'?getBuffBonus(key):0; }
function damageMultiplier(){ return tavernBuffMult('damageMultiplier'); }
function powerBonus()      { return (player.upgrades.power||0)+itemBonus('power'); }
function luckBonus()       { return ((player.upgrades.luck||0)*0.035+itemBonus('luck')+tavernBuffBonus('luckBonus'))*tavernBuffMult('luckMultiplier'); }
function yieldBonus()      { return (player.upgrades.pickaxeTier||0)*0.25+itemBonus('yield'); }
function rareFinderBonus() { return (player.upgrades.rareFinder||0)*0.03+itemBonus('rareFinder')+tavernBuffBonus('rareDropChanceBonus')+luckBonus()*0.8; }
function coinMultBonus()   { return itemBonus('coinMult'); }
function xpMultBonus()     { return itemBonus('xpMult'); }
function forgeLuckBonus()   { return Math.floor((player.upgrades.forgeSkill||0)/2)*0.01+itemBonus('forgeLuck')+tavernBuffBonus('forgeLuckBonus')+luckBonus()*0.35; }
function yieldChanceBonus(){ return Math.min(0.95,luckBonus()*0.55); }
function gamblingLuckMult(){ return tavernBuffMult('gamblingLuckMultiplier')*(1+luckBonus()*0.75+itemBonus('gamblingLuck')); }
function pickaxeTierProxyDamageBonus(){ const tier=pickaxeTierLevel(); return tier>=3?(tier-2)*0.06:0; }
function proxyDamageBonus(){ return itemBonus('proxyDamage')+pickaxeTierProxyDamageBonus(); }
function autoCritChanceBonus(){ return luckBonus()*0.15+itemBonus('autoCritChance')+tavernBuffBonus('autoCritChanceBonus'); }
function autoCritExtraHits(){ return Math.max(0,Math.floor(itemBonus('autoCritHits'))); }
function pickaxeTierLevel(){ return clamp(Math.floor(player.upgrades.pickaxeTier||0),0,6); }
function pickaxeTierAutoCritChance(){ return pickaxeTierLevel()*0.05; }
function pickaxeTierAutoCritAmount(){ return PICKAXE_TIER_AUTO_CRITS[pickaxeTierLevel()]||0; }
function activePickaxeImage(){ return PICKAXE_CURSOR_IMAGES[pickaxeTierLevel()]||imgPick; }
function weakPointUpgradePower(){
  return Math.max(0,(player.upgrades.accuracy||0)+(itemBonus('swingSpeed')*0.65));
}
function weakPointBaseRadius(){
  return Math.min(48,18+weakPointUpgradePower()*2.35);
}
function weakPointStreakScale(combo=chain.combo){
  const pressure=Math.max(0,combo-(CRIT_STATIONARY_STREAK-1));
  return Math.max(CRIT_MIN_RADIUS_SCALE,1-pressure*CRIT_RADIUS_DECAY_PER_STREAK);
}
function weakPointHitRadius(rock){
  const scale=rock?rockVisualScale(rock):1;
  return weakPointBaseRadius()*weakPointStreakScale()*scale*tavernBuffMult('weakPointWindowMultiplier');
}
function weakPointLocalRadius(rock){
  return weakPointHitRadius(rock)/Math.max(0.001,rockVisualScale(rock));
}
function junkReductionBonus(){ return itemBonus('junkReduction'); }
function forgedSellMultBonus(){ return itemBonus('forgedSellMult'); }
function upgradeDiscountBonus(){ return Math.min(0.35,itemBonus('upgradeDiscount')); }
function pickupRangeBonus(){ return itemBonus('pickupRange'); }
function activeInventorySize(){ return INVENTORY_SIZE+Math.floor(itemBonus('inventoryCapacity')); }
function effectiveMaxStack(type){ return ORE[type].maxStack+(player.upgrades.stackSize||0)*10; }
function oreValueMult(type){
  let mult=coinMultBonus()+itemBonus('oreValue')+itemBonus(type+'Value');
  if(ORE[type]&&ORE[type].rarity==='rare')mult+=itemBonus('rareOreValue');
  return mult;
}

function applyUpgradeStats(){
  const accuracyLevel=Math.max(0,player.upgrades.accuracy||0);
  const swingFrames=Math.max(9,Math.round((BASE_SWING_DUR-itemBonus('swingSpeed'))/tavernBuffMult('swingSpeedMultiplier')));
  const accuracyWindow=accuracyLevel*7+Math.max(0,itemBonus('swingSpeed'))*4;
  const chainFrames=(BASE_CHAIN_TIMEOUT+accuracyWindow+itemBonus('chainTime'))*tavernBuffMult('weakPointWindowMultiplier');
  sw.durFrames=swingFrames;
  sw.dur=secondsFromFrames(swingFrames);
  chain.timeoutFrames=Math.round(chainFrames);
  chain.TIMEOUT=secondsFromFrames(chainFrames);
}

// ── CRAFTED ITEM MANAGEMENT ───────────────────────────────────────────────────
function addCraftedItem(id){
  const i=player.inventory.findIndex((s,idx)=>idx<activeInventorySize()&&s===null);
  if(i===-1)return false;
  player.inventory[i]={kind:'item',itemId:id,count:1};
  applyUpgradeStats();
  return true;
}
function forgeSkillPartCost(level=player.upgrades.forgeSkill||0){
  return Math.round(40*Math.pow(1.85,level));
}
function craftedPartValue(){
  return player.inventory.reduce((sum,slot)=>slot&&slot.kind==='item'?sum+forgedItemSellValue(slot.itemId):sum,0);
}
function consumeCraftedParts(valueNeeded){
  let paid=0;
  const parts=player.inventory
    .map((slot,idx)=>slot&&slot.kind==='item'?{idx,value:forgedItemSellValue(slot.itemId)}:null)
    .filter(Boolean)
    .sort((a,b)=>a.value-b.value);
  for(const part of parts){
    if(paid>=valueNeeded)break;
    paid+=part.value;
    player.inventory[part.idx]=null;
  }
  applyUpgradeStats();
  return paid>=valueNeeded;
}
function offeringValue(recipe, offer=null){
  const cost=offer||{};
  return Object.entries(cost).reduce((sum,[type,count])=>sum+(ORE[type]?ORE[type].val*count:0),0);
}
function offeringOreQuality(offer=null){
  const entries=Object.entries(offer||{}).filter(([type,count])=>ORE[type]&&count>0);
  const totalValue=entries.reduce((sum,[type,count])=>sum+ORE[type].val*count,0);
  if(totalValue<=0)return 0;
  const bestValue=Math.max(...ORE_KEYS.map(type=>ORE[type].val));
  const weighted=entries.reduce((sum,[type,count])=>{
    const ore=ORE[type];
    const value=ore.val*count;
    const raw=(Math.log2(ore.val+1)-1)/(Math.log2(bestValue+1)-1);
    return sum+value*clamp(raw,0,1);
  },0);
  return clamp(weighted/totalValue,0,1);
}
function recipeItemPool(recipe, rarity=null){
  return Object.entries(CRAFT_ITEM_DEFS)
    .filter(([,def])=>(!rarity||def.rarity===rarity))
    .map(([id])=>id);
}
function forgeRarityWeights(recipe, offer=null){
  const value=offeringValue(recipe,offer);
  const minValue=Math.max(1,recipe.minValue||1);
  const quality=offeringOreQuality(offer);
  const valueOver=Math.max(0,value-minValue);
  const valueBoost=clamp(Math.log1p(valueOver/minValue)/Math.log(6),0,1);
  const luck=clamp(forgeLuckBonus(),0,0.45);
  const level=player.upgrades.forgeSkill||0;
  const weights={
    junk:Math.max(28,80-level*4),
    common:20+level*0.9,
    uncommon:level>=1?5+Math.max(0,level-1)*1.1:0,
    rare:level>=3?2.5+Math.max(0,level-3)*0.85:0,
    epic:level>=5?0.9+Math.max(0,level-5)*0.45:0,
    legendary:level>=7?0.22+Math.max(0,level-7)*0.16:0,
    mythic:level>=9?0.045+Math.max(0,level-9)*0.035:0,
    god:level>=10?0.006:0,
  };
  const boost=Math.min(weights.junk-4,(valueBoost*26)+(quality*34)+(luck*60)+junkReductionBonus()*100);
  weights.junk-=boost;
  weights.common+=boost*(0.20+0.12*(1-quality));
  weights.uncommon+=boost*(0.26+0.08*quality);
  weights.rare+=boost*(0.20*quality);
  weights.epic+=boost*(0.13*Math.max(0,quality-0.25));
  weights.legendary+=boost*(0.07*Math.max(0,quality-0.45));
  weights.mythic+=boost*(0.025*Math.max(0,quality-0.65));
  weights.god+=boost*(0.006*Math.max(0,quality-0.82));
  weights.rare*=clamp((quality-0.10)/0.90,0,1);
  weights.epic*=clamp((quality-0.30)/0.70,0,1);
  weights.legendary*=clamp((quality-0.48)/0.52,0,1);
  weights.mythic*=clamp((quality-0.66)/0.34,0,1);
  weights.god*=clamp((quality-0.84)/0.16,0,1);
  RARITY_ORDER.forEach(r=>{
    if(!recipe.rarities.includes(r)||recipeItemPool(recipe,r).length===0)weights[r]=0;
    weights[r]=Math.max(0,weights[r]||0);
  });
  return weights;
}
function rollForgeRecipe(recipe, offer=null){
  const weights=forgeRarityWeights(recipe,offer);
  const total=RARITY_ORDER.reduce((s,r)=>s+weights[r],0);
  let roll=Math.random()*total, rarity=recipe.rarities[0];
  for(const r of RARITY_ORDER){ roll-=weights[r]; if(roll<=0){ rarity=r; break; } }
  const pool=recipeItemPool(recipe,rarity);
  if(pool.length===0)return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
function forgedItemSellValue(id){
  const def=CRAFT_ITEM_DEFS[id];
  return def?Math.round((def.sell||0)*(1+forgedSellMultBonus())):0;
}
function rarityRank(rarity){
  const idx=RARITY_ORDER.indexOf(rarity);
  return idx<0?0:idx;
}
function noteForgedItemStats(itemId){
  const def=CRAFT_ITEM_DEFS[itemId];
  if(!def)return;
  player.stats={...DEFAULT_STATS,...(player.stats||{})};
  player.stats.totalForgedItems=(Number(player.stats.totalForgedItems)||0)+1;
  const current=player.stats.bestForgedRarity||'common';
  if(rarityRank(def.rarity)>rarityRank(current))player.stats.bestForgedRarity=def.rarity;
}
function addPlayerXp(amount){
  const gain=Math.max(0,Math.round(Number(amount)||0));
  if(gain<=0)return;
  player.xp+=gain;
  player.stats={...DEFAULT_STATS,...(player.stats||{})};
  player.stats.totalXpEarned=(Number(player.stats.totalXpEarned)||0)+gain;
}
function addPlayerCoins(amount){
  const gain=Math.max(0,Math.round(Number(amount)||0));
  if(gain<=0)return;
  player.coins+=gain;
  player.stats={...DEFAULT_STATS,...(player.stats||{})};
  player.stats.totalCoinsEarned=(Number(player.stats.totalCoinsEarned)||0)+gain;
}
function setPlayerUsername(name){
  const clean=String(name||'').replace(/[^\w .'-]/g,'').trim().slice(0,18);
  player.username=clean||'Miner';
  saveGame();
}
function getBestPickaxeChainAbility(){
  const tierChance=pickaxeTierAutoCritChance();
  const tierHits=pickaxeTierAutoCritAmount();
  let best=tierHits>0?{
    kind:'chain_auto_crit',
    chance:tierChance,
    minHits:tierHits,
    maxHits:tierHits,
    rarity:'trader',
    itemId:`pickaxeTier${pickaxeTierLevel()}`,
  }:null;
  const slots=[...player.inventory,...player.craftedItems];
  for(const slot of slots){
    const itemId=slot&&(slot.itemId||slot.id);
    const def=itemId&&CRAFT_ITEM_DEFS[itemId];
    const ability=def&&def.ability&&def.ability.kind==='chain_auto_crit'?def.ability:null;
    if(!ability)continue;
    if(!best||rarityRank(def.rarity)>rarityRank(best.rarity)||ability.maxHits>best.maxHits){
      best={...ability,rarity:def.rarity,itemId};
    }
  }
  if(best&&tierHits>0){
    best.chance=Math.max(best.chance||0,tierChance);
    best.minHits=Math.max(best.minHits||1,tierHits);
    best.maxHits=Math.max(best.maxHits||1,tierHits);
  }
  if(best&&autoCritExtraHits()>0){
    best.minHits+=autoCritExtraHits();
    best.maxHits+=autoCritExtraHits();
  }
  return best;
}

// ── XP / LEVEL ────────────────────────────────────────────────────────────────
function xpForLevel(n){ return n*n*20; }
function playerLevel(){ let l=0; while(xpForLevel(l+1)<=player.xp)l++; return l; }
function xpProgress(){
  const l=playerLevel();
  const cur=player.xp-xpForLevel(l);
  const needed=xpForLevel(l+1)-xpForLevel(l);
  return {cur,needed,pct:Math.min(1,cur/needed)};
}

// ── INVENTORY HELPERS ─────────────────────────────────────────────────────────
function inventoryValue(){
  return player.inventory.reduce((s,slot)=>slot&&slot.kind!=='item'?s+Math.round(slot.count*ORE[slot.type].val*(1+oreValueMult(slot.type))):s,0);
}
function hasInventorySpace(){
  return player.inventory.some((slot,idx)=>idx<activeInventorySize()&&slot===null);
}
function countInventoryOre(type){
  return player.inventory.reduce((sum,slot)=>sum+(slot&&slot.kind!=='item'&&slot.type===type?slot.count:0),0);
}
function countInventoryCraftedByRarity(rarity){
  return player.inventory.reduce((sum,slot)=>{
    const def=slot&&slot.kind==='item'&&CRAFT_ITEM_DEFS[slot.itemId];
    return sum+(def&&def.rarity===rarity?1:0);
  },0);
}
function countInventoryCraftedAny(){
  return player.inventory.reduce((sum,slot)=>sum+(slot&&slot.kind==='item'&&CRAFT_ITEM_DEFS[slot.itemId]?1:0),0);
}
function consumeInventoryOre(type,amount){
  let remaining=amount;
  for(const slot of player.inventory){
    if(remaining<=0)break;
    if(slot&&slot.kind!=='item'&&slot.type===type){
      const take=Math.min(remaining,slot.count);
      slot.count-=take;
      remaining-=take;
    }
  }
  player.inventory=player.inventory.map(slot=>slot&&slot.count<=0?null:slot);
}
function consumeInventoryOreValue(valueNeeded){
  let paid=0;
  const oreSlots=player.inventory
    .map((slot,idx)=>slot&&slot.kind!=='item'&&ORE[slot.type]?{idx,type:slot.type,value:ORE[slot.type].val}:null)
    .filter(Boolean)
    .sort((a,b)=>a.value-b.value);
  for(const part of oreSlots){
    const slot=player.inventory[part.idx];
    while(slot&&slot.count>0&&paid<valueNeeded){
      paid+=part.value;
      slot.count--;
    }
    if(slot&&slot.count<=0)player.inventory[part.idx]=null;
    if(paid>=valueNeeded)break;
  }
}
function consumeInventoryCraftedByRarity(rarity,amount){
  let remaining=amount;
  for(let i=0;i<player.inventory.length&&remaining>0;i++){
    const slot=player.inventory[i];
    const def=slot&&slot.kind==='item'&&CRAFT_ITEM_DEFS[slot.itemId];
    if(def&&def.rarity===rarity){
      player.inventory[i]=null;
      remaining--;
    }
  }
}
function consumeInventoryCraftedAny(amount){
  let remaining=amount;
  for(let i=0;i<player.inventory.length&&remaining>0;i++){
    const slot=player.inventory[i];
    const def=slot&&slot.kind==='item'&&CRAFT_ITEM_DEFS[slot.itemId];
    if(def){
      player.inventory[i]=null;
      remaining--;
    }
  }
}
function addToInventory(type, count){
  const maxStack=effectiveMaxStack(type);
  const limit=activeInventorySize();
  for(let i=0;i<limit;i++){
    const slot=player.inventory[i];
    if(slot&&slot.kind!=='item'&&slot.type===type&&slot.count<maxStack){
      const add=Math.min(count,maxStack-slot.count);
      slot.count+=add; count-=add;
      if(count<=0)return true;
    }
  }
  while(count>0){
    let emptyIdx=-1;
    for(let i=0;i<limit;i++) if(!player.inventory[i]){emptyIdx=i;break;}
    if(emptyIdx===-1)return false;
    const add=Math.min(count,maxStack);
    player.inventory[emptyIdx]={type,count:add};
    count-=add;
  }
  return true;
}

// ── CHAIN STATE ───────────────────────────────────────────────────────────────
const chain = {
  rock:null, angle:0, dist:0, targetAngle:0, targetDist:0,
  moveSpeed:0.055, pulse:0, timer:0, combo:0, TIMEOUT:secondsFromFrames(BASE_CHAIN_TIMEOUT), timeoutFrames:BASE_CHAIN_TIMEOUT,
};

// ── SWING STATE ──────────────────────────────────────────────────────────────
const sw = {
  active:false, t:0, dur:secondsFromFrames(BASE_SWING_DUR), durFrames:BASE_SWING_DUR, hitDone:false, clickX:0, clickY:0, clickScreenX:0, clickScreenY:0,
  pivotX:0, pivotY:0,
  REST:Math.PI*0.25, WIND:Math.PI*0.00, STRIKE:Math.PI*0.38, HIT_AT:0.72,
};

// ── SAVE / LOAD ───────────────────────────────────────────────────────────────
function loadSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    player.coins=Number(data.coins)||0;
    player.username=String(data.username||'Miner').slice(0,18)||'Miner';
    player.xp=Number(data.xp)||0;
    player.rareParts=Number(data.rareParts)||0;
    player.anvilTaps=Number(data.anvilTaps)||0;
    if(data.currentMineZoneId&&MINE_ZONES[data.currentMineZoneId]){
      currentMineZoneId=data.currentMineZoneId;
      imgBg.src=currentMineZone().background;
    }
    player.upgrades={...player.upgrades,...(data.upgrades||{})};
    if(Number.isFinite(Number(data.upgrades&&data.upgrades.speed))){
      player.upgrades.accuracy=Math.max(Number(player.upgrades.accuracy)||0,Number(data.upgrades.speed)||0);
    }
    delete player.upgrades.speed;
    player.stats={...DEFAULT_STATS,...(data.stats||{})};
    if(Array.isArray(data.inventory)){
      for(let i=0;i<data.inventory.length;i++) player.inventory[i]=data.inventory[i]||null;
    }
    if(Array.isArray(data.craftedItems)){
      for(let i=0;i<MAX_CRAFTED_ITEMS;i++){
        const slot=data.craftedItems[i]||null;
        if(slot&&CRAFT_ITEM_DEFS[slot.id])addCraftedItem(slot.id);
      }
      player.craftedItems.fill(null);
    }
    player.tavern={
      ...DEFAULT_TAVERN_STATE,
      ...player.tavern,
      ...(data.tavern||{}),
      activeBuffs:Array.isArray(data.tavern&&data.tavern.activeBuffs)?data.tavern.activeBuffs:[],
      activeBarItems:Array.isArray(data.tavern&&data.tavern.activeBarItems)?data.tavern.activeBarItems:[],
      availableMissions:Array.isArray(data.tavern&&data.tavern.availableMissions)?data.tavern.availableMissions:[],
      activeMissions:Array.isArray(data.tavern&&data.tavern.activeMissions)?data.tavern.activeMissions:[],
      missionRefreshAt:Number(data.tavern&&data.tavern.missionRefreshAt)||0,
    };
    player.deepLift={
      ...DEFAULT_DEEP_LIFT_STATE,
      ...(data.deepLift||{}),
      materials:{
        ...DEFAULT_DEEP_LIFT_STATE.materials,
        ...((data.deepLift&&data.deepLift.materials)||{}),
      },
      storyFlags:{
        ...((data.deepLift&&data.deepLift.storyFlags)||{}),
      },
      completedDungeons:Array.isArray(data.deepLift&&data.deepLift.completedDungeons)?data.deepLift.completedDungeons:[],
    };
  }catch(e){}
  applyUpgradeStats();
}
let saveTimer=null;
let savePending=false;
function scheduleSave(delay=300){
  savePending=true;
  if(saveTimer)clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>saveGame(),delay);
}
function flushSave(){
  if(!savePending)return;
  saveGame();
}
function saveGame(){
  if(saveTimer){
    clearTimeout(saveTimer);
    saveTimer=null;
  }
  savePending=false;
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify({
      coins:player.coins, xp:player.xp,
      username:player.username,
      rareParts:player.rareParts,
      anvilTaps:player.anvilTaps,
      currentMineZoneId,
      upgrades:player.upgrades,
      stats:player.stats,
      inventory:player.inventory,
      craftedItems:[],
      tavern:player.tavern,
      deepLift:player.deepLift,
    }));
  }catch(e){}
}
window.addEventListener('beforeunload',flushSave);
