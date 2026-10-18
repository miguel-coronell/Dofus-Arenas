# Publicar Coliseo (Firebase + GitHub + Vercel)

Orden recomendado: **1) Firebase → 2) GitHub → 3) Vercel → 4) autorizar el dominio en Firebase**.

## 1 · Firebase (cuentas, nube y PvP)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Añadir proyecto** (Analytics no hace falta).
2. **Build → Realtime Database → Crear base de datos** → elige región → modo **bloqueado**.
   Pestaña **Reglas** → borra todo, pega el contenido de `firebase/database.rules.json` → **Publicar**.
3. **Build → Authentication → Comenzar → Método de acceso**: activa **Correo electrónico/contraseña** y **Google** (pon tu correo de asistencia). **No actives «Anónimo»** (las reglas lo rechazan).
4. **Configuración del proyecto (⚙) → Tus apps → Web (`</>`)** → registra la app → copia el objeto `firebaseConfig`.
   Pégalo en `js/net/firebase-config.js` (ver el ejemplo del archivo). Si la URL de tu base de datos no es `…-default-rtdb.firebaseio.com`, usa la que muestra la consola.
5. **Authentication → Plantillas**: pon idioma **Español** y un nombre de remitente (así los correos de verificación y de «olvidé mi contraseña» salen en español).
6. *(Recomendado)* [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials) → tu «Browser key» → **Restricciones de sitios web** → añade `https://TU-DOMINIO/*` y `https://TU-PROYECTO.firebaseapp.com/*`.
7. *(Recomendado)* Configura una **alerta de presupuesto** (plan Spark es gratis y suficiente para jugar con amigos).

> **Actualizando a 0.29 (buscador de jugadores):** vuelve a pegar y publicar `firebase/database.rules.json` (nodo nuevo: `names`). Sin eso la pestaña «🔍 Buscar» de Amigos dirá que no pudo buscar.

> **Actualizando a 0.18:** vuelve a pegar y publicar `firebase/database.rules.json` (nodos nuevos: world, online, soc, inbox, dm, trades). Sin eso nadie ve a nadie ni funcionan amigos/intercambios.

## 2 · GitHub

```bash
cd coliseo-web
git init -b main
git add -A
git commit -m "Coliseo v0.17.0"
git remote add origin https://github.com/TU-USUARIO/coliseo-web.git     # crea antes el repo vacío (privado o público)
git push -u origin main
```

Cada push ejecuta las comprobaciones de `.github/workflows/ci.yml` (datos del juego, reglas, HTML/JS).

## 3 · Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** tu repo de GitHub.
2. **Framework Preset: Other** · Build Command: *(vacío)* · Output Directory: *(vacío)* → **Deploy**.
3. Desde ahora, **cada push a `main` despliega solo** (producción). Las ramas y PRs generan URLs de prueba.

## 4 · Autorizar el dominio (si no, Google no deja entrar)

Firebase → **Authentication → Configuración → Dominios autorizados → Añadir dominio**: `tu-proyecto.vercel.app` (y tu dominio propio si lo tienes).
Firebase no admite comodines: las URLs de *preview* de Vercel no podrán usar el login con Google salvo que las añadas una a una.

## Subir versiones nuevas

```bash
bash scripts/release.sh 0.18.0 "Mazmorras nuevas y arreglos"
```
Sube el número (`js/version.js`, `package.json`), apunta el `CHANGELOG.md`, comprueba, hace commit + etiqueta `v0.18.0` y empuja → Vercel despliega en ~1 min.
**Volver atrás:** Vercel → Deployments → el despliegue bueno → *Promote to Production* (instantáneo), o `git revert` + push.

Para trabajar sin tocar producción: `git switch -c mi-cambio` → push → abre un PR → revisa la URL de preview → *merge*.

## Probar en local

`npm start` (o `npx serve .`) y abre `http://localhost:5173`. Añade `localhost` a los dominios autorizados de Firebase (suele venir ya). Abrir `index.html` con doble clic (`file://`) no sirve para el login.

## Añadir scripts nuevos (arenas, objetos, monstruos…)

Igual que antes, pero con `type="text/game"`: `<script type="text/game" src="js/data/arenas/mi_arena.js"></script>` en `index.html`, **en el orden correcto**. Así el juego solo carga cuando hay sesión.

## Lista antes de invitar a tus amigos

- [ ] `firebase-config.js` con tus valores reales (sin `PEGA_AQUI`).
- [ ] Reglas publicadas (`firebase/database.rules.json`) y `node tools/check-rules.js` en verde.
- [ ] Email/contraseña y Google activados; **Anónimo desactivado**.
- [ ] Dominio de Vercel en *Dominios autorizados*.
- [ ] Crear cuenta de prueba → crear personaje → cerrar sesión → entrar desde **otro navegador/móvil** y ver el mismo personaje.
- [ ] «Olvidé mi contraseña» llega al correo (mira spam).
- [ ] Dos cuentas buscando partida **1v1** en el Coliseo.

## Límites conocidos (honestos)

- **El progreso lo calcula el navegador.** Un jugador técnico podría editar su propio guardado (nivel, kamas). El rival revisa la build con `Net.sane`, pero no hay validación en servidor. Para un ranking serio, el siguiente paso es mover XP/kamas/botín a Cloud Functions.
- **Chat sin anti-spam por tiempo** (las reglas limitan tamaño y fecha, no frecuencia). Para amigos basta; abierto al público, añade moderación/Cloud Functions.
- **Última escritura gana**: si juegas con la misma cuenta en dos dispositivos a la vez, el último guardado pisa al anterior.
- El correo de **verificación** se envía al registrarse, pero no es obligatorio para jugar.
- Cualquier jugador puede vaciar la cola del Coliseo (diseño por transacción); es un riesgo de molestia, no de datos.
