/* Islas Flotantes · 14×10 celdas (80 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('cielo',{n:'Islas Flotantes',art:{src:'assets/arenas/cielo.jpg'},bg:['#7ec8f2', '#e9f4ff'],fx:'cloud',wx:[['wind', 0.6], ['none', 0.4]],mobs:3,
 theme:{t:['#eceff5', '#dbe0ec'], ln:'rgba(120,140,180,.45)', sd:['#a9b2c6', '#8993ab'], lip:'#8fc46a', pit:['#a9dcff', '#c9d3e6'], liq:['#7cc4ff', '#cdeaff'], rock:['#cfd0c6', '#a0a197', '#7e7f76'], wood:['#c99c62', '#a07640', '#7a572b'], leaf:['#5dae48', '#3f8a36'], trunk:'#6e4c2c', stone:['#e4e6ec', '#b2b8c8', '#8e95aa'], sky:true},
 map:[
  '··············',
  '.....····.....',
  '.f...····.....',
  '1.#..····.c..2',
  '1...........t2',
  '1t...........2',
  '1..c.····..#.2',
  '.....····...f.',
  '.....····.....',
  '··············'
 ]});
