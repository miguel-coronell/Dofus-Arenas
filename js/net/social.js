/* social.js · AMIGOS, ENEMIGOS, MENSAJES, DESAFÍOS y presencia «en línea» (Firebase Realtime Database). Necesita sesión real (no modo local).
   Rutas (reglas en firebase/database.rules.json):
     soc/<uid>/f/<amigo> · soc/<uid>/e/<enemigo>   tus listas (solo tú las lees/escribes)
     inbox/<uid>/<id>                              BUZÓN: cualquiera puede dejarte un aviso, solo tú lo lees y lo borras. Tipos t:
        fr solicitud de amistad · fa amistad aceptada · fx te quitó de sus amigos · du desafío a duelo · dy duelo aceptado (lleva su personaje) · dn duelo rechazado · tr invitación a intercambiar (lleva el id del intercambio) · pm mensaje privado a quien no es amigo (texto en x) · ci invitación al Coliseo · GRUPO: gi invitación · ga aceptada (lleva su personaje en b) · gd rechazada · gx salir/expulsar · gc el líder empezó un combate (detalles en x) · gr lista del grupo (x) · gj «me uno» (lleva b) · gq «no voy» · gn combate ya no disponible
     dm/<uidA>_<uidB>/<id>                         chat privado entre dos jugadores
     online/<uid>                                  dónde estás (servidor, mapa, mundo/combate) para que tus amigos te vean conectado
   Duelo: A deja «du» a B → B acepta con «dy» (con su personaje) → A crea la partida 1v1 (Net.host, el mismo motor del Coliseo) y avisa a B por lobby/matched → los dos pasan a «Partida encontrada».
     names/<clave>/<uid>                           directorio de nombres de personaje para el buscador de Amigos (ver «DIRECTORIO DE NOMBRES»)
   Los avisos en pantalla salen de Soc.q (friends.js los dibuja). */
