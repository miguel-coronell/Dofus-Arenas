/* ui/layout.js · INTERFAZ PERSONALIZABLE: mueve, cambia de tamaño y oculta los paneles del combate y de la sala (chat, retos, vida y hechizos, orden de turnos,
   personaje en turno, menú, zoom, equipo). Botón «🧩 Interfaz» arriba. Se guarda en el navegador (localStorage 'coliseo.layout.v1'), por separado para COMBATE y SALA.
   · Chat: al cambiar el tamaño la caja crece y la letra se adapta.   · Resto de paneles: al cambiar el tamaño TODO su interior se escala a la vez.
   · Para añadir otro panel a la lista: una línea en LAY.P (id CSS, nombre, icono, 'free' | 'scale', contexto 'c' combate · 'h' sala · 'ch' ambos). */
const LAY=(()=>{
 const KEY='coliseo.layout.v1',MIN_S=.45,MAX_S=2.4;
 const P={'#chat':{n:'Chat',i:'💬',m:'free',min:[230,110],w0:400,c:'ch'},
  '#hud':{n:'Vida y hechizos',i:'✨',m:'scale',c:'c'},'#tcard':{n:'Personaje en turno',i:'🧑‍🎤',m:'scale',c:'c'},'#turns':{n:'Orden de turnos',i:'🎯',m:'scale',c:'c'},
  '#retos':{n:'Retos',i:'🏅',m:'scale',c:'c'},'#nav':{n:'Menú',i:'☰',m:'scale',c:'ch'},'#zoom':{n:'Zoom',i:'🔍',m:'scale',c:'ch'},'#pty':{n:'Equipo',i:'👥',m:'scale',c:'h'}};
 let S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){S={}}
 const ctx=()=>document.body.classList.contains('hub')?'h':'c',here=id=>P[id].c.includes(ctx()),save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
 const cur=(id,mk)=>{const c=S[ctx()]=S[ctx()]||{};return mk?(c[id]=c[id]||{}):c[id]},stage=()=>$('#stage');
 const css=(el,o)=>{for(const k in o)o[k]==null?el.style.removeProperty(k):el.style.setProperty(k,o[k],'important')};
 const RESET=['left','top','right','bottom','transform','transform-origin','margin','width','height','--k'];
 /* pone un panel donde y como diga su geometría guardada (x,y y tamaño van como fracción del escenario → se adaptan al cambiar la ventana) */
 function apply(id){const el=$(id),p=P[id];if(!el)return null;const g=cur(id);el.classList.toggle('lay-off',!!(g&&g.off));
  if(!g||g.x==null){el.classList.remove('lay-on','lay-scale','lay-sized');RESET.forEach(k=>el.style.removeProperty(k));return null}
  const st=stage(),W=st.clientWidth,H=st.clientHeight;el.classList.add('lay-on');el.classList.toggle('lay-scale',p.m==='scale');
  const o={right:'auto',bottom:'auto',margin:'0'};let vw,vh;
  if(p.m==='free'){const w=clamp((g.w||.3)*W,p.min[0],W),col=el.classList.contains('col'),h=clamp((g.h||.25)*H,p.min[1],H);
   el.classList.add('lay-sized');o.width=w+'px';o.height=col?null:h+'px';o['--k']=clamp(w/p.w0,.85,1.35);o.transform='none';vw=w;vh=col?el.offsetHeight:h}
  else{const s=clamp(g.s||1,MIN_S,MAX_S);o.transform='scale('+s+')';o['transform-origin']='0 0';vw=el.offsetWidth*s;vh=el.offsetHeight*s}
  const x=clamp(g.x*W,0,Math.max(0,W-vw)),y=clamp(g.y*H,0,Math.max(0,H-vh));o.left=x+'px';o.top=y+'px';css(el,o);return{x,y,W,H}}
 const applyAll=()=>{Object.keys(P).forEach(apply);refit()};
 let rt=0;const refit=()=>{cancelAnimationFrame(rt);rt=requestAnimationFrame(()=>{if(typeof rs==='function')rs()})};
 /* si el panel aún no tiene geometría propia, la toma de donde está ahora mismo (así no «salta» al empezar a moverlo) */
 function geom(id){const g=cur(id,true);if(g.x==null){const el=$(id),r=el.getBoundingClientRect(),sr=stage().getBoundingClientRect();g.x=(r.left-sr.left)/sr.width;g.y=(r.top-sr.top)/sr.height;
   if(P[id].m==='free'){g.w=r.width/sr.width;g.h=r.height/sr.height}else g.s=1}return g}
 /* ---------- modo edición ---------- */
 let on=false,raf=0,bar=null;const ovs=new Map();
 function mkOv(id){const d=document.createElement('div');d.className='lov';d.dataset.p=id;d.innerHTML='<span class="lt"></span><button class="lx" type="button"></button><i class="lrz" title="Cambiar tamaño"></i>';$('#layov').appendChild(d);
  const el=()=>$(id);
  d.querySelector('.lx').addEventListener('pointerdown',e=>e.stopPropagation());
  d.querySelector('.lx').addEventListener('click',()=>toggle(id));
  d.addEventListener('pointerdown',e=>{if(e.target.closest('.lx')||e.target.closest('.lrz'))return;e.preventDefault();d.setPointerCapture(e.pointerId);const g=geom(id),W=stage().clientWidth,H=stage().clientHeight,x0=e.clientX,y0=e.clientY,gx=g.x,gy=g.y;d.classList.add('mv');
   const mv=ev=>{g.x=gx+(ev.clientX-x0)/W;g.y=gy+(ev.clientY-y0)/H;const r=apply(id);if(r){g.x=r.x/W;g.y=r.y/H}},
    up=()=>{d.classList.remove('mv');d.removeEventListener('pointermove',mv);d.removeEventListener('pointerup',up);d.removeEventListener('pointercancel',up);save();refit()};
   d.addEventListener('pointermove',mv);d.addEventListener('pointerup',up);d.addEventListener('pointercancel',up)});
  d.querySelector('.lrz').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const g=geom(id),W=stage().clientWidth,H=stage().clientHeight,x0=e.clientX,y0=e.clientY,p=P[id],e0=el(),
    s0=g.s||1,w0=(g.w||0)*W,h0=(g.h||0)*H,vw0=e0.offsetWidth*s0,vh0=e0.offsetHeight*s0,t=e.currentTarget;t.setPointerCapture(e.pointerId);
   const mv=ev=>{const dx=ev.clientX-x0,dy=ev.clientY-y0;
     if(p.m==='free'){g.w=clamp((w0+dx)/W,p.min[0]/W,1);g.h=clamp((h0+dy)/H,p.min[1]/H,1)}
     else g.s=clamp(s0*Math.max((vw0+dx)/vw0,(vh0+dy)/vh0),MIN_S,MAX_S);apply(id)},
    up=()=>{t.removeEventListener('pointermove',mv);t.removeEventListener('pointerup',up);t.removeEventListener('pointercancel',up);save();refit()};
   t.addEventListener('pointermove',mv);t.addEventListener('pointerup',up);t.addEventListener('pointercancel',up)});
  return d}
 function loop(){if(!on)return;const sr=stage().getBoundingClientRect(),seen=new Set();
  for(const id in P){if(!here(id))continue;const el=$(id);if(!el||el.hidden)continue;const r=el.getBoundingClientRect();if(r.width<4||r.height<4)continue;seen.add(id);
   let d=ovs.get(id);if(!d){d=mkOv(id);ovs.set(id,d)}const off=el.classList.contains('lay-off');d.classList.toggle('off',off);
   d.style.cssText='left:'+(r.left-sr.left)+'px;top:'+(r.top-sr.top)+'px;width:'+r.width+'px;height:'+r.height+'px';
   d.querySelector('.lt').textContent=P[id].i+' '+P[id].n;d.title=P[id].n;const x=d.querySelector('.lx');x.textContent=off?'👁':'✕';x.title=off?'Mostrar':'Ocultar'}
  for(const[id,d]of ovs)if(!seen.has(id)){d.remove();ovs.delete(id)}
  raf=requestAnimationFrame(loop)}
 function toggle(id){const g=cur(id,true);g.off=!g.off;save();apply(id);refit();chips()}
 function chips(){if(!bar)return;bar.querySelector('.lc').innerHTML=Object.keys(P).filter(here).map(id=>{const el=$(id),off=el&&el.classList.contains('lay-off');
   return`<button type="button" data-p="${id}" class="${off?'':'on'}" title="${off?'Mostrar':'Ocultar'}">${P[id].i} ${P[id].n} ${off?'🚫':'👁'}</button>`}).join('')}
 function reset(){delete S[ctx()];save();applyAll();chips()}
 function edit(v){if(v===on)return;on=v;document.body.classList.toggle('lay-edit',on);
  if(on){if(!bar){bar=document.createElement('div');bar.id='laybar';
    bar.innerHTML='<b>🧩 Editar interfaz</b><span class="lh">Arrastra un panel para moverlo · tira de la esquina ◢ para cambiar su tamaño · ✕ lo oculta</span><div class="lc"></div><button type="button" data-a="reset">↺ Restablecer</button><button type="button" data-a="done" class="ok">✔ Listo</button>';
    const hb=bar.querySelector('b');hb.title='Arrastra para mover esta barra';hb.addEventListener('pointerdown',e=>{e.preventDefault();hb.setPointerCapture(e.pointerId);const r=bar.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;
     const mv=ev=>{css(bar,{left:clamp(ev.clientX-dx,0,innerWidth-r.width)+'px',top:clamp(ev.clientY-dy,0,innerHeight-r.height)+'px',transform:'none'})},up=()=>{hb.removeEventListener('pointermove',mv);hb.removeEventListener('pointerup',up)};hb.addEventListener('pointermove',mv);hb.addEventListener('pointerup',up)});
    bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.p)toggle(b.dataset.p);else if(b.dataset.a==='reset')reset();else if(b.dataset.a==='done')edit(false)});document.body.appendChild(bar)}
   ['left','top','transform'].forEach(k=>bar.style.removeProperty(k));bar.hidden=false;chips();G.paused=true;raf=requestAnimationFrame(loop)}
  else{cancelAnimationFrame(raf);if(bar)bar.hidden=true;ovs.forEach(d=>d.remove());ovs.clear();if(typeof Win!=='undefined')Win.unpause();else G.paused=false}}
 /* ---------- arranque ---------- */
 const b=document.createElement('button');b.id='layb';b.type='button';b.title='Mover, cambiar de tamaño u ocultar los paneles de la pantalla';b.textContent='🧩 Interfaz';b.onclick=()=>edit(!on);$('#top').appendChild(b);
 addEventListener('resize',applyAll);
 new MutationObserver(()=>{applyAll();if(on)chips()}).observe(document.body,{attributes:true,attributeFilter:['class']});
 {let last=false;new MutationObserver(()=>{const c=$('#chat').classList.contains('col');if(c!==last){last=c;apply('#chat')}}).observe($('#chat'),{attributes:true,attributeFilter:['class']})}
 {let q=0;const ro=new ResizeObserver(()=>{cancelAnimationFrame(q);q=requestAnimationFrame(()=>Object.keys(P).forEach(apply))});Object.keys(P).forEach(id=>{const el=$(id);if(el)ro.observe(el)})}
 addEventListener('keydown',e=>{if(e.key==='Escape'&&on){e.stopPropagation();edit(false)}},true);
 applyAll();
 return{P,edit,reset,apply,applyAll,moved:id=>{const el=$(id);return!!el&&(el.classList.contains('lay-on')||el.classList.contains('lay-off'))}}})();
