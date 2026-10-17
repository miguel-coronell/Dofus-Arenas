/* main.js · arranque: canvas, zoom/arrastre, creador de personaje, UI y bucle de render */
const cv=$('#c'),ctx=cv.getContext('2d');let VW=800,VH=600,Z=1,dpr=1,OX=0,OY=0;
const V={zoom:1,fit:1,bx:0,by:0,hx:0,hy:0,moved:false};   // zoom del jugador · fit = escala que encaja el tablero · (bx,by) = posición en pantalla del centro del tablero
const camC=()=>{const A=G.arena;return A?[A.cx,(A.box.y0-CFG.spriteH+A.box.y1)/2]:[0,176]};   // centro del tablero (incluye el hueco de los personajes por encima)

/* ---------- vista: ajuste, zoom y arrastre (cada mapa tiene su tamaño: se encaja solo) ---------- */
function rs(){dpr=devicePixelRatio||1;const r=cv.getBoundingClientRect();VW=r.width;VH=r.height;cv.width=VW*dpr;cv.height=VH*dpr;
 const hudH=(typeof LAY!=='undefined'&&LAY.moved('#hud'))?0:($('#hud').offsetHeight||110),top=G.hub?30:64,bot=G.hub?30:hudH+22,av=Math.max(120,VH-top-bot),sH=CFG.spriteH,A=G.arena;
 document.documentElement.style.setProperty('--hud',hudH+'px');
 const bw=A?A.box.x1-A.box.x0+40:12*64+30,bh=A?A.box.y1-A.box.y0+sH+34:12*32+sH+40;
 V.fit=Math.min((VW-24)/bw,av/bh,1.8);                                       // el tablero entero cabe sobre el HUD
 V.hx=VW/2;V.hy=top+av/2;                                                    // posición "casa" (centrada)
 if(!V.moved){V.bx=V.hx;V.by=V.hy}apply()}
function apply(){V.bx=clamp(V.bx,0,VW);V.by=clamp(V.by,0,VH);Z=V.fit*V.zoom;const[cx,cy]=camC();OX=V.bx-cx*Z;OY=V.by-cy*Z;$('#zlbl').textContent=Math.round(V.zoom*100)+'%'}
function zoomAt(f,ax,ay){const nz=clamp(V.zoom*f,CFG.zoomMin,CFG.zoomMax),r=nz/V.zoom;V.bx=ax-(ax-V.bx)*r;V.by=ay-(ay-V.by)*r;V.zoom=nz;V.moved=true;apply()}
function fitView(){V.zoom=1;V.moved=false;V.bx=V.hx;V.by=V.hy;apply()}
addEventListener('resize',rs);new ResizeObserver(()=>rs()).observe($('#hud'));   // el HUD cambia de alto al crear los botones de hechizo
$('#zin').onclick=()=>zoomAt(1.25,VW/2,VH/2);$('#zout').onclick=()=>zoomAt(1/1.25,VW/2,VH/2);$('#zfit').onclick=fitView;
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.exp(-e.deltaY*.0015),e.offsetX,e.offsetY)},{passive:false});

const tile=(mx,my)=>{const a=(mx-OX)/Z/32,b=(my-OY)/Z/16;return[Math.round((a+b)/2),Math.round((b-a)/2)]};
const ptr=new Map();let pinched=false,pd=0;                 // punteros activos (1 = clic/arrastre, 2 = pellizco)
const mid=()=>{const p=[...ptr.values()];return[(p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)]};
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.offsetX,y:e.offsetY,sx:e.offsetX,sy:e.offsetY,drag:false});
 if(ptr.size===2){pinched=true;pd=mid()[2]}});
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||!ptr.size)G.hover=tile(e.offsetX,e.offsetY);const p=ptr.get(e.pointerId);if(!p)return;
 const dx=e.offsetX-p.x,dy=e.offsetY-p.y;p.x=e.offsetX;p.y=e.offsetY;
 if(ptr.size===2){const[mx,my,d]=mid();zoomAt(d/pd,mx,my);pd=d;V.bx+=dx/2;V.by+=dy/2;apply();return}
 if(!p.drag&&Math.hypot(p.x-p.sx,p.y-p.sy)>12)p.drag=true;if(p.drag&&!pinched){V.bx+=dx;V.by+=dy;V.moved=true;apply()}});
const endPtr=e=>{const p=ptr.get(e.pointerId);if(!p)return;ptr.delete(e.pointerId);
 if(e.type==='pointerup'&&!p.drag&&!pinched&&!ptr.size&&$('#create').hidden&&$('#pick').hidden)click(...tile(e.offsetX,e.offsetY));
 if(!ptr.size)pinched=false};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')G.hover=null});

addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||overlayOpen())return;
 if(G.hub&&(e.key==='e'||e.key==='E'||e.key==='Enter')&&Hub.near){Hub.open(Hub.near);return}
 if((e.key==='Enter'||e.key==='/')&&!overlay()){e.preventDefault();Chat.focus(e.key==='/'?'/':'');return}if(!G.hub&&e.key>='1'&&e.key<='9')UI.key(+e.key-1);if(e.code==='Space'){e.preventDefault();endTurn()}
 if(e.key==='Tab'){e.preventDefault();UI.bt=UI.bt==='sp'?'it':'sp';UI.slots()}
 if(e.key==='+'||e.key==='=')zoomAt(1.15,VW/2,VH/2);else if(e.key==='-'||e.key==='_')zoomAt(1/1.15,VW/2,VH/2);else if(e.key==='0')fitView()});
/* ---------- CUENTA: personajes guardados en este navegador (máx. PROG.maxChars) · carrusel para elegir y creador de personaje ---------- */
let PJ=PG.load(),SAVED=!!PJ;if(!PJ)PJ=PG.newBuild('Jugador','yopuka','m');       // build temporal hasta elegir/crear personaje (el combate de fondo)
const cleanName=s=>s.replace(/[^\p{L}\p{N} _.\-]/gu,'').replace(/\s+/g,' ').trim().slice(0,14);
const overlay=()=>!$('#pick').hidden||!$('#create').hidden;
/* figuras animadas (sprite recoloreado + anillo) de las tarjetas y del creador: un solo bucle mientras haya pantalla abierta */
let FIGS=[],figRaf=0;
function figLoop(t){FIGS.forEach(f=>f.cv.isConnected&&LOOK.figure(f.cv.getContext('2d'),f.cv.width,f.cv.height,f.cls,f.sex,f.look,t/1000));figRaf=overlay()?requestAnimationFrame(figLoop):0}
const figOn=()=>{if(!figRaf)figRaf=requestAnimationFrame(figLoop)};
const addFig=(cv,cls,sex,look)=>FIGS.push({cv,cls,sex,look});
const mkc=(cls,w,h)=>{const c=document.createElement('canvas');c.className=cls||'';c.width=w;c.height=h;return c};

