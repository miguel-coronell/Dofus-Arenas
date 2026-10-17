/* objects.js · INVOCACIONES y OBJETOS DE MAPA (trampas, glifos, bombas, torretas, árboles…)
   Cada uno es un registro en Registry.objs. PNG de cada uno: assets/objects/<id>.png (fondo transparente, mirando a la DERECHA; si falta se ve el icono).
   kind:'sm' invocación = entidad con turno propio, la maneja la IA sola (combat.js · sai)
        'trap' invisible para el rival, salta al pisarla · 'glyph' zona que actúa al inicio del turno de los enemigos dentro · 'bomb' estalla a los tn turnos o con Detonador
   Invocación: hp:[base,por nivel] (o hpO: fracción de la vida del dueño) · pa · pm (0 = no se mueve) · res · sp:[hechizos propios] · ai:'melee'|'ranged'|'heal'|'tackle'|'kami'|'static'
               aura:[{to:'enemy'|'ally'|'self', r:radio, fx:[efectos]}] se aplica al inicio de SU turno · max:n máximo del mismo tipo · nc:true no cuenta para el límite · tur:true torreta evolucionable · prosp: % de prospección (para el botín)
   Objeto de mapa: r (radio), el (elemento: color), fx (efectos al activarse), tn (turnos de vida de glifos / de mecha de bombas)
   Los números escalan con el nivel del hechizo que los crea (Nv 1-5) y con el poder del dueño.  d = descripción que sale en la ventana de hechizos. */
const OD=(id,n,ico,kind,d,o)=>Registry.add('objs',id,{n,ico,kind,d,...o});
const SS=(id,n,i,pa,r,e,o)=>addSpell('o_'+id,n,i,pa,r,e,o);
const SUM=(id,n,ico,d,hp,o)=>OD(id,n,ico,'sm',d,{hp,...o});

