/* ui/worldmap.js · 🗺 botón «Mapas» del menú: ventana con el MAPA DEL MUNDO (4×4). Muestra dónde estás, el nivel de los monstruos de cada mapa,
   los monstruos que viven allí y los mapas vecinos. Pulsa un mapa para ver sus datos. Los datos salen de WORLD (js/data/arenas/mundo.js). */
const WMap={sel:null,
 /* mapa en el que estás ahora (en combate: el último mapa del mundo que pisaste) */
 here(){const A=G.arena;return G.hub&&A&&A.gx!=null?A.id:(World.map||World.last||'w1_1')},
 lv:M=>M.plaza?'🏛 Plaza':M.z?'Nv '+M.lv[0]+'–'+M.lv[1]:'',
 render(){const el=$('#worldmap'),here=WMap.here();if(!WMap.sel||!Registry.arenas[WMap.sel])WMap.sel=here;
  const cur=WORLD.M.find(m=>WORLD.id(m.g[0],m.g[1])===WMap.sel)||WORLD.M[0],hereM=WORLD.M.find(m=>WORLD.id(m.g[0],m.g[1])===here);let g='';
  for(let y=0;y<WORLD.H;y++)for(let x=0;x<WORLD.W;x++){const M=WORLD.at(x,y),id=WORLD.id(x,y);if(!M){g+='<i class="wmc void"></i>';continue}
   g+=`<button type="button" class="wmc b-${M.base}${id===here?' here':''}${id===WMap.sel?' sel':''}${M.plaza?' pz':''}" data-id="${id}"><b>${esc(M.n)}</b><small>${esc(WMap.lv(M))}</small>${id===here?'<em>📍</em>':''}</button>`}
  const nb=Object.keys(WORLD.D).map(d=>{const N=WORLD.at(cur.g[0]+WORLD.D[d][0],cur.g[1]+WORLD.D[d][1]);return N?`<li><span>${WORLD.DN[d]}</span> ➜ ${esc(N.n)}</li>`:''}).join('');
  const mobs=cur.z&&WORLD.Z[cur.z]?WORLD.Z[cur.z].map(id=>Registry.monsters[id]).filter(Boolean).map(m=>`<span class="wmm">${esc(m.ico||'👾')} ${esc(m.n)}</span>`).join(''):'';
  el.innerHTML=`<div class="st-win wmw"><div class="st-title"><span class="st-help">?</span><b>🗺 Mapa del mundo · ${esc(World.srvName())}</b><button class="st-x" data-x="1">✕</button></div>
   <div class="st-body wmb"><div class="wmg">${g}</div>
    <div class="wmd"><h3>${esc(cur.n)}${WORLD.id(cur.g[0],cur.g[1])===here?' <em>📍 Estás aquí</em>':''}</h3>
     <div class="wms">Casilla (${cur.g[0]+1}, ${cur.g[1]+1}) del mundo${cur.plaza?' · Plaza central: oficios, mercado y mazmorras':cur.z?' · Monstruos de nivel '+cur.lv[0]+' a '+cur.lv[1]:''}</div>
     ${mobs?'<h4>Monstruos</h4><div class="wmmm">'+mobs+'</div>':''}
     <h4>Salidas</h4><ul class="wmn">${nb}</ul>
     <p class="wmt">${hereM?'Camina hasta el borde brillante del mapa para pasar al siguiente.':'Vuelve al mundo para seguir explorando.'}</p></div></div></div>`},
 open(){WMap.sel=null;WMap.render();$('#worldmap').hidden=false}};
$('#mapb').onclick=()=>WMap.open();
$('#worldmap').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.x){Win.close('#worldmap');return}if(t.dataset.id){WMap.sel=t.dataset.id;WMap.render()}});
$('#worldmap').addEventListener('pointerdown',e=>{if(e.target===$('#worldmap'))Win.close('#worldmap')});
