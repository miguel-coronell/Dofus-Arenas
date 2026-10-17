/* ============================================================
   CATÁLOGO DE OBJETOS · AQUÍ se añaden objetos y sets nuevos (una línea cada uno). Nada más: el mercadillo y el inventario los muestran solos.
   Para otra zona/mazmorra crea OTRO archivo en js/data/items/ (copia este) y añade su <script> en index.html tras base.js.
   KIND(id, singular, plural, icono, huecos)         → categoría + hueco de equipo (huecos: 2 = dos anillos)
   ISET(id, nombre, {2:{bono},4:{bono},7:{bono}}, color) → bono por nº de piezas del set equipadas (cuenta el escalón más alto)
   IT(id, nombre, icono, tipo, nivel, precio, {stats}, {set:'idset', d:'texto', nosale:true})
      · las piezas con set:'…' se FABRICAN en los OFICIOS (js/data/crafts.js: receta = recursos + kamas). No se venden en la tienda; se pueden poner a la venta en tu puesto del mercado
      · el precio es el precio BASE: el mercado lo sube y baja según oferta, demanda y noticias (js/game/economy.js)
      · tipo 'recurso' = material apilable (stats {}): lo sueltan los monstruos y se gasta fabricando. El nivel indica su «tier»; los retos regalan los de tu nivel
      · tipo 'consumible' = apilable y USABLE en combate (pestaña Objetos): use:{pa:coste, fx:[{k:'hp',p:.25} | {k:'b',s:'pow',v:15,tn:3} | {k:'ar',a,b,el,tn}]}
      stats: vit fuerza(tierra) inteligencia(fuego) suerte(agua) agilidad(aire) pow(poder a todo) res(%) pa pm   ·  nosale:true = no se vende en el mercadillo (solo botín de monstruos/mazmorra)
   Botín: en monstruos.js  drops:[['id_objeto',0.2]]  (20 %) y  kamas:[min,max]
   ============================================================ */
KIND('sombrero','Sombrero','Sombreros','🎩');KIND('capa','Capa','Capas','🧣');KIND('amuleto','Amuleto','Amuletos','📿');KIND('anillo','Anillo','Anillos','💍',2);
KIND('cinturon','Cinturón','Cinturones','🎗️');KIND('botas','Botas','Botas','👢');KIND('arma','Arma','Armas','⚔️');KIND('escudo','Escudo','Escudos','🛡️');
KIND('recurso','Recurso','Recursos','🟫',0);   // 0 huecos: no se equipan, se apilan (cueros, colmillos…) · se compran, se venden y los sueltan monstruos y retos
KIND('consumible','Consumible','Consumibles','🧪',0);   // 0 huecos: se apilan y se usan en combate (pociones, pan…)

/* ---- piezas sueltas ---- */
IT('anillo_aprendiz','Anillo del Aprendiz','💍','anillo',1,100,{vit:10});
IT('amuleto_bronce','Amuleto de Bronce','📿','amuleto',1,120,{vit:15,res:1});
IT('botas_viejas','Botas Viejas','👢','botas',1,80,{vit:8});
IT('escudo_madera','Escudo de Madera','🛡️','escudo',8,260,{vit:20,res:2});
IT('escudo_hierro','Escudo de Hierro','🛡️','escudo',30,1400,{vit:60,res:4});
IT('anillo_poder','Anillo de Poder','💍','anillo',40,2500,{pow:8,vit:30});
IT('cinto_gladiador','Cinturón del Gladiador','🎗️','cinturon',60,6000,{vit:80,tierra:40,fuego:40});

