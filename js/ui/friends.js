/* friends.js · 🤝 AMIGOS (ventana con lista, enemigos, solicitudes y CHAT PRIVADO) · avisos en pantalla (solicitudes, desafíos, intercambios) · menú del jugador/monstruo al tocarlo en el mapa.
   Datos y red: js/net/social.js (Soc) · intercambios: js/ui/trade.js. Botón 🤝 en el panel del menú (#frb). */
const Fr={tab:'f',sel:null,notes:[],nid:1,sq:{q:'',list:null,err:'',busy:false,n:0},ss:null,tg:null,   // sq = búsqueda de jugadores · ss = resultado elegido · tg = jugador sobre el que actúan los botones
 /* ---------- avisos ---------- */
 note(text,fn){Fr.notes.push({id:Fr.nid++,text,fn,t:Date.now()});if(Fr.notes.length>4)Fr.notes.shift();Fr.paint()},
 alert(k){Fr.paint()},
 /* toasts: avisos sueltos + peticiones pendientes (amistad · duelo · intercambio) */
 paint(){const el=$('#stoast');if(!el)return;let h='';
  for(const n of Fr.notes)h+=`<div class="sn" data-n="${n.id}"><span>${esc(n.text)}</span><button class="sx" data-nx="${n.id}" title="Cerrar">✕</button></div>`;
  for(const k in Soc.q){const v=Soc.q[k];if(v.hid)continue;const C=Registry.classes[v.c],who=`<b>${esc(v.n)}</b>${C?` <small>${C.ico} Nv ${v.l||'?'}</small>`:''}`,busy=!G.hub||Coli.busy()||!!Trade.t;
   if(v.t==='fr')h+=`<div class="sn q">🤝 ${who} quiere ser tu amigo<div class="sb"><button data-fa="${k}">Aceptar</button><button data-fd="${k}" class="no">Rechazar</button><button class="sx" data-hx="${k}" title="Decidir luego">✕</button></div></div>`;
   else if(v.t==='du')h+=`<div class="sn q duel">⚔ ${who} te desafía a un <b>duelo 1 vs 1</b><div class="sb"><button data-da="${k}" ${busy?'disabled title="Estás ocupado"':''}>Aceptar</button><button data-dd="${k}" class="no">Rechazar</button></div></div>`;
   else if(v.t==='gi')h+=`<div class="sn q">👥 ${who} te invita a su <b>grupo</b><div class="sb"><button data-ga="${k}" ${Party.lead||Party.m.length?'disabled title="Ya estás en un grupo"':''}>Aceptar</button><button data-gd="${k}" class="no">Rechazar</button></div></div>`;
   else if(v.t==='tr')h+=`<div class="sn q">🔄 ${who} quiere <b>intercambiar</b> contigo<div class="sb"><button data-ta="${k}" ${busy?'disabled title="Estás ocupado"':''}>Aceptar</button><button data-td="${k}" class="no">Rechazar</button></div></div>`}
  el.innerHTML=h;el.hidden=!h},
 refresh(){Fr.paint();Fr.dot();if(!$('#friends').hidden)Fr.render()},
 dot(){const d=$('#frb .dot');if(d)d.hidden=!(Soc.unreadAll()||Object.values(Soc.q).some(v=>v.t==='fr'))},
 /* ---------- ventana ---------- */
 open(u){if(u&&Soc.f[u]){Fr.tab='f';Fr.sel=u;Soc.markRead(u)}Fr.render();$('#friends').hidden=false;G.paused=true;setTimeout(()=>{const l=$('#frlog');if(l)l.scrollTop=l.scrollHeight},30)},
 viewing:u=>!$('#friends').hidden&&Fr.tab==='f'&&Fr.sel===u,
 loc:u=>Fr.locO(Soc.info(u)),
 locO(o){if(!o)return{on:false,t:'Desconectado'};const same=o.s===World.srv,A=Registry.arenas[o.m],srv=(WORLD.SRV.find(s=>s[0]===o.s)||[0,o.s])[1];
  return{on:true,w:o.st==='w',t:o.st==='c'?'⚔ En combate':'🌍 '+(A?A.n:'el mundo')+(same?'':' · '+srv)}},
 reqs:()=>Object.entries(Soc.q).filter(([k,v])=>v.t==='fr'),
 render(){const el=$('#friends');if(el.hidden&&arguments[0]!==true&&!el.dataset.r){}
  const C=Registry.classes,F=Object.entries(Soc.f).sort((a,b)=>(Soc.info(b[0])?1:0)-(Soc.info(a[0])?1:0)||a[1].n.localeCompare(b[1].n)),E=Object.entries(Soc.e),R=Fr.reqs();
  if(!Soc.live()){el.innerHTML=`<div class="st-win fr-win"><div class="st-title"><span class="st-help">?</span><b>🤝 Amigos</b></div><div class="st-empty" style="padding:30px;white-space:normal">${esc(Soc.need())}</div></div>`;return}
  const tabs=`<div class="fr-tabs"><button data-ft="f" class="${Fr.tab==='f'?'on':''}">Amigos <em>${F.length}</em></button><button data-ft="e" class="${Fr.tab==='e'?'on':''}">Enemigos <em>${E.length}</em></button><button data-ft="r" class="${Fr.tab==='r'?'on':''}">Solicitudes ${R.length?`<em class="hot">${R.length}</em>`:'<em>0</em>'}</button><button data-ft="s" class="${Fr.tab==='s'?'on':''}" style="flex:1.3">🔍 Buscar</button></div>`;
  let rows='';
  if(Fr.tab==='f')rows=F.map(([u,f])=>{const L=Fr.loc(u),n=Soc.unread(u);return`<div class="st-row fr-row${u===Fr.sel?' sel':''}" data-u="${u}"><span class="st-ic">${(C[f.c]||{ico:'👤'}).ico}</span><span class="st-nm">${esc(f.n)}<small class="mk-s">Nv ${f.v} · <span class="${L.on?'fr-on':'fr-off'}">${L.on?'●':'○'}</span> ${esc(L.t)}</small></span>${n?`<span class="fr-bd">${n>9?'9+':n}</span>`:'<span></span>'}<span class="st-pts"></span></div>`}).join('');
  else if(Fr.tab==='e')rows=E.map(([u,f])=>`<div class="st-row fr-row${u===Fr.sel?' sel':''}" data-u="${u}"><span class="st-ic">☠</span><span class="st-nm">${esc(f.n)}<small class="mk-s">Nv ${f.v} · ${esc((C[f.c]||{n:''}).n)}</small></span><span></span><span class="st-pts"><button class="dt-lime alt fr-sm" data-re="${u}">Quitar</button></span></div>`).join('');
  else if(Fr.tab==='r')rows=R.map(([k,v])=>`<div class="st-row fr-row" data-k="${k}"><span class="st-ic">${(C[v.c]||{ico:'👤'}).ico}</span><span class="st-nm">${esc(v.n)}<small class="mk-s">Nv ${v.l||'?'} · quiere ser tu amigo</small></span><span></span><span class="st-pts fr-two"><button class="dt-lime fr-sm" data-fa="${k}">✔</button><button class="dt-lime alt fr-sm" data-fd="${k}">✖</button></span></div>`).join('');
  if(Fr.tab==='s')rows=Fr.sRows();
  if(!rows)rows=`<div class="st-empty" style="white-space:normal;padding:14px">${Fr.tab==='f'?'Aún no tienes amigos.<br>Toca a un jugador en el mapa → «Agregar amigo», o hazlo desde la ventana de resultado tras un desafío.<br>También puedes buscar a un jugador por su nombre en la pestaña «🔍 Buscar».':Fr.tab==='e'?'No tienes enemigos.':'No tienes solicitudes pendientes.'}</div>`;
  let right='<div class="st-empty" style="white-space:normal;padding:20px">Elige a un amigo de la lista para ver su estado y hablar con él.</div>';
  const f=Fr.tab==='f'&&Soc.f[Fr.sel];
  if(f){const u=Fr.sel,L=Fr.loc(u),can=L.on&&L.w&&G.hub&&!Trade.t,tg=Fr.tg={u,n:f.n,c:f.c,v:f.v},msgs=(Soc.dm[u]||[]).slice(-60).map(m=>`<div class="fr-m ${m.u===Net.uid?'me':''}"><b>${m.u===Net.uid?'Tú':esc(f.n)}</b> ${esc(m.t)}</div>`).join('')||'<div class="st-empty">Sin mensajes todavía. ¡Saluda!</div>';
   right=`<div class="st-hd"><span class="st-big">${(C[f.c]||{ico:'👤'}).ico}</span><div><b>${esc(f.n)}</b><small>Nv ${f.v} · <span class="${L.on?'fr-on':'fr-off'}">${L.on?'● En línea':'○ Desconectado'}</span> · ${esc(L.t)}</small></div></div>
    <div class="dt-btns fr-act"><button class="dt-lime" data-ch="${u}" ${can?'':'disabled title="Debe estar en el mundo y tú también"'}>⚔ Desafiar</button><button class="dt-lime" data-tr="${u}" ${can?'':'disabled title="Debe estar en el mundo y tú también"'}>🔄 Intercambiar</button><button class="dt-lime" data-fx="group" ${L.on?'':'disabled title="Debe estar conectado"'}>👥 Grupo</button><button class="dt-lime" data-fx="coli" ${L.on?'':'disabled title="Debe estar conectado"'}>🏟 Coliseo</button><button class="dt-lime alt" data-en="${u}">☠ Enemigo</button><button class="dt-lime alt" data-rm="${u}">🗑 Quitar</button></div>
    <div id="frlog" class="fr-log">${msgs}</div><form id="frf" autocomplete="off"><input id="fri" maxlength="200" placeholder="Mensaje privado a ${esc(f.n)}…"><button type="submit">➤</button></form>`}
  else if(Fr.tab==='s')right=Fr.sRight();
  else if(Fr.tab==='r'&&R.length)right='<div class="st-empty" style="white-space:normal;padding:20px">Acepta (✔) o rechaza (✖) las solicitudes de amistad de la lista.</div>';
  const ae=document.activeElement,kid=ae&&['fri','frsi','frsm'].includes(ae.id)?ae.id:'',keep=kid?ae.value:'',ks=kid?ae.selectionStart:0;   // el texto que escribes y el cursor se conservan al redibujar
  el.innerHTML=`<div class="st-win fr-win"><div class="st-title"><span class="st-help">?</span><b>🤝 Amigos</b></div><div class="st-body"><div class="st-left">${tabs}${Fr.tab==='s'?Fr.sForm():''}<div class="st-list">${rows}</div><div class="st-foot"><span>${F.length} amigo${F.length===1?'':'s'} · ${F.filter(([u])=>Soc.info(u)).length} en línea</span></div></div><div class="st-right fr-r">${right}</div></div></div>`;
  const l=$('#frlog');if(l)l.scrollTop=l.scrollHeight;if(kid){const i=$('#'+kid);if(i){i.value=keep;i.focus();try{i.setSelectionRange(ks,ks)}catch(e){}}}Fr.dot()},
 /* ---------- 🔍 BUSCAR jugadores por el nombre de su personaje (js/net/social.js → Soc.find) ---------- */
 sForm:()=>`<form id="frsf" class="fr-sf" autocomplete="off"><input id="frsi" maxlength="14" placeholder="Nombre del personaje…" value="${esc(Fr.sq.q)}"><button type="submit" title="Buscar">🔍</button></form>`,
 sRows(){const S=Fr.sq,C=Registry.classes,m=t=>`<div class="st-empty" style="white-space:normal;padding:14px">${t}</div>`;
  if(S.busy)return m('Buscando…');if(S.err)return m('⚠ '+esc(S.err));
  if(!S.list)return m('Escribe el nombre (o solo el principio) de un personaje y pulsa 🔍.<br>Podrás agregarlo como amigo, invitarlo a tu grupo o al Coliseo para pelear juntos, escribirle, desafiarlo o intercambiar.');
  if(!S.list.length)return m('Ningún personaje empieza por «'+esc(S.q)+'».<br><small>Solo aparecen los jugadores que ya han entrado con esta versión del juego.</small>');
  return S.list.map(r=>{const k=r.u+'|'+r.k,L=Fr.locO(r.on),rel=Soc.rel(r.u);
   return`<div class="st-row fr-row${k===Fr.ss?' sel':''}" data-sr="${esc(k)}"><span class="st-ic">${(C[r.c]||{ico:'👤'}).ico}</span><span class="st-nm">${esc(r.n)}<small class="mk-s">Nv ${r.v} · <span class="${L.on?'fr-on':'fr-off'}">${L.on?'●':'○'}</span> ${esc(L.t)}</small></span><span></span><span class="st-pts">${rel===1?'♥':rel===2?'☠':''}</span></div>`}).join('')},
 sRight(){const S=Fr.sq,r=S.list&&S.list.find(x=>x.u+'|'+x.k===Fr.ss);
  if(!r)return'<div class="st-empty" style="white-space:normal;padding:20px">Elige un personaje de los resultados para ver su estado y las acciones disponibles.</div>';
  Fr.tg={u:r.u,n:r.n,c:r.c,v:r.v};const C=Registry.classes[r.c]||{ico:'👤',n:''},L=Fr.locO(r.on),rel=Soc.rel(r.u),on=L.on,can=on&&L.w&&G.hub&&!Trade.t,off='disabled title="Debe estar conectado"',cd='disabled title="Debe estar en el mundo y tú también"',
   who=r.on&&cleanName(String(r.on.n||''))!==r.n?' · ahora juega con <b>'+esc(r.on.n)+'</b>':'';
  return`<div class="st-hd"><span class="st-big">${C.ico}</span><div><b>${esc(r.n)}</b><small>${esc(C.n)} · Nv ${r.v} · <span class="${on?'fr-on':'fr-off'}">${on?'● En línea · '+esc(L.t):'○ Desconectado'}</span>${who}</small></div></div>
   <div class="dt-btns fr-act">${rel===1?'<span class="rp-ok">♥ Ya es tu amigo</span>':rel===2?'<span class="rp-no">☠ Es tu enemigo</span>':'<button class="dt-lime" data-fx="friend">➕ Agregar amigo</button>'}<button class="dt-lime" data-fx="group" ${on?'':off}>👥 Invitar al grupo</button><button class="dt-lime" data-fx="coli" ${on?'':off}>🏟 Invitar al Coliseo</button></div>
   <div class="dt-btns fr-act"><button class="dt-lime" data-fx="duel" ${can?'':cd}>⚔ Desafiar</button><button class="dt-lime" data-fx="trade" ${can?'':cd}>🔄 Intercambiar</button>${rel===2?'':'<button class="dt-lime alt" data-fx="enemy">☠ Enemigo</button>'}</div>
   <div class="fr-hint">Las invitaciones llegan a la cuenta del jugador y caducan a los 2 min. <b>Grupo</b>: para pelear en cooperativo contra monstruos y mazmorras. <b>Coliseo</b>: para buscar partida a la vez.</div>
   ${on?`<form id="frsmf" class="fr-smf" autocomplete="off"><input id="frsm" maxlength="200" placeholder="Mensaje privado a ${esc(r.n)}…"><button type="submit">➤</button></form>`:''}`},
 async search(q){const S=Fr.sq,n=++S.n;S.q=q;S.busy=true;S.err='';Fr.render();const r=await Soc.find(q);if(S.n!==n)return;S.busy=false;S.err=r.err||'';S.list=r.list||null;
  if(S.list&&!S.list.some(x=>x.u+'|'+x.k===Fr.ss))Fr.ss=S.list.length===1?S.list[0].u+'|'+S.list[0].k:null;Fr.render()},
 pick(k){const r=Fr.sq.list&&Fr.sq.list.find(x=>x.u+'|'+x.k===k);Fr.ss=k;Fr.render();if(r&&Soc.live())Net.db.ref('online/'+r.u).once('value').then(s=>{r.on=s.val()||null;if(Fr.ss===k&&Fr.tab==='s')Fr.render()}).catch(()=>{})},   // refresca dónde está ahora
 /* acciones sobre el jugador elegido (Fr.tg): amigos y resultados de búsqueda comparten botones */
 act(k){const t=Fr.tg;if(!t)return;const u=t.u,say=m=>Fr.note(m);
  if(k==='friend'){const m=Soc.addFriend(u,t.n,t.c,t.v);say(m?'⚠ '+m:'🤝 Solicitud de amistad enviada a '+t.n);Fr.render();return}
  if(k==='group'){const m=Party.inviteReal({uid:u,n:t.n});say(m?'⚠ '+m:'👥 Invitación al grupo enviada a '+t.n);return}
  if(k==='coli'){if(Coli.busy())return say('⚠ Ya estás buscando partida en el Coliseo');const m=Soc.need();if(m)return say('⚠ '+m);Soc.send(u,{t:'ci'}).catch(()=>{});say('🏟 Invitación al Coliseo enviada a '+t.n+'. Busca partida a la vez que él.');
   if(G.hub){Win.close('#friends');setTimeout(()=>{if(!Coli.busy())Coli.open()},300)}return}
  if(k==='duel'){const m=Soc.challenge(u,t.n);if(m)say('⚠ '+m);else{say('⚔ Desafío enviado a '+t.n);Win.close('#friends')}return}
  if(k==='trade'){Trade.invite(u,t.n).then(m=>{if(m)say('⚠ '+m);else Win.close('#friends')});return}
  if(k==='enemy'){if(confirm('¿Añadir a '+t.n+' a tu lista de enemigos?')){const m=Soc.addEnemy(u,t.n,t.c,t.v);say(m?'⚠ '+m:'☠ '+t.n+' está en tu lista de enemigos');Fr.render()}return}},
 /* botones de «agregar amigo / enemigo» en la ventana de resultado de un combate contra jugadores */
 resBtn(x,msg){const u=x.uid;if(Soc.f[u])return'<span class="rp-ok">♥ Amigo</span>';if(Soc.e[u])return'<span class="rp-no">☠ Enemigo</span>';
  const sent=Date.now()-(Soc.sent[u]||0)<20000;return(msg?`<small class="rp-m">${esc(msg)}</small>`:'')+(sent?'<span class="rp-ok">⏳ Solicitud enviada</span>':`<button data-af="${u}">➕ Agregar amigo</button>`)+`<button data-ae="${u}" class="no">☠ Agregar enemigo</button>`},
 resRow:x=>`<div class="rp"><span>${(Registry.classes[x.c]||{ico:'👤'}).ico} <b>${esc(x.n)}</b> · Nv ${x.l} <em>${x.ally?'compañero':'rival'}</em></span><span class="rpb" data-u="${x.uid}">${Fr.resBtn(x)}</span></div>`};
