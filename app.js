// Keep short Russian prepositions/conjunctions with the following word at any width.
function bindShortWords(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement.closest('script,style,svg,textarea,code,pre')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
 const shortWord=/(?<![А-Яа-яЁёA-Za-z0-9])(в|во|на|с|со|к|ко|у|о|об|обо|от|до|из|изо|за|по|под|подо|над|надо|при|для|без|безо|про|через|перед|передо|между|и|а|но|или|не|ни)[ \t]+(?=\S|$)/giu;
 while(walker.nextNode()){const node=walker.currentNode;node.textContent=node.textContent.replace(shortWord,'$1\u00a0')}
}
const zones=[
 {name:'В центре игры',type:'PC / ИГРОВЫЕ МЕСТА',description:'Игровые станции и неоновый свет. Пространство, в котором всё внимание — на игре.',images:['live-gaming-wide','live-gaming-player','live-gaming-side','live-pc-detail','live-gamer-portrait','live-player-neon'],specs:['Видеокарта','Процессор','Оперативная память','Монитор / Гц']},
 {name:'Своя компания',type:'PC / КОМНАТА',description:'Игровые места и мягкая зона в одном пространстве. Чтобы быть в игре и оставаться вместе.',render:true,images:['50','52','54'],specs:['Видеокарта','Процессор','Оперативная память','Монитор / Гц']},
 {name:'На своей волне',type:'КОНСОЛЬ / ОТДЫХ',description:'Большой экран, диван и любимая компания. Другой ритм твоего игрового вечера.',images:['live-console-company','live-console-sofa','live-console-controller','live-console-game','live-company-evening'],specs:['Консоль','Экран','Количество мест']},
 {name:'Между раундами',type:'LOUNGE / ОБЩЕНИЕ',description:'Мягкие диваны, приглушённый свет и время для разговора. Продолжение вечера за пределами игры.',images:['live-lounge-sofa','live-lounge-wide','live-lounge-evening','live-lounge-friends','live-atmosphere','live-entrance'],specs:['Вместимость','Условия посещения']}
];
const track=document.querySelector('#zone-track');
zones.forEach((z,i)=>{const b=document.createElement('button');b.className='zone-card';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label',`${z.name}: фото и характеристики`);b.innerHTML=`<div class="zone-image"><img src="assets/${z.images[0]}.webp" alt="${z.render?'Визуализация':'Фото клуба'}: ${z.name}" loading="lazy"><span class="open-icon" aria-hidden="true">↗</span></div><span class="zone-category">${z.type}${z.render?' · ВИЗУАЛИЗАЦИЯ':''}</span><h3>${z.name.toUpperCase()}</h3><p>${z.description}</p><div class="card-bottom"><span>Фото и ${i===3?'детали':'характеристики'}</span><b aria-hidden="true">↗</b></div>`;b.addEventListener('click',()=>openZone(i,b));track.append(b)});
let activeZone=0,activePhoto=0,lastTrigger=null;
const dialog=document.querySelector('#zone-dialog');
function showPhoto(index){const z=zones[activeZone];activePhoto=(index+z.images.length)%z.images.length;const im=document.querySelector('#dialog-image');fadePhoto(im,`assets/${z.images[activePhoto]}.webp`,`${z.name} — ${z.render?'визуализация':'фото клуба'}, ракурс ${activePhoto+1}`);document.querySelector('#photo-count').textContent=`0${activePhoto+1} / 0${z.images.length}`;document.querySelectorAll('#thumbnails button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===activePhoto)))}
function openZone(index,trigger){activeZone=index;lastTrigger=trigger;const z=zones[index];document.querySelector('#dialog-title').textContent=z.name.toUpperCase();document.querySelector('#dialog-type').textContent=z.type+(z.render?' / ВИЗУАЛИЗАЦИЯ':'');document.querySelector('#dialog-description').textContent=z.description;document.querySelector('#specs').replaceChildren();z.specs.forEach(s=>{const row=document.createElement('div');const dt=document.createElement('dt');dt.textContent=s;const dd=document.createElement('dd');dd.textContent='Скоро объявим';row.append(dt,dd);document.querySelector('#specs').append(row)});document.querySelector('#thumbnails').replaceChildren();z.images.forEach((n,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`Показать ракурс ${i+1}`);b.innerHTML=`<img src="assets/${n}.webp" alt="" loading="lazy">`;b.addEventListener('click',()=>showPhoto(i));document.querySelector('#thumbnails').append(b)});showPhoto(0);bindShortWords(dialog);dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0}
document.querySelector('#photo-prev').addEventListener('click',()=>showPhoto(activePhoto-1));document.querySelector('#photo-next').addEventListener('click',()=>showPhoto(activePhoto+1));
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(activePhoto-1)}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(activePhoto+1)}});
let touchX=null;document.querySelector('#dialog-image').addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});document.querySelector('#dialog-image').addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)showPhoto(activePhoto+(dx<0?1:-1));touchX=null},{passive:true});
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.dialog-close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(d===dialog)lastTrigger?.focus({preventScroll:true})})});
document.querySelector('#dialog-cta').addEventListener('click',()=>dialog.close());
function cardStep(){return track.querySelector('.zone-card').getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap)}
function updateTrack(){const index=Math.min(3,Math.max(0,Math.round(track.scrollLeft/cardStep())));document.querySelector('#zone-position').textContent=`0${index+1} / 04`;document.querySelector('#zone-prev').disabled=track.scrollLeft<3;document.querySelector('#zone-next').disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-4}
document.querySelector('#zone-prev').addEventListener('click',()=>track.scrollBy({left:-cardStep(),behavior:'smooth'}));document.querySelector('#zone-next').addEventListener('click',()=>track.scrollBy({left:cardStep(),behavior:'smooth'}));track.addEventListener('scroll',updateTrack,{passive:true});window.addEventListener('resize',updateTrack);updateTrack();
const menu=document.querySelector('.menu-button'),nav=document.querySelector('#navigation');menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(expanded));menu.setAttribute('aria-label',expanded?'Закрыть меню':'Открыть меню');menu.textContent=expanded?'×':'☰';nav.classList.toggle('open',expanded)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';menu.setAttribute('aria-label','Открыть меню')}));
document.querySelector('#project-info').addEventListener('click',()=>{document.querySelector('#info-dialog').showModal();document.body.classList.add('modal-open')});
const phone=document.querySelector('#guest-phone');phone.addEventListener('input',()=>phone.setCustomValidity(''));document.querySelector('#opening-form').addEventListener('submit',e=>{e.preventDefault();const digits=phone.value.replace(/\D/g,'');if(!/^([78]\d{10}|9\d{9})$/.test(digits)){phone.setCustomValidity('Укажи российский номер телефона: +7 и 10 цифр.');phone.reportValidity();return}const status=document.querySelector('#form-status');status.textContent='Всё заполнено верно. Это демонстрация: заявка не отправлена. Запись откроется после объявления даты.';bindShortWords(status);status.focus()});
const sticky=document.querySelector('.mobile-cta');new IntersectionObserver(entries=>{sticky.classList.toggle('hidden',entries[0].isIntersecting)},{threshold:.15}).observe(document.querySelector('#opening'));

