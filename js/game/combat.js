/* combat.js · partida por turnos: anima/dibuja y delega TODAS las reglas en Rules (rules.js).
   Modos: 'ai' duelo vs IA · 'mob' monstruos de monstruos.js · 'pvp' online (net/net.js).
   Todo lo que hace un jugador es una ACCIÓN {k:'mv',x,y} | {k:'ct',s:índice de hechizo,x,y} | {k:'end'} → exec(): igual en local, IA y red. */
const G={ents:[],objs:[],bm:[],paused:false,tl:0,tmax:0,tfire:false,t0:0,nt:0,mt:0,res:null,arena:null,cur:null,turn:0,sel:null,busy:false,over:false,fl:[],pr:[],bid:0,t:0,hover:null,me:null,mode:'ai',q:Promise.resolve()};
const blocked=(x,y)=>Rules.blocked(G,x,y),occ=(x,y,ex)=>Rules.occ(G,x,y,ex),byId=id=>G.ents.find(e=>e.id===id);
const look=(e,x,y)=>{const s=(x-e.x)-(y-e.y);if(s)e.face=s>0?1:-1};
function bfs(sx,sy,lim,ex){const d={},pv={},q=[[sx,sy]];d[sx+','+sy]=0;
 for(let i=0;i<q.length;i++){const[x,y]=q[i],k=d[x+','+y];if(k>=lim)continue;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=nx+','+ny;if(nk in d||blocked(nx,ny)||occ(nx,ny,ex))continue;d[nk]=k+1;pv[nk]=x+','+y;q.push([nx,ny])}}
 return{d,pv}}
function pathTo(b,x,y){const p=[];let k=x+','+y;while(b.pv[k]){const[a,c]=k.split(',').map(Number);p.unshift([a,c]);k=b.pv[k]}return p}
const float=(e,s,c)=>G.fl.push({x:e.px,y:e.py,t:0,s,c});
const heroDef=b=>({sprite:{src:`assets/characters/${b.cls}_${b.sex}.png`,tint:LOOK.fix(b.look).c,ring:LOOK.outColor(b.look,b.cls)},ico:Registry.classes[b.cls].ico});   // PNG: assets/characters/<clase>_<m|f>.png
const mkEnt=(id,n,team,x,y,c,def,o)=>Object.assign(Rules.ent(id,n,team,x,y,c),{def,px:x,py:y,path:[],face:team?-1:1,atk:0,hurt:0,cast:0,seed:Math.random()*6,ico:def.ico},o);
const hero=(b,id,team,pos,o)=>mkEnt(id,b.name,team,pos[0],pos[1],Rules.stats(b),heroDef(b),{build:b,items:Items.carry(b),...o});   // items = consumibles que llevas al combate (pestaña Objetos)
const PLACEHOLDER={id:'_placeholder',n:'Monstruo ?',hp:80,spells:['mordisco']};

/* o = {mode, me:build, foe?:build, seed?, weather?, a:{uid,build}, b:{uid,build}, uid}
   La ARENA y el CLIMA los elige el juego solo (main.js · begin). Las casillas de salida salen de las '1' y '2' del dibujo del mapa. */
