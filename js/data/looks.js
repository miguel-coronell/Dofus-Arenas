/* looks.js · ASPECTO del personaje (creación, carrusel, retrato, color del sprite).
   look = {f:cara 0-7, h:peinado 0-7, s:piel, hc:color de pelo, e:ojos, c:atuendo}  → solo índices a estas paletas (JSON mínimo, también viaja en PvP).
   Para añadir un color o un estilo: añade una entrada a su lista (no hay que tocar nada más).
   - Cara, peinado, piel, pelo y ojos se dibujan en el RETRATO (carrusel, cabecera, ventana de resultado, creador).
   - Atuendo: cambia el color del RETRATO, pinta el ANILLO bajo los pies en el combate y, si el sprite tiene zonas frías (azul/verde/violeta),
     las recolorea. Los PNG naranjas/marrones (Feca, Anutrof…) no se pueden recolorear sin máscaras: ahí solo cambia el anillo y el retrato. */
const LOOK={
 skin:['#ffe3cc','#f6cba5','#e3a979','#c98a5b','#a56a40','#7d4b2c','#b9dd8a','#bcd8f5'],
 hair:['#2b1b12','#5a3820','#8a5a2b','#c9a15a','#efe3a8','#dcdce0','#c0392b','#e0709a','#4a6fd6','#3aa66a'],
 eyes:['#3b2a1a','#2c6fbb','#2e9e5b','#8a5ad0','#c0392b','#1a1a1a'],
 /* h = tono destino (0-360) · s = multiplicador de saturación · l = luminosidad añadida · sin nada = original */
 out:[{n:'Original'},{n:'Rojo',h:358},{n:'Naranja',h:24},{n:'Amarillo',h:50},{n:'Lima',h:85},{n:'Verde',h:130},{n:'Turquesa',h:175},{n:'Celeste',h:200},{n:'Azul',h:225},{n:'Violeta',h:268},{n:'Rosa',h:318},{n:'Gris',s:.1,sw:'#8a8a94'},{n:'Oscuro',s:.8,l:-.24,sw:'#2d3140'}],
 faceN:8,hairN:8,
 faceNames:['Redonda alegre','Ovalada pícara','Cuadrada dormilona','Redonda tímida','Ovalada seria','Cuadrada simpática','Redonda feliz','Ovalada misteriosa'],
 hairNames:['Corto','Pinchos','Largo','Media melena','Coleta','Moño','Cresta','Calvo'],
 ELC:{tierra:'#b08a50',fuego:'#ff7a2a',agua:'#4fb3ff',aire:'#c9f2a0'}};
const _lk=(v,n)=>{v=Math.floor(+v);return v>=0&&v<n?v:0};
LOOK.fix=L=>{L=L||{};return{f:_lk(L.f,LOOK.faceN),h:_lk(L.h,LOOK.hairN),s:_lk(L.s,LOOK.skin.length),hc:_lk(L.hc,LOOK.hair.length),e:_lk(L.e,LOOK.eyes.length),c:_lk(L.c,LOOK.out.length)}};   // el look del rival llega por red: se sanea siempre
LOOK.random=()=>({f:Math.floor(Math.random()*LOOK.faceN),h:Math.floor(Math.random()*LOOK.hairN),s:Math.floor(Math.random()*6),hc:Math.floor(Math.random()*LOOK.hair.length),e:Math.floor(Math.random()*LOOK.eyes.length),c:0});
/* color del atuendo (retrato y anillo): Original = color del elemento de la clase */
LOOK.outColor=(L,cls)=>{L=LOOK.fix(L);const o=LOOK.out[L.c];if(o.sw)return o.sw;if(o.h!=null)return'hsl('+o.h+',68%,50%)';return LOOK.ELC[(Registry.classes[cls]||{}).el]||'#c9a15a'};
LOOK.skinColor=L=>LOOK.skin[LOOK.fix(L).s];
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
/* ---------- retrato vectorial (caras y peinados), 128×128 lógicos ---------- */
const _OL='#2a1c10',_FACES=[{j:0,e:0,b:0,m:0},{j:1,e:1,b:2,m:3},{j:2,e:2,b:1,m:2},{j:0,e:3,b:0,m:5},{j:1,e:4,b:3,m:4},{j:2,e:5,b:0,m:1},{j:0,e:6,b:2,m:1},{j:1,e:7,b:1,m:3}];
const _fill=(g,c,w)=>{g.closePath();g.fillStyle=c;g.fill();g.lineWidth=w||3;g.strokeStyle=_OL;g.lineJoin='round';g.stroke()};
const _q=(g,pts)=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=4)g.quadraticCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3])};   // curva abierta (los _fill la cierran)
const _hairBack=[null,null,g=>{_q(g,[24,70,18,14,64,14,110,14,104,70]);g.lineTo(108,118);g.quadraticCurveTo(64,128,20,118)},g=>{_q(g,[24,66,20,18,64,16,108,18,104,66]);g.lineTo(104,96);g.quadraticCurveTo(64,106,24,96)},
 g=>{g.beginPath();g.ellipse(104,66,12,24,.25,0,7)},g=>{g.beginPath();g.arc(64,17,14,0,7)},null,null];
