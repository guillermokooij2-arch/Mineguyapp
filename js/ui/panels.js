function closeAllPanels(){
  if(typeof resetTavernStationUi==='function')resetTavernStationUi(true);
  if(tavernPanel&&tavernPanel.classList.contains('open')&&window.GameAudio)GameAudio.setTavernAmbience(false);
  ALL_PANEL_ELS.forEach(p=>p&&p.classList.remove('open'));
  document.body.classList.remove('panel-open');
  backpackToggle.classList.remove('open');
  mapDetailOpen=false;
  if(traderAutoTimer)clearInterval(traderAutoTimer);
  traderAutoTimer=null;
}
function openPanel(panel){
  closeAllPanels();
  panel.classList.add('open');
  document.body.classList.add('panel-open');
  if(panel===backpackMapPanel) backpackToggle.classList.add('open');
}
function toggleBackpackMap(open=!backpackMapPanel.classList.contains('open'), screen='inventory'){
  if(window.GameAudio){
    if(open)GameAudio.playBackpackOpen();
    else GameAudio.playMapOpenClose();
  }
  if(open){ openPanel(backpackMapPanel); switchBmpScreen(screen); }
  else closeAllPanels();
}
function toggleMarketplace(open=!marketplacePanel.classList.contains('open')){
  if(open){ openMapDetail(marketplacePanel); renderMarket(); } else returnToBackpackMap();
}
function toggleWorkbench(open=!workbenchPanel.classList.contains('open')){
  if(open){ openMapDetail(workbenchPanel); renderWorkbench(); } else returnToBackpackMap();
}
function setTraderState(index=0){
  traderStateIndex=((index%TRADER_STATES.length)+TRADER_STATES.length)%TRADER_STATES.length;
  const state=TRADER_STATES[traderStateIndex];
  if(traderCharacterImg)traderCharacterImg.src=state.image;
  if(traderCharacterBtn)traderCharacterBtn.dataset.state=state.id;
  if(traderSpeech)traderSpeech.textContent=state.text;
}
function advanceTraderState(){
  setTraderState(traderStateIndex+1);
}
function toggleTrader(open=!traderPanel.classList.contains('open')){
  if(open){
    openMapDetail(traderPanel);
    setTraderState(0);
    renderUpgradePanel('trader',traderList);
    if(traderAutoTimer)clearInterval(traderAutoTimer);
    traderAutoTimer=setInterval(advanceTraderState,15000);
  }
  else {
    if(traderResetTimer)clearTimeout(traderResetTimer);
    if(traderAutoTimer)clearInterval(traderAutoTimer);
    traderAutoTimer=null;
    returnToBackpackMap();
  }
}
function toggleCharacter(open=!characterPanel.classList.contains('open')){
  if(open){ openPanel(characterPanel); renderCharacter(); } else closeAllPanels();
}

// â”€â”€ BACKPACK NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function switchBmpScreen(screen, opts={}){
  if(screen==='terminal') terminalReturnScreen=opts.returnTo||'inventory';
  backpackScreen=screen;
  document.getElementById('bmp-inventory').classList.toggle('hidden', screen!=='inventory');
  document.getElementById('bmp-map').classList.toggle('hidden', screen!=='map');
  document.getElementById('bmp-terminal').classList.toggle('hidden', screen!=='terminal');
  backpackMapPanel.classList.toggle('map-mode', screen==='map');
  backpackBack.classList.toggle('hidden', screen==='inventory');
  backpackMapClose.classList.toggle('hidden', screen==='map'||screen==='terminal');
  const titles={
    inventory:['Backpack','Inventory'],
    map:['Backpack','Map'],
    terminal:['Backpack','SYS'],
  };
  const [kicker,title]=titles[screen]||titles.inventory;
  backpackKicker.textContent=kicker;
  backpackTitle.textContent=title;
  if(screen==='terminal') renderShop();
  if(screen==='inventory') renderInventory();
  if(screen==='map') renderTravelMap();
}
function backpackGoBack(){
  if(window.GameAudio)GameAudio.playMapOpenClose();
  if(backpackScreen==='terminal') switchBmpScreen(terminalReturnScreen==='map'?'map':'inventory');
  else if(backpackScreen==='map') switchBmpScreen('inventory');
}
function openMapDetail(panel){
  closeAllPanels();
  mapDetailOpen=true;
  panel.classList.add('open');
  document.body.classList.add('panel-open');
}
function returnToBackpackMap(){
  if(typeof resetTavernStationUi==='function')resetTavernStationUi(true);
  ALL_PANEL_ELS.forEach(p=>p&&p.classList.remove('open'));
  if(traderAutoTimer)clearInterval(traderAutoTimer);
  traderAutoTimer=null;
  document.body.classList.add('panel-open');
  backpackMapPanel.classList.add('open');
  backpackToggle.classList.add('open');
  mapDetailOpen=false;
  switchBmpScreen('map');
}

