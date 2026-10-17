/* challenges.js · RETOS por combate (estilo «desafíos» de Dofus). En cada combate contra IA o monstruos salen 3 retos al azar (nunca dos del mismo grupo).
   Si ganas Y cumples un reto → bonus de XP, kamas y botín extra (recursos como cueros + más probabilidad de soltar piezas de set). Cuantas más ★, más premio.
   Para añadir un reto: UNA línea CHAL(...) abajo. fail(c) = true cuando ya no se puede cumplir (se marca ❌ en directo). late(c) = condición que solo se mira al terminar.
   c = {turns: turnos tuyos, casts: hechizos lanzados, moves: movimientos hechos, dt: daño recibido, mhp: vida máx., hl: curas/robo de vida}
   Premios y nº de retos por combate: PROG.chal (abajo). Todo el balance de retos está aquí. */
Object.assign(PROG,{chal:{
 n:3,                       // retos por combate
 xp:[0,.15,.30,.50],        // bonus de XP según ★ (0.30 = +30 % del XP del combate)
 kamas:[0,.10,.20,.35],     // bonus de kamas según ★
 rolls:[0,1,1,2],           // tiradas de recurso extra según ★ (cada una da 1-3 recursos de tu nivel)
 drop:.08}});               // cada ★ cumplida suma +8 % a la probabilidad de TODO el botín del combate (piezas de set incluidas)
Registry.challenges={};
const CHAL=(id,g,n,ico,stars,d,fail,late)=>Registry.challenges[id]={id,g,n,ico,stars,d,fail,late};
/*   id           grupo   nombre         ico  ★  descripción                                    fail(c)                    late(c) */
CHAL('relampago','tiempo','Relámpago','⚡',2,'Gana en 4 turnos o menos',c=>c.turns>4);
CHAL('fulminante','tiempo','Fulminante','🌩️',3,'Gana en 2 turnos o menos',c=>c.turns>2);
CHAL('aguanta','vida','Aguanta','🩹',1,'Pierde menos de la mitad de tu vida',c=>c.dt>=c.mhp*.5);
CHAL('intacto','vida','Intacto','🛡️',2,'Pierde menos del 20 % de tu vida',c=>c.dt>=c.mhp*.2);
CHAL('zen','mov','Zen','🧘',2,'No te muevas en todo el combate',c=>c.moves>0);
CHAL('activo','mov','Activo','🏃',1,'Muévete al menos 4 veces',()=>false,c=>c.moves<4);
CHAL('ahorrador','hech','Ahorrador','🎯',1,'Lanza 8 hechizos o menos',c=>c.casts>8);
CHAL('preciso','hech','Preciso','🏹',2,'Lanza 5 hechizos o menos',c=>c.casts>5);
CHAL('sincuras','cura','Sin curas','💔',1,'No te cures ni robes vida',c=>c.hl>0);

const Retos={
 pct:v=>'+'+Math.round(v*100)+'%',
 roll(){const L=Object.values(Registry.challenges).sort(()=>Math.random()-.5),used={},o=[];for(const c of L){if(used[c.g])continue;used[c.g]=1;o.push({id:c.id,dead:false});if(o.length>=PROG.chal.n)break}return o},
 start(mode){G.cs=0;G.mv=0;G.chalRes=null;G.chal=(mode==='ai'||mode==='mob')?Retos.roll():[];UI._rk=null},
 ctx(){const m=G.me;return{turns:G.mt,casts:G.cs||0,moves:G.mv||0,dt:m.dt||0,mhp:m.mhp,hl:m.hl||0}},
 /* en directo: marca ❌ los que ya no se pueden cumplir */
 live(){if(!G.chal||!G.chal.length||!G.me||G.over)return;const c=Retos.ctx();for(const r of G.chal){const d=Registry.challenges[r.id];if(!r.dead&&d.fail(c)){r.dead=true;UI.msg('❌ Reto fallado: '+d.n)}}},
 /* al terminar: qué retos se cumplieron y cuánto premio suman */
 eval(won){const c=Retos.ctx(),list=[];let xp=0,km=0,rolls=0,sum=0;
  for(const r of G.chal||[]){const d=Registry.challenges[r.id],ok=!!won&&!r.dead&&!d.fail(c)&&!(d.late&&d.late(c));list.push({id:d.id,n:d.n,ico:d.ico,stars:d.stars,d:d.d,ok});if(ok){xp+=PROG.chal.xp[d.stars];km+=PROG.chal.kamas[d.stars];rolls+=PROG.chal.rolls[d.stars];sum+=d.stars}}
  return{list,xp,km,rolls,drop:1+PROG.chal.drop*sum}},
 /* recursos extra de los retos cumplidos: de los 4 «tiers» más altos que tu nivel permite */
 loot(b,R,rolls){const pool=Object.values(Registry.items).filter(i=>i.kind==='recurso'&&i.lvl<=b.lvl).sort((a,c)=>c.lvl-a.lvl).slice(0,4);
  for(let i=0;i<rolls&&pool.length;i++)PG.loot(b,R,pool[rn(0,pool.length-1)].id,rn(1,3))},
 /* panel del combate (#retos): solo repinta si cambia algo */
 panel(){const el=document.getElementById('retos');if(!el)return;const L=G.chal||[];
  if(!L.length||(G.mode!=='ai'&&G.mode!=='mob')){if(!el.hidden){el.hidden=true;UI._rk=null}return}
  Retos.live();const fin=G.chalRes,key=L.map(r=>r.id+(r.dead?'x':'o')).join()+(fin?'|'+fin.list.map(x=>x.ok?1:0).join(''):''); if(key===UI._rk)return;UI._rk=key;el.hidden=false;
  el.innerHTML=`<b class="rt-h" title="Cumple retos y gana más XP, kamas y botín">🏅 Retos${fin?' · '+fin.list.filter(x=>x.ok).length+'/'+fin.list.length:''}</b>`+L.map((r,i)=>{const d=Registry.challenges[r.id],f=fin?fin.list[i]:null,st=f?(f.ok?'ok':'bad'):(r.dead?'bad':'wait');
   return`<div class="rt ${st}" title="${esc(d.d)} · ${Retos.pct(PROG.chal.xp[d.stars])} XP · ${Retos.pct(PROG.chal.kamas[d.stars])} kamas · botín extra"><span class="rt-i">${d.ico}</span><span class="rt-t"><b>${esc(d.n)}</b> <em>${'★'.repeat(d.stars)}</em><small>${esc(d.d)}</small></span><span class="rt-s">${st==='ok'?'✔':st==='bad'?'✖':'⏳'}</span></div>`}).join('')}};
