/* ============================================================
   CATÁLOGO EXTRA · resistencias por elemento, piezas nuevas y sets nuevos (se carga DESPUÉS de base.js; no hace falta tocar base.js)
   Estadísticas nuevas:  rtierra · rfuego · ragua · raire  = % de resistencia a ESE elemento (negativo = debilidad; tope ±50 contando todo)
   Ayudantes:
     PATCH(idObjeto, {stats})        → suma estadísticas a un objeto que ya existe (ej. PATCH('raiz_capa',{rtierra:3}))
     SBONUS(idSet, nºPiezas, {bono}) → suma bono a un escalón del set (si el escalón no existe, lo crea). Los escalones se ACUMULAN (el de 4 piezas se suma al de 2): escribe en cada uno el TOTAL que quieres en ese escalón; el motor lo convierte en incrementos (Items.normSets)
     IT(...) / ISET(...)             → igual que en base.js
   ============================================================ */
const PATCH=(id,st)=>{const it=Registry.items[id];if(!it)return;for(const k in st)it.st[k]=(it.st[k]||0)+st[k]};
const SBONUS=(id,n,b)=>{const S=Registry.isets[id];if(!S)return;const o=S.b[n]=S.b[n]||{};for(const k in b)o[k]=(o[k]||0)+b[k]};

/* ---- 1) resistencias en los sets que ya existían ---- */
PATCH('raiz_sombrero',{rtierra:3});PATCH('raiz_capa',{rtierra:3,raire:2});PATCH('raiz_amuleto',{rtierra:4});PATCH('raiz_botas',{raire:3});
SBONUS('raiz',4,{rtierra:5});SBONUS('raiz',7,{rtierra:5,raire:3});
PATCH('brasa_sombrero',{rfuego:4});PATCH('brasa_capa',{rfuego:4});PATCH('brasa_amuleto',{rfuego:5,rtierra:2});PATCH('brasa_cinto',{rfuego:4});PATCH('brasa_botas',{raire:3});
SBONUS('brasa',4,{rfuego:6});SBONUS('brasa',7,{rfuego:6,rtierra:4});
PATCH('abismo_sombrero',{ragua:6});PATCH('abismo_capa',{ragua:6,rfuego:3});PATCH('abismo_amuleto',{ragua:7});PATCH('abismo_cinto',{ragua:5});PATCH('abismo_botas',{ragua:4,raire:3});
SBONUS('abismo',4,{ragua:8});SBONUS('abismo',7,{ragua:8,rfuego:6});
PATCH('titan_sombrero',{rtierra:5,rfuego:5});PATCH('titan_capa',{ragua:5,raire:5});PATCH('titan_amuleto',{rtierra:6,rfuego:6,ragua:6,raire:6});PATCH('titan_cinto',{rtierra:6,rfuego:4});
PATCH('titan_botas',{raire:6,ragua:4});PATCH('titan_escudo',{rtierra:7,rfuego:7,ragua:7,raire:7});
SBONUS('titan',4,{rtierra:6,rfuego:6});SBONUS('titan',7,{ragua:6,raire:6,rtierra:6,rfuego:6});

