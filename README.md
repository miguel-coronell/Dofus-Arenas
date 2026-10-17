# Coliseo Web — combates por turnos estilo Dofus Touch (PvE y PvP)

Abrir `index.html` (o subir la carpeta a cualquier hosting estático). Cuenta nueva → **creador de personaje** (clase, sexo, cara, peinado y colores); si ya tienes personajes → **carrusel** para elegir (👤 arriba vuelve a él). Se guarda en el navegador.
Modos (selector de arriba; la **arena y el clima salen solos**, no hay que elegirlos): **Duelo vs IA** · **Monstruos** · **PvP online**. Botón **✨ Hechizos** = ventana de hechizos (niveles 1–5) · **📈** = nivel, capital y sets (cada set abre la ventana **Sets de equipo**). La cabecera muestra tu nivel y barra de XP; un puntito verde avisa de puntos por gastar.

## Cómo funciona
- **15 clases** con los hechizos de tu PDF «Resumen de Clases Dofus Touch» (15-21 por clase, con su coste de PA y alcance). **4 están desde el nivel 1**; el resto se desbloquea al ganar XP (niveles de personaje 3, 6, 9, 12, 16, 20…; ver `SLV` en `js/data/classes.js`). Cada hechizo sube de nivel 1 a 5 con puntos de hechizo (3 al inicio, +1 por nivel; subir cuesta su nivel actual) y cada nivel pide un nivel de personaje (`PROG.spReq`: 1, 2, 4, 7, 11).
- **Turnos**: PA (6, +1 desde nivel 100) y PM (3). Hechizos con alcance mín–máx, recarga (`cd`) y límite de lanzamientos por turno (`lim`).
- **Efectos**: daño por elemento (tierra/fuego/agua/aire), robo de vida, cura, armadura, buff/debuff de PA·PM·poder·resistencia·invisibilidad, veneno, empuje/atracción (con daño por choque), teletransporte, intercambio.
- **Progresión hasta nivel 200**: cada nivel = 5 puntos de capital (vida +1/pt, o poder de un elemento) y 1 punto de hechizo (máx. nivel de hechizo 5). «Reiniciar puntos» los devuelve gratis.
- **Sets de equipo** (parte 5): sus piezas se ganan como botín de monstruos (ver abajo). Ya no hay sets «por victorias».
- **XP**: ganar o perder da XP según el nivel del rival (`PROG` en `js/game/rules.js`; ahí está TODO el balance).

## Tus PNG
`assets/characters/<clase>_<m|f>.png` (ej. `feca_m.png`, `feca_f.png`). Lista completa en `assets/characters/_LEEME.txt`. Fondo transparente, mirando a la DERECHA. Si falta un PNG se ve el icono de la clase. Monstruos y arenas funcionan como antes (`monstruos.js`, `js/data/arenas/`).

## Añadir / cambiar hechizos
Todo en `js/data/classes.js`, una línea por hechizo: `Nombre|PA|alcMin-alcMax|elemento|tipo` (tipos explicados arriba del archivo). Los nombres, PA y alcances vienen del PDF; las invocaciones, trampas, glifos, bombas y torretas ya son reales (ver abajo). Los daños son números propios, no oficiales.

## Arquitectura
- `js/game/rules.js`   reglas puras (sin pantalla, azar con semilla) · `combat.js` animación, turnos e IA · `progress.js` nivel/XP/puntos/guardado
- `js/net/net.js`      PvP online (Firebase). Ambos clientes simulan con la misma semilla y solo se envían ACCIONES; cada cliente valida las del otro
- `tools/balance-sim.js`  `node tools/balance-sim.js` simula duelos IA entre todas las clases y niveles y muestra % de victorias (para equilibrar)

