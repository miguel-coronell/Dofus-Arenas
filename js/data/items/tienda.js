/* ============================================================
   TIENDA AMPLIADA · equipo, recursos y consumibles que vende el MERCADILLO para todos los niveles (1-200).
   Se carga DESPUÉS de los monstruos (necesita sus drops). No hace falta tocar base.js ni extra.js.
   · EQUIPO: 24 piezas de cada tipo (sombrero, capa, amuleto, anillo, cinturón, botas, arma, escudo) = 192 objetos, uno por escalón de nivel.
     Son más sencillas que las piezas de set (sin bono de set) y algo más baratas: sirven para equiparse mientras se consigue el set.
     Las estadísticas y el precio salen de las fórmulas de GEAR (abajo): cámbialas y todo el catálogo se reajusta.
   · RECURSOS: 2 por escalón (uno «blando»: telas y pieles · uno «duro»: minerales, maderas y gemas) = 48. Se compran, se venden y los sueltan los monstruos del mapa
     de ese nivel (ver DROPS al final). Con ellos se fabrica el equipo de arriba en los oficios (RECIPE).
   · CONSUMIBLES: pociones de vida, comidas de poder, elixires de armadura y de PA/PM para cada tramo de nivel.
   ============================================================ */
{   // bloque: las constantes de abajo no se mezclan con el resto del juego
const TIERS=[1,3,6,10,14,18,22,27,32,38,45,52,60,68,77,86,96,106,118,132,148,165,185,200];
const SOFT=['Lino','Lana','Algodón','Cuero','Piel de Lobo','Seda','Terciopelo','Lona','Fieltro','Gamuza','Cuero Tachonado','Piel de Oso','Seda Lunar','Escamas','Cuero de Wyvern','Pelaje Níveo','Seda Solar','Tela Rúnica','Cuero Oscuro','Piel de Behemot','Seda Astral','Tejido Arcano','Velo Celeste','Tela Eterna'];
const HARD=['Madera','Piedra','Cobre','Bronce','Hierro','Acero','Plata','Ámbar','Jade','Coral','Cobalto','Granito','Obsidiana','Ébano','Marfil','Oro','Rubí','Zafiro','Esmeralda','Ópalo','Platino','Mithril','Diamante','Éter'];
const R_SOFT=['Hilo de Lino','Madeja de Lana','Fibra de Algodón','Cuero Bruto','Piel de Lobo','Hebra de Seda','Retal de Terciopelo','Lona Reforzada','Fieltro Grueso','Gamuza Fina','Cuero Tachonado','Piel de Oso','Hilo Lunar','Escama Dura','Cuero de Wyvern','Pelaje Níveo','Hilo Solar','Tela Rúnica','Cuero Oscuro','Piel de Behemot','Hilo Astral','Fibra Arcana','Velo Celeste','Tela Eterna'];
const R_HARD=['Astilla de Madera','Piedra Tallada','Mineral de Cobre','Lingote de Bronce','Lingote de Hierro','Lingote de Acero','Pepita de Plata','Gota de Ámbar','Fragmento de Jade','Rama de Coral','Mineral de Cobalto','Bloque de Granito','Obsidiana Pulida','Madera de Ébano','Colmillo de Marfil','Pepita de Oro','Rubí en Bruto','Zafiro en Bruto','Esmeralda en Bruta','Ópalo en Bruto','Lingote de Platino','Mineral de Mithril','Diamante en Bruto','Cristal de Éter'];
/* nombre del objeto según el escalón (de lo más humilde a lo más noble) */
const NOUN={sombrero:['Gorro','Sombrero','Capucha','Casco','Yelmo','Corona'],capa:['Capa','Manto','Capote','Pelliza','Clámide','Estola'],amuleto:['Amuleto','Colgante','Talismán','Medallón','Collar','Relicario'],
 anillo:['Anillo','Sortija','Alianza','Sello','Aro','Banda'],cinturon:['Cuerda','Cinto','Cinturón','Faja','Ceñidor','Fajín'],botas:['Sandalias','Botines','Botas','Escarpes','Grebas','Zancos'],
 arma:['Daga','Espada','Hacha','Maza','Bastón','Lanza','Martillo','Arco','Guadaña','Mandoble'],escudo:['Rodela','Broquel','Escudo','Adarga','Pavés','Égida']};
const ICO={sombrero:['👒','🎩','🧢','⛑️','🪖','👑'],capa:['🧣','🧥','🧣','🧥','🧣','🧥'],amuleto:['📿','🧿','📿','🧿','📿','🧿'],anillo:['💍','💍','💍','💍','💍','💍'],cinturon:['🎗️','🎗️','🎗️','🎗️','🎗️','🎗️'],
 botas:['🩴','👞','👢','👢','🥾','🥾'],arma:['🗡️','⚔️','🪓','🔨','🪄','🔱','🔨','🏹','⚔️','🗡️'],escudo:['🛡️','🛡️','🛡️','🛡️','🛡️','🛡️']};
const EL4=['tierra','fuego','agua','aire'],RES4={tierra:'rtierra',fuego:'rfuego',agua:'ragua',aire:'raire'};
/* fórmulas: L = nivel de la pieza · e = elemento (rota entre tierra, fuego, agua y aire) · todo ×.85 respecto a las piezas de set */
const GEAR={
 sombrero:(L,e)=>({vit:6+L*1.5,[e]:3+L*.45,...(L>=20?{[RES4[e]]:1+L*.04}:{})}),
 capa:(L,e)=>({vit:5+L*1.35,[e]:3+L*.5,...(L>=60?{pow:L/14}:{})}),
 amuleto:(L,e)=>({vit:8+L*1.4,[e]:3+L*.55,...(L>=30?{pow:L/18}:{}),...(L>=50?{res:1+L/60}:{}),...(L>=120?{pa:1}:{})}),
 anillo:(L,e)=>({vit:5+L*1.0,[e]:2+L*.4,...(L>=20?{pow:L/16}:{})}),
 cinturon:(L,e)=>({vit:8+L*1.6,[e]:2+L*.3,...(L>=40?{res:L/40}:{})}),
 botas:(L,e)=>({vit:6+L*1.4,[e]:3+L*.4,...(L>=90?{pm:1}:{})}),
 arma:(L,e)=>({[e]:3+L*1.5,vit:L*.8,...(L>=40?{pow:L/5}:{})}),
 escudo:(L,e)=>({vit:10+L*1.9,res:1+L/25,...(L>=60?{pow:L/20}:{})})};
const PRICE_K={sombrero:1.4,capa:1.4,amuleto:1.7,anillo:1.2,cinturon:1.5,botas:1.4,arma:2.2,escudo:1.8};
const SOFT_KINDS=['sombrero','capa','botas','cinturon'];
const taken=new Set(Object.values(Registry.items).map(i=>i.n));
const nice=n=>Math.max(5,n<200?Math.round(n/5)*5:n<2000?Math.round(n/10)*10:Math.round(n/50)*50);
const ids_gear={};
/* ---------- RECURSOS ---------- */
TIERS.forEach((L,i)=>{const p=Math.round(8+L*L*.06+L*4);
 REC('t_soft_'+i,R_SOFT[i],i%2?'🧶':'🧵',L,nice(p),'Material para sastres y zapateros (nivel '+L+').');
 REC('t_hard_'+i,R_HARD[i],i%3?'🪨':'⛏️',L,nice(p*1.15),'Material para forjadores y joyeros (nivel '+L+').')});
/* ---------- EQUIPO ---------- */
for(const kind in GEAR){const soft=SOFT_KINDS.includes(kind),nouns=NOUN[kind];
 TIERS.forEach((L,i)=>{const e=EL4[(i+kind.length)%4],raw=GEAR[kind](L,e),st={};
  for(const k in raw){const v=Math.round(raw[k]*.85);if(v>0)st[k]=v}
  const noun=kind==='arma'?nouns[i%nouns.length]:nouns[Math.min(nouns.length-1,Math.floor(i*nouns.length/TIERS.length))],ico=ICO[kind][kind==='arma'?i%ICO.arma.length:Math.min(ICO[kind].length-1,Math.floor(i*ICO[kind].length/TIERS.length))];
  let n=noun+' de '+(soft?SOFT[i]:HARD[i]);if(taken.has(n))n+=' II';taken.add(n);
  const id='t_'+kind+'_'+i,price=nice((20+L*L*.9+L*12)*PRICE_K[kind]);
  IT(id,n,ico,kind,L,price,st);ids_gear[id]=[kind,L,i]})}
/* ---------- RECETAS: el mismo equipo se puede fabricar en los oficios con los recursos de su escalón ---------- */
for(const id in ids_gear){const[kind,L,i]=ids_gear[id],soft=SOFT_KINDS.includes(kind),heavy=kind==='arma'||kind==='escudo',q=Math.round((4+i/4)*(heavy?1.4:1)),main=(soft?'t_soft_':'t_hard_')+i,sec=(soft?'t_hard_':'t_soft_')+i;
 RECIPE(id,KIND_JOB[kind],Math.min(95,Math.max(1,Math.round(L*.5))),[[main,q],[sec,Math.max(1,Math.round(q/2))]])}
/* ---------- CONSUMIBLES ---------- */
CON('tonico_menor','Tónico Menor','🧪',8,70,{pa:2,fx:[{k:'hp',p:.3}]},'Un tónico de hierbas que alivia las heridas.');
CON('pocion_revitalizante','Poción Revitalizante','🍵',15,120,{pa:2,fx:[{k:'hp',p:.35}]},'Devuelve el aliento en pleno combate.');
CON('pocion_superior','Poción Superior','🍷',40,300,{pa:2,fx:[{k:'hp',p:.5}]},'Cura la mitad de tu vida.');
CON('elixir_vida','Elixir de Vida','⚗️',55,520,{pa:3,fx:[{k:'hp',p:.55}]},'Un elixir denso y dulce.');
CON('pocion_mayor','Poción Mayor de Vida','🧴',90,1100,{pa:3,fx:[{k:'hp',p:.65}]},'Para heridas que parecían mortales.');
CON('elixir_supremo','Elixir Supremo','🏺',120,1900,{pa:3,fx:[{k:'hp',p:.75}]},'Casi te devuelve a la batalla entera.');
CON('nectar_divino','Néctar Divino','🌟',160,3200,{pa:3,fx:[{k:'hp',p:.85}]},'Se dice que lo destilan los dioses.');
CON('pan_centeno','Pan de Centeno','🥖',12,60,{pa:2,fx:[{k:'b',s:'pow',v:18,tn:3}]},'Energía honesta para tres turnos.');
CON('pastel_guerra','Pastel de Guerra','🥧',30,160,{pa:2,fx:[{k:'b',s:'pow',v:30,tn:3}]},'Lo hornean antes de cada batalla grande.');
CON('banquete_heroe','Banquete del Héroe','🍖',60,420,{pa:2,fx:[{k:'b',s:'pow',v:50,tn:3}]},'Un festín para tres turnos de poder.');
CON('festin_titan','Festín del Titán','🍗',100,900,{pa:2,fx:[{k:'b',s:'pow',v:80,tn:3}]},'Comida de gigantes.');
CON('ambrosia','Ambrosía','🍯',150,1900,{pa:2,fx:[{k:'b',s:'pow',v:120,tn:3}]},'Poder puro durante tres turnos.');
CON('elixir_brasa','Elixir de Brasa','🔥',20,140,{pa:2,fx:[{k:'ar',a:45,b:65,el:'fuego',tn:2}]},'Una coraza de calor durante 2 turnos.');
CON('elixir_marea','Elixir de Marea','🌊',30,200,{pa:2,fx:[{k:'ar',a:60,b:85,el:'agua',tn:2}]},'Tu piel fluye como el agua durante 2 turnos.');
CON('elixir_brisa','Elixir de Brisa','🌬️',35,230,{pa:2,fx:[{k:'ar',a:70,b:95,el:'aire',tn:2}]},'Una brisa que desvía los golpes.');
CON('elixir_hierro','Elixir de Hierro','⛓️',45,320,{pa:2,fx:[{k:'ar',a:90,b:130,el:'tierra',tn:2}]},'Tu piel se vuelve metal durante 2 turnos.');
CON('elixir_obsidiana','Elixir de Obsidiana','🖤',80,800,{pa:2,fx:[{k:'ar',a:170,b:230,el:'tierra',tn:2}]},'Armadura de roca volcánica.');
CON('elixir_celeste','Elixir Celeste','☁️',130,1700,{pa:3,fx:[{k:'ar',a:300,b:400,el:'aire',tn:2}]},'Armadura de nubes que casi no se rompe.');
CON('pocion_zancada','Poción de Zancada','🏃',25,110,{pa:1,fx:[{k:'b',s:'pm',v:2,tn:1}]},'Dos pasos más este turno.');
CON('pocion_furia','Poción de Furia','💢',50,360,{pa:1,fx:[{k:'b',s:'pa',v:2,tn:1}]},'Dos puntos de acción extra este turno.');
CON('pocion_coraje','Poción de Coraje','🦁',70,520,{pa:2,fx:[{k:'b',s:'res',v:12,tn:3}]},'Resistencia durante 3 turnos.');
CON('pocion_furia_mayor','Poción de Furia Mayor','⚡',110,1000,{pa:1,fx:[{k:'b',s:'pa',v:3,tn:1}]},'Tres puntos de acción extra este turno.');
/* ---------- BOTÍN: los recursos nuevos los sueltan los monstruos del mapa cuyo rango de nivel incluye el del recurso ---------- */
const mapMobs=Object.values(Registry.monsters).filter(m=>m.lv&&!m.dun);
TIERS.forEach((L,i)=>{const ok=mapMobs.filter(m=>L>=m.lv[0]&&L<=m.lv[1]);if(!ok.length)return;
 ['t_soft_','t_hard_'].forEach((p,j)=>{for(let k=0;k<2;k++){const m=ok[(i*2+j*3+k*5)%ok.length];m.drops=m.drops||[];if(!m.drops.some(d=>d[0]===p+i))m.drops.push([p+i,.3,[1,2]])}})});
}
