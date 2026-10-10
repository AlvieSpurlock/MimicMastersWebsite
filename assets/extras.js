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
if(pv&&pp)fetch('data/coverage.json?'+Date.now()).then(r=>r.json()).then(items=>{
 const fill=(sec,list,empty)=>{const box=sec.querySelector('[data-list]');box.replaceChildren();
  if(!list.length){const p=document.createElement('p');p.textContent=empty;box.append(p);return}
  list.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).forEach(i=>{
   const a=document.createElement('article'),t=document.createElement('h3'),m=document.createElement('p');
   const u=/^https?:\/\//i.test(i.url||'')?i.url:'';
   if(u){const l=document.createElement('a');l.href=u;l.target='_blank';l.rel='noopener noreferrer';l.textContent=i.title||'Untitled';t.append(l)}else t.textContent=i.title||'Untitled';
   m.className='meta';m.textContent=[i.outlet,i.type,i.date].filter(Boolean).join(' \u00b7 ');a.append(t,m);
   if(i.summary){const s=document.createElement('p');s.textContent=i.summary;a.append(s)}box.append(a)})};
 const all=Array.isArray(items)?items:[],isV=i=>/video/i.test(i.type||'');
 fill(pv,all.filter(isV),'No videos yet. Check back soon.');fill(pp,all.filter(i=>!isV(i)),'No press yet. Check back soon.')
}).catch(()=>{[pv,pp].forEach(x=>x.querySelector('[data-list]').textContent='Could not be loaded right now.')});
})();