function startBattle(arenaId,o){G.bid++;G.arena=Registry.arenas[arenaId];G.over=false;G.fl=[];G.pr=[];G.sel=null;G.busy=false;G.mode=o.mode;G.q=Promise.resolve();G.dun=o.dun||null;G.net=o.mode==='pvp'||!!o.coop;G.coop=o.coop||null;G.allies=o.coop?(o.players||[]).length-1:(o.allies||[]).length;G.left=false;G.wk=null;G.duel=false;G.gr=0;G.pvp=o.mode==='pvp'?{n:(o.players||[0,0]).length/2,mid:o.mid||null}:null;
 const seed=o.seed==null?Math.floor(Math.random()*2147483647):o.seed;Rules.init(G,seed);G.seed=seed;G.weather=o.weather||Maps.weather(G.arena,o.mode==='pvp'||o.coop?seed:null);
 G.bm=[];G.t0=Date.now();G.nt=0;G.mt=0;G.tl=0;G.tmax=0;G.res=null;G.round=0;G.noMobs=false;UI.result(null);Retos.start(o.mode);if(UI.logClear)UI.logClear();
 const A=G.arena,take=(list,n)=>{const l=list.slice(),r=[];while(r.length<n&&l.length)r.push(l.splice(G.r(0,l.length-1),1)[0]);return r},   // casillas de salida al azar (misma semilla = mismas casillas)
  s0=take(A.spawn[0],1)[0]||[1,1];
 if(o.mode==='pvp'){/* 1v1, 2v2 o 3v3: o.players = [{uid,build,team}] (mismo orden en todos los clientes → mismas casillas) */
  const P=o.players||[{uid:o.a.uid,build:o.a.build,team:0},{uid:o.b.uid,build:o.b.build,team:1}],used=[0,0];
  const L=P.map((p,i)=>{const t=p.team?1:0,pos=(t===0&&!used[0]?s0:take(A.spawn[t],1)[0])||[1,1];used[t]++;return hero(p.build,i,t,pos,{uid:p.uid})}),t0=L.filter(e=>e.team===0),t1=L.filter(e=>e.team===1);
  G.ents=[];for(let i=0;i<Math.max(t0.length,t1.length);i++){if(t0[i])G.ents.push(t0[i]);if(t1[i])G.ents.push(t1[i])}      // turnos alternados entre equipos
  G.me=G.ents.find(e=>e.uid===o.uid);G.ents.forEach(e=>e.ctl=e===G.me?'me':'remote')}
 else if(o.mode==='ai'){const L=o.me.lvl,cl=Object.keys(Registry.classes),foe=o.foe||PG.auto(cl[rn(0,cl.length-1)],clamp(L+rn(-2,2),1,PROG.maxLv),'Rival'),s1=take(A.spawn[1],1)[0];
  G.ents=[hero(o.me,0,0,s0,{ctl:'me'}),hero(foe,1,1,s1,{ctl:'ai'})];G.me=G.ents[0]}
 else{const L=o.me.lvl,all=Object.values(Registry.monsters).filter(m=>!m.dun),fa=all.filter(m=>!m.arenas||m.arenas.includes(arenaId)),fl=fa.filter(m=>!m.lv||(L>=m.lv[0]&&L<=m.lv[1])),pool=fl.length?fl:fa.length?fa:all;   // cada zona (lv:[min,max]) suelta SUS recursos
  G.noMobs=!pool.length;
  if(o.coop){/* COOPERATIVO: o.players = jugadores reales del grupo (mismo orden en todos los clientes → mismas casillas); cada uno maneja el suyo y los monstruos los juega la IA en TODOS los clientes con la misma semilla */
   G.ents=o.players.map((p,i)=>hero(p.build,i,0,(i===0?s0:take(A.spawn[0],1)[0])||[1,1],{uid:p.uid}));G.me=G.ents.find(e=>e.uid===o.uid);G.ents.forEach(e=>e.ctl=e===G.me?'me':'remote');
   if(o.hps)G.ents.forEach(e=>{const h=+o.hps[e.uid];if(h>0)e.hp=Math.min(e.mhp,Math.round(h))})}        // mazmorra cooperativa: la vida pasa de sala en sala (la calcula el anfitrión)
  else{G.ents=[hero(o.me,0,0,s0,{ctl:'me'})];G.me=G.ents[0]}
  const n=Math.min(A.spawn[1].length,(A.mobs||3)+(o.allies||[]).length),picks=o.foes||Array.from({length:n},()=>({m:pool.length?pool[rn(0,pool.length-1)]:PLACEHOLDER})),Ls=o.lvl||L;      // o.foes = lista fija (mazmorras) · si no, al azar de la zona
  take(A.spawn[1],picks.length).forEach(([x,y],i)=>{const{m,mult}=picks[i],hx=mult||1;     // monstruos escalan con tu nivel (los jefes llevan mult)
   G.ents.push(mkEnt((o.coop?20:1)+i,m.n,1,x,y,{lvl:Ls,mhp:Math.round((m.hp+Ls*6)*hx),pa:hx>1?8:6,pm:3,pow:Object.fromEntries(ELS.map(e=>[e,Math.floor(Ls*2.5*(hx>1?1.25:1))])),res:hx>1?10:0,rel:m.resist||{},sp:m.spells.map(id=>({id,lv:Math.min(PROG.maxSpLv,1+Math.floor(Ls/35))}))},m,{ctl:'ai'}))})}
 /* EQUIPO: los aliados (o.allies = builds) combaten contigo con IA; en el duelo el rival trae el mismo número. Turnos alternados equipo 0 / equipo 1 */
 if(o.allies&&o.allies.length&&o.mode!=='pvp'){o.allies.forEach((b,i)=>{const sc=take(A.spawn[0],1)[0];if(sc)G.ents.push(hero(b,100+i,0,sc,{ctl:'ai',ally:true}))});
  if(o.mode==='ai'){const cl=Object.keys(Registry.classes);o.allies.forEach((b,i)=>{const sc=take(A.spawn[1],1)[0];if(sc)G.ents.push(hero(PG.auto(cl[rn(0,cl.length-1)],clamp(b.lvl+rn(-2,2),1,PROG.maxLv),'Rival '+(i+2)),200+i,1,sc,{ctl:'ai'}))})}
  const t0=G.ents.filter(e=>e.team===0),t1=G.ents.filter(e=>e.team===1);G.ents=[];for(let i=0;i<Math.max(t0.length,t1.length);i++){if(t0[i])G.ents.push(t0[i]);if(t1[i])G.ents.push(t1[i])}}
 if(o.coop){const t0=G.ents.filter(e=>e.team===0),t1=G.ents.filter(e=>e.team===1);G.ents=[];for(let i=0;i<Math.max(t0.length,t1.length);i++){if(t0[i])G.ents.push(t0[i]);if(t1[i])G.ents.push(t1[i])}}   // turnos alternados: jugador, monstruo, jugador…
 G.turn=-1;UI.slots();Ready.begin(()=>next())}

