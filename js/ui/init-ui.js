// Init
let terminalHudExpanded=false;

function initPanels(){
  ensureInventorySlots();
  buildCharacterCommandBar();
  const runUiAction=fn=>{
    try{ fn(); }
    catch(err){
      console.error('UI action failed:',err);
      if(typeof closeAllPanels==='function')closeAllPanels();
    }
  };
  const hoverSound=window.UI_HOVER_SOUND_SRC&&typeof Audio!=='undefined'?new Audio(window.UI_HOVER_SOUND_SRC):null;
  document.querySelectorAll('[data-bmp-go]').forEach(btn=>{
    btn.addEventListener('click',()=>runUiAction(()=>{
      if(btn.dataset.bmpGo==='terminal'&&typeof openTerminalScreen==='function')openTerminalScreen({returnTo:backpackScreen==='map'?'map':'inventory'});
      else switchBmpScreen(btn.dataset.bmpGo);
    }));
  });
  document.querySelectorAll('.ui-img-btn').forEach(btn=>{
    btn.addEventListener('mouseenter',()=>{
      if(window.MINE_TYCOON_SETTINGS&&window.MINE_TYCOON_SETTINGS.muted)return;
      if(!hoverSound)return;
      hoverSound.currentTime=0;
      hoverSound.volume=0.22;
      hoverSound.play().catch(()=>{});
    });
  });
  // Button wiring
  backpackToggle.addEventListener('click',()=>runUiAction(()=>toggleBackpackMap()));
  backpackBack.addEventListener('click',()=>runUiAction(backpackGoBack));
  backpackMapClose.addEventListener('click',()=>runUiAction(()=>toggleBackpackMap(false)));
  marketClose.addEventListener('click',()=>runUiAction(()=>toggleMarketplace(false)));
  workbenchClose.addEventListener('click',()=>runUiAction(()=>toggleWorkbench(false)));
  traderClose.addEventListener('click',()=>runUiAction(()=>toggleTrader(false)));
  if(traderUpgradesOpen)traderUpgradesOpen.addEventListener('click',()=>runUiAction(openTraderUpgradeShelf));
  if(traderCombineOpen)traderCombineOpen.addEventListener('click',()=>runUiAction(openTraderCombinePanel));
  if(traderCharacterBtn){
    traderCharacterBtn.addEventListener('mouseenter',handleTraderCharacterHover);
    traderCharacterBtn.addEventListener('click',handleTraderCharacterInteract);
  }
  characterClose.addEventListener('click',()=>runUiAction(()=>toggleCharacter(false)));
  if(charUsernameSave)charUsernameSave.addEventListener('click',()=>{ setPlayerUsername(charUsernameInput&&charUsernameInput.value); renderCharacter(); });
  if(charUsernameInput)charUsernameInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); setPlayerUsername(charUsernameInput.value); renderCharacter(); } });
  wireCharacterTerminalNavigation();
  minerHud.addEventListener('click',()=>runUiAction(()=>toggleCharacter()));
  minerHud.addEventListener('keydown',e=>{if(e.target===minerHud&&(e.key==='Enter'||e.key===' '))runUiAction(()=>toggleCharacter());});
  sellAllOresBtn.addEventListener('click',sellAllOres);
  if(sellAllForgedBtn) sellAllForgedBtn.addEventListener('click',sellAllForgedItems);
  if(typeof initTavern==='function')initTavern();
  if(typeof initDeepLift==='function')initDeepLift();
  if(typeof initMinerJournal==='function')initMinerJournal();
  if(inventoryGrid){
    inventoryGrid.addEventListener('mousemove',e=>{
      const slot=e.target.closest('.inventory-slot');
      if(slot&&slot.dataset.itemId)showItemTooltip(slot.dataset.itemId,e.clientX,e.clientY);
      else if(slot&&slot.dataset.consumableId)showConsumableTooltip(slot.dataset.consumableId,e.clientX,e.clientY);
      else if(slot&&slot.dataset.oreType)showOreTooltip(slot.dataset.oreType,slot.dataset.oreCount,e.clientX,e.clientY);
      else hideItemTooltip();
    });
    inventoryGrid.addEventListener('click',e=>{
      const equipButton=e.target.closest('[data-equip-forged]');
      if(equipButton){
        e.preventDefault();
        if(typeof equipForgedInventoryItem==='function'&&equipForgedInventoryItem(Number(equipButton.dataset.equipForged))){
          if(typeof pulseElement==='function')pulseElement(equipButton,'inventory-equip-pulse',360);
          renderInventory();
        }
        hideItemTooltip();
        return;
      }
      const useButton=e.target.closest('[data-consume-tavern]');
      if(!useButton)return;
      e.preventDefault();
      if(typeof consumeTavernInventoryItem==='function')consumeTavernInventoryItem(Number(useButton.dataset.consumeTavern),useButton);
      hideItemTooltip();
    });
    inventoryGrid.addEventListener('mouseleave',hideItemTooltip);
  }
  if(equipmentGrid){
    equipmentGrid.addEventListener('mousemove',e=>{
      const slot=e.target.closest('.equipment-slot[data-item-id]');
      if(slot)showItemTooltip(slot.dataset.itemId,e.clientX,e.clientY,{equipped:true});
      else hideItemTooltip();
    });
    equipmentGrid.addEventListener('click',e=>{
      const slot=e.target.closest('[data-unequip-slot]');
      if(!slot)return;
      e.preventDefault();
      if(typeof unequipForgedItem==='function'&&unequipForgedItem(Number(slot.dataset.unequipSlot)))renderInventory();
      hideItemTooltip();
    });
    equipmentGrid.addEventListener('mouseleave',hideItemTooltip);
  }
  setTraderState(0);
  renderTravelMap();
  backdrop.addEventListener('click',()=>runUiAction(()=>mapDetailOpen?returnToBackpackMap():closeAllPanels()));
  // Craft result OK button
  document.getElementById('craft-result-ok').addEventListener('click',()=>{
    _showWorkbenchPhase('recipes');
    renderCraftRecipes();
  });
}

