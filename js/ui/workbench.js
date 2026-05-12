// â”€â”€ WORKBENCH CRAFTING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RARITY_COLS={ junk:'#7b7469', common:'#88bb55', uncommon:'#5599dd', rare:'#cc77ff', epic:'#ff66aa', legendary:'#ff9900', mythic:'#f7f0b8', god:'#66f7ff' };
const TYPE_ICONS={ junk:'JNK', pickaxe:'PCK', ring:'RNG', amulet:'AMU', gem:'GEM', charm:'CHM', relic:'RLC' };
function typeIcon(t){ return TYPE_ICONS[t]||'ITM'; }
function craftItemIconSrc(itemId){ return `images/workbench/items/${itemId}.png`; }
function craftItemIconHtml(itemId,def,className='crafted-item-art'){
  const glow=(def&&def.glow)||(def&&def.col)||'#ffd27a';
  return `<img class="${className}" src="${craftItemIconSrc(itemId)}" alt="" style="--item-glow:${glow}">`;
}
function craftTierIconHtml(recipe){
  const iconMap={relic:'gold'};
  return `<img class="craft-tier-icon-art" src="images/workbench/tiers/${iconMap[recipe.id]||recipe.id}.png" alt="">`;
}

let _craftBusy=false;
let craftOfferings={};

function oreCounts(){
  const counts={};
  player.inventory.forEach(s=>{if(s&&s.kind!=='item')counts[s.type]=(counts[s.type]||0)+s.count;});
  return counts;
}
function getCraftOffer(recipe, counts=oreCounts()){
  const existing=craftOfferings[recipe.id]||{};
  const offer={};
  ORE_KEYS.forEach(type=>{
    const available=counts[type]||0;
    if(available<=0)return;
    const current=existing[type]??0;
    offer[type]=Math.max(0,Math.min(available,Math.floor(current)));
  });
  craftOfferings[recipe.id]=offer;
  return offer;
}
function setCraftOffer(recipe,type,value){
  const counts=oreCounts();
  const offer=getCraftOffer(recipe,counts);
  offer[type]=Math.max(0,Math.min(counts[type]||0,Math.floor(value)||0));
  craftOfferings[recipe.id]=offer;
  renderCraftRecipes();
}
function addMinimumCraftOffer(recipe,type){
  const counts=oreCounts();
  const offer=getCraftOffer(recipe,counts);
  const ore=ORE[type];
  const available=counts[type]||0;
  if(!ore||available<=0)return;
  const current=offer[type]||0;
  const add=Math.max(1,Math.ceil((recipe.minValue||ore.val)/Math.max(1,ore.val)));
  offer[type]=Math.max(0,Math.min(available,current+add));
  craftOfferings[recipe.id]=offer;
  renderCraftRecipes();
}
function forgeChancePercentages(weights){
  const total=Object.values(weights).reduce((sum,n)=>sum+n,0)||1;
  return RARITY_ORDER
    .filter(r=>weights[r]>0)
    .map(r=>({rarity:r,pct:weights[r]/total*100}));
}
function currentSmeltRecipe(){
  const level=player.upgrades.forgeSkill||0;
  return CRAFT_RECIPES
    .filter(recipe=>level>=recipe.minForgeLevel)
    .sort((a,b)=>b.minForgeLevel-a.minForgeLevel)[0]||CRAFT_RECIPES[0];
}
function nextSmeltRecipe(){
  const level=player.upgrades.forgeSkill||0;
  return CRAFT_RECIPES
    .filter(recipe=>recipe.minForgeLevel>level)
    .sort((a,b)=>a.minForgeLevel-b.minForgeLevel)[0]||null;
}

function renderWorkbench(){
  // If forge/result are mid-animation, don't reset them
  if(_craftBusy) return;
  _showWorkbenchPhase('recipes');
  renderCraftRecipes();
}

function _showWorkbenchPhase(phase){
  // phases: 'recipes', 'forge', 'result'
  const recipeEl=document.getElementById('craft-recipe-list');
  const offeringEl=document.getElementById('craft-offering-section');
  const forgeEl =document.getElementById('craft-forge');
  const resultEl=document.getElementById('craft-result');
  if(recipeEl) recipeEl.classList.toggle('hidden', phase!=='recipes');
  if(offeringEl) offeringEl.classList.toggle('hidden', phase!=='recipes');
  if(forgeEl)  forgeEl.classList.toggle('hidden',  phase!=='forge');
  if(resultEl) resultEl.classList.toggle('hidden',  phase!=='result');
}

