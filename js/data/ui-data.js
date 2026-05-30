// Static UI data shared by classic browser scripts.
const MARKET_ORE_ICONS={
  hardstone:'images/ore-icons/mined-hardstone.png',
  stone:'images/ore-icons/mined-stone.png',
  copper:'images/ore-icons/mined-copper.png',
  iron:'images/ore-icons/mined-iron.png',
  gold:'images/ore-icons/mined-gold.png',
  diamond:'images/ore-icons/mined-diamond.png',
  ruby:'images/ore-icons/mined-ruby.png',
  aether:'images/ore-icons/mined-aether.png',
};
const TRADER_UPGRADE_IMAGES={
  rareFinder:'images/trader/upgrade-rare-finder.png',
  stackSize:'images/trader/upgrade-stack-compression.png',
  forgeSkill:'images/trader/upgrade-forge-skill.png',
};
const TRADER_STATES=[
  {
    id:"idle",
    image:"images/trader/trader-idle.png",
    text:"Don't let the lanterns burn all night."
  },
  {
    id:"interested",
    image:"images/trader/trader-interested.png",
    text:"Oh, you've got an eye for it."
  },
  {
    id:"persuasive",
    image:"images/trader/trader-persuasive.png",
    text:"I've held onto this longer than I should've."
  },
  {
    id:"dangerous",
    image:"images/trader/trader-dangerous.png",
    text:"Some prices aren't paid in coin."
  }
];
const TRADER_DIALOGUE={
  idle:"Don't let the lanterns burn all night.",
  clicked:"Looking to make something rare?",
  itemHover:"Oh, you've got an eye for it.",
  combineOpen:"Let's see what these pieces become.",
  lacksMaterials:"Not enough stock for that, friend.",
  upgradeReady:"That pile has weight. I can work with it.",
  upgradeBought:"There. Sharper than it was.",
  combineResult:"Now that has a little story in it.",
  tradeOpen:"Put the right pieces on the table.",
};

// Map x/y values are percentages of the travel-map image; adjust them to reposition a node.
const MAP_LOCATIONS=[
  {
    id:'mineshaft',
    name:'Mineshaft',
    sub:'Mine ore nodes',
    x:12.4,
    y:28.1,
    labelPos:'top',
    state:'available',
    assetLabel:'MINE',
    action:'starter-mine',
    asset:'images/map-icons/mineshaft.png',
    animation:null,
  },
  {
    id:'marketplace',
    name:'Market',
    sub:'Sell ores',
    x:42,
    y:20.6,
    labelPos:'top',
    assetLabel:'MKT',
    action:'marketplace',
    asset:'images/map-icons/market.png',
    animation:null,
  },
  {
    id:'workbench',
    name:'Workbench',
    sub:'Craft parts',
    x:62.4,
    y:46,
    labelPos:'top',
    assetLabel:'WRK',
    action:'workbench',
    asset:'images/map-icons/workbench.png',
    animation:null,
  },
  {
    id:'trader',
    name:'Trader',
    sub:'Buy items',
    x:77.7,
    y:22.7,
    labelPos:'top',
    assetLabel:'TRD',
    action:'trader',
    asset:'images/map-icons/trader.png',
    animation:null,
  },
  {
    id:'tavern',
    name:'Tavern',
    sub:'Missions & risk',
    x:28.6,
    y:68,
    labelPos:'top',
    assetLabel:'TAV',
    action:'tavern',
    asset:'images/map-icons/tavern.png',
    animation:null,
  },
  {
    id:'sys-terminal',
    name:'SYS Terminal',
    sub:'Permanent upgrades',
    x:67.3,
    y:71.7,
    labelPos:'top',
    assetLabel:'SYS',
    action:'terminal',
    asset:'images/map-icons/sys-terminal.png',
    animation:null,
  },
  {
    id:'deep-lift',
    name:'Deep Lift',
    sub:'Unlocks at Lv 5',
    x:49.7,
    y:93,
    labelPos:'top',
    state:'levelLocked',
    assetLabel:'LFT',
    action:'deep-lift',
    asset:'images/map-icons/deep-lift.png',
    animation:null,
  },
  {
    id:'crystal-vein',
    name:'Crystal Vein',
    sub:'Unlocks at Lv 30',
    x:91,
    y:59,
    labelPos:'top',
    state:'levelLocked',
    assetLabel:'GEM',
    action:'crystal-vein',
    asset:'images/map-icons/crystal-vein.png',
    animation:null,
  },
];