// Reveal the header on upward movement; ignore small scroll jitter.
const pageHeader=document.querySelector('.header');
let headerLastY=Math.max(0,window.scrollY),headerDirection=0,headerDistance=0;
function revealHeader(){pageHeader.classList.remove('header-hidden');headerDistance=0}
function updateHeaderOnScroll(){
 const y=Math.max(0,window.scrollY),delta=y-headerLastY;
 headerLastY=y;
 if(document.body.classList.contains('modal-open')){headerDistance=0;return}
 if(y<=pageHeader.offsetHeight||menu.getAttribute('aria-expanded')==='true'||pageHeader.contains(document.activeElement)&&document.activeElement.matches(':focus-visible')){revealHeader();headerDirection=0;return}
 if(Math.abs(delta)<1)return;
 const direction=delta>0?1:-1;
 if(direction!==headerDirection){headerDistance=0;headerDirection=direction}
 headerDistance+=Math.abs(delta);
 if(headerDistance>=12){pageHeader.classList.toggle('header-hidden',direction===1);headerDistance=0}
}
window.addEventListener('scroll',updateHeaderOnScroll,{passive:true});
pageHeader.addEventListener('focusin',revealHeader);
menu.addEventListener('click',revealHeader);
window.addEventListener('pageshow',()=>{headerLastY=Math.max(0,window.scrollY);revealHeader()});

// Pointer-driven depth and magnetic controls, only with a precise pointer.
const motionPointer=matchMedia('(hover: hover) and (pointer: fine)');
const motionReduced=matchMedia('(prefers-reduced-motion: reduce)');
const motionTargets=document.querySelectorAll('.zone-card,.service-card,.button,.round');
function resetMotion(el){['--mx','--my','--rx','--ry','--px','--py'].forEach(p=>el.style.removeProperty(p));el.classList.remove('pointer-live')}
motionTargets.forEach(el=>{
 el.addEventListener('pointermove',e=>{
  if(!motionPointer.matches||motionReduced.matches||el.disabled)return;
  const r=el.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
  el.style.setProperty('--px',`${x*100}%`);el.style.setProperty('--py',`${y*100}%`);
  el.style.setProperty('--rx',`${(0.5-y)*9}deg`);el.style.setProperty('--ry',`${(x-0.5)*9}deg`);
  el.style.setProperty('--mx',`${(x-0.5)*10}px`);el.style.setProperty('--my',`${(y-0.5)*8}px`);el.classList.add('pointer-live');
 },{passive:true});
 el.addEventListener('pointerleave',()=>resetMotion(el));
 el.addEventListener('pointercancel',()=>resetMotion(el));
});
function resetAllMotion(){motionTargets.forEach(resetMotion)}
motionReduced.addEventListener('change',resetAllMotion);motionPointer.addEventListener('change',resetAllMotion);window.addEventListener('blur',resetAllMotion);

