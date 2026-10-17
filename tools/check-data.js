/* node tools/check-data.js → revisa que el catálogo esté bien: objetos, sets, recetas, drops de monstruos, mazmorras y estadísticas conocidas */
const fs=require('fs'),vm=require('vm');const R=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
const files=['js/core/util.js','js/game/maps.js','js/game/rules.js','js/data/spells/spells.js','js/data/objects.js','js/data/classes.js','js/game/items.js','js/data/items/base.js','js/data/items/extra.js','js/game/jobs.js','js/data/crafts.js','js/data/crafts_extra.js','js/data/dungeons.js','js/game/economy.js','js/data/monsters/monstruos.js','js/data/monsters/zonas_extra.js'];
const code=['globalThis.document={querySelector:()=>({})};',...files.map(R),'globalThis.api={Registry,STAT,Items,Rules,ELS,PROG}'].join('\n');
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
for(const S of Object.values(Registry.isets)){const ks=Object.keys(S.b).map(Number).sort((a,c)=>a-c);for(let i=1;i<ks.length;i++){const a=S.b[ks[i-1]],c=S.b[ks[i]];for(const k in a)if((c[k]||0)<a[k])err('set '+S.id+': el escalón '+ks[i]+' tiene menos '+k+' que el '+ks[i-1])}}
/* resistencias: daño con y sin resistencia */
const S={arena:{},ents:[],objs:[]};const mk=rel=>({id:1,n:'x',team:1,hp:1e6,mhp:1e6,res:0,rel,fx:[],ar:[],dots:[],lvl:1,pow:{}});
const t=mk({fuego:20,tierra:-30});const sh=(e)=>Rules.R(t,e);console.log('R fuego',sh('fuego'),'tierra',sh('tierra'),'agua',sh('agua'),'neutro',sh('neutro'));
if(sh('fuego')!==20||sh('tierra')!==-30||sh('agua')!==0)err('Rules.R mal');
/* stats de un jugador equipado con un set entero */
const b=ctx.api.Items&&{lvl:150,vit:0,pow:{tierra:0,fuego:0,agua:0,aire:0},cls:Object.keys(Registry.classes)[0],spLv:{},eq:{},inv:[],res:{}};
['celestial_sombrero','celestial_capa','celestial_amuleto','celestial_anillo','celestial_anillo2','celestial_cinto','celestial_botas','celestial_arma','celestial_escudo'].forEach(i=>b.inv.push(i));
const sl=Items.slots();const used={};for(const id of b.inv){const it=Registry.items[id];const s=sl.filter(q=>q.kind===it.kind)[used[it.kind]|0];used[it.kind]=(used[it.kind]|0)+1;b.eq[s.id]=id}
const st=Rules.stats(b);console.log('Celestial completo →',JSON.stringify({mhp:st.mhp,pa:st.pa,pm:st.pm,res:st.res,rel:st.rel}));
console.log(bad?('\n'+bad+' problema(s)'):'\nTodo correcto ✔');process.exit(bad?1:0);
