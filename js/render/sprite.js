/* sprite.js · dibuja personajes y monstruos PNG. TODOS salen con la misma altura (CFG.spriteH).
   - El PNG debe tener fondo transparente y mirar a la DERECHA.
   - Al cargar, se mide el área visible (alfa) del PNG: se recorta sola la zona transparente y los pies quedan en el borde inferior,
     así cualquier PNG nuevo sale del mismo tamaño y bien apoyado, sin tener que calcular ax/ay.
   - Opcionales en la definición: scale (multiplicador de tamaño, 1 por defecto) · sprite.ax (x de los pies en el PNG, si no está centrado).
   - Se anima por código: respira, rebota al caminar, estocada al atacar, se eleva al lanzar y parpadea al recibir daño. */
const IMG={};
function spriteInfo(src){let o=IMG[src];if(o)return o;const im=new Image();o=IMG[src]={im,ok:false,bad:false};
 im.onload=()=>{const W=im.naturalWidth,H=im.naturalHeight;let bb=[0,0,W,H];
  try{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,W,H).data;
   let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++)if(d[(y*W+xx)*4+3]>16){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1>=0)bb=[x0,y0,x1+1,y1+1]}catch(err){/* abierto como file:// → sin lectura de píxeles: se usa la imagen completa */}
  o.bb=bb;o.ok=true};
 im.onerror=()=>{o.bad=true};im.src=src;return o}
const entH=e=>CFG.spriteH*(e.def.scale||1);            // altura en pantalla de la entidad (también ubica nombre y barra de vida)
function pose(e,t){const mv=e.path.length>0,ph=t*11+e.seed;
 return{mv,ph,a:e.atk>0?Math.sin((1-e.atk)*Math.PI):0,bob:mv?-Math.abs(Math.sin(ph))*5:Math.sin(t*2.2+e.seed)*1.2,sq:mv?1+Math.sin(ph*2)*.03:1+Math.sin(t*2.2+e.seed)*.015}}
function drawSprite(g,e,t){const s=e.def.sprite,o=s.tint?tintInfo(s.src,s.tint):spriteInfo(s.src);if(o.bad)return drawPlaceholder(g,e,t);if(!o.ok)return;
 const[x0,y0,x1,y1]=o.bb,k=entH(e)/(y1-y0),ax=s.ax!=null?s.ax:(x0+x1)/2,{mv,ph,a,bob,sq}=pose(e,t),sw=(x1-x0)*k;
 g.save();g.scale(e.face,1);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,2,clamp(sw*.38,12,24),7,0,0,7);g.fill();
 if(e.hurt>0){g.translate(-e.hurt*7,0);g.globalAlpha=.55+.45*Math.abs(Math.sin(e.hurt*30))}
 g.translate(a*14,bob-(e.cast>0?6:0));g.rotate((mv?Math.sin(ph)*.06:0)+a*.15);g.scale(1/sq,sq);
 g.drawImage(o.im,x0,y0,x1-x0,y1-y0,(x0-ax)*k,-(y1-y0)*k,(x1-x0)*k,(y1-y0)*k);g.restore()}
/* Marcador para cuando aún no hay PNG de monstruo (o el PNG no se encuentra) */
function drawPlaceholder(g,e,t){const H=entH(e),{a,bob}=pose(e,t);g.save();g.scale(e.face,1);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,2,18,7,0,0,7);g.fill();
 if(e.hurt>0){g.translate(-e.hurt*7,0);g.globalAlpha=.55+.45*Math.abs(Math.sin(e.hurt*30))}g.translate(a*14,bob);
 g.fillStyle=OL;g.beginPath();g.ellipse(0,-H*.42,H*.3+2,H*.4+2,0,0,7);g.fill();g.fillStyle='#6b4a8f';g.beginPath();g.ellipse(0,-H*.42,H*.3,H*.4,0,0,7);g.fill();
 g.fillStyle='#fff';g.font='bold '+Math.round(H*.4)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.scale(e.face,1);g.fillText(e.ico||'?',0,-H*.42);g.restore()}
/* sprite.ring = color de atuendo del personaje: anillo bajo los pies (los héroes) · sprite.tint = índice de LOOK.out para recolorear */
const drawEntity=(g,e,t)=>{const s=e.def.sprite;if(s&&s.ring){g.save();g.beginPath();g.ellipse(0,2,24,9,0,0,7);g.lineWidth=3;g.strokeStyle=s.ring;g.globalAlpha=.85;g.stroke();g.restore()}(s?drawSprite:drawPlaceholder)(g,e,t)};
