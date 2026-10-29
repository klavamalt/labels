(()=>{'use strict';
let host,view,story,onExit,onComplete,state,peelers=[],paperObserver,observer,logoSource,typingFrame=0;
const $=(s,r=host)=>r.querySelector(s),clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');let peelSequence=0;
const reactions=['Устраивает','Терпимо','Осуждаю'],mascots=['b41c1.svg','e47a0.svg','8dbfd.svg'];
const blank=()=>({phase:'first',first:null,last:null,detail:0,opened:[false,false,false]});
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function announce(text){$('.fc-announcement').textContent=text;}
function mascot(i,selected=false){return `<span class="fc-mascot"><img src="assets/${selected&&i===2?'50f99.svg':mascots[i]}" alt="" draggable="false"></span><span class="fc-label">${reactions[i]}</span>`;}
function reaction(i){return `<div class="fc-sticker fc-reaction" data-reaction="${i}"><div class="fc-sticker-under" aria-hidden="true">${mascot(i,true)}</div><div class="fc-sticker-front">${mascot(i)}<img class="fc-printed-corner" src="assets/ad331.svg" alt="" width="24" height="20"></div><button class="fc-sticker-button" type="button" aria-label="${reactions[i]}: отклеить и выбрать реакцию" aria-pressed="false"><span class="fc-peel-handle"></span></button></div>`;}
function button(label,kind,fn,disabled=false){const b=document.createElement('button');b.type='button';b.className='fc-button '+kind;b.textContent=label;b.disabled=disabled;b.onclick=fn;$('.fc-actions').append(b);return b;}
function artwork(){return `<svg class="fc-brand-defs" aria-hidden="true" width="0" height="0"><defs><filter id="fc-brand-yellow" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 8 0 -8 0 -1.6" result="red-yellow"/><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 8 -8 0 -1.6" result="green-yellow"/><feComposite in="red-yellow" in2="green-yellow" operator="in" result="yellow-mask"/><feFlood flood-color="#f6ff00" result="brand"/><feComposite in="brand" in2="yellow-mask" operator="in" result="brand-yellow"/><feComposite in="SourceGraphic" in2="yellow-mask" operator="out" result="photo"/><feMerge><feMergeNode in="photo"/><feMergeNode in="brand-yellow"/></feMerge></filter></defs></svg><div class="fc-paper" role="img" aria-label="Фотография пары, закрытая бумажными гранями"><div class="fc-paper-art"><div class="fc-photo-window"><img class="fc-base-photo" src="assets/${story.photo}" alt="" draggable="false"></div><div class="fc-photo-shade"></div><div class="fc-face fc-face-bottom"><img src="assets/${story.faces[0]}" width="705.6" height="342.6" alt="" draggable="false"></div><div class="fc-face fc-face-top"><div class="fc-face-flip"><img src="assets/${story.faces[1]}" width="705.6" height="342.6" alt="" draggable="false"></div></div><div class="fc-face fc-face-left"><div class="fc-face-rotate"><img src="assets/${story.faces[2]}" width="668" height="349" alt="" draggable="false"></div></div><div class="fc-face fc-face-right"><div class="fc-face-rotate"><img src="assets/${story.faces[3]}" width="668" height="349" alt="" draggable="false"></div></div><div class="fc-paper-grain" aria-hidden="true">${[1,2,3,4].map(n=>`<div class="fc-grain fc-g${n}"><img src="assets/0f01c.png" alt=""></div>`).join('')}</div><div class="fc-photo-edges" aria-hidden="true"><div class="fc-photo-edge fc-edge-left"></div><div class="fc-photo-edge fc-edge-right"></div><div class="fc-photo-edge fc-edge-top"></div><div class="fc-photo-edge fc-edge-bottom"></div></div></div></div>`;}
function caption(pair,hideMobileTitle=false){return `<div class="fc-caption${hideMobileTitle?' fc-mobile-no-title':''}">${pair[0]?`<h3>${esc(pair[0])}</h3>`:''}${pair[1]?`<p>${esc(pair[1])}</p>`:''}</div>`;}
function editorialPhoto(data,kind,alt){return `<div class="fc-editorial-photo ${kind}"><img src="assets/${data.image}" alt="${esc(alt)}" loading="lazy">${data.mobileOverlay?`<img class="fc-mobile-overlay" src="assets/${data.mobileOverlay}" alt="" loading="lazy">`:''}</div>`;}
function stats(items){return `<div class="fc-stats">${items.map(([value,text])=>`<div><strong>${esc(value)}</strong><p>${esc(text)}</p></div>`).join('')}</div>`;}
function reasonCopy(item,i){return `<div class="fc-reason-copy"><span>${i+1}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></div>`;}
function continuation(){return `<div class="fc-continuation" hidden>${story.editorial.map(block=>`<section class="fc-editorial"><div class="fc-section-heading"><h2>${esc(block.title)}</h2><p>${esc(block.description)}</p></div>${block.type==='banner'?`${editorialPhoto(block,'fc-banner',block.title)}<div class="fc-captions">${block.captions.map(pair=>caption(pair,block.mobileHideCaptionTitle)).join('')}${block.stats?stats(block.stats):''}</div>`:block.type==='comparison'?`<div class="fc-comparison">${block.columns.map(c=>`<article>${caption(c.caption)}${editorialPhoto(c,'fc-comparison-photo',c.caption[1])}${stats(c.stats)}</article>`).join('')}</div>`:block.central?`<div class="fc-central-reasons"><img src="assets/${block.central}" alt="${esc(block.title)}" loading="lazy">${block.items.map((item,i)=>`<article>${reasonCopy(item,i)}</article>`).join('')}</div>`:`<div class="fc-reasons">${block.items.map((item,i)=>`<article><img src="assets/${item.image}" alt="${esc(item.title)}" loading="lazy">${reasonCopy(item,i)}</article>`).join('')}</div>`}</section>`).join('')}</div>`;}
function mount(target,data,exit,complete){destroy();view=target;logoSource=view.querySelector('.logo').getAttribute('src');view.querySelector('.logo').src='assets/82895.svg';story=data;onExit=exit;onComplete=complete;state=blank();host=document.createElement('div');host.className='fc-content';host.dataset.case=story.id;view.classList.add('first-case');view.append(host);host.innerHTML=`<div class="fc-main-wrap"><div class="fc-main">${artwork()}<div class="fc-panel"><div class="fc-heading"><h1 tabindex="-1">${esc(story.title)}</h1><p class="fc-intro">${esc(story.intro)}</p></div><img class="fc-rule" src="assets/48eaa.svg" alt="" width="650" height="2"><div class="fc-stage"></div><div class="fc-bottom"><p class="fc-result-note" hidden>Контекст не отменяет твою реакцию.<br>Но иногда он меняет то, что мы видим</p><div class="fc-actions"></div></div></div></div></div>${continuation()}<p class="fc-announcement" aria-live="polite"></p>`;
const fit=()=>host.style.setProperty('--fc-scale',host.clientWidth/1372);observer=new ResizeObserver(fit);observer.observe(host);fit();const fitPaper=()=>{const paper=$('.fc-paper'),width=paper.clientWidth;if(width>0){paper.style.setProperty('--fc-paper-height',(width*648/680)+'px');$('.fc-paper-art').style.setProperty('--fc-art-scale',width/680);}};paperObserver=new ResizeObserver(fitPaper);paperObserver.observe($('.fc-paper'));fitPaper();render();$('h1').focus({preventScroll:true});view.scrollTop=0;}
function destroy(){cancelAnimationFrame(typingFrame);peelers.forEach(p=>p.destroy());peelers=[];observer?.disconnect();paperObserver?.disconnect();if(view){view.classList.remove('first-case');if(logoSource)view.querySelector('.logo').src=logoSource;logoSource=null;}host?.remove();host=null;}
function render(focus=false){cancelAnimationFrame(typingFrame);peelers.forEach(p=>p.destroy());peelers=[];host.dataset.phase=state.phase;$('.fc-actions').replaceChildren();$('.fc-continuation').hidden=state.phase!=='result';$('.fc-result-note').hidden=state.phase!=='result';const stage=$('.fc-stage');
if(state.phase==='first'||state.phase==='last'){const first=state.phase==='first',key=first?'first':'last';let selectionOwner=null;stage.innerHTML=`<div class="fc-stage-heading"><h2 id="fc-stage-title">${first?'Твоя первая реакция?':'Как отнесёшься к этому теперь?'}</h2><p>Потяни, чтобы выбрать</p></div><div class="fc-reaction-grid" role="group" aria-labelledby="fc-stage-title">${reactions.map((_,i)=>reaction(i)).join('')}</div><p class="fc-mobile-hint">Нажми на ярлык или потяни за уголок</p>`;
const next=button('Сначала выбери реакцию','primary fc-initial-next',()=>{if(state[first?'first':'last']===null)return;state.phase=first?'detail':'result';state.detail=0;render(true);if(!first)view.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});},true);
const choose=i=>{if(state[key]!==null&&state[key]!==i)return;state[key]=i;stage.querySelectorAll('.fc-reaction').forEach((el,n)=>{el.classList.toggle('is-selected',i===n);el.classList.add('fc-choice-locked');const control=$('.fc-sticker-button',el);control.setAttribute('aria-pressed',String(i===n));control.disabled=true;});next.disabled=false;next.textContent=first?'Узнать детали':'Узнать результат';announce('Выбрано: '+reactions[i]);};stage.querySelectorAll('.fc-reaction').forEach((el,i)=>peelers.push(new PeelSticker(el,{selection:true,canInteract:()=>state[key]===null&&(!selectionOwner||selectionOwner===el),onStart:()=>{selectionOwner=el;},onCancel:()=>{selectionOwner=null;},onOpen:()=>choose(i)})));if(state[key]!==null)choose(state[key]);
}else if(state.phase==='detail'){const i=state.detail,d=story.details[i],opened=state.opened[i];stage.innerHTML=`<div class="fc-stage-heading"><h2 id="fc-stage-title">${esc(d.title)}</h2><p>Деталь ${String(i+1).padStart(2,'0')} / 03</p></div><div class="fc-sticker fc-detail${opened?' is-open':''}"><div class="fc-sticker-under" id="fc-detail-content" aria-hidden="${!opened}"><p>${esc(d.text)}</p><img class="fc-printed-corner" src="assets/5c416.svg" alt="" width="57" height="57"></div><div class="fc-sticker-front"><img class="fc-printed-corner" src="assets/5c416.svg" alt="" width="57" height="57"></div><button class="fc-sticker-button" type="button" aria-label="Отклеить наклейку и открыть деталь ${i+1}" aria-expanded="${opened}" aria-controls="fc-detail-content"><span class="fc-peel-handle"></span></button></div><p class="fc-detail-hint">${opened?'Деталь открыта':'Потяни, чтобы узнать деталь'}</p>`;
const next=button(i===2?'Оценить историю ещё раз':'Раскрыть следующую грань','primary fc-next',()=>{if(!state.opened[i]){peelers[0].open();return;}if(i===2)state.phase='last';else state.detail++;render(true);});button('Назад','secondary fc-back',()=>{if(i===0)state.phase='first';else state.detail--;render(true);});peelers.push(new PeelSticker($('.fc-detail'),{opened,onProgress:progress=>previewPaper(i,progress),onOpen:()=>{state.opened[i]=true;render();revealMagic();announce('Деталь '+(i+1)+'. '+d.text);$('.fc-next').focus({preventScroll:true});}}));
}else{onComplete?.(story.id);stage.innerHTML=`<div class="fc-stage-heading"><h2 id="fc-stage-title">Как поменялось твоё мнение</h2></div><div class="fc-result-grid"><div class="fc-result-cell"><p>Сначала</p><div class="fc-result-sticker" role="img" aria-label="Сначала: ${reactions[state.first]}">${mascot(state.first)}<img class="fc-printed-corner" src="assets/ad331.svg" alt="" width="24" height="20"></div></div><img class="fc-result-arrow" src="assets/b0ece.svg" alt="Изменение реакции"><div class="fc-result-cell"><p>Теперь</p><div class="fc-result-sticker fc-result-after" role="img" aria-label="Теперь: ${reactions[state.last]}">${mascot(state.last,true)}<img class="fc-printed-corner" src="assets/3afd9.svg" alt="" width="23" height="24"></div></div></div>`;button('К следующим кейсам','primary fc-next',onExit);button('Пройти заново','secondary fc-replay',()=>{state=blank();render(true);announce('Кейс начат заново. Выбери первую реакцию.');view.scrollTo({top:0,behavior:'instant'});});}
updatePaper();if(focus&&!reducedMotion.matches)stage.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.22,.7,.2,1)'});if(focus){const h=$('#fc-stage-title');h.tabIndex=-1;h.focus({preventScroll:true});}}
function updatePaper(){$('.fc-rule').src=state.phase==='detail'&&state.detail===0?'assets/e59a7.svg':'assets/48eaa.svg';const amount=state.phase==='first'?0:state.phase==='detail'?state.detail+(state.opened[state.detail]?1:0):4;['right','bottom','left','top'].forEach((side,i)=>{const face=$('.fc-face-'+side);face.style.removeProperty('transition');face.style.removeProperty('transform');face.style.removeProperty('opacity');face.classList.toggle('is-open',i<amount);});$('.fc-photo-shade').style.opacity=amount===4?'0':'1';$('.fc-paper').classList.toggle('fc-revealed',amount===4);$('.fc-paper').setAttribute('aria-label',amount===4?'Раскрытая фотография: '+story.title:`Бумажная композиция: открыто ${amount} из четырёх граней`);}
function previewPaper(index,progress){if(!host||state.phase!=='detail'||state.opened[index])return;const side=['right','bottom','left'][index],face=$('.fc-face-'+side),angle=(index===0?1:-1)*110*progress;face.style.transition='none';face.style.transform=`${index===1?'rotateX':'rotateY'}(${angle}deg)`;face.style.opacity=String(1-progress);}
function revealMagic(){if(reducedMotion.matches)return;typeDetail($('.fc-detail .fc-sticker-under p'));}
function typeDetail(element){if(!element)return;cancelAnimationFrame(typingFrame);const full=element.textContent,characters=Array.from(full),reserve=document.createElement('span'),output=document.createElement('span'),accessible=document.createElement('span');reserve.className='fc-type-reserve';reserve.setAttribute('aria-hidden','true');reserve.textContent=full;output.className='fc-type-output';output.setAttribute('aria-hidden','true');accessible.className='fc-type-accessible';accessible.textContent=full;element.replaceChildren(reserve,output,accessible);element.classList.add('fc-is-typing');const started=performance.now(),duration=clamp(characters.length*15,650,1900);function frame(now){if(!element.isConnected)return;const count=Math.min(characters.length,Math.floor((now-started)/duration*characters.length));output.textContent=characters.slice(0,count).join('');if(count<characters.length)typingFrame=requestAnimationFrame(frame);else{element.textContent=full;element.classList.remove('fc-is-typing');typingFrame=0;}}typingFrame=requestAnimationFrame(frame);}
function clipPolygon(poly, normal, midpoint, positive) {
  const result = [], distance = point => (point.x - midpoint.x) * normal.x + (point.y - midpoint.y) * normal.y;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], da = distance(a), db = distance(b);
    const insideA = positive ? da >= 0 : da <= 0, insideB = positive ? db >= 0 : db <= 0;
    if (insideA) result.push(a);
    if (insideA !== insideB) { const t = da / (da - db); result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
  }
  return result;
}
function polygonArea(poly) {
  return Math.abs(poly.reduce((sum, p, i) => { const q = poly[(i + 1) % poly.length]; return sum + p.x * q.y - q.x * p.y; }, 0)) / 2;
}
class PeelSticker {
  constructor(element, options = {}) {
    this.el = element; this.options = options; this.button = $('.fc-sticker-button', element); this.front = $('.fc-sticker-front', element);
    this.width = element.clientWidth; this.height = element.clientHeight; this.point = { x: this.width, y: this.height };
    this.opened = !!options.opened; this.disposed = false; this.busy = false; this.progress = 0; this.abort = new AbortController();
    const id = 'fold-' + (++peelSequence);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'fc-sticker-fold'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('viewBox', '0 0 ' + this.width + ' ' + this.height);
    svg.innerHTML = '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse"><stop stop-color="#575757"/><stop offset=".1" stop-color="#929292"/><stop offset=".24" stop-color="#dedede"/><stop offset=".35" stop-color="#ababab"/><stop offset=".58" stop-color="#777777"/><stop offset=".86" stop-color="#666666"/><stop offset="1" stop-color="#5b5b5b"/></linearGradient></defs><path fill="url(#' + id + ')"/>';
    element.append(svg); this.svg = svg; this.fold = $('path', svg); this.gradient = $('linearGradient', svg);
    const listen = (event, fn) => this.button.addEventListener(event, fn, { signal: this.abort.signal });
    listen('pointerdown', event => this.down(event)); listen('pointermove', event => this.move(event));
    listen('pointerup', event => this.up(event)); listen('pointercancel', () => this.cancel());
    listen('lostpointercapture', () => { if (this.drag) this.cancel(); });
    listen('click', event => { event.preventDefault(); if (performance.now() < (this.ignoreClickUntil || 0)) return; this.open(); });
    listen('pointermove', event => { if (this.drag || this.busy || this.opened || event.pointerType === 'touch' || this.options.canInteract?.()===false) return; const r = this.el.getBoundingClientRect(); const near = event.clientX > r.right - 65 && event.clientY > r.bottom - 65; if (near !== this.hover) { this.hover = near; this.animate(near ? { x: this.width - 30, y: this.height - 30 } : { x: this.width, y: this.height }, 180); } });
    listen('pointerleave', () => { if (!this.drag && !this.busy && !this.opened) { this.hover = false; this.animate({ x: this.width, y: this.height }, 220); } });
    this.resizeObserver = new ResizeObserver(() => { if (this.drag) this.cancel(); this.width = element.clientWidth; this.height = element.clientHeight; svg.setAttribute('viewBox', '0 0 ' + this.width + ' ' + this.height); if (!this.busy && !this.opened) this.draw({ x: this.width, y: this.height }); });
    this.resizeObserver.observe(element);
    if (this.opened) this.button.tabIndex = -1;
  }
  draw(point) {
    if (this.disposed) return;
    this.point = point;
    const width = this.width, height = this.height, dx = width - point.x, dy = height - point.y, length = Math.hypot(dx, dy);
    if (length < .1) { this.front.style.clipPath = ''; this.fold.setAttribute('d', ''); this.el.classList.remove('is-folding'); this.svg.style.opacity='1'; this.progress = 0; this.options.onProgress?.(0); return; }
    this.el.classList.add('is-folding');
    const n = { x: dx / length, y: dy / length }, m = { x: (width + point.x) / 2, y: (height + point.y) / 2 };
    const rect = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }];
    const front = clipPolygon(rect, n, m, false), peeled = clipPolygon(rect, n, m, true);
    const fold = peeled.map(p => { const d = (p.x - m.x) * n.x + (p.y - m.y) * n.y; return { x: p.x - 2 * n.x * d, y: p.y - 2 * n.y * d }; });
    this.front.style.clipPath = front.length ? 'polygon(' + front.map(p => p.x.toFixed(2) + 'px ' + p.y.toFixed(2) + 'px').join(',') + ')' : 'polygon(0 0,0 0,0 0)';
    const area=clamp(polygonArea(peeled)/(width*height),0,1),curl=Math.sin(Math.PI*area)*clamp(length*.065,0,24);let rolled=fold.length?'M'+fold[0].x.toFixed(2)+','+fold[0].y.toFixed(2):'';for(let i=0;i<fold.length;i++){const a=fold[i],b=fold[(i+1)%fold.length],depth=Math.max(0,-(a.x-m.x)*n.x-(a.y-m.y)*n.y)+Math.max(0,-(b.x-m.x)*n.x-(b.y-m.y)*n.y),bend=curl*clamp(depth/Math.max(1,length*.4),0,1);rolled+='Q'+((a.x+b.x)/2-n.x*bend).toFixed(2)+','+((a.y+b.y)/2-n.y*bend).toFixed(2)+' '+b.x.toFixed(2)+','+b.y.toFixed(2);}this.fold.setAttribute('d',rolled?rolled+'Z':'');this.svg.style.opacity=String(1-clamp((area-.88)/.12,0,1));
    const span = clamp(length * .4, 18, 110);
    this.gradient.setAttribute('x1', m.x); this.gradient.setAttribute('y1', m.y); this.gradient.setAttribute('x2', m.x - n.x * span); this.gradient.setAttribute('y2', m.y - n.y * span);
    this.progress = clamp(polygonArea(peeled) / (width * height), 0, 1); this.options.onProgress?.(this.progress);
  }
  animate(to, duration, done) {
    cancelAnimationFrame(this.animation);
    const from = { ...this.point }, start = performance.now();
    if (reducedMotion.matches) { this.draw(to); done?.(); return; }
    const frame = now => {
      if (this.disposed) return;
      const progress = clamp((now - start) / duration, 0, 1), eased = this.busy?progress*progress*progress*(progress*(progress*6-15)+10):1-Math.pow(1-progress,3),arc=this.busy?Math.sin(Math.PI*eased)*Math.min(this.height*.08,14):0;
      this.draw({ x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased + arc });
      if (progress < 1) this.animation = requestAnimationFrame(frame); else done?.();
    };
    this.animation = requestAnimationFrame(frame);
  }
  down(event) {
    if (this.opened || this.busy || event.button !== 0 || this.options.canInteract?.()===false) return;
    if (event.pointerType === 'touch' && !this.options.selection && !event.target.closest('.fc-peel-handle')) return;
    this.options.onStart?.();
    event.preventDefault(); cancelAnimationFrame(this.animation);
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, point: { ...this.point } };
    this.button.setPointerCapture(event.pointerId); this.el.classList.add('dragging');
  }
  move(event) {
    if (!this.drag || event.pointerId !== this.drag.id) return;
    const rect = this.el.getBoundingClientRect();
    this.dragTarget = { x: clamp(this.drag.point.x + (event.clientX - this.drag.x) * this.width / rect.width, -2 * this.width, this.width), y: clamp(this.drag.point.y + (event.clientY - this.drag.y) * this.height / rect.height, -2 * this.height, this.height) };
    if (this.dragFrame) return;
    let last = performance.now();
    const follow = now => {
      if (!this.drag || this.disposed) { this.dragFrame=0; return; }
      const mix = 1-Math.exp(-Math.min(now-last,40)/38); last=now;
      this.draw({x:this.point.x+(this.dragTarget.x-this.point.x)*mix,y:this.point.y+(this.dragTarget.y-this.point.y)*mix});
      this.dragFrame=requestAnimationFrame(follow);
    };
    this.dragFrame=requestAnimationFrame(follow);
  }
  release() {
    cancelAnimationFrame(this.dragFrame); this.dragFrame=0; this.dragTarget=null; const drag = this.drag; this.drag = null; this.el.classList.remove('dragging');
    if (drag && this.button.hasPointerCapture(drag.id)) this.button.releasePointerCapture(drag.id);
    return drag;
  }
  up(event) {
    if (!this.drag || event.pointerId !== this.drag.id) return;
    if(this.dragTarget)this.draw(this.dragTarget);
    const drag = this.release(), distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y);
    this.ignoreClickUntil = performance.now() + 100;
    if (distance < 6 || this.progress > .23) this.open(); else this.animate({ x: this.width, y: this.height }, 360,()=>this.options.onCancel?.());
  }
  cancel() {
    if (!this.drag) return; this.release(); this.animate({ x: this.width, y: this.height }, 320,()=>this.options.onCancel?.());
  }
  open() {
    if (this.disposed || this.opened || this.busy || this.options.canInteract?.()===false) return;
    this.options.onStart?.();this.release(); this.busy = true; this.button.setAttribute('aria-busy', 'true');
    this.animate({ x: -this.width, y: -this.height }, this.options.selection?820:1000, () => {
      this.options.onOpen?.(); this.busy = false; this.button.removeAttribute('aria-busy');
      if (this.options.selection) { this.draw({ x: this.width, y: this.height });this.opened=true;this.button.disabled=true; }
      else { this.opened = true; this.el.classList.add('is-open'); this.el.classList.remove('is-folding'); this.button.setAttribute('aria-expanded', 'true'); this.button.tabIndex = -1; }
    });
  }
  destroy() { this.disposed = true; cancelAnimationFrame(this.animation); this.abort.abort(); this.resizeObserver.disconnect(); this.release(); }
}


window.ProjectCase={mount,destroy};
})();