/* ---- 2) piezas que faltaban en los sets viejos: SEGUNDO ANILLO (hay 2 huecos de anillo) y ESCUDO → cada set llega a 9 piezas y gana un bono de «set completo» ---- */
IT('raiz_anillo2','Sortija Raíz','💍','anillo',5,180,{vit:10,tierra:8,rtierra:2},{set:'raiz'});
IT('raiz_escudo','Rodela Raíz','🛡️','escudo',5,300,{vit:18,res:1,rtierra:4},{set:'raiz'});
IT('brasa_anillo2','Sortija Brasa','💍','anillo',20,1100,{vit:28,fuego:22,rfuego:3},{set:'brasa'});
IT('brasa_escudo','Rodela Brasa','🛡️','escudo',20,1900,{vit:45,res:2,rfuego:6},{set:'brasa'});
IT('abismo_anillo2','Sortija Abismo','💍','anillo',50,4600,{vit:60,agua:48,ragua:4},{set:'abismo'});
IT('abismo_escudo','Rodela Abismo','🛡️','escudo',50,7200,{vit:100,res:3,ragua:8},{set:'abismo'});
IT('titan_anillo2','Sortija Titán','💍','anillo',100,19000,{vit:120,pow:7,rtierra:4},{set:'titan'});
/* SFULL(set,{extra}) = bono de «set completo» (9 piezas) = el escalón de 7 + extra. Escribe cada escalón como el total de ese punto (incluye al anterior): el motor calcula la diferencia */
const SFULL=(id,b)=>{const S=Registry.isets[id];if(!S)return;const o=S.b[9]={...S.b[7]};for(const k in b)o[k]=(o[k]||0)+b[k]};
SFULL('raiz',{vit:60,rtierra:4});SFULL('brasa',{vit:100,rfuego:5,rtierra:3});SFULL('abismo',{vit:200,ragua:6,rfuego:4});SFULL('titan',{vit:500,pow:20,res:4});

/* ============ 3) SETS NUEVOS (9 piezas cada uno; sus recetas están en js/data/crafts_extra.js) ============ */
/* ---- Set Brisa (nivel 30 · aire) · recursos de la Zona Brisa (monsters/zonas_extra.js) ---- */

REC('pluma_tormenta','Pluma de Tormenta','🪽',30,210,'Chisporrotea al sacudirla.');REC('nube_solida','Nube Solidificada','☁️',30,240,'Pesa menos que el aire y aguanta un golpe.');REC('cristal_rayo','Cristal de Rayo','🔷',35,420,'Un relámpago atrapado en cuarzo.');
ISET('brisa','Set Brisa',{2:{vit:60,raire:5},4:{vit:110,aire:45,raire:8},6:{vit:180,aire:80,raire:10,pm:1},9:{vit:260,aire:130,raire:12,pm:1,pa:1,res:3}},'#6fd0e0');
IT('brisa_sombrero','Capucha Brisa','🎩','sombrero',30,3000,{vit:50,aire:34,raire:5},{set:'brisa'});
IT('brisa_capa','Capa Brisa','🧣','capa',30,3000,{vit:46,aire:36,raire:6,rfuego:2},{set:'brisa'});
IT('brisa_amuleto','Amuleto Brisa','📿','amuleto',30,3600,{vit:54,aire:40,raire:6},{set:'brisa'});
IT('brisa_anillo','Anillo Brisa','💍','anillo',30,2600,{vit:38,aire:30,raire:4},{set:'brisa'});
IT('brisa_anillo2','Sortija Brisa','💍','anillo',30,2600,{vit:38,aire:30,ragua:4},{set:'brisa'});
IT('brisa_cinto','Cinturón Brisa','🎗️','cinturon',30,3200,{vit:56,aire:32,raire:5},{set:'brisa'});
IT('brisa_botas','Botas Brisa','👢','botas',30,3200,{vit:50,aire:32,raire:4,pm:1},{set:'brisa'});
IT('brisa_arma','Bastón Brisa','🪄','arma',30,5600,{aire:82,vit:28,raire:4},{set:'brisa'});
IT('brisa_escudo','Escudo Brisa','🛡️','escudo',30,4400,{vit:70,res:3,raire:8,ragua:4},{set:'brisa'});

