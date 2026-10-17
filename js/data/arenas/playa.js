/* Playa · 15×12 celdas (114 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('playa',{n:'Playa',art:{src:'assets/arenas/playa.jpg'},bg:['#6fc8e0', '#c9a05a'],fx:'mote',wx:[['none', 0.5], ['wind', 0.3], ['rain', 0.2]],mobs:3,
 theme:{t:['#f4dfa8', '#e9d093'], ln:'rgba(255,255,255,.5)', sd:['#bd9d62', '#a08350'], lip:null, pit:['#3d2f1c', '#9c7e48'], liq:['#55c6e6', '#a6ecf6'], rock:['#c2bcab', '#948e7b', '#726d5d'], wood:['#c99458', '#a06f36', '#7b5128'], leaf:['#3fae52', '#2a8a3e'], trunk:'#8a5f33', stone:['#c9c8bd', '#9d9c92', '#7a7970'], palm:true},
 map:[
  '·····.....·····',
  '···.........···',
  '·.......#.....·',
  '·....~~~..t...·',
  '1.t..~~..ff...2',
  '11.....to..#..2',
  '1..#..ot.....22',
  '1...ff..~~..t.2',
  '·...t..~~~....·',
  '·.....#.......·',
  '···.........···',
  '·····.....·····'
 ]});