async function next(){if(G.over)return;const bid=G.bid;
 do{G.turn=(G.turn+1)%G.ents.length}while(G.ents[G.turn].hp<=0);
 const e=G.cur=G.ents[G.turn];G.sel=null;G.busy=true;if(G.turn===0||!G.round){G.round++;if(UI.log)UI.log('— Turno '+G.round+' —','rd')}if(UI.log&&!e.sm)UI.log('Turno de '+e.n,e.team===G.me.team?'ally':'foe');
 G.nt++;if(e===G.me)G.mt++;G.tmax=PROG.turnSec&&(e.ctl==='me'||e.ctl==='remote')?PROG.turnSec:0;G.tl=G.tmax;G.tfire=false;G.gr=0;G.tskip=false;   // reloj: solo los jugadores (no IA, monstruos ni invocaciones)
const ev=Rules.begin(G,e);play(ev);UI.hud();if(ev.length)await wait(500);
 if(G.bid!==bid||check())return;G.busy=false;UI.hud();
 if(e.hp<=0){await wait(250);return next()}                       // murió al empezar su turno (veneno, glifo, bomba…)
 if(e.ctl==='ai'){G.busy=true;await(e.sm?sai(e,bid):ai(e,bid));if(G.bid!==bid)return;G.busy=false;await next()}}

/* reproduce los eventos que devuelve Rules (el estado ya cambió; esto es solo animación y números flotantes) */
const STN={pa:'PA',pm:'PM',pow:'Poder',res:'Resist.',inv:'Invisible'};
function play(ev){const lg=UI.log||(()=>{});for(const v of ev){
 if(v.t==='boom'){G.bm.push({x:v.x,y:v.y,r:v.r,c:FX[v.el]||'#ddd',t:0});continue}
 const e=byId(v.id);if(!e)continue;
 if(v.t==='dmg'){e.hurt=1;float(e,v.v?'-'+v.v:'🛡',v.v?FX[v.el]||'#fff':'#9cf');lg(e.n+' pierde '+v.v+' PV'+(v.ab?' (🛡 absorbe '+v.ab+')':''),'d-'+(v.el||'neutro'))}
 else if(v.t==='heal'){float(e,'+'+v.v,'#7dff7d');lg(e.n+' recupera '+v.v+' PV','heal')}else if(v.t==='ar')float(e,'🛡'+v.v,'#9cf');else if(v.t==='dot')float(e,'☠','#b58cff');
 else if(v.t==='buff')float(e,v.s==='dp'?'Desembrujado':v.s==='evo'?'Evolución '+v.v:STN[v.s]+(v.s==='inv'?'':(v.v>0?' +':' ')+v.v),v.v>0||v.s==='evo'?'#ffe07a':'#ff9a9a');
 else if(v.t==='sum'){float(e,'✨ '+e.n,'#ffe07a');lg(e.n+' entra en combate','buff')}else if(v.t==='kill'){e.hurt=1;float(e,'☠','#ff9a9a');lg(e.n+' cae','kill')}
 else if(v.t==='move')e.path=[[v.x,v.y]]}}

