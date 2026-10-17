/* boot.js · carga el juego SOLO cuando hay una sesión iniciada.
   Los <script type="text/game" src="…"> de index.html son el listado oficial (el navegador no los ejecuta solo): aquí se cargan EN ORDEN.
   Para añadir una arena, un objeto o un monstruo nuevo sigue igual que siempre: añade su <script type="text/game" src="…"> en index.html. */
const Boot={done:false,
 run(){if(Boot.done)return Promise.resolve();
  const L=[...document.querySelectorAll('script[type="text/game"]')].map(o=>o.getAttribute('src'));
  return Promise.all(L.map(src=>new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.async=false;   // async=false → se ejecutan en el orden del HTML
   s.onload=ok;s.onerror=()=>ko(new Error('No se pudo cargar '+src));document.body.appendChild(s)}))).then(()=>{Boot.done=true})}};
