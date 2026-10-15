/* Store Network + Ethical Indie Dev Coalition lookup. Location is typed by the visitor, used only in this browser, never sent or stored. */
(()=>{
const root=document.getElementById('net');if(!root)return;
const S=window.SITE||{},isStore=root.dataset.mode==='stores';
const ST=Object.fromEntries('AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|DE Delaware|DC District of Columbia|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|IN Indiana|IA Iowa|KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|MA Massachusetts|MI Michigan|MN Minnesota|MS Mississippi|MO Missouri|MT Montana|NE Nebraska|NV Nevada|NH New Hampshire|NJ New Jersey|NM New Mexico|NY New York|NC North Carolina|ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|PA Pennsylvania|RI Rhode Island|SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|VT Vermont|VA Virginia|WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming'.split('|').map(s=>[s.slice(0,2),s.slice(3)]));
const norm=s=>(s||'').trim().toLowerCase(), full=s=>ST[(s||'').trim().toUpperCase()]||(s||'').trim();
const safe=u=>/^https?:\/\//i.test(u||'')?u:'';
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const TABS=isStore?[['retail','Retail'],['restaurant','Restaurant'],['entertainment','Entertainment'],['services','Services']]:[['mystudio','Our Games'],['otherstudio','Other Indie Studios']];
const catKey=r=>norm(isStore?r.category:r.studio).replace(/[\s_-]/g,'');
let rows=[],loc={city:'',state:''},active=TABS[0][0],searched=!isStore,picks={},U=null,note='',exact=null,corner=false;
const abbr=s=>{const t=(s||'').trim();if(!t)return'';const u=t.toUpperCase();if(ST[u])return u;return Object.keys(ST).find(k=>norm(ST[k])===norm(t))||''};
const nkey=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\bst\b\.?/g,'saint').replace(/\bmt\b\.?/g,'mount').replace(/\bft\b\.?/g,'fort').replace(/[^a-z0-9]+/g,' ').trim();
const rad=x=>x*Math.PI/180,miles=(a,b)=>{const h=Math.sin(rad(b[1]-a[1])/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(rad(b[2]-a[2])/2)**2;return 3958.8*2*Math.asin(Math.sqrt(h))};
let IDX=null,BYNAME=null;
/* A store's spot: exact Latitude/Longitude columns if the Sheet has them, otherwise the middle of its city. */
const fromLink=u=>{u=String(u||'');let m=u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)||u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)||u.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i);
 return m?[parseFloat(m[1]),parseFloat(m[2])]:null};
const rowC=r=>{let la=parseFloat(r.latitude||r.lat),lo=parseFloat(r.longitude||r.lng||r.lon);   /* 1) Latitude/Longitude columns  2) coordinates inside a full Google Maps link  3) middle of the city */
 if(!(isFinite(la)&&isFinite(lo))){const f=fromLink(r.googlemapslink);if(f)[la,lo]=f}
 if(isFinite(la)&&isFinite(lo)&&Math.abs(la)<=90&&Math.abs(lo)<=180)return['store',la,lo];const x=coordsFor(r.city,r.state);return x?x.c:null};
async function loadCities(){if(IDX)return;IDX=new Map();BYNAME=new Map();
 try{const r=await fetch('data/cities-us.json');if(r.ok){const d=await r.json();for(const st in d)for(const c of d[st]){const k=nkey(c[0]);IDX.set(k+'|'+st,c);if(!BYNAME.has(k))BYNAME.set(k,[]);BYNAME.get(k).push([st,c])}}}catch(e){}}
function coordsFor(city,state){if(!city)return null;const k=nkey(city),a=abbr(state);
 if(a){const c=IDX.get(k+'|'+a);return c?{c,st:a}:null}const l=BYNAME.get(k);return l&&l.length===1?{c:l[0][1],st:l[0][0]}:null}
