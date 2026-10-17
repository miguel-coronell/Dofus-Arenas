/* dungeon.js · partida de MAZMORRA: 3 salas seguidas (2 de esbirros + jefe). Tu vida pasa de una sala a otra (recuperas un 40 % entre salas); si pierdes, se acaba.
   Datos en js/data/dungeons.js · ventana en js/ui/dungeons.js. Los aliados del EQUIPO (👥) entran contigo (IA). */
const Dun={run:null,
 list:()=>Object.values(Registry.dungeons).sort((a,b)=>a.lv-b.lv||a.n.localeCompare(b.n)),
 can:d=>PJ.lvl>=d.lv?null:'Requiere nivel '+d.lv,
 start(id){const d=Registry.dungeons[id];if(!d)return'Mazmorra desconocida';if(typeof Coli!=='undefined'&&Coli.busy())return'Estás buscando partida en el Coliseo: cancela la búsqueda primero';const e=Dun.can(d);if(e)return e;Dun.run={id,room:0,hp:0};Dun.room();return null},
 room(){const R=Dun.run,d=Registry.dungeons[R.id],last=R.room===d.rooms-1,M=d.mins.map(i=>Registry.monsters[i]),n=Party.builds().length,
  foes=last?[{m:Registry.monsters[d.bossId],mult:5},{m:M[0]},{m:M[1]}]:Array.from({length:R.room?3:2},(_,i)=>({m:M[i%2]}));
  for(let i=0;i<n;i++)foes.push({m:M[i%2]});                                     // más aliados → más enemigos
  Hub.leave();Net.leave();$('#result').hidden=true;
  startBattle(Maps.pick(G.arena&&G.arena.id),{mode:'mob',me:PJ,foes,lvl:Math.max(PJ.lvl,d.lv),allies:Party.builds(),dun:{id:d.id,n:d.n,room:R.room,rooms:d.rooms}});
  if(R.room>0&&R.hp>0)G.me.hp=Math.min(G.me.mhp,R.hp+Math.round(G.me.mhp*.4));
  mapInfo();rs();fitView();UI.hud();UI.msg('🏰 '+d.n+' · sala '+(R.room+1)+' de '+d.rooms+(last?' · ¡EL JEFE: '+d.boss+'!':''))},
 /* tras ganar una sala: la siguiente (desde el botón de la ventana de resultado) */
 next(){if(!Dun.run||!G.over)return;Dun.run.hp=G.me.hp;Dun.run.room++;Dun.room()}};
