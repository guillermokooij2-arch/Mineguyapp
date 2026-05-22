// Deep Lift MVP: isolated dungeon test mode with placeholder art and real loop hooks.
(function(){
  const WORLD={w:960,h:540};
  function loadDeepLiftImage(src){ const img=new Image(); img.src=src; return img; }
  const DEEP_LIFT_ASSETS={
    floor:loadDeepLiftImage('images/deep-lift/dungeon-floor-01.png'),
    player:loadDeepLiftImage('images/deep-lift/player-top.png'),
    enemies:{
      spider:loadDeepLiftImage('images/deep-lift/mob-spider.png'),
      skeleton:loadDeepLiftImage('images/deep-lift/mob-bone-guard.png'),
      goblin:loadDeepLiftImage('images/deep-lift/mob-deep-goblin.png'),
      warden:loadDeepLiftImage('images/deep-lift/boss-warden.png'),
    },
  };
  const DUNGEON_COUNT=3;
  const DUNGEON_FLOORS=5;
  const ATTACK_COOLDOWN=0.58;
  const STORY_LINES=[
    'The lift hums a little too evenly.',
    'A brass plate on the wall has letters worn smooth.',
    'The stone briefly reflects more light than it should.',
    'Your pickaxe feels familiar in a way you cannot place.',
    'The chamber is quiet before the Warden moves.',
  ];
  const ENEMY_TYPES=[
    {id:'spider',name:'Cave Spider',icon:'SP',hp:260,speed:104,damage:12,kind:'chase',color:'#c78cff',loot:'boneScrap'},
    {id:'skeleton',name:'Bone Guard',icon:'BG',hp:360,speed:80,damage:16,kind:'chase',color:'#e8e4ce',loot:'boneScrap'},
    {id:'goblin',name:'Deep Goblin',icon:'DG',hp:300,speed:70,damage:13,kind:'shoot',color:'#96f06f',loot:'echoShards'},
  ];
  const BOSS={id:'warden',name:'Lift Warden',icon:'LW',hp:2500,speed:44,damage:22,kind:'boss',color:'#ff7b45',loot:'glitchOre'};
  const MATERIAL_LABELS={echoShards:'Echo Shards',boneScrap:'Bone Scrap',glitchOre:'Glitch Ore'};
  const DUNGEON_ROUTES=[
    {id:1,name:'Old Stone Descent',icon:'I',x:'26%',y:'55%',desc:'Five old mine floors ending in the Lift Warden.',enemies:['Cave Spider','Bone Guard','Deep Goblin','Lift Warden']},
    {id:2,name:'Bone Lantern Halls',icon:'II',x:'53%',y:'33%',desc:'A harder route planned after Dungeon 1 is cleared.',enemies:['Bone Guard','Crawler Pack','Lantern Archer','Bone Captain']},
    {id:3,name:'Black Vein Gate',icon:'III',x:'76%',y:'43%',desc:'A later dungeon route for corrupted ore and boss loot.',enemies:['Deep Goblin','Crystal Stalker','Stone Mask','Gate Warden']},
  ];

  let root,canvas,ctx,startBtn,descendBtn,extractBtn,closeBtn,storyEl,mapEl,floorListEl,routeNameEl,routeDescEl,routeEnemiesEl,routeEnterBtn,floorEl,waveEl,hpPanelEl,hpEl,lootEl,bestEl,critEl,critNumEl,rewardEl,rewardListEl,rewardCloseBtn,cursorEl;
  let initialized=false;
  const keys=new Set();
  const state={
    active:false,
    phase:'map',
    dungeon:1,
    selectedDungeon:1,
    floor:1,
    wave:1,
    wavesRequired:3,
    hp:100,
    maxHp:100,
    critChain:0,
    bestCritChain:0,
    critTimer:0,
    loot:{echoShards:0,boneScrap:0,glitchOre:0},
    player:{x:WORLD.w/2,y:WORLD.h/2,r:15,invuln:0,attackFlash:0,attackCooldown:0},
    aim:{x:WORLD.w/2,y:WORLD.h/2,valid:false},
    enemies:[],
    projectiles:[],
    particles:[],
    messageTimer:0,
  };

  function ensureDeepLiftState(){
    if(!player.deepLift){
      player.deepLift={
        ...DEFAULT_DEEP_LIFT_STATE,
        materials:{...DEFAULT_DEEP_LIFT_STATE.materials},
        storyFlags:{},
      };
    }
    if(!player.deepLift.materials)player.deepLift.materials={...DEFAULT_DEEP_LIFT_STATE.materials};
    if(!player.deepLift.storyFlags)player.deepLift.storyFlags={};
    if(!Array.isArray(player.deepLift.completedDungeons))player.deepLift.completedDungeons=[];
    player.deepLift.unlockedDungeon=clamp(Number(player.deepLift.unlockedDungeon)||1,1,DUNGEON_COUNT);
    player.deepLift.selectedDungeon=clamp(Number(player.deepLift.selectedDungeon)||1,1,player.deepLift.unlockedDungeon);
  }

  function initDeepLift(){
    if(initialized)return;
    initialized=true;
    root=document.getElementById('deep-lift-panel');
    canvas=document.getElementById('deep-lift-canvas');
    if(!root||!canvas)return;
    ctx=canvas.getContext('2d');
    startBtn=document.getElementById('deep-lift-start');
    descendBtn=document.getElementById('deep-lift-descend');
    extractBtn=document.getElementById('deep-lift-extract');
    closeBtn=document.getElementById('deep-lift-close');
    storyEl=document.getElementById('deep-lift-story');
    mapEl=document.getElementById('deep-lift-map');
    floorListEl=document.getElementById('deep-lift-floor-list');
    routeNameEl=document.getElementById('deep-lift-route-name');
    routeDescEl=document.getElementById('deep-lift-route-desc');
    routeEnemiesEl=document.getElementById('deep-lift-route-enemies');
    routeEnterBtn=document.getElementById('deep-lift-route-enter');
    floorEl=document.getElementById('deep-lift-floor');
    waveEl=document.getElementById('deep-lift-wave');
    hpPanelEl=document.getElementById('deep-lift-hp-panel');
    hpEl=document.getElementById('deep-lift-hp');
    lootEl=document.getElementById('deep-lift-loot');
    bestEl=document.getElementById('deep-lift-best');
    critEl=document.getElementById('deep-lift-crit');
    critNumEl=document.getElementById('deep-lift-crit-num');
    rewardEl=document.getElementById('deep-lift-reward');
    rewardListEl=document.getElementById('deep-lift-reward-list');
    rewardCloseBtn=document.getElementById('deep-lift-reward-close');
    cursorEl=document.getElementById('deep-lift-cursor');
    startBtn.addEventListener('click',()=>startFloor());
    if(routeEnterBtn)routeEnterBtn.addEventListener('click',()=>{
      selectDungeon(Number(routeEnterBtn.dataset.deepDungeon)||state.selectedDungeon||1);
      startFloor();
    });
    descendBtn.addEventListener('click',()=>descend());
    extractBtn.addEventListener('click',()=>extractRun());
    closeBtn.addEventListener('click',()=>toggleDeepLift(false));
    if(rewardCloseBtn)rewardCloseBtn.addEventListener('click',()=>{ if(rewardEl)rewardEl.hidden=true; });
    if(floorListEl)floorListEl.addEventListener('click',e=>{
      const btn=e.target.closest('[data-deep-floor]');
      if(!btn||btn.disabled)return;
      selectDungeon(Number(btn.dataset.deepFloor)||1);
    });
    if(floorListEl)floorListEl.addEventListener('mouseover',e=>{
      const btn=e.target.closest('[data-deep-floor]');
      if(!btn)return;
      previewDungeon(Number(btn.dataset.deepFloor)||1);
    });
    root.addEventListener('pointermove',updateAimFromEvent);
    root.addEventListener('pointerleave',()=>{ state.aim.valid=false; if(cursorEl)cursorEl.style.transform='translate(-100px,-100px)'; });
    canvas.addEventListener('pointermove',updateAimFromEvent);
    canvas.addEventListener('pointerleave',()=>{ state.aim.valid=false; });
    canvas.addEventListener('pointerdown',handleAttack);
    window.addEventListener('keydown',e=>{
      if(!state.active)return;
      const key=e.key.toLowerCase();
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();
      keys.add(key);
    });
    window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
    renderDeepLift();
  }

  function toggleDeepLift(open){
    initDeepLift();
    if(!root)return;
    if(open===undefined)open=!root.classList.contains('open');
    if(open){
      ensureDeepLiftState();
      openMapDetail(root);
      root.classList.add('open');
      root.setAttribute('aria-hidden','false');
      document.body.classList.add('deep-lift-active');
      state.active=true;
      state.phase='map';
      state.dungeon=player.deepLift.selectedDungeon;
      state.selectedDungeon=player.deepLift.selectedDungeon;
      state.floor=1;
      state.wave=1;
      state.wavesRequired=wavesRequiredForFloor(state.floor);
      hideStory();
      if(mapEl)mapEl.hidden=false;
      if(rewardEl)rewardEl.hidden=true;
      renderFloorMap();
      renderDeepLiftUi();
      renderDeepLift();
    }else{
      resetDeepLiftUi(true);
      returnToBackpackMap();
    }
  }

  function resetDeepLiftUi(clearRun=false){
    keys.clear();
    state.active=false;
    state.phase='map';
    resetCritChain();
    state.enemies=[];
    state.projectiles=[];
    state.particles=[];
    if(clearRun){
      state.floor=1;
      state.dungeon=1;
      state.selectedDungeon=1;
      state.wave=1;
      state.wavesRequired=wavesRequiredForFloor(1);
      state.hp=state.maxHp;
      state.loot={echoShards:0,boneScrap:0,glitchOre:0};
    }
    if(root){
      root.classList.remove('open');
      root.setAttribute('aria-hidden','true');
    }
    if(mapEl)mapEl.hidden=false;
    if(rewardEl)rewardEl.hidden=true;
    if(cursorEl)cursorEl.style.transform='translate(-100px,-100px)';
    document.body.classList.remove('deep-lift-active');
    renderDeepLiftUi();
  }

  function storyForFloor(floor){
    if(floor%5===0)return STORY_LINES[4];
    if(floor>=4)return STORY_LINES[3];
    if(floor>=3)return STORY_LINES[2];
    if(floor>=2)return STORY_LINES[1];
    return STORY_LINES[0];
  }

  function hideStory(){
    if(storyEl)storyEl.hidden=true;
  }

  function showStory(text){
    if(!storyEl)return;
    storyEl.hidden=false;
    storyEl.innerHTML=`<span>Lift static</span><strong>${text}</strong>`;
    state.messageTimer=3.5;
  }

  function selectDungeon(dungeon){
    ensureDeepLiftState();
    const selected=clamp(dungeon,1,player.deepLift.unlockedDungeon);
    state.selectedDungeon=selected;
    state.dungeon=selected;
    state.floor=1;
    state.wave=1;
    state.wavesRequired=wavesRequiredForFloor(1);
    player.deepLift.selectedDungeon=selected;
    saveGame();
    hideStory();
    renderFloorMap();
    renderRouteIntel(selected);
    renderDeepLiftUi();
    renderDeepLift();
  }

  function previewDungeon(dungeon){
    renderRouteIntel(dungeon);
  }

  function startFloor(){
    if(!state.active)return;
    ensureDeepLiftState();
    if(state.phase==='combat')return;
    player.deepLift.totalRuns=(Number(player.deepLift.totalRuns)||0)+1;
    state.dungeon=clamp(state.selectedDungeon||player.deepLift.selectedDungeon||1,1,player.deepLift.unlockedDungeon);
    state.floor=1;
    state.wave=1;
    state.wavesRequired=wavesRequiredForFloor(state.floor);
    state.hp=state.maxHp;
    resetCritChain();
    state.loot={echoShards:0,boneScrap:0,glitchOre:0};
    if(rewardEl)rewardEl.hidden=true;
    if(mapEl)mapEl.hidden=true;
    hideStory();
    spawnWave();
    saveGame();
  }

  function descend(){
    if(state.phase!=='reward')return;
    if(state.wave<state.wavesRequired){
      state.wave++;
    }else{
      if(state.floor<DUNGEON_FLOORS){
        state.floor++;
        state.wave=1;
        state.wavesRequired=wavesRequiredForFloor(state.floor);
      }else{
        returnToLiftMap();
        return;
      }
    }
    if(mapEl)mapEl.hidden=true;
    hideStory();
    spawnWave();
  }

  function returnToLiftMap(){
    state.phase='map';
    resetCritChain();
    state.enemies=[];
    state.projectiles=[];
    state.particles=[];
    state.selectedDungeon=clamp(player.deepLift.selectedDungeon||player.deepLift.unlockedDungeon||1,1,player.deepLift.unlockedDungeon||1);
    state.dungeon=state.selectedDungeon;
    state.floor=1;
    state.wave=1;
    state.wavesRequired=wavesRequiredForFloor(state.floor);
    hideStory();
    if(mapEl)mapEl.hidden=false;
    renderFloorMap();
    renderDeepLiftUi();
  }

  function unlockCompletedDungeon(dungeon){
    ensureDeepLiftState();
    if(!player.deepLift.completedDungeons.includes(dungeon))player.deepLift.completedDungeons.push(dungeon);
    player.deepLift.unlockedDungeon=clamp(Math.max(player.deepLift.unlockedDungeon||1,dungeon+1),1,DUNGEON_COUNT);
    player.deepLift.selectedDungeon=player.deepLift.unlockedDungeon;
  }

  function renderFloorMap(){
    if(!floorListEl)return;
    ensureDeepLiftState();
    floorListEl.innerHTML=DUNGEON_ROUTES.map(route=>{
      const dungeon=route.id;
      const completed=player.deepLift.completedDungeons.includes(dungeon);
      const unlocked=dungeon<=player.deepLift.unlockedDungeon;
      const selected=dungeon===(state.selectedDungeon||player.deepLift.selectedDungeon||1);
      const status=completed?'Cleared':unlocked?'Open':'Locked';
      const cls=['deep-lift-floor-node',completed?'completed':'',selected?'selected':'',unlocked?'':'locked'].filter(Boolean).join(' ');
      return `<button class="${cls}" type="button" data-deep-floor="${dungeon}" style="--x:${route.x};--y:${route.y}" ${unlocked?'':'disabled'}><span class="deep-lift-route-icon route-${dungeon}" aria-hidden="true"></span><strong>Dungeon ${dungeon}</strong><span>${dungeon===1?'5 floors':status}</span></button>`;
    }).join('');
    renderRouteIntel(state.selectedDungeon||player.deepLift.selectedDungeon||1);
  }

  function renderRouteIntel(dungeon){
    if(!routeNameEl||!routeDescEl||!routeEnemiesEl)return;
    ensureDeepLiftState();
    const route=DUNGEON_ROUTES.find(r=>r.id===dungeon)||DUNGEON_ROUTES[0];
    const unlocked=route.id<=player.deepLift.unlockedDungeon;
    const completed=player.deepLift.completedDungeons.includes(route.id);
    routeNameEl.textContent=route.name;
    routeDescEl.textContent=unlocked
      ? `${route.desc} ${completed?'Cleared. Replay from floor 1 for more loot.':'Run starts at floor 1.'}`
      : `Locked. Clear Dungeon ${route.id-1} to open this route.`;
    routeEnemiesEl.innerHTML=route.enemies.map(enemy=>`<span>${enemy}</span>`).join('');
    if(routeEnterBtn){
      routeEnterBtn.disabled=!unlocked;
      routeEnterBtn.dataset.deepDungeon=String(route.id);
      routeEnterBtn.textContent=unlocked?`Enter Dungeon ${route.id}`:`Dungeon ${route.id} Locked`;
    }
  }

  function extractRun(){
    ensureDeepLiftState();
    const gained=lootTotal();
    const extracted={...state.loot};
    const coins=gained>0?gained*18+state.floor*25+state.wave*10:0;
    const xp=gained>0?gained*6+state.floor*8+state.wave*4:0;
    Object.entries(state.loot).forEach(([key,value])=>{
      player.deepLift.materials[key]=(Number(player.deepLift.materials[key])||0)+value;
    });
    if(gained>0){
      addPlayerXp(xp);
      addPlayerCoins(coins);
    }
    player.deepLift.bestFloor=Math.max(Number(player.deepLift.bestFloor)||0,state.floor);
    player.deepLift.bestDungeon=Math.max(Number(player.deepLift.bestDungeon)||0,state.dungeon);
    saveGame();
    showRewardPopup(extracted,coins,xp);
    state.dungeon=player.deepLift.selectedDungeon||1;
    state.floor=1;
    state.wave=1;
    state.wavesRequired=wavesRequiredForFloor(state.floor);
    state.hp=state.maxHp;
    state.loot={echoShards:0,boneScrap:0,glitchOre:0};
    state.phase='map';
    hideStory();
    if(mapEl)mapEl.hidden=false;
    renderFloorMap();
    renderTravelMap();
    renderDeepLiftUi();
  }

  function wavesRequiredForFloor(floor){
    if(floor%5===0)return 1;
    return Math.min(5,3+Math.floor((floor-1)/3));
  }

  function spawnWave(){
    state.phase='combat';
    state.enemies=[];
    state.projectiles=[];
    state.particles=[];
    state.player.x=WORLD.w/2;
    state.player.y=WORLD.h/2;
    const bossFloor=state.floor%5===0;
    if(bossFloor){
      state.enemies.push(makeEnemy(BOSS,WORLD.w/2,WORLD.h*0.22,1+state.floor*0.18+state.dungeon*0.22));
      const guardCount=Math.min(6,2+Math.floor(state.floor/5));
      for(let i=0;i<guardCount;i++){
        const type=ENEMY_TYPES[i%ENEMY_TYPES.length];
        state.enemies.push(makeEnemy(type,120+i*125,WORLD.h-86,1+state.floor*0.18+state.dungeon*0.2));
      }
    }else{
      const count=Math.min(13,4+state.wave+Math.floor(state.floor*0.85));
      for(let i=0;i<count;i++){
        const type=ENEMY_TYPES[(i+state.floor)%ENEMY_TYPES.length];
        const edge=Math.floor(Math.random()*4);
        const x=edge===0?40:edge===1?WORLD.w-40:80+Math.random()*(WORLD.w-160);
        const y=edge===2?60:edge===3?WORLD.h-60:80+Math.random()*(WORLD.h-160);
        state.enemies.push(makeEnemy(type,x,y,1+state.floor*0.18+state.wave*0.1+state.dungeon*0.16));
      }
    }
    renderDeepLiftUi();
  }

  function makeEnemy(def,x,y,scale){
    const hp=Math.round(def.hp*scale);
    return {
      ...def,
      x,y,
      hp,maxHp:hp,
      r:def.kind==='boss'?46:24,
      weakAngle:Math.random()*Math.PI*2,
      weakSpin:(Math.random()<0.5?-1:1)*(0.8+Math.random()*0.5),
      shootTimer:0.8+Math.random()*1.4,
      moveAngle:Math.random()*Math.PI*2,
      turnRate:def.kind==='boss'?1.1:0.9+Math.random()*1.8,
      drift:(Math.random()<0.5?-1:1)*(0.18+Math.random()*0.55),
      pace:0.78+Math.random()*0.44,
      hesitation:Math.random()*0.35,
      chargeCooldown:def.kind==='chase'?1.15+Math.random()*2.8:0,
      chargeTime:0,
      chargeAngle:0,
      chargeTrail:0,
      hitFlash:0,
    };
  }

  function updateAimFromEvent(e){
    const rect=canvas.getBoundingClientRect();
    state.aim.x=clamp((e.clientX-rect.left)*(WORLD.w/rect.width),0,WORLD.w);
    state.aim.y=clamp((e.clientY-rect.top)*(WORLD.h/rect.height),0,WORLD.h);
    state.aim.valid=true;
    if(cursorEl){
      const rootRect=root.getBoundingClientRect();
      cursorEl.style.transform=`translate(${e.clientX-rootRect.left-11}px,${e.clientY-rootRect.top-11}px)`;
      cursorEl.classList.toggle('cooldown',state.player.attackCooldown>0);
    }
  }

  function handleAttack(e){
    if(!state.active||state.phase!=='combat')return;
    e.preventDefault();
    e.stopPropagation();
    if(state.player.attackCooldown>0)return;
    updateAimFromEvent(e);
    const x=state.aim.x;
    const y=state.aim.y;
    const target=findDeepLiftAttackTarget(x,y);
    if(!target.enemy){
      if(distance(x,y,state.player.x,state.player.y)<state.player.r*1.85)return;
      state.player.attackCooldown=ATTACK_COOLDOWN;
      resetCritChain();
      burst(x,y,'MISS','#77808f',5);
      return;
    }
    state.player.attackCooldown=ATTACK_COOLDOWN;
    const tier=pickaxeTierLevel();
    if(target.crit)noteCritHit();
    else resetCritChain();
    const dmg=deepLiftAttackDamage(target.crit,tier);
    target.enemy.hp-=dmg;
    target.enemy.hitFlash=0.16;
    state.player.attackFlash=0.12;
    burst(x,y,target.crit?'CRIT':'GLANCE',target.crit?'#ffe66f':'#9eb3c8',target.crit?14:5);
    if(window.GameAudio){
      if(target.crit)GameAudio.playCritHit({combo:Math.max(1,state.floor)});
      else GameAudio.playMineHit();
    }
    if(target.enemy.hp<=0)killEnemy(target.enemy);
  }

  function findDeepLiftAttackTarget(x,y){
    let enemy=null;
    let bestDist=Infinity;
    let crit=false;
    for(const candidate of state.enemies){
      const weak=enemyWeakPoint(candidate);
      const weakDist=distance(x,y,weak.x,weak.y);
      const bodyDist=distance(x,y,candidate.x,candidate.y);
      if(weakDist<candidate.r*0.42&&weakDist<bestDist){
        enemy=candidate;
        bestDist=weakDist;
        crit=true;
      }else if(bodyDist<candidate.r&&bodyDist<bestDist){
        enemy=candidate;
        bestDist=bodyDist;
        crit=false;
      }
    }
    return {enemy,crit};
  }

  function deepLiftAttackDamage(crit,tier){
    const critMult=crit?1+Math.min(1.25,Math.max(0,state.critChain-1)*0.08):1;
    const baseDamage=(crit?92:7)+tier*(crit?14:1);
    const powerDamage=itemBonus('power')*(crit?2.4:0.4);
    const floorDamage=state.floor*(crit?3:0.6);
    const waveDamage=state.wave*(crit?2:0.4);
    return Math.round((baseDamage+powerDamage+floorDamage+waveDamage)*critMult);
  }

  function killEnemy(enemy){
    const idx=state.enemies.indexOf(enemy);
    if(idx>=0)state.enemies.splice(idx,1);
    const amount=enemy.kind==='boss'?2+Math.floor(state.floor/5):1+(Math.random()<0.25?1:0);
    state.loot[enemy.loot]=(state.loot[enemy.loot]||0)+amount;
    burst(enemy.x,enemy.y,`+${amount} ${MATERIAL_LABELS[enemy.loot]}`,'#8dffcc',16);
    if(state.enemies.length===0)completeFloor();
  }

  function noteCritHit(){
    player.stats={...DEFAULT_STATS,...(player.stats||{})};
    player.stats.totalCritStrikes=(Number(player.stats.totalCritStrikes)||0)+1;
    state.critChain++;
    state.bestCritChain=Math.max(state.bestCritChain,state.critChain);
    state.critTimer=2.2;
  }

  function resetCritChain(){
    state.critChain=0;
    state.critTimer=0;
    if(critEl)critEl.hidden=true;
  }

  function completeFloor(){
    ensureDeepLiftState();
    state.phase='reward';
    resetCritChain();
    state.hp=Math.min(state.maxHp,state.hp+Math.max(6,14-state.wave));
    const finalWave=state.wave>=state.wavesRequired;
    const dungeonCleared=finalWave&&state.floor>=DUNGEON_FLOORS;
    if(dungeonCleared)unlockCompletedDungeon(state.dungeon);
    player.deepLift.bestFloor=Math.max(Number(player.deepLift.bestFloor)||0,state.floor);
    player.deepLift.bestDungeon=Math.max(Number(player.deepLift.bestDungeon)||0,state.dungeon);
    if(dungeonCleared&&!player.deepLift.storyFlags.firstDungeonClear){
      player.deepLift.storyFlags.firstDungeonClear=true;
      showStory('Dungeon cleared. The next dungeon path can be added from here.');
    }else if(dungeonCleared){
      showStory('Boss cleared. Extract your haul before the lift shifts again.');
    }else if(state.floor>=1&&!player.deepLift.storyFlags.firstClear){
      player.deepLift.storyFlags.firstClear=true;
      hideStory();
    }else{
      hideStory();
    }
    saveGame();
    renderDeepLiftUi();
    renderTravelMap();
  }

  function updateDeepLift(dt){
    if(!state.active||!ctx)return;
    const step=Math.min(0.05,dt||0.016);
    if(state.phase==='combat'){
      updatePlayer(step);
      updateEnemies(step);
      updateProjectiles(step);
      if(state.hp<=0)failRun();
    }else if(state.phase==='reward'||state.phase==='failed'){
      updatePlayer(step);
    }
    if(state.critTimer>0){
      state.critTimer=Math.max(0,state.critTimer-step);
      if(state.critTimer<=0)resetCritChain();
    }
    updateParticles(step);
    if(state.messageTimer>0)state.messageTimer=Math.max(0,state.messageTimer-step);
    if(cursorEl)cursorEl.classList.toggle('cooldown',state.player.attackCooldown>0);
    renderDeepLiftUi();
    renderDeepLift();
  }

  function updatePlayer(dt){
    let dx=0,dy=0;
    if(keys.has('w')||keys.has('arrowup'))dy-=1;
    if(keys.has('s')||keys.has('arrowdown'))dy+=1;
    if(keys.has('a')||keys.has('arrowleft'))dx-=1;
    if(keys.has('d')||keys.has('arrowright'))dx+=1;
    const len=Math.hypot(dx,dy)||1;
    const speed=178*(1+Math.min(0.35,itemBonus('swingSpeed')*0.015));
    state.player.x=clamp(state.player.x+(dx/len)*speed*dt,28,WORLD.w-28);
    state.player.y=clamp(state.player.y+(dy/len)*speed*dt,58,WORLD.h-38);
    state.player.invuln=Math.max(0,state.player.invuln-dt);
    state.player.attackFlash=Math.max(0,state.player.attackFlash-dt);
    state.player.attackCooldown=Math.max(0,state.player.attackCooldown-dt);
  }

  function updateEnemies(dt){
    for(const enemy of state.enemies){
      enemy.weakAngle+=enemy.weakSpin*dt;
      enemy.hitFlash=Math.max(0,enemy.hitFlash-dt);
      const dx=state.player.x-enemy.x,dy=state.player.y-enemy.y;
      const d=Math.hypot(dx,dy)||1;
      if(enemy.kind==='shoot'&&d<240){
        enemy.x-=dx/d*enemy.speed*0.35*dt;
        enemy.y-=dy/d*enemy.speed*0.35*dt;
      }else if(enemy.kind==='chase'&&updateEnemyCharge(enemy,dt,d,dx,dy)){
        // Charging enemies commit to a straight burst, so the player can dodge the lane.
      }else{
        const desired=Math.atan2(dy,dx)+Math.sin(performance.now()*0.0015+enemy.x*0.01)*enemy.drift;
        let delta=desired-enemy.moveAngle;
        while(delta>Math.PI)delta-=Math.PI*2;
        while(delta<-Math.PI)delta+=Math.PI*2;
        const turnStep=Math.sign(delta)*Math.min(Math.abs(delta),enemy.turnRate*dt);
        enemy.moveAngle+=turnStep;
        const pace=(enemy.kind==='boss'?0.42:enemy.pace)*(1-enemy.hesitation*0.35);
        enemy.x+=Math.cos(enemy.moveAngle)*enemy.speed*pace*dt;
        enemy.y+=Math.sin(enemy.moveAngle)*enemy.speed*pace*dt;
        enemy.x=clamp(enemy.x,24,WORLD.w-24);
        enemy.y=clamp(enemy.y,54,WORLD.h-34);
      }
      if(d<enemy.r+state.player.r)damagePlayer(enemy.damage);
      enemy.shootTimer-=dt;
      if((enemy.kind==='shoot'||enemy.kind==='boss')&&enemy.shootTimer<=0){
        shootAtPlayer(enemy);
        enemy.shootTimer=enemy.kind==='boss'?0.65:1.55;
      }
    }
  }

  function updateEnemyCharge(enemy,dt,d,dx,dy){
    enemy.chargeCooldown=Math.max(0,(enemy.chargeCooldown||0)-dt);
    if(enemy.chargeTime>0){
      enemy.chargeTime=Math.max(0,enemy.chargeTime-dt);
      enemy.chargeTrail=Math.max(0,(enemy.chargeTrail||0)-dt);
      const speed=enemy.speed*(2.45+enemy.pace*0.45);
      enemy.x+=Math.cos(enemy.chargeAngle)*speed*dt;
      enemy.y+=Math.sin(enemy.chargeAngle)*speed*dt;
      enemy.x=clamp(enemy.x,24,WORLD.w-24);
      enemy.y=clamp(enemy.y,54,WORLD.h-34);
      if(enemy.chargeTrail<=0){
        enemy.chargeTrail=0.045;
        state.particles.push({
          x:enemy.x-Math.cos(enemy.chargeAngle)*enemy.r*0.9,
          y:enemy.y-Math.sin(enemy.chargeAngle)*enemy.r*0.9,
          vx:(Math.random()-0.5)*24,
          vy:(Math.random()-0.5)*24,
          life:0.22,
          color:'rgba(255,220,120,.9)',
        });
      }
      return true;
    }
    if(enemy.chargeCooldown<=0&&d>92&&d<390&&Math.random()<0.72){
      enemy.chargeAngle=Math.atan2(dy,dx)+(Math.random()-0.5)*0.22;
      enemy.moveAngle=enemy.chargeAngle;
      enemy.chargeTime=0.28+Math.random()*0.18;
      enemy.chargeCooldown=2.15+Math.random()*2.25;
      burst(enemy.x,enemy.y,'CHARGE','#ffd46f',6);
      return true;
    }
    return false;
  }

  function shootAtPlayer(enemy){
    const shots=enemy.kind==='boss'?5:1;
    const base=Math.atan2(state.player.y-enemy.y,state.player.x-enemy.x);
    for(let i=0;i<shots;i++){
      const spread=(i-(shots-1)/2)*0.22;
      const a=base+spread;
      state.projectiles.push({
        x:enemy.x,y:enemy.y,
        vx:Math.cos(a)*(enemy.kind==='boss'?170:145),
        vy:Math.sin(a)*(enemy.kind==='boss'?170:145),
        r:enemy.kind==='boss'?7:5,
        damage:enemy.kind==='boss'?12:8,
        life:3.2,
      });
    }
  }

  function updateProjectiles(dt){
    state.projectiles=state.projectiles.filter(p=>{
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.life-=dt;
      if(distance(p.x,p.y,state.player.x,state.player.y)<p.r+state.player.r){
        damagePlayer(p.damage);
        return false;
      }
      return p.life>0&&p.x>-30&&p.x<WORLD.w+30&&p.y>-30&&p.y<WORLD.h+30;
    });
  }

  function damagePlayer(amount){
    if(state.player.invuln>0)return;
    state.hp=Math.max(0,state.hp-amount);
    state.player.invuln=0.75;
    resetCritChain();
    burst(state.player.x,state.player.y,`-${amount}`,'#ff6464',10);
    if(window.GameAudio&&GameAudio.playUiError)GameAudio.playUiError();
  }

  function failRun(){
    const kept={};
    Object.entries(state.loot).forEach(([key,value])=>kept[key]=Math.floor(value*0.5));
    state.loot=kept;
    state.phase='failed';
    resetCritChain();
    state.enemies=[];
    state.projectiles=[];
    state.hp=1;
    showStory('Run failed. Extract to keep half of the current haul.');
    renderDeepLiftUi();
  }

  function showRewardPopup(materials,coins,xp){
    if(!rewardEl||!rewardListEl)return;
    const rows=Object.entries(materials)
      .filter(([,value])=>Number(value)>0)
      .map(([key,value])=>`<div class="deep-lift-reward-row"><span>${MATERIAL_LABELS[key]||key}</span><strong>${value}</strong></div>`);
    if(coins>0)rows.push(`<div class="deep-lift-reward-row"><span>Coins</span><strong>${coins}</strong></div>`);
    if(xp>0)rows.push(`<div class="deep-lift-reward-row"><span>XP</span><strong>${xp}</strong></div>`);
    rewardListEl.innerHTML=rows.length?rows.join(''):'<div class="deep-lift-reward-row"><span>No haul secured</span><strong>0</strong></div>';
    rewardEl.hidden=false;
  }

  function updateParticles(dt){
    state.particles=state.particles.filter(p=>{
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.life-=dt;
      return p.life>0;
    });
  }

  function burst(x,y,label,color,count){
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2;
      const s=30+Math.random()*120;
      state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.45+Math.random()*0.45,color});
    }
    if(label)state.particles.push({x,y:y-18,vx:0,vy:-36,life:0.9,color,label});
  }

  function renderDeepLift(){
    if(!ctx)return;
    ctx.clearRect(0,0,WORLD.w,WORLD.h);
    drawBackground();
    if(state.phase==='map')drawLiftMap();
    state.projectiles.forEach(drawProjectile);
    state.enemies.forEach(drawEnemy);
    if(state.phase!=='map')drawPlayer();
    state.particles.forEach(drawParticle);
    drawAimDot();
  }

  function drawBackground(){
    if(DEEP_LIFT_ASSETS.floor.complete&&DEEP_LIFT_ASSETS.floor.naturalWidth){
      ctx.drawImage(DEEP_LIFT_ASSETS.floor,0,0,WORLD.w,WORLD.h);
      ctx.fillStyle='rgba(0,0,0,.18)';
      ctx.fillRect(0,0,WORLD.w,WORLD.h);
    }else{
      ctx.fillStyle='#07060c';
      ctx.fillRect(0,0,WORLD.w,WORLD.h);
    }
    ctx.strokeStyle='rgba(80,210,255,.08)';
    ctx.lineWidth=1;
    for(let x=0;x<WORLD.w;x+=32){
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WORLD.h);ctx.stroke();
    }
    for(let y=0;y<WORLD.h;y+=32){
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WORLD.w,y);ctx.stroke();
    }
    ctx.fillStyle='rgba(255,160,76,.08)';
    ctx.fillRect(0,WORLD.h-46,WORLD.w,46);
    ctx.fillStyle='rgba(120,255,214,.06)';
    for(let i=0;i<8;i++){
      const x=(i*137+state.floor*29+state.wave*19)%WORLD.w;
      ctx.fillRect(x,90+(i%5)*70,4,38);
    }
  }

  function drawLiftMap(){
    ctx.save();
    ctx.textAlign='center';
    ctx.fillStyle='rgba(255,230,180,.82)';
    ctx.font='700 28px Georgia';
    ctx.fillText('DEEP LIFT',WORLD.w/2,WORLD.h/2-26);
    ctx.fillStyle='rgba(129,242,255,.72)';
    ctx.font='16px Georgia';
    ctx.fillText('Choose an unlocked dungeon route.',WORLD.w/2,WORLD.h/2+8);
    ctx.restore();
  }

  function drawPlayer(){
    const p=state.player;
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.globalAlpha=p.invuln>0&&Math.floor(p.invuln*18)%2===0?0.45:1;
    const img=DEEP_LIFT_ASSETS.player;
    if(img.complete&&img.naturalWidth){
      const size=p.r*4.2;
      ctx.filter=p.attackFlash>0?'brightness(1.55)':'drop-shadow(0 10px 8px rgba(0,0,0,.42))';
      ctx.drawImage(img,-size/2,-size/2,size,size);
      ctx.filter='none';
      ctx.restore();
      return;
    }
    ctx.fillStyle=p.attackFlash>0?'#fff2a0':'#6ee7ff';
    ctx.beginPath();
    ctx.arc(0,0,p.r,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#101018';
    ctx.font='22px serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('⛏️',0,1);
    ctx.restore();
  }

  function drawEnemy(enemy){
    const weak=enemyWeakPoint(enemy);
    const img=DEEP_LIFT_ASSETS.enemies[enemy.id];
    ctx.save();
    ctx.translate(enemy.x,enemy.y);
    if(enemy.chargeTime>0){
      ctx.strokeStyle='rgba(255,216,110,.78)';
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.moveTo(-Math.cos(enemy.chargeAngle)*enemy.r*1.7,-Math.sin(enemy.chargeAngle)*enemy.r*1.7);
      ctx.lineTo(-Math.cos(enemy.chargeAngle)*enemy.r*3.2,-Math.sin(enemy.chargeAngle)*enemy.r*3.2);
      ctx.stroke();
    }
    if(img&&img.complete&&img.naturalWidth){
      const size=enemy.r*(enemy.kind==='boss'?4.1:3.65);
      ctx.filter=enemy.hitFlash>0?'brightness(1.75)':'drop-shadow(0 10px 8px rgba(0,0,0,.42))';
      ctx.drawImage(img,-size/2,-size/2,size,size);
      ctx.filter='none';
    }else{
      ctx.fillStyle=enemy.hitFlash>0?'#fff7d0':enemy.color;
      ctx.beginPath();
      ctx.arc(0,0,enemy.r,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#08070d';
      ctx.font=`${enemy.kind==='boss'?38:25}px serif`;
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(enemy.icon,0,1);
    }
    ctx.restore();
    ctx.fillStyle='rgba(0,0,0,.55)';
    ctx.fillRect(enemy.x-enemy.r,enemy.y-enemy.r-16,enemy.r*2,5);
    ctx.fillStyle='#ff5d57';
    ctx.fillRect(enemy.x-enemy.r,enemy.y-enemy.r-16,enemy.r*2*(enemy.hp/enemy.maxHp),5);
    ctx.strokeStyle='#ffe66f';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(weak.x,weak.y,enemy.r*0.22,0,Math.PI*2);
    ctx.stroke();
  }

  function drawProjectile(p){
    ctx.fillStyle='#ff785f';
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  }

  function drawParticle(p){
    const alpha=clamp(p.life,0,1);
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.fillStyle=p.color;
    if(p.label){
      ctx.font='700 15px Georgia';
      ctx.textAlign='center';
      ctx.fillText(p.label,p.x,p.y);
    }else{
      ctx.beginPath();
      ctx.arc(p.x,p.y,3,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAimDot(){
    if(!state.aim.valid||state.phase!=='combat')return;
    const x=state.aim.x,y=state.aim.y;
    const weapon=typeof activePickaxeImage==='function'?activePickaxeImage():null;
    if(weapon&&weapon.complete&&weapon.naturalWidth){
      ctx.save();
      ctx.globalAlpha=state.player.attackCooldown>0?0.32:0.62;
      ctx.translate(x+24,y+24);
      ctx.rotate(-0.72);
      ctx.drawImage(weapon,-8,-44,18,54);
      ctx.restore();
    }
    ctx.save();
    const ready=state.player.attackCooldown<=0;
    ctx.strokeStyle=ready?'rgba(255,238,116,.9)':'rgba(160,170,180,.65)';
    ctx.fillStyle=ready?'#ffec64':'#9aa8b8';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x-10,y);ctx.lineTo(x-5,y);
    ctx.moveTo(x+5,y);ctx.lineTo(x+10,y);
    ctx.moveTo(x,y-10);ctx.lineTo(x,y-5);
    ctx.moveTo(x,y+5);ctx.lineTo(x,y+10);
    ctx.stroke();
    ctx.restore();
  }

  function enemyWeakPoint(enemy){
    const radius=enemy.r*0.72;
    return {
      x:enemy.x+Math.cos(enemy.weakAngle)*radius,
      y:enemy.y+Math.sin(enemy.weakAngle)*radius,
    };
  }

  function renderDeepLiftUi(){
    if(!floorEl)return;
    ensureDeepLiftState();
    if(root)root.dataset.deepPhase=state.phase;
    floorEl.textContent=state.floor;
    if(waveEl)waveEl.textContent=`${state.wave}/${state.wavesRequired}`;
    hpEl.textContent=Math.max(0,Math.round(state.hp));
    if(hpPanelEl)hpPanelEl.style.setProperty('--hp-pct',`${Math.round(clamp(state.hp/state.maxHp,0,1)*100)}%`);
    lootEl.textContent=lootTotal();
    bestEl.textContent=player.deepLift.bestFloor||0;
    if(critEl&&critNumEl){
      const active=state.phase==='combat'&&state.critChain>1;
      critEl.hidden=!active;
      critNumEl.textContent=state.critChain;
      if(active)positionCritBadge();
    }
    if(startBtn){
      startBtn.hidden=true;
      startBtn.textContent=`Enter Dungeon ${state.selectedDungeon||state.dungeon}`;
    }
    if(descendBtn){
      const dungeonCleared=state.wave>=state.wavesRequired&&state.floor>=DUNGEON_FLOORS;
      descendBtn.hidden=state.phase!=='reward'||dungeonCleared;
      descendBtn.textContent=state.wave<state.wavesRequired?'Next Wave':'Next Floor';
    }
    if(extractBtn){
      extractBtn.hidden=state.phase==='map';
      extractBtn.disabled=state.phase==='combat';
    }
  }

  function positionCritBadge(){
    if(!critEl||!canvas||!root)return;
    const canvasRect=canvas.getBoundingClientRect();
    const rootRect=root.getBoundingClientRect();
    const px=canvasRect.left-rootRect.left+(state.player.x/WORLD.w)*canvasRect.width;
    const py=canvasRect.top-rootRect.top+(state.player.y/WORLD.h)*canvasRect.height;
    const playerLift=Math.max(40,state.player.r*(canvasRect.height/WORLD.h)*2.1);
    critEl.style.left=`${px}px`;
    critEl.style.top=`${py-playerLift}px`;
  }

  function lootTotal(){
    return Object.values(state.loot).reduce((sum,value)=>sum+(Number(value)||0),0);
  }

  function distance(ax,ay,bx,by){
    return Math.hypot(ax-bx,ay-by);
  }

  window.initDeepLift=initDeepLift;
  window.toggleDeepLift=toggleDeepLift;
  window.updateDeepLift=updateDeepLift;
  window.resetDeepLiftUi=resetDeepLiftUi;
})();
