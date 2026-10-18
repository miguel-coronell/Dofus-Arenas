/* trade.js · 🔄 INTERCAMBIOS entre jugadores (kamas y objetos). Se abre desde el menú del jugador (toca su personaje en el mapa) o desde la ventana Amigos.
   Protocolo (Firebase trades/<id>): cada jugador escribe SU oferta {k kamas, it objetos, v versión, ok, cm}.
     · «ok» = la versión de la oferta del otro que has aceptado. Si cualquiera cambia su oferta, su versión sube y los dos aceptan de nuevo.
     · Con los dos «ok» válidos cada cliente escribe «cm» (compromiso con ambas versiones) y bloquea su ventana; cuando los DOS compromisos casan, cada cliente
       quita lo suyo y recibe lo del otro (mismo código en los dos lados) y guarda al instante. Cancelar = borrar el intercambio.
   Límite honesto (como el resto del progreso): sin servidor, un cliente manipulado podría mentir sobre lo que ofrece. Para comercio serio haría falta Cloud Functions. */
const Trade={t:null,msg:'',ft:'',
 MAXT:12,
 enc:o=>JSON.stringify(o),
 dec(s){let o={};try{o=JSON.parse(s)||{}}catch(e){}const r={};let n=0;for(const id in o){const q=Math.floor(+o[id]);if(!Registry.items[id]||!(q>=1)||q>PROG.maxStack||++n>Trade.MAXT)continue;r[id]=q}return r},
 rec(o){return{k:clamp(Math.floor(+o.k)||0,0,1e9),it:Trade.dec(o.it),v:Math.floor(+o.v)||0,ok:Math.floor(+o.ok)||0,cm:String(o.cm||'')}},
 /* ---------- abrir ---------- */
 async invite(u,n){const e=Soc.need();if(e)return e;if(!G.hub)return'Solo puedes intercambiar desde el mundo';if(Trade.t)return'Ya tienes un intercambio abierto';if(Coli.busy())return'Cancela la búsqueda del Coliseo primero';
  const tid=Net.db.ref('trades').push().key;try{await Net.db.ref('trades/'+tid+'/meta').set({a:Net.uid,b:u,uids:{[Net.uid]:true,[u]:true},ts:Date.now()});await Soc.send(u,{t:'tr',tid})}catch(x){console.warn('trade',x);return'No se pudo crear el intercambio (¿reglas de Firebase sin publicar?)'}
  Trade.open(tid,u,n);Trade.msg='Esperando a que '+n+' acepte la invitación…';Trade.render();return null},
 async accept(k){const v=Soc.q[k];if(!v)return;if(!G.hub||Trade.t||Coli.busy()){UI.msg('Termina lo que estás haciendo para aceptar el intercambio');return}
  let m=null;try{m=(await Net.db.ref('trades/'+v.tid+'/meta').once('value')).val()}catch(e){}
  if(!m||!m.uids||!m.uids[Net.uid]||m.a!==v.f){Soc.del(k);Fr.note('⚠ Ese intercambio ya no existe');return}
  Soc.del(k);Trade.open(v.tid,v.f,v.n);Trade.render()},
 decline(k){const v=Soc.q[k];if(v&&v.tid)Net.db.ref('trades/'+v.tid).remove().catch(()=>{});Soc.del(k)},
 open(tid,u,n){const t=Trade.t={tid,u,n:(cleanName(String(n||''))||'Jugador'),ref:Net.db.ref('trades/'+tid),my:{k:0,it:{},v:1,ok:0,cm:''},th:null,done:false,t0:Date.now()};
  Trade.msg='';Trade.ft='';Trade.put();t.ref.on('value',s=>Trade.sync(s.val()),e=>console.warn('trade',e));
  t.tm=setTimeout(()=>{if(Trade.t===t&&!t.th)Trade.cancel('No respondió: intercambio cancelado.')},120000);
  Hub.cl('🔄 Intercambio con '+t.n+' abierto.','sys');G.paused=true;$('#trade').hidden=false},
 put(){const t=Trade.t;if(!t)return;t.ref.child('o/'+Net.uid).set({k:t.my.k,it:Trade.enc(t.my.it),v:t.my.v,ok:t.my.ok,cm:t.my.cm||''}).catch(e=>console.warn('trade put',e))},
 /* ---------- lo que llega ---------- */
 sync(d){const t=Trade.t;if(!t||t.done)return;if(!d){Trade.end('✖ '+t.n+' canceló el intercambio.');return}
  const o=d.o&&d.o[t.u];t.th=o?Trade.rec(o):null;Trade.check();Trade.render()},
 locked:()=>!!(Trade.t&&Trade.t.my.cm),
 acc:()=>!!(Trade.t&&Trade.t.th&&Trade.t.my.ok>0&&Trade.t.my.ok===Trade.t.th.v),
 thAcc:()=>!!(Trade.t&&Trade.t.th&&Trade.t.th.ok>0&&Trade.t.th.ok===Trade.t.my.v),
 check(){const t=Trade.t;if(!t||!t.th)return;const m=t.my,h=t.th;
  if(m.cm&&m.cm!==m.v+':'+h.v){m.cm='';m.ok=0;Trade.put();Trade.ft='⚠ '+t.n+' cambió su oferta: vuelve a revisarla.';return}      // el otro cambió algo tras mi compromiso
  if(!m.cm&&Trade.acc()&&Trade.thAcc()){const e=Trade.problem();if(e){m.ok=0;Trade.put();Trade.ft='⚠ '+e;return}m.cm=m.v+':'+h.v;Trade.put()}
  if(m.cm&&h.cm===h.v+':'+m.v)Trade.apply()},
 /* ¿puedo cumplir? (tengo lo que ofrezco y me cabe lo que recibo) → texto del problema o null */
 problem(){const t=Trade.t,b=PJ,m=t.my,h=t.th;if(m.k>(b.kamas||0))return'No tienes tantos kamas';
  for(const id in m.it)if(Items.own(b,id)<m.it[id])return'Ya no tienes '+Registry.items[id].n;
  const add={};for(const id in h.it)add[id]=h.it[id];
  for(const id in add){const out=m.it[id]||0;if(Items.stack(id)){if((b.res[id]|0)-out+add[id]>PROG.maxStack)return'No te caben tantos '+Registry.items[id].n+' (máx. '+PROG.maxStack+')'}}
  const eq=Object.keys(add).filter(id=>!Items.stack(id)).reduce((a,id)=>a+add[id],0),outEq=Object.keys(m.it).filter(id=>!Items.stack(id)).reduce((a,id)=>a+m.it[id],0);
  if(b.inv.length-outEq+eq>PROG.maxInv)return'Tu inventario no tiene sitio para lo que recibes';
  if((b.kamas||0)-m.k+h.k>2e9)return'Demasiados kamas';return null},
 /* los dos compromisos casan: cada uno entrega lo suyo y recibe lo del otro */
 apply(){const t=Trade.t,b=PJ,m=t.my,h=t.th,e=Trade.problem();if(e){Trade.cancel('No se pudo completar: '+e);return}
  t.done=true;for(const id in m.it)Items.take(b,id,m.it[id]);b.kamas-=m.k;for(const id in h.it)Items.give(b,id,h.it[id],true);b.kamas+=h.k;
  if(SAVED)PG.save(b);if(typeof Cloud!=='undefined'&&Cloud.push&&!(typeof Auth!=='undefined'&&Auth.local))Cloud.push(true);UI.head();UI.sheetRefresh();
  const g=Object.keys(h.it).map(id=>Registry.items[id].ico+' '+Registry.items[id].n+(h.it[id]>1?' ×'+h.it[id]:'')).concat(h.k?['💰 '+kf(h.k)+' kamas']:[]);
  Hub.cl('✅ Intercambio con '+t.n+' completado. Recibiste: '+(g.join(', ')||'nada'),'sys');UI.msg('✅ Intercambio completado');
  Trade.close();if(t.u>Net.uid)setTimeout(()=>t.ref.remove().catch(()=>{}),15000)},                                  // limpia el nodo uno de los dos
 /* ---------- cerrar ---------- */
 close(){const t=Trade.t;if(!t)return;clearTimeout(t.tm);try{t.ref.off()}catch(e){}Trade.t=null;$('#trade').hidden=true;Win.unpause()},
 cancel(txt){const t=Trade.t;if(!t)return;if(!t.done)t.ref.remove().catch(()=>{});Trade.close();if(txt)Fr.note(txt)},
 end(txt){Trade.close();Fr.note(txt)},
 /* ---------- mi oferta ---------- */
 touch(){const t=Trade.t;if(!t||Trade.locked())return false;t.my.v++;t.my.ok=0;t.my.cm='';Trade.put();return true},
 add(id,q){const t=Trade.t;if(!t||Trade.locked())return;const have=Items.own(PJ,id),cur=t.my.it[id]|0,n=Math.min(q,have-cur);if(n<=0)return;
  if(!(id in t.my.it)&&Object.keys(t.my.it).length>=Trade.MAXT){Trade.msg='Máximo '+Trade.MAXT+' objetos distintos por intercambio';Trade.render();return}
  if(Trade.touch()){t.my.it[id]=cur+n;Trade.put();Trade.msg='';Trade.render()}},
 sub(id,q){const t=Trade.t;if(!t||Trade.locked()||!t.my.it[id])return;if(Trade.touch()){t.my.it[id]-=q;if(t.my.it[id]<=0)delete t.my.it[id];Trade.put();Trade.render()}},
 kamas(v){const t=Trade.t;if(!t||Trade.locked())return;v=clamp(Math.floor(+v)||0,0,PJ.kamas||0);if(v===t.my.k)return;if(Trade.touch()){t.my.k=v;Trade.put();Trade.render()}},
 ok(){const t=Trade.t;if(!t||!t.th||Trade.locked())return;const e=Trade.problem();if(e){Trade.msg=e;Trade.render();return}
  if(!t.th.v){Trade.msg='Espera a que '+t.n+' entre al intercambio';Trade.render();return}t.my.ok=t.th.v;Trade.msg='';Trade.put();Trade.check();Trade.render()},
 unok(){const t=Trade.t;if(!t||Trade.locked())return;t.my.ok=0;Trade.put();Trade.render()},
 /* ---------- pantalla ---------- */
 chip(id,q,btn){const it=Registry.items[id];return`<span class="tr-c${it.set?' set':''}" ${btn?`data-sub="${id}" title="Quitar (clic)"`:`title="${esc(stTxt(it.st))}"`}>${it.ico} ${esc(it.n)}${q>1?' ×'+q:''}</span>`},
 inv(){const b=PJ,t=Trade.t,L=[],cnt={};for(const id of b.inv)cnt[id]=(cnt[id]|0)+1;for(const id in b.res)cnt[id]=b.res[id];
  for(const id in cnt){const it=Registry.items[id];if(!it)continue;const free=cnt[id]-(t.my.it[id]|0);if(free<=0)continue;const st=Items.stack(id),w=Items.worn(b,id)>0;
   L.push(`<div class="tr-r"><span class="tr-i">${it.ico}</span><span class="tr-n">${esc(it.n)}<small>${esc((Registry.kinds[it.kind]||{}).s||'')} · Nv ${it.lvl||1}${w?' · 🧷 equipado':''}</small></span><b class="tr-q">×${free}</b>`
    +`<button data-add="${id}" data-q="1">+1</button>${st?`<button data-add="${id}" data-q="10" ${free>=10?'':'disabled'}>+10</button><button data-add="${id}" data-q="${free}">todo</button>`:''}</div>`)}
  return L.join('')||'<div class="st-empty">No tienes objetos para ofrecer</div>'},
 render(){const t=Trade.t;if(!t)return;const m=t.my,h=t.th,lk=Trade.locked(),acc=Trade.acc(),tha=Trade.thAcc(),fk=x=>Object.keys(x).length?Object.keys(x).map(id=>Trade.chip(id,x[id],false)).join(''):'<em class="tr-e">Nada todavía</em>';
  const mine=Object.keys(m.it).length?Object.keys(m.it).map(id=>Trade.chip(id,m.it[id],!lk)).join(''):'<em class="tr-e">Nada todavía · añade objetos de tu inventario</em>';
  const st=!h?'⏳ Esperando a que '+esc(t.n)+' entre…':lk?'🔒 Los dos habéis aceptado: completando…':acc?'✔ Aceptaste · esperando a '+esc(t.n):tha?'✔ '+esc(t.n)+' aceptó tu oferta actual':'Revisad las ofertas y pulsad Aceptar';
  const scr=$('#trdinv'),y=scr?scr.scrollTop:0;
  $('#trade').innerHTML=`<div class="st-win tr-win"><div class="st-title"><span class="st-help">?</span><b>🔄 Intercambio con ${esc(t.n)}</b><button id="trx" class="st-x" title="Cancelar el intercambio">✕</button></div>
   <div class="st-body tr-body"><div class="tr-col"><div class="ss-t">Tu oferta ${acc?'<span class="tr-ok">✔ aceptada</span>':''}</div>
     <label class="tr-k">💰 Kamas <input id="trk" type="number" min="0" max="${PJ.kamas||0}" step="1" value="${m.k}" ${lk?'disabled':''}><small>de ${kf(PJ.kamas||0)}</small></label><div class="tr-chips">${mine}</div>
     <div class="ss-t">Tu inventario</div><div class="tr-inv" id="trdinv">${lk?'<div class="st-empty">Oferta bloqueada</div>':Trade.inv()}</div></div>
    <div class="tr-col"><div class="ss-t">Oferta de ${esc(t.n)} ${tha?'<span class="tr-ok">✔ aceptada</span>':''}</div>
     <div class="tr-k">💰 Kamas <b>${kf(h?h.k:0)}</b></div><div class="tr-chips">${h?fk(h.it):'<em class="tr-e">Aún no ha entrado</em>'}</div>
     <p class="sm">Si cualquiera cambia su oferta, los dos tenéis que aceptar de nuevo. Revisa bien lo que recibes antes de aceptar.</p></div></div>
   <div class="tr-ft"><span>${esc(Trade.msg||Trade.ft||st)}</span><div class="dt-btns"><button class="dt-lime alt" id="trcx">✖ Cancelar</button>${acc?`<button class="dt-lime alt" id="truo" ${lk?'disabled':''}>↩ Quitar mi aceptación</button>`:`<button class="dt-lime" id="trok" ${(!h||lk)?'disabled':''}>✔ Aceptar intercambio</button>`}</div></div></div>`;
  const n=$('#trdinv');if(n)n.scrollTop=y;Trade.ft=''}};
$('#trade').addEventListener('click',e=>{const b=e.target.closest('button,[data-sub]');if(!b)return;
 if(b.id==='trx'||b.id==='trcx')Trade.cancel('Cancelaste el intercambio.');else if(b.id==='trok')Trade.ok();else if(b.id==='truo')Trade.unok();
 else if(b.dataset.add)Trade.add(b.dataset.add,+b.dataset.q);else if(b.dataset.sub)Trade.sub(b.dataset.sub,Trade.t?Trade.t.my.it[b.dataset.sub]:0)});
$('#trade').addEventListener('change',e=>{if(e.target.id==='trk')Trade.kamas(e.target.value)});
$('#trade').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&e.target.id==='trk')e.target.blur()});