function renderCraftRecipes(){
  const list=document.getElementById('craft-recipe-list');
  if(!list)return;
  const counts=oreCounts();
  const hasItemSpace=player.inventory.some((s,idx)=>idx<activeInventorySize()&&s===null);
  const forgeLevel=player.upgrades.forgeSkill||0;
  list.innerHTML='';
  const recipe=currentSmeltRecipe();
  const nextRecipe=nextSmeltRecipe();
    const offer=getCraftOffer(recipe,counts);
    const value=offeringValue(recipe,offer);
    const minValue=recipe.minValue||0;
    const meetsMinimum=value>=minValue;
    const canAfford=Object.entries(offer).some(([,n])=>n>0)&&Object.entries(offer).every(([t,n])=>(counts[t]||0)>=n)&&meetsMinimum;
    const canForge=canAfford&&hasItemSpace;
    const card=document.createElement('div');
    card.className='craft-card'+(canForge?'':' craft-card-locked');
    const ownedTypes=ORE_KEYS.filter(t=>(counts[t]||0)>0);
    const costHtml=ownedTypes.length?ownedTypes.map(t=>{
      const has=counts[t]||0,amount=offer[t]||0;
      const icon=MARKET_ORE_ICONS&&MARKET_ORE_ICONS[t]?MARKET_ORE_ICONS[t]:'';
      return `<div class="craft-offer-control${amount>0?' craft-offer-used':''}" style="--ore-col:${ORE[t].col};--ore-glow:${ORE[t].glow||ORE[t].hi}">
        <span class="craft-offer-ore">
          ${icon?`<img src="${icon}" alt="">`:''}
          <strong>${ORE[t].lbl}</strong>
          <em>${ORE[t].val}v each · Bag ${has}</em>
        </span>
        <div class="craft-stepper">
          <button type="button" data-type="${t}" data-delta="-1">-</button>
          <input type="number" min="0" max="${has}" value="${amount}" data-type="${t}">
          <button type="button" data-type="${t}" data-delta="1">+</button>
        </div>
        <button class="craft-fill-btn" type="button" data-type="${t}" data-fill-min="1">+ Min Value</button>
      </div>`;
    }).join(''):`<div class="craft-empty-offer">No mined ore in your backpack.</div>`;
    const rarHtml=recipe.rarities.map(r=>`<span class="rarity-chip" style="color:${RARITY_COLS[r]};border-color:${RARITY_COLS[r]}40">${RARITY_LABELS[r]||r}</span>`).join('');
    const weights=forgeRarityWeights(recipe,offer);
    const chanceHtml=forgeChancePercentages(weights).map(({rarity,pct})=>`<span style="color:${RARITY_COLS[rarity]||'#d6a85f'}">${RARITY_LABELS[rarity]||rarity}: ${pct<1?pct.toFixed(1):Math.round(pct)}%</span>`).join('');
    const quality=Math.round(offeringOreQuality(offer)*100);
    const offerTypes=Object.entries(offer).filter(([,n])=>n>0).map(([t,n])=>`${n} ${ORE[t].lbl}`).join(' + ')||'No ore selected';
    const offerAmount=Object.values(offer).reduce((sum,n)=>sum+n,0);
    const nextText=nextRecipe?`${nextRecipe.name} at Forge Lv ${nextRecipe.minForgeLevel}`:'Max forge tier';
    card.innerHTML=`
      <div class="craft-card-top">
        <span class="craft-card-icon">${craftTierIconHtml(recipe)}</span>
        <div class="craft-card-info">
          <div class="craft-card-name">${recipe.name}</div>
          <div class="craft-card-desc">${recipe.desc}</div>
        </div>
      </div>
      <div class="craft-cost-row">${costHtml}</div>
      <div class="craft-offer-row">
        <span>Selected Ore <strong>${offerTypes}</strong></span>
        <span>Amount <strong>${offerAmount}</strong></span>
        <span>Minimum Value <strong>${minValue}v</strong></span>
        <span>Offering Value <strong>${value}v</strong></span>
        <span>Ore Quality <strong>${quality}%</strong></span>
      </div>
      <div class="craft-tier-row">
        <span>Current Forge Level <strong>${forgeLevel}</strong></span>
        <span>Next Unlock <strong>${nextText}</strong></span>
      </div>
      <div class="craft-rar-row">${rarHtml}</div>
      <div class="craft-chance-row">${chanceHtml}</div>`;
    const anvilWrap=document.createElement('div');
    anvilWrap.className='craft-anvil-wrap';
    const forgeStatus=!hasItemSpace?'Backpack Full':canForge?'Strike Anvil':value>0?`Need ${Math.max(0,minValue-value)} more value`:'Select Ore';
    anvilWrap.innerHTML=`
      <button class="craft-anvil-button" type="button" aria-label="Forge ${recipe.name}" ${canForge?'':'disabled'}>
        <img class="craft-anvil-hero craft-anvil-hero-normal" src="images/workbench/anvil-normal.png" alt="">
        <img class="craft-anvil-hero craft-anvil-hero-hover" src="images/workbench/anvil-hover.png" alt="">
      </button>
      <div class="craft-anvil-status">${forgeStatus}</div>`;
    anvilWrap.querySelector('.craft-anvil-button').addEventListener('click',e=>{
      e.stopPropagation();
      attemptCraft(recipe);
    });
    card.appendChild(anvilWrap);
    card.querySelectorAll('.craft-stepper button').forEach(stepBtn=>{
      stepBtn.addEventListener('click',()=>{
        const type=stepBtn.dataset.type;
        setCraftOffer(recipe,type,(offer[type]||0)+Number(stepBtn.dataset.delta||0));
      });
    });
    card.querySelectorAll('.craft-fill-btn').forEach(fillBtn=>{
      fillBtn.addEventListener('click',()=>addMinimumCraftOffer(recipe,fillBtn.dataset.type));
    });
    card.querySelectorAll('.craft-stepper input').forEach(input=>{
      input.addEventListener('change',()=>setCraftOffer(recipe,input.dataset.type,Number(input.value)));
    });
    list.appendChild(card);
}