## Cuentas, nube y PvP online (v0.17)
Al abrir el juego aparece el **login** (correo + contraseña o Google, y «olvidé mi contraseña»). Tras entrar, el progreso (personajes, equipo, kamas, mercado) se sincroniza con tu cuenta en `saves/<uid>` y el PvP/chat usan esa misma sesión.
**Configuración y publicación paso a paso: `DEPLOY.md`** (Firebase → GitHub → Vercel). Código: `js/net/auth.js` (login + nube), `js/boot.js` (carga el juego tras el login), `css/auth.css`, `firebase/database.rules.json`.
Los `<script>` del juego en `index.html` llevan `type="text/game"` (no se ejecutan solos; `boot.js` los carga en orden al iniciar sesión). Para añadir uno, copia ese formato.
Comprobaciones: `npm run check` (datos, reglas de Firebase, HTML/JS).
Pendiente (no incluido): validación de XP/kamas en servidor (Cloud Functions), ranking, anti-spam del chat.

## Zoom, arenas pintadas y calibración
Rueda/pellizco/＋－ · arrastrar el fondo · `⤢` ajusta el tablero · `🖼` arena completa. Calibrar fondos: `index.html?cal=1` (flechas mueven, `+`/`-` escalan, `C` copia `art:{…}`).

## Invocaciones y objetos del mapa (parte 1)
Todo en `js/data/objects.js` (una línea por invocación/objeto + la tabla `OBM` que dice qué hechizo de cada clase lo crea). PNG en `assets/objects/<id>.png` (lista en `assets/objects/_LEEME.txt`).
- **Invocaciones** (Osamodas, Anutrof, Sram-Doble, Zurcarák, Sadida, Sacrógrito, Pandawa, Ocra, Xelor, Aniripsa, Tymador, Zobal, Steamer): entidades con turno propio, **juegan solas** justo después de su dueño. IA según rol: `melee`, `ranged`, `heal` (cura al aliado más herido), `tackle` (Doble), `kami` (Sacrificada explota), `static` (torretas, árboles, vasija… con aura). Límite: `PROG.maxSum` (2, +1 cada 60 niveles); torretas, árboles y balizas no cuentan y tienen su propio máximo (`max`). Si muere el dueño, desaparecen. No cuentan para ganar/perder.
- **Trampas** (Sram): invisibles para el rival, se activan al pisarlas (también si lo empujan o teletransportan) y detienen al que camina sobre ellas. **Glifos** (Feca): zona que dura 3 turnos y actúa al empezar el turno de los enemigos dentro. **Bombas** (Tymador): estallan a los 2 turnos o al instante con *Detonador*. **Torretas** (Steamer): *Evolución* las sube hasta nivel III.
- Los números escalan con el nivel del hechizo (1-5) y el poder del dueño. `describe` ya muestra estos efectos en la ventana de hechizos.
- Aún no incluido: reflejo de daño del Prespic, muros de bombas, esqueletos de la Superpoderosa, estados Ebrio/Telefrag, teletransporte con rebote de la Baliza.

## Temporizador de turno y ventana de resultado (parte 2)
- **Reloj**: `PROG.turnSec` (rules.js, 30 s; 0 = sin límite). Barra sobre tu vida: verde → amarillo → roja y parpadeando en los últimos 5 s. Solo corre en turnos de jugadores (no IA, monstruos ni invocaciones) y se detiene durante las animaciones. A 0 el turno pasa solo («Tiempo agotado»). En PvP lo envía el cliente de quien juega; si el rival se desconecta no se pasa su turno (pendiente).
- **Resultado** (`UI.result` en main.js, datos en `finish()` de combat.js): victoria / derrota / empate, ganador y perdedor con vida restante, daño hecho, recibido y curas (las invocaciones, trampas, glifos y bombas cuentan para su dueño), XP, subida de nivel, hechizos y sets desbloqueados, duración y turnos. Botones: combatir de nuevo, ver tablero, personaje. El botón «Fin de turno» pasa a «📊 Resultado» para reabrirla. `R.loot` está reservado para el botín de monstruos (siguiente parte).