/* ---- carrusel ---- */
let CH=[],PK=0,pkDrag=null,pkMoved=false;
const pkN=()=>CH.length+(CH.length<PROG.maxChars?1:0);
function pkBuild(){FIGS=[];const tr=$('#pktrack');tr.textContent='';
 CH.forEach((c,i)=>{const C=Registry.classes[c.cls],d=document.createElement('div');d.className='pk-card';d.dataset.i=i;const f=mkc('',210,250);d.appendChild(f);addFig(f,c.cls,c.sex,c.look);
  d.insertAdjacentHTML('beforeend',`<b class="pk-n">${esc(c.name)}</b><small>${C.ico} ${esc(C.n)} · Nv ${c.lvl}</small>`);
  const pf=mkc('pk-face',56,56);LOOK.portrait(pf,c.look,c.sex,c.cls);d.appendChild(pf);tr.appendChild(d)});
 if(CH.length<PROG.maxChars){const d=document.createElement('div');d.className='pk-card new';d.dataset.i=CH.length;d.innerHTML=`<div class="pk-plus">＋</div><b class="pk-n">Nuevo personaje</b><small>${CH.length} / ${PROG.maxChars}</small>`;tr.appendChild(d)}
 $('#pkdots').innerHTML=Array.from({length:pkN()},(_,i)=>'<i></i>').join('');pkGo(PK,true)}
function pkGo(i,now){PK=Math.max(0,Math.min(pkN()-1,i));const tr=$('#pktrack'),cards=[...tr.children],c=cards[PK];if(!c)return;
 if(now)tr.style.transition='none';tr.style.transform=`translateX(${$('#pkview').clientWidth/2-(c.offsetLeft+c.offsetWidth/2)}px)`;if(now){tr.offsetWidth;tr.style.transition=''}
 cards.forEach((d,j)=>d.classList.toggle('on',j===PK));[...$('#pkdots').children].forEach((d,j)=>d.classList.toggle('on',j===PK));
 $('#pkprev').disabled=PK===0;$('#pknext').disabled=PK>=pkN()-1;
 const ch=CH[PK],C=ch&&Registry.classes[ch.cls];$('#pkdel').hidden=$('#pkedit').hidden=!ch;$('#pkplay').textContent=ch?'▶ Jugar':'＋ Crear personaje';
 $('#pkinfo').innerHTML=ch?`<h3>${esc(ch.name)}</h3><div>${C.ico} ${esc(C.n)} · Nivel ${ch.lvl} · ${esc(C.role)}</div><div class="sm">🏆 ${ch.wins} victorias · ☠ ${ch.losses} derrotas</div>`:`<h3>Nuevo personaje</h3><div class="sm">Elige clase, cara, peinado y colores (${CH.length} de ${PROG.maxChars} ranuras usadas)</div>`}
function openPick(){CH=PG.all();if(!CH.length)return openCreator(null);const i=CH.findIndex(c=>c.id===PG.sel());PK=i<0?0:i;$('#create').hidden=true;$('#pick').hidden=false;G.paused=true;pkBuild();figOn()}
function closePick(){$('#pick').hidden=true;G.paused=false}
function pkPlay(){const ch=CH[PK];if(!ch)return openCreator(null);PJ=ch;SAVED=true;PG.setSel(ch.id);closePick();Hub.enter()}
$('#pkprev').onclick=()=>pkGo(PK-1);$('#pknext').onclick=()=>pkGo(PK+1);$('#pkplay').onclick=pkPlay;$('#pkedit').onclick=()=>CH[PK]&&openCreator(CH[PK]);
$('#pkdel').onclick=()=>{const ch=CH[PK];if(!ch||!confirm('¿Borrar a '+ch.name+' (Nv '+ch.lvl+')? No se puede deshacer.'))return;PG.del(ch.id);if(PJ.id===ch.id){SAVED=false;PJ=PG.newBuild('Jugador','yopuka','m')}CH=PG.all();if(!CH.length)return openCreator(null);PK=Math.min(PK,pkN()-1);pkBuild()};
$('#pktrack').addEventListener('click',e=>{if(pkMoved)return;const d=e.target.closest('.pk-card');if(!d)return;const i=+d.dataset.i;if(i===PK)pkPlay();else pkGo(i)});
$('#pkview').addEventListener('pointerdown',e=>{pkDrag=e.clientX;pkMoved=false});
addEventListener('pointerup',e=>{if(pkDrag==null)return;const dx=e.clientX-pkDrag;pkDrag=null;if(Math.abs(dx)>45){pkMoved=true;pkGo(PK+(dx<0?1:-1));setTimeout(()=>pkMoved=false,60)}});
$('#pkview').addEventListener('wheel',e=>{e.preventDefault();pkGo(PK+((e.deltaX||e.deltaY)>0?1:-1))},{passive:false});
addEventListener('keydown',e=>{if($('#pick').hidden)return;if(e.key==='ArrowLeft')pkGo(PK-1);else if(e.key==='ArrowRight')pkGo(PK+1);else if(e.key==='Enter')pkPlay()});

/* ---- creador (personaje nuevo) / apariencia (editar uno existente: la clase no se puede cambiar) ---- */
let CR=null;
const crOpt=(cv,label,sel,fn)=>{const b=document.createElement('button');b.type='button';b.className='opt'+(sel?' sel':'');b.appendChild(cv);if(label){const s=document.createElement('small');s.textContent=label;b.appendChild(s)}b.onclick=fn;return b};
const crSw=(css,title,sel,fn,orig)=>{const b=document.createElement('button');b.type='button';b.className='sw'+(sel?' sel':'')+(orig?' orig':'');if(!orig)b.style.background=css;b.title=title;b.onclick=fn;return b};
function openCreator(ch){CR={edit:ch,cls:ch?ch.cls:Object.keys(Registry.classes)[Math.floor(Math.random()*Object.keys(Registry.classes).length)],sex:ch?ch.sex:Math.random()<.5?'m':'f',look:ch?{...ch.look}:LOOK.random(),tab:'cls'};
 $('#nm').value=ch?ch.name:'';$('#crh').textContent=ch?'Apariencia de '+ch.name:'Crea tu personaje';$('#go').textContent='Aceptar';
 $('#cancel').hidden=!PG.all().length;                 // cuenta nueva: no hay carrusel al que volver
 $('#pick').hidden=true;$('#create').hidden=false;G.paused=true;crRender();figOn();setTimeout(()=>$('#nm').focus(),50)}
