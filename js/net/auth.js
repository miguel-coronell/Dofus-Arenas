/* auth.js · CUENTAS: entrar / crear cuenta (correo + contraseña o Google) · olvidé mi contraseña · guardado del progreso en la nube.
   Flujo: carga el SDK de Firebase → si hay sesión, sincroniza tu progreso (saves/<uid>) y arranca el juego (Boot.run) · si no, muestra el login.
   Requiere js/net/firebase-config.js relleno y, en Firebase Console, activar Authentication → Email/Password y Google (ver DEPLOY.md). */
const Auth=(()=>{
const $=s=>document.querySelector(s),SDK='https://www.gstatic.com/firebasejs/10.12.2/',MIN_PASS=8;
const T={view(id){document.querySelectorAll('#auth .au-view').forEach(v=>v.classList.toggle('on',v.id===id));
   const f=$('#'+id+' input');if(f&&matchMedia('(hover:hover)').matches)setTimeout(()=>f.focus(),60)},
 msg(el,t,ok){el.textContent=t||'';el.classList.toggle('ok',!!ok)},
 toast(t,ms){const e=$('#au-toast');e.textContent=t;e.hidden=false;clearTimeout(T.tt);T.tt=setTimeout(()=>{e.hidden=true},ms||7000)}};

/* ---------- errores de Firebase en español ---------- */
const ERR={'auth/invalid-email':'El correo no es válido.','auth/missing-email':'Escribe tu correo.','auth/missing-password':'Escribe tu contraseña.',
 'auth/user-not-found':'Correo o contraseña incorrectos.','auth/wrong-password':'Correo o contraseña incorrectos.','auth/invalid-credential':'Correo o contraseña incorrectos.','auth/invalid-login-credentials':'Correo o contraseña incorrectos.',
 'auth/email-already-in-use':'Ese correo ya tiene una cuenta. Entra, o recupera tu contraseña si no la recuerdas.','auth/weak-password':'La contraseña es demasiado débil (mínimo '+MIN_PASS+' caracteres).',
 'auth/too-many-requests':'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.','auth/network-request-failed':'Sin conexión. Revisa tu internet e inténtalo otra vez.','auth/user-disabled':'Esta cuenta está desactivada.',
 'auth/account-exists-with-different-credential':'Ese correo ya está registrado con otro método. Entra con tu correo y contraseña.','auth/popup-closed-by-user':'Cerraste la ventana de Google antes de terminar.','auth/cancelled-popup-request':'',
 'auth/unauthorized-domain':'Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).','auth/operation-not-allowed':'Este método de acceso no está activado en Firebase (Authentication → Sign-in method).',
 'auth/popup-blocked':'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.','auth/requires-recent-login':'Vuelve a iniciar sesión para continuar.','auth/invalid-api-key':'La API key de Firebase no es válida (revisa js/net/firebase-config.js).'};
const errTxt=e=>{const c=e&&e.code;if(c&&c in ERR)return ERR[c];console.warn('Auth',e);return 'No se pudo completar la operación'+(c?' ('+c+')':'')+'. Inténtalo de nuevo.'};

/* ---------- GUARDADO EN LA NUBE (saves/<uid>) ----------
   Se sincronizan los personajes, el seleccionado y el mercado. Al entrar manda la nube; si quedaron cambios sin subir en este dispositivo (coliseo.dirty) mandan los locales.
   Si cambias de cuenta en el mismo navegador, los datos locales de la cuenta anterior se borran (ya están en su nube). */
const Cloud={KEYS:['coliseo.chars','coliseo.sel','coliseo.eco'],OWN:'coliseo.owner',DIRTY:'coliseo.dirty',tm:null,busy:null,
 ref:()=>firebase.database().ref('saves/'+Auth.user.uid),
 get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}},
 pack(){const o={};Cloud.KEYS.forEach(k=>{const v=Cloud.get(k);if(v!=null)o[k]=v});return o},
 hasLocal(){try{const a=JSON.parse(Cloud.get('coliseo.chars')||'[]');return Array.isArray(a)&&a.length>0}catch(e){return false}},
 wipe(){Cloud.KEYS.concat([Cloud.OWN,Cloud.DIRTY]).forEach(k=>Cloud.set(k,null))},
 async sync(u){const own=Cloud.get(Cloud.OWN);if(own&&own!==u.uid)Cloud.wipe();Cloud.set(Cloud.OWN,u.uid);
  const v=(await Cloud.ref().once('value')).val();         // si falla la red lanza error: NO se arranca (así nunca se pisa la nube con datos vacíos)
  if(v&&typeof v.d==='string'&&Cloud.get(Cloud.DIRTY)!=='1'){let o={};try{o=JSON.parse(v.d)||{}}catch(e){}Cloud.KEYS.forEach(k=>Cloud.set(k,typeof o[k]==='string'?o[k]:null))}
  else if(Cloud.hasLocal()||Cloud.get(Cloud.DIRTY)==='1')await Cloud.push(true)},        // cuenta nueva con progreso local previo, o cambios pendientes → se suben
 mark(){Cloud.set(Cloud.DIRTY,'1');clearTimeout(Cloud.tm);Cloud.tm=setTimeout(()=>Cloud.push(),1500)},
 async push(now){clearTimeout(Cloud.tm);if(!Auth.user||Auth.local)return true;
  const run=async()=>{try{await Cloud.ref().set({d:JSON.stringify(Cloud.pack()),ts:firebase.database.ServerValue.TIMESTAMP});Cloud.set(Cloud.DIRTY,null);return true}
   catch(e){console.warn('Guardado en la nube falló',e);Cloud.tm=setTimeout(()=>Cloud.push(),15000);return false}};
  return Cloud.busy=(Cloud.busy||Promise.resolve()).then(run)},
 hook(){const w=(o,k)=>{const f=o[k];o[k]=function(){const r=f.apply(this,arguments);Cloud.mark();return r}};   // cualquier guardado del juego dispara la subida (sin tocar el resto del código)
  [[PG,'save'],[PG,'del'],[PG,'setSel'],[Eco,'save']].forEach(([o,k])=>{try{w(o,k)}catch(e){console.warn('hook',k,e)}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&Cloud.get(Cloud.DIRTY)==='1')Cloud.push(true)});addEventListener('pagehide',()=>{if(Cloud.get(Cloud.DIRTY)==='1')Cloud.push(true)})}};

