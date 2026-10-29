/* dropdown behaviour, social links from config, coverage list */
(()=>{
const dds=[...document.querySelectorAll('.top details')];
dds.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)dds.forEach(o=>{if(o!==d)o.open=false})}));
document.addEventListener('click',e=>{if(!e.target.closest('.top details'))dds.forEach(o=>o.open=false)});
const L=(window.SITE||{}).links||{};if(!L.youtubeBusiness&&L.youtube)L.youtubeBusiness=L.youtube;
document.querySelectorAll('[data-social]').forEach(a=>{const u=L[a.dataset.social];
 if(/^https?:\/\//i.test(u||'')){a.href=u;a.target='_blank';a.rel='noopener noreferrer'}
 else{a.classList.add('soon');a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.title='Link coming soon'}});
const pv=document.getElementById('videos'),pp=document.getElementById('press');
if(pv&&pp){
 const csv=t=>{t=t.replace(/^﻿/,'');const out=[];let r=[],f='',q=false;
  for(let i=0;i<t.length;i++){const c=t[i];
   if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
   else if(c=='"')q=true;else if(c==','){r.push(f);f=''}
   else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);f='';out.push(r);r=[]}else f+=c}
  if(f!==''||r.length){r.push(f);out.push(r)}
  const h=(out.shift()||[]).map(x=>x.trim().toLowerCase());
  return out.filter(r=>r.some(x=>x.trim())).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||'').trim()])))};
 const safe=u=>/^https?:\/\//i.test(u||'')?u:'';
 const pick=(r,...k)=>{for(const x of k)if(r[x])return r[x];return''};
 const thumb=(img,link)=>{let m;img=safe(img);
  if(img&&(m=img.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||img.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/)))return'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w600';
  if(img)return img;
  if(m=(link||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/))([\w-]{11})/))return'https://img.youtube.com/vi/'+m[1]+'/hqdefault.jpg';
  return''};
 const sheetId=((window.SITE||{}).pressSheetUrl||'').match(/\/d\/([\w-]+)/);
 const load=async tab=>{if(!sheetId)return[];
  try{const r=await fetch('https://docs.google.com/spreadsheets/d/'+sheetId[1]+'/gviz/tq?tqx=out:csv&sheet='+encodeURIComponent(tab),{cache:'no-store'});
   if(r.ok){const t=await r.text();if(t.trim()&&!/^\s*</.test(t))return csv(t)}}catch(e){}return null};
 const setup=async(sec,tab,empty)=>{
  const box=sec.querySelector('[data-list]'),bar=document.createElement('div');bar.className='sortbar';
  let dir='desc',items=null;
  const mk=(d,txt)=>{const b=document.createElement('button');b.type='button';b.textContent=txt;b.addEventListener('click',()=>{dir=d;draw()});return b};
  const bd=mk('desc','Newest ↓'),ba=mk('asc','Oldest ↑');bar.append(bd,ba);box.before(bar);
  function draw(){bd.setAttribute('aria-pressed',dir==='desc');ba.setAttribute('aria-pressed',dir==='asc');box.replaceChildren();
   if(items===null){box.textContent='Could not be loaded right now.';return}
   if(!items.length){const p=document.createElement('p');p.textContent=empty;box.append(p);return}
   items.slice().sort((x,y)=>dir==='desc'?y.t-x.t:x.t-y.t).forEach(i=>{
    const a=document.createElement(i.link?'a':'div');a.className='pcard';
    if(i.link){a.href=i.link;a.target='_blank';a.rel='noopener noreferrer'}
    if(i.img){const im=document.createElement('img');im.src=i.img;im.alt='';im.loading='lazy';im.referrerPolicy='no-referrer';a.append(im)}
    const body=document.createElement('div'),d=document.createElement('p'),dt=document.createElement('time');
    d.className='pdesc';d.textContent=i.desc;dt.textContent=i.date;body.append(d,dt);a.append(body);box.append(a)})}
  const rows=await load(tab);
  items=rows&&rows.map(r=>{const date=pick(r,'date','post date','postdate','posted'),link=safe(pick(r,'link','url'));
   return{img:thumb(pick(r,'thumbnail','thumb','image'),link),desc:pick(r,'description','text','title'),date,link,t:Date.parse(date)||0}});
  draw()};
 setup(pv,'Videos','No videos yet. Check back soon.');setup(pp,'Press','No press yet. Check back soon.')}
})();
