// Core gameplay, input, resize, and main loop
function breakRock(rock){
  rock.dead=true; gs.breaks++;
  if(window.GameAudio)GameAudio.playRockBreak();
  player.stats={...DEFAULT_STATS,...(player.stats||{})};
  player.stats.rocksBroken=(Number(player.stats.rocksBroken)||0)+1;
  player.stats.totalRocksBroken=(Number(player.stats.totalRocksBroken)||0)+1;
  scheduleSave();
  if(typeof trackTavernMission==='function')trackTavernMission('rockBroken',{type:rock.type});
  if(chain.rock===rock) moveChainFromBrokenRock(rock);
  const baseN=2+Math.floor(Math.random()*3)+(Math.random()<Math.min(0.95,rock.bonusOreChance+yieldChanceBonus())?1:0);
  const n=Math.max(1,Math.round(baseN*(1+yieldBonus())*tavernBuffMult('oreYieldMultiplier')));
  spawnOre(rock.x,rock.y,rock.type,n);
  spawnDust(rock.x,rock.y,24,1.25);
  spawnChunks(rock.x,rock.y,rock.col,18);
  gs.shakeAmt=9;
  floatTxt(rock.x,rock.y-rock.radius-8,`+${rock.val*n} ${ORE[rock.type].lbl}`,rock.glow||'#c8c0d8',true);
  setTimeout(()=>{ const idx=rocks.indexOf(rock); if(idx!==-1){const nr=createRock(rock.afx*W,rock.afy*H,rock.afx,rock.afy,rock.depth,rock.embed,rock.radius);nr.scale=0.01;rocks[idx]=nr;} },1600+Math.random()*800);
}

// ── NORMAL HIT ───────────────────────────────────────────────────────────────
function normalHit(rock,dmg,isCrit){
  if(window.GameAudio){
    if(isCrit)GameAudio.playCritHit();
    else GameAudio.playMineHit();
  }
  const prevStage=rockBreakStage(rock);
  rock.hp-=isCrit?dmg:Math.max(0.1,dmg*0.1);
  addCrack(rock); if(isCrit) addCrack(rock);
  if(isCrit)applyProxyDamage(rock,Math.max(1,dmg*proxyDamageBonus()),rock.x,rock.y);
  const nextStage=rockBreakStage(rock);
  if(nextStage>prevStage&&rock.hp>0&&nextStage>=4) floatTxt(rock.x,rock.y-rock.radius-22,nextStage>=5?'BREAKING!':'FRACTURE!',rock.glow||'#ff9b48',true);
  if(rock.hp<=0) breakRock(rock);
}

function applyProxyDamage(source,dmg,x,y){
  const amount=Math.max(0,Number(dmg)||0);
  if(amount<=0)return;
  let hits=0;
  for(const target of rocks){
    if(!target||target.dead||target===source)continue;
    const d=dist2(x,y,target.x,target.y);
    if(d>230)continue;
    const echo=Math.max(1,Math.round(amount*(1-d/260)));
    target.hp-=echo;
    target.bonusOreChance=Math.min(0.85,target.bonusOreChance+0.03);
    addCrack(target);
    floatTxt(target.x,target.y-target.radius-18,'ECHO HIT','#9fe8ff',false);
    if(target.hp<=0)breakRock(target);
    hits++;
    if(hits>=3)break;
  }
}