function crRender(){const{cls,sex,look,tab}=CR,C=Registry.classes[cls],P=$('#crpane');FIGS=[];addFig($('#crfig'),cls,sex,look);LOOK.portrait($('#crport'),look,sex,cls);
 $('#crinfo').textContent=C.ico+' '+C.n+' · '+C.role;document.querySelectorAll('#crtabs button').forEach(b=>b.classList.toggle('sel',b.dataset.tab===tab));P.textContent='';
 const set=(k,v)=>{CR.look[k]=v;crRender()},LK=LOOK.fix(look);
 if(tab==='cls'){const sx=document.createElement('div');sx.className='sx';[['m','♂ Masculino'],['f','♀ Femenino']].forEach(([v,t])=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.className=sex===v?'sel':'';b.onclick=()=>{CR.sex=v;crRender()};sx.appendChild(b)});P.appendChild(sx);
  if(CR.edit){const n=document.createElement('div');n.className='cr-note';n.textContent='La clase no se puede cambiar en un personaje ya creado (perderías su progreso). Crea otro personaje para probar otra clase.';P.appendChild(n)}
  const box=document.createElement('div');box.id='cards';for(const id in Registry.classes){const c=Registry.classes[id],b=document.createElement('button');b.type='button';b.className='card'+(id===cls?' sel':'')+(CR.edit&&id!==cls?' dis':'');
   const im=new Image();im.alt='';im.onerror=()=>{im.remove();const ic=document.createElement('span');ic.className='ico';ic.textContent=c.ico;b.prepend(ic)};im.src='assets/characters/'+id+'_'+sex+'.png';b.appendChild(im);
   b.insertAdjacentHTML('beforeend',`<b>${esc(c.n)}</b><small>${esc(c.role)}</small>`);b.onclick=()=>{CR.cls=id;crRender()};box.appendChild(b)}P.appendChild(box)}
 else if(tab==='face'){const sec=(t,n,names,key)=>{const h=document.createElement('h4');h.textContent=t;P.appendChild(h);const g=document.createElement('div');g.className='opts';
   for(let i=0;i<n;i++){const cv=mkc('',56,56);LOOK.portrait(cv,{...LK,[key]:i},sex,cls);g.appendChild(crOpt(cv,names[i],LK[key]===i,()=>set(key,i)))}P.appendChild(g)};
  sec('Estilo de cara',LOOK.faceN,LOOK.faceNames,'f');sec('Peinado',LOOK.hairN,LOOK.hairNames,'h')}
 else{const row=(t,list,key,css,orig)=>{const h=document.createElement('h4');h.textContent=t;P.appendChild(h);const g=document.createElement('div');g.className='sws';
   list.forEach((x,i)=>g.appendChild(crSw(css(x,i),typeof x==='string'?'':x.n||'',LK[key]===i,()=>set(key,i),orig&&orig(i))));P.appendChild(g)};
  row('Piel',LOOK.skin,'s',x=>x);row('Pelo',LOOK.hair,'hc',x=>x);row('Ojos',LOOK.eyes,'e',x=>x);
  row('Atuendo y anillo',LOOK.out,'c',x=>x.sw||(x.h!=null?'hsl('+x.h+',68%,50%)':''),i=>i===0);
  const n=document.createElement('div');n.className='cr-note';n.textContent='El atuendo recolorea las zonas azules/verdes/violetas del personaje y pinta el anillo que lleva bajo los pies en combate. Piel, pelo, ojos, cara y peinado se ven en su retrato (carrusel, cabecera y resultados).';P.appendChild(n)}}
function crDone(){const nm=cleanName($('#nm').value)||'Jugador',look=LOOK.fix(CR.look);
 if(CR.edit){const ch=CR.edit;Object.assign(ch,{name:nm,sex:CR.sex,look});PG.save(ch);if(PJ.id===ch.id)Object.assign(PJ,{name:nm,sex:CR.sex,look});UI.head();CR=null;$('#create').hidden=true;openPick();return}
 const b=PG.newBuild(nm,CR.cls,CR.sex);b.look=look;PG.save(b);PJ=b;SAVED=true;CR=null;$('#create').hidden=true;G.paused=false;Hub.enter()}
$('#go').onclick=crDone;$('#cancel').onclick=()=>{CR=null;$('#create').hidden=true;openPick()};$('#pj').onclick=openPick;$('#whoP').onclick=openPick;
$('#crrnd').onclick=()=>{CR.look=LOOK.random();CR.look.c=CR.look.c;crRender()};
document.querySelectorAll('#crtabs button').forEach(b=>b.onclick=()=>{CR.tab=b.dataset.tab;crRender()});
$('#nm').addEventListener('keydown',e=>{if(e.key==='Enter')crDone()});

/* ---------- hoja de personaje: reparto de puntos, hechizos, sets ---------- */
const ELN={tierra:'🪨 Tierra',fuego:'🔥 Fuego',agua:'💧 Agua',aire:'🌪️ Aire'};
function renderSheet(){const b=PJ,C=Registry.classes[b.cls],st=Rules.stats(b),need=PROG.xpNeed(b.lvl),max=b.lvl>=PROG.maxLv,btn=(a,t,on)=>`<button ${a} ${on?'':'disabled'}>${t}</button>`;
 let h=`<div class="shh"><canvas id="shport" width="96" height="96"></canvas><div><h2>${esc(b.name)}</h2><div class="shc">${C.ico} ${esc(C.n)} ${b.sex==='f'?'♀':'♂'} · ${esc(C.role)}</div></div></div><div class="xp"><i style="width:${max?100:100*b.xp/need}%"></i><span>Nv ${b.lvl}${max?' (máximo)':' · '+b.xp+' / '+need+' XP'}</span></div>
 <p class="sm">Victorias ${b.wins} · Derrotas ${b.losses} · ❤ ${st.mhp} · PA ${st.pa} · PM ${st.pm} · Resist. ${st.res}% · 🪨${st.rel.tierra}% 🔥${st.rel.fuego}% 💧${st.rel.agua}% 🌪️${st.rel.aire}%</p><h3>Capital <em>${b.cap}</em> pts</h3>`;
 for(const[k,l,v]of[['vit','❤️ Vitalidad',b.vit+' (+1 vida/pt)'],...ELS.map(e=>[e,ELN[e],b.pow[e]+' (+'+PROG.powPer+'% daño/pt)'])])
  h+=`<div class="r"><span>${l}</span><small>${v}</small>${btn(`data-s="${k}" data-n="1"`,'+1',b.cap>=1)}${btn(`data-s="${k}" data-n="5"`,'+5',b.cap>=5)}</div>`;
 h+=`<h3>Hechizos <em>${b.sp}</em> pts</h3>`;
 h+=`<div class="r"><span>${C.spells.filter(id=>b.spLv[id]).length}/${C.spells.length} aprendidos</span><small>Niveles 1-5 · pide nivel de personaje</small><button data-open="sp">✨ Abrir</button></div>`;
 h+=`<h3>Equipo <em>${(b.kamas||0).toLocaleString('es')}</em> kamas</h3><div class="r"><span>🎒 ${Object.keys(b.eq).length} piezas</span><small>Compra en el mercadillo · equipa en el inventario</small><button data-open="mk">🛒 Abrir</button></div>`;
 h+='<h3>Set de equipo <small>(sus piezas se consiguen ganando combates)</small></h3><div class="sets">';
 for(const S of Object.values(Registry.isets)){const P=Items.setParts(S.id),own=P.filter(p=>Items.own(b,p.id)>0).length,eq=Items.setCount(b,S.id);
  h+=`<button class="set" data-set="${S.id}" style="--c:${S.c}"><b>${esc(S.n)}</b><small>🎒 ${own}/${P.length} piezas · ✔ ${eq} equipadas</small><i class="setbar"><u style="width:${P.length?100*own/P.length:0}%"></u></i></button>`}
 h+='</div>';
 $('#sheet').innerHTML='<div class="panel"><div class="st-title"><span class="st-help">?</span><b>Mi personaje</b><button id="shx" class="st-x">✕</button></div><div class="shb">'+h+'</div></div><div class="row"><button id="respec" class="st-reset">↺ Reiniciar puntos</button></div></div>';LOOK.portrait($('#shport'),b.look,b.sex,b.cls)}