/* ---- Set Raíz (nivel 5) ---- */
ISET('raiz','Set Raíz',{2:{vit:20},4:{vit:40,tierra:15},7:{vit:80,tierra:30,res:3}},'#7fae4a');
IT('raiz_sombrero','Sombrero Raíz','🎩','sombrero',5,220,{vit:15,tierra:8},{set:'raiz'});
IT('raiz_capa','Capa Raíz','🧣','capa',5,220,{vit:12,tierra:10},{set:'raiz'});
IT('raiz_amuleto','Amuleto Raíz','📿','amuleto',5,260,{vit:14,tierra:12},{set:'raiz'});
IT('raiz_anillo','Anillo Raíz','💍','anillo',5,180,{vit:10,tierra:8},{set:'raiz'});
IT('raiz_cinto','Cinturón Raíz','🎗️','cinturon',5,240,{vit:16,tierra:9},{set:'raiz'});
IT('raiz_botas','Botas Raíz','👢','botas',5,240,{vit:14,tierra:9},{set:'raiz'});
IT('raiz_arma','Garrote Raíz','🏏','arma',5,400,{tierra:20},{set:'raiz'});
/* ---- Set Brasa (nivel 20) ---- */
ISET('brasa','Set Brasa',{2:{vit:50},4:{vit:90,fuego:40},7:{vit:160,fuego:80,pm:1}},'#e0703a');
IT('brasa_sombrero','Sombrero Brasa','🎩','sombrero',20,1300,{vit:35,fuego:25},{set:'brasa'});
IT('brasa_capa','Capa Brasa','🧣','capa',20,1300,{vit:30,fuego:28},{set:'brasa'});
IT('brasa_amuleto','Amuleto Brasa','📿','amuleto',20,1600,{vit:38,fuego:30},{set:'brasa'});
IT('brasa_anillo','Anillo Brasa','💍','anillo',20,1100,{vit:28,fuego:22},{set:'brasa'});
IT('brasa_cinto','Cinturón Brasa','🎗️','cinturon',20,1400,{vit:40,fuego:26},{set:'brasa'});
IT('brasa_botas','Botas Brasa','👢','botas',20,1400,{vit:36,fuego:26},{set:'brasa'});
IT('brasa_arma','Vara Brasa','🪄','arma',20,2400,{fuego:55,vit:20},{set:'brasa'});
/* ---- Set Abismo (nivel 50) ---- */
ISET('abismo','Set Abismo',{2:{vit:120},4:{vit:200,agua:80},7:{vit:350,agua:150,res:6,pa:1}},'#3a86d0');
IT('abismo_sombrero','Sombrero Abismo','🎩','sombrero',50,5200,{vit:80,agua:55},{set:'abismo'});
IT('abismo_capa','Capa Abismo','🧣','capa',50,5200,{vit:70,agua:60,res:2},{set:'abismo'});
IT('abismo_amuleto','Amuleto Abismo','📿','amuleto',50,6200,{vit:85,agua:65},{set:'abismo'});
IT('abismo_anillo','Anillo Abismo','💍','anillo',50,4600,{vit:60,agua:48},{set:'abismo'});
IT('abismo_cinto','Cinturón Abismo','🎗️','cinturon',50,5600,{vit:90,agua:55},{set:'abismo'});
IT('abismo_botas','Botas Abismo','👢','botas',50,5600,{vit:80,agua:55},{set:'abismo'});
IT('abismo_arma','Tridente Abismo','🔱','arma',50,9500,{agua:120,vit:40},{set:'abismo'});
/* ---- Set Titán (nivel 100) ---- */
ISET('titan','Set Titán',{2:{vit:250},4:{vit:450,pow:15},7:{vit:800,pow:35,res:10,pa:1,pm:1}},'#d6b34a');
IT('titan_sombrero','Yelmo Titán','🎩','sombrero',100,22000,{vit:160,pow:8,res:2},{set:'titan'});
IT('titan_capa','Capa Titán','🧣','capa',100,22000,{vit:150,pow:9,res:2},{set:'titan'});
IT('titan_amuleto','Amuleto Titán','📿','amuleto',100,26000,{vit:170,pow:10,pa:1},{set:'titan'});
IT('titan_anillo','Anillo Titán','💍','anillo',100,19000,{vit:120,pow:7},{set:'titan'});
IT('titan_cinto','Cinturón Titán','🎗️','cinturon',100,24000,{vit:180,pow:8,res:2},{set:'titan'});
IT('titan_botas','Botas Titán','👢','botas',100,24000,{vit:160,pow:8,pm:1},{set:'titan'});
IT('titan_arma','Mandoble Titán','🗡️','arma',100,45000,{pow:25,tierra:150,vit:100},{set:'titan'});
IT('titan_escudo','Escudo Titán','🛡️','escudo',100,30000,{vit:220,res:6,pow:6},{set:'titan'});

