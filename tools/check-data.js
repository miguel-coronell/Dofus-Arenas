/* node tools/check-data.js → revisa que el catálogo esté bien: objetos, sets, recetas, drops de monstruos, mazmorras y estadísticas conocidas */
const fs=require('fs'),vm=require('vm');const R=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
const files=['js/core/util.js','js/game/maps.js','js/game/rules.js','js/data/spells/spells.js','js/data/objects.js','js/data/classes.js','js/game/items.js','js/game/instances.js','js/data/items/base.js','js/data/items/extra.js','js/game/jobs.js','js/data/crafts.js','js/data/crafts_extra.js','js/data/dungeons.js','js/game/economy.js','js/data/monsters/monstruos.js','js/data/monsters/zonas_extra.js','js/data/items/tienda.js'];
const code=['globalThis.document={querySelector:()=>({})};',...files.map(R),'globalThis.api={Registry,STAT,Items,Rules,ELS,PROG,Inst,ROLL,Eco}'].join('\n');
const ctx=vm.createContext({console,Math,Promise,Object,JSON,localStorage:{},setTimeout,globalThis:null});ctx.globalThis=ctx;vm.runInContext(code,ctx);
const {Registry,STAT,Items,Rules,ELS}=ctx.api;let bad=0;const err=m=>{bad++;console.log('✖',m)};
for(const it of Object.values(Registry.items))for(const k in it.st)if(!STAT[k])err('estadística desconocida '+k+' en '+it.id);
for(const it of Object.values(Registry.items))if(it.set&&!Registry.isets[it.set])err('set inexistente '+it.set+' en '+it.id);
for(const S of Object.values(Registry.isets)){const P=Items.setParts(S.id),by={};P.forEach(p=>by[p.kind]=(by[p.kind]||0)+1);
 for(const k in by){const n=Registry.kinds[k].n;if(by[k]>n)err('set '+S.id+' tiene '+by[k]+' piezas de '+k+' y solo hay '+n+' huecos')}
 const ks=Object.keys(S.b).map(Number);if(Math.max(...ks)>P.length)err('set '+S.id+': bono de '+Math.max(...ks)+' piezas pero solo tiene '+P.length);
 const lv=new Set(P.map(p=>p.lvl));if(lv.size>1)err('set '+S.id+' mezcla niveles '+[...lv]);
 for(const p of P)if(!Registry.recipes[p.id])err('sin receta: '+p.id);
 console.log('set',S.id.padEnd(9),'piezas',P.length,'nivel',[...lv][0],'bonos',ks.join('/'))}
for(const r of Object.values(Registry.recipes))for(const[i]of r.ing)if(!Registry.items[i])err('receta '+r.id+' usa recurso inexistente '+i);
const drop=new Set();for(const m of Object.values(Registry.monsters)){for(const d of m.drops||[]){if(!Registry.items[d[0]])err('drop inexistente '+d[0]+' en '+m.id);drop.add(d[0])}
 for(const e in m.resist||{})if(!ELS.includes(e))err('elemento raro '+e+' en '+m.id)}
