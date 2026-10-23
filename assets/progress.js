/* Platform Progress (landing page).
   Settings live in assets/config.js under platformProgress:
     ios:     { status, asOf }                  plain text you edit as Apple's review moves along
     android: { testersSheetUrl, testersColumn, testersGoal, goalReachedStatus }
              the live tester count is the number of non-empty cells in testersColumn of the Sheet (blank cells are ignored)
   Once a real store link is set in config.js (stores.ios / stores.android) that platform switches to "Available now".
   If both are live the whole block hides itself. Nothing but the count is read from the Sheet; emails are never downloaded. */
(()=>{
const box=document.getElementById('progress');if(!box)return;
const C=window.SITE||{},P=C.platformProgress||{},ST=C.stores||{},tiles=box.querySelector('.pp-tiles');
const HOST={ios:/^(apps|itunes)\.apple\.com$/i,android:/^play\.google\.com$/i};
const live=k=>{try{const x=new URL(ST[k]);return x.protocol==='https:'&&HOST[k].test(x.hostname)}catch(e){return false}};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(href,text,ext)=>{const a=el('a','btn sm tl',text);a.href=href;if(ext){a.target='_blank';a.rel='noopener noreferrer'}return a};
if(live('ios')&&live('android'))return;   /* everything is out, nothing left to report */

/* iOS: plain status text, or "Available now" once the App Store link is set */
const I=P.ios||{},ti=el('div','pp-tile ios');ti.append(el('div','pp-plat','iOS · App Store'));
if(live('ios')){ti.append(el('div','pp-state','Available now'),btn(ST.ios,'Download on the App Store',true))}
else{ti.append(el('div','pp-state',I.status||'Coming soon'));
 if(I.asOf)ti.append(el('div','pp-sub',/^as of /i.test(I.asOf)?I.asOf:'as of '+I.asOf))}
tiles.append(ti);

/* Android: live tester count against the goal */
const A=P.android||{},ta=el('div','pp-tile android');ta.append(el('div','pp-plat','Android · Google Play'));
if(live('android')){ta.append(el('div','pp-state','Available now'),btn(ST.android,'Get it on Google Play',true))}
else{
 const goal=Math.max(1,parseInt(A.testersGoal,10)||30),
  sid=((A.testersSheetUrl||'').match(/\/spreadsheets\/d\/([\w-]+)/)||[])[1],
  col=/^[A-Za-z]{1,2}$/.test(A.testersColumn||'')?A.testersColumn.toUpperCase():'B',
  state=el('div','pp-state','Counting testers…'),bar=el('div','pp-bar'),fill=el('i'),sub=el('div','pp-sub');
 bar.append(fill);bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',goal);bar.setAttribute('aria-label','Google Play testers');
 ta.append(state,bar,sub);
 const count=async()=>{if(!sid)return null;
  try{const r=await fetch(`https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:csv&headers=1&tq=`+encodeURIComponent(`select count(${col})`),{cache:'no-store'});
   if(!r.ok)return null;const t=(await r.text()).trim();if(!t||t[0]==='<')return null;
   const n=parseInt(t.split(/\r?\n/).pop().replace(/[^0-9]/g,''),10);return isFinite(n)?n:null}catch(e){return null}};
 count().then(n=>{
  if(n===null){state.textContent='Testers wanted';sub.textContent='Live count unavailable right now';ta.append(btn('android-tester.html','Become a Tester'));return}
  const left=Math.max(0,goal-n);
  state.textContent=left>0?`Needs ${left} more tester${left===1?'':'s'}`:(A.goalReachedStatus||'Tester goal reached');
  sub.textContent=`${n} of ${goal} testers so far`;
  bar.setAttribute('aria-valuenow',Math.min(n,goal));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{fill.style.width=Math.min(100,n/goal*100)+'%'}));
  if(left>0)ta.append(btn('android-tester.html','Become a Tester'))})}
tiles.append(ta);
box.hidden=false;
})();
