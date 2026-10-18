/* ui/party.js · ventanas 👥 EQUIPO y 🏰 MAZMORRAS. Equipo: invita a los jugadores de la sala (toca su personaje o usa esta lista); los del equipo te siguen y combaten a tu lado.
   Mazmorras: lista por nivel (1-50 · 51-100 · 101-200), detalle del jefe y botín. Usa Party/Hub (hub.js) y Dun (dungeon.js). */
const PT={sel:null,msg:''};
function renderParty(){const b=PJ,V=G.hub?G.ents.filter(e=>e.vis&&!e.party):[],C=Registry.classes;
 const mem=[`<div class="pt-m me"><b>${C[b.cls].ico} ${esc(b.name)}</b><small>Nv ${b.lvl} · tú (líder)</small></div>`,...Party.m.map((m,i)=>`<div class="pt-m"><b>${C[m.cls].ico} ${esc(m.name)}</b><small>Nv ${m.lvl} · ${esc(C[m.cls].n)}</small><button data-kick="${i}" class="pt-x" title="Expulsar">✕</button></div>`)];
 for(let i=Party.m.length;i<Party.max;i++)mem.push('<div class="pt-m empty">Hueco libre</div>');
 const rows=V.length?V.map(e=>`<div class="st-row${PT.sel===e.id?' sel':''}" data-p="${e.id}"><span class="st-ic">${C[e.build.cls].ico}</span><span class="st-nm">${esc(e.n)}<small class="mk-s">${esc(C[e.build.cls].n)} · Nv ${e.build.lvl}</small></span><span class="st-lv"></span><span class="st-pts"><button class="dt-lime" data-inv="${e.id}" ${Party.m.length>=Party.max?'disabled':''}>Invitar</button></span></div>`).join(''):`<div class="st-empty">${G.hub?'No queda nadie para invitar':'Vuelve a la sala de espera para invitar jugadores'}</div>`;
 $('#party').innerHTML=`<div class="st-win pt-win"><div class="st-title"><span class="st-help">?</span><b>Equipo · Grupo</b></div>
 <div class="st-body"><div class="st-left"><div class="ss-t">Jugadores en la sala</div><div class="st-list">${rows}</div><div class="st-foot"><span>Toca a un jugador en el mapa para invitarlo</span></div></div>
 <div class="st-right ss-r"><div class="ss-t">Tu equipo (${Party.m.length+1}/${Party.max+1})</div><div class="pt-ms">${mem.join('')}</div>
 ${Party.lead?`<p class="sm">👥 Estás en el grupo de <b>${esc(Party.lead.n)}</b>.</p><div class="dt-btns"><button class="dt-lime alt" id="ptleave">Salir del grupo</button></div>`:''}<p class="sm">Tus compañeros te siguen por la sala y combaten a tu lado (IA) en duelos, monstruos y mazmorras. Con ellos ganas <b>+10 % de XP</b> por cada uno, pero aparecen más enemigos.</p>
 <div class="dt-btns"><button class="dt-lime" id="ptdun">🏰 Elegir mazmorra</button><button class="dt-lime alt" id="ptall" ${Party.m.length?'':'disabled'}>Disolver equipo</button></div><div class="mk-msg">${esc(PT.msg)}</div></div></div></div>`}
function openParty(id){PT.sel=id||null;PT.msg='';renderParty();$('#party').hidden=false;G.paused=true}
$('#party').addEventListener('click',e=>{const t=e.target.closest('button,[data-p]');if(!t)return;const d=t.dataset;
 if(d.inv){PT.msg=Hub.invite(+d.inv)||'Invitación enviada…';renderParty();return}
 if(d.kick){Hub.kick(Party.m[+d.kick].id);renderParty();return}
 if(d.p){PT.sel=+d.p;renderParty();return}
 if(t.id==='ptleave'){Party.leave();renderParty();return}
 if(t.id==='ptall'){[...Party.m].forEach(m=>Hub.kick(m.id));renderParty();return}
 if(t.id==='ptdun'){Win.close('#party');openDung()}});
$('#party').addEventListener('pointerdown',e=>{if(e.target===$('#party'))Win.close('#party')});

