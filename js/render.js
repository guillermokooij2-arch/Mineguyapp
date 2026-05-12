// Canvas rendering
function drawImageCover(img,x,y,w,h){
  const s=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const sw=w/s,sh=h/s;
  const sx=(img.naturalWidth-sw)*0.5,sy=(img.naturalHeight-sh)*0.5;
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}
function drawBg(){ if(imgBg.complete&&imgBg.naturalWidth){drawImageCover(imgBg,0,0,W,H);}else{ctx.fillStyle='#08050f';ctx.fillRect(0,0,W,H);} }

// ── DRAW MINER ────────────────────────────────────────────────────────────────
function drawMiner(){
  const img=sw.active?imgBack:imgFront;
  if(!img.complete||!img.naturalWidth)return;
  const dW=Math.round(W*LAYOUT.minerScale),dH=Math.round(dW*(img.naturalHeight/img.naturalWidth));
  ctx.drawImage(img,Math.round(W*LAYOUT.playerFx-dW*0.5),Math.round(H*LAYOUT.groundFy)-dH+LAYOUT.minerYOffset,dW,dH);
}

// ── DRAW ROCK ─────────────────────────────────────────────────────────────────
function drawRock(rock){
  if(rock.dead)return;
  const depth=rock.depth||{scale:1,dark:1,layer:'mid'};
  const finalScale=rockVisualScale(rock);
  const bottomDark=1-clamp((rock.y/H-0.45)*0.55,0,0.28);
  const lightWarm=clamp(1-(rock.x/W-LAYOUT.playerFx)*0.55,0.72,1);
  const tone=depth.dark*bottomDark*lightWarm;
  const embedAmt=rock.radius*(rock.embed||0.18);
  ctx.save();
  ctx.translate(rock.x+rock.shakeX,rock.y+rock.shakeY);
  ctx.scale(finalScale,finalScale);
  ctx.save();
  ctx.globalAlpha=0.18;
  ctx.fillStyle='#05030a';
  ctx.beginPath();ctx.ellipse(0,rock.radius*0.45,rock.radius*0.95,rock.radius*0.32,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha=0.28;
  ctx.fillStyle='#09060f';
  ctx.beginPath();ctx.arc(0,embedAmt*0.4,rock.radius*1.04,0,Math.PI*2);ctx.fill();
  ctx.restore();
  if(rock.hovered){ctx.shadowColor='rgba(255,220,130,0.6)';ctx.shadowBlur=10;}
  if(rock.glow){ctx.shadowColor=rock.glow;ctx.shadowBlur=(depth.layer==='background'?3:4)+Math.sin(frameTime*0.003+rock.x)*1.2;}
  const stage=rockBreakStage(rock);
  const sprite=ORE_NODE_IMAGES[rock.type]&&ORE_NODE_IMAGES[rock.type][stage];
  const canDrawSprite=sprite&&sprite.complete&&sprite.naturalWidth;
  if(canDrawSprite){
    const sz=rock.radius*2.35;
    const idle=Math.sin(frameTime*0.0026+rock.x*0.017+rock.y*0.011)*0.5+0.5;
    const glowCol=rock.glow||'rgba(180,190,205,0.45)';
    const glowAlpha=(rock.type==='stone'?0.03:0.06)+idle*(rock.type==='stone'?0.02:0.05);
    ctx.save();
    ctx.globalAlpha=glowAlpha;
    ctx.fillStyle=glowCol;
    ctx.beginPath();ctx.ellipse(0,0,rock.radius*(1.08+idle*0.08),rock.radius*(0.84+idle*0.06),0,0,Math.PI*2);ctx.fill();
    ctx.restore();
    ctx.save();
    const pulseScale=1+idle*(rock.type==='stone'?0.004:0.015);
    ctx.scale(pulseScale,pulseScale);
    ctx.shadowColor=glowCol;
    ctx.shadowBlur=(rock.type==='stone'?3:6)+idle*(rock.type==='stone'?1.5:5)+stage*0.8;
    if(rock.flash>0){ctx.filter=`brightness(${1+rock.flash*0.22})`;}
    const spriteRatio=sprite.naturalHeight/sprite.naturalWidth;
    const spriteH=sz*spriteRatio;
    ctx.drawImage(sprite,-sz/2,-spriteH/2,sz,spriteH);
    ctx.restore();
    if(tone<0.98){ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=(1-tone)*0.65;ctx.fillStyle='#05030a';ctx.beginPath();ctx.arc(0,0,rock.radius*0.98,0,Math.PI*2);ctx.fill();ctx.restore();}
  }else{
    if(rock.flash>0)ctx.globalAlpha=0.55+rock.flash*0.45;
    ctx.beginPath();ctx.moveTo(rock.pts[0].x,rock.pts[0].y);for(let i=1;i<rock.pts.length;i++)ctx.lineTo(rock.pts[i].x,rock.pts[i].y);ctx.closePath();
    const gr=ctx.createRadialGradient(-rock.radius*0.22,-rock.radius*0.30,0,0,0,rock.radius*1.1);gr.addColorStop(0,rock.hi);gr.addColorStop(0.6,rock.col);gr.addColorStop(1,rock.col);
    ctx.fillStyle=gr;ctx.fill();ctx.shadowBlur=0;
    if(rock.details){
      ctx.save();
      ctx.lineCap='round';
      ctx.strokeStyle=rock.glow||rock.hi;
      rock.details.veins.forEach(v=>{ctx.globalAlpha=v.a;ctx.lineWidth=v.w;ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(v.x2,v.y2);ctx.stroke();});
      ctx.fillStyle='#ffffff';
      rock.details.chips.forEach(ch=>{ctx.globalAlpha=ch.light;ctx.beginPath();ctx.ellipse(ch.x,ch.y,ch.r*1.6,ch.r, ch.a,0,Math.PI*2);ctx.fill();});
      ctx.restore();
    }
    if(tone<0.98){ctx.globalAlpha=(1-tone)*0.7;ctx.fillStyle='#05030a';ctx.fill();ctx.globalAlpha=1;}
    if(lightWarm>0.78){ctx.globalAlpha=(lightWarm-0.72)*0.35;ctx.fillStyle='#ffd07a';ctx.fill();ctx.globalAlpha=1;}
    ctx.strokeStyle=rock.rim||'rgba(255,255,255,0.12)';ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,0.42)';ctx.lineWidth=5;ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,0.45)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,0.8)';ctx.lineWidth=1.5;ctx.lineCap='round';
    rock.cracks.forEach(c=>{ctx.beginPath();ctx.moveTo(c.x1,c.y1);ctx.lineTo(c.x2,c.y2);ctx.stroke();if(c.bx!==undefined){ctx.beginPath();ctx.moveTo(c.bx,c.by);ctx.lineTo(c.bx2,c.by2);ctx.stroke();}});
  }
  ctx.globalAlpha=1;
  ctx.shadowBlur=0;
  // Durability chips: these empty out as the rock breaks.
  {
    const stageGap=4,stageW=15,stageTotal=5*stageW+4*stageGap;
    const remaining=Math.max(0,5-stage);
    // smooth colour: green→yellow→red based on fraction alive
    const frac=remaining/5; // 1=full, 0=dead
    const r=frac>0.5?Math.round((1-frac)*2*220):220;
    const g=frac>0.5?200:Math.round(frac*2*200);
    const liveR=r,liveG=g;
    // urgency pulse on last chip
    const urgencyPulse=remaining===1?(0.55+Math.sin(frameTime*0.012)*0.45):1;
    // flash burst synced with rock.flash
    const flashBoost=rock.flash||0;
    const barY=rock.radius+12;
    for(let i=0;i<5;i++){
      const alive=i<remaining;
      const bx=-stageTotal/2+i*(stageW+stageGap);
      ctx.beginPath();ctx.roundRect(bx,barY,stageW,5,2.5);
      if(alive){
        // per-chip glow; leading (rightmost alive) chip glows brightest
        const isLeading=i===remaining-1;
        const chipPulse=isLeading?(0.7+Math.sin(frameTime*0.009+i)*0.3):0.85;
        const alpha=Math.min(1,chipPulse*urgencyPulse+flashBoost*0.4);
        ctx.fillStyle=`rgba(${Math.round(liveR*(1+flashBoost*0.3))},${Math.round(liveG*(1-flashBoost*0.2))},${flashBoost>0.1?30:55},${alpha})`;
        ctx.shadowColor=`rgb(${liveR},${liveG},55)`;
        ctx.shadowBlur=(isLeading?3:1)+urgencyPulse*1.5+flashBoost*4;
        ctx.fill();
        ctx.shadowBlur=0;
      } else {
        ctx.fillStyle='rgba(30,26,48,0.9)';
        ctx.fill();
        // strike-through on spent chip
        ctx.strokeStyle='rgba(255,100,55,0.45)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(bx+3,barY+4);ctx.lineTo(bx+stageW-3,barY+1);ctx.stroke();
      }
    }
  }
  // Chain weak point
  if(chain.rock===rock&&chain.timer>0&&rock.scale>0.85){
    const wpx=Math.cos(chain.angle)*chain.dist, wpy=Math.sin(chain.angle)*chain.dist;
    const pulse=0.6+Math.sin(chain.pulse)*0.4;
    const urgency=1-(chain.timer/chain.TIMEOUT); // 0 to 1 as time runs out
    const urgencyCol=urgency<0.5?`rgba(255,${Math.floor(180-urgency*200)},0,0.9)`:`rgba(255,${Math.floor(80-urgency*80)},0,0.95)`;
    const hitR=weakPointLocalRadius(rock);
    // Timer arc behind the WP
    ctx.strokeStyle=urgencyCol;ctx.lineWidth=3;ctx.lineCap='round';
    ctx.shadowColor=urgencyCol;ctx.shadowBlur=4;
    ctx.beginPath();ctx.arc(wpx,wpy,hitR,-Math.PI/2,-Math.PI/2+Math.PI*2*(chain.timer/chain.TIMEOUT));ctx.stroke();
    ctx.shadowBlur=0;
    // Outer ring
    ctx.strokeStyle=`rgba(255,${Math.floor(200-urgency*150)},0,${0.35+pulse*0.15})`;
    ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(wpx,wpy,Math.max(7,hitR*0.72)+pulse*3,0,Math.PI*2);ctx.stroke();
    // Inner dot
    ctx.fillStyle=`rgba(255,230,80,${0.5+pulse*0.1})`;ctx.shadowColor='#ff8800';ctx.shadowBlur=5;
    ctx.beginPath();ctx.arc(wpx,wpy,Math.max(3,hitR*0.18)+pulse*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    // Crosshair lines
    ctx.strokeStyle='rgba(255,200,60,0.35)';ctx.lineWidth=1;
    const crossOuter=Math.max(13,hitR*1.15),crossInner=Math.max(6,hitR*0.48);
    ctx.beginPath();ctx.moveTo(wpx-crossOuter,wpy);ctx.lineTo(wpx-crossInner,wpy);ctx.moveTo(wpx+crossInner,wpy);ctx.lineTo(wpx+crossOuter,wpy);ctx.moveTo(wpx,wpy-crossOuter);ctx.lineTo(wpx,wpy-crossInner);ctx.moveTo(wpx,wpy+crossInner);ctx.lineTo(wpx,wpy+crossOuter);ctx.stroke();
  }
  ctx.restore();
}

// ── DRAW PARTICLES ────────────────────────────────────────────────────────────
function drawParticles(){
  // Batch sparks by colour to avoid per-particle shadowBlur thrash
  const sparksByCol={};
  for(const p of particles){
    if(p.type==='spark') (sparksByCol[p.col]||(sparksByCol[p.col]=[])).push(p);
  }
  for(const col in sparksByCol){
    ctx.save();
    ctx.shadowColor=col;ctx.shadowBlur=2;ctx.fillStyle=col;
    ctx.beginPath();
    for(const p of sparksByCol[col]){
      const a=Math.max(0,p.life/p.maxL);
      ctx.globalAlpha=a;
      ctx.arc(p.x,p.y,p.sz*a,0,Math.PI*2);
    }
    ctx.fill();
    ctx.restore();
  }
  // Non-spark particles drawn individually (small count)
  for(const p of particles){
    if(p.type==='spark') continue;
    const a=Math.max(0,p.life/p.maxL);
    ctx.save();ctx.globalAlpha=a;
    if(p.type==='flash'){
      ctx.globalAlpha=a*0.35;ctx.fillStyle=p.col||'#ffd060';
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    } else if(p.type==='dust'){
      const prog=1-p.life/p.maxL;
      ctx.globalAlpha=a*0.32;ctx.fillStyle=p.col;
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz*(0.45+prog*0.75),0,Math.PI*2);ctx.fill();
    } else if(p.type==='chunk'){
      ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.col;ctx.fillRect(-p.sz*0.5,-p.sz*0.4,p.sz,p.sz*0.8);
    } else if(p.type==='streak'){
      // Radial burst lines drawn as one batched path — zero extra draw calls
      const prog=1-p.life/p.maxL;
      ctx.strokeStyle=p.col;ctx.lineWidth=1;ctx.globalAlpha=a*(1-prog);
      ctx.beginPath();
      const n=p.count||8;
      for(let i=0;i<n;i++){
        const ang=(Math.PI*2/n)*i+(p.x%1)*0.8; // deterministic but varied per position
        const r0=4+prog*6, r1=r0+(8+Math.sin(i*1.7+p.x)*4)*(1-prog*0.5);
        ctx.moveTo(p.x+Math.cos(ang)*r0,p.y+Math.sin(ang)*r0);
        ctx.lineTo(p.x+Math.cos(ang)*r1,p.y+Math.sin(ang)*r1);
      }
      ctx.stroke();
    } else if(p.type==='ring'){
      const prog=1-p.life/p.maxL,rad=p.r+(p.maxR-p.r)*prog;
      ctx.strokeStyle=p.col;ctx.lineWidth=p.lw*(1-prog*0.6);ctx.shadowColor=p.col;ctx.shadowBlur=6;
      ctx.globalAlpha=a*(1-prog*0.8);ctx.beginPath();ctx.arc(p.x,p.y,rad,0,Math.PI*2);ctx.stroke();
    } else if(p.type==='dirline'){
      const prog=1-p.life/p.maxL;
      ctx.strokeStyle=p.col;ctx.lineWidth=2;ctx.setLineDash([7,5]);
      ctx.shadowColor=p.col;ctx.shadowBlur=3;ctx.globalAlpha=a*0.35;
      ctx.beginPath();ctx.moveTo(p.x1,p.y1);ctx.lineTo(p.x2,p.y2);ctx.stroke();ctx.setLineDash([]);
      const dx=p.x2-p.x1,dy=p.y2-p.y1;
      const dotX=p.x1+dx*Math.min(1,prog*2),dotY=p.y1+dy*Math.min(1,prog*2);
      ctx.globalAlpha=0.7;ctx.fillStyle='#fff';ctx.shadowColor=p.col;ctx.shadowBlur=7;
      ctx.beginPath();ctx.arc(dotX,dotY,5,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=a*0.8;ctx.fillStyle=p.col;ctx.shadowBlur=3;
      const ang=Math.atan2(dy,dx);
      ctx.save();ctx.translate(p.x2,p.y2);ctx.rotate(ang);
      ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-6,-6);ctx.lineTo(-6,6);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

// ── DRAW ORE PICKUPS ─────────────────────────────────────────────────────────
function drawOrePickups(){ orePickups.forEach(o=>{ if(o.done)return;ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);ctx.globalAlpha=Math.min(1,o.life/30);if(o.glow){ctx.shadowColor=o.glow;ctx.shadowBlur=4;}ctx.beginPath();ctx.moveTo(0,-o.sz);ctx.lineTo(o.sz*0.6,0);ctx.lineTo(0,o.sz);ctx.lineTo(-o.sz*0.6,0);ctx.closePath();ctx.fillStyle=o.col;ctx.fill();ctx.strokeStyle=o.glow||'rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.moveTo(-o.sz*0.15,-o.sz*0.5);ctx.lineTo(o.sz*0.1,-o.sz*0.1);ctx.lineTo(-o.sz*0.25,-o.sz*0.1);ctx.closePath();ctx.fill();ctx.restore(); }); }

// ── DRAW FLOAT TEXTS ──────────────────────────────────────────────────────────
function drawFloatTexts(){ floatTexts.forEach(f=>{ctx.save();ctx.globalAlpha=Math.min(1,f.life/18);ctx.fillStyle=f.col;ctx.shadowColor=f.col;ctx.shadowBlur=5;ctx.font=`bold ${f.big?17:13}px Georgia`;ctx.textAlign='center';ctx.fillText(f.txt,f.x,f.y);ctx.restore();}); }

function drawHitPoint(){
  const x=sw.active?sw.clickScreenX:gs.mx, y=sw.active?sw.clickScreenY:gs.my;
  cursorCtx.save();
  cursorCtx.globalAlpha=sw.active?0.9:0.65;
  cursorCtx.strokeStyle='rgba(255,230,120,0.95)';
  cursorCtx.fillStyle='rgba(255,245,185,0.95)';
  cursorCtx.shadowColor='#ffb13d';
  cursorCtx.shadowBlur=4;
  cursorCtx.lineWidth=1.5;
  cursorCtx.beginPath();cursorCtx.arc(x,y,4,0,Math.PI*2);cursorCtx.fill();
  cursorCtx.beginPath();cursorCtx.moveTo(x-10,y);cursorCtx.lineTo(x-6,y);cursorCtx.moveTo(x+6,y);cursorCtx.lineTo(x+10,y);cursorCtx.moveTo(x,y-10);cursorCtx.lineTo(x,y-6);cursorCtx.moveTo(x,y+6);cursorCtx.lineTo(x,y+10);cursorCtx.stroke();
  cursorCtx.restore();
}

function drawUiHandCursor(){
  const img=uiCursor.overInteractive?imgHandPoint:imgHandOpen;
  if(!img.complete||!img.naturalWidth)return;
  const baseH=uiCursor.overInteractive?66:62;
  const press=(uiCursor.pressed||uiCursor.pressT>0)?0.9:1;
  const hover=uiCursor.overInteractive?1.05:1;
  const h=baseH*press*hover;
  const w=h*(img.naturalWidth/img.naturalHeight);
  const hotX=uiCursor.overInteractive?w*0.48:w*0.52;
  const hotY=uiCursor.overInteractive?h*0.10:h*0.42;
  cursorCtx.save();
  cursorCtx.shadowColor=uiCursor.overInteractive?'rgba(255,210,112,0.78)':'rgba(255,184,82,0.42)';
  cursorCtx.shadowBlur=uiCursor.overInteractive?7:4;
  cursorCtx.globalAlpha=0.98;
  cursorCtx.drawImage(img,gs.mx-hotX,gs.my-hotY,w,h);
  cursorCtx.restore();
}

function drawCursor(){
  if(uiCursor.mode==='ui'){
    drawUiHandCursor();
    return;
  }
  drawPickaxe();
  drawHitPoint();
}

// ── DRAW PICKAXE CURSOR ───────────────────────────────────────────────────────
// Idle: metal tip (87%,7%) sits at cursor, so you aim with the tip.
// Swing : butt (40%,93%) is the fixed pivot; tip arcs toward the click target.
function getPickaxeAngle(){
  const t=clamp(sw.dur>0?sw.t/sw.dur:1,0,1);
  if(!sw.active)return sw.REST+Math.sin(frameTime*0.001)*0.04;
  if(t<0.50)return sw.REST+(sw.WIND-sw.REST)*(1-easeOut(t/0.50));
  return sw.WIND+(sw.STRIKE-sw.WIND)*easeOut((t-0.50)/0.50);
}
function drawPickaxe(){
  const pickImg=activePickaxeImage();
  if(!pickImg.complete||!pickImg.naturalWidth)return;
  const angle=getPickaxeAngle();
  const iH=typeof PICKAXE_CURSOR_DRAW_HEIGHT==='number'?PICKAXE_CURSOR_DRAW_HEIGHT:68;
  const iW=Math.round(iH*(pickImg.naturalWidth/pickImg.naturalHeight));
  cursorCtx.save();
  if(sw.active){
    // Swing: rotate around the fixed handle-butt pivot
    const st=sw.dur>0?sw.t/sw.dur:1;
    if(st>sw.HIT_AT-0.12&&st<sw.HIT_AT+0.12){cursorCtx.shadowColor='#fff8c0';cursorCtx.shadowBlur=11;}
    cursorCtx.translate(sw.pivotX,sw.pivotY);
    cursorCtx.rotate(angle);
    cursorCtx.drawImage(pickImg,-iW*0.40,-iH*0.93,iW,iH);
  } else {
    // Idle: metal tip tracks cursor exactly
    cursorCtx.translate(gs.mx,gs.my);
    cursorCtx.rotate(angle);
    cursorCtx.drawImage(pickImg,-iW*0.87,-iH*0.07,iW,iH);
  }
  cursorCtx.restore();
}
