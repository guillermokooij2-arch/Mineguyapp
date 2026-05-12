// â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    btn.addEventListener('click',()=>runUiAction(()=>switchBmpScreen(btn.dataset.bmpGo)));
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
  if(traderCharacterBtn){
    traderCharacterBtn.addEventListener('mouseenter',advanceTraderState);
    traderCharacterBtn.addEventListener('click',advanceTraderState);
  }
  characterClose.addEventListener('click',()=>runUiAction(()=>toggleCharacter(false)));
  if(charUsernameSave)charUsernameSave.addEventListener('click',()=>{ setPlayerUsername(charUsernameInput&&charUsernameInput.value); renderCharacter(); });
  if(charUsernameInput)charUsernameInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); setPlayerUsername(charUsernameInput.value); renderCharacter(); } });
  minerHud.addEventListener('click',()=>runUiAction(()=>toggleCharacter()));
  minerHud.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')runUiAction(()=>toggleCharacter());});
  sellAllOresBtn.addEventListener('click',sellAllOres);
  if(sellAllForgedBtn) sellAllForgedBtn.addEventListener('click',sellAllForgedItems);
  if(typeof initTavern==='function')initTavern();
  if(inventoryGrid){
    inventoryGrid.addEventListener('mousemove',e=>{
      const slot=e.target.closest('.inventory-slot');
      if(slot&&slot.dataset.itemId)showItemTooltip(slot.dataset.itemId,e.clientX,e.clientY);
      else hideItemTooltip();
    });
    inventoryGrid.addEventListener('mouseleave',hideItemTooltip);
  }
  setTraderState(0);
  renderTravelMap();
  document.getElementById('travel-map-nodes').addEventListener('click',e=>{
    const node=e.target.closest('.map-node');
    if(!node)return;
    if(node.classList.contains('locked')){
      floatTxt(W*0.5,H*0.24,'Location not unlocked yet','#c09060',false);
      return;
    }
    runUiAction(()=>travelToLocation(node.dataset.action,node));
  });
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

  // Raised identity panel combines miner portrait, level, and stats entry.
  minerHud.classList.add('command-level-panel');
  minerHud.innerHTML=`
    <div class="command-id-portrait">
      <span class="portrait-lamp"></span>
      <img src="images/miner-portrait-bust.webp" alt="">
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

  // Wrapper: resources stacked above backpack icon.
  const sideStack=document.createElement('div');
  sideStack.className='command-side-stack';

  const resources=document.createElement('div');
  resources.id='command-resources';
  resources.className='command-resources';
  resources.innerHTML=`
    <div class="command-resource-row"><span>Coins</span><strong id="v-coins">0</strong></div>
    <div class="command-resource-row"><span>Ore Bag</span><strong id="v-ore">0</strong></div>`;
  sideStack.appendChild(resources);
  sideStack.appendChild(backpackToggle);
  bar.appendChild(sideStack);
  elCoins=document.getElementById('v-coins');
  elOre=document.getElementById('v-ore');
  elBrk=null;
}

// â”€â”€ UPDATE UI (called every frame) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    if(c!==_prevCombo&&c%5===0&&window.GameAudio)GameAudio.playCritMilestone();
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
    _prevCombo=c;
  }else{
    if(_prevCombo!==0||chainDisplay.className)chainDisplay.className='';
    _prevCombo=0;
    _comboBreakerPlayed=false;
  }
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