function check(){const w=Rules.win(G);if(w===null)return false;finish(w);return true}
function finish(w){G.over=true;G.busy=false;G.tl=0;const me=G.me,mine=G.ents.filter(e=>!e.sm&&e.team===me.team),foes=G.ents.filter(e=>!e.sm&&e.team!==me.team),foe=foes[0]||me;
 if(me.spent&&Object.keys(me.spent).length)Items.spend(PJ,me.spent);                  // los consumibles gastados salen de tu inventario
 const row=e=>({n:e.n,lvl:e.lvl,ico:e.build?Registry.classes[e.build.cls].ico:e.ico||'👾',img:e.build?LOOK.url(e.build.look,e.build.sex,e.build.cls,72):null,hp:Math.ceil(e.hp),mhp:e.mhp,dd:Math.round(e.dd||0),dt:Math.round(e.dt||0),hl:Math.round(e.hl||0)});
 /* R = todo lo que enseña la ventana de resultado (main.js · UI.result). loot = botín (piezas de set y recursos) · chal = retos cumplidos */
 const R={duel:!!G.duel,left:!!G.left,draw:w===-1,won:w===me.team,mode:G.mode,dun:G.dun,coop:G.coop?{host:G.coop.host,me:me.uid,hn:(G.ents.find(e=>e.uid===G.coop.host)||{}).n||'el líder'}:null,allies:G.allies||0,dur:Math.round((Date.now()-G.t0)/1000),turns:G.mt,sides:[mine.map(row),foes.map(row)],loot:[],pl:G.ents.filter(e=>!e.sm&&e.uid&&e!==me&&e.build).map(e=>({uid:e.uid,n:e.n,c:e.build.cls,l:e.lvl,ally:e.team===me.team}))};
 if(G.dun&&(w!==me.team)&&typeof Dun!=='undefined')Dun.run=null;
 if(R.draw){G.res=R;if(SAVED)PG.save(PJ);UI.msg('Empate.');UI.hud();UI.result(R);return}
 const flv=G.mode==='pvp'&&foes.length>1?Math.round(foes.reduce((a,e)=>a+e.lvl,0)/foes.length):foe.lvl,duel=!!G.duel,ch=!duel&&G.chal&&G.chal.length?Retos.eval(R.won):null,r=duel?{xp:0,k:0,bx:0,bk:0,up:0,unl:[]}:PG.result(PJ,R.won,flv,(ch?ch.xp:0)+.1*(G.allies||0),ch?ch.km:0),rw=!duel&&R.won&&G.mode==='mob'?PG.reward(PJ,foes.map(e=>e.def),ch?ch.drop:1):{kamas:0,loot:[]};
 if(ch&&ch.rolls)Retos.loot(PJ,rw,ch.rolls);G.chalRes=ch;
 Object.assign(R,{kamas:r.k+rw.kamas,loot:rw.loot,xp:r.xp,up:r.up,cap:r.up*PROG.capPerLv,spp:r.up*PROG.spPerLv,lvl:PJ.lvl,xpNow:PJ.xp,xpNeed:PROG.xpNeed(PJ.lvl),max:PJ.lvl>=PROG.maxLv,unl:r.unl.map(id=>Registry.spells[id].n),
  chal:ch?ch.list:null,xpBonus:r.xp-r.bx,kamasBonus:r.k-r.bk});
 if(G.coop&&G.dun&&R.won&&G.dun.room<G.dun.rooms-1&&G.coop.host!==me.uid&&typeof Soc!=='undefined'&&Soc.live())Soc.expect(m=>Party.goCoop(m,null),180000);      // mazmorra cooperativa: el anfitrión abre la siguiente sala y entras solo
 if(G.wk&&R.won&&typeof World!=='undefined')World.dead[G.wk]=Date.now()+World.RESPAWN;
 R.sales=typeof Eco!=='undefined'?Eco.afterCombat(PJ):[];       // el mercado avanza: tus lotes a la venta pueden venderse
 if(SAVED)PG.save(PJ);G.res=R;UI.msg(R.won?'¡Victoria!':'Derrota.');UI.hud();UI.sheetRefresh();UI.result(R)}