/* ---- Set Pétreo (nivel 70 · tierra) · muy resistente, pero lento al aire (debilidad) ---- */
REC('roca_pulida','Roca Pulida','🪨',70,520,'Lisa y fría.');REC('musgo_antiguo','Musgo Antiguo','🌿',70,480,'Crece solo donde nadie camina.');REC('cuarzo_bruto','Cuarzo Bruto','💎',75,900,'Vibra con la tierra.');
ISET('petreo','Set Pétreo',{2:{vit:150,rtierra:6},4:{vit:260,tierra:90,rtierra:10},6:{vit:420,tierra:150,rtierra:14,res:4},9:{vit:640,tierra:230,rtierra:18,res:6,pm:1,raire:-10}},'#b09a78');
IT('petreo_sombrero','Yelmo Pétreo','🎩','sombrero',70,9800,{vit:120,tierra:60,rtierra:8,raire:-3},{set:'petreo'});
IT('petreo_capa','Capa Pétrea','🧣','capa',70,9800,{vit:110,tierra:62,rtierra:8,rfuego:4},{set:'petreo'});
IT('petreo_amuleto','Amuleto Pétreo','📿','amuleto',70,11800,{vit:125,tierra:70,rtierra:9},{set:'petreo'});
IT('petreo_anillo','Anillo Pétreo','💍','anillo',70,8600,{vit:90,tierra:52,rtierra:6},{set:'petreo'});
IT('petreo_anillo2','Sortija Pétrea','💍','anillo',70,8600,{vit:90,tierra:52,ragua:6},{set:'petreo'});
IT('petreo_cinto','Cinturón Pétreo','🎗️','cinturon',70,10400,{vit:135,tierra:56,rtierra:8,raire:-3},{set:'petreo'});
IT('petreo_botas','Botas Pétreas','👢','botas',70,10400,{vit:120,tierra:56,rtierra:7,pm:1,raire:-4},{set:'petreo'});
IT('petreo_arma','Maza Pétrea','🔨','arma',70,17500,{tierra:190,vit:60,pow:6},{set:'petreo'});
IT('petreo_escudo','Escudo Pétreo','🛡️','escudo',70,13500,{vit:170,res:5,rtierra:12,rfuego:6},{set:'petreo'});

/* ---- Set Celestial (nivel 150 · todos los elementos) ---- */
REC('polvo_estelar','Polvo Estelar','✨',150,2600,'Brilla aunque lo guardes a oscuras.');REC('esencia_celeste','Esencia Celeste','💠',150,3200,'Una gota de cielo líquido.');REC('pluma_serafin','Pluma de Serafín','🪶',160,4800,'Nunca se ensucia.');
ISET('celestial','Set Celestial',{2:{vit:400,pow:10},4:{vit:700,pow:25,rtierra:6,rfuego:6},6:{vit:1000,pow:45,rtierra:6,rfuego:6,ragua:8,raire:8,pm:1},9:{vit:1500,pow:80,pa:1,pm:1,res:8,rtierra:6,rfuego:6,ragua:8,raire:8}},'#ffe9a8');
IT('celestial_sombrero','Halo Celestial','🎩','sombrero',150,48000,{vit:260,pow:14,rtierra:6,rfuego:6},{set:'celestial'});
IT('celestial_capa','Manto Celestial','🧣','capa',150,48000,{vit:250,pow:15,ragua:6,raire:6},{set:'celestial'});
IT('celestial_amuleto','Amuleto Celestial','📿','amuleto',150,56000,{vit:270,pow:16,pa:1,rfuego:5},{set:'celestial'});
IT('celestial_anillo','Anillo Celestial','💍','anillo',150,42000,{vit:210,pow:12,rtierra:5,ragua:5},{set:'celestial'});
IT('celestial_anillo2','Sortija Celestial','💍','anillo',150,42000,{vit:210,pow:12,rfuego:5,raire:5},{set:'celestial'});
IT('celestial_cinto','Cinturón Celestial','🎗️','cinturon',150,50000,{vit:290,pow:13,res:3,rtierra:5},{set:'celestial'});
IT('celestial_botas','Botas Celestiales','👢','botas',150,50000,{vit:260,pow:13,pm:1,raire:7},{set:'celestial'});
IT('celestial_arma','Espada Celestial','🗡️','arma',150,90000,{pow:40,tierra:140,fuego:140,vit:160},{set:'celestial'});
IT('celestial_escudo','Escudo Celestial','🛡️','escudo',150,64000,{vit:340,res:7,pow:10,rtierra:6,rfuego:6,ragua:6,raire:6},{set:'celestial'});