function attemptCraft(recipe){
  if(_craftBusy)return;
  const counts=oreCounts();
  const offer=getCraftOffer(recipe,counts);
  const hasItemSpace=player.inventory.some((s,idx)=>idx<activeInventorySize()&&s===null);
  if(!hasItemSpace)return;
  if(offeringValue(recipe,offer)<(recipe.minValue||0))return;
  if(!Object.entries(offer).every(([type,count])=>(counts[type]||0)>=count))return;
  // Consume ores from inventory
  for(const [type,need] of Object.entries(offer)){
    let rem=need;
    for(let i=0;i<player.inventory.length&&rem>0;i++){
      const s=player.inventory[i];
      if(s&&s.kind!=='item'&&s.type===type){ const take=Math.min(s.count,rem); s.count-=take; rem-=take; if(s.count<=0)player.inventory[i]=null; }
    }
  }
  saveGame(); renderInventory();
  _craftBusy=true;
  // Reveal only after the video finishes; fallback timers handle playback failure.
  _showWorkbenchPhase('forge');
  if(window.GameAudio)GameAudio.setForgeLoop(true);
  if(workbenchPanel)workbenchPanel.classList.add('workbench-forging');
  const lblEl=document.getElementById('craft-forge-label');
  const videoEl=document.getElementById('craft-forge-video');
  const steps=['HEATING...','RAISING HAMMER...','STRIKING...','FORGING...'];
  let si=0;
  if(lblEl)lblEl.textContent=steps[0];
  const lblTimer=setInterval(()=>{ if(lblEl)lblEl.textContent=steps[si++%steps.length]; },320);
  let done=false;
  let fallbackTimer=null;
  const finishForge=()=>{
    if(done)return;
    done=true;
    clearInterval(lblTimer);
    if(fallbackTimer)clearTimeout(fallbackTimer);
    if(videoEl){
      videoEl.pause();
      videoEl.removeEventListener('ended',finishForge);
      videoEl.removeEventListener('loadedmetadata',setVideoFallback);
    }
    if(window.GameAudio)GameAudio.setForgeLoop(false);
    const resultId=rollForgeRecipe(recipe,offer);
    if(workbenchPanel){
      workbenchPanel.classList.remove('workbench-forging');
      workbenchPanel.classList.add('workbench-reveal');
      setTimeout(()=>workbenchPanel.classList.remove('workbench-reveal'),700);
    }
    _showForgeResult(resultId, recipe.name);
    _craftBusy=false;
  };
  const setVideoFallback=()=>{
    if(done)return;
    if(fallbackTimer)clearTimeout(fallbackTimer);
    const safetyMs=Number.isFinite(videoEl.duration)&&videoEl.duration>0?(videoEl.duration*1000)+1200:30000;
    fallbackTimer=setTimeout(finishForge,safetyMs);
  };
  if(videoEl){
    videoEl.addEventListener('ended',finishForge,{once:true});
    try{ videoEl.currentTime=0; }catch(e){}
    videoEl.muted=!!(window.GameAudio&&GameAudio.isMuted&&GameAudio.isMuted());
    videoEl.volume=0.78;
    videoEl.addEventListener('loadedmetadata',setVideoFallback,{once:true});
    setVideoFallback();
    const playPromise=videoEl.play();
    if(playPromise&&typeof playPromise.catch==='function'){
      playPromise.catch(()=>{
        if(fallbackTimer)clearTimeout(fallbackTimer);
        fallbackTimer=setTimeout(finishForge,2200);
      });
    }
  } else {
    fallbackTimer=setTimeout(finishForge,2200);
  }
}

