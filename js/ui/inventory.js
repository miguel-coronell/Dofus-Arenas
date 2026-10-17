/* ui/inventory.js · ventana «Características + Inventario» (estilo Dofus Touch): a la izquierda tus características y capital de puntos;
   en el centro tu personaje con los 9 huecos de equipo y el detalle del objeto elegido; a la derecha la cuadrícula del inventario con pestañas.
   Lee todo de Registry.items / Items → un objeto nuevo en js/data/items/ aparece solo. */
const INV={tab:'all',cat:'all',q:'',sel:null,msg:'',raf:0};
const INVTABS=[['all','∞','Todo'],['gear','⚔️','Equipo'],['res','🟫','Recursos'],['con','🧪','Consumibles']];
const EQL=['sombrero','capa','amuleto','cinturon'],EQR=['anillo1','anillo2','botas'],EQB=['arma','escudo'];
const invIds=()=>{const b=PJ,ids=[...new Set(b.inv)],q=INV.q.trim().toLowerCase();
 return[...ids,...Object.keys(b.res||{})].map(id=>Registry.items[id]).filter(i=>i&&(INV.cat==='all'||i.kind===INV.cat)
  &&(INV.tab==='all'||(INV.tab==='gear'&&Registry.kinds[i.kind].n>0)||(INV.tab==='res'&&i.kind==='recurso')||(INV.tab==='con'&&i.kind==='consumible'))
  &&(!q||i.n.toLowerCase().includes(q)||((Registry.isets[i.set]||{}).n||'').toLowerCase().includes(q))).sort((a,c)=>(Registry.kinds[a.kind].n?0:1)-(Registry.kinds[c.kind].n?0:1)||a.lvl-c.lvl||a.n.localeCompare(c.n))};
const sgm=(b,k)=>{const q=Items.bonus(b);return k==='vit'?b.vit+(q.vit||0):(b.pow[k]||0)+(q[k]||0)};
function invChar(){const b=PJ,C=Registry.classes[b.cls],st=Rules.stats(b),q=Items.bonus(b),need=PROG.xpNeed(b.lvl),max=b.lvl>=PROG.maxLv,sp=Object.keys(b.spLv).length;
 const pa=PROG.paBase+(b.lvl>=100?1:0),pm=PROG.pmBase;
 const row=(ic,v,nm)=>`<div class="dt-st"><b>${v}</b><i>${ic}</i><span>${nm}</span></div>`;
 const stat=(k,ic,nm)=>`<div class="dt-st"><b>${sgm(b,k)}</b><i>${ic}</i><span>${nm}</span><button class="dt-plus" data-s="${k}" data-n="1" ${b.cap>=1?'':'disabled'} title="+1">+</button><button class="dt-plus five" data-s="${k}" data-n="5" ${b.cap>=5?'':'disabled'} title="+5">+5</button></div>`;
 return`<div class="dt-t"><b>CARACTERÍSTICAS</b></div><div class="dt-pb">
 <div class="dt-id"><canvas id="invport" width="84" height="84"></canvas><div><b class="dt-nm">${esc(b.name)}</b><span class="dt-cl">${C.ico} ${esc(C.n)} · ${esc(C.role)}</span><span class="dt-lv">Nivel ${b.lvl}</span></div></div>
 <div class="dt-trophy"><small>VICTORIAS</small><b>${kf(b.wins)}</b><em>☠ ${kf(b.losses)} derrotas</em></div>
 <div class="dt-box">${row('❤️',st.mhp,'Puntos de vida (PV)')}${row('⭐',pa+(q.pa?'+'+q.pa:''),'Puntos de acción (PA)')}${row('👟',pm+(q.pm?'+'+q.pm:''),'Puntos de movimiento (PM)')}${row('💪',(q.pow||0),'Poder')}${row('🛡️',(q.res||0)+' %','Resistencia')}${[['🪨','rtierra','Tierra'],['🔥','rfuego','Fuego'],['💧','ragua','Agua'],['🌪️','raire','Aire']].map(([i,k,n])=>row(i,(q[k]||0)+' %','Resistencia '+n)).join('')}</div>
 <div class="dt-xp"><small>Experiencia</small><div class="dt-seg"><i style="width:${max?100:100*b.xp/need}%"></i></div><span>${max?'Nivel máximo':kf(b.xp)+' / '+kf(need)}</span></div>
 <div class="dt-box">${stat('vit','❤️','Vitalidad')}${stat('tierra','🪨','Fuerza')}${stat('fuego','🔥','Inteligencia')}${stat('agua','💧','Suerte')}${stat('aire','🌪️','Agilidad')}
  <div class="dt-pts">Puntos a repartir : <b>${b.cap}</b></div></div>
 <div class="dt-btns"><button class="dt-lime" data-open="sp">Libro de hechizos (${sp})</button><button class="dt-lime" data-open="sheet">Detalles</button><button class="dt-lime alt" data-open="respec">↺ Reiniciar</button></div></div>`}