/* ---------- Osamodas ---------- */
SS('tofu','Picotazo de Tofu','🐦',3,[1,5],[D('aire',8,12)]);
SUM('tofu','Tofu','🐦','Ataca a distancia con Aire hasta 5 casillas y se mueve mucho. Juega solo cada turno',[30,4],{pa:6,pm:4,sp:['o_tofu'],ai:'ranged'});
SS('jalato','Mordisco de Jalató','🐗',3,[1,1],[D('tierra',10,15),B('pm',-1,1,'t')]);
SUM('jalato','Jalató','🐗','Luchador cuerpo a cuerpo de Tierra: va solo hacia el enemigo y le quita 1 PM al morder',[60,7],{pa:6,pm:3,sp:['o_jalato'],ai:'melee'});
SS('prespic','Mirada de Prespic','👁️',3,[1,4],[D('agua',6,9),B('pa',-1,1,'t')]);
SUM('prespic','Prespic','👁️','Ataca con Agua a 4 casillas y quita 1 PA al enemigo golpeado',[35,4],{pa:6,pm:3,sp:['o_prespic'],ai:'ranged'});
SS('dragonito','Aliento de Dragonito','🐲',4,[1,4],[D('fuego',10,14),{k:'dp'}]);
SUM('dragonito','Dragonito Rojo','🐲','Escupe Fuego a 4 casillas y desembruja al objetivo (le quita bonus y armaduras)',[45,5],{pa:6,pm:3,sp:['o_dragonito'],ai:'ranged'});
SS('brizlon','Embestida de Brizlón','🐃',3,[1,1],[D('tierra',6,9),PU(2)]);
SUM('brizlon','Brizlón','🐃','Embiste cuerpo a cuerpo y empuja 2 casillas al enemigo (choque = daño extra)',[70,8],{pa:6,pm:3,sp:['o_brizlon'],ai:'melee'});
/* ---------- Anutrof ---------- */
SUM('mochila','Mochila Animada','🎒','No se mueve. Gran resistencia (10%) y recupera vida cada turno: sirve de muro',[100,10],{pa:0,pm:0,res:10,ai:'static',aura:[{to:'self',fx:[H(8,12,'agua')]}]});
SUM('cofre','Cofre Animado','📦','No se mueve. Cura a los aliados a 3 casillas, daña de Agua a los enemigos a 2 y aumenta la prospección',[60,6],{pa:0,pm:0,ai:'static',prosp:10,aura:[{to:'ally',r:3,fx:[H(6,9,'agua')]},{to:'enemy',r:2,fx:[D('agua',5,8)]}]});
SUM('pala','Pala Animada','⛏️','No se mueve. Cada turno empuja 1 casilla a los enemigos a 2 casillas y les quita 1 PM',[50,6],{pa:0,pm:0,ai:'static',aura:[{to:'enemy',r:2,fx:[PU(1),B('pm',-1,1,'t')]}]});
/* ---------- Sram ---------- */
SUM('doble','Doble','👤','Copia del Sram (la mitad de su vida). No ataca: corre hacia el enemigo y le tapa el paso',[0,0],{hpO:.5,pa:0,pm:4,ai:'tackle'});
OD('trampa_solapada','Trampa Solapada','🔥','trap','Trampa invisible para el rival. Al pisarla explota en 1 casilla: daño de Fuego y atrae al centro',{r:1,el:'fuego',fx:[D('fuego',12,17),PU(-1)]});
OD('trampa_masa','Trampa de Masa','🪨','trap','Trampa invisible. Explota en zona de 2 casillas con daño de Tierra',{r:2,el:'tierra',fx:[D('tierra',14,20)]});
OD('trampa_envenenada','Trampa Envenenada','☠️','trap','Trampa invisible. Aplica un veneno de Fuego durante 3 turnos en 1 casilla',{r:1,el:'fuego',fx:[VE('fuego',8,11,3)]});
OD('trampa_repulsiva','Trampa Repulsiva','💨','trap','Trampa invisible. Daño leve y empuja 2 casillas desde el centro',{r:1,el:'neutro',fx:[D('neutro',6,9),PU(2)]});
OD('trampa_inmovilizadora','Trampa Inmovilizadora','🕸️','trap','Trampa invisible. Quita 3 PM en zona de 2 casillas durante 2 turnos',{r:2,el:'tierra',fx:[D('tierra',5,8),B('pm',-3,2,'t')]});
OD('trampa_mortal','Trampa Mortal','💀','trap','Trampa invisible de 1 sola casilla con daño masivo de Tierra',{r:0,el:'tierra',fx:[D('tierra',34,46)]});
/* ---------- Zurcarák ---------- */
SS('gatito','Zarpazo','🐱',3,[1,1],[D('fuego',7,11)]);SS('gatito_h','Ronroneo','💚',2,[1,3],[H(5,8,'agua')],{tg:'a'});
SUM('gatito','Gatito','🐱','Araña cuerpo a cuerpo con Fuego y cura a los aliados heridos cercanos',[30,4],{pa:6,pm:4,sp:['o_gatito','o_gatito_h'],ai:'heal'});
/* ---------- Sadida (muñecas y árbol) ---------- */
SS('bloq','Placaje','🛡️',3,[1,1],[D('tierra',5,8),B('pm',-2,1,'t')]);
SUM('bloqueadora','La Bloqueadora','🪆','Muñeca muy resistente (20%): se pega al enemigo y le quita 2 PM',[90,9],{pa:6,pm:3,res:20,sp:['o_bloq'],ai:'melee'});
SS('loca','Locura','🌀',3,[1,4],[D('agua',6,9),B('pa',-2,1,'t')]);
SUM('loca','La Loca','🌀','Muñeca que quita 2 PA a distancia (4 casillas)',[40,4],{pa:6,pm:3,sp:['o_loca'],ai:'ranged'});
SS('sacri','Explosión','💥',3,[0,0],[D('tierra',14,20),{k:'die'}],{tg:'s',aoe:1});
SUM('sacrificada','La Sacrificada','💣','Muñeca kamikaze: corre hacia el enemigo y explota en 1 casilla de radio con daño de Tierra',[30,3],{pa:6,pm:4,sp:['o_sacri'],ai:'kami'});
SS('hinch','Sanación','💚',3,[1,4],[H(8,12,'agua'),B('pm',1,2,'t')],{tg:'a'});
SUM('hinchada','La Hinchada','🎈','Muñeca curandera: sana al aliado más herido y le da +1 PM durante 2 turnos',[50,5],{pa:6,pm:3,sp:['o_hinch'],ai:'heal'});
SS('super','Cuchilla','🗡️',3,[1,1],[D('tierra',9,13)]);
SUM('superpoderosa','La Superpoderosa','🧌','Muñeca de traba: cada turno quita 1 PM a todos los enemigos a 6 casillas y ataca cuerpo a cuerpo',[80,8],{pa:6,pm:3,sp:['o_super'],ai:'melee',aura:[{to:'enemy',r:6,fx:[B('pm',-1,1,'t')]}]});
SUM('arbol','Árbol','🌳','No se mueve y bloquea la casilla. Cura a los aliados a 2 casillas cada turno. Máx. 2 a la vez',[70,8],{pa:0,pm:0,ai:'static',nc:true,max:2,aura:[{to:'ally',r:2,fx:[H(5,8,'tierra')]}]});
/* ---------- Sacrógrito ---------- */
SS('espada','Tajo Vampírico','🗡️',3,[1,1],[D('tierra',9,13,{ls:.6})]);
SUM('espada','Espada Voladora','🗡️','Espada que avanza sola, corta cuerpo a cuerpo y roba vida para curar al Sacrógrito',[40,4],{pa:6,pm:4,sp:['o_espada'],ai:'melee'});
/* ---------- Pandawa / Ocra / Xelor ---------- */
SUM('vasija','Vasija','🏺','No se mueve. Atrae 1 casilla a los enemigos a 4 casillas y cura a los aliados a 2',[60,6],{pa:0,pm:0,ai:'static',aura:[{to:'enemy',r:4,fx:[PU(-1)]},{to:'ally',r:2,fx:[H(5,8,'agua')]}]});
SUM('baliza','Baliza Táctica','🚩','No se mueve y bloquea la casilla. Cada turno empuja 1 casilla a los enemigos pegados a ella. Máx. 2',[40,4],{pa:0,pm:0,ai:'static',nc:true,max:2,aura:[{to:'enemy',r:1,fx:[PU(1)]}]});
SUM('esfera','Esfera de Xelor','🔮','No se mueve. Cada turno quita 1 PA a los enemigos a 3 casillas',[35,4],{pa:0,pm:0,ai:'static',aura:[{to:'enemy',r:3,fx:[B('pa',-1,1,'t')]}]});
/* ---------- Aniripsa / Tymador / Zobal ---------- */
SS('conejita','Cura de Conejita','🐰',2,[1,3],[H(6,10,'agua')],{tg:'a'});
SUM('conejita','Conejita','🐰','Avanza sola hacia el aliado más herido y lo cura cada turno',[35,4],{pa:6,pm:4,sp:['o_conejita'],ai:'heal'});
SS('tymobot','Descarga','🤖',3,[1,3],[D('fuego',8,12),PU(1)]);
SUM('tymobot','Tymobot','🤖','Robot que dispara Fuego a 3 casillas y empuja 1 casilla al enemigo',[50,5],{pa:6,pm:3,sp:['o_tymobot'],ai:'ranged'});
SUM('mascara','Máscara Invocada','🎭','No se mueve. Cada turno da un escudo de Aire a los aliados a 2 casillas',[40,4],{pa:0,pm:0,ai:'static',aura:[{to:'ally',r:2,fx:[AR(10,14,'aire',2)]}]});
/* ---------- Steamer: torretas (máx. 1 de cada; "Evolución" las sube hasta nivel III: +vida y +daño) ---------- */
SS('arpon','Arpón','⚓',3,[1,6],[D('agua',8,12),PU(-1)]);
SUM('harponera','Harponera','⚓','Torreta ofensiva fija: dispara Agua a 6 casillas y atrae 1 casilla al enemigo',[60,6],{pa:6,pm:0,sp:['o_arpon'],ai:'static',nc:true,max:1,tur:true});
SS('cura_g','Cura de Guardiana','💙',3,[1,5],[H(7,11,'agua')],{tg:'a'});
SUM('guardiana','Guardiana','💙','Torreta defensiva fija: cura cada turno al aliado más herido a 5 casillas',[60,6],{pa:6,pm:0,sp:['o_cura_g'],ai:'static',nc:true,max:1,tur:true});
SS('rafaga','Ráfaga Táctica','🌬️',3,[1,4],[D('aire',5,8),PU(2)]);
SUM('tactica','Táctica','🌬️','Torreta táctica fija: dispara Aire a 4 casillas y empuja 2 casillas al enemigo',[60,6],{pa:6,pm:0,sp:['o_rafaga'],ai:'static',nc:true,max:1,tur:true});

