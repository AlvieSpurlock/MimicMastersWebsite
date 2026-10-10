/* dropdown behaviour, social links from config, coverage list */
(()=>{
const dds=[...document.querySelectorAll('.top details')];
dds.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)dds.forEach(o=>{if(o!==d)o.open=false})}));
document.addEventListener('click',e=>{if(!e.target.closest('.top details'))dds.forEach(o=>o.open=false)});
const L=(window.SITE||{}).links||{};if(!L.youtubeBusiness&&L.youtube)L.youtubeBusiness=L.youtube;
document.querySelectorAll('[data-social]').forEach(a=>{const u=L[a.dataset.social];
 if(/^https?:\/\//i.test(u||'')){a.href=u;a.target='_blank';a.rel='noopener noreferrer'}
 else{a.classList.add('soon');a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.title='Link coming soon'}});
const cv=document.getElementById('coverage');
if(cv)fetch('data/coverage.json?'+Date.now()).then(r=>r.json()).then(items=>{
 cv.replaceChildren();
 if(!Array.isArray(items)||!items.length){const p=document.createElement('p');p.textContent='Coverage is coming soon. Check back for press, reviews, interviews and videos about Mimic Masters.';cv.append(p);return}
 const h=document.createElement('h2');h.textContent='In The Spotlight';cv.append(h);
 const box=document.createElement('div');box.className='cov';
 items.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).forEach(i=>{
  const a=document.createElement('article'),t=document.createElement('h3'),m=document.createElement('p');
  const u=/^https?:\/\//i.test(i.url||'')?i.url:'';
  if(u){const l=document.createElement('a');l.href=u;l.target='_blank';l.rel='noopener noreferrer';l.textContent=i.title||'Untitled';t.append(l)}else t.textContent=i.title||'Untitled';
  m.className='meta';m.textContent=[i.outlet,i.type,i.date].filter(Boolean).join(' · ');a.append(t,m);
  if(i.summary){const s=document.createElement('p');s.textContent=i.summary;a.append(s)}box.append(a)});
 cv.append(box)}).catch(()=>{cv.textContent='Coverage could not be loaded right now.'});
})();
