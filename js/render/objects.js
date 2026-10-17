/* render/objects.js · dibuja trampas, glifos y bombas del mapa. PNG: assets/objects/<id>.png (si falta, se usa el icono).
   Las trampas del rival NO se ven (solo las de tu equipo); los glifos y bombas las ven todos. */
const OCL={tierra:'176,138,80',fuego:'255,122,42',agua:'79,179,255',aire:'201,242,160',neutro:'230,230,230'};
const cellPath=(g,cx,cy,k)=>{g.beginPath();g.moveTo(cx,cy-16*k);g.lineTo(cx+32*k,cy);g.lineTo(cx,cy+16*k);g.lineTo(cx-32*k,cy);g.closePath()};
const objVisible=(o,me)=>o.kind!=='trap'||!me||o.team===me.team;
function objGround(g,o,t,me){if(!objVisible(o,me))return;const d=Registry.objs[o.dk],c=OCL[d.el]||'255,255,255';
 if(o.kind==='glyph'){for(let x=o.x-d.r;x<=o.x+d.r;x++)for(let y=o.y-d.r;y<=o.y+d.r;y++)if(Rules.kind(G,x,y)===1&&Math.abs(x-o.x)+Math.abs(y-o.y)<=d.r){const[cx,cy]=P(x,y);cellPath(g,cx,cy,.94);g.fillStyle='rgba('+c+','+(.22+.08*Math.sin(t*3))+')';g.fill();g.strokeStyle='rgba('+c+',.75)';g.lineWidth=1.5;g.stroke()}}
 else{const[cx,cy]=P(o.x,o.y);cellPath(g,cx,cy,.8);g.fillStyle='rgba('+c+',.25)';g.fill();g.strokeStyle='rgba('+c+',.85)';g.lineWidth=1.5;g.setLineDash([4,3]);g.stroke();g.setLineDash([])}}
function objDraw(g,o,t,me){if(!objVisible(o,me))return;const d=Registry.objs[o.dk],s=spriteInfo('assets/objects/'+o.dk+'.png'),[cx,cy]=P(o.x,o.y),h=o.kind==='bomb'?42:34;
 g.save();if(o.kind==='trap')g.globalAlpha=.85;
 if(s.ok&&!s.bad){const[x0,y0,x1,y1]=s.bb,k=h/(y1-y0);g.drawImage(s.im,x0,y0,x1-x0,y1-y0,cx-(x1-x0)*k/2,cy+4-(y1-y0)*k,(x1-x0)*k,(y1-y0)*k)}
 else{g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,cy,16,8,0,0,7);g.fill();g.font='24px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(d.ico,cx,cy-9+Math.sin(t*2+o.x)*1.5)}
 if(o.kind==='bomb'){g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='#000';g.fillStyle='#ffd84a';g.strokeText(o.tn,cx+16,cy-26);g.fillText(o.tn,cx+16,cy-26)}
 g.restore()}
/* explosiones: círculo que se expande (G.bm, lo llena combat.js al recibir el evento 'boom') */
function drawBooms(g,list,dt){for(let i=list.length-1;i>=0;i--){const q=list[i];q.t+=dt;if(q.t>=.5){list.splice(i,1);continue}
 const f=q.t/.5,[cx,cy]=P(q.x,q.y);g.save();g.translate(cx,cy);g.scale(1,.5);g.globalAlpha=(1-f)*.7;g.fillStyle=q.c;g.beginPath();g.arc(0,0,(q.r+.7)*40*(.35+.65*f),0,7);g.fill();g.restore()}}