function invDoll(){const b=PJ,sl=id=>{const S=Items.slots().find(s=>s.id===id),it=Registry.items[b.eq[id]];
  return`<button class="dt-eq${it?' on':''}${it&&INV.sel===it.id?' sel':''}" data-sl="${id}" title="${esc(it?it.n:S.nm)}" ${it?`style="--c:${mkCol(it)}"`:''}>${it?it.ico:'<i>'+S.ico+'</i>'}</button>`};
 return`<div class="dt-doll"><div class="dt-col">${EQL.map(sl).join('')}</div><canvas id="invfig" width="260" height="300"></canvas><div class="dt-col">${EQR.map(sl).join('')}</div><div class="dt-bot">${EQB.map(sl).join('')}</div></div>`}
function invDetail(){const b=PJ,it=Registry.items[INV.sel];
 if(!it||Items.own(b,it.id)<1){const J=Object.values(Registry.jobs).map(j=>`<span title="${esc(j.d)}">${j.ico} <b>${j.n}</b> ${Jobs.lv(b,j.id)}</span>`).join('');
  const t=Items.bonus(b);return`<div class="dt-det idle"><b class="dt-h">Oficios</b><div class="dt-jobs">${J}</div><div class="dt-bonus">${Object.keys(t).length?esc(stTxt(t)):'Sin bonos de equipo'}</div><div class="dt-btns"><button class="dt-lime" data-open="jobs">🔨 Taller</button><button class="dt-lime" data-open="shop">🛒 Mercado</button></div></div>`}
 const S=Registry.isets[it.set],eqSlot=Object.keys(b.eq).find(k=>b.eq[k]===it.id),K=Registry.kinds[it.kind],n=Items.own(b,it.id),gear=K.n>0,cnt=S?Items.setCount(b,it.set):0,sp=Eco.sellPrice(it.id);
 return`<div class="dt-det"><div class="dt-dh"><span class="dt-ic" style="--c:${mkCol(it)}">${it.ico}</span><div><b class="dt-h">${esc(it.n)}${n>1?' ×'+n:''}</b><small class="${gear&&b.lvl<it.lvl?'bad':''}">Nivel ${it.lvl} · ${K.s}${S?' · '+esc(S.n)+' ('+cnt+'/'+Items.setParts(S.id).length+')':''}</small></div></div>
  ${Object.keys(it.st).length?`<div class="dt-fx">${Object.entries(it.st).map(([k,v])=>`<span>${esc(stTxt({[k]:v}))}</span>`).join('')}</div>`:''}
  ${it.use?`<div class="dt-fx"><span>${esc(Items.useTxt(it))}</span></div>`:''}${it.d?`<div class="dt-ds">${esc(it.d)}</div>`:''}
  <div class="dt-btns">${gear?(eqSlot?`<button class="dt-lime" data-un="${eqSlot}">Quitar</button>`:`<button class="dt-lime" data-eq="${it.id}" ${b.lvl>=it.lvl?'':'disabled'}>Equipar</button>`):''}
  <button class="dt-lime alt" data-sell="${it.id}" title="Vender 1 al mercado">Vender · 💰 ${kf(sp)}</button><button class="dt-lime alt" data-list="${it.id}">📋 Al puesto</button></div></div>`}
function invGrid(){const b=PJ,L=invIds(),cells=L.map(i=>{const n=Items.own(b,i.id),w=Items.worn(b,i.id),lock=Registry.kinds[i.kind].n>0&&b.lvl<i.lvl;
  return`<button class="dt-c${INV.sel===i.id?' sel':''}${lock?' lock':''}" data-i="${i.id}" style="--c:${mkCol(i)}" title="${esc(i.n+' · Nv '+i.lvl+(Object.keys(i.st).length?'\n'+stTxt(i.st):''))}"><span>${i.ico}</span>${n>1?'<u>'+n+'</u>':''}${w?'<em>✔</em>':''}</button>`}).join('');
 const empty=Math.max(0,30-L.length);return cells+'<i class="dt-c void"></i>'.repeat(empty)}