/* una acción de la entidad que tiene el turno */
/* un jugador deja la partida (botón Salir, desconexión o inactividad): su personaje cae y el resto sigue; si su equipo se queda sin nadie, pierde */
async function dropPlayer(uid,why){const e=G.ents.find(x=>x.uid===uid&&!x.sm);if(!e||e.hp<=0||G.over)return;
 e.hp=0;e.hurt=1;e.left=true;for(const q of G.ents)if(q.sm&&q.owner===e.id)q.hp=0;float(e,'🚪','#ff9a9a');
 if(UI.log)UI.log(e.n+(why==='afk'?' fue expulsado por inactividad':why==='dc'?' se desconectó':' abandonó el combate'),'kill');
 if(check())return;UI.hud();if(G.cur===e){G.busy=true;await next()}}
async function exec(a){const e=G.cur,bid=G.bid;
 if(a.k==='quit')return dropPlayer(a.u,a.dc?'dc':'');
 if(a.k==='skip'){if(!e||G.over||e.hp<=0||e.sm||!e.uid||a.n!==G.nt)return;e.skips=(e.skips||0)+1;      // turno de un jugador que no responde: lo pasa quien lo vea primero (a.n evita duplicados)
  if(e.skips>=3)return dropPlayer(e.uid,'afk');if(UI.log)UI.log('⏱ '+e.n+' no respondió: turno pasado','foe');await next();return}
 if(!e||G.over||e.hp<=0)return;if(G.net&&e.uid){if(a.u!==e.uid)return;e.skips=0}
 if(a.k==='end'){await next();return}
 if(a.k==='mv'){const b=bfs(e.x,e.y,e.pm,e),d=b.d[a.x+','+a.y];if(!(d>0))return;
  let p=pathTo(b,a.x,a.y);const ti=p.findIndex(([x,y])=>G.objs.some(o=>o.kind==='trap'&&o.x===x&&o.y===y));if(ti>=0)p=p.slice(0,ti+1);   // una trampa detiene a quien la pisa
  if(e===G.me)G.mv=(G.mv||0)+1;G.busy=true;G.sel=null;e.pm-=p.length;look(e,p[p.length-1][0],p[p.length-1][1]);e.path=p;while(e.path.length&&G.bid===bid)await wait(40);if(G.bid!==bid)return;
  const ev=Rules.land(G,e);if(ev.length){play(ev);await wait(450);if(G.bid!==bid)return}
  G.busy=false;UI.hud();check();return}
 if(a.k==='it'){const err=Rules.usable(G,e,a.id);if(err){if(e===G.me)UI.msg(err);return}
  G.busy=true;G.sel=null;e.cast=.6;if(UI.log)UI.log(e.n+' usa '+Registry.items[a.id].n,'cast');await wait(260);if(G.bid!==bid)return;
  play(Rules.useItem(G,e,a.id));await wait(220);if(G.bid!==bid)return;G.busy=false;UI.hud();check();return}
 if(a.k==='ct'){const c=e.sp[a.s];if(!c)return;const sp=Registry.spells[c.id],err=Rules.can(G,e,sp,a.x,a.y);if(err){if(e===G.me)UI.msg(err);return}
  if(e===G.me)G.cs=(G.cs||0)+1;G.busy=true;G.sel=null;if(UI.log)UI.log(e.n+' lanza '+sp.n,'cast');if(sp.tg==='e')look(e,a.x,a.y);const far=sp.tg==='e'&&sp.r[1]>1,t=sp.tg==='e'&&occ(a.x,a.y,e);
  if(far){e.cast=.5;G.pr.push({a:[e.px,e.py],b:[t.px,t.py],t:0,c:sp.fx})}else if(sp.tg==='e')e.atk=1;else e.cast=.6;
  await wait(far?320:260);if(G.bid!==bid)return;
  play(Rules.cast(G,e,a.s,a.x,a.y));await wait(220);if(G.bid!==bid)return;G.busy=false;UI.hud();check()}}

