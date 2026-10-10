document.querySelectorAll('iframe[data-src]').forEach(f=>{f.src=f.dataset.src});
const p=document.getElementById('policy');
if(p){fetch('assets/privacy-content.html?'+Date.now()).then(r=>r.ok?r.text():Promise.reject()).then(h=>p.outerHTML=h).catch(()=>p.innerHTML='<p>Unable to load the policy right now. Please try again shortly.</p>')}