/* ---- mazmorras ---- */
const DG={tab:0,sel:null,msg:''};const DTABS=[['1 – 50','Bajo nivel',1,50],['51 – 100','Nivel medio',51,100],['101 – 200','Alto nivel',101,200]];
function dunRows(){return Dun.list().filter(d=>d.lv>=DTABS[DG.tab][2]&&d.lv<=DTABS[DG.tab][3]).map(d=>{const lock=PJ.lvl<d.lv;
 return`<div class="st-row${d.id===DG.sel?' sel':''}${lock?' lock':''}" data-d="${d.id}"><span class="st-ic">${d.bico}</span><span class="st-nm">${esc(d.n)}<small class="mk-s">Jefe: ${esc(d.boss)}</small></span><span class="st-lv"><small>Nv</small> ${d.lv}</span><span class="st-pts">${lock?'🔒':'🏰'}</span></div>`}).join('')}
function dunDetail(){const d=Registry.dungeons[DG.sel];if(!d)return'<div class="st-empty">Elige una mazmorra de la lista</div>';const bs=Registry.monsters[d.bossId],err=Dun.can(d),tr=Registry.items['trofeo_'+d.id];
 const dr=(bs.drops||[]).map(([id,p,q])=>{const it=Registry.items[id];return it?`<span class="mk-ev">${it.ico} ${esc(it.n)} ${Math.round(p*100)}%${q?' ×'+q[0]+'-'+q[1]:''}</span>`:''}).join(' ');
 return`<div class="st-hd"><span class="st-big">${d.bico}</span><div><b>${esc(d.n)}</b><small class="${err?'bad':''}">Nivel necesario: ${d.lv}</small></div></div>
 <div class="st-info"><div class="ss-t">Salas</div><ul class="st-fx"><li>1ª sala: ${d.mins.map(i=>Registry.monsters[i].ico+' '+esc(Registry.monsters[i].n)).join(' · ')}</li><li>2ª sala: más esbirros</li><li>3ª sala: ${d.bico} <b>${esc(d.boss)}</b> (jefe) + esbirros</li></ul>
 <div class="ss-t">Botín del jefe</div><div class="dg-dr">${dr}</div><p class="sm">Entre salas recuperas un 40 % de tu vida. Si caes, la mazmorra termina.</p>
 <div class="ss-t">Equipo</div><p class="sm">${Party.builds().length?'Irás con '+Party.m.map(m=>esc(m.name)).join(', ')+'.':Party.m.length?'Vas solo: tu equipo se queda esperando en la sala.':'Vas solo. Invita jugadores en 👥 Equipo.'}</p>${Party.m.length?`<button class="dt-lime alt" data-solo="1">${Party.solo?'👥 Ir con mi equipo':'🚶 Ir solo'}</button>`:''}</div>
 <div class="st-act"><button class="st-up" data-go="${d.id}" ${err?'disabled':''}>${err||'⚔ Entrar en la mazmorra'}</button></div>`}
function renderDung(){const tabs=DTABS.map((t,i)=>`<button class="${i===DG.tab?'on':''}" data-t="${i}">${t[0]}<small> ${t[1]}</small></button>`).join('');
 $('#dung').innerHTML=`<div class="st-win"><div class="st-title"><span class="st-help">?</span><b>Mazmorras</b></div>
 <div class="mk-bar"><div class="mk-tabs">${tabs}</div><span class="mk-k">Tu nivel ${PJ.lvl} · equipo ${Party.m.length+1}/${Party.max+1}</span></div>
 <div class="st-body"><div class="st-left"><div class="st-list">${dunRows()}</div><div class="st-foot"><span>Mazmorras: <em>${Dun.list().length}</em></span></div></div><div class="st-right ss-r">${dunDetail()}<div class="mk-msg">${esc(DG.msg)}</div></div></div></div>`}
