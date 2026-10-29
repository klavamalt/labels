document.querySelectorAll('.skip').forEach(button=>button.remove());
const story=document.querySelector('#story'), stage=document.querySelector('.stage'), intro=document.querySelector('.intro'), paper=document.querySelector('.paper'), face=document.querySelector('.paper-face'), back=document.querySelector('.fold-back'), shadow=document.querySelector('.fold-shadow');
const data=[['Мелочный',147,365,279,10],['Расчётливая',1088,377,301,-4],['Жадина',472,304,252,-5],['Жмот',827,306,227,0],['Скупердяй',86,509,282,-10],['Халявщица',757,437,288,-10],['Нищеброд',408,547,280,5],['Меркантильная',982,528,336,8],['Пополамщик',469,394,307,-8]];
const labels=data.map(([title,x,y,w,angle])=>{let n=document.createElement('div');n.className='label';const caption=document.createElement('span');caption.textContent=title;n.append(caption);n.style.cssText=`left:${x}px;top:${y}px;width:${w}px`;document.querySelector('.labels').append(n);return {n,x,y,w,angle};});
const sceneBoard=document.querySelector('.intro .artboard'),sceneFade=document.querySelector('.yellow-edge');sceneBoard.append(sceneFade);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);let width,height,scale,raf=0;const desktopLabels=data.map(x=>x.slice());const mobileLabels=[[4,330,140,10],[210,325,145,-4],[85,260,120,-5],[223,266,104,0],[0,440,134,-10],[202,400,140,-10],[40,490,128,5],[175,475,170,8],[80,375,148,-8]];
function size(){
// Safari may resize its visible viewport without dispatching window.resize.
if(innerWidth<=1023){const viewport=window.visualViewport;const visibleHeight=Math.ceil(viewport&&viewport.scale===1?viewport.height+viewport.offsetTop:innerHeight);stage.style.setProperty('--intro-viewport-height',visibleHeight+'px');}
else stage.style.removeProperty('--intro-viewport-height');
width=stage.clientWidth;height=stage.clientHeight;const mobile=width<=760;scale=mobile?Math.min((width-40)/350,1):Math.min(width/1440,height/740);document.documentElement.style.setProperty('--mobile-scene-scale',scale);labels.forEach((l,i)=>{const a=mobile?mobileLabels[i]:[desktopLabels[i][1],desktopLabels[i][2],desktopLabels[i][3],desktopLabels[i][4]];[l.x,l.y,l.w,l.angle]=a;if(mobile)l.y+=(height-844)*.5;l.n.style.left=l.x+'px';l.n.style.top=l.y+'px';l.n.style.width=l.w+'px';});document.documentElement.style.setProperty('--scale',scale);document.documentElement.style.setProperty('--mobile-scale',Math.min(width/390,height/780));paper.setAttribute('viewBox',`0 0 ${width} ${height}`);paper.setAttribute('preserveAspectRatio','none');Object.assign(sceneFade.style,{left:(-(width-1440*scale)/2/scale)+'px',bottom:((740*scale-height)/2/scale)+'px',width:(width/scale)+'px',height:(Math.max(110,height*.22)/scale)+'px'});render();}
// Intersect the viewport with x + y <= limit. The crease travels from bottom-right to top-left.
function cut(limit){let poly=[[0,0],[width,0],[width,height],[0,height]],out=[];for(let i=0;i<4;i++){const a=poly[i],b=poly[(i+1)%4],da=a[0]+a[1]-limit,db=b[0]+b[1]-limit;if(da<=0)out.push(a);if((da<0&&db>0)||(da>0&&db<0)){const t=da/(da-db);out.push([mix(a[0],b[0],t),mix(a[1],b[1],t)]);}}return out;}
function render(){raf=0;if(matchMedia('(prefers-reduced-motion:reduce)').matches){if(width<=760){location.replace('about.html');return;}intro.inert=true;intro.style.visibility='hidden';paper.style.visibility='hidden';document.querySelector('.about').inert=false;document.querySelector('.about').style.visibility='visible';return;}const p=clamp(-story.getBoundingClientRect().top/(story.offsetHeight-height));const cover=clamp((p-.44)/.17),peel=clamp((p-.61)/.35);
// Match browser overscroll and toolbar color to the fully covering yellow paper.
const covered=width<=1023&&cover>=.95&&peel<.02;
document.documentElement.classList.toggle('intro-covered',covered);
const theme=document.querySelector('meta[name="theme-color"]'),themeColor=covered?'#f6ff00':'#ffffff';
if(theme&&theme.content!==themeColor)theme.content=themeColor;
labels.forEach((l,i)=>{const t=clamp((p-(.055+i*.037))/.033),e=1-Math.pow(1-t,3);l.n.style.opacity=t===0?0:1;l.n.style.transform=`translate(${(1-e)*25}px,${-(1-e)*65}px) rotate(${l.angle+(1-e)*14}deg) scale(${mix(1.15,1,e)})`;});
// Expand the original label itself: no duplicate overlay or replacement rectangle.
const l=labels[8],e=smooth(cover),zoom=Math.exp(Math.log(Math.max(width/(l.w*scale),height/((width<=760?34:58)*scale))*2.9)*e);
const boardRect=sceneBoard.getBoundingClientRect();
const dx=(width/2-(boardRect.left+(l.x+l.w/2)*scale))/scale;
const dy=(height/2-(boardRect.top+(l.y+(width<=760?17:29))*scale))/scale;
if(p>=.44){l.n.style.transform=`translate(${dx*e}px,${dy*e}px) rotate(${mix(l.angle,0,e)}deg) scale(${zoom})`;}
l.n.style.zIndex='20';l.n.querySelector('span').style.opacity=1-clamp(cover*4);
document.querySelector('.intro .artboard').style.zIndex=p>=.44?'4':'';

intro.style.visibility=p<.61?'visible':'hidden';intro.style.pointerEvents=p<.61?'auto':'none';document.querySelector('.scroll-hint').style.opacity=1-clamp(p/.08);paper.style.visibility=p>=.61&&peel<1?'visible':'hidden';
const limit=(width+height+2)*(1-smooth(peel)),pts=cut(limit);face.setAttribute('points',pts.map(v=>v.join(',')).join(' '));const a=limit>width?[width,limit-width]:[limit,0],b=limit>height?[limit-height,height]:[0,limit];if(peel>0&&peel<1){const band=Math.sin(Math.PI*peel)*Math.min(140,width*.15),d=`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${b[0]-band} ${b[1]-band} Q ${(a[0]+b[0])/2-band*.25} ${(a[1]+b[1])/2-band*.25} ${a[0]} ${a[1]} Z`;back.setAttribute('d',d);const finish=document.querySelector('#back'),cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;for(const [key,value] of Object.entries({x1:cx,y1:cy,x2:cx-band,y2:cy-band}))finish.setAttribute(key,value);shadow.setAttribute('d',d);}else{back.setAttribute('d','');shadow.setAttribute('d','');}
if(width<=760&&peel>=1&&!matchMedia('(prefers-reduced-motion:reduce)').matches){location.replace('about.html');return;}
// White explanation is already underneath the paper; it is exposed by the moving crease.
document.querySelector('.about').inert=p<.95&&!matchMedia('(prefers-reduced-motion:reduce)').matches;document.querySelector('.intro').inert=p>=.61;document.querySelector('.about').style.visibility=p>=.61?'visible':'hidden';
}
window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(render);},{passive:true});window.addEventListener('resize',size);
window.visualViewport?.addEventListener('resize',size,{passive:true});
window.visualViewport?.addEventListener('scroll',size,{passive:true});
const stageObserver=new ResizeObserver(()=>{if(stage.clientWidth!==width||stage.clientHeight!==height)size();});
stageObserver.observe(stage);size();
function end(instant=false){if(width<=760){location.href='about.html';return;}history.replaceState({},'','#about');window.scrollTo({top:story.offsetTop+story.offsetHeight-height,behavior:instant||matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}document.querySelectorAll('[data-end]').forEach(n=>n.addEventListener('click',e=>{e.preventDefault();end();}));

if(location.hash==='#about')end(true);
window.addEventListener('pageshow',()=>{if(location.hash==='#about'){end(true);render();}});
window.addEventListener('hashchange',()=>{if(location.hash==='#about')end(true);});
