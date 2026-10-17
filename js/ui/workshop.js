/* ui/workshop.js · ventana «Oficios» (taller): 5 oficios con nivel; cada receta convierte los recursos que sueltan los monstruos (+ kamas) en equipo, piezas de set o consumibles.
   Lee Registry.jobs / Registry.recipes (js/data/crafts.js) → una receta nueva aparece sola. */
const JW={job:'sastre',sel:null,only:false,msg:''};
function jobRows(){const b=PJ,L=Jobs.list(JW.job).filter(r=>!JW.only||Jobs.max(b,r)>0);
 return L.length?L.map(r=>{const it=Registry.items[r.id],lock=Jobs.lv(b,r.job)<r.need,mx=Jobs.max(b,r);
  return`<div class="st-row${r.id===JW.sel?' sel':''}${lock?' lock':''}" data-r="${r.id}"><span class="st-ic" style="--c:${mkCol(it)}">${it.ico}</span><span class="st-nm">${esc(it.n)}${it.set?'<small class="mk-s">'+esc(Registry.isets[it.set].n)+'</small>':''}</span><span class="st-lv"><small>Of.</small>${r.need}</span><span class="st-pts" style="color:${mx>0?'#9bd54a':'#9d978a'}">${mx>0?'✔ '+mx:lock?'🔒':'—'}</span></div>`}).join(''):'<div class="st-empty">No hay recetas que mostrar</div>'}
function jobDetail(){const b=PJ,r=Registry.recipes[JW.sel];if(!r)return'<div class="st-empty">Elige una receta</div>';
 const it=Registry.items[r.id],J=Registry.jobs[r.job],lock=Jobs.lv(b,r.job)<r.need,mx=Jobs.max(b,r);
 const ing=r.ing.map(([id,n])=>{const x=Registry.items[id],have=Items.own(b,id),ok=have>=n,src=Items.sources(id).slice(0,2);
  return`<div class="jw-ing ${ok?'ok':'no'} jw-go" data-ing="${id}" data-need="${n}" tabindex="0" title="${ok?'Ya tienes suficiente':x.nosale?'No se vende: míralo en «Lo sueltan»':'Clic: ir al mercadillo a comprarlo'}"><span class="st-ic" style="--c:${mkCol(x)}">${x.ico}</span><div><b>${esc(x.n)}</b><small>${src.length?'Lo sueltan: '+src.map(s=>(s.m.ico||'👾')+' '+esc(s.m.n)+' '+pctTxt(s.p)).join(' · '):'Cómpralo en el mercado'}</small></div><span class="jw-n">${have} / ${n}</span>${ok||x.nosale?'':'<span class="jw-buy">🛒 Comprar</span>'}</div>`}).join('');
 const S=Registry.isets[it.set];
 return`<div class="st-hd"><span class="st-big" style="--c:${mkCol(it)}">${it.ico}</span><div><b>${esc(it.n)}</b><small class="${lock?'bad':''}">${J.ico} ${J.n} nivel ${r.need}${S?' · '+esc(S.n):''} · objeto Nv ${it.lvl}</small></div></div>
 <div class="st-info">${Object.keys(it.st).length?`<ul class="st-fx">${Object.entries(it.st).map(([k,v])=>`<li>${esc(stTxt({[k]:v}))}</li>`).join('')}</ul>`:''}${it.use?`<div class="st-nt">${esc(Items.useTxt(it))}</div>`:''}${it.d?`<div class="st-nt">${esc(it.d)}</div>`:''}
 <div class="ss-t">Ingredientes</div>${ing}<div class="jw-fee ${b.kamas>=r.fee?'':'bad'}">Coste del taller: 💰 ${kf(r.fee)} <small>(tienes ${kf(b.kamas)})</small></div>
 <div class="ss-t">Primera vez: <small>XP de oficio ×${PROG.job.first}${b.crafted[r.id]?' (ya la hiciste)':''}</small> · cada unidad da <b>${PROG.job.gain(it)}</b> XP</div></div>
 <div class="jw-msg ${JW.msg.startsWith('✔')?'ok':''}">${esc(JW.msg)}</div>
 <div class="st-act"><button class="st-up" data-cr="1" ${mx>=1?'':'disabled'}>Fabricar</button><button class="st-up" data-cr="5" ${mx>=5?'':'disabled'}>×5</button><button class="st-up" data-cr="max" ${mx>=2?'':'disabled'}>Máx. (${mx})</button></div>`}
