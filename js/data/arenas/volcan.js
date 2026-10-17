/* Volcán · 12×12 celdas (110 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('volcan',{n:'Volcán',art:{src:'assets/arenas/volcan.jpg'},bg:['#5a1a0a', '#0d0302'],fx:'ember',wx:[['none', 1]],mobs:3,
 theme:{t:['#5d4c49', '#503f3c'], ln:'rgba(255,170,90,.32)', sd:['#33251f', '#251a16'], lip:null, pit:['#0f0606', '#3e1f14'], liq:['#ff6a1a', '#ffc24a'], rock:['#4a3836', '#32231f', '#211613'], wood:['#7a4a2a', '#5a3420', '#3e2415'], leaf:['#6a4a2a', '#4a3320'], trunk:'#3a2418', stone:['#6a5a56', '#473a37', '#32282a'], glow:true},
 map:[
  '·..........·',
  '....~.......',
  '....~~......',
  '...#.~...#..',
  '1....~~#..#2',
  '11~~..oo~..2',
  '1..~oo..~~22',
  '1#..#~~....2',
  '..#...~.#...',
  '......~~....',
  '.......~....',
  '·..........·'
 ]});