function renderInv(){const b=PJ,tabs=INVTABS.map(([k,ic,t])=>`<button class="dt-tab${INV.tab===k?' on':''}" data-tab="${k}" title="${t}">${ic}</button>`).join('');
 $('#inv').innerHTML=`<div class="dt-wrap"><div class="dt-p dt-char">${invChar()}</div><div class="dt-p dt-inv"><div class="dt-t"><b>INVENTARIO</b><button id="invx" class="st-x">✕</button></div>
 <div class="dt-body"><div class="dt-mid">${invDoll()}${invDetail()}</div><div class="dt-right"><div class="dt-tabs">${tabs}</div>
  <div class="dt-flt"><select id="invc" class="st-flt">${KCAT().map(([k,v])=>`<option value="${k}"${k===INV.cat?' selected':''}>${v}</option>`).join('')}</select><input id="invq" class="st-flt" placeholder="Buscar…" value="${esc(INV.q)}" autocomplete="off"></div>
  <div class="dt-grid" id="invg">${invGrid()}</div><div class="dt-foot"><span>🎒 ${b.inv.length} / ${PROG.maxInv} <small>equipo</small></span><span class="dt-k">💰 ${kf(b.kamas)} <u>₭</u></span></div></div></div>
 <div class="dt-msg">${esc(INV.msg)}</div></div></div>`;
 LOOK.portrait($('#invport'),b.look,b.sex,b.cls);invAnim()}
function invAnim(){cancelAnimationFrame(INV.raf);const f=t=>{const c=$('#invfig');if(!c||$('#inv').hidden){INV.raf=0;return}LOOK.figure(c.getContext('2d'),c.width,c.height,PJ.cls,PJ.sex,PJ.look,t/1000);INV.raf=requestAnimationFrame(f)};INV.raf=requestAnimationFrame(f)}
function openInv(sel){if(sel)INV.sel=sel;INV.msg='';renderInv();$('#inv').hidden=false;G.paused=true}
function closeInv(){$('#inv').hidden=true;$('#inv').classList.remove('max');if(overlayOpen()===false)G.paused=false;cancelAnimationFrame(INV.raf)}
const invSave=e=>{INV.msg=e||'';if(!e&&SAVED)PG.save(PJ);UI.head();if(!$('#sheet').hidden)renderSheet();renderInv()};
$('#inv').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const d=t.dataset,b=PJ;
 if(t.id==='invx'){closeInv();return}
 if(d.s){PG.spend(b,d.s,+d.n);invSave();return}
 if(d.open){if(d.open==='sp'){openSpells()}else if(d.open==='sheet'){renderSheet();$('#sheet').hidden=false}else if(d.open==='respec'){if(confirm('¿Reiniciar tus puntos de capital y de hechizo?')){PG.respec(b);invSave()}}else if(d.open==='jobs')openJobs();else if(d.open==='shop')openShop('buy');return}
 if(d.tab){INV.tab=d.tab;renderInv();return}
 if(d.i){INV.sel=d.i;INV.msg='';renderInv();return}
 if(d.sl){const id=b.eq[d.sl];if(id){INV.sel=id;INV.msg=''}else{INV.cat=(Items.slots().find(s=>s.id===d.sl)||{}).kind||'all';INV.tab='gear'}renderInv();return}
 if(d.eq){invSave(Items.equip(b,d.eq));return}
 if(d.un){Items.unequip(b,d.un);invSave();return}
 if(d.sell){const n=Items.own(b,d.sell);if(Items.worn(b,d.sell)&&n<=Items.worn(b,d.sell)&&!confirm('Lo llevas puesto. ¿Vender igualmente?'))return;invSave(Items.sell(b,d.sell,1));return}
 if(d.list){openShop('lots',d.list)}});
$('#inv').addEventListener('dblclick',e=>{const t=e.target.closest('[data-i]');if(!t)return;const it=Registry.items[t.dataset.i];if(it&&Registry.kinds[it.kind].n>0&&!Object.values(PJ.eq).includes(it.id))invSave(Items.equip(PJ,it.id))});
$('#inv').addEventListener('change',e=>{if(e.target.id==='invc'){INV.cat=e.target.value;renderInv()}});
$('#inv').addEventListener('input',e=>{if(e.target.id==='invq'){INV.q=e.target.value;$('#invg').innerHTML=invGrid()}});
$('#inv').addEventListener('pointerdown',e=>{if(e.target===$('#inv'))closeInv()});
$('#lvl').onclick=()=>openInv();
