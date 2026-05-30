function setCursorLayerMode(mode){
  if(typeof uiCursor!=='object'||!uiCursor)return;
  uiCursor.mode=mode;
  uiCursor.overInteractive=false;
  uiCursor.pressed=false;
  uiCursor.pressT=0;
  if(mode==='world'&&typeof sw==='object'&&sw)sw.active=false;
}
let currentDestination='map';
let terminalView='room';
let terminalApp='upgrades';
let terminalUiWired=false;
function setDestination(destination){
  currentDestination=destination;
  document.body.dataset.destination=destination;
  if(typeof syncMinerJournalButton==='function')syncMinerJournalButton();
}
const DESTINATION_ASSET_GROUPS={
  marketplace:'marketplace',
  workbench:'workbench',
  trader:'trader',
  terminal:'terminal',
  tavern:'tavern',
  'deep-lift':'deep-lift',
};
function detailPanelAssetGroup(panel){
  if(panel===marketplacePanel)return 'marketplace';
  if(panel===workbenchPanel)return 'workbench';
  if(panel===traderPanel)return 'trader';
  return '';
}
function assetGroupRoot(group){
  if(group==='marketplace')return marketplacePanel;
  if(group==='workbench')return workbenchPanel;
  if(group==='trader')return traderPanel;
  if(group==='terminal')return backpackMapPanel;
  if(group==='tavern')return tavernPanel;
  return null;
}
function activateAssetGroup(group){
  const root=assetGroupRoot(group);
  if(!root)return;
  root.classList.add('assets-ready');
  if(window.GameAssets&&GameAssets.hydrateDeferredAssets)GameAssets.hydrateDeferredAssets(root);
}
function closeAllPanels(){
  if(typeof closeMinerJournal==='function')closeMinerJournal({keepFocus:true});
  if(window.deepLiftBackpackOverlayActive&&deepLiftPanel&&deepLiftPanel.classList.contains('open')){
    if(typeof hideItemTooltip==='function')hideItemTooltip();
    window.deepLiftBackpackOverlayActive=false;
    document.body.classList.remove('deep-lift-inventory-open','panel-open');
    if(backpackMapPanel)backpackMapPanel.classList.remove('open','instant-open','map-mode','terminal-mode');
    if(backpackToggle)backpackToggle.classList.remove('open');
    setCursorLayerMode('ui');
    if(typeof renderInventory==='function')renderInventory();
    return;
  }
  if(typeof hideItemTooltip==='function')hideItemTooltip();
  if(typeof resetTraderInteraction==='function')resetTraderInteraction();
  else if(typeof closeTraderTurnInPanel==='function')closeTraderTurnInPanel();
  if(tavernPanel&&tavernPanel.classList.contains('open')&&window.GameAudio)GameAudio.setTavernAmbience(false);
  ALL_PANEL_ELS.forEach(p=>p&&p.classList.remove('open','instant-open'));
  document.body.classList.remove('panel-open','map-detail-open','deep-lift-active','deep-lift-inventory-open');
  window.deepLiftBackpackOverlayActive=false;
  if(backpackMapPanel)backpackMapPanel.style.pointerEvents='';
  backpackToggle.classList.remove('open');
  mapDetailOpen=false;
  if(traderAutoTimer)clearInterval(traderAutoTimer);
  traderAutoTimer=null;
  if(typeof resetTavernStationUi==='function')resetTavernStationUi(true);
  if(typeof resetDeepLiftUi==='function')resetDeepLiftUi(true);
  setCursorLayerMode('world');
}
function openPanel(panel){
  closeAllPanels();
  panel.classList.add('open');
  document.body.classList.add('panel-open');
  if(panel===backpackMapPanel) backpackToggle.classList.add('open');
  setCursorLayerMode('ui');
}
function toggleBackpackMap(open=!backpackMapPanel.classList.contains('open'), screen='inventory'){
  if(window.GameAudio){
    if(open)GameAudio.playBackpackOpen();
    else GameAudio.playMapOpenClose();
  }
  if(open){ openPanel(backpackMapPanel); switchBmpScreen(screen); }
  else closeAllPanels();
}
function openWorldMap(options={}){
  const {instant=false}=options;
  setDestination('map');
  if(typeof hideItemTooltip==='function')hideItemTooltip();
  if(typeof resetTavernStationUi==='function')resetTavernStationUi(true);
  if(typeof resetDeepLiftUi==='function')resetDeepLiftUi(true);
  ALL_PANEL_ELS.forEach(p=>p&&p.classList.remove('open'));
  if(traderAutoTimer)clearInterval(traderAutoTimer);
  traderAutoTimer=null;
  mapDetailOpen=false;
  document.body.classList.remove('map-detail-open');
  if(instant)backpackMapPanel.classList.add('instant-open');
  backpackMapPanel.classList.add('open');
  backpackToggle.classList.add('open');
  document.body.classList.add('panel-open');
  switchBmpScreen('map');
  setCursorLayerMode('ui');
  if(instant)requestAnimationFrame(()=>backpackMapPanel.classList.remove('instant-open'));
}
function openTerminalScreen(options={}){
  const {returnTo='map',instant=false}=options;
  activateAssetGroup('terminal');
  setDestination('terminal');
  if(typeof hideItemTooltip==='function')hideItemTooltip();
  if(typeof resetTavernStationUi==='function')resetTavernStationUi(true);
  if(typeof resetDeepLiftUi==='function')resetDeepLiftUi(true);
  ALL_PANEL_ELS.forEach(p=>p&&p.classList.remove('open'));
  if(traderAutoTimer)clearInterval(traderAutoTimer);
  traderAutoTimer=null;
  mapDetailOpen=false;
  document.body.classList.remove('map-detail-open');
  if(instant)backpackMapPanel.classList.add('instant-open');
  backpackMapPanel.classList.add('open');
  backpackToggle.classList.add('open');
  document.body.classList.add('panel-open');
  switchBmpScreen('terminal',{returnTo});
  setTerminalView('room',{focus:false});
  setCursorLayerMode('ui');
  if(instant)requestAnimationFrame(()=>backpackMapPanel.classList.remove('instant-open'));
}
function toggleMarketplace(open=!marketplacePanel.classList.contains('open')){
  if(open){ setDestination('marketplace'); openMapDetail(marketplacePanel); renderMarket(); } else returnToBackpackMap();
}
function toggleWorkbench(open=!workbenchPanel.classList.contains('open')){
  if(open){ setDestination('workbench'); openMapDetail(workbenchPanel); renderWorkbench(); } else returnToBackpackMap();
}
function setTraderState(index=0){
  traderStateIndex=((index%TRADER_STATES.length)+TRADER_STATES.length)%TRADER_STATES.length;
  const state=TRADER_STATES[traderStateIndex];
  if(traderCharacterImg)traderCharacterImg.src=state.image;
  if(traderCharacterBtn)traderCharacterBtn.dataset.state=state.id;
  if(traderSpeech)traderSpeech.textContent=state.text;
}
function traderStateById(id){
  return TRADER_STATES.find(state=>state.id===id)||TRADER_STATES[0];
}
function setTraderDialogue(key='idle',stateId='idle',autoReset=true){
  const line=(typeof TRADER_DIALOGUE==='object'&&TRADER_DIALOGUE[key])||key||'';
  const state=traderStateById(stateId);
  if(traderCharacterImg&&state)traderCharacterImg.src=state.image;
  if(traderCharacterBtn&&state)traderCharacterBtn.dataset.state=state.id;
  if(traderSpeech)traderSpeech.textContent=line;
  if(traderResetTimer)clearTimeout(traderResetTimer);
  if(autoReset&&key!=='idle'){
    traderResetTimer=setTimeout(()=>setTraderDialogue('idle','idle',false),6500);
  }
}
function advanceTraderState(){
  setTraderState(traderStateIndex+1);
}
function syncTraderInteractionUi(){
  if(!traderPanel)return;
  traderPanel.classList.toggle('trader-actions-unlocked',!!traderInteractionUnlocked);
  traderPanel.classList.toggle('trader-show-upgrades',traderMode==='upgrades');
  traderPanel.classList.toggle('trader-combine-active',traderMode==='combine');
  if(traderActions)traderActions.hidden=!traderInteractionUnlocked;
  if(traderList)traderList.hidden=traderMode!=='upgrades';
  if(traderCombineResult)traderCombineResult.hidden=traderMode!=='combine';
}
function resetTraderInteraction(){
  traderInteractionUnlocked=false;
  traderMode='intro';
  if(typeof closeTraderTurnInPanel==='function')closeTraderTurnInPanel();
  if(traderCombineResult){
    traderCombineResult.innerHTML='';
    traderCombineResult.hidden=true;
  }
  if(traderResetTimer)clearTimeout(traderResetTimer);
  setTraderState(0);
  setTraderDialogue('idle','idle',false);
  syncTraderInteractionUi();
}
function unlockTraderActions(){
  traderInteractionUnlocked=true;
  syncTraderInteractionUi();
}
function handleTraderCharacterInteract(){
  unlockTraderActions();
  setTraderDialogue('clicked','interested');
}
function handleTraderCharacterHover(){
  if(!traderInteractionUnlocked&&traderCharacterImg){
    const state=traderStateById('interested');
    if(state){
      traderCharacterImg.src=state.image;
      traderCharacterBtn.dataset.state=state.id;
    }
  }
}
function openTraderUpgradeShelf(){
  unlockTraderActions();
  traderMode='upgrades';
  if(typeof closeTraderTurnInPanel==='function')closeTraderTurnInPanel();
  if(traderCombineResult)traderCombineResult.hidden=true;
  renderUpgradePanel('trader',traderList);
  syncTraderInteractionUi();
  setTraderDialogue('tradeOpen','persuasive');
}
function toggleTrader(open=!traderPanel.classList.contains('open')){
  if(open){
    setDestination('trader');
    openMapDetail(traderPanel);
    resetTraderInteraction();
    renderUpgradePanel('trader',traderList);
    if(traderAutoTimer)clearInterval(traderAutoTimer);
    traderAutoTimer=setInterval(()=>setTraderDialogue('idle','idle',false),15000);
  }
  else {
    resetTraderInteraction();
    if(traderResetTimer)clearTimeout(traderResetTimer);
    if(traderAutoTimer)clearInterval(traderAutoTimer);
    traderAutoTimer=null;
    returnToBackpackMap();
  }
}
function toggleCharacter(open=!characterPanel.classList.contains('open')){
  if(open){ openPanel(characterPanel); renderCharacter(); } else closeAllPanels();
}

