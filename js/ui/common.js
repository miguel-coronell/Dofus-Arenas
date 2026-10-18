/* ui/common.js · ayudas de pantalla compartidas por inventario, oficios, mercado y sets */
const kf=n=>(n||0).toLocaleString('es'),stTxt=(st,sep)=>Object.entries(st||{}).map(([k,v])=>{const s=STAT[k]||['✨',k,''];return s[0]+' '+(v>0?'+':'')+v+(s[2]||'')+' '+s[1]}).join(sep||' · ');
const pctTxt=p=>(Math.round(p*1000)/10).toLocaleString('es')+' %';
const KCOL={recurso:'#8a6a3a',consumible:'#c0506a'};
/* OBJETOS ÚNICOS · texto de pantalla: rangos de una plantilla («❤️ 4–8 · 🪨 2–4») y características de un ejemplar con su rango entre paréntesis */
const rgTxt=(t,sep)=>{const R=Inst.range(t);return Object.keys(R).map(k=>{const s=STAT[k]||['✨',k,''],[a,b]=R[k];return s[0]+' '+(a===b?(a>0?'+':'')+a:a+'–'+b)+(s[2]||'')}).join(sep||' · ')};
const fxHtml=(it,mode)=>{const t=Registry.items[Inst.base(it.id)],R=Inst.vary(t)?Inst.range(t):null;   // mode 'range' = plantilla con sus mínimos y máximos · otro = valores de ese ejemplar
 return Object.entries(mode==='range'&&R?Object.fromEntries(Object.keys(R).map(k=>[k,R[k][1]])):it.st).map(([k,v])=>{const s=STAT[k]||['✨',k,''],r=R&&R[k],u=s[2]||'';
  if(mode==='range'&&r)return`<li>${s[0]} ${s[1]}: <b>${r[0]===r[1]?(r[0]>0?'+':'')+r[0]+u:r[0]+u+' a '+r[1]+u}</b>${r[0]===r[1]?' <small>(fijo)</small>':''}</li>`;
  const rg=r&&r[0]<r[1]?` <small class="rg${v===r[1]?' mx':v===r[0]?' mn':''}">(${r[0]}–${r[1]})</small>`:'';return`<li>${s[0]} ${s[1]}: <b>${v>0?'+':''}${v}${u}</b>${rg}</li>`}).join('')};
const rollChips=it=>{const t=Registry.items[Inst.base(it.id)],R=Inst.vary(t)?Inst.range(t):{};
 return Object.entries(it.st).map(([k,v])=>{const s=STAT[k]||['✨',k,''],r=R[k],c=r&&r[0]<r[1]?(v===r[1]?' mx':v===r[0]?' mn':''):' fx';return`<i class="rl${c}" title="${esc(s[1])}">${s[0]} ${v>0?'+':''}${v}${s[2]||''}</i>`}).join('')};
const stSpans=it=>{const t=Registry.items[Inst.base(it.id)],R=Inst.vary(t)?Inst.range(t):{};return Object.entries(it.st).map(([k,v])=>{const r=R[k],g=r&&r[0]<r[1]?' <small class="rg'+(v===r[1]?' mx':v===r[0]?' mn':'')+'">('+r[0]+'–'+r[1]+')</small>':'';return`<span>${esc(stTxt({[k]:v}))}${g}</span>`}).join('')};
const mkCol=i=>(Registry.isets[i.set]||{}).c||i.c||KCOL[i.kind]||'#7a8';
const KCAT=()=>[['all','Todas las categorías'],...Object.values(Registry.kinds).map(k=>[k.id,k.ico+' '+k.pl])];
/* gráfica pequeña de precios (SVG) */
function spark(h,w,ht){w=w||220;ht=ht||54;if(!h||h.length<2)return'';const mn=Math.min(...h),mx=Math.max(...h),r=mx-mn||1,p=h.map((v,i)=>(i/(h.length-1)*(w-6)+3).toFixed(1)+','+(ht-5-(v-mn)/r*(ht-10)).toFixed(1)).join(' '),up=h[h.length-1]>=h[0];
 return`<svg class="spark" viewBox="0 0 ${w} ${ht}" width="${w}" height="${ht}"><polyline points="${p}" fill="none" stroke="${up?'#ff8b6a':'#8fe05a'}" stroke-width="2.2" stroke-linejoin="round"/></svg>`}
const trendTxt=t=>Math.abs(t)<.005?'<em class="tr0">＝</em>':t>0?`<em class="tru">▲ ${Math.round(t*100)}%</em>`:`<em class="trd">▼ ${Math.round(-t*100)}%</em>`;
/* redibuja una ventana entera (innerHTML) conservando el scroll de las zonas indicadas: sels = [[selector, conservar?]…] */
const scrollKeep=(root,sels,fn)=>{const old=sels.map(([s])=>{const e=root.querySelector(s);return e?e.scrollTop:0}),top=root.scrollTop;fn();sels.forEach(([s,keep],i)=>{const e=root.querySelector(s);if(e)e.scrollTop=keep?old[i]:0});root.scrollTop=top};
const overlayOpen=()=>['#create','#pick','#result','#sheet','#spells','#mkt','#sets','#inv','#jobs','#party','#dung','#colo','#friends','#trade','#leavebox','#worldmap','#gmenu'].some(s=>$(s)&&!$(s).hidden);
