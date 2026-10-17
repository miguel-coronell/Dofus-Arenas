/* ============================================================
   LISTA DE MONSTRUOS  ·  AQUÍ se añaden los monstruos nuevos
   ------------------------------------------------------------
   1) Guarda el PNG en  assets/monsters/  (fondo transparente, mirando a la DERECHA).
   2) Añade UNA línea a la lista de abajo. Nada más (no hace falta tocar index.html).

   Campos:  id   → nombre interno único, sin espacios
            n    → nombre que se ve en el juego
            hp   → vida
            png  → nombre del archivo dentro de assets/monsters/
            spells (opcional) → hechizo(s): 'picotazo' | 'mordisco' | 'aguijon' | 'baba'   (ver js/data/spells/spells.js)
            scale (opcional)  → 1 = tamaño normal (todos iguales). 1.3 = jefe más grande
            ax (opcional)     → x de los pies en el PNG si el monstruo NO está centrado
            arenas (opcional) → ['pradera','volcan'] para que solo aparezca en esas arenas (si no, sale en todas)
            kamas (opcional)  → [min,max] kamas extra al vencerlo (además de las del combate)
            drops (opcional)  → [['id_objeto',0.25]] objetos que puede soltar (id de js/data/items/*.js) con su probabilidad (0.25 = 25 %) POR MONSTRUO VENCIDO.
                                Tercer valor opcional = cantidad: ['cuero_rustico',0.6,[1,2]]. Sueltan RECURSOS: con ellos se fabrican los sets (oficios). La ventana «Oficios» y «Sets» muestran qué monstruo suelta cada recurso y con qué %.
            resist (opcional) → {tierra:20,fuego:-10,agua:0,aire:5} resistencia % por elemento (negativo = debilidad; tope ±50). Sin esto: 0 %
            ico (opcional)    → emoji que se ve mientras no haya PNG (si pones png, se usa el PNG)
            lv (opcional)     → [min,max] nivel de jugador al que aparece (así cada zona suelta SUS recursos). Sin esto sale a cualquier nivel

   Ejemplo (quita las // para activarlo):
     {id:'goblin', n:'Goblin', hp:90, png:'goblin.png', spells:['mordisco']},
     {id:'dragon', n:'Dragón', hp:240, png:'dragon.png', spells:['aguijon'], scale:1.4, arenas:['volcan']},
   ============================================================ */
