// â”€â”€ CHARACTER PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderCharacter(){
  if(!charStatsList)return;
  const portrait=document.querySelector('.char-portrait-placeholder');
  if(portrait&&!portrait.querySelector('img'))portrait.innerHTML='<img src="images/miner-portrait-bust.webp" alt="">';
  const lv=playerLevel(), prog=xpProgress();
  document.getElementById('char-level-badge').textContent=`Level ${lv}`;
  document.getElementById('char-xp-cur').textContent=prog.cur;
  document.getElementById('char-xp-needed').textContent=prog.needed;
  document.getElementById('char-xp-next-lv').textContent=lv+1;
  document.getElementById('char-xp-fill').style.width=`${Math.round(prog.pct*100)}%`;
  const cm=Math.round(coinMultBonus()*100), xm=Math.round(xpMultBonus()*100);
  const stats=[
    {sprite:'coin',  label:'Coins',         val:player.coins,                             col:'#f4c84a'},
    {sprite:'ore',   label:'Ore in Bag',    val:inventoryValue()+'c',                     col:'#d4824a'},
    {sprite:'rock',  label:'Rocks Broken',  val:gs.breaks,                                col:'#8898a8'},
    {sprite:'xp',    label:'Total XP',      val:player.xp,                                col:'#9fe87a'},
    {sprite:'power', label:'Total Damage',  val:`+${powerBonus()} dmg`,                   col:'#ff9955'},
    {sprite:'luck',  label:'Universal Luck',val:`+${Math.round(luckBonus()*100)}%`,       col:'#bb88ff'},
    {sprite:'yield', label:'Yield Bonus',   val:`+${Math.round(yieldBonus()*100)}%`,      col:'#55ddaa'},
    {sprite:'coin',  label:'Sell Bonus',    val:cm>0?`+${cm}%`:'â€”',                       col:'#f4c84a'},
    {sprite:'xp',    label:'XP Bonus',      val:xm>0?`+${xm}%`:'â€”',                      col:'#9fe87a'},
  ];
  const activeBuffs=player.tavern&&Array.isArray(player.tavern.activeBuffs)?player.tavern.activeBuffs:[];
  stats.push(
    {sprite:'speed', label:'Swing Speed',   val:`${Math.round(BASE_SWING_DUR/(sw.durFrames||BASE_SWING_DUR)*100)}%`, col:'#ffd070'},
    {sprite:'crit',  label:'Weak Point',    val:`${Math.round(weakPointBaseRadius())}px / ${Math.round(chain.timeoutFrames)}f`, col:'#ffb060'},
    {sprite:'rare',  label:'Rare Ore Bonus',val:`+${Math.round(rareFinderBonus()*100)}%`, col:'#bb88ff'},
    {sprite:'forge', label:'Forge Bonus',   val:`+${Math.round(forgeLuckBonus()*100)}% luck`, col:'#f0a050'},
    {sprite:'luck',  label:'Gambling Luck', val:`${Math.round(gamblingLuckMult()*100)}%`, col:'#d6a8ff'},
    {sprite:'buff',  label:'Active Buffs',  val:activeBuffs.length?activeBuffs.map(b=>b.name).join(', '):'None', col:'#90e08c'}
  );
  charStatsList.innerHTML='';
  stats.forEach(s=>{
    const row=document.createElement('div');
    row.className='char-stat-row';
    row.innerHTML=`<span class="char-stat-icon-ph" data-sprite="${s.sprite}" style="color:${s.col}">[${s.sprite[0].toUpperCase()}]</span><span class="char-stat-label">${s.label}</span><span class="char-stat-val" style="color:${s.col}">${s.val}</span>`;
    charStatsList.appendChild(row);
  });
}