function renderJobs(){const b=PJ;
 if(!Registry.recipes[JW.sel]||Registry.recipes[JW.sel].job!==JW.job)JW.sel=(Jobs.list(JW.job)[0]||{}).id;
 const tabs=Object.values(Registry.jobs).map(j=>{const J=b.jobs[j.id],mx=J.lv>=PROG.job.max;return`<button class="jw-tab${j.id===JW.job?' on':''}" data-j="${j.id}" title="${esc(j.d)}"><span>${j.ico}</span><b>${j.n}</b><small>Nv ${J.lv}</small><i><u style="width:${mx?100:100*J.xp/PROG.job.xpNeed(J.lv)}%"></u></i></button>`}).join('');
 const J=Registry.jobs[JW.job],o=b.jobs[JW.job];
 $('#jobs').innerHTML=`<div class="st-win"><div class="st-title"><span class="st-help">?</span><b>Oficios</b><button id="jwx" class="st-x">✕</button></div>
 <div class="mk-bar"><div class="jw-tabs">${tabs}</div><span class="mk-k">💰 ${kf(b.kamas)} kamas</span></div>
 <div class="st-body"><div class="st-left"><div class="jw-hd"><b>${J.ico} ${J.n} · nivel ${o.lv}</b><small>${o.lv>=PROG.job.max?'Nivel máximo':kf(o.xp)+' / '+kf(PROG.job.xpNeed(o.lv))+' XP'} · ${esc(J.d)}</small></div>
  <label class="jw-ck"><input type="checkbox" id="jwo" ${JW.only?'checked':''}> Solo lo que puedo fabricar ahora</label>
  <div class="st-list" id="jwl">${jobRows()}</div><div class="st-foot"><span>Recetas: <em>${Jobs.list(JW.job).length}</em></span><span>Los recursos los sueltan los monstruos</span></div></div>
 <div class="st-right ss-r">${jobDetail()}</div></div></div>`}
function openJobs(job,rec){if(job)JW.job=job;if(rec)JW.sel=rec;JW.msg='';renderJobs();$('#jobs').hidden=false;G.paused=true}
const jwSave=()=>{if(SAVED)PG.save(PJ);UI.head();if(!$('#inv').hidden)renderInv();renderJobs()};
/* clic en un ingrediente: si te falta, te lleva al mercadillo (pestaña Comprar) con ese objeto elegido y la cantidad que te falta; allí hay un botón para volver a la receta */
function jwIngredient(id,n){const b=PJ,x=Registry.items[id],have=Items.own(b,id),miss=Math.max(0,n-have);if(!x)return;
 if(!miss){JW.msg='✔ Ya tienes suficiente '+x.n+' ('+have+' / '+n+')';renderJobs();return}
 if(x.nosale){const src=Items.sources(id).slice(0,3);JW.msg='🚫 '+x.n+' no se vende en el mercadillo'+(src.length?' · lo sueltan: '+src.map(q=>q.m.n).join(', '):'');renderJobs();return}
 const r=Registry.recipes[JW.sel];$('#jobs').hidden=true;openShop('buy',id,miss,{job:JW.job,rec:JW.sel,n:r?Registry.items[r.id].n:'la receta'})}
$('#jobs').addEventListener('keydown',e=>{const g=e.target.closest&&e.target.closest('[data-ing]');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();jwIngredient(g.dataset.ing,+g.dataset.need)}});
$('#jobs').addEventListener('click',e=>{const ig=e.target.closest('[data-ing]');if(ig){jwIngredient(ig.dataset.ing,+ig.dataset.need);return}const t=e.target.closest('button,[data-r]');if(!t)return;const d=t.dataset,b=PJ;
 if(t.id==='jwx'){$('#jobs').hidden=true;if(!overlayOpen())G.paused=false;return}
 if(d.j){JW.job=d.j;JW.msg='';renderJobs();return}
 if(d.r&&t.tagName!=='BUTTON'){JW.sel=d.r;JW.msg='';renderJobs();return}
 if(d.cr){const r=Registry.recipes[JW.sel],q=d.cr==='max'?Jobs.max(b,r):+d.cr,R=Jobs.craft(b,JW.sel,q);
  if(R.err)JW.msg=R.err;else JW.msg='✔ Fabricaste '+R.q+'× '+Registry.items[JW.sel].n+(R.xp?' · +'+R.xp+' XP de oficio':'')+(R.up?' · ¡'+Registry.jobs[r.job].n+' sube a nivel '+R.lv+'!':'')+(R.first?' (primera vez ×'+PROG.job.first+')':'');
  jwSave()}});
$('#jobs').addEventListener('change',e=>{if(e.target.id==='jwo'){JW.only=e.target.checked;renderJobs()}});
$('#jobs').addEventListener('pointerdown',e=>{if(e.target===$('#jobs')){$('#jobs').hidden=true;if(!overlayOpen())G.paused=false}});
$('#jobb').onclick=()=>openJobs();
