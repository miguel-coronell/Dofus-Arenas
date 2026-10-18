/* rules.js · reglas PURAS del combate (sin DOM, sin Math.random). Todo el azar sale de S.r() con semilla común:
   los dos clientes de un PvP calculan EXACTAMENTE lo mismo, y la IA/pruebas usan el mismo código. S = G (combat.js). */
const PROG={maxLv:200,capPerLv:5,spPerLv:1,spStart:3,maxSpLv:6,spReq:[1,2,4,7,11,100],spBonus:.12,hp0:50,hpPerLv:5,powPer:.5,paBase:6,pmBase:3,   // ← balance: todo se ajusta aquí
 maxSum:L=>2+Math.min(2,Math.floor(L/60)),   // invocaciones simultáneas por jugador
 maxObj:8,                                   // trampas/glifos/bombas por tipo y jugador
 maxChars:5,                                 // personajes por cuenta
 turnSec:30,                                 // SEGUNDOS POR TURNO de los jugadores (0 = sin límite). A 0 el turno pasa solo
 itemLim:2,carry:5,                          // objetos usables por turno · cuántas unidades de cada consumible llevas al combate
 xpNeed:l=>40+12*l,
 xpWin:(l,o)=>Math.round((60+10*o)*clamp(1+(o-l)/20,.3,1.5)),xpLose:(l,o)=>Math.round(.25*(60+10*o))};
