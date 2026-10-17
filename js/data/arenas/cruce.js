/* Cruce de Caminos · 15×15 celdas (110 de suelo). Dibujo del mapa: · vacío  . suelo  1/2 salidas  # c t p m obstáculos altos  f o ~ obstáculos bajos (ver js/game/maps.js) */
ARENA('cruce',{n:'Cruce de Caminos',art:{src:'assets/arenas/pradera.jpg'},bg:['#a8743a', '#4a3018'],fx:'leaf',wx:[['wind', 0.5], ['rain', 0.3], ['none', 0.2]],mobs:4,
 theme:{t:['#efdfb2', '#e2cf9c'], ln:'rgba(255,255,255,.5)', sd:['#a9824f', '#86643a'], lip:'#cf7a2c', pit:['#2a1c12', '#8b6238'], liq:['#4fb3ff', '#9bdcff'], rock:['#b8b0a2', '#8d857a', '#6b645c'], wood:['#cf9455', '#a56f31', '#7a5124'], leaf:['#dd8a2d', '#b85a1c'], trunk:'#6b4a2a', stone:['#c9c8bd', '#9d9c92', '#7a7970']},
 map:[
  '·····.....·····',
  '·····.....·····',
  '·····..f..·····',
  '·····..f..·····',
  '·····.....·····',
  '1.....t........',
  '1....c..f.....2',
  '11oo...#...oo22',
  '1.....f..c....2',
  '........t.....2',
  '·····.....·····',
  '·····..f..·····',
  '·····..f..·····',
  '·····.....·····',
  '·····.....·····'
 ]});
