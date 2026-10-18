/* sets.js · ventana «Sets de equipo»: a la izquierda los sets (con tu progreso de piezas) · a la derecha, el set elegido con
   lo que aporta cada bono, TODAS sus piezas por categoría (lo que da cada una), si la tienes y su RECETA de fabricación (oficio, recursos y qué monstruos los sueltan).
   Lee todo de Registry.isets / Registry.items / Registry.monsters → crear un set nuevo (base.js) o un monstruo con drops (monstruos.js) NO obliga a tocar este archivo. */
const SETW={sel:null,msg:''};
const setLv=S=>Math.min(...Items.setParts(S.id).map(p=>p.lvl),999);
function renderSets(){Items.normSets();const b=PJ,list=Object.values(Registry.isets).sort((a,c)=>setLv(a)-setLv(c)||a.n.localeCompare(c.n));
 if(!Registry.isets[SETW.sel])SETW.sel=list[0]?list[0].id:null;
 const S=Registry.isets[SETW.sel],P=S?Items.setParts(S.id):[],kinds=Object.keys(Registry.kinds),
  have=p=>Items.own(b,p.id),worn=p=>Items.worn(b,p.id)>0,own=P.filter(p=>have(p)>0).length,eq=S?Items.setCount(b,S.id):0,
  act=S?Math.max(0,...Object.keys(S.b).map(Number).filter(n=>n<=eq)):0;
 const rows=list.map(s=>{const pp=Items.setParts(s.id),o=pp.filter(p=>Items.own(b,p.id)>0).length,full=o===pp.length;
  return`<div class="st-row${s.id===SETW.sel?' sel':''}" data-set="${s.id}"><span class="st-ic" style="--c:${s.c}">🎽</span><span class="st-nm">${esc(s.n)}${full?' ★':''}<small class="mk-s">✔ ${Items.setCount(b,s.id)} equipadas</small></span><span class="st-lv"><small>Nv</small>${setLv(s)}</span><span class="st-pts" style="color:${full?'#9bd54a':'#ffd24a'}">${o}/${pp.length}</span></div>`}).join('');
 let d='<div class="st-empty">No hay sets</div>';
 if(S){const parts=[...P].sort((x,y)=>kinds.indexOf(x.kind)-kinds.indexOf(y.kind));
  d=`<div class="st-hd"><span class="st-big" style="--c:${S.c}">🎽</span><div><b>${esc(S.n)}</b><small>Nivel ${setLv(S)} · 🎒 ${own}/${P.length} piezas · ✔ ${eq} equipadas</small></div></div>
  <div class="st-info"><div class="ss-t">Bonos del set <small>(se acumulan · solo piezas del mismo set)</small></div>
  <div class="ss-b ${eq>=2?'on':'no'}">${eq>=2?'▶':'·'} <b>Afinidad</b>: +${Math.round(Items.setPct(eq)*100)} % a las estadísticas de tus piezas de este set <small>(+${Math.round(PROG.setPct*100)} % por cada pieza extra)</small></div>`
  +Object.entries(S.b).map(([n,st])=>`<div class="ss-b ${eq>=+n?'on':'no'}">${eq>=+n?'✔':'·'} <b>${n} piezas</b>: ${esc(stTxt(st))}</div>`).join('')
  +`<button class="st-up" data-eqall="${S.id}" style="margin:6px 0 2px;width:100%" ${P.some(p=>have(p)>0&&!worn(p)&&b.lvl>=p.lvl)?'':'disabled'}>⚔ Equipar las piezas que tengo</button>
  <div class="ss-t">Piezas <small>(se fabrican en los oficios con recursos de monstruos)</small></div>`
  +parts.map(p=>{const n=have(p),w=worn(p),slot=Object.keys(b.eq).find(k=>b.eq[k]===p.id),rc=Registry.recipes[p.id],K=Registry.kinds[p.kind];
   return`<div class="ss-p ${w?'eq':n?'own':'no'}"><span class="st-ic" style="--c:${S.c}">${p.ico}</span><div class="ss-pm"><b>${esc(p.n)}</b><small class="${b.lvl<p.lvl?'bad':''}">${K.ico} ${K.s} · Nv ${p.lvl}</small>
    <div class="ss-fx">${esc(stTxt(p.st))}</div>
    <div class="ss-src">${rc?`<span>🔨 ${Registry.jobs[rc.job].ico} ${Registry.jobs[rc.job].n} nivel <em>${rc.need}</em>${Jobs.lv(b,rc.job)<rc.need?' <small class="bad">(tienes '+Jobs.lv(b,rc.job)+')</small>':''} · 💰 ${kf(rc.fee)}</span>`+rc.ing.map(([id,q])=>{const x=Registry.items[id],h=Items.own(b,id),so=Items.sources(id)[0];return`<span class="${h>=q?'':'bad'}">${x.ico} ${esc(x.n)} <em>${h}/${q}</em>${so?` <small>${so.m.ico||'👾'} ${esc(so.m.n)} ${pctTxt(so.p)}</small>`:''}</span>`}).join(''):'<small>Sin receta todavía</small>'}</div></div>
    <div class="ss-st">${w?`<span class="ok">✔ Equipada</span><button data-un="${slot}">Quitar</button>`:n?`<span class="ok">🎒${n>1?' ×'+n:''}</span><button data-eq="${p.id}" ${b.lvl>=p.lvl?'':'disabled'}>Equipar</button>`:`<span class="no">🔒</span>${rc?`<button data-fab="${p.id}">🔨 Fabricar</button>`:''}`}</div></div>`}).join('')
  +'</div>'}
 $('#sets').innerHTML=`<div class="st-win"><div class="st-title"><span class="st-help">?</span><b>Sets de equipo</b><button id="ssx" class="st-x">✕</button></div>
  <div class="st-body"><div class="st-left"><div class="st-list" id="ssl">${rows}</div><div class="st-foot"><span>Sets: <em>${list.length}</em></span><span>Las piezas se fabrican en los oficios</span></div></div>
  <div class="st-right ss-r">${d}<div class="mk-msg">${esc(SETW.msg)}</div></div></div></div>`}
function openSets(id){if(id)SETW.sel=id;SETW.msg='';renderSets();$('#sets').hidden=false}
const ssSave=e=>{SETW.msg=e||'';if(!e&&SAVED)PG.save(PJ);UI.head();UI.sheetRefresh();if(!$('#mkt').hidden)renderShop();if(!$('#inv').hidden)renderInv();renderSets()};
$('#sets').addEventListener('click',e=>{const t=e.target.closest('button,[data-set]');if(!t)return;const d=t.dataset,b=PJ;
 if(t.id==='ssx'){$('#sets').hidden=true;return}
 if(d.eqall){const n=Items.equipSet(b,d.eqall);ssSave(n?null:'No hay piezas que equipar');if(n)SETW.msg='';return}
 if(d.fab){const r=Registry.recipes[d.fab];$('#sets').hidden=true;openJobs(r.job,d.fab);return}
 if(d.eq)ssSave(Items.equip(b,d.eq));else if(d.un){Items.unequip(b,d.un);ssSave()}else if(d.set&&t.tagName!=='BUTTON'){SETW.sel=d.set;SETW.msg='';renderSets();const r=$('#sets .ss-r');if(r)r.scrollTop=0}});
$('#sets').addEventListener('pointerdown',e=>{if(e.target===$('#sets'))$('#sets').hidden=true});
