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
  {id:'lift_salve',name:'Lift Salve',price:180,type:'salve',effect:'deep_lift_heal',description:'Restores 45 health between Deep Lift waves',duration:0,stacking:'instant',modifiers:{deepLiftHeal:45}},
  {id:'cigarettes',name:'Dust Cigarettes',price:125,type:'smoke',effect:'focus',description:'+35% weak point accuracy window for 3 minutes',duration:180000,stacking:'additive',modifiers:{weakPointWindowMultiplier:1.35}},
  {id:'cigar',name:'Lucky Cigar',price:260,type:'smoke',effect:'gambling_luck',description:'+45% gambling luck for 3 minutes',duration:180000,stacking:'additive',modifiers:{gamblingLuckMultiplier:1.45}},
  {id:'joint',name:'Green Vein Roll',price:320,type:'smoke',effect:'rare_ore_luck',description:'+22% rare ore drop chance for 3 minutes, -8% swing speed',duration:180000,stacking:{mode:'diminishing',multiplierPerExtraStack:0.65},modifiers:{rareDropChanceBonus:0.22,swingSpeedMultiplier:0.92}},
];

const TAVERN_ITEM_ICONS={
  pint:'images/tavern/items/pint.png',
  whiskey:'images/tavern/items/barcelo-imperial.png',
  miner_tonic:'images/tavern/items/miner-tonic.png',
  lift_salve:'images/tavern/items/miner-tonic.png',
  cigarettes:'images/tavern/items/cigarettes.png',
  cigar:'images/tavern/items/cigar.png',
  joint:'images/tavern/items/joint.png',
};

const BARKEEP_STATES={
  idle:{image:'images/tavern/barkeep/barkeep-idle-v2.png',text:'Back from the rocks, are ya?'},
  hover:{image:'images/tavern/barkeep/barkeep-greet-v2.png',text:'Need a little courage before heading back down?'},
  selling:{image:'images/tavern/barkeep/barkeep-serving-v2.png',text:"It's in your pack. Use it when the rock bites back."},
  gambling:{image:'images/tavern/barkeep/barkeep-serving-v2.png',text:"Luck's a funny thing. Expensive too."},
  warning:{image:'images/tavern/barkeep/barkeep-warning-v2.png',text:'Come back when your pockets weigh more.'},
};