function openDung(id){if(id)DG.sel=id;if(!DG.sel){const l=Dun.list().filter(d=>d.lv<=PJ.lvl);DG.sel=(l[l.length-1]||Dun.list()[0]).id}const d=Registry.dungeons[DG.sel];DG.tab=DTABS.findIndex(t=>d.lv>=t[2]&&d.lv<=t[3]);DG.msg='';renderDung();$('#dung').hidden=false;G.paused=true}
$('#dung').addEventListener('click',e=>{const t=e.target.closest('button,[data-d]');if(!t)return;const d=t.dataset;
 if(d.solo){Party.solo=!Party.solo;renderDung();renderPty();return}if(d.t!=null){DG.tab=+d.t;renderDung();return}if(d.d){DG.sel=d.d;renderDung();return}
 if(d.go){const er=Dun.start(d.go);if(er){DG.msg=er;renderDung()}else Win.close('#dung')}});
$('#dung').addEventListener('pointerdown',e=>{if(e.target===$('#dung'))Win.close('#dung')});

/* ---- widget de equipo en la sala (costado derecho): 🏰 mazmorras · Solo/Equipo · retratos de tus compañeros ---- */
function renderPty(){const el=$('#pty');if(!el)return;const solo=Party.solo&&Party.m.length>0,img=b=>`<img alt="" src="${LOOK.url(b.look,b.sex,b.cls,56)||''}">`;
 const mem=Party.m.map((m,i)=>`<button class="py-m${solo?' off':''}" data-k="${i}" title="${esc(m.name)} · Nv ${m.lvl} · ${esc(Registry.classes[m.cls].n)}${solo?' (se queda en la sala)':''}">${img(m)}<u data-x="${i}" title="Expulsar del equipo">✕</u></button>`).join('');
 const free=Array.from({length:Party.max-Party.m.length},()=>'<button class="py-m empty" data-add="1" title="Invitar a un jugador">＋</button>').join('');
 el.innerHTML=`<button class="py-d" data-dun="1" title="Mazmorras: elige a dónde ir"><span>🏰</span><small>Mazmorras</small></button>
  <button class="py-s${solo?' solo':''}" data-solo="1" ${Party.m.length?'':'disabled'} title="${Party.m.length?'Elige si entras a las mazmorras solo o con tu equipo':'Invita jugadores para ir en equipo'}">${solo||!Party.m.length?'🚶 Solo':'👥 Equipo'}</button>
  <div class="py-m me" title="${esc(PJ.name)} · tú (líder)">${img(PJ)}</div>${mem}${free}`}
$('#pty').addEventListener('click',e=>{const t=e.target.closest('[data-x],button');if(!t)return;
 if(t.dataset.x!=null){Hub.kick(Party.m[+t.dataset.x].id);return}
 if(t.dataset.solo){if(Party.m.length){Party.solo=!Party.solo;renderPty()}return}
 if(t.dataset.dun){openDung();return}
 if(t.dataset.k!=null||t.dataset.add)openParty()});
renderPty();

/* ---- GRUPO ENTRE JUGADORES REALES Y COMBATE COOPERATIVO (Firebase · buzón + partida sincronizada) ----
   Invitar: gi → el invitado ve «Aceptar / Rechazar» (nadie entra solo) → ga (con su personaje) → el líder lo añade y manda la lista del grupo (gr) a todos.
   CUALQUIER miembro (líder o no) que toque a un grupo de monstruos AVISA a los demás (gc): ventanita con mapa, coordenadas, monstruos y nivel.
   Cada compañero elige «Unirse» (gj, lleva su personaje) o «Cerrar» (gq). Cuando todos responden (o a los 20 s, o con «Empezar ya») el que inició monta la partida
   (Net.hostCoop, fmt 'coop') y los que se unieron entran al MISMO combate: cada uno maneja su personaje, los monstruos los mueve la IA en todos los clientes con la misma
   semilla (como el PvP: solo viajan acciones) y al terminar CADA UNO cobra su XP, kamas y botín. Si nadie se une, el combate es normal (con tus compañeros simulados). */