function _showForgeResult(itemId, recipeName){
  _showWorkbenchPhase('result');
  const inner=document.getElementById('craft-result-inner');
  if(!inner)return;
  if(!itemId){
    // No result
    inner.innerHTML=`
      <div class="forge-result-wrap forge-result-fail">
        <div class="forge-result-glyph">...</div>
        <div class="forge-result-title" style="color:#aa8866">No result...</div>
        <div class="forge-result-sub">The forge yields only smoke. The ores were spent.</div>
      </div>`;
    requestAnimationFrame(()=>{
      if(typeof playForgeResultEffect==='function')playForgeResultEffect(inner.querySelector('.forge-result-wrap'),'junk');
    });
  } else {
    const def=CRAFT_ITEM_DEFS[itemId];
    const rc=RARITY_COLS[def.rarity];
    const full=!player.inventory.some((s,idx)=>idx<activeInventorySize()&&s===null);
    if(full){
      inner.innerHTML=`
        <div class="forge-result-wrap forge-result-full">
          <div class="forge-result-glyph">${craftItemIconHtml(itemId,def,'forge-result-item-art')}</div>
          <div class="forge-result-title" style="color:#ff8855">Backpack full!</div>
          <div class="forge-result-name" style="color:${def.col}">${def.name}</div>
          <span class="rarity-chip" style="color:${rc};border-color:${rc}40">${def.rarity}</span>
          <div class="forge-result-sub" style="margin-top:8px">${def.desc}</div>
          <div class="forge-result-hint">Make room in the backpack before crafting.</div>
        </div>`;
    } else {
      addCraftedItem(itemId);
      noteForgedItemStats(itemId);
      if(window.GameAudio)GameAudio.playPurchase();
      saveGame();
      renderInventory();
      floatTxt(W*0.5,H*0.22,`${def.name} crafted!`,def.glow||rc,true);
      inner.innerHTML=`
        <div class="forge-result-wrap forge-result-success" style="--rc:${rc}">
          <div class="forge-result-glyph forge-result-glyph-glow">${craftItemIconHtml(itemId,def,'forge-result-item-art')}</div>
          <div class="forge-result-title">Forged!</div>
          <div class="forge-result-name" style="color:${def.col}">${def.name}</div>
          <span class="rarity-chip" style="color:${rc};border-color:${rc}40;font-size:11px;padding:3px 9px">${def.rarity}</span>
          <div class="forge-result-desc">${def.desc}</div>
          <div class="forge-result-sub">Added to Backpack as a crafting part.</div>
        </div>`;
      requestAnimationFrame(()=>{
        if(typeof playForgeResultEffect==='function')playForgeResultEffect(inner.querySelector('.forge-result-wrap'),def.rarity);
      });
    }
  }
}