let _travelMapBuilt=false;
function renderTravelMap(){
  const layer=document.getElementById('travel-map-nodes');
  if(!layer)return;
  if(!_travelMapBuilt){
    _travelMapBuilt=true;
    MAP_LOCATIONS.forEach(loc=>{
      const btn=document.createElement('button');
      const state=resolveMapLocationState(loc);
      btn.className=`map-node ${state}`;
      btn.type='button';
      btn.dataset.loc=loc.id;
      btn.dataset.action=loc.action||'';
      btn.dataset.labelPos=loc.labelPos||'bottom';
      btn.style.setProperty('--x',loc.x);
      btn.style.setProperty('--y',loc.y);
      btn.setAttribute('aria-label',`${loc.name}: ${resolveMapLocationSub(loc)}`);
      if(state==='locked') btn.setAttribute('aria-disabled','true');
      const asset=loc.asset
        ? `<img class="map-node-img" src="${loc.asset}" alt="" loading="lazy">`
        : `<span>${loc.assetLabel||loc.name.slice(0,3).toUpperCase()}</span>`;
      btn.innerHTML=`
        <span class="map-node-asset" data-sprite="${loc.id}" data-animation="${loc.animation||''}">${asset}</span>
        <span class="map-node-label">
          <span class="map-node-name">${loc.name}</span>
          <span class="map-node-sub">${resolveMapLocationSub(loc)}</span>
        </span>`;
      layer.appendChild(btn);
    });
  } else {
    // Only update state classes — no DOM rebuild
    layer.querySelectorAll('.map-node').forEach(btn=>{
      const loc=MAP_LOCATIONS.find(l=>l.id===btn.dataset.loc);
      if(!loc)return;
      const state=resolveMapLocationState(loc);
      btn.className=`map-node ${state}`;
      btn.setAttribute('aria-disabled',state==='locked'?'true':'false');
      const sub=btn.querySelector('.map-node-sub');
      if(sub)sub.textContent=resolveMapLocationSub(loc);
    });
  }
}
function resolveMapLocationState(loc){
  const zone=typeof currentMineZone==='function'?currentMineZone():null;
  if(loc.id==='mineshaft'&&(!zone||zone.id==='starter'))return 'active';
  if(loc.id==='crystal-vein'&&zone&&zone.id==='crystal')return 'active';
  if(loc.id==='crystal-vein')return playerLevel()>=30?'available':'locked';
  return loc.state==='levelLocked'?'locked':(loc.state||'available');
}
function resolveMapLocationSub(loc){
  if(loc.id==='crystal-vein')return playerLevel()>=30?'Dangerous mine':'Unlocks at Lv 30';
  return loc.sub;
}

function travelToLocation(action, nodeEl){
  if(!action)return;
  if(action==='current'||action==='starter-mine'){
    if(action==='starter-mine'){
      setMineZone('starter');
      saveGame();
    }
    closeAllPanels();
    return;
  }
  nodeEl.classList.add('traveling');
  setTimeout(()=>{
    try{
      nodeEl.classList.remove('traveling');
      if(action==='marketplace') toggleMarketplace(true);
      if(action==='workbench') toggleWorkbench(true);
      if(action==='trader') toggleTrader(true);
      if(action==='terminal') switchBmpScreen('terminal',{returnTo:'map'});
      if(action==='tavern') toggleTavern(true);
      if(action==='crystal-vein'){
        setMineZone('crystal');
        closeAllPanels();
        saveGame();
      }
    }catch(err){
      console.error('Map travel failed:',err);
      if(nodeEl)nodeEl.classList.remove('traveling');
      returnToBackpackMap();
    }
  },180);
}

