/* instances.js · OBJETOS ÚNICOS (sin pantalla). Cada pieza de equipo es un EJEMPLAR distinto: el mismo «Gorro de Lino» puede dar 6 vitalidad y 3 fuerza, y otro 8 y 2.
   · La plantilla (js/data/items/*.js) sigue igual: su {stats} es el valor MEDIO. De ahí sale el RANGO de cada característica: de ROLL.lo × a ROLL.hi × (PA y PM no varían).
   · Un ejemplar se guarda como un texto: «gorro_lino@vit6,tierra3» = plantilla + sus valores. Va en b.inv / b.eq como cualquier otro id, así que NO hace falta tocar guardado, PvP ni intercambios.
   · Registry.items[«gorro_lino@vit6,tierra3»] lo construye al vuelo (con caché) y comprueba que cada valor esté dentro del rango: un id trucado no existe → la honradez del PvP lo rechaza.
   · Los objetos que ya tenías (id de plantilla, sin «@») siguen valiendo: son ejemplares con los valores medios.
   · Cargar DESPUÉS de items.js y ANTES de economy.js. Balance: todo en ROLL. */
const ROLL={lo:.7,hi:1.3,fixed:['pa','pm'],qMin:.75,qMax:1.25};   // rango = valor medio × [lo, hi] · estadísticas fijas · precio del ejemplar = precio × [qMin, qMax] según lo bueno que salió
const Inst={_c:new Map(),_r:new Map(),
 is:id=>typeof id==='string'&&id.indexOf('@')>0,                      // ¿es un ejemplar (y no una plantilla)?
 base:id=>{const i=typeof id==='string'?id.indexOf('@'):-1;return i>0?id.slice(0,i):id},
 /* rango {stat:[mín,máx]} de una plantilla de equipo */
 range(t){let r=Inst._r.get(t.id);if(r)return r;r={};
  for(const k in t.st){const v=t.st[k];if(ROLL.fixed.includes(k)){r[k]=[v,v];continue}const a=Math.round(v*ROLL.lo),b=Math.round(v*ROLL.hi);r[k]=[Math.min(a,b),Math.max(a,b)]}
  Inst._r.set(t.id,r);return r},
 keys:t=>Object.keys(Inst.range(t)).filter(k=>{const r=Inst.range(t)[k];return r[0]<r[1]}),   // estadísticas que varían, en el orden de la plantilla
 vary:t=>!!t&&!!Registry.kinds[t.kind]&&Registry.kinds[t.kind].n>0&&Inst.keys(t).length>0,           // ¿esta plantilla da ejemplares distintos?
 q:id=>{const x=Registry.items[id];return x&&x.q!=null?x.q:.5},                 // calidad 0-1 de un ejemplar (las piezas antiguas sin tirada valen como calidad media)
 mk:(base,v)=>base+'@'+Object.keys(v).map(k=>k+v[k]).join(','),
 /* tira los dados: valores al azar dentro del rango (más probables los del medio). Devuelve el id del ejemplar (o la plantilla si no varía) */
 roll(base,rnd){const t=Registry.items[base];if(!Inst.vary(t))return base;rnd=rnd||Math.random;const R=Inst.range(t),v={};
  for(const k of Inst.keys(t)){const[a,b]=R[k];v[k]=a+Math.round((b-a)*(rnd()+rnd())/2)}return Inst.mk(base,v)},
 /* lee un id de ejemplar → objeto como los de Registry.items (st con sus valores, q = calidad 0-1, qf = multiplicador de precio) o null si no es válido */
 resolve(id){let c=Inst._c.get(id);if(c)return c;c=Inst._build(id);if(c)Inst._c.set(id,c);return c},
 _build(id){const i=id.indexOf('@'),t=Registry.items[id.slice(0,i)];if(!Inst.vary(t))return null;
  const R=Inst.range(t),ks=Inst.keys(t),p=id.slice(i+1).split(',');if(p.length!==ks.length)return null;
  const v={};let num=0,den=0;
  for(let j=0;j<ks.length;j++){const k=ks[j],m=/^([a-z]+)(-?\d+)$/.exec(p[j]);if(!m||m[1]!==k)return null;const n=+m[2];if(!(n>=R[k][0]&&n<=R[k][1]))return null;v[k]=n;num+=n-R[k][0];den+=R[k][1]-R[k][0]}
  const st={};for(const k in t.st)st[k]=k in v?v[k]:t.st[k];
  const q=den?num/den:.5,qf=ROLL.qMin+(ROLL.qMax-ROLL.qMin)*q;
  return{...t,id,base:t.id,inst:true,st,q,qf,price:Math.max(1,Math.round(t.price*qf))}}};
/* Registry.items sigue listando SOLO las plantillas (Object.keys/values), pero acepta ids de ejemplar: Registry.items['gorro_lino@vit6,tierra3'] */
Registry.items=new Proxy(Registry.items,{
 get(t,k,r){if(typeof k==='string'&&k.indexOf('@')>0&&!(k in t))return Inst.resolve(k)||undefined;return Reflect.get(t,k,r)},
 has(t,k){return typeof k==='string'&&k.indexOf('@')>0?!!Inst.resolve(k):Reflect.has(t,k)}});
