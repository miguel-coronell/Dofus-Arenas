/* world.js · EL MUNDO: 4×4 mapas (datos y dibujo en js/data/arenas/mundo.js). Aquí vive todo lo que pasa MIENTRAS PASEAS:
   · pasar de un mapa a otro caminando por las casillas brillantes del borde (World.exit)
   · ver a los DEMÁS JUGADORES del mismo servidor (Firebase: world/<servidor>/<mapa>/<uid>; cada cliente publica su posición y escucha su mapa)
   · monstruos que andan por los mapas: toca uno para desafiarlo (World.fight → combate normal contra ese grupo)
   · tocar a un jugador (real o simulado) abre su menú estilo Dofus (mensaje · desafiar · informaciones · intercambiar · grupo · coliseo · amigo · enemigo · omitir) → js/ui/friends.js (PMenu)
   Sin Firebase (modo local) se ven jugadores simulados, como antes. Servidores: WORLD.SRV en mundo.js. */
const World={srv:(()=>{try{const s=localStorage.getItem('coliseo.srv');return WORLD.SRV.some(x=>x[0]===s)?s:'s1'}catch(e){return's1'}})(),
 map:null,last:null,lc:null,char:null,armed:false,dead:{},remote:{},nid:1000,ref:null,mine:null,warned:false,
 srvName:()=>(WORLD.SRV.find(s=>s[0]===World.srv)||WORLD.SRV[0])[1],
 /* ---------- posición guardada (por personaje) ---------- */
 load(){if(World.char===PJ.id)return;World.char=PJ.id;World.last=null;World.lc=null;try{const o=JSON.parse(localStorage.getItem('coliseo.wpos')||'{}')[PJ.id];if(o&&Registry.arenas[o[0]]){World.last=o[0];World.lc=[o[1],o[2]]}}catch(e){}},
 keep(){const p=G.me;if(!p||!G.arena||G.arena.gx==null)return;World.last=G.arena.id;World.lc=[Math.round(p.x),Math.round(p.y)];
  try{const o=JSON.parse(localStorage.getItem('coliseo.wpos')||'{}');o[PJ.id]=[World.last,World.lc[0],World.lc[1]];localStorage.setItem('coliseo.wpos',JSON.stringify(o))}catch(e){}},
 /* ---------- casillas ---------- */
 taken:(x,y)=>G.ents.some(e=>e.hp>0&&Math.round(e.x)===x&&Math.round(e.y)===y),
 /* casilla de suelo libre más cercana a c (por defecto evita las casillas de salida) */
 free(A,c,gateOk){let best=null,bd=1e9;for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){if(A.k[y*A.w+x]!==1||World.taken(x,y)||(!gateOk&&WORLD.gate(A,x,y)))continue;
   const d=Math.abs(x-c[0])+Math.abs(y-c[1])+hh(x,y,7)*.4;if(d<bd){bd=d;best=[x,y]}}return best||[10,6]},
 rand(A){for(let n=0;n<300;n++){const x=rn(2,A.w-3),y=rn(2,A.h-3);if(A.k[y*A.w+x]===1&&!World.taken(x,y)&&!WORLD.gate(A,x,y)&&!Hub.st(x+1,y)&&!Hub.st(x-1,y)&&!Hub.st(x,y+1)&&!Hub.st(x,y-1))return[x,y]}return World.free(A,[10,6])},
 /* ---------- construir un mapa ---------- */
 setup(id,cell){World.detach();const A=Registry.arenas[id]||Registry.arenas.w1_1;World.map=A.id;G.arena=A;G.objs=[];G.ents=[];World.remote={};
  const me=hero(PJ,0,0,World.free(A,cell||[10,9],true),{ctl:'me'});me.face=-1;G.ents.push(me);G.me=me;
  Party.m.forEach((b,i)=>{const v=hero(b,10+i,0,World.free(A,[me.x,me.y]),{ctl:'npc',vis:true,party:true,wait:1});v.hp=v.mhp;G.ents.push(v)});
  World.mobs(A);if(World.armed&&Soc.live())World.attach();else World.sims(A);
  World.keep();World.mini();Hub.vis=G.ents.length-1},
 /* jugadores simulados (solo sin conexión) */
 sims(A){if(Soc.live())return;const cl=Object.keys(Registry.classes),names=Hub.NAMES.slice().sort(()=>Math.random()-.5);
  for(let i=0;i<(A.wm&&A.wm.plaza?6:2);i++){const c=World.rand(A),b=PG.auto(cl[rn(0,cl.length-1)],clamp(PJ.lvl+rn(-6,10),1,PROG.maxLv),names[i]);const v=hero(b,i+1,0,c,{ctl:'npc',vis:true,wait:Math.random()*3});v.hp=v.mhp;G.ents.push(v)}},
 /* monstruos del mapa: grupos de 1-3 que pasean cerca de su sitio. Un grupo vencido DESAPARECE del mapa y vuelve a aparecer solo
   (en otro punto del mismo mapa) pasado World.RESPAWN milisegundos, aunque sigas en ese mapa. Cambia el tiempo aquí. */