/* ---------- eventos de la ventana ---------- */
$('#friends').addEventListener('click',e=>{const b=e.target.closest('button,[data-u],[data-sr]');if(!b)return;const d=b.dataset;
 if(d.sr){Fr.pick(d.sr);return}if(d.fx){Fr.act(d.fx);return}
 if(d.ft){Fr.tab=d.ft;Fr.render();return}
 if(d.re){Soc.removeEnemy(d.re);return}
 if(d.fa){Soc.acceptFriend(d.fa);return}if(d.fd){Soc.declineFriend(d.fd);return}
 if(d.ch){const m=Soc.challenge(d.ch,(Soc.f[d.ch]||{}).n);if(m)Fr.note('⚠ '+m);else{Fr.note('⚔ Desafío enviado');Win.close('#friends')}return}
 if(d.tr){Trade.invite(d.tr,(Soc.f[d.tr]||{}).n).then(m=>{if(m)Fr.note('⚠ '+m);else Win.close('#friends')});return}
 if(d.en){const f=Soc.f[d.en];if(f&&confirm('¿Pasar a '+f.n+' a tu lista de enemigos? Dejará de ser tu amigo.')){Soc.addEnemy(d.en,f.n,f.c,f.v);Fr.sel=null;Fr.tab='e'}return}
 if(d.rm){const f=Soc.f[d.rm];if(f&&confirm('¿Quitar a '+f.n+' de tus amigos?')){Soc.removeFriend(d.rm);Fr.sel=null}return}
 if(d.u&&b.classList.contains('fr-row')){Fr.sel=d.u;if(Fr.tab==='f')Soc.markRead(d.u);Fr.render()}});
