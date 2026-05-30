// Selling
function playSellRewardEffect(target,total,kind='coins'){
  if(window.GameAudio)GameAudio.playPurchase();
  const el=target||marketplacePanel||document.body;
  if(typeof spawnCoinBurst==='function')spawnCoinBurst(el,{amount:kind==='forged'?18:14,spread:kind==='forged'?220:170,lift:140});
  if(typeof pulseElement==='function')pulseElement(el,kind==='forged'?'market-sell-forged-pulse':'market-sell-pulse',620);
  if(terminalCoins&&typeof pulseElement==='function')pulseElement(terminalCoins,'wallet-pulse',520);
}
const TRADER_COMBINE_RECIPES = [
  {id:'junk-common',from:'junk',fromLabel:'Junk',count:12,to:'common',toLabel:'Common'},
  {id:'common-uncommon',from:'common',fromLabel:'Common',count:6,to:'uncommon',toLabel:'Uncommon'},
  {id:'uncommon-rare',from:'uncommon',fromLabel:'Uncommon',count:5,to:'rare',toLabel:'Rare'},
];
let traderTurnInState={mode:'',upgradeId:'',combineRecipeId:'',selected:[],lastResultId:''};
function emptyTraderTurnInState(){
  return {mode:'',upgradeId:'',combineRecipeId:'',selected:[],lastResultId:''};
}
function traderForgedInventoryEntries(){
  return player.inventory
    .map((slot,index)=>isForgedItemSlot(slot)?{
      index,
      itemId:slot.itemId,
      def:CRAFT_ITEM_DEFS[slot.itemId],
      value:forgedItemTraderValue(slot.itemId),
      sellValue:forgedItemSellValue(slot.itemId),
    }:null)
    .filter(Boolean);
}
function currentTraderCombineRecipe(){
  return TRADER_COMBINE_RECIPES.find(entry=>entry.id===traderTurnInState.combineRecipeId)||TRADER_COMBINE_RECIPES[0]||null;
}
function traderEntryAllowedForCurrentMode(entry){
  if(traderTurnInState.mode!=='combine')return true;
  const recipe=currentTraderCombineRecipe();
  return !!(recipe&&entry&&entry.def&&entry.def.rarity===recipe.from);
}
function activeTraderTurnInIndices(){
  const live=new Set(traderForgedInventoryEntries().filter(traderEntryAllowedForCurrentMode).map(entry=>entry.index));
  traderTurnInState.selected=Array.from(new Set((traderTurnInState.selected||[]).map(Number))).filter(index=>live.has(index));
  return traderTurnInState.selected;
}
function closeTraderTurnInPanel(){
  traderTurnInState=emptyTraderTurnInState();
  if(traderTurnInPanel){
    traderTurnInPanel.hidden=true;
    traderTurnInPanel.classList.remove('is-combine','is-upgrade');
  }
}
function openTraderUpgradeTurnIn(id){
  const def=UPGRADE_DEFS[id];
  if(!def||def.location!=='trader'||(player.upgrades[id]||0)>=def.max)return;
  if(typeof unlockTraderActions==='function')unlockTraderActions();
  traderMode='upgrades';
  if(typeof syncTraderInteractionUi==='function')syncTraderInteractionUi();
  traderTurnInState={...emptyTraderTurnInState(),mode:'upgrade',upgradeId:id};
  renderTraderTurnInPanel();
}
function openTraderCombinePanel(){
  if(typeof unlockTraderActions==='function')unlockTraderActions();
  traderMode='combine';
  if(typeof syncTraderInteractionUi==='function')syncTraderInteractionUi();
  traderTurnInState={...emptyTraderTurnInState(),mode:'combine',combineRecipeId:(TRADER_COMBINE_RECIPES[0]&&TRADER_COMBINE_RECIPES[0].id)||''};
  if(typeof setTraderDialogue==='function')setTraderDialogue('combineOpen','persuasive');
  renderTraderCombineResult();
  renderTraderTurnInPanel();
}
function toggleTraderTurnInItem(index){
  const entry=traderForgedInventoryEntries().find(item=>item.index===index);
  if(!entry||!traderEntryAllowedForCurrentMode(entry))return;
  const selected=new Set(activeTraderTurnInIndices());
  if(selected.has(index))selected.delete(index);
  else {
    if(traderTurnInState.mode==='combine'){
      const recipe=currentTraderCombineRecipe();
      if(recipe&&selected.size>=recipe.count)return;
    }
    selected.add(index);
  }
  traderTurnInState.selected=Array.from(selected);
  if(traderTurnInState.mode==='upgrade'&&traderTurnInState.upgradeId){
    const cost=upgradeCost(traderTurnInState.upgradeId);
    if(craftedPartValueFromIndices(traderTurnInState.selected)>=cost&&typeof setTraderDialogue==='function')setTraderDialogue('upgradeReady','interested');
  }
  renderTraderTurnInPanel();
}
function traderBestValueSelection(entries,cost){
  const stock=[...entries].sort((a,b)=>a.value-b.value||a.index-b.index);
  if(cost<=0)return [];
  let states=[{sum:0,indices:[]}];
  stock.forEach(entry=>{
    const next=states.map(state=>({sum:state.sum+entry.value,indices:[...state.indices,entry.index]}));
    const bySum=new Map();
    states.concat(next).forEach(state=>{
      const existing=bySum.get(state.sum);
      if(!existing||state.indices.length<existing.indices.length)bySum.set(state.sum,state);
    });
    states=Array.from(bySum.values()).sort((a,b)=>{
      const aReady=a.sum>=cost;
      const bReady=b.sum>=cost;
      if(aReady!==bReady)return aReady?-1:1;
      if(aReady)return a.sum-b.sum||a.indices.length-b.indices.length;
      return b.sum-a.sum||a.indices.length-b.indices.length;
    }).slice(0,4000);
  });
  const ready=states
    .filter(state=>state.sum>=cost)
    .sort((a,b)=>a.sum-b.sum||a.indices.length-b.indices.length)[0];
  if(ready)return ready.indices;
  return stock.map(entry=>entry.index);
}
function autoSelectTraderTurnIns(){
  if(traderTurnInState.mode==='upgrade'&&traderTurnInState.upgradeId){
    const entries=traderForgedInventoryEntries();
    const cost=upgradeCost(traderTurnInState.upgradeId);
    traderTurnInState.selected=traderBestValueSelection(entries,cost);
    if(typeof setTraderDialogue==='function'){
      const ready=craftedPartValueFromIndices(traderTurnInState.selected)>=cost;
      setTraderDialogue(ready?'upgradeReady':'lacksMaterials',ready?'interested':'dangerous');
    }
  }else if(traderTurnInState.mode==='combine'){
    const recipe=currentTraderCombineRecipe();
    const entries=recipe?traderForgedInventoryEntries().filter(entry=>entry.def.rarity===recipe.from):[];
    traderTurnInState.selected=entries
      .sort((a,b)=>a.value-b.value||a.index-b.index)
      .slice(0,recipe?recipe.count:0)
      .map(entry=>entry.index);
    if(recipe&&traderTurnInState.selected.length<recipe.count&&typeof setTraderDialogue==='function')setTraderDialogue('lacksMaterials','dangerous');
  }
  renderTraderTurnInPanel();
}
function clearTraderTurnIns(){
  traderTurnInState.selected=[];
  renderTraderTurnInPanel();
}
function selectTraderCombineRecipe(recipeId){
  const recipe=TRADER_COMBINE_RECIPES.find(entry=>entry.id===recipeId);
  if(!recipe)return;
  traderTurnInState.combineRecipeId=recipe.id;
  traderTurnInState.selected=[];
  if(countInventoryCraftedByRarity(recipe.from)<recipe.count&&typeof setTraderDialogue==='function')setTraderDialogue('lacksMaterials','dangerous');
  renderTraderCombineResult();
  renderTraderTurnInPanel();
}
function traderTurnInEntryHtml(entry,selected){
  const rarityColor=RARITY_COLS[entry.def.rarity]||'#d6a85f';
  return `<button class="trader-turnin-item${selected?' is-selected':''}" type="button" data-trader-turnin-index="${entry.index}" aria-pressed="${selected?'true':'false'}">
    <span class="trader-turnin-art" style="--turnin-glow:${entry.def.glow||rarityColor}">
      ${craftItemArtHtml(entry.itemId,entry.def,'trader-turnin-item-art')}
    </span>
    <span class="trader-turnin-copy">
      <strong>${entry.def.name}</strong>
      <em>${RARITY_LABELS[entry.def.rarity]||entry.def.rarity}</em>
    </span>
    <b>${entry.value}</b>
  </button>`;
}
function traderUpgradeTurnInHtml(){
  const id=traderTurnInState.upgradeId;
  const def=UPGRADE_DEFS[id];
  if(!def)return '';
  const level=player.upgrades[id]||0;
  const cost=upgradeCost(id);
  const entries=traderForgedInventoryEntries();
  const selected=activeTraderTurnInIndices();
  const selectedValue=craftedPartValueFromIndices(selected);
  const selectedSet=new Set(selected);
  const stockHtml=entries.length
    ? entries.map(entry=>traderTurnInEntryHtml(entry,selectedSet.has(entry.index))).join('')
    : '<div class="trader-turnin-empty">No forged backpack stock. Equipped gear is protected from trader turn-ins.</div>';
  return `<div class="trader-turnin-head">
      <span>Upgrade Turn-In</span>
      <button type="button" data-trader-turnin-close aria-label="Close trader turn-ins">x</button>
    </div>
    <div class="trader-turnin-target">
      <strong>${def.name} ${level}/${def.max}</strong>
      <em>Select forged backpack stock worth ${cost} trader value. Market sale value is higher.</em>
    </div>
    <div class="trader-turnin-meter${selectedValue>=cost?' is-ready':''}">
      <span>Selected</span><strong>${selectedValue} / ${cost}</strong>
    </div>
    <div class="trader-turnin-list">${stockHtml}</div>
    <div class="trader-turnin-actions">
      <button type="button" data-trader-turnin-clear ${selected.length?'':'disabled'}>Clear</button>
      <button type="button" data-trader-turnin-auto ${entries.length?'':'disabled'}>Auto Select</button>
      <button type="button" data-trader-turnin-confirm ${selectedValue>=cost?'':'disabled'}>Turn In & Upgrade</button>
    </div>`;
}
function traderCombineRecipeHtml(recipe){
  const owned=countInventoryCraftedByRarity(recipe.from);
  const active=recipe.id===traderTurnInState.combineRecipeId;
  return `<button class="trader-combine-recipe${active?' is-active':''}${owned>=recipe.count?'':' is-short'}" type="button" data-trader-combine-recipe="${recipe.id}" aria-pressed="${active?'true':'false'}" aria-disabled="${owned>=recipe.count?'false':'true'}">
    <span>${recipe.count} ${recipe.fromLabel}</span>
    <strong>Random ${recipe.toLabel}</strong>
    <em>Backpack ${owned}/${recipe.count}</em>
  </button>`;
}
function traderCombineHtml(){
  const recipe=currentTraderCombineRecipe();
  const entries=recipe?traderForgedInventoryEntries().filter(entry=>entry.def.rarity===recipe.from):[];
  const selected=activeTraderTurnInIndices();
  const selectedSet=new Set(selected);
  const canCombine=!!(recipe&&selected.length===recipe.count);
  const stockHtml=entries.length
    ? entries.map(entry=>traderTurnInEntryHtml(entry,selectedSet.has(entry.index))).join('')
    : `<div class="trader-turnin-empty">No ${recipe?recipe.fromLabel.toLowerCase():'matching'} forged backpack stock. Equipped gear is protected from trader combines.</div>`;
  return `<div class="trader-turnin-head">
      <span>Forge Stock Combine</span>
      <button type="button" data-trader-turnin-close aria-label="Close trader combining">x</button>
    </div>
    <div class="trader-turnin-target">
      <strong>Rarity Roll-Up</strong>
      <em>Select the exact forged items you want to risk.</em>
    </div>
    <div class="trader-combine-grid">${TRADER_COMBINE_RECIPES.map(traderCombineRecipeHtml).join('')}</div>
    <div class="trader-turnin-meter${canCombine?' is-ready':''}">
      <span>${recipe?recipe.fromLabel:'Stock'} selected</span><strong>${selected.length} / ${recipe?recipe.count:0}</strong>
    </div>
    <div class="trader-turnin-list">${stockHtml}</div>
    <div class="trader-turnin-actions">
      <button type="button" data-trader-turnin-clear ${selected.length?'':'disabled'}>Clear</button>
      <button type="button" data-trader-turnin-auto ${entries.length?'':'disabled'}>Auto Select</button>
      <button type="button" data-trader-combine-confirm ${canCombine?'':'disabled'}>Roll Combine</button>
    </div>`;
}
function renderTraderTurnInPanel(){
  if(!traderTurnInPanel||!traderTurnInState.mode)return;
  const previousList=traderTurnInPanel.querySelector('.trader-turnin-list');
  const previousScrollTop=previousList?previousList.scrollTop:0;
  traderTurnInPanel.hidden=false;
  traderTurnInPanel.classList.toggle('is-combine',traderTurnInState.mode==='combine');
  traderTurnInPanel.classList.toggle('is-upgrade',traderTurnInState.mode==='upgrade');
  traderTurnInPanel.innerHTML=traderTurnInState.mode==='combine'?traderCombineHtml():traderUpgradeTurnInHtml();
  const nextList=traderTurnInPanel.querySelector('.trader-turnin-list');
  if(nextList)nextList.scrollTop=previousScrollTop;
  traderTurnInPanel.querySelectorAll('[data-trader-turnin-index]').forEach(button=>{
    button.addEventListener('click',()=>toggleTraderTurnInItem(Number(button.dataset.traderTurninIndex)));
    button.addEventListener('mouseenter',()=>{ if(typeof setTraderDialogue==='function')setTraderDialogue('itemHover','interested'); });
  });
  traderTurnInPanel.querySelectorAll('[data-trader-turnin-close]').forEach(button=>button.addEventListener('click',closeTraderTurnInPanel));
  const clearButton=traderTurnInPanel.querySelector('[data-trader-turnin-clear]');
  if(clearButton)clearButton.addEventListener('click',clearTraderTurnIns);
  const autoButton=traderTurnInPanel.querySelector('[data-trader-turnin-auto]');
  if(autoButton)autoButton.addEventListener('click',autoSelectTraderTurnIns);
  const confirmButton=traderTurnInPanel.querySelector('[data-trader-turnin-confirm]');
  if(confirmButton)confirmButton.addEventListener('click',confirmTraderUpgradeTurnIn);
  const combineConfirm=traderTurnInPanel.querySelector('[data-trader-combine-confirm]');
  if(combineConfirm)combineConfirm.addEventListener('click',confirmTraderCombineSelection);
  traderTurnInPanel.querySelectorAll('[data-trader-combine-recipe]').forEach(button=>{
    button.addEventListener('click',()=>selectTraderCombineRecipe(button.dataset.traderCombineRecipe));
    button.addEventListener('mouseenter',()=>{ if(typeof setTraderDialogue==='function')setTraderDialogue('itemHover','interested'); });
  });
}
function confirmTraderUpgradeTurnIn(){
  const id=traderTurnInState.upgradeId;
  const bought=buyUpgrade(id,()=>renderUpgradePanel('trader',traderList),null,{partIndices:activeTraderTurnInIndices()});
  if(bought){
    if(typeof setTraderDialogue==='function')setTraderDialogue('upgradeBought','persuasive');
    closeTraderTurnInPanel();
  }
  else renderTraderTurnInPanel();
}
function traderCombinedItemId(rarity){
  const pool=recipeItemPool(null,rarity);
  return pool.length?(typeof pickWeightedCraftItem==='function'?pickWeightedCraftItem(pool):pool[Math.floor(Math.random()*pool.length)]):'';
}
function combineTraderForgedStock(recipeId){
  if(recipeId&&traderTurnInState.combineRecipeId!==recipeId)selectTraderCombineRecipe(recipeId);
  return confirmTraderCombineSelection();
}
function renderTraderCombineResult(){
  if(!traderCombineResult)return;
  const resultId=traderTurnInState.lastResultId;
  if(!resultId){
    traderCombineResult.innerHTML='<span>Combine Result</span><div class="trader-result-slot is-empty">Empty</div>';
    return;
  }
  const def=CRAFT_ITEM_DEFS[resultId];
  const rc=def?(RARITY_COLS[def.rarity]||def.col||'#ffd76a'):'#ffd76a';
  traderCombineResult.innerHTML=`<span>Combine Result</span>
    <div class="trader-result-slot is-filled rarity-${def.rarity}" style="--result-glow:${def.glow||rc}">
      ${craftItemArtHtml(resultId,def,'trader-result-item-art')}
      <strong>${def.name}</strong>
      <em>${RARITY_LABELS[def.rarity]||def.rarity}</em>
    </div>`;
}
function consumeTraderSelectedIndices(indices=[]){
  const selected=Array.from(new Set(indices.map(Number))).filter(index=>isForgedItemSlot(player.inventory[index]));
  selected.forEach(index=>{ player.inventory[index]=null; });
  applyUpgradeStats();
}
function confirmTraderCombineSelection(){
  const recipe=currentTraderCombineRecipe();
  const selected=activeTraderTurnInIndices();
  if(!recipe||selected.length!==recipe.count){
    if(typeof setTraderDialogue==='function')setTraderDialogue('lacksMaterials','dangerous');
    return false;
  }
  const selectedOk=selected.every(index=>{
    const slot=player.inventory[index];
    const def=isForgedItemSlot(slot)?CRAFT_ITEM_DEFS[slot.itemId]:null;
    return def&&def.rarity===recipe.from;
  });
  if(!selectedOk){
    if(typeof setTraderDialogue==='function')setTraderDialogue('lacksMaterials','dangerous');
    renderTraderTurnInPanel();
    return false;
  }
  const resultId=traderCombinedItemId(recipe.to);
  if(!resultId)return false;
  consumeTraderSelectedIndices(selected);
  if(!addCraftedItem(resultId))return false;
  noteForgedItemStats(resultId);
  traderTurnInState.selected=[];
  traderTurnInState.lastResultId=resultId;
  saveGame();
  renderInventory();
  renderUpgradePanel('trader',traderList);
  renderTraderCombineResult();
  renderTraderTurnInPanel();
  const result=CRAFT_ITEM_DEFS[resultId];
  if(window.GameAudio)GameAudio.playPurchase();
  if(traderCombineResult&&typeof playForgeResultEffect==='function')playForgeResultEffect(traderCombineResult,result.rarity);
  if(typeof setTraderDialogue==='function')setTraderDialogue('combineResult','interested');
  floatTxt(W*0.5,H*0.24,`${result.name.toUpperCase()} ROLLED`,'#ffd76a',true);
  return true;
}
function sellOreType(type,target=null){
  let baseTotal=0,count=0;
  for(let i=0;i<player.inventory.length;i++){
    const slot=player.inventory[i];
    if(isOreSlot(slot)&&slot.type===type){baseTotal+=slot.count*ORE[slot.type].val;count+=slot.count;player.inventory[i]=null;}
  }
  if(baseTotal<=0)return;
  const total=Math.round(baseTotal*(1+oreValueMult(type)));
  addPlayerCoins(total);
  playSellRewardEffect(target,total,'ore');
  floatTxt(W*0.5,H*0.22,`Sold ${count} ${ORE[type].lbl} for ${total} coins`,'#ffd76a',true);
  saveGame(); renderMarket(); renderInventory(); renderShop();
}
function sellAllOres(e){
  const total=inventoryValue();
  if(total<=0)return;
  addPlayerCoins(total);
  playSellRewardEffect(e&&e.currentTarget,total,'ore');
  floatTxt(W*0.5,H*0.22,`+${total} COINS`,'#ffd76a',true);
  player.inventory=player.inventory.map(slot=>isOreSlot(slot)?null:slot);
  saveGame(); renderMarket(); renderInventory(); renderShop();
}
function forgedInventoryValue(){
  return player.inventory.reduce((sum,slot)=>slot&&slot.kind==='item'?sum+forgedItemSellValue(slot.itemId):sum,0);
}
function sellAllForgedItems(e){
  const total=forgedInventoryValue();
  if(total<=0)return;
  addPlayerCoins(total);
  playSellRewardEffect(e&&e.currentTarget,total,'forged');
  player.inventory=player.inventory.map(slot=>slot&&slot.kind==='item'?null:slot);
  applyUpgradeStats();
  floatTxt(W*0.5,H*0.24,`+${total} COINS`,'#ffd76a',true);
  saveGame(); renderMarket(); renderInventory(); renderShop();
}
function sellCraftedItem(idx,target=null){
  const slot=player.inventory[idx];
  if(!slot)return;
  const itemId=slot.itemId||slot.id;
  const def=CRAFT_ITEM_DEFS[itemId];
  if(!def){ player.inventory[idx]=null; saveGame(); renderMarket(); renderInventory(); return; }
  const total=forgedItemSellValue(itemId);
  addPlayerCoins(total);
  playSellRewardEffect(target,total,'forged');
  player.inventory[idx]=null;
  applyUpgradeStats();
  floatTxt(W*0.5,H*0.24,`Sold ${def.name} for ${total} coins`,'#ffd76a',true);
  saveGame(); renderMarket(); renderInventory(); renderShop();
}