const SLOT_BETS=[100,250,500,1000];
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
  {id:'blood_pact',label:'Blood Pact',type:'curse',rarity:'rare',effect:'Gain 1600 coins, but ore yield crashes for 4 minutes.',value:1600,buff:{id:'blood_pact_tax',name:'Blood Pact Tax',duration:240000,stacking:'additive',modifiers:{oreYieldMultiplier:0.42}}},
  {id:'rust_curse',label:'Rust Curse',type:'curse',rarity:'common',effect:'Pickaxe damage is gutted for 4 minutes.',buff:{id:'rust_curse',name:'Rust Curse',duration:240000,stacking:'additive',modifiers:{damageMultiplier:0.45}}},
  {id:'heavy_hands',label:'Heavy Hands',type:'curse',rarity:'common',effect:'Swing speed drags for 4 minutes.',buff:{id:'heavy_hands',name:'Heavy Hands',duration:240000,stacking:'additive',modifiers:{swingSpeedMultiplier:0.52}}},
  {id:'bad_omen',label:'Bad Omen',type:'curse',rarity:'uncommon',effect:'Gambling luck is cut down for 5 minutes.',buff:{id:'bad_omen',name:'Bad Omen',duration:300000,stacking:'additive',modifiers:{gamblingLuckMultiplier:0.45}}},
  {id:'cracked_vision',label:'Cracked Vision',type:'curse',rarity:'uncommon',effect:'Weak points shrink badly for 3 minutes.',buff:{id:'cracked_vision',name:'Cracked Vision',duration:180000,stacking:'additive',modifiers:{weakPointWindowMultiplier:0.42}}},
  {id:'debt_mark',label:'Debt Mark',type:'curse',rarity:'rare',effect:'Lose 900 coins and gain worse gambling luck for 4 minutes.',value:-900,buff:{id:'debt_mark',name:'Debt Mark',duration:240000,stacking:'additive',modifiers:{gamblingLuckMultiplier:0.58}}},
  {id:'blackout_swing',label:'Blackout Swing',type:'curse',rarity:'epic',effect:'Damage and swing speed collapse for 3.5 minutes.',buff:{id:'blackout_swing',name:'Blackout Swing',duration:210000,stacking:'additive',modifiers:{damageMultiplier:0.34,swingSpeedMultiplier:0.46}}},
  {id:'empty_pockets',label:'Empty Pockets',type:'curse',rarity:'rare',effect:'Lose 1800 coins and carry a bad omen for 4 minutes.',value:-1800,buff:{id:'empty_pockets',name:'Empty Pockets',duration:240000,stacking:'additive',modifiers:{gamblingLuckMultiplier:0.48}}},
  {id:'jackpot',label:'Soul Jackpot',type:'boost',rarity:'legendary',effect:'Gain 3500 coins.',value:3500},
];
const MISSION_REFRESH_TIME=10*60*1000;
const MAX_TAVERN_BUFFS=7;
const MAX_TAVERN_CONSUMABLE_STACK=99;
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
let slotState={spinning:false,lastBet:SLOT_BETS[0],heat:0};
const GAMBLING_CHIPS=[25,50,100,250,500];
const DEVILS_DRAW_BASE_COST=500;
const CARD_SUITS=['hearts','diamonds','clubs','spades'];
const CARD_RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const GAMBLING_GAME_LABELS={
  blackjack:'Blackjack',
  dice:'Dice Table',
  devilsDraw:"Devil's Draw",
};
const GAMBLING_BUSY_PHASES={
  blackjack:['dealing','playerTurn','dealerTurn','resolving'],
  dice:['rolling','resolving'],
  devilsDraw:['shuffling','choosing','revealing'],
};
const BLACKJACK_LOSS_MESSAGES=[
  'Debt bites. Deal again?',
  'The table wins this round.',
  'One more hand could turn it.',
];
const BLACKJACK_SUIT_SYMBOLS={
  hearts:'&hearts;',
  diamonds:'&diams;',
  clubs:'&clubs;',
  spades:'&spades;',
};
const GAMBLING_TABLE_CARDS=[
  {
    gameKey:'blackjack',
    className:'blackjack',
    image:'images/tavern/gambling/blackjack-table.png',
    title:'Blackjack',
    description:'Build a bet, then face the dealer.',
    cta:'Play Blackjack',
  },
  {
    gameKey:'dice',
    className:'dice',
    image:'images/tavern/gambling/dice-table.png',
    title:'Dice Table',
    description:'Low, seven, or high. Shake the cup.',
    cta:'Roll Dice',
  },
  {
    gameKey:'devilsDraw',
    className:'devil',
    image:'images/tavern/gambling/devils-draw-table.png',
    title:"Devil's Draw",
    description:'Pay the cost. Choose one cursed card.',
    cta:'Draw',
  },
];

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
function tavernItemById(id){
  return TAVERN_ITEMS.find(item=>item.id===id)||null;
}
function isTavernConsumableSlot(slot,id=null){
  return typeof isConsumableSlot==='function'
    &&isConsumableSlot(slot)
    &&(!id||slot.itemId===id)
    &&!!tavernItemById(slot.itemId);
}
function canStoreTavernConsumable(id,count=1,reservedEmptySlots=0){
  if(!tavernItemById(id))return false;
  const limit=activeInventorySize();
  let remaining=Math.max(1,Math.floor(Number(count)||1));
  let emptySlots=0;
  for(let i=0;i<limit;i++){
    const slot=player.inventory[i];
    if(!slot){ emptySlots++; continue; }
    if(!isTavernConsumableSlot(slot,id))continue;
    remaining-=Math.max(0,MAX_TAVERN_CONSUMABLE_STACK-slot.count);
    if(remaining<=0)return true;
  }
  return remaining<=Math.max(0,emptySlots-reservedEmptySlots)*MAX_TAVERN_CONSUMABLE_STACK;
}
function addTavernConsumableToInventory(id,count=1){
  const item=tavernItemById(id);
  if(!item||!canStoreTavernConsumable(id,count))return false;
  const limit=activeInventorySize();
  let remaining=Math.max(1,Math.floor(Number(count)||1));
  for(let i=0;i<limit&&remaining>0;i++){
    const slot=player.inventory[i];
    if(!isTavernConsumableSlot(slot,id)||slot.count>=MAX_TAVERN_CONSUMABLE_STACK)continue;
    const add=Math.min(remaining,MAX_TAVERN_CONSUMABLE_STACK-slot.count);
    slot.count+=add;
    remaining-=add;
  }
  for(let i=0;i<limit&&remaining>0;i++){
    if(player.inventory[i])continue;
    const add=Math.min(remaining,MAX_TAVERN_CONSUMABLE_STACK);
    player.inventory[i]={kind:'consumable',itemId:item.id,count:add};
    remaining-=add;
  }
  return remaining<=0;
}
function consumeTavernInventoryItem(slotIndex,target=null){
  const slot=player.inventory[slotIndex];
  if(!isTavernConsumableSlot(slot))return false;
  const item=tavernItemById(slot.itemId);
  if(item&&item.modifiers&&item.modifiers.deepLiftHeal){
    if(!(typeof window.useDeepLiftHealingConsumable==='function'&&window.useDeepLiftHealingConsumable(item.modifiers.deepLiftHeal)))return false;
  }else if(!applyTavernBuff(item))return false;
  slot.count--;
  if(slot.count<=0)player.inventory[slotIndex]=null;
  if(window.GameAudio)GameAudio.playPurchase();
  saveGame();
  if(target){
    if(typeof pulseElement==='function')pulseElement(target,'inventory-consume-pulse',420);
    if(typeof spawnUiSparkles==='function')spawnUiSparkles(target,{amount:10,tone:item.type==='smoke'?'purple':'gold',spread:92,lift:72,duration:640});
    setTimeout(()=>renderInventory(),180);
  }else renderInventory();
  renderTavernBuffs();
  if(typeof renderCommandBuffs==='function')renderCommandBuffs();
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
      <span class="tavern-shop-icon"><img src="${TAVERN_ITEM_ICONS[item.id]}" alt="" draggable="false"></span>
      <span class="tavern-shop-tooltip" role="tooltip"><strong>${item.name}</strong><em>${item.price}c</em><span>${item.description}</span><small>Backpack ${item.type} - ${Math.round(item.duration/1000)}s</small></span>
    </button>`).join('')}</div></div>`;
  tavernContent.querySelectorAll('[data-buy-tavern]').forEach(btn=>btn.addEventListener('click',()=>buyTavernItem(btn.dataset.buyTavern,btn)));
}
function buyTavernItem(id,target=null){
  const item=tavernItemById(id);
  if(!item)return;
  if(player.coins<item.price){
    setBarkeepState('warning');
    return;
  }
  if(!addTavernConsumableToInventory(item.id,1)){
    setBarkeepState('warning');
    if(tavernDialogue)tavernDialogue.textContent="Make room first. I'm not balancing drinks on your helmet.";
    return;
  }
  player.coins-=item.price;
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
  renderInventory();
  if(typeof pulseBackpackReceive==='function')pulseBackpackReceive();
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
  const beginner=level<3;
  const mid=level<5;
  const targetValue=beginner
    ? 20+level*7
    : mid
      ? (kind==='rush'?38+level*6:52+level*8)
      : kind==='rush'
        ? 70+level*8
        : kind==='risk'
          ? 120+level*13
          : 95+level*10;
  const maxByRarity=ore.rarity==='legendary'?3:ore.rarity==='epic'?5:ore.rarity==='rare'?8:ore.rarity==='uncommon'?18:45;
  return Math.max(1,Math.min(maxByRarity,Math.ceil(targetValue/Math.max(1,ore.val))));
}
function missionContext(type,level){
  const oreType=weightedMissionOre(level);
  return {
    id:`${type}_${oreType}_${Date.now()}_${Math.floor(Math.random()*9999)}`,
    type,
    level,
    oreType,
    ore:ORE[oreType],
  };
}
function buildOreDeliveryMission(ctx){
  const amount=missionOreAmount(ctx.oreType,ctx.level,'delivery');
  return {id:ctx.id,type:ctx.type,title:`${ctx.ore.lbl} for the Rail Crew`,description:`Deliver ${amount} ${ctx.ore.lbl}.`,requirement:{ore:ctx.oreType,amount},reward:{coins:Math.round(ctx.ore.val*amount*(2.6+ctx.level*0.08))}};
}
function buildMixedValueMission(ctx){
  const amount=Math.round(ctx.level<3?28+ctx.level*10:ctx.level<5?58+ctx.level*12:90+ctx.level*18);
  return {id:ctx.id,type:ctx.type,title:'Mixed Ore Tab',description:`Deliver any mined ore worth ${amount} value.`,requirement:{oreValue:amount},reward:{coins:Math.round(amount*1.75),barItemId:ctx.level>=8?'cigarettes':'pint'}};
}
function missionRockAmount(ctx){
  if(ctx.level<3)return ctx.oreType==='stone'?12+ctx.level*4:8+ctx.level*2;
  if(ctx.level<5)return ctx.ore.rarity==='uncommon'?14:24;
  return ctx.ore.rarity==='legendary'?4:ctx.ore.rarity==='epic'?7:ctx.ore.rarity==='rare'?12:ctx.ore.rarity==='uncommon'?28:70;
}
function buildBreakRocksMission(ctx){
  const amount=missionRockAmount(ctx);
  return {id:ctx.id,type:ctx.type,title:`Clear the ${ctx.ore.lbl} Shaft`,description:`Break ${amount} ${ctx.ore.lbl} rocks.`,requirement:{rockType:ctx.oreType,amount},progress:0,reward:{coins:Math.round(80+ctx.ore.val*amount*1.6)}};
}
function buildTimedContractMission(ctx){
  const amount=missionOreAmount(ctx.oreType,ctx.level,'rush');
  const limit=ctx.level<5?180000:150000;
  const itemRarity=ctx.level>=30?'rare':ctx.level>=10?'uncommon':'common';
  return {id:ctx.id,type:ctx.type,title:`${ctx.ore.lbl} Rush`,description:`Mine ${amount} ${ctx.ore.lbl} within ${Math.round(limit/60000)} minutes.`,timeLimit:limit,requirement:{ore:ctx.oreType,amount},progress:0,reward:{coins:Math.round(140+ctx.ore.val*amount*4.2),itemRarity}};
}
function buildRareFindMission(ctx){
  return {id:ctx.id,type:'rare_find',title:'Something Shiny',description:`Find ${ctx.level>=12?5:3} rare ore drops while mining.`,requirement:{rareDrops:ctx.level>=12?5:3},progress:0,reward:{coins:ctx.level>=12?520:250,buffItem:'Lucky Cigar'}};
}
function buildCraftedDeliveryMission(ctx){
  const rarity=ctx.level>=16?'rare':ctx.level>=9?'uncommon':'common';
  const amount=rarity==='rare'?1:ctx.level>=12?2:1;
  const rewardRarity=rarity==='rare'?'rare':rarity==='uncommon'?'uncommon':'common';
  return {id:ctx.id,type:'crafted_delivery',title:'Forge Stock for the Wagon',description:`Deliver ${amount} ${RARITY_LABELS[rarity]} forged item${amount>1?'s':''}.`,requirement:{craftedRarity:rarity,amount},reward:{coins:rarity==='rare'?1200:rarity==='uncommon'?650:300,itemRarity:rewardRarity}};
}
function buildForgeAnyMission(ctx){
  const amount=ctx.level>=10?3:2;
  return {id:ctx.id,type:'forge_any',title:'Fresh From the Anvil',description:`Deliver ${amount} forged item${amount>1?'s':''} of any rarity.`,requirement:{craftedAny:amount},reward:{coins:Math.round(420+ctx.level*55),itemRarity:ctx.level>=12?'rare':'common'}};
}
function buildBlackjackWinningsMission(ctx){
  const amount=Math.round(1800+ctx.level*400);
  const rarity=ctx.level>=14?'epic':'rare';
  return {id:ctx.id,type:ctx.type,title:'Blackjack Marker',description:`Win ${amount} total coins at Blackjack. It can happen across many hands.`,requirement:{gamblingGame:'blackjack',amount},progress:0,reward:{coins:Math.round(260+ctx.level*30),itemRarity:rarity,itemSource:'gambling'}};
}
function buildDiceWinningsMission(ctx){
  const amount=Math.round(900+ctx.level*260);
  const reward=ctx.level>=8?{itemRarity:'rare',itemSource:'gambling',barItemId:'cigar'}:{barItemId:'cigar'};
  return {id:ctx.id,type:ctx.type,title:'Dice Cup Debt',description:`Win ${amount} total coins at the Dice Table.`,requirement:{gamblingGame:'dice',amount},progress:0,reward:{coins:Math.round(180+ctx.level*24),...reward}};
}
function buildSlotsWinningsMission(ctx){
  const amount=ctx.level>=16?5:ctx.level>=9?4:3;
  const rarity=ctx.level>=16?'epic':'rare';
  return {id:ctx.id,type:ctx.type,title:'Three-of-a-Kind Tab',description:`Hit ${amount} three-of-a-kind slot results. Any symbol counts, even skulls.`,requirement:{slotTriples:amount},progress:0,reward:{coins:Math.round(500+ctx.level*58),itemRarity:rarity,itemSource:'gambling'}};
}
function buildDevilCursesMission(ctx){
  const amount=ctx.level>=13?5:3;
  const rarity=ctx.level>=13?'epic':'rare';
  return {id:ctx.id,type:ctx.type,title:'Curse Collector',description:`Take ${amount} curses from Devil's Draw and bring proof you survived.`,requirement:{devilCurses:amount},progress:0,reward:{coins:Math.round(320+ctx.level*32),itemRarity:rarity,itemSource:'gambling'}};
}
function buildDevilBoostsMission(ctx){
  const amount=ctx.level>=12?6:4;
  return {id:ctx.id,type:ctx.type,title:'Good Cards Only',description:`Reveal ${amount} helpful Devil's Draw cards.`,requirement:{devilBoosts:amount},progress:0,reward:{coins:Math.round(240+ctx.level*26),barItemId:'joint'}};
}
function buildDeepLiftWavesMission(ctx){
  const amount=ctx.level>=16?9:6;
  const rarity=ctx.level>=16?'rare':'uncommon';
  return {id:ctx.id,type:ctx.type,title:'Lift Shift',description:`Clear ${amount} Deep Lift waves. Extracting is optional, surviving is not.`,requirement:{deepLiftWaves:amount},progress:0,reward:{coins:Math.round(360+ctx.level*42),barItemId:'lift_salve',itemRarity:rarity,itemSource:'dungeon'}};
}
function buildDeepLiftLootMission(ctx){
  const amount=Math.round(10+ctx.level*0.8);
  const rarity=ctx.level>=12?'uncommon':'common';
  return {id:ctx.id,type:ctx.type,title:'Bone and Echo Tab',description:`Collect ${amount} Deep Lift materials from defeated enemies.`,requirement:{deepLiftLoot:amount},progress:0,reward:{coins:Math.round(260+ctx.level*36),itemRarity:rarity,itemSource:'dungeon'}};
}
function buildDeepLiftFloorMission(ctx){
  const amount=ctx.level>=18?3:2;
  const rarity=ctx.level>=18?'epic':'rare';
  return {id:ctx.id,type:ctx.type,title:'Below the Last Lantern',description:`Clear ${amount} Deep Lift floors while on a run.`,requirement:{deepLiftFloors:amount},progress:0,reward:{coins:Math.round(520+ctx.level*54),barItemId:'lift_salve',itemRarity:rarity,itemSource:'dungeon'}};
}
function buildRiskContractMission(ctx){
  const riskOre=ctx.level>=30?ctx.oreType:(ctx.level>=5?'iron':'copper');
  const risk=ORE[riskOre];
  const amount=missionOreAmount(riskOre,ctx.level,'risk');
  const entryCost=80+ctx.level*5;
  const itemRarity=ctx.level>=30?'rare':ctx.level>=12?'uncommon':'common';
  return {id:ctx.id,type:'risk_contract',title:'Double or Dust',description:`Pay ${entryCost}c. Mine ${amount} ${risk.lbl} within 3 minutes.`,entryCost,timeLimit:180000,requirement:{ore:riskOre,amount},progress:0,reward:{coins:Math.max(Math.round(260+risk.val*amount*5),Math.round(entryCost*1.25)),itemRarity}};
}
const TAVERN_MISSION_BUILDERS={
  ore_delivery:buildOreDeliveryMission,
  mixed_value:buildMixedValueMission,
  break_rocks:buildBreakRocksMission,
  timed_contract:buildTimedContractMission,
  rare_find:buildRareFindMission,
  crafted_delivery:buildCraftedDeliveryMission,
  forge_any:buildForgeAnyMission,
  blackjack_winnings:buildBlackjackWinningsMission,
  dice_winnings:buildDiceWinningsMission,
  slots_winnings:buildSlotsWinningsMission,
  devil_curses:buildDevilCursesMission,
  devil_boosts:buildDevilBoostsMission,
  deep_lift_waves:buildDeepLiftWavesMission,
  deep_lift_loot:buildDeepLiftLootMission,
  deep_lift_floors:buildDeepLiftFloorMission,
  risk_contract:buildRiskContractMission,
};
function missionTemplate(type,level){
  const builder=TAVERN_MISSION_BUILDERS[type]||buildRiskContractMission;
  return builder(missionContext(type,level));
}
const TAVERN_BASE_MISSION_TYPES=[
  'ore_delivery',
  'mixed_value',
  'break_rocks',
];
const TAVERN_UNLOCKED_MISSION_TYPES=[
  {level:3,type:'timed_contract'},
  {level:3,type:'rare_find'},
  {level:5,type:'deep_lift_waves'},
  {level:6,type:'deep_lift_loot'},
  {level:7,type:'risk_contract'},
  {level:10,type:'deep_lift_floors'},
];
const TAVERN_GAMBLING_MISSION_TYPES=[
  'blackjack_winnings',
  'dice_winnings',
  'slots_winnings',
  'devil_curses',
  'devil_boosts',
];
function canOfferGamblingMissions(level){
  const minBet=Math.min(...SLOT_BETS);
  return level>=5&&(player.coins||0)>=minBet;
}
function tavernMissionTypesForLevel(level){
  const types=[
    ...TAVERN_BASE_MISSION_TYPES,
    ...TAVERN_UNLOCKED_MISSION_TYPES.filter(entry=>level>=entry.level).map(entry=>entry.type),
  ];
  if(canOfferGamblingMissions(level))types.push(...TAVERN_GAMBLING_MISSION_TYPES);
  return Array.from(new Set(types));
}
function generateTavernMissions(level){
  const missionTypes=tavernMissionTypesForLevel(level);
  const pool=missionTypes.map(type=>missionTemplate(type,level));
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
  tavernContent.querySelectorAll('[data-cancel-mission]').forEach(btn=>btn.addEventListener('click',()=>cancelMission(btn.dataset.cancelMission)));
}
function missionRequirementText(m){
  if(m.type==='ore_delivery')return `${ORE[m.requirement.ore].lbl}: ${inventoryOreCount(m.requirement.ore)}/${m.requirement.amount}`;
  if(m.type==='mixed_value')return `Ore value: ${inventoryValue()}/${m.requirement.oreValue}`;
  if(m.type==='break_rocks')return `${ORE[m.requirement.rockType].lbl} rocks: ${m.progress||0}/${m.requirement.amount}`;
  if(m.type==='timed_contract'||m.type==='risk_contract')return `${ORE[m.requirement.ore].lbl}: ${m.progress||0}/${m.requirement.amount} - ${formatTime((m.startedAt||Date.now())+m.timeLimit-Date.now())}`;
  if(m.type==='rare_find')return `Rare drops: ${m.progress||0}/${m.requirement.rareDrops}`;
  if(m.type==='crafted_delivery')return `${RARITY_LABELS[m.requirement.craftedRarity]} forged item: ${inventoryCraftedCount(m.requirement.craftedRarity)}/${m.requirement.amount}`;
  if(m.type==='forge_any')return `Forged items: ${inventoryCraftedAnyCount()}/${m.requirement.craftedAny}`;
  if(['blackjack_winnings','dice_winnings'].includes(m.type))return `${gamblingGameLabel(m.requirement.gamblingGame)} winnings: ${m.progress||0}/${m.requirement.amount}c`;
  if(m.type==='slots_winnings')return `Three of a kind: ${m.progress||0}/${m.requirement.slotTriples||m.requirement.amount||3}`;
  if(m.type==='devil_curses')return `Curses taken: ${m.progress||0}/${m.requirement.devilCurses}`;
  if(m.type==='devil_boosts')return `Good cards: ${m.progress||0}/${m.requirement.devilBoosts}`;
  if(m.type==='deep_lift_waves')return `Waves cleared: ${m.progress||0}/${m.requirement.deepLiftWaves}`;
  if(m.type==='deep_lift_loot')return `Lift materials: ${m.progress||0}/${m.requirement.deepLiftLoot}`;
  if(m.type==='deep_lift_floors')return `Floors cleared: ${m.progress||0}/${m.requirement.deepLiftFloors}`;
  return '';
}
function missionRewardText(m){
  const legacyRarity=m.reward.rareParts&&!m.reward.itemRarity&&!m.reward.barItemId&&!m.reward.buffItem
    ? (m.reward.rareParts>1?'uncommon':'common')
    : null;
  const itemRarity=m.reward.itemRarity||legacyRarity;
  const consumableId=missionRewardConsumableId(m.reward);
  const sourceLabel=m.reward.itemSource==='gambling'?' gambling':m.reward.itemSource==='dungeon'?' dungeon':'';
  return `${m.reward.coins||0} coins${consumableId?`, ${barItemName(consumableId)} backpack item`:''}${itemRarity?`, random ${RARITY_LABELS[itemRarity]}${sourceLabel} gear`:''}`;
}
function gamblingGameLabel(game){return game==='blackjack'?'Blackjack':game==='dice'?'Dice':game==='slots'?'Slots':game;}
function barItemName(id){const item=TAVERN_ITEMS.find(i=>i.id===id);return item?item.name:id;}
function missionRewardConsumableId(reward={}){
  if(reward.barItemId)return reward.barItemId;
  if(reward.buffItem==='Lucky Cigar')return 'cigar';
  return '';
}
function missionCardHtml(m,active){
  const complete=active&&isMissionComplete(m);
  const expired=active&&isMissionExpired(m);
  const activeActions=expired
    ? `<button type="button" data-remove-mission="${m.id}">Remove Expired</button>`
    : `<button type="button" data-turnin-mission="${m.id}" ${complete?'':'disabled'}>${complete?'Turn In':'In Progress'}</button><button type="button" data-cancel-mission="${m.id}">Cancel</button>`;
  return `<article class="tavern-mission-note${expired?' failed':''}">
    <h4>${m.title}</h4><p>${m.description}</p>
    <span>Need: ${missionRequirementText(m)}</span>
    <span>Reward: ${missionRewardText(m)}</span>
    ${active
      ? activeActions
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
  if(m.type==='deep_lift_waves')return (m.progress||0)>=m.requirement.deepLiftWaves;
  if(m.type==='deep_lift_loot')return (m.progress||0)>=m.requirement.deepLiftLoot;
  if(m.type==='deep_lift_floors')return (m.progress||0)>=m.requirement.deepLiftFloors;
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
function cancelMission(id){
  const idx=player.tavern.activeMissions.findIndex(m=>m.id===id);
  if(idx<0)return;
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
  const reward={...m.reward};
  const rewardConsumableId=missionRewardConsumableId(reward);
  if(reward.rareParts&&!reward.itemRarity&&!reward.barItemId&&!reward.buffItem){
    reward.itemRarity=reward.rareParts>1?'uncommon':'common';
  }
  let rewardItemId=null;
  if(reward.itemRarity){
    if(!hasInventorySpace()){
      setBarkeepState('warning');
      if(tavernDialogue)tavernDialogue.textContent='Make room in your backpack before I hand over that forged item.';
      return;
    }
    rewardItemId=randomCraftedItemByRarity(reward.itemRarity,reward.itemSource||'standard');
    if(!rewardItemId){
      setBarkeepState('warning');
      if(tavernDialogue)tavernDialogue.textContent='The reward crate came up empty. Try another contract.';
      return;
    }
  }
  if(rewardConsumableId&&!canStoreTavernConsumable(rewardConsumableId,1,rewardItemId?1:0)){
    setBarkeepState('warning');
    if(tavernDialogue)tavernDialogue.textContent='Make room in your backpack before I hand over that tavern item.';
    return;
  }
  if(m.type==='ore_delivery')consumeOre(m.requirement.ore,m.requirement.amount);
  if(m.type==='mixed_value')consumeOreValue(m.requirement.oreValue);
  if(m.type==='crafted_delivery')consumeCraftedByRarity(m.requirement.craftedRarity,m.requirement.amount);
  if(m.type==='forge_any')consumeCraftedAny(m.requirement.craftedAny);
  addPlayerCoins(reward.coins||0);
  if(rewardConsumableId)addTavernConsumableToInventory(rewardConsumableId,1);
  if(rewardItemId){
    const added=addCraftedItem(rewardItemId);
    if(!added){
      setBarkeepState('warning');
      return;
    }
  }
  player.tavern.activeMissions.splice(idx,1);
  if(window.GameAudio)GameAudio.playPurchase();
  floatTxt(W*0.5,H*0.22,`Contract paid +${reward.coins||0}c`,'#ffd76a',true);
  showMissionRewardPopup({...m,reward},rewardItemId);
  saveGame();
  tavernMoneyText();
  renderInventory();
  if(rewardConsumableId&&typeof pulseBackpackReceive==='function')pulseBackpackReceive();
  renderMissionBoard();
}
function inventoryOreCount(type){return countInventoryOre(type);}
function inventoryCraftedCount(rarity){return countInventoryCraftedByRarity(rarity);}
function inventoryCraftedAnyCount(){return countInventoryCraftedAny();}
function consumeOre(type,amount){consumeInventoryOre(type,amount);}
function consumeOreValue(valueNeeded){consumeInventoryOreValue(valueNeeded);}
function consumeCraftedByRarity(rarity,amount){consumeInventoryCraftedByRarity(rarity,amount);}
function consumeCraftedAny(amount){consumeInventoryCraftedAny(amount);}
function craftedItemPoolBySource(rarity,source='standard'){
  return Object.entries(CRAFT_ITEM_DEFS)
    .filter(([,def])=>{
      if(def.rarity!==rarity||def.rarity==='junk')return false;
      const sources=typeof itemSources==='function'?itemSources(def):(Array.isArray(def.sources)?def.sources:[]);
      const hasSource=tag=>sources.includes(tag);
      if(source==='gambling')return hasSource('gambling');
      if(source==='dungeon')return hasSource('dungeon')&&!hasSource('boss')&&!def.bossOnly;
      return !hasSource('gambling')&&!hasSource('dungeon')&&!hasSource('boss')&&!def.bossOnly;
    })
    .map(([id])=>id);
}
function pickCraftedItemFromPool(pool){
  if(!pool.length)return null;
  return typeof pickWeightedCraftItem==='function'?pickWeightedCraftItem(pool):pool[Math.floor(Math.random()*pool.length)];
}
function randomCraftedItemByRarity(rarity,source='standard'){
  const standardPool=craftedItemPoolBySource(rarity,'standard');
  if(source==='gambling'||source==='dungeon'){
    const themedPool=craftedItemPoolBySource(rarity,source);
    const useThemed=themedPool.length&&(!standardPool.length||Math.random()<0.7);
    return pickCraftedItemFromPool(useThemed?themedPool:standardPool.length?standardPool:themedPool);
  }
  return pickCraftedItemFromPool(standardPool);
}
function missionRewardItemArt(itemId,item){
  if(typeof craftItemArtHtml==='function')return craftItemArtHtml(itemId,item,'tavern-reward-item-art');
  return `<img src="images/workbench/items/${itemId}.png" alt="">`;
}
function showMissionRewardPopup(m,itemId){
  const old=document.querySelector('.tavern-reward-popup');
  if(old)old.remove();
  const item=itemId&&CRAFT_ITEM_DEFS[itemId];
  const barItem=m.reward.barItemId&&TAVERN_ITEMS.find(i=>i.id===m.reward.barItemId);
  const wrap=document.createElement('div');
  wrap.className='tavern-reward-popup';
  wrap.innerHTML=`<div class="tavern-reward-popup-title">Contract Paid</div>
    <div class="tavern-reward-popup-items">
      <span><img src="images/workbench/items/coin_bag_reward.png" alt=""><b>${m.reward.coins||0}c</b></span>
      ${item?`<span class="rarity-${item.rarity}">${missionRewardItemArt(itemId,item)}<b>${item.name}</b></span>`:''}
      ${barItem?`<span><img src="${TAVERN_ITEM_ICONS[barItem.id]}" alt=""><b>${barItem.name}</b></span>`:''}
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
    if(m.type==='deep_lift_waves'&&kind==='deepLiftWave'){m.progress=Math.min(m.requirement.deepLiftWaves,(m.progress||0)+1);changed=true;}
    if(m.type==='deep_lift_loot'&&kind==='deepLiftLoot'){m.progress=Math.min(m.requirement.deepLiftLoot,(m.progress||0)+Math.max(0,Math.round(data.amount||0)));changed=true;}
    if(m.type==='deep_lift_floors'&&kind==='deepLiftFloor'){m.progress=Math.min(m.requirement.deepLiftFloors,(m.progress||0)+1);changed=true;}
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
    },780+i*560+(nearMiss&&i===2?520:0));
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
  if(typeof playGamblingResultEffect==='function')playGamblingResultEffect(cabinet,result,jackpot?'jackpot':payout>0?'win':'loss');
  else if(typeof playResultPlaqueEffect==='function')playResultPlaqueEffect(result,jackpot?'jackpot':payout>0?'win':'loss');
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
function gamblingTableCardHtml(card){
  return `<button type="button" class="tavern-game-card tavern-game-card-${card.className}" data-open-gambling="${card.gameKey}">
    <img src="${card.image}" alt="">
    <div class="tavern-game-prop-copy">
      <h3>${card.title}</h3>
      <p>${card.description}</p>
      <span>${card.cta}</span>
    </div>
  </button>`;
}
function gamblingTableGridHtml(){
  return `<div class="tavern-table-grid">${GAMBLING_TABLE_CARDS.map(gamblingTableCardHtml).join('')}</div>`;
}
function renderGamblingTables(){
  tavernContent.innerHTML=`<div class="tavern-station-head"><span>Gambling Tables</span><strong>Cards, dice, and cursed draws</strong></div>${gamblingTableGridHtml()}${renderGamblingPopup()}`;
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
function gamblingGameState(gameKey){
  if(gameKey==='blackjack')return blackjackState;
  if(gameKey==='dice')return diceState;
  if(gameKey==='devilsDraw')return devilsDrawState;
  return null;
}
function gamblingGameRenderer(gameKey){
  if(gameKey==='blackjack')return renderBlackjackPopup;
  if(gameKey==='dice')return renderDicePopup;
  if(gameKey==='devilsDraw')return renderDevilsDrawPopup;
  return null;
}
function gamblingModalHtml(gameKey,body){
  const title=GAMBLING_GAME_LABELS[gameKey]||'Gambling';
  return `<div class="gambling-modal-backdrop"><section class="gambling-modal ${gameKey}-popup" aria-label="${title}"><button type="button" class="gambling-close-btn" data-gambling-close ${gamblingPopupBusy()?'disabled':''}>Close</button>${body}</section></div>`;
}
function gamblingPopupBusy(){
  return Object.keys(GAMBLING_BUSY_PHASES).some(gameKey=>{
    const state=gamblingGameState(gameKey);
    return state&&GAMBLING_BUSY_PHASES[gameKey].includes(state.phase);
  });
}
function renderGamblingPopup(){
  if(!activeGamblingGame)return '';
  const render=gamblingGameRenderer(activeGamblingGame);
  return render?gamblingModalHtml(activeGamblingGame,render()):'';
}
function chipButtons(prefix,selected=0,locked=false){
  return GAMBLING_CHIPS.map(c=>`<button type="button" class="gambling-chip ${selected===c?'selected':''}" data-${prefix}-chip="${c}" ${locked||player.coins<c?'disabled':''}>${c}c</button>`).join('');
}
function removeChipButtons(prefix,bet,locked=false){
  const step=GAMBLING_CHIPS[0];
  return `<button type="button" data-${prefix}-remove="${step}" ${locked||bet<=0?'disabled':''}>-${step}c</button><button type="button" data-${prefix}-remove="${bet}" ${locked||bet<=0?'disabled':''}>Clear</button>`;
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
  setTimeout(()=>{if(!blackjackState||activeGamblingGame!=='blackjack')return; blackjackState.phase='playerTurn'; blackjackState.message='Your move.'; if(blackjackIsNatural(blackjackState.playerHands[0].cards))blackjackDealerPlay(); else renderGamblingTables();},1120);
}
function blackjackCardScore(card){
  if(card.rank==='A')return 11;
  return ['J','Q','K'].includes(card.rank)?10:Number(card.rank);
}
function blackjackHandValue(cards){
  let total=cards.reduce((sum,card)=>sum+blackjackCardScore(card),0);
  let aces=cards.filter(card=>card.rank==='A').length;
  while(total>21&&aces>0){
    total-=10;
    aces--;
  }
  return total;
}
function blackjackIsNatural(cards){
  return cards.length===2&&blackjackHandValue(cards)===21;
}
function blackjackHandOutcome(hand,dealerValue,isSingleHand){
  const value=blackjackHandValue(hand.cards);
  if(hand.busted)return {result:'lose',payout:0};
  if(blackjackIsNatural(hand.cards)&&isSingleHand)return {result:'blackjack',payout:Math.round(hand.bet*2.5)};
  if(dealerValue>21||value>dealerValue)return {result:'win',payout:hand.bet*2};
  if(value===dealerValue)return {result:'push',payout:hand.bet};
  return {result:'lose',payout:0};
}
function blackjackCurrentHand(){
  return blackjackState&&blackjackState.playerHands[blackjackState.activeHandIndex];
}
function blackjackCanDouble(){
  const h=blackjackCurrentHand();
  return blackjackState&&
    blackjackState.phase==='playerTurn'&&
    h&&
    h.cards.length===2&&
    !h.doubled&&
    player.coins>=h.bet;
}
function blackjackCanSplit(){
  const h=blackjackCurrentHand();
  return blackjackState&&
    blackjackState.phase==='playerTurn'&&
    h&&
    h.cards.length===2&&
    h.cards[0].rank===h.cards[1].rank&&
    player.coins>=h.bet&&
    blackjackState.playerHands.length<2;
}
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
  if(!liveHands.length)return setTimeout(blackjackResolve,640);
  const step=()=>{
    if(!blackjackState||activeGamblingGame!=='blackjack')return;
    if(blackjackHandValue(blackjackState.dealerHand)<17){
      blackjackState.dealerHand.push(blackjackDraw());
      blackjackState.message='Dealer hits.';
      renderGamblingTables();
      setTimeout(step,700);
      return;
    }
    blackjackResolve();
  };
  setTimeout(step,840);
}
function blackjackResolve(){
  if(!blackjackState)return;
  blackjackState.phase='resolving';
  const dealerValue=blackjackHandValue(blackjackState.dealerHand);
  let payout=0;
  const isSingleHand=blackjackState.playerHands.length===1;
  blackjackState.playerHands.forEach(h=>{
    const outcome=blackjackHandOutcome(h,dealerValue,isSingleHand);
    h.result=outcome.result;
    payout+=outcome.payout;
  });
  addPlayerCoins(payout);
  if(payout>0)trackTavernMission('gamblingWin',{game:'blackjack',amount:payout});
  blackjackState.phase='complete';
  blackjackState.message=payout>0?`Paid ${payout}c.`:BLACKJACK_LOSS_MESSAGES[Math.floor(Math.random()*BLACKJACK_LOSS_MESSAGES.length)];
  saveGame(); tavernMoneyText(); setBarkeepState(payout>0?'gambling':'warning'); renderGamblingTables();
  requestAnimationFrame(()=>{
    const table=document.querySelector('.blackjack-table');
    const msg=document.querySelector('.blackjack-table .gambling-message');
    if(typeof playGamblingResultEffect==='function')playGamblingResultEffect(table,msg,payout>0?'win':'loss');
    else if(msg&&typeof playResultPlaqueEffect==='function')playResultPlaqueEffect(msg,payout>0?'win':'loss');
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
  const suit=BLACKJACK_SUIT_SYMBOLS[card.suit]||'';
  return `<span class="blackjack-card front ${red?'red':'black'}"${style}><b>${card.rank}</b><em>${suit}</em></span>`;
}
function renderBlackjackActions(){
  if(blackjackState.phase==='betting'){
    return `<button type="button" data-bj-action="deal" ${blackjackState.bet<=0||player.coins<blackjackState.bet?'disabled':''}>Deal</button>`;
  }
  if(blackjackState.phase==='playerTurn'){
    return [
      '<button type="button" data-bj-action="hit">Hit</button>',
      '<button type="button" data-bj-action="stand">Stand</button>',
      `<button type="button" data-bj-action="double" ${blackjackCanDouble()?'':'disabled'}>Double</button>`,
      `<button type="button" data-bj-action="split" ${blackjackCanSplit()?'':'disabled'}>Split</button>`,
    ].join('');
  }
  return blackjackState.phase==='complete'?`<button type="button" data-bj-action="new">New Bet</button>`:'';
}
function renderBlackjackDealerZone(){
  const dealerValue=blackjackState.dealerHoleRevealed?blackjackHandValue(blackjackState.dealerHand):blackjackHandValue(blackjackState.dealerHand.slice(0,1));
  const cards=blackjackState.dealerHand.map((card,index)=>blackjackCardHtml(card,index===1&&!blackjackState.dealerHoleRevealed,120+index*150,'dealer',index)).join('');
  return `<div class="blackjack-dealer-zone"><span>Dealer ${blackjackState.dealerHoleRevealed?dealerValue:'?'}</span><div class="blackjack-hand">${cards}</div></div>`;
}
function renderBlackjackPlayerHand(hand,index){
  const active=index===blackjackState.activeHandIndex&&blackjackState.phase==='playerTurn';
  const cards=hand.cards.map((card,cardIndex)=>blackjackCardHtml(card,false,cardIndex*130,'player',cardIndex)).join('');
  return `<div class="blackjack-player-hand ${active?'active':''} ${hand.result||''}"><span>Hand ${index+1}: ${blackjackHandValue(hand.cards)} ${hand.result?`- ${hand.result}`:''}</span><div class="blackjack-hand">${cards}</div></div>`;
}
function renderBlackjackBetRail(){
  const locked=blackjackState.phase!=='betting';
  return `<div class="gambling-bet-rail"><strong>Bet ${blackjackState.bet}c</strong><div>${chipButtons('bj',0,locked)}</div><div>${removeChipButtons('bj',blackjackState.bet,locked)}</div></div>`;
}
function renderBlackjackPopup(){
  if(!blackjackState)blackjackNewBet();
  return `<div class="gambling-game-title">Blackjack</div><div class="blackjack-table">
    <img class="gambling-table-art" src="images/tavern/gambling/blackjack/blackjack-table-popup.png" alt="">
    <div class="blackjack-deck"></div>
    ${renderBlackjackDealerZone()}
    <div class="gambling-message">${blackjackState.message}</div>
    <div class="blackjack-player-zone">${blackjackState.playerHands.map(renderBlackjackPlayerHand).join('')}</div>
    ${renderBlackjackBetRail()}
    <div class="gambling-actions">${renderBlackjackActions()}</div>
  </div>`;
}
function diceNewRound(){
  diceState={
    phase:'betting',
    bet:0,
    prediction:null,
    dice:[null,null],
    message:'Place a bet and choose low, seven, or high.',
  };
}
function diceAddChip(amount){
  if(!diceState||!['betting','complete'].includes(diceState.phase))return;
  if(diceState.phase==='complete')diceNewRound();

  if(diceState.bet+amount>player.coins){
    setBarkeepState('warning');
    return;
  }

  diceState.bet+=amount;
  diceState.message=`Bet set to ${diceState.bet}c.`;
  renderGamblingTables();
}
function diceRemoveChip(amount){
  if(!diceState||diceState.phase!=='betting')return;
  diceState.bet=Math.max(0,diceState.bet-amount);
  renderGamblingTables();
}
function diceChoosePrediction(choice){
  if(!diceState||!['betting','complete'].includes(diceState.phase))return;
  if(diceState.phase==='complete')diceNewRound();
  diceState.prediction=choice;
  diceState.message=`${choice==='seven'?'Seven':choice} called.`;
  renderGamblingTables();
}
function diceRoll(){
  if(!diceState||diceState.phase!=='betting')return;
  if(diceState.bet<=0||!diceState.prediction){
    diceState.message='Set a bet and prediction first.';
    renderGamblingTables();
    return;
  }
  if(player.coins<diceState.bet){setBarkeepState('warning');return;}
  player.coins-=diceState.bet;
  diceState.phase='rolling';
  diceState.message='The cup rattles...';
  diceState.dice=rollLuckyDicePair(diceState.prediction);
  saveGame();
  tavernMoneyText();
  renderGamblingTables();
  setTimeout(diceResolve,1480);
}
function diceResolve(){
  if(!diceState||activeGamblingGame!=='dice')return;
  const total=diceState.dice[0]+diceState.dice[1];
  const win=dicePredictionWins(diceState.prediction,total);
  const payout=win?diceState.bet*(diceState.prediction==='seven'?5:2):0;
  addPlayerCoins(payout);
  diceState.phase='complete';
  diceState.message=`Rolled ${total}. ${win?`Paid ${payout}c.`:'House takes it.'}`;
  if(payout>0)trackTavernMission('gamblingWin',{game:'dice',amount:payout});
  saveGame();
  tavernMoneyText();
  setBarkeepState(win?'gambling':'warning');
  renderGamblingTables();
  requestAnimationFrame(()=>{
    const tray=document.querySelector('.dice-tray');
    const msg=document.querySelector('.dice-table .gambling-message');
    if(tray&&typeof pulseElement==='function')pulseElement(tray,win?'dice-win':'dice-loss',760);
    const table=document.querySelector('.dice-table');
    if(typeof playGamblingResultEffect==='function')playGamblingResultEffect(table||tray,msg,win?'win':'loss');
    else if(msg&&typeof playResultPlaqueEffect==='function')playResultPlaqueEffect(msg,win?'win':'loss');
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
function diceCupImageState(){
  if(diceState.phase==='rolling')return 'shake-1';
  return diceState.phase==='complete'?'raised':'normal';
}
function diceDieHtml(index,revealDice){
  const value=diceState.dice[index];
  const rolling=diceState.phase==='rolling'?'is-rolling':'';
  const image=revealDice&&value?`<img src="images/tavern/gambling/dice/dice-${value}.png" alt="${value}">`:'';
  return `<span class="dice-die ${rolling}">${image}</span>`;
}
function renderDiceTray(revealDice){
  const trayState=revealDice?'is-revealed':'is-hidden';
  return `<div class="dice-tray ${trayState}">${[0,1].map(index=>diceDieHtml(index,revealDice)).join('')}</div>`;
}
function renderDicePredictionButtons(){
  const choices=['low','seven','high'];
  return `<div class="dice-prediction-buttons">${choices.map(choice=>{
    const selected=diceState.prediction===choice?'selected':'';
    const disabled=diceState.phase==='rolling'?'disabled':'';
    const label=choice==='seven'?'Seven':choice;
    return `<button type="button" data-dice-choice="${choice}" class="${selected}" ${disabled}>${label}</button>`;
  }).join('')}</div>`;
}
function renderDiceBetRail(){
  return `<div class="gambling-bet-rail">
    <strong>Bet ${diceState.bet}c</strong>
    <div>${chipButtons('dice',0,diceState.phase==='rolling')}</div>
    <div>${removeChipButtons('dice',diceState.bet,diceState.phase!=='betting')}</div>
  </div>`;
}
function renderDiceActions(){
  const disabled=diceState.phase!=='betting'||diceState.bet<=0||!diceState.prediction?'disabled':'';
  const replay=diceState.phase==='complete'?'<button type="button" data-dice-chip="0">Replay</button>':'';
  return `<div class="gambling-actions"><button type="button" data-dice-cup ${disabled}>Shake Cup</button>${replay}</div>`;
}
function renderDicePopup(){
  if(!diceState)diceNewRound();
  const cup=diceCupImageState();
  const revealDice=diceState.phase==='complete';
  return `<div class="gambling-game-title">Dice Table</div><div class="dice-table">
    <img class="gambling-table-art" src="images/tavern/gambling/dice/dice-table-popup.png" alt="">
    <div class="dice-cup ${diceState.phase==='rolling'?'is-shaking':''}" data-dice-cup><img src="images/tavern/gambling/dice/dice-cup-${cup}.png" alt=""></div>
    ${renderDiceTray(revealDice)}
    <div class="gambling-message">${diceState.message}</div>
    ${renderDicePredictionButtons()}
    ${renderDiceBetRail()}
    ${renderDiceActions()}
  </div>`;
}
function devilsDrawCost(){
  return DEVILS_DRAW_BASE_COST;
}
function devilsDrawNewRound(){
  const cost=devilsDrawCost();
  devilsDrawState={phase:'ready',cost,offeredCards:[],selectedIndex:null,result:null,message:`Pay ${cost}c. The deck offers three chances.`};
}
function weightedDevilsOutcome(){
  const luck=gamblingLuckMult();
  const weights=DEVILS_DRAW_OUTCOMES.map(outcome=>{
    const base=outcome.rarity==='legendary'?5:outcome.rarity==='epic'?8:outcome.rarity==='rare'?13:outcome.rarity==='uncommon'?18:24;
    return outcome.type==='curse'?(base*1.28)/Math.sqrt(luck):base*Math.sqrt(luck);
  });
  const total=weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(let i=0;i<weights.length;i++){r-=weights[i];if(r<=0)return DEVILS_DRAW_OUTCOMES[i];}
  return DEVILS_DRAW_OUTCOMES[0];
}
function devilsDrawOfferCards(){
  return [weightedDevilsOutcome(),weightedDevilsOutcome(),weightedDevilsOutcome()];
}
function resetDevilsDrawChoice(){
  devilsDrawState.result=null;
  devilsDrawState.selectedIndex=null;
  devilsDrawState.offeredCards=[];
}
function makeRoomForDevilsCurse(){
  ensureTavernState();
  if(player.tavern.activeBuffs.length<MAX_TAVERN_BUFFS)return;
  const displaced=player.tavern.activeBuffs.shift();
  if(!displaced)return;
  const barIndex=player.tavern.activeBarItems.findIndex(item=>item&&item.id===displaced.id&&item.expiresAt===displaced.expiresAt);
  if(barIndex>=0)player.tavern.activeBarItems.splice(barIndex,1);
  else player.tavern.activeBarItems.shift();
}
function devilsDrawStart(){
  if(!devilsDrawState||!['ready','complete'].includes(devilsDrawState.phase))return;
  if(player.coins<devilsDrawState.cost){setBarkeepState('warning');return;}
  player.coins-=devilsDrawState.cost;
  devilsDrawState.phase='shuffling';
  devilsDrawState.message='The deck whispers...';
  resetDevilsDrawChoice();
  saveGame();
  tavernMoneyText();
  renderGamblingTables();
  setTimeout(()=>{
    if(!devilsDrawState||activeGamblingGame!=='devilsDraw')return;
    devilsDrawState.phase='choosing';
    devilsDrawState.offeredCards=devilsDrawOfferCards();
    devilsDrawState.message='Choose one. Only one.';
    renderGamblingTables();
  },1820);
}
function devilsDrawChooseCard(index){
  if(!devilsDrawState||devilsDrawState.phase!=='choosing')return;
  devilsDrawState.selectedIndex=index;
  devilsDrawState.phase='revealing';
  devilsDrawState.message='The card burns at the edge...';
  renderGamblingTables();
  setTimeout(()=>devilsDrawReveal(index),1180);
}
function devilsDrawReveal(index){
  if(!devilsDrawState||activeGamblingGame!=='devilsDraw')return;
  const outcome=devilsDrawState.offeredCards[index];
  devilsDrawState.result=outcome;
  if(outcome.value)player.coins=Math.max(0,player.coins+outcome.value);
  if(outcome.type==='curse'&&outcome.buff)makeRoomForDevilsCurse();
  if(outcome.buff)applyTavernBuff(outcome.buff);
  if(outcome.barItemId)applyTavernBuff(TAVERN_ITEMS.find(i=>i.id===outcome.barItemId));
  trackTavernMission('devilsDraw',{outcomeType:outcome.type,rarity:outcome.rarity,id:outcome.id});
  devilsDrawState.phase='complete';
  devilsDrawState.message=`${outcome.label}: ${outcome.effect}`;
  saveGame();
  tavernMoneyText();
  renderTavernBuffs();
  setBarkeepState(outcome.type==='curse'?'warning':'gambling');
  renderGamblingTables();
  requestAnimationFrame(()=>{
    const table=document.querySelector('.devils-table');
    const msg=document.querySelector('.devils-table .gambling-message');
    if(typeof playGamblingResultEffect==='function')playGamblingResultEffect(table,msg,outcome.type==='curse'?'curse':'boost');
    else if(msg&&typeof playResultPlaqueEffect==='function')playResultPlaqueEffect(msg,outcome.type==='curse'?'loss':'win');
  });
}
function devilsDrawCardHtml(index){
  const chosen=devilsDrawState.selectedIndex===index;
  const revealed=devilsDrawState.phase==='complete'&&chosen;
  const returning=devilsDrawState.phase==='revealing'&&devilsDrawState.selectedIndex!==null&&!chosen;
  const gone=devilsDrawState.phase==='complete'&&devilsDrawState.selectedIndex!==null&&!chosen;
  const outcome=revealed?devilsDrawState.result:null;
  const returnX=index===0?'146px':index===2?'-146px':'0px';
  const cardState=[
    'devils-card',
    'devils-plaque',
    devilsDrawState.phase==='choosing'?'is-dealt':'',
    chosen?'is-selected':'',
    revealed?'is-revealed':'',
    returning?'is-returning':'',
    gone?'is-gone':'',
    outcome?`devils-${outcome.type} rarity-${outcome.rarity}`:'',
  ].filter(Boolean).join(' ');
  const result=revealed
    ? `<span class="devils-card-result"><strong>${outcome.label}</strong><em>${outcome.effect}</em></span>`
    : '';
  return `<button type="button" class="${cardState}" style="--card-index:${index};--return-x:${returnX}" data-devil-card="${index}" ${devilsDrawState.phase!=='choosing'?'disabled':''}>${result}</button>`;
}
function renderDevilsDrawCards(showCards){
  return showCards?[0,1,2].map(devilsDrawCardHtml).join(''):'';
}
function renderDevilsDrawAction(){
  const disabled=['shuffling','choosing','revealing'].includes(devilsDrawState.phase)?'disabled':'';
  const label=devilsDrawState.phase==='complete'?`Shuffle ${devilsDrawState.cost}c`:`Pay ${devilsDrawState.cost}c`;
  return `<div class="gambling-actions"><button type="button" data-devil-action ${disabled}>${label}</button></div>`;
}
function renderDevilsDrawPopup(){
  if(!devilsDrawState)devilsDrawNewRound();
  const showCards=['choosing','revealing','complete'].includes(devilsDrawState.phase);
  const cards=renderDevilsDrawCards(showCards);
  return `<div class="gambling-game-title">Devil's Draw</div><div class="devils-table">
    <img class="gambling-table-art" src="images/tavern/gambling/devils-draw/devils-draw-table-popup.png" alt="">
    <div class="devils-deck ${devilsDrawState.phase==='shuffling'?'is-shuffling':''}"><img src="images/tavern/gambling/devils-draw/cursed-deck.png" alt=""></div>
    <div class="devils-card-row ${showCards?'':'is-empty'}">${cards}</div>
    <div class="gambling-message">${devilsDrawState.message}</div>
    ${renderDevilsDrawAction()}
  </div>`;
}
