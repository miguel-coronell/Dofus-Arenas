/* weather.js · clima en pantalla: 'rain' lluvia con gotas inclinadas y oscurecimiento, 'wind' rachas + pétalos/hojas */
function drawWeather(g,W,H,t,m){
 if(m==='rain'){g.fillStyle='rgba(15,25,45,.28)';g.fillRect(0,0,W,H);g.strokeStyle='rgba(200,225,255,.55)';g.lineWidth=1.3;g.beginPath();
  for(let i=0;i<150;i++){const s=(i*.6180339)%1,p=(t*(1.1+(i%4)*.15)+s)%1,bx=((i*.37)%1)*(W+200),x=(((bx-p*120)%(W+200))+W+200)%(W+200)-100,y=p*(H+60)-30;g.moveTo(x,y);g.lineTo(x-7,y+20)}g.stroke();
  g.strokeStyle='rgba(220,240,255,.35)';for(let i=0;i<14;i++){const p=(t*1.5+i*.37)%1,x=((i*.29)%1)*W,y=H*.45+((i*.53)%1)*H*.5;g.globalAlpha=1-p;g.beginPath();g.ellipse(x,y,3+p*12,1+p*4,0,0,7);g.stroke()}g.globalAlpha=1}
 if(m==='wind'){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.5;
  for(let i=0;i<10;i++){const p=(t*.35+i*.173)%1.4-.2,x=p*(W+300)-150,y=((i*.37)%1)*H;g.globalAlpha=Math.sin(Math.min(1,Math.max(0,p))*Math.PI);g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+60,y-14,x+110,y+14,x+180,y-6);g.stroke()}g.globalAlpha=1;
  for(let i=0;i<22;i++){const x=(((i*.618)%1)*W+t*(110+i%5*35))%(W+80)-40,y=((i*.173)%1)*H+Math.sin(t*2+i)*30+t*8%20;g.save();g.translate(x,y);g.rotate(t*3+i);g.fillStyle=i%3?'#ffc2dc':'#a6ef7c';g.beginPath();g.ellipse(0,0,5,2.5,0,0,7);g.fill();g.restore()}}}
