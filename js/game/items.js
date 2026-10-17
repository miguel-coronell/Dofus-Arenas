/* items.js · MOTOR de equipo, inventario, kamas y consumibles (sin pantalla). Los DATOS (tipos, sets, objetos) viven en js/data/items/*.js → ampliar el juego NO obliga a tocar este archivo.
   Build del jugador: kamas (moneda) · inv: ["id",…] equipo que posee (repetidos = copias) · res: {id:cantidad} recursos y consumibles (se APILAN) · eq: {hueco:"id"} lo que lleva puesto.
   Los precios de compra/venta NO se calculan aquí sino en el mercado vivo (js/game/economy.js): oferta, demanda, eventos… */
Registry.items={};Registry.isets={};Registry.kinds={};
Object.assign(PROG,{kamas0:300,sellPct:.5,maxInv:200,maxStack:999,                                              // ← balance de la economía: todo aquí
 kamasWin:(l,o)=>Math.round((40+8*o)*clamp(1+(o-l)/20,.3,1.5)),kamasLose:(l,o)=>Math.round(.25*(40+8*o))});   // kamas por combate (o = nivel del rival)
/* estadísticas que puede dar un objeto: clave → [icono, nombre, unidad]. Para una NUEVA estadística añade aquí su línea y úsala en Rules.stats (rules.js) */
const STAT={vit:['❤️','Vitalidad'],tierra:['🪨','Fuerza'],fuego:['🔥','Inteligencia'],agua:['💧','Suerte'],aire:['🌪️','Agilidad'],pow:['💪','Poder'],res:['🛡️','Resistencia','%'],pa:['⭐','PA'],pm:['👟','PM'],
 rtierra:['🪨','Res. Tierra','%'],rfuego:['🔥','Res. Fuego','%'],ragua:['💧','Res. Agua','%'],raire:['🌪️','Res. Aire','%']};   // resistencias por elemento (negativas = debilidad)
/* KIND(id, singular, plural, icono, huecos) = categoría del mercado Y hueco de equipo (anillo tiene 2). n=0 → no se equipa: se APILA (recursos y consumibles)
   IT(id,nombre,icono,tipo,nivel,precio,{stats},{set,d,nosale,c,use}) · ISET(id,nombre,{piezas:{stats}},color)  · precio = precio BASE (el mercado lo mueve según oferta y demanda) */
