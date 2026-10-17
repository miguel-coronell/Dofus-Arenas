/* Pradera · 13×11 celdas (120 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('pradera',{n:'Pradera',art:{src:'assets/arenas/pradera.jpg'},bg:['#3a8a4a', '#1d4a25'],fx:'leaf',wx:[['wind', 0.4], ['none', 0.3], ['rain', 0.3]],mobs:3,
 theme:{t:['#efe8c4', '#e1d9ae'], ln:'rgba(255,255,255,.6)', sd:['#a98a5c', '#8a6d44'], lip:'#79b83a', pit:['#2a2016', '#8b6b3e'], liq:['#4fb3ff', '#9bdcff'], rock:['#b9b8ae', '#8f8e86', '#6f6e68'], wood:['#d29a55', '#a8742f', '#7d5223'], leaf:['#4fae3f', '#2f8230'], trunk:'#6b4a2a', stone:['#c9c8bd', '#9d9c92', '#7a7970']},
 map:[
  '·...........·',
  '.............',
  '....cc.t.....',
  '1...t.#..ff..',
  '1...........2',
  '11.oo.c.oo.22',
  '1...........2',
  '..ff..#.t...2',
  '.....t.cc....',
  '.............',
  '·...........·'
 ]});
