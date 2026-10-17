/* economy.js · MERCADO VIVO (sin pantalla). Los precios de la tienda se mueven solos:
   · OFERTA Y DEMANDA: cada objeto tiene un stock. Si compras, baja el stock y sube el precio; si vendes, sube el stock y baja el precio.
     Con el tiempo el stock vuelve poco a poco a su nivel normal (reposición).
   · NOTICIAS: cada ~8 h de juego hay 2 eventos (escasez, cosecha, guerra…) que suben o bajan grupos de objetos, y 3 «ofertas del día».
   · PUESTO DE VENTA: pones tus objetos a TU precio; compradores simulados los van comprando con el tiempo si el precio es competitivo (cobras con una tasa).
   El tiempo avanza con el reloj real (1 «tic» cada 10 min, hasta 1 día de golpe al volver) y +2 tics por cada combate que terminas.
   El estado del mercado se guarda en el navegador (localStorage 'coliseo.eco') y lo comparten todos tus personajes.
   Balance: todo en ECO (abajo). Mercado ENTRE JUGADORES reales: haría falta un servidor (Firebase) — aquí los compradores son simulados. */
const ECO={tickMs:600000,maxCatch:144,bucket:48,                       // ms por tic · tics máximos que se recuperan de golpe · tics por «día» de eventos
 tax:.05,fee:.01,maxLots:12,hist:36,                                    // tasa de venta · tasa por poner un lote · lotes por personaje · puntos de historial
 target:{recurso:80,consumible:40,equipo:12},                           // stock «normal» de cada tipo de objeto
 slope:.45,pmin:.55,pmax:2.4,                                           // cuánto sube el precio al escasear (y límites)
 events:[
  {n:'🌾 Mala cosecha en la Raíz: recursos de la Raíz +45 %',f:i=>i.kind==='recurso'&&i.lvl<15,m:1.45},
  {n:'🔥 Fiebre de la Brasa: recursos de la Brasa +40 %',f:i=>i.kind==='recurso'&&i.lvl>=15&&i.lvl<40,m:1.4},
  {n:'🌊 Marea baja: recursos del Abismo -30 %',f:i=>i.kind==='recurso'&&i.lvl>=40&&i.lvl<90,m:.7},
  {n:'🐉 Caza del Titán: recursos del Titán +35 %',f:i=>i.kind==='recurso'&&i.lvl>=90,m:1.35},
  {n:'⚔️ Guerra en el coliseo: armas y escudos +30 %',f:i=>i.kind==='arma'||i.kind==='escudo',m:1.3},
  {n:'🎉 Festival: consumibles -25 %',f:i=>i.kind==='consumible',m:.75},
  {n:'🧪 Epidemia: pociones +40 %',f:i=>i.kind==='consumible'&&!!i.use&&i.use.fx.some(x=>x.k==='hp'),m:1.4},
  {n:'👑 Moda en la corte: anillos y amuletos +25 %',f:i=>i.kind==='anillo'||i.kind==='amuleto',m:1.25},
  {n:'🚚 Caravana llena: todo el equipo -15 %',f:i=>Registry.kinds[i.kind]&&Registry.kinds[i.kind].n>0,m:.85}]};