/* ---------- AUTH ---------- */
const A={user:null,local:false,booted:false,mode:'in',cool:0,Cloud,
 cfgOk(){const c=window.FIREBASE_CONFIG;return!!(c&&c.apiKey&&c.databaseURL&&!/PEGA_AQUI|TU-PROYECTO/.test(c.apiKey+c.authDomain+c.databaseURL))},
 loadScript(u){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>ko(new Error('script '+u));document.head.appendChild(s)})},
 load(t,btns){T.view('au-load');$('#au-loadt').textContent=t;const b=$('#au-loadb');b.innerHTML='';b.hidden=!btns;(btns||[]).forEach(([l,f])=>{const x=document.createElement('button');x.type='button';x.className='au-btn sm';x.textContent=l;x.onclick=f;b.appendChild(x)});$('#au-loadb').parentNode.classList.toggle('err',!!btns)},
 async start(){$('#au-ver').textContent=window.APP_VERSION?'v'+window.APP_VERSION:'';
  document.querySelectorAll('.au-cast img').forEach(i=>i.addEventListener('error',()=>i.remove()));A.bind();
  if(!A.cfgOk()){A.noConfig();return}
  A.load('Conectando…');
  try{await A.loadScript(SDK+'firebase-app-compat.js');await Promise.all([A.loadScript(SDK+'firebase-auth-compat.js'),A.loadScript(SDK+'firebase-database-compat.js')]);
   if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);firebase.auth().useDeviceLanguage()}
  catch(e){console.error(e);A.load('No se pudo conectar con el servidor de cuentas. Revisa tu internet.',[['Reintentar',()=>location.reload()]]);return}
  firebase.auth().getRedirectResult().catch(e=>{A.showLogin();T.msg($('#au-msg'),errTxt(e))});
  firebase.auth().onAuthStateChanged(u=>{
   if(u&&u.isAnonymous){firebase.auth().signOut();return}                 // sesiones anónimas de versiones antiguas: ya no valen
   if(u)A.enter(u);else if(A.booted)location.reload();else A.showLogin()})},
 noConfig(){A.showLogin();T.msg($('#au-msg'),'⚠ Falta configurar Firebase en js/net/firebase-config.js (mira DEPLOY.md). Mientras tanto solo puedes jugar en modo local.');$('#au-local').hidden=false;
  ['au-go','au-google','au-forgot'].forEach(i=>{$('#'+i).disabled=true})},
 showLogin(){T.view('au-main');$('#auth').hidden=false;document.body.classList.remove('in-game')},
 async enter(u){if(A.user&&A.user.uid===u.uid&&A.booted)return;A.user=u;$('#auth').hidden=false;A.load('Cargando tu cuenta…');
  try{await Cloud.sync(u)}catch(e){console.error(e);A.load('No se pudo cargar tu progreso desde la nube. Revisa tu conexión (y que las reglas de Firebase estén publicadas).',[['Reintentar',()=>A.enter(u)],['Cerrar sesión',()=>A.logout(true)]]);A.user=null;return}
  await A.boot(u)},
 async boot(u){A.load('Cargando el juego…');
  try{await Boot.run()}catch(e){console.error(e);A.load('No se pudo cargar el juego ('+e.message+'). Recarga la página.',[['Recargar',()=>location.reload()]]);return}
  A.booted=true;if(!A.local)Cloud.hook();A.chip(u);$('#auth').hidden=true;document.body.classList.add('in-game');
  if(A.verifyNote){T.toast('✉ Te enviamos un correo para verificar tu cuenta. Revisa también la carpeta de spam.');A.verifyNote=false}},
 chip(u){const b=$('#acct');if(!b)return;const n=A.local?'Modo local':(u.displayName||(u.email||'').split('@')[0]||'Jugador');$('#acctN').textContent='👤 '+n.slice(0,16);b.title=(A.local?'Modo local':(u.email||'Tu cuenta'))+' · pulsa para abrir el menú (salir del juego, cambiar de personaje o de servidor)';b.hidden=false;b.onclick=()=>GMenu.open()},
 async logout(force){
  if(!force&&!confirm(A.local?'¿Volver a la pantalla de login? Tu progreso local se conserva en este navegador.':'¿Cerrar sesión?\nTu progreso queda guardado en tu cuenta.'))return;
  if(A.local){location.reload();return}
  if(A.user&&Cloud.get(Cloud.DIRTY)==='1'&&!force){const ok=await Cloud.push(true);if(!ok&&!confirm('No se pudo guardar tu último progreso en la nube (¿sin conexión?). Si sales ahora podrías perderlo. ¿Salir de todas formas?'))return}
  try{await firebase.auth().signOut()}catch(e){}Cloud.wipe();try{sessionStorage.clear()}catch(e){}location.reload()},

 /* ----- formularios ----- */
 setMode(m){A.mode=m;const up=m==='up';$('#au-t-in').classList.toggle('on',!up);$('#au-t-up').classList.toggle('on',up);$('#au-t-in').setAttribute('aria-selected',!up);$('#au-t-up').setAttribute('aria-selected',up);
  $('#au-up-only').hidden=!up;$('#au-go').textContent=up?'Crear cuenta':'Entrar';$('#au-forgot').hidden=up;$('#au-pass').autocomplete=up?'new-password':'current-password';T.msg($('#au-msg'),'')},
 strength(p){let s=0;if(p.length>=MIN_PASS)s++;if(p.length>=12)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p)&&/[a-zA-Z]/.test(p))s++;if(/[^a-zA-Z0-9]/.test(p))s++;return Math.min(4,s)},
 busy(on){['au-go','au-google','au-rgo'].forEach(i=>{const b=$('#'+i);if(b&&!(A.cool>0&&i==='au-rgo'))b.disabled=on});$('#au-form').classList.toggle('busy',on)},
 async submit(e){e.preventDefault();const em=$('#au-email').value.trim(),pw=$('#au-pass').value,m=$('#au-msg'),up=A.mode==='up';T.msg(m,'');
  if(!/^\S+@\S+\.\S+$/.test(em))return T.msg(m,'Escribe un correo válido.');
  if(!pw)return T.msg(m,'Escribe tu contraseña.');
  if(up){if(pw.length<MIN_PASS||!/[a-zA-Z]/.test(pw)||!/\d/.test(pw))return T.msg(m,'La contraseña necesita al menos '+MIN_PASS+' caracteres, con letras y números.');
   if(pw!==$('#au-pass2').value)return T.msg(m,'Las contraseñas no coinciden.')}
  A.busy(true);
  try{if(up){const c=await firebase.auth().createUserWithEmailAndPassword(em,pw);A.verifyNote=true;try{await c.user.sendEmailVerification()}catch(x){A.verifyNote=false}}
   else await firebase.auth().signInWithEmailAndPassword(em,pw)}
  catch(x){T.msg(m,errTxt(x));A.busy(false);return}
  A.busy(false)},
 async google(){const m=$('#au-msg');T.msg(m,'');A.busy(true);const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  try{await firebase.auth().signInWithPopup(p)}
  catch(x){if(x.code==='auth/popup-blocked'||x.code==='auth/operation-not-supported-in-this-environment'){try{await firebase.auth().signInWithRedirect(p);return}catch(y){x=y}}T.msg(m,errTxt(x))}
  A.busy(false)},
 async reset(e){e.preventDefault();const em=$('#au-remail').value.trim(),m=$('#au-rmsg');T.msg(m,'');
  if(!/^\S+@\S+\.\S+$/.test(em))return T.msg(m,'Escribe un correo válido.');
  const b=$('#au-rgo');b.disabled=true;
  try{await firebase.auth().sendPasswordResetEmail(em)}
  catch(x){if(x.code&&x.code!=='auth/user-not-found'){T.msg(m,errTxt(x));b.disabled=false;return}}       // user-not-found se responde igual que el éxito (no revelar qué correos existen)
  T.msg(m,'✔ Si existe una cuenta con ese correo, te enviamos un enlace para crear una contraseña nueva. Revisa también el spam.',true);
  A.cool=30;const tick=()=>{if(A.cool<=0){b.disabled=false;b.textContent='Enviar enlace';return}b.textContent='Reenviar en '+A.cool+' s';A.cool--;setTimeout(tick,1000)};tick()},
 bind(){
  document.querySelectorAll('.au-tabs button').forEach(b=>b.onclick=()=>A.setMode(b.dataset.m));
  $('#au-form').addEventListener('submit',A.submit);$('#au-rform').addEventListener('submit',A.reset);$('#au-google').onclick=A.google;
  $('#au-forgot').onclick=()=>{$('#au-remail').value=$('#au-email').value;T.msg($('#au-rmsg'),'');T.view('au-reset')};$('#au-back').onclick=()=>T.view('au-main');
  $('#au-eye').onclick=()=>{const p=$('#au-pass'),s=p.type==='password';p.type=s?'text':'password';$('#au-pass2').type=p.type;$('#au-eye').setAttribute('aria-label',s?'Ocultar contraseña':'Mostrar contraseña')};
  $('#au-pass').addEventListener('input',()=>{if(A.mode!=='up')return;const s=A.strength($('#au-pass').value);$('#au-m').style.width=s*25+'%';$('#au-m').dataset.s=s;$('#au-mt').textContent=['Mínimo '+MIN_PASS+' caracteres, con letras y números.','Muy débil','Débil','Buena','Fuerte'][$('#au-pass').value?s||1:0]});
  $('#au-local').onclick=async()=>{A.local=true;A.user={uid:'local',email:null};A.load('Cargando el juego…');await A.boot(A.user)}}};
A.start();
return A})();
