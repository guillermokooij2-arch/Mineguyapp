const TAVERN_AREAS={
  bar:'buy drinks and buffs',
  missions:'accept mining contracts',
  slots:'gamble coins',
  tables:'play card and dice games',
};

const TAVERN_ITEMS=[
  {id:'pint',name:"Miner's Pint",price:95,type:'drink',effect:'productivity',description:'+35% mining yield for 3 minutes',duration:180000,stacking:'additive',modifiers:{oreYieldMultiplier:1.35}},
  {id:'whiskey',name:'Barcelo Imperial',price:230,type:'drink',effect:'power',description:'+60% mining damage for 90 seconds',duration:90000,stacking:'additive',modifiers:{damageMultiplier:1.60}},
  {id:'miner_tonic',name:"Miner's Tonic",price:210,type:'drink',effect:'auto_crit',description:'+20% auto-crit chain chance for 3 minutes',duration:180000,stacking:'additive',modifiers:{autoCritChanceBonus:0.20}},
  {id:'cigarettes',name:'Dust Cigarettes',price:125,type:'smoke',effect:'focus',description:'+35% weak point accuracy window for 3 minutes',duration:180000,stacking:'additive',modifiers:{weakPointWindowMultiplier:1.35}},
  {id:'cigar',name:'Lucky Cigar',price:260,type:'smoke',effect:'gambling_luck',description:'+45% gambling luck for 3 minutes',duration:180000,stacking:'additive',modifiers:{gamblingLuckMultiplier:1.45}},
  {id:'joint',name:'Green Vein Roll',price:320,type:'smoke',effect:'rare_ore_luck',description:'+22% rare ore drop chance for 3 minutes, -8% swing speed',duration:180000,stacking:{mode:'diminishing',multiplierPerExtraStack:0.65},modifiers:{rareDropChanceBonus:0.22,swingSpeedMultiplier:0.92}},
];

const TAVERN_ITEM_ICONS={
  pint:'images/tavern/items/pint.png',
  whiskey:'images/tavern/items/barcelo-imperial.png',
  miner_tonic:'images/tavern/items/miner-tonic.png',
  cigarettes:'images/tavern/items/cigarettes.png',
  cigar:'images/tavern/items/cigar.png',
  joint:'images/tavern/items/joint.png',
};

const BARKEEP_STATES={
  idle:{image:'images/tavern/barkeep/barkeep-idle-v2.png',text:'Back from the rocks, are ya?'},
  hover:{image:'images/tavern/barkeep/barkeep-greet-v2.png',text:'Need a little courage before heading back down?'},
  selling:{image:'images/tavern/barkeep/barkeep-serving-v2.png',text:"That'll put fire in your swing."},
  gambling:{image:'images/tavern/barkeep/barkeep-serving-v2.png',text:"Luck's a funny thing. Expensive too."},
  warning:{image:'images/tavern/barkeep/barkeep-warning-v2.png',text:'Come back when your pockets weigh more.'},
};