function buildCharacterCommandBar(){
  if(document.getElementById('character-command-bar')||!backpackToggle||!minerHud)return;
  const bar=document.createElement('div');
  bar.id='character-command-bar';
  bar.setAttribute('aria-label','Miner command bar');
  backpackToggle.classList.add('command-slot','command-backpack');

  minerHud.classList.add('command-level-panel');
  minerHud.innerHTML=`
    <div class="command-id-portrait">
      <span class="portrait-lamp"></span>
      <img src="images/miner/miner-portrait-bust.webp" alt="">
    </div>
    <div class="command-id-progress">
      <div class="mhud-level-label">Miner Level</div>
      <div class="mhud-xp-wrap">
        <div class="mhud-xp-bar"><div class="mhud-xp-fill" id="mhud-xp-fill"></div></div>
        <div class="mhud-xp-next" id="mhud-xp-next">Next: 20 XP</div>
      </div>
    </div>
    <div class="mhud-level-badge" id="mhud-level">Lv 1</div>`;
  minerHud.parentNode.insertBefore(bar, minerHud);
  bar.appendChild(minerHud);
  mhudLevel=document.getElementById('mhud-level');
  mhudXpFill=document.getElementById('mhud-xp-fill');
  mhudXpNext=document.getElementById('mhud-xp-next');

  // Buffs panel — absolute inside identity panel, anchored top-right, lifted above via CSS.
  commandBuffsEl=document.createElement('div');
  commandBuffsEl.id='command-buffs';
  commandBuffsEl.className='command-buffs';
  commandBuffsEl.setAttribute('aria-live','polite');
  commandBuffsEl.innerHTML='<span class="command-buff-empty">No active buffs</span>';
  minerHud.appendChild(commandBuffsEl);

  const terminalInfo=document.createElement('div');
  terminalInfo.id='terminal-hud-info';
  terminalInfo.className='terminal-hud-info';
  terminalInfo.innerHTML=`
    <div class="terminal-hud-compact">
      <div class="terminal-hud-status"><span></span><strong>SYS</strong></div>
      <div class="terminal-hud-resource"><span>COINS</span><strong id="v-coins">0</strong></div>
      <div class="terminal-hud-resource"><span>ORE</span><strong id="v-ore">0</strong></div>
      <button id="hud-expand-toggle" class="terminal-hud-toggle" type="button" aria-label="Expand terminal HUD information" aria-expanded="false">▣</button>
    </div>
    <div class="terminal-hud-expanded" id="terminal-hud-expanded" aria-label="Expanded terminal telemetry">
      <div class="terminal-hud-stat-grid" id="terminal-hud-stat-grid"></div>
      <div class="terminal-hud-actions">
        <button id="hud-terminal-shortcut" type="button">SYS</button>
      </div>
    </div>`;
  bar.appendChild(terminalInfo);

  const expandToggle=document.getElementById('hud-expand-toggle');
  if(expandToggle)expandToggle.addEventListener('click',e=>{
    e.stopPropagation();
    terminalHudExpanded=!terminalHudExpanded;
    terminalInfo.classList.toggle('is-expanded',terminalHudExpanded);
    expandToggle.setAttribute('aria-expanded',terminalHudExpanded?'true':'false');
    expandToggle.setAttribute('aria-label',terminalHudExpanded?'Collapse terminal HUD information':'Expand terminal HUD information');
    renderTerminalHudDetails();
  });
  const terminalShortcut=document.getElementById('hud-terminal-shortcut');
  if(terminalShortcut)terminalShortcut.addEventListener('click',e=>{
    e.stopPropagation();
    if(typeof openTerminalScreen==='function')openTerminalScreen({returnTo:'inventory'});
  });

  const sideStack=document.createElement('div');
  sideStack.className='command-side-stack';
  const backpackMapQuick=document.createElement('button');
  backpackMapQuick.id='backpack-map-quick';
  backpackMapQuick.className='backpack-map-quick ui-img-btn';
  backpackMapQuick.type='button';
  backpackMapQuick.setAttribute('aria-label','Open map');
  backpackMapQuick.innerHTML=`
    <img class="ui-btn-state ui-btn-normal" src="images/ui-buttons/map-normal.png" alt="">
    <img class="ui-btn-state ui-btn-hover" src="images/ui-buttons/map-hover.png" alt="">`;
  backpackMapQuick.addEventListener('click',e=>{
    e.stopPropagation();
    toggleBackpackMap(true,'map');
  });

  terminalInfo.classList.add('command-resources-lite');
  sideStack.appendChild(terminalInfo);
  sideStack.appendChild(backpackToggle);
  sideStack.appendChild(backpackMapQuick);
  bar.appendChild(sideStack);
  elCoins=document.getElementById('v-coins');
  elOre=document.getElementById('v-ore');
  elBrk=null;
  renderTerminalHudDetails();
}

