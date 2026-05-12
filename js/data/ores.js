// ── ORE TYPES ────────────────────────────────────────────────────────────────
const ORE = {
  stone:    { col:'#58546a', hi:'#82809a', rim:'#9a9ab0', glow:null,      val:1,   w:4,    hp:60,  lbl:'Stone',          maxStack:10, rarity:'common',    xp:1,   spritePrefix:'round-stone' },
  copper:   { col:'#a04e18', hi:'#d87030', rim:'#f09050', glow:'#e07030', val:3,   w:3,    hp:100, lbl:'Copper',         maxStack:5,  rarity:'common',    xp:4,   spritePrefix:'round-copper' },
  iron:     { col:'#526070', hi:'#80a0b8', rim:'#b0cce0', glow:'#90b8d8', val:8,   w:1.7,  hp:160, lbl:'Iron',           maxStack:4,  rarity:'uncommon',  xp:10,  spritePrefix:'round-iron' },
  gold:     { col:'#b89018', hi:'#e8c030', rim:'#fff080', glow:'#ffd040', val:24,  w:0.55, hp:250, lbl:'Gold',           maxStack:2,  rarity:'rare',      xp:30,  spritePrefix:'round-gold' },
  hardstone:{ col:'#3d4050', hi:'#6c7186', rim:'#8d92a8', glow:null,      val:1,   w:90,   hp:85,  lbl:'Hardstone',      maxStack:12, rarity:'common',    xp:1,   spritePrefix:'round-hardstone' },
  diamond:  { col:'#7bd8ff', hi:'#d8fbff', rim:'#f4ffff', glow:'#8eeaff', val:65,  w:0.22, hp:330, lbl:'Diamond',        maxStack:1,  rarity:'epic',      xp:70,  spritePrefix:'round-diamond' },
  ruby:     { col:'#b51f46', hi:'#ff6685', rim:'#ffc0cc', glow:'#ff3d6e', val:75,  w:0.16, hp:360, lbl:'Ruby',           maxStack:1,  rarity:'epic',      xp:80,  spritePrefix:'round-ruby' },
  aether:   { col:'#7254ff', hi:'#d4c8ff', rim:'#fff4ff', glow:'#b376ff', val:220, w:0.035,hp:520, lbl:'Aether Crystal', maxStack:1,  rarity:'legendary', xp:180, spritePrefix:'round-aether' },
};
const ORE_KEYS = Object.keys(ORE);