// â”€â”€ INVENTORY RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderInventory(){
  if(!inventoryGrid)return;
  ensureInventorySlots();
  const slotEls=inventoryGrid.querySelectorAll('.inventory-slot');
  let usedSlots=0;
  slotEls.forEach((el,i)=>{
    const item=player.inventory[i];
    // Build a cheap fingerprint — only re-render when the slot actually changed
    const fp=item?(item.kind==='item'?`item:${item.itemId}`:`ore:${item.type}:${item.count}`):'';
    if(el.dataset.fp===fp){ if(item)usedSlots++; return; }
    el.dataset.fp=fp;
    el.dataset.itemId='';
    if(item){
      usedSlots++;
      if(item.kind==='item'){
        const def=CRAFT_ITEM_DEFS[item.itemId];
        const rc=def?(RARITY_COLS[def.rarity]||'#aaa'):'#aaa';
        el.dataset.itemId=item.itemId;
        el.innerHTML=def?`<div class="ore-icon ore-icon-art item-icon-art inventory-forged-art" style="--ore-glow:${def.glow||rc}"><img src="${craftItemIconSrc(item.itemId)}" alt=""></div>`:'';
      }else{
        const ore=ORE[item.type];
        const icon=MARKET_ORE_ICONS[item.type];
        const glow=ore.glow||ore.hi;
        el.innerHTML=icon
          ? `<div class="ore-icon ore-icon-art" style="--ore-glow:${glow}"><img src="${icon}" alt=""></div><div class="ore-slot-name">${ore.lbl}</div><div class="ore-slot-count">x${item.count}</div>`
          : `<div class="ore-icon" style="background:${ore.col};box-shadow:inset 0 2px 5px rgba(0,0,0,0.55),0 0 8px ${glow}"></div><div class="ore-slot-name">${ore.lbl}</div><div class="ore-slot-count">x${item.count}</div>`;
      }
      el.classList.add('has-item');
    }else{
      el.innerHTML=''; el.classList.remove('has-item');
    }
  });
  const fill=document.getElementById('storage-bar-fill');
  const count=document.getElementById('storage-count');
  const activeSize=activeInventorySize();
  const pct=usedSlots/activeSize;
  if(fill){ fill.style.width=`${Math.round(pct*100)}%`; fill.classList.toggle('storage-warn',pct>=0.85); }
  if(count) count.textContent=`${usedSlots} / ${activeSize}`;
  if(backpackToggle) backpackToggle.style.setProperty('--bag-load',Math.min(1,pct).toFixed(3));
}
function itemEffectText(def){
  if(!def||!def.effect)return 'No passive effect.';
  const parts=Object.entries(def.effect).map(([key,val])=>{
    if(key==='power')return `+${val} mining power`;
    if(key==='oreValue')return `+${Math.round(val*100)}% ore value`;
    if(key==='stoneValue')return `+${Math.round(val*100)}% stone value`;
    if(key==='goldValue')return `+${Math.round(val*100)}% gold value`;
    if(key==='luck')return `+${Math.round(val*100)}% universal luck`;
    if(key==='yield')return `+${Math.round(val*100)}% ore yield`;
    if(key==='rareFinder')return `+${Math.round(val*100)}% rare ore chance`;
    if(key==='forgeLuck')return `+${Math.round(val*100)}% forge luck`;
    if(key==='inventoryCapacity')return `+${val} inventory slot`;
    if(key==='upgradeDiscount')return `+${Math.round(val*100)}% upgrade discount`;
    if(key==='pickupRange')return `+${Math.round(val*100)}% pickup range`;
    if(key==='autoCritChance')return `+${Math.round(val*100)}% auto-crit chance`;
    if(key==='autoCritHits')return `+${val} auto-crit hit${val===1?'':'s'}`;
    if(key==='proxyDamage')return `+${Math.round(val*100)}% echo damage`;
    if(key==='coinMult')return `+${Math.round(val*100)}% income`;
    if(key==='forgedSellMult')return `+${Math.round(val*100)}% forged sell value`;
    if(key==='rareOreValue')return `+${Math.round(val*100)}% rare ore value`;
    if(key==='junkReduction')return `-${Math.round(val*100)}% junk risk`;
    return `${key}: ${val}`;
  });
  if(def.ability&&def.ability.kind==='chain_auto_crit'){
    parts.push(`${Math.round(def.ability.chance*110)}% auto-crit chain before luck (${def.ability.minHits}-${def.ability.maxHits})`);
  }
  return parts.length?parts.join(', '):'No passive effect.';
}
function showItemTooltip(itemId,x,y){
  if(!itemTooltip||!itemId)return;
  const def=CRAFT_ITEM_DEFS[itemId];
  if(!def)return;
  const rc=RARITY_COLS[def.rarity]||'#d6a85f';
  itemTooltip.innerHTML=`
    <div class="item-tooltip-name" style="color:${def.col}">${def.name}</div>
    <div class="item-tooltip-rarity" style="color:${rc}">${RARITY_LABELS[def.rarity]||def.rarity}</div>
    <div class="item-tooltip-row"><span>Effect</span><strong>${def.desc}</strong></div>
    <div class="item-tooltip-row"><span>Passive</span><strong>${itemEffectText(def)}</strong></div>
    <div class="item-tooltip-row"><span>Value</span><strong>${forgedItemSellValue(itemId)}c</strong></div>`;
  itemTooltip.classList.remove('hidden');
  const pad=16;
  const rect=itemTooltip.getBoundingClientRect();
  const left=Math.min(window.innerWidth-rect.width-pad,x+18);
  const top=Math.min(window.innerHeight-rect.height-pad,y+18);
  itemTooltip.style.left=`${Math.max(pad,left)}px`;
  itemTooltip.style.top=`${Math.max(pad,top)}px`;
}
function hideItemTooltip(){
  if(itemTooltip)itemTooltip.classList.add('hidden');
}
function ensureInventorySlots(){
  if(!inventoryGrid)return;
  const target=activeInventorySize();
  while(player.inventory.length<target) player.inventory.push(null);
  while(inventoryGrid.children.length<target){
    const slot=document.createElement('div');
    slot.className='inventory-slot';
    inventoryGrid.appendChild(slot);
  }
}