/* ============ 4) EQUIPO SUELTO (se compra en el mercadillo; no es de set). Variedad: vida, PM, PA, poder y resistencias ============ */
/* anillos */
IT('anillo_vigia','Anillo del Vigía','💍','anillo',12,450,{vit:30,rtierra:3});
IT('anillo_tormenta','Anillo de la Tormenta','💍','anillo',35,2200,{vit:55,aire:20,raire:6});
IT('anillo_obsidiana','Anillo de Obsidiana','💍','anillo',60,6800,{vit:90,pow:5,rfuego:6,ragua:6});
IT('anillo_celeridad','Anillo de Celeridad','💍','anillo',80,11000,{vit:100,pm:1,res:2});
IT('anillo_eterno','Anillo Eterno','💍','anillo',140,30000,{vit:200,pow:12,pa:1,res:3});
/* capas */
IT('capa_viajero','Capa del Viajero','🧣','capa',8,350,{vit:25,raire:3});
IT('capa_cazador','Capa del Cazador','🧣','capa',30,2400,{vit:60,rtierra:5,ragua:3});
IT('capa_vacio','Capa del Vacío','🧣','capa',65,7600,{vit:110,res:4,pm:1});
IT('capa_gloria','Capa de la Gloria','🧣','capa',120,26000,{vit:190,pow:10,rtierra:5,rfuego:5,ragua:5,raire:5});
/* amuletos */
IT('amuleto_jade','Amuleto de Jade','📿','amuleto',25,1800,{vit:50,res:2,rfuego:4});
IT('amuleto_marea','Amuleto de la Marea','📿','amuleto',55,6400,{vit:100,agua:30,ragua:8});
IT('amuleto_sabio','Amuleto del Sabio','📿','amuleto',85,13000,{vit:140,pow:12,pa:1});
/* cinturones */
IT('cinto_cuero','Cinturón de Cuero','🎗️','cinturon',12,420,{vit:30,tierra:12});
IT('cinto_bruma','Cinturón de Bruma','🎗️','cinturon',45,4200,{vit:80,raire:5,rfuego:5});
IT('cinto_coloso','Cinturón del Coloso','🎗️','cinturon',110,22000,{vit:250,res:5,rtierra:8});
/* botas */
IT('botas_viento','Botas del Viento','👢','botas',30,2600,{vit:45,pm:1,raire:4});
IT('botas_eclipse','Botas del Eclipse','👢','botas',90,15000,{vit:150,pm:1,res:3});
/* sombreros */
IT('sombrero_sabio','Sombrero del Sabio','🎩','sombrero',22,1500,{vit:40,fuego:20,rfuego:3});
IT('corona_ceniza','Corona de Ceniza','🎩','sombrero',75,10500,{vit:130,pow:8,rfuego:7,ragua:4});
/* escudos */
IT('escudo_roble','Escudo de Roble','🛡️','escudo',15,900,{vit:45,res:3,rtierra:4});
IT('escudo_coral','Escudo de Coral','🛡️','escudo',55,6800,{vit:120,res:4,ragua:7});
IT('escudo_aegis','Égida Eterna','🛡️','escudo',130,36000,{vit:260,res:8,rtierra:6,rfuego:6,ragua:6,raire:6});
/* armas */
IT('espada_hierro','Espada de Hierro','🗡️','arma',12,700,{tierra:30,vit:10});
IT('baston_tormenta','Bastón de Tormenta','🪄','arma',35,3900,{aire:75,vit:25});
IT('lanza_obsidiana','Lanza de Obsidiana','🔱','arma',70,14500,{fuego:90,tierra:60,vit:40});
Items.normSets();   // convierte los escalones de todos los sets (base + extra) en incrementos acumulables