let characterTerminalNavigationWired=false;
function visibleCharacterFocusables(){
  if(!characterPanel||!characterPanel.classList.contains('open'))return [];
  return Array.from(characterPanel.querySelectorAll('button,input,.char-record-row,.char-stat-row,.char-leaderboard-row')).filter(el=>{
    if(el.disabled||el.hidden||el.getAttribute('aria-hidden')==='true')return false;
    return !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
  });
}
function focusCharacterTerminal(delta=1){
  const focusables=visibleCharacterFocusables();
  if(!focusables.length)return;
  let index=focusables.indexOf(document.activeElement);
  if(index<0)index=0;
  else index=(index+delta+focusables.length)%focusables.length;
  focusables[index].focus({preventScroll:true});
}
function wireCharacterTerminalNavigation(){
  if(characterTerminalNavigationWired)return;
  characterTerminalNavigationWired=true;
  document.addEventListener('keydown',e=>{
    if(!characterPanel||!characterPanel.classList.contains('open'))return;
    const key=e.key.toLowerCase();
    if(['w','a','arrowup','arrowleft'].includes(key)){
      e.preventDefault();
      focusCharacterTerminal(-1);
    }else if(['s','d','arrowdown','arrowright'].includes(key)){
      e.preventDefault();
      focusCharacterTerminal(1);
    }else if(key==='enter'&&document.activeElement&&characterPanel.contains(document.activeElement)){
      const active=document.activeElement;
      if(active.matches('button')){
        e.preventDefault();
        active.click();
      }
    }
  });
}

// Update UI (called every frame)
const HUD_UPDATE_INTERVAL_MS=100;
const COMMAND_BUFF_RENDER_INTERVAL_MS=1000;
let _lastHudUpdateAt=-Infinity;
let _lastCommandBuffRenderAt=-Infinity;
let _lastHudCoins=null,_lastHudOre=null,_lastHudBreaks=null,_lastHudLevel=null,_lastHudXpPct=null,_lastHudXpNext=null;
let _lastTerminalCoins=null;

