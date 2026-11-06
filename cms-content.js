/* Public content only. Authentication and writes are handled by Pages CMS/GitHub. */
(function(root){
 'use strict';
 const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function imagePath(value){
  if(typeof value!=='string')return '';
  const path=value.replace(/^\//,'');
  return /^assets\/[\p{L}\p{N}_ .\/-]+\.(webp|png|jpe?g|avif)$/iu.test(path)&&!path.split('/').includes('..')?path:'';
 }
 function zoneData(data){
  if(!Array.isArray(data)||!data.length||data.length>8)return null;
  const out=data.map(z=>{
   if(!z||!['name','type','description'].every(k=>typeof z[k]==='string'&&z[k].length<=3000))return null;
   if(!Array.isArray(z.images)||!z.images.length||z.images.length>12||z.images.some(x=>!imagePath(x)))return null;
   if(!Array.isArray(z.specs)||z.specs.length>20||z.specs.some(x=>!x||typeof x.label!=='string'||typeof x.value!=='string'))return null;
   if(z.priceFrom!==undefined&&typeof z.priceFrom!=='string')return null;
   if(z.tariffs!==undefined&&(!Array.isArray(z.tariffs)||z.tariffs.length>6||z.tariffs.some(g=>!g||typeof g.title!=='string'||!Array.isArray(g.rows)||g.rows.length>30||g.rows.some(row=>!row||typeof row.label!=='string'||typeof row.value!=='string'))))return null;
   return {...z,render:z.render===true,images:z.images.map(imagePath)};
  });
  return out.every(Boolean)?out:null;
 }
 function photoData(data){
  if(!data||!Array.isArray(data.hero)||!data.hero.length||data.hero.length>20||data.hero.some(x=>!imagePath(x)))return null;
  if(!Array.isArray(data.lounge)||!data.lounge.length||data.lounge.length>20||data.lounge.some(x=>!imagePath(x)))return null;
  if(!Array.isArray(data.food)||!data.food.length||data.food.length>30||data.food.some(x=>!x||!imagePath(x.image)||typeof x.alt!=='string'))return null;
  if(data.intro!==undefined&&(!Array.isArray(data.intro)||!data.intro.length||data.intro.length>20||data.intro.some(x=>!imagePath(x))))return null;
  return data;
 }
 function siteData(data){
  if(!data||typeof data!=='object'||Array.isArray(data))return null;
  for(const [key,section] of Object.entries(data)){
   if(!section||typeof section!=='object'||Array.isArray(section))return null;
   for(const [field,value] of Object.entries(section)){
    if(key==='service'&&field==='cards'){
     if(!Array.isArray(value)||value.length!==3||value.some(x=>!x||typeof x.title!=='string'||typeof x.body!=='string'))return null;
    }else if(typeof value!=='string'||value.length>5000)return null;
   }
  }
  // Only known text fields are applied below; no HTML from the CMS is evaluated.
  return data;
 }
 function faqData(data){return Array.isArray(data)&&data.length>0&&data.length<=20&&data.every(x=>x&&typeof x.question==='string'&&x.question.length<=300&&typeof x.answer==='string'&&x.answer.length<=5000)?data:null}
 async function load(fetcher=fetch){
  const validators={site:siteData,zones:zoneData,photos:photoData,faq:faqData};
  const entries=await Promise.all(Object.keys(validators).map(async key=>{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),3000);
   try{const response=await fetcher(`content/${key}.json`,{cache:'no-store',signal:controller.signal});if(!response.ok)return [key,null];return [key,validators[key](await response.json())]}
   catch{return [key,null]}finally{clearTimeout(timeout)}
  }));
  return Object.fromEntries(entries);
 }
 function apply(content){
  const text=(selector,value)=>{if(typeof value!=='string')return;const el=document.querySelector(selector);if(!el)return;const fragment=document.createDocumentFragment();value.split('\n').forEach((line,i)=>{if(i)fragment.append(document.createElement('br'));fragment.append(document.createTextNode(line))});el.replaceChildren(fragment)};
  function title(selector,data,style='em',extra=false){
   if(!data||typeof data!=='object')return;
   const first=typeof data.first==='string'?data.first:'',secondLine=typeof data.second==='string'?data.second:'';
   const el=document.querySelector(selector);if(!el)return;
   el.replaceChildren(document.createTextNode(first),document.createElement('br'));
   if(extra){el.append(document.createTextNode(secondLine?secondLine+' ':''));const accent=document.createElement('em');accent.textContent=typeof data.accent==='string'?data.accent:'';el.append(accent)}
   else{const second=document.createElement(style==='muted'?'span':'em');if(style==='muted')second.className='muted';second.textContent=secondLine;el.append(second)}
  }
  const s=content.site;
  if(s){
   if(typeof s.general?.title==='string')document.title=s.general.title;
   if(typeof s.general?.description==='string')document.querySelector('meta[name="description"]').content=s.general.description;
   text('.header .brand b',s.general?.city);
   if(s.hero){const e=document.querySelector('.eyebrow');if(typeof s.hero.eyebrow==='string'){e.replaceChildren(Object.assign(document.createElement('i'),{}),document.createTextNode(' '+s.hero.eyebrow))}title('.hero h1',s.hero,'em',true);text('.hero-content>p',s.hero.body);if(typeof s.hero.button==='string'){const button=document.querySelector('.hero-actions .button');button.replaceChildren(document.createTextNode(s.hero.button+' '),Object.assign(document.createElement('span'),{textContent:'↗'}))}}
   title('.intro h2',s.intro,'muted');text('.intro .section-label',s.intro?.label);text('.intro-copy p',s.intro?.body);
   title('.service-heading h2',s.service);text('.service-heading .section-label',s.service?.label);
   if(Array.isArray(s.service?.cards))s.service.cards.slice(0,3).forEach((card,i)=>{text(`.service-card:nth-child(${i+1}) h3`,card.title);text(`.service-card:nth-child(${i+1}) p`,card.body)});
   title('.section-top h2',s.space);text('.section-top .section-label',s.space?.label);text('.section-aside>p',s.space?.body);text('.space-note p',s.space?.note);
   title('.kitchen-copy h2',s.kitchen);text('.kitchen-copy .section-label',s.kitchen?.label);text('.kitchen-copy .lead',s.kitchen?.lead);text('.kitchen-copy>p:not(.lead)',s.kitchen?.body);text('.inline-note span',s.kitchen?.noteTitle);text('.inline-note p',s.kitchen?.note);
   title('.lounge h2',s.lounge,'em',true);text('.lounge .section-label',s.lounge?.label);text('.lounge-bottom>p',s.lounge?.body);text('.lounge-bottom>span',s.lounge?.signature);
   title('.opening h2',s.opening);text('.opening-copy .section-label',s.opening?.label);text('.opening-copy .lead',s.opening?.lead);text('.opening-copy>p:not(.lead):not(.small)',s.opening?.body);text('.opening-meta strong',s.opening?.date);text('.opening-copy>.small',s.opening?.note);
   title('.contacts h2',s.contacts,'em',true);text('.contacts .section-label',s.contacts?.label);text('.contact-note p',s.contacts?.body);
   let activeSocials=0;
   ['vk','telegram'].forEach((key,i)=>{
    let url;try{url=new URL(s.general?.[key]);if(url.protocol!=='https:'||!(key==='vk'?['vk.com','www.vk.com']:['t.me','telegram.me']).includes(url.hostname))return}catch{return}
    const old=document.querySelectorAll('.header-socials .social-icon')[i];const a=document.createElement('a');a.className='social-icon';a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',key==='vk'?'ВКонтакте':'Telegram');old.childNodes.forEach(n=>a.append(n.cloneNode(true)));old.replaceWith(a);activeSocials++;
   });
   document.querySelector('.social-soon').hidden=activeSocials>0;
  }
  if(content.faq)renderFaq(content.faq);
  const photos=content.photos;
  if(photos){
   const image=(src,alt)=>{const img=document.createElement('img');img.src=imagePath(src);img.alt=alt;img.decoding='async';return img};
   document.querySelectorAll('.hero-film-group').forEach((group,copy)=>{group.replaceChildren(...photos.hero.map((src,i)=>{const img=image(src,'');if(copy===0&&i===0)img.fetchPriority='high';return img}))});
   document.querySelector('#food-track').replaceChildren(...photos.food.map(item=>{const figure=document.createElement('figure');figure.className='food-slide';const img=image(item.image,item.alt);img.loading='lazy';figure.append(img);return figure}));
   document.querySelector('.lounge>img').src=imagePath(photos.lounge[0]);
   if(photos.intro)document.querySelector('.intro-background>img').src=imagePath(photos.intro[0]);
  }
 }
 function renderFaq(items){
  const list=document.querySelector('#faq-list');if(!list)return;
  list.replaceChildren(...items.map((item,i)=>{const details=document.createElement('details'),summary=document.createElement('summary'),heading=document.createElement('h3'),icon=document.createElement('span'),answer=document.createElement('div'),p=document.createElement('p');details.className='faq-item';details.open=i===0;heading.textContent=item.question;icon.textContent='+';icon.setAttribute('aria-hidden','true');answer.className='faq-answer';p.textContent=item.answer;summary.append(heading,icon);answer.append(p);details.append(summary,answer);return details}));
 }
 const api={load,apply,escapeHTML,imagePath,siteData,zoneData,photoData,faqData};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RokuCMS=api;
})(typeof window!=='undefined'?window:{});
