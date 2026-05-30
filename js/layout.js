// Ore layout, rocks, and weak-point placement
let rocks = [];
function rand(min,max){ return min+Math.random()*(max-min); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function rockVisualScale(rock){
  const depthScale=(rock.depth&&rock.depth.scale)||1;
  return (rock.scale||1)*depthScale*(rock.hovered?1.05:1);
}
function rockVisualRadius(rock){
  return rock.radius*1.17*rockVisualScale(rock);
}
function chainWorldPoint(rock){
  const s=rockVisualScale(rock);
  return {x:rock.x+Math.cos(chain.angle)*chain.dist*s,y:rock.y+Math.sin(chain.angle)*chain.dist*s};
}
function weightedOre(){
  const boost=rareFinderBonus();
  const zone=typeof currentMineZone==='function'?currentMineZone():{id:'starter'};
  const zoneWeights=zone.id==='crystal'
    ? {hardstone:90,gold:5,diamond:2.5,ruby:1.8,aether:0.3}
    : {stone:82,copper:14,iron:3.2,gold:0.8};
  const keys=ORE_KEYS.filter(k=>zoneWeights[k]);
  const weights=keys.map(k=>{
    const common=['stone','hardstone'].includes(k);
    return common?Math.max(1,zoneWeights[k]*(1-boost*2.2)):zoneWeights[k]*(1+boost*2.4);
  });
  const total=weights.reduce((s,w)=>s+w,0);
  let r=Math.random()*total;
  for(let i=0;i<keys.length;i++){r-=weights[i];if(r<=0)return keys[i];}
  return zone.id==='crystal'?'hardstone':'stone';
}
function genPoly(radius,sides){
  const pts=[];
  const a0=Math.random()*Math.PI*2;
  for(let i=0;i<sides;i++){
    const a=a0+(i/sides)*Math.PI*2+(Math.random()-0.5)*(Math.PI/sides)*0.6;
    const r=radius*(0.72+Math.random()*0.28);
    pts.push({x:Math.cos(a)*r,y:Math.sin(a)*r});
  }
  return pts;
}
function genOreDetails(radius,type){
  const veinCount=type==='stone'?3:type==='gold'?7:5;
  const chipCount=8+Math.floor(Math.random()*6);
  const veins=[],chips=[];
  for(let i=0;i<veinCount;i++){
    const a=Math.random()*Math.PI*2;
    const d=radius*(0.12+Math.random()*0.55);
    const len=radius*(0.22+Math.random()*0.32);
    const wiggle=(Math.random()-0.5)*0.7;
    veins.push({
      x:Math.cos(a)*d,
      y:Math.sin(a)*d,
      x2:Math.cos(a+wiggle)*Math.min(radius*0.82,d+len),
      y2:Math.sin(a+wiggle)*Math.min(radius*0.82,d+len),
      w:2+Math.random()*3,
      a:0.28+Math.random()*0.32,
    });
  }
  for(let i=0;i<chipCount;i++){
    const a=Math.random()*Math.PI*2,d=radius*(0.18+Math.random()*0.62);
    chips.push({
      x:Math.cos(a)*d,
      y:Math.sin(a)*d,
      r:radius*(0.035+Math.random()*0.04),
      a:Math.random()*Math.PI,
      light:0.08+Math.random()*0.18,
    });
  }
  return {veins,chips};
}
function rockBreakStage(rock){
  if(!rock||!rock.maxHp)return 0;
  const damage=clamp(1-(rock.hp/rock.maxHp),0,1);
  if(damage<=0)return 0;
  return Math.min(5,Math.floor(damage*5)+1);
}
function chooseDepth(){
  const r=Math.random();
  if(r<0.24)return {layer:'background',scale:0.85,dark:0.62};
  if(r<0.78)return {layer:'mid',scale:1,dark:1};
  return {layer:'foreground',scale:1.1,dark:1.08};
}
function makeOreLayout(){
  const rareFinderNodes=Math.floor((player.upgrades.rareFinder||0)/2)*2;
  const count=LAYOUT.minOres+rareFinderNodes+Math.floor(Math.random()*(LAYOUT.maxOres-LAYOUT.minOres+1));
  const minOreDist=Math.max(96,LAYOUT.minOreDist-rareFinderNodes*4);
  const clusterCount=2+Math.floor(Math.random()*2);
  const minX=W*LAYOUT.oreMinFx,maxX=W*LAYOUT.oreMaxFx;
  const minY=H*LAYOUT.oreMinFy,maxY=H*LAYOUT.oreMaxFy;
  const playerX=W*LAYOUT.playerFx,playerY=H*LAYOUT.groundFy,cleanRadius=W*LAYOUT.cleanRadiusFx;
  const clusters=[];
  for(let i=0;i<clusterCount;i++){
    const x=rand(minX+35,maxX-35);
    const wallBulge=Math.sin((x/W)*Math.PI*5)*H*0.025;
    clusters.push({x,y:clamp(rand(minY+35,maxY-35)+wallBulge,minY,maxY)});
  }
  const spots=[];
  let attempts=0;
  while(spots.length<count&&attempts<700){
    attempts++;
    const c=clusters[Math.floor(Math.random()*clusters.length)];
    const a=Math.random()*Math.PI*2;
    const spread=Math.pow(Math.random(),0.72)*LAYOUT.clusterRadius;
    const x=clamp(c.x+Math.cos(a)*spread+rand(-30,30),minX,maxX);
    const y=clamp(c.y+Math.sin(a)*spread+rand(-20,18),minY,maxY);
    const depth=chooseDepth();
    const radius=52+Math.random()*26;
    const visualRadius=radius*depth.scale;
    if(Math.sqrt((x-playerX)**2+(y-playerY)**2)<cleanRadius)continue;
    if(spots.some(s=>Math.sqrt((x-s.x)**2+(y-s.y)**2)<Math.max(minOreDist,visualRadius+s.visualRadius+18)))continue;
    spots.push({x,y,afx:x/W,afy:y/H,depth,radius,visualRadius,embed:rand(0.10,0.30)});
  }
  while(spots.length<count&&attempts<1400){
    attempts++;
    const x=rand(minX,maxX),y=rand(minY,maxY);
    const depth=chooseDepth();
    const radius=52+Math.random()*26;
    const visualRadius=radius*depth.scale;
    if(Math.sqrt((x-playerX)**2+(y-playerY)**2)<cleanRadius)continue;
    if(spots.some(s=>Math.sqrt((x-s.x)**2+(y-s.y)**2)<Math.max(minOreDist*0.82,visualRadius+s.visualRadius+10)))continue;
    spots.push({x,y,afx:x/W,afy:y/H,depth,radius,visualRadius,embed:rand(0.10,0.30)});
  }
  return spots;
}
function createRock(x,y,afx,afy,depth=null,embed=null,plannedRadius=null){
  const type=weightedOre(),o=ORE[type];
  const radius=plannedRadius||52+Math.random()*26, sides=7+Math.floor(Math.random()*3);
  depth=depth||chooseDepth();
  return {
    x,y,afx,afy,type,radius,depth,
    embed:embed??rand(0.10,0.30),
    col:o.col,
    hi:o.hi,
    rim:o.rim,
    glow:o.glow,
    val:o.val,
    maxHp:o.hp,
    hp:o.hp,
    bonusOreChance:0,
    pts:genPoly(radius,sides),
    details:genOreDetails(radius,type),
    cracks:[],
    shakeX:0,
    shakeY:0,
    shakeF:0,
    flash:0,
    scale:0,
    hovered:false,
    dead:false,
  };
}
function spawnRocks(){
  rocks=makeOreLayout()
    .map(a=>{
      const r=createRock(a.x,a.y,a.afx,a.afy,a.depth,a.embed,a.radius);
      r.scale=0.01;
      return r;
    })
    .sort((a,b)=>a.depth.scale-b.depth.scale);
}

function resetChain(){
  chain.rock=null;
  chain.timer=0;
  chain.combo=0;
}


function setWeakPoint(rock, keepCombo=false, fromX=null, fromY=null){
  if(!rock||rock.dead){ resetChain(); return; }
  const a=Math.random()*Math.PI*2;
  const d=rock.radius*(0.38+Math.random()*0.34);
  chain.rock=rock;
  chain.angle=a;
  chain.dist=d;
  chain.targetAngle=a+(Math.random()-0.5)*1.6;
  chain.targetDist=rock.radius*(0.38+Math.random()*0.34);
  chain.pulse=0;
  chain.timer=chain.TIMEOUT;
  if(!keepCombo) chain.combo=0;
  const wp=chainWorldPoint(rock);
  if(fromX!==null&&fromY!==null){
    if(typeof spawnWeakPointPath==='function')spawnWeakPointPath(fromX,fromY,wp.x,wp.y,rock.glow||'#ffcc00');
    else spawnDirLine(fromX,fromY,wp.x,wp.y,rock.glow||'#ffcc00');
  }
  spawnRing(wp.x,wp.y,'#ffaa00',50);
}

function moveChainFromBrokenRock(rock){
  const alive=rocks.filter(r=>!r.dead&&r!==rock);
  if(alive.length===0){ resetChain(); return; }
  alive.sort((a,b)=>dist2(rock.x,rock.y,a.x,a.y)-dist2(rock.x,rock.y,b.x,b.y));
  const next=Math.random()<0.75?alive[0]:alive[Math.min(alive.length-1,Math.floor(alive.length*0.5+Math.random()*alive.length*0.5))];
  setWeakPoint(next,true,rock.x,rock.y);
}
