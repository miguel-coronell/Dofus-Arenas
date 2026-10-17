/* Coliseo · 8×8 celdas (58 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('coliseo',{n:'Coliseo',art:{src:'assets/arenas/ruinas.jpg'},bg:['#8a7a4a', '#3a2f1a'],fx:'mote',wx:[['none', 0.7], ['wind', 0.3]],mobs:2,
 theme:{t:['#e8d4a2', '#d9c18c'], ln:'rgba(255,245,210,.5)', sd:['#8f7649', '#6f5a36'], lip:null, pit:['#2a2014', '#7e6638'], liq:['#4fb3ff', '#9bdcff'], rock:['#c2b79a', '#948a72', '#716957'], wood:['#c4905a', '#9a6b36', '#74501f'], leaf:['#6aa84a', '#4a8a38'], trunk:'#6b4a2a', stone:['#e3d9c0', '#b0a68b', '#8a806a']},
 map:[
  '........',
  '........',
  '1.p..p.2',
  '1..c...2',
  '1...c..2',
  '1.p..p.2',
  '........',
  '........'
 ]});