$('#friends').addEventListener('input',e=>{if(e.target.id!=='frsi')return;const S=Fr.sq;S.q=e.target.value;clearTimeout(S.tm);S.tm=setTimeout(()=>{if(Soc.nkey(S.q).length>=2)Fr.search(S.q)},500)});   // busca sola al dejar de escribir
$('#friends').addEventListener('submit',e=>{
 if(e.target.id==='frsf'){e.preventDefault();clearTimeout(Fr.sq.tm);Fr.search($('#frsi').value);return}
 if(e.target.id==='frsmf'){e.preventDefault();const i=$('#frsm'),t=i.value.trim().slice(0,200),g=Fr.tg;if(!t||!g)return;if(Soc.f[g.u])Soc.dmSend(g.u,t);else Soc.send(g.u,{t:'pm',x:t}).catch(()=>{});Hub.cl('✉ Para '+g.n+': '+t,'sys');Fr.note('✔ Mensaje enviado a '+g.n);i.value='';return}
 if(e.target.id!=='frf')return;e.preventDefault();const i=$('#fri'),t=i.value.trim();if(t&&Fr.sel){Soc.dmSend(Fr.sel,t);i.value=''}});
$('#friends').addEventListener('keydown',e=>e.stopPropagation());
$('#friends').addEventListener('pointerdown',e=>{if(e.target===$('#friends'))Win.close('#friends')});
$('#frb').onclick=()=>Fr.open(Fr.sel&&Soc.f[Fr.sel]?Fr.sel:null);
/* ---------- avisos en pantalla ---------- */
$('#stoast').addEventListener('click',e=>{const b=e.target.closest('button');const n=e.target.closest('.sn[data-n]');
 if(b){const d=b.dataset;
  if(d.nx){Fr.notes=Fr.notes.filter(x=>x.id!==+d.nx);Fr.paint();return}if(d.hx){if(Soc.q[d.hx])Soc.q[d.hx].hid=true;Fr.paint();return}
  if(d.fa)Soc.acceptFriend(d.fa);else if(d.fd)Soc.declineFriend(d.fd);else if(d.da)Soc.acceptDuel(d.da);else if(d.dd)Soc.declineDuel(d.dd);else if(d.ga)Party.acceptInv(d.ga);else if(d.gd)Party.declineInv(d.gd);else if(d.ta)Trade.accept(d.ta);else if(d.td)Trade.decline(d.td);return}
 if(n){const o=Fr.notes.find(x=>x.id===+n.dataset.n);if(o&&o.fn){Fr.notes=Fr.notes.filter(x=>x!==o);Fr.paint();o.fn()}}});
