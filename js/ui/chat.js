/* ui/chat.js · CHAT POR CANALES (sala de espera Y combates, el mismo panel abajo a la izquierda).
   Canales: 🌐 General · ⚔️ Combate · 👥 Equipo · 🛒 Comercio · 🔨 Oficios (+ pestaña «Todo» que los mezcla).
   · Clic en una pestaña = ver ese canal y hablar por él. También puedes elegir el canal en el desplegable junto a la caja de texto.
   · Atajos al escribir: /g general · /e equipo · /c comercio · /o oficios · /cb combate  (ej.: «/e voy por la izquierda»). Enter o / enfocan el chat.
   · Combate: lo que pasa en la pelea (turnos, hechizos, daños) sale en la pestaña Combate; ahí también puedes escribir durante la pelea.
   · Equipo: solo hablas con tu grupo 👥 (si no tienes, el chat te avisa). Los compañeros son simulados y te responden.
   · Con Firebase configurado (js/net/firebase-config.js) General, Comercio y Oficios son SALAS REALES compartidas con otros jugadores,
     y en PvP el canal Combate habla con tu rival. Sin Firebase, los otros jugadores de la sala son simulados.
   API para el resto del juego: Chat.add(canal, texto, clase) · Chat.clear(canal) · Chat.amb() frase ambiental [texto, canal] */
