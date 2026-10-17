/* Ruinas · 16×14 celdas (180 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('ruinas',{n:'Ruinas',art:{src:'assets/arenas/ruinas.jpg'},bg:['#2f6a30', '#143a1a'],fx:'leaf',wx:[['rain', 0.4], ['none', 0.4], ['wind', 0.2]],mobs:4,
 theme:{t:['#d2d3c2', '#c0c2ad'], ln:'rgba(255,255,255,.5)', sd:['#8c8e79', '#6e705f'], lip:'#6a9a4a', pit:['#1f2418', '#74786a'], liq:['#4f9fb0', '#8fd0d8'], rock:['#b7b9a6', '#8c8f7b', '#6a6d5a'], wood:['#b98450', '#8f6334', '#6a4724'], leaf:['#3f8e3a', '#2a6a2c'], trunk:'#5d4128', stone:['#d8d9c8', '#a2a58f', '#7a7d69']},
 map:[
  '··............··',
  '·..............·',
  '..#....mm.t..t..',
  '....p.....pp....',
  '....p....#.p....',
  '1......m.......2',
  '11.f.p..o...f.22',
  '11.f...o..p.f.22',
  '1.......m......2',
  '....p.#....p....',
  '....pp.....p....',
  '..t..t.mm....#..',
  '·..............·',
  '··............··'
 ]});
