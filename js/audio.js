// Centralized game audio: pooled short SFX with shared mute handling.
(function(){
  const SETTINGS_KEY='mineTycoonSettings';
  const SOURCES={
    mineHit:{src:'sounds/mine-hit.ogg',volume:0.85,pool:8,cooldown:38},
    oreCollect:{src:'sounds/ore-collect.wav',volume:0.34,pool:6,cooldown:34},
    buttonPress:{src:'sounds/button-press-2.mp3',volume:0.62,pool:5,cooldown:28},
    critHit:{src:'sounds/crit-hit.mp3',volume:0.9,pool:8,cooldown:0},
    critHit5:{src:'sounds/crit-hit5.mp3',volume:0.96,pool:4,cooldown:0},
    critHit10:{src:'sounds/crit-hit-10.mp3',volume:1,pool:3,cooldown:0},
    purchase:{src:'sounds/purchase.mp3',volume:0.82,pool:5,cooldown:45},
    mapOpenClose:{src:'sounds/mapopenclose.mp3',volume:0.64,pool:4,cooldown:80},
    comboBreaker:{src:'sounds/combobreaker.mp3',volume:0.9,pool:2,cooldown:500},
    backpackOpen:{src:'sounds/backpackopen.mp3',volume:0.82,pool:3,cooldown:120},
    rockBreak1:{src:'sounds/rockbreak-1.mp3',volume:0.82,pool:3,cooldown:90},
    rockBreak2:{src:'sounds/rockbreak-2.mp3',volume:0.82,pool:3,cooldown:90},
    uiHover:{src:'sounds/button-press.wav',volume:0.2,pool:4,cooldown:20},
    uiClick:{src:'sounds/button-press-2.mp3',volume:0.52,pool:4,cooldown:34},
    uiBack:{src:'sounds/mapopenclose.mp3',volume:0.48,pool:3,cooldown:80},
    uiError:{src:'sounds/combobreaker.mp3',volume:0.38,pool:2,cooldown:180},
  };
  const LOOPS={
    oldMine:{src:'sounds/old-mine-ambience.mp3',volume:1},
    dangerousMine:{src:'sounds/dangerous-mine-shaftmp3-52820.mp3',volume:0.72},
    menu:{src:'sounds/startmenuloop-lift-shaft-73002.mp3',volume:0.88},
    loading:{src:'sounds/gameloading.mp3',volume:0.42,loop:false},
    forge:{src:'sounds/forgesoundeffect.mp3',volume:0.78,loop:false},
    tavern:{src:'sounds/bar-ambience.mp3',volume:0.62},
  };
  const state={
    muted:readMuted(),
    unlocked:false,
    pools:{},
    poolIndexes:{},
    lastPlayed:{},
    loops:{},
    loadingDone:false,
    loadingFallbackTimer:null,
  };

  function readMuted(){
    try{
      const settings=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{};
      return !!settings.muted;
    }catch(e){
      return false;
    }
  }

  function persistMuted(){
    window.MINE_TYCOON_SETTINGS={...(window.MINE_TYCOON_SETTINGS||{}),muted:state.muted};
    try{ localStorage.setItem(SETTINGS_KEY,JSON.stringify(window.MINE_TYCOON_SETTINGS)); }catch(e){}
  }

  function makeAudio(src,options={}){
    const audio=new Audio(src);
    audio.preload='auto';
    audio.volume=options.volume||1;
    audio.muted=state.muted;
    return audio;
  }

  function getPool(id){
    if(state.pools[id])return state.pools[id];
    const def=SOURCES[id];
    if(!def)return [];
    state.poolIndexes[id]=0;
    state.pools[id]=Array.from({length:def.pool||1},()=>makeAudio(def.src,{volume:def.volume}));
    return state.pools[id];
  }

  function canPlay(id,ignoreCooldown=false){
    if(state.muted||!state.unlocked)return false;
    const def=SOURCES[id];
    const now=performance.now();
    if(!ignoreCooldown){
      if(def&&def.cooldown&&now-(state.lastPlayed[id]||0)<def.cooldown)return false;
      state.lastPlayed[id]=now;
    }
    return true;
  }

  function play(id,options={}){
    if(!canPlay(id,!!options.ignoreCooldown))return;
    const def=SOURCES[id];
    const pool=getPool(id);
    if(!def||!pool.length)return;
    const idx=state.poolIndexes[id]%pool.length;
    state.poolIndexes[id]=idx+1;
    const audio=pool[idx];
    audio.pause();
    audio.currentTime=0;
    audio.muted=state.muted;
    audio.volume=Math.max(0,Math.min(1,def.volume*(options.volume||1)));
    audio.playbackRate=Math.max(0.6,Math.min(1.8,options.rate||1));
    audio.play().catch(()=>{});
  }

  function unlock(){
    if(state.unlocked)return;
    state.unlocked=true;
    getPool('mineHit');
    getPool('oreCollect');
    getPool('buttonPress');
    getPool('purchase');
    getPool('mapOpenClose');
    getPool('comboBreaker');
    getPool('critHit');
    getPool('critHit5');
    getPool('critHit10');
    getPool('backpackOpen');
    getPool('rockBreak1');
    getPool('rockBreak2');
    getPool('uiHover');
    getPool('uiClick');
    getPool('uiBack');
    getPool('uiError');
    const startScreen=document.getElementById('start-screen');
    if(document.body.classList.contains('game-active')){
      if(typeof currentMineZone==='function'&&currentMineZone().ambience==='dangerousMine')setDangerousMineAmbience(true);
      else setMineAmbience(true);
    }
    else if(startScreen)startMenuAudioSequence();
  }

  function setMuted(muted){
    state.muted=!!muted;
    Object.values(state.pools).flat().forEach(audio=>{ audio.muted=state.muted; });
    Object.values(state.loops).forEach(audio=>{ audio.muted=state.muted; });
    persistMuted();
  }

  function randomRate(base,spread){
    return base+(Math.random()*2-1)*spread;
  }

  function playMineHit(){
    play('mineHit',{volume:0.92+Math.random()*0.16,rate:randomRate(1.02,0.07)});
  }

  function critSoundId(combo){
    const c=Math.max(0,Math.floor(Number(combo)||0));
    if(c>0&&c%10===0)return 'critHit10';
    if(c>0&&c%5===0)return 'critHit5';
    return 'critHit';
  }

  function critRate(combo,auto=false){
    const c=Math.max(1,Math.floor(Number(combo)||1));
    const climb=Math.min(0.54,(c-1)*0.018);
    return randomRate((auto?1.04:0.98)+climb,0.025);
  }

  function playCritHit(options={}){
    const combo=Math.max(1,Math.floor(Number(options.combo)||1));
    const id=critSoundId(combo);
    const milestoneBoost=id==='critHit10'?1.08:id==='critHit5'?1.03:1;
    play(id,{volume:(0.94+Math.random()*0.1)*milestoneBoost,rate:critRate(combo,!!options.auto),ignoreCooldown:true});
  }

  function playOreCollect(options={}){
    play('oreCollect',{volume:options.rare?1.1:0.85,rate:randomRate(options.rare?1.12:0.98,0.06)});
  }

  function playButtonPress(){
    play('buttonPress',{volume:0.85+Math.random()*0.18,rate:randomRate(1.05,0.04)});
  }
  function playPurchase(){
    play('purchase',{volume:0.92+Math.random()*0.1,rate:randomRate(1.02,0.035)});
  }
  function playCritMilestone(){
    play('critHit5',{volume:1,rate:randomRate(1.04,0.025),ignoreCooldown:true});
  }
  function playMapOpenClose(){
    play('mapOpenClose',{volume:0.9+Math.random()*0.08,rate:randomRate(1,0.025)});
  }
  function playBackpackOpen(){
    play('backpackOpen',{volume:1,rate:randomRate(1.02,0.025),ignoreCooldown:true});
  }
  function playRockBreak(){
    play(Math.random()<0.5?'rockBreak1':'rockBreak2',{volume:0.9+Math.random()*0.16,rate:randomRate(1,0.07),ignoreCooldown:true});
  }
  function playComboBreaker(){
    play('comboBreaker',{volume:1,rate:1,ignoreCooldown:true});
  }
  function playUiHover(){
    play('uiHover',{volume:0.9+Math.random()*0.12,rate:randomRate(1.18,0.025)});
  }
  function playUiClick(){
    play('uiClick',{volume:0.9+Math.random()*0.1,rate:randomRate(1.02,0.025)});
  }
  function playUiBack(){
    play('uiBack',{volume:0.9+Math.random()*0.08,rate:randomRate(0.96,0.02)});
  }
  function playUiError(){
    play('uiError',{volume:1,rate:randomRate(0.86,0.025)});
  }

  function finishLoadingSequence(){
    if(state.loadingFallbackTimer){
      clearTimeout(state.loadingFallbackTimer);
      state.loadingFallbackTimer=null;
    }
    state.loadingDone=true;
    stopLoop('loading');
    if(!document.body.classList.contains('game-active'))setMenuLoop(true);
  }

  function getLoop(id){
    if(state.loops[id])return state.loops[id];
    const def=LOOPS[id];
    if(!def)return null;
    const audio=makeAudio(def.src,{volume:def.volume});
    audio.loop=def.loop!==false;
    if(id==='loading'){
      audio.addEventListener('ended',()=>{
        finishLoadingSequence();
      });
    }
    state.loops[id]=audio;
    return audio;
  }
  function playLoop(id){
    if(state.muted||!state.unlocked)return;
    const audio=getLoop(id);
    const def=LOOPS[id];
    if(!audio||!def)return;
    audio.muted=state.muted;
    audio.volume=def.volume;
    return audio.play();
  }
  function stopLoop(id){
    const audio=state.loops[id];
    if(!audio)return;
    audio.pause();
    audio.currentTime=0;
    if(id==='loading')state.loadingDone=true;
  }
  function setMineAmbience(active){
    stopLoop('tavern');
    stopLoop('dangerousMine');
    if(active)playLoop('oldMine');
    else stopLoop('oldMine');
  }
  function setDangerousMineAmbience(active){
    stopLoop('tavern');
    stopLoop('oldMine');
    if(active)playLoop('dangerousMine');
    else stopLoop('dangerousMine');
  }
  function setTavernAmbience(active){
    stopLoop('oldMine');
    stopLoop('dangerousMine');
    if(active)playLoop('tavern');
    else {
      stopLoop('tavern');
      if(document.body.classList.contains('game-active')){
        if(typeof currentMineZone==='function'&&currentMineZone().ambience==='dangerousMine')setDangerousMineAmbience(true);
        else setMineAmbience(true);
      }
    }
  }
  function setMenuLoop(active){
    if(active)stopLoop('loading');
    if(active)playLoop('menu');
    else stopLoop('menu');
  }
  function setLoadingLoop(active){
    if(active){
      if(state.loadingDone){
        setMenuLoop(true);
        return;
      }
      stopLoop('menu');
      const audio=getLoop('loading');
      const playPromise=playLoop('loading');
      const fallbackMs=audio&&Number.isFinite(audio.duration)&&audio.duration>0?(audio.duration*1000)+250:5200;
      if(state.loadingFallbackTimer)clearTimeout(state.loadingFallbackTimer);
      state.loadingFallbackTimer=setTimeout(finishLoadingSequence,fallbackMs);
      if(playPromise&&typeof playPromise.catch==='function'){
        playPromise.catch(()=>finishLoadingSequence());
      }
    }else{
      if(state.loadingFallbackTimer){
        clearTimeout(state.loadingFallbackTimer);
        state.loadingFallbackTimer=null;
      }
      stopLoop('loading');
    }
  }
  function startMenuAudioSequence(){
    if(!state.unlocked||state.muted)return;
    if(state.loadingDone)setMenuLoop(true);
    else setLoadingLoop(true);
  }
  function tryStartLoadingOnOpen(){
    if(state.muted||state.unlocked||state.loadingDone)return;
    const startScreen=document.getElementById('start-screen');
    if(!startScreen||document.body.classList.contains('game-active'))return;
    const audio=getLoop('loading');
    const def=LOOPS.loading;
    if(!audio||!def)return;
    stopLoop('menu');
    audio.muted=false;
    audio.volume=def.volume;
    const playPromise=audio.play();
    if(playPromise&&typeof playPromise.then==='function'){
      playPromise.then(()=>{
        state.unlocked=true;
        const fallbackMs=audio&&Number.isFinite(audio.duration)&&audio.duration>0?(audio.duration*1000)+250:5200;
        if(state.loadingFallbackTimer)clearTimeout(state.loadingFallbackTimer);
        state.loadingFallbackTimer=setTimeout(finishLoadingSequence,fallbackMs);
      }).catch(()=>{
        audio.pause();
        audio.currentTime=0;
      });
    }
  }
  function setForgeLoop(active){
    if(active)playLoop('forge');
    else stopLoop('forge');
  }

  function isPressableUiTarget(target){
    const el=target&&target.closest&&target.closest('button,[role="button"],.map-node');
    if(!el)return false;
    if(el.disabled||el.getAttribute('aria-disabled')==='true')return false;
    return !el.classList.contains('locked');
  }

  document.addEventListener('pointerdown',unlock,{once:true,capture:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryStartLoadingOnOpen,{once:true});
  else setTimeout(tryStartLoadingOnOpen,0);
  document.addEventListener('pointerdown',e=>{
    if(e.target&&e.target.closest&&e.target.closest('#start-screen'))return;
    if(isPressableUiTarget(e.target))playButtonPress();
  },{capture:true});
  document.addEventListener('keydown',unlock,{once:true,capture:true});

  window.GameAudio={
    unlock,
    setMuted,
    playMineHit,
    playCritHit,
    playCritMilestone,
    playOreCollect,
    playRockBreak,
    playButtonPress,
    playBackpackOpen,
    playPurchase,
    playMapOpenClose,
    playComboBreaker,
    playUiHover,
    playUiClick,
    playUiBack,
    playUiError,
    setMineAmbience,
    setDangerousMineAmbience,
    setTavernAmbience,
    setMenuLoop,
    setLoadingLoop,
    startMenuAudioSequence,
    setForgeLoop,
    isLoadingDone:()=>state.loadingDone,
    isMuted:()=>state.muted,
  };
})();