const Chat={
 CH:{todo:['Todo','💬','#e6e0d0'],general:['General','🌐','#e6e0d0'],combate:['Combate','⚔️','#ff9a90'],equipo:['Equipo','👥','#8fd0ff'],comercio:['Comercio','🛒','#ffd24a'],oficios:['Oficios','🔨','#c9a0ff']},
 TABS:['todo','general','combate','equipo','comercio','oficios'],SAYS:['general','equipo','comercio','oficios','combate'],
 CMD:{g:'general',gen:'general',e:'equipo',eq:'equipo',c:'comercio',co:'comercio',o:'oficios',of:'oficios',cb:'combate',f:'combate'},
 tab:'todo',say:'general',msgs:[],un:{},col:false,keys:new Set(),
 /* frases de los jugadores simulados de la sala, por canal */
 AMB:{general:['¿Alguien para un duelo?','Qué caro está el mercado…','Vengo del Volcán 🔥','GG, buen combate','¿Quién me acompaña a cazar?','¡Hola a todos!'],
  comercio:['Se vende poción de vida','Compro Cuero Rústico x20','Vendo pieza de set Raíz, MP','Cambio colmillos por perlas','Compro Pan de Incarnam','Oferta: poción de maná 😉'],
  oficios:['Fabricando mi set Raíz','Subí de oficio 🔨','Busco joyero para un anillo','El forjador sube lento…','Alquimista nivel 10 ya!','¿Quién fabrica pociones?']},
 MATE:['¡Entendido! 👍','Voy contigo','Yo te cubro','Cuidado con el jefe','Tengo poco PA, ojo','¡Vamos a por ellos!','Listo cuando quieras'],
 amb(){const r=Math.random(),ch=r<.5?'general':r<.8?'comercio':'oficios',L=Chat.AMB[ch];return[L[rn(0,L.length-1)],ch]},
 /* compañeros que hablan por el canal Equipo: los de la sala o los que van en el combate */
 mates(){return(typeof Party!=='undefined'?(G.hub?Party.m:Party.builds()):[])},
 inFight:()=>!G.hub&&G.mode!=='hub',
 /* ---------- mensajes ---------- */
 add(ch,t,cls){if(!Chat.CH[ch])ch='general';if(cls==='sys'&&Chat.msgs.slice(-6).some(x=>x.ch===ch&&x.t===t))return;const m={ch,t:String(t),c:cls||''};Chat.msgs.push(m);if(Chat.msgs.length>400)Chat.msgs.shift();
  const show=!Chat.col&&(Chat.tab==='todo'||Chat.tab===ch);if(show)Chat.line(m,true);else if(cls!=='rd'&&cls!=='cast'){Chat.un[ch]=(Chat.un[ch]||0)+1;Chat.tabs()}},
 clear(ch){Chat.msgs=Chat.msgs.filter(m=>m.ch!==ch);Chat.render()},
 line(m,scroll){const l=$('#chl');if(!l)return;const d=document.createElement('div');d.className='lg '+m.c+' ch-'+m.ch;
  if(Chat.tab==='todo'){const g=document.createElement('i');g.className='ch-tag';g.textContent=Chat.CH[m.ch][1];d.appendChild(g)}
  d.appendChild(document.createTextNode(m.t));l.appendChild(d);while(l.children.length>160)l.firstChild.remove();if(scroll)l.scrollTop=l.scrollHeight},
 render(){const l=$('#chl');if(!l)return;l.textContent='';Chat.msgs.filter(m=>Chat.tab==='todo'||m.ch===Chat.tab).slice(-150).forEach(m=>Chat.line(m));l.scrollTop=l.scrollHeight},
 tabs(){const b=$('#chtabs');if(!b)return;b.innerHTML=Chat.TABS.map(k=>{const c=Chat.CH[k],n=Chat.un[k]|0;
   return`<button type="button" data-ch="${k}" class="${k===Chat.tab?'on':''}" title="${c[0]}${k==='todo'?' (todos los canales)':''}"><span>${c[1]}</span><b>${k===Chat.tab||!Chat.col?c[0]:''}</b>${n?`<em>${n>9?'9+':n}</em>`:''}</button>`}).join('');
  const s=$('#chs');if(s&&!s.options.length)s.innerHTML=Chat.SAYS.map(k=>`<option value="${k}">${Chat.CH[k][1]} ${Chat.CH[k][0]}</option>`).join('');
  if(s)s.value=Chat.say;const i=$('#chi');if(i)i.placeholder='Escribe en '+Chat.CH[Chat.say][0]+'…';
  const c=$('#chat');if(c){c.dataset.say=Chat.say;c.classList.toggle('col',Chat.col)}},
 pick(k){Chat.tab=k;Chat.un[k]=0;if(k!=='todo'&&Chat.SAYS.includes(k))Chat.say=k;Chat.col=false;Chat.tabs();Chat.render()},
 toggle(){Chat.col=!Chat.col;if(!Chat.col){Chat.un={};Chat.render()}Chat.tabs()},
 focus(pre){if(Chat.col)Chat.toggle();const i=$('#chi');if(!i)return;i.focus();if(pre)i.value=pre},
 /* ---------- enviar ---------- */
 send(t){t=t.trim().slice(0,120);if(!t||!G.me)return;let ch=Chat.say;const m=/^\/(\w+)\s*(.*)$/.exec(t);
  if(m){const k=Chat.CMD[m[1].toLowerCase()];if(!k)return Chat.add(Chat.tab==='todo'?'general':Chat.tab,'Canal desconocido. Usa /g general · /e equipo · /c comercio · /o oficios · /cb combate','sys');
   ch=Chat.say=k;t=m[2].trim();Chat.tabs();if(!t)return}
  if(ch==='combate'&&!Chat.inFight())return Chat.add('general','El canal Combate solo se usa durante una pelea. Cambia de canal con el desplegable.','sys');
  if(ch==='equipo'&&!Chat.mates().length)return Chat.add('equipo',G.hub?'No tienes equipo. Toca a un jugador de la sala (o usa el botón Equipo) para invitarlo.':'No hay compañeros en esta pelea. Invita jugadores en la sala de espera.','sys');
  const line=PJ.name+': '+t;
  if(Chat.live(ch)){Chat.pub(ch,t);return}                                       // sala real: el mensaje vuelve por la suscripción
  Chat.add(ch,line,'me');if(G.hub&&ch==='general'&&G.me){G.me.say=t;G.me.sayT=4}
  Chat.reply(ch,t)},
 /* respuestas de los jugadores simulados */
 reply(ch,t){const say=(who,txt,ms,cl)=>setTimeout(()=>{Chat.add(ch,who+': '+txt,cl||'');const e=G.hub&&G.ents.find(x=>x.vis&&x.n===who);if(e){e.say=txt;e.sayT=3.5}},ms);
  if(ch==='equipo'){const M=Chat.mates();if(!M.length)return;const a=M[rn(0,M.length-1)],go=/mazmorra|entra|listo|vamos|ya/i.test(t);say(a.name,go?'¡Listo, vamos!':Chat.MATE[rn(0,Chat.MATE.length-1)],900+Math.random()*900,'ally');return}
  if(!G.hub)return;const V=G.ents.filter(e=>e.vis);if(!V.length)return;const a=V[rn(0,V.length-1)];
  if(ch==='general'){if(/equipo|grupo|party|invit|mazmorra|misi/i.test(t))say(a.n,a.party?'¡Vamos juntos!':'¡Invítame a tu equipo (toca mi personaje)!',900+Math.random()*900);
   else if(Math.random()<.5)say(a.n,Chat.AMB.general[rn(0,5)],1000+Math.random()*1500);return}
  if(ch==='comercio'){if(/vend|compr|cambi|precio|kama|oferta|pocion|poción/i.test(t)||Math.random()<.4)say(a.n,Math.random()<.5?'Mira los precios en 🛒 Mercado, ahí está lo mejor':'Te lo dejo a buen precio, escríbeme',1100+Math.random()*1400);return}
  if(ch==='oficios'){if(/fabric|oficio|receta|forj|sastre|joyer|zapat|alquim|craft/i.test(t)||Math.random()<.4)say(a.n,Math.random()<.5?'Eso se fabrica en 🔨 Oficios con recursos de monstruos':'Yo subo ese oficio, ¡ánimo!',1100+Math.random()*1400)}},
 /* ---------- salas reales (Firebase) ---------- */
 on:false,
 live(ch){return Chat.on&&Net.db&&Net.uid&&(ch==='general'||ch==='comercio'||ch==='oficios'||(ch==='combate'&&G.mode==='pvp'&&Net.mid))},
 pub(ch,t){const o={u:Net.uid,n:PJ.name.slice(0,20),t,ts:Date.now()};try{(ch==='combate'?Net.db.ref('matches/'+Net.mid+'/chat'):Net.db.ref('chat/'+ch)).push(o)}catch(e){console.warn('chat',e)}},
 sub(ch,ref){ref.limitToLast(30).on('child_added',s=>{const o=s.val();if(!o||Chat.keys.has(s.key))return;Chat.keys.add(s.key);Chat.add(ch,o.n+': '+o.t,o.u===Net.uid?'me':'')})},
 async attach(){if(!window.FIREBASE_CONFIG||Chat.on)return;if(!(await Net.init()))return;Chat.on=true;['general','comercio','oficios'].forEach(c=>Chat.sub(c,Net.db.ref('chat/'+c)));
  Chat.add('general','Conectado: General, Comercio y Oficios son salas reales con otros jugadores.','sys')},
 subMatch(mid){if(Chat.mref){Chat.mref.off();Chat.mref=null}Net.mid=mid;if(mid&&Chat.on){Chat.mref=Net.db.ref('matches/'+mid+'/chat');Chat.sub('combate',Chat.mref)}}
};
(()=>{const f=$('#chf');if(!f)return;
 $('#chtabs').addEventListener('click',e=>{const b=e.target.closest('button[data-ch]');if(b)Chat.pick(b.dataset.ch)});
 $('#chs').addEventListener('change',e=>{Chat.say=e.target.value;Chat.tabs();$('#chi').focus()});
 $('#chmin').onclick=()=>Chat.toggle();
 f.addEventListener('submit',e=>{e.preventDefault();const i=$('#chi'),v=i.value;i.value='';Chat.send(v);i.blur()});
 $('#chi').addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();e.target.blur()}e.stopPropagation()});
 if(innerWidth<=900)Chat.col=true;                        // en pantallas pequeñas arranca recogido (pestañas) para no tapar el mapa
 Chat.tabs();Chat.render();Chat.attach()})();
