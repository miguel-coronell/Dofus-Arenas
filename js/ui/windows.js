/* ui/windows.js · barra de ventana tipo sistema operativo (— minimizar · ▢ maximizar · ✕ cerrar) para TODAS las ventanas del juego.
   Cada ventana se vuelve a dibujar entera al cambiar de pestaña, así que un observador le vuelve a poner la barra. Las minimizadas quedan como pestañas en la barra #dock (arriba a la izquierda). */
const WIN={'#result':{p:'.rwin',t:'Resultado',i:'🏆'},'#inv':{p:'.dt-inv',t:'Inventario',i:'🎒'},'#jobs':{p:'.st-win',t:'Oficios',i:'🔨'},'#mkt':{p:'.st-win',t:'Supermercado',i:'🛒'},
 '#spells':{p:'.st-win',t:'Hechizos',i:'✨'},'#sheet':{p:'.panel',t:'Personaje',i:'📈'},'#sets':{p:'.st-win',t:'Sets',i:'🎽'},'#party':{p:'.st-win',t:'Equipo',i:'👥'},'#dung':{p:'.st-win',t:'Mazmorras',i:'🏰'},'#colo':{p:'.st-win',t:'Coliseo',i:'⚔️'}};
const Win={
 unpause(){if(!overlayOpen())G.paused=false},
 close(id){const el=$(id);el.hidden=true;Win.chip(id,false);el.classList.remove('max');
  if(id==='#inv'){cancelAnimationFrame(INV.raf)}Win.unpause();if(id==='#result'&&G.over&&!G.hub)Hub.enter()},
 min(id){const el=$(id);el.hidden=true;el.dataset.min='1';Win.chip(id,true);Win.unpause()},
 max(id){const el=$(id);el.classList.toggle('max');const b=el.querySelector('.wc [data-w="max"]');if(b)b.textContent=el.classList.contains('max')?'❐':'▢'},
 restore(id){const el=$(id);Win.chip(id,false);el.hidden=false;if(id==='#inv'&&typeof invAnim==='function')invAnim();G.paused=true},
 chip(id,on){const d=$('#dock'),k=d.querySelector('[data-w="'+id+'"]');$(id).dataset.min=on?'1':'';if(!on){if(k)k.remove();return}if(k)return;
  const b=document.createElement('button');b.dataset.w=id;b.textContent=WIN[id].i+' '+WIN[id].t;b.title='Restaurar';b.onclick=()=>Win.restore(id);d.appendChild(b)},
 bar(id){const el=$(id),P=el.querySelector(WIN[id].p);if(!P||P.querySelector(':scope>.wc'))return;const w=document.createElement('div');w.className='wc';
  w.innerHTML='<button data-w="min" title="Minimizar">—</button><button data-w="max" title="Maximizar / restaurar">'+(el.classList.contains('max')?'❐':'▢')+'</button><button data-w="x" class="x" title="Cerrar (Esc)">✕</button>';
  w.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();const k=b.dataset.w;if(k==='x')Win.close(id);else if(k==='min')Win.min(id);else Win.max(id)});
  w.addEventListener('pointerdown',e=>e.stopPropagation());P.prepend(w)}};
for(const id in WIN){const el=$(id);new MutationObserver(()=>{Win.bar(id);if(!el.hidden&&el.dataset.min){el.dataset.min='';const k=$('#dock').querySelector('[data-w="'+id+'"]');if(k)k.remove()}}).observe(el,{childList:true,attributes:true,attributeFilter:['hidden']});Win.bar(id)}
/* Esc cierra la ventana que esté arriba */
addEventListener('keydown',e=>{if(e.key!=='Escape')return;const open=Object.keys(WIN).filter(id=>!$(id).hidden).sort((a,b)=>(+getComputedStyle($(b)).zIndex||0)-(+getComputedStyle($(a)).zIndex||0));if(open.length){e.preventDefault();Win.close(open[0])}});