// Upgrades
function showUpgradeTooltip(id,x,y){
  if(!itemTooltip)return;
  const def=UPGRADE_DEFS[id];
  if(!def)return;
  const level=player.upgrades[id]||0,cost=upgradeCost(id),usesParts=def.location==='trader';
  const nextText=id==='pickaxeTier'&&level<def.max
    ? `Tier ${level+1}: +${Math.round((level+1)*5)}% auto-crit, ${PICKAXE_TIER_AUTO_CRITS[level+1]||0} auto crits`
    : level>=def.max?'No further upgrades.':def.desc;
  itemTooltip.innerHTML=`
    <div class="item-tooltip-name" style="color:#ffd98a">${def.name}</div>
    <div class="item-tooltip-rarity" style="color:#8ce49c">Level ${level}/${def.max}</div>
    <div class="item-tooltip-row"><span>Effect</span><strong>${def.effect||def.desc}</strong></div>
    <div class="item-tooltip-row"><span>Cost</span><strong>${level>=def.max?'Maxed':usesParts?`${cost} forged part value`:`${cost} coins`}</strong></div>
    <div class="item-tooltip-row"><span>Next</span><strong>${nextText}</strong></div>`;
  itemTooltip.classList.remove('hidden');
  itemTooltip.style.transform='';
  const pad=16;
  const rect=itemTooltip.getBoundingClientRect();
  const left=Math.min(window.innerWidth-rect.width-pad,x+18);
  const top=Math.min(window.innerHeight-rect.height-pad,y+18);
  itemTooltip.style.left=`${Math.max(pad,left)}px`;
  itemTooltip.style.top=`${Math.max(pad,top)}px`;
}
function buyUpgrade(id, refreshFn, sourceRow=null, options={}){
  if(typeof hideItemTooltip==='function')hideItemTooltip();
  const def=UPGRADE_DEFS[id],level=player.upgrades[id]||0,cost=upgradeCost(id);
  if(level>=def.max)return false;
  if(def.location==='trader'){
    const selected=Array.isArray(options.partIndices)?options.partIndices:[];
    if(craftedPartValueFromIndices(selected)<cost)return false;
    if(!consumeCraftedPartIndices(selected,cost))return false;
  }else{
    if(player.coins<cost)return false;
    player.coins-=cost;
  }
  player.upgrades[id]=level+1;
  applyUpgradeStats();
  if(window.GameAudio)GameAudio.playPurchase();
  saveGame();
  renderInventory();
  renderMarket();
  if(sourceRow){
    if(typeof playUpgradePurchaseEffect==='function')playUpgradePurchaseEffect(sourceRow);
    sourceRow.classList.add('bought');
    sourceRow.querySelectorAll('button').forEach(button=>button.disabled=true);
    const burst=document.createElement('div');
    burst.className='upgrade-spark-burst';
    sourceRow.appendChild(burst);
    setTimeout(()=>{ if(refreshFn)refreshFn(); else renderShop(id); },620);
  }else if(refreshFn)refreshFn(); else renderShop(id);
  floatTxt(W*0.5,H*0.28,`${def.name.toUpperCase()} UP`,'#bff1b9',true);
  return true;
}
function makeUpgradeRow(id, boughtId=null){
  const def=UPGRADE_DEFS[id],level=player.upgrades[id]||0,cost=upgradeCost(id);
  const usesParts=def.location==='trader';
  const canBuy=usesParts?craftedPartValue()>=cost:player.coins>=cost;
  const row=document.createElement('div');
  row.className=`upgrade-row upgrade-row-${id}${def.location==='trader'?' trader-upgrade-row':''}${boughtId===id?' bought':''}`;
  const pickaxeTierText=id==='pickaxeTier'
    ? `Tier ${level}: +${Math.round(pickaxeTierAutoCritChance()*100)}% auto-crit, ${pickaxeTierAutoCritAmount()} auto crits`
    : '';
  const effectCopy=id==='pickaxeTier'&&pickaxeTierText?`${def.effect} - ${pickaxeTierText}`:def.effect;
  const effectLine=effectCopy?`<div class="upgrade-effect">${effectCopy}${usesParts?` - Parts ${craftedPartValue()}/${cost}`:''}</div>`:'';
  const upgradeImage=id==='pickaxeTier'
    ? PICKAXE_CURSOR_PATHS[Math.min(level>=def.max?level:level+1,def.max)]
    : TRADER_UPGRADE_IMAGES[id];
  const artHtml=upgradeImage
    ? `<img class="trader-upgrade-img${id==='pickaxeTier'?' trader-pickaxe-tier-img':''}" src="${upgradeImage}" alt="">`
    : `<span class="trader-upgrade-glyph">${def.icon||id.slice(0,3).toUpperCase()}</span>`;
  const traderArt=def.location==='trader'?`
    <button class="trader-upgrade-art-button" type="button" aria-label="${def.name} details and purchase">
      <span class="trader-upgrade-art">${artHtml}</span>
    </button>`:'';
  row.innerHTML=`${traderArt}<div class="upgrade-copy"><div class="upgrade-title">${def.location!=='trader'&&def.icon?`<span class="upg-icon">${def.icon}</span>`:''}${def.name} <span class="upg-level">${level}/${def.max}</span></div><div class="upgrade-desc">${def.desc}</div>${effectLine}</div>`;
  const purchase=()=>buyUpgrade(id,()=>{
    if(def.location==='trader') renderUpgradePanel('trader',traderList);
    else renderShop(id);
  },row);
  const artButton=row.querySelector('.trader-upgrade-art-button');
  if(artButton){
    artButton.disabled=level>=def.max;
    artButton.addEventListener('click',usesParts?()=>openTraderUpgradeTurnIn(id):purchase);
    artButton.addEventListener('mouseenter',()=>{ if(usesParts&&typeof setTraderDialogue==='function')setTraderDialogue('itemHover','interested'); });
    artButton.addEventListener('mousemove',e=>showUpgradeTooltip(id,e.clientX,e.clientY));
    artButton.addEventListener('mouseleave',hideItemTooltip);
  } else {
    const btn=document.createElement('button');
    btn.className='upgrade-buy'; btn.type='button';
    btn.innerHTML=level>=def.max?'<span>Max</span>':usesParts?`<span>${cost}</span><small>parts</small>`:`<span>${cost}c</span><small>upgrade</small>`;
    btn.disabled=level>=def.max||!canBuy;
    btn.addEventListener('click',purchase);
    row.appendChild(btn);
  }
  return row;
}
function renderShop(boughtId=null){
  if(!terminalUpgradeList)return;
  if(terminalCoins) terminalCoins.textContent=player.coins;
  terminalUpgradeList.innerHTML='';
  upgradesByLocation('terminal').forEach(([id])=>terminalUpgradeList.appendChild(makeUpgradeRow(id,boughtId)));
}
function renderUpgradePanel(location, listEl, boughtId=null){
  if(!listEl)return;
  listEl.innerHTML='';
  upgradesByLocation(location).forEach(([id])=>listEl.appendChild(makeUpgradeRow(id,boughtId)));
}

