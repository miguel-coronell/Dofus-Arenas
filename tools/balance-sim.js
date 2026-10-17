const fs=require('fs'),vm=require('vm');const R=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
let util=R('js/core/util.js').replace("wait=ms=>new Promise(r=>setTimeout(r,ms))","wait=ms=>{for(const e of G.ents)if(e.path&&e.path.length){const[x,y]=e.path[e.path.length-1];e.x=e.px=x;e.y=e.py=y;e.path=[]}return Promise.resolve()}");
const code=["globalThis.document={querySelector:()=>({})};",util,R('js/game/maps.js'),R('js/game/rules.js'),R('js/data/spells/spells.js'),R('js/data/objects.js'),R('js/data/classes.js'),R('js/game/items.js'),R('js/data/items/base.js'),R('js/data/items/extra.js'),R('js/game/jobs.js'),R('js/data/crafts.js'),R('js/data/crafts_extra.js'),R('js/game/economy.js'),R('js/data/looks.js'),R('js/game/progress.js'),
 "ARENA('t',{map:['·.......·','..1..#...','.1..c..2.','..f...2..','.1..#.o2.','..1...2..','.....t...','·.......·']});",
 "globalThis.UI={log(){},logClear(){},msg(){},hud(){},slots(){},sheetRefresh(){},result(){}};var PJ=PG.newBuild('x','feca','m'),SAVED=false;var Net={};",
 R('js/game/challenges.js'),R('js/game/combat.js'),
 `globalThis.api={G,startBattle,exec,next,ai,PG,Rules,Registry,PROG,ELS,hero,check}`].join('\n');
const ctx=vm.createContext({console,Math,Promise,Object,JSON,localStorage:{},setTimeout,globalThis:null});ctx.globalThis=ctx;vm.runInContext(code,ctx);
const A=ctx.api;
async function duel(c1,c2,L1,L2,seed){const b1=A.PG.auto(c1,L1,'A'),b2=A.PG.auto(c2,L2,'B');
 A.startBattle('t',{mode:'pvp',a:{uid:'a',build:b1},b:{uid:'b',build:b2},seed,uid:'a'});A.G.ents.forEach(e=>e.ctl='ai');A.G.mode='ai';
 let turns=0;const rb=A.Rules.begin;A.Rules.begin=(S,e)=>{turns++;if(turns>200)A.G.over=true;return rb(S,e)};
 await A.ai(A.G.cur,A.G.bid);await A.next();A.Rules.begin=rb;const w=A.Rules.win(A.G);return{w:turns>200?'stall':w,turns:turns}}
(async()=>{const cl=Object.keys(A.Registry.classes);console.log('clases',cl.length,'hechizos',Object.keys(A.Registry.spells).length);
 for(const L of [1,20,100,200]){const win={},err=[];let st=0,tt=0,n=0,draw=0;cl.forEach(c=>win[c]=[0,0]);
  for(const a of cl)for(const b of cl){if(a===b)continue;try{const r=await duel(a,b,L,L,1+n);n++;tt+=r.turns;if(r.w==='stall')st++;else if(r.w===-1)draw++;else if(r.w===0){win[a][0]++;win[a][1]++;win[b][1]++}else{win[b][0]++;win[a][1]++;win[b][1]++}}catch(e){err.push(a+' '+b+' '+e.stack.split('\n').slice(0,3).join('|'));break}}
  console.log('Nivel',L,'duelos',n,'estancados',st,'empates',draw,'turnos medios',(tt/n).toFixed(1),'errores',err.length);if(err.length)console.log(err[0]);
  console.log(cl.map(c=>c+':'+Math.round(100*win[c][0]/Math.max(1,win[c][1]))+'%').join(' '))}
 // determinismo
 const r1=await duel('sram','xelor',50,50,777),h1=JSON.stringify(A.G.ents.map(e=>[e.x,e.y,e.hp]));const r2=await duel('sram','xelor',50,50,777),h2=JSON.stringify(A.G.ents.map(e=>[e.x,e.y,e.hp]));
 console.log('determinista:',h1===h2,r1.turns,r2.turns,h1);
})().catch(e=>console.log('FALLO',e.stack));