// Backpack navigation
function switchBmpScreen(screen, opts={}){
  if(screen==='terminal') terminalReturnScreen=opts.returnTo||'inventory';
  backpackScreen=screen;
  document.getElementById('bmp-inventory').classList.toggle('hidden', screen!=='inventory');
  document.getElementById('bmp-map').classList.toggle('hidden', screen!=='map');
  document.getElementById('bmp-terminal').classList.toggle('hidden', screen!=='terminal');
  backpackMapPanel.classList.toggle('map-mode', screen==='map');
  backpackMapPanel.classList.toggle('terminal-mode', screen==='terminal');
  backpackBack.classList.toggle('hidden', screen!=='terminal');
  backpackMapClose.classList.toggle('hidden', screen==='map'||screen==='terminal');
  const titles={
    inventory:['Backpack','Inventory'],
    map:['Backpack','Map'],
    terminal:['Backpack','SYS'],
  };
  const [kicker,title]=titles[screen]||titles.inventory;
  backpackKicker.textContent=kicker;
  backpackTitle.textContent=title;
  if(screen==='terminal'){
    wireTerminalUi();
    setTerminalView(terminalView||'room',{focus:false});
    renderShop();
    renderTerminalMiniOs();
  }
  if(screen==='inventory') renderInventory();
  if(screen==='map') renderTravelMap();
}
function backpackGoBack(){
  if(window.GameAudio)GameAudio.playMapOpenClose();
  if(backpackScreen==='terminal') switchBmpScreen(terminalReturnScreen==='map'?'map':'inventory');
}

