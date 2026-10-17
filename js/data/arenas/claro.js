/* Claro del Bosque · 9×9 celdas (60 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('claro',{n:'Claro del Bosque',art:{src:'assets/arenas/pradera.jpg'},bg:['#3a8a4a', '#1d4a25'],fx:'leaf',wx:[['none', 0.5], ['wind', 0.3], ['rain', 0.2]],mobs:2,
 theme:{t:['#ece5be', '#ddd4a6'], ln:'rgba(255,255,255,.6)', sd:['#a98a5c', '#8a6d44'], lip:'#79b83a', pit:['#2a2016', '#8b6b3e'], liq:['#4fb3ff', '#9bdcff'], rock:['#b9b8ae', '#8f8e86', '#6f6e68'], wood:['#d29a55', '#a8742f', '#7d5223'], leaf:['#3f9a3b', '#2a7a2c'], trunk:'#6b4a2a', stone:['#c9c8bd', '#9d9c92', '#7a7970']},
 map:[
  '··.....··',
  '·.......·',
  '...t.o...',
  '1f......2',
  '11c.#.c22',
  '1......f2',
  '...o.t...',
  '·.......·',
  '··.....··'
 ]});
