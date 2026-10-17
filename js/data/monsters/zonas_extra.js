/* zonas_extra.js · zonas nuevas de monstruos (sueltan los recursos de los sets Brisa, Pétreo y Celestial) + RESISTENCIAS de los monstruos de siempre.
   Se carga DESPUÉS de monstruos.js. MON({...}) registra un monstruo (mismos campos que en monstruos.js).
   MRES(id,{tierra:20,aire:-10}) pone resistencias a un monstruo que ya existe (negativo = debilidad: recibe más daño de ese elemento). */
const MRES=(id,r)=>{const m=Registry.monsters[id];if(m)m.resist=r};
/* ===== Zona Raíz (tierra/naturaleza: débil al fuego) ===== */
MRES('jabali',{tierra:10,fuego:-10});MRES('cuervo',{aire:15,tierra:-10});MRES('babosa',{agua:15,fuego:-15});MRES('ent',{tierra:20,agua:10,fuego:-25});
/* ===== Zona Brasa (fuego: débil al agua) ===== */
MRES('lagarto',{fuego:15,agua:-10});MRES('escorpion',{fuego:10,tierra:5,agua:-10});MRES('murcielago',{fuego:10,aire:10,agua:-15});MRES('golem_brasa',{fuego:30,tierra:10,agua:-25});
/* ===== Zona Abismo (agua: débil al aire) ===== */
MRES('cangrejo',{agua:10,tierra:15,aire:-10});MRES('medusa',{agua:20,aire:-20});MRES('tiburon',{agua:15,fuego:5,aire:-10});MRES('kraken',{agua:30,tierra:10,aire:-25});
/* ===== Zona Titán (todos resisten; cada uno con su punto débil) ===== */
MRES('gigante',{tierra:35,fuego:10,aire:-20});MRES('quimera',{tierra:15,fuego:15,agua:-10});MRES('hidra',{agua:20,tierra:10,fuego:-15});MRES('dragon',{fuego:35,tierra:15,aire:10,agua:-25});

/* ===== Zona Brisa (nivel 25-75) → Set Brisa · débiles a la tierra ===== */
MON({id:'arpia',n:'Arpía Celeste',ico:'🦅',hp:100,lv:[25,75],spells:['picotazo'],kamas:[60,120],resist:{aire:25,tierra:-15},drops:[['pluma_tormenta',.7,[1,2]],['nube_solida',.2]]});
MON({id:'aguila_tormenta',n:'Águila Tormentosa',ico:'🦜',hp:110,lv:[25,75],spells:['picotazo'],kamas:[60,120],resist:{aire:20,agua:10,tierra:-15},drops:[['pluma_tormenta',.55,[1,2]],['cristal_rayo',.15]]});
MON({id:'elemental_aire',n:'Elemental de Viento',ico:'🌪️',hp:120,lv:[25,75],spells:['aguijon'],kamas:[70,140],resist:{aire:35,fuego:-10,tierra:-20},drops:[['nube_solida',.65,[1,2]],['cristal_rayo',.25]]});
MON({id:'wyvern',n:'Wyvern de Tormenta',ico:'🐲',hp:190,scale:1.35,lv:[25,75],spells:['aguijon'],kamas:[120,240],resist:{aire:30,fuego:10,tierra:-25},drops:[['cristal_rayo',.5,[1,2]],['pluma_tormenta',.5,[1,2]],['nube_solida',.3],['pocion_vida',.08]]});
/* ===== Zona Pétrea (nivel 60-140) → Set Pétreo · débiles al agua y al aire ===== */
MON({id:'basilisco',n:'Basilisco de Roca',ico:'🦎',hp:180,lv:[60,140],spells:['mordisco'],kamas:[180,340],resist:{tierra:30,fuego:10,agua:-15,aire:-10},drops:[['roca_pulida',.7,[1,2]],['musgo_antiguo',.25]]});
MON({id:'escarabajo',n:'Escarabajo Pétreo',ico:'🪲',hp:170,lv:[60,140],spells:['mordisco'],kamas:[180,340],resist:{tierra:35,aire:-20},drops:[['musgo_antiguo',.65,[1,2]],['roca_pulida',.3]]});
MON({id:'golem_cuarzo',n:'Gólem de Cuarzo',ico:'💎',hp:240,scale:1.3,lv:[60,140],spells:['mordisco'],kamas:[240,440],resist:{tierra:40,fuego:15,agua:-25,aire:-15},drops:[['cuarzo_bruto',.6,[1,2]],['roca_pulida',.4]]});
MON({id:'troll',n:'Troll de Montaña',ico:'🧌',hp:290,scale:1.4,lv:[60,140],spells:['mordisco'],kamas:[300,520],resist:{tierra:25,agua:10,fuego:-20},drops:[['cuarzo_bruto',.5,[1,2]],['musgo_antiguo',.5,[1,2]],['roca_pulida',.4],['pocion_gran_vida',.05]]});
/* ===== Zona Celestial (nivel 140-200) → Set Celestial · resisten casi todo; el punto débil depende del monstruo ===== */
MON({id:'serafin',n:'Serafín Corrupto',ico:'😇',hp:300,lv:[140,200],spells:['aguijon'],kamas:[500,900],resist:{fuego:25,aire:25,tierra:10,agua:-20},drops:[['pluma_serafin',.55,[1,2]],['polvo_estelar',.3]]});
MON({id:'fenix',n:'Fénix Eterno',ico:'🔥',hp:320,lv:[140,200],spells:['aguijon'],kamas:[500,900],resist:{fuego:40,aire:15,agua:-30},drops:[['polvo_estelar',.6,[1,3]],['esencia_celeste',.25]]});
MON({id:'guardian_estelar',n:'Guardián Estelar',ico:'🌟',hp:360,scale:1.35,lv:[140,200],spells:['mordisco'],kamas:[600,1000],resist:{tierra:30,agua:30,fuego:-20,aire:-15},drops:[['esencia_celeste',.6,[1,2]],['polvo_estelar',.4,[1,2]],['pluma_serafin',.2]]});
MON({id:'leviatan',n:'Leviatán del Vacío',ico:'🐋',hp:440,scale:1.5,lv:[140,200],spells:['baba'],kamas:[800,1400],resist:{agua:40,tierra:15,fuego:15,aire:-30},drops:[['esencia_celeste',.55,[1,3]],['pluma_serafin',.4,[1,2]],['polvo_estelar',.4],['pocion_gran_vida',.08]]});