const SLOT_BETS=[50,100,250,500];
const SLOT_SYMBOLS=['stone','copper','iron','gold','skull','lantern','pickaxe'];
const SLOT_SYMBOL_LABELS={stone:'Stone',copper:'Copper',iron:'Iron',gold:'Gold',skull:'Skull',lantern:'Lantern',pickaxe:'Pickaxe'};
const SLOT_SYMBOL_IMAGES={
  stone:'images/ore-icons/mined-stone.png',
  copper:'images/ore-icons/mined-copper.png',
  iron:'images/ore-icons/mined-iron.png',
  gold:'images/ore-icons/mined-gold.png',
  skull:'images/tavern/slots/skull-symbol.png',
  lantern:'images/workbench/items/cave_lantern.png',
  pickaxe:'images/trader/pickaxe-tier-3.png'
};
const SLOT_PAYOUTS={
  'stone-stone-stone':8,
  'copper-copper-copper':16,
  'iron-iron-iron':32,
  'gold-gold-gold':60,
  'pickaxe-pickaxe-pickaxe':100,
  'lantern-lantern-lantern':40,
  'skull-skull-skull':0,
};
const DEVILS_DRAW_OUTCOMES=[
  {id:'coin_burst',label:'Coin Burst',type:'boost',rarity:'common',effect:'Gain 900 coins now.',value:900},
  {id:'hellfire_pick',label:'Hellfire Pick',type:'boost',rarity:'rare',effect:'Crit hits hit much harder for 45 seconds.',buff:{id:'hellfire_pick',name:'Hellfire Pick',duration:45000,stacking:'additive',modifiers:{damageMultiplier:2.0}}},
  {id:'devils_luck',label:"Devil's Luck",type:'boost',rarity:'uncommon',effect:'Gambling luck surges for 3 minutes.',buff:{id:'devils_luck',name:"Devil's Luck",duration:180000,stacking:'additive',modifiers:{gamblingLuckMultiplier:1.55}}},
  {id:'ashen_focus',label:'Ashen Focus',type:'boost',rarity:'rare',effect:'Weak points grow much larger for 90 seconds.',buff:{id:'ashen_focus',name:'Ashen Focus',duration:90000,stacking:'additive',modifiers:{weakPointWindowMultiplier:1.75}}},
  {id:'infernal_chain',label:'Infernal Chain',type:'boost',rarity:'epic',effect:'Chain focus and damage surge for 60 seconds.',buff:{id:'infernal_chain',name:'Infernal Chain',duration:60000,stacking:'additive',modifiers:{weakPointWindowMultiplier:1.55,damageMultiplier:1.55}}},
  {id:'bar_tab',label:'Open Bar Tab',type:'boost',rarity:'uncommon',effect:'Gain a Lucky Cigar effect.',barItemId:'cigar'},
  {id:'forge_whisper',label:'Forge Whisper',type:'boost',rarity:'epic',effect:'Forge luck spikes for 2 minutes.',buff:{id:'forge_whisper',name:'Forge Whisper',duration:120000,stacking:'additive',modifiers:{forgeLuckBonus:0.25,rareDropChanceBonus:0.12,gamblingLuckMultiplier:1.25}}},
  {id:'black_vein_blessing',label:'Black Vein Blessing',type:'boost',rarity:'legendary',effect:'Rare ore and yield surge for 2 minutes.',buff:{id:'black_vein_blessing',name:'Black Vein Blessing',duration:120000,stacking:'additive',modifiers:{rareDropChanceBonus:0.35,oreYieldMultiplier:1.45}}},
  {id:'drunken_oracle',label:'Drunken Oracle',type:'boost',rarity:'rare',effect:'Luck and weak-point windows swell for 2 minutes.',buff:{id:'drunken_oracle',name:'Drunken Oracle',duration:120000,stacking:'additive',modifiers:{luckBonus:0.18,weakPointWindowMultiplier:1.45}}},
  {id:'blood_pact',label:'Blood Pact',type:'curse',rarity:'rare',effect:'Gain 1600 coins, but ore yield crashes for 2 minutes.',value:1600,buff:{id:'blood_pact_tax',name:'Blood Pact Tax',duration:120000,stacking:'additive',modifiers:{oreYieldMultiplier:0.55}}},
  {id:'rust_curse',label:'Rust Curse',type:'curse',rarity:'common',effect:'Pickaxe damage is heavily reduced for 2 minutes.',buff:{id:'rust_curse',name:'Rust Curse',duration:120000,stacking:'additive',modifiers:{damageMultiplier:0.55}}},
  {id:'heavy_hands',label:'Heavy Hands',type:'curse',rarity:'common',effect:'Swing speed drops hard for 2 minutes.',buff:{id:'heavy_hands',name:'Heavy Hands',duration:120000,stacking:'additive',modifiers:{swingSpeedMultiplier:0.62}}},
  {id:'bad_omen',label:'Bad Omen',type:'curse',rarity:'uncommon',effect:'Gambling luck is cut down for 3 minutes.',buff:{id:'bad_omen',name:'Bad Omen',duration:180000,stacking:'additive',modifiers:{gamblingLuckMultiplier:0.55}}},
  {id:'cracked_vision',label:'Cracked Vision',type:'curse',rarity:'uncommon',effect:'Weak points shrink badly for 90 seconds.',buff:{id:'cracked_vision',name:'Cracked Vision',duration:90000,stacking:'additive',modifiers:{weakPointWindowMultiplier:0.55}}},
  {id:'debt_mark',label:'Debt Mark',type:'curse',rarity:'rare',effect:'Lose 350 coins and gain worse gambling luck.',value:-350,buff:{id:'debt_mark',name:'Debt Mark',duration:120000,stacking:'additive',modifiers:{gamblingLuckMultiplier:0.70}}},
  {id:'blackout_swing',label:'Blackout Swing',type:'curse',rarity:'epic',effect:'Damage and swing speed are badly cut for 90 seconds.',buff:{id:'blackout_swing',name:'Blackout Swing',duration:90000,stacking:'additive',modifiers:{damageMultiplier:0.42,swingSpeedMultiplier:0.55}}},
  {id:'empty_pockets',label:'Empty Pockets',type:'curse',rarity:'rare',effect:'Lose 900 coins and carry a bad omen.',value:-900,buff:{id:'empty_pockets',name:'Empty Pockets',duration:120000,stacking:'additive',modifiers:{gamblingLuckMultiplier:0.60}}},
  {id:'jackpot',label:'Soul Jackpot',type:'boost',rarity:'legendary',effect:'Gain 3500 coins.',value:3500},
];
const MISSION_REFRESH_TIME=10*60*1000;
const MAX_TAVERN_BUFFS=7;
const TAVERN_SYSTEM_UPDATE_INTERVAL_MS=250;
const TAVERN_BUFF_RENDER_INTERVAL_MS=1000;
const tavernPanel=document.getElementById('tavern-panel');
let tavernBarkeepImg=null,tavernDialogue=null,tavernContent=null,tavernBuffList=null,tavernCoins=null,tavernEntrance=null,tavernApproachLayer=null,tavernStationBack=null;
let tavernMode='entrance';
let tavernStation=null;
let tavernView='bar';
let _lastTavernSystemUpdateAt=-Infinity;
let _lastTavernBuffRenderAt=-Infinity;
let blackjackState=null;
let activeGamblingGame=null;
let diceState=null;
let devilsDrawState=null;
let slotState={spinning:false,lastBet:50,heat:0};
const GAMBLING_CHIPS=[5,10,25,50,100];
const CARD_SUITS=['hearts','diamonds','clubs','spades'];
const CARD_RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function ensureTavernState(){
  if(!player.tavern)player.tavern={};
  if(!Array.isArray(player.tavern.activeBuffs))player.tavern.activeBuffs=[];
  if(!Array.isArray(player.tavern.activeBarItems))player.tavern.activeBarItems=[];
  if(!Array.isArray(player.tavern.availableMissions))player.tavern.availableMissions=[];
  if(!Array.isArray(player.tavern.activeMissions))player.tavern.activeMissions=[];
  if(!Number.isFinite(player.tavern.missionRefreshAt))player.tavern.missionRefreshAt=0;
  if(!player.tavern.activeBarItems.length&&player.tavern.activeBuffs.length){
    player.tavern.activeBarItems=player.tavern.activeBuffs.map(buff=>({id:buff.id,expiresAt:buff.expiresAt}));
  }
}
function updateBuffs(now=Date.now(),renderOpenPanel=true){
  ensureTavernState();
  const before=player.tavern.activeBuffs.length;
  player.tavern.activeBuffs=player.tavern.activeBuffs.filter(buff=>buff.expiresAt>now);
  player.tavern.activeBarItems=player.tavern.activeBarItems.filter(item=>item.expiresAt>now);
  if(before!==player.tavern.activeBuffs.length){
    applyUpgradeStats();
    if(renderOpenPanel&&tavernPanel&&tavernPanel.classList.contains('open'))renderTavern();
  }
}
function getBuffMultiplier(key){
  ensureTavernState();
  updateBuffs(Date.now(),false);
  const grouped={};
  player.tavern.activeBuffs.forEach(buff=>{
    if(!buff.modifiers||buff.modifiers[key]===undefined)return;
    (grouped[buff.id]||(grouped[buff.id]=[])).push(buff);
  });
  return Object.values(grouped).reduce((total,buffs)=>{
    const first=buffs[0],mode=first.stacking&&first.stacking.mode?first.stacking.mode:first.stacking;
    if(mode==='additive'){
      return total*(1+buffs.reduce((sum,buff)=>sum+((buff.modifiers[key]||1)-1),0));
    }
    if(mode==='diminishing'){
      const step=first.stacking.multiplierPerExtraStack||0.65;
      const bonus=buffs.reduce((sum,buff,i)=>sum+(((buff.modifiers[key]||1)-1)*Math.pow(step,i)),0);
      return total*(1+bonus);
    }
    return buffs.reduce((sub,buff)=>sub*(buff.modifiers[key]||1),total);
  },1);
}
function getBuffBonus(key){
  ensureTavernState();
  updateBuffs(Date.now(),false);
  return player.tavern.activeBuffs.reduce((total,buff)=>total+(buff.modifiers&&buff.modifiers[key]||0),0);
}
function applyTavernBuff(item){
  ensureTavernState();
  if(!item)return false;
  if(player.tavern.activeBuffs.length>=MAX_TAVERN_BUFFS){
    setBarkeepState('warning');
    if(tavernDialogue)tavernDialogue.textContent='Seven things on the bar already. Finish one before ordering more.';
    return false;
  }
  const icon=TAVERN_ITEM_ICONS[item.id]||'images/tavern/items/cigar.png';
  const nextBuff={id:item.id,name:item.name,icon,modifiers:item.modifiers,stacking:item.stacking||'additive',expiresAt:Date.now()+(item.duration||item.durationMs||0)};
  player.tavern.activeBuffs.push(nextBuff);
  player.tavern.activeBarItems.push({id:item.id,expiresAt:nextBuff.expiresAt});
  applyUpgradeStats();
  return true;
}
function updateTavernSystems(){
  const now=Date.now();
  if(now-_lastTavernSystemUpdateAt>=TAVERN_SYSTEM_UPDATE_INTERVAL_MS){
    _lastTavernSystemUpdateAt=now;
    updateBuffs(now,true);
  }
  if(tavernPanel&&tavernPanel.classList.contains('open')&&now-_lastTavernBuffRenderAt>=TAVERN_BUFF_RENDER_INTERVAL_MS){
    _lastTavernBuffRenderAt=now;
    renderTavernBuffs();
  }
}
function tavernMoneyText(){ if(tavernCoins)tavernCoins.textContent=player.coins; }
function setBarkeepState(stateKey,autoReset=true){
  const state=BARKEEP_STATES[stateKey]||BARKEEP_STATES.idle;
  if(tavernBarkeepImg)tavernBarkeepImg.src=state.image;
  if(tavernDialogue)tavernDialogue.textContent=state.text;
  if(autoReset&&stateKey!=='idle'){
    clearTimeout(setBarkeepState._timer);
    setBarkeepState._timer=setTimeout(()=>setBarkeepState('idle',false),3200);
  }
}
function formatTime(ms){
  const total=Math.max(0,Math.ceil(ms/1000));
  const m=Math.floor(total/60),s=total%60;
  return `${m}:${String(s).padStart(2,'0')}`;
}
function normalizeTavernStation(station){
  if(station==='shop')return 'bar';
  if(station==='cards')return 'tables';
  return TAVERN_AREAS[station]?station:'bar';
}
function initTavern(){
  tavernBarkeepImg=document.getElementById('tavern-barkeep-img');
  tavernDialogue=document.getElementById('tavern-dialogue');
  tavernContent=document.getElementById('tavern-content');
  tavernBuffList=document.getElementById('tavern-buffs');
  tavernCoins=document.getElementById('tavern-coins');
  tavernEntrance=document.getElementById('tavern-entrance');
  tavernApproachLayer=document.getElementById('tavern-approach-layer');
  tavernStationBack=document.getElementById('tavern-station-back');
  if(!tavernPanel)return;
  ensureTavernState();
  document.getElementById('tavern-close').addEventListener('click',()=>toggleTavern(false));
  document.querySelectorAll('[data-tavern-view]').forEach(btn=>btn.addEventListener('click',()=>setTavernView(btn.dataset.tavernView)));
  document.querySelectorAll('[data-tavern-hotspot]').forEach(btn=>{
    btn.addEventListener('click',()=>openTavernStation(btn.dataset.tavernHotspot));
  });
  if(tavernStationBack)tavernStationBack.addEventListener('click',returnToTavernEntrance);
  const barkeepBtn=document.querySelector('[data-tavern-hotspot="bar"]');
  if(barkeepBtn){
    barkeepBtn.addEventListener('mouseenter',()=>setBarkeepState('hover',false));
    barkeepBtn.addEventListener('mouseleave',()=>setBarkeepState('idle',false));
  }
  refreshTavernMissions(false);
}
function toggleTavern(open=!tavernPanel.classList.contains('open')){
  if(!tavernPanel)return;
  if(open){
    if(window.GameAudio)GameAudio.setTavernAmbience(true);
    openMapDetail(tavernPanel);
    tavernMode='entrance';
    tavernStation=null;
    tavernView='bar';
    blackjackState=null;
    activeGamblingGame=null;
    diceState=null;
    devilsDrawState=null;
    setBarkeepState('idle',false);
    renderTavern();
  }else{
    if(window.GameAudio)GameAudio.setTavernAmbience(false);
    resetTavernStationUi(true);
    returnToBackpackMap();
  }
}
function setTavernView(view){
  openTavernStation(view);
}
function openTavernStation(station){
  tavernMode='station';
  tavernStation=normalizeTavernStation(station);
  tavernView=tavernStation;
  if(tavernStation==='bar')setBarkeepState('hover',false);
  renderTavern();
}
function returnToTavernEntrance(){
  tavernMode='entrance';
  tavernStation=null;
  blackjackState=null;
  activeGamblingGame=null;
  diceState=null;
  devilsDrawState=null;
  setBarkeepState('idle',false);
  renderTavern();
}
function resetTavernStationUi(clearContent=false){
  tavernMode='entrance';
  tavernStation=null;
  blackjackState=null;
  activeGamblingGame=null;
  diceState=null;
  devilsDrawState=null;
  slotState.spinning=false;
  if(!tavernPanel)return;
  tavernPanel.classList.remove('station-open');
  tavernPanel.dataset.tavernStation='entrance';
  if(tavernEntrance)tavernEntrance.setAttribute('aria-hidden','false');
  if(tavernApproachLayer)tavernApproachLayer.setAttribute('aria-hidden','true');
  if(tavernStationBack)tavernStationBack.hidden=true;
  if(tavernContent){
    tavernContent.className='tavern-content tavern-content-entrance';
    if(clearContent)tavernContent.innerHTML='';
  }
  setBarkeepState('idle',false);
}
function renderTavern(){
  if(!tavernContent)return;
  ensureTavernState();
  refreshTavernMissions(false);
  tavernMoneyText();
  renderTavernBuffs();
  tavernPanel.classList.toggle('station-open',tavernMode==='station');
  tavernPanel.dataset.tavernStation=tavernStation||'entrance';
  tavernContent.className=`tavern-content tavern-content-${tavernStation||'entrance'}`;
  if(tavernEntrance)tavernEntrance.setAttribute('aria-hidden',tavernMode==='station'?'true':'false');
  if(tavernApproachLayer)tavernApproachLayer.setAttribute('aria-hidden',tavernMode==='station'?'false':'true');
  if(tavernStationBack)tavernStationBack.hidden=tavernMode!=='station';
  document.querySelectorAll('[data-tavern-view]').forEach(btn=>btn.classList.toggle('active',normalizeTavernStation(btn.dataset.tavernView)===tavernStation));
  if(tavernMode!=='station'){
    tavernContent.innerHTML='<div class="tavern-entrance-help"><strong>Choose a station</strong><span>Walk to the bar, mission board, slots, or gambling tables.</span></div>';
    return;
  }
  if(tavernStation==='missions')renderMissionBoard();
  else if(tavernStation==='slots')renderSlots();
  else if(tavernStation==='tables')renderGamblingTables();
  else renderTavernShop();
}
function renderTavernBuffs(){
  if(!tavernBuffList)return;
  ensureTavernState();
  const now=Date.now();
  tavernBuffList.setAttribute('aria-label',`Active tavern buffs ${player.tavern.activeBuffs.length}/${MAX_TAVERN_BUFFS}`);
  const counts=player.tavern.activeBuffs.reduce((acc,buff)=>{acc[buff.id]=(acc[buff.id]||0)+1;return acc;},{});
  tavernBuffList.innerHTML=Array.from({length:MAX_TAVERN_BUFFS},(_,i)=>{
    const buff=player.tavern.activeBuffs[i];
    if(!buff)return '<span class="tavern-buff-slot empty" aria-hidden="true"></span>';
    const icon=buff.icon||TAVERN_ITEM_ICONS[buff.id]||'images/tavern/items/cigar.png';
    const label=`${buff.name} ${formatTime(buff.expiresAt-now)}`;
    return `<span class="tavern-buff-slot active" title="${label}" aria-label="${label}"><img src="${icon}" alt=""><strong>${formatTime(buff.expiresAt-now)}</strong>${counts[buff.id]>1?`<em>x${counts[buff.id]}</em>`:''}</span>`;
  }).join('');
}
function renderTavernShop(){
  tavernContent.innerHTML=`<div class="tavern-station-head"><span>Bar Counter</span><strong>Order before heading back down</strong></div><div class="bar-counter-layout"><div class="tavern-shop-grid">${TAVERN_ITEMS.map((item,i)=>`
    <button type="button" class="tavern-shop-item tavern-shop-item-${i+1}" data-buy-tavern="${item.id}" aria-label="Buy ${item.name} for ${item.price} coins. ${item.description}">
      <span class="tavern-shop-icon"><img src="${TAVERN_ITEM_ICONS[item.id]}" alt=""></span>
      <span class="tavern-shop-tooltip" role="tooltip"><strong>${item.name}</strong><em>${item.price}c</em><span>${item.description}</span><small>${item.type} - ${Math.round(item.duration/1000)}s</small></span>
    </button>`).join('')}</div></div>`;
  tavernContent.querySelectorAll('[data-buy-tavern]').forEach(btn=>btn.addEventListener('click',()=>buyTavernItem(btn.dataset.buyTavern,btn)));
}
function buyTavernItem(id,target=null){
  const item=TAVERN_ITEMS.find(i=>i.id===id);
  if(!item)return;
  if(player.coins<item.price){
    setBarkeepState('warning');
    return;
  }
  if(player.tavern.activeBuffs.length>=MAX_TAVERN_BUFFS){
    applyTavernBuff(item);
    return;
  }
  player.coins-=item.price;
  if(!applyTavernBuff(item))return;
  if(window.GameAudio)GameAudio.playPurchase();
  if(target){
    target.classList.add('tavern-item-bought');
    if(typeof spawnUiSparkles==='function')spawnUiSparkles(target,{amount:12,tone:item.effect==='gambling_luck'?'purple':'gold',spread:145,lift:110});
    if(typeof pulseElement==='function')pulseElement(target,'tavern-buy-pulse',560);
    setTimeout(()=>target.classList.remove('tavern-item-bought'),620);
  }
  setBarkeepState(item.effect==='gambling_luck'?'gambling':'selling');
  saveGame();
  tavernMoneyText();
  renderTavernBuffs();
}
function tavernMissionOrePool(level){
  const pool=['stone'];
  if(level>=3)pool.push('copper');
  if(level>=5)pool.push('iron');
  if(level>=8)pool.push('gold');
  if(level>=30)pool.push('hardstone','diamond','ruby');
  if(level>=38)pool.push('aether');
  return pool.filter(type=>ORE[type]);
}
function weightedMissionOre(level){
  const pool=tavernMissionOrePool(level);
  const weights=pool.map(type=>{
    const ore=ORE[type];
    const rarityBoost=ore.rarity==='legendary'?0.25:ore.rarity==='epic'?0.45:ore.rarity==='rare'?0.8:1.5;
    return Math.max(0.08,rarityBoost/(Math.sqrt(ore.val)||1));
  });
  const total=weights.reduce((sum,n)=>sum+n,0);
  let roll=Math.random()*total;
  for(let i=0;i<pool.length;i++){ roll-=weights[i]; if(roll<=0)return pool[i]; }
  return pool[0];
}
function missionOreAmount(type,level,kind='delivery'){
  const ore=ORE[type];
  const targetValue=kind==='rush'?70+level*8:kind==='risk'?120+level*13:95+level*10;
  const maxByRarity=ore.rarity==='legendary'?3:ore.rarity==='epic'?5:ore.rarity==='rare'?8:ore.rarity==='uncommon'?18:45;
  return Math.max(1,Math.min(maxByRarity,Math.ceil(targetValue/Math.max(1,ore.val))));
}
function missionTemplate(type,level){
  const oreByLevel=weightedMissionOre(level);
  const ore=ORE[oreByLevel];
  const id=`${type}_${oreByLevel}_${Date.now()}_${Math.floor(Math.random()*9999)}`;
  if(type==='ore_delivery'){
    const amount=missionOreAmount(oreByLevel,level,'delivery');
    return {id,type,title:`${ore.lbl} for the Rail Crew`,description:`Deliver ${amount} ${ore.lbl}.`,requirement:{ore:oreByLevel,amount},reward:{coins:Math.round(ore.val*amount*(2.6+level*0.08))}};
  }
  if(type==='mixed_value'){
    const amount=Math.round(90+level*18);
    return {id,type,title:'Mixed Ore Tab',description:`Deliver any mined ore worth ${amount} value.`,requirement:{oreValue:amount},reward:{coins:Math.round(amount*1.75),rareParts:level>=8?1:0}};
  }
  if(type==='break_rocks'){
    const amount=ore.rarity==='legendary'?4:ore.rarity==='epic'?7:ore.rarity==='rare'?12:ore.rarity==='uncommon'?28:70;
    return {id,type,title:`Clear the ${ore.lbl} Shaft`,description:`Break ${amount} ${ore.lbl} rocks.`,requirement:{rockType:oreByLevel,amount},progress:0,reward:{coins:Math.round(80+ore.val*amount*1.6)}};
  }
  if(type==='timed_contract'){
    const amount=missionOreAmount(oreByLevel,level,'rush');
    const limit=150000;
    return {id,type,title:`${ore.lbl} Rush`,description:`Mine ${amount} ${ore.lbl} within ${Math.round(limit/60000)} minutes.`,timeLimit:limit,requirement:{ore:oreByLevel,amount},progress:0,reward:{coins:Math.round(140+ore.val*amount*4.2)}};
  }
  if(type==='rare_find')return {id,type:'rare_find',title:'Something Shiny',description:`Find ${level>=12?5:3} rare ore drops while mining.`,requirement:{rareDrops:level>=12?5:3},progress:0,reward:{coins:level>=12?520:250,buffItem:'Lucky Cigar'}};
  if(type==='crafted_delivery'){
    const rarity=level>=16?'rare':level>=9?'uncommon':'common';
    const amount=rarity==='rare'?1:level>=12?2:1;
    return {id,type:'crafted_delivery',title:'Parts for the Wagon',description:`Deliver ${amount} ${RARITY_LABELS[rarity]} forged part${amount>1?'s':''}.`,requirement:{craftedRarity:rarity,amount},reward:{coins:rarity==='rare'?1200:rarity==='uncommon'?650:300,rareParts:rarity==='common'?1:2}};
  }
  if(type==='forge_any'){
    const amount=level>=10?3:2;
    return {id,type:'forge_any',title:'Fresh From the Anvil',description:`Deliver ${amount} forged item${amount>1?'s':''} of any rarity.`,requirement:{craftedAny:amount},reward:{coins:Math.round(420+level*55),rareParts:1}};
  }
  if(type==='blackjack_winnings'){
    const amount=Math.round(1800+level*400);
    const rarity=level>=14?'epic':'rare';
    return {id,type,title:'Blackjack Marker',description:`Win ${amount} total coins at Blackjack. It can happen across many hands.`,requirement:{gamblingGame:'blackjack',amount},progress:0,reward:{coins:Math.round(260+level*30),itemRarity:rarity}};
  }
  if(type==='dice_winnings'){
    const amount=Math.round(900+level*260);
    const rarity=level>=10?'rare':'common';
    return {id,type,title:'Dice Cup Debt',description:`Win ${amount} total coins at the Dice Table.`,requirement:{gamblingGame:'dice',amount},progress:0,reward:{coins:Math.round(180+level*24),itemRarity:rarity}};
  }
  if(type==='slots_winnings'){
    const amount=level>=16?5:level>=9?4:3;
    const rarity=level>=16?'epic':'rare';
    return {id,type,title:'Three-of-a-Kind Tab',description:`Hit ${amount} three-of-a-kind slot results. Any symbol counts, even skulls.`,requirement:{slotTriples:amount},progress:0,reward:{coins:Math.round(500+level*58),itemRarity:rarity}};
  }
  if(type==='devil_curses'){
    const amount=level>=13?5:3;
    const rarity=level>=13?'epic':'rare';
    return {id,type,title:'Curse Collector',description:`Take ${amount} curses from Devil's Draw and bring proof you survived.`,requirement:{devilCurses:amount},progress:0,reward:{coins:Math.round(320+level*32),itemRarity:rarity}};
  }
  if(type==='devil_boosts'){
    const amount=level>=12?6:4;
    const rarity=level>=12?'rare':'common';
    return {id,type,title:'Good Cards Only',description:`Reveal ${amount} helpful Devil's Draw cards.`,requirement:{devilBoosts:amount},progress:0,reward:{coins:Math.round(240+level*26),itemRarity:rarity,barItemId:'joint'}};
  }
  const riskOre=level>=30?oreByLevel:(level>=5?'iron':'copper');
  const risk=ORE[riskOre];
  const amount=missionOreAmount(riskOre,level,'risk');
  return {id,type:'risk_contract',title:'Double or Dust',description:`Pay ${80+level*5}c. Mine ${amount} ${risk.lbl} within 3 minutes.`,entryCost:80+level*5,timeLimit:180000,requirement:{ore:riskOre,amount},progress:0,reward:{coins:Math.round(260+risk.val*amount*5)}};
}
function generateTavernMissions(level){
  const pool=[
    missionTemplate('ore_delivery',level),
    missionTemplate('mixed_value',level),
    missionTemplate('break_rocks',level),
    missionTemplate('timed_contract',level),
    missionTemplate('blackjack_winnings',level),
    missionTemplate('dice_winnings',level),
    missionTemplate('slots_winnings',level),
    missionTemplate('devil_curses',level),
    missionTemplate('devil_boosts',level),
  ];
  if(level>=3)pool.push(missionTemplate('rare_find',level));
  if(level>=5)pool.push(missionTemplate('crafted_delivery',level));
  if(level>=6)pool.push(missionTemplate('forge_any',level));
  if(level>=7)pool.push(missionTemplate('risk_contract',level));
  return pool.sort(()=>Math.random()-0.5).slice(0,Math.min(8,pool.length));
}
function refreshTavernMissions(force=false){
  ensureTavernState();
  const now=Date.now();
  if(force||!player.tavern.availableMissions.length||player.tavern.missionRefreshAt<=now){
    player.tavern.availableMissions=generateTavernMissions(playerLevel());
    player.tavern.missionRefreshAt=now+MISSION_REFRESH_TIME;
    saveGame();
  }
}
function renderMissionBoard(){
  ensureTavernState();
  const refreshIn=formatTime(player.tavern.missionRefreshAt-Date.now());
  const available=player.tavern.availableMissions.map(m=>missionCardHtml(m,false)).join('');
  const active=player.tavern.activeMissions.map(m=>missionCardHtml(m,true)).join('');
  tavernContent.innerHTML=`<div class="tavern-station-head"><span>Mission Board</span><strong>Pin contracts, finish work, collect pay</strong><button type="button" id="refresh-missions">Refresh ${refreshIn}</button></div><div class="tavern-mission-layout">
    <section class="tavern-mission-board-zone" aria-label="Available missions"><div class="tavern-mission-list">${available}</div></section>
    <section class="tavern-active-contract-zone" aria-label="Active contracts"><div class="tavern-section-head"><h3>Active</h3><span>${player.tavern.activeMissions.length}/3</span></div><div class="tavern-mission-list">${active||'<p class="tavern-empty">No contracts accepted.</p>'}</div></section>
  </div>`;
  tavernContent.querySelector('#refresh-missions').addEventListener('click',()=>{refreshTavernMissions(true);renderMissionBoard();});
  tavernContent.querySelectorAll('[data-accept-mission]').forEach(btn=>btn.addEventListener('click',()=>acceptMission(btn.dataset.acceptMission)));
  tavernContent.querySelectorAll('[data-turnin-mission]').forEach(btn=>btn.addEventListener('click',()=>turnInMission(btn.dataset.turninMission)));
  tavernContent.querySelectorAll('[data-remove-mission]').forEach(btn=>btn.addEventListener('click',()=>removeExpiredMission(btn.dataset.removeMission)));
}
function missionRequirementText(m){
  if(m.type==='ore_delivery')return `${ORE[m.requirement.ore].lbl}: ${inventoryOreCount(m.requirement.ore)}/${m.requirement.amount}`;
  if(m.type==='mixed_value')return `Ore value: ${inventoryValue()}/${m.requirement.oreValue}`;
  if(m.type==='break_rocks')return `${ORE[m.requirement.rockType].lbl} rocks: ${m.progress||0}/${m.requirement.amount}`;
  if(m.type==='timed_contract'||m.type==='risk_contract')return `${ORE[m.requirement.ore].lbl}: ${m.progress||0}/${m.requirement.amount} - ${formatTime((m.startedAt||Date.now())+m.timeLimit-Date.now())}`;
  if(m.type==='rare_find')return `Rare drops: ${m.progress||0}/${m.requirement.rareDrops}`;
  if(m.type==='crafted_delivery')return `${RARITY_LABELS[m.requirement.craftedRarity]} forged part: ${inventoryCraftedCount(m.requirement.craftedRarity)}/${m.requirement.amount}`;
  if(m.type==='forge_any')return `Forged items: ${inventoryCraftedAnyCount()}/${m.requirement.craftedAny}`;
  if(['blackjack_winnings','dice_winnings'].includes(m.type))return `${gamblingGameLabel(m.requirement.gamblingGame)} winnings: ${m.progress||0}/${m.requirement.amount}c`;
  if(m.type==='slots_winnings')return `Three of a kind: ${m.progress||0}/${m.requirement.slotTriples||m.requirement.amount||3}`;
  if(m.type==='devil_curses')return `Curses taken: ${m.progress||0}/${m.requirement.devilCurses}`;
  if(m.type==='devil_boosts')return `Good cards: ${m.progress||0}/${m.requirement.devilBoosts}`;
  return '';
}
function missionRewardText(m){
  return `${m.reward.coins||0} coins${m.reward.buffItem?`, ${m.reward.buffItem}`:''}${m.reward.barItemId?`, ${barItemName(m.reward.barItemId)}`:''}${m.reward.itemRarity?`, random ${RARITY_LABELS[m.reward.itemRarity]} forged item`:''}${m.reward.rareParts?', rare part':''}`;
}
function gamblingGameLabel(game){return game==='blackjack'?'Blackjack':game==='dice'?'Dice':game==='slots'?'Slots':game;}
function barItemName(id){const item=TAVERN_ITEMS.find(i=>i.id===id);return item?item.name:id;}
function missionCardHtml(m,active){
  const complete=active&&isMissionComplete(m);
  const expired=active&&isMissionExpired(m);
  return `<article class="tavern-mission-note${expired?' failed':''}">
    <h4>${m.title}</h4><p>${m.description}</p>
    <span>Need: ${missionRequirementText(m)}</span>
    <span>Reward: ${missionRewardText(m)}</span>
    ${active
      ? expired?`<button type="button" data-remove-mission="${m.id}">Remove Expired</button>`:`<button type="button" data-turnin-mission="${m.id}" ${complete?'':'disabled'}>${complete?'Turn In':'In Progress'}</button>`
      : `<button type="button" data-accept-mission="${m.id}">${m.entryCost?`Pay ${m.entryCost}c`:'Accept'}</button>`}
  </article>`;
}
function acceptMission(id){
  ensureTavernState();
  if(player.tavern.activeMissions.length>=3)return;
  const idx=player.tavern.availableMissions.findIndex(m=>m.id===id);
  if(idx<0)return;
  const mission={...player.tavern.availableMissions[idx],startedAt:Date.now(),progress:player.tavern.availableMissions[idx].progress||0};
  if(mission.entryCost){
    if(player.coins<mission.entryCost){setBarkeepState('warning');return;}
    player.coins-=mission.entryCost;
  }
  player.tavern.availableMissions.splice(idx,1);
  player.tavern.activeMissions.push(mission);
  if(window.GameAudio)GameAudio.playMapOpenClose();
  saveGame();
  tavernMoneyText();
  renderMissionBoard();
}
function isMissionComplete(m){
  if(m.type==='ore_delivery')return inventoryOreCount(m.requirement.ore)>=m.requirement.amount;
  if(m.type==='mixed_value')return inventoryValue()>=m.requirement.oreValue;
  if(m.type==='crafted_delivery')return inventoryCraftedCount(m.requirement.craftedRarity)>=m.requirement.amount;
  if(m.type==='forge_any')return inventoryCraftedAnyCount()>=m.requirement.craftedAny;
  if(m.type==='timed_contract'||m.type==='risk_contract')return Date.now()<=(m.startedAt||0)+m.timeLimit&&(m.progress||0)>=m.requirement.amount;
  if(m.type==='rare_find')return (m.progress||0)>=m.requirement.rareDrops;
  if(['blackjack_winnings','dice_winnings'].includes(m.type))return (m.progress||0)>=m.requirement.amount;
  if(m.type==='slots_winnings')return (m.progress||0)>=(m.requirement.slotTriples||m.requirement.amount||3);
  if(m.type==='devil_curses')return (m.progress||0)>=m.requirement.devilCurses;
  if(m.type==='devil_boosts')return (m.progress||0)>=m.requirement.devilBoosts;
  return (m.progress||0)>=m.requirement.amount;
}
function isMissionExpired(m){
  return !!(m&&m.timeLimit&&m.startedAt&&Date.now()>m.startedAt+m.timeLimit&&!isMissionComplete(m));
}
function removeExpiredMission(id){
  const idx=player.tavern.activeMissions.findIndex(m=>m.id===id);
  if(idx<0)return;
  if(!isMissionExpired(player.tavern.activeMissions[idx]))return;
  player.tavern.activeMissions.splice(idx,1);
  if(window.GameAudio)GameAudio.playMapOpenClose();
  saveGame();
  renderMissionBoard();
}
function turnInMission(id){
  const idx=player.tavern.activeMissions.findIndex(m=>m.id===id);
  if(idx<0)return;
  const m=player.tavern.activeMissions[idx];
  if(!isMissionComplete(m))return;
  let rewardItemId=null;
  if(m.reward.itemRarity){
    if(!player.inventory.some((s,slotIdx)=>slotIdx<activeInventorySize()&&s===null)){
      setBarkeepState('warning');
      if(tavernDialogue)tavernDialogue.textContent='Make room in your backpack before I hand over that forged item.';
      return;
    }
    rewardItemId=randomCraftedItemByRarity(m.reward.itemRarity);
    if(!rewardItemId){
      setBarkeepState('warning');
      if(tavernDialogue)tavernDialogue.textContent='The reward crate came up empty. Try another contract.';
      return;
    }
  }
  if(m.type==='ore_delivery')consumeOre(m.requirement.ore,m.requirement.amount);
  if(m.type==='mixed_value')consumeOreValue(m.requirement.oreValue);
  if(m.type==='crafted_delivery')consumeCraftedByRarity(m.requirement.craftedRarity,m.requirement.amount);
  if(m.type==='forge_any')consumeCraftedAny(m.requirement.craftedAny);
  addPlayerCoins(m.reward.coins||0);
  if(m.reward.rareParts)player.rareParts=(player.rareParts||0)+m.reward.rareParts;
  if(m.reward.buffItem==='Lucky Cigar')applyTavernBuff(TAVERN_ITEMS.find(i=>i.id==='cigar'));
  if(m.reward.barItemId)applyTavernBuff(TAVERN_ITEMS.find(i=>i.id===m.reward.barItemId));
  if(rewardItemId){
    const added=addCraftedItem(rewardItemId);
    if(!added){
      setBarkeepState('warning');
      return;
    }
  }
  player.tavern.activeMissions.splice(idx,1);
  if(window.GameAudio)GameAudio.playPurchase();
  floatTxt(W*0.5,H*0.22,`Contract paid +${m.reward.coins||0}c`,'#ffd76a',true);
  showMissionRewardPopup(m,rewardItemId);
  saveGame();
  tavernMoneyText();
  renderInventory();
  renderMissionBoard();
}
function inventoryOreCount(type){return player.inventory.reduce((sum,s)=>sum+(s&&s.kind!=='item'&&s.type===type?s.count:0),0);}
function inventoryCraftedCount(rarity){return player.inventory.reduce((sum,s)=>{const d=s&&s.kind==='item'&&CRAFT_ITEM_DEFS[s.itemId];return sum+(d&&d.rarity===rarity?1:0);},0);}
function inventoryCraftedAnyCount(){return player.inventory.reduce((sum,s)=>sum+(s&&s.kind==='item'&&CRAFT_ITEM_DEFS[s.itemId]?1:0),0);}
function consumeOre(type,amount){
  let rem=amount;
  for(const slot of player.inventory){if(rem<=0)break;if(slot&&slot.kind!=='item'&&slot.type===type){const take=Math.min(rem,slot.count);slot.count-=take;rem-=take;}}
  player.inventory=player.inventory.map(s=>s&&s.count<=0?null:s);
}
function consumeOreValue(valueNeeded){
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
function consumeCraftedByRarity(rarity,amount){
  let rem=amount;
  for(let i=0;i<player.inventory.length&&rem>0;i++){const s=player.inventory[i],d=s&&s.kind==='item'&&CRAFT_ITEM_DEFS[s.itemId];if(d&&d.rarity===rarity){player.inventory[i]=null;rem--;}}
}
function consumeCraftedAny(amount){
  let rem=amount;
  for(let i=0;i<player.inventory.length&&rem>0;i++){const s=player.inventory[i],d=s&&s.kind==='item'&&CRAFT_ITEM_DEFS[s.itemId];if(d){player.inventory[i]=null;rem--;}}
}
function randomCraftedItemByRarity(rarity){
  const pool=Object.entries(CRAFT_ITEM_DEFS)
    .filter(([,def])=>def.rarity===rarity&&def.rarity!=='junk')
    .map(([id])=>id);
  if(!pool.length)return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
function itemIconPath(itemId){return `images/workbench/items/${itemId}.png`;}
function showMissionRewardPopup(m,itemId){
  const old=document.querySelector('.tavern-reward-popup');
  if(old)old.remove();
  const item=itemId&&CRAFT_ITEM_DEFS[itemId];
  const wrap=document.createElement('div');
  wrap.className='tavern-reward-popup';
  wrap.innerHTML=`<div class="tavern-reward-popup-title">Contract Paid</div>
    <div class="tavern-reward-popup-items">
      <span><img src="images/workbench/items/coin_bag_reward.png" alt=""><b>${m.reward.coins||0}c</b></span>
      ${item?`<span class="rarity-${item.rarity}"><img src="${itemIconPath(itemId)}" alt=""><b>${item.name}</b></span>`:''}
    </div>`;
  wrap.addEventListener('click',()=>wrap.remove());
  document.body.appendChild(wrap);
  setTimeout(()=>{if(wrap.parentNode)wrap.remove();},2400);
}
function trackTavernMission(kind,data={}){
  ensureTavernState();
  let changed=false;
  player.tavern.activeMissions.forEach(m=>{
    if(m.type==='break_rocks'&&kind==='rockBroken'&&m.requirement.rockType===data.type){m.progress=Math.min(m.requirement.amount,(m.progress||0)+1);changed=true;}
    if(m.type==='timed_contract'&&kind==='oreCollected'&&m.requirement.ore===data.type&&Date.now()<m.startedAt+m.timeLimit){m.progress=Math.min(m.requirement.amount,(m.progress||0)+(data.count||1));changed=true;}
    if(m.type==='risk_contract'&&kind==='oreCollected'&&m.requirement.ore===data.type&&(!m.timeLimit||Date.now()<m.startedAt+m.timeLimit)){m.progress=Math.min(m.requirement.amount,(m.progress||0)+(data.count||1));changed=true;}
    if(m.type==='rare_find'&&kind==='rareDrop'){m.progress=Math.min(m.requirement.rareDrops,(m.progress||0)+(data.count||1));changed=true;}
    if(['blackjack_winnings','dice_winnings'].includes(m.type)&&kind==='gamblingWin'&&m.requirement.gamblingGame===data.game){
      m.progress=Math.min(m.requirement.amount,(m.progress||0)+Math.max(0,Math.round(data.amount||0)));
      changed=true;
    }
    if(m.type==='slots_winnings'&&kind==='slotTriple'){
      const need=m.requirement.slotTriples||m.requirement.amount||3;
      m.progress=Math.min(need,(m.progress||0)+1);
      changed=true;
    }
    if(m.type==='devil_curses'&&kind==='devilsDraw'&&data.outcomeType==='curse'){m.progress=Math.min(m.requirement.devilCurses,(m.progress||0)+1);changed=true;}
    if(m.type==='devil_boosts'&&kind==='devilsDraw'&&data.outcomeType==='boost'){m.progress=Math.min(m.requirement.devilBoosts,(m.progress||0)+1);changed=true;}
  });
  if(changed)scheduleSave();
}
function renderSlots(){
  tavernContent.innerHTML=`<div class="slot-station-shell"><div class="tavern-station-head slot-station-head"><span>Slot Corner</span><strong>Pull the lever. Reels stop one by one.</strong></div>
  <div class="slot-cabinet" id="slot-cabinet">
    <div class="slot-machine-shell">
      <img class="slot-console-foreground" src="images/tavern/slots/slot-console-foreground.png" alt="">
      <div class="slot-lamp-row"><i></i><i></i><i></i><i></i><i></i></div>
      <img class="slot-cabinet-art" src="images/tavern/gambling/slot-machine-hover.png" alt="">
      <div id="slot-reels" class="slot-reels" aria-live="polite">
        ${[0,1,2].map(i=>`<span class="slot-reel idle" data-reel="${i}" aria-label="Waiting reel"><em>?</em></span>`).join('')}
      </div>
      <div id="slot-result" class="tavern-result slot-result-plaque">Pick a bet. Pull the lever.</div>
      <div class="slot-bet-panel" role="group" aria-label="Slot bets">
        ${SLOT_BETS.map(b=>`<button type="button" class="slot-bet-btn${b===slotState.lastBet?' selected':''}" data-slot-bet="${b}">${b}c</button>`).join('')}
      </div>
      <button type="button" id="slot-lever" class="slot-lever" aria-label="Pull slot lever"><span></span></button>
      <div class="slot-heat"><span style="height:${Math.round(slotState.heat*100)}%"></span></div>
      <div class="slot-fx-layer" id="slot-fx-layer"></div>
    </div>
    <aside class="slot-payout-plaque">
      <strong>Payouts</strong>
      ${Object.entries(SLOT_PAYOUTS).filter(([,mult])=>mult>0).map(([key,mult])=>`<span>${SLOT_SYMBOL_LABELS[key.split('-')[0]]} x3 <b>x${mult}</b></span>`).join('')}
    </aside>
  </div></div>`;
  tavernContent.querySelectorAll('[data-slot-bet]').forEach(btn=>btn.addEventListener('click',()=>selectSlotBet(Number(btn.dataset.slotBet))));
  const lever=tavernContent.querySelector('#slot-lever');
  if(lever)lever.addEventListener('click',()=>playSlots(slotState.lastBet));
}
function selectSlotBet(bet){
  if(slotState.spinning)return;
  slotState.lastBet=bet;
  tavernContent.querySelectorAll('[data-slot-bet]').forEach(btn=>btn.classList.toggle('selected',Number(btn.dataset.slotBet)===bet));
  const result=document.getElementById('slot-result');
  if(result)result.textContent=`${bet}c set. Pull the lever.`;
}
function rollSlotSymbol(){
  const luck=gamblingLuckMult();
  const weights={stone:34,copper:25,iron:16,gold:8,skull:14,lantern:8,pickaxe:4};
  weights.gold*=luck; weights.lantern*=luck; weights.pickaxe*=luck; weights.skull/=luck;
  const total=SLOT_SYMBOLS.reduce((s,k)=>s+weights[k],0);
  let r=Math.random()*total;
  for(const k of SLOT_SYMBOLS){r-=weights[k];if(r<=0)return k;}
  return 'stone';
}
function playSlots(bet){
  if(slotState.spinning)return;
  if(player.coins<bet){setBarkeepState('warning');return;}
  slotState.spinning=true;
  slotState.lastBet=bet;
  player.coins-=bet;
  const reels=[rollSlotSymbol(),rollSlotSymbol(),rollSlotSymbol()];
  const key=reels.join('-');
  const mult=SLOT_PAYOUTS[key]||0;
  const payout=bet*mult;
  const counts=reels.reduce((acc,r)=>{acc[r]=(acc[r]||0)+1;return acc;},{});
  const nearMiss=!payout&&Object.values(counts).some(n=>n===2);
  const jackpot=payout>=bet*15;
  const cabinet=document.getElementById('slot-cabinet');
  const result=document.getElementById('slot-result');
  const lever=document.getElementById('slot-lever');
  if(cabinet)cabinet.className='slot-cabinet spinning';
  if(lever)lever.classList.add('pulled');
  if(result)result.textContent=nearMiss?'Hold... almost...':'Reels spinning...';
  tavernMoneyText();
  document.querySelectorAll('.slot-reel').forEach((el,i)=>{
    el.className='slot-reel spinning';
    el.innerHTML='<em>...</em>';
    setTimeout(()=>{
      const symbol=reels[i];
      el.className=`slot-reel stopped symbol-${symbol}`;
      el.setAttribute('aria-label',SLOT_SYMBOL_LABELS[symbol]);
      el.innerHTML=`<img src="${SLOT_SYMBOL_IMAGES[symbol]}" alt="">`;
      if(i===2)finishSlotSpin({bet,reels,payout,nearMiss,jackpot});
    },620+i*430+(nearMiss&&i===2?360:0));
  });
}
function finishSlotSpin({bet,reels,payout,nearMiss,jackpot}){
  const cabinet=document.getElementById('slot-cabinet');
  const result=document.getElementById('slot-result');
  const lever=document.getElementById('slot-lever');
  const triple=reels[0]===reels[1]&&reels[1]===reels[2];
  if(payout>0){
    addPlayerCoins(payout);
  }
  if(triple)trackTavernMission('slotTriple',{symbol:reels[0]});
  slotState.heat=Math.max(0,Math.min(1,slotState.heat+(payout>0?(jackpot?0.34:0.16):-0.08)));
  if(cabinet)cabinet.className=`slot-cabinet ${jackpot?'jackpot':payout>0?'win':nearMiss?'near-miss':'loss'}`;
  if(lever)lever.classList.remove('pulled');
  if(result)result.textContent=jackpot?`The machine wakes up. Paid ${payout}c.`:payout>0?`Paid ${payout} coins.`:triple?'Three skulls. No payout, but the contract notices.':nearMiss?'Almost. The house smiles.':'Dust. The house keeps it.';
  document.querySelectorAll('.slot-reel').forEach(el=>el.classList.toggle('winning',payout>0));
  const heat=document.querySelector('.slot-heat span');
  if(heat)heat.style.height=`${Math.round(slotState.heat*100)}%`;
  spawnSlotFx(payout>0?28:nearMiss?8:3,jackpot);
  if(typeof playResultPlaqueEffect==='function')playResultPlaqueEffect(result,jackpot?'jackpot':payout>0?'win':'loss');
  if(payout>0&&typeof spawnCoinBurst==='function')spawnCoinBurst(cabinet,{amount:jackpot?32:20,spread:jackpot?340:230,lift:jackpot?240:160});
  setBarkeepState(payout>0?'gambling':'warning');
  saveGame(); tavernMoneyText();
  setTimeout(()=>{slotState.spinning=false;},320);
}
function spawnSlotFx(count,jackpot=false){
  const layer=document.getElementById('slot-fx-layer');
  if(!layer)return;
  layer.innerHTML='';
  for(let i=0;i<count;i++){
    const spark=document.createElement('i');
    spark.className=jackpot?'jackpot-spark':'coin-spark';
    spark.style.left=`${35+Math.random()*36}%`;
    spark.style.setProperty('--dx',`${(Math.random()-0.5)*190}px`);
    spark.style.setProperty('--dy',`${-50-Math.random()*150}px`);
    spark.style.animationDelay=`${Math.random()*0.18}s`;
    layer.appendChild(spark);
  }
  setTimeout(()=>{if(layer)layer.innerHTML='';},1200);
}
function renderGamblingTables(){
  tavernContent.innerHTML=`<div class="tavern-station-head"><span>Gambling Tables</span><strong>Cards, dice, and cursed draws</strong></div><div class="tavern-table-grid">
    <button type="button" class="tavern-game-card tavern-game-card-blackjack" data-open-gambling="blackjack"><img src="images/tavern/gambling/blackjack-table.png" alt=""><div class="tavern-game-prop-copy"><h3>Blackjack</h3><p>Build a bet, then face the dealer.</p><span>Play Blackjack</span></div></button>
    <button type="button" class="tavern-game-card tavern-game-card-dice" data-open-gambling="dice"><img src="images/tavern/gambling/dice-table.png" alt=""><div class="tavern-game-prop-copy"><h3>Dice Table</h3><p>Low, seven, or high. Shake the cup.</p><span>Roll Dice</span></div></button>
    <button type="button" class="tavern-game-card tavern-game-card-devil" data-open-gambling="devilsDraw"><img src="images/tavern/gambling/devils-draw-table.png" alt=""><div class="tavern-game-prop-copy"><h3>Devil's Draw</h3><p>Pay the cost. Choose one cursed card.</p><span>Draw</span></div></button>
  </div>${renderGamblingPopup()}`;
  attachGamblingListeners();
}
function attachGamblingListeners(){
  tavernContent.querySelectorAll('[data-open-gambling]').forEach(btn=>btn.addEventListener('click',()=>openGamblingGame(btn.dataset.openGambling)));
  const close=tavernContent.querySelector('[data-gambling-close]');
  if(close)close.addEventListener('click',closeGamblingGame);
  tavernContent.querySelectorAll('[data-bj-chip]').forEach(btn=>btn.addEventListener('click',()=>blackjackAddChip(Number(btn.dataset.bjChip))));
  tavernContent.querySelectorAll('[data-bj-remove]').forEach(btn=>btn.addEventListener('click',()=>blackjackRemoveChip(Number(btn.dataset.bjRemove))));
  tavernContent.querySelectorAll('[data-bj-action]').forEach(btn=>btn.addEventListener('click',()=>blackjackAction(btn.dataset.bjAction)));
  tavernContent.querySelectorAll('[data-dice-chip]').forEach(btn=>btn.addEventListener('click',()=>diceAddChip(Number(btn.dataset.diceChip))));
  tavernContent.querySelectorAll('[data-dice-remove]').forEach(btn=>btn.addEventListener('click',()=>diceRemoveChip(Number(btn.dataset.diceRemove))));
  tavernContent.querySelectorAll('[data-dice-choice]').forEach(btn=>btn.addEventListener('click',()=>diceChoosePrediction(btn.dataset.diceChoice)));
  tavernContent.querySelectorAll('[data-dice-cup]').forEach(btn=>btn.addEventListener('click',diceRoll));
  tavernContent.querySelectorAll('[data-devil-action]').forEach(btn=>btn.addEventListener('click',()=>devilsDrawStart()));
  tavernContent.querySelectorAll('[data-devil-card]').forEach(btn=>btn.addEventListener('click',()=>devilsDrawChooseCard(Number(btn.dataset.devilCard))));
}
function openGamblingGame(gameKey){
  activeGamblingGame=gameKey;
  if(gameKey==='blackjack')blackjackNewBet();
  if(gameKey==='dice')diceNewRound();
  if(gameKey==='devilsDraw')devilsDrawNewRound();
  renderGamblingTables();
}
function closeGamblingGame(){
  if(gamblingPopupBusy())return;
  activeGamblingGame=null;
  blackjackState=null;
  diceState=null;
  devilsDrawState=null;
  renderGamblingTables();
}
function gamblingPopupBusy(){
  return (blackjackState&&['dealing','playerTurn','dealerTurn','resolving'].includes(blackjackState.phase))||(diceState&&['rolling','resolving'].includes(diceState.phase))||(devilsDrawState&&['shuffling','choosing','revealing'].includes(devilsDrawState.phase));
}
function renderGamblingPopup(){
  if(!activeGamblingGame)return '';
  const title=activeGamblingGame==='blackjack'?'Blackjack':activeGamblingGame==='dice'?'Dice Table':"Devil's Draw";
  const body=activeGamblingGame==='blackjack'?renderBlackjackPopup():activeGamblingGame==='dice'?renderDicePopup():renderDevilsDrawPopup();
  return `<div class="gambling-modal-backdrop"><section class="gambling-modal ${activeGamblingGame}-popup" aria-label="${title}"><button type="button" class="gambling-close-btn" data-gambling-close ${gamblingPopupBusy()?'disabled':''}>Close</button>${body}</section></div>`;
}
function chipButtons(prefix,selected=0,locked=false){
  return GAMBLING_CHIPS.map(c=>`<button type="button" class="gambling-chip ${selected===c?'selected':''}" data-${prefix}-chip="${c}" ${locked||player.coins<c?'disabled':''}>${c}c</button>`).join('');
}
function removeChipButtons(prefix,bet,locked=false){
  return `<button type="button" data-${prefix}-remove="5" ${locked||bet<=0?'disabled':''}>-5c</button><button type="button" data-${prefix}-remove="${bet}" ${locked||bet<=0?'disabled':''}>Clear</button>`;
}
function createBlackjackDeck(){
  const deck=[];
  CARD_SUITS.forEach(suit=>CARD_RANKS.forEach(rank=>deck.push({rank,suit,id:`${rank}_${suit}_${Math.random().toString(36).slice(2)}`})));
  return deck.sort(()=>Math.random()-0.5);
}
function blackjackNewBet(){
  blackjackState={phase:'betting',bet:0,activeHandIndex:0,deck:[],dealerHand:[],playerHands:[{cards:[],bet:0,stood:false,doubled:false,busted:false,result:null}],dealerHoleRevealed:false,message:'Place your bet.'};
}
function blackjackAction(action){
  if(action==='deal')return blackjackDeal();
  if(action==='hit')return blackjackHit();
  if(action==='stand')return blackjackStand();
  if(action==='double')return blackjackDouble();
  if(action==='split')return blackjackSplit();
  if(action==='new')return blackjackNewBet(),renderGamblingTables();
}
function blackjackAddChip(amount){
  if(!blackjackState||blackjackState.phase!=='betting')return;
  if(blackjackState.bet+amount>player.coins){setBarkeepState('warning');return;}
  blackjackState.bet+=amount;
  blackjackState.message=`Bet set to ${blackjackState.bet}c.`;
  renderGamblingTables();
}
function blackjackRemoveChip(amount){
  if(!blackjackState||blackjackState.phase!=='betting')return;
  blackjackState.bet=Math.max(0,blackjackState.bet-amount);
  blackjackState.message=blackjackState.bet?`Bet set to ${blackjackState.bet}c.`:'Bet cleared.';
  renderGamblingTables();
}
function blackjackDraw(){return blackjackState.deck.pop();}
function blackjackDeal(){
  if(!blackjackState||blackjackState.phase!=='betting'||blackjackState.bet<=0)return;
  if(player.coins<blackjackState.bet){setBarkeepState('warning');return;}
  player.coins-=blackjackState.bet;
  blackjackState.deck=createBlackjackDeck();
  blackjackState.dealerHand=[blackjackDraw(),blackjackDraw()];
  blackjackState.playerHands=[{cards:[blackjackDraw(),blackjackDraw()],bet:blackjackState.bet,stood:false,doubled:false,busted:false,result:null}];
  blackjackState.phase='dealing';
  blackjackState.message='Cards slide across the felt...';
  saveGame(); tavernMoneyText(); renderGamblingTables();
  setTimeout(()=>{if(!blackjackState||activeGamblingGame!=='blackjack')return; blackjackState.phase='playerTurn'; blackjackState.message='Your move.'; if(blackjackIsNatural(blackjackState.playerHands[0].cards))blackjackDealerPlay(); else renderGamblingTables();},850);
}
function blackjackCardScore(card){return card.rank==='A'?11:['J','Q','K'].includes(card.rank)?10:Number(card.rank);}
function blackjackHandValue(cards){let total=cards.reduce((s,c)=>s+blackjackCardScore(c),0),aces=cards.filter(c=>c.rank==='A').length;while(total>21&&aces>0){total-=10;aces--;}return total;}
function blackjackIsNatural(cards){return cards.length===2&&blackjackHandValue(cards)===21;}
function blackjackCurrentHand(){return blackjackState&&blackjackState.playerHands[blackjackState.activeHandIndex];}
function blackjackCanDouble(){const h=blackjackCurrentHand();return blackjackState&&blackjackState.phase==='playerTurn'&&h&&h.cards.length===2&&!h.doubled&&player.coins>=h.bet;}
function blackjackCanSplit(){const h=blackjackCurrentHand();return blackjackState&&blackjackState.phase==='playerTurn'&&h&&h.cards.length===2&&h.cards[0].rank===h.cards[1].rank&&player.coins>=h.bet&&blackjackState.playerHands.length<2;}
function blackjackHit(){
  const h=blackjackCurrentHand();
  if(!h||blackjackState.phase!=='playerTurn')return;
  h.cards.push(blackjackDraw());
  blackjackState.message='Hit.';
  if(blackjackHandValue(h.cards)>21){h.busted=true;h.result='lose';blackjackState.message='Bust.';blackjackNextHandOrDealer();}
  renderGamblingTables();
}
function blackjackStand(){
  const h=blackjackCurrentHand();
  if(!h||blackjackState.phase!=='playerTurn')return;
  h.stood=true;
  blackjackState.message='Stand.';
  blackjackNextHandOrDealer();
  renderGamblingTables();
}
function blackjackDouble(){
  const h=blackjackCurrentHand();
  if(!blackjackCanDouble())return;
  player.coins-=h.bet;
  h.bet*=2;
  h.doubled=true;
  h.cards.push(blackjackDraw());
  h.stood=true;
  if(blackjackHandValue(h.cards)>21){h.busted=true;h.result='lose';blackjackState.message='Double bust.';}
  else blackjackState.message='Double. One card, then stand.';
  saveGame(); tavernMoneyText();
  blackjackNextHandOrDealer();
  renderGamblingTables();
}
function blackjackSplit(){
  const h=blackjackCurrentHand();
  if(!blackjackCanSplit())return;
  player.coins-=h.bet;
  const c2=h.cards.pop();
  h.cards.push(blackjackDraw());
  const hand2={cards:[c2,blackjackDraw()],bet:h.bet,stood:false,doubled:false,busted:false,result:null};
  blackjackState.playerHands.push(hand2);
  blackjackState.message='Split hands. Play the glowing hand.';
  saveGame(); tavernMoneyText(); renderGamblingTables();
}
function blackjackNextHandOrDealer(){
  const next=blackjackState.playerHands.findIndex((h,i)=>i>blackjackState.activeHandIndex&&!h.stood&&!h.busted);
  if(next>=0){blackjackState.activeHandIndex=next;return;}
  blackjackDealerPlay();
}
function blackjackDealerPlay(){
  blackjackState.phase='dealerTurn';
  blackjackState.dealerHoleRevealed=true;
  blackjackState.message='Dealer reveals.';
  renderGamblingTables();
  const liveHands=blackjackState.playerHands.filter(h=>!h.busted);
  if(!liveHands.length)return setTimeout(blackjackResolve,450);
  const step=()=>{
    if(!blackjackState||activeGamblingGame!=='blackjack')return;
    if(blackjackHandValue(blackjackState.dealerHand)<17){blackjackState.dealerHand.push(blackjackDraw());blackjackState.message='Dealer hits.';renderGamblingTables();setTimeout(step,520);}
    else blackjackResolve();
  };
  setTimeout(step,620);
}
function blackjackResolve(){
  if(!blackjackState)return;
  blackjackState.phase='resolving';
  const dealerValue=blackjackHandValue(blackjackState.dealerHand);
  let payout=0;
  blackjackState.playerHands.forEach(h=>{
    const value=blackjackHandValue(h.cards);
    if(h.busted){h.result='lose';return;}
    if(blackjackIsNatural(h.cards)&&blackjackState.playerHands.length===1){h.result='blackjack';payout+=Math.round(h.bet*2.5);return;}
    if(dealerValue>21||value>dealerValue){h.result='win';payout+=h.bet*2;return;}
    if(value===dealerValue){h.result='push';payout+=h.bet;return;}
    h.result='lose';
  });
  addPlayerCoins(payout);
  if(payout>0)trackTavernMission('gamblingWin',{game:'blackjack',amount:payout});
  blackjackState.phase='complete';
  blackjackState.message=payout>0?`Paid ${payout}c.`:['Debt bites. Deal again?','The table wins this round.','One more hand could turn it.'][Math.floor(Math.random()*3)];
  saveGame(); tavernMoneyText(); setBarkeepState(payout>0?'gambling':'warning'); renderGamblingTables();
  requestAnimationFrame(()=>{
    const table=document.querySelector('.blackjack-table');
    const msg=document.querySelector('.blackjack-table .gambling-message');
    if(payout>0&&typeof spawnCoinBurst==='function')spawnCoinBurst(table,{amount:24,spread:260,lift:180});
    if(msg&&typeof playResultPlaqueEffect==='function')playResultPlaqueEffect(msg,payout>0?'win':'loss');
  });
}
function blackjackCardHtml(card,hidden=false,delay=0,zone='player',index=0){
  const dir=zone==='dealer'?-1:1;
  const flyX=dir*(72+index*18+(Math.random()*18));
  const flyY=zone==='dealer'?-96-Math.random()*20:-72-Math.random()*24;
  const flyR=(dir*(7+index*2))*(index%2?-1:1);
  const style=` style="animation-delay:${delay}ms;--fly-x:${flyX}px;--fly-y:${flyY}px;--fly-r:${flyR}deg"`;
  if(hidden)return `<span class="blackjack-card back"${style}></span>`;
  const red=card.suit==='hearts'||card.suit==='diamonds';
  const suit={hearts:'♥',diamonds:'♦',clubs:'♣',spades:'♠'}[card.suit];
  return `<span class="blackjack-card front ${red?'red':'black'}"${style}><b>${card.rank}</b><em>${suit}</em></span>`;
}
function renderBlackjackPopup(){
  if(!blackjackState)blackjackNewBet();
  const dealerValue=blackjackState.dealerHoleRevealed?blackjackHandValue(blackjackState.dealerHand):blackjackHandValue(blackjackState.dealerHand.slice(0,1));
  const actions=blackjackState.phase==='betting'
    ? `<button type="button" data-bj-action="deal" ${blackjackState.bet<=0||player.coins<blackjackState.bet?'disabled':''}>Deal</button>`
    : blackjackState.phase==='playerTurn'
      ? `<button type="button" data-bj-action="hit">Hit</button><button type="button" data-bj-action="stand">Stand</button><button type="button" data-bj-action="double" ${blackjackCanDouble()?'':'disabled'}>Double</button><button type="button" data-bj-action="split" ${blackjackCanSplit()?'':'disabled'}>Split</button>`
      : blackjackState.phase==='complete'?`<button type="button" data-bj-action="new">New Bet</button>`:'';
  return `<div class="gambling-game-title">Blackjack</div><div class="blackjack-table">
    <img class="gambling-table-art" src="images/tavern/gambling/blackjack/blackjack-table-popup.png" alt="">
    <div class="blackjack-deck"></div>
    <div class="blackjack-dealer-zone"><span>Dealer ${blackjackState.dealerHoleRevealed?dealerValue:'?'}</span><div class="blackjack-hand">${blackjackState.dealerHand.map((c,i)=>blackjackCardHtml(c,i===1&&!blackjackState.dealerHoleRevealed,120+i*150,'dealer',i)).join('')}</div></div>
    <div class="gambling-message">${blackjackState.message}</div>
    <div class="blackjack-player-zone">${blackjackState.playerHands.map((h,i)=>`<div class="blackjack-player-hand ${i===blackjackState.activeHandIndex&&blackjackState.phase==='playerTurn'?'active':''} ${h.result||''}"><span>Hand ${i+1}: ${blackjackHandValue(h.cards)} ${h.result?`- ${h.result}`:''}</span><div class="blackjack-hand">${h.cards.map((c,ci)=>blackjackCardHtml(c,false,ci*130,'player',ci)).join('')}</div></div>`).join('')}</div>
    <div class="gambling-bet-rail"><strong>Bet ${blackjackState.bet}c</strong><div>${chipButtons('bj',0,blackjackState.phase!=='betting')}</div><div>${removeChipButtons('bj',blackjackState.bet,blackjackState.phase!=='betting')}</div></div>
    <div class="gambling-actions">${actions}</div>
  </div>`;
}
function diceNewRound(){diceState={phase:'betting',bet:0,prediction:null,dice:[null,null],message:'Place a bet and choose low, seven, or high.'};}
function diceAddChip(amount){if(!diceState||!['betting','complete'].includes(diceState.phase))return;if(diceState.phase==='complete')diceNewRound();if(diceState.bet+amount>player.coins){setBarkeepState('warning');return;}diceState.bet+=amount;diceState.message=`Bet set to ${diceState.bet}c.`;renderGamblingTables();}
function diceRemoveChip(amount){if(!diceState||diceState.phase!=='betting')return;diceState.bet=Math.max(0,diceState.bet-amount);renderGamblingTables();}
function diceChoosePrediction(choice){if(!diceState||!['betting','complete'].includes(diceState.phase))return;if(diceState.phase==='complete')diceNewRound();diceState.prediction=choice;diceState.message=`${choice==='seven'?'Seven':choice} called.`;renderGamblingTables();}
function diceRoll(){
  if(!diceState||diceState.phase!=='betting')return;
  if(diceState.bet<=0||!diceState.prediction){diceState.message='Set a bet and prediction first.';renderGamblingTables();return;}
  if(player.coins<diceState.bet){setBarkeepState('warning');return;}
  player.coins-=diceState.bet; diceState.phase='rolling'; diceState.message='The cup rattles...'; diceState.dice=rollLuckyDicePair(diceState.prediction);
  saveGame(); tavernMoneyText(); renderGamblingTables();
  setTimeout(diceResolve,1050);
}
function diceResolve(){
  if(!diceState||activeGamblingGame!=='dice')return;
  const total=diceState.dice[0]+diceState.dice[1];
  const win=(diceState.prediction==='low'&&total<=6)||(diceState.prediction==='high'&&total>=8)||(diceState.prediction==='seven'&&total===7);
  const payout=win?diceState.bet*(diceState.prediction==='seven'?5:2):0;
  addPlayerCoins(payout); diceState.phase='complete'; diceState.message=`Rolled ${total}. ${win?`Paid ${payout}c.`:'House takes it.'}`;
  if(payout>0)trackTavernMission('gamblingWin',{game:'dice',amount:payout});
  saveGame(); tavernMoneyText(); setBarkeepState(win?'gambling':'warning'); renderGamblingTables();
  requestAnimationFrame(()=>{
    const tray=document.querySelector('.dice-tray');
    const msg=document.querySelector('.dice-table .gambling-message');
    if(tray&&typeof pulseElement==='function')pulseElement(tray,win?'dice-win':'dice-loss',760);
    if(win&&typeof spawnCoinBurst==='function')spawnCoinBurst(tray,{amount:18,spread:220,lift:160});
    if(msg&&typeof playResultPlaqueEffect==='function')playResultPlaqueEffect(msg,win?'win':'loss');
  });
}
function dicePredictionWins(choice,total){
  return (choice==='low'&&total<=6)||(choice==='high'&&total>=8)||(choice==='seven'&&total===7);
}
function rollLuckyDicePair(prediction){
  let dice=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];
  const total=dice[0]+dice[1];
  const luckChance=Math.min(0.35,luckBonus()*0.35);
  if(prediction&&!dicePredictionWins(prediction,total)&&Math.random()<luckChance){
    for(let i=0;i<2;i++){
      const reroll=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];
      if(dicePredictionWins(prediction,reroll[0]+reroll[1]))return reroll;
    }
  }
  return dice;
}
function renderDicePopup(){
  if(!diceState)diceNewRound();
  const cup=diceState.phase==='rolling'?'shake-1':diceState.phase==='complete'?'raised':'normal';
  const revealDice=diceState.phase==='complete';
  return `<div class="gambling-game-title">Dice Table</div><div class="dice-table">
    <img class="gambling-table-art" src="images/tavern/gambling/dice/dice-table-popup.png" alt="">
    <div class="dice-cup ${diceState.phase==='rolling'?'is-shaking':''}" data-dice-cup><img src="images/tavern/gambling/dice/dice-cup-${cup}.png" alt=""></div>
    <div class="dice-tray ${revealDice?'is-revealed':'is-hidden'}">${[0,1].map(i=>`<span class="dice-die ${diceState.phase==='rolling'?'is-rolling':''}">${revealDice&&diceState.dice[i]?`<img src="images/tavern/gambling/dice/dice-${diceState.dice[i]}.png" alt="${diceState.dice[i]}">`:''}</span>`).join('')}</div>
    <div class="gambling-message">${diceState.message}</div>
    <div class="dice-prediction-buttons">${['low','seven','high'].map(c=>`<button type="button" data-dice-choice="${c}" class="${diceState.prediction===c?'selected':''}" ${diceState.phase==='rolling'?'disabled':''}>${c==='seven'?'Seven':c}</button>`).join('')}</div>
    <div class="gambling-bet-rail"><strong>Bet ${diceState.bet}c</strong><div>${chipButtons('dice',0,diceState.phase==='rolling')}</div><div>${removeChipButtons('dice',diceState.bet,diceState.phase!=='betting')}</div></div>
    <div class="gambling-actions"><button type="button" data-dice-cup ${diceState.phase!=='betting'||diceState.bet<=0||!diceState.prediction?'disabled':''}>Shake Cup</button>${diceState.phase==='complete'?'<button type="button" data-dice-chip="0">Replay</button>':''}</div>
  </div>`;
}
function devilsDrawNewRound(){devilsDrawState={phase:'ready',cost:100,offeredCards:[],selectedIndex:null,result:null,message:'Pay 100c. The deck offers three chances.'};}
function weightedDevilsOutcome(){
  const luck=gamblingLuckMult();
  const weights=DEVILS_DRAW_OUTCOMES.map(outcome=>{
    const base=outcome.rarity==='legendary'?5:outcome.rarity==='epic'?8:outcome.rarity==='rare'?13:outcome.rarity==='uncommon'?18:24;
    return outcome.type==='curse'?base/luck:base*luck;
  });
  const total=weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(let i=0;i<weights.length;i++){r-=weights[i];if(r<=0)return DEVILS_DRAW_OUTCOMES[i];}
  return DEVILS_DRAW_OUTCOMES[0];
}
function devilsDrawStart(){
  if(!devilsDrawState||!['ready','complete'].includes(devilsDrawState.phase))return;
  if(player.coins<devilsDrawState.cost){setBarkeepState('warning');return;}
  player.coins-=devilsDrawState.cost; devilsDrawState.phase='shuffling'; devilsDrawState.message='The deck whispers...'; devilsDrawState.result=null; devilsDrawState.selectedIndex=null; devilsDrawState.offeredCards=[];
  saveGame(); tavernMoneyText(); renderGamblingTables();
  setTimeout(()=>{if(!devilsDrawState||activeGamblingGame!=='devilsDraw')return;devilsDrawState.phase='choosing';devilsDrawState.offeredCards=[weightedDevilsOutcome(),weightedDevilsOutcome(),weightedDevilsOutcome()];devilsDrawState.message='Choose one. Only one.';renderGamblingTables();},1100);
}
function devilsDrawChooseCard(index){
  if(!devilsDrawState||devilsDrawState.phase!=='choosing')return;
  devilsDrawState.selectedIndex=index; devilsDrawState.phase='revealing'; devilsDrawState.message='The card burns at the edge...'; renderGamblingTables();
  setTimeout(()=>devilsDrawReveal(index),850);
}
function devilsDrawReveal(index){
  if(!devilsDrawState||activeGamblingGame!=='devilsDraw')return;
  const outcome=devilsDrawState.offeredCards[index];
  devilsDrawState.result=outcome;
  if(outcome.value)player.coins=Math.max(0,player.coins+outcome.value);
  if(outcome.buff)applyTavernBuff(outcome.buff);
  if(outcome.barItemId)applyTavernBuff(TAVERN_ITEMS.find(i=>i.id===outcome.barItemId));
  trackTavernMission('devilsDraw',{outcomeType:outcome.type,rarity:outcome.rarity,id:outcome.id});
  devilsDrawState.phase='complete';
  devilsDrawState.message=`${outcome.label}: ${outcome.effect}`;
  saveGame(); tavernMoneyText(); renderTavernBuffs(); setBarkeepState(outcome.type==='curse'?'warning':'gambling'); renderGamblingTables();
}
function renderDevilsDrawPopup(){
  if(!devilsDrawState)devilsDrawNewRound();
  const cards=[0,1,2].map(i=>{
    const chosen=devilsDrawState.selectedIndex===i;
    const revealed=devilsDrawState.phase==='complete'&&chosen;
    const outcome=revealed?devilsDrawState.result:null;
    return `<button type="button" class="devils-card devils-plaque ${chosen?'is-selected':''} ${revealed?'is-revealed':''} ${outcome?`devils-${outcome.type} rarity-${outcome.rarity}`:''}" data-devil-card="${i}" ${devilsDrawState.phase!=='choosing'?'disabled':''}>${revealed?`<span class="devils-card-result"><strong>${outcome.label}</strong><em>${outcome.effect}</em></span>`:''}</button>`;
  }).join('');
  return `<div class="gambling-game-title">Devil's Draw</div><div class="devils-table">
    <img class="gambling-table-art" src="images/tavern/gambling/devils-draw/devils-draw-table-popup.png" alt="">
    <div class="devils-deck ${devilsDrawState.phase==='shuffling'?'is-shuffling':''}"><img src="images/tavern/gambling/devils-draw/cursed-deck.png" alt=""></div>
    <div class="devils-card-row">${cards}</div>
    <div class="gambling-message">${devilsDrawState.message}</div>
    <div class="gambling-actions"><button type="button" data-devil-action ${['shuffling','choosing','revealing'].includes(devilsDrawState.phase)?'disabled':''}>${devilsDrawState.phase==='complete'?'Draw Again':'Pay 100c'}</button></div>
  </div>`;
}
