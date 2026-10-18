/* ui/market.js · SUPERMERCADO: tienda con precios vivos (economy.js) + tu puesto de venta.
   🏪 Comprar: todo lo que vende el mercado, con precio actual, tendencia y gráfica. 💱 Vender: tu inventario al mercado (precio de compra del mercado) o a TU precio en el puesto.
   📋 Mi puesto: tus lotes a la venta; compradores simulados los van comprando con el tiempo. Lee Registry.items/kinds → un objeto nuevo aparece solo. */
const SH={tab:'buy',cat:'all',q:'',sort:'name',sel:null,qty:1,msg:'',lp:'',back:null,xs:'p'};   // xs = orden de los ejemplares únicos: p (más baratos) · q (mejor calidad)   // back = {job,rec,n}: vienes de la ventana Oficios (clic en un ingrediente) → botón «Volver»
function shList(){const b=PJ,q=SH.q.trim().toLowerCase();let L;
 if(SH.tab==='buy')L=Object.values(Registry.items).filter(i=>!i.nosale);
 else if(SH.tab==='sell')L=[...new Set(b.inv),...Object.keys(b.res||{})].map(id=>Registry.items[id]).filter(Boolean);
 else L=[...new Set(b.mk.lots.map(l=>l.id))].map(id=>Registry.items[id]);
 L=L.filter(i=>(SH.cat==='all'||i.kind===SH.cat)&&(!q||i.n.toLowerCase().includes(q)||((Registry.isets[i.set]||{}).n||'').toLowerCase().includes(q)));
 const cmp={name:(a,c)=>a.lvl-c.lvl||a.n.localeCompare(c.n),price:(a,c)=>Eco.price(c.id)-Eco.price(a.id),trend:(a,c)=>Eco.trend(c.id)-Eco.trend(a.id),cheap:(a,c)=>Eco.price(a.id)/a.price-Eco.price(c.id)/c.price}[SH.sort];
 return L.sort(cmp)}
function shRows(L){const b=PJ;
 if(SH.tab==='lots'){return b.mk.lots.length?b.mk.lots.filter(l=>L.some(i=>i.id===l.id)).map(l=>{const i=Registry.items[l.id],r=l.p/Eco.price(l.id);
  return`<div class="st-row${l.u===SH.sel?' sel':''}" data-lot="${l.u}"><span class="st-ic" style="--c:${mkCol(i)}">${i.ico}</span><span class="st-nm">${esc(i.n)}<small class="mk-s">${l.sold} / ${l.q} vendidos · a ${kf(l.p)} c/u</small></span><span class="st-lv"><small>×</small>${l.q-l.sold}</span><span class="st-pts" style="color:${r<=1.05?'#9bd54a':'#ffb070'}">${Math.round(r*100)}%</span></div>`}).join(''):'<div class="st-empty">No tienes nada a la venta.<br>Elige un objeto en «Vender» y ponlo a tu precio.</div>'}
 return L.length?L.map(i=>{const n=Items.own(b,i.id),g=SH.tab==='buy'&&Eco.gear(i.id),P=g?Eco.pool(i.id):[],pr=P.map(x=>Eco.price(x)),p=SH.tab==='buy'?Eco.price(i.id):Eco.sellPrice(i.id),dl=Eco.deals().includes(i.base||i.id),
   pt=g?(P.length?(Math.min(...pr)===Math.max(...pr)?kf(pr[0]):kf(Math.min(...pr))+' – '+kf(Math.max(...pr))):'Agotado'):kf(p);   // equipo único: se ve cuántos ejemplares hay, el rango de cada característica y el rango de precios ANTES de abrirlo
  return`<div class="st-row${i.id===SH.sel?' sel':''}${g?' mk-g':''}" data-i="${i.id}"><span class="st-ic" style="--c:${mkCol(i)}">${i.ico}</span><span class="st-nm">${esc(i.n)}${dl?' <span class="mk-deal">🏷 oferta</span>':''}${SH.tab==='sell'&&n>1?' ×'+n:''}${g?' <span class="mk-n'+(P.length?'':' no')+'">×'+P.length+'</span>':''}<small class="mk-s">${i.kind==='recurso'||i.kind==='consumible'?(n?'Tienes '+n:Registry.kinds[i.kind].s):g?esc(rgTxt(i)):esc(stTxt(i.st,' '))}</small></span><span class="st-lv"><small>Nv</small>${i.lvl}</span><span class="st-pts">💰 ${pt}<br>${trendTxt(Eco.trend(i.id))}</span></div>`}).join(''):'<div class="st-empty">'+(SH.tab==='sell'?'No tienes objetos de este tipo.':'Nada que mostrar')+'</div>'}
