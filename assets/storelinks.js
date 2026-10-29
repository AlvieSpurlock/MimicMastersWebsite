/* Landing store logos.
   Link:  the real store page once stores.ios / stores.android are set in assets/config.js, otherwise the Join/Release pages.
   Order: the platform the visitor is on goes first (left on mobile, top on PC). If it cannot be detected,
          config.appleFocused decides (true = Apple first, false = Android first). */
(()=>{
const C=window.SITE||{},S=C.stores||{};
/* A store link counts as valid only if it is https and really points at that store. */
const HOST={ios:/^(apps|itunes)\.apple\.com$/i,android:/^play\.google\.com$/i};
const ok=(u,k)=>{try{const x=new URL(u);return x.protocol==='https:'&&(!k||HOST[k].test(x.hostname))}catch(e){return false}};
document.querySelectorAll('[data-store]').forEach(a=>{const u=S[a.dataset.store];
 if(ok(u,a.dataset.store)){a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.title=a.dataset.live||a.title}});
function platform(){const ua=navigator.userAgent||'',p=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'';
 if(/android|CrOS/i.test(ua))return'android';
 if(/iphone|ipad|ipod/i.test(ua)||/mac/i.test(p))return'ios';
 return null}
const first=platform()||(C.appleFocused?'ios':'android');
document.querySelectorAll('.store-btns').forEach(b=>b.dataset.first=first);
const j=document.querySelector('[data-join]');if(j&&ok(S[j.dataset.join],j.dataset.join))location.replace(S[j.dataset.join]);
})();