bindShortWords(document.body);

// Reveal content as it enters the viewport; keep it readable without JS/motion.
const revealNodes=[...document.querySelectorAll('.intro .section-label,.intro h2,.intro-copy,.service-heading,.service-card,.section-top>div,.zone-card,.space-note,.kitchen-photo,.kitchen-copy>*,.lounge-content>*,.opening-copy>*,.form-panel,.contacts>div')].filter(el=>!el.matches('h2'));
let revealObserver;
function setupScrollMotion(){
 revealObserver?.disconnect();
 if(motionReduced.matches){revealNodes.forEach(el=>el.classList.remove('motion-reveal'));return}
 revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}})},{threshold:.08,rootMargin:'0px 0px -25px 0px'});
 revealNodes.forEach(el=>{el.classList.add('motion-reveal');if(el.matches('.service-card,.zone-card'))el.style.setProperty('--reveal-delay',`${Math.min([...el.parentElement.children].indexOf(el),2)*100}ms`);revealObserver.observe(el)});
}
setupScrollMotion();motionReduced.addEventListener('change',setupScrollMotion);
const loungeSection=document.querySelector('.lounge');let driftPending=false;
function updateScrollDrift(){driftPending=false;if(motionReduced.matches)return;const r=loungeSection.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const progress=(innerHeight-r.top)/(innerHeight+r.height);loungeSection.style.setProperty('--scroll-drift',`${(progress-.5)*65}px`)}}
window.addEventListener('scroll',()=>{if(!driftPending){driftPending=true;requestAnimationFrame(updateScrollDrift)}},{passive:true});updateScrollDrift();

// Repeat only the heading glitch while visible; entrances remain scroll-triggered.
const loopHeadings=document.querySelectorAll('main h1,main h2,main h3');
const headingObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.classList.toggle('heading-loop-active',isIntersecting)),{threshold:.1});
loopHeadings.forEach(el=>{el.classList.add('heading-loop');headingObserver.observe(el)});

// A second beat for typography after the surrounding surface arrives.
const textStages=document.querySelectorAll('.intro,.service-heading,.service-card,.section-top>div:first-child,.zone-card,.kitchen-copy,.lounge-content,.opening-copy,.form-panel,.contacts>div');
const textStageObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('text-stage-ready');textStageObserver.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -25px 0px'});
textStages.forEach((stage,i)=>{
 const title=stage.querySelector('h2,h3');if(!title)return;
 stage.classList.add('text-stage');
 title.classList.add('staged-title');title.dataset.entrance=['left','up','right'][i%3];
 const copy=stage.querySelector('p');if(copy)copy.classList.add('staged-copy');
 textStageObserver.observe(stage);
});

const foodTrack=document.querySelector('#food-track');
const foodPrev=document.querySelector('#food-prev'),foodNext=document.querySelector('#food-next');
let activeFood=0,foodSwipeStart=null;
const foodSlides=[...foodTrack.children];
foodTrack.classList.add('food-enhanced');
// Preload only the current dish and the next two as the gallery advances.
function foodIndex(){return activeFood}
function updateFoodGallery(){
 for(let offset=0;offset<3;offset++)foodSlides[(activeFood+offset)%foodSlides.length].querySelector('img').loading='eager';
 foodSlides.forEach((slide,i)=>{slide.classList.toggle('food-active',i===activeFood);slide.setAttribute('aria-hidden',String(i!==activeFood))});
 document.querySelector('#food-count').textContent=`${String(activeFood+1).padStart(2,'0')} / ${String(foodSlides.length).padStart(2,'0')}`;
 foodPrev.disabled=foodNext.disabled=foodSlides.length<2;
}
function stepFood(step){activeFood=(activeFood+step+foodSlides.length)%foodSlides.length;updateFoodGallery()}
foodPrev.addEventListener('click',()=>stepFood(-1));foodNext.addEventListener('click',()=>stepFood(1));
foodTrack.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stepFood(e.key==='ArrowRight'?1:-1)}});
foodTrack.addEventListener('touchstart',e=>{foodSwipeStart=e.changedTouches[0].clientX},{passive:true});
foodTrack.addEventListener('touchend',e=>{if(foodSwipeStart===null)return;const dx=e.changedTouches[0].clientX-foodSwipeStart;if(Math.abs(dx)>40)stepFood(dx<0?1:-1);foodSwipeStart=null},{passive:true});
foodTrack.addEventListener('touchcancel',()=>{foodSwipeStart=null},{passive:true});
updateFoodGallery();