setInterval(()=>{let ch=false;const now=Date.now();Fr.notes=Fr.notes.filter(n=>{const k=now-n.t<9000;if(!k)ch=true;return k});
 for(const k in Soc.q){const v=Soc.q[k];if((v.t==='du'||v.t==='tr'||v.t==='gi')&&now-(v.ts||0)>120000){if(v.t==='tr'&&v.tid)Net.db.ref('trades/'+v.tid).remove().catch(()=>{});Soc.del(k);ch=true}}if(ch)Fr.paint()},3000);
/* ---------- resultado de combate: agregar amigo / enemigo ---------- */
$('#result').addEventListener('click',e=>{const b=e.target.closest('[data-af],[data-ae]');if(!b)return;const u=b.dataset.af||b.dataset.ae,x=((G.res&&G.res.pl)||[]).find(p=>p.uid===u);if(!x)return;
 const m=b.dataset.af?Soc.addFriend(u,x.n,x.c,x.l):Soc.addEnemy(u,x.n,x.c,x.l),box=b.closest('.rpb');if(box)box.innerHTML=Fr.resBtn(x,m)});

/* ---------- MENÚ DEL JUGADOR / MONSTRUO (al tocarlos en el mapa) ----------
   Menú estilo Dofus para CUALQUIER jugador del mapa (reales por Firebase y simulados sin conexión):
   ✉ mensaje privado · ⚔ desafiar · ℹ informaciones · gremio · alianza · 🔄 proponer intercambio (objetos y kamas) · 👥 invitar al grupo · ⚔ invitar al coliseo
   · ➕ amigo · ☠ enemigo · 🚫 omitir para la sesión · cancelar. Lo «real» (mensaje, desafío, intercambio, amistad, coliseo) necesita un jugador conectado (e.remote). */
