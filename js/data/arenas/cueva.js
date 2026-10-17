/* Cueva Cristalina · 11×11 celdas (64 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('cueva',{n:'Cueva Cristalina',art:{src:'assets/arenas/volcan.jpg'},bg:['#1a2030', '#05070c'],fx:'mote',wx:[['none', 1]],mobs:3,
 theme:{t:['#4c5360', '#424955'], ln:'rgba(160,200,255,.22)', sd:['#262a33', '#1b1e25'], lip:null, pit:['#07080c', '#2b303b'], liq:['#2b79b3', '#6ec3ee'], rock:['#5a6070', '#3c4150', '#292d39'], wood:['#6a4a30', '#4e3622', '#382718'], leaf:['#3e6a4a', '#2c4e38'], trunk:'#3a2a1c', stone:['#6a7080', '#474c5a', '#323643'], glow:true},
 map:[
  '···········',
  '·.........·',
  '·....f....·',
  '·1.#..co..·',
  '·1...~~..2·',
  '·1#.~~~.#2·',
  '·1..~~...2·',
  '·..oc..#.2·',
  '·....f....·',
  '·.........·',
  '···········'
 ]});
