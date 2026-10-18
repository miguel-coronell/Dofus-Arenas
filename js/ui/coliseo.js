/* ui/coliseo.js · ⚔️ COLISEO (PvP online): ventana de búsqueda de partida.
   Formatos 1 contra 1 · 2 contra 2 · 3 contra 3. La búsqueda se queda ACTIVA hasta que haya jugadores reales para llenar los dos equipos:
   no se entra a ninguna sala ni se rellena con bots. Mientras esperas puedes seguir en la sala (oficios, mercado…): arriba aparece el contador y el botón de cancelar.
   Cuando el cupo está completo sale «¡Partida encontrada!» y a los 3 s empieza el combate. Red: Net.search / Net.cancel (js/net/net.js). */
const Coli={fmt:'1v1',st:null,found:null,msg:'',iv:0,cd:0,
 busy:()=>!!(Coli.st||Coli.found),
 label:f=>(Net.FMT[f]||Net.FMT['1v1']).l,
 /* abre la ventana (desde el portal ⚔️ de la sala, el selector «PvP online» + Combatir o «Combatir de nuevo») */
 open(){if(!G.hub&&!G.over){UI.msg('Termina o abandona (🚪 Salir) el combate actual para buscar partida en el Coliseo.');return}
  if(!G.hub)Hub.enter();Coli.render();$('#colo').hidden=false;G.paused=true},
 close(){$('#colo').hidden=true;Win.unpause()},
 /* ---- búsqueda ---- */
 async start(){if(Coli.busy())return;Soc.duelT=0;const f=Coli.fmt;Coli.msg='Conectando…';Coli.render();
  if(!(await Net.init())){Coli.msg='⚠ El Coliseo online no está activo: falta configurar Firebase (js/net/firebase-config.js · ver README). Sin jugadores reales no hay partidas.';Coli.render();return}
  Coli.msg='';Coli.st={fmt:f,t0:Date.now(),n:0,need:Net.FMT[f].n*2};Coli.tick();clearInterval(Coli.iv);Coli.iv=setInterval(Coli.tick,1000);Coli.render();
  Net.search(f,JSON.parse(JSON.stringify(PJ)),{count:(n,need)=>{if(Coli.st){Coli.st.n=n;Coli.paint()}},found:m=>Coli.onFound(m),
   lost:()=>{Coli.reset();Coli.msg='⚠ Se perdió la conexión con el Coliseo. Vuelve a buscar.';if(!$('#colo').hidden)Coli.render()}})},
 cancel(){Net.cancel();Coli.reset();Coli.msg='Búsqueda cancelada.';if(!$('#colo').hidden)Coli.render()},
 /* limpia el estado local (también lo llama Net.leave) */
 reset(){Coli.st=null;Coli.found=null;clearInterval(Coli.iv);clearInterval(Coli.cd);Coli.iv=Coli.cd=0;$('#qchip').hidden=true;$('#mfound').hidden=true;if(!$('#colo').hidden)Coli.render()},
 tick(){Coli.paint()},
 mmss(){const s=Math.max(0,Math.round((Date.now()-(Coli.st?Coli.st.t0:Date.now()))/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')},
 /* contador flotante (visible en la sala aunque cierres la ventana) + progreso dentro de la ventana */
 paint(){const S=Coli.st,c=$('#qchip');if(!S){c.hidden=true;return}
  c.hidden=false;c.innerHTML=`<span class="qp">🔍</span><b>Coliseo ${S.fmt.replace('v',' vs ')}</b><span>${S.n}/${S.need} jugadores · ${Coli.mmss()}</span><button type="button" data-q="open" title="Abrir el Coliseo">Ver</button><button type="button" data-q="cancel" class="x" title="Cancelar la búsqueda">✕</button>`;
  const w=$('#colo');if(!w.hidden){const p=w.querySelector('.cq-pips');if(p)p.innerHTML=Coli.pips();const t=w.querySelector('.cq-t');if(t)t.textContent=Coli.mmss();const n=w.querySelector('.cq-n');if(n)n.textContent=S.n+' / '+S.need}},
 pips(){const S=Coli.st;return Array.from({length:S.need},(_,i)=>`<i class="${i<S.n?'on':''}${i<S.need/2?' a':' b'}"></i>`).join('')},
 render(){const S=Coli.st,me=PJ,C=Registry.classes[me.cls];let body;
  if(S){body=`<div class="cq-box"><div class="cq-spin">⚔️</div><h3>Buscando ${S.need/2===1?'duelo':'partida'} · ${esc(Coli.label(S.fmt))}</h3>
    <div class="cq-big"><b class="cq-n">${S.n} / ${S.need}</b><small>jugadores reales buscando</small></div><div class="cq-pips">${Coli.pips()}</div>
    <p class="cq-p">Tiempo de espera: <b class="cq-t">${Coli.mmss()}</b><br>La partida empieza <b>solo cuando estén los ${S.need} jugadores</b> (${S.need/2} por equipo). No se rellena con bots.<br>Mientras esperas puedes seguir en la sala; te avisamos al completarse.</p>
    <div class="cq-row"><button type="button" data-q="close">🏛 Seguir en la sala</button><button type="button" data-q="cancel" class="bad">✖ Cancelar búsqueda</button></div></div>`}
  else{const opts=Object.entries(Net.FMT).map(([k,v])=>`<button type="button" class="cq-f${k===Coli.fmt?' on':''}" data-f="${k}"><b>${k.replace('v',' vs ')}</b><small>${v.n===1?'Tu personaje solo':'Equipos de '+v.n}</small><em>${v.n*2} jugadores</em></button>`).join('');
   body=`<div class="cq-box"><div class="cq-me">${C.ico} <b>${esc(me.name)}</b> · ${esc(C.n)} · Nv ${me.lvl}</div><h3>Elige el formato</h3><div class="cq-fs">${opts}</div>
    <p class="cq-p">Los equipos se forman con <b>jugadores reales</b> que estén buscando a la vez (se reparten por nivel para que salgan parejos). Si no hay suficientes, la búsqueda <b>queda activa a la espera</b>: no entras al Coliseo hasta que se complete todo el equipo.</p>
    ${Coli.msg?`<div class="cq-msg">${esc(Coli.msg)}</div>`:''}<div class="cq-row"><button type="button" data-q="close">Cerrar</button><button type="button" data-q="go" class="ok">🔍 Buscar partida</button></div></div>`}
  $('#colo').innerHTML=`<div class="st-win cq"><div class="st-title"><span class="st-help">?</span><b>⚔️ Coliseo</b><button id="cqx" class="st-x">✕</button></div>${body}</div>`},
 /* ---- ¡cupo completo! ---- */
 onFound(m){clearInterval(Coli.iv);Coli.iv=0;Coli.st=null;$('#qchip').hidden=true;
  if(!m){Coli.reset();Coli.msg='⚠ La partida se canceló (algún jugador tenía un personaje no válido). Vuelve a buscar.';Net.leave();if(!$('#colo').hidden)Coli.render();return}
  Coli.found=m;const mine=m.players.find(p=>p.uid===m.uid).team,tm=t=>m.players.filter(p=>p.team===t).map(p=>`<li class="${p.uid===m.uid?'me':''}">${Registry.classes[p.build.cls].ico} ${esc(p.build.name)} <small>Nv ${p.build.lvl}</small></li>`).join('');
  let n=3;$('#colo').hidden=true;
  const draw=()=>{$('#mfound').innerHTML=`<div class="mf"><h2>⚔️ ¡Partida encontrada!</h2><div class="mf-t">${esc(Coli.label(m.fmt))}</div><div class="mf-cols"><div><h4>Tu equipo</h4><ul>${tm(mine)}</ul></div><div class="mf-vs">VS</div><div><h4>Rivales</h4><ul>${tm(1-mine)}</ul></div></div><div class="mf-n">Empieza en <b>${n}</b>…</div></div>`};
  draw();$('#mfound').hidden=false;Coli.cd=setInterval(()=>{n--;if(n<=0){clearInterval(Coli.cd);Coli.cd=0;Coli.go()}else draw()},1000)},
 go(){const m=Coli.found;if(!m)return;Coli.found=null;
  ['#inv','#jobs','#mkt','#sheet','#spells','#sets','#party','#dung','#result','#colo','#friends','#trade','#mfound','#qchip'].forEach(id=>{const e=$(id);if(e){e.hidden=true;e.dataset.min=''}});$('#dock').textContent='';G.paused=false;
  const dl=Soc.duelT&&Date.now()-Soc.duelT<120000;Soc.duelT=0;Hub.leave();UI.foc=UI.hov=null;startBattle(m.arena,{mode:'pvp',players:m.players,seed:m.seed,uid:m.uid,mid:m.mid});G.duel=!!dl;mapInfo();rs();fitView();Net.go();
  const mt=G.me.team,nm=t=>G.ents.filter(e=>e.team===t).map(e=>e.n).join(', ');UI.msg('¡'+Coli.label(m.fmt)+'! Tu equipo: '+nm(mt)+' · Rivales: '+nm(1-mt));UI.hud()}};
$('#colo').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.id==='cqx'||t.dataset.q==='close'){Coli.close();return}
 if(t.dataset.f){Coli.fmt=t.dataset.f;Coli.msg='';Coli.render();return}
 if(t.dataset.q==='go')Coli.start();else if(t.dataset.q==='cancel')Coli.cancel()});
$('#colo').addEventListener('pointerdown',e=>{if(e.target===$('#colo'))Coli.close()});
$('#qchip').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.q==='cancel')Coli.cancel();else if(G.hub){Coli.render();$('#colo').hidden=false;G.paused=true}});