async function resolveLoc(){U=null;note='';const city=loc.city.trim();if(!city)return;await loadCities();
 const u=coordsFor(city,loc.state);
 if(u){U=u.c;if(!abbr(loc.state))loc.state=ST[u.st]}
 else note=`We couldn't pinpoint "${city}"${loc.state.trim()?'':' (try adding your state)'}, so results are matched on the text you typed. Try the nearest larger city if needed.`;
 if(isStore)rows.forEach(r=>{if(r._c===undefined)r._c=rowC(r)})}
function parseCSV(t){t=t.replace(/^\uFEFF/,'');const out=[];let r=[],f='',q=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
  else if(c=='"')q=true;else if(c==','){r.push(f);f=''}
  else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);f='';out.push(r);r=[]}else f+=c}
 if(f!==''||r.length){r.push(f);out.push(r)}
 const h=(out.shift()||[]).map(x=>x.toLowerCase().replace(/[^a-z0-9]/g,''));
 return out.filter(r=>r.some(x=>x.trim())).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||'').trim()])))}
const ICON={retail:'🛍️',restaurant:'🍽️',entertainment:'🎮',services:'🛠️'};
/* Sub categories per category. A store's SubCategory column must match one of these (spelling/capitals/plural do not matter). */
const SUBS={retail:['Clothes','Weapons','Games','Media','Nutrition','Specialty'],restaurant:['Food','Cafes'],services:['Clothes','Cars','Fashion','Specialty']};
const one=n=>n==='Services'?'service':n.toLowerCase();
const skey=x=>(x||'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/s$/,'');
const fetchText=async u=>{try{const r=await fetch(u,{cache:'no-store'});if(r.ok){const t=await r.text();if(t.trim()&&!/^\s*</.test(t))return t}}catch(e){}return null};
const pick1=(r,...k)=>{for(const x of k)if(r[x])return r[x];return''};
const fix=r=>{r.storename=pick1(r,'storename','name','store');r.googlemapslink=pick1(r,'googlemapslink','mapslink','maps','map');r.imagelink=pick1(r,'imagelink','image','thumbnail','photo');r.notes=pick1(r,'notes','description');r.address=pick1(r,'address','streetaddress');r.subcategory=pick1(r,'subcategory','subcat','sub');return r};
async function loadRaw(){const u=isStore?S.storesCsvUrl:S.gamesCsvUrl,id=(u||'').match(/\/spreadsheets\/d\/([\w-]+)/);
 if(id){const g=tab=>`https://docs.google.com/spreadsheets/d/${id[1]}/gviz/tq?tqx=out:csv`+(tab?'&sheet='+encodeURIComponent(tab):'');
  if(isStore){
   /* Tabs named Retail / Restaurant / Entertainment. Google silently returns the FIRST sheet for an unknown tab name, so compare against a deliberately bogus tab to spot that. */
   const bogus=await fetchText(g('__none__')),texts=await Promise.all(TABS.map(([,n])=>fetchText(g(n)))),out=[],same=[];
   TABS.forEach(([k,n],i)=>{const t=texts[i];if(!t)return;if(t===bogus)same.push(n);else parseCSV(t).forEach(r=>{if(!r.category)r.category=n;out.push(r)})});
   if(same.length&&bogus)parseCSV(bogus).forEach(r=>{if(!r.category&&same.length<TABS.length)r.category=same[0];out.push(r)});
   if(out.length)return out}
  else{const t=await fetchText(g());if(t)return parseCSV(t)}}
 else if(u){const t=await fetchText(u);if(t)return parseCSV(t)}
 try{const r=await fetch(root.dataset.csv+'?'+Date.now());if(r.ok)return parseCSV(await r.text())}catch(e){}return[]}
const load=async()=>(await loadRaw()).map(fix);
document.head.append(Object.assign(document.createElement('style'),{textContent:'.cat{margin:1.6rem 0;scroll-margin-top:140px}.cat-h{font:700 1.35rem Orbitron,sans-serif;color:var(--cy);margin:0 0 .7rem;padding-bottom:.4rem;border-bottom:2px solid #ffffff22}button[aria-pressed=true]{background:linear-gradient(#35e0d0,#0f9e92)!important;border-color:#000a!important}a.chipjump{font:600 1rem Fredoka,sans-serif;color:#fff;text-decoration:none;padding:.5rem 1.1rem;border-radius:999px;border:2px solid #ffffff33;background:#ffffff10}a.chipjump:hover{background:var(--pk)}'}));
let sel='all',subSel='';
function renderStores(out){const total=TABS.reduce((n,[k])=>n+picks[k].length,0),bar=el('div','ntabs');bar.setAttribute('role','group');
 [['all','All',''],...TABS.map(([k,n])=>[k,n,ICON[k]+' '])].forEach(([k,n,i])=>{const c=k==='all'?total:picks[k].length,b=el('button','',`${i}${n} (${c})`);b.type='button';b.setAttribute('aria-pressed',k===sel);b.onclick=()=>{sel=k;subSel='';render()};bar.append(b)});
 out.append(bar);
 if(sel!=='all'&&SUBS[sel]){const sb=el('div','ntabs'),mk=(v,t)=>{const c=v?picks[sel].filter(x=>skey(x.r.subcategory)===skey(v)).length:picks[sel].length,b=el('button','',`${t} (${c})`);b.type='button';b.setAttribute('aria-pressed',skey(subSel)===skey(v));b.onclick=()=>{subSel=v;render()};sb.append(b)};sb.setAttribute('role','group');mk('','All '+TABS.find(([k])=>k===sel)[1]);SUBS[sel].forEach(v=>mk(v,v));out.append(sb)}
 TABS.filter(([k])=>sel==='all'||sel===k).forEach(([k,n])=>{
  const list=sel===k&&subSel?picks[k].filter(x=>skey(x.r.subcategory)===skey(subSel)):picks[k],shown=sel==='all'?list.slice(0,6):list,s=el('section','cat'),subL=sel===k&&subSel?(SUBS[k]||[]).find(v=>skey(v)===skey(subSel))||subSel:'',full=subL?`${n} - ${subL}`:n;s.append(el('h3','cat-h',`${ICON[k]} ${full}`));
  if(shown.length){const l=el('div','rows');shown.forEach(x=>l.append(card(x)));s.append(l);
   if(shown.length<list.length){const m=el('button','btn sm tl',`See all ${list.length} ${one(n)} spots`);m.type='button';m.onclick=()=>{sel=k;subSel='';render()};s.append(m)}}
  else s.append(el('p','meta',subL?`No ${n.toLowerCase()} - ${subL.toLowerCase()} partners near you yet.`:`No ${one(n)} partners near you yet.`),cta('recommend-store.html',`Recommend ${/^[aeiou]/i.test(one(n))?'an':'a'} ${one(n)} spot`,'pk'));
  out.append(s)})}
function score(r){const c=nkey(loc.city),s=norm(full(loc.state));
 if(isStore){
  if(exact){const x=r._c?miles(exact,r._c):null;return x==null?[2,null]:[0,x]}   /* exact spot: only real distances count */
  const sm=s&&norm(full(r.state))===s,cm=c&&nkey(r.city)===c&&(!s||sm);
  if(U&&r._c){const d=miles(U,r._c);return[cm?0:d<=(S.nearbyMiles||50)?0:(sm?1:2),null]}   /* typed city: distance is only approximate, so never shown or used to rank */
  return[cm?0:sm?1:2,null]}
 const g=(r.optimalregion||'').split(/[|,]/).map(norm).filter(Boolean),hit=v=>v&&g.some(x=>x===v||v.includes(x)||x.includes(v));
 return[hit(s)||hit(norm(loc.city))?0:1,null]}
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* Closest first, but stores within 1 mile of each other swap places at random, so close neighbours each get a fair turn at the top. */
function fairNear(l){l=l.slice().sort((a,b)=>a.d-b.d);const out=[];let i=0;
 while(i<l.length){const grp=[l[i]];let j=i+1;while(j<l.length&&miles(l[i].r._c,l[j].r._c)<=1){grp.push(l[j]);j++}out.push(...shuffle(grp));i=j}return out}
function compute(){picks={};TABS.forEach(([k])=>{let l=rows.filter(r=>catKey(r)===k).map(r=>{const[t,d]=score(r);return{r,t,d}});
 if(isStore)l=l.filter(x=>x.t<2);
 picks[k]=(exact?fairNear(l.filter(x=>x.d!=null&&(!corner||(x.r._c[0]==='store'&&x.d<=(S.aroundCornerMiles||2))))):[0,1,2].flatMap(t=>shuffle(l.filter(x=>x.t===t)))).slice(0,isStore?30:8)});
 active=(TABS.find(([k])=>picks[k].length)||TABS[0])[0]}
function cta(a,t,c){const x=el('a','btn sm '+c,t);x.href=a;return x}
function cornerEmpty(){const p=el('div','empty'),m=S.aroundCornerMiles||2;
 p.append(el('h3','','Nothing around the corner yet'),
  el('p','',`No partner stores with a confirmed address are within ${m} miles of you right now. The network is growing.`));
 const c=el('div','cta'),a=el('button','btn sm tl','Show the closest stores');a.type='button';
 a.onclick=()=>{corner=false;note='Sorted by distance from where you are right now. Your location stays in your browser and is never sent or saved.';compute();render()};
 c.append(a,cta('recommend-store.html','Recommend a spot nearby','pk'));
 c.style.cssText='display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap';p.append(c);return p}
function emptyPanel(){const p=el('div','empty'),place=[loc.city,loc.state].filter(Boolean).join(', ');
 p.append(el('h3','',isStore?'No partner stores here yet':'Coming soon'),
  el('p','',isStore?`We haven't partnered with a store${place?' in '+place:''} yet, but the network is growing. Do you own a store in the area?`:'No studios are listed here yet. Are you an indie developer?'));
 const c=el('div','cta');c.append(...(isStore?[cta('signup-store.html','Yes, I own a store',''),cta('recommend-store.html',"No, I'm just recommending one",'pk')]:[cta('signup-indie-dev.html','Yes, I\'m an indie dev',''),cta('recommend-indie-dev.html',"No, I'm just recommending one",'pk')]));
 c.style.cssText='display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap';p.append(c);return p}
function card(x){const r=x.r,c=el('article','row');
 const b=el('div','rb');
 if(isStore){b.append(el('h3','',r.storename),el('p','meta',[r.city,r.state].filter(Boolean).join(', ')));
  if(exact&&x.d!=null)b.append(el('span','badge',(x.d<0.5?'Less than half a mile':x.d<10?x.d.toFixed(1)+' mi':Math.round(x.d)+' mi')+' away'));
  else if(!exact&&x.t<2)b.append(el('span','badge',x.t===0?(nkey(r.city)===nkey(loc.city)?'In your city':'In your area'):'In your state'))
  if(r.subcategory)b.append(el('p','meta',r.category?r.category+' · '+r.subcategory:r.subcategory));
  if(r.address)b.append(el('p','meta',r.address));
  if(r.notes)b.append(el('p','',r.notes));
  const a=cta(safe(r.googlemapslink)||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([r.storename,r.city,r.state].join(' ')),'Open in Google Maps','tl');a.target='_blank';a.rel='noopener noreferrer';b.append(a)}
 else{b.append(el('h3','',r.gamename),el('p','meta',r.studioname));
  if(r.optimalregion)b.append(el('p','meta','Popular in: '+r.optimalregion.split(/[|,]/).map(z=>z.trim()).filter(Boolean).join(', ')));
  if(x.t===0&&(loc.city||loc.state))b.append(el('span','badge','Popular in your region'));
  const l=safe(r.storelink);if(l){const a=cta(l,'Get the Game','tl');a.target='_blank';a.rel='noopener noreferrer';b.append(a)}}
 c.append(b);return c}
function render(){const out=document.getElementById('results');out.replaceChildren();if(note&&searched)out.append(el('p','meta',note));
 if(!searched){out.append(el('p','','Enter your city and state above to find partner stores near you.'));return}
 const total=TABS.reduce((n,[k])=>n+picks[k].length,0);
 if(!total){out.append(corner&&exact?cornerEmpty():emptyPanel());return}
 if(isStore){renderStores(out);return}
 const bar=el('div','ntabs');bar.setAttribute('role','tablist');
 TABS.forEach(([k,n])=>{const b=el('button','',`${n} (${picks[k].length})`);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',k===active);b.onclick=()=>{active=k;render()};bar.append(b)});
 out.append(bar);
 if(!picks[active].length)out.append(emptyPanel());else{const l=el('div','rows');picks[active].forEach(x=>l.append(card(x)));out.append(l)}}
const ready=load().then(d=>{rows=d;compute();render()});
document.getElementById('lookup').addEventListener('submit',e=>{e.preventDefault();
 exact=null;corner=false;loc={city:document.getElementById('city').value,state:document.getElementById('state').value};
 if(isStore&&!norm(loc.city)&&!norm(loc.state)){document.getElementById('results').textContent='Please enter a city and state first.';return}
 sel='all';subSel='';searched=true;ready.then(async()=>{await resolveLoc();compute();render()})});

if(isStore){const f=document.getElementById('lookup'),bt=el('button','btn tl','Near Me'),ac=el('button','btn tl','Around The Corner');
 bt.type='button';bt.id='nearme';ac.type='button';ac.id='aroundcorner';
 /* Layout: City and State side by side, then Find Stores, Near Me and Around The Corner stacked in one column. Sign Up and Recommend stack in a matching column on the right. */
 const row=el('div','');row.style.cssText='display:flex;gap:.8rem;flex-wrap:wrap';
 f.querySelectorAll('label').forEach(l=>{l.style.flex='1 1 9rem';row.append(l)});
 const find=f.querySelector('button[type=submit]'),grp=el('div','locbtns');grp.style.cssText='display:flex;flex-direction:column;gap:.7rem;align-items:stretch';
 grp.append(find,bt,ac);f.style.cssText='display:flex;flex-direction:column;gap:.9rem;align-items:stretch;flex:0 1 26rem';f.append(row,grp);
 const ct=document.querySelector('.lookup .ctas');if(ct)ct.style.cssText='display:flex;flex-direction:column;gap:.7rem;align-items:stretch';
 const msg=t=>{note=t;searched=true;render()};
 const go=(btn,label,short)=>{
  if(!navigator.geolocation){msg('Your browser cannot share its location. Type your city and state instead.');return}
  bt.disabled=ac.disabled=true;btn.textContent='Finding you…';
  const done=()=>{bt.disabled=ac.disabled=false;btn.textContent=label};
  navigator.geolocation.getCurrentPosition(async p=>{done();
   await loadCities();await ready;
   rows.forEach(r=>{if(r._c===undefined)r._c=rowC(r)});
   exact=['you',p.coords.latitude,p.coords.longitude];corner=short;U=null;loc={city:'',state:''};sel='all';subSel='';searched=true;
   note=short?`Showing partner stores within about ${S.aroundCornerMiles||2} miles of where you are right now, a short drive. Your location stays in your browser and is never sent or saved.`:'Sorted by distance from where you are right now. Your location stays in your browser and is never sent or saved.';compute();render()},
  e=>{done();msg(e&&e.code===1?'Location access was blocked, so we cannot sort by distance. Allow it in your browser, or type your city and state instead.':'We could not get your location. Type your city and state instead.')},
  {enableHighAccuracy:true,timeout:15000,maximumAge:0})};
 bt.onclick=()=>go(bt,'Near Me',false);ac.onclick=()=>go(ac,'Around The Corner',true)}
})();