const idh=s=>{let h=7;for(let i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))|0;return h};
const Eco={s:null,
 load(){let s=null;try{s=JSON.parse(localStorage.getItem('coliseo.eco')||'null')}catch(e){}
  if(!s||typeof s!=='object'||!s.it)s={n:0,t:Date.now(),it:{}};Eco.s=s;
  const k=Math.min(ECO.maxCatch,Math.floor((Date.now()-(s.t||Date.now()))/ECO.tickMs));if(k>0){s.t=Date.now();Eco.tick(k,true)}return s},
 save(){try{localStorage.setItem('coliseo.eco',JSON.stringify(Eco.s))}catch(e){}},
 initBuild(b){if(!b.mk||typeof b.mk!=='object'||Array.isArray(b.mk))b.mk={};if(!Array.isArray(b.mk.lots))b.mk.lots=[];b.mk.cash=Math.max(0,Math.floor(b.mk.cash)||0);b.mk.lots=b.mk.lots.filter(l=>l&&Registry.items[l.id]&&l.q>0&&l.p>=1);return b},
 /* ---- precios ---- */
 T(it){return ECO.target[it.kind==='recurso'?'recurso':it.kind==='consumible'?'consumible':'equipo']},
 st(id){const s=Eco.s||Eco.load(),it=Registry.items[id];return s.it[id]||(s.it[id]={st:Eco.T(it),h:[]})},
 bucket(){return Math.floor((Eco.s||Eco.load()).n/ECO.bucket)},
 activeEvents(){const b=Eco.bucket();if(Eco._ev&&Eco._ev.b===b)return Eco._ev.v;const v=Eco._ae(b);Eco._ev={b,v};return v},
 _ae(b){const L=ECO.events,a=Math.floor(hh(b,3,1)*L.length),c=(a+1+Math.floor(hh(b,4,2)*(L.length-1)))%L.length;return[L[a],L[c]]},
 deals(){const b=Eco.bucket();if(Eco._dl&&Eco._dl.b===b)return Eco._dl.v;const v=Eco._dd(b);Eco._dl={b,v};return v},
 _dd(b){const L=Object.values(Registry.items).filter(i=>!i.nosale&&i.kind!=='recurso').sort((x,y)=>x.id<y.id?-1:1),o=[];
  for(let i=0;i<3&&L.length;i++){const it=L[Math.floor(hh(b,i+10,9)*L.length)];if(!o.includes(it.id))o.push(it.id)}return o},
 /* multiplicador por noticias y ofertas */
 mult(it){let m=1;for(const e of Eco.activeEvents())if(e.f(it))m*=e.m;if(Eco.deals().includes(it.id))m*=.8;return m},
 /* precio unitario de COMPRA con un stock dado */
 unit(id,stock){const it=Registry.items[id],f=clamp(Math.pow(Eco.T(it)/Math.max(1,stock),ECO.slope),ECO.pmin,ECO.pmax),nz=1+(hh(idh(id),Eco.s.n>>2,3)-.5)*.1;return Math.max(1,Math.round(it.price*f*Eco.mult(it)*nz))},
 price(id){return Eco.unit(id,Eco.st(id).st)},
 sellUnit(id,stock){return Math.max(1,Math.floor(Eco.unit(id,stock)*PROG.sellPct))},
 sellPrice(id){return Eco.sellUnit(id,Eco.st(id).st)},
 /* coste total de comprar / venta total de q unidades (el precio se mueve unidad a unidad) */
 quote(id,q,mode){const st=Eco.st(id).st;let t=0;for(let i=0;i<q;i++)t+=mode==='buy'?Eco.unit(id,st-i):Eco.sellUnit(id,st+i);return t},
 trade(id,q,mode){const o=Eco.st(id);o.st=Math.max(0,o.st+(mode==='buy'?-q:q));Eco.save()},
 hist(id){const h=Eco.st(id).h;return h.length?h:[Eco.price(id)]},
 trend(id){const h=Eco.hist(id),p=Eco.price(id),r=h[Math.max(0,h.length-7)]||p;return(p-r)/r},
 /* ---- el tiempo avanza ---- */
 tick(n,quiet){const s=Eco.s||Eco.load();for(let i=0;i<n;i++){s.n++;
  for(const id in Registry.items){const it=Registry.items[id];if(it.nosale&&!s.it[id])continue;const o=Eco.st(id),T=Eco.T(it);
   o.st=Math.max(1,o.st+(T-o.st)*.05+(hh(idh(id),s.n,7)-.5)*T*.05);o.h.push(Eco.unit(id,o.st));if(o.h.length>ECO.hist)o.h.shift()}}
  if(!quiet)Eco.save();else Eco.save()},
 /* ---- puesto de venta: compradores simulados ---- */
 sellChance(r){return clamp(.5*(1.6-r),0,.5)},                          // r = tu precio / precio de mercado
 settle(b){Eco.initBuild(b);const s=Eco.s,out=[];
  for(const l of b.mk.lots){l.n=l.n==null?s.n:l.n;const from=Math.max(l.n,s.n-ECO.maxCatch);
   for(let t=from;t<s.n&&l.sold<l.q;t++){const r=l.p/Eco.price(l.id);if(Math.random()<Eco.sellChance(r)){const u=Math.min(l.q-l.sold,rn(1,Math.max(1,Math.ceil((l.q-l.sold)*.4))));l.sold+=u;const g=Math.floor(u*l.p*(1-ECO.tax));b.mk.cash+=g;l.gain=(l.gain|0)+g;out.push('💰 Vendiste '+u+'× '+Registry.items[l.id].n+' a '+l.p+' (+'+g+' kamas en tu puesto)')}}
   l.n=s.n}
  b.mk.lots=b.mk.lots.filter(l=>l.sold<l.q||l.gain>0&&false);return out},
 afterCombat(b){Eco.tick(2);return Eco.settle(b)},
 list(b,id,q,p){Eco.initBuild(b);const it=Registry.items[id];q=Math.floor(q);p=Math.floor(p);if(!it)return'Objeto desconocido';if(!(q>=1)||!(p>=1))return'Pon cantidad y precio';if(Items.own(b,id)<q)return'No tienes tantos';
  if(b.mk.lots.length>=ECO.maxLots)return'Tu puesto está lleno ('+ECO.maxLots+' lotes)';const fee=Math.max(1,Math.ceil(p*q*ECO.fee));if(b.kamas<fee)return'No tienes para la tasa ('+fee+' kamas)';
  if(Items.worn(b,id)&&Items.own(b,id)-q<Items.worn(b,id)&&!Items.stack(id))return'Quítate primero el objeto que llevas puesto';
  Items.take(b,id,q);b.kamas-=fee;b.mk.lots.push({u:Date.now().toString(36)+Math.random().toString(36).slice(2,5),id,q,p,sold:0,n:Eco.s.n,gain:0});return null},
 cancel(b,u){const i=b.mk.lots.findIndex(l=>l.u===u);if(i<0)return'No existe';const l=b.mk.lots[i],r=l.q-l.sold;if(r>0&&Items.room(b,l.id)<r)return'No tienes sitio en el inventario';if(r>0)Items.give(b,l.id,r);b.mk.lots.splice(i,1);return null},
 collect(b){const c=b.mk.cash;b.kamas+=c;b.mk.cash=0;return c}};
Eco.load();
