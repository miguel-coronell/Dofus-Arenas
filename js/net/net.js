/* net.js · PvP online con Firebase Realtime Database. Necesita sesión iniciada (js/net/auth.js) y js/net/firebase-config.js rellenado (ver DEPLOY.md).
   Modelo: cola por formato (transacción) → TODOS los clientes simulan el combate con la MISMA semilla y solo intercambian ACCIONES
   {k:'mv'|'ct'|'it'|'end'|'quit'|'skip',…} guardadas en orden en matches/<id>/acts; cada cliente las valida con las mismas reglas (Rules). */
const Net={uid:null,db:null,acts:null,onAct:null,sq:null,ready:false,pend:[],
 FMT:{'1v1':{n:1,l:'1 contra 1'},'2v2':{n:2,l:'2 contra 2'},'3v3':{n:3,l:'3 contra 3'}},
 /* Firebase lo inicia y autentica js/net/auth.js (login con correo o Google). Aquí solo se reutiliza esa sesión: sin sesión real no hay online. */
 async init(){if(Net.db)return true;if(!window.FIREBASE_CONFIG||!window.firebase||!firebase.apps.length)return false;
  try{const u=firebase.auth().currentUser;if(!u||u.isAnonymous)return false;Net.uid=u.uid;Net.db=firebase.database();return true}catch(e){console.error('Firebase',e);return false}},
 /* comprobación de honradez de una build (cada cliente revisa la del rival): puntos gastados ≤ ganados, hechizos y nivel válidos */
 sane(b){try{const C=Registry.classes[b.cls],L=b.lvl;if(!C||!Number.isInteger(L)||L<1||L>PROG.maxLv||!(b.vit>=0))return false;
  if(b.vit+ELS.reduce((a,e)=>a+(b.pow[e]>=0?b.pow[e]:1e9),0)+b.cap>PROG.capPerLv*L)return false;let sp=b.sp;
  for(const id in b.spLv){const l=b.spLv[id];if(!C.spells.includes(id)||!(l>=1&&l<=PROG.maxSpLv)||Registry.spells[id].lvl>L)return false;if(L<PROG.spReq[l-1])return false;for(let i=1;i<l;i++)sp+=i}
  return sp<=(L-1)*PROG.spPerLv+PROG.spStart&&Items.ok(b)}catch(e){return false}},
 /* ---------- BÚSQUEDA DE PARTIDA (Coliseo) ----------
    Formatos: 1v1 · 2v2 · 3v3. Cada jugador se apunta en lobby/q/<formato>/<uid> y se QUEDA ESPERANDO (no entra a ninguna sala) hasta que haya jugadores
    reales para llenar los dos equipos (2·n). El que completa el cupo lo detecta con una transacción, monta la partida y avisa a los demás en lobby/matched/<uid>.
    Equipos: se ordena por nivel y se reparte en «serpiente» (0,1,1,0,0,1) para que salgan parejos. NUNCA se rellena con bots.
    h = {count(n,need) · found(m) · lost()}   (la ventana ⚔️ Coliseo de ui/coliseo.js los usa) */
 async search(fmt,build,h){Net.cancel();const F=Net.FMT[fmt]||Net.FMT['1v1'],need=F.n*2,Q=Net.db.ref('lobby/q/'+fmt),mine=Q.child(Net.uid),S=Net.sq={fmt,need,build,h,t0:Date.now(),on:[]};
  const M=Net.db.ref('lobby/matched/'+Net.uid);
  M.on('value',s=>{const mid=s.val();if(!mid||Net.sq!==S||S.done)return;S.done=true;clearTimeout(S.rt);M.off();M.remove();Net.sq=null;Net.start(mid,h.found)});S.on.push(()=>M.off());
  Q.on('value',s=>{if(Net.sq===S&&!S.done&&h.count)h.count(Math.min(s.numChildren(),need),need)});S.on.push(()=>Q.off());
  /* si me sacaron de la cola (alguien armó la partida) y el aviso no llega en 12 s, vuelvo a apuntarme solo */
  mine.on('value',s=>{if(Net.sq!==S||S.done||!S.joined)return;clearTimeout(S.rt);if(!s.exists())S.rt=setTimeout(()=>{if(Net.sq===S&&!S.done)Net.search(fmt,build,h)},12000)});S.on.push(()=>mine.off());
  const me={uid:Net.uid,build,ts:Date.now()};let roster=null;
  try{await Q.transaction(cur=>{roster=null;const q=Object.assign({},cur||{});delete q[Net.uid];const ids=Object.keys(q).sort((a,b)=>(q[a].ts||0)-(q[b].ts||0));
    if(ids.length>=need-1){const pick=ids.slice(0,need-1);roster=pick.map(k=>q[k]);roster.push(me);pick.forEach(k=>delete q[k]);return Object.keys(q).length?q:null}   // cupo completo: me llevo a los más antiguos
    q[Net.uid]=me;return q})}catch(e){console.error('Coliseo',e);if(Net.sq===S){Net.cancel();h.lost&&h.lost()}return}
  if(Net.sq!==S)return;
  if(roster){S.done=true;await Net.host(fmt,roster,h);return}
  S.joined=true;try{mine.onDisconnect().remove()}catch(e){}},          // si cierra la pestaña, sale de la cola solo
 async host(fmt,roster,h){const mid=Net.db.ref('matches').push().key,seed=Math.floor(Math.random()*2147483647),
   srt=roster.slice().sort((a,b)=>(b.build.lvl-a.build.lvl)||(a.uid<b.uid?-1:1)),players=srt.map((p,i)=>({uid:p.uid,build:p.build,team:[0,1,1,0][i%4]})),uids={};players.forEach(p=>uids[p.uid]=true);
  try{await Net.db.ref('matches/'+mid+'/meta').set({host:Net.uid,fmt,seed,uids,players});
   await Promise.all(players.filter(p=>p.uid!==Net.uid).map(p=>Net.db.ref('lobby/matched/'+p.uid).set(mid)))}catch(e){console.error('Coliseo',e);Net.cancel();h.lost&&h.lost();return}
  Net.cancel();Net.start(mid,h.found)},
 cancel(){const S=Net.sq;if(!S)return;Net.sq=null;S.done=true;clearTimeout(S.rt);S.on.forEach(f=>{try{f()}catch(e){}});
  if(Net.db&&Net.uid){const m=Net.db.ref('lobby/q/'+S.fmt+'/'+Net.uid);try{m.onDisconnect().cancel()}catch(e){}m.remove()}},
 searching:()=>!!Net.sq,
 /* arranca la partida: lee la ficha, comprueba a TODOS los jugadores y escucha las acciones (se guardan hasta que el combate esté dibujado: Net.go) */
 async start(mid,cb){let m=null;try{m=(await Net.db.ref('matches/'+mid+'/meta').once('value')).val()}catch(e){}
  const pl=m&&Array.isArray(m.players)?m.players:[];
  if(!m||!pl.length||!pl.some(p=>p.uid===Net.uid)||!pl.every(p=>p.build&&Net.sane(p.build)))return cb(null);
  const n=pl.length/2,ids=Maps.ids().filter(i=>{const A=Registry.arenas[i];return A.spawn[0].length>=n&&A.spawn[1].length>=n}).sort();
  Net.pend=[];Net.ready=false;Net.acts=Net.db.ref('matches/'+mid+'/acts');if(typeof Chat!=='undefined')Chat.subMatch(mid);
  Net.acts.on('child_added',s=>{const a=s.val();if(Net.ready&&Net.onAct)Net.onAct(a);else Net.pend.push(a)});
  Net.dck=Net.acts.push();try{Net.dck.onDisconnect().set({u:Net.uid,k:'quit',dc:1})}catch(e){}        // si se cae la conexión a media partida, los demás lo ven como abandono
  cb({players:pl,seed:m.seed,fmt:m.fmt,mid,uid:Net.uid,arena:ids[m.seed%ids.length]})},
 /* el combate ya está dibujado: ahora sí se ejecutan las acciones que llegaron mientras tanto */
 go(){Net.ready=true;const L=Net.pend||[];Net.pend=[];L.forEach(a=>Net.onAct&&Net.onAct(a))},
 send(a){Net.acts&&Net.acts.push(a)},
 leave(){Net.cancel();
  if(Net.acts){if(Net.uid&&!(G.mode==='pvp'&&(G.over||G.left)))Net.send({k:'quit',u:Net.uid});   // salir de una partida en curso (o encontrada y aún sin empezar) = abandonar
   Net.acts.off();Net.acts=null;if(typeof Chat!=='undefined')Chat.subMatch(null)}
  if(Net.dck){try{Net.dck.onDisconnect().cancel()}catch(e){}Net.dck=null}Net.ready=false;Net.pend=[];
  if(typeof Coli!=='undefined')Coli.reset()}};
