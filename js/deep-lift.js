// Deep Lift MVP: isolated dungeon test mode with placeholder art and real loop hooks.
(function(){
  const WORLD={w:960,h:540};
  function loadDeepLiftImage(src){ const img=new Image(); img.src=src; return img; }
  const DEEP_LIFT_ASSETS={
    floor:loadDeepLiftImage('images/deep-lift/dungeon-floor-01.png'),
    player:loadDeepLiftImage('images/deep-lift/dungeon1/actors/player/player-top.png'),
    enemies:{
      spider:loadDeepLiftImage('images/deep-lift/dungeon1/actors/spider/spider-static.png'),
      skeleton:loadDeepLiftImage('images/deep-lift/dungeon1/actors/skeleton/skeleton-static.png'),
      goblin:loadDeepLiftImage('images/deep-lift/dungeon1/actors/goblin/goblin-static.png'),
      warden:loadDeepLiftImage('images/deep-lift/dungeon1/actors/boss/boss-static.png'),
    },
    staticEnemies:{
      spider:loadDeepLiftImage('images/deep-lift/dungeon1/actors/spider/spider-static.png'),
      skeleton:loadDeepLiftImage('images/deep-lift/dungeon1/actors/skeleton/skeleton-static.png'),
      goblin:loadDeepLiftImage('images/deep-lift/dungeon1/actors/goblin/goblin-static.png'),
      warden:loadDeepLiftImage('images/deep-lift/dungeon1/actors/boss/boss-static.png'),
    },
    authoredEnemies:{},
    movementEnemies:{},
    compactEnemies:{
      skeleton:loadDeepLiftImage('images/deep-lift/dungeon1/actors/skeleton/skeleton-animations.png'),
    },
  };
  const DUNGEON_COUNT=3;
  const DUNGEON_FLOORS=5;
  const ATTACK_COOLDOWN=0.58;
  const PLAYER_ATTACK_ANIM_TIME=0.34;
  const SPRITE_FRAME={w:128,h:128,cols:6,dirs:['south','southwest','west','northwest','north','northeast','east','southeast'],states:{idle:0,walk:1,attack:2,charge:2,hurt:3,dead:4}};
  const ENEMY_SPRITE_FRAME={w:128,h:128,cols:6,dirs:SPRITE_FRAME.dirs,states:{idle:0,run:1,walk:1,backwalk:2,charge:3,strike:4,attack:4,shoot:5,hurt:6,dead:7}};
  const ENEMY_AUTHORED_FRAME={w:128,h:128,cols:6};
  const ENEMY_AUTHORED_ROWS={
    ground:{rows:24,idle:0,run:1,charge:9,action:17,dead:21,height:3072},
    boss:{rows:9,idle:0,floatMove:1,action:2,dead:6,height:1152},
  };
  const SKELETON_COMPACT_FRAME={
    w:128,
    h:128,
    cols:3,
    rows:27,
    height:3456,
    dirs:SPRITE_FRAME.dirs,
    states:{run:0,charge:8,strike:16,dead:24},
    frames:{run:3,charge:3,strike:2,dead:1},
    deadRows:3,
  };
  const CARDINAL_ACTION_ROWS={south:0,west:1,north:2,east:3};
  const ANGLE_OCTANT_TO_SPRITE_DIR=[6,7,0,1,2,3,4,5];
  const PLAYER_IDLE_FRAME_OFFSETS={
    south:[[-2.25,0.42],[-0.25,0.42],[5.25,-2.08],[-0.25,0.42],[-2.25,0.42],[-0.25,0.42]],
    southwest:[[-1.44,1.4],[1.62,1.38],[5.53,0.02],[6.44,-1.46],[6.98,-0.39],[12.34,-0.65]],
    west:[[-15.25,-0.1],[-9.25,-0.1],[-4.25,-0.1],[3.25,0.4],[9.75,-0.1],[15.75,-0.1]],
    north:[[-9.25,-0.25],[-5.25,-0.25],[-0.25,0.25],[-0.25,0.25],[5.75,0.25],[9.25,-0.25]],
    east:[[-7.67,0.25],[-5.67,0.25],[-3.17,-0.25],[0.83,0.25],[6.33,-0.25],[9.33,-0.25]],
  };
  const PLAYER_WALK_FRAME_OFFSETS={
    south:[[-12.54,0.06],[-9.18,0.75],[-3.65,-0.01],[2.04,-0.58],[8.82,0.02],[14.51,-0.23]],
    southwest:[[-16.15,-0.12],[-6.39,-0.15],[-0.93,0.26],[2.14,-0.53],[7.1,-0.28],[14.22,0.83]],
    west:[[-10.84,0.28],[-5.05,0.17],[-1.96,-0.09],[3.77,0.01],[4.51,-0.19],[9.57,-0.19]],
    northwest:[[-10.62,0.85],[-6.9,-0.34],[-0.65,-0.24],[3.21,-0.64],[4.79,-0.66],[10.18,1.03]],
    north:[[-7.41,0.42],[-6.74,0.88],[-5.15,0.04],[0.11,-0.22],[5.05,-1.17],[14.14,0.04]],
    northeast:[[10.62,0.85],[6.9,-0.34],[0.65,-0.24],[-3.21,-0.64],[-4.79,-0.66],[-10.18,1.03]],
    east:[[10.84,0.28],[5.05,0.17],[1.96,-0.09],[-3.77,0.01],[-4.51,-0.19],[-9.57,-0.19]],
    southeast:[[-11.09,3.28],[-7.2,0.9],[-3.85,-0.45],[2.86,-0.85],[8.88,-2.26],[10.4,-0.62]],
  };
  const PLAYER_SOURCE_MASKS={
    idle:{southwest:[{},{right:10},{},{right:16},{right:14},{}]},
    walk:{southwest:[{right:14},{right:6},{},{right:16},{right:18},{}]},
  };
  const ENEMY_SPRITES={
    spider:{kind:'melee',fallbacks:{run:'walk',strike:'attack',shoot:'attack',backwalk:'walk'},fps:{idle:5,run:12,walk:10,backwalk:8,charge:14,strike:16,hurt:14,dead:1},strike:{rangePad:8,duration:0.46,hitAt:0.24,recovery:0.38}},
    skeleton:{kind:'melee',fallbacks:{run:'walk',strike:'attack',shoot:'attack',backwalk:'walk'},fps:{idle:5,run:10,walk:9,backwalk:7,charge:13,strike:15,hurt:13,dead:1},strike:{rangePad:11,duration:0.52,hitAt:0.29,recovery:0.48}},
    goblin:{kind:'projectile',fallbacks:{run:'walk',backwalk:'walk',shoot:'attack',strike:'attack',charge:'run'},fps:{idle:5,run:11,walk:9,backwalk:8,shoot:14,hurt:13,dead:1},shoot:{duration:0.42,releaseAt:0.24,recovery:0.58}},
    warden:{kind:'hybrid',fallbacks:{run:'walk',backwalk:'walk',strike:'attack',shoot:'attack'},fps:{idle:4,run:8,walk:7,backwalk:6,charge:10,strike:12,shoot:11,hurt:10,dead:1},strike:{rangePad:18,duration:0.62,hitAt:0.34,recovery:0.58},shoot:{duration:0.58,releaseAt:0.32,recovery:0.62}},
  };
  const MOVEMENT_CODES=new Map([
    ['KeyW','up'],['ArrowUp','up'],
    ['KeyS','down'],['ArrowDown','down'],
    ['KeyA','left'],['ArrowLeft','left'],
    ['KeyD','right'],['ArrowRight','right'],
  ]);
  const MOVEMENT_KEYS=new Map([
    ['w','up'],['arrowup','up'],
    ['s','down'],['arrowdown','down'],
    ['a','left'],['arrowleft','left'],
    ['d','right'],['arrowright','right'],
  ]);
  const MOVEMENT_AXIS={left:'x',right:'x',up:'y',down:'y'};
  const MOVEMENT_OPPOSITE={left:'right',right:'left',up:'down',down:'up'};
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

  let root,canvas,ctx,startBtn,descendBtn,extractBtn,inventoryBtn,weaponSwitchBtn,closeBtn,storyEl,mapEl,floorListEl,routeNameEl,routeDescEl,routeEnemiesEl,routeEnterBtn,floorEl,waveEl,hpPanelEl,hpEl,lootEl,bestEl,critEl,critNumEl,rewardEl,rewardListEl,rewardCloseBtn,cursorEl,weaponHelpEl,deepLiftBackpackBtn,statsPanelEl,statsListEl,statsCloseBtn;
  let initialized=false;
  const movementKeys=new Set();
  const movementPriority={x:null,y:null};
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
    weaponMode:'melee',
    critChain:0,
    bestCritChain:0,
    critTimer:0,
    loot:{echoShards:0,boneScrap:0,glitchOre:0},
    itemLoot:[],
    player:{x:WORLD.w/2,y:WORLD.h/2,r:15,invuln:0,attackFlash:0,attackCooldown:0,attackTimer:0,hurtTimer:0,dead:false,facingAngle:Math.PI/2,animState:'idle',animTime:0},
    aim:{x:WORLD.w/2,y:WORLD.h/2,valid:false},
    enemies:[],
    deadEnemies:[],
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
    inventoryBtn=document.getElementById('deep-lift-inventory');
    weaponSwitchBtn=document.getElementById('deep-lift-weapon-switch');
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
    weaponHelpEl=document.getElementById('deep-lift-weapon-help');
    deepLiftBackpackBtn=document.getElementById('deep-lift-backpack');
    statsPanelEl=document.getElementById('deep-lift-stats-popover');
    statsListEl=document.getElementById('deep-lift-stats-list');
    statsCloseBtn=document.getElementById('deep-lift-stats-close');
    startBtn.addEventListener('click',()=>startFloor());
    if(routeEnterBtn)routeEnterBtn.addEventListener('click',()=>{
      selectDungeon(Number(routeEnterBtn.dataset.deepDungeon)||state.selectedDungeon||1);
      startFloor();
    });
    descendBtn.addEventListener('click',()=>descend());
    extractBtn.addEventListener('click',()=>extractRun());
    if(inventoryBtn)inventoryBtn.addEventListener('click',()=>openBetweenWaveInventory());
    if(deepLiftBackpackBtn)deepLiftBackpackBtn.addEventListener('click',()=>openBetweenWaveInventory());
    if(hpPanelEl){
      hpPanelEl.addEventListener('click',()=>openDungeonStatsPanel());
      hpPanelEl.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){
          e.preventDefault();
          openDungeonStatsPanel();
        }
      });
    }
    if(statsCloseBtn)statsCloseBtn.addEventListener('click',()=>closeDungeonStatsPanel());
    if(weaponSwitchBtn)weaponSwitchBtn.addEventListener('click',()=>switchWeaponMode());
    closeBtn.addEventListener('click',()=>toggleDeepLift(false));
    if(rewardCloseBtn)rewardCloseBtn.addEventListener('click',()=>{ if(rewardEl)rewardEl.hidden=true; });
    if(rewardEl)rewardEl.addEventListener('click',e=>{ if(e.target===rewardEl)rewardEl.hidden=true; });
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
    canvas.addEventListener('pointerdown',e=>{
      e.preventDefault();
      handleAttack(e);
    });
    window.addEventListener('keydown',e=>{
      if(!state.active)return;
      const key=String(e.key||'').toLowerCase();
      const movement=movementFromKeyboardEvent(e);
      if(movement){
        e.preventDefault();
        pressMovementKey(movement);
        return;
      }
      if(key===' ')e.preventDefault();
      if(key==='q'||key==='tab'){
        if(canSwitchWeaponMode()){
          e.preventDefault();
          switchWeaponMode();
        }
        return;
      }
    });
    const releaseMovementFromEvent=e=>{
      const movement=movementFromKeyboardEvent(e);
      if(movement)releaseMovementKey(movement);
    };
    window.addEventListener('keyup',releaseMovementFromEvent,true);
    document.addEventListener('keyup',releaseMovementFromEvent,true);
    window.addEventListener('focus',clearMovementKeys);
    window.addEventListener('blur',clearMovementKeys);
    window.addEventListener('pagehide',clearMovementKeys);
    window.addEventListener('pointercancel',clearMovementKeys);
    window.addEventListener('contextmenu',clearMovementKeys);
    document.addEventListener('visibilitychange',()=>{ if(document.hidden)clearMovementKeys(); });
    window.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        if(rewardEl&&!rewardEl.hidden)rewardEl.hidden=true;
        closeDungeonStatsPanel();
      }
    });
    window.useDeepLiftHealingConsumable=amount=>useDeepLiftHealingConsumable(amount);
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
    clearMovementKeys();
    state.active=false;
    state.phase='map';
    resetCritChain();
    state.enemies=[];
    state.deadEnemies=[];
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
      state.itemLoot=[];
      resetPlayerPose();
    }
    if(root){
      root.classList.remove('open');
      root.setAttribute('aria-hidden','true');
    }
    if(mapEl)mapEl.hidden=false;
    if(rewardEl)rewardEl.hidden=true;
    if(cursorEl)cursorEl.style.transform='translate(-100px,-100px)';
    document.body.classList.remove('deep-lift-active','deep-lift-inventory-open');
    window.deepLiftBackpackOverlayActive=false;
    closeDungeonStatsPanel();
    renderDeepLiftUi();
  }

  function clearMovementKeys(){
    movementKeys.clear();
    movementPriority.x=null;
    movementPriority.y=null;
  }
  function movementFromKeyboardEvent(e){
    return MOVEMENT_CODES.get(e.code)||MOVEMENT_KEYS.get(String(e.key||'').toLowerCase())||null;
  }
  function pressMovementKey(movement){
    const axis=MOVEMENT_AXIS[movement];
    movementKeys.add(movement);
    if(axis)movementPriority[axis]=movement;
  }
  function releaseMovementKey(movement){
    const axis=MOVEMENT_AXIS[movement];
    movementKeys.delete(movement);
    if(!axis||movementPriority[axis]!==movement)return;
    const opposite=MOVEMENT_OPPOSITE[movement];
    movementPriority[axis]=opposite&&movementKeys.has(opposite)?opposite:null;
  }
  function movementAxisValue(negative,positive,axis){
    const hasNegative=movementKeys.has(negative);
    const hasPositive=movementKeys.has(positive);
    if(hasNegative&&hasPositive)return movementPriority[axis]===positive?1:-1;
    if(hasPositive)return 1;
    if(hasNegative)return -1;
    movementPriority[axis]=null;
    return 0;
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
    state.messageTimer=0;
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
    state.maxHp=deepLiftMaxHp();
    state.hp=state.maxHp;
    state.deadEnemies=[];
    resetPlayerPose();
    syncWeaponMode();
    resetCritChain();
    state.loot={echoShards:0,boneScrap:0,glitchOre:0};
    state.itemLoot=[];
    if(rewardEl)rewardEl.hidden=true;
    if(mapEl)mapEl.hidden=true;
    hideStory();
    spawnWave();
    saveGame();
  }

  function descend(){
    if(state.phase!=='reward')return;
    syncDeepLiftStatsAfterInventory();
    clearMovementKeys();
    if(state.wave<state.wavesRequired){
      state.wave++;
    }else{
      if(state.floor<DUNGEON_FLOORS){
        state.floor++;
        state.wave=1;
        state.wavesRequired=wavesRequiredForFloor(state.floor);
        state.deadEnemies=[];
      }else{
        returnToLiftMap();
        return;
      }
    }
    if(mapEl)mapEl.hidden=true;
    hideStory();
    closeDungeonStatsPanel();
    spawnWave();
  }

  function returnToLiftMap(){
    state.phase='map';
    resetCritChain();
    state.enemies=[];
    state.deadEnemies=[];
    state.projectiles=[];
    state.particles=[];
    state.selectedDungeon=clamp(player.deepLift.selectedDungeon||player.deepLift.unlockedDungeon||1,1,player.deepLift.unlockedDungeon||1);
    state.dungeon=state.selectedDungeon;
    state.floor=1;
    state.wave=1;
    state.wavesRequired=wavesRequiredForFloor(state.floor);
    hideStory();
    resetPlayerPose();
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
    const extractedItems=[...state.itemLoot];
    const coins=gained>0?gained*18+state.floor*25+state.wave*10:0;
    const xp=gained>0?gained*6+state.floor*8+state.wave*4:0;
    Object.entries(state.loot).forEach(([key,value])=>{
      player.deepLift.materials[key]=(Number(player.deepLift.materials[key])||0)+value;
    });
    if(gained>0){
      addPlayerXp(xp);
      addPlayerCoins(coins);
    }
    const itemResults=extractDungeonItems(extractedItems);
    player.deepLift.bestFloor=Math.max(Number(player.deepLift.bestFloor)||0,state.floor);
    player.deepLift.bestDungeon=Math.max(Number(player.deepLift.bestDungeon)||0,state.dungeon);
    saveGame();
    showRewardPopup(extracted,coins,xp,itemResults);
    state.dungeon=player.deepLift.selectedDungeon||1;
    state.floor=1;
    state.wave=1;
    state.wavesRequired=wavesRequiredForFloor(state.floor);
    state.hp=state.maxHp;
    state.loot={echoShards:0,boneScrap:0,glitchOre:0};
    state.itemLoot=[];
    state.deadEnemies=[];
    resetPlayerPose();
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
  function deepLiftMaxHp(){
    return 100+Math.max(0,Math.round(itemBonus('maxHp')));
  }
  function syncDeepLiftStatsAfterInventory(){
    const oldMax=Math.max(1,state.maxHp||100);
    const pct=clamp(state.hp/oldMax,0,1);
    state.maxHp=deepLiftMaxHp();
    state.hp=clamp(Math.round(pct*state.maxHp),1,state.maxHp);
    syncWeaponMode();
  }
  function equippedDungeonWeapons(){
    const weapons=typeof equippedItemDefsByGroup==='function'?equippedItemDefsByGroup('weapon'):[];
    const tools=typeof equippedItemDefsByGroup==='function'?equippedItemDefsByGroup('tool'):[];
    const melee=weapons.find(item=>['melee','weapon'].includes(item.def.type))||tools[0]||null;
    const projectile=weapons.find(item=>['wand','bow','ranged','projectile'].includes(item.def.type))||null;
    return {melee,projectile};
  }
  function canSwitchWeaponMode(){
    const weapons=equippedDungeonWeapons();
    return !!(weapons.melee&&weapons.projectile);
  }
  function syncWeaponMode(){
    const weapons=equippedDungeonWeapons();
    if(state.weaponMode==='projectile'&&!weapons.projectile)state.weaponMode='melee';
    if(state.weaponMode==='melee'&&!weapons.melee&&weapons.projectile)state.weaponMode='projectile';
    if(!state.weaponMode)state.weaponMode='melee';
  }
  function switchWeaponMode(){
    if(!canSwitchWeaponMode())return false;
    state.weaponMode=state.weaponMode==='projectile'?'melee':'projectile';
    const label=state.weaponMode==='projectile'?'Projectile':'Melee';
    burst(state.player.x,state.player.y,label,'#ffe08a',7);
    renderDeepLiftUi();
    return true;
  }
  function activeWeaponLabel(){
    const weapons=equippedDungeonWeapons();
    const active=state.weaponMode==='projectile'?weapons.projectile:weapons.melee;
    return active&&active.def?active.def.name:(state.weaponMode==='projectile'?'Projectile':'Pickaxe');
  }
  function openBetweenWaveInventory(){
    if(state.phase==='combat')return;
    clearMovementKeys();
    closeDungeonStatsPanel();
    if(typeof renderInventory==='function')renderInventory();
    window.deepLiftBackpackOverlayActive=true;
    document.body.classList.add('panel-open','deep-lift-inventory-open');
    if(typeof switchBmpScreen==='function')switchBmpScreen('inventory');
    if(backpackMapPanel)backpackMapPanel.classList.add('open');
    if(backpackToggle)backpackToggle.classList.add('open');
    if(cursorEl)cursorEl.style.transform='translate(-100px,-100px)';
    setCursorLayerMode('ui');
  }
  function openCommandPanelInventory(){
    if(!(state.phase==='reward'||state.phase==='failed'))return;
    openBetweenWaveInventory();
  }
  function openDungeonStatsPanel(){
    if(!(state.phase==='reward'||state.phase==='failed'))return;
    renderDungeonStatsPanel();
    if(statsPanelEl)statsPanelEl.hidden=false;
  }
  function closeDungeonStatsPanel(){
    if(statsPanelEl)statsPanelEl.hidden=true;
  }
  function dungeonDamageEstimate(){
    syncWeaponMode();
    if(state.weaponMode==='projectile'&&equippedDungeonWeapons().projectile)return deepLiftProjectileDamage();
    return deepLiftAttackDamage(true,pickaxeTierLevel());
  }
  function activeBuffSummary(){
    const buffs=(player.tavern&&Array.isArray(player.tavern.activeBuffs))?player.tavern.activeBuffs:[];
    return buffs.length?`${buffs.length} active`:'None';
  }
  function renderDungeonStatsPanel(){
    if(!statsListEl)return;
    const defense=Math.round(clamp(itemBonus('defense'),0,0.72)*100);
    const rows=[
      ['Damage',dungeonDamageEstimate()],
      ['Health',`${Math.max(0,Math.round(state.hp))}/${Math.round(state.maxHp)}`],
      ['Defense',`${defense}%`],
      ['Wave Regen',`+${Math.max(0,Math.round(itemBonus('dungeonRegen')))} HP`],
      ['Buffs',activeBuffSummary()],
      ['Depth',`F${state.floor} W${state.wave}/${state.wavesRequired}`],
      ['Loot',lootTotal()],
    ];
    statsListEl.innerHTML=rows.map(([label,value])=>`<div class="deep-lift-stat-row"><span>${label}</span><strong>${value}</strong></div>`).join('');
  }
  function resetPlayerPose(){
    state.player.dead=false;
    state.player.hurtTimer=0;
    state.player.attackFlash=0;
    state.player.attackTimer=0;
    state.player.attackCooldown=0;
    state.player.animState='idle';
    state.player.animTime=0;
    state.player.facingAngle=Math.PI/2;
  }
  function startPlayerAttackVisual(duration=PLAYER_ATTACK_ANIM_TIME){
    state.player.attackTimer=duration;
    state.player.attackFlash=Math.max(state.player.attackFlash||0,0.16);
    state.player.animState='attack';
    state.player.animTime=0;
  }
  function useDeepLiftHealingConsumable(amount){
    if(!state.active||state.phase!=='reward')return false;
    syncDeepLiftStatsAfterInventory();
    if(state.hp>=state.maxHp){
      showStory('You are already steady enough for the next descent.');
      return false;
    }
    const heal=Math.max(1,Math.round(Number(amount)||0));
    state.hp=Math.min(state.maxHp,state.hp+heal);
    burst(state.player.x,state.player.y,`+${heal}`,'#8dffcc',12);
    showStory('The salve bites cold, then the pain backs off.');
    renderDeepLiftUi();
    return true;
  }

  function spawnWave(){
    state.phase='combat';
    clearMovementKeys();
    closeDungeonStatsPanel();
    state.enemies=[];
    state.projectiles=[];
    state.particles=[];
    state.player.x=WORLD.w/2;
    state.player.y=WORLD.h/2;
    state.player.dead=false;
    state.player.hurtTimer=0;
    state.player.animState='idle';
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
      strikeTimer:0,
      strikeHitDone:false,
      strikeCooldown:0,
      shootCastTimer:0,
      shootCastDuration:0,
      shootReleased:false,
      deadVariant:0,
      hitFlash:0,
      dead:false,
      rewarded:false,
      facingAngle:Math.PI/2,
      animState:'walk',
      animTime:0,
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
    if(!state.active||state.phase!=='combat'||state.player.dead)return;
    e.preventDefault();
    e.stopPropagation();
    if(state.player.attackCooldown>0)return;
    updateAimFromEvent(e);
    const x=state.aim.x;
    const y=state.aim.y;
    state.player.facingAngle=Math.atan2(y-state.player.y,x-state.player.x);
    syncWeaponMode();
    if(state.weaponMode==='projectile'&&equippedDungeonWeapons().projectile){
      firePlayerProjectile(x,y);
      return;
    }
    const target=findDeepLiftAttackTarget(x,y);
    if(!target.enemy){
      if(distance(x,y,state.player.x,state.player.y)<state.player.r*1.85)return;
      state.player.attackCooldown=ATTACK_COOLDOWN;
      startPlayerAttackVisual(0.26);
      resetCritChain();
      burst(x,y,'MISS','#77808f',5);
      return;
    }
    state.player.attackCooldown=ATTACK_COOLDOWN;
    startPlayerAttackVisual();
    const tier=pickaxeTierLevel();
    if(target.crit)noteCritHit();
    else resetCritChain();
    const dmg=deepLiftAttackDamage(target.crit,tier);
    target.enemy.hp-=dmg;
    target.enemy.hitFlash=0.16;
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
    const meleeMult=1+Math.max(0,itemBonus('meleeDamage'));
    const weakMult=crit?1+Math.max(0,itemBonus('critDamage')):1;
    return Math.round((baseDamage+powerDamage+floorDamage+waveDamage)*critMult*meleeMult*weakMult);
  }
  function deepLiftProjectileDamage(){
    const tier=pickaxeTierLevel();
    const base=52+tier*5+itemBonus('power')*0.65+state.floor*2.4+state.wave*1.1;
    return Math.round(base*(1+Math.max(0,itemBonus('projectileDamage'))));
  }
  function firePlayerProjectile(x,y){
    const a=Math.atan2(y-state.player.y,x-state.player.x);
    state.player.facingAngle=a;
    const extra=Math.max(0,Math.floor(itemBonus('projectileCount')));
    const shots=1+extra;
    const speed=360*(1+Math.max(0,itemBonus('projectileSpeed')));
    state.player.attackCooldown=Math.max(0.34,0.76-Math.min(0.22,itemBonus('swingSpeed')*0.01));
    startPlayerAttackVisual(0.28);
    for(let i=0;i<shots;i++){
      const spread=(i-(shots-1)/2)*0.12;
      const angle=a+spread;
      state.projectiles.push({
        friendly:true,
        x:state.player.x,
        y:state.player.y,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed,
        r:5,
        damage:deepLiftProjectileDamage(),
        life:1.55,
      });
    }
    burst(state.player.x+Math.cos(a)*26,state.player.y+Math.sin(a)*26,'SHOT','#9ff7ff',5);
    if(window.GameAudio)GameAudio.playMineHit();
  }

  function killEnemy(enemy){
    if(!enemy||enemy.rewarded)return;
    enemy.rewarded=true;
    const idx=state.enemies.indexOf(enemy);
    if(idx>=0)state.enemies.splice(idx,1);
    enemy.dead=true;
    enemy.animState='dead';
    enemy.animTime=0;
    enemy.deadVariant=Math.floor(Math.random()*3);
    enemy.chargeTime=0;
    enemy.shootTimer=Infinity;
    state.deadEnemies.push(enemy);
    const amount=enemy.kind==='boss'?2+Math.floor(state.floor/5):1+(Math.random()<0.25?1:0);
    const lootAmount=Math.max(1,Math.round(amount*(1+Math.max(0,itemBonus('dungeonLoot')))));
    state.loot[enemy.loot]=(state.loot[enemy.loot]||0)+lootAmount;
    if(typeof trackTavernMission==='function')trackTavernMission('deepLiftLoot',{material:enemy.loot,amount:lootAmount,dungeon:state.dungeon,floor:state.floor,wave:state.wave});
    burst(enemy.x,enemy.y,`+${lootAmount} ${MATERIAL_LABELS[enemy.loot]}`,'#8dffcc',16);
    const dropId=rollDungeonItemDrop(enemy);
    if(dropId){
      state.itemLoot.push(dropId);
      const def=CRAFT_ITEM_DEFS[dropId];
      burst(enemy.x,enemy.y-20,def?def.name:'Dungeon gear',def&&def.glow?def.glow:'#ffe08a',18);
    }
    if(state.enemies.length===0)completeFloor();
  }
  function dungeonDropPool(enemy=null){
    const boss=enemy&&enemy.kind==='boss';
    const maxRank=boss
      ? (state.dungeon>=3?rarityRank('mythic'):state.dungeon>=2?rarityRank('legendary'):rarityRank('epic'))
      : (state.dungeon>=3?rarityRank('epic'):state.dungeon>=2?rarityRank('rare'):rarityRank('uncommon'));
    return Object.entries(CRAFT_ITEM_DEFS)
      .filter(([,def])=>{
        const fromDungeon=typeof itemHasSource==='function'
          ? itemHasSource(def,'dungeon')
          : Array.isArray(def.sources)&&def.sources.includes('dungeon');
        const fromBoss=def.bossOnly||(typeof itemHasSource==='function'
          ? itemHasSource(def,'boss')
          : Array.isArray(def.sources)&&def.sources.includes('boss'));
        if(boss){
          if(!(fromDungeon||fromBoss))return false;
        }else if(!fromDungeon||fromBoss){
          return false;
        }
        return rarityRank(def.rarity)<=maxRank;
      })
      .map(([id,def])=>({id,rank:rarityRank(def.rarity),def,bossOnly:def.bossOnly||(Array.isArray(def.sources)&&def.sources.includes('boss'))}));
  }
  function rollDungeonItemDrop(enemy){
    const base=enemy.kind==='boss'?0.82:0.055;
    const chance=clamp(base+Math.max(0,itemBonus('dungeonDropChance'))+state.floor*0.006+state.dungeon*0.01,0,0.94);
    if(Math.random()>chance)return '';
    const pool=dungeonDropPool(enemy);
    if(!pool.length)return '';
    const weighted=pool.map(entry=>{
      const bossTargetRank=state.dungeon>=3?rarityRank('mythic'):state.dungeon>=2?rarityRank('legendary'):rarityRank('epic');
      const targetRank=enemy.kind==='boss'
        ? Math.min(bossTargetRank,Math.floor((state.floor+state.dungeon+2)/2))
        : Math.min(rarityRank('epic'),Math.floor((state.floor+state.dungeon)/2));
      const distance=Math.abs(entry.rank-targetRank);
      const bossBoost=enemy.kind==='boss'?(entry.bossOnly?0.55:2.1):1;
      const rarityWeight=Math.pow(0.84,Math.max(0,entry.rank-1));
      return {...entry,weight:Math.max(0.08,1.8-distance*0.42)*bossBoost*rarityWeight*(entry.def.rollWeight||1)};
    });
    const total=weighted.reduce((sum,entry)=>sum+entry.weight,0);
    let roll=Math.random()*total;
    for(const entry of weighted){
      roll-=entry.weight;
      if(roll<=0)return entry.id;
    }
    return weighted[weighted.length-1].id;
  }
  function extractDungeonItems(items=[]){
    const gained=[];
    const missed=[];
    items.forEach(itemId=>{
      if(addCraftedItem(itemId))gained.push(itemId);
      else missed.push(itemId);
    });
    if(gained.length&&typeof renderInventory==='function')renderInventory();
    return {gained,missed};
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
    clearMovementKeys();
    resetCritChain();
    state.hp=Math.min(state.maxHp,state.hp+Math.max(6,14-state.wave)+Math.max(0,itemBonus('dungeonRegen')));
    const finalWave=state.wave>=state.wavesRequired;
    const dungeonCleared=finalWave&&state.floor>=DUNGEON_FLOORS;
    if(typeof trackTavernMission==='function'){
      trackTavernMission('deepLiftWave',{dungeon:state.dungeon,floor:state.floor,wave:state.wave});
      if(finalWave)trackTavernMission('deepLiftFloor',{dungeon:state.dungeon,floor:state.floor});
    }
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
    updateDeadBodies(step);
    if(state.critTimer>0){
      state.critTimer=Math.max(0,state.critTimer-step);
      if(state.critTimer<=0)resetCritChain();
    }
    updateParticles(step);
    if(state.messageTimer>0){
      state.messageTimer=Math.max(0,state.messageTimer-step);
      if(state.messageTimer<=0)hideStory();
    }
    if(cursorEl)cursorEl.classList.toggle('cooldown',state.player.attackCooldown>0);
    renderDeepLiftUi();
    renderDeepLift();
  }

  function updatePlayer(dt){
    state.player.animTime+=dt;
    state.player.hurtTimer=Math.max(0,(state.player.hurtTimer||0)-dt);
    if(state.player.dead){
      state.player.animState='dead';
      state.player.attackCooldown=Math.max(0,state.player.attackCooldown-dt);
      state.player.attackTimer=0;
      return;
    }
    const dx=movementAxisValue('left','right','x');
    const dy=movementAxisValue('up','down','y');
    const len=Math.hypot(dx,dy)||1;
    const speed=178*(1+Math.min(0.35,itemBonus('swingSpeed')*0.015));
    state.player.x=clamp(state.player.x+(dx/len)*speed*dt,28,WORLD.w-28);
    state.player.y=clamp(state.player.y+(dy/len)*speed*dt,58,WORLD.h-38);
    if(dx||dy)state.player.facingAngle=Math.atan2(dy,dx);
    state.player.invuln=Math.max(0,state.player.invuln-dt);
    state.player.attackFlash=Math.max(0,state.player.attackFlash-dt);
    state.player.attackTimer=Math.max(0,(state.player.attackTimer||0)-dt);
    state.player.attackCooldown=Math.max(0,state.player.attackCooldown-dt);
    if(state.player.hurtTimer>0)state.player.animState='hurt';
    else if(state.player.attackTimer>0)state.player.animState='attack';
    else state.player.animState=(dx||dy)?'walk':'idle';
  }

  function updateDeadBodies(dt){
    state.deadEnemies.forEach(enemy=>{
      enemy.animState='dead';
      enemy.animTime=(enemy.animTime||0)+dt;
    });
  }

  function enemySpriteMeta(enemy){
    return ENEMY_SPRITES[enemy.id]||{};
  }
  function setEnemyAnim(enemy,stateName,reset=false){
    if(enemy.animState!==stateName||reset){
      enemy.animState=stateName;
      enemy.animTime=0;
    }
  }
  function enemyCanStrike(enemy){
    return enemy.kind==='chase'||enemy.kind==='boss';
  }
  function enemyCanShoot(enemy){
    return enemy.kind==='shoot'||enemy.kind==='boss';
  }
  function enemyStrikeConfig(enemy){
    return enemySpriteMeta(enemy).strike||{rangePad:8,duration:0.48,hitAt:0.26,recovery:0.42};
  }
  function enemyShootConfig(enemy){
    return enemySpriteMeta(enemy).shoot||{duration:0.44,releaseAt:0.24,recovery:enemy.kind==='boss'?0.62:0.58};
  }
  function startEnemyStrike(enemy,dx,dy){
    const cfg=enemyStrikeConfig(enemy);
    enemy.strikeTimer=cfg.duration;
    enemy.strikeHitDone=false;
    enemy.chargeTime=0;
    enemy.facingAngle=Math.atan2(dy,dx);
    setEnemyAnim(enemy,'strike',true);
  }
  function updateEnemyStrike(enemy,dt){
    if(!(enemy.strikeTimer>0))return false;
    const cfg=enemyStrikeConfig(enemy);
    const prev=enemy.strikeTimer;
    enemy.strikeTimer=Math.max(0,enemy.strikeTimer-dt);
    const elapsed=cfg.duration-enemy.strikeTimer;
    const dx=state.player.x-enemy.x,dy=state.player.y-enemy.y;
    enemy.facingAngle=Math.atan2(dy,dx);
    setEnemyAnim(enemy,'strike');
    if(!enemy.strikeHitDone&&prev>cfg.duration-cfg.hitAt&&elapsed>=cfg.hitAt){
      enemy.strikeHitDone=true;
      const d=Math.hypot(dx,dy)||1;
      if(!state.player.dead&&d<enemy.r+state.player.r+cfg.rangePad)damagePlayer(enemy.damage);
    }
    if(enemy.strikeTimer<=0){
      enemy.strikeCooldown=cfg.recovery;
      setEnemyAnim(enemy,'idle',true);
    }
    return true;
  }
  function startEnemyShoot(enemy){
    const cfg=enemyShootConfig(enemy);
    enemy.shootCastTimer=cfg.duration;
    enemy.shootCastDuration=cfg.duration;
    enemy.shootReleased=false;
    setEnemyAnim(enemy,'shoot',true);
  }
  function updateEnemyShootCast(enemy,dt){
    if(!(enemy.shootCastTimer>0))return false;
    const cfg=enemyShootConfig(enemy);
    enemy.shootCastTimer=Math.max(0,enemy.shootCastTimer-dt);
    const elapsed=(enemy.shootCastDuration||cfg.duration)-enemy.shootCastTimer;
    const dx=state.player.x-enemy.x,dy=state.player.y-enemy.y;
    enemy.facingAngle=Math.atan2(dy,dx);
    setEnemyAnim(enemy,'shoot');
    if(!enemy.shootReleased&&elapsed>=cfg.releaseAt){
      enemy.shootReleased=true;
      shootAtPlayer(enemy);
    }
    if(enemy.shootCastTimer<=0)enemy.shootTimer=cfg.recovery;
    return true;
  }

  function updateEnemies(dt){
    for(const enemy of state.enemies){
      if(enemy.dead)continue;
      enemy.animTime=(enemy.animTime||0)+dt;
      enemy.weakAngle+=enemy.weakSpin*dt;
      enemy.hitFlash=Math.max(0,enemy.hitFlash-dt);
      enemy.strikeCooldown=Math.max(0,(enemy.strikeCooldown||0)-dt);
      const dx=state.player.x-enemy.x,dy=state.player.y-enemy.y;
      const d=Math.hypot(dx,dy)||1;
      if(updateEnemyStrike(enemy,dt))continue;
      if(updateEnemyShootCast(enemy,dt))continue;
      if(enemyCanStrike(enemy)&&enemy.strikeCooldown<=0&&d<enemy.r+state.player.r+enemyStrikeConfig(enemy).rangePad){
        startEnemyStrike(enemy,dx,dy);
        updateEnemyStrike(enemy,dt);
        continue;
      }
      if(enemy.kind==='shoot'&&d<240){
        enemy.x-=dx/d*enemy.speed*0.35*dt;
        enemy.y-=dy/d*enemy.speed*0.35*dt;
        enemy.facingAngle=Math.atan2(dy,dx);
        setEnemyAnim(enemy,enemy.hitFlash>0?'hurt':'backwalk');
      }else if(enemy.kind==='chase'&&updateEnemyCharge(enemy,dt,d,dx,dy)){
        // Charging enemies commit to a straight burst, so the player can dodge the lane.
        enemy.facingAngle=enemy.chargeAngle;
        setEnemyAnim(enemy,enemy.hitFlash>0?'hurt':'charge');
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
        enemy.facingAngle=enemy.moveAngle;
        setEnemyAnim(enemy,enemy.hitFlash>0?'hurt':'run');
      }
      enemy.shootTimer=Math.max(0,enemy.shootTimer-dt);
      if(enemyCanShoot(enemy)&&enemy.shootTimer<=0){
        startEnemyShoot(enemy);
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
      if(p.friendly){
        for(const enemy of state.enemies){
          if(distance(p.x,p.y,enemy.x,enemy.y)>p.r+enemy.r)continue;
          enemy.hp-=p.damage;
          enemy.hitFlash=0.14;
          burst(p.x,p.y,`${Math.round(p.damage)}`,'#9ff7ff',4);
          if(enemy.hp<=0)killEnemy(enemy);
          return false;
        }
        return p.life>0&&p.x>-30&&p.x<WORLD.w+30&&p.y>-30&&p.y<WORLD.h+30;
      }
      if(distance(p.x,p.y,state.player.x,state.player.y)<p.r+state.player.r){
        damagePlayer(p.damage);
        return false;
      }
      return p.life>0&&p.x>-30&&p.x<WORLD.w+30&&p.y>-30&&p.y<WORLD.h+30;
    });
  }

  function damagePlayer(amount){
    if(state.player.invuln>0||state.player.dead)return;
    const reduction=clamp(itemBonus('defense'),0,0.72);
    const finalAmount=Math.max(1,Math.round(amount*(1-reduction)));
    state.hp=Math.max(0,state.hp-finalAmount);
    state.player.invuln=0.75;
    state.player.hurtTimer=0.24;
    state.player.animState='hurt';
    state.player.animTime=0;
    if(state.hp<=0){
      state.player.dead=true;
      state.player.animState='dead';
      state.player.animTime=0;
      clearMovementKeys();
    }
    resetCritChain();
    burst(state.player.x,state.player.y,`-${finalAmount}`,'#ff6464',10);
    if(window.GameAudio&&GameAudio.playUiError)GameAudio.playUiError();
  }

  function failRun(){
    if(state.phase==='failed')return;
    const kept={};
    Object.entries(state.loot).forEach(([key,value])=>kept[key]=Math.floor(value*0.5));
    state.loot=kept;
    state.itemLoot=[];
    state.phase='failed';
    resetCritChain();
    state.enemies=[];
    state.deadEnemies=[];
    state.projectiles=[];
    state.hp=0;
    state.player.dead=true;
    state.player.animState='dead';
    clearMovementKeys();
    showStory('Run failed. Extract to keep half of the current haul.');
    renderDeepLiftUi();
  }

  function showRewardPopup(materials,coins,xp,itemResults={gained:[],missed:[]}){
    if(!rewardEl||!rewardListEl)return;
    const rows=[];
    Object.entries(materials)
      .filter(([,value])=>Number(value)>0)
      .forEach(([key,value])=>rows.push(rewardTile({
        name:MATERIAL_LABELS[key]||key,
        detail:`x${value}`,
        qty:value,
        glyph:key==='glitchOre'?'GO':key==='boneScrap'?'BS':'ES',
        glow:key==='glitchOre'?'rgba(255,120,90,.42)':key==='boneScrap'?'rgba(238,232,200,.34)':'rgba(129,242,255,.38)',
      })));
    aggregateIds(itemResults.gained||[]).forEach(({id,count})=>{
      const def=CRAFT_ITEM_DEFS[id];
      rows.push(rewardTile({
        name:def?def.name:'Dungeon gear',
        detail:def?(RARITY_LABELS[def.rarity]||def.rarity):'Item',
        qty:count,
        itemId:id,
        def,
      }));
    });
    aggregateIds(itemResults.missed||[]).forEach(({id,count})=>{
      const def=CRAFT_ITEM_DEFS[id];
      rows.push(rewardTile({
        name:def?def.name:'Dungeon gear',
        detail:'Backpack full',
        qty:count,
        itemId:id,
        def,
        missed:true,
      }));
    });
    if(coins>0)rows.push(rewardTile({name:'Coins',detail:String(coins),qty:coins,glyph:'c',glow:'rgba(255,211,111,.4)'}));
    if(xp>0)rows.push(rewardTile({name:'XP',detail:String(xp),qty:xp,glyph:'XP',glow:'rgba(159,232,122,.35)'}));
    rewardListEl.innerHTML=rows.length?rows.join(''):rewardTile({name:'No haul secured',detail:'0',glyph:'0'});
    rewardEl.hidden=false;
  }
  function aggregateIds(ids){
    const counts=new Map();
    ids.forEach(id=>counts.set(id,(counts.get(id)||0)+1));
    return Array.from(counts.entries()).map(([id,count])=>({id,count}));
  }
  function rewardTile({name,detail,qty=1,itemId='',def=null,glyph='',glow='',missed=false}){
    const color=def?(def.glow||def.col||'#ffe08a'):glow;
    const icon=itemId
      ? (typeof craftItemArtHtml==='function'
        ? craftItemArtHtml(itemId,def||{},'deep-lift-reward-art')
        : `<img src="images/workbench/items/${itemId}.png" alt="" draggable="false">`)
      : `<em>${glyph}</em>`;
    const qtyHtml=qty>1?`<b class="deep-lift-reward-qty">x${qty}</b>`:'';
    return `<div class="deep-lift-reward-row${missed?' missed':''}">
      <div class="deep-lift-reward-icon" style="--reward-glow:${color||'rgba(255,220,120,.2)'}">${icon}${qtyHtml}</div>
      <span title="${name}">${name}</span>
      <strong>${detail}</strong>
    </div>`;
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
    state.deadEnemies.forEach(drawEnemy);
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

  function drawPlayerAttackCue(playerActor){
    const timer=playerActor.attackTimer||0;
    if(timer<=0||playerActor.dead)return;
    const progress=clamp(1-timer/PLAYER_ATTACK_ANIM_TIME,0,1);
    const alpha=Math.sin(progress*Math.PI)*0.72;
    if(alpha<=0)return;
    const reach=playerActor.r*(2.55+progress*0.45);
    ctx.save();
    ctx.rotate(playerActor.facingAngle||0);
    ctx.globalAlpha=alpha;
    ctx.lineCap='round';
    ctx.shadowColor='rgba(255,188,72,.72)';
    ctx.shadowBlur=10;
    ctx.lineWidth=4;
    ctx.strokeStyle='rgba(255,226,112,.92)';
    ctx.beginPath();
    ctx.arc(0,0,reach,-0.72+progress*0.52,0.72+progress*0.52);
    ctx.stroke();
    ctx.lineWidth=2;
    ctx.strokeStyle='rgba(129,242,255,.76)';
    ctx.beginPath();
    ctx.arc(0,0,reach+5,-0.48+progress*0.52,0.48+progress*0.52);
    ctx.stroke();
    ctx.restore();
  }

  function angleOrFallback(value,fallback){
    return Number.isFinite(value)?value:fallback;
  }
  function directionIndexFromAngle(angle){
    const deg=(angle*180/Math.PI+360)%360;
    const octant=Math.round(deg/45)%8;
    return ANGLE_OCTANT_TO_SPRITE_DIR[octant];
  }
  function cardinalDirectionFromAngle(angle){
    const deg=(angle*180/Math.PI+360)%360;
    if(deg>=45&&deg<135)return 'south';
    if(deg>=135&&deg<225)return 'west';
    if(deg>=225&&deg<315)return 'north';
    return 'east';
  }
  function resolveSpriteState(stateName,frameSpec,fallbacks={}){
    let state=stateName;
    const seen=new Set();
    while(frameSpec.states[state]===undefined&&fallbacks[state]&&!seen.has(state)){
      seen.add(state);
      state=fallbacks[state];
    }
    if(frameSpec.states[state]!==undefined)return state;
    if(frameSpec.states.idle!==undefined)return 'idle';
    if(frameSpec.states.walk!==undefined)return 'walk';
    return Object.keys(frameSpec.states)[0];
  }
  function spriteStateFps(stateName,fpsMap={}){
    if(fpsMap[stateName])return fpsMap[stateName];
    return stateName==='idle'?6:stateName==='dead'?1:stateName==='hurt'?14:stateName==='strike'||stateName==='shoot'?14:stateName==='charge'?12:10;
  }
  function spriteFrameRows(frameSpec){
    return Math.max(...Object.values(frameSpec.states))+1;
  }
  function spriteFrame(stateName,angle,animTime,holdLast=false,frameSpec=SPRITE_FRAME,fpsMap=null,fallbacks=null){
    const resolvedState=resolveSpriteState(stateName,frameSpec,fallbacks||{});
    const stateIndex=frameSpec.states[resolvedState] ?? 0;
    const dirIndex=directionIndexFromAngle(angle);
    const fps=spriteStateFps(resolvedState,fpsMap||{});
    const frame=holdLast?frameSpec.cols-1:Math.floor((animTime||0)*fps)%frameSpec.cols;
    return {
      sx:frame*frameSpec.w,
      sy:(stateIndex*frameSpec.dirs.length+dirIndex)*frameSpec.h,
      sw:frameSpec.w,
      sh:frameSpec.h,
      frame,
      dir:frameSpec.dirs[dirIndex],
      state:resolvedState,
    };
  }
  function playerFrameOffset(stateName,frame,size){
    if(!frame||frame.frame===undefined)return null;
    const offsets=stateName==='walk'?PLAYER_WALK_FRAME_OFFSETS[frame.dir]:stateName==='idle'?PLAYER_IDLE_FRAME_OFFSETS[frame.dir]:null;
    if(!offsets)return null;
    const offset=offsets[frame.frame%offsets.length];
    const scale=size/SPRITE_FRAME.w;
    return {x:offset[0]*scale,y:offset[1]*scale};
  }
  function playerSourceMask(stateName,frame){
    if(!frame||frame.frame===undefined)return null;
    const masks=PLAYER_SOURCE_MASKS[stateName]&&PLAYER_SOURCE_MASKS[stateName][frame.dir];
    return masks?masks[frame.frame%masks.length]||null:null;
  }
  function drawActorSprite(img,actor,size,stateName,angle,filter,options={}){
    const frameSpec=options.frameSpec||SPRITE_FRAME;
    if(img&&img.complete&&img.naturalWidth>=frameSpec.w*frameSpec.cols&&img.naturalHeight>=frameSpec.h*frameSpec.dirs.length*spriteFrameRows(frameSpec)){
      const frame=spriteFrame(stateName,angle,actor.animTime,stateName==='dead',frameSpec,options.fps,options.fallbacks);
      const offset=options.playerSprite?playerFrameOffset(stateName,frame,size):null;
      const mask=options.playerSprite?playerSourceMask(stateName,frame):null;
      const maskRight=mask&&mask.right?mask.right:0;
      const maskWidth=size-maskRight*(size/frameSpec.w);
      ctx.save();
      if(maskRight>0){
        ctx.beginPath();
        ctx.rect(-size/2+(offset?offset.x:0),-size/2+(offset?offset.y:0),maskWidth,size);
        ctx.clip();
      }
      ctx.filter=filter;
      ctx.drawImage(img,frame.sx,frame.sy,frame.sw,frame.sh,-size/2+(offset?offset.x:0),-size/2+(offset?offset.y:0),size,size);
      ctx.restore();
      return true;
    }
    return false;
  }
  function authoredEnemyFrame(enemy,stateName,angle,animTime,holdLast=false){
    const isBoss=enemy.id==='warden';
    const spec=isBoss?ENEMY_AUTHORED_ROWS.boss:ENEMY_AUTHORED_ROWS.ground;
    const dirIndex=directionIndexFromAngle(angle);
    const dirName=SPRITE_FRAME.dirs[dirIndex];
    const cardinal=cardinalDirectionFromAngle(angle);
    let row=spec.idle;
    if(stateName==='dead'){
      row=spec.dead+clamp(Number(enemy.deadVariant)||0,0,2);
    }else if(isBoss){
      if(stateName==='strike'||stateName==='shoot'||stateName==='attack')row=spec.action+(CARDINAL_ACTION_ROWS[cardinal]||0);
      else if(stateName==='run'||stateName==='walk'||stateName==='backwalk'||stateName==='charge')row=spec.floatMove;
      else row=spec.idle;
    }else if(stateName==='charge'){
      row=spec.charge+dirIndex;
    }else if(stateName==='strike'||stateName==='shoot'||stateName==='attack'){
      row=spec.action+(CARDINAL_ACTION_ROWS[cardinal]||0);
    }else if(stateName==='run'||stateName==='walk'||stateName==='backwalk'){
      row=spec.run+dirIndex;
    }else{
      row=spec.idle;
    }
    const fps=spriteStateFps(stateName,enemySpriteMeta(enemy).fps||{});
    const frame=holdLast?ENEMY_AUTHORED_FRAME.cols-1:Math.floor((animTime||0)*fps)%ENEMY_AUTHORED_FRAME.cols;
    return {
      sx:frame*ENEMY_AUTHORED_FRAME.w,
      sy:row*ENEMY_AUTHORED_FRAME.h,
      sw:ENEMY_AUTHORED_FRAME.w,
      sh:ENEMY_AUTHORED_FRAME.h,
      frame,
      dir:dirName,
      state:stateName,
    };
  }
  function drawAuthoredEnemySprite(img,enemy,size,stateName,angle,filter){
    const spec=enemy.id==='warden'?ENEMY_AUTHORED_ROWS.boss:ENEMY_AUTHORED_ROWS.ground;
    if(!(img&&img.complete&&img.naturalWidth>=ENEMY_AUTHORED_FRAME.w*ENEMY_AUTHORED_FRAME.cols&&img.naturalHeight>=spec.height))return false;
    const frame=authoredEnemyFrame(enemy,stateName,angle,enemy.animTime,stateName==='dead');
    ctx.filter=filter;
    ctx.drawImage(img,frame.sx,frame.sy,frame.sw,frame.sh,-size/2,-size/2,size,size);
    ctx.filter='none';
    return true;
  }
  function compactEnemySpriteSpec(enemy){
    return enemy.id==='skeleton'?SKELETON_COMPACT_FRAME:null;
  }
  function compactEnemyState(stateName){
    if(stateName==='dead')return 'dead';
    if(stateName==='charge')return 'charge';
    if(stateName==='strike'||stateName==='attack'||stateName==='shoot')return 'strike';
    return 'run';
  }
  function compactEnemyFrame(enemy,stateName,angle,animTime,holdLast=false,spec=SKELETON_COMPACT_FRAME){
    const dirIndex=directionIndexFromAngle(angle);
    const activeState=compactEnemyState(stateName);
    const frameCount=spec.frames[activeState]||spec.cols;
    let row=spec.states[activeState]||0;
    if(activeState==='dead'){
      row+=clamp(Number(enemy.deadVariant)||0,0,(spec.deadRows||1)-1);
    }else{
      row+=dirIndex;
    }
    let frame=0;
    if(holdLast){
      frame=frameCount-1;
    }else if(activeState==='strike'){
      const duration=enemyStrikeConfig(enemy).duration||0.5;
      frame=clamp(Math.floor(((animTime||0)/duration)*frameCount),0,frameCount-1);
    }else if(stateName!=='idle'&&stateName!=='hurt'){
      const fps=spriteStateFps(activeState,enemySpriteMeta(enemy).fps||{});
      frame=Math.floor((animTime||0)*fps)%frameCount;
    }
    return {
      sx:frame*spec.w,
      sy:row*spec.h,
      sw:spec.w,
      sh:spec.h,
      frame,
      dir:spec.dirs[dirIndex],
      state:activeState,
    };
  }
  function drawCompactEnemySprite(img,enemy,size,stateName,angle,filter,spec){
    if(!(spec&&img&&img.complete&&img.naturalWidth>=spec.w*spec.cols&&img.naturalHeight>=spec.height))return false;
    const frame=compactEnemyFrame(enemy,stateName,angle,enemy.animTime,stateName==='dead',spec);
    ctx.filter=filter;
    ctx.drawImage(img,frame.sx,frame.sy,frame.sw,frame.sh,-size/2,-size/2,size,size);
    ctx.filter='none';
    return true;
  }

  function enemyStateUsesMovementSheet(stateName){
    return stateName==='run'||stateName==='walk'||stateName==='backwalk'||stateName==='charge';
  }

  function drawPlayer(){
    const p=state.player;
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.globalAlpha=!p.dead&&p.invuln>0&&Math.floor(p.invuln*18)%2===0?0.45:1;
    const img=DEEP_LIFT_ASSETS.player;
    if(img.complete&&img.naturalWidth){
      const size=p.r*4.2;
      const stateName=p.dead?'dead':p.animState||'idle';
      const filter=p.hurtTimer>0?'brightness(1.85)':p.attackTimer>0?'brightness(1.34)':p.attackFlash>0?'brightness(1.18)':'drop-shadow(0 10px 8px rgba(0,0,0,.42))';
      if(!drawActorSprite(img,p,size,stateName,angleOrFallback(p.facingAngle,Math.PI/2),filter,{playerSprite:true})){
        ctx.filter=filter;
        ctx.drawImage(img,-size/2,-size/2,size,size);
        ctx.filter='none';
      }
      drawPlayerAttackCue(p);
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
    const weak=enemy.dead?null:enemyWeakPoint(enemy);
    const meta=enemySpriteMeta(enemy);
    const authoredImg=DEEP_LIFT_ASSETS.authoredEnemies[enemy.id];
    const movementImg=DEEP_LIFT_ASSETS.movementEnemies&&DEEP_LIFT_ASSETS.movementEnemies[enemy.id];
    const compactImg=DEEP_LIFT_ASSETS.compactEnemies&&DEEP_LIFT_ASSETS.compactEnemies[enemy.id];
    const staticImg=DEEP_LIFT_ASSETS.staticEnemies&&DEEP_LIFT_ASSETS.staticEnemies[enemy.id];
    const compactSpec=compactEnemySpriteSpec(enemy);
    const compactReady=compactSpec&&compactImg&&compactImg.complete&&compactImg.naturalWidth>=compactSpec.w*compactSpec.cols&&compactImg.naturalHeight>=compactSpec.height;
    const authoredSpec=enemy.id==='warden'?ENEMY_AUTHORED_ROWS.boss:ENEMY_AUTHORED_ROWS.ground;
    const authoredReady=authoredImg&&authoredImg.complete&&authoredImg.naturalWidth>=ENEMY_AUTHORED_FRAME.w*ENEMY_AUTHORED_FRAME.cols&&authoredImg.naturalHeight>=authoredSpec.height;
    const movementReady=movementImg&&movementImg.complete&&movementImg.naturalWidth>=ENEMY_AUTHORED_FRAME.w*ENEMY_AUTHORED_FRAME.cols&&movementImg.naturalHeight>=authoredSpec.height;
    const primaryImg=authoredReady?authoredImg:DEEP_LIFT_ASSETS.enemies[enemy.id];
    const primaryReady=!authoredReady&&primaryImg&&primaryImg.complete&&primaryImg.naturalWidth>=ENEMY_SPRITE_FRAME.w*ENEMY_SPRITE_FRAME.cols&&primaryImg.naturalHeight>=ENEMY_SPRITE_FRAME.h*ENEMY_SPRITE_FRAME.dirs.length*spriteFrameRows(ENEMY_SPRITE_FRAME);
    const img=primaryReady?primaryImg:(staticImg||DEEP_LIFT_ASSETS.enemies[enemy.id]);
    const hasDrawableImage=compactReady||movementReady||authoredReady||(img&&img.complete&&img.naturalWidth);
    const frameSpec=primaryReady?ENEMY_SPRITE_FRAME:SPRITE_FRAME;
    const fallbacks=primaryReady?meta.fallbacks:{run:'walk',backwalk:'walk',strike:'attack',shoot:'attack'};
    ctx.save();
    ctx.translate(enemy.x,enemy.y);
    if(!enemy.dead&&enemy.chargeTime>0){
      ctx.strokeStyle='rgba(255,216,110,.78)';
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.moveTo(-Math.cos(enemy.chargeAngle)*enemy.r*1.7,-Math.sin(enemy.chargeAngle)*enemy.r*1.7);
      ctx.lineTo(-Math.cos(enemy.chargeAngle)*enemy.r*3.2,-Math.sin(enemy.chargeAngle)*enemy.r*3.2);
      ctx.stroke();
    }
    if(hasDrawableImage){
      const size=enemy.r*(enemy.kind==='boss'?4.1:3.65);
      const stateName=enemy.dead?'dead':enemy.animState||'walk';
      const filter=enemy.dead?'grayscale(.35) drop-shadow(0 8px 7px rgba(0,0,0,.42))':enemy.hitFlash>0?'brightness(1.75)':'drop-shadow(0 10px 8px rgba(0,0,0,.42))';
      const angle=angleOrFallback(enemy.facingAngle,angleOrFallback(enemy.moveAngle,Math.PI/2));
      if(compactReady){
        drawCompactEnemySprite(compactImg,enemy,size,stateName,angle,filter,compactSpec);
      }else if(movementReady&&enemyStateUsesMovementSheet(stateName)){
        drawAuthoredEnemySprite(movementImg,enemy,size,stateName,angle,filter);
      }else if(authoredReady){
        drawAuthoredEnemySprite(authoredImg,enemy,size,stateName,angle,filter);
      }else if(!drawActorSprite(img,enemy,size,stateName,angle,filter,{frameSpec,fps:meta.fps,fallbacks})){
        ctx.filter=filter;
        ctx.drawImage(img,-size/2,-size/2,size,size);
        ctx.filter='none';
      }
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
    if(enemy.dead)return;
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
    ctx.fillStyle=p.friendly?'#9ff7ff':'#ff785f';
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
    if(hpPanelEl){
      const statsReady=state.phase==='reward'||state.phase==='failed';
      hpPanelEl.classList.toggle('can-open-stats',statsReady);
      hpPanelEl.setAttribute('aria-disabled',statsReady?'false':'true');
      hpPanelEl.title=statsReady?'Open dungeon stats':'Dungeon stats open between waves';
    }
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
    if(inventoryBtn){
      inventoryBtn.hidden=true;
    }
    if(deepLiftBackpackBtn){
      const backpackReady=state.phase==='reward'||state.phase==='failed';
      deepLiftBackpackBtn.hidden=!backpackReady;
      deepLiftBackpackBtn.classList.toggle('is-open',document.body.classList.contains('deep-lift-inventory-open'));
    }
    if(weaponSwitchBtn){
      const canSwitch=canSwitchWeaponMode();
      weaponSwitchBtn.hidden=true;
      weaponSwitchBtn.textContent=`${state.weaponMode==='projectile'?'Ranged':'Melee'}: ${activeWeaponLabel()}`;
    }
    if(weaponHelpEl){
      weaponHelpEl.hidden=!canSwitchWeaponMode();
      weaponHelpEl.textContent=`Q switches weapon (${state.weaponMode==='projectile'?'ranged':'melee'})`;
    }
    if(extractBtn){
      extractBtn.hidden=!(state.phase==='reward'||state.phase==='failed');
      extractBtn.disabled=false;
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