/* SUBMENÚ de una pieza de equipo: los EJEMPLARES únicos que hay a la venta, cada uno con sus valores y su precio. Los crea el sistema según la demanda (economy.js) */
function shGear(it){const b=PJ,o=Eco.st(it.id),P=Eco.pool(it.id),goal=Eco.goal(it.id,o),
 L=[...P].sort(SH.xs==='q'?(x,y)=>Inst.q(y)-Inst.q(x)||Eco.price(x)-Eco.price(y):(x,y)=>Eco.price(x)-Eco.price(y)||Inst.q(y)-Inst.q(x));
 const rows=L.map(x=>{const e=Registry.items[x],p=Eco.price(x),ok=b.kamas>=p&&Items.room(b,it.id)>=1;
  return`<div class="mk-xr"><span class="mk-xs">${rollChips(e)}</span><span class="mk-xq" title="Calidad: lo bueno que salió dentro del rango">${Math.round(Inst.q(x)*100)} %</span><b class="mk-xp">💰 ${kf(p)}</b><button class="st-up" data-buyi="${x}" ${ok?'':'disabled'}>Comprar</button></div>`}).join('');
 return`<div class="mk-ex"><div class="mk-exh"><b>📦 Ejemplares a la venta (${P.length})</b><span class="mk-xsort"><button data-xs="p" class="${SH.xs!=='q'?'on':''}">Más baratos</button><button data-xs="q" class="${SH.xs==='q'?'on':''}">Mejor calidad</button></span></div>
 ${rows||'<div class="st-empty mk-x0">Agotado. El mercado fabricará más ejemplares según la demanda.</div>'}
 <div class="mk-dm">📈 Demanda: <b>${Eco.demand(it.id)}</b> · el mercado fabrica más ejemplares de lo que más se compra (objetivo ahora: ${goal}). Repone cada 10 min y con cada combate.</div></div>`}
