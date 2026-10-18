/* ui/gmenu.js · MENÚ DEL SERVIDOR: una ventana con tres opciones → 🚪 Salir del juego · 👤 Cambiar de personaje · 🌍 Cambiar de servidor.
   Se abre con el botón del servidor en la pantalla de elegir personaje (#pksrv) y con ☰ Menú arriba a la derecha (#acct).
   El servidor se elige aquí: en la pantalla de personajes solo se guarda (World.setSrv(id,true)); dentro del mundo además se vuelve a entrar en él. */
const GMenu={view:'main',
 sync(){const n=World.srvName();$('#pksrvn').textContent=n;$('#pksrv').title='Servidor '+n+' · pulsa para salir, cambiar de personaje o de servidor'},
 open(v){GMenu.view=v||'main';GMenu.render();$('#gmenu').hidden=false},
 close(){$('#gmenu').hidden=true},
 render(){const el=$('#gmenu'),pk=!$('#pick').hidden;let h;
  if(GMenu.view==='srv'){const lock=!pk&&!G.hub;
   h=`<div class="lv gm"><h3>🌍 Cambiar de servidor</h3><p>Solo ves y juegas con los jugadores de tu mismo servidor.${lock?'<br><b>Termina o abandona el combate para poder cambiar.</b>':''}</p><div class="gml">`
    +WORLD.SRV.map(s=>`<button type="button" class="gmo${s[0]===World.srv?' on':''}" data-s="${s[0]}" ${lock?'disabled':''}><span>🌍</span><b>${esc(s[1])}</b><small>${s[0]===World.srv?'✔ Servidor actual':'Elegir'}</small></button>`).join('')
    +`</div><div class="lvr"><button type="button" data-a="back">‹ Volver</button></div></div>`}
  else h=`<div class="lv gm"><h3>☰ Menú</h3><p>🌍 Servidor: <b>${esc(World.srvName())}</b>${SAVED?' · 👤 '+esc(PJ.name):''}</p><div class="gml">`
    +`<button type="button" class="gmo" data-a="chars"><span>👤</span><b>Cambiar de personaje</b><small>${pk?'Ya estás eligiendo personaje':'Vuelve a la pantalla de personajes'}</small></button>`
    +`<button type="button" class="gmo" data-a="srv"><span>🌍</span><b>Cambiar de servidor</b><small>Ahora: ${esc(World.srvName())}</small></button>`
    +`<button type="button" class="gmo bad" data-a="exit"><span>🚪</span><b>Salir del juego</b><small>Cierra tu sesión · tu progreso queda guardado</small></button>`
    +`</div><div class="lvr"><button type="button" data-a="close">Cerrar</button></div></div>`;
  el.innerHTML=h}};
$('#gmenu').addEventListener('click',e=>{const t=e.target.closest('button');if(!t){if(e.target===$('#gmenu'))GMenu.close();return}
 if(t.dataset.s){const pk=!$('#pick').hidden,ch=World.setSrv(t.dataset.s,pk);GMenu.sync();GMenu.close();if(ch&&pk)UI.msg('🌍 Servidor '+World.srvName());return}
 const a=t.dataset.a;if(a==='close')GMenu.close();else if(a==='back'){GMenu.view='main';GMenu.render()}else if(a==='srv'){GMenu.view='srv';GMenu.render()}
 else if(a==='chars'){GMenu.close();if($('#pick').hidden)askPick()}
 else if(a==='exit'){GMenu.close();A.logout()}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#gmenu').hidden){e.preventDefault();if(GMenu.view==='srv'){GMenu.view='main';GMenu.render()}else GMenu.close()}});
$('#pksrv').onclick=()=>GMenu.open();
GMenu.sync();
