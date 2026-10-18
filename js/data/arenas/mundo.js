/* mundo.js · EL MUNDO: 4×4 mapas conectados (16 pantallas). Se pasa de un mapa a otro caminando por las salidas (casillas brillantes en el borde).
   · Cada mapa se llama w<gx>_<gy>  (gx 0-3 = columna, gy 0-3 = fila). El mapa central de la plaza es w1_1 (tiene todas las estaciones: oficios, mercado, mazmorras…).
   · PNG DE FONDO: guarda tu imagen en  assets/world/mapa_<gx>_<gy>.png  (ej. assets/world/mapa_0_0.png). Si no existe, se ve el degradado de colores del mapa. Ver assets/world/_LEEME.txt.
   · Para cambiar nombre, monstruos o nivel de un mapa: edita su línea en WORLD.M (abajo). z = zona de monstruos (ver WORLD.Z), lv = niveles de los monstruos de ese mapa, g = cuántos grupos hay.
   · Los mapas se dibujan solos (árboles, rocas…) según su «base» (claro, pradera, playa, volcan, ruinas, cielo, cueva = colores de las arenas de combate). Siempre hay camino libre hasta cada salida. */
const WORLD={W:4,H:4,
 /* servidores: los jugadores del MISMO servidor se ven entre sí (Firebase: world/<servidor>/<mapa>) */
 SRV:[['s1','Imagiro'],['s2','Echo'],['s3','Herdegrize'],['s4','Tylezia']],
 /* zonas de monstruos (ids de js/data/monsters/*.js) */
 Z:{raiz:['jabali','cuervo','babosa','ent'],brisa:['arpia','aguila_tormenta','elemental_aire','wyvern'],brasa:['lagarto','escorpion','murcielago','golem_brasa'],
  abismo:['cangrejo','medusa','tiburon','kraken'],petreo:['basilisco','escarabajo','golem_cuarzo','troll'],titan:['gigante','quimera','hidra','dragon'],celestial:['serafin','fenix','guardian_estelar','leviatan'],mixta:['jabali','cuervo','lagarto','escorpion']},
 M:[
  {g:[0,0],n:'Bosque Susurrante',base:'claro',z:'raiz',lv:[1,8],ng:3},         {g:[1,0],n:'Prado Norte',base:'pradera',z:'raiz',lv:[3,12],ng:3},
  {g:[2,0],n:'Colinas del Viento',base:'pradera',z:'brisa',lv:[25,45],ng:3},      {g:[3,0],n:'Cumbre Celeste',base:'cielo',z:'celestial',lv:[140,190],ng:3},
  {g:[0,1],n:'Prado del Oeste',base:'pradera',z:'raiz',lv:[5,16],ng:3},         {g:[1,1],n:'Plaza Central',base:'sala',plaza:1},
  {g:[2,1],n:'Ruinas Antiguas',base:'ruinas',z:'petreo',lv:[60,90],ng:3},       {g:[3,1],n:'Falda del Volcán',base:'volcan',z:'brasa',lv:[15,32],ng:3},
  {g:[0,2],n:'Costa Dorada',base:'playa',z:'abismo',lv:[40,60],ng:3},           {g:[1,2],n:'Claro del Sur',base:'claro',z:'raiz',lv:[8,24],ng:3},
  {g:[2,2],n:'Cruce de Caminos',base:'claro',z:'mixta',lv:[12,30],ng:3},         {g:[3,2],n:'Campo de Brasas',base:'volcan',z:'brasa',lv:[28,50],ng:3},
  {g:[0,3],n:'Bahía Azul',base:'playa',z:'abismo',lv:[55,85],ng:3},             {g:[1,3],n:'Arrecife Profundo',base:'playa',z:'abismo',lv:[80,125],ng:3},
  {g:[2,3],n:'Cueva Oscura',base:'cueva',z:'petreo',lv:[85,125],ng:3},         {g:[3,3],n:'Cráter Ardiente',base:'volcan',z:'titan',lv:[95,150],ng:3}],
 id:(gx,gy)=>'w'+gx+'_'+gy,
 at:(gx,gy)=>WORLD.M.find(m=>m.g[0]===gx&&m.g[1]===gy)||null,
 D:{w:[-1,0],e:[1,0],n:[0,-1],s:[0,1]},
 DN:{w:'Oeste',e:'Este',n:'Norte',s:'Sur'},
 /* ¿(x,y) es una casilla de SALIDA del mapa A? → 'w' | 'e' | 'n' | 's' (solo si ese lado tiene mapa vecino) */
 gate(A,x,y){if(!A||A.gx==null||A.k[y*A.w+x]!==1)return null;const d=x===0?'w':x===A.w-1?'e':y===0?'n':y===A.h-1?'s':null;if(!d)return null;
  const nx=A.gx+WORLD.D[d][0],ny=A.gy+WORLD.D[d][1];return nx>=0&&ny>=0&&nx<WORLD.W&&ny<WORLD.H?d:null}};