Object.assign(Party,{
 /* uids de los demás jugadores reales de mi grupo */
 others(){if(Party.lead)return(Party.roster&&Party.roster.length?Party.roster:[Party.lead.u]).filter(u=>u!==Net.uid);return Party.m.filter(b=>b.real).map(b=>b.real)},
 nameOf(u){const b=Party.m.find(x=>x.real===u);if(b)return b.name;if(Party.lead&&Party.lead.u===u)return Party.lead.n;return(Party.fight&&Party.fight.names[u])||'Compañero'},
 /* el líder reparte la lista del grupo para que cualquiera pueda avisar a todos */
 bc(){const R=Party.m.filter(b=>b.real);if(!R.length||!Soc.live())return;const x=[Net.uid,...R.map(b=>b.real)].join(',');R.forEach(b=>Soc.send(b.real,{t:'gr',x}).catch(()=>{}))},
 inviteReal(e){const err=Soc.need();if(err)return err;const u=e.uid;if(Party.lead)return'Estás en el grupo de '+Party.lead.n+': solo el líder invita';
  if(Party.m.some(b=>b.real===u))return'Ya está en tu equipo';if(Party.m.length>=Party.max)return'Tu equipo está completo (máx. '+(Party.max+1)+' con tú)';
  if(Date.now()-(Party.sent[u]||0)<20000)return'Ya le enviaste la invitación: espera su respuesta';
  Party.sent[u]=Date.now();Soc.send(u,{t:'gi'}).catch(x=>console.warn('gi',x));Hub.cl('Invitaste a '+e.n+' a tu equipo… esperando respuesta','sys','equipo');return null},
 acceptInv(k){const v=Soc.q[k];if(!v)return;if(Party.lead||Party.m.length){UI.msg('Ya estás en un grupo');return}
  Party.lead={u:v.f,n:v.n};Party.roster=[v.f,Net.uid];Soc.send(v.f,{t:'ga',b:JSON.stringify(PJ),c:PJ.cls,l:PJ.lvl}).catch(x=>console.warn('ga',x));Soc.del(k);
  Fr.note('👥 Te uniste al grupo de '+v.n);Hub.cl('Te uniste al grupo de '+v.n+'. Cuando un compañero inicie un combate te avisaremos.','sys','equipo')},
 declineInv(k){const v=Soc.q[k];if(v)Soc.send(v.f,{t:'gd'}).catch(()=>{});Soc.del(k)},
 leave(){const l=Party.lead;if(!l)return;Party.lead=null;Party.roster=null;if(Soc.live())Soc.send(l.u,{t:'gx'}).catch(()=>{});Party.closeCall();Hub.cl('Saliste del grupo de '+l.n,'sys','equipo')},
 /* mensajes de grupo que llegan por el buzón */
 onMsg(v){const nm=v.n||'Jugador',L=Party.lead;
  if(v.t==='ga'){if(!Party.sent[v.f]||Date.now()-Party.sent[v.f]>120000||Party.lead)return;delete Party.sent[v.f];let b=null;try{b=JSON.parse(v.b)}catch(e){}
   if(!b||!Net.sane(b)||Party.m.length>=Party.max){Soc.send(v.f,{t:'gx'}).catch(()=>{});Fr.note('⚠ No se pudo añadir a '+nm+' al grupo');return}
   b.real=v.f;b.id='u'+v.f;const e=World.remote[v.f];if(e)e.party=true;Party.m=Party.m.filter(x=>x.real!==v.f);Party.m.push(b);Party.bc();
   Fr.note('👥 '+nm+' se unió a tu grupo');Hub.cl(nm+' se unió a tu equipo 👥','sys','equipo');if(!$('#party').hidden)renderParty();renderPty();return}
  if(v.t==='gd'){delete Party.sent[v.f];Fr.note('✖ '+nm+' rechazó tu invitación al grupo');return}
  if(v.t==='gx'){if(L&&L.u===v.f){Party.lead=null;Party.roster=null;Party.closeCall();Fr.note('👥 Saliste del grupo de '+nm);return}
   const b=Party.m.find(x=>x.real===v.f);if(b){const e=World.remote[v.f];if(e)e.party=false;Party.m=Party.m.filter(x=>x!==b);Party.bc();Fr.note('👥 '+nm+' salió de tu grupo');if(!$('#party').hidden)renderParty();renderPty()}return}
  if(v.t==='gr'){if(L&&L.u===v.f)Party.roster=String(v.x||'').split(',').filter(Boolean).slice(0,6);return}
  if(!Party.others().includes(v.f))return;                                   // el resto de avisos solo valen si vienen de alguien de mi grupo
  if(v.t==='gc'){Party.onCombat(v);return}
  if(v.t==='gj'||v.t==='gq'){Party.onReply(v);return}
  if(v.t==='gn'){if(Party.call&&Party.call.u===v.f){Party.closeCall();Fr.note('⌛ El combate de '+nm+' ya no está disponible')}return}},
 /* ---- el que INICIA: avisa a todo el grupo y espera sus respuestas ---- */
 callGroup(w,e,at){const O=Party.others(),x=[at[0],at[1],at[2],w.ms.join(','),w.lvl].join('|');
  const f=Party.fight={e,w:{ms:w.ms.slice(),lvl:w.lvl,k:w.k},x,O,resp:{},joined:{},names:{},t0:Date.now()};
  Party.beginWait(f,'combate')},
 callDungeon(d){if(Party.fight)return'Ya estás esperando la respuesta de tu grupo';if(!G.hub)return'Solo puedes entrar a una mazmorra desde el mundo';
  Party.beginWait(Party.fight={dun:d.id,w:null,x:'D|'+d.id,O:Party.others(),resp:{},joined:{},names:{},t0:Date.now()},'mazmorra '+d.n);return null},
 beginWait(f,que){f.O.forEach(u=>Soc.send(u,{t:'gc',x:f.x}).catch(()=>{}));Hub.cl('📣 Avisaste a tu grupo del '+que+'. Esperando a quien quiera unirse…','sys','equipo');
  f.tm=setInterval(()=>{if(Party.fight!==f)return clearInterval(f.tm);if(Date.now()-f.t0>20000||f.O.every(u=>f.resp[u]))Party.startFight();else Party.drawWait()},500);Party.drawWait()},
 onReply(v){const f=Party.fight;if(!f||!f.O.includes(v.f)){if(v.t==='gj')Soc.send(v.f,{t:'gn'}).catch(()=>{});return}
  f.names[v.f]=v.n||Party.nameOf(v.f);f.resp[v.f]=1;
  if(v.t==='gj'){let b=null;try{b=JSON.parse(v.b)}catch(e){}if(b&&Net.sane(b)&&!(f.dun&&b.lvl<Registry.dungeons[f.dun].lv)){b.id='u'+v.f;f.joined[v.f]=b}else Soc.send(v.f,{t:'gn'}).catch(()=>{})}
  Party.drawWait()},
 drawWait(){const el=$('#gcs'),f=Party.fight;if(!el)return;if(!f){el.hidden=true;return}
  el.innerHTML=`<div class="gc"><h4>📣 Avisando a tu grupo…</h4><div class="gc-r">${f.dun?'🏰 <b>'+esc(Registry.dungeons[f.dun].n)+'</b> · Nv '+Registry.dungeons[f.dun].lv:'👾 '+f.w.ms.map(id=>{const m=Registry.monsters[id];return esc((m.ico||'👾')+' '+m.n)}).join(' · ')+' · Nv '+f.w.lvl}</div>
   <ul class="gc-l">${f.O.map(u=>`<li>${f.joined[u]?'✔ se une':f.resp[u]?'✖ no viene':'⏳ pensando…'} · ${esc(f.names[u]||Party.nameOf(u))}</li>`).join('')}</ul>
   <div class="dt-btns"><button class="dt-lime" data-gs="go">⚔ Empezar ya</button><button class="dt-lime alt" data-gs="cancel">Cancelar</button></div></div>`;el.hidden=false},
 cancelFight(){const f=Party.fight;if(!f)return;clearInterval(f.tm);Party.fight=null;$('#gcs').hidden=true;f.O.forEach(u=>Soc.send(u,{t:'gn'}).catch(()=>{}))},
 /* ya respondieron (o se acabó el tiempo): con los que se unen → combate cooperativo; si nadie → combate normal */
 startFight(){const f=Party.fight;if(!f)return;clearInterval(f.tm);Party.fight=null;$('#gcs').hidden=true;const J=Object.keys(f.joined);
  if(!G.hub||Coli.busy()){f.O.forEach(u=>Soc.send(u,{t:'gn'}).catch(()=>{}));UI.msg('Estabas ocupado: el combate de grupo se canceló');return}
  f.O.filter(u=>!f.joined[u]).forEach(u=>Soc.send(u,{t:'gn'}).catch(()=>{}));
  if(f.dun){const d=Registry.dungeons[f.dun];if(!J.length){const er=Dun.start(f.dun,true);if(er)UI.msg(er);return}                     // nadie se une: mazmorra normal
   const roster=[{uid:Net.uid,build:JSON.parse(JSON.stringify(PJ))},...J.map(u=>({uid:u,build:f.joined[u]}))],F=Dun.foes(d,0,roster.length-1,4);Win.close('#dung');
   Net.hostCoop(roster,F.map(x=>x.id),Math.max(PJ.lvl,d.lv),{found:m=>Party.goCoop(m,null),lost:()=>UI.msg('⚠ No se pudo crear la mazmorra de grupo (¿reglas de Firebase sin publicar?)')},{mult:F.map(x=>x.mult),dun:{id:d.id,room:0}});return}
  if(!J.length){if(f.e&&f.e.wm&&G.ents.includes(f.e))World.fight(f.e,true);return}
  const roster=[{uid:Net.uid,build:JSON.parse(JSON.stringify(PJ))},...J.map(u=>({uid:u,build:f.joined[u]}))];PMenu.close();
  Net.hostCoop(roster,f.w.ms,f.w.lvl,{found:m=>Party.goCoop(m,f.w.k),lost:()=>UI.msg('⚠ No se pudo crear el combate de grupo (¿reglas de Firebase sin publicar?)')})},
 /* ---- los DEMÁS: ventanita con los detalles ---- */
 parse(x){const a=String(x||'').split('|');if(a[0]==='D'){const dn=Registry.dungeons[a[1]];return dn?{dun:dn}:null}const A=Registry.arenas[a[0]];if(!A)return null;const ms=String(a[3]||'').split(',').map(id=>Registry.monsters[id]).filter(Boolean).slice(0,3);if(!ms.length)return null;
  return{mid:A.id,A,x:+a[1]||0,y:+a[2]||0,ms,lv:clamp(+a[4]||1,1,PROG.maxLv)}},
 onCombat(v){const d=Party.parse(v.x);if(!d)return;Party.call={u:v.f,n:v.n||Party.nameOf(v.f),d,t:Date.now(),sent:false};Party.drawCall()},
 drawCall(){const el=$('#gcw'),c=Party.call;if(!el)return;if(!c){el.hidden=true;return}const d=c.d,busy=!G.hub||Coli.busy()||!!Trade.t,left=Math.max(0,30-Math.round((Date.now()-c.t)/1000));
  if(d.dun){const dn=d.dun,low=PJ.lvl<dn.lv;el.innerHTML=`<div class="gc"><h4>🏰 ${esc(c.n)} entra a una mazmorra</h4><div class="gc-r">${dn.bico||'🏰'} <b>${esc(dn.n)}</b></div><div class="gc-r">📊 Nivel necesario: <b>${dn.lv}</b> · tu nivel ${PJ.lvl}</div>
   <div class="gc-r">👹 Jefe: <b>${esc(dn.boss)}</b> · ${dn.rooms} salas</div><div class="gc-t">${low?'🔒 Aún no tienes el nivel para entrar':c.sent?'⏳ Te uniste: esperando a que empiece…':'Se cierra solo en '+left+' s'}</div>
   <div class="dt-btns"><button class="dt-lime" data-gc="join" ${busy||low||c.sent?'disabled':''}>⚔ Unirse</button><button class="dt-lime alt" data-gc="close">Cerrar</button></div></div>`;el.hidden=false;return}
  el.innerHTML=`<div class="gc"><h4>⚔ ${esc(c.n)} inició un combate</h4>
   <div class="gc-r">📍 <b>${esc(d.A.n)}</b>${d.A.gx!=null?' · mapa ('+(d.A.gx+1)+','+(d.A.gy+1)+')':''}</div><div class="gc-r">🎯 Casilla <b>(${d.x}, ${d.y})</b></div>
   <div class="gc-r">👾 ${d.ms.map(m=>esc((m.ico||'👾')+' '+m.n)).join(' · ')}</div><div class="gc-r">📊 Nivel de los monstruos: <b>${d.lv}</b></div>
   <div class="gc-t">${c.sent?'⏳ Te uniste: esperando a que empiece el combate…':'Se cierra solo en '+left+' s'}</div>
   <div class="dt-btns"><button class="dt-lime" data-gc="join" ${busy||c.sent?'disabled title="'+(busy?'Estás ocupado':'')+'"':''}>⚔ Unirse</button><button class="dt-lime alt" data-gc="close">Cerrar</button></div></div>`;el.hidden=false},
 closeCall(){Party.call=null;const el=$('#gcw');if(el)el.hidden=true},
 /* ---- todos: empieza el combate cooperativo ---- */
 goCoop(m,wk){Party.closeCall();Soc.unexpect();if(!m||!m.foes){UI.msg('⚠ El combate de grupo se canceló');Net.leave();return}
  ['#inv','#jobs','#mkt','#sheet','#spells','#sets','#party','#dung','#result','#colo','#friends','#trade','#mfound','#qchip','#gcs'].forEach(id=>{const e=$(id);if(e){e.hidden=true;e.dataset.min=''}});$('#dock').textContent='';G.paused=false;PMenu.close();
  Hub.leave();Dun.run=null;UI.foc=UI.hov=null;const DG=m.dun&&Registry.dungeons[m.dun.id];startBattle(m.arena,{mode:'mob',me:PJ,coop:{host:m.host},players:m.players,seed:m.seed,uid:m.uid,mid:m.mid,foes:m.foes.map((id,i)=>m.mult&&m.mult[i]>1?{m:Registry.monsters[id],mult:m.mult[i]}:{m:Registry.monsters[id]}),lvl:m.lvl,hps:m.hps,dun:DG?{id:DG.id,n:DG.n,room:m.dun.room,rooms:DG.rooms}:null});
  if(wk)G.wk=wk;mapInfo();rs();fitView();Net.go();UI.msg(DG?'🏰 '+DG.n+' · sala '+(m.dun.room+1)+' de '+DG.rooms+' · con '+m.players.filter(p=>p.uid!==m.uid).map(p=>p.build.name).join(', ')+' · pulsa ¡Listo!':'👥 Combate de grupo con '+m.players.filter(p=>p.uid!==m.uid).map(p=>p.build.name).join(', ')+' · pulsa ¡Listo! para empezar');UI.hud()}});
$('#gcw').addEventListener('click',e=>{const b=e.target.closest('button[data-gc]'),c=Party.call;if(!b||!c)return;
 if(b.dataset.gc==='close'){Soc.send(c.u,{t:'gq'}).catch(()=>{});Party.closeCall();return}
 if(!G.hub||Coli.busy()||Trade.t){UI.msg('Estás ocupado: termina lo que haces para unirte');return}
 if(c.d.dun&&PJ.lvl<c.d.dun.lv){UI.msg('Necesitas nivel '+c.d.dun.lv);return}
 c.sent=true;Party.drawCall();Soc.expect(m=>Party.goCoop(m,null));Soc.send(c.u,{t:'gj',b:JSON.stringify(PJ)}).catch(x=>console.warn('gj',x))});
$('#gcs').addEventListener('click',e=>{const b=e.target.closest('button[data-gs]');if(!b)return;if(b.dataset.gs==='go')Party.startFight();else Party.cancelFight()});
setInterval(()=>{const c=Party.call;if(!c)return;if(Date.now()-c.t>(c.sent?45000:30000)){if(!c.sent)Soc.send(c.u,{t:'gq'}).catch(()=>{});Party.closeCall();return}Party.drawCall()},1000);