/* IA: lanza el hechizo con mejor valor por PA; si no puede, se coloca a la distancia de su mejor ataque */
function spVal(m,f,sp,c){const k=1+(c.lv-1)*PROG.spBonus;let v=0;
 for(const x of sp.e){if(x.k==='d'&&x.on==='s')v-=(x.a+x.b)/2*k*.9;else if(x.k==='d')v+=(x.a+x.b)/2*k*(1+Rules.P(m,x.el)/100)*(x.ls?1.4:1);else if(x.k==='h')v+=(1-m.hp/m.mhp)*(x.a+x.b)/2*k*1.6;
  else if(x.k==='ar'&&!m.ar.length)v+=(x.a+x.b)/2*k*.8;else if(x.k==='b')v+=x.on==='s'?(m.fx.some(q=>q.s===x.s)?0:14):10*Math.abs(x.v);
  else if(x.k==='dot'&&!f.dots.length)v+=(x.a+x.b)/2*k*x.tn*.8;else if(x.k==='push')v+=2}
 return v/Math.max(1,sp.pa)}
/* camino real hasta una celda (solo los obstáculos estorban, los personajes no) → la IA rodea los muros en vez de quedarse pegada */
function flood(sx,sy){const d={},q=[[sx,sy]];d[sx+','+sy]=0;for(let i=0;i<q.length;i++){const[x,y]=q[i],k=d[x+','+y];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=nx+','+ny;if(nk in d||blocked(nx,ny))continue;d[nk]=k+1;q.push([nx,ny])}}return d}
/* mejor celda alcanzable para atacar a f desde la distancia «want»: prefiere las que VEN a f; si ninguna lo ve, se acerca por el camino más corto */
function approach(m,f,want){const b=bfs(m.x,m.y,m.pm,m),pd=flood(f.x,f.y),sc=(x,y)=>Rules.los(G,x,y,f.x,f.y)?Math.abs(Math.abs(x-f.x)+Math.abs(y-f.y)-want):6+(pd[x+','+y]==null?99:pd[x+','+y]);
 let best=null,bs=sc(m.x,m.y);for(const k in b.d){if(!b.d[k])continue;const[x,y]=k.split(',').map(Number),v=sc(x,y);if(v<bs){bs=v;best=[x,y]}}return best}
function aiStep(m,f){const want=Math.min(5,Math.max(1,...m.sp.map(c=>Registry.spells[c.id]).filter(s=>s.e.some(x=>x.k==='d'&&x.on!=='s')).map(s=>s.r[1])));return approach(m,f,want)}
const dcell=(c,f)=>Math.abs(c[0]-f.x)+Math.abs(c[1]-f.y);
async function ai(m,bid){await wait(450);
 for(let g=0;g<14&&G.bid===bid&&!G.over;g++){const f=G.ents.find(x=>x.team!==m.team&&x.hp>0&&!x.sm)||G.ents.find(x=>x.team!==m.team&&x.hp>0);if(!f)break;let best=null,bv=0;
  const live=Rules.alive(G,m).length,own=G.objs.filter(o=>o.own===m.id).length;
  m.sp.forEach((c,i)=>{const sp=Registry.spells[c.id];if(sp.e.some(x=>x.k==='sw'))return;
   const mk=sp.e.find(x=>x.k==='sm'||x.k==='ob'||x.k==='det'||x.k==='evo');
   if(mk){if(Rules.ready(m,sp))return;let v=0,x=m.x,y=m.y;                          // invocar · colocar trampa/glifo/bomba · detonar · evolucionar
    if(mk.k==='sm'||mk.k==='ob'){const cell=Rules.range(G,m,sp).filter(([cx,cy])=>!Rules.can(G,m,sp,cx,cy)).sort((p,q)=>dcell(p,f)-dcell(q,f))[0];if(!cell)return;[x,y]=cell;
     v=(mk.k==='sm'?((Registry.objs[mk.o].nc||live<PROG.maxSum(m.lvl))&&!(Registry.objs[mk.o].max&&Rules.alive(G,m).filter(q=>q.dk===mk.o).length>=Registry.objs[mk.o].max)?40:0):own<3?24:0)/Math.max(1,sp.pa)}
    else if(mk.k==='det')v=G.objs.some(o=>o.own===m.id&&o.kind==='bomb'&&md(o,f)<=1)?50/Math.max(1,sp.pa):0;
    else v=Rules.alive(G,m).some(q=>Registry.objs[q.dk].tur&&q.evo<3)?30/Math.max(1,sp.pa):0;
    if(v>bv){bv=v;best={k:'ct',s:i,x,y}}return}
   if(sp.tg==='c')return;const x=sp.tg==='s'?m.x:f.x,y=sp.tg==='s'?m.y:f.y;
   if(Rules.can(G,m,sp,x,y))return;const v=spVal(m,f,sp,c);if(v>bv){bv=v;best={k:'ct',s:i,x,y}}});
  if(best){await exec(best);await wait(350);continue}
  const c=m.pm>0&&aiStep(m,f);if(c){await exec({k:'mv',x:c[0],y:c[1]});continue}break}
 await wait(200)}

