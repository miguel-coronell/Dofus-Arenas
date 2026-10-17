/* progress.js · personaje del jugador ("build"): nivel hasta 200, XP, puntos de capital (vida/elementos) y de hechizo, set equipado.
   Todo es JSON simple → se guarda en localStorage y (PvP/online) puede ir a Firebase. Constantes de balance en PROG (rules.js). */
const PG={key:'coliseo.pj2',keyAll:'coliseo.chars',keySel:'coliseo.sel',
 uid:()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
 newBuild(name,cls,sex){const b={id:PG.uid(),look:LOOK.random(),name,cls,sex,lvl:1,xp:0,wins:0,losses:0,cap:PROG.capPerLv,sp:PROG.spStart,vit:0,pow:{tierra:0,fuego:0,agua:0,aire:0},spLv:{}};PG.learn(b);Items.init(b);return b},
 learn(b){const CL=Registry.classes[b.cls].spells;if(Object.keys(b.spLv).some(id=>!CL.includes(id))){b.spLv={};b.sp=(b.lvl-1)*PROG.spPerLv+PROG.spStart}   // partida con hechizos antiguos: se reinician los puntos de hechizo
  for(const id in b.spLv)while(b.spLv[id]>PROG.maxSpLv){b.sp+=b.spLv[id]-1;b.spLv[id]--}
  for(const id of Registry.classes[b.cls].spells)if(!b.spLv[id]&&Registry.spells[id].lvl<=b.lvl)b.spLv[id]=1},      // hechizos nuevos por nivel
 addXp(b,x){let up=0;if(b.lvl<PROG.maxLv){b.xp+=x;while(b.lvl<PROG.maxLv&&b.xp>=PROG.xpNeed(b.lvl)){b.xp-=PROG.xpNeed(b.lvl);b.lvl++;b.cap+=PROG.capPerLv;b.sp+=PROG.spPerLv;up++}if(b.lvl>=PROG.maxLv)b.xp=0}PG.learn(b);return up},
 canUp(b,id){const l=b.spLv[id];return!!l&&l<PROG.maxSpLv&&b.sp>=l&&b.lvl>=PROG.spReq[l]},          // ¿puede subir? (puntos + nivel de personaje)
 upSpell(b,id){if(!PG.canUp(b,id))return false;const l=b.spLv[id];b.sp-=l;b.spLv[id]=l+1;return true},   // subir de nivel un hechizo cuesta su nivel actual
 downSpell(b,id){const l=b.spLv[id];if(!l||l<2)return false;b.spLv[id]=l-1;b.sp+=l-1;return true},      // bajar un nivel devuelve los puntos gastados
 spend(b,stat,n){n=Math.min(n,b.cap);if(n<=0)return false;if(stat==='vit')b.vit+=n;else if(stat in b.pow)b.pow[stat]+=n;else return false;b.cap-=n;return true},
 respec(b){b.cap+=b.vit+ELS.reduce((a,e)=>a+b.pow[e],0);b.vit=0;ELS.forEach(e=>b.pow[e]=0);
  for(const id in b.spLv){for(let l=1;l<b.spLv[id];l++)b.sp+=l;b.spLv[id]=1}},
 /* botín de monstruos/mazmorras: defs con kamas:[min,max] y drops:[['id',prob,[min,max]?]] → suma kamas, mete objetos/recursos y devuelve {kamas,loot}.
    mul = multiplicador de probabilidad (los retos lo suben). Mazmorras futuras: llamar aquí con su propia tabla */
 reward(b,defs,mul){mul=mul||1;const R={kamas:0,loot:[]};for(const d of defs||[]){if(!d)continue;if(d.kamas)R.kamas+=rn(d.kamas[0],d.kamas[1]);
   for(const[id,p,q]of d.drops||[]){if(!Registry.items[id]||Math.random()>=Math.min(1,p*mul))continue;PG.loot(b,R,id,q?rn(q[0],q[1]):1)}}
  b.kamas+=R.kamas;return R},
 loot(b,R,id,n){const it=Registry.items[id],g=Items.give(b,id,n);if(!g)return;const x=R.loot.find(l=>l.id===id);x?x.q+=g:R.loot.push({id,ico:it.ico,n:it.n,q:g,set:!!it.set})},
 /* resultado de un combate (xm/km = bonus de retos, ej. .3 = +30 %): devuelve {xp,up,k,bx,bk} */
 result(b,won,foeLv,xm,km){const bx=won?PROG.xpWin(b.lvl,foeLv):PROG.xpLose(b.lvl,foeLv),bk=won?PROG.kamasWin(b.lvl,foeLv):PROG.kamasLose(b.lvl,foeLv),xp=Math.round(bx*(1+(xm||0))),k=Math.round(bk*(1+(km||0))),had=Object.keys(b.spLv);won?b.wins++:b.losses++;const up=PG.addXp(b,xp);b.kamas+=k;
  return{xp,up,k,bx,bk,unl:Object.keys(b.spLv).filter(id=>!had.includes(id))}},          // unl = hechizos recién desbloqueados
 /* CUENTA = los personajes guardados en este navegador (máx. PROG.maxChars). Se migra solo el personaje único de versiones antiguas */
 all(){let L=null,dirty=false;try{L=JSON.parse(localStorage.getItem(PG.keyAll)||'null')}catch(e){}
  if(!Array.isArray(L)){L=[];dirty=true;try{const o=JSON.parse(localStorage.getItem(PG.key)||'null');if(o)L=[o]}catch(e){}}
  L=L.filter(b=>b&&Registry.classes[b.cls]).slice(0,PROG.maxChars);
  L.forEach(b=>{if(!b.id){b.id=PG.uid();dirty=true}if(!b.look){b.look=LOOK.random();dirty=true}b.look=LOOK.fix(b.look);PG.learn(b);Items.init(b)});
  if(dirty&&L.length)try{localStorage.setItem(PG.keyAll,JSON.stringify(L))}catch(e){}return L},
 save(b){try{if(!b.id)b.id=PG.uid();const L=PG.all(),i=L.findIndex(c=>c.id===b.id);if(i>=0)L[i]=b;else if(L.length<PROG.maxChars)L.push(b);else return;localStorage.setItem(PG.keyAll,JSON.stringify(L));PG.setSel(b.id)}catch(e){}},
 del(id){try{localStorage.setItem(PG.keyAll,JSON.stringify(PG.all().filter(c=>c.id!==id)));if(PG.sel()===id)localStorage.removeItem(PG.keySel)}catch(e){}},
 sel(){try{return localStorage.getItem(PG.keySel)}catch(e){return null}},setSel(id){try{localStorage.setItem(PG.keySel,id)}catch(e){}},
 load(){const L=PG.all();return L.find(c=>c.id===PG.sel())||L[0]||null},
 /* build automática de un nivel dado (rival IA / pruebas): mitad vida, mitad elemento principal; puntos de hechizo repartidos por igual */
 auto(cls,L,name){const b=PG.newBuild(name||'Rival',cls,Math.random()<.5?'m':'f');b.lvl=L;PG.learn(b);b.cap=PROG.capPerLv*L;b.sp=L-1+PROG.spStart;b.wins=Math.floor(L/2);
  PG.spend(b,'vit',Math.floor(b.cap/2));PG.spend(b,Registry.classes[cls].el,b.cap);
  for(let g=0;g<999&&b.sp>0;g++){const ids=Object.keys(b.spLv).sort((a,c)=>b.spLv[a]-b.spLv[c]);if(!ids.some(id=>PG.upSpell(b,id)))break}
  Items.auto(b);return b}};