function shDetail(){const b=PJ;
 if(SH.tab==='lots'){const l=b.mk.lots.find(x=>x.u===SH.sel),cash=b.mk.cash;
  const top=`<div class="mk-cash"><span>💰 En caja: <b>${kf(cash)}</b> kamas</span><button class="st-up" data-collect="1" ${cash>0?'':'disabled'}>Cobrar</button></div>`;
  if(!l)return top+'<div class="st-empty">Selecciona un lote.<br><small>Cada 10 min (y cada combate) los compradores revisan tu puesto: cuanto más barato respecto al mercado, antes compran. Tasa de venta '+Math.round(ECO.tax*100)+' %.</small></div>';
  const i=Registry.items[l.id],ref=Eco.price(l.id),r=l.p/ref;
  return top+`<div class="st-hd"><span class="st-big" style="--c:${mkCol(i)}">${i.ico}</span><div><b>${esc(i.n)}</b><small>Lote de ${l.q} · vendidos ${l.sold}</small></div></div><div class="st-info"><div class="mk-bar2"><i style="width:${100*l.sold/l.q}%"></i></div>
  <div>Tu precio: <b>💰 ${kf(l.p)}</b> · mercado: ${kf(ref)} (${Math.round(r*100)} %)</div><div class="st-nt">${r<=.85?'Muy barato: se venderá rápido.':r<=1.1?'Precio competitivo.':r<=1.4?'Caro: tardará en venderse.':'Demasiado caro: casi nadie comprará.'}</div>
  <div>Ganado con este lote: <b>${kf(l.gain||0)}</b> kamas</div></div><div class="mk-msg">${esc(SH.msg)}</div><div class="st-act"><button class="st-sell" data-cancel="${l.u}">Retirar lo que queda (${l.q-l.sold})</button></div>`}
 const it=Registry.items[SH.sel];if(!it)return'<div class="st-empty">Selecciona un objeto</div>';
 const o=Eco.st(it.id),T=Eco.T(it),buy=SH.tab==='buy',own=Items.own(b,it.id),mx=buy?Math.max(1,Math.min(Items.room(b,it.id),PROG.maxStack)):own,q=clamp(SH.qty|0||1,1,Math.max(1,mx)),tot=Eco.quote(it.id,q,buy?'buy':'sell'),
  ev=Eco.activeEvents().filter(e=>e.f(it)),S=Registry.isets[it.set],src=Items.sources(Inst.base(it.id)),rc=Registry.recipes[Inst.base(it.id)],g=buy&&Eco.gear(it.id);
 let h=`<div class="st-hd"><span class="st-big" style="--c:${mkCol(it)}">${it.ico}</span><div><b>${esc(it.n)}</b><small class="${Registry.kinds[it.kind].n>0&&b.lvl<it.lvl?'bad':''}">Nivel ${it.lvl} · ${Registry.kinds[it.kind].s}${S?' · '+esc(S.n):''}</small></div></div><div class="st-info">
  ${Object.keys(it.st).length?`${g?'<div class="mk-rgh">Características posibles (mínimo a máximo)</div>':it.inst?'<div class="mk-rgh">Características de este ejemplar</div>':''}<ul class="st-fx">${fxHtml(it,g?'range':'')}</ul>`:''}${it.use?`<div class="st-nt">${esc(Items.useTxt(it))}</div>`:''}${it.d?`<div class="st-nt">${esc(it.d)}</div>`:''}
  <div class="mk-pr"><div><small>${g?'Precio medio (calidad media)':it.inst?'Precio de este ejemplar':'Precio de compra'}</small><b>💰 ${kf(Eco.price(it.id))}</b> ${trendTxt(Eco.trend(it.id))}</div><div><small>Te lo compran a</small><b>💰 ${kf(Eco.sellPrice(it.id))}</b></div></div>
  ${spark(Eco.hist(it.id))}<div class="mk-stock"><small>Existencias del mercado: <b>${Math.round(o.st)}</b> (normal ${T})</small><div class="mk-bar2"><i style="width:${clamp(100*o.st/(T*2),2,100)}%"></i></div></div>
  ${ev.length?`<div class="mk-ev">${ev.map(e=>esc(e.n)).join('<br>')}</div>`:''}${Eco.deals().includes(Inst.base(it.id))?'<div class="mk-ev">🏷 Oferta del día: -20 %</div>':''}
  ${rc?`<div class="st-nt">🔨 Se fabrica en el oficio ${Registry.jobs[rc.job].n} (nivel ${rc.need}).</div>`:''}${src.length?`<div class="st-nt">Lo sueltan: ${src.map(s=>(s.m.ico||'👾')+' '+esc(s.m.n)+' '+pctTxt(s.p)).join(' · ')}</div>`:''}
  ${g?shGear(it):''}</div>
  ${g?'':`<div class="mk-qty"><span>Cantidad</span><input id="shq" type="number" min="1" max="${mx}" value="${q}" inputmode="numeric"><button data-q="1">1</button><button data-q="10">10</button><button data-q="50">50</button><button data-q="max">Máx.</button></div>`}
  <div class="mk-msg">${esc(SH.msg)}</div>`;
 if(buy){if(!g)h+=`<div class="st-act"><button class="st-up" data-buy="${q}" ${b.kamas>=tot&&Items.room(b,it.id)>=q?'':'disabled'}>Comprar ${q} · 💰 ${kf(tot)}</button></div>`}
 else{const lp=SH.lp||String(Eco.price(it.id));h+=`<div class="st-act"><button class="st-sell" data-sellq="${q}" ${own>=q?'':'disabled'}>Vender ${q} al mercado · 💰 ${kf(tot)}</button></div>
  <div class="mk-lot"><span>📋 Tu puesto</span><input id="shp" type="number" min="1" value="${esc(lp)}" inputmode="numeric" title="Precio por unidad"><button class="st-up" data-list="${q}" ${own>=q?'':'disabled'}>Poner ${q} a la venta</button></div><small class="mk-s2">Tasa ${Math.round(ECO.fee*100)} % al listar · ${Math.round(ECO.tax*100)} % al vender. Recibirás ~${kf(Math.floor(q*(+lp||0)*(1-ECO.tax)))} si se vende todo.</small>`}
 return h}