/* ---------- Feca: glifos (duran 3 turnos; actúan al inicio del turno de los enemigos que estén dentro) ---------- */
OD('glifo_flamigero','Glifo Flamígero','🔥','glyph','Zona de 2 casillas durante 3 turnos: daño de Fuego a los enemigos al empezar su turno',{r:2,el:'fuego',tn:3,fx:[D('fuego',9,13)]});
OD('glifo_agresivo','Glifo Agresivo','🌪️','glyph','Zona de 1 casilla durante 3 turnos: daño de Aire y reduce el poder del enemigo',{r:1,el:'aire',tn:3,fx:[D('aire',7,10),B('pow',-15,1,'t')]});
OD('glifo_optico','Glifo Óptico','👁️','glyph','Zona de 2 casillas durante 3 turnos: daño leve y baja 15% las resistencias del enemigo',{r:2,el:'fuego',tn:3,fx:[D('fuego',4,7),B('res',-15,2,'t')]});
OD('glifo_repulsion','Glifo de Repulsión','💢','glyph','Zona de 1 casilla durante 3 turnos: daño leve y empuja 2 casillas',{r:1,el:'neutro',tn:3,fx:[D('neutro',6,9),PU(2)]});
OD('glifo_gravitacional','Glifo Gravitacional','🌀','glyph','Zona de 2 casillas durante 3 turnos: atrae 1 casilla al centro y quita 1 PM',{r:2,el:'tierra',tn:3,fx:[PU(-1),B('pm',-1,1,'t')]});
/* ---------- Tymador: bombas (estallan en 1 casilla de radio a los 2 turnos o al instante con Detonador) ---------- */
OD('bomba_incandescente','Bomba Incandescente','🧨','bomb','Estalla a los 2 turnos (o con Detonador) en 1 casilla de radio: gran daño de Fuego',{r:1,el:'fuego',tn:2,fx:[D('fuego',18,26)]});
OD('bomba_explosiva','Bomba Explosiva','🌩️','bomb','Estalla a los 2 turnos (o con Detonador): daño de Aire y quita 1 PM',{r:1,el:'aire',tn:2,fx:[D('aire',13,19),B('pm',-1,1,'t')]});
OD('bomba_hidrica','Bomba Hídrica','💧','bomb','Estalla a los 2 turnos (o con Detonador): daño de Agua y quita 1 PA',{r:1,el:'agua',tn:2,fx:[D('agua',12,18),B('pa',-1,1,'t')]});