## Cuenta, carrusel y creador de personaje (parte 3)
- **Cuenta** = los personajes guardados en este navegador (máx. `PROG.maxChars` = 5, clave `coliseo.chars`; el personaje único de versiones anteriores se migra solo). Al abrir: cuenta nueva → creador; si no → carrusel (← → / arrastrar / rueda / clic en la tarjeta central para jugar). Botones: Jugar · Apariencia (nombre, sexo, cara, peinado y colores; la clase no se cambia) · Borrar.
- **Aspecto** (`js/data/looks.js`; se guarda en `build.look`, viaja en PvP y se sanea al recibirlo): 8 caras, 8 peinados, 8 pieles, 10 colores de pelo, 6 de ojos y 13 de atuendo. Para añadir uno nuevo, añade una entrada a su lista.
- **Dónde se ve**: cara, peinado, piel, pelo y ojos en el RETRATO (carrusel, cabecera, creador, ventana de resultado). El color de atuendo pinta el retrato, el ANILLO bajo los pies en combate y recolorea las zonas azules/verdes/violetas del sprite (Osamodas, Sram…). Los PNG naranjas/marrones (Feca, Anutrof…) no se pueden recolorear sin máscaras: ahí solo cambia el anillo y el retrato. El recolor de píxeles necesita servidor/hosting; abriendo `index.html` con `file://` el navegador lo bloquea y solo se ven anillo y retrato.
- Las cuentas en la nube ya están (ver «Cuentas, nube y PvP online»). Pendiente: recolor de piel/pelo en el sprite (haría falta una máscara por PNG).

## Kamas, equipo, inventario y mercadillo (parte 4)
- **Kamas** (`b.kamas`): se ganan por combate (`PROG.kamasWin` / `kamasLose`, en `js/game/items.js`; 300 de inicio) y, en Monstruos, por lo que defina cada monstruo. Cabecera: 💰. Para otra fuente (mazmorras…) llama a `PG.reward(PJ,[{kamas:[min,max],drops:[['id',0.2]]}])` y muestra su resultado.
- **Equipo**: 9 huecos (sombrero, capa, amuleto, 2 anillos, cinturón, botas, arma, escudo). Cada objeto pide un nivel mínimo y suma vitalidad, fuerza/inteligencia/suerte/agilidad (puntos de elemento), poder, resistencia, PA o PM. Los sets dan bono según nº de piezas equipadas (cuenta el escalón más alto). Se aplica en el siguiente combate; los rivales IA llevan el mejor equipo de su nivel.
- **🛒 Mercadillo**: Comprar (categorías + buscador por nombre/set) e Inventario (equipar, quitar, vender al 50 %, `PROG.sellPct`). También desde 📈 Personaje → Equipo.
- **Ampliar sin tocar código**: objetos, sets y categorías → una línea en `js/data/items/base.js` (o copia ese archivo para una zona/mazmorra y añade su `<script>` en `index.html`). `nosale:true` = solo botín. Monstruos: `kamas:[min,max]` y `drops:[['id',prob]]` en `monstruos.js`. Nueva estadística: línea en `STAT` + usarla en `Rules.stats`. Nueva categoría o hueco: `KIND(...)`.
- PvP: `Net.sane` rechaza equipo que no existe, no va en su hueco o supera el nivel. Pendiente (como el resto de la progresión): kamas/inventario siguen en el navegador, sin validar en servidor.

