/* dungeons.js · MAZMORRAS (tablón 🏰 de la sala de espera). Cada mazmorra = 3 salas: 2 de monstruos y la del JEFE. Se entra con el nivel indicado y se puede ir en equipo (👥).
   DUNGEON(id, nombre, nivel, jefe, icono del jefe, [[esbirro1, icono],[esbirro2, icono]])
   El botín sale solo: recursos del «tier» del nivel + el TROFEO del jefe (recurso que se vende en el mercado). Para PNG propios: assets/monsters/ y añade sprite en Registry.monsters['d_<id>_boss'].
   Para una mazmorra nueva añade UNA línea abajo. */
Registry.dungeons={};
const DTIER=lv=>lv<15?['cuero_rustico','colmillo','pluma_negra','baba_viscosa','savia']:lv<40?['cuero_curtido','aguijon_ardiente','carbon','ala_magma']:lv<80?['cuero_escamoso','perla_abisal','tentaculo']:['cuero_titan','fragmento_roca','escama_dragon'];
const DSP=['mordisco','picotazo','aguijon','baba'];
/* resistencias de la mazmorra: cada esbirro resiste un elemento y es débil a otro (según el nivel); el jefe resiste los cuatro y tiene UN punto débil */
const DRES=(lv,i,boss)=>{const r=clamp(Math.floor(lv/8),2,25),b=Math.floor(lv/10)+i,o={};
 if(boss){ELS.forEach(e=>o[e]=Math.round(r*.6));o[ELS[(b+1)%4]]=-Math.round(r*.4)}else{o[ELS[b%4]]=r;o[ELS[(b+2)%4]]=-Math.round(r/2)}return o};
function DUNGEON(id,n,lv,boss,bico,mins){
 const tier=DTIER(lv).filter(i=>Registry.items[i]),tr='trofeo_'+id;REC(tr,'Trofeo: '+boss,bico,lv,Math.round(60+lv*14),'Trofeo del jefe de la '+n+'.');
 mins.forEach(([mn,ico],i)=>Registry.add('monsters','d_'+id+'_'+i,{n:mn,ico,hp:40+lv*2,spells:[DSP[i%4]],dun:id,resist:DRES(lv,i,false),kamas:[Math.ceil(lv/2),lv],drops:tier.slice(0,3).map((t,k)=>[t,.45-k*.08,[1,2]])}));
 Registry.add('monsters','d_'+id+'_boss',{n:boss,ico:bico,hp:90+lv*4,scale:1.4,spells:DSP.slice(),dun:id,boss:true,resist:DRES(lv,0,true),kamas:[lv*5,lv*9],drops:[[tr,1],...tier.slice(0,3).map(t=>[t,.8,[2,4]])]});
 Registry.add('dungeons',id,{id,n,lv,boss,bico,rooms:3,mins:mins.map((m,i)=>'d_'+id+'_'+i),bossId:'d_'+id+'_boss'})}