function updateUI(){
  const now=frameTime||performance.now();
  if(now-_lastHudUpdateAt>=HUD_UPDATE_INTERVAL_MS){
    _lastHudUpdateAt=now;
    const val=inventoryValue();
    if(elCoins&&_lastHudCoins!==player.coins){
      elCoins.textContent=player.coins;
      _lastHudCoins=player.coins;
    }
    if(elOre&&_lastHudOre!==val){
      elOre.textContent=val;
      _lastHudOre=val;
    }
    if(elBrk&&_lastHudBreaks!==gs.breaks){
      elBrk.textContent=gs.breaks;
      _lastHudBreaks=gs.breaks;
    }
    if(terminalCoins&&_lastTerminalCoins!==player.coins){
      terminalCoins.textContent=player.coins;
      _lastTerminalCoins=player.coins;
    }
    const lv=playerLevel(), prog=xpProgress(), xpPct=Math.round(prog.pct*100), xpNext=prog.needed-prog.cur;
    if(mhudLevel&&_lastHudLevel!==lv){
      mhudLevel.textContent=`Lv ${lv}`;
      _lastHudLevel=lv;
    }
    if(mhudXpFill&&_lastHudXpPct!==xpPct){
      mhudXpFill.style.width=`${xpPct}%`;
      _lastHudXpPct=xpPct;
    }
    if(mhudXpNext&&_lastHudXpNext!==xpNext){
      mhudXpNext.textContent=`Next: ${xpNext} XP`;
      _lastHudXpNext=xpNext;
    }
    renderTerminalHudDetails();
  }
  if(now-_lastCommandBuffRenderAt>=COMMAND_BUFF_RENDER_INTERVAL_MS){
    _lastCommandBuffRenderAt=now;
    renderCommandBuffs();
  }
  // Chain counter
  if(chain.combo>=1&&chain.timer>0){
    const c=chain.combo;
    const className='chain-active'
      +(c>=5?' chain-warm':'')
      +(c>=10?' chain-hot':'')
      +(c>=20?' chain-flame':'')
      +(c>=40?' chain-blue-flame':'')
      +(c>=45?' chain-void':'');
    if(c>=50&&!_comboBreakerPlayed){
      _comboBreakerPlayed=true;
      if(window.GameAudio)GameAudio.playComboBreaker();
    }
    if(c!==_prevCombo){
      chainNum.textContent=c;
      chainDisplay.className=className;
      // Use animation replacement via class toggle — no offsetWidth reflow
      chainDisplay.classList.remove('chain-hit');
      chainDisplay.addEventListener('animationend',()=>chainDisplay.classList.remove('chain-hit'),{once:true});
      requestAnimationFrame(()=>chainDisplay.classList.add('chain-hit'));
    }
    if(typeof worldToScreen==='function'&&typeof LAYOUT==='object'){
      const img=typeof imgFront!=='undefined'?imgFront:null;
      const dW=Math.round(W*LAYOUT.minerScale);
      const dH=img&&img.naturalWidth?Math.round(dW*(img.naturalHeight/img.naturalWidth)):Math.round(H*0.28);
      const anchor=worldToScreen(W*LAYOUT.playerFx,Math.round(H*LAYOUT.groundFy)-dH+LAYOUT.minerYOffset+18);
      chainDisplay.style.left=`${anchor.x}px`;
      chainDisplay.style.top=`${Math.max(18,anchor.y-10)}px`;
    }
    _prevCombo=c;
  }else{
    if(_prevCombo!==0||chainDisplay.className)chainDisplay.className='';
    _prevCombo=0;
    _comboBreakerPlayed=false;
  }
}

function renderTerminalHudDetails(){
  const grid=document.getElementById('terminal-hud-stat-grid');
  if(!grid)return;
  const stats=player.stats||{};
  const rows=[
    ['Power', powerBonus()],
    ['Luck', `${Math.round(luckBonus()*100)}%`],
    ['Chain', chain.combo||0],
    ['Rocks', stats.totalRocksBroken||stats.rocksBroken||0],
    ['Forge', stats.totalForgedItems||0],
    ['Lift', player.deepLift&&player.deepLift.bestFloor||0],
  ];
  grid.innerHTML=rows.map(([label,value])=>`<div class="terminal-hud-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

let _lastCommandBuffHtml='';
function renderCommandBuffs(){
  if(!commandBuffsEl)commandBuffsEl=document.getElementById('command-buffs');
  if(!commandBuffsEl)return;
  if(typeof updateBuffs==='function')updateBuffs(Date.now(),false);
  const buffs=(player.tavern&&Array.isArray(player.tavern.activeBuffs))?player.tavern.activeBuffs:[];
  const now=Date.now();
  const maxBuffs=typeof MAX_TAVERN_BUFFS==='number'?MAX_TAVERN_BUFFS:7;
  const html=Array.from({length:maxBuffs},(_,i)=>{
    const buff=buffs[i];
    if(!buff)return '<span class="command-buff-empty" aria-hidden="true"></span>';
    const label=`${buff.name} ${formatTime(buff.expiresAt-now)}`;
    return `<span class="command-buff" title="${label}" aria-label="${label}"><img src="${buff.icon||''}" alt=""><em>${formatTime(buff.expiresAt-now)}</em></span>`;
  }).join('');
  if(html!==_lastCommandBuffHtml){
    commandBuffsEl.innerHTML=html;
    _lastCommandBuffHtml=html;
  }
}
