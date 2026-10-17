/* classes.js · las 15 clases con sus hechizos (nombres, PA y alcance según tu PDF "Resumen de Clases Dofus Touch").
   Una línea por hechizo:  Nombre|PA|alcMin-alcMax|elemento|tipo|nivelPersonaje(opcional)     (elemento: t tierra · f fuego · a agua · v aire · n neutro→tierra)
   Tipos (las invocaciones, trampas, glifos, bombas y torretas son REALES: están en js/data/objects.js (tabla OBM) y sustituyen la línea de abajo):
     d daño · big daño alto (1/turno, recarga) · ls roba vida · dot veneno · su invocación (≈ daño continuo) · pm quita PM · pa quita PA · rr baja resistencia
     pu empuja · pl atrae · tp teletransporte a celda · sw intercambia posición · h cura · sh armadura · bp +poder · bpa +PA · bpm +PM · br +resistencia · inv invisible
   LÍNEA DE VISIÓN: todos los hechizos con objetivo la necesitan (la tapan los obstáculos altos del mapa, NO los personajes). Sin ella: teletransportes e invocaciones (nlos:true en addSpell).
   Números = PA × coeficiente (ver fx). Los 4 primeros de cada clase están desde el nivel 1; el resto se desbloquea al subir de nivel (SLV). */
const SLV=[1,1,1,1,3,6,9,12,16,20,25,30,36,42,50,58,66,76,88,100,115,130];
const SELFT=['h','sh','bp','bpa','bpm','br','inv'],IE={t:'🪨',f:'🔥',a:'💧',v:'🌪️',n:'🪨'},EL={t:'tierra',f:'fuego',a:'agua',v:'aire',n:'tierra'};
const TI={h:'💚',sh:'🛡️',bp:'✨',bpa:'⚡',bpm:'👟',br:'🔰',inv:'👻',tp:'🌀',sw:'🔁',dot:'☠️',su:'🐾',big:'💥',pm:'🐌',pa:'⏳',pu:'💨',pl:'🧲',rr:'🔻',ls:'🩸'};
function fx(t,el,pa){const A=k=>Math.round(pa*3.3*k),C=k=>Math.round(pa*4.5*k),d=(k,o)=>D(el,A(k),C(k),o);
 return({d:[[d(1)],{}],pm:[[d(.7),B('pm',-2,1,'t')],{cd:2}],pa:[[d(.7),B('pa',-2,1,'t')],{cd:2,lim:1}],pu:[[d(.8),PU(2)],{cd:1}],pl:[[d(.8),PU(-2)],{cd:1}],ls:[[d(1,{ls:.5})],{}],rr:[[d(.7),B('res',-15,2,'t')],{cd:2}],
  dot:[[VE(el,A(.6),C(.6),3)],{lim:1}],su:[[VE(el,A(.7),C(.7),4),d(.4)],{lim:1,cd:2}],big:[[d(1.5)],{lim:1,cd:2}],
  h:[[H(Math.round(pa*7),Math.round(pa*9.3),'agua')],{cd:2}],sh:[[AR(Math.round(pa*8),Math.round(pa*10.5),el,2)],{cd:3}],bp:[[B('pow',35,3)],{cd:4,lim:1}],bpa:[[B('pa',2,2)],{cd:5,lim:1}],
  bpm:[[B('pm',1,2)],{cd:4,lim:1}],br:[[B('res',15,2)],{cd:4,lim:1}],inv:[[B('inv',1,2)],{cd:4,lim:1}],tp:[[TP],{tg:'c',cd:2,lim:1,nlos:true}],sw:[[SW],{cd:2,lim:1}]})[t]}
function cls(id,n,ico,el,role,txt){const L=txt.trim().split('\n').map(l=>l.trim().split('|'));
 Registry.add('classes',id,{n,ico,el,role,spells:L.map((_,i)=>id+'_'+i)});
 L.forEach(([sn,pa,r,e,t,lv0],i)=>{pa=+pa;const LV=lv0?+lv0:SLV[i];const[a,b]=r.split('-').map(Number),ob=OBM[id+'.'+sn];
  if(ob){const sf=ob.k==='det'||ob.k==='evo',Q=ob.o&&Registry.objs[ob.o];      // invocación / trampa / glifo / bomba REAL (js/data/objects.js)
   addSpell(id+'_'+i,sn,Q?Q.ico:'💥',pa,sf?[0,0]:ob.r||[a,b],[sf?{k:ob.k}:{k:ob.k,o:ob.o}],{lvl:LV,cls:id,lim:ob.k==='sm'?1:2,tg:sf?'s':'c',...(ob.k==='sm'?{nlos:true}:{})});return}
  const[ef,o]=fx(t,EL[e],pa),me=SELFT.includes(t);
  addSpell(id+'_'+i,sn,TI[t]||IE[e],pa,me?[0,0]:[a,b],ef,{lvl:LV,cls:id,lim:pa<=2?3:2,...(me?{tg:'s'}:{}),...o})})}
