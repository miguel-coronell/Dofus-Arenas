# Cambios

## 0.29.0 — Buscador de jugadores en Amigos
- **Nueva pestaña «🔍 Buscar»** en la ventana Amigos: escribe el nombre (o solo el principio, sin importar mayúsculas ni tildes; mínimo 2 letras) de un personaje y busca sola al dejar de escribir o con la lupa. Muestra clase, nivel y si está conectado (y con qué personaje juega).
- **Acciones sobre el resultado**: ➕ agregar amigo · 👥 **invitar al grupo** (para pelear en cooperativo contra monstruos y mazmorras) · 🏟 **invitar al Coliseo** · ✉ mensaje privado · ⚔ desafiar · 🔄 intercambiar · ☠ enemigo. Grupo, Coliseo y mensaje solo con el jugador conectado; desafiar e intercambiar si los dos estáis en el mundo.
- **Pestaña Amigos**: cada amigo conectado tiene ahora también los botones **👥 Grupo** y **🏟 Coliseo**.
- **Directorio de nombres** (`names/<clave>/<uid>` en Firebase): cada cuenta publica sus personajes (nombre, clase, nivel) al entrar y cuando crea, borra o sube de nivel un personaje; el buscador hace una búsqueda por prefijo. Solo aparecen los jugadores que ya hayan entrado con esta versión. Las invitaciones llegan a la cuenta, no a un personaje concreto.
- **Hay que volver a publicar `firebase/database.rules.json`** (nodo nuevo `names`; solo cada cuenta escribe lo suyo y hace falta sesión real para leer).


## 0.28.0 — Equipo único: cada pieza es un ejemplar distinto
- **Cada pieza de equipo es única**: el mismo «Gorro de Lino» puede dar ❤️ 6 vitalidad y 🪨 3 fuerza y otro ❤️ 8 y 🪨 2. Cada característica tiene un **rango** (±30 % del valor base, `ROLL` en `js/game/instances.js`); PA y PM no varían. Las piezas que ya tenías siguen valiendo (son ejemplares con valores medios).
- **Mercadillo → Comprar**: cada fila es un *tipo* de pieza y, **antes de abrirla**, muestra cuántos ejemplares hay (`×12`), el **rango de cada característica** (❤️ 4–8 · 🪨 2–4) y el **rango de precios**. Al pulsar se abre el **submenú «Ejemplares a la venta»**: cada ejemplar con sus valores, su calidad (%) y **su propio precio** (±25 % según lo bueno que salió), con botón Comprar propio. Se ordenan por «Más baratos» o «Mejor calidad».
- **El sistema crea los ejemplares según la demanda** (`economy.js`): cada compra sube la demanda de esa pieza, que se enfría sola y a veces se dispara. En cada tic (10 min y +2 por combate) el mercado fabrica ejemplares nuevos hasta su objetivo de existencias (más demanda = más existencias), retira alguno viejo y rota. Si se agota, lo indica y repone solo. Lo que vendes al mercado entra en sus existencias con sus valores.
- **Botín, fabricación y compras en bloque** entregan ejemplares con valores al azar dentro del rango. Intercambios, puesto de venta y retirar lotes conservan el ejemplar exacto.
- **Inventario**: el detalle muestra las características de ese ejemplar con su rango y en verde/rojo si salió en el máximo/mínimo.
- **Honradez PvP**: un ejemplar se guarda como `plantilla@vit6,tierra3` y se valida al leerlo (cada valor dentro del rango): un id trucado no existe y `Items.ok` lo rechaza. No hay cambios en las reglas de Firebase.
- **Arreglos**: las compras y ventas del mercadillo ahora **se guardan al momento** (antes solo se guardaban al acabar un combate); el botón «📋 Al puesto» del inventario abre «Vender» con ese objeto elegido (antes abría «Mi puesto» sin elegir nada).
- `node tools/check-data.js` prueba rangos, ejemplares, ids falsos, compra/venta y reposición del mercado.