function renderShop(reset){const b=PJ;Eco.settle(b);const L=shList(),ok=id=>SH.tab==='lots'?b.mk.lots.some(l=>l.u===id):L.some(i=>i.id===id);
 if(SH.tab==='lots'){if(!ok(SH.sel))SH.sel=b.mk.lots[0]?b.mk.lots[0].u:null}else if(!ok(SH.sel))SH.sel=L[0]?L[0].id:null;
 const ev=Eco.activeEvents(),dl=Eco.deals().map(id=>Registry.items[id].n),same=SH._ls===SH.sel,tab=SH._lt===SH.tab;SH._ls=SH.sel;SH._lt=SH.tab;
 /* al elegir un objeto la lista se queda donde estaba (el detalle solo vuelve arriba si cambia el objeto); al cambiar de pestaña/categoría/orden sí empieza arriba */
 scrollKeep($('#mkt'),[['#mkl',!reset&&tab],['#shd',!reset&&tab&&same]],()=>{$('#mkt').innerHTML=`<div class="st-win"><div class="st-title"><span class="st-help">?</span><b>Supermercado</b><button id="mkx" class="st-x">✕</button></div>
 <div class="mk-bar"><div class="mk-tabs"><button data-tab="buy" class="${SH.tab==='buy'?'on':''}">🏪 Comprar</button><button data-tab="sell" class="${SH.tab==='sell'?'on':''}">💱 Vender</button><button data-tab="lots" class="${SH.tab==='lots'?'on':''}">📋 Mi puesto${b.mk.lots.length?' ('+b.mk.lots.length+')':''}${b.mk.cash?' 💰':''}</button></div>${SH.back?`<button class="mk-back" data-back="1" title="Volver a la receta">↩ Volver a ${esc(SH.back.n)}</button>`:''}<span class="mk-k">💰 ${kf(b.kamas)} kamas</span></div>
 <div class="mk-news"><b>📰 Noticias</b> <span>${ev.map(e=>esc(e.n)).join(' · ')}</span> <b>🏷 Ofertas</b> <span>${esc(dl.join(', '))}</span></div>
 <div class="st-body"><div class="st-left"><div class="mk-f"><select id="mkc" class="st-flt">${KCAT().map(([k,v])=>`<option value="${k}"${k===SH.cat?' selected':''}>${v}</option>`).join('')}</select><select id="mks" class="st-flt">${[['name','Por nivel'],['price','Más caro'],['trend','Sube más'],['cheap','Más baratos hoy']].map(([k,v])=>`<option value="${k}"${k===SH.sort?' selected':''}>${v}</option>`).join('')}</select><input id="mkq" class="st-flt" placeholder="Buscar…" value="${esc(SH.q)}" autocomplete="off"></div>
 <div class="st-list" id="mkl">${shRows(L)}</div><div class="st-foot"><span>${SH.tab==='lots'?'Lotes: <em>'+b.mk.lots.length+' / '+ECO.maxLots+'</em>':'Objetos: <em>'+L.length+'</em>'}</span><span>Los precios cambian con la oferta, la demanda y las noticias</span></div></div>
 <div class="st-right ss-r" id="shd">${shDetail()}</div></div></div>`});
 if(Eco._dirty){Eco._dirty=false;Eco.save()}}