const sheetSave=()=>{if(SAVED)PG.save(PJ);renderSheet();UI.head();if(!$('#spells').hidden)renderSpells()};
$('#sheet').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.id==='shx'){$('#sheet').hidden=true;return}
 if(t.id==='respec'){PG.respec(PJ);sheetSave();return}
 if(t.dataset.open){t.dataset.open==='mk'?openInv():openSpells();return}
 if(t.dataset.s)PG.spend(PJ,t.dataset.s,+t.dataset.n);else if(t.dataset.set){openSets(t.dataset.set);return}else return;sheetSave()});
$('#lvl').onclick=()=>{renderSheet();$('#sheet').hidden=false};

/* ---------- ventana "Mis hechizos" (estilo Dofus Touch: lista a la izquierda · pestañas de nivel 1-6 y detalle a la derecha) ---------- */
let SPSEL=null,SPTAB=1,SPFLT='all';
const SPCAT={all:'Todos tipos',dmg:'Daño',ctl:'Control (empuje, PA/PM)',sup:'Apoyo y curas',sum:'Invocaciones y trampas'};
const spCats=s=>{const k=s.e.map(x=>x.k),c=[];if(k.some(x=>x==='d'||x==='dot'))c.push('dmg');
 if(k.some(x=>x==='push'||x==='tp'||x==='sw'||(x==='b'&&s.e.some(f=>f.k==='b'&&f.on==='t'))))c.push('ctl');
 if(k.some(x=>x==='h'||x==='ar'||(x==='b'&&s.e.some(f=>f.k==='b'&&f.on!=='t'))))c.push('sup');
 if(k.some(x=>x==='sm'||x==='ob'))c.push('sum');return c};
const spSpent=l=>l*(l-1)/2;                                   // puntos gastados en un hechizo de nivel l (1+2+…+(l-1))
function renderSpells(){const b=PJ,C=Registry.classes[b.cls],ids=C.spells.filter(id=>SPFLT==='all'||spCats(Registry.spells[id]).includes(SPFLT));
 if(!C.spells.includes(SPSEL))SPSEL=C.spells[0];
 const s=Registry.spells[SPSEL],lv=b.spLv[SPSEL]||0,tab=clamp(SPTAB,1,PROG.maxSpLv),tint=q=>`style="--c:${q.fx||'#8a7'}"`;let L='';
 for(const id of ids){const q=Registry.spells[id],l=b.spLv[id]||0;
  L+=`<div class="st-row${id===SPSEL?' sel':''}${l?'':' lock'}" data-p="${id}"><span class="st-ic" ${tint(q)}>${l?q.i:'🔒'}</span><span class="st-nm">${esc(q.n)}</span>`
   +`<span class="st-lv">${l?`<i class="st-key"></i>${l}`:`<small>Nv ${q.lvl}</small>`}</span>`
   +`<span class="st-pl">${l?`<button class="st-plus" data-u="${id}" ${PG.canUp(b,id)?'':'disabled'} title="Subir de nivel">+</button>`:''}</span><span class="st-pts">${l?(spSpent(l)||'-'):'-'}</span></div>`}
 if(!ids.length)L='<div class="st-empty">Ningún hechizo de este tipo</div>';
 let T='';for(let n=1;n<=PROG.maxSpLv;n++)T+=`<button class="st-tab${n===tab?' on':''}${n===lv?' cur':''}${n>lv?' off':''}" data-t="${n}">${n}</button>`;
 const d=Rules.describe(s,tab).split(' | '),fx=d[0].split(' · ').filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('');
 const rng=s.tg==='s'?'0':s.r[0]===s.r[1]?String(s.r[1]):s.r[0]+' - '+s.r[1];
 let note,go='';
 if(!lv)note=`<span class="warn">Se desbloquea al llegar al nivel ${s.lvl} de personaje (ganando XP).</span>`;
 else if(tab<=lv)note=tab===lv?'<b>Nivel actual</b>':'Nivel ya desbloqueado';
 else if(tab>lv+1)note='Sube antes el nivel '+(lv+1);
 else{const q=PROG.spReq[lv],okL=b.lvl>=q,okP=b.sp>=lv;note=okL?(okP?'Cuesta <b>'+lv+'</b> pt(s) de hechizo':`<span class="warn">Faltan puntos: cuesta ${lv} y tienes ${b.sp}</span>`):`<span class="warn">Requiere personaje nivel ${q} (eres ${b.lvl})</span>`;
  go=`<button class="st-up" data-u="${SPSEL}" ${PG.canUp(b,SPSEL)?'':'disabled'}>Subir a nivel ${tab}</button>`}
 if(lv>1&&tab===lv)go+=`<button class="st-dn" data-d="${SPSEL}">Bajar a nivel ${lv-1}</button>`;
 $('#spells').innerHTML=`<div class="st-win"><div class="st-title"><span class="st-help">?</span><b>Mis hechizos</b><button id="spx" class="st-x">✕</button></div>
 <div class="st-body"><div class="st-left"><select id="stf" class="st-flt">${Object.entries(SPCAT).map(([k,v])=>`<option value="${k}"${k===SPFLT?' selected':''}>${v}</option>`).join('')}</select>
  <div class="st-head"><span>Nombre del hechizo</span><span>Nivel</span><span>Puntos</span></div><div class="st-list">${L}</div>
  <div class="st-foot"><button id="strst" class="st-reset">↺ Reiniciarlo todo</button><span>Capital de puntos: <em>${b.sp}</em></span></div></div>
 <div class="st-right"><div class="st-tabs">${T}</div>
  <div class="st-hd"><span class="st-big" ${tint(s)}>${lv?s.i:'🔒'}</span><div><b>${esc(s.n)}</b><small class="${b.lvl<s.lvl?'bad':''}">Nivel necesario: ${s.lvl}</small></div></div>
  <div class="st-info"><div class="st-t">${esc(s.n)}</div><div class="st-pa"><span>★ PA: ${s.pa}</span><span>◉ Al: ${rng}</span></div>
   <div>Nivel ${tab}</div><div>Hechizo de clase: Hechizos de ${esc(C.n)}</div>
   <div>Nº de lanzamientos por turno: ${s.lim}</div><div>Línea de visión: ${s.tg==='s'||s.nlos?'no necesaria':'necesaria (la tapan los obstáculos altos, no los personajes)'}</div><div>Nº de turnos entre dos lanzamientos: ${s.cd||'—'}</div>
   <div class="st-fh">Efectos:</div><ul class="st-fx">${fx}</ul><div class="st-nt">${note}</div></div>${go?`<div class="st-act">${go}</div>`:''}</div></div></div>`}