const Soc={ign:{},f:{},e:{},q:{},dm:{},rd:{},on:{},dms:{},sent:{},duel:null,wait:null,ready:false,t0:Date.now(),
 live:()=>!!(Net.db&&Net.uid),
 rel:u=>Soc.f[u]?1:Soc.e[u]?2:0,                                          // 0 nadie · 1 amigo · 2 enemigo
 pair:u=>[Net.uid,u].sort().join('_'),
 async init(){if(Soc.ready)return;if(!(await Net.init()))return;Soc.ready=true;const db=Net.db,me=Net.uid;Soc.t0=Date.now();
  try{Soc.rd=JSON.parse(localStorage.getItem('coliseo.dmrd.'+me)||'{}')||{}}catch(e){Soc.rd={}}
  Soc.rf=db.ref('soc/'+me);
  Soc.rf.child('f').on('value',s=>{Soc.f=s.val()||{};Soc.watch();Soc.changed()},e=>console.warn('amigos',e));
  Soc.rf.child('e').on('value',s=>{Soc.e=s.val()||{};Soc.changed()},e=>console.warn('enemigos',e));
  Soc.ib=db.ref('inbox/'+me);Soc.ib.on('child_added',s=>Soc.handle(s.key,s.val()),e=>console.warn('buzón',e))},
 changed(){if(typeof Fr!=='undefined')Fr.refresh()},
 del(k){delete Soc.q[k];if(Soc.ib)Soc.ib.child(k).remove().catch(()=>{});Soc.changed()},
 send(u,o){return Net.db.ref('inbox/'+u).push({f:Net.uid,n:cleanName(PJ.name)||'Jugador',ts:Date.now(),...o})},
 /* ---------- presencia: «en línea» ---------- */
 online(st){if(!Soc.live())return;const r=Net.db.ref('online/'+Net.uid);if(!st){try{r.onDisconnect().cancel()}catch(e){}r.remove().catch(()=>{});return}
  r.set({n:cleanName(PJ.name)||'Jugador',s:World.srv,m:World.map||'w1_1',st,ts:Date.now()}).catch(e=>console.warn('online',e));try{r.onDisconnect().remove()}catch(e){}},
 /* escucha dónde están tus amigos y sus mensajes */
 watch(){const want=Object.keys(Soc.f);
  for(const u of Object.keys(Soc.on))if(!want.includes(u)){try{Soc.on[u].r.off()}catch(e){}delete Soc.on[u]}
  for(const u of Object.keys(Soc.dms))if(!want.includes(u)){try{Soc.dms[u].off()}catch(e){}delete Soc.dms[u];delete Soc.dm[u]}
  for(const u of want){
   if(!Soc.on[u]){const r=Net.db.ref('online/'+u),o=Soc.on[u]={r,v:null};r.on('value',s=>{o.v=s.val();Soc.changed()},()=>{})}
   if(!Soc.dms[u]){const r=Net.db.ref('dm/'+Soc.pair(u)).limitToLast(60);Soc.dms[u]=r;Soc.dm[u]=[];r.on('child_added',s=>{const m=s.val();if(!m)return;Soc.dm[u].push(m);
     if(m.u!==Net.uid&&m.ts>Soc.t0&&!(typeof Fr!=='undefined'&&Fr.viewing(u)))Soc.msg(u,m);Soc.changed()},()=>{})}}},
 /* aviso de mensaje nuevo (si no tienes abierta esa conversación) */
 msg(u,m){const f=Soc.f[u];if(typeof Fr!=='undefined')Fr.note('💬 '+(f?f.n:m.n)+': '+m.t.slice(0,60),()=>Fr.open(u))},
 info:u=>{const o=Soc.on[u];return o&&o.v?o.v:null},                          // {n,s,m,st} si está conectado
 unread(u){const r=Soc.rd[u]||Soc.t0;return(Soc.dm[u]||[]).filter(m=>m.u!==Net.uid&&m.ts>r).length},
 unreadAll:()=>Object.keys(Soc.f).reduce((a,u)=>a+Soc.unread(u),0),
 markRead(u){Soc.rd[u]=Date.now();try{localStorage.setItem('coliseo.dmrd.'+Net.uid,JSON.stringify(Soc.rd))}catch(e){}Soc.changed()},
 dmSend(u,t){t=String(t).trim().slice(0,200);if(!t||!Soc.live())return;Net.db.ref('dm/'+Soc.pair(u)).push({u:Net.uid,n:cleanName(PJ.name)||'Jugador',t,ts:Date.now()}).catch(e=>console.warn('dm',e))},

 /* ---------- DIRECTORIO DE NOMBRES (buscador de jugadores) ----------
    names/<clave>/<uid> = {n:nombre, c:clase, v:nivel}. Cada cuenta publica sus personajes (clave = nombre en minúsculas, sin tildes ni símbolos) y el buscador de la ventana Amigos
    hace una búsqueda por PREFIJO sobre esas claves. Solo cada cuenta escribe lo suyo; el índice propio soc/<uid>/pk sirve para borrar los nombres que ya no existan. */
 nkey:s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'').slice(0,14),
 pubSoon(){clearTimeout(Soc._pt);Soc._pt=setTimeout(()=>Soc.pub().catch(e=>console.warn('nombres',e)),3000)},
 async pub(){if(!Soc.live()||!Soc.ready)return;const me=Net.uid,want={};
  for(const c of PG.all()){const n=cleanName(String(c.name||'')),k=Soc.nkey(n);if(k.length>=2&&!want[k])want[k]={n,c:Registry.classes[c.cls]?c.cls:Object.keys(Registry.classes)[0],v:clamp((c.lvl|0)||1,1,PROG.maxLv)}}
  const sig=JSON.stringify(want);if(sig===Soc._pub)return;                                   // nada cambió desde la última vez
  const old=(await Soc.rf.child('pk').once('value')).val()||{},up={};
  for(const k in old)if(!want[k])up['names/'+k+'/'+me]=null;
  for(const k in want)up['names/'+k+'/'+me]={...want[k],ts:Date.now()};
  up['soc/'+me+'/pk']=Object.keys(want).length?Object.fromEntries(Object.keys(want).map(k=>[k,1])):null;
  await Net.db.ref().update(up);Soc._pub=sig},
 /* busca personajes cuyo nombre EMPIECE por q → {list:[{u,k,n,c,v,on}]} (on = dónde está ahora, o null si no está conectado) o {err} */
 async find(q){const e=Soc.need();if(e)return{err:e};const k=Soc.nkey(q);if(k.length<2)return{err:'Escribe al menos 2 letras del nombre'};
  let s;try{s=await Net.db.ref('names').orderByKey().startAt(k).endAt(k+'\uf8ff').limitToFirst(25).once('value')}catch(x){console.warn('buscar',x);return{err:'No se pudo buscar. Si acabas de actualizar, publica las reglas de Firebase nuevas (ver DEPLOY.md).'}}
  const out=[];s.forEach(ch=>{const v=ch.val()||{};for(const u in v){const d=v[u];if(u===Net.uid||!d||typeof d.n!=='string')continue;out.push({u,k:ch.key,n:cleanName(d.n)||'Jugador',c:d.c,v:clamp(+d.v||1,1,PROG.maxLv),on:null})}});
  out.sort((a,b)=>(b.k===k)-(a.k===k)||a.n.localeCompare(b.n));const list=out.slice(0,30);
  await Promise.all(list.map(r=>Net.db.ref('online/'+r.u).once('value').then(o=>{r.on=o.val()||null}).catch(()=>{})));return{list}},
 /* ---------- listas ---------- */
 data(n,c,l){return{n:(cleanName(String(n||''))||'Jugador').slice(0,20),c:Registry.classes[c]?c:Object.keys(Registry.classes)[0],v:clamp(+l||1,1,PROG.maxLv),ts:Date.now()}},
 need:()=>Soc.live()?null:'Necesitas haber entrado con tu cuenta (no en modo local) y tener Firebase configurado.',
 addFriend(u,n,c,l){const e=Soc.need();if(e)return e;if(u===Net.uid)return'Eres tú';if(Soc.f[u])return'Ya es tu amigo';if(Soc.e[u])return'Está en tu lista de enemigos: quítalo de ahí primero';
  const rq=Object.keys(Soc.q).find(k=>Soc.q[k].t==='fr'&&Soc.q[k].f===u);if(rq){Soc.acceptFriend(rq);return null}
  if(Date.now()-(Soc.sent[u]||0)<20000)return'Ya le enviaste la solicitud';Soc.sent[u]=Date.now();Soc.send(u,{t:'fr',c:PJ.cls,l:PJ.lvl}).catch(e=>console.warn('fr',e));return null},
 acceptFriend(k){const v=Soc.q[k];if(!v)return;Soc.rf.child('f/'+v.f).set(Soc.data(v.n,v.c,v.l));Soc.send(v.f,{t:'fa',c:PJ.cls,l:PJ.lvl});Soc.del(k)},
 declineFriend(k){Soc.del(k)},
 removeFriend(u){if(!Soc.live())return;Soc.rf.child('f/'+u).remove();Soc.send(u,{t:'fx'}).catch(()=>{})},
 addEnemy(u,n,c,l){const e=Soc.need();if(e)return e;if(u===Net.uid)return'Eres tú';if(Soc.f[u])Soc.removeFriend(u);Soc.rf.child('e/'+u).set(Soc.data(n,c,l));return null},
 removeEnemy(u){if(Soc.live())Soc.rf.child('e/'+u).remove()},
 /* ---------- avisos entrantes ---------- */
 handle(k,v){if(!v||!v.t||!v.f){Soc.del(k);return}
  const life=v.t==='fr'?30*864e5:v.t==='fa'||v.t==='fx'?7*864e5:120000;if(Date.now()-(v.ts||0)>life){Soc.del(k);return}
  if(Soc.e[v.f]&&(v.t==='fr'||v.t==='du'||v.t==='tr'||v.t==='gi')){Soc.del(k);return}                    // lo que mandan tus enemigos se ignora
  if(Soc.ign[v.f]&&['fr','du','tr','pm','ci','gi','gc','gj'].includes(v.t)){Soc.del(k);return}                // «omitir para la sesión»
  const nm=cleanName(String(v.n||''))||'Jugador';v.n=nm;
  if(v.t==='fr'){if(Soc.f[v.f]){Soc.send(v.f,{t:'fa',c:PJ.cls,l:PJ.lvl});Soc.del(k);return}Soc.q[k]=v;Soc.changed();Fr.alert(k);return}
  if(v.t==='fa'){Soc.rf.child('f/'+v.f).set(Soc.data(nm,v.c,v.l));Soc.del(k);Fr.note('🤝 '+nm+' aceptó tu solicitud: ya sois amigos');return}
  if(v.t==='fx'){Soc.rf.child('f/'+v.f).remove();Soc.del(k);return}
  if(v.t==='gi'){Soc.q[k]=v;Soc.changed();Fr.alert(k);return}
  if(['ga','gd','gx','gr','gc','gj','gq','gn'].includes(v.t)){Soc.del(k);Party.onMsg(v);return}
  if(v.t==='du'||v.t==='tr'){Soc.q[k]=v;Soc.changed();Fr.alert(k);return}
  if(v.t==='pm'){Soc.del(k);Fr.note('💬 '+nm+': '+String(v.x||'').slice(0,120));Hub.cl('💬 '+nm+' te susurra: '+String(v.x||'').slice(0,120),'sys');return}
  if(v.t==='ci'){Soc.del(k);Fr.note('🏟 '+nm+' te invita al Coliseo (toca para abrirlo)',()=>{if(G.hub&&!Coli.busy())Coli.open()});return}
  if(v.t==='dn'){Soc.del(k);if(Soc.duel&&Soc.duel.u===v.f){Soc.duel=null;Fr.note('✖ '+nm+' rechazó tu desafío')}return}
  if(v.t==='dy'){Soc.del(k);Soc.duelGo(v);return}
  Soc.del(k)},
 /* ---------- duelos ---------- */
 challenge(u,n){const e=Soc.need();if(e)return e;if(!G.hub)return'Solo puedes desafiar desde el mundo';if(Coli.busy())return'Estás buscando partida en el Coliseo: cancélala primero';
  if(Soc.duel&&Soc.duel.u===u&&Date.now()-Soc.duel.t<30000)return'Ya le enviaste un desafío: espera su respuesta';
  Soc.duel={u,n,t:Date.now()};Soc.send(u,{t:'du',c:PJ.cls,l:PJ.lvl}).catch(e=>console.warn('du',e));Hub.cl('⚔ Desafiaste a '+n+'. Esperando su respuesta…','sys');return null},
 acceptDuel(k){const v=Soc.q[k];if(!v)return;if(!G.hub||Coli.busy()){UI.msg('Termina lo que estás haciendo (combate o búsqueda) para aceptar el desafío');return}
  Soc.duelT=Date.now();Soc.send(v.f,{t:'dy',b:JSON.stringify(PJ)}).catch(e=>console.warn('dy',e));Soc.del(k);Soc.expect();Hub.cl('Aceptaste el desafío de '+v.n+'…','sys')},
 declineDuel(k){const v=Soc.q[k];if(v)Soc.send(v.f,{t:'dn'}).catch(()=>{});Soc.del(k)},
 /* quien desafió recibe el «sí» con el personaje del rival: valida y monta la partida (host) */
 async duelGo(v){const d=Soc.duel;if(!d||d.u!==v.f||Date.now()-d.t>90000)return;Soc.duel=null;Soc.duelT=Date.now();let b=null;try{b=JSON.parse(v.b)}catch(e){}
  if(!b||!Net.sane(b)){Hub.cl('⚠ El personaje de '+v.n+' no es válido: duelo cancelado.','sys');return}
  if(!G.hub||Coli.busy()){Soc.send(v.f,{t:'dn'}).catch(()=>{});UI.msg('Estás ocupado: duelo cancelado');return}
  try{await Net.host('1v1',[{uid:Net.uid,build:JSON.parse(JSON.stringify(PJ)),ts:Date.now()},{uid:v.f,build:b,ts:Date.now()}],{found:m=>Coli.onFound(m),lost:()=>UI.msg('⚠ No se pudo crear el duelo')})}catch(e){console.warn('duelo',e)}},
 /* quien acepta espera el aviso de partida creada */
 expect(cb,ms){Soc.unexpect();const M=Net.db.ref('lobby/matched/'+Net.uid),w=Soc.wait={M,t:setTimeout(()=>Soc.unexpect(),ms||30000)};
  M.on('value',s=>{const mid=s.val();if(!mid||Soc.wait!==w)return;Soc.unexpect();M.remove().catch(()=>{});Net.start(mid,cb||(m=>Coli.onFound(m)))})},
 unexpect(){const w=Soc.wait;if(!w)return;Soc.wait=null;clearTimeout(w.t);try{w.M.off()}catch(e){}},
 seen(u,o){const r=Soc.rel(u);if(r===1)Hub.cl('♥ Tu amigo '+cleanName(String(o.n))+' está en este mapa.','sys');else if(r===2)Hub.cl('☠ Tu enemigo '+cleanName(String(o.n))+' está en este mapa.','sys')}};