function maybeTriggerPickaxeChainReaction(rock,wpX,wpY){
  const ability=getBestPickaxeChainAbility();
  const chance=ability?Math.min(0.95,(ability.chance||0)+autoCritChanceBonus()):0;
  if(!ability||Math.random()>chance)return;
  const maxHits=Math.min(AUTO_CRIT_LIMITS.maxAutoCritsPerSwing,PERF_LIMITS.maxAutoCritsPerSwing,ability.maxHits||1);
  const minHits=Math.max(1,Math.min(ability.minHits||1,maxHits));
  const hits=minHits+Math.floor(Math.random()*(maxHits-minHits+1));
  const playerCritDmg=(1+powerBonus())*damageMultiplier()*2.5;
  floatTxt(wpX,wpY-18,'CHAIN REACTION!','#9fe8ff',true);
  let currentRock=rock,lastX=wpX,lastY=wpY;
  function nextAutoCritRock(){
    if(currentRock&&!currentRock.dead)return currentRock;
    let best=null,bestD=Infinity;
    for(const candidate of rocks){
      if(!candidate||candidate.dead)continue;
      const d=dist2(lastX,lastY,candidate.x,candidate.y);
      if(d<bestD){bestD=d;best=candidate;}
    }
    currentRock=best;
    return best;
  }
  for(let i=0;i<hits;i++){
    setTimeout(()=>{
      const target=nextAutoCritRock();
      if(!target)return;
      const jitterA=Math.random()*Math.PI*2;
      const x=target.x+Math.cos(jitterA)*target.radius*0.26;
      const y=target.y+Math.sin(jitterA)*target.radius*0.2;
      const dmg=Math.max(1,Math.round(playerCritDmg*0.8));
      const fromX=lastX,fromY=lastY;
      lastX=x; lastY=y;
      chain.combo++;
      player.stats={...DEFAULT_STATS,...(player.stats||{})};
      player.stats.highestCritChain=Math.max(Number(player.stats.highestCritChain)||0,chain.combo);
      chain.rock=target;
      if(window.GameAudio)GameAudio.playCritHit({auto:true});
      if(typeof spawnAutoCritImpact==='function')spawnAutoCritImpact(x,y,target,ability,chain.combo,fromX,fromY);
      target.hp-=dmg;
      target.bonusOreChance=Math.min(0.85,target.bonusOreChance+0.05);
      addCrack(target);
      floatTxt(x,y-12,`AUTO ${chain.combo}x`,'#9fe8ff',false);
      if(target.hp<=0)breakRock(target);
      else setWeakPoint(target,true,x,y);
    },AUTO_CRIT_LIMITS.delayBetweenAutoCritsMs*(i+1));
  }
}

// Chain hit: weak point struck.
function chainHit(rock, wpX, wpY){
  // Base weak-point damage is 2.5× normal, then each consecutive streak adds +15% more
  const streakMult=1+chain.combo*0.15;
  const baseChainDmg=(1+powerBonus())*damageMultiplier();
  const chainDamage=Math.round(baseChainDmg*2.5*streakMult);
  chain.combo++;
  player.stats={...DEFAULT_STATS,...(player.stats||{})};
  player.stats.highestCritChain=Math.max(Number(player.stats.highestCritChain)||0,chain.combo);
  rock.bonusOreChance=Math.min(0.85,rock.bonusOreChance+0.12);
  normalHit(rock,chainDamage,true);
  const label=chain.combo===1?'WEAK POINT!':`${chain.combo}x STREAK! ×${(2.5*streakMult).toFixed(1)}`;
  floatTxt(rock.x,rock.y-rock.radius-22,label,'#ffee00',true);

  if(rock.dead) return;
  maybeTriggerPickaxeChainReaction(rock,wpX,wpY);
  setWeakPoint(rock,true,wpX,wpY);
}

function dist2(ax,ay,bx,by){ return Math.sqrt((ax-bx)**2+(ay-by)**2); }

// ── INPUT ─────────────────────────────────────────────────────────────────────
function isElementClickable(el){
  const target=el&&el.closest('button,[role="button"],input,.map-node');
  if(!target)return false;
  if(target.disabled||target.getAttribute('aria-disabled')==='true')return false;
  return !target.classList.contains('locked');
}
function isUiSurface(el){
  return !!(el&&el.closest('#start-screen,#ui-backdrop,#character-command-bar,#miner-hud,#backpack-toggle,#backpack-map-panel,#character-panel,#marketplace-panel,#workbench-panel,#trader-panel,#tavern-panel'));
}
function updateCursorContext(e){
  const el=document.elementFromPoint(e.clientX,e.clientY);
  uiCursor.overInteractive=isElementClickable(el);
  uiCursor.mode=(uiCursor.overInteractive||isUiSurface(el))?'ui':'world';
}