// Advance every three seconds only while the food photo is in view.
const foodGallery=document.querySelector('.food-gallery');
let foodVisible=false,foodAutoTimer=null,foodTouching=false;
function stopFoodAuto(){clearTimeout(foodAutoTimer);foodAutoTimer=null}
function scheduleFoodAuto(){
 stopFoodAuto();
 if(!foodVisible||document.hidden||motionReduced.matches||foodTouching)return;
 foodAutoTimer=setTimeout(()=>{
  stepFood(1);
  scheduleFoodAuto();
 },3000);
}
new IntersectionObserver(([entry])=>{foodVisible=entry.isIntersecting;scheduleFoodAuto()},{threshold:.35}).observe(foodGallery);
document.addEventListener('visibilitychange',scheduleFoodAuto);
motionReduced.addEventListener('change',scheduleFoodAuto);
foodGallery.addEventListener('pointerdown',()=>{foodTouching=true;stopFoodAuto()},{passive:true});
window.addEventListener('pointerup',()=>{if(foodTouching){foodTouching=false;scheduleFoodAuto()}},{passive:true});
window.addEventListener('pointercancel',()=>{if(foodTouching){foodTouching=false;scheduleFoodAuto()}},{passive:true});
foodGallery.addEventListener('keydown',scheduleFoodAuto);

// Shared photo dissolve for cards, lounge and the open gallery.
const photoSwapTickets=new WeakMap();
async function fadePhoto(im,src,alt){
 const ticket={};photoSwapTickets.set(im,ticket);
 const incoming=new Image();incoming.src=src;
 try{await incoming.decode()}catch{return}
 if(photoSwapTickets.get(im)!==ticket)return;
 if(im.getAttribute('src')===src){im.alt=alt;return}
 const old=im.cloneNode();old.removeAttribute('id');old.alt='';old.setAttribute('aria-hidden','true');old.classList.add('photo-ghost');
 const style=getComputedStyle(im);old.style.objectFit=style.objectFit;old.style.objectPosition=style.objectPosition;
 im.parentElement.querySelectorAll('.photo-ghost').forEach(el=>el.remove());
 if(!motionReduced.matches)im.parentElement.append(old);
 im.src=src;im.alt=alt;
 requestAnimationFrame(()=>requestAnimationFrame(()=>old.classList.add('photo-ghost-out')));
 setTimeout(()=>old.remove(),900);
}
function visiblePhotoAuto(target,advance,allowed=()=>true){
 let visible=false,timer=null;
 function stop(){clearTimeout(timer);timer=null}
 function schedule(){stop();if(!visible||document.hidden||motionReduced.matches||!allowed())return;timer=setTimeout(()=>{if(allowed())advance();schedule()},3000)}
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule()},{threshold:.15}).observe(target);
 document.addEventListener('visibilitychange',schedule);motionReduced.addEventListener('change',schedule);
 target.addEventListener('pointerdown',stop,{passive:true});target.addEventListener('pointerup',schedule,{passive:true});target.addEventListener('pointercancel',schedule,{passive:true});target.addEventListener('keydown',schedule);
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',schedule));
 return schedule;
}
document.querySelectorAll('.zone-card').forEach((card,i)=>{
 let photo=0;const z=zones[i],im=card.querySelector('.zone-image>img');
 visiblePhotoAuto(card,()=>{photo=(photo+1)%z.images.length;fadePhoto(im,`assets/${z.images[photo]}.webp`,`${z.render?'Визуализация':'Фото клуба'}: ${z.name}, ракурс ${photo+1}`)},()=>!document.body.classList.contains('modal-open'));
});
const loungeFrames=['live-lounge-sofa','live-lounge-wide','live-lounge-evening','live-lounge-friends','live-atmosphere','live-company-evening'];let loungePhoto=0;
visiblePhotoAuto(loungeSection,()=>{loungePhoto=(loungePhoto+1)%loungeFrames.length;fadePhoto(loungeSection.querySelector(':scope>img:not(.photo-ghost)'),`assets/${loungeFrames[loungePhoto]}.webp`,'Лаунж ROKU в Воронеже')},()=>!document.body.classList.contains('modal-open'));
const dialogImage=document.querySelector('#dialog-image');const dialogImageStage=document.createElement('div');dialogImageStage.className='dialog-image-stage';dialogImage.before(dialogImageStage);dialogImageStage.append(dialogImage);
const restartDialogAuto=visiblePhotoAuto(dialogImageStage,()=>showPhoto(activePhoto+1),()=>dialog.open);
dialog.addEventListener('click',restartDialogAuto);dialog.addEventListener('keydown',restartDialogAuto);
