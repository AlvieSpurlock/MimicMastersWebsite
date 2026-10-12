/* Donations block (Charity page, Landing page, Donations page).
   Source: ONE Google Sheet, shared as "Anyone with the link: Viewer".
     Tab 1 (the ledger, keep it first):  Charity | Date | Amount      one row per donation, ALL your games; only the charity named in config.js (donationCharity) is totaled and listed
     Second sheet, tab "Players" (automatic): PlayerID | Contribution | Updated. One row per player, written by the
                                         Apps Script web app (ContributionReceiver.gs) that each game reports to.
                                         The site adds the Contribution column up with one query.
     Tab "Estimate" (optional fallback): Amount | AsOf               one row, typed by hand; used only if Contributions is empty
   Nothing is shown until there is data. Sheet text is only ever inserted as text (never HTML).
   Override the sheet in assets/config.js with  donationsSheetUrl:"https://docs.google.com/spreadsheets/d/.../edit"  */
(()=>{
const mounts=[...document.querySelectorAll('[data-giving]')];if(!mounts.length)return;
const DEFAULT_SHEET='https://docs.google.com/spreadsheets/d/1dxzL7XYXNb0fk4bb9b4GMNO7BqOpGALekMsCOH7xLz0/edit?usp=sharing';
const id=(((window.SITE||{}).donationsSheetUrl||DEFAULT_SHEET).match(/\/spreadsheets\/d\/([\w-]+)/)||[])[1];
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const TAB=(window.SITE||{}).donationsContribTab||'Players';
const DEFAULT_CONTRIB='https://docs.google.com/spreadsheets/d/1KCmfXcqwW6QI4aUAgZk9iZ3ofzt2U2F8g2hDD4U6YSc/edit?usp=sharing';
const cid=(((window.SITE||{}).contributionsSheetUrl||DEFAULT_CONTRIB).match(/\/spreadsheets\/d\/([\w-]+)/)||[])[1];
const g=(tab,sid=id)=>`https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:csv&headers=1`+(tab?'&sheet='+encodeURIComponent(tab):'');
const getText=async u=>{try{const r=await fetch(u,{cache:'no-store'});if(!r.ok)return null;const t=await r.text();return t.trim()&&!/^\s*</.test(t)?t:null}catch(e){return null}};
const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const CH=[].concat((window.SITE||{}).donationCharity||['ASAN','Autistic Self Advocacy Network']).map(norm).filter(Boolean);
const money2=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const money0=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:0});

function parseCSV(t){t=t.replace(/^﻿/,'');const out=[];let r=[],f='',q=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
  else if(c=='"')q=true;else if(c==','){r.push(f);f=''}
  else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);f='';out.push(r);r=[]}else f+=c}
 if(f!==''||r.length){r.push(f);out.push(r)}
 const h=(out.shift()||[]).map(x=>x.toLowerCase().replace(/[^a-z0-9]/g,''));
 return out.filter(r=>r.some(x=>x.trim())).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||'').trim()])))}

const num=v=>{const n=parseFloat(String(v||'').replace(/[^0-9.\-]/g,''));return isFinite(n)?n:NaN};
const toDate=s=>{s=/^\d{4}-\d{2}-\d{2} \d/.test(s||'')?s.replace(' ','T'):s;const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');const d=m?new Date(+m[1],m[2]-1,+m[3]):new Date(s);return s&&!isNaN(d)?d:null};
const nice=s=>{const d=toDate(s);return d?d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):(s||'')};

async function load(){
 if(!id)return{rows:[],est:null,okL:false,okE:false};
 /* Google silently answers an unknown tab name with the FIRST tab, so also ask for a tab that cannot exist and compare. */
 const q='&tq='+encodeURIComponent('select sum(B), max(C)');
 const [lt,et,bt,ct,cb]=await Promise.all([getText(g()),getText(g('Estimate')),getText(g('__none__')),getText(g(TAB,cid)+q),getText(g('__none__',cid)+q)]);
 const rows=[];
 if(lt)parseCSV(lt).forEach((r,i)=>{const name=r.charity,amt=num(r.amount);if(name&&amt>0&&CH.includes(norm(name)))rows.push({name,cents:Math.round(amt*100),date:r.date,i})});
 let est=null;
 /* 1) live: sum of every player's reported estimate (Players tab of the contributions sheet) */
 if(ct&&ct!==cb){const c=parseCSV(ct)[0];if(c){const v=Object.values(c),a=num(v[0]);if(a>0)est={usd:a,asof:v[1]||''}}}
 /* 2) fallback: hand-typed Estimate tab */
 if(!est&&et&&et!==bt){const er=parseCSV(et);
  if(er.length&&!('charity' in er[0]))for(const r of er){const a=num(r.amount||r.estimate||r.estimatedraised);if(a>0){est={usd:a,asof:r.asof||r.date||''};break}}}
 rows.sort((a,b)=>((toDate(b.date)||0)-(toDate(a.date)||0))||b.i-a.i);
 return{rows,est,okL:!!lt,okE:!!(ct||cb)||!!est}}