const ELS=['tierra','fuego','agua','aire'];
const Rules=(()=>{
 const seed=s=>{let a=s>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 const sum=(e,s)=>e.fx.reduce((a,f)=>a+(f.s===s?f.v:0),0);
 const P=(e,el)=>(e.pow[el]||0)+sum(e,'pow'), R=(e,el)=>clamp(clamp(e.res+sum(e,'res'),0,50)+((e.rel&&e.rel[el])||0),-50,50);      // poder del elemento · resistencia % (general + la del elemento: e.rel = {tierra,fuego,agua,aire}; negativa = debilidad; tope ±50)
 /* celdas del mapa (maps.js): kind 0 vacío · 1 suelo · 2 obstáculo bajo (agujero, agua, valla) · 3 obstáculo alto (tapa la vista) */
 const kind=(S,x,y)=>{const A=S.arena;return x<0||y<0||x>=A.w||y>=A.h?0:A.k[y*A.w+x]};
 const blocked=(S,x,y)=>kind(S,x,y)!==1;                         // solo se camina por suelo libre
 const opaque=(S,x,y)=>kind(S,x,y)===3;
 /* LÍNEA DE VISIÓN entre dos celdas: recorre la recta celda a celda; solo la tapan los obstáculos altos.
    Los personajes, monstruos e invocaciones NO la tapan. Al pasar justo por una esquina se deja pasar (como en Dofus). */
 function los(S,x0,y0,x1,y1){const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x1>x0?1:-1,sy=y1>y0?1:-1;let x=x0,y=y0,ix=0,iy=0;
  while(ix<dx||iy<dy){const d=(1+2*ix)*dy-(1+2*iy)*dx;if(d===0){x+=sx;y+=sy;ix++;iy++}else if(d<0){x+=sx;ix++}else{y+=sy;iy++}
   if((x!==x1||y!==y1)&&opaque(S,x,y))return false}
  return true}
 const occ=(S,x,y,ex)=>S.ents.find(e=>e.hp>0&&e!==ex&&e.x===x&&e.y===y);
 const objAt=(S,x,y)=>S.objs.find(o=>o.x===x&&o.y===y);
 const alive=(S,e)=>S.ents.filter(q=>q.sm&&q.owner===e.id&&q.hp>0);                          // invocaciones vivas de e
 const psrc=o=>({id:o.own,team:o.team,x:o.x,y:o.y,lvl:o.lvl,hp:0,mhp:1,pow:o.pw,fx:[],ar:[],res:0,n:(Registry.objs[o.dk]||{}).n});   // "fuente" falsa para trampas/glifos/bombas (poder del dueño al colocarlos)
 /* build del jugador → estadísticas de combate */
 function stats(b){const s={},q=typeof Items!=='undefined'?Items.bonus(b):{},L=b.lvl,pow={};          // q = bonos del equipo (items.js)
  ELS.forEach(e=>pow[e]=Math.floor(((b.pow[e]||0)+(q[e]||0))*PROG.powPer)+(s.pow||0)+(q.pow||0));
  return{lvl:L,mhp:PROG.hp0+PROG.hpPerLv*L+b.vit+(s.vit||0)+(q.vit||0),pa:PROG.paBase+(L>=100?1:0)+(s.pa||0)+(q.pa||0),pm:PROG.pmBase+(s.pm||0)+(q.pm||0),pow,res:(s.res||0)+(q.res||0),rel:{tierra:q.rtierra||0,fuego:q.rfuego||0,agua:q.ragua||0,aire:q.raire||0},
   sp:Registry.classes[b.cls].spells.filter(id=>b.spLv[id]).map(id=>({id,lv:b.spLv[id]}))}}
 const ent=(id,n,team,x,y,c)=>({id,n,team,x,y,lvl:c.lvl||1,hp:c.mhp,mhp:c.mhp,bpa:c.pa,bpm:c.pm,pa:c.pa,pm:c.pm,pow:c.pow,res:c.res||0,rel:c.rel||{},sp:c.sp,fx:[],ar:[],dots:[],cd:{},used:{},sm:false,owner:null,items:{},iu:0,spent:{}});
 const ready=(e,sp)=>e.hp<=0?'KO':e.pa<sp.pa?'PA insuficientes':e.cd[sp.id]>0?'En recarga ('+e.cd[sp.id]+')':(e.used[sp.id]||0)>=sp.lim?'Máximo '+sp.lim+' lanzamientos por turno':null;
 function can(S,e,sp,x,y){const r=ready(e,sp);if(r)return r;if(sp.tg==='s')return null;
  const d=Math.abs(x-e.x)+Math.abs(y-e.y);if(d<sp.r[0]||d>sp.r[1])return'Fuera de alcance';
  if(!sp.nlos&&!los(S,e.x,e.y,x,y))return'Sin línea de visión';                     // un obstáculo alto tapa la vista (los personajes no)
  if(sp.tg==='c'){if(blocked(S,x,y)||occ(S,x,y)||objAt(S,x,y))return'Celda no disponible';
   const m=sp.e.find(f=>f.k==='sm');if(m){const D=Registry.objs[m.o];if(!D.nc&&alive(S,e).filter(q=>!Registry.objs[q.dk].nc).length>=PROG.maxSum(e.lvl))return'Máximo de invocaciones ('+PROG.maxSum(e.lvl)+')'}return null}
  const t=occ(S,x,y);if(sp.tg==='a')return t&&t.team===e.team?null:'Necesitas un aliado como objetivo';
  if(!t||t.team===e.team)return'Necesitas un enemigo como objetivo';if(sum(t,'inv')>0&&d>1)return'Objetivo invisible (solo a 1 casilla)';return null}
 const range=(S,e,sp)=>{const o=[];if(sp.tg!=='s')for(let x=0;x<S.arena.w;x++)for(let y=0;y<S.arena.h;y++){const d=Math.abs(x-e.x)+Math.abs(y-e.y);if(d>=sp.r[0]&&d<=sp.r[1]&&kind(S,x,y)===1&&(sp.nlos||los(S,e.x,e.y,x,y)))o.push([x,y])}return o};   // solo las celdas que ve (azul/naranja en pantalla)

 const credit=(S,src,k,v)=>{const w=v>0&&S.ents.find(q=>q.id===(src.sm?src.owner:src.id));if(w)w[k]=(w[k]||0)+v};   // estadísticas para la ventana de resultado
 /* si muere un personaje, desaparecen sus invocaciones */
 function died(S,t,ev){if(t.sm)return;for(const q of S.ents)if(q.sm&&q.owner===t.id&&q.hp>0){q.hp=0;ev.push({t:'kill',id:q.id})}}
 /* daño: raw ya incluye azar, nivel de hechizo y poder · aquí resistencia → armadura → vida (el robo de vida de una invocación cura a su dueño) */
 function hit(S,src,t,el,raw,ev,ls){const v=Math.round(raw*(1-R(t,el)/100));let ab=0;
  for(const A of t.ar){const u=Math.min(A.v,v-ab);A.v-=u;ab+=u}t.ar=t.ar.filter(A=>A.v>0);
  const d=v-ab;t.hp=Math.max(0,t.hp-d);ev.push({t:'dmg',id:t.id,v:d,ab,el});credit(S,src,'dd',d);t.dt=(t.dt||0)+d;
  if(ls&&d>0&&src.hp>0){const hs=src.sm?(S.ents.find(q=>q.id===src.owner&&q.hp>0)||src):src,h=Math.min(hs.mhp-hs.hp,Math.round(d*ls));if(h>0){hs.hp+=h;ev.push({t:'heal',id:hs.id,v:h});credit(S,src,'hl',h)}}
  if(t.hp<=0)died(S,t,ev)}
 function shove(S,src,t,n,ev){const dx=t.x-src.x,dy=t.y-src.y;let sx=0,sy=0;if(Math.abs(dx)>=Math.abs(dy))sx=Math.sign(dx)||1;else sy=Math.sign(dy);if(n<0){sx=-sx;sy=-sy}
  let k=Math.abs(n),x=t.x,y=t.y;for(;k>0;k--){const nx=x+sx,ny=y+sy;if(blocked(S,nx,ny)||occ(S,nx,ny,t))break;x=nx;y=ny}
  if(x!==t.x||y!==t.y){ev.push({t:'move',id:t.id,x,y});t.x=x;t.y=y}
  if(k>0&&n>0)hit(S,src,t,'neutro',k*(6+Math.ceil(src.lvl/4)),ev)}          // choque contra obstáculo/enemigo: daño por casilla sobrante
 /* UN efecto sobre UN objetivo ya elegido (z = azar × nivel de hechizo · late = efecto aplicado al inicio de turno del objetivo) */
 const tg=(S,e)=>({bi:e.id,by:e.n,sn:S.csp?S.csp.n:null});          // origen del estado: quién lo puso y con qué hechizo (lo muestra la tarjeta del personaje)
 function fx1(S,e,g,f,z,ev,late){
  if(f.k==='d')hit(S,e,g,f.el,z(f)*(1+P(e,f.el)/100),ev,f.ls);
  else if(f.k==='h'){const v=Math.round(z(f)*(1+P(e,f.el||'agua')/100));const b4=g.hp;g.hp=Math.min(g.mhp,g.hp+v);ev.push({t:'heal',id:g.id,v});credit(S,e,'hl',g.hp-b4)}
  else if(f.k==='ar'){const v=Math.round(z(f)*(1+P(e,f.el)/100));g.ar.push({v,tn:f.tn,...tg(S,e)});ev.push({t:'ar',id:g.id,v})}
  else if(f.k==='b'){g.fx.push({s:f.s,v:f.v,tn:f.tn+(g===e||late?0:1),...tg(S,e)});if((g===e||g===S.cur)&&(f.s==='pa'||f.s==='pm'))g[f.s]=Math.max(0,g[f.s]+f.v);ev.push({t:'buff',id:g.id,s:f.s,v:f.v})}
  else if(f.k==='dot'){g.dots.push({el:f.el,v:Math.round(z(f)*(1+P(e,f.el)/100)),tn:f.tn,...tg(S,e)});ev.push({t:'dot',id:g.id})}
  else if(f.k==='push')shove(S,e,g,f.n,ev);
  else if(f.k==='dp'){g.fx=g.fx.filter(q=>q.v<=0);g.ar=[];ev.push({t:'buff',id:g.id,s:'dp',v:0})}}       // desembruja: quita bonus y armaduras
 function applyList(S,src,g,effs,lv,ev,late){const k=1+(lv-1)*PROG.spBonus,z=f=>S.r(f.a,f.b)*k;for(const f of effs){if(g.hp<=0)break;fx1(S,src,g,f,z,ev,late)}}
 /* efectos en zona (manhattan ≤ r del centro) · to: 'enemy' | 'ally' | 'all' */
 function fire(S,src,cx,cy,r,effs,lv,ev,to,late){for(const g of S.ents.slice()){if(g.hp<=0||Math.abs(g.x-cx)+Math.abs(g.y-cy)>r)continue;
   if(to==='enemy'&&g.team===src.team)continue;if(to==='ally'&&g.team!==src.team)continue;applyList(S,src,g,effs,lv,ev,late)}}
 /* ---- objetos del mapa: trampas (invisibles para el rival, saltan al pisarlas), glifos (zona durante N turnos), bombas (estallan a los N turnos o con Detonador) ---- */
 function explode(S,o,ev){S.objs=S.objs.filter(q=>q!==o);const d=Registry.objs[o.dk];ev.push({t:'boom',x:o.x,y:o.y,r:d.r,el:d.el},{t:'objdel',o:o.id});fire(S,psrc(o),o.x,o.y,d.r,d.fx,o.lv,ev,'all')}
 function place(S,e,dk,x,y,lv,ev){const d=Registry.objs[dk],mine=S.objs.filter(o=>o.own===e.id&&o.dk===dk);
  if(mine.length>=PROG.maxObj){S.objs=S.objs.filter(o=>o!==mine[0]);ev.push({t:'objdel',o:mine[0].id})}                      // supera el máximo: se retira la más antigua
  S.objs.push({id:++S.oid,dk,kind:d.kind,x,y,team:e.team,own:e.id,lv,tn:d.tn||99,lvl:e.lvl,pw:Object.fromEntries(ELS.map(el=>[el,P(e,el)]))});ev.push({t:'obj',o:S.oid})}
 function land(S,q){const ev=[];if(q.hp<=0)return ev;const o=S.objs.find(o=>o.kind==='trap'&&o.x===q.x&&o.y===q.y);if(o)explode(S,o,ev);return ev}   // ¿ha caído en una trampa?
 function detonate(S,e,ev){for(const o of S.objs.filter(o=>o.own===e.id&&o.kind==='bomb'))explode(S,o,ev)}
 /* ---- invocaciones: entidades con turno propio (IA en combat.js · sai) ---- */
 function summon(S,e,dk,x,y,lv,ev){const d=Registry.objs[dk];
  if(d.max){const same=S.ents.filter(q=>q.sm&&q.owner===e.id&&q.dk===dk&&q.hp>0);if(same.length>=d.max){same[0].hp=0;ev.push({t:'kill',id:same[0].id})}}   // máx. del mismo tipo (torretas, árboles): reemplaza la más antigua
  const L=e.lvl,hp=Math.max(10,Math.round(d.hpO?e.mhp*d.hpO:d.hp[0]+d.hp[1]*L)),pow=Object.fromEntries(ELS.map(el=>[el,Math.floor(L*1.2+(e.pow[el]||0)*.6)]));
  const q=ent(S.ents.reduce((a,z)=>Math.max(a,z.id),0)+1,d.n,e.team,x,y,{lvl:L,mhp:hp,pa:d.pa||6,pm:d.pm==null?3:d.pm,pow,res:d.res||0,sp:(d.sp||[]).map(id=>({id,lv}))});
  Object.assign(q,{sm:true,owner:e.id,dk,ctl:'ai',slv:lv,evo:1});S.ents.splice(S.ents.indexOf(e)+1,0,q);       // juega justo después de su dueño
  if(S.onSummon)S.onSummon(q,d);ev.push({t:'sum',id:q.id})}
 function evolve(S,e,ev){for(const q of alive(S,e)){const d=Registry.objs[q.dk];if(!d.tur||q.evo>=3)continue;q.evo++;q.sp.forEach(c=>c.lv+=2);q.mhp=Math.round(q.mhp*1.25);q.hp=Math.round(q.hp*1.25);q.n=d.n+' '+['I','II','III'][q.evo-1];ev.push({t:'buff',id:q.id,s:'evo',v:q.evo})}}
 function cast(S,e,i,x,y){const c=e.sp[i],sp=Registry.spells[c.id],ev=[],t=sp.tg==='s'?e:sp.tg==='c'?null:occ(S,x,y),k=1+(c.lv-1)*PROG.spBonus,z=f=>S.r(f.a,f.b)*k;
  S.csp=sp;e.pa-=sp.pa;e.used[sp.id]=(e.used[sp.id]||0)+1;if(sp.cd)e.cd[sp.id]=sp.cd;
  const cx=sp.tg==='s'?e.x:x,cy=sp.tg==='s'?e.y:y,area=sp.aoe!=null?S.ents.filter(q=>q.hp>0&&q!==e&&(sp.at==='all'||q.team!==e.team)&&Math.abs(q.x-cx)+Math.abs(q.y-cy)<=sp.aoe):null;
  if(sp.aoe!=null)ev.push({t:'boom',x:cx,y:cy,r:sp.aoe,el:(sp.e.find(f=>f.el)||{}).el});
  for(const f of sp.e){
   if(f.k==='tp'){ev.push({t:'move',id:e.id,x,y});e.x=x;e.y=y;continue}
   if(f.k==='sm'){summon(S,e,f.o,x,y,c.lv,ev);continue}
   if(f.k==='ob'){place(S,e,f.o,x,y,c.lv,ev);continue}
   if(f.k==='det'){detonate(S,e,ev);continue}
   if(f.k==='evo'){evolve(S,e,ev);continue}
   if(f.k==='die'){e.hp=0;ev.push({t:'kill',id:e.id});continue}
   if(f.k==='sw'){if(t&&t!==e&&t.hp>0){const a=[e.x,e.y];ev.push({t:'move',id:e.id,x:t.x,y:t.y},{t:'move',id:t.id,x:a[0],y:a[1]});e.x=t.x;e.y=t.y;t.x=a[0];t.y=a[1]}continue}
   const self=f.on==='s'||((f.k==='h'||f.k==='ar')&&sp.tg!=='a'),gs=area&&!self?area:[self?e:t];
   for(const g of gs){if(g&&g.hp>0)fx1(S,e,g,f,z,ev)}}
  S.csp=null;let n=0,l;do{l=[];for(const q of S.ents)l.push(...land(S,q));ev.push(...l)}while(l.length&&++n<3);     // trampas pisadas por teletransporte, empuje, intercambio…
  return ev}
 /* ---- OBJETOS de combate (consumibles): cuestan PA, máx. PROG.itemLim por turno. it.use={pa, fx:[{k:'hp',p:.25} | {k:'b',s,v,tn} | {k:'ar',a,b,el,tn}]} ---- */
 const usable=(S,e,id)=>{const it=Registry.items[id];if(!it||!it.use)return'No se puede usar';if(e.hp<=0)return'KO';if(!(e.items[id]>0))return'No te quedan';
  if(e.pa<it.use.pa)return'PA insuficientes';if(e.iu>=PROG.itemLim)return'Máximo '+PROG.itemLim+' objetos por turno';return null};
 function useItem(S,e,id){const it=Registry.items[id],ev=[];e.pa-=it.use.pa;e.items[id]--;e.iu++;e.spent[id]=(e.spent[id]||0)+1;S.csp={n:it.n};
  for(const f of it.use.fx){if(f.k==='hp'){const v=Math.min(e.mhp-e.hp,Math.round(e.mhp*f.p));if(v>0){e.hp+=v;ev.push({t:'heal',id:e.id,v});credit(S,e,'hl',v)}}
   else fx1(S,e,e,f,g=>S.r(g.a||0,g.b||0),ev)}
  S.csp=null;return ev}
 /* inicio del turno de e: veneno → caducan efectos → recargas → glifos/bombas/auras → PA/PM */
 function begin(S,e){S.csp=null;const ev=[],Z={hp:0,pow:{}};for(const d of e.dots)hit(S,Z,e,d.el,d.v,ev);
  e.dots.forEach(d=>d.tn--);e.dots=e.dots.filter(d=>d.tn>0);e.fx.forEach(f=>f.tn--);e.fx=e.fx.filter(f=>f.tn>0);e.ar.forEach(a=>a.tn--);e.ar=e.ar.filter(a=>a.tn>0);
  for(const k in e.cd)if(e.cd[k]>0)e.cd[k]--;e.used={};e.iu=0;
  if(e.hp>0){
   for(const o of S.objs.filter(o=>o.own===e.id&&(o.kind==='glyph'||o.kind==='bomb'))){o.tn--;if(o.tn<=0){if(o.kind==='bomb')explode(S,o,ev);else{S.objs=S.objs.filter(q=>q!==o);ev.push({t:'objdel',o:o.id})}}}
   for(const o of S.objs.filter(o=>o.kind==='glyph'&&o.team!==e.team)){const d=Registry.objs[o.dk];if(e.hp>0&&Math.abs(e.x-o.x)+Math.abs(e.y-o.y)<=d.r){ev.push({t:'glow',x:o.x,y:o.y});applyList(S,psrc(o),e,d.fx,o.lv,ev,true)}}
   if(e.sm)for(const a of Registry.objs[e.dk].aura||[]){if(e.hp<=0)break;if(a.to==='self')applyList(S,e,e,a.fx,e.slv||1,ev,true);else fire(S,e,e.x,e.y,a.r,a.fx,e.slv||1,ev,a.to,true)}}
  e.pa=Math.max(0,e.bpa+sum(e,'pa'));e.pm=Math.max(0,e.bpm+sum(e,'pm'));return ev}
 const win=S=>{const A=S.ents.filter(e=>!e.sm),t=[...new Set(A.map(e=>e.team))].filter(t=>A.some(e=>e.team===t&&e.hp>0));return t.length===1?t[0]:t.length?null:-1};   // equipo ganador (las invocaciones no cuentan) · -1 empate · null sigue
 function describe(sp,lv){const k=1+(lv-1)*PROG.spBonus,f=(a,b)=>Math.round(a*k)+'-'+Math.round(b*k),o=[];
  for(const x of sp.e){if(x.k==='d')o.push((x.on==='s'?'Te hiere ':'Daño ')+x.el+' '+f(x.a,x.b)+(x.ls?' (roba vida)':''));else if(x.k==='h')o.push('Cura '+f(x.a,x.b));
   else if(x.k==='ar')o.push('Armadura '+f(x.a,x.b)+' ('+x.tn+'t)');
   else if(x.k==='b')o.push((x.on==='t'?'Rival ':'')+({pa:'PA',pm:'PM',pow:'Poder',res:'Resist.%',inv:'Invisible'})[x.s]+(x.s==='inv'?'':' '+(x.v>0?'+':'')+x.v)+' ('+x.tn+'t)');
   else if(x.k==='dot')o.push('Veneno '+x.el+' '+f(x.a,x.b)+' x'+x.tn);else if(x.k==='push')o.push(x.n>0?'Empuja '+x.n:'Atrae '+(-x.n));
   else if(x.k==='tp')o.push('Teletransporte');else if(x.k==='sw')o.push('Intercambia posición')
   else if(x.k==='sm'||x.k==='ob'){const q=Registry.objs[x.o];o.push((x.k==='sm'?'Invoca ':q.kind==='trap'?'Coloca la trampa ':q.kind==='bomb'?'Coloca la bomba ':'Coloca el glifo ')+q.n+': '+q.d)}
   else if(x.k==='det')o.push('Detona todas tus bombas');else if(x.k==='evo')o.push('Evoluciona tus torretas (máx. nivel III)');else if(x.k==='dp')o.push('Desembruja (quita bonus y armaduras)');else if(x.k==='die')o.push('Se sacrifica')}
  return o.join(' · ')+' | '+sp.pa+' PA · alcance '+(sp.tg==='s'?'propio':sp.r[0]+'-'+sp.r[1])+(sp.aoe!=null?' · zona '+sp.aoe:'')+(sp.cd?' · recarga '+sp.cd:'')+' · máx '+sp.lim+'/turno'+(sp.nlos?' · sin línea de visión':'')}
/* PREVISIÓN del hechizo (no usa el azar ni cambia nada): qué haría el hechizo de nivel lv lanzado por e sobre la celda (x,y).
    Devuelve una fila por personaje afectado: {e, lo, hi (daño mínimo-máximo ya con resistencias y armadura, tope = su vida), hl, hh (cura), dot (veneno por turno), kill (podría morir), sure (morirá seguro)}. Misma cuenta que fx1/hit. */
 function preview(S,e,sp,lv,x,y){const k=1+(lv-1)*PROG.spBonus,t=sp.tg==='s'?e:sp.tg==='c'?null:occ(S,x,y),cx=sp.tg==='s'?e.x:x,cy=sp.tg==='s'?e.y:y,M=new Map(),
   area=sp.aoe!=null?S.ents.filter(q=>q.hp>0&&q!==e&&(sp.at==='all'||q.team!==e.team)&&Math.abs(q.x-cx)+Math.abs(q.y-cy)<=sp.aoe):null;
  for(const f of sp.e){if(f.k!=='d'&&f.k!=='h'&&f.k!=='dot')continue;const self=f.on==='s'||(f.k==='h'&&sp.tg!=='a'),gs=area&&!self?area:[self?e:t];
   for(const g of gs){if(!g||g.hp<=0)continue;let o=M.get(g);if(!o)M.set(g,o={e:g,lo:0,hi:0,hl:0,hh:0,dot:null,kill:false,sure:false});
    if(f.k==='d'){const m=(1+P(e,f.el)/100)*(1-R(g,f.el)/100);o.lo+=Math.round(f.a*k*m);o.hi+=Math.round(f.b*k*m)}
    else if(f.k==='h'){const m=1+P(e,f.el||'agua')/100;o.hl+=Math.round(f.a*k*m);o.hh+=Math.round(f.b*k*m)}
    else{const m=1+P(e,f.el)/100,q=1-R(g,f.el)/100;o.dot={el:f.el,lo:Math.round(Math.round(f.a*k*m)*q),hi:Math.round(Math.round(f.b*k*m)*q),tn:f.tn}}}}
  return[...M.values()].map(o=>{const g=o.e,ar=g.ar.reduce((s,a)=>s+a.v,0);o.lo=Math.min(g.hp,Math.max(0,o.lo-ar));o.hi=Math.min(g.hp,Math.max(0,o.hi-ar));o.hl=Math.min(g.mhp-g.hp,o.hl);o.hh=Math.min(g.mhp-g.hp,o.hh);
   o.kill=o.hi>0&&o.hi>=g.hp;o.sure=o.lo>0&&o.lo>=g.hp;return o})}
 const init=(S,sd)=>{S.rnd=seed(sd);S.objs=[];S.oid=0;S.r=(a,b)=>a+Math.floor(S.rnd()*(b-a+1))};
 return{init,stats,ent,ready,can,range,preview,cast,begin,win,describe,P,R,blocked,occ,land,alive,objAt,kind,opaque,los,usable,useItem}})();
