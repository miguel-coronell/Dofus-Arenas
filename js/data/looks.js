/* looks.js · ASPECTO del personaje (creación, carrusel, retrato, color del sprite).
   look = {f:cara 0-7, c:atuendo}  → solo índices (JSON mínimo, también viaja en PvP).
   - CARA: son PNG que pones tú en  assets/faces/<clase>_<m|f>_<n>.png   (n = 1…LOOK.faceN, ej. feca_m_1.png, feca_m_2.png, feca_f_1.png…).
     El jugador elige entre las caras que existan para su clase y sexo. Si falta el PNG se ve el icono de la clase. Cuadrada y con fondo transparente o liso.
   - ATUENDO: cambia el color del ANILLO bajo los pies en combate y recolorea las zonas azules/verdes/violetas del sprite.
     Los PNG naranjas/marrones (Feca, Anutrof…) no se pueden recolorear sin máscaras: ahí solo cambia el anillo. */
const LOOK={
 /* h = tono destino (0-360) · s = multiplicador de saturación · l = luminosidad añadida · sin nada = original */
 out:[{n:'Original'},{n:'Rojo',h:358},{n:'Naranja',h:24},{n:'Amarillo',h:50},{n:'Lima',h:85},{n:'Verde',h:130},{n:'Turquesa',h:175},{n:'Celeste',h:200},{n:'Azul',h:225},{n:'Violeta',h:268},{n:'Rosa',h:318},{n:'Gris',s:.1,sw:'#8a8a94'},{n:'Oscuro',s:.8,l:-.24,sw:'#2d3140'}],
 faceN:8,                                  // máximo de caras por clase y sexo (assets/faces/<clase>_<m|f>_1.png … _8.png)
 ELC:{tierra:'#b08a50',fuego:'#ff7a2a',agua:'#4fb3ff',aire:'#c9f2a0'}};
const _lk=(v,n)=>{v=Math.floor(+v);return v>=0&&v<n?v:0};
LOOK.fix=L=>{L=L||{};return{f:_lk(L.f,LOOK.faceN),c:_lk(L.c,LOOK.out.length)}};   // el look del rival llega por red: se sanea siempre
LOOK.random=()=>({f:0,c:0});
/* color del atuendo (retrato y anillo): Original = color del elemento de la clase */
LOOK.outColor=(L,cls)=>{L=LOOK.fix(L);const o=LOOK.out[L.c];if(o.sw)return o.sw;if(o.h!=null)return'hsl('+o.h+',68%,50%)';return LOOK.ELC[(Registry.classes[cls]||{}).el]||'#c9a15a'};
/* ---------- recolor del sprite (zonas frías: tono ≥ 70° y ≤ 300°) ---------- */
const TINT={};
function _hsl(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2,d=M-m;if(!d)return[0,0,l];const s=d/(1-Math.abs(2*l-1));let h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;return[h,s,l]}
function _rgb(h,s,l){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];return[(r+m)*255,(g+m)*255,(b+m)*255]}
/* devuelve el sprite recoloreado (o la imagen original si no hay zonas frías / no se pueden leer los píxeles, p. ej. abriendo con file://) */
function tintInfo(src,ci){const b=spriteInfo(src);ci=_lk(ci,LOOK.out.length);if(!ci||!b.ok||b.bad)return b;const k=src+'#'+ci;let o=TINT[k];if(o)return o;o=TINT[k]={...b};
 try{const W=b.im.naturalWidth,H=b.im.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(b.im,0,0);const id=x.getImageData(0,0,W,H),d=id.data,t=LOOK.out[ci];
  let sx=0,sy=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200){const[h,s,l]=_hsl(d[i],d[i+1],d[i+2]);if(s>.18&&l>.1&&l<.95&&h>=70&&h<=300){sx+=Math.cos(h*Math.PI/180)*s;sy+=Math.sin(h*Math.PI/180)*s;n++}}
  if(n<40)return o;const base=(Math.atan2(sy,sx)*180/Math.PI+360)%360,dh=t.h!=null?t.h-base:0;
  for(let i=0;i<d.length;i+=4)if(d[i+3]){const[h,s,l]=_hsl(d[i],d[i+1],d[i+2]);if(s>.18&&l>.1&&l<.95&&h>=70&&h<=300){const q=_rgb((h+dh+360)%360,Math.min(1,s*(t.s||1)),Math.max(0,Math.min(1,l+(t.l||0))));d[i]=q[0];d[i+1]=q[1];d[i+2]=q[2]}}
  x.putImageData(id,0,0);o.im=c}catch(e){}return o}