/* ---- niveles 1-50 (bajo nivel) ---- */
DUNGEON('incarnam','Mazmorra de Incarnam',10,'Milububo Celestial','🦢',[['Chafer de Incarnam','💀'],['Piwi Celeste','🐦']]);
DUNGEON('campos','Mazmorra de los Campos',20,'Girasol Hambriento','🌻',[['Cuervo Campestre','🐦‍⬛'],['Espantapájaros','🎃']]);
DUNGEON('enarenada','Mazmorra Enarenada',20,'Mob Lasponja','🧽',[['Cangrejo de Arena','🦀'],['Medusa Seca','🪼']]);
DUNGEON('jalato','Mazmorra Jalató',30,'Jalató Real','🐗',[['Jalató Joven','🐗'],['Jalató Guerrero','🐖']]);
DUNGEON('mansion','Mansión Encantada',30,'Hipo Campia','👻',[['Fantasma Sirviente','👻'],['Calabaza Hechizada','🎃']]);
DUNGEON('nawidad','Mazmorra de Nawidad',30,'Papá Nowa','🎅',[['Duende Nevado','🧝'],['Muñeco de Nieve','⛄']]);
DUNGEON('tofus','Mazmorra de los Tofus',40,'Tofu Real','🐤',[['Tofu Malvado','🐥'],['Tofu Negro','🐦‍⬛']]);
DUNGEON('brumen','Laboratorio de Brumen Tinctorias',40,'Brumen Tinctorias','🧪',[['Probeta Viviente','⚗️'],['Rata de Laboratorio','🐀']]);
DUNGEON('esqueletos','Mazmorra de los Esqueletos',40,'Zanahowia','🥕',[['Chafer Arquero','🏹'],['Chafer Lancero','🦴']]);
DUNGEON('larvas','Mazmorra de las Larvas',40,'Larva Dorada','🐛',[['Larva Azul','🐛'],['Larva Naranja','🐌']]);
DUNGEON('herreros','Mazmorra de los Herreros',40,'Maestro Cuerbok','🔨',[['Aprendiz Herrero','⚒️'],['Yunque Animado','🔩']]);
DUNGEON('kwoknan','El Nido del Kwoknan',40,'Kwoknan','🦅',[['Kwak de Hielo','🦆'],['Kwak de Fuego','🐓']]);
DUNGEON('kanibola','Mazmorra Kaníbola',50,'Kaníbola Daldrrak','🦖',[['Kaníbola Cazador','🦴'],['Kaníbola Chamán','🪘']]);
DUNGEON('escarahojas','Mazmorra de los Escarahojas',50,'Escarahojas Inmortal','🪲',[['Escarahojas Obrero','🪲'],['Escarahojas Guardián','🐞']]);
DUNGEON('gelatinas','Dimensión de las Gelatinas',50,'Gelatina Real','🟦',[['Gelatina Menta','🟩'],['Gelatina Fresa','🟥']]);
/* ---- niveles 51-100 (nivel medio) ---- */
DUNGEON('wabbit','Castillo del Wey Wabbit',60,'Wey Wabbit','🐰',[['Wabbit Guardia','🐇'],['Wabbit Mago','🐰']]);
DUNGEON('bworks','Mazmorra de los Bworks',60,'Bwork Kawaï','👹',[['Bwork Mago','🧙'],['Bwork Arquero','🏹']]);
DUNGEON('blops','Mazmorra de los Blops',70,'Multiblop','🟣',[['Blop Coco','🟤'],['Blop Indigo','🟣']]);
DUNGEON('crujidores','Mazmorra de los Crujidores',80,'Crujidor Legendario','🪨',[['Crujidor Menor','🪨'],['Crujidor Pétreo','⛰️']]);
DUNGEON('casatofu','Casa del Tofu Real',80,'Tofu Real Supremo','👑',[['Tofu Guardia Real','🐥'],['Tofu Cortesano','🐤']]);
DUNGEON('otomai','El Arca de Otomai',80,'Gorkoc','🦑',[['Tribu Tiburón','🦈'],['Pirata Tortuga','🐢']]);
/* ---- niveles 101-200 (alto nivel y Frigost) ---- */
DUNGEON('ratas','Mazmorra de las Ratas de Bonta',110,'Rata Blanca','🐀',[['Rata Guardia','🐀'],['Rata Alquimista','🧪']]);
DUNGEON('jalamuts','Invernadero de los Jalamuts',128,'Jalamut Real','🐜',[['Jalamut Obrero','🐜'],['Jalamut Soldado','🦗']]);
DUNGEON('roganegra','Restos de Roca Negra',150,'Ben el Ripata','🏴‍☠️',[['Pirata Fantasma','☠️'],['Cañón Maldito','💣']]);
DUNGEON('obsidiantre','Hipogeo del Obsidiantre',160,'Obsidiantre','🌋',[['Obsidiana Viva','🪨'],['Magma Furioso','🔥']]);
DUNGEON('morsaguino','Excavación del Morsagüino Real',162,'Morsagüino Real','🦭',[['Morsagüino Cazador','🦭'],['Oso Polar','🐻‍❄️']]);
DUNGEON('gelifux','Guarida de los Gelifux',190,'Tengu Gelifux','🧊',[['Gelifux Menor','❄️'],['Espíritu Helado','🥶']]);