/* IA de las INVOCACIONES (juegan solas justo después de su dueño): atacan al enemigo más cercano, curan al aliado más herido,
   se acercan según su rol (dk.ai: melee · ranged · heal · tackle · kami · static) y las torretas/árboles no se mueven (pm 0) */
async function sai(m,bid){await wait(300);const dk=Registry.objs[m.dk]||{},mode=dk.ai||'melee';
 for(let g=0;g<8&&G.bid===bid&&!G.over&&m.hp>0;g++){
  const foes=G.ents.filter(x=>x.team!==m.team&&x.hp>0).sort((a,b)=>md(m,a)-md(m,b)),hurt=G.ents.filter(x=>x.team===m.team&&x.hp>0&&x.hp<x.mhp).sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp),f=foes[0];let best=null,bv=0;
  m.sp.forEach((c,i)=>{const sp=Registry.spells[c.id];if(Rules.ready(m,sp))return;let x,y,v;
   if(sp.tg==='s'){if(sp.aoe!=null&&f&&md(m,f)<=sp.aoe){x=m.x;y=m.y;v=50}else return}
   else if(sp.tg==='a'){const a=hurt.find(q=>!Rules.can(G,m,sp,q.x,q.y));if(!a)return;x=a.x;y=a.y;v=40*(1-a.hp/a.mhp)+5}
   else{const t=foes.find(q=>!Rules.can(G,m,sp,q.x,q.y));if(!t)return;x=t.x;y=t.y;v=spVal(m,t,sp,c)+1}
   if(v>bv){bv=v;best={k:'ct',s:i,x,y}}});
  if(best){await exec(best);await wait(350);continue}
  const tg=mode==='heal'&&hurt.find(q=>q!==m)||f;if(!tg||m.pm<=0||mode==='static')break;
  const rg=Math.max(1,...m.sp.map(c=>Registry.spells[c.id].r[1])),want=mode==='ranged'?Math.min(4,rg):mode==='heal'&&tg!==f?2:1,bc=approach(m,tg,want);
  if(bc){await exec({k:'mv',x:bc[0],y:bc[1]});continue}break}
 await wait(150)}
/* las invocaciones nacen con la parte visual (PNG: assets/objects/<id>.png · si falta, icono) */
G.onSummon=(q,d)=>Object.assign(q,{def:{sprite:{src:'assets/objects/'+d.id+'.png'},ico:d.ico,scale:d.scale||.75},ico:d.ico,px:q.x,py:q.y,path:[],face:q.team?-1:1,atk:0,hurt:0,cast:0,seed:Math.random()*6});

/* reloj del turno: corre mientras el jugador puede actuar (no durante animaciones). Al llegar a 0 el turno pasa solo; en PvP lo envía el cliente de quien juega */
function tick(dt){if(G.over||!G.tmax||!G.cur||G.busy||(!G.net&&(G.paused||(typeof overlayOpen==='function'&&overlayOpen()))))return;G.tl=Math.max(0,G.tl-dt);   // en PvP el reloj NO se pausa (los demás no pueden esperar)
 if(G.net&&G.tl<=0&&G.cur!==G.me&&G.me&&G.me.uid){G.gr+=dt;if(G.gr>6&&!G.tskip){G.tskip=true;Net.send({k:'skip',u:G.me.uid,n:G.nt})}}
 if(G.tl<=0&&!G.tfire&&G.cur===G.me){G.tfire=true;UI.msg('⏱ ¡Tiempo agotado! Turno pasado automáticamente.');act({k:'end'})}}
/* acciones del jugador local (en PvP viajan por la red y se ejecutan cuando vuelven, en el mismo orden para los dos) */
function act(a){if(G.over||G.busy||G.cur!==G.me)return;if(G.net)Net.send({...a,u:G.me.uid});else G.q=G.q.then(()=>exec(a))}
function pick(i){const p=G.me;if(G.over||G.busy||G.cur!==p||!p.sp[i])return;const sp=Registry.spells[p.sp[i].id],err=Rules.ready(p,sp);
 if(err){UI.msg(err);return}if(sp.tg==='s'){act({k:'ct',s:i,x:p.x,y:p.y});return}G.sel=G.sel===i?null:i;UI.hud()}