## 0.27.0 — Mercadillo ampliado (niveles 1-200)
- **Equipo**: 24 piezas nuevas de cada tipo (sombreros, capas, amuletos, anillos, cinturones, botas, armas y escudos) = 192 objetos, uno por escalón de nivel (1, 3, 6 … 200). Cada tipo ya tiene más de 25 opciones a la venta. Son algo más débiles y baratas que las piezas de set, y no llevan bono de set.
- **Recursos**: 48 recursos nuevos (2 por escalón: telas/pieles y minerales/maderas/gemas) que se compran, se venden y **sueltan los monstruos del mapa** de ese nivel (28 monstruos con botín nuevo).
- **Recetas**: todo el equipo nuevo también se **fabrica en los oficios** con los recursos de su escalón.
- **Consumibles**: de 6 a 28: pociones de vida, comidas de poder, elixires de armadura por elemento y pociones de PA/PM/resistencia.
- Todo sale de fórmulas en `js/data/items/tienda.js` (estadísticas, precios, nombres): se pueden reajustar en un solo sitio.
- El mercado total pasa de ~170 a **351 objetos**.

## 0.26.0 — Mazmorras cooperativas
- Si estás en un grupo real y entras a una **mazmorra**, el grupo recibe el aviso (mazmorra, nivel necesario, jefe, nº de salas) con **Unirse** / **Cerrar**. Los que se unen entran juntos y **cada uno maneja su personaje** en las 3 salas.
- **Todos cobran XP, kamas y botín** de cada sala (y del jefe).
- Entre salas la vida pasa de una a otra (+40 %, también para los caídos). **El anfitrión** (quien inició) pulsa «Siguiente sala»; los demás ven «Esperando…» y entran solos.
- La mazmorra termina si caen todos. Quien se une necesita el nivel de la mazmorra. Salas cooperativas: hasta 4 monstruos.
- Si nadie se une, la mazmorra es normal (con tus compañeros simulados). No hay reglas nuevas de Firebase respecto a 0.25.

## 0.25.1 — Los duelos entre jugadores no dan recompensas
- Los **duelos** (desafiar a otro jugador, real o simulado) ya **no dan XP, kamas ni botín**, ni cuentan victorias/derrotas. Abandonar un duelo tampoco da nada.
- Siguen dando XP, kamas y botín: **monstruos, mazmorras y Coliseo** (y el combate cooperativo de grupo).
- La ventana de resultado de un duelo lo indica y ya no ofrece «Combatir de nuevo» contra un jugador simulado.

## 0.25.0 — Combate cooperativo de grupo
- **Cada jugador del grupo maneja su personaje** en el mismo combate contra monstruos. Usa el mismo sistema sincronizado del PvP: solo viajan las acciones, y los monstruos los mueve la IA en todos los clientes con la misma semilla (probado con dos clientes: quedan idénticos turno a turno).
- **Todos ganan XP, kamas y botín**: cada cliente calcula sus propias recompensas (bono +10 % de XP por compañero).
- **Cualquier miembro del grupo** (líder o no) que toque un grupo de monstruos avisa a los demás con una ventanita (mapa, casilla, monstruos, nivel): **Unirse** o **Cerrar**. El que inicia ve quién se une; el combate empieza cuando todos responden, a los 20 s o con «Empezar ya». Si nadie se une, combate normal.
- Invitar al grupo pide **Aceptar / Rechazar** (v0.24). El líder reparte la lista del grupo para que todos puedan avisar a todos.
- **Hay que volver a publicar `firebase/database.rules.json`** (nuevo formato de partida `coop`).
- Aún no incluido: combates cooperativos en mazmorras (siguen con aliados IA) y los compañeros simulados no entran en el combate cooperativo.

## 0.24.0 — Invitaciones de grupo reales y aviso de combate al grupo
- **Invitar en mi grupo** con un jugador real ya no lo mete solo: le llega un aviso con **Aceptar / Rechazar** (caduca a los 2 min). El líder se entera de la respuesta. Se puede salir del grupo desde la ventana Equipo.
- Los jugadores simulados siguen respondiendo solos, pero ahora tardan unos segundos y se avisa «esperando respuesta».
- **Aviso de combate**: cuando el líder empieza un combate contra monstruos, cada compañero real recibe una ventanita con el mapa, las coordenadas, los monstruos y su nivel. **Unirse** (si el líder sigue en la preparación, el compañero entra como aliado controlado por la IA y viaja a ese punto del mapa) o **Cerrar**. Se cierra sola a los 30 s.
- Los compañeros reales ya no combaten automáticamente: solo los que pulsan «Unirse».
- Sin cambios nuevos en las reglas de Firebase respecto a 0.23.0 (usa los mismos campos `b` y `x` del buzón).