const MONSTRUOS=[
 // ← añade aquí tus monstruos. Mientras no tengan PNG se ve su emoji (ico).
 // Los monstruos sueltan RECURSOS (partes) con las que los jugadores FABRICAN sus sets en los oficios (js/data/crafts.js).
 /* ===== Zona Raíz (nivel 1-35) → Set Raíz ===== */
 {id:'jabali',n:'Jabalí Pardo',ico:'🐗',hp:70,lv:[1,35],spells:['mordisco'],kamas:[10,30],drops:[['cuero_rustico',.8,[1,3]],['colmillo',.5,[1,2]],['pocion_vida_menor',.08]]},
 {id:'cuervo',n:'Cuervo Musgoso',ico:'🐦‍⬛',hp:50,lv:[1,35],spells:['picotazo'],kamas:[8,24],drops:[['pluma_negra',.75,[1,3]],['cuero_rustico',.2]]},
 {id:'babosa',n:'Babosa del Prado',ico:'🐌',hp:60,lv:[1,35],spells:['baba'],kamas:[8,22],drops:[['baba_viscosa',.8,[1,3]],['savia',.2]]},
 {id:'ent',n:'Ent Joven',ico:'🌳',hp:110,scale:1.25,lv:[1,35],spells:['mordisco'],kamas:[30,60],drops:[['savia',.7,[1,3]],['cuero_rustico',.4,[1,2]],['colmillo',.2],['pan_guerrero',.1]]},
 /* ===== Zona Brasa (nivel 15-70) → Set Brasa ===== */
 {id:'lagarto',n:'Lagarto de Ceniza',ico:'🦎',hp:90,lv:[15,70],spells:['picotazo'],kamas:[40,90],drops:[['cuero_curtido',.7,[1,2]],['carbon',.25]]},
 {id:'escorpion',n:'Escorpión Ígneo',ico:'🦂',hp:80,lv:[15,70],spells:['aguijon'],kamas:[40,90],drops:[['aguijon_ardiente',.7,[1,2]],['cuero_curtido',.2]]},
 {id:'murcielago',n:'Murciélago de Magma',ico:'🦇',hp:70,lv:[15,70],spells:['picotazo'],kamas:[40,90],drops:[['ala_magma',.6,[1,2]],['aguijon_ardiente',.2]]},
 {id:'golem_brasa',n:'Gólem de Brasa',ico:'🌋',hp:140,scale:1.3,lv:[15,70],spells:['mordisco'],kamas:[80,160],drops:[['carbon',.75,[1,3]],['cuero_curtido',.35],['ala_magma',.15],['elixir_piedra',.08]]},
 /* ===== Zona Abismo (nivel 40-130) → Set Abismo ===== */
 {id:'cangrejo',n:'Cangrejo Abisal',ico:'🦀',hp:120,lv:[40,130],spells:['mordisco'],kamas:[120,260],drops:[['cuero_escamoso',.7,[1,2]],['perla_abisal',.15]]},
 {id:'medusa',n:'Medusa Oscura',ico:'🪼',hp:100,lv:[40,130],spells:['aguijon'],kamas:[120,260],drops:[['tentaculo',.65,[1,2]],['perla_abisal',.2]]},
 {id:'tiburon',n:'Tiburón de Fondo',ico:'🦈',hp:150,lv:[40,130],spells:['mordisco'],kamas:[140,300],drops:[['cuero_escamoso',.5,[1,2]],['perla_abisal',.3]]},
 {id:'kraken',n:'Kraken Menor',ico:'🐙',hp:220,scale:1.35,lv:[40,130],spells:['aguijon'],kamas:[200,400],drops:[['perla_abisal',.55,[1,2]],['tentaculo',.5,[1,2]],['cuero_escamoso',.3],['pocion_vida',.08]]},
 /* ===== Zona Titán (nivel 90-200) → Set Titán ===== */
 {id:'gigante',n:'Gigante de Roca',ico:'🗿',hp:260,scale:1.3,lv:[90,200],spells:['mordisco'],kamas:[300,600],drops:[['fragmento_roca',.7,[1,3]],['cuero_titan',.2]]},
 {id:'quimera',n:'Quimera Antigua',ico:'🦁',hp:220,lv:[90,200],spells:['aguijon'],kamas:[300,600],drops:[['cuero_titan',.65,[1,2]],['fragmento_roca',.2]]},
 {id:'hidra',n:'Hidra Menor',ico:'🐍',hp:240,lv:[90,200],spells:['baba'],kamas:[300,600],drops:[['cuero_titan',.5,[1,2]],['escama_dragon',.15],['fragmento_roca',.2]]},
 {id:'dragon',n:'Dragón Joven',ico:'🐉',hp:300,scale:1.45,lv:[90,200],spells:['aguijon'],kamas:[400,900],drops:[['escama_dragon',.5,[1,2]],['cuero_titan',.4],['fragmento_roca',.25],['pocion_gran_vida',.06]]},
];
/* MON(def) registra UN monstruo (lo usan también los archivos de zonas extra). resist:{tierra:20,aire:-10} = % de resistencia por elemento (negativo = debilidad) */
const MON=m=>Registry.add('monsters',m.id,{n:m.n,ico:m.ico,hp:m.hp||80,sprite:m.png?{src:'assets/monsters/'+m.png,ax:m.ax}:undefined,scale:m.scale,arenas:m.arenas,lv:m.lv,kamas:m.kamas,drops:m.drops,resist:m.resist,spells:m.spells||['mordisco']});
MONSTRUOS.forEach(MON);
