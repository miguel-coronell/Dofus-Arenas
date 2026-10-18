/* dungeon.js · partida de MAZMORRA: 3 salas seguidas (2 de esbirros + jefe). Tu vida pasa de una sala a otra (recuperas un 40 % entre salas); si pierdes, se acaba.
   Datos en js/data/dungeons.js · ventana en js/ui/dungeons.js. Los aliados del EQUIPO (👥) entran contigo (IA). */
const Dun={run:null,
 list:()=>Object.values(Registry.dungeons).sort((a,b)=>a.lv-b.lv||a.n.localeCompare(b.n)),
 can:d=>PJ.lvl>=d.lv?null:'Requiere nivel '+d.lv,
 /* monstruos de una sala: [{id,mult}] · n = compañeros extra (más aliados → más enemigos) · cap = máximo (en cooperativo 4: cabe en cualquier arena) */
 foes(d,room,n,cap){const M=d.mins,last=room===d.rooms-1,L=last?[{id:d.bossId,mult:5},{id:M[0],mult:1},{id:M[1],mult:1}]:Array.from({length:room?3:2},(_,i)=>({id:M[i%2],mult:1}));for(let i=0;i<n;i++)L.push({id:M[i%2],mult:1});return cap?L.slice(0,cap):L},
 start(id,solo){const d=Registry.dungeons[id];if(!d)return'Mazmorra desconocida';if(typeof Coli!=='undefined'&&Coli.busy())return'Estás buscando partida en el Coliseo: cancela la búsqueda primero';const e=Dun.can(d);if(e)return e;if(!solo&&typeof Soc!=='undefined'&&Soc.live()&&Party.others().length)return Party.callDungeon(d);      // grupo real: avisa a todos y entran los que se unan (cooperativo)
  Dun.run={id,room:0,hp:0};Dun.room();return null},
 room(){const R=Dun.run,d=Registry.dungeons[R.id],last=R.room===d.rooms-1,n=Party.builds().length,
  foes=Dun.foes(d,R.room,n).map(f=>f.mult>1?{m:Registry.monsters[f.id],mult:f.mult}:{m:Registry.monsters[f.id]});      // más aliados → más enemigos
  Hub.leave();Net.leave();$('#result').hidden=true;
  startBattle(Maps.pick(G.arena&&G.arena.id),{mode:'mob',me:PJ,foes,lvl:Math.max(PJ.lvl,d.lv),allies:Party.builds(),dun:{id:d.id,n:d.n,room:R.room,rooms:d.rooms}});
  if(R.room>0&&R.hp>0)G.me.hp=Math.min(G.me.mhp,R.hp+Math.round(G.me.mhp*.4));
  mapInfo();rs();fitView();UI.hud();UI.msg('🏰 '+d.n+' · sala '+(R.room+1)+' de '+d.rooms+(last?' · ¡EL JEFE: '+d.boss+'!':''))},
 /* tras ganar una sala: la siguiente (desde el botón de la ventana de resultado) */
 /* cooperativo: solo el anfitrión (quien montó la partida) abre la siguiente sala; los demás entran solos. La vida pasa de sala en sala (+40 %), también para los caídos */
 coopNext(){const co=G.coop,d=G.dun&&Registry.dungeons[G.dun.id];if(!co||!d||!G.over||co.host!==Net.uid)return;const room=G.dun.room+1,pl=G.ents.filter(e=>e.uid&&!e.sm&&!e.left),hps={};
  pl.forEach(e=>hps[e.uid]=Math.min(e.mhp,Math.max(0,Math.ceil(e.hp))+Math.round(e.mhp*.4)));const F=Dun.foes(d,room,pl.length-1,4),lvl=(G.ents.find(e=>e.team===1)||{}).lvl||d.lv;
  Net.hostCoop(pl.map(e=>({uid:e.uid,build:e.build})),F.map(f=>f.id),lvl,{found:m=>Party.goCoop(m,null),lost:()=>UI.msg('⚠ No se pudo abrir la siguiente sala')},{mult:F.map(f=>f.mult),dun:{id:d.id,room},hp:hps})},
 next(){if(G.coop){Dun.coopNext();return}if(!Dun.run||!G.over)return;Dun.run.hp=G.me.hp;Dun.run.room++;Dun.room()}};