// â”€â”€ MARKETPLACE RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderMarket(){
  if(!marketOreList||!marketForgedList)return;
  const counts={};
  player.inventory.forEach(slot=>{if(slot&&slot.kind!=='item')counts[slot.type]=(counts[slot.type]||0)+slot.count;});
  const val=inventoryValue();
  sellAllOresBtn.disabled=val<=0;
  sellAllOresBtn.textContent=val>0?`Sell All Ores (+${val} coins)`:'Sell All Ores';
  const forged=player.inventory.map((slot,idx)=>slot&&slot.kind==='item'&&CRAFT_ITEM_DEFS[slot.itemId]?{idx,id:slot.itemId,def:CRAFT_ITEM_DEFS[slot.itemId]}:null).filter(Boolean);
  const forgedTotal=forged.reduce((sum,item)=>sum+forgedItemSellValue(item.id),0);
  if(sellAllForgedBtn){
    sellAllForgedBtn.disabled=forgedTotal<=0;
    sellAllForgedBtn.textContent=forgedTotal>0?`Sell All Forged (+${forgedTotal} coins)`:'Sell All Forged Items';
  }
  marketOreList.innerHTML='';
  marketForgedList.innerHTML='';
  ORE_KEYS.forEach(type=>{
    const ore=ORE[type],count=counts[type]||0;
    const om=oreValueMult(type);
    const effectiveVal=Math.round(ore.val*(1+om));
    const row=document.createElement('div'); row.className=`market-row market-row-${type}`;
    const glow=ore.glow?`;box-shadow:0 0 6px ${ore.glow}`:'';
    const icon=MARKET_ORE_ICONS[type]?`<img class="market-ore-img" src="${MARKET_ORE_ICONS[type]}" alt="">`:`<div class="market-ore-icon" style="background:${ore.col}${glow}"></div>`;
    row.innerHTML=`<div class="market-ore-info"><div class="market-ore-icon-wrap" style="${ore.glow?`--ore-glow:${ore.glow};`:''}">${icon}</div><span class="market-ore-name">${ore.lbl}</span></div><div class="market-ore-meta"><span class="market-ore-price">${effectiveVal}c${om>0?` <em class="market-bonus">+${Math.round(om*100)}%</em>`:''}</span><span class="market-ore-count">Bag: ${count}</span></div>`;
    const btn=document.createElement('button');
    btn.className='market-sell-btn'; btn.type='button'; btn.textContent='Sell All'; btn.disabled=count<=0;
    btn.addEventListener('click',()=>sellOreType(type,row));
    row.appendChild(btn); marketOreList.appendChild(row);
  });
  const oreSlots=8;
  for(let i=ORE_KEYS.length;i<oreSlots;i++){
    const row=document.createElement('div');
    row.className='market-row market-empty-slot';
    row.innerHTML='<div class="market-empty-label">Locked Shelf</div>';
    marketOreList.appendChild(row);
  }
  const forgedSlots=12;
  forged.slice(0,forgedSlots).forEach(item=>{
    const rc=RARITY_COLS[item.def.rarity]||'#aaa';
    const row=document.createElement('div');
    row.className='market-row market-forged-row';
    row.innerHTML=`<div class="market-ore-info market-forged-info"><div class="market-forged-icon" style="--item-col:${item.def.col};--item-glow:${item.def.glow||rc}"><img src="${craftItemIconSrc(item.id)}" alt=""></div><span class="market-ore-name">${item.def.name}</span></div><div class="market-ore-meta"><span class="market-ore-price">${forgedItemSellValue(item.id)}c</span><span class="market-ore-count">${RARITY_LABELS[item.def.rarity]||item.def.rarity}</span></div>`;
    const btn=document.createElement('button');
    btn.className='market-sell-btn'; btn.type='button'; btn.textContent='Sell';
    btn.addEventListener('click',()=>sellCraftedItem(item.idx,row));
    row.appendChild(btn);
    marketForgedList.appendChild(row);
  });
  for(let i=forged.length;i<forgedSlots;i++){
    const row=document.createElement('div');
    row.className='market-row market-forged-row market-empty-slot';
    row.innerHTML='<div class="market-empty-label">Empty Slot</div>';
    marketForgedList.appendChild(row);
  }
}