// Use window so the custom cursor tracks correctly even over HTML buttons/panels.
window.addEventListener('mousemove',e=>{ gs.mx=e.clientX; gs.my=e.clientY; updateCursorContext(e);
  const world=screenToWorld(e.clientX,e.clientY);
  gs.wx=world.x; gs.wy=world.y;
  rocks.forEach(r=>r.hovered=false);
  if(uiCursor.mode==='world'&&!sw.active&&isScreenInWorld(e.clientX,e.clientY)){ for(const r of rocks){ if(r.dead)continue; if(dist2(world.x,world.y,r.x,r.y)<rockVisualRadius(r)+8){r.hovered=true;break;} } }
});
window.addEventListener('pointerdown',e=>{
  updateCursorContext(e);
  uiCursor.pressed=uiCursor.mode==='ui';
  uiCursor.pressT=6;
  const target=e.target.closest&&e.target.closest('button,[role="button"],input,.map-node');
  if(target&&!target.disabled&&target.getAttribute('aria-disabled')!=='true'){
    target.classList.add('ui-pressed');
    setTimeout(()=>target.classList.remove('ui-pressed'),150);
  }
});
window.addEventListener('pointerup',()=>{ uiCursor.pressed=false; });
window.addEventListener('pointercancel',()=>{ uiCursor.pressed=false; });
canvas.addEventListener('click',e=>{
  if(uiCursor.mode==='ui')return;
  if(!isScreenInWorld(e.clientX,e.clientY))return;
  if(sw.active)return;
  const world=screenToWorld(e.clientX,e.clientY);
  sw.active=true; sw.t=0; sw.hitDone=false;
  sw.clickX=world.x; sw.clickY=world.y;
  sw.clickScreenX=e.clientX; sw.clickScreenY=e.clientY;
  // Compute fixed handle-butt pivot from cursor (tip) position at REST angle.
  // tip-to-butt vector in image space: (-iW*0.47, +iH*0.88).
  const pickImg=activePickaxeImage();
  const iH=typeof PICKAXE_CURSOR_DRAW_HEIGHT==='number'?PICKAXE_CURSOR_DRAW_HEIGHT:68;
  const iW=pickImg.complete&&pickImg.naturalWidth?Math.round(iH*(pickImg.naturalWidth/pickImg.naturalHeight)):104;
  const hitT=sw.HIT_AT;
  const a=hitT<0.50?sw.REST+(sw.WIND-sw.REST)*(1-easeOut(hitT/0.50)):sw.WIND+(sw.STRIKE-sw.WIND)*easeOut((hitT-0.50)/0.50);
  const tipX=iW*(0.87-0.40), tipY=iH*(0.07-0.93);
  sw.pivotX=e.clientX-(tipX*Math.cos(a)-tipY*Math.sin(a));
  sw.pivotY=e.clientY-(tipX*Math.sin(a)+tipY*Math.cos(a));
});

// ── SWING UPDATE ──────────────────────────────────────────────────────────────
function easeOut(t){ return 1-(1-t)*(1-t); }
function updateSwing(){
  if(!sw.active)return; sw.t+=dt;
  if(sw.t/sw.dur>sw.HIT_AT&&!sw.hitDone){
    sw.hitDone=true;
    let hit=false;
    let canceledChain=false;
    for(const r of rocks){
      if(r.dead)continue;
      if(dist2(sw.clickX,sw.clickY,r.x,r.y)>rockVisualRadius(r)+8) continue;
      // Is this the chain rock? Check WP proximity
      if(chain.rock===r && chain.timer>0){
        const wp=chainWorldPoint(r);
        if(dist2(sw.clickX,sw.clickY,wp.x,wp.y)<weakPointHitRadius(r)){
          chainHit(r,wp.x,wp.y); hit=true; break;
        }
        resetChain();
        canceledChain=true;
        floatTxt(sw.clickX,sw.clickY,'CHAIN LOST','#ff5533',false);
      }
      // Missing the weak point during a chain cancels it; otherwise this starts a new marker.
      else if(chain.timer>0){
        resetChain();
        canceledChain=true;
        floatTxt(sw.clickX,sw.clickY,'CHAIN LOST','#ff5533',false);
      }
      const startsChain=!canceledChain;
      normalHit(r,(1+powerBonus())*damageMultiplier(),false);
      if(startsChain&&!r.dead&&chain.timer===0) setWeakPoint(r,false,sw.clickX,sw.clickY);
      hit=true; break;
    }
    if(!hit){
      if(chain.timer>0){
        resetChain();
        canceledChain=true;
        floatTxt(sw.clickX,sw.clickY,'CHAIN LOST','#ff5533',false);
      }
    }
  }
  if(sw.t>=sw.dur){ sw.active=false; sw.t=0; }
}

