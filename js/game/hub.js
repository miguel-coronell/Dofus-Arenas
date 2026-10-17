/* hub.js · SALA DE ESPERA: el mapa «sala» (js/data/arenas/_sala.js) donde vuelves al acabar un combate. Caminas con el clic y te acercas a las ESTACIONES (objetos interactivos) para abrirlas:
   W oficios · K supermercado · P puesto de venta · B baúl (inventario) · L libro de hechizos · A/M/V portales de combate (IA · monstruos · PvP).
   Para una estación nueva: STATION(...) en js/game/maps.js, una letra en el dibujo de _sala.js y su acción en Hub.acts.
   Los «otros jugadores» que ves pasear son SIMULADOS (personajes de relleno). Para presencia real habría que publicar la posición en Firebase (Hub.vis es la lista a rellenar). */
/* EQUIPO: hasta 3 compañeros (builds) que van contigo a combates y mazmorras. Son jugadores simulados con IA; con Firebase podrían ser personas reales. */
const Party={m:[],max:3,solo:false,builds:()=>Party.solo?[]:Party.m.slice(),has:b=>Party.m.some(x=>x.id===b.id)};   // solo = ir a mazmorras/combates sin tu equipo (se elige en el icono 🏰 de la sala)
const Hub={on:false,near:null,want:null,vis:0,
 acts:{D:()=>openDung(),Q:()=>openParty(),W:()=>openJobs(),K:()=>openShop('buy'),P:()=>openShop('lots'),B:()=>openInv(),L:()=>openSpells(),A:()=>Hub.go('ai'),M:()=>Hub.go('mob'),V:()=>Hub.go('pvp')},
 NAMES:['Kira','Bruno','Lúa','Thorn','Mizu','Tavo','Elrik','Nuria','Zeke','Aria'],
 SAY:['¡Se vende poción de vida!','¿Alguien para un duelo?','Busco Cuero Rústico','Qué caro está el mercado…','Fabricando mi set Raíz','Vengo del Volcán 🔥','GG, buen combate','¿Quién me acompaña a cazar?','Subí de oficio 🔨'],
 /* entra en la sala: tú + varios jugadores simulados paseando */
 enter(){G.bid++;if(typeof Net!=='undefined'&&Net.leave)Net.leave();Rules.init(G,Math.floor(Math.random()*2147483647));
  Object.assign(G,{pvp:null,left:false,arena:Registry.arenas.sala,hub:true,mode:'hub',over:false,fl:[],pr:[],bm:[],sel:null,busy:false,q:Promise.resolve(),weather:'none',res:null,tmax:0,tl:0,cur:null,turn:-1,round:0,nt:0,mt:0,paused:false});
  Hub.on=true;Hub.want=null;Hub.near=null;document.body.classList.add('hub');UI.result(null);if(UI.logClear)UI.logClear();
  const A=G.arena,free=A.spawn[0].slice(),me=hero(PJ,0,0,free.splice(Math.floor(Math.random()*free.length),1)[0]||[10,9],{ctl:'me'});me.face=-1;G.ents=[me];G.me=me;
  const cl=Object.keys(Registry.classes),names=Hub.NAMES.slice().sort(()=>Math.random()-.5);
  Party.m.forEach((b,i)=>{const v=hero(b,10+i,0,Hub.cell(),{ctl:'npc',vis:true,party:true,wait:1});v.hp=v.mhp;G.ents.push(v)});
  for(let i=0;i<6;i++){const c=Hub.cell(),b=PG.auto(cl[rn(0,cl.length-1)],clamp(PJ.lvl+rn(-6,10),1,PROG.maxLv),names[i]);
   const v=hero(b,i+1,0,c,{ctl:'npc',vis:true,wait:Math.random()*3});v.hp=v.mhp;G.ents.push(v)}
  Hub.vis=G.ents.length-1;Hub.cl('Bienvenido a la sala. Elige el canal abajo (General · Equipo · Comercio · Oficios) o toca a un jugador para invitarlo a tu equipo.','sys');if(typeof renderPty==='function')renderPty();mapInfo();rs();fitView();UI.hud();Hub.btn();
  UI.msg('🏛 Sala de espera · toca el suelo para caminar y acércate a los objetos que brillan (🔨 oficios · 🛒 mercado · 🎒 baúl · portales de combate)')},
 /* casilla libre al azar */
 cell(){const A=G.arena;for(let n=0;n<200;n++){const x=rn(0,A.w-1),y=rn(0,A.h-1);if(A.k[y*A.w+x]===1&&!G.ents.some(e=>Math.round(e.x)===x&&Math.round(e.y)===y))return[x,y]}return[10,9]},
 leave(){if(!Hub.on&&!G.hub)return;Hub.on=false;G.hub=false;Hub.near=null;Hub.want=null;document.body.classList.remove('hub');Hub.btn()},
 go(mode){$('#mode').value=mode;begin()},
 /* estación (letra) en la casilla */
 st(x,y){const A=G.arena;if(x<0||y<0||x>=A.w||y>=A.h)return null;const c=A.o[y*A.w+x],B=c&&Registry.obstacles[c];return B&&B.st?B:null},
 nearSt(){const p=G.me;let best=null,bd=9;if(!p||p.path.length)return null;
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const B=Hub.st(p.x+dx,p.y+dy);if(B&&Math.abs(dx)+Math.abs(dy)<bd){bd=Math.abs(dx)+Math.abs(dy);best=B}}return best?best.ch:null},
 open(c){if(!c||overlayOpen())return;const f=Hub.acts[c];if(f)f()},
 click(x,y){const p=G.me;if(!p||p.path.length)return;const V=G.ents.find(e=>e.vis&&Math.round(e.x)===x&&Math.round(e.y)===y);if(V){openParty(V.id);return}const B=Hub.st(x,y),b=bfs(p.x,p.y,80,p);
  if(B){let best=null,bd=1e9;for(const k in b.d){const[a,c]=k.split(',').map(Number);if(Math.max(Math.abs(a-x),Math.abs(c-y))<=1&&b.d[k]<bd){bd=b.d[k];best=[a,c]}}
   if(!best)return;if(bd===0){Hub.open(B.ch);return}p.path=pathTo(b,best[0],best[1]);Hub.want=B.ch;return}
  if(Rules.kind(G,x,y)!==1)return;if(b.d[x+','+y]>0){p.path=pathTo(b,x,y);Hub.want=null}},
 /* botón flotante «Abrir …» cuando estás junto a una estación */
 btn(){const el=document.getElementById('hubact');if(!el)return;const c=Hub.on?Hub.near:null,B=c&&Registry.obstacles[c];el.hidden=!B;if(B){el.textContent=B.st.ico+' Abrir '+B.n+'  [E]';el.dataset.c=c}},
 tick(dt){const p=G.me;if(!p)return;const n=Hub.nearSt();if(n!==Hub.near){Hub.near=n;Hub.btn()}
  if(!p.path.length&&Hub.want){const c=Hub.want;Hub.want=null;if(Hub.near===c)Hub.open(c)}
  for(const e of G.ents){if(!e.vis)continue;if(e.sayT>0)e.sayT-=dt;if(e.path.length)continue;e.wait-=dt;if(e.wait>0)continue;e.wait=2+Math.random()*5;
   if(e.party){if(Math.abs(e.x-p.x)+Math.abs(e.y-p.y)>2){const b=bfs(e.x,e.y,30,e),ks=Object.keys(b.d).filter(k=>{const[a,c]=k.split(',').map(Number);return Math.abs(a-p.x)+Math.abs(c-p.y)<=2&&b.d[k]>0}).sort((u,v)=>b.d[u]-b.d[v]);if(ks.length){const k=ks[0].split(',').map(Number);e.path=pathTo(b,k[0],k[1]);e.wait=.4}}continue}
   const r=Math.random();if(r<.2){const a=Chat.amb();e.say=a[0];e.sayT=3.5;Hub.cl(e.n+': '+a[0],'',a[1])}
   else{const b=bfs(e.x,e.y,r<.7?7:14,e),ks=Object.keys(b.d).filter(k=>b.d[k]>0);if(ks.length){const k=ks[rn(0,ks.length-1)].split(',').map(Number);e.path=pathTo(b,k[0],k[1])}}}},
 /* ---- chat de la sala: línea en el panel + burbuja ---- */
 cl(t,c,ch){Chat.add(ch||'general',t,c)},
 invite(id){const e=G.ents.find(x=>x.id===id&&x.vis);if(!e||e.party)return'Ya está en tu equipo';if(Party.m.length>=Party.max)return'Tu equipo está completo (máx. '+(Party.max+1)+' con tú)';
  Hub.cl('Invitaste a '+e.n+' a tu equipo…','sys','equipo');setTimeout(()=>{if(!G.hub||Party.m.length>=Party.max||e.party)return;if(Math.random()<.85){Party.m.push(e.build);e.party=true;e.say='¡Voy contigo!';e.sayT=3;Hub.cl(e.n+' se unió a tu equipo 👥','sys','equipo')}else{e.say='Ahora no puedo, ¡suerte!';e.sayT=3;Hub.cl(e.n+' rechazó la invitación','sys','equipo')}if(!$('#party').hidden)renderParty();if(typeof renderPty==='function')renderPty()},900);return null},
 kick(id){const b=Party.m.find(x=>x.id===id),e=b&&G.ents.find(x=>x.build===b);if(e)e.party=false;Party.m=Party.m.filter(x=>x!==b&&x.id!==id);Hub.cl('Saliste del equipo con '+(b?b.name:'jugador'),'sys','equipo');if(typeof renderPty==='function')renderPty()},
 /* nombre (y globo de chat) sobre cada personaje */
 plate(g,e,h,ts){g.font='bold '+13*ts+'px Trebuchet MS,sans-serif';g.textAlign='center';g.lineJoin='round';g.lineWidth=3;g.strokeStyle='#000';g.fillStyle=e===G.me?'#ffd84a':'#fff';
  const nm=e.n+(e.vis?'':'');g.strokeText(nm,0,-h-2*ts);g.fillText(nm,0,-h-2*ts);
  if(e.vis){g.font='bold '+10*ts+'px sans-serif';g.fillStyle='#9bd54a';g.strokeText('● Nv '+e.build.lvl,0,-h+11*ts);g.fillText('● Nv '+e.build.lvl,0,-h+11*ts)}
  if(e.sayT>0){const t=e.say,w=g.measureText(t).width;g.font='bold '+12*ts+'px sans-serif';const ww=g.measureText(t).width+14,y=-h-24*ts;g.fillStyle='rgba(255,255,255,.95)';g.strokeStyle='#222';g.lineWidth=2;g.beginPath();g.roundRect(-ww/2,y-12*ts,ww,20*ts,8);g.fill();g.stroke();g.fillStyle='#222';g.fillText(t,0,y+3*ts)}},
 /* dibuja una estación sobre su casilla */
 drawStation(g,B,cx,cy,t){const near=Hub.near===B.ch,fl=Math.sin(t*2.2+cx*.05)*3;shadow(g,cx,cy,26);
  if('AMV'.includes(B.ch)){g.save();g.globalAlpha=.55+.25*Math.sin(t*3);g.fillStyle=B.st.col[0];g.beginPath();g.ellipse(cx,cy,30,14,0,0,7);g.fill();g.restore()}
  prism(g,cx,cy,.72,14,B.st.col);
  g.save();g.textAlign='center';g.textBaseline='middle';g.font='34px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';g.shadowColor=near?'#ffd84a':'rgba(0,0,0,.5)';g.shadowBlur=near?18:6;g.fillText(B.st.ico,cx,cy-32+fl);g.restore();
  g.save();g.font='bold 12px Trebuchet MS,sans-serif';g.textAlign='center';g.lineJoin='round';g.lineWidth=3;g.strokeStyle='#000';g.fillStyle=near?'#ffd84a':'#fff';g.strokeText(B.n,cx,cy-60+fl);g.fillText(B.n,cx,cy-60+fl);
  if(near){g.strokeStyle='#ffd84a';g.lineWidth=3;g.beginPath();g.ellipse(cx,cy+2,34+2*Math.sin(t*5),16,0,0,7);g.stroke()}g.restore()}};