function openSpells(){SPTAB=1;SPFLT='all';renderSpells();$('#spells').hidden=false}
const spSave=()=>{if(SAVED)PG.save(PJ);renderSpells();UI.head();if(!$('#sheet').hidden)renderSheet()};
$('#spells').addEventListener('click',e=>{const t=e.target.closest('button,[data-p]');if(!t)return;if(t.id==='spx'){$('#spells').hidden=true;return}
 if(t.id==='strst'){PG.respec(PJ);spSave();return}
 if(t.tagName!=='BUTTON'){SPSEL=t.dataset.p;SPTAB=clamp((PJ.spLv[SPSEL]||0)+(PG.canUp(PJ,SPSEL)?1:0),1,PROG.maxSpLv);renderSpells();return}
 if(t.dataset.t){SPTAB=+t.dataset.t;renderSpells()}else if(t.dataset.u){PG.upSpell(PJ,t.dataset.u);SPSEL=t.dataset.u;SPTAB=PJ.spLv[SPSEL];spSave()}else if(t.dataset.d){PG.downSpell(PJ,t.dataset.d);SPSEL=t.dataset.d;SPTAB=PJ.spLv[SPSEL];spSave()}});
$('#spells').addEventListener('change',e=>{if(e.target.id==='stf'){SPFLT=e.target.value;renderSpells()}});
$('#spells').addEventListener('pointerdown',e=>{if(e.target===$('#spells'))$('#spells').hidden=true});
$('#spb').onclick=openSpells;