// ── CHAIN UPDATE ──────────────────────────────────────────────────────────────
function updateChain(){
  if(chain.timer>0){
    chain.timer=Math.max(0,chain.timer-dt);
    chain.pulse+=0.08*dtScale;
    if(chain.rock&&!chain.rock.dead){
      let da=chain.targetAngle-chain.angle;
      while(da>Math.PI) da-=Math.PI*2;
      while(da<-Math.PI) da+=Math.PI*2;
      const moveStep=1-Math.pow(1-chain.moveSpeed,dtScale);
      chain.angle+=da*moveStep;
      chain.dist+=(chain.targetDist-chain.dist)*moveStep;
      if(Math.abs(da)<0.08&&Math.abs(chain.targetDist-chain.dist)<1.5){
        chain.targetAngle=chain.angle+(Math.random()-0.5)*2.2;
        chain.targetDist=chain.rock.radius*(0.38+Math.random()*0.34);
      }
    }
    if(chain.timer<=0){
      resetChain();
    }
  }
}

// ── ROCK UPDATE ───────────────────────────────────────────────────────────────
function updateRocks(){ rocks.forEach(r=>{ if(r.dead)return; r.scale=Math.min(1,r.scale+0.05*dtScale); r.flash=Math.max(0,r.flash-0.09*dtScale); if(r.shakeF>0){r.shakeF=Math.max(0,r.shakeF-dtScale);r.shakeX=(Math.random()-0.5)*5;r.shakeY=(Math.random()-0.5)*5;}else{r.shakeX=0;r.shakeY=0;} }); }

