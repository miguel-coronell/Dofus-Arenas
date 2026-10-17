/* node tools/check-rules.js · revisa firebase/database.rules.json: JSON válido, todo cerrado por defecto y nada abierto a anónimos. */
const fs=require('fs'),f=__dirname+'/../firebase/database.rules.json';let ok=true;const bad=m=>{console.error('✖ '+m);ok=false};
let R;try{R=JSON.parse(fs.readFileSync(f,'utf8')).rules}catch(e){console.error('✖ JSON inválido: '+e.message);process.exit(1)}
if(R['.read']!==false||R['.write']!==false)bad('la raíz debe tener .read y .write en false');
const walk=(n,p)=>{for(const k in n){const v=n[k];if((k==='.read'||k==='.write')){if(v===true)bad(p+' '+k+' está abierto (true)');
   if(typeof v==='string'&&!/auth\.token\.firebase\.sign_in_provider != 'anonymous'/.test(v)&&p!=='/')bad(p+' '+k+' no excluye cuentas anónimas: '+v)}
  else if(v&&typeof v==='object')walk(v,p+(p==='/'?'':'/')+k)}};walk(R,'/');
['saves','chat','lobby','matches'].forEach(k=>{if(!R[k])bad('falta el nodo '+k)});
console.log(ok?'Reglas de Firebase ✔':'Reglas con problemas');process.exit(ok?0:1);