const STAT_ACHIEVEMENT_TIERS = [
  {rank:'Stone',min:0,className:'tier-stone'},
  {rank:'Copper',min:10,className:'tier-copper'},
  {rank:'Iron',min:50,className:'tier-iron'},
  {rank:'Gold',min:200,className:'tier-gold'},
  {rank:'Relic',min:1000,className:'tier-relic'},
  {rank:'Mythic',min:5000,className:'tier-mythic'},
];
const STAT_ACHIEVEMENT_OVERRIDES = {
  coins:[0,100,1000,10000,100000,1000000],
  totalXp:[0,100,500,2500,10000,50000],
  totalRocks:[0,25,100,500,2500,10000],
  rocksBroken:[0,10,50,200,1000,5000],
  highestCritChain:[0,5,10,20,40,75],
  totalForgedItems:[0,3,10,35,100,250],
  currentLevel:[0,3,8,15,30,60],
};
function statAchievementTier(key,value){
  const thresholds=STAT_ACHIEVEMENT_OVERRIDES[key];
  if(thresholds){
    let idx=0;
    for(let i=0;i<thresholds.length;i++)if(value>=thresholds[i])idx=i;
    return STAT_ACHIEVEMENT_TIERS[Math.min(idx,STAT_ACHIEVEMENT_TIERS.length-1)];
  }
  let tier=STAT_ACHIEVEMENT_TIERS[0];
  for(const t of STAT_ACHIEVEMENT_TIERS)if(value>=t.min)tier=t;
  return tier;
}
function nextStatAchievementRequirement(key,value){
  const thresholds=STAT_ACHIEVEMENT_OVERRIDES[key]||STAT_ACHIEVEMENT_TIERS.map(t=>t.min);
  const nextIndex=thresholds.findIndex(min=>value<min);
  if(nextIndex<0)return 'Max achievement tier reached';
  const tier=STAT_ACHIEVEMENT_TIERS[Math.min(nextIndex,STAT_ACHIEVEMENT_TIERS.length-1)];
  const remaining=Math.max(0,thresholds[nextIndex]-value);
  return `Next: ${tier.rank} at ${thresholds[nextIndex]} (${remaining} more)`;
}