function openShop(tab,item,qty,back){if(tab)SH.tab=tab;if(item){SH.sel=item;if(SH.tab==='buy'){SH.cat='all';SH.q=''}}if(qty>0)SH.qty=qty;SH.back=back||null;SH.msg='';SH.lp='';SH._lt=null;renderShop(true);$('#mkt').hidden=false;G.paused=true}
const openMkt=openShop;
const shSave=(e,ok)=>{SH.msg=e||ok||'';if(!e&&SAVED)PG.save(PJ);UI.head();if(!$('#inv').hidden)renderInv();UI.sheetRefresh();renderShop()};
$('#mkt').addEventListener('click',e=>{const t=e.target.closest('button,[data-i],[data-lot]');if(!t)return;const d=t.dataset,b=PJ;
 if(t.id==='mkx'){$('#mkt').hidden=true;if(!overlayOpen())G.paused=false;return}
 if(d.back){const k=SH.back;SH.back=null;$('#mkt').hidden=true;if(k)openJobs(k.job,k.rec);else if(!overlayOpen())G.paused=false;return}
 if(d.tab){SH.tab=d.tab;SH.msg='';SH.sel=null;SH.qty=1;SH.lp='';renderShop(true);return}
 if(d.lot){SH.sel=d.lot;SH.msg='';renderShop();return}
 if(d.i&&t.tagName!=='BUTTON'){SH.sel=d.i;SH.msg='';SH.qty=1;SH.lp='';renderShop();return}
 if(d.q){const it=Registry.items[SH.sel],mx=SH.tab==='buy'?Math.min(Items.room(b,it.id),PROG.maxStack):Items.own(b,it.id);SH.qty=d.q==='max'?Math.max(1,mx):+d.q;SH.msg='';renderShop();return}
 if(d.buyi){const e2=Items.buy(b,d.buyi,1),x=Registry.items[d.buyi];shSave(e2,x&&'✔ Compraste '+x.n+' ('+stTxt(x.st,' · ')+')');return}
 if(d.xs){SH.xs=d.xs;renderShop();return}
 if(d.buy){const q=+d.buy,e2=Items.buy(b,SH.sel,q);shSave(e2,'✔ Compraste '+q+'× '+Registry.items[SH.sel].n);return}
 if(d.sellq){const q=+d.sellq,id=SH.sel;if(Items.worn(b,id)&&Items.own(b,id)-q<Items.worn(b,id)&&!confirm('Lo llevas puesto. ¿Vender igualmente?'))return;const e2=Items.sell(b,id,q);shSave(e2,'✔ Vendiste '+q+'× '+Registry.items[id].n);return}
 if(d.list){const q=+d.list,p=+($('#shp')||{}).value,e2=Eco.list(b,SH.sel,q,p);let ok2='';if(!e2){ok2='✔ Puesto a la venta: '+q+'× '+Registry.items[SH.sel].n+' a '+p;SH.tab='lots';SH.sel=b.mk.lots[b.mk.lots.length-1].u}shSave(e2,ok2);return}
 if(d.cancel){const e2=Eco.cancel(b,d.cancel);SH.sel=null;shSave(e2);return}
 if(d.collect){const c=Eco.collect(b);shSave(null,'✔ Cobraste '+kf(c)+' kamas')}});
$('#mkt').addEventListener('change',e=>{const id=e.target.id;if(id==='mkc'){SH.cat=e.target.value;renderShop(true)}else if(id==='mks'){SH.sort=e.target.value;renderShop(true)}else if(id==='shq'){SH.qty=Math.max(1,e.target.value|0);renderShop()}else if(id==='shp'){SH.lp=e.target.value;renderShop()}});
$('#mkt').addEventListener('input',e=>{if(e.target.id==='mkq'){SH.q=e.target.value;$('#mkl').innerHTML=shRows(shList())}});
$('#mkt').addEventListener('pointerdown',e=>{if(e.target===$('#mkt')){$('#mkt').hidden=true;if(!overlayOpen())G.paused=false}});
$('#mkb').onclick=()=>openShop('buy');
