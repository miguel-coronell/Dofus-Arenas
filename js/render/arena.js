/* arena.js · dibuja el fondo, el TABLERO DE BALDOSAS de la arena actual (forma y tamaño propios, ver js/game/maps.js) y sus obstáculos.
   Todo se dibuja por código con los colores del tema de la arena (A.theme): no hace falta ningún PNG.
   Fondo: degradado + la imagen assets/arenas/<x>.jpg muy suavizada (solo ambiente). */
const ART={};
function artImage(src){let o=ART[src];if(o)return o;const im=new Image();o=ART[src]={im,ok:false};im.onload=()=>{
  const sm=document.createElement('canvas');sm.width=170;sm.height=Math.max(8,Math.round(170*im.naturalHeight/im.naturalWidth));sm.getContext('2d').drawImage(im,0,0,sm.width,sm.height);o.sm=sm;o.ok=true};
 im.onerror=()=>{o.bad=true};im.src=src;return o}
/* IMAGEN DEL MAPA nítida (sin difuminar) en coordenadas del mundo: las celdas se dibujan encima (drawGround) */
function drawArt(g,A){return;/* la imagen ya no se dibuja como ventana enmarcada: ahora llena toda la pantalla (drawBg) */const o=A.art&&artImage(A.art.src);if(!o||!o.ok||!A.box)return;const b=A.box,m=150,bw=b.x1-b.x0+2*m,bh=b.y1-b.y0+2*m,iw=o.im.naturalWidth,ih=o.im.naturalHeight,k=Math.max(bw/iw,bh/ih),w=iw*k,h=ih*k,x=A.cx-w/2,y=A.cy-h/2;
 g.save();g.beginPath();g.roundRect(A.cx-bw/2,A.cy-bh/2,bw,bh,26);g.clip();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(o.im,x,y,w,h);
 const v=g.createRadialGradient(A.cx,A.cy,Math.min(bw,bh)*.35,A.cx,A.cy,Math.max(bw,bh)*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.4)');g.fillStyle=v;g.fillRect(A.cx-bw/2,A.cy-bh/2,bw,bh);g.restore();
 g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=4;g.beginPath();g.roundRect(A.cx-bw/2,A.cy-bh/2,bw,bh,26);g.stroke()}