const _hairFront=[
 g=>_q(g,[30,62,26,22,64,20,102,22,98,62,90,40,76,42,66,50,52,40,38,44,30,62]),
 g=>{g.beginPath();[[30,62],[27,34],[38,40],[40,12],[52,30],[64,6],[76,30],[88,12],[90,40],[101,34],[98,62],[88,48],[64,54],[40,48]].forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath()},
 g=>_q(g,[32,60,30,24,64,22,98,24,96,60,80,38,60,44,46,52,32,60]),
 g=>{_q(g,[30,58,28,22,64,20,100,22,98,58]);g.lineTo(90,46);g.lineTo(76,52);g.lineTo(64,44);g.lineTo(52,52);g.lineTo(38,46)},
 g=>_q(g,[30,62,26,22,64,20,102,22,98,62,90,40,76,42,66,50,52,40,38,44,30,62]),
 g=>_q(g,[30,62,26,22,64,20,102,22,98,62,90,40,76,42,66,50,52,40,38,44,30,62]),
 g=>_q(g,[52,44,48,8,64,3,80,8,76,44]),null];
function _eye(g,x,t,iris,fem,side){const y=68;g.save();g.translate(x,y);
 const ball=(rx,ry)=>{g.beginPath();g.ellipse(0,0,rx,ry,0,0,7);_fill(g,'#fff',2)},dot=(r,dx,dy)=>{g.beginPath();g.arc(dx||0,dy||0,r,0,7);g.fillStyle=iris;g.fill();g.beginPath();g.arc(dx||0,dy||0,r*.5,0,7);g.fillStyle='#111';g.fill();g.beginPath();g.arc((dx||0)+r*.35,(dy||0)-r*.35,r*.28,0,7);g.fillStyle='#fff';g.fill()};
 if(t===0){ball(7,8.5);dot(4.6)}else if(t===1){ball(8,4.8);dot(3.4)}else if(t===2){ball(7,6.5);dot(4);g.beginPath();g.ellipse(0,-3,8,4,0,Math.PI,0);g.fillStyle=LOOK._skin;g.fill();g.lineWidth=2.5;g.strokeStyle=_OL;g.stroke()}
 else if(t===3){ball(5.5,6);dot(3.5,side*-1.2)}else if(t===4){ball(7,7);dot(4.2);g.beginPath();g.moveTo(-9,-8+side*4);g.lineTo(9,-3-side*4);g.lineWidth=3;g.strokeStyle=_OL;g.stroke()}
 else if(t===5){ball(8,9.5);dot(6);g.beginPath();g.arc(-2,3,1.4,0,7);g.fillStyle='#fff';g.fill()}else if(t===6){g.beginPath();g.arc(0,2,7,Math.PI*1.1,Math.PI*1.9);g.lineWidth=3;g.strokeStyle=_OL;g.stroke()}
 else{ball(7,8);dot(4.2,side*3.5,0)}
 if(fem){g.beginPath();g.moveTo(side*7,-4);g.lineTo(side*12,-9);g.moveTo(side*8,0);g.lineTo(side*13,-2);g.lineWidth=2.2;g.strokeStyle=_OL;g.stroke()}g.restore()}
function _brow(g,x,t,side,hc){g.save();g.translate(x,54);g.beginPath();
 if(t===0){g.moveTo(-8,2);g.quadraticCurveTo(0,-5,8,2)}else if(t===1){g.moveTo(-8,0);g.lineTo(8,0)}else if(t===2){g.moveTo(-8,3);g.quadraticCurveTo(0,-8,8,-1)}else{g.moveTo(-8,-3*side);g.lineTo(8,3*side)}
 g.lineWidth=3.6;g.lineCap='round';g.strokeStyle=hc;g.stroke();g.restore()}
