// Particles, ore pickups, floating text, cracks, and shake
let particles=[],orePickups=[],floatTexts=[];
const PERF_LIMITS = {
  maxCanvasParticles: 180,
  maxUiParticles: 60,
  maxCoinFlyers: 24,
  maxAutoCritsPerSwing: 9,
};
const EFFECT_LIMITS = {
  maxParticles: PERF_LIMITS.maxCanvasParticles,
  normalHitParticles: 8,
  finalBreakParticles: 32,
};
const MAX_PARTICLES=EFFECT_LIMITS.maxParticles;
const MAX_FLOAT_TEXTS=60;
let activeUiParticles=0;
let inventoryRenderPending=false;
let backpackTarget={x:0,y:0,valid:false,checkedAt:0};
function reducedMiningMotion(){
  return !!(window.MINE_TYCOON_SETTINGS&&window.MINE_TYCOON_SETTINGS.reducedMotion);
}
function miningFxCount(amount,min=0){
  return reducedMiningMotion()?Math.max(min,Math.ceil(amount*0.45)):amount;
}
function hasMiningItem(itemId){
  if(!itemId||!player)return false;
  const slots=[...(player.inventory||[]),...(player.craftedItems||[])];
  return slots.some(slot=>slot&&(slot.itemId||slot.id)===itemId);
}
function miningPickaxeAbility(){
  return typeof getBestPickaxeChainAbility==='function'?getBestPickaxeChainAbility():null;
}
function hitPoint(rock,x,y){
  return {
    x:Number.isFinite(x)?x:rock.x,
    y:Number.isFinite(y)?y:rock.y,
  };
}
function pushFlash(x,y,col,r,life=10,alpha=0.35){
  particles.push({type:'flash',x,y,r,life,maxL:life,col:col||'#ffd060',alpha,vx:0,vy:0,g:0});
}
function requestInventoryRender(){
  if(inventoryRenderPending||typeof renderInventory!=='function')return;
  inventoryRenderPending=true;
  requestAnimationFrame(()=>{
    inventoryRenderPending=false;
    renderInventory();
  });
}
function getBackpackTarget(){
  const now=performance.now();
  if(backpackTarget.valid&&now-backpackTarget.checkedAt<120)return backpackTarget;
  const bpBtn=document.getElementById('backpack-toggle');
  if(bpBtn){
    const r=bpBtn.getBoundingClientRect();
    const world=screenToWorld(r.left+r.width*0.5,r.top+r.height*0.5);
    backpackTarget={x:world.x,y:world.y,valid:true,checkedAt:now};
  }else{
    backpackTarget={x:W*0.15,y:H*0.67,valid:true,checkedAt:now};
  }
  return backpackTarget;
}
// Keep these for breakRock and stage-transition effects (still used, just not for normal hits)
function spawnSparks(x,y,n,col,spd=1){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    const s=(2+Math.random()*6)*spd;
    particles.push({
      type:'spark',
      x,y,
      vx:Math.cos(a)*s,
      vy:Math.sin(a)*s-1.5,
      life:20+Math.random()*20,
      maxL:42,
      col:col||'#ffd060',
      sz:1.5+Math.random()*2.5,
      g:0.18,
    });
  }
}
function spawnChunks(x,y,col,n){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    const s=2+Math.random()*7;
    particles.push({
      type:'chunk',
      x,y,
      vx:Math.cos(a)*s,
      vy:Math.sin(a)*s-4,
      life:40+Math.random()*28,
      maxL:68,
      col,
      sz:4+Math.random()*7,
      rot:Math.random()*Math.PI*2,
      rotSpd:(Math.random()-0.5)*0.28,
      g:0.35,
    });
  }
}
function spawnDust(x,y,n,spread=1){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    const s=(1.2+Math.random()*4.8)*spread;
    particles.push({
      type:'dust',
      x,y,
      vx:Math.cos(a)*s,
      vy:Math.sin(a)*s-1.2,
      life:24+Math.random()*28,
      maxL:54,
      col:Math.random()>0.55?'#5b5148':'#2d2825',
      sz:3+Math.random()*5,
      g:0.08,
    });
  }
}
function spawnRing(x,y,col,maxR=70){
  particles.push({type:'ring',x,y,r:8,maxR,life:22,maxL:22,col,lw:3});
  if(!reducedMiningMotion())particles.push({type:'ring',x,y,r:4,maxR:maxR*0.6,life:16,maxL:16,col:'#fff',lw:1.5});
}
function spawnDirLine(x1,y1,x2,y2,col,life=48){
  const l=reducedMiningMotion()?Math.min(24,life):life;
  particles.push({type:'dirline',x1,y1,x2,y2,life:l,maxL:l,col:col||'#ffcc00'});
}
function spawnArcLine(x1,y1,x2,y2,col,life=30,weight=2){
  const dx=x2-x1,dy=y2-y1,d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
  const nx=-dy/d,ny=dx/d;
  const segments=reducedMiningMotion()?3:5;
  const pts=[{x:x1,y:y1}];
  for(let i=1;i<segments;i++){
    const t=i/segments;
    const bend=(Math.random()-0.5)*Math.min(28,d*0.18);
    pts.push({x:x1+dx*t+nx*bend,y:y1+dy*t+ny*bend});
  }
  pts.push({x:x2,y:y2});
  const l=reducedMiningMotion()?Math.min(18,life):life;
  particles.push({type:'arc',pts,life:l,maxL:l,col:col||'#9fe8ff',weight});
}
function spawnWeakPointPath(x1,y1,x2,y2,col,ability=miningPickaxeAbility()){
  if(!Number.isFinite(x1)||!Number.isFinite(y1)||!Number.isFinite(x2)||!Number.isFinite(y2))return;
  if(ability&&ability.itemId==='iron_pick'){
    spawnArcLine(x1,y1,x2,y2,'#a7efff',30,2.2);
    if(!reducedMiningMotion())spawnArcLine(x1,y1,x2,y2,'rgba(214,249,255,0.7)',18,1);
    return;
  }
  if(ability&&ability.itemId==='starforged_pick'){
    spawnArcLine(x1,y1,x2,y2,'#dbe6ff',34,2.4);
    return;
  }
  spawnDirLine(x1,y1,x2,y2,col);
}
function spawnImpactChips(rock,x,y,amount,falling=false){
  const count=miningFxCount(amount,1);
  for(let i=0;i<count;i++){
    const a=falling?Math.PI*0.5+(Math.random()-0.5)*0.7:Math.random()*Math.PI*2;
    const s=falling?1.2+Math.random()*2.1:1.8+Math.random()*3.4;
    particles.push({
      type:'chunk',
      x,y,
      vx:Math.cos(a)*s,
      vy:Math.sin(a)*s-(falling?0:1.8),
      life:falling?32+Math.random()*10:22+Math.random()*16,
      maxL:falling?42:38,
      col:rock.col,
      sz:2.2+Math.random()*3.6,
      rot:Math.random()*Math.PI*2,
      rotSpd:(Math.random()-0.5)*0.22,
      g:falling?0.24:0.2,
    });
  }
}
function autoCritVisualPower(ability){
  const rarityPower={trader:1.1,common:1,uncommon:1.18,rare:1.38,epic:1.65,legendary:2,mythic:2.35,god:2.7};
  return Math.max(rarityPower[ability&&ability.rarity]||1,1+Math.min(10,(ability&&ability.maxHits)||1)*0.12);
}
function autoCritVisualColor(ability){
  const effect=ability&&ability.effect;
  if(effect==='fire')return '#ff7a34';
  if(effect==='gold')return '#ffe071';
  if(effect==='lightning')return '#9fe8ff';
  return '#b7ff9a';
}
function spawnForgedCritFlavor(rock,x,y,ability=miningPickaxeAbility()){
  if(!ability)return;
  if(ability.itemId==='sunlit_pick'){
    pushFlash(x,y,'#ff8a42',rock.radius*0.34,12,0.48);
    spawnSparks(x,y,miningFxCount(5,2),'#ff8b3f',1.18);
    particles.push({type:'streak',x,y,life:20,maxL:20,col:'#ff7a34',count:miningFxCount(8,4)});
  }else if(ability.itemId==='alloy_king_pick'){
    spawnRing(x,y,'#ffe071',rock.radius*0.86);
    pushFlash(rock.x,rock.y,'#fff09a',rock.radius*0.62,12,0.34);
  }else if(ability.itemId==='starforged_pick'&&ORE[rock.type]&&ORE[rock.type].rarity==='rare'){
    particles.push({type:'glint',x,y,r:rock.radius*0.35,life:24,maxL:24,col:'#eef4ff'});
  }
}
function spawnForgedBreakFlavor(rock){
  const ability=miningPickaxeAbility();
  if(!ability)return;
  if(ability.itemId==='sunlit_pick'){
    pushFlash(rock.x,rock.y,'#ff9a52',rock.radius*0.92,18,0.48);
    spawnSparks(rock.x,rock.y,miningFxCount(8,3),'#ff7a34',1.25);
  }else if(ability.itemId==='alloy_king_pick'){
    spawnRing(rock.x,rock.y,'#ffe071',rock.radius*1.12);
  }else if(ability.itemId==='starforged_pick'&&ORE[rock.type]&&ORE[rock.type].rarity==='rare'){
    particles.push({type:'glint',x:rock.x,y:rock.y,r:rock.radius*0.72,life:30,maxL:30,col:'#f6fbff'});
  }
}
function spawnRockHitEffect(rock,x,y,isCrit=false,combo=0){
  if(!rock||rock.dead)return;
  const p=hitPoint(rock,x,y);
  if(!isCrit){
    pushFlash(p.x,p.y,rock.glow||'#f6d399',Math.max(9,rock.radius*0.18),8,0.28);
    spawnImpactChips(rock,p.x,p.y,2+Math.floor(Math.random()*3));
    rock.flash=Math.max(rock.flash||0,0.42);
    rock.shakeF=Math.max(rock.shakeF||0,reducedMiningMotion()?2:4);
    if(!reducedMiningMotion())gs.shakeAmt=Math.max(gs.shakeAmt,1.6);
    return;
  }
  const col=rock.glow||'#ffe071';
  pushFlash(p.x,p.y,col,Math.max(18,rock.radius*0.34),12,0.44);
  spawnRing(p.x,p.y,col,Math.max(38,rock.radius*0.82));
  spawnSparks(p.x,p.y,miningFxCount(combo>0?5:4,2),col,1.05);
  particles.push({type:'streak',x:p.x,y:p.y,life:18,maxL:18,col,count:miningFxCount(7,4)});
  rock.flash=Math.max(rock.flash||0,0.9);
  rock.shakeF=Math.max(rock.shakeF||0,reducedMiningMotion()?3:7);
  if(!reducedMiningMotion())gs.shakeAmt=Math.max(gs.shakeAmt,Math.min(7,3.2+combo*0.08));
  spawnForgedCritFlavor(rock,p.x,p.y);
}
function spawnStageFractureEffect(rock,x,y,stage){
  if(!rock||rock.dead)return;
  const p=hitPoint(rock,x,y);
  const col=rock.glow||rock.hi||'#ffd060';
  pushFlash(rock.x,rock.y,col,rock.radius*(0.44+Math.min(5,stage)*0.06),14,0.32);
  spawnDust(p.x,p.y,miningFxCount(5,2),0.56);
  spawnImpactChips(rock,p.x,p.y,1,true);
}
function spawnRockBreakEffect(rock){
  if(!rock)return;
  spawnDust(rock.x,rock.y,miningFxCount(24,8),1.25);
  spawnChunks(rock.x,rock.y,rock.col,miningFxCount(18,6));
  pushFlash(rock.x,rock.y,rock.glow||'#ffd060',rock.radius*1.02,18,0.42);
  spawnForgedBreakFlavor(rock);
}
function spawnChainMilestoneEffect(rock,x,y,combo){
  if(!rock||combo<=0)return;
  const col=rock.glow||'#ffee70';
  if(combo===5){
    spawnRing(x,y,col,Math.max(52,rock.radius));
    pushFlash(x,y,col,rock.radius*0.42,12,0.4);
  }else if(combo===10){
    spawnRing(x,y,col,Math.max(72,rock.radius*1.18));
    pushFlash(rock.x,rock.y,col,rock.radius*0.8,16,0.42);
  }else if(combo>=20&&combo%20===0){
    spawnRing(rock.x,rock.y,col,rock.radius*1.42);
    particles.push({type:'streak',x:rock.x,y:rock.y,life:25,maxL:25,col,count:miningFxCount(14,6)});
    pushFlash(rock.x,rock.y,col,rock.radius,20,0.45);
  }
}
function spawnProxyEchoEffect(source,target,x,y){
  if(!source||!target)return;
  const ruby=hasMiningItem('ruby_damage_idol');
  const ability=miningPickaxeAbility();
  if(ruby){
    spawnArcLine(x,y,target.x,target.y,'#ff667d',26,2);
    spawnRing(target.x,target.y,'#ff667d',Math.max(32,target.radius*0.62));
  }else if(ability&&ability.itemId==='alloy_king_pick'){
    spawnDirLine(x,y,target.x,target.y,'#ffe071',26);
    pushFlash(target.x,target.y,'#ffe071',target.radius*0.34,10,0.28);
  }else if(ability&&ability.itemId==='starforged_pick'){
    spawnArcLine(x,y,target.x,target.y,'#e6efff',24,1.8);
  }
}
function spawnAutoCritImpact(x,y,rock,ability,combo,fromX,fromY){
  const power=autoCritVisualPower(ability), col=autoCritVisualColor(ability);
  spawnWeakPointPath(fromX,fromY,x,y,col,ability);
  spawnSparks(x,y,miningFxCount(Math.round(5*power),2),col,0.8+power*0.25);
  spawnRing(x,y,col,34+power*18);
  particles.push({type:'streak',x,y,life:18+power*7,maxL:18+power*7,col,count:miningFxCount(Math.round(5+power*3),4)});
  if(power>=1.5)spawnDust(x,y,miningFxCount(Math.round(3*power),1),0.8+power*0.15);
  if(power>=2&&rock)spawnImpactChips(rock,x,y,Math.round(2+power));
  if(!reducedMiningMotion())gs.shakeAmt=Math.max(gs.shakeAmt,Math.min(12,2.5+power*2.4));
  if(rock)spawnForgedCritFlavor(rock,x,y,ability);
  if(combo%3===0)floatTxt(x,y-24,power>=2?'CRIT STORM':'AUTO CRIT',col,false);
}
function spawnOre(x,y,type,n){
  const o=ORE[type];
  for(let i=0;i<n;i++){
    const a=-Math.PI*0.5+(Math.random()-0.5)*Math.PI*1.3;
    const s=2.5+Math.random()*4;
    orePickups.push({
      x,y,type,
      col:o.col,
      glow:o.glow,
      val:o.val,
      vx:Math.cos(a)*s+(Math.random()-0.5)*2,
      vy:Math.sin(a)*s-1,
      sz:6+Math.random()*5,
      rot:Math.random()*Math.PI*2,
      rotSpd:(Math.random()-0.5)*0.18,
      life:200,
      magnet:false,
      done:false,
    });
  }
}
function floatTxt(x,y,txt,col,big=false){
  floatTexts.push({x,y,txt,col:col||'#ffd060',life:55,vy:-1.3,big});
  if(floatTexts.length>MAX_FLOAT_TEXTS)floatTexts.splice(0,floatTexts.length-MAX_FLOAT_TEXTS);
}
function pulseBackpackReceive(){
  const bpBtn=document.getElementById('backpack-toggle');
  if(!bpBtn)return;
  bpBtn.classList.remove('receiving');
  void bpBtn.offsetWidth;
  bpBtn.classList.add('receiving');
  clearTimeout(bpBtn._receiveTimer);
  bpBtn._receiveTimer=setTimeout(()=>bpBtn.classList.remove('receiving'),280);
}

