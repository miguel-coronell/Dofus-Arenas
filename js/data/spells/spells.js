/* Hechizos: lenguaje común. Los de cada CLASE están en js/data/classes.js; aquí los de los monstruos.
   Efectos:  D(elem,min,max,{ls:robo de vida 0-1, on:'s' = daño a ti mismo})  daño
             H(min,max,elem)            cura al lanzador          AR(min,max,elem,turnos)   armadura (absorbe daño)
             B(stat,valor,turnos,on)    buff/debuff: stat = 'pa'|'pm'|'pow'|'res'|'inv' · on:'t' = sobre el rival (valor negativo = debuff)
             VE(elem,min,max,turnos)     veneno (daño al inicio de cada turno del rival)
             PU(n)                      empuja n casillas (n negativo = atrae) · choque = daño extra    TP  teletransporte (celda vacía)   SW  intercambia posición
   Opciones del hechizo: tg:'e' enemigo (por defecto) | 's' sobre ti | 'c' celda · cd:recarga · lim:máx. lanzamientos por turno */
const D=(el,a,b,o)=>({k:'d',el,a,b,...o}),H=(a,b,el)=>({k:'h',a,b,el}),AR=(a,b,el,tn)=>({k:'ar',a,b,el,tn}),
 B=(s,v,tn,on)=>({k:'b',s,v,tn,on:on||'s'}),VE=(el,a,b,tn)=>({k:'dot',el,a,b,tn}),PU=n=>({k:'push',n}),TP={k:'tp'},SW={k:'sw'};
const FX={tierra:'#b08a50',fuego:'#ff7a2a',agua:'#4fb3ff',aire:'#c9f2a0'};
const addSpell=(id,n,i,pa,r,e,o)=>Registry.add('spells',id,{n,i,pa,r,e,lvl:1,tg:'e',cd:0,lim:2,fx:FX[(e.find(x=>x.el)||{el:'aire'}).el],...o});
/* monstruos */
addSpell('picotazo','Picotazo','🐦',3,[1,1],[D('aire',6,10)]);
addSpell('mordisco','Mordisco','🐗',3,[1,1],[D('tierra',8,12)]);
addSpell('aguijon','Aguijón','🦟',3,[1,2],[D('aire',7,11)]);
addSpell('baba','Baba','💧',4,[1,3],[D('agua',9,13)]);
