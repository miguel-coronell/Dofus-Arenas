/* node tools/check-html.js · comprueba que todo <script src>, <link href> e <img src> de index.html existe, y que todos los .js tienen sintaxis válida. */
const fs=require('fs'),path=require('path'),cp=require('child_process'),root=path.join(__dirname,'..');let ok=true;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"#?]+)"/g)){const u=m[1];if(/^(https?:|data:|mailto:)/.test(u))continue;if(!fs.existsSync(path.join(root,u))){console.error('✖ index.html referencia un archivo que no existe: '+u);ok=false}}
if(/\son(click|error|load)=/i.test(html)){console.error('✖ hay manejadores inline (onclick=…) en index.html: la CSP de vercel.json los bloquea');ok=false}
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of walk(path.join(root,'js')).filter(f=>f.endsWith('.js'))){try{cp.execFileSync(process.execPath,['--check',f],{stdio:'pipe'})}catch(e){console.error('✖ sintaxis en '+path.relative(root,f)+'\n'+String(e.stderr).split('\n').slice(0,4).join('\n'));ok=false}}
console.log(ok?'HTML y JS ✔':'HTML/JS con problemas');process.exit(ok?0:1);