## Sets de equipo, botín y retos (parte 5)
- **Sets por piezas**: los sets (`ISET` en `js/data/items/base.js`) tienen una pieza por categoría (sombrero, capa, amuleto, anillo, cinturón, botas, arma, escudo) y las piezas son **solo botín** (`nosale` automático para todo objeto con `set:`; se pueden vender luego a 50 %). Las piezas que consigues aparecen en 🛒 Inventario, filtrables por categoría.
- **Ventana «Sets de equipo»** (`js/ui/sets.js`; desde 📈 Personaje → Set de equipo, o «Ver set completo» en el inventario): lista de sets con tu progreso (3/7) → al elegir uno ves los **bonos por nº de piezas**, **cada pieza** con lo que aporta, si la tienes/equipada, y **qué monstruos la sueltan con su %** (por monstruo vencido, con su rango de nivel). Botón «Equipar las piezas que tengo».
- **Monstruos** (`js/data/monsters/monstruos.js`): 16 monstruos en 4 zonas (Raíz, Brasa, Abismo, Titán), con `lv:[min,max]` (a qué nivel de jugador aparecen), `ico` (emoji mientras no haya PNG) y `drops:[['id',prob,[min,max]?]]`. Esa misma tabla alimenta las ventanas de sets e inventario: añadir un drop = una línea, nada más.
- **Recursos** (cueros, colmillos, perlas…, categoría 🟫 Recursos): se **apilan** (`b.res`, máx. 999 por tipo, no gastan huecos del inventario), se **compran (×1/×10) y se venden (×1/todo)** en el mercadillo y los sueltan monstruos y retos. Nuevo recurso: una línea `REC(...)` en base.js.
- **Retos** (`js/game/challenges.js`): en cada combate vs IA/Monstruos salen **3 retos al azar** (panel 🏅 abajo a la izquierda, ✔/✖ en directo). Si ganas y los cumples: **+XP, +kamas, recursos extra de tu nivel y +8 % por ★ a la probabilidad de TODO el botín** (piezas de set incluidas). Hay 9 (Relámpago, Fulminante, Aguanta, Intacto, Zen, Activo, Ahorrador, Preciso, Sin curas); añadir uno = una línea `CHAL(...)`. Premios por ★ y nº de retos: `PROG.chal`. La ventana de resultado muestra retos cumplidos, bonus y botín (las piezas de set en dorado).
- Pendiente: PNG de los monstruos (hoy se ven con su emoji), venta de piezas entre jugadores, y que los precios del mercadillo varíen.


## Novedades (v11)
- **Tiempo por turno**: anillo de 30 s junto a «Fin de turno» (`PROG.turnSec` en rules.js). Se pausa con ventanas abiertas.
- **Mapas por celdas** (`js/data/arenas/*.js`, plantilla en `_plantilla_arena.txt`): 10 arenas de 8×8 a 17×13, formas irregulares; solo se camina por el suelo. Arena y clima (`wx`) automáticos.
- **Obstáculos** (`# c t p m` altos · `f o ~` bajos): infranqueables. Los altos tapan la **línea de visión**; monstruos y personajes no. Hechizos con `nlos:true` (teletransportes, invocaciones) no la necesitan.
- **Oficios** (🔨): sastre, zapatero, joyero, forjador, alquimista. Recetas en `js/data/crafts.js`; los sets se fabrican con recursos que sueltan los monstruos.
- **Supermercado** (🛒, `js/game/economy.js`): precios por oferta/demanda, noticias y ofertas, puesto de venta propio. Los compradores del puesto están simulados (comercio real entre jugadores requeriría Firebase).
- **Consumibles** (pociones, pan…) usables en combate desde la pestaña 🎒 Objetos de la barra inferior.
- **Inventario** estilo Dofus Touch (🎒 Personaje) y barra de combate con orbe de vida, PA/PM, retratos de turno y chat.

## Novedades (v12)
- **Ventanas tipo sistema operativo**: todas (resultado, inventario, oficios, mercado, hechizos, personaje, sets) tienen — minimizar · ▢ maximizar · ✕ cerrar arriba a la derecha (Esc cierra la de arriba). Las minimizadas quedan como pestañas arriba a la izquierda. Código: `js/ui/windows.js`.
- **Sala de espera** (`js/game/hub.js`, mapa `js/data/arenas/_sala.js`): al terminar un combate (✕ del resultado o «🏛 Sala de espera») vuelves a una plaza donde caminas con el clic. Objetos interactivos: 🔨 Oficios · 🛒 Supermercado · 📋 Puesto · 🎒 Baúl · 📖 Hechizos · portales ⚔️ Duelo IA, 👹 Monstruos, 🌐 PvP. Acércate y pulsa «Abrir» o la tecla E (o toca el objeto y camina solo). Botón 🏛 Sala arriba para volver desde un combate (abandonar = derrota).
  Los otros jugadores que pasean son simulados; la presencia real necesitaría Firebase.
- Inventario: el personaje queda en el centro del muñeco de equipo.