function terminalStage(){
  return document.querySelector('.sys-terminal-stage');
}
function visibleTerminalFocusables(){
  const stage=terminalStage();
  if(!stage||terminalView!=='screen')return [];
  return Array.from(stage.querySelectorAll('.terminal-focusable')).filter(el=>{
    if(el.disabled||el.hidden||el.getAttribute('aria-hidden')==='true')return false;
    const panel=el.closest('[hidden],.sys-os-app:not(.active)');
    if(panel)return false;
    return true;
  });
}
function focusTerminalControl(delta=1){
  const focusables=visibleTerminalFocusables();
  if(!focusables.length)return;
  const current=document.activeElement;
  let index=focusables.indexOf(current);
  if(index<0)index=0;
  else index=(index+delta+focusables.length)%focusables.length;
  focusables[index].focus({preventScroll:true});
}
function setTerminalView(view='room',options={}){
  const stage=terminalStage();
  if(!stage)return;
  terminalView=view==='screen'?'screen':'room';
  stage.dataset.terminalView=terminalView;
  const room=stage.querySelector('.sys-room-view');
  const screen=stage.querySelector('.sys-screen-view');
  if(room)room.hidden=terminalView!=='room';
  if(screen)screen.hidden=terminalView!=='screen';
  renderTerminalMiniOs();
  if(options.focus!==false){
    const target=terminalView==='room'
      ? document.getElementById('terminal-room-enter')
      : stage.querySelector('.sys-os-tab.active')||stage.querySelector('.terminal-focusable');
    if(target)target.focus({preventScroll:true});
  }
}
function switchTerminalApp(app='upgrades'){
  terminalApp=['upgrades','stats','leaderboards','settings','logs'].includes(app)?app:'upgrades';
  renderTerminalMiniOs();
}
function terminalStatRows(){
  const stats=player.stats||{};
  const progress=typeof xpProgress==='function'?xpProgress():{cur:0,needed:20,pct:0};
  const oreValue=typeof inventoryValue==='function'?inventoryValue():0;
  const bagUsed=Array.isArray(player.inventory)?player.inventory.filter(Boolean).length:0;
  const bagMax=typeof activeInventorySize==='function'?activeInventorySize():20;
  return [
    ['Level', typeof playerLevel==='function'?playerLevel():1],
    ['XP', `${progress.cur}/${progress.needed}`],
    ['Coins', player.coins||0],
    ['Ore Value', oreValue],
    ['Bag Slots', `${bagUsed}/${bagMax}`],
    ['Rocks Broken', stats.totalRocksBroken||stats.rocksBroken||0],
    ['Best Chain', stats.highestCritChain||0],
    ['Forged Items', stats.totalForgedItems||0],
    ['Deep Runs', player.deepLift&&player.deepLift.totalRuns||0],
    ['Best Floor', player.deepLift&&player.deepLift.bestFloor||0],
  ];
}
function terminalDetailedStatRows(){
  const stats={...(typeof DEFAULT_STATS==='object'?DEFAULT_STATS:{}),...(player.stats||{})};
  const progress=typeof xpProgress==='function'?xpProgress():{cur:0,needed:20,pct:0};
  const level=typeof playerLevel==='function'?playerLevel():1;
  const oreCount=Array.isArray(player.inventory)?player.inventory.reduce((sum,slot)=>sum+(typeof isOreSlot==='function'&&isOreSlot(slot)?slot.count:0),0):0;
  const activeBuffs=player.tavern&&Array.isArray(player.tavern.activeBuffs)?player.tavern.activeBuffs:[];
  const bestRarity=stats.bestForgedRarity||'common';
  const cm=typeof coinMultBonus==='function'?Math.round(coinMultBonus()*100):0;
  const xm=typeof xpMultBonus==='function'?Math.round(xpMultBonus()*100):0;
  const emptyDash='-';
  return [
    {key:'coins',sprite:'C',label:'Coins',val:player.coins||0,metric:player.coins||0},
    {key:'oreBag',sprite:'O',label:'Ore in Bag',val:`${oreCount} ore / ${typeof inventoryValue==='function'?inventoryValue():0}c`,metric:oreCount},
    {key:'rocksBroken',sprite:'R',label:'Rocks Broken',val:stats.rocksBroken||0,metric:stats.rocksBroken||0},
    {key:'totalRocks',sprite:'T',label:'Total Rocks',val:stats.totalRocksBroken||0,metric:stats.totalRocksBroken||0},
    {key:'totalXp',sprite:'X',label:'Total XP',val:stats.totalXpEarned||player.xp||0,metric:stats.totalXpEarned||player.xp||0},
    {key:'currentLevel',sprite:'L',label:'Current Level',val:level,metric:level},
    {key:'xpProgress',sprite:'X',label:'XP Progress',val:`${progress.cur}/${progress.needed}`,metric:progress.cur},
    {key:'highestCritChain',sprite:'C',label:'Max Crit Chain Record',val:stats.highestCritChain||0,metric:stats.highestCritChain||0},
    {key:'power',sprite:'P',label:'Total Damage',val:`+${typeof powerBonus==='function'?powerBonus():0} dmg`,metric:typeof powerBonus==='function'?powerBonus():0},
    {key:'luck',sprite:'U',label:'Universal Luck',val:`+${typeof luckBonus==='function'?Math.round(luckBonus()*100):0}%`,metric:typeof luckBonus==='function'?Math.round(luckBonus()*100):0},
    {key:'yield',sprite:'Y',label:'Yield Bonus',val:`+${typeof yieldBonus==='function'?Math.round(yieldBonus()*100):0}%`,metric:typeof yieldBonus==='function'?Math.round(yieldBonus()*100):0},
    {key:'sellBonus',sprite:'S',label:'Sell Bonus',val:cm>0?`+${cm}%`:emptyDash,metric:cm},
    {key:'xpBonus',sprite:'B',label:'XP Bonus',val:xm>0?`+${xm}%`:emptyDash,metric:xm},
    {key:'totalForgedItems',sprite:'F',label:'Forged Items',val:stats.totalForgedItems||0,metric:stats.totalForgedItems||0},
    {key:'bestForged',sprite:'Q',label:'Best Forged',val:typeof RARITY_LABELS==='object'?(RARITY_LABELS[bestRarity]||bestRarity):bestRarity,metric:typeof rarityRank==='function'?rarityRank(bestRarity)*40:0},
    {key:'swingSpeed',sprite:'S',label:'Swing Speed',val:`${typeof BASE_SWING_DUR==='number'&&typeof sw==='object'&&sw?Math.round(BASE_SWING_DUR/(sw.durFrames||BASE_SWING_DUR)*100):100}%`,metric:typeof BASE_SWING_DUR==='number'&&typeof sw==='object'&&sw?Math.round(BASE_SWING_DUR/(sw.durFrames||BASE_SWING_DUR)*100)-100:0},
    {key:'accuracy',sprite:'A',label:'Accuracy',val:`${typeof weakPointBaseRadius==='function'?Math.round(weakPointBaseRadius()):0}px / ${typeof chain==='object'&&chain?Math.round(chain.timeoutFrames):0}f`,metric:typeof weakPointBaseRadius==='function'?Math.round(weakPointBaseRadius()+(typeof chain==='object'&&chain?chain.timeoutFrames/8:0)):0},
    {key:'rareBonus',sprite:'R',label:'Rare Ore Bonus',val:`+${typeof rareFinderBonus==='function'?Math.round(rareFinderBonus()*100):0}%`,metric:typeof rareFinderBonus==='function'?Math.round(rareFinderBonus()*100):0},
    {key:'forgeBonus',sprite:'F',label:'Forge Bonus',val:`+${typeof forgeLuckBonus==='function'?Math.round(forgeLuckBonus()*100):0}% luck`,metric:typeof forgeLuckBonus==='function'?Math.round(forgeLuckBonus()*100):0},
    {key:'gamblingLuck',sprite:'G',label:'Gambling Luck',val:`${typeof gamblingLuckMult==='function'?Math.round(gamblingLuckMult()*100):100}%`,metric:typeof gamblingLuckMult==='function'?Math.round(gamblingLuckMult()*100)-100:0},
    {key:'activeBuffs',sprite:'B',label:'Tavern Buffs Active',val:activeBuffs.length?`${activeBuffs.length}/7`:'None',metric:activeBuffs.length},
  ];
}
function renderTerminalStats(){
  const list=document.getElementById('terminal-stats-list');
  if(!list)return;
  list.innerHTML=terminalDetailedStatRows().map(s=>{
    const metric=Number(s.metric)||0;
    const tier=typeof statAchievementTier==='function'?statAchievementTier(s.key,metric):{rank:'SYS',className:'tier-stone'};
    const next=typeof nextStatAchievementRequirement==='function'?nextStatAchievementRequirement(s.key,metric):'SYS record tracked locally';
    return `<div class="terminal-stat-row ${tier.className}" tabindex="0" data-next="${next}"><span class="terminal-stat-icon">${s.sprite}</span><span class="terminal-stat-label">${s.label}</span><span class="terminal-stat-rank">${tier.rank}</span><strong>${s.val}</strong></div>`;
  }).join('');
}
function renderTerminalLeaderboards(){
  const list=document.getElementById('terminal-leaderboard-list');
  if(!list)return;
  const rows=typeof localLeaderboardRows==='function'?localLeaderboardRows():[];
  list.innerHTML=rows.map(row=>`<button class="terminal-leaderboard-row terminal-focusable is-player" type="button"><span>${row.mark}</span><strong>${row.label}</strong><em>${row.score}</em></button>`).join('');
}
function renderTerminalLogs(){
  const el=document.getElementById('terminal-log-lines');
  if(!el)return;
  const level=typeof playerLevel==='function'?playerLevel():1;
  const runs=player.deepLift&&Number(player.deepLift.totalRuns)||0;
  const best=player.deepLift&&Number(player.deepLift.bestFloor)||0;
  const lines=[
    'boot: lynx-mine kernel mounted claim_root as read-only',
    'sensor: pick rhythm accepted; manual labor loop stable',
    level>=5?'lift: deep route handshake returned a second heartbeat':'lift: deep route locked behind miner-level gate',
    runs>0?`deep-lift: ${runs} run sample(s), best floor ${best}`:'deep-lift: no descent samples recorded',
    'notice: fantasy shell integrity nominal',
    'warning: room temperature differs from painted lantern model',
  ];
  el.innerHTML=lines.map(line=>`<p><span>&gt;</span>${line}</p>`).join('');
}
function syncTerminalSettings(){
  const muted=document.getElementById('terminal-muted');
  const reduced=document.getElementById('terminal-reduced-motion');
  const settings=window.MINE_TYCOON_SETTINGS||{};
  if(muted)muted.checked=window.GameAudio&&GameAudio.isMuted?GameAudio.isMuted():!!settings.muted;
  if(reduced)reduced.checked=!!settings.reducedMotion;
}
function persistTerminalSettings(){
  try{ localStorage.setItem('mineTycoonSettings',JSON.stringify(window.MINE_TYCOON_SETTINGS||{})); }catch(e){}
}
function renderTerminalMiniOs(){
  const stage=terminalStage();
  if(!stage)return;
  stage.querySelectorAll('.sys-os-tab').forEach(tab=>{
    const active=tab.dataset.terminalApp===terminalApp;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',active?'true':'false');
  });
  stage.querySelectorAll('[data-terminal-panel]').forEach(panel=>{
    const active=panel.dataset.terminalPanel===terminalApp;
    panel.classList.toggle('active',active);
    panel.hidden=!active;
  });
  renderTerminalStats();
  renderTerminalLeaderboards();
  renderTerminalLogs();
  syncTerminalSettings();
}
function wireTerminalUi(){
  if(terminalUiWired)return;
  terminalUiWired=true;
  document.addEventListener('click',e=>{
    const enter=e.target.closest('#terminal-room-enter');
    if(enter){ setTerminalView('screen'); return; }
    const room=e.target.closest('#terminal-screen-back');
    if(room){ setTerminalView('room'); return; }
    const tab=e.target.closest('[data-terminal-app]');
    if(tab){ switchTerminalApp(tab.dataset.terminalApp); tab.focus({preventScroll:true}); return; }
    if(e.target.closest('#terminal-return-map')){ openWorldMap({instant:true}); return; }
    if(e.target.closest('#terminal-refresh-os')){ renderShop(); renderTerminalMiniOs(); return; }
  });
  document.addEventListener('change',e=>{
    if(e.target&&e.target.id==='terminal-muted'){
      window.MINE_TYCOON_SETTINGS={...(window.MINE_TYCOON_SETTINGS||{}),muted:e.target.checked};
      if(window.GameAudio&&GameAudio.setMuted)GameAudio.setMuted(e.target.checked);
      persistTerminalSettings();
    }
    if(e.target&&e.target.id==='terminal-reduced-motion'){
      window.MINE_TYCOON_SETTINGS={...(window.MINE_TYCOON_SETTINGS||{}),reducedMotion:e.target.checked};
      document.body.classList.toggle('reduced-motion',!!e.target.checked);
      persistTerminalSettings();
    }
  });
  document.addEventListener('keydown',e=>{
    if(backpackScreen!=='terminal'||terminalView!=='screen')return;
    const key=e.key.toLowerCase();
    if(['w','a','arrowup','arrowleft'].includes(key)){
      e.preventDefault();
      focusTerminalControl(-1);
    }else if(['s','d','arrowdown','arrowright'].includes(key)){
      e.preventDefault();
      focusTerminalControl(1);
    }else if(key==='enter'&&document.activeElement&&document.activeElement.classList.contains('terminal-focusable')){
      e.preventDefault();
      document.activeElement.click();
    }
  });
}
function openMapDetail(panel){
  closeAllPanels();
  activateAssetGroup(detailPanelAssetGroup(panel));
  mapDetailOpen=true;
  backpackMapPanel.classList.remove('open','instant-open');
  backpackMapPanel.style.pointerEvents='';
  panel.classList.add('open');
  document.body.classList.add('panel-open','map-detail-open');
  setCursorLayerMode('ui');
}
function returnToBackpackMap(){
  openWorldMap();
}