## 0.23.0 — Menú del jugador estilo Dofus
- Al tocar a **cualquier jugador** del mapa (real o simulado) se abre el menú: mensaje privado · desafiar · informaciones · información del gremio · información de la alianza · **proponer un intercambio (objetos y kamas)** · invitar al grupo · invitar al coliseo · agregar amigo · agregar enemigo · omitir para la sesión · cancelar.
- Antes, los jugadores simulados abrían la ventana de Equipo y el menú solo existía para jugadores online.
- Con jugadores reales: mensaje, desafío, intercambio, amistad e invitación al Coliseo viajan por Firebase (nuevos avisos `pm` y `ci` en el buzón). **Hay que volver a publicar `firebase/database.rules.json`** (campo `x` nuevo en `inbox`).
- «Omitir para la sesión» oculta al jugador y descarta sus avisos y su chat hasta cerrar sesión.
- Gremio/alianza: informativos (aún no existen gremios en el juego).

## 0.22.2 — Botones de la ventana de resultado según el tipo de combate
- **Monstruos**: sin «Combatir de nuevo» (el grupo ya se eliminó y reaparece solo en el mapa).
- **PvP por desafío (duelo)**: botón «⚔ Desafiar de nuevo»: vuelve al mundo y envía el desafío al rival; solo empieza si acepta.
- **PvP por Coliseo**: la partida termina y listo; botón «🔍 Nueva búsqueda» que abre el Coliseo para entrar otra vez en la fila de espera.
- Duelo vs IA: sigue igual.

## 0.22.1 — Aviso al ir a «Personaje» en combate y PM por casilla
- 👤 Personaje (y el retrato de la cabecera, y «Cambiar de personaje» del menú) ya **no te sacan del combate sin avisar**: sale el mismo aviso de «Abandonar» y solo cambias de personaje si confirmas (cuenta como derrota). Si cancelas, sigues luchando.
- PM: el coste en PM solo se muestra al señalar la casilla de destino (gastas N, quedan M) y solo si puedes llegar; ya no sale «te faltan» ni números en todas las casillas.

## 0.22.0 — Monstruos que reaparecen, PvP por desafío, caras PNG, mercadillo y previsión en combate
- **Monstruos del mapa**: al vencer un grupo **desaparece** del mapa y **reaparece solo** (en otro punto del mismo mapa) a los 60 s, aunque sigas allí. El tiempo se cambia en `World.RESPAWN` (`js/game/world.js`, en milisegundos). Si pierdes o abandonas, el grupo sigue donde estaba.
- **PvP**: la ventana de resultado ya **no tiene «Combatir de nuevo»** (era lo que metía a los dos jugadores otra vez en la cola y los emparejaba solos). Para pelear otra vez hay que volver al mundo y **desafiar**; empieza solo si el otro acepta.
- **Apariencia**: se quitaron cara vectorial, peinado, piel, pelo y ojos. Ahora la **cara es un PNG** que pones tú en `assets/faces/<clase>_<m|f>_<n>.png` (hasta 8 por clase y sexo; ver `assets/faces/_LEEME.txt`). El creador muestra solo las que existan; sin PNG se ve el icono de la clase. Se mantiene el color de atuendo/anillo. Las caras se ven en carrusel, cabecera, personaje en turno, lista de turnos, resultados y menú de jugador. Los personajes ya creados conservan su atuendo y pasan a la cara nº 1.
- **Mercadillo e inventario**: al elegir un objeto la lista **ya no salta arriba** (conserva el scroll; solo vuelve arriba al cambiar de pestaña, categoría u orden).
- **Combate — PM**: al pasar el ratón por una casilla se resalta el camino y se muestra **cuántos PM gastarás** y cuántos te quedan (solo en las casillas a las que puedes caminar).
- **Combate — previsión de daño**: con un hechizo seleccionado, al señalar un objetivo se ve sobre él el **daño en rango (mín–máx)** ya con sus resistencias y armadura, la vida que le quedaría y una franja en su barra de vida (amarillo = máximo, rojo = mínimo seguro); también curas y veneno por turno, y ☠ si puede o va a morir. Cálculo en `Rules.preview` (`js/game/rules.js`); probado contra 400 hechizos reales sin desajustes (no incluye el daño por choque de los empujes).

## 0.21.1 — Arreglo del panel de vida y hechizos
- Al redimensionar el panel, los hechizos ahora se reparten en **filas y columnas** según su ancho y alto (antes quedaban en una sola columna).
- Las píldoras de **PA y PM** ya no se ven altísimas: la clase `.pm` del menú de jugador (`ui5.css`) pisaba a la del HUD; ahora está limitada a `#pmenu .pm`.
- Estrecho: vida y reloj arriba y los hechizos debajo; ancho: vida | hechizos | reloj. Si no cabe todo, el panel se desplaza.