// Overrides the early character renderer with the expanded RPG sheet stats.
function renderCharacter(){
  if(!charStatsList)return;
  const portrait=document.querySelector('.char-portrait-placeholder');
  if(portrait&&!portrait.querySelector('img'))portrait.innerHTML='<img src="images/miner-portrait-bust.webp" alt="">';
  const lv=playerLevel(), prog=xpProgress();
  document.getElementById('char-level-badge').textContent=`Level ${lv}`;
  document.getElementById('char-xp-cur').textContent=prog.cur;
  document.getElementById('char-xp-needed').textContent=prog.needed;
  document.getElementById('char-xp-next-lv').textContent=lv+1;
  document.getElementById('char-xp-fill').style.width=`${Math.round(prog.pct*100)}%`;
  player.stats={...DEFAULT_STATS,...(player.stats||{})};
  const cm=Math.round(coinMultBonus()*100), xm=Math.round(xpMultBonus()*100);
  const oreCount=player.inventory.reduce((sum,slot)=>sum+(slot&&slot.kind!=='item'?slot.count:0),0);
  const activeBuffs=player.tavern&&Array.isArray(player.tavern.activeBuffs)?player.tavern.activeBuffs:[];
  const bestRarity=player.stats.bestForgedRarity||'common';
  const displayName=player.username||'Miner';
  const charName=document.getElementById('char-name');
  if(charName)charName.textContent=displayName;
  if(charUsernameInput)charUsernameInput.value=displayName;
  renderPersonalRecords();
  const emptyDash='-';
  const stats=[
    {key:'coins',sprite:'coin',label:'Coins',val:player.coins,metric:player.coins,col:'#f4c84a'},
    {key:'oreBag',sprite:'ore',label:'Ore in Bag',val:`${oreCount} ore / ${inventoryValue()}c`,metric:oreCount,col:'#d4824a'},
    {key:'rocksBroken',sprite:'rock',label:'Rocks Broken',val:player.stats.rocksBroken,metric:player.stats.rocksBroken,col:'#8898a8'},
    {key:'totalRocks',sprite:'rock',label:'Total Rocks',val:player.stats.totalRocksBroken,metric:player.stats.totalRocksBroken,col:'#a8b4be'},
    {key:'totalXp',sprite:'xp',label:'Total XP',val:player.stats.totalXpEarned||player.xp,metric:player.stats.totalXpEarned||player.xp,col:'#9fe87a'},
    {key:'currentLevel',sprite:'lvl',label:'Current Level',val:lv,metric:lv,col:'#ffd070'},
    {key:'xpProgress',sprite:'xp',label:'XP Progress',val:`${prog.cur}/${prog.needed}`,metric:prog.cur,col:'#9fe87a'},
    {key:'highestCritChain',sprite:'crit',label:'Max Crit Chain Record',val:player.stats.highestCritChain,metric:player.stats.highestCritChain,col:'#ffb060'},
    {key:'power',sprite:'power',label:'Total Damage',val:`+${powerBonus()} dmg`,metric:powerBonus(),col:'#ff9955'},
    {key:'luck',sprite:'luck',label:'Universal Luck',val:`+${Math.round(luckBonus()*100)}%`,metric:Math.round(luckBonus()*100),col:'#bb88ff'},
    {key:'yield',sprite:'yield',label:'Yield Bonus',val:`+${Math.round(yieldBonus()*100)}%`,metric:Math.round(yieldBonus()*100),col:'#55ddaa'},
    {key:'sellBonus',sprite:'coin',label:'Sell Bonus',val:cm>0?`+${cm}%`:emptyDash,metric:cm,col:'#f4c84a'},
    {key:'xpBonus',sprite:'xp',label:'XP Bonus',val:xm>0?`+${xm}%`:emptyDash,metric:xm,col:'#9fe87a'},
    {key:'totalForgedItems',sprite:'forge',label:'Forged Items',val:player.stats.totalForgedItems,metric:player.stats.totalForgedItems,col:'#f0a050'},
    {key:'bestForged',sprite:'forge',label:'Best Forged',val:RARITY_LABELS[bestRarity]||bestRarity,metric:rarityRank(bestRarity)*40,col:RARITY_COLS[bestRarity]||'#f0a050'},
  ];
  if(chain.combo>0)stats.push({key:'currentCritChain',sprite:'crit',label:'Current Crit Chain',val:chain.combo,metric:chain.combo,col:'#ff8848'});
  stats.push(
    {key:'swingSpeed',sprite:'speed',label:'Swing Speed',val:`${Math.round(BASE_SWING_DUR/(sw.durFrames||BASE_SWING_DUR)*100)}%`,metric:Math.round(BASE_SWING_DUR/(sw.durFrames||BASE_SWING_DUR)*100)-100,col:'#ffd070'},
    {key:'weakPoint',sprite:'crit',label:'Weak Point',val:`${Math.round(weakPointBaseRadius())}px / ${Math.round(chain.timeoutFrames)}f`,metric:Math.round(weakPointBaseRadius()+chain.timeoutFrames/8),col:'#ffb060'},
    {key:'rareBonus',sprite:'rare',label:'Rare Ore Bonus',val:`+${Math.round(rareFinderBonus()*100)}%`,metric:Math.round(rareFinderBonus()*100),col:'#bb88ff'},
    {key:'forgeBonus',sprite:'forge',label:'Forge Bonus',val:`+${Math.round(forgeLuckBonus()*100)}% luck`,metric:Math.round(forgeLuckBonus()*100),col:'#f0a050'},
    {key:'gamblingLuck',sprite:'luck',label:'Gambling Luck',val:`${Math.round(gamblingLuckMult()*100)}%`,metric:Math.round(gamblingLuckMult()*100)-100,col:'#d6a8ff'},
    {key:'activeBuffs',sprite:'buff',label:'Tavern Buffs Active',val:activeBuffs.length?`${activeBuffs.length}/7`:'None',metric:activeBuffs.length,col:'#90e08c'}
  );
  charStatsList.innerHTML='';
  stats.forEach(s=>{
    const row=document.createElement('div');
    const metric=Number(s.metric)||0;
    const tier=statAchievementTier(s.key,Number(s.metric)||0);
    row.className=`char-stat-row ${tier.className}`;
    row.dataset.next=nextStatAchievementRequirement(s.key,metric);
    row.innerHTML=`<span class="char-stat-icon-ph" data-sprite="${s.sprite}" style="color:${s.col}">${s.sprite[0].toUpperCase()}</span><span class="char-stat-label">${s.label}</span><span class="char-stat-rank">${tier.rank}</span><span class="char-stat-val" style="color:${s.col}">${s.val}</span>`;
    charStatsList.appendChild(row);
  });
}

