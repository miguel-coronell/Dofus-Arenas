/* Utilidades + Registry. Para agregar contenido: Registry.add('chars'|'arenas'|'spells'|'monsters', id, definicion) */
const CFG={
 spriteH:80,                                  // ALTURA (unidades de juego) de TODOS los personajes y monstruos → mismo tamaño siempre. Bájalo para hacerlos más pequeños.
 zoomMin:.4,zoomMax:3,                        // límites del zoom
 tileD:12                                     // grosor (unidades) del borde del tablero
};
const OL='#1b1410';                           // color de contorno
const $=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),rn=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const P=(x,y)=>[(x-y)*32,(x+y)*16];           // celda -> pantalla (isométrico 2:1)
const md=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const Registry={chars:{},objs:{},arenas:{},spells:{},monsters:{},classes:{},sets:{},add(t,id,d){this[t][id]={id,...d}}};
function poly(g,pts,f,line){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();if(f){g.fillStyle=f;g.fill()}if(line){g.strokeStyle=line;g.lineWidth=1;g.stroke()}}
const lerp=(a,b,t)=>a+(b-a)*t;
const hh=(x,y,s)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul((s|0)+7,2246822519);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
