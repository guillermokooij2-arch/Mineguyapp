// Shop, inventory+map panel, marketplace, workbench(crafting), trader, character UI
let elCoins=document.getElementById('v-coins'),elOre=document.getElementById('v-ore'),elBrk=document.getElementById('v-brk');
const terminalUpgradeList=document.getElementById('terminal-upgrade-list');
const terminalCoins=document.getElementById('terminal-coins');
const backdrop=document.getElementById('ui-backdrop');
const backpackToggle=document.getElementById('backpack-toggle');
const backpackBack=document.getElementById('backpack-back');
const backpackTitle=document.getElementById('backpack-title');
const backpackKicker=document.getElementById('backpack-kicker');
const inventoryGrid=document.getElementById('inventory-grid');
const itemTooltip=document.getElementById('item-tooltip');
const backpackMapPanel=document.getElementById('backpack-map-panel'),backpackMapClose=document.getElementById('backpack-map-close');
const marketplacePanel=document.getElementById('marketplace-panel'),marketClose=document.getElementById('market-close'),sellAllOresBtn=document.getElementById('sell-all-ores'),sellAllForgedBtn=document.getElementById('sell-all-forged'),marketOreList=document.getElementById('market-ore-list'),marketForgedList=document.getElementById('market-forged-list');
const workbenchPanel=document.getElementById('workbench-panel'),workbenchClose=document.getElementById('workbench-close');
const traderPanel=document.getElementById('trader-panel'),traderClose=document.getElementById('trader-close'),traderList=document.getElementById('trader-list');
const traderCharacterBtn=document.getElementById('trader-character'),traderCharacterImg=document.getElementById('trader-character-img'),traderSpeech=document.getElementById('trader-speech');
const characterPanel=document.getElementById('character-panel'),characterClose=document.getElementById('character-close'),charStatsList=document.getElementById('char-stats-list');
const minerHud=document.getElementById('miner-hud');
let commandBuffsEl=null,mhudXpNext=null;
const chainDisplay=document.getElementById('chain-display'),chainNum=document.getElementById('chain-num');
let mhudLevel=document.getElementById('mhud-level'),mhudXpFill=document.getElementById('mhud-xp-fill');
let _prevCombo=0;
let _comboBreakerPlayed=false;

let traderStateIndex=0;
let traderResetTimer=null;
let traderAutoTimer=null;

// â”€â”€ PANEL MANAGEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALL_PANEL_ELS=[backpackMapPanel,marketplacePanel,workbenchPanel,traderPanel,characterPanel,tavernPanel];
let backpackScreen='inventory';
let terminalReturnScreen='inventory';
let mapDetailOpen=false;