for(const r of Object.values(Registry.recipes))for(const[i]of r.ing)if(!drop.has(i)&&!/^trofeo/.test(i))err('recurso que NINGÚN monstruo suelta: '+i+' (receta '+r.id+')');
for(const it of Object.values(Registry.items))if(it.kind==='recurso'&&!drop.has(it.id)&&!/^trofeo/.test(it.id))console.log('· recurso sin fuente:',it.id);
/* cada escalón de un set debe incluir al anterior (solo cuenta el más alto): ninguna estadística puede BAJAR al completar piezas */
/* los bonos de set se acumulan (Items.normSets los guarda como incrementos): un incremento negativo sobre una estadística que ya sumaba = el escalón total bajaría */
for(const S of Object.values(Registry.isets)){const ks=Object.keys(S.b).map(Number).sort((a,c)=>a-c),tot={};for(const n of ks){for(const k in S.b[n]){if(S.b[n][k]<0&&(tot[k]||0)>0)err('set '+S.id+': el escalón '+n+' tiene menos '+k+' que el anterior');tot[k]=(tot[k]||0)+S.b[n][k]}}}
/* resistencias: daño con y sin resistencia */
const S={arena:{},ents:[],objs:[]};const mk=rel=>({id:1,n:'x',team:1,hp:1e6,mhp:1e6,res:0,rel,fx:[],ar:[],dots:[],lvl:1,pow:{}});
const t=mk({fuego:20,tierra:-30});const sh=(e)=>Rules.R(t,e);console.log('R fuego',sh('fuego'),'tierra',sh('tierra'),'agua',sh('agua'),'neutro',sh('neutro'));
if(sh('fuego')!==20||sh('tierra')!==-30||sh('agua')!==0)err('Rules.R mal');
/* stats de un jugador equipado con un set entero */
const b=ctx.api.Items&&{lvl:150,vit:0,pow:{tierra:0,fuego:0,agua:0,aire:0},cls:Object.keys(Registry.classes)[0],spLv:{},eq:{},inv:[],res:{}};
['celestial_sombrero','celestial_capa','celestial_amuleto','celestial_anillo','celestial_anillo2','celestial_cinto','celestial_botas','celestial_arma','celestial_escudo'].forEach(i=>b.inv.push(i));
const sl=Items.slots();const used={};for(const id of b.inv){const it=Registry.items[id];const s=sl.filter(q=>q.kind===it.kind)[used[it.kind]|0];used[it.kind]=(used[it.kind]|0)+1;b.eq[s.id]=id}
const st=Rules.stats(b);console.log('Celestial completo →',JSON.stringify({mhp:st.mhp,pa:st.pa,pm:st.pm,res:st.res,rel:st.rel}));

