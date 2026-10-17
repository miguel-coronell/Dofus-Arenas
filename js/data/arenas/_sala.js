/* Sala de espera (HUB) · 21×13. No sale en los combates (hub:true): es el punto de encuentro donde vuelves al terminar. Las letras mayúsculas son ESTACIONES interactivas (ver js/game/hub.js):
   W oficios · D mazmorras · Q equipo · K supermercado · P puesto de venta · B baúl (inventario) · L libro de hechizos · A portal duelo IA · M portal monstruos · V portal PvP */
ARENA('sala',{n:'Sala de espera',hub:true,art:{src:'assets/arenas/pradera.jpg'},bg:['#4a8f5a','#244a2c'],fx:'leaf',wx:[['none',1]],mobs:0,
 theme:{t:['#efe6c8','#e2d7b0'],ln:'rgba(255,255,255,.55)',sd:['#a98a5c','#8a6d44'],lip:'#79b83a',pit:['#2a2016','#8b6b3e'],liq:['#4fb3ff','#9bdcff'],rock:['#b9b8ae','#8f8e86','#6f6e68'],wood:['#d29a55','#a8742f','#7d5223'],leaf:['#3f9a3b','#2a7a2c'],trunk:'#6b4a2a',stone:['#c9c8bd','#9d9c92','#7a7970']},
 map:[
  '······.........······',
  '····.W..c.K.c..P.····',
  '···t.............t···',
  '·........1.1........·',
  '...D...t.....t...Q...',
  '..........~..........',
  '..B.....1~~~1.....L..',
  '..........~..........',
  '.......t.....t.......',
  '·........111........·',
  '···t.............t···',
  '····.A..c.M.c..V.····',
  '······.........······'
 ]});