const PH={
 load:['Pouring the tea…','Counting every last sugar cube. One moment, please.'],
 landing:['The kettle is on!','Tea-time totals are still steeping. Check back soon to see how the giving is going.'],
 charity:['The kettle is on!','Nothing has been poured out yet. The first cup of giving will show up right here.'],
 full:['The tea party ledger is empty, for now.','Every donation will be listed here, with the charity and the date, the moment it is made.']};
function render(mode,{rows,est,okL,okE},box){
 box.replaceChildren();
 const total=rows.reduce((n,r)=>n+r.cents,0),tiles=el('div','gv-tiles');
 {const t=el('div','gv-tile est'),lab=el('div','gv-label');lab.append('Estimated raised ',el('span','gv-badge','Estimate'));
  t.append(lab,el('div','gv-val',est?'~'+money0.format(est.usd):(okE?'~$0':'—')));
  t.append(el('div','gv-sub',est?(est.asof?'As of '+nice(est.asof):'From player reports'):(okE?'No player reports yet':'Could not reach the contributions sheet')));tiles.append(t)}
 {const t=el('div','gv-tile don');
  t.append(el('div','gv-label','Donated so far'),el('div','gv-val',rows.length?money2.format(total/100):(okL?'$0.00':'—')),
   el('div','gv-sub',rows.length?`${rows.length} donation${rows.length===1?'':'s'}`:(okL?'Nothing donated yet':'Could not reach the donations sheet')));tiles.append(t)}
 box.append(tiles);
 box.append(el('p','gv-note','ESTIMATE: based on Appodeal’s internal revenue estimates, so the real amount could be lower or higher. It does not include direct donations.'));
 if(mode!=='landing'&&!rows.length){const d=el('div','gv-ph'),t=PH[mode];d.append(el('div','gv-cup','☕'),el('div','gv-ph-t',t[0]),el('div','gv-ph-s',t[1]));box.append(d)}
 if(mode==='full'&&rows.length){
  box.append(el('h3','gv-h','Every donation'));
  const tb=el('table','gv-table'),th=el('thead'),hd=el('tr');['Date','Amount'].forEach(h=>hd.append(el('th','',h)));th.append(hd);tb.append(th);
  const body=el('tbody');rows.forEach(r=>{const tr=el('tr');tr.append(el('td','',nice(r.date)),el('td','',money2.format(r.cents/100)));body.append(tr)});
  tb.append(body);box.append(tb)}
 if(mode==='landing'&&rows.length){const a=el('a','btn sm tl','See every donation');a.href='donations.html';const w=el('p','gv-cta');w.append(a);box.append(w)}}

function ph(m,kind){const box=m.querySelector('.gv-mount')||m.appendChild(el('div','gv-mount'));box.replaceChildren();
 const d=el('div','gv-ph'+(kind==='load'?' gv-busy':'')),t=PH[kind==='load'?'load':m.dataset.giving];
 d.append(el('div','gv-cup','☕'),el('div','gv-ph-t',t[0]),el('div','gv-ph-s',t[1]));box.append(d);m.hidden=false;return box}
const live=mounts.filter(m=>!m.hasAttribute('data-giving-empty'));
mounts.filter(m=>m.hasAttribute('data-giving-empty')).forEach(m=>m.hidden=true);
live.forEach(m=>ph(m,'load'));
load().then(d=>{live.forEach(m=>{render(m.dataset.giving,d,m.querySelector('.gv-mount'));m.hidden=false})
}).catch(()=>live.forEach(m=>{render(m.dataset.giving,{rows:[],est:null,okL:false,okE:false},m.querySelector('.gv-mount'));m.hidden=false}));
})();