function enterMineDestination(zoneId='starter'){
  setDestination(zoneId==='crystal'?'crystal-vein':'mineshaft');
  closeAllPanels();
  if(typeof setMineZone==='function'){
    setMineZone(zoneId);
    saveGame();
  }
  if(Array.isArray(rocks)&&rocks.length===0&&typeof spawnRocks==='function')spawnRocks();
  setCursorLayerMode('world');
}

const MAP_DESTINATION_HANDLERS={
  current:()=>enterMineDestination(typeof currentMineZone==='function'?currentMineZone().id:'starter'),
  'starter-mine':()=>enterMineDestination('starter'),
  marketplace:()=>toggleMarketplace(true),
  workbench:()=>toggleWorkbench(true),
  trader:()=>toggleTrader(true),
  terminal:()=>openTerminalScreen({returnTo:'map'}),
  tavern:()=>{ setDestination('tavern'); toggleTavern(true); },
  'deep-lift':()=>{ setDestination('deep-lift'); if(typeof toggleDeepLift==='function')toggleDeepLift(true); },
  'crystal-vein':()=>enterMineDestination('crystal'),
};

let _travelMapBuilt=false;
let _travelMapWired=false;
function handleTravelMapNodeClick(node){
  if(!node)return;
  if(node.classList.contains('locked')||node.disabled||node.getAttribute('aria-disabled')==='true'){
    floatTxt(W*0.5,H*0.24,'Location not unlocked yet','#c09060',false);
    return;
  }
  try{
    travelToLocation(node.dataset.action,node);
  }catch(err){
    console.error('Map travel failed:',err);
    if(node)node.classList.remove('traveling');
    returnToBackpackMap();
  }
}
function wireTravelMap(){
  const layer=document.getElementById('travel-map-nodes');
  if(!layer||_travelMapWired)return;
  _travelMapWired=true;
  layer.addEventListener('click',e=>{
    const node=e.target.closest('.map-node');
    if(!node)return;
    handleTravelMapNodeClick(node);
  });
}
function renderTravelMap(){
  const layer=document.getElementById('travel-map-nodes');
  if(!layer)return;
  wireTravelMap();
  if(!_travelMapBuilt){
    _travelMapBuilt=true;
    MAP_LOCATIONS.forEach(loc=>{
      const btn=document.createElement('button');
      const state=resolveMapLocationState(loc);
      btn.className=`map-node ${state}`;
      btn.type='button';
      btn.disabled=false;
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
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        handleTravelMapNodeClick(btn);
      });
      layer.appendChild(btn);
    });
  } else {
    // Only update state classes — no DOM rebuild
    layer.querySelectorAll('.map-node').forEach(btn=>{
      const loc=MAP_LOCATIONS.find(l=>l.id===btn.dataset.loc);
      if(!loc)return;
      const state=resolveMapLocationState(loc);
      btn.className=`map-node ${state}`;
      btn.disabled=false;
      btn.setAttribute('aria-disabled',state==='locked'?'true':'false');
      const sub=btn.querySelector('.map-node-sub');
      if(sub)sub.textContent=resolveMapLocationSub(loc);
    });
  }
}
function resolveMapLocationState(loc){
  if(loc.id==='crystal-vein')return playerLevel()>=30?'available':'locked';
  if(loc.id==='deep-lift')return playerLevel()>=5?'available':'locked';
  return loc.state==='levelLocked'?'locked':(loc.state==='active'?'available':(loc.state||'available'));
}
function resolveMapLocationSub(loc){
  if(loc.id==='crystal-vein')return playerLevel()>=30?'Dangerous mine':'Unlocks at Lv 30';
  if(loc.id==='deep-lift')return playerLevel()>=5?'Dungeon test':'Unlocks at Lv 5';
  return loc.sub;
}

