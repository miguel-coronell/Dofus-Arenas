/* ready.js · ✅ PREPARACIÓN: antes de CADA combate (monstruos, duelo IA, mazmorras, PvP, desafíos y Coliseo) el combate NO empieza hasta que todos los jugadores
   reales pulsen «¡Listo!». Los aliados IA y los monstruos están listos solos. En PvP cada «listo» viaja como acción {k:'rdy',u} (net.js/main.js la interceptan);
   si alguien abandona mientras tanto, deja de contar. Atajo: Espacio. Llamado desde startBattle (combat.js). */
const Ready={on:false,set:{},cb:null,bid:0,iv:0,t0:0,
 humans:()=>G.ents.filter(e=>!e.sm&&e.hp>0&&(G.net?e.uid:e===G.me)),
 begin(cb){Ready.stop();Ready.on=true;Ready.set={};Ready.cb=cb;Ready.bid=G.bid;Ready.t0=Date.now();G.busy=true;G.cur=null;
  Ready.iv=setInterval(()=>Ready.tick(),400);Ready.paint();UI.msg('✅ Preparación: pulsa «¡Listo!» cuando quieras empezar')},
 key:e=>G.net?e.uid:'me',
 me(){if(!Ready.on||!G.me||Ready.set[Ready.key(G.me)])return;Ready.mark(Ready.key(G.me));if(G.net&&G.me.uid)Net.send({k:'rdy',u:G.me.uid})},
 mark(u){if(!Ready.on)return;Ready.set[u]=1;Ready.paint();Ready.tick()},
 tick(){if(!Ready.on)return;if(G.bid!==Ready.bid||G.over||G.hub){Ready.stop();return}
  const H=Ready.humans();if(H.length&&H.every(e=>Ready.set[Ready.key(e)])){const cb=Ready.cb;Ready.stop();UI.msg('⚔ ¡Que comience el combate!');if(cb)cb()}else Ready.paint()},
 stop(){Ready.on=false;Ready.cb=null;clearInterval(Ready.iv);Ready.iv=0;const el=$('#ready');if(el)el.hidden=true},
 paint(){const el=$('#ready');if(!el||!Ready.on)return;const me=G.me,row=e=>{const h=!e.sm&&(G.net?!!e.uid:e===me),ok=!h||Ready.set[Ready.key(e)];
   return`<li class="${ok?'ok':''}${e===me?' me':''}"><span>${e.build?Registry.classes[e.build.cls].ico:esc(e.ico||'👾')} ${esc(e.n)}<small>Nv ${e.lvl}</small></span><b>${h?(ok?'✔ Listo':'⏳ Esperando'):'🤖'}</b></li>`},
  L=G.ents.filter(e=>!e.sm&&e.hp>0),t0=L.filter(e=>e.team===me.team),t1=L.filter(e=>e.team!==me.team),mine=Ready.set[Ready.key(me)],w=Ready.humans().filter(e=>!Ready.set[Ready.key(e)]);
  el.innerHTML=`<div class="rdy"><h3>⚔ Preparación</h3><div class="rdy-c"><ul><h4>Tu equipo</h4>${t0.map(row).join('')}</ul><ul><h4>Rivales</h4>${t1.map(row).join('')}</ul></div>
   <div class="rdy-f">${mine?'⏳ Esperando a: '+esc(w.map(e=>e.n).join(', ')||'…'):'El combate empieza cuando <b>todos los jugadores</b> estén listos.'}</div><button id="rdybtn" ${mine?'disabled':''}>${mine?'✔ Listo':'✅ ¡Listo! [Espacio]'}</button></div>`;el.hidden=false}};
$('#ready').addEventListener('click',e=>{if(e.target.id==='rdybtn')Ready.me()});