function resize(){
  screenW=window.innerWidth;screenH=window.innerHeight;
  dpr=Math.max(1,Math.min(window.devicePixelRatio||1,MAX_CANVAS_DPR));
  viewScale=Math.min(screenW/W,screenH/H)||1;
  viewW=W*viewScale;viewH=H*viewScale;
  viewX=(screenW-viewW)*0.5;viewY=(screenH-viewH)*0.5;
  canvas.width=Math.round(screenW*dpr);canvas.height=Math.round(screenH*dpr);
  cursorCanvas.width=canvas.width;cursorCanvas.height=canvas.height;
  canvas.style.width=`${screenW}px`;canvas.style.height=`${screenH}px`;
  cursorCanvas.style.width=`${screenW}px`;cursorCanvas.style.height=`${screenH}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  cursorCtx.setTransform(dpr,0,0,dpr,0,0);
  ctx.imageSmoothingEnabled=true;
  cursorCtx.imageSmoothingEnabled=true;
  if(typeof backpackTarget==='object')backpackTarget.valid=false;
  if(rocks.length===0)spawnRocks();
}
window.addEventListener('resize',resize);

// ── MAIN LOOP ────────────────────────────────────────────────────────────────
function frame(ts){
  try{
    frameTime=ts||performance.now();
    if(!lastFrameTime)lastFrameTime=frameTime-(BASE_FRAME_SECONDS*1000);
    dt=Math.min(MAX_DELTA_SECONDS,Math.max(0,(frameTime-lastFrameTime)/1000));
    dtScale=dt/BASE_FRAME_SECONDS;
    lastFrameTime=frameTime;
    updateShake();updateSwing();updateChain();updateRocks();
    updateParticles();updateOrePickups();updateFloatTexts();
    if(typeof updateTavernSystems==='function')updateTavernSystems();
    updateUI();
    // Main canvas: shakes with screen shake.
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,screenW,screenH);
    ctx.fillStyle='#08050f';ctx.fillRect(0,0,screenW,screenH);
    ctx.save();ctx.translate(viewX+gs.shakeX*viewScale,viewY+gs.shakeY*viewScale);ctx.scale(viewScale,viewScale);
    drawBg();rocks.forEach(drawRock);drawOrePickups();drawParticles();drawMiner();drawFloatTexts();
    ctx.restore();
    // Cursor canvas: never shakes and always stays above HTML panels.
    cursorCtx.setTransform(dpr,0,0,dpr,0,0);
    cursorCtx.clearRect(0,0,screenW,screenH);
    if(uiCursor.pressT>0)uiCursor.pressT=Math.max(0,uiCursor.pressT-dtScale);
    drawCursor();
  }catch(err){
    console.error('Frame update failed:',err);
  }
  requestAnimationFrame(frame);
}

// ── START SCREEN ──────────────────────────────────────────────────────────────
(function(){
  const screen=document.getElementById('start-screen');
  if(!screen)return;
  const continueBtn=document.getElementById('menu-continue');
  const newGameBtn=document.getElementById('menu-new-game');
  const settingsBtn=document.getElementById('menu-settings');
  const creditsBtn=document.getElementById('menu-credits');
  const confirmPanel=document.getElementById('menu-confirm-new');
  const settingsPanel=document.getElementById('menu-settings-panel');
  const creditsPanel=document.getElementById('menu-credits-panel');
  const confirmStartBtn=document.getElementById('menu-confirm-start');
  const mutedInput=document.getElementById('menu-muted');
  const reducedMotionInput=document.getElementById('menu-reduced-motion');
  const saveSummary=document.getElementById('menu-save-summary');
  const gameMenuButton=document.getElementById('game-menu-button');
  const SETTINGS_KEY='mineTycoonSettings';
  const AUTO_START_KEY='mineTycoonAutoStart';
  let started=false;
  let menuReady=false;
  let startFadeTimer=null;
  let startHideTimer=null;

  function readSettings(){
    try{ return {...{muted:false,reducedMotion:false},...(JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{})}; }
    catch(e){ return {muted:false,reducedMotion:false}; }
  }
  function persistSettings(){
    try{ localStorage.setItem(SETTINGS_KEY,JSON.stringify(window.MINE_TYCOON_SETTINGS)); }catch(e){}
  }
  function applyMenuSettings(){
    const s=window.MINE_TYCOON_SETTINGS;
    screen.classList.toggle('reduced-motion',!!s.reducedMotion);
    document.body.classList.toggle('reduced-motion',!!s.reducedMotion);
    if(mutedInput)mutedInput.checked=!!s.muted;
    if(reducedMotionInput)reducedMotionInput.checked=!!s.reducedMotion;
  }
  function readSaveData(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      return raw?JSON.parse(raw):null;
    }catch(e){ return null; }
  }
  function levelFromXp(xp){
    let l=0;
    while(((l+1)*(l+1)*20)<=xp)l++;
    return l;
  }
  function renderSaveState(){
    const save=readSaveData();
    if(!continueBtn)return;
    continueBtn.classList.toggle('hidden',!save);
    if(!save){
      continueBtn.disabled=true;
      return;
    }
    continueBtn.disabled=false;
    const coins=Number(save.coins)||0;
    const xp=Number(save.xp)||0;
    if(saveSummary)saveSummary.textContent=`Lv ${levelFromXp(xp)} - ${coins} coins`;
  }
  function setMenuReady(){
    if(menuReady)return;
    menuReady=true;
    screen.classList.add('menu-ready');
    if(window.GameAudio){
      if(!document.body.classList.contains('game-active')&&GameAudio.startMenuAudioSequence)GameAudio.startMenuAudioSequence();
    }
  }
  function waitForCoreAssets(){
    const imgs=[imgBg,imgFront,imgBack,...PICKAXE_CURSOR_IMAGES,imgHandOpen,imgHandPoint];
    if(typeof ORE_NODE_IMAGES==='object'){
      Object.values(ORE_NODE_IMAGES).forEach(list=>Array.isArray(list)&&imgs.push(...list));
    }
    const waits=imgs.filter(Boolean).map(img=>{
      if(img.complete&&img.naturalWidth)return Promise.resolve();
      if(typeof img.decode==='function')return img.decode().catch(()=>{});
      return new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
      });
    });
    return Promise.all(waits);
  }
  function closeModals(){
    [confirmPanel,settingsPanel,creditsPanel].forEach(panel=>{ if(panel)panel.hidden=true; });
  }
  function openModal(panel){
    if(!panel)return;
    closeModals();
    panel.hidden=false;
    const focusTarget=panel.querySelector('button,input');
    if(focusTarget)focusTarget.focus({preventScroll:true});
  }
  function startGame(){
    if(started)return;
    started=true;
    closeModals();
    document.body.classList.add('game-active');
    if(window.GameAudio){
      GameAudio.setMenuLoop(false);
      GameAudio.setLoadingLoop(false);
      if(typeof currentMineZone==='function'&&currentMineZone().ambience==='dangerousMine')GameAudio.setDangerousMineAmbience(true);
      else GameAudio.setMineAmbience(true);
    }
    screen.classList.add('starting');
    screen.querySelectorAll('button,input').forEach(el=>{ el.disabled=true; });
    clearTimeout(startFadeTimer);
    startFadeTimer=setTimeout(()=>screen.classList.add('fading'),520);
    clearTimeout(startHideTimer);
    startHideTimer=setTimeout(()=>screen.classList.add('menu-hidden'),1280);
  }
  function returnToMainMenu(){
    closeModals();
    if(typeof closeAllPanels==='function')closeAllPanels();
    started=false;
    clearTimeout(startFadeTimer);
    clearTimeout(startHideTimer);
    if(window.GameAudio)GameAudio.playMapOpenClose();
    document.body.classList.remove('game-active');
    screen.classList.remove('starting','fading','menu-hidden');
    screen.querySelectorAll('button,input').forEach(el=>{ el.disabled=false; });
    renderSaveState();
    if(window.GameAudio){
      GameAudio.setMineAmbience(false);
      GameAudio.setMenuLoop(true);
    }
  }
  function startFreshGame(){
    try{
      localStorage.removeItem(SAVE_KEY);
      sessionStorage.setItem(AUTO_START_KEY,'1');
    }catch(e){}
    window.location.reload();
  }

  window.MINE_TYCOON_SETTINGS=readSettings();
  applyMenuSettings();
  renderSaveState();
  window.addEventListener('load',()=>Promise.all([
    waitForCoreAssets(),
    new Promise(resolve=>setTimeout(resolve,3900)),
  ]).then(setMenuReady),{once:true});
  setTimeout(setMenuReady,6200);

  if(continueBtn)continueBtn.addEventListener('click',startGame);
  if(newGameBtn)newGameBtn.addEventListener('click',()=>{
    if(readSaveData())openModal(confirmPanel);
    else startGame();
  });
  if(settingsBtn)settingsBtn.addEventListener('click',()=>openModal(settingsPanel));
  if(creditsBtn)creditsBtn.addEventListener('click',()=>openModal(creditsPanel));
  if(confirmStartBtn)confirmStartBtn.addEventListener('click',startFreshGame);
  if(gameMenuButton)gameMenuButton.addEventListener('click',returnToMainMenu);
  if(mutedInput)mutedInput.addEventListener('change',()=>{
    window.MINE_TYCOON_SETTINGS.muted=mutedInput.checked;
    if(window.GameAudio)GameAudio.setMuted(mutedInput.checked);
    persistSettings();
  });
  if(reducedMotionInput)reducedMotionInput.addEventListener('change',()=>{
    window.MINE_TYCOON_SETTINGS.reducedMotion=reducedMotionInput.checked;
    persistSettings();
    applyMenuSettings();
  });
  screen.querySelectorAll('[data-menu-close]').forEach(btn=>btn.addEventListener('click',closeModals));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.body.contains(screen))closeModals();
  });

  try{
    if(sessionStorage.getItem(AUTO_START_KEY)==='1'){
      sessionStorage.removeItem(AUTO_START_KEY);
      setTimeout(startGame,120);
    }
  }catch(e){}
  window.MineTycoonMenu={returnToMainMenu,startGame,setMenuReady};
})();

try{
  loadSave();
  initPanels();
  renderShop();
  resize();
  requestAnimationFrame(frame);
}catch(err){
  console.error('Game initialization failed:',err);
}