cls('feca','Feca','🛡️','tierra','Protección · glifos y armaduras',`
Ataque Natural|3|1-8|f|d
Puntal|3|1-4|t|d
Ceguera|3|1-7|t|pa
Armadura Terrestre|2|0-3|t|sh
Pompa|3|1-6|a|d
Ataque Nuboso|4|1-5|a|d
Letargo|3|1-5|f|pm
Glifo Flamígero|4|1-5|f|dot
Glifo Agresivo|3|1-6|v|dot
Glifo Óptico|3|1-6|f|rr
Glifo de Repulsión|2|1-4|t|pu
Glifo Gravitacional|3|1-4|t|pl
Armadura Incandescente|2|0-3|f|sh
Armadura Acuática|2|0-3|a|sh
Armadura Ventosa|2|0-3|v|sh
Baluarte|2|0-4|t|br
Barricada|2|0-4|t|br
Tregua|3|0-0|t|br
Teleportación|3|1-6|t|tp
Misericordia|2|0-0|t|h`);
cls('osamodas','Osamodas','🐾','agua','Invocador · criaturas y apoyo',`
Invocación de Tofu|3|1-6|v|su
Látigo|2|1-8|n|d
Cuervo|3|1-8|f|d
Chute Motivador|2|1-6|a|bpa
Invocación de Jalató|4|1-4|t|su
Invocación de Prespic|3|1-5|a|pa
Dragonito Rojo|4|1-6|f|su
Invocación de Brizlón|4|1-4|t|pu
Cuerno de Jalató|3|1-6|t|d
Garra Azotadora|3|1-7|a|pu
Movimiento Felino|2|1-6|a|bpm
Sapo|2|1-6|a|br
Curación Animal|3|1-7|f|h
Resistencia Natural|2|1-6|a|sh
Bendición Animal|2|0-0|a|bp
Simbiosis|2|1-4|a|ls
Lazo Espiritual|3|1-4|a|h`);
cls('anutrof','Anutrof','💰','agua','Traba · larga distancia · dropeo',`
Lanzamiento de Monedas|3|2-7|a|d
Lanzamiento de Pala|3|1-5|t|pu
Suerte|2|0-0|a|bp
Torpeza|1|1-8|a|pm
Jarabe de Pala|3|1-5|a|pm
Terraplenado|3|1-6|t|d
Pala Debilitadora|3|1-5|f|rr
Pala del Juicio|3|1-6|a|pm
Pala Fantasmal|3|1-6|f|d
Pala Cegadora|3|1-6|v|rr
Llave del Tesoro|2|0-0|a|bp
Aceleración|2|0-0|a|bpm
Mochila Animada|3|1-4|a|sh
Cofre Animado|4|1-4|a|su
Pala Animada|4|1-4|t|su
Madurez|2|0-0|a|h
Pala Masacrante|5|1-6|a|big
Desinvocación|3|1-6|f|d
Codicia|2|0-0|a|bp
Corrupción|4|1-6|a|pa`);
cls('sram','Sram','🗡️','aire','Trampas · invisibilidad · venenos',`
Engaño|3|1-7|t|d|1
Golpe Solapado|3|1-3|f|pu|1
Miedo|2|2-5|t|pu|1
Veneno Insidioso|3|1-5|v|dot|7
Trampa Solapada|3|1-6|f|pl|13
Trampa Mortal|3|1-7|t|big|69
Invisibilidad|2|0-0|v|inv|25
Doble|3|1-2|v|su|31
Pillaje|4|1-5|v|ls|37
Hurto|4|3-6|f|pl|43
Perfidia|4|1-3|t|pl|49
Contrato|2|1-4|t|rr|55
Trampa Envenenada|3|1-6|f|dot|61
Trampa Repulsiva|3|1-5|n|pu|67
Ataque Mortal|4|1-2|t|big|73
Karadura|4|1-1|f|d|79
Toxinas|4|1-5|v|dot|85
Maquinación|2|1-5|f|ls|90
Zalagarda|4|1-4|t|pl|95
Trampa de Inmovilización|4|1-5|t|pm|100
Exaltación Sram|3|0-0|v|bp|200`);
cls('xelor','Xelor','⏳','fuego','Control de PA · teletransporte',`
Agujas|3|1-6|f|d
Golpe del Xelor|3|1-4|t|d
Ralentización|1|1-8|a|pa
Devoción|2|0-0|f|bpa
Marchitamiento|3|1-7|v|d
Reloj de Arena|2|1-6|f|pm
Roba Tiempos|3|1-6|a|pa
Polvo Temporal|4|1-7|f|big
Teleportación|3|1-7|f|tp
Huida|2|1-4|f|sw
Rebobinado|2|1-6|f|pl
Paradoxa|3|1-5|f|pu
Haz Temporal|4|1-6|t|big
Momificación|2|0-0|f|sh
Esfera de Xelor|3|1-5|f|su
Desincronización|3|1-5|v|rr
Contra|2|0-0|f|br`);
cls('zurkarak','Zurcarák','🎲','fuego','Azar · golpes extremos',`
Cara o Cruz|3|1-6|t|d
Farol|3|1-4|a|d
Reflejos|3|1-3|v|d
Trébol|2|0-0|f|bp
Garra Cegadora|3|1-5|f|pa
Garra Juguetona|4|1-4|t|d
Garra Invocadora|4|1-4|f|su
Percepción|2|0-0|f|bp
Odio|4|1-4|f|d
Destino de Zurcarák|4|1-1|v|pu
Todo o Nada|2|1-4|a|big
Feliación|4|1-6|a|ls
Espíritu Felino|3|1-1|t|big
Rueda de la Fortuna|3|0-0|f|bp
Suerte de Zurcarák|2|0-0|f|h
Olor a Caña|2|0-0|f|sh
Frotamiento|3|0-0|f|h
Repertorio Felino|2|0-0|f|bpm`);
cls('aniripsa','Aniripsa','📖','agua','Curas · apoyo',`
Palabra Hiriente|3|1-8|v|d
Palabra Curativa|2|0-0|f|h
Palabra de Drenaje|3|1-6|v|ls
Palabra de Prevención|2|0-0|a|sh
Palabra Estimulante|3|0-0|a|bpa
Palabra Sanadora|3|0-0|f|h
Palabra de Inmovilización|2|1-7|a|pm
Palabra de Pavor|2|1-1|n|pu
Palabra Vampírica|4|1-6|a|ls
Palabra de Vuelo|2|0-0|a|bpm
Palabra Amistosa|3|1-4|a|su
Palabra Altruista|4|0-0|a|h
Palabra de Reconstitución|5|0-0|a|h
Palabra de Regeneración|2|0-0|a|h
Palabra de Silencio|4|1-6|a|pa
Palabra Paralizante|3|1-7|f|dot
Marca de Regeneración|3|1-6|f|d`);
cls('yopuka','Yopuka','🔥','fuego','Cuerpo a cuerpo · daño bruto',`
Presión|2|1-1|t|d
Espada Divina|3|1-4|v|d
Concentración|2|1-1|t|d
Potencia|3|0-0|f|bp
Corte|3|1-4|f|pm
Destructora|4|1-1|t|d
Espada del Juicio|4|1-4|a|ls
Intimidación|2|1-1|n|pu
Tempestad de Potencia|3|1-4|f|d
Caza|3|1-4|v|pu
Espada de Yopuka|4|1-4|t|d
Espada Celeste|4|1-1|v|d
Espada del Destino|4|1-3|f|big
Salto|4|1-4|f|tp
Vitalidad|3|0-0|f|h
Precipitación|0|0-0|f|bpa
Fricción|2|1-6|f|pl
Duel|3|1-1|f|pm
Postura Defensiva|2|0-0|t|sh
Exaltación|1|0-0|f|bp
Ira de Yopuka|6|1-1|t|big`);
cls('ocra','Ocra','🏹','aire','Arquero · largo alcance',`
Flecha Mágica|3|1-8|f|d
Flecha Helada|2|1-6|f|pa
Flecha Acosadora|2|1-8|v|d
Disparo Potente|3|0-0|v|bp
Flecha Retroceso|3|1-4|v|pu
Flecha Envenenada|3|1-7|t|dot
Flecha Flamígera|3|1-6|f|pu
Flecha Azotadora|3|1-8|t|pm
Flecha Absorbente|4|1-7|v|ls
Flecha Expiación|4|1-8|a|big
Flecha Castigadora|4|1-6|t|big
Flecha Explosiva|4|1-8|f|big
Flecha Ralentizadora|4|1-8|a|pa
Flecha de Inmovilización|2|1-7|a|pm
Disparo Lejano|2|0-0|v|bpm
Disparo Crítico|2|0-0|v|bp
Dominio del Arco|2|0-0|v|bp
Ojo de Topo|3|1-8|a|rr
Flecha Dispersiva|2|1-6|v|pu
Baliza Táctica|2|1-4|v|su
Dominación Ocra|2|0-0|v|br`);
cls('sadida','Sadida','🌿','tierra','Invocaciones (muñecas) · venenos',`
Zarza|3|1-8|t|d
Veneno Infeccioso|2|1-7|v|dot
Fuego Montaraz|3|1-7|f|d
La Bloqueadora|3|1-4|t|su
Zarza Venenosa|3|1-7|t|dot
La Loca|3|1-5|a|pa
La Sacrificada|3|1-4|t|su
Temblores|3|1-4|f|pl
Zarza Inmovilizadora|2|1-8|t|pm
La Hinchada|3|0-0|a|h
Hierba Loca|4|1-7|f|pm
Zarza Agresiva|4|1-6|t|big
Lágrima|3|1-7|a|d
Venenos Múltiples|3|1-8|a|dot
Árbol|2|0-0|t|sh
Altruismo Vegetal|2|0-0|a|h
Desembrujo|3|1-6|a|rr
La Superpoderosa|4|1-6|t|su
Bosque Encantado|2|0-0|t|bp`);
cls('sacrogrito','Sacrógrito','🩸','tierra','Tanque · robo de vida · posición',`
Pie del Sacrógrito|3|1-1|t|ls
Absorción|3|1-3|f|ls
Castigo Forzado|2|0-0|t|bp
Transposición|2|1-8|t|sw
Asalto|3|1-4|v|d
Disolución|4|1-1|a|ls
Furor|3|1-3|f|d
Proyección|3|1-5|a|tp
Sacrificio|2|0-0|t|br
Cooperación|2|1-8|t|sw
Atracción|2|1-8|t|pl
Castigo|4|1-1|n|big
Castigo Osado|2|0-0|v|bp
Castigo Espiritual|2|0-0|f|bp
Castigo Agitador|2|0-0|a|bp
Castigo Vitalesco|2|0-0|t|h
Espada Voladora|3|1-4|t|su
Locura Sanguinaria|1|0-0|t|h
Dolor Compartido|2|0-0|t|br`);
cls('pandawa','Pandawa','🍺','fuego','Posicionamiento · traba',`
Soplado|3|1-4|f|d
Resaca|3|1-3|t|d
Ventolera|3|1-6|v|pu
Trago|2|0-0|f|br
Leche de Bambú|2|0-0|a|h
Karcham|2|1-1|t|sw
Chamrak|2|1-6|t|pu
Ola Acorazada|4|1-4|a|d
Pandatak|4|1-6|t|d
Frasco de Pandora|2|1-6|a|d
Aguardiente|3|1-4|f|ls
Vulnerabilidad|2|1-6|t|rr
Deshonra|3|1-3|f|rr
Vasija|3|1-5|a|su
Pandaishido|2|0-0|f|bpm
Enlace Espiritual|2|1-4|a|sw`);
cls('tymador','Tymador','🧨','fuego','Bombas · combos',`
Rematador|3|1-6|f|d
Arcabuz|3|1-5|v|rr
Bomba Incandescente|3|1-6|f|dot
Patada|2|1-1|t|pu
Bomba Explosiva|3|1-6|v|d
Bomba Hídrica|3|1-6|a|pa
Pólvora|1|0-0|f|bp
Detonador|1|1-8|f|d
Imantación|2|1-6|f|pl
Ruse|2|0-0|f|sh
Tymadura|3|1-6|a|pm
Pistola|4|1-4|f|big
Pólvora Negra|2|0-0|f|bp
Kabu|2|0-0|f|br
Tymobot|3|1-4|f|su
Estrategia|2|1-5|f|sw`);
cls('zobal','Zobal','🎭','aire','Máscaras · escudos',`
Martelo|3|1-1|t|ls
Picado|3|1-6|v|d
Retención|3|1-4|a|pm
Máscara Saikopat|1|0-0|v|bp
Furia|4|1-3|t|d
Aporte|3|1-4|v|tp
Cabriola|4|1-1|v|d
Boliche|3|1-4|a|pu
Comedia|4|1-5|f|pl
Desbandada|1|1-1|n|tp
Máscara Zobal|1|0-0|v|br
Máscara Escurridiza|1|0-0|v|bpm
Tortuga|2|0-0|v|sh
Plastrón|3|0-0|v|sh
Refracción|2|0-0|v|sh
Trance|1|0-0|v|sh
Mueca|2|1-4|v|su`);
cls('steamer','Steamer','🚂','agua','Torretas · versatilidad',`
Anclaje|3|1-6|t|d
Vapor|3|1-4|f|d
Harponera|2|1-4|a|su
Guardiana|2|0-0|a|h
Marejada|3|1-4|a|pu
Tridente|3|1-6|t|pu
Torpedeo|3|1-4|v|pu
Espuma|4|1-5|v|rr
Abordaje|4|1-4|f|big
Táctica|2|1-4|a|su
Evolución|2|0-0|a|bp
Socorrismo|2|0-0|a|h
Telescopio|2|0-0|a|bpm
Acorazado|2|0-0|a|sh
Cinética|2|1-5|a|tp`);