function _mouth(g,t){g.save();g.translate(64,89);g.lineCap='round';g.lineWidth=2.8;g.strokeStyle=_OL;g.beginPath();
 if(t===0){g.moveTo(-9,0);g.quadraticCurveTo(0,9,9,0);g.stroke()}else if(t===1){g.moveTo(-10,-1);g.quadraticCurveTo(0,13,10,-1);g.closePath();g.fillStyle='#7a2630';g.fill();g.stroke();g.beginPath();g.moveTo(-7,0);g.lineTo(7,0);g.lineWidth=4;g.strokeStyle='#fff';g.stroke()}
 else if(t===2){g.moveTo(-7,2);g.lineTo(7,2);g.stroke()}else if(t===3){g.moveTo(-8,3);g.quadraticCurveTo(2,6,9,-2);g.stroke()}else if(t===4){g.ellipse(0,3,4.5,5.5,0,0,7);g.fillStyle='#7a2630';g.fill();g.stroke()}else{g.moveTo(-5,1);g.quadraticCurveTo(0,6,5,1);g.stroke()}g.restore()}
/* dibuja el retrato en (x,y) con tamaño px */
LOOK.draw=(g,x,y,px,L,sex,cls)=>{L=LOOK.fix(L);const F=_FACES[L.f],skin=LOOK.skin[L.s],hc=LOOK.hair[L.hc],iris=LOOK.eyes[L.e],oc=LOOK.outColor(L,cls),fem=sex==='f';LOOK._skin=skin;
 g.save();g.translate(x,y);g.scale(px/128,px/128);if(_hairBack[L.h]){_hairBack[L.h](g);_fill(g,hc)}
 g.beginPath();g.moveTo(10,128);g.quadraticCurveTo(12,104,44,100);g.lineTo(84,100);g.quadraticCurveTo(116,104,118,128);g.closePath();_fill(g,oc);      // busto
 g.beginPath();g.rect(54,90,20,16);_fill(g,skin);g.beginPath();g.moveTo(50,100);g.lineTo(78,100);g.lineTo(64,116);g.closePath();_fill(g,skin,2);
 [[30,69],[98,69]].forEach(p=>{g.beginPath();g.ellipse(p[0],p[1],6.5,9,0,0,7);_fill(g,skin,2.5)});
 g.beginPath();if(F.j===0)g.ellipse(64,66,33,36,0,0,7);else if(F.j===1)g.ellipse(64,66,30,40,0,0,7);else _q(g,[32,48,32,34,64,32,96,34,96,48]),g.lineTo(96,76),g.quadraticCurveTo(94,104,64,104),g.quadraticCurveTo(34,104,32,76);_fill(g,skin);
 g.beginPath();g.moveTo(64,72);g.quadraticCurveTo(68,79,63,80);g.lineWidth=2.2;g.strokeStyle='rgba(42,28,16,.55)';g.stroke();                           // nariz
 _eye(g,50,F.e,iris,fem,-1);_eye(g,78,F.e,iris,fem,1);_brow(g,50,F.b,-1,fem?hc:hc);_brow(g,78,F.b,1,hc);_mouth(g,F.m);
 if(_hairFront[L.h]){_hairFront[L.h](g);_fill(g,hc)}else{g.beginPath();g.ellipse(52,40,6,3,-.5,0,7);g.fillStyle='rgba(255,255,255,.35)';g.fill()}g.restore()};
/* retrato en un <canvas> / como data-URL (vector: funciona también con file://) */
LOOK.portrait=(cv,L,sex,cls)=>{const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);LOOK.draw(g,0,0,cv.width,L,sex,cls)};
LOOK.url=(L,sex,cls,px)=>{try{const c=document.createElement('canvas');c.width=c.height=px||64;LOOK.portrait(c,L,sex,cls);return c.toDataURL()}catch(e){return null}};   // sin pantalla (simulador) → null
/* figura completa (sprite recoloreado + anillo de color) para carrusel y creador */
LOOK.figure=(g,w,h,cls,sex,L,t)=>{g.clearRect(0,0,w,h);L=LOOK.fix(L);const col=LOOK.outColor(L,cls),fy=h*.86,cx=w/2;
 g.save();g.translate(cx,fy);g.scale(1,.32);g.beginPath();g.arc(0,0,w*.36,0,7);g.fillStyle='rgba(0,0,0,.28)';g.fill();g.lineWidth=7;g.strokeStyle=col;g.globalAlpha=.9;g.stroke();g.restore();
 const o=tintInfo('assets/characters/'+cls+'_'+sex+'.png',L.c),bob=Math.sin((t||0)*2.2)*2;
 if(o.bad){g.font=Math.round(h*.45)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText((Registry.classes[cls]||{}).ico||'?',cx,h*.5);return}
 if(!o.ok)return;const[x0,y0,x1,y1]=o.bb,k=h*.74/(y1-y0);g.drawImage(o.im,x0,y0,x1-x0,y1-y0,cx-(x1-x0)*k/2,fy-(y1-y0)*k+bob,(x1-x0)*k,(y1-y0)*k)};