function travelLocationName(action){
  const loc=typeof MAP_LOCATIONS!=='undefined'&&MAP_LOCATIONS.find(item=>item.action===action);
  return loc?loc.name:'destination';
}
function setTravelLoader(active,action='',progress={loaded:0,total:0}){
  const loader=document.getElementById('travel-loader');
  if(!loader)return;
  loader.hidden=!active;
  if(!active)return;
  const label=document.getElementById('travel-loader-label');
  const fill=document.getElementById('travel-loader-fill');
  const loaded=Math.max(0,Number(progress.loaded)||0);
  const total=Math.max(0,Number(progress.total)||0);
  if(label)label.textContent=total?`Preparing ${travelLocationName(action)} ${loaded}/${total}`:`Preparing ${travelLocationName(action)}`;
  if(fill)fill.style.width=`${Math.round(total?Math.max(0.05,Math.min(1,loaded/total))*100:5)}%`;
}
function preloadTravelDestination(action){
  const group=DESTINATION_ASSET_GROUPS[action];
  if(!group||!window.GameAssets||!GameAssets.loadGroup)return Promise.resolve();
  setTravelLoader(true,action);
  return GameAssets.loadGroup(group,{onProgress:progress=>setTravelLoader(true,action,progress)})
    .then(()=>activateAssetGroup(group))
    .finally(()=>setTravelLoader(false));
}
function travelToLocation(action, nodeEl){
  if(!action)return;
  const handler=MAP_DESTINATION_HANDLERS[action];
  if(!handler){
    console.warn('Unknown map destination:',action);
    return;
  }
  if(action==='current'||action==='starter-mine'||action==='crystal-vein'){
    handler();
    return;
  }
  nodeEl.classList.add('traveling');
  setTimeout(()=>{
    Promise.resolve(preloadTravelDestination(action)).then(()=>{
      nodeEl.classList.remove('traveling');
      handler();
    }).catch(err=>{
      console.error('Map travel failed:',err);
      if(nodeEl)nodeEl.classList.remove('traveling');
      setTravelLoader(false);
      returnToBackpackMap();
    });
  },180);
}

let _panelFallbackControlsWired=false;
function wirePanelFallbackControls(){
  if(_panelFallbackControlsWired)return;
  _panelFallbackControlsWired=true;
  const bind=(el,fn)=>{
    if(!el)return;
    el.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      fn();
    },true);
  };
  bind(backpackBack,backpackGoBack);
  bind(backpackMapClose,()=>toggleBackpackMap(false));
  bind(marketClose,()=>toggleMarketplace(false));
  bind(workbenchClose,()=>toggleWorkbench(false));
  bind(traderClose,()=>toggleTrader(false));
  bind(characterClose,()=>toggleCharacter(false));
}
wirePanelFallbackControls();