## Novedades (v13)
- **Mapas**: la imagen PNG de la arena se ve nítida y encima solo se dibujan las celdas (translúcidas); los obstáculos/huecos del dibujo de texto definen qué celdas existen.
- **Chat de la sala** (abajo a la izquierda): escribe y los jugadores simulados responden; sus frases y las tuyas salen también como burbujas.
- **Equipo 👥** (botón de arriba, estación 👥 de la sala o tocando a un jugador): hasta 3 compañeros que te siguen y combaten a tu lado con IA en duelos, monstruos y mazmorras (+10 % XP por compañero, más enemigos).
- **Mazmorras 🏰** (estación de la sala): 27 mazmorras de nivel 10 a 190 con su jefe (`js/data/dungeons.js`, una línea cada una). 3 salas (esbirros, esbirros, jefe), recuperas 40 % de vida entre salas; botín: trofeo del jefe + recursos del tier. Requieren el nivel indicado.

## Novedades (v13)
- **Imagen del mapa a pantalla completa**: se acabó la «ventanita» enmarcada sobre fondo borroso; la imagen de la arena (`assets/arenas/*.jpg`) cubre todo el escenario, nítida (`drawBg` en `js/render/arena.js`). En la sala el tablero también se agranda (`rs()` en main.js).
- **Menú de navegación abajo a la derecha** (como la barra de Dofus): Sala · Mazmorras · Equipo · Personaje · Hechizos · Oficios · Mercado · Personajes. Ya no va arriba (la barra superior solo tiene personaje, kamas, modo y «Combatir»). En móvil se pliega con ☰.
- **Chat por canales** (`js/ui/chat.js`), el mismo en la sala y en los combates: 🌐 General · ⚔️ Combate · 👥 Equipo · 🛒 Comercio · 🔨 Oficios + «Todo». Clic en una pestaña = ver y hablar por ese canal; también hay desplegable junto a la caja de texto. Atajos: `/g` `/e` `/c` `/o` `/cb` (ej. `/e voy por la izquierda`). **Enter** o **/** enfocan el chat. Avisos rojos de mensajes sin leer.
  - **Combate**: lo que pasa en la pelea (turnos, hechizos, daños) sale en esa pestaña y también puedes escribir durante el combate.
  - **Equipo**: hablas con tu grupo (si no tienes, el chat te avisa). Los compañeros son simulados y responden.
  - Con **Firebase** configurado, General/Comercio/Oficios son salas reales y en PvP el canal Combate habla con tu rival. **Vuelve a pegar `firebase/database.rules.json` en las reglas** (el chat ahora cuelga de `chat/<canal>` y hay `matches/<id>/chat`).
- **Icono de equipo / mazmorras** (costado derecho de la sala, `renderPty` en `js/ui/party.js`): 🏰 abre las mazmorras · botón **Solo / Equipo** (`Party.solo`) para entrar a mazmorras y combates sin tu grupo (también está dentro de la ventana de mazmorras) · retratos de tus compañeros (clic = ventana de equipo, ✕ = expulsar) y huecos ＋ para invitar.

## Novedades (v15)
- **🧩 Interfaz personalizable** (botón arriba, `js/ui/layout.js` + `css/ui4.css`): en combate y en la sala puedes **mover, cambiar de tamaño y ocultar** los paneles: Chat, Vida y hechizos, Personaje en turno, Orden de turnos, Retos, Menú, Zoom y Equipo. Al pulsar el botón el juego se pausa y cada panel muestra un marco: **arrastra** para moverlo, tira de la **esquina ◢** para cambiar su tamaño, **✕** lo oculta (la barra de arriba lo vuelve a mostrar). El **chat** crece y su letra se adapta; el resto de paneles **escalan todo su interior** a la vez. Se guarda en el navegador, por separado para **combate** y **sala** (`coliseo.layout.v1`). «↺ Restablecer» deja el diseño original. Si mueves u ocultas la barra de hechizos, el tablero deja de reservarle sitio.
- **Resistencias por elemento**: nuevas estadísticas `rtierra · rfuego · ragua · raire` (% por elemento, negativo = debilidad, tope ±50 junto con la resistencia general). Se suman desde el equipo y los bonos de set (`Rules.stats` → `rel`) y reducen el daño de ESE elemento en `Rules.hit`. La tarjeta del personaje en turno muestra las resistencias de cualquier personaje o monstruo (en rojo las debilidades); también salen en 🎒 Personaje e inventario.
- **Monstruos con resistencias**: campo `resist:{tierra:20,aire:-10}` en cada monstruo (`MON({...})` / `MRES(id,{...})` en `js/data/monsters/zonas_extra.js`). Los 16 monstruos de siempre ya tienen las suyas (cada zona tiene su punto débil) y las mazmorras generan las suyas según el nivel (`DRES` en `dungeons.js`: esbirros fuertes a un elemento y débiles a otro, jefe resistente a todo con UN punto débil).
- **Equipo nuevo** (`js/data/items/extra.js`, recetas en `js/data/crafts_extra.js`): resistencias en las piezas y bonos de los 4 sets viejos; cada set llega a **9 piezas** (2.º anillo + escudo) con bono de **set completo**; **3 sets nuevos** (Brisa nv 30 · aire, Pétreo nv 70 · tierra con debilidad al aire, Celestial nv 150 · todos los elementos); **29 piezas sueltas** en el mercadillo (anillos, capas, amuletos, cinturones, botas, sombreros, escudos y armas con vida, PM, PA, poder y resistencias). 3 **zonas de monstruos nuevas** (Brisa, Pétrea, Celestial) sueltan sus recursos.
  - Ojo: de un set solo cuenta el **escalón más alto** alcanzado (no se suman), así que cada escalón incluye al anterior (lo comprueba `tools/check-data.js`).
- **Herramienta**: `node tools/check-data.js` revisa objetos, sets, recetas, drops, estadísticas y las resistencias antes de abrir el juego.

## Novedades (v16)
- **🚪 Salir del combate**: botón rojo «Salir» junto a «Fin de turno» (también `Esc` y el botón 🏛 Sala del menú). Siempre pide confirmación y explica lo que pasa según el modo (`leaveInfo()` / `forfeit()` en `js/game/combat.js`):
  - **Duelo vs IA y Monstruos**: cuenta como **derrota** (XP de perder, sin botín). La ventana de resultado dice «ABANDONASTE».
  - **Mazmorra**: pierdes **todas las recompensas pendientes** y la mazmorra se reinicia; tu equipo sigue sin ti (aviso en el canal Equipo).
  - **PvP**: derrota; tu equipo sigue luchando sin ti (en 1v1 gana el rival).
- **🔨 Oficios → 🛒 Mercadillo**: al hacer clic en un **ingrediente** de una receta, si te falta te lleva al mercadillo (pestaña Comprar) con ese objeto elegido y la **cantidad que te falta**; arriba hay un botón «↩ Volver a <receta>». Si ya lo tienes, avisa; si no se vende (solo botín), dice qué monstruos lo sueltan.
- **⚔️ Coliseo con búsqueda de partida** (`js/ui/coliseo.js`, `js/net/net.js`): formatos **1 vs 1, 2 vs 2 y 3 vs 3**. Pulsas «Buscar partida» y **la búsqueda queda activa** hasta que haya **jugadores reales** para completar los dos equipos (2, 4 o 6): no se entra a ninguna sala ni se rellena con bots. Mientras esperas puedes seguir en la sala (aparece un contador flotante con «Ver» y «✕ cancelar»). Al completarse sale «¡Partida encontrada!» y a los 3 s empieza. Los equipos se reparten por nivel (0,1,1,0,0,1). Mientras buscas no puedes empezar otros combates ni mazmorras.
- **PvP robusto**: si alguien abandona o se desconecta, su personaje cae y el resto sigue; si un jugador no responde, se le pasa el turno a los ~6 s de agotarse su reloj y a los 3 turnos seguidos se le expulsa por inactividad. El reloj del turno ya no se pausa en PvP al abrir ventanas.
- ⚠️ **Hay que volver a pegar `firebase/database.rules.json`** en las reglas de Firebase (la cola ahora cuelga de `lobby/q/<formato>` y las partidas usan `matches/<id>/meta/uids`). Sin Firebase configurado, la ventana del Coliseo avisa de que no hay partidas.