/* silueta de todos los mapas (21×13): fila → [x desde, x hasta]. Las salidas son los bordes: arriba/abajo x 6-14 · izquierda/derecha y 4-8 */
(()=>{const SIL=[[6,14],[4,16],[3,17],[1,19],[0,20],[0,20],[0,20],[0,20],[0,20],[1,19],[3,17],[4,16],[6,14]],w=21,h=13;
 const DEC={claro:{d:.17,c:'tt#t'},pradera:{d:.12,c:'tt#cf'},playa:{d:.13,c:'~#t~f'},volcan:{d:.19,c:'#~#o'},ruinas:{d:.16,c:'pmc#'},cielo:{d:.11,c:'cco~'},cueva:{d:.21,c:'##o#'}},
  WALL={claro:'t',pradera:'t',playa:'~',volcan:'#',ruinas:'m',cielo:'c',cueva:'#'};
 function rows(gx,gy,base){const g=Array.from({length:h},()=>Array(w).fill('·'));SIL.forEach(([a,b],y)=>{for(let x=a;x<=b;x++)g[y][x]='.'});
  const pal=DEC[base]||DEC.claro,sd=gx*37+gy*91+11,nb={w:gx>0,e:gx<WORLD.W-1,n:gy>0,s:gy<WORLD.H-1};
  const road=(x,y)=>y===6||x===10||(y>=5&&y<=7&&(x<=5||x>=15))||(x>=9&&x<=11&&(y<=2||y>=10))||(Math.abs(x-10)<=1&&Math.abs(y-6)<=1);   // pasillos hasta las salidas + cruce central: siempre libres
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){if(g[y][x]!=='.'||road(x,y)||x<2||y<2||x>w-3||y>h-3)continue;if(hh(x,y,sd)<pal.d)g[y][x]=pal.c[Math.floor(hh(x,y,sd+99)*pal.c.length)]}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(g[y][x]!=='.')continue;const d=x===0?'w':x===w-1?'e':y===0?'n':y===h-1?'s':null;if(d&&!nb[d])g[y][x]=WALL[base]||'t'}      // lados sin vecino: muro
  /* casillas aisladas (que no se pueden alcanzar desde el centro) → se rellenan */
  const seen=new Set(['10,6']),q=[[10,6]];for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=w||ny>=h||seen.has(k)||g[ny][nx]!=='.')continue;seen.add(k);q.push([nx,ny])}}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(g[y][x]==='.'&&!seen.has(x+','+y))g[y][x]=pal.c[0];
  return g.map(r=>r.join(''))}
 for(const M of WORLD.M){const[gx,gy]=M.g,id=WORLD.id(gx,gy),B=Registry.arenas[M.plaza?'sala':M.base]||Registry.arenas.pradera,
   map=M.plaza?Registry.arenas.sala.map.map((r,y)=>y===11?r.replace('M','.'):r):rows(gx,gy,M.base);   // la plaza usa el dibujo de la sala (sin el portal de monstruos: ya andan por el mundo)
  ARENA(id,{n:M.n,hub:true,gx,gy,z:M.z||null,art:{src:'assets/world/mapa_'+gx+'_'+gy+'.png'},bg:B.bg,fx:B.fx,wx:[['none',1]],mobs:0,theme:B.theme,map});
  Registry.arenas[id].wm=M}})();