function click(x,y){if(G.hub)return Hub.click(x,y);const p=G.me;if(G.over||G.busy||G.cur!==p||p.path.length||!Rules.kind(G,x,y))return;
 if(G.sel!=null)return act({k:'ct',s:G.sel,x,y});const d=bfs(p.x,p.y,p.pm,p).d[x+','+y];if(d>0)act({k:'mv',x,y})}
function useItem(id){const p=G.me;if(G.over||G.busy||G.cur!==p)return;const err=Rules.usable(G,p,id);if(err){UI.msg(err);return}act({k:'it',id})}
function endTurn(){if(G.over&&G.res){UI.result(G.res);return}if(!G.over&&G.cur===G.me&&!G.busy&&!G.me.path.length)act({k:'end'})}

/* ---------- SALIR / ABANDONAR (botón 🚪 Salir de la barra de combate) ----------
   · Duelo vs IA y Monstruos: cuenta como DERROTA (sin botín).
   · Mazmorra: pierdes TODAS las recompensas pendientes; tu equipo sigue sin ti.
   · PvP (1v1 · 2v2 · 3v3): cuenta como derrota; tu equipo sigue sin ti (en 1v1 gana el rival).
   leaveInfo() = texto del aviso · forfeit() = ejecutarlo */
function leaveInfo(){const m=G.mode,tm=Party.builds().map(b=>b.name),dead=G.me&&G.me.hp<=0;
 if(G.net){const mates=G.ents.filter(e=>!e.sm&&e.team===G.me.team&&e!==G.me&&e.hp>0).length;
  if(dead)return{t:'Ya estás fuera del combate',d:'Puedes marcharte sin penalización, pero no recibirás recompensa aunque tu equipo gane.',b:'Marcharme'};
  return{t:'¿Abandonar el combate?',d:'Cuenta como <b>derrota</b> (XP reducida, sin kamas extra). '+(mates?'Tu equipo <b>seguirá luchando sin ti</b>.':(m==='mob'?'Los monstruos ganan.':'Tu rival gana la partida.')),b:'Abandonar'}}
 if(G.dun)return{t:'¿Salir de la mazmorra?',d:'Pierdes <b>todas las recompensas</b> que quedaban por conseguir (esta sala y las siguientes) y tendrás que empezarla de nuevo.'+(tm.length?' <b>'+tm.map(esc).join(', ')+'</b> '+(tm.length>1?'siguen':'sigue')+' sin ti.':''),b:'Salir y perder recompensas'};
 return{t:'¿Abandonar el combate?',d:'Cuenta como <b>derrota</b>: recibes la XP de perder y <b>ningún botín</b>.',b:'Abandonar'}}
async function forfeit(){if(G.hub||G.over||!G.me)return;const me=G.me;G.left=true;
 if(G.net){const dead=me.hp<=0;if(!dead){const foes=G.ents.filter(e=>!e.sm&&e.team!==me.team),fl=Math.round(foes.reduce((a,e)=>a+e.lvl,0)/Math.max(1,foes.length)),r=G.duel?{xp:0,k:0}:PG.result(PJ,false,fl,0,0);if(SAVED)PG.save(PJ);
   Net.send({k:'quit',u:me.uid});Chat.add('combate',G.duel?'🚪 Abandonaste el duelo (los duelos no dan XP ni kamas)':'🚪 Abandonaste el combate · derrota (+'+r.xp+' XP, +'+r.k+' kamas)','sys')}
  Net.leave();Hub.enter();UI.head();UI.msg(dead?'Saliste del combate.':'🚪 Abandonaste el combate: cuenta como derrota.');return}
 if(G.dun){const tm=Party.builds().map(b=>b.name);Dun.run=null;Hub.enter();UI.msg('🚪 Saliste de la mazmorra: pierdes las recompensas pendientes.');
  if(tm.length)Chat.add('equipo','Saliste de la mazmorra. '+tm.join(', ')+(tm.length>1?' continúan':' continúa')+' sin ti.','sys');return}
 G.bid++;finish(1-me.team)}                       // IA / monstruos: derrota normal (muestra la ventana de resultado con «Abandonaste»)