## 0.21.0 — Paneles con ancho y alto libres
- 🧩 Interfaz: ahora cada panel (vida y hechizos, personaje en turno, turnos, retos, menú, cámara, equipo, minimapa) se puede redimensionar con el **ancho y el alto por separado** (esquina ◢) en vez de solo agrandar/achicar. El contenido se recoloca (más o menos columnas y filas: botones del menú, casillas de hechizos, turnos, equipo…) y conserva su tamaño en píxeles. Reglas en `css/ui6.css` (clase `.lay-box`).

## 0.20.0 — Bonos de set acumulados, minimapa editable y barra de hechizos 2×8
- **Sets**: los bonos ahora se **acumulan** (con 4 piezas del mismo set tienes el bono de 2 + el de 4…) y, desde 2 piezas, cada pieza extra del mismo set da **+4 % de afinidad** a las estadísticas de esas piezas (`PROG.setPct`). Mezclar piezas de distintos sets no suma nada. La ventana de Sets lo muestra. Los datos de `ISET` se siguen escribiendo como «total en ese escalón» (`Items.normSets` los convierte).
- **Minimapa** del mundo: ahora se puede mover, cambiar de tamaño y ocultar desde 🧩 Interfaz.
- **Barra de hechizos**: cuadrícula de **2 filas × 8 columnas** (se rellena por filas; si hay más de 16 se desplaza).

## 0.19.0 — Mapa fijo, botón Mapas y menú del servidor
- **Sin zoom**: se quitaron los botones ＋/－, la rueda del ratón, el pellizco y las teclas +/−. El mapa siempre se ve a la misma escala (`CFG.scale`) y ya no cambia de tamaño con la ventana.
- **Cámara**: sigue a tu personaje (en combate, al que está en turno), no deja huecos fuera del mapa y se puede **arrastrar**. 🎯 (o tecla 0) la recentra.
- **🗺 Mapas** en el menú (junto a Personaje, Hechizos…): ventana con el mapa del mundo 4×4, dónde estás, monstruos y salidas de cada mapa.
- **Servidor** en la pantalla de elegir personaje: botón 🌍 que abre una ventana con **Salir del juego · Cambiar de personaje · Cambiar de servidor**. El mismo menú sale con ☰ Menú arriba a la derecha. El selector de servidor del minimapa se eliminó.

## 0.18.0 — Mundo, amigos, intercambios y «¡Listo!»
- **Mundo 4×4** (16 mapas conectados, `js/data/arenas/mundo.js` + `js/game/world.js`): se pasa de mapa caminando por las casillas brillantes del borde. Plaza Central con todas las estaciones. PNG de fondo en `assets/world/mapa_<col>_<fila>.png` (ver `_LEEME.txt`). Minimapa y selector de **servidor** (solo ves a los de tu servidor).
- **Jugadores reales visibles** (Firebase `world/<servidor>/<mapa>/<uid>`). Monstruos paseando en 14 mapas: tócalos para desafiarlos.
- **Menú del jugador** (tócalo): Desafiar (duelo 1v1) · Intercambiar · Agregar amigo · Enemigo.
- **🤝 Amigos** en el panel del menú: lista con estado en línea, enemigos, solicitudes y chat privado.
- **Intercambios** de kamas y objetos con confirmación doble.
- **¡Listo!** antes de cada combate (monstruos, IA, mazmorras, PvP, desafíos): no empieza hasta que todos los jugadores reales lo pulsen.
- Ventana de resultado: sin «Ver tablero»; si hubo jugadores, botones **Agregar amigo / enemigo**.
- Reglas nuevas en `firebase/database.rules.json` (**hay que volver a publicarlas**).

## v0.17.0 · 2026-10-17
- Cuentas: entrar o crear cuenta con correo y contraseña, o con Google. Recuperar contraseña por correo.
- Progreso (personajes, equipo, kamas, mercado) guardado en la nube por cuenta (`saves/<uid>`), disponible desde cualquier dispositivo.
- PvP/Coliseo y chat usan la sesión real (se acabó el acceso anónimo).
- Reglas de Firebase endurecidas (sin anónimos, validaciones, cola y partidas protegidas).
- Despliegue en Vercel con cabeceras de seguridad y CI en GitHub.