function drawBg(g,A,t,W,H){
 const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,A.bg[0]);gr.addColorStop(1,A.bg[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
 const o=A.art&&artImage(A.art.src);
 if(o&&o.ok){const iw=o.im.naturalWidth,ih=o.im.naturalHeight,c=Math.max(W/iw,H/ih);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(o.im,(W-iw*c)/2,(H-ih*c)/2,iw*c,ih*c)}   // imagen PNG/JPG GRANDE y nítida, cubre todo el escenario
 const v=g.createRadialGradient(W/2,H*.46,Math.min(W,H)*.2,W/2,H*.5,Math.max(W,H)*.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.38)');g.fillStyle=v;g.fillRect(0,0,W,H);
 for(let i=0;i<30;i++){const s=(i*.6180339)%1,p=(s+t*(.03+(i%5)*.012))%1,x=((i*.37)%1)*W+Math.sin(t+i)*18;g.save();
  if(A.fx==='ember'){g.globalAlpha=1-p;g.fillStyle=i%2?'#ff9a3a':'#ffd24a';g.beginPath();g.arc(x,H*(1-p),2+i%3,0,7);g.fill()}
  else if(A.fx==='leaf'){g.globalAlpha=.8;g.fillStyle=i%2?'#9fe06a':'#d9b04a';g.translate(x,H*p);g.rotate(t+i);g.fillRect(-4,-2,8,4)}
  else if(A.fx==='bubble'){g.globalAlpha=.6*(1-p);g.strokeStyle='#d8f4ff';g.lineWidth=1.5;g.beginPath();g.arc(x,H*(1-p),3+i%5,0,7);g.stroke()}
  else if(A.fx==='cloud'){g.globalAlpha=.2;g.fillStyle='#fff';const cx=((s+t*.02*(1+i%3))%1.3-.15)*W,cy=(i*.173%1)*H*.7;g.beginPath();g.ellipse(cx,cy,50+i%4*14,14+i%3*5,0,0,7);g.fill()}
  else{g.globalAlpha=.35*(1-p);g.fillStyle='#fff';g.fillRect(x,H*(1-p),2,2)}
  g.restore()}}

/* ---------- baldosas ---------- */
const TILE=(cx,cy,k)=>[[cx,cy-16*k],[cx+32*k,cy],[cx,cy+16*k],[cx-32*k,cy]];
/* recorre las celdas de atrás hacia delante (diagonales x+y crecientes) */
function eachCell(A,fn){const w=A.w,h=A.h;for(let s=0;s<=w+h-2;s++)for(let x=Math.max(0,s-h+1);x<=Math.min(w-1,s);x++){const y=s-x,v=A.k[y*w+x];if(v)fn(x,y,v,A.o[y*w+x])}}
function drawGround(g,A,hl,t){const T=A.theme,w=A.w,h=A.h,D=CFG.tileD,has=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&A.k[y*w+x]!==0;t=t||0;
 /* 2) baldosas (ajedrezado) + agujeros + agua/lava */
 eachCell(A,(x,y,v,c)=>{const[cx,cy]=P(x,y);
  if(c==='~')return liquid(g,T,cx,cy,x,y,t);
  g.save();g.globalAlpha=(x+y)&1?.3:.2;poly(g,TILE(cx,cy,1),(x+y)&1?T.t[0]:T.t[1]);g.restore();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1.2;g.beginPath();TILE(cx,cy,1).forEach((q,n)=>n?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.stroke();
  if(c==='o')pit(g,T,cx,cy)});
 /* 3) celdas resaltadas (azul = moverte · naranja = alcance) */
 eachCell(A,(x,y,v)=>{const k=x+','+y;if(hl[k]&&v===1){const[cx,cy]=P(x,y);poly(g,TILE(cx,cy,.94),hl[k])}})}
/* agujero: borde de la baldosa + hueco oscuro con las dos paredes del fondo a la vista */
function pit(g,T,cx,cy){const q=TILE(cx,cy,.84);g.save();g.beginPath();q.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=T.pit[1];g.fill();g.clip();
 g.fillStyle=T.pit[0];g.beginPath();TILE(cx,cy+9,.9).forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.restore();
 g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=1.2;g.beginPath();q.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.stroke()}
/* agua o lava: hundida respecto al suelo, con brillo animado */
function liquid(g,T,cx,cy,x,y,t){poly(g,TILE(cx,cy,1),T.sd[1],T.ln);const q=TILE(cx,cy+1.5,.9),w=.5+.5*Math.sin(t*1.6+x*.9+y*.7);
 g.beginPath();q.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=T.liq[0];g.fill();
 g.save();g.clip();g.globalAlpha=.25+.3*w;g.fillStyle=T.liq[1];g.beginPath();g.ellipse(cx+Math.sin(t+x)*9,cy+2+Math.cos(t*.8+y)*3,15,5,0,0,7);g.fill();
 g.globalAlpha=.18;g.strokeStyle='#fff';g.lineWidth=1;g.beginPath();g.moveTo(cx-16,cy-2+w*3);g.quadraticCurveTo(cx,cy-6+w*3,cx+16,cy-2+w*3);g.stroke();g.restore()}

/* ---------- obstáculos (se dibujan de pie, ordenados con los personajes por x+y) ---------- */
/* prisma isométrico sobre la celda: w = ancho (1 = celda entera) · hg = altura · c = [cara de arriba, lado izquierdo, lado derecho] */
function prism(g,cx,cy,w,hg,c,z){z=z||0;const a=32*w,b=16*w,y=cy-z;
 poly(g,[[cx-a,y],[cx,y+b],[cx,y+b-hg],[cx-a,y-hg]],c[1],OL);poly(g,[[cx,y+b],[cx+a,y],[cx+a,y-hg],[cx,y+b-hg]],c[2],OL);poly(g,[[cx,y-b-hg],[cx+a,y-hg],[cx,y+b-hg],[cx-a,y-hg]],c[0],OL)}
const shadow=(g,cx,cy,r)=>{g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx,cy+2,r,r*.42,0,0,7);g.fill()};
const OH={'#':44,c:34,t:92,p:70,m:52,f:22};     // altura aprox. de cada obstáculo (para PNG propios)
function drawObs(g,A,x,y,t){const c=A.o[y*A.w+x];if(!c||c==='o'||c==='~')return;const T=A.theme,[cx,cy]=P(x,y),B=Registry.obstacles[c];if(B&&B.st&&typeof Hub!=='undefined')return Hub.drawStation(g,B,cx,cy,t);
 if(B&&B.png){const s=spriteInfo('assets/obstacles/'+B.id+'.png');if(s.ok&&!s.bad){const[x0,y0,x1,y1]=s.bb,k=(OH[c]||44)/(y1-y0);g.drawImage(s.im,x0,y0,x1-x0,y1-y0,cx-(x1-x0)*k/2,cy+8-(y1-y0)*k,(x1-x0)*k,(y1-y0)*k);return}}
 if(c==='#')return rock(g,T,cx,cy,x,y);
 if(c==='c')return crate(g,T,cx,cy);
 if(c==='t')return tree(g,T,cx,cy,x,y,t);
 if(c==='p')return pillar(g,T,cx,cy);
 if(c==='m')return wall(g,T,cx,cy);
 if(c==='f')return fence(g,T,cx,cy)}
function rock(g,T,cx,cy,x,y){const c=T.rock,h=hh(x,y,5)*6;shadow(g,cx,cy,27);
 poly(g,[[cx-22,cy],[cx-27,cy-16],[cx-12,cy-31-h],[cx+8,cy-36],[cx+24,cy-22],[cx+27,cy-4],[cx+10,cy+8],[cx-10,cy+8]],c[1],OL);
 poly(g,[[cx-27,cy-16],[cx-12,cy-31-h],[cx+8,cy-36],[cx+2,cy-18],[cx-12,cy-10]],c[0]);poly(g,[[cx+8,cy-36],[cx+24,cy-22],[cx+27,cy-4],[cx+10,cy+8],[cx+4,cy-14]],c[2])}
function crate(g,T,cx,cy){const c=T.wood;shadow(g,cx,cy,26);prism(g,cx,cy,.74,28,c);
 g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.3;g.beginPath();const a=32*.74,b=16*.74;                      // tablones
 g.moveTo(cx-a/2,cy+b/2-28*.5);g.lineTo(cx-a/2,cy+b/2+0);g.moveTo(cx+a/2,cy+b/2-28*.5);g.lineTo(cx+a/2,cy+b/2);g.moveTo(cx-a,cy-14);g.lineTo(cx,cy+b-14);g.lineTo(cx+a,cy-14);g.stroke()}
function wall(g,T,cx,cy){const c=T.stone;shadow(g,cx,cy,30);prism(g,cx,cy,.97,50,c);
 g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=1;g.beginPath();for(const hgt of[12,25,38]){g.moveTo(cx-31,cy-hgt);g.lineTo(cx,cy+15-hgt);g.lineTo(cx+31,cy-hgt)}g.stroke();
 poly(g,[[cx-30,cy-51],[cx,cy-36],[cx,cy-33],[cx-30,cy-48]],T.lip||'rgba(0,0,0,0)')}                        // musgo arriba
function pillar(g,T,cx,cy){const c=T.stone;shadow(g,cx,cy,20);prism(g,cx,cy,.62,8,c);prism(g,cx,cy,.42,62,c,8);prism(g,cx,cy,.58,9,c,62)}
function fence(g,T,cx,cy){const c=T.wood;shadow(g,cx,cy,26);
 for(const[px,py]of[[-20,2],[-7,9],[7,9],[20,2]]){prism(g,cx+px,cy+py-6,.13,18,c)}
 g.strokeStyle=c[1];g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(cx-20,cy-8);g.lineTo(cx-7,cy-1);g.lineTo(cx+7,cy-1);g.lineTo(cx+20,cy-8);g.moveTo(cx-20,cy-14);g.lineTo(cx-7,cy-7);g.lineTo(cx+7,cy-7);g.lineTo(cx+20,cy-14);g.stroke();g.lineCap='butt'}
function tree(g,T,cx,cy,x,y,t){shadow(g,cx,cy,24);const sw=Math.sin((t||0)*1.3+x+y)*1.6;
 if(T.palm){g.strokeStyle=T.trunk;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(cx-2,cy+6);g.quadraticCurveTo(cx+8,cy-32,cx+3+sw,cy-62);g.stroke();g.lineCap='butt';
  const tx=cx+3+sw,ty=cy-62;for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.3;g.strokeStyle=i%2?T.leaf[0]:T.leaf[1];g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(a)*18,ty-8+Math.sin(a)*4,tx+Math.cos(a)*34,ty+8+Math.sin(a)*10);g.stroke()}g.lineCap='butt';return}
 g.fillStyle=T.trunk;g.strokeStyle=OL;g.lineWidth=1.2;g.beginPath();g.moveTo(cx-6,cy+6);g.lineTo(cx-4,cy-34);g.lineTo(cx+4,cy-34);g.lineTo(cx+7,cy+6);g.closePath();g.fill();g.stroke();
 for(const[dx,dy,r,i]of[[-14,-48,17,1],[14,-48,17,1],[0,-62,20,1],[-8,-76,16,0],[10,-72,15,0],[0,-52,19,0]]){g.fillStyle=T.leaf[i];g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.beginPath();g.arc(cx+dx+sw*(dy<-60?1:.5),cy+dy,r,0,7);g.fill();g.stroke()}}