function leaderboardSnapshot(){
  player.stats={...DEFAULT_STATS,...(player.stats||{})};
  return {
    username:player.username||'Miner',
    deepestMine:currentMineZone().name,
    totalRocksBroken:Number(player.stats.totalRocksBroken)||0,
    highestCritChain:Number(player.stats.highestCritChain)||0,
    bestForgedRarity:player.stats.bestForgedRarity||'common',
    totalCoinsEarned:Number(player.stats.totalCoinsEarned)||0,
  };
}
function renderPersonalRecords(){
  if(!charRecordsList)return;
  const s=leaderboardSnapshot();
  const records=[
    {label:'Deepest Mine',value:s.deepestMine},
    {label:'Total Rocks',value:s.totalRocksBroken},
    {label:'Highest Crit Chain',value:s.highestCritChain},
    {label:'Best Forged',value:RARITY_LABELS[s.bestForgedRarity]||s.bestForgedRarity},
    {label:'Total Coins Earned',value:s.totalCoinsEarned},
  ];
  charRecordsList.innerHTML=`<div class="char-records-head"><span>Personal Records</span><strong>${s.username}</strong></div>${records.map(r=>`<div class="char-record-row"><span>${r.label}</span><strong>${r.value}</strong></div>`).join('')}`;
}

