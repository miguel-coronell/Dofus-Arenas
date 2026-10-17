/* jobs.js · OFICIOS: cada jugador sube sus oficios fabricando. Una RECETA convierte recursos (que sueltan los monstruos) + kamas en un objeto
   (piezas de set, equipo común, consumibles). Los datos (oficios y recetas) están en js/data/crafts.js; aquí solo el motor, sin pantalla.
   Build: b.jobs = {oficio:{lv,xp}} · b.crafted = {receta:veces} (la primera vez de cada receta da XP triple). Balance: PROG.job */
Registry.jobs={};Registry.recipes={};
Object.assign(PROG,{job:{max:100,xpNeed:l=>20+4*l,gain:it=>20+6*it.lvl,first:3,fee:.1}});   // gain = XP de oficio por objeto fabricado · fee = coste en kamas (fracción del precio base)
const JOB=(id,n,ico,kinds,d)=>Registry.jobs[id]={id,n,ico,kinds,d};
/* RECIPE(objeto_que_se_crea, oficio, nivel_de_oficio_necesario, [[recurso,cantidad],…], kamas?) */
const RECIPE=(id,job,need,ing,fee)=>{const it=Registry.items[id];if(!it||!Registry.jobs[job])return;Registry.recipes[id]={id,job,need,ing,fee:fee==null?Math.round(it.price*PROG.job.fee):fee}};
const Jobs={
 init(b){if(!b.jobs||typeof b.jobs!=='object'||Array.isArray(b.jobs))b.jobs={};
  for(const j in Registry.jobs){const o=b.jobs[j]&&typeof b.jobs[j]==='object'?b.jobs[j]:b.jobs[j]={};o.lv=clamp(Math.floor(o.lv)||1,1,PROG.job.max);o.xp=Math.max(0,Math.floor(o.xp)||0)}
  if(!b.crafted||typeof b.crafted!=='object'||Array.isArray(b.crafted))b.crafted={};return b},
 lv:(b,j)=>(b.jobs[j]||{lv:1}).lv,
 list:j=>Object.values(Registry.recipes).filter(r=>r.job===j).sort((a,c)=>a.need-c.need||Registry.items[a.id].lvl-Registry.items[c.id].lvl),
 /* ¿cuántas unidades puede fabricar ahora? (por recursos, kamas y sitio) */
 max(b,r){const it=Registry.items[r.id];let m=PROG.maxStack;for(const[id,n]of r.ing)m=Math.min(m,Math.floor(Items.own(b,id)/n));if(r.fee)m=Math.min(m,Math.floor(b.kamas/r.fee));return Math.max(0,Math.min(m,Items.room(b,r.id)))},
 can(b,r,q){q=q||1;if(!r)return'Receta desconocida';if(Jobs.lv(b,r.job)<r.need)return'Necesitas '+Registry.jobs[r.job].n+' nivel '+r.need;
  for(const[id,n]of r.ing)if(Items.own(b,id)<n*q)return'Te faltan '+Registry.items[id].n;if(b.kamas<r.fee*q)return'Te faltan '+(r.fee*q-b.kamas)+' kamas';
  if(Items.room(b,r.id)<q)return'Inventario lleno';return null},
 /* fabrica q unidades: gasta recursos y kamas, da el objeto y XP de oficio. Devuelve {err} o {q,xp,up,lv} */
 craft(b,id,q){q=Math.max(1,q|0);const r=Registry.recipes[id],err=Jobs.can(b,r,q);if(err)return{err};
  for(const[i,n]of r.ing)Items.take(b,i,n*q);b.kamas-=r.fee*q;Items.give(b,id,q);
  const it=Registry.items[id],J=b.jobs[r.job],first=!b.crafted[id];b.crafted[id]=(b.crafted[id]|0)+q;
  let xp=PROG.job.gain(it)*q*(first?PROG.job.first:1),up=0;if(J.lv>=PROG.job.max)xp=0;else{J.xp+=xp;while(J.lv<PROG.job.max&&J.xp>=PROG.job.xpNeed(J.lv)){J.xp-=PROG.job.xpNeed(J.lv);J.lv++;up++}if(J.lv>=PROG.job.max)J.xp=0}
  return{q,xp,up,lv:J.lv,first}}};