// Crack effects
function addCrack(rock){
  const a=Math.random()*Math.PI*2;
  const len=rock.radius*(0.4+Math.random()*0.5);
  const s=0.08;
  const c={
    x1:Math.cos(a)*rock.radius*s,
    y1:Math.sin(a)*rock.radius*s,
    x2:Math.cos(a)*len,
    y2:Math.sin(a)*len,
  };

  if(Math.random()>0.45){
    const ba=a+(Math.random()-0.5)*1.1;
    const bl=len*(0.3+Math.random()*0.35);
    const bp=0.35+Math.random()*0.3;
    c.bx=c.x1+(c.x2-c.x1)*bp;
    c.by=c.y1+(c.y2-c.y1)*bp;
    c.bx2=c.bx+Math.cos(ba)*bl;
    c.by2=c.by+Math.sin(ba)*bl;
  }

  rock.cracks.push(c);
}

function updateParticles(){
  if(particles.length>MAX_PARTICLES)particles.splice(0,particles.length-MAX_PARTICLES);
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];

    if(p.type!=='ring'&&p.type!=='dirline'&&p.type!=='arc'&&p.type!=='flash'&&p.type!=='streak'&&p.type!=='glint'){
      p.x+=p.vx*dtScale;
      p.y+=p.vy*dtScale;
      p.vx*=Math.pow(0.91,dtScale);
      p.vy+=(p.g||0)*dtScale;
      if(p.rot!==undefined)p.rot+=p.rotSpd*dtScale;
    }

    p.life-=dtScale;
    if(p.life<=0)particles.splice(i,1);
  }
}
function updateOrePickups(){
  const bp=getBackpackTarget(),bpX=bp.x,bpY=bp.y;
  for(let i=orePickups.length-1;i>=0;i--){
    const o=orePickups[i];
    if(o.done){orePickups.splice(i,1);continue;}
    o.x+=o.vx*dtScale;o.y+=o.vy*dtScale;o.vy+=0.12*dtScale;o.vx*=Math.pow(0.96,dtScale);o.rot+=o.rotSpd*dtScale;o.life-=dtScale;
    // After initial arc, pull toward backpack button
    if(o.life<160){
      const dx=bpX-o.x,dy=bpY-o.y,dn=Math.sqrt(dx*dx+dy*dy)||1;
      o.vx+=(dx/dn)*7*dtScale;o.vy+=(dy/dn)*7*dtScale;o.vx*=Math.pow(0.78,dtScale);o.vy*=Math.pow(0.78,dtScale);
    }
    const d=dist2(bpX,bpY,o.x,o.y);
    if(d<36*(1+pickupRangeBonus())){
      o.done=true;
      const ore=ORE[o.type];
      const added=addToInventory(o.type,1);
      if(!added){
        floatTxt(bpX+50,bpY,'Backpack Full','#ff6644',false);
      }else{
        addPlayerXp(Math.round((ore.xp||1)*(1+xpMultBonus())));
        if(window.GameAudio)GameAudio.playOreCollect({rare:ore.rarity==='rare'});
        if(typeof trackTavernMission==='function'){
          trackTavernMission('oreCollected',{type:o.type,count:1});
          if(ore.rarity==='rare')trackTavernMission('rareDrop',{type:o.type,count:1});
        }
        pulseBackpackReceive();
        floatTxt(bpX+50+(Math.random()-0.5)*20,bpY-20,`+1 ${ore.lbl}`,ore.glow||ore.hi,false);
        spawnSparks(bpX,bpY,6,ore.glow||'#ffcc55',0.9);
        spawnRing(bpX,bpY,ore.glow||'#ffcc55',32);
        scheduleSave();
        requestInventoryRender();
      }
    }
    if(o.life<=0)orePickups.splice(i,1);
  }
}
function updateFloatTexts(){
  for(let i=floatTexts.length-1;i>=0;i--){
    const f=floatTexts[i];
    f.y+=f.vy*dtScale;
    f.life-=dtScale;
    if(f.life<=0)floatTexts.splice(i,1);
  }
}
function updateShake(){
  if(reducedMiningMotion()){
    gs.shakeAmt*=Math.pow(0.48,dtScale);
    gs.shakeX=0;
    gs.shakeY=0;
    return;
  }
  gs.shakeAmt*=Math.pow(0.82,dtScale);
  if(gs.shakeAmt<0.1)gs.shakeAmt=0;
  gs.shakeX=(Math.random()-0.5)*gs.shakeAmt*2;
  gs.shakeY=(Math.random()-0.5)*gs.shakeAmt*2;
}