/* ---- RECURSOS (se apilan; se compran y se venden en el mercadillo; los sueltan monstruos y retos) ---- */
const REC=(id,n,ico,lvl,price,d)=>IT(id,n,ico,'recurso',lvl,price,{},{d});
REC('cuero_rustico','Cuero Rústico','🟫',1,25,'Piel áspera de las bestias del prado.');REC('colmillo','Colmillo de Jabalí','🦷',1,30,'Afilado y resistente.');
REC('pluma_negra','Pluma Negra','🪶',1,22,'Ligera como el humo.');REC('baba_viscosa','Baba Viscosa','🟢',1,15,'Pegajosa. Muy pegajosa.');REC('savia','Savia Resinosa','🍯',5,40,'Fluye de los árboles vivos.');
REC('cuero_curtido','Cuero Curtido','🟤',15,110,'Cuero tratado al calor de la brasa.');REC('aguijon_ardiente','Aguijón Ardiente','🔸',15,130,'Todavía quema al tacto.');
REC('carbon','Carbón Ardiente','⚫',20,90,'Arde días sin apagarse.');REC('ala_magma','Ala de Magma','🦇',20,160,'Membrana que resiste el fuego.');
REC('cuero_escamoso','Cuero Escamoso','🐟',40,320,'Cuero de las profundidades, brillante y flexible.');REC('perla_abisal','Perla Abisal','🦪',40,520,'Nacarada y fría.');REC('tentaculo','Tentáculo Gelatinoso','🦑',40,380,'Se mueve incluso ahora.');
REC('cuero_titan','Cuero de Titán','🧥',90,1200,'El cuero más grueso que existe.');REC('fragmento_roca','Fragmento de Titán','🪨',90,950,'Roca viva con latido propio.');REC('escama_dragon','Escama de Dragón','🐲',110,2400,'Valiosísima.');

/* ---- CONSUMIBLES (se usan en combate desde la pestaña «Objetos» de la barra inferior: cuestan PA, máx. 2 por turno, llevas hasta 5 de cada uno) ---- */
const CON=(id,n,ico,lvl,price,use,d)=>IT(id,n,ico,'consumible',lvl,price,{},{d,use});
CON('pocion_vida_menor','Poción de Vida Menor','🧪',1,35,{pa:2,fx:[{k:'hp',p:.25}]},'Un trago rápido que cierra las heridas.');
CON('pan_guerrero','Pan del Guerrero','🍞',5,45,{pa:2,fx:[{k:'b',s:'pow',v:15,tn:3}]},'Recién horneado: te da fuerza para 3 turnos.');
CON('pocion_celeridad','Poción de Celeridad','👟',10,80,{pa:1,fx:[{k:'b',s:'pm',v:2,tn:1}]},'Tus piernas no se cansan este turno.');
CON('elixir_piedra','Elixir de Piedra','🗿',20,140,{pa:2,fx:[{k:'ar',a:45,b:65,el:'tierra',tn:2}]},'Tu piel se vuelve roca durante 2 turnos.');
CON('pocion_vida','Poción de Vida','🍷',25,160,{pa:2,fx:[{k:'hp',p:.4}]},'Cura casi la mitad de tu vida.');
CON('pocion_gran_vida','Gran Poción de Vida','⚗️',70,600,{pa:3,fx:[{k:'hp',p:.6}]},'La preferida de los veteranos del coliseo.');
