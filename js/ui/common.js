/* ui/common.js · ayudas de pantalla compartidas por inventario, oficios, mercado y sets */
const kf=n=>(n||0).toLocaleString('es'),stTxt=(st,sep)=>Object.entries(st||{}).map(([k,v])=>{const s=STAT[k]||['✨',k,''];return s[0]+' '+(v>0?'+':'')+v+(s[2]||'')+' '+s[1]}).join(sep||' · ');
const pctTxt=p=>(Math.round(p*1000)/10).toLocaleString('es')+' %';
const KCOL={recurso:'#8a6a3a',consumible:'#c0506a'};
const mkCol=i=>(Registry.isets[i.set]||{}).c||i.c||KCOL[i.kind]||'#7a8';
const KCAT=()=>[['all','Todas las categorías'],...Object.values(Registry.kinds).map(k=>[k.id,k.ico+' '+k.pl])];
/* gráfica pequeña de precios (SVG) */
function spark(h,w,ht){w=w||220;ht=ht||54;if(!h||h.length<2)return'';const mn=Math.min(...h),mx=Math.max(...h),r=mx-mn||1,p=h.map((v,i)=>(i/(h.length-1)*(w-6)+3).toFixed(1)+','+(ht-5-(v-mn)/r*(ht-10)).toFixed(1)).join(' '),up=h[h.length-1]>=h[0];
 return`<svg class="spark" viewBox="0 0 ${w} ${ht}" width="${w}" height="${ht}"><polyline points="${p}" fill="none" stroke="${up?'#ff8b6a':'#8fe05a'}" stroke-width="2.2" stroke-linejoin="round"/></svg>`}
const trendTxt=t=>Math.abs(t)<.005?'<em class="tr0">＝</em>':t>0?`<em class="tru">▲ ${Math.round(t*100)}%</em>`:`<em class="trd">▼ ${Math.round(-t*100)}%</em>`;
const overlayOpen=()=>['#create','#pick','#result','#sheet','#spells','#mkt','#sets','#inv','#jobs','#party','#dung','#colo','#leavebox'].some(s=>$(s)&&!$(s).hidden);