/* ---------- interfaz ---------- */
const UI={msg:t=>$('#msg').textContent=t,
 head(){{const k=JSON.stringify(PJ.look)+PJ.sex+PJ.cls;if(UI._pk!==k){UI._pk=k;LOOK.portrait($('#whoP'),PJ.look,PJ.sex,PJ.cls)}}const b=PJ,C=Registry.classes[b.cls],need=PROG.xpNeed(b.lvl),max=b.lvl>=PROG.maxLv;
  $('#whoT').textContent=C.ico+' '+b.name+' · Nv '+b.lvl;$('#kam').textContent='💰 '+(b.kamas||0).toLocaleString('es');$('#xpi').style.width=(max?100:100*b.xp/need)+'%';$('#xpt').textContent=max?'MAX':b.xp+' / '+need+' XP';
  $('#spb .dot').hidden=!(b.sp>0&&C.spells.some(id=>PG.canUp(b,id)));$('#lvl .dot').hidden=b.cap<=0},          // puntito = tienes algo que gastar
 bt:'sp',                                                  // pestaña de la barra inferior: sp = hechizos · it = objetos (consumibles)
 hud(){const p=G.me;UI.head();if(!p||G.hub)return;Retos.panel();
  $('#orbf').style.height=100*Math.max(0,p.hp/p.mhp)+'%';$('#hpc').textContent=Math.ceil(p.hp);$('#hpm').textContent=p.mhp;
  const ar=p.ar.reduce((a,x)=>a+x.v,0);$('#paO').textContent=p.pa;$('#pmO').textContent=p.pm;$('#pp').innerHTML=(ar?'<em title="Armadura">🛡 '+ar+'</em>':'')+(p.dots.length?'<em title="Veneno">☠</em>':'');
  [...$('#slots').children].forEach((b,i)=>{const cd=b.querySelector('.cd');if(!cd)return;
   if(UI.bt==='sp'){const c=p.sp[i];if(!c)return;const s=Registry.spells[c.id];cd.textContent=p.cd[s.id]>0?p.cd[s.id]:'';b.classList.toggle('sel',G.sel===i);b.classList.toggle('dis',G.cur!==p||!!Rules.ready(p,s))}
   else{const id=b.dataset.it;cd.textContent='';b.querySelector('.nv').textContent=p.items[id]|0;b.classList.toggle('dis',G.cur!==p||!!Rules.usable(G,p,id))}});
  $('#leave').hidden=!!G.over;if(G.over&&!$('#leavebox').hidden)Leave.close();
  const rs0=G.over&&G.res;$('#end').textContent=rs0?'📊 Resultado':'Fin de turno';$('#end').disabled=rs0?false:!(G.cur===p&&!G.busy&&!G.over);
  $('#turns').innerHTML=G.ents.filter(e=>e.hp>0).map(e=>{if(!e._pt)e._pt=e.build?`<img alt="" src="${LOOK.url(e.build.look,e.build.sex,e.build.cls,56)}">`:`<span>${esc(e.ico||'👾')}</span>`;
   return`<div class="tr ${G.cur===e?'on ':''}${e.team===p.team?'ally':'foe'}${e.sm?' sm':''}" data-id="${e.id}" title="${esc(e.n)} · ${Math.ceil(e.hp)} PV"><i class="tp">${e._pt}</i><u style="width:${100*e.hp/e.mhp}%"></u>${e.dots.length?'<b>☠</b>':''}</div>`}).join('');UI.card()},
 slots(){const box=$('#slots');box.textContent='';const p=G.me;if(!p)return;
  document.querySelectorAll('#btabs button').forEach(b=>b.classList.toggle('on',b.dataset.bt===UI.bt));
  if(UI.bt==='it'){const ids=Object.keys(p.items).filter(id=>Registry.items[id]&&Registry.items[id].use);
   if(!ids.length)box.innerHTML='<div class="empty">No llevas consumibles.<br>Cómpralos en 🛒 Mercado o fabrícalos en 🔨 Oficios.</div>';
   ids.forEach((id,i)=>{const it=Registry.items[id],b=document.createElement('button');b.className='slot';b.dataset.it=id;b.title=it.n+' · '+Items.useTxt(it);
    b.innerHTML=it.ico+(i<9?'<sup>'+(i+1)+'</sup>':'')+'<span class="pa">'+it.use.pa+'</span><span class="nv">'+p.items[id]+'</span><span class="cd"></span>';b.onclick=()=>useItem(id);box.appendChild(b)});return}
  p.sp.forEach((c,i)=>{const s=Registry.spells[c.id],b=document.createElement('button');
   b.className='slot';b.title=s.n+' · Nv '+c.lv+' · '+Rules.describe(s,c.lv);b.innerHTML=s.i+''+(i<9?'<sup>'+(i+1)+'</sup>':'')+'<span class="pa">'+s.pa+'</span><span class="nv">'+c.lv+'</span><span class="cd"></span>';b.onclick=()=>pick(i);box.appendChild(b)});
  const C=Object.values(Registry.classes).find(k=>p.sp[0]&&k.spells.includes(p.sp[0].id));      // hueco bloqueado del siguiente hechizo
  if(C)C.spells.filter(id=>!p.sp.some(c=>c.id===id)).slice(0,1).forEach(id=>{const b=document.createElement('button');b.className='slot lk';b.disabled=true;b.title=Registry.spells[id].n+' · se desbloquea en el nivel '+Registry.spells[id].lvl;b.textContent='🔒 Nv '+Registry.spells[id].lvl;box.appendChild(b)})},
 /* atajos numéricos: según la pestaña activa */
 key(i){if(UI.bt==='sp')pick(i);else{const id=Object.keys(G.me.items).filter(k=>Registry.items[k]&&Registry.items[k].use)[i];if(id)useItem(id)}},
 /* reloj del turno: anillo que se vacía (verde → amarillo → rojo parpadeante). Solo corre en turnos de jugadores; se detiene en animaciones y con ventanas abiertas */
 tmr(){const el=$('#tmr'),sp=el.firstChild;if(!G.cur||G.over){el.className='h';return}
  if(!G.tmax){el.style.setProperty('--p',0);const t=G.cur.sm?'🐾':'⏳';if(UI._tt!==t){UI._tt=t;sp.textContent=t}el.className='idle';el.title='Turno de '+G.cur.n;return}
  const f=G.tl/G.tmax,s=Math.ceil(G.tl)+'s';el.style.setProperty('--p',(100*f).toFixed(1));if(UI._tt!==s){UI._tt=s;sp.textContent=s}el.className=G.tl<=5?'low':f<.5?'mid':'';el.title='Tiempo del turno'+(G.cur===G.me?'':' · '+G.cur.n)},
 /* chat de combate (abajo a la izquierda) */
 log(t,c){Chat.add('combate',t,c)},
 logClear(){Chat.clear('combate')},
 /* ventana de resultado: R viene de finish() (combat.js); null = cerrar */
 result(R){const el=$('#result');if(!R){el.hidden=true;return}
  const mm=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),W=R.draw?-1:R.won?0:1;
  const card=(L,i)=>`<div class="rside ${W===i?'w':W===-1?'':'l'}"><div class="rbadge">${W===-1?'🤝 Empate':W===i?'🏆 Ganador':'☠ Perdedor'}</div>`+L.map(e=>`<div class="rent"><b>${e.img?`<img class="rface" src="${e.img}">`:esc(e.ico)} ${esc(e.n)} · Nv ${e.lvl}</b><div class="rhp"><i style="width:${100*e.hp/e.mhp}%"></i><span>${e.hp} / ${e.mhp}</span></div><div class="rst">⚔ ${e.dd} · 🩸 recibido ${e.dt} · 💚 ${e.hl}</div></div>`).join('')+'</div>';
  let h=`<div class="rwin ${R.draw?'draw':R.won?'win':'lose'}"><div class="rt">${R.draw?'🤝 EMPATE':R.won?'🏆 ¡VICTORIA!':R.left?'🚪 ABANDONASTE':'💀 DERROTA'}</div>`;
  if(R.left)h+='<div class="rsub">Abandonar cuenta como derrota: sin botín.</div>';
  if(!R.draw)h+=`<div class="rsub">Ganó ${esc(R.sides[W].map(e=>e.n).join(', '))} · perdió ${esc(R.sides[1-W].map(e=>e.n).join(', '))}</div>`;
  h+='<div class="rcols">'+card(R.sides[0],0)+card(R.sides[1],1)+'</div>';
  if(!R.draw)h+=`<div class="rxp"><div>+${R.xp} XP${R.xpBonus>0?` <span class="rup">(🏅 +${R.xpBonus})</span>`:''} · <span class="rup">💰 +${(R.kamas||0).toLocaleString('es')} kamas${R.kamasBonus>0?` (🏅 +${R.kamasBonus})`:''}</span>${R.up?` · <span class="rup">¡Nivel ${R.lvl}!</span> (+${R.cap} capital, +${R.spp} pts de hechizo)`:''}</div><div class="xp"><i style="width:${R.max?100:100*R.xpNow/R.xpNeed}%"></i><span>${R.max?'Nivel máximo':'Nv '+R.lvl+' · '+R.xpNow+' / '+R.xpNeed+' XP'}</span></div>`
   +R.unl.map(n=>`<div class="rup">✨ Hechizo desbloqueado: ${esc(n)}</div>`).join('')
   +(R.chal&&R.chal.length?'<div class="rchal"><b>🏅 Retos</b>'+R.chal.map(x=>`<span class="${x.ok?'ok':'bad'}" title="${esc(x.d)}">${x.ok?'✔':'✖'} ${x.ico} ${esc(x.n)} <em>${'★'.repeat(x.stars)}</em></span>`).join('')+'</div>':'')
   +(R.sales&&R.sales.length?'<div class="rloot"><b>📋 Tu puesto</b>'+R.sales.map(x=>`<span>${esc(x)}</span>`).join('')+'</div>':'')
   +(R.loot&&R.loot.length?'<div class="rloot"><b>🎁 Botín</b>'+R.loot.map(x=>`<span class="${x.set?'set':''}">${x.set?'🎽 ':''}${esc(x.ico+' '+x.n)}${x.q>1?' ×'+x.q:''}</span>`).join('')+'</div>':'')+'</div>';
  if(R.dun)h+=`<div class="rsub">🏰 ${esc(R.dun.n)} · sala ${R.dun.room+1}/${R.dun.rooms}${R.won&&R.dun.room===R.dun.rooms-1?' · 🏆 ¡MAZMORRA COMPLETADA!':''}</div>`;
  h+=`<div class="rf">⏳ Duración ${mm(R.dur)} · 🔁 ${R.turns} turno${R.turns===1?'':'s'} tuyo${R.turns===1?'':'s'}</div><div class="rrow">${R.dun&&R.won&&R.dun.room<R.dun.rooms-1?'<button id="rnext">➡ Siguiente sala ('+(R.dun.room+2)+'/'+R.dun.rooms+')</button>':''}<button id="rhub">🏛 Sala de espera</button><button id="rbegin">⚔ Combatir de nuevo</button><button id="rview">🗺 Ver tablero</button><button id="rpj">📈 Personaje</button></div></div>`;
  el.innerHTML=h;el.hidden=false},
 /* tarjeta grande del personaje en turno (o del que señales en la lista de turnos): retrato, vida, PA/PM y una tarjeta por cada estado con quién lo aplicó */
 card(){const el=$('#tcard'),id=UI.hov!=null?UI.hov:UI.foc,e=(id!=null&&byId(id))||G.cur;if(!e||!G.me){el.hidden=true;return}el.hidden=false;
  const ally=e.team===G.me.team,ELI={tierra:'🪨',fuego:'🔥',agua:'💧',aire:'🌪️',neutro:'⚪'},who=c=>c.by?(c.bi===e.id?'sobre sí mismo':'de '+esc(c.by))+(c.sn?' · '+esc(c.sn):''):'',L=[];
  for(const d of e.dots)L.push({c:'bad',i:ELI[d.el]||'☠',t:'Veneno de '+d.el,v:'−'+d.v+' por turno',tn:d.tn,o:d});
  for(const a of e.ar)L.push({c:'ok',i:'🛡',t:'Armadura',v:a.v+' pts',tn:a.tn,o:a});
  for(const f of e.fx){const g=f.s==='inv'||f.v>0;L.push({c:g?'ok':'bad',i:{pa:'⭐',pm:'👟',pow:'💪',res:'🛡️',inv:'👻'}[f.s]||'✨',t:(g?'Bonus ':'Malus ')+(STN[f.s]||f.s),v:f.s==='inv'?'':(f.v>0?'+':'')+f.v+(f.s==='res'?'%':''),tn:f.tn,o:f})}
  const RS=ELS.map(el=>[el,Rules.R(e,el)]).filter(x=>x[1]),rch=RS.length?`<div class="tc rr" title="Resistencias por elemento">${RS.map(([el,v])=>`<em class="${v<0?'neg':''}">${ELI[el]} ${v}%</em>`).join('')}</div>`:'';
  const ar=e.ar.reduce((s,x)=>s+x.v,0),b=e.build,
   pt=b?'<canvas width="96" height="96"></canvas>':e.def&&e.def.sprite&&e.def.sprite.src?`<img src="${esc(e.def.sprite.src)}" alt="" onerror="this.replaceWith(document.createTextNode('${esc(e.ico||'?')}'))">`:esc(e.ico||'?'),
   h=`<div class="th"><div class="tp">${pt}</div><div class="ti"><span class="tw">${G.cur===e?'⚔ En turno':'👁 Viendo'} · ${ally?(e===G.me?'Tú':'Aliado'):'Enemigo'}</span><b class="tn">${esc(e.n)}</b><span class="tl">${e.sm?'Invocación':'Nivel '+e.lvl}</span>
   <div class="bar"><i style="width:${100*e.hp/e.mhp}%"></i><span>❤ ${Math.ceil(e.hp)} / ${e.mhp}</span></div><div class="tc"><em>⭐ PA ${e.pa}</em><em>👟 PM ${e.pm}</em>${ar?`<em>🛡 ${ar}</em>`:''}</div>${rch}</div></div>`
   +'<div class="tsc">'+(L.length?L.map(x=>`<div class="sc ${x.c}"><span class="sci">${x.i}</span><div><b>${x.t}${x.v?' '+x.v:''}</b><small>${who(x.o)}</small></div>${x.tn!=null&&x.tn<99?`<span class="stn">${x.tn} t</span>`:''}</div>`).join(''):'<div class="sc none">Sin estados activos</div>')+'</div>';
  el.classList.toggle('foe',!ally);if(h===UI._ck)return;UI._ck=h;el.innerHTML=h;if(b)LOOK.portrait(el.querySelector('canvas'),b.look,b.sex,b.cls)},
 sheetRefresh(){if(!$('#sheet').hidden)renderSheet()}};
