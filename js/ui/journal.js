const JOURNAL_DESTINATION_PAGES={
  mineshaft:'mineshaft',
  'crystal-vein':'mineshaft',
  workbench:'workbench',
  trader:'trader',
};

let minerJournalButton=null;
let minerJournalModal=null;
let minerJournalLastFocus=null;
let minerJournalObserver=null;

function minerJournalPageForDestination(destination=currentDestination){
  return JOURNAL_DESTINATION_PAGES[destination]||'mineshaft';
}
function syncMinerJournalButton(){
  if(!minerJournalButton)return;
  const page=JOURNAL_DESTINATION_PAGES[currentDestination];
  const gameActive=document.body.classList.contains('game-active');
  minerJournalButton.hidden=!page||!gameActive;
}
function setMinerJournalPage(page){
  const safePage=['mineshaft','workbench','trader'].includes(page)?page:'mineshaft';
  document.querySelectorAll('[data-journal-page]').forEach(el=>{
    el.hidden=el.dataset.journalPage!==safePage;
  });
  document.querySelectorAll('[data-journal-tab]').forEach(btn=>{
    const selected=btn.dataset.journalTab===safePage;
    btn.setAttribute('aria-selected',selected?'true':'false');
    btn.tabIndex=selected?0:-1;
  });
}
function openMinerJournal(page=minerJournalPageForDestination()){
  if(!minerJournalModal)return;
  minerJournalLastFocus=document.activeElement;
  setMinerJournalPage(page);
  minerJournalModal.hidden=false;
  document.body.classList.add('journal-open');
  setCursorLayerMode('ui');
  const activeTab=minerJournalModal.querySelector('[data-journal-tab][aria-selected="true"]');
  requestAnimationFrame(()=>activeTab&&activeTab.focus());
}
function closeMinerJournal(options={}){
  if(!minerJournalModal||minerJournalModal.hidden)return;
  minerJournalModal.hidden=true;
  document.body.classList.remove('journal-open');
  if(!options.keepFocus&&minerJournalLastFocus&&minerJournalLastFocus.focus)minerJournalLastFocus.focus();
  if(!document.body.classList.contains('panel-open'))setCursorLayerMode('world');
}
function initMinerJournal(){
  minerJournalButton=document.getElementById('miner-journal-button');
  minerJournalModal=document.getElementById('miner-journal-modal');
  if(!minerJournalButton||!minerJournalModal)return;
  minerJournalButton.addEventListener('click',()=>openMinerJournal());
  minerJournalModal.querySelectorAll('[data-journal-close]').forEach(btn=>{
    btn.addEventListener('click',()=>closeMinerJournal());
  });
  minerJournalModal.querySelectorAll('[data-journal-tab]').forEach(btn=>{
    btn.addEventListener('click',()=>setMinerJournalPage(btn.dataset.journalTab));
  });
  document.addEventListener('keydown',event=>{
    if(minerJournalModal.hidden)return;
    if(event.key==='Escape'){
      event.preventDefault();
      closeMinerJournal();
      return;
    }
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      const tabs=Array.from(minerJournalModal.querySelectorAll('[data-journal-tab]'));
      const index=tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true');
      const dir=event.key==='ArrowRight'?1:-1;
      const next=tabs[(index+dir+tabs.length)%tabs.length];
      if(next){
        event.preventDefault();
        setMinerJournalPage(next.dataset.journalTab);
        next.focus();
      }
    }
  });
  if(typeof MutationObserver!=='undefined'&&!minerJournalObserver){
    minerJournalObserver=new MutationObserver(syncMinerJournalButton);
    minerJournalObserver.observe(document.body,{attributes:true,attributeFilter:['class','data-destination']});
  }
  syncMinerJournalButton();
}