/* ---------- Qué hechizo de cada clase crea qué (clave 'clase.Nombre del hechizo'). r = alcance si se quiere distinto al de la lista ---------- */
const OBM={},ob=(c,n,k,o,x)=>{OBM[c+'.'+n]={k,o,...x}};
ob('osamodas','Invocación de Tofu','sm','tofu');ob('osamodas','Invocación de Jalató','sm','jalato');ob('osamodas','Invocación de Prespic','sm','prespic');
ob('osamodas','Dragonito Rojo','sm','dragonito');ob('osamodas','Invocación de Brizlón','sm','brizlon');
ob('anutrof','Mochila Animada','sm','mochila');ob('anutrof','Cofre Animado','sm','cofre');ob('anutrof','Pala Animada','sm','pala');
ob('sram','Doble','sm','doble');ob('sram','Trampa Solapada','ob','trampa_solapada');
ob('sram','Trampa Envenenada','ob','trampa_envenenada');ob('sram','Trampa Repulsiva','ob','trampa_repulsiva');ob('sram','Trampa de Inmovilización','ob','trampa_inmovilizadora');ob('sram','Trampa Mortal','ob','trampa_mortal');
ob('zurkarak','Garra Invocadora','sm','gatito');
ob('sadida','La Bloqueadora','sm','bloqueadora');ob('sadida','La Loca','sm','loca');ob('sadida','La Sacrificada','sm','sacrificada');
ob('sadida','La Hinchada','sm','hinchada',{r:[1,4]});ob('sadida','La Superpoderosa','sm','superpoderosa');ob('sadida','Árbol','sm','arbol',{r:[1,5]});
ob('sacrogrito','Espada Voladora','sm','espada');ob('pandawa','Vasija','sm','vasija');ob('ocra','Baliza Táctica','sm','baliza');ob('xelor','Esfera de Xelor','sm','esfera');
ob('aniripsa','Palabra Amistosa','sm','conejita');
ob('tymador','Tymobot','sm','tymobot');ob('tymador','Bomba Incandescente','ob','bomba_incandescente');ob('tymador','Bomba Explosiva','ob','bomba_explosiva');
ob('tymador','Bomba Hídrica','ob','bomba_hidrica');ob('tymador','Detonador','det');
ob('zobal','Mueca','sm','mascara');
ob('steamer','Harponera','sm','harponera');ob('steamer','Guardiana','sm','guardiana',{r:[1,4]});ob('steamer','Táctica','sm','tactica');ob('steamer','Evolución','evo');
ob('feca','Glifo Flamígero','ob','glifo_flamigero');ob('feca','Glifo Agresivo','ob','glifo_agresivo');ob('feca','Glifo Óptico','ob','glifo_optico');
ob('feca','Glifo de Repulsión','ob','glifo_repulsion');ob('feca','Glifo Gravitacional','ob','glifo_gravitacional');
