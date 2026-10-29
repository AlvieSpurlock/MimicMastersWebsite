document.querySelectorAll('iframe[data-src]').forEach(f=>{f.src=f.dataset.src});
const p=document.getElementById('policy');
if(p){fetch('assets/privacy-content.html?'+Date.now()).then(r=>r.ok?r.text():Promise.reject()).then(h=>p.outerHTML=h).catch(()=>p.innerHTML='<p>Unable to load the policy right now. Please try again shortly.</p>')}

/* Page-view counter. Sends the page name and where the visitor came from to your own Google Sheet (TrafficReceiver.gs).
   No cookies, no visitor ID, nothing stored in the browser except a "counted this page this visit" flag.
   Off until trafficUrl is set in config.js. Skips localhost, Do Not Track / Global Privacy Control, bots, and any
   device you opt out by opening any page once with ?notrack=1 (use ?notrack=0 to count it again). */
(()=>{try{
 const U=(window.SITE||{}).trafficUrl||'';if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(U))return;
 const L=location,q=new URLSearchParams(L.search);
 if(L.protocol==='file:'||/^(localhost|127\.|0\.0\.0\.0)/.test(L.hostname))return;
 if(q.has('notrack')){try{q.get('notrack')==='0'?localStorage.removeItem('mm_notrack'):localStorage.setItem('mm_notrack','1')}catch(e){}}
 try{if(localStorage.getItem('mm_notrack'))return}catch(e){}
 if(navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl||document.prerendering)return;
 if(navigator.webdriver||/bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent))return;
 const page=(L.pathname.split('/').pop()||'index.html').toLowerCase();
 let src=(q.get('src')||q.get('utm_source')||'').toLowerCase();
 if(!src){try{const h=new URL(document.referrer).hostname.replace(/^www\./,'');src=!h?'direct':h===L.hostname.replace(/^www\./,'')?'site':'from:'+h}catch(e){src='direct'}}
 src=src.replace(/[^a-z0-9:._-]/g,'').slice(0,40)||'direct';
 try{const k='mm_v_'+page;if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1')}catch(e){}
 const body=new URLSearchParams({p:page,s:src});
 if(navigator.sendBeacon&&navigator.sendBeacon(U,body))return;
 fetch(U,{method:'POST',body,mode:'no-cors',keepalive:true}).catch(()=>{});
}catch(e){}})();