/* ---- OBJETOS ÚNICOS: rangos, ejemplares, validez, mercado ---- */
{const {Inst,ROLL,Eco}=ctx.api;const gear=Object.values(Registry.items).filter(i=>Inst.vary(i));let n=0,sum={},cnt={};
 console.log('equipo con ejemplares únicos:',gear.length,'plantillas');
 for(const t of gear){const R=Inst.range(t);for(const k in t.st){if(!R[k])err('sin rango '+k+' en '+t.id);else if(R[k][0]>R[k][1])err('rango invertido '+k+' en '+t.id);else if(t.st[k]>0&&R[k][0]<1)err('rango llega a 0 o menos: '+k+' en '+t.id)}
  for(let i=0;i<30;i++){const id=Inst.roll(t.id),x=Registry.items[id];if(!x){err('ejemplar inválido recién tirado: '+id);break}
   if(Inst.base(id)!==t.id||x.base!==t.id)err('base mal en '+id);if(!(x.q>=0&&x.q<=1))err('calidad fuera de 0-1 en '+id);
   for(const k in x.st)if(x.st[k]<R[k][0]||x.st[k]>R[k][1])err('valor fuera de rango en '+id);
   for(const k of Object.keys(t.st))if(ROLL.fixed.includes(k)&&x.st[k]!==t.st[k])err('estadística fija cambió en '+id);
   for(const k of Inst.keys(t)){sum[k]=(sum[k]||0)+x.st[k]/t.st[k];cnt[k]=(cnt[k]||0)+1}n++}}
 const avg=Object.keys(sum).map(k=>sum[k]/cnt[k]);const mean=avg.reduce((a,c)=>a+c,0)/avg.length;
 console.log('media de las tiradas / valor base:',mean.toFixed(3),'(debe rondar 1)');if(Math.abs(mean-1)>.03)err('las tiradas se desvían del valor base ('+mean+'): el equipo cambiaría de balance');
 /* ids trucados: fuera de rango, claves en otro orden, de menos, de más, plantilla inexistente */
 const t0=gear[0],id0=Inst.roll(t0.id),R0=Inst.range(t0),ks=Inst.keys(t0);
 const bad=[Inst.mk(t0.id,Object.fromEntries(ks.map(k=>[k,R0[k][1]+1]))),Inst.mk(t0.id,Object.fromEntries(ks.map(k=>[k,R0[k][0]-1]))),t0.id+'@',t0.id+'@'+id0.split('@')[1]+',vit5','zzz@vit1',t0.id+'@'+id0.split('@')[1].split(',').reverse().join(',')];
 bad.forEach((x,i)=>{if(ks.length<2&&i===5)return;if(Registry.items[x])err('un id trucado se aceptó: '+x)});
 if(!(id0 in Registry.items))err('has() no ve un ejemplar válido');if(Object.keys(Registry.items).some(k=>k.includes('@')))err('los ejemplares no deben aparecer al listar Registry.items');
 /* inventario: dar, poseer, equipar, quitar */
 const sl=Items.slots().find(q=>q.kind===t0.kind),b2={lvl:200,kamas:1e6,inv:[],res:{},eq:{}};Items.init(b2);
 Items.give(b2,t0.id,3);if(b2.inv.length!==3||!b2.inv.every(x=>Inst.base(x)===t0.id))err('give no entrega ejemplares de la plantilla');
 if(Items.own(b2,t0.id)!==3)err('own(plantilla) no cuenta los ejemplares');if(Items.equip(b2,t0.id))err('equip(plantilla) falló');if(Items.worn(b2,t0.id)!==1)err('worn(plantilla) mal');
 const eqId=Object.values(b2.eq)[0];if(!Inst.is(eqId)&&Inst.vary(t0))err('se equipó una plantilla en vez de un ejemplar');if(!Items.ok(b2))err('Items.ok rechaza un equipo válido');
 Items.take(b2,eqId,1);if(Items.worn(b2,eqId)>Items.own(b2,eqId))err('take dejó equipado algo que ya no se tiene');
 const b3={lvl:200,kamas:0,inv:[t0.id+'@vit999'],res:{},eq:{}};if(Items.ok({...b3,eq:{[sl.id]:t0.id+'@vit999'},inv:[t0.id+'@vit999']}))err('Items.ok aceptó un ejemplar falso');
 Items.init(b3);if(b3.inv.length)err('Items.init no limpió un ejemplar falso');
 /* mercado: existencias de ejemplares, compra, demanda, reposición, venta */
 const shop=gear.find(x=>!x.nosale),B=shop.id;let P=Eco.pool(B);if(P.length<3)err('el mercado no creó existencias de '+B);
 const first=P[0],st0=P.length,d0=Eco.st(B).d||0,b4={lvl:200,kamas:1e6,inv:[],res:{},eq:{}};Items.init(b4);
 const e1=Items.buy(b4,first,1);if(e1)err('comprar un ejemplar falló: '+e1);if(!b4.inv.includes(first))err('el ejemplar comprado no llegó al inventario tal cual');
 if(Eco.pool(B).length!==st0-1)err('el ejemplar comprado no salió de las existencias');if((Eco.st(B).d||0)<=d0)err('comprar no subió la demanda');
 if(!Eco.pool(B).includes(first)&&!Items.buy(b4,first,1))err('se pudo comprar un ejemplar que ya no está a la venta');if(b4.kamas>=1e6)err('comprar no cobró');
 for(let i=0;i<40;i++)Eco.tick(1,true);if(Eco.pool(B).length<3)err('el mercado no repuso existencias con los tics');
 const hi=Eco.st(B);hi.d=4;const g1=Eco.goal(B,hi);hi.d=0;if(!(g1>Eco.goal(B,hi)))err('más demanda no sube el objetivo de existencias');
 const k0=b4.kamas,pr=Eco.sellPrice(first),L0=Eco.pool(B).length;if(Items.sell(b4,first,1))err('vender el ejemplar falló');if(b4.kamas!==k0+pr)err('venta cobrada mal');if(Eco.pool(B).length!==L0+1)err('lo vendido no entró en las existencias');
 const pa=Inst.roll(B),pb=Inst.roll(B,()=>0),pc=Inst.roll(B,()=>.999);if(Registry.items[pb].q>Registry.items[pc].q)err('calidad mal ordenada');if(Eco.price(pb)>=Eco.price(pc)&&Registry.items[pb].q<Registry.items[pc].q)err('un ejemplar peor no es más barato');
 console.log('precio peor / medio / mejor ejemplar de',B+':',Eco.price(pb),'/',Eco.price(B),'/',Eco.price(pc));
 console.log('existencias iniciales de',B+':',st0,'· objetivo:',Eco.goal(B,Eco.st(B)))}
console.log(bad?('\n'+bad+' problema(s)'):'\nTodo correcto ✔');process.exit(bad?1:0);