const WXN={none:'☀️ Despejado',wind:'🍃 Viento',rain:'🌧 Lluvia'};
const mapInfo=()=>{const A=G.arena;$('#mapi').textContent='🗺 '+A.n+' · '+(WXN[G.weather]||WXN.none);$('#mapi').title='Arena '+A.w+'×'+A.h+' ('+A.walk+' casillas) · la arena y el clima se eligen solos en cada combate'};
Net.onAct=a=>{G.q=G.q.then(()=>exec(a))};
function begin(){UI.foc=UI.hov=null;const m=$('#mode').value;if(m==='pvp')return Coli.open();
 if(Coli.busy()){$('#mode').value='pvp';UI.msg('🔍 Estás buscando partida en el Coliseo. Cancela la búsqueda (⚔️ Coliseo) para combatir en otro modo.');return}
 Net.leave();Hub.leave();Dun.run=null;
 startBattle(Maps.pick(G.arena&&G.arena.id),{mode:m,me:PJ,allies:Party.builds()});mapInfo();rs();fitView();            // arena y clima AUTOMÁTICOS: distintos en cada combate
 UI.msg(m==='mob'&&G.noMobs?'Aún no hay monstruos: añádelos en js/data/monsters/monstruos.js':'Toca una celda azul para moverte · hechizos 1-9 · espacio = fin de turno · 🚪 Salir = abandonar · 📈 = tu personaje');UI.hud()}
/* ---------- 🚪 Salir del combate: aviso con lo que se pierde según el modo (texto en leaveInfo, combat.js) ---------- */
const Leave={open(){if(G.hub||G.over||!G.me||!$('#leavebox').hidden)return;const i=leaveInfo();
  $('#leavebox').innerHTML=`<div class="lv"><h3>🚪 ${i.t}</h3><p>${i.d}</p><div class="lvr"><button id="lvno" type="button">↩ Seguir luchando</button><button id="lvyes" type="button" class="bad">${i.b}</button></div></div>`;$('#leavebox').hidden=false;setTimeout(()=>{const n=$('#lvno');n&&n.focus()},30)},
 close(){$('#leavebox').hidden=true}};
$('#leavebox').addEventListener('click',e=>{const t=e.target.closest('button');if(t&&t.id==='lvyes'){Leave.close();forfeit()}else if((t&&t.id==='lvno')||e.target===$('#leavebox'))Leave.close()});
$('#leave').onclick=()=>Leave.open();
addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('#leavebox').hidden){Leave.close();return}
 const ae=document.activeElement,typing=ae&&/INPUT|SELECT|TEXTAREA/.test(ae.tagName)&&ae.offsetParent!==null;      // escribiendo en el chat: Esc no abre el aviso
 if(!G.hub&&!G.over&&!overlayOpen()&&!typing)Leave.open()});
