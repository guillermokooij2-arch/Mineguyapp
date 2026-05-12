// â”€â”€ SELLING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function playSellRewardEffect(target,total,kind='coins'){
  if(window.GameAudio)GameAudio.playPurchase();
  const el=target||marketplacePanel||document.body;
  if(typeof spawnCoinBurst==='function')spawnCoinBurst(el,{amount:kind==='forged'?18:14,spread:kind==='forged'?220:170,lift:140});
  if(typeof pulseElement==='function')pulseElement(el,kind==='forged'?'market-sell-forged-pulse':'market-sell-pulse',620);
  if(terminalCoins&&typeof pulseElement==='function')pulseElement(terminalCoins,'wallet-pulse',520);
}
function sellOreType(type,target=null){
  let baseTotal=0,count=0;
  for(let i=0;i<player.inventory.length;i++){
    const slot=player.inventory[i];
    if(slot&&slot.kind!=='item'&&slot.type===type){baseTotal+=slot.count*ORE[slot.type].val;count+=slot.count;player.inventory[i]=null;}
  }
  if(baseTotal<=0)return;
  const total=Math.round(baseTotal*(1+oreValueMult(type)));
  player.coins+=total;
  playSellRewardEffect(target,total,'ore');
  floatTxt(W*0.5,H*0.22,`Sold ${count} ${ORE[type].lbl} for ${total} coins`,'#ffd76a',true);
  saveGame(); renderMarket(); renderInventory(); renderShop();
}
function sellAllOres(e){
  const total=inventoryValue();
  if(total<=0)return;
  player.coins+=total;
  playSellRewardEffect(e&&e.currentTarget,total,'ore');
  floatTxt(W*0.5,H*0.22,`+${total} COINS`,'#ffd76a',true);
  player.inventory=player.inventory.map(slot=>slot&&slot.kind==='item'?slot:null);
  saveGame(); renderMarket(); renderInventory(); renderShop();
}
function forgedInventoryValue(){
  return player.inventory.reduce((sum,slot)=>slot&&slot.kind==='item'?sum+forgedItemSellValue(slot.itemId):sum,0);
}
function sellAllForgedItems(e){
  const total=forgedInventoryValue();
  if(total<=0)return;
  player.coins+=total;
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
  player.coins+=total;
  playSellRewardEffect(target,total,'forged');
  player.inventory[idx]=null;
  applyUpgradeStats();
  floatTxt(W*0.5,H*0.24,`Sold ${def.name} for ${total} coins`,'#ffd76a',true);
  saveGame(); renderMarket(); renderInventory(); renderShop();
}

// â”€â”€ UPGRADES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const pad=16;
  const rect=itemTooltip.getBoundingClientRect();
  const left=Math.min(window.innerWidth-rect.width-pad,x+18);
  const top=Math.min(window.innerHeight-rect.height-pad,y+18);
  itemTooltip.style.left=`${Math.max(pad,left)}px`;
  itemTooltip.style.top=`${Math.max(pad,top)}px`;
}
function buyUpgrade(id, refreshFn, sourceRow=null){
  const def=UPGRADE_DEFS[id],level=player.upgrades[id]||0,cost=upgradeCost(id);
  if(level>=def.max)return;
  if(def.location==='trader'){
    if(craftedPartValue()<cost)return;
    consumeCraftedParts(cost);
  }else{
    if(player.coins<cost)return;
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
}
function makeUpgradeRow(id, boughtId=null){
  const def=UPGRADE_DEFS[id],level=player.upgrades[id]||0,cost=upgradeCost(id);
  const usesParts=def.location==='trader';
  const canBuy=usesParts?craftedPartValue()>=cost:player.coins>=cost;
  const row=document.createElement('div');
  row.className=`upgrade-row upgrade-row-${id}${def.location==='trader'?' trader-upgrade-row':''}${boughtId===id?' bought':''}`;
  const pickaxeTierText=id==='pickaxeTier'
    ? `Tier ${level}: +${Math.round(pickaxeTierAutoCritChance()*100)}% auto-crit, ${pickaxeTierAutoCritAmount()} auto crits${pickaxeTierProxyDamageBonus()>0?`, +${Math.round(pickaxeTierProxyDamageBonus()*100)}% echo damage`:''}`
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
    artButton.disabled=level>=def.max||!canBuy;
    artButton.addEventListener('click',purchase);
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

