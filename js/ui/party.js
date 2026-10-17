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
 <p class="sm">Tus compañeros te siguen por la sala y combaten a tu lado (IA) en duelos, monstruos y mazmorras. Con ellos ganas <b>+10 % de XP</b> por cada uno, pero aparecen más enemigos.</p>
 <div class="dt-btns"><button class="dt-lime" id="ptdun">🏰 Elegir mazmorra</button><button class="dt-lime alt" id="ptall" ${Party.m.length?'':'disabled'}>Disolver equipo</button></div><div class="mk-msg">${esc(PT.msg)}</div></div></div></div>`}
function openParty(id){PT.sel=id||null;PT.msg='';renderParty();$('#party').hidden=false;G.paused=true}
$('#party').addEventListener('click',e=>{const t=e.target.closest('button,[data-p]');if(!t)return;const d=t.dataset;
 if(d.inv){PT.msg=Hub.invite(+d.inv)||'Invitación enviada…';renderParty();return}
 if(d.kick){Hub.kick(Party.m[+d.kick].id);renderParty();return}
 if(d.p){PT.sel=+d.p;renderParty();return}
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