$('#result').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.id==='rnext'){$('#result').hidden=true;Dun.next()}else if(t.id==='rhub'){$('#result').hidden=true;Hub.enter()}else if(t.id==='rbegin'){$('#result').hidden=true;begin()}else if(t.id==='rview')$('#result').hidden=true;else if(t.id==='rpj'){$('#result').hidden=true;renderSheet();$('#sheet').hidden=false}});
$('#turns').addEventListener('mouseover',e=>{const t=e.target.closest('.tr');UI.hov=t?+t.dataset.id:null;UI.card()});$('#turns').addEventListener('mouseleave',()=>{UI.hov=null;UI.card()});
$('#turns').addEventListener('click',e=>{const t=e.target.closest('.tr');if(!t)return;const i=+t.dataset.id;UI.hov=null;UI.foc=UI.foc===i?null:i;UI.card()});   // clic = fijar la tarjeta en ese personaje (otro clic = volver al que está en turno)
$('#start').onclick=begin;$('#end').onclick=endTurn;$('#mode').onchange=()=>{if(!G.hub&&$('#mode').value!=='pvp')begin()};$('#hubb').onclick=()=>{if(G.hub)return;if(!G.over&&G.mode!=='hub'){Leave.open();return}$('#result').hidden=true;Hub.enter()};$('#ptb').onclick=()=>openParty();$('#dunb').onclick=()=>{if(!G.hub&&!G.over){UI.msg('🏰 Las mazmorras se eligen desde la sala de espera (botón 🏛 Sala)');return}openDung()};$('#navt').onclick=()=>$('#nav').classList.toggle('c');if(innerWidth<=900)$('#nav').classList.add('c');$('#hubact').onclick=()=>Hub.open($('#hubact').dataset.c);
document.querySelectorAll('#btabs button').forEach(b=>b.onclick=()=>{UI.bt=b.dataset.bt;UI.slots();UI.hud()});
$('#logb').onclick=()=>Chat.toggle();

/* ---------- bucle de render ---------- */
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;G.t=now/1000;tick(dt);if(G.hub)Hub.tick(dt);UI.tmr();const A=G.arena;
 for(const e of G.ents){e.atk=Math.max(0,e.atk-dt/.5);e.hurt=Math.max(0,e.hurt-dt/.4);e.cast=Math.max(0,e.cast-dt/.6);
  if(!e.path.length)continue;const[tx,ty]=e.path[0],dx=tx-e.px,dy=ty-e.py,d=Math.hypot(dx,dy),s=5*dt;
  if(d<=s){e.px=e.x=tx;e.py=e.y=ty;e.path.shift();if(!e.path.length&&!G.hub)UI.hud()}else{e.px+=dx/d*s;e.py+=dy/d*s}}
 ctx.setTransform(dpr,0,0,dpr,0,0);drawBg(ctx,A,G.t,VW,VH);
 ctx.setTransform(dpr*Z,0,0,dpr*Z,dpr*OX,dpr*OY);
 const hl={},p=G.me,ts=Math.min(1.8,Math.max(1,.95/Z)),eh=e=>entH(e)+14;       // ts: el texto crece un poco al alejar el zoom para seguir legible
 if(G.cur===p&&!G.busy&&!G.over&&!p.path.length){
  if(G.sel!=null){for(const[x,y]of Rules.range(G,p,Registry.spells[p.sp[G.sel].id]))hl[x+','+y]='rgba(235,120,40,.5)'}
  else{const b=bfs(p.x,p.y,p.pm,p);for(const k in b.d)if(b.d[k]>0)hl[k]='rgba(70,130,230,.5)'}}
 if(G.hover&&!blocked(...G.hover))hl[G.hover.join()]=hl[G.hover.join()]||'rgba(255,255,255,.22)';
 drawArt(ctx,A);drawGround(ctx,A,hl,G.t);for(const o of G.objs)objGround(ctx,o,G.t,G.me);
 if(!A._ob){A._ob=[];eachCell(A,(x,y,v,c)=>{if(c&&c!=='o'&&c!=='~')A._ob.push([x,y])})}
 const items=A._ob.map(([x,y])=>({k:x+y,f:()=>drawObs(ctx,A,x,y,G.t)}));
 for(const o of G.objs)items.push({k:o.x+o.y-.2,f:()=>objDraw(ctx,o,G.t,G.me)});
 for(const e of G.ents)if(e.hp>0||e.hurt>0)items.push({k:e.px+e.py+.01,f:()=>{const[cx,cy]=P(e.px,e.py),h=eh(e);ctx.save();ctx.translate(cx,cy);drawEntity(ctx,e,G.t);
  if(G.cur===e){ctx.strokeStyle='#ffd84a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,2,24,11,0,0,7);ctx.stroke()}
  if(G.hub)Hub.plate(ctx,e,h,ts);else{ctx.font='bold '+13*ts+'px Trebuchet MS,sans-serif';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.fillStyle='#fff';ctx.strokeText(e.n,0,-h-2*ts);ctx.fillText(e.n,0,-h-2*ts);
  ctx.fillStyle='#000';ctx.fillRect(-22,4-h,44,6);ctx.fillStyle=e.team===G.me.team?'#6dbb3c':'#d23b34';ctx.fillRect(-21,5-h,42*e.hp/e.mhp,4);}ctx.restore()}});
 items.sort((a,b)=>a.k-b.k).forEach(i=>i.f());drawBooms(ctx,G.bm,dt);
 G.pr=G.pr.filter(q=>(q.t+=dt)<.3);for(const q of G.pr){const f=q.t/.3,[ax,ay]=P(...q.a),[bx,by]=P(...q.b);
  ctx.fillStyle=q.c;ctx.shadowColor=q.c;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(lerp(ax,bx,f),lerp(ay,by,f)-CFG.spriteH*.5,6,0,7);ctx.fill();ctx.shadowBlur=0}
 G.fl=G.fl.filter(f=>(f.t+=dt)<1.1);ctx.font='bold '+22*ts+'px Trebuchet MS,sans-serif';ctx.textAlign='center';
 for(const f of G.fl){const[cx,cy]=P(f.x,f.y);ctx.lineJoin='round';ctx.globalAlpha=1-f.t/1.1;ctx.lineWidth=4;ctx.strokeStyle='#000';ctx.fillStyle=f.c;ctx.strokeText(f.s,cx,cy-CFG.spriteH-18-f.t*34);ctx.fillText(f.s,cx,cy-CFG.spriteH-18-f.t*34);ctx.globalAlpha=1}
 ctx.setTransform(dpr,0,0,dpr,0,0);drawWeather(ctx,VW,VH,G.t,G.weather||'none');
  requestAnimationFrame(frame)}
rs();Hub.enter();requestAnimationFrame(frame);
CH=PG.all();CH.length?openPick():openCreator(null);           // cuenta nueva → crear personaje · si no → elegir en el carrusel