const KIND=(id,s,pl,ico,n)=>Registry.kinds[id]={id,s,pl,ico,n:n==null?1:n};
const IT=(id,n,ico,kind,lvl,price,st,o)=>Registry.items[id]={id,n,ico,kind,lvl,price,st:st||{},nosale:!!(o&&o.set),...o};   // las piezas de SET se FABRICAN (oficios) → no se venden en la tienda salvo que pongas nosale:false
const ISET=(id,n,b,c)=>Registry.isets[id]={id,n,b,c};
const Items={
 slots(){const o=[];for(const k in Registry.kinds){const K=Registry.kinds[k];for(let i=1;i<=K.n;i++)o.push({id:K.n>1?k+i:k,kind:k,ico:K.ico,nm:K.s})}return o},
 stack:id=>{const k=(Registry.items[id]||{}).kind;return k==='recurso'||k==='consumible'},                   // ¿se apila? (recursos y consumibles)
 isRes:id=>Items.stack(id),
 init(b){if(!Array.isArray(b.inv))b.inv=[];if(!b.res||typeof b.res!=='object'||Array.isArray(b.res))b.res={};for(const k in b.res)if(!(b.res[k]>0)||!Registry.items[k]||!Items.stack(k))delete b.res[k];if(!b.eq||typeof b.eq!=='object')b.eq={};b.kamas=b.kamas>=0?Math.floor(b.kamas):PROG.kamas0;
  if(typeof Jobs!=='undefined')Jobs.init(b);if(typeof Eco!=='undefined')Eco.initBuild(b);return b},
 own:(b,id)=>Items.stack(id)?(b.res[id]|0):b.inv.filter(x=>x===id).length,worn:(b,id)=>Object.values(b.eq).filter(x=>x===id).length,
 setCount(b,s){return Object.values(b.eq).filter(id=>(Registry.items[id]||{}).set===s).length},
 /* suma de todo lo equipado + bono de set por nº de piezas (se usa el escalón más alto alcanzado) */
 bonus(b){const t={},add=o=>{for(const k in o)t[k]=(t[k]||0)+o[k]},cnt={};
  for(const sl in b.eq||{}){const it=Registry.items[b.eq[sl]];if(!it)continue;add(it.st);if(it.set)cnt[it.set]=(cnt[it.set]||0)+1}
  for(const s in cnt){const S=Registry.isets[s];if(!S)continue;const k=Math.max(0,...Object.keys(S.b).map(Number).filter(n=>n<=cnt[s]));if(k)add(S.b[k])}return t},
 slotOf(b,it){const S=Items.slots().filter(s=>s.kind===it.kind);return S.find(s=>!b.eq[s.id])||S[0]},
 equip(b,id,slot){const it=Registry.items[id];if(!it)return'Objeto desconocido';if(Items.own(b,id)<1)return'No lo tienes';if(!Registry.kinds[it.kind].n)return'No se equipa';if(b.lvl<it.lvl)return'Requiere nivel '+it.lvl;
  const S=Items.slots().find(s=>s.id===slot)||Items.slotOf(b,it);if(!S||S.kind!==it.kind)return'No va en ese hueco';
  if(b.eq[S.id]!==id&&Items.worn(b,id)>=Items.own(b,id))return'Ya llevas todas tus copias';b.eq[S.id]=id;return null},
 unequip(b,slot){delete b.eq[slot]},
 /* da objetos al jugador (botín/compra/fabricación): equipo → b.inv (límite PROG.maxInv) · recurso o consumible → b.res (límite PROG.maxStack por tipo). Devuelve cuántos entraron */
 give(b,id,q){q=q||1;const it=Registry.items[id];if(!it)return 0;if(Items.stack(id)){const c=Math.min(q,PROG.maxStack-(b.res[id]|0));if(c>0)b.res[id]=(b.res[id]|0)+c;return Math.max(0,c)}
  const c=Math.min(q,PROG.maxInv-b.inv.length);for(let i=0;i<c;i++)b.inv.push(id);return Math.max(0,c)},
 room:(b,id)=>Items.stack(id)?PROG.maxStack-(b.res[id]|0):PROG.maxInv-b.inv.length,
 /* quita q unidades del inventario (sin cobrar): lo usan la venta, el puesto del mercado y la fabricación */
 take(b,id,q){q=q||1;if(Items.own(b,id)<q)return false;
  if(Items.stack(id)){b.res[id]-=q;if(b.res[id]<=0)delete b.res[id]}
  else{for(let n=0;n<q;n++)b.inv.splice(b.inv.indexOf(id),1);while(Items.worn(b,id)>Items.own(b,id))delete b.eq[Object.keys(b.eq).find(k=>b.eq[k]===id)]}return true},
 /* compra/venta con el mercado vivo (economy.js): el precio depende de la oferta y la demanda en ese momento */
 buy(b,id,q){q=q||1;const it=Registry.items[id];if(!it||it.nosale)return'No está a la venta';const c=Eco.quote(id,q,'buy');if(b.kamas<c)return'Te faltan '+(c-b.kamas)+' kamas';
  if(Items.room(b,id)<q)return Items.stack(id)?'No caben más (máx. '+PROG.maxStack+')':'Inventario lleno';Items.give(b,id,q);b.kamas-=c;Eco.trade(id,q,'buy');return null},
 sell(b,id,q){q=q||1;const it=Registry.items[id];if(!it||Items.own(b,id)<q)return'No tienes tantos';const c=Eco.quote(id,q,'sell');Items.take(b,id,q);b.kamas+=c;Eco.trade(id,q,'sell');return null},
 /* ¿dónde cae este objeto? → monstruos con su % (por monstruo vencido) */
 sources(id){const o=[];for(const k in Registry.monsters){const m=Registry.monsters[k];for(const d of m.drops||[])if(d[0]===id)o.push({m,p:d[1],q:d[2]})}return o.sort((a,c)=>c.p-a.p)},
 setParts:s=>Object.values(Registry.items).filter(i=>i.set===s),
 /* equipa todas las piezas del set que tengas y cuyo nivel permitas; devuelve cuántas */
 equipSet(b,s){let n=0;for(const it of Items.setParts(s)){if(Items.own(b,it.id)<1||b.lvl<it.lvl||Object.values(b.eq).includes(it.id))continue;if(!Items.equip(b,it.id))n++}return n},
 /* CONSUMIBLES: los que llevas al combate (máx. PROG.carry de cada uno) y los que gastaste (spent) salen del inventario */
 carry(b){const o={};for(const id in b.res||{}){const it=Registry.items[id];if(it&&it.use)o[id]=Math.min(b.res[id],PROG.carry)}return o},
 spend(b,spent){for(const id in spent||{})Items.take(b,id,Math.min(spent[id],Items.own(b,id)))},
 useTxt(it){if(!it||!it.use)return'';const o=[];for(const f of it.use.fx){if(f.k==='hp')o.push('Cura '+Math.round(f.p*100)+' % de tu vida máx.');
  else if(f.k==='b')o.push(({pa:'PA',pm:'PM',pow:'Poder',res:'Resistencia %'})[f.s]+' '+(f.v>0?'+':'')+f.v+' ('+f.tn+' turno'+(f.tn>1?'s':'')+')');else if(f.k==='ar')o.push('Armadura '+f.a+'-'+f.b+' ('+f.tn+' t)')}
  return o.join(' · ')+' · cuesta '+it.use.pa+' PA'},
 /* honradez (PvP): lo equipado existe, va en su hueco, el nivel llega y se posee */
 ok(b){try{for(const s in b.eq||{}){const S=Items.slots().find(q=>q.id===s),it=Registry.items[b.eq[s]];if(!S||!it||it.kind!==S.kind||it.lvl>b.lvl)return false}
  return!b.eq||!Object.values(b.eq).some(id=>Items.worn(b,id)>Items.own(b,id))&&(b.inv||[]).length<=PROG.maxInv&&Object.entries(b.res||{}).every(([k,v])=>Registry.items[k]&&Number.isInteger(v)&&v>0&&v<=PROG.maxStack)}catch(e){return false}},
 /* rivales IA: lo mejor que existe para su nivel, para que sigan igualados con el jugador */
 auto(b){Items.init(b);const by={},used={};Object.values(Registry.items).filter(i=>i.lvl<=b.lvl&&Registry.kinds[i.kind].n>0).sort((x,y)=>y.lvl-x.lvl||y.price-x.price).forEach(i=>(by[i.kind]=by[i.kind]||[]).push(i));
  Items.slots().forEach(s=>{const i=(by[s.kind]||[])[used[s.kind]|0];if(i){used[s.kind]=(used[s.kind]|0)+1;b.inv.push(i.id);b.eq[s.id]=i.id}});return b}};
