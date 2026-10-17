/* ============================================================
   OFICIOS Y RECETAS · AQUÍ se añaden oficios y recetas nuevas.
   JOB(id, nombre, icono, [tipos de objeto que fabrica], descripción)
   RECIPE(objeto, oficio, nivel_de_oficio, [[recurso,cantidad],…], kamas?)   → kamas por defecto = 10 % del precio base
   Los SETS se fabrican con los recursos de SU zona (los que sueltan los monstruos de esa zona, ver monstruos.js):
   SETCRAFT(set, nivel_de_oficio, [recursos de la zona], multiplicador de cantidades) genera las 7-8 recetas del set con un patrón por tipo de pieza.
   ============================================================ */
JOB('sastre','Sastre','🧵',['sombrero','capa'],'Sombreros y capas');
JOB('zapatero','Zapatero','👞',['botas','cinturon'],'Botas y cinturones');
JOB('joyero','Joyero','💎',['anillo','amuleto'],'Anillos y amuletos');
JOB('forjador','Forjador','⚒️',['arma','escudo'],'Armas y escudos');
JOB('alquimista','Alquimista','⚗️',['consumible'],'Pociones y comida para el combate');
const KIND_JOB={};for(const j of Object.values(Registry.jobs))j.kinds.forEach(k=>KIND_JOB[k]=j.id);
/* patrón por tipo de pieza: [índice del recurso en la lista de la zona, cantidad base] (el índice da la vuelta si la zona tiene menos recursos) */
const PATRON={sombrero:[[0,4],[2,2]],capa:[[0,5],[1,3]],amuleto:[[1,4],[2,3],[3,1]],anillo:[[1,3],[3,3]],cinturon:[[0,4],[1,3]],botas:[[0,4],[2,3]],arma:[[1,5],[2,3],[4,2]],escudo:[[0,6],[1,4]]};
function SETCRAFT(set,need,res,mul){for(const it of Items.setParts(set)){const m={};for(const[i,n]of PATRON[it.kind]||[]){const id=res[i%res.length];m[id]=(m[id]||0)+Math.max(1,Math.round(n*mul))}
 RECIPE(it.id,KIND_JOB[it.kind],need,Object.entries(m))}}
SETCRAFT('raiz',1,['cuero_rustico','colmillo','pluma_negra','baba_viscosa','savia'],1);
SETCRAFT('brasa',12,['cuero_curtido','aguijon_ardiente','carbon','ala_magma'],1.5);
SETCRAFT('abismo',30,['cuero_escamoso','perla_abisal','tentaculo'],2);
SETCRAFT('titan',60,['cuero_titan','fragmento_roca','escama_dragon'],3);
/* equipo común (las piezas que también se venden en la tienda: así hay con qué subir el oficio al principio) */
RECIPE('anillo_aprendiz','joyero',1,[['baba_viscosa',3],['pluma_negra',2]]);
RECIPE('amuleto_bronce','joyero',1,[['colmillo',3],['baba_viscosa',2]]);
RECIPE('botas_viejas','zapatero',1,[['cuero_rustico',3]]);
RECIPE('escudo_madera','forjador',3,[['savia',3],['cuero_rustico',2]]);
RECIPE('escudo_hierro','forjador',20,[['carbon',4],['cuero_curtido',3]]);
RECIPE('anillo_poder','joyero',24,[['aguijon_ardiente',3],['ala_magma',2]]);
RECIPE('cinto_gladiador','zapatero',40,[['cuero_escamoso',5],['perla_abisal',2]]);
/* consumibles (Alquimista) */
RECIPE('pocion_vida_menor','alquimista',1,[['baba_viscosa',2],['savia',1]]);
RECIPE('pan_guerrero','alquimista',3,[['savia',2],['colmillo',1]]);
RECIPE('pocion_celeridad','alquimista',8,[['pluma_negra',3],['aguijon_ardiente',1]]);
RECIPE('elixir_piedra','alquimista',14,[['carbon',2],['cuero_curtido',1]]);
RECIPE('pocion_vida','alquimista',18,[['aguijon_ardiente',2],['ala_magma',2]]);
RECIPE('pocion_gran_vida','alquimista',45,[['perla_abisal',2],['tentaculo',2],['cuero_escamoso',1]]);
