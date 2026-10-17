/* Archipiélago · 17×13 celdas (98 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('archipielago',{n:'Archipiélago',art:{src:'assets/arenas/cielo.jpg'},bg:['#6ab8ee', '#dff0ff'],fx:'cloud',wx:[['wind', 0.5], ['none', 0.3], ['rain', 0.2]],mobs:3,
 theme:{t:['#e6ecee', '#d4dde1'], ln:'rgba(110,150,170,.45)', sd:['#9fb0b8', '#7f919b'], lip:'#7fbf5a', pit:['#a4dcff', '#c8d6e0'], liq:['#4fb3ff', '#9bdcff'], rock:['#c8cabf', '#9c9e93', '#7a7b72'], wood:['#c99c62', '#a07640', '#7a572b'], leaf:['#4fae3f', '#2f8230'], trunk:'#6b4a2a', stone:['#dfe3e6', '#aab3ba', '#868f98'], sky:true},
 map:[
  '·················',
  '·················',
  '··...·······...··',
  '·.....·····.....·',
  '·..t...op.....#.·',
  '·1.............2·',
  '11....c.#.c....22',
  '·1.............2·',
  '·.#.....po...t..·',
  '·.....·····.....·',
  '··...·······...··',
  '·················',
  '·················'
 ]});