/* ---------- CARAS (PNG) ---------- */
LOOK.faceSrc=(cls,sex,f)=>'assets/faces/'+cls+'_'+(sex==='f'?'f':'m')+'_'+(_lk(f,LOOK.faceN)+1)+'.png';
const FACE={};   // caché: src → {im,ok,bad,w:[callbacks a repintar cuando cargue]}
function faceImg(src,cb){let o=FACE[src];if(!o){const im=new Image();o=FACE[src]={im,ok:false,bad:false,w:[]};im.onload=()=>{o.ok=true;o.w.splice(0).forEach(f=>f())};im.onerror=()=>{o.bad=true;o.w.length=0};im.src=src}
 if(!o.ok&&!o.bad&&cb)o.w.push(cb);return o}
/* sin PNG: fondo oscuro + icono de la clase */
LOOK.fallback=(g,x,y,px,cls)=>{g.save();g.fillStyle='#2b241b';g.fillRect(x,y,px,px);g.font=Math.round(px*.56)+'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText((Registry.classes[cls]||{}).ico||'?',x+px/2,y+px/2+px*.04);g.restore()};
/* dibuja la cara en (x,y) con tamaño px (recorte cuadrado desde arriba) */
LOOK.draw=(g,x,y,px,L,sex,cls,cb)=>{L=LOOK.fix(L);const o=faceImg(LOOK.faceSrc(cls,sex,L.f),cb);
 if(o.ok){const w=o.im.naturalWidth,h=o.im.naturalHeight,s=Math.min(w,h);g.drawImage(o.im,(w-s)/2,0,s,s,x,y,px,px)}else LOOK.fallback(g,x,y,px,cls)};
/* retrato en un <canvas> (si el PNG aún no cargó, se repinta solo al llegar) / ruta del PNG para un <img> */
LOOK.portrait=(cv,L,sex,cls)=>{const g=cv.getContext('2d'),again=()=>{if(cv.isConnected)LOOK.portrait(cv,L,sex,cls)};g.clearRect(0,0,cv.width,cv.height);LOOK.draw(g,0,0,cv.width,L,sex,cls,again)};
LOOK.url=(L,sex,cls)=>LOOK.faceSrc(cls,sex,LOOK.fix(L).f);
/* un <img> con cara cuyo PNG no existe se cambia solo por el icono de la clase */
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('error',e=>{const t=e.target;if(!t||t.tagName!=='IMG'||t.dataset.fb)return;const m=/assets\/faces\/([a-z0-9]+)_[mf]_\d+\.png/.exec(t.getAttribute('src')||'');if(!m)return;t.dataset.fb='1';
 try{const c=document.createElement('canvas');c.width=c.height=64;LOOK.fallback(c.getContext('2d'),0,0,64,m[1]);t.src=c.toDataURL()}catch(_){}},true);
/* figura completa (sprite recoloreado + anillo de color) para carrusel y creador */
LOOK.figure=(g,w,h,cls,sex,L,t)=>{g.clearRect(0,0,w,h);L=LOOK.fix(L);const col=LOOK.outColor(L,cls),fy=h*.86,cx=w/2;
 g.save();g.translate(cx,fy);g.scale(1,.32);g.beginPath();g.arc(0,0,w*.36,0,7);g.fillStyle='rgba(0,0,0,.28)';g.fill();g.lineWidth=7;g.strokeStyle=col;g.globalAlpha=.9;g.stroke();g.restore();
 const o=tintInfo('assets/characters/'+cls+'_'+sex+'.png',L.c),bob=Math.sin((t||0)*2.2)*2;
 if(o.bad){g.font=Math.round(h*.45)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText((Registry.classes[cls]||{}).ico||'?',cx,h*.5);return}
 if(!o.ok)return;const[x0,y0,x1,y1]=o.bb,k=h*.74/(y1-y0);g.drawImage(o.im,x0,y0,x1-x0,y1-y0,cx-(x1-x0)*k/2,fy-(y1-y0)*k+bob,(x1-x0)*k,(y1-y0)*k)};