const PMenu={uid:null,e:null,msg:'',view:'main',pt:null,
 real:e=>!!(e&&e.remote&&e.uid),
 player(e){PMenu.uid=e.uid||null;PMenu.e=e;PMenu.msg='';PMenu.view='main';PMenu.render()},
 mob(e){PMenu.uid=null;PMenu.e=e;PMenu.msg='';PMenu.view='main';PMenu.render()},
 close(){PMenu.uid=null;PMenu.e=null;PMenu.view='main';$('#pmenu').hidden=true},
 /* coloca el menú junto al punto tocado (en pantallas pequeñas queda centrado) */
 place(){const el=$('#pmenu'),m=el.firstElementChild;if(!m)return;m.style.left=m.style.top='';el.classList.remove('at');
  if(innerWidth<600||!PMenu.pt)return;const w=m.offsetWidth,h=m.offsetHeight,[x,y]=PMenu.pt;let l=x+14;if(l+w>innerWidth-8)l=Math.max(8,x-w-14);
  m.style.left=l+'px';m.style.top=clamp(y-30,8,Math.max(8,innerHeight-h-8))+'px';el.classList.add('at')},
 item(k,ico,txt,cls){return`<button type="button" data-pm="${k}" class="pmo${cls?' '+cls:''}"><span>${ico}</span>${txt}</button>`},
 render(){const e=PMenu.e,el=$('#pmenu');if(!e){el.hidden=true;return}
  if(e.wm){const w=e.wm,names=w.ms.map(id=>Registry.monsters[id]).filter(Boolean),tm=Party.builds();
   el.innerHTML=`<div class="pm"><div class="pm-h"><span class="pm-i">${esc(e.ico||'👾')}</span><div><b>${esc(e.n)}${w.n>1?' +'+(w.n-1):''}</b><small>Grupo de monstruos · Nv ${w.lvl}</small></div></div>
    <div class="pm-t">${names.map(m=>`<span>${esc(m.ico||'👾')} ${esc(m.n)}</span>`).join('')}</div><p class="sm">Si ganas recibes XP, kamas y su botín (recursos para fabricar tus sets).${tm.length?' Irás con '+tm.map(m=>esc(m.name)).join(', ')+'.':''}</p>
    <div class="dt-btns"><button class="dt-lime" data-pm="fight">⚔ Desafiar</button><button class="dt-lime alt" data-pm="x">Cerrar</button></div></div>`}
  else{const b=e.build,C=Registry.classes[b.cls],u=e.uid,r=PMenu.real(e)?Soc.rel(u):0,v=PMenu.view,
   head=`<div class="pm-hd"><canvas width="56" height="56" id="pmc"></canvas><div><small>${r===1?'♥ amigo':r===2?'☠ enemigo':PMenu.real(e)?'Jugador':'Jugador (simulado)'}</small><b>${esc(e.n)}</b><small>${C.ico} ${esc(C.n)} · Nv ${b.lvl}</small></div></div>`;let body;
   if(v==='main')body=`<div class="pm-sc">${PMenu.item('pm','✉','Enviar un mensaje privado')}${PMenu.item('duel','⚔','Desafiar')}${PMenu.item('info','ℹ','Informaciones')}${PMenu.item('guild','🛡','Información del gremio')}${PMenu.item('ally','🏳','Información de la alianza')}</div>
    <div class="pm-sc">${PMenu.item('trade','🔄','Proponer un intercambio')}${e.party?PMenu.item('kick','👥','Expulsar de mi grupo'):PMenu.item('group','👥','Invitar en mi grupo')}${PMenu.item('coli','🏟','Invitar al coliseo')}</div>
    <div class="pm-sc">${r===1?PMenu.item('unfriend','💔','Quitar de mi lista de amigos'):PMenu.item('friend','➕','Agregar a mi lista de amigos',r===2?'off':'')}${r===2?PMenu.item('unenemy','↩','Quitar de mi lista de enemigos'):PMenu.item('enemy','☠','Agregar a mi lista de enemigos')}${PMenu.item('ign','🚫','Omitir para la sesión')}</div>
    <div class="pm-sc">${PMenu.item('x','✖','Cancelar')}</div>`;
   else if(v==='pmw')body=`<div class="pm-sc pm-pad"><div class="pm-st">✉ Mensaje privado para <b>${esc(e.n)}</b></div><form id="pmf" autocomplete="off"><input id="pmi" maxlength="200" placeholder="Escribe tu mensaje…"><button type="submit">➤</button></form></div><div class="pm-sc">${PMenu.item('back','‹','Volver')}</div>`;
   else{const o=Soc.info&&PMenu.real(e)?Soc.info(u):null,A=Registry.arenas[World.map],
     rows=v==='info'?[['Clase',C.ico+' '+esc(C.n)],['Nivel',b.lvl],['Sexo',b.sex==='f'?'Mujer':'Hombre'],['Servidor',esc(World.srvName())],['Mapa',esc(A?A.n:'—')],['Relación',r===1?'♥ Amigo':r===2?'☠ Enemigo':'Ninguna'],['Estado',PMenu.real(e)?'● En línea':'Simulado (sin conexión)']].map(x=>`<div class="pm-kv"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')
      :`<p class="pm-st">${v==='guild'?'🛡 Este jugador no pertenece a ningún gremio.':'🏳 Este jugador no pertenece a ninguna alianza.'}</p><p class="sm">${v==='guild'?'Los gremios y las alianzas todavía no están disponibles en el juego.':'Cuando existan los gremios, aquí verás el gremio, su nivel y sus miembros.'}</p>`;
    body=`<div class="pm-sc pm-pad">${rows}</div><div class="pm-sc">${PMenu.item('back','‹','Volver')}</div>`}
   el.innerHTML=`<div class="pm pm-d">${head}${body}<div class="pm-m">${esc(PMenu.msg)}</div></div>`;
   LOOK.portrait($('#pmc'),b.look,b.sex,b.cls)}
  el.hidden=false;PMenu.place();if(PMenu.view==='pmw'){const i=$('#pmi');if(i)i.focus()}},
 act(k){const e=PMenu.e;if(!e)return;const u=e.uid,b=e.build,real=PMenu.real(e),say=m=>{PMenu.msg=m||'';PMenu.render()},off='Solo con jugadores reales conectados (inicia sesión con tu cuenta y entra al mapa con otros jugadores).';
  if(k==='x')return PMenu.close();if(k==='fight'){World.fight(e);return}
  if(k==='back'){PMenu.view='main';PMenu.msg='';PMenu.render();return}
  if(k==='info'||k==='guild'||k==='ally'||k==='pm'){PMenu.view=k==='pm'?'pmw':k;PMenu.msg='';PMenu.render();return}
  if(k==='duel'){if(real){const m=Soc.challenge(u,e.n);say(m||'⚔ Desafío enviado. Esperando respuesta…');if(!m)setTimeout(PMenu.close,900);return}
   if(!G.hub)return say('Solo puedes desafiar desde el mundo');if(Coli.busy())return say('Cancela la búsqueda del Coliseo primero');
   PMenu.close();Net.leave();Hub.leave();Dun.run=null;startBattle(Maps.pick(null),{mode:'ai',me:PJ,foe:JSON.parse(JSON.stringify(b)),allies:Party.builds()});G.duel=true;G.chal=[];mapInfo();rs();fitView();UI.msg('⚔ Duelo contra '+e.n+' (sin XP ni botín) · pulsa ¡Listo! para empezar');UI.hud();return}
  if(k==='trade'){if(!real)return say(off);Trade.invite(u,e.n).then(m=>{if(m)say(m);else PMenu.close()});return}
  if(k==='group'){const m=Hub.invite(e.id);say(m||'👥 Invitación enviada a '+e.n);return}
  if(k==='kick'){Hub.kick(b.id);PMenu.render();return}
  if(k==='coli'){if(!real){PMenu.close();Coli.open();return}if(Coli.busy())return say('Ya estás buscando partida en el Coliseo');
   const m=Soc.need();if(!m)Soc.send(u,{t:'ci'}).catch(()=>{});say(m||'🏟 Invitación al Coliseo enviada. Abre el Coliseo y busca partida al mismo tiempo que '+e.n+'.');if(!m)setTimeout(()=>{PMenu.close();Coli.open()},1100);return}
  if(k==='friend'){if(!real)return say(off);const m=Soc.addFriend(u,e.n,b.cls,b.lvl);say(m||'🤝 Solicitud de amistad enviada');return}
  if(k==='unfriend'){Soc.removeFriend(u);say('Quitado de tus amigos');return}
  if(k==='enemy'){if(!real)return say(off);const m=Soc.addEnemy(u,e.n,b.cls,b.lvl);say(m||'☠ Añadido a enemigos');return}
  if(k==='unenemy'){Soc.removeEnemy(u);say('Quitado de enemigos');return}
  if(k==='ign'){const n=e.n;if(real)Soc.ign[u]=true;G.ents=G.ents.filter(x=>x!==e);if(real)delete World.remote[u];PMenu.close();World.cnt();Hub.cl('🚫 Omites a '+n+' hasta que cierres la sesión.','sys');return}}};
$('#pmenu').addEventListener('click',e=>{const b=e.target.closest('button[data-pm]');if(b)PMenu.act(b.dataset.pm);else if(e.target===$('#pmenu'))PMenu.close()});
$('#pmenu').addEventListener('submit',e=>{if(e.target.id!=='pmf')return;e.preventDefault();const x=PMenu.e,i=$('#pmi'),t=i.value.trim().slice(0,200);if(!x||!t)return;
 if(PMenu.real(x)){const err=Soc.need();if(err){PMenu.msg=err;PMenu.render();return}if(Soc.f[x.uid])Soc.dmSend(x.uid,t);else Soc.send(x.uid,{t:'pm',x:t}).catch(()=>{});Hub.cl('✉ Para '+x.n+': '+t,'sys');PMenu.msg='✔ Mensaje enviado';PMenu.view='main'}
 else{Hub.cl('✉ Para '+x.n+': '+t,'sys');const n=x.n;setTimeout(()=>Fr.note('💬 '+n+': '+['¡Hola!','Ahora estoy ocupado, luego te escribo','Jaja, buena esa','¿Vamos a cazar?'][rn(0,3)]),1200);PMenu.msg='✔ Mensaje enviado';PMenu.view='main'}
 PMenu.render()});
$('#pmenu').addEventListener('keydown',e=>e.stopPropagation());
$('#c').addEventListener('pointerdown',e=>{PMenu.pt=[e.clientX,e.clientY]},true);
addEventListener('resize',()=>{if(!$('#pmenu').hidden)PMenu.place()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#pmenu').hidden){e.stopImmediatePropagation();if(PMenu.view!=='main'){PMenu.view='main';PMenu.render()}else PMenu.close()}},true);
/* el directorio de nombres se actualiza solo cuando creas, borras o subes de nivel a un personaje */
{const sv=PG.save,dl=PG.del;PG.save=function(){const r=sv.apply(this,arguments);Soc.pubSoon();return r};PG.del=function(){const r=dl.apply(this,arguments);Soc.pubSoon();return r}}
Soc.init().then(()=>{Fr.refresh();Soc.pubSoon()});
