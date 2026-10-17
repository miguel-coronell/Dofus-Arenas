/* maps.js · MAPAS POR CELDAS. Cada arena es un dibujo en texto: una letra = una celda.
   Así cada mapa puede tener su propio tamaño y forma (desde 8×8 hasta 17×13 o más) y los personajes solo caminan por las celdas de suelo.

     ·  (o espacio) vacío: no hay baldosa, no se pisa ni se pasa        .  suelo normal
     1    suelo + zona de salida del equipo 1 (tú)                    2  suelo + zona de salida del equipo 2 (rival / monstruos)
   Obstáculos (infranqueables: no se camina por ellos, nada se empuja a través, y el choque hace daño):
     #  roca    c  caja    t  árbol    p  pilar    m  muro      → TAMBIÉN bloquean la línea de visión
     f  valla baja   o  agujero   ~  agua/lava                     → no se pisan, pero se ve y se lanza por encima

   LÍNEA DE VISIÓN: un hechizo necesita ver la celda objetivo en línea recta. Solo la bloquean los obstáculos altos (# c t p m);
   los personajes, monstruos e invocaciones NO la bloquean (puedes lanzar a través de ellos). Los hechizos con «nlos:true»
   (teletransportes, invocaciones…) no necesitan línea de visión.

   Para crear un mapa nuevo: copia js/data/arenas/_plantilla_arena.txt, dibuja las filas y añade su <script> en index.html. */
Registry.obstacles={};
const OBST=(ch,id,n,los)=>Registry.obstacles[ch]={ch,id,n,los:!!los};
OBST('#','roca','Roca',1);OBST('c','caja','Caja',1);OBST('t','arbol','Árbol',1);OBST('p','pilar','Pilar',1);OBST('m','muro','Muro',1);
/* ESTACIONES de la sala de espera (js/game/hub.js): infranqueables, no tapan la vista. st = [icono, nombre, color de la base] */
const STATION=(ch,id,n,ico,col)=>Registry.obstacles[ch]={ch,id,n,los:0,st:{ico,col}};
STATION('W','oficios','Oficios','🔨',['#d9a65a','#a77a35','#7a5624']);STATION('K','mercado','Supermercado','🛒',['#e6c55c','#b99a2e','#8a7020']);STATION('P','puesto','Mi puesto','📋',['#8fd3a0','#5fa874','#437e55']);
STATION('D','mazmorras','Mazmorras','🏰',['#b8a7d9','#8b78b5','#63528a']);STATION('Q','equipo','Equipo · Grupo','👥',['#7fd6c2','#4aa58f','#33786a']);
STATION('B','baul','Baúl · Inventario','🎒',['#c98f5a','#9a6a3a','#6f4a26']);STATION('L','libro','Hechizos','📖',['#a98ae0','#7d5fb5','#5a418a']);
STATION('A','portal_ia','Duelo vs IA','⚔️',['#ff8a7a','#d2534a','#9a332d']);STATION('M','portal_mob','Monstruos','👹',['#ffb36a','#d27a2e','#9a5518']);STATION('V','portal_pvp','PvP online','🌐',['#7ac0ff','#3e8ad2','#2a5f9a']);
OBST('f','valla','Valla baja',0);OBST('o','agujero','Agujero',0);OBST('~','liquido','Agua / lava',0);

/* ARENA(id,{n,map:[filas],art:{src},theme:{…},bg:[c1,c2],fx,wx:[[clima,peso],…],mobs}) → registra el mapa ya procesado:
   k[y*w+x] = 0 vacío · 1 suelo · 2 obstáculo que NO tapa la vista · 3 obstáculo que tapa la vista   ·   o[…] = letra del obstáculo   ·   spawn[0|1] = celdas de salida */
function ARENA(id,d){
 const rows=d.map.map(String),h=rows.length,w=Math.max(...rows.map(r=>r.length)),k=new Uint8Array(w*h),o=new Array(w*h).fill(''),spawn=[[],[]];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=rows[y][x]||' ',i=y*w+x;
  if(c===' '||c==='-'||c==='·')continue;
  if(c==='.'||c==='1'||c==='2'){k[i]=1;if(c!=='.')spawn[+c-1].push([x,y]);continue}
  const B=Registry.obstacles[c];if(!B){k[i]=1;continue}                 // letra desconocida = suelo
  k[i]=B.los?3:2;o[i]=c}
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,walk=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(k[y*w+x]){const[px,py]=P(x,y);x0=Math.min(x0,px-32);x1=Math.max(x1,px+32);y0=Math.min(y0,py-16);y1=Math.max(y1,py+16);if(k[y*w+x]===1)walk++}
 Registry.add('arenas',id,{wx:[['none',1]],fx:'mote',mobs:3,...d,w,h,k,o,spawn,walk,box:{x0,x1,y0,y1:y1+CFG.tileD},cx:(x0+x1)/2,cy:(y0+y1+CFG.tileD)/2})}

const Maps={
 ids:()=>Object.keys(Registry.arenas).filter(i=>!Registry.arenas[i].hub).sort(),
 /* arena al azar distinta de la anterior (r = número 0-1) */
 pick(prev,r){const ids=Maps.ids().filter(i=>i!==prev),L=ids.length?ids:Maps.ids();return L[Math.floor((r==null?Math.random():r)*L.length)%L.length]},
 /* clima automático según los pesos de la arena (wx). Con la misma semilla sale el mismo (PvP) */
 weather(A,seed){const W=A.wx&&A.wx.length?A.wx:[['none',1]],t=W.reduce((a,x)=>a+x[1],0);let r=(seed==null?Math.random():hh(seed|0,11,5))*t;for(const[w,p]of W){if((r-=p)<0)return w}return W[0][0]}};