function pulseElement(targetElement,className='ui-pulse',durationMs=500){
  if(!targetElement)return;
  targetElement.classList.remove(className);
  void targetElement.offsetWidth;
  targetElement.classList.add(className);
  clearTimeout(targetElement[`_${className}Timer`]);
  targetElement[`_${className}Timer`]=setTimeout(()=>targetElement.classList.remove(className),durationMs);
}
function spawnUiSparkles(targetElement,options={}){
  if(!targetElement||activeUiParticles>=PERF_LIMITS.maxUiParticles)return;
  const amount=Math.min(options.amount||8,PERF_LIMITS.maxUiParticles-activeUiParticles);
  const rect=targetElement.getBoundingClientRect();
  const tone=options.tone||'gold';
  const layer=document.createElement('span');
  layer.className=`ui-fx-layer ui-fx-${tone}`;
  layer.setAttribute('aria-hidden','true');
  document.body.appendChild(layer);
  layer.style.left=`${rect.left}px`;
  layer.style.top=`${rect.top}px`;
  layer.style.width=`${rect.width}px`;
  layer.style.height=`${rect.height}px`;
  for(let i=0;i<amount;i++){
    const spark=document.createElement('i');
    spark.style.left=`${35+Math.random()*30}%`;
    spark.style.top=`${36+Math.random()*28}%`;
    spark.style.setProperty('--dx',`${(Math.random()-0.5)*(options.spread||110)}px`);
    spark.style.setProperty('--dy',`${-20-Math.random()*(options.lift||80)}px`);
    spark.style.animationDelay=`${Math.random()*0.08}s`;
    layer.appendChild(spark);
  }
  activeUiParticles+=amount;
  setTimeout(()=>{activeUiParticles=Math.max(0,activeUiParticles-amount);layer.remove();},options.duration||760);
}
function spawnCoinBurst(targetElement,options={}){
  spawnUiSparkles(targetElement,{amount:Math.min(options.amount||14,PERF_LIMITS.maxCoinFlyers),tone:'coin',spread:options.spread||160,lift:options.lift||130,duration:options.duration||900});
}
function playUpgradePurchaseEffect(element){
  if(!element)return;
  pulseElement(element,'upgrade-purchased',520);
  spawnUiSparkles(element,{amount:10,tone:'gold',spread:130,lift:95});
}
const RARITY_EFFECTS = {
  junk:{className:'rarity-junk-effect',particleCount:2,intensity:0.25,tone:'smoke'},
  common:{className:'rarity-common-effect',particleCount:4,intensity:0.4,tone:'smoke'},
  uncommon:{className:'rarity-uncommon-effect',particleCount:7,intensity:0.6,tone:'green'},
  rare:{className:'rarity-rare-effect',particleCount:10,intensity:0.8,tone:'gold'},
  epic:{className:'rarity-epic-effect',particleCount:14,intensity:1,tone:'purple'},
  legendary:{className:'rarity-legendary-effect',particleCount:20,intensity:1.3,tone:'gold'},
  mythic:{className:'rarity-mythic-effect',particleCount:24,intensity:1.55,tone:'blue'},
  god:{className:'rarity-god-effect',particleCount:28,intensity:1.8,tone:'blue'},
};
function getRarityEffectConfig(rarity){
  return RARITY_EFFECTS[rarity]||RARITY_EFFECTS.common;
}
function playForgeResultEffect(resultElement,rarity){
  if(!resultElement)return;
  const config=getRarityEffectConfig(rarity);
  pulseElement(resultElement,config.className,980);
  spawnUiSparkles(resultElement,{amount:config.particleCount,tone:config.tone,spread:120*config.intensity,lift:90*config.intensity,duration:920});
}
function playResultPlaqueEffect(targetElement,resultType){
  if(!targetElement)return;
  const jackpot=resultType==='jackpot';
  const good=resultType==='win'||resultType==='boost'||jackpot;
  const bad=resultType==='loss'||resultType==='curse';
  pulseElement(targetElement,`result-${jackpot?'jackpot':good?'win':'loss'}`,jackpot?960:good?760:680);
  if(good){
    spawnCoinBurst(targetElement,{amount:jackpot?28:16,spread:jackpot?245:180,lift:jackpot?185:132,duration:jackpot?1080:900});
    spawnUiSparkles(targetElement,{amount:jackpot?16:9,tone:resultType==='boost'?'purple':'gold',spread:jackpot?210:130,lift:jackpot?145:92,duration:jackpot?1060:820});
  }else if(bad){
    spawnUiSparkles(targetElement,{amount:resultType==='curse'?14:10,tone:resultType==='curse'?'blood':'smoke',spread:resultType==='curse'?150:110,lift:resultType==='curse'?62:48,duration:860});
  }
}
function playGamblingResultEffect(stageElement,messageElement,resultType){
  const jackpot=resultType==='jackpot';
  const good=resultType==='win'||resultType==='boost'||jackpot;
  const pulseClass=good?'gambling-win-burst':resultType==='curse'?'gambling-curse-burst':'gambling-loss-burst';
  if(stageElement){
    pulseElement(stageElement,pulseClass,jackpot?1200:good?920:860);
    if(good)spawnUiSparkles(stageElement,{amount:jackpot?24:13,tone:resultType==='boost'?'purple':'gold',spread:jackpot?330:220,lift:jackpot?220:150,duration:jackpot?1160:920});
    else spawnUiSparkles(stageElement,{amount:resultType==='curse'?18:12,tone:resultType==='curse'?'blood':'smoke',spread:resultType==='curse'?210:145,lift:resultType==='curse'?84:58,duration:920});
  }
  playResultPlaqueEffect(messageElement||stageElement,resultType);
}