RESPAWN:60000,
 mob(A,i){const M=A.wm,Z=M&&M.z&&WORLD.Z[M.z];if(!Z)return null;const pool=Z.map(id=>Registry.monsters[id]).filter(Boolean);if(!pool.length)return null;const key=A.id+':'+i;
  const lvl=rn(M.lv[0],M.lv[1]),n=lvl<10?rn(1,2):rn(1,3),ms=[];for(let j=0;j<n;j++)ms.push(pool[rn(0,pool.length-1)].id);
  const m=Registry.monsters[ms[0]],c=World.rand(A),e=mkEnt(500+i,m.n,1,c[0],c[1],{lvl,mhp:100,pa:6,pm:3,pow:{tierra:0,fuego:0,agua:0,aire:0},res:0,rel:{},sp:[]},m,{ctl:'npc',wm:{k:key,ms,lvl,n},wait:Math.random()*4,hx:c[0],hy:c[1]});
  G.ents.push(e);return e},
 mobs(A){const M=A.wm;if(!M||!M.z)return;for(let i=0;i<(M.ng||3);i++){if((World.dead[A.id+':'+i]||0)>Date.now())continue;World.mob(A,i)}},
 /* ¿ya pasó el tiempo de algún grupo vencido de ESTE mapa? entonces reaparece (se revisa una vez por segundo) */
 respawn(dt){World.rt=(World.rt||0)-dt;if(World.rt>0)return;World.rt=1;const A=G.arena,M=A&&A.wm;if(!M||!M.z)return;
  for(let i=0;i<(M.ng||3);i++){const key=A.id+':'+i,t=World.dead[key];if(!t||t>Date.now()||G.ents.some(e=>e.wm&&e.wm.k===key))continue;delete World.dead[key];const e=World.mob(A,i);if(e)e.wait=1+Math.random()*2}},
 /* ---------- cambiar de mapa ---------- */
 goto(id,cell){World.setup(id,cell);G.sel=null;Hub.near=null;Hub.want=null;Hub.btn();mapInfo();rs();fitView();UI.hud()},
 exit(d){const A=G.arena,B=Registry.arenas[WORLD.id(A.gx+WORLD.D[d][0],A.gy+WORLD.D[d][1])];if(!B)return;const p=G.me,x=Math.round(p.x),y=Math.round(p.y);
  World.goto(B.id,d==='e'?[1,y]:d==='w'?[B.w-2,y]:d==='s'?[x,1]:[x,B.h-2]);UI.msg('➡ '+B.n+' · '+WORLD.DN[d])},
 /* ---------- presencia real (Firebase) ---------- */
 attach(){const A=G.arena,p=G.me,r=Net.db.ref('world/'+World.srv+'/'+A.id);World.ref=r;World.mine=r.child(Net.uid);
  const rec={n:cleanName(PJ.name)||'Jugador',c:PJ.cls,s:PJ.sex==='f'?'f':'m',l:JSON.stringify(LOOK.fix(PJ.look)).slice(0,160),v:PJ.lvl,x:Math.round(p.x),y:Math.round(p.y),ts:Date.now()};
  World.mine.set(rec).catch(e=>{console.warn('world',e);if(!World.warned){World.warned=true;Chat.add('general','⚠ No se pudo publicar tu posición: publica las reglas nuevas de Firebase (firebase/database.rules.json). Mientras tanto nadie te ve.','sys')}});
  try{World.mine.onDisconnect().remove()}catch(e){}
  r.on('child_added',s=>World.rem(s));r.on('child_changed',s=>World.rem(s));r.on('child_removed',s=>World.gone(s.key));Soc.online('w')},
 detach(){if(World.ref){try{World.ref.off()}catch(e){}}if(World.mine){try{World.mine.onDisconnect().cancel()}catch(e){}try{World.mine.remove()}catch(e){}}World.ref=World.mine=null},
 /* salir del mundo (empieza un combate, vas al selector de personajes…) */
 pause(){World.armed=false;World.keep();World.detach();World.cnt();Soc.online(null)},
 out(){World.keep();World.detach();Soc.online(armedSt())},
 ghost(u,o){const b=PG.newBuild(cleanName(String(o.n||''))||'Jugador',o.c,o.s==='f'?'f':'m');let l={};try{l=JSON.parse(o.l)}catch(e){}b.look=LOOK.fix(l);b.lvl=clamp(+o.v||1,1,PROG.maxLv);b.id='u'+u;return b},
 rem(s){const u=s.key,o=s.val(),A=G.arena;if(u===Net.uid||Soc.ign[u]||!o||!A||!Registry.classes[o.c]||World.map!==A.id||!G.hub)return;
  const x=clamp(Math.round(+o.x||0),0,A.w-1),y=clamp(Math.round(+o.y||0),0,A.h-1);let e=World.remote[u];
  if(!e){const b=World.ghost(u,o);e=hero(b,World.nid++,0,World.free(A,[x,y],true),{ctl:'npc',vis:true,remote:true,uid:u,wait:0});e.hp=e.mhp;World.remote[u]=e;G.ents.push(e);World.cnt();Soc.seen(u,o);return}
  e.build.lvl=e.lvl=clamp(+o.v||1,1,PROG.maxLv);if(Math.round(e.x)===x&&Math.round(e.y)===y&&!e.path.length)return;
  const b=bfs(e.x,e.y,45,e),k=x+','+y;if(b.d[k]>0)e.path=pathTo(b,x,y);else if(!blocked(x,y)&&!occ(x,y,e)){e.path=[];e.x=e.px=x;e.y=e.py=y}},
 gone(u){const e=World.remote[u];if(!e)return;delete World.remote[u];G.ents=G.ents.filter(x=>x!==e);if(PMenu.uid===u)PMenu.close();World.cnt()},
 /* publica a dónde vas (el resto te ve caminar hasta allí) */
 pub(p){const d=p.path[p.path.length-1];if(d&&World.mine)World.mine.update({x:d[0],y:d[1],ts:Date.now()}).catch(()=>{})},
 /* ---------- interacción ---------- */
 /* toque sobre un personaje o monstruo (se prueba contra el SPRITE entero, no solo contra la casilla de los pies) */
 hit(mx,my){if(!G.hub||overlayOpen()||!G.me)return false;const wx=(mx-OX)/Z,wy=(my-OY)/Z;let best=null,bk=-1;
  for(const e of G.ents){if(e===G.me||!(e.vis||e.wm)||e.hp<=0)continue;const[cx,cy]=P(e.px,e.py),h=entH(e);if(Math.abs(wx-cx)<=26*(e.def.scale||1)&&wy>=cy-h-8&&wy<=cy+12&&e.px+e.py>bk){bk=e.px+e.py;best=e}}
  if(!best)return false;World.click(best);return true},
 click(e){if(e.wm)PMenu.mob(e);else if(e.vis)PMenu.player(e)},
 /* desafiar a un grupo de monstruos del mapa */
 fight(e,solo){const w=e&&e.wm;if(!w||!G.hub)return;if(Party.fight){UI.msg('📣 Esperando la respuesta de tu grupo…');return}if(Coli.busy()){UI.msg('🔍 Estás buscando partida en el Coliseo. Cancela la búsqueda para combatir.');return}
  const foes=w.ms.map(id=>({m:Registry.monsters[id]})).filter(f=>f.m);if(!foes.length)return;PMenu.close();
  if(!solo&&Soc.live()&&Party.others().length){Party.callGroup(w,e,[World.map,Math.round(e.x),Math.round(e.y)]);return}      // grupo real: avisa a todos y espera a quien quiera unirse
  Net.leave();Hub.leave();Dun.run=null;startBattle(Maps.pick(null),{mode:'mob',me:PJ,allies:Party.builds(),foes,lvl:w.lvl});G.wk=w.k;mapInfo();rs();fitView();
  UI.msg('⚔ '+e.n+(w.n>1?' y '+(w.n-1)+' más':'')+' · Nv '+w.lvl+' · pulsa ¡Listo! para empezar');UI.hud()},
 /* ---------- bucle ---------- */
 tick(dt){const p=G.me;if(!p||!G.hub)return;World.respawn(dt);
  if(!p.path.length){const d=WORLD.gate(G.arena,Math.round(p.x),Math.round(p.y));if(d){World.exit(d);return}}
  for(const e of G.ents){if(!e.wm||e.path.length)continue;e.wait-=dt;if(e.wait>0)continue;e.wait=3+Math.random()*6;
   const b=bfs(e.x,e.y,3,e),ks=Object.keys(b.d).filter(k=>{if(!(b.d[k]>0))return false;const[a,c]=k.split(',').map(Number);return Math.abs(a-e.hx)+Math.abs(c-e.hy)<=4&&!WORLD.gate(G.arena,a,c)});
   if(ks.length){const k=ks[rn(0,ks.length-1)].split(',').map(Number);e.path=pathTo(b,k[0],k[1])}}},
 /* casillas de salida brillantes + el nombre del mapa al que llevan */
 deco(g,t){const A=G.arena;if(!A||A.gx==null)return;
  for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){if(!WORLD.gate(A,x,y))continue;const[cx,cy]=P(x,y);g.save();g.globalAlpha=.14+.1*Math.sin(t*3+x+y);poly(g,TILE(cx,cy,.92),'#ffd84a');g.restore()}
  g.save();g.font='bold 12px Trebuchet MS,sans-serif';g.textAlign='center';g.lineJoin='round';g.lineWidth=3;g.strokeStyle='#000';g.fillStyle='#ffe9a0';
  for(const d in WORLD.D){const B=Registry.arenas[WORLD.id(A.gx+WORLD.D[d][0],A.gy+WORLD.D[d][1])];if(!B)continue;const c=d==='w'?[0,6]:d==='e'?[A.w-1,6]:d==='n'?[10,0]:[10,A.h-1];if(A.k[c[1]*A.w+c[0]]!==1)continue;
   const[cx,cy]=P(c[0],c[1]),s='➜ '+B.n;g.strokeText(s,cx,cy-2);g.fillText(s,cx,cy-2)}g.restore()},
 /* ---------- minimapa y servidor ---------- */
 mini(){const el=$('#wmap');if(!el)return;const A=G.arena;if(!A||A.gx==null){el.hidden=true;return}let c='';
  for(let y=0;y<WORLD.H;y++)for(let x=0;x<WORLD.W;x++){const M=WORLD.at(x,y),on=x===A.gx&&y===A.gy;c+=`<i class="${on?'on':''}${M&&M.plaza?' pz':''}${M&&M.z?' mb':''}" title="${esc(M?M.n:'')}"></i>`}
  el.innerHTML=`<div class="wm-t" title="Servidor: solo ves a los jugadores de tu mismo servidor. Se cambia desde ☰ Menú o al elegir personaje">🌍 <b>${esc(World.srvName())}</b></div><div class="wm-g">${c}</div><div class="wm-n">${esc(A.n)}<small>(${A.gx+1},${A.gy+1}) · <span id="wcnt"></span></small></div>`;el.hidden=false;World.cnt()},
 cnt(){const e=$('#wcnt');if(e)e.textContent=Soc.live()&&World.armed?'👥 '+(Object.keys(World.remote).length+1)+' aquí':'sin conexión'},
 setSrv(s,quiet){if(!WORLD.SRV.some(x=>x[0]===s)||s===World.srv)return false;World.srv=s;try{localStorage.setItem('coliseo.srv',s)}catch(e){}if(!quiet){Hub.enter();UI.msg('🌍 Servidor '+World.srvName())}return true}};
const armedSt=()=>World.armed?'c':null;     // al empezar un combate sigues «en línea» (para tus amigos), pero ya no estás en el mapa
