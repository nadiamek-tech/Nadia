/* Shared hub renderer: builds home, lectures and projects pages from window.SITE (assets/site.js). */
(function(){
const S=window.SITE, $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TBA='<i style="color:var(--muted)">to be announced</i>';
const KB=window[(S.kbName||S.code.replace(/\s/g,''))+'_KB']||[];
const AS=window[S.code.replace(/\s/g,'')+'Assistant'];
const when=a=>`Week ${a.week}${a.date?` · ${esc(a.date)}`:''}`;

/* contact answers come from settings, not the knowledge base */
const C=S.contact;
const LIVE={
  'How do I contact the professor?':()=>`Email ${C.email?`<a href="mailto:${esc(C.email)}">${esc(C.email)}</a>`:TBA}. Write the course code (${esc(S.code)}) in the subject line.`,
  'What are the office hours?':()=>`${C.hours?esc(C.hours):TBA}${C.room?` · ${esc(C.room)}`:''}.`,
  'How do I book office hours?':()=>C.booking?(/^https?:/.test(C.booking)?`Book here: <a href="${esc(C.booking)}" target="_blank" rel="noopener">booking link</a>.`:esc(C.booking)):`Email the professor with two times that suit you. Booking link: ${TBA}.`,
  'Where do I see my grades?':()=>S.portal?`On the <a href="${esc(S.portal)}" target="_blank" rel="noopener">student portal</a>; marked work also appears on Moodle.`:`On the student portal (link ${TBA}); marked work also appears on Moodle.`,
  'Where do I submit my work?':()=>`On Moodle, through the submission buttons on this site (below and on the Projects page). Each button opens the right Moodle submission.`
};

function header(back){
  return `<div class="top"><span class="brandrow">${S.logo?`<a href="index.html"><img src="assets/cud-logo.png" alt="Canadian University Dubai" class="cudlogo" onerror="this.remove()"></a>`:''}<span class="mono">${esc(S.code)}${back?` · <a href="index.html">← Course home</a>`:''}</span></span><button type="button" class="pill" id="theme">◐ Theme</button></div>`;
}
function wireTheme(){ const t=$('theme'); if(t) t.addEventListener('click',()=>window.GED102Theme&&GED102Theme.toggle()); }

function faq(el){
  el.innerHTML=S.faq.map(q=>{ const live=LIVE[q]; const e=KB.find(x=>x.q===q); if(!live&&!e) return '';
    return `<details><summary>${esc(q)}</summary><p>${live?live():esc(e.a)}${!live&&e.l?` <a href="${e.l}">Open →</a>`:''}</p></details>`; }).join('');
}
function calendar(el){
  const rows=[...S.assess].sort((a,b)=>a.week-b.week);
  el.innerHTML=`<table class="cal"><thead><tr><th>Week</th><th>What</th><th class="hide-s">Type</th><th>Weight</th></tr></thead><tbody>${rows.map(a=>`<tr class="it" tabindex="0" role="button" aria-expanded="false" data-id="${a.id}"><td>${a.week}</td><td><b>${esc(a.name)}</b><br><small style="color:var(--muted)">${a.date?esc(a.date):'Date on Moodle'}</small></td><td class="hide-s"><span class="tag">${esc(a.type)}</span></td><td>${a.weight}%</td></tr><tr class="det" hidden data-for="${a.id}"><td colspan="4"><b>${esc(a.type)} · ${esc(a.who)}</b><ul>${a.includes.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>${a.guide?`<a href="${a.guide}">Open the guide →</a> `:''}${a.moodle?` · <a href="${esc(a.moodle)}" target="_blank" rel="noopener">Submit on Moodle →</a>`:''}</td></tr>`).join('')}</tbody></table><p class="mono" style="color:var(--muted);margin-top:6px">Click a row for details.</p>`;
  el.querySelectorAll('tr.it').forEach(r=>{ const tog=()=>{ const d=el.querySelector(`tr.det[data-for="${r.dataset.id}"]`); d.hidden=!d.hidden; r.setAttribute('aria-expanded',!d.hidden); }; r.addEventListener('click',tog); r.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tog(); } }); });
}
function clos(el){ el.innerHTML=S.clos.map(([c,t])=>`<div><b>${esc(c)}</b>${esc(t)}</div>`).join(''); }
function links(el){
  const L=[['Student portal · grades',S.portal],['Moodle course page',S.moodle],['Email the professor',C.email?'mailto:'+C.email:''],['Book office hours',/^https?:/.test(C.booking||'')?C.booking:'']];
  el.innerHTML=L.map(([t,u])=>u?`<a class="lnk" href="${esc(u)}" ${/^http/.test(u)?'target="_blank" rel="noopener"':''}>${t}</a>`:`<span class="lnk off">${t} · coming soon</span>`).join('');
}
function subs(el,all){
  const list=[...S.assess].sort((a,b)=>a.week-b.week).filter(a=>all||a.moodle||a.guide);
  el.innerHTML=list.map((a,i)=>`<div class="sb" style="--cc:var(--c${(i%4)+1})"><span class="w">${a.weight}%</span><div><h3>${esc(a.name)}</h3><p>${esc(a.who)} · ${when(a)}${a.date?'':' · date on Moodle'}</p></div><div class="acts">${a.guide?`<a class="gd" href="${a.guide}">Guide</a>`:''}${a.moodle?`<a class="up" href="${esc(a.moodle)}" target="_blank" rel="noopener">Submit on Moodle ↗</a>`:`<span class="soon">Submission link coming soon</span>`}</div></div>`).join('');
}
function ledger(el){
  el.innerHTML=S.weeks.map(([n,t,subs,ref,href])=>{ const tag=href?'a':'div';
    return `<${tag} class="wk${href?' ready':''}" ${href?`href="${href}"`:''}><span class="no">${String(n).padStart(2,'0')}</span><div><h3>${esc(t)}</h3><ul>${subs.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div><div class="meta">${ref?`<b>Reading</b>${esc(ref)}`:''}${S.assess.filter(a=>a.week===n).map(a=>`<b style="margin-top:6px">Due</b>${esc(a.name)}`).join('')}</div><div class="st">${href?'Open →':'<span class="tag">In preparation</span>'}</div></${tag}>`; }).join('');
}
function find(form,q,box){
  form.addEventListener('submit',ev=>{ ev.preventDefault(); const v=q.value.trim(); if(!v){ box.innerHTML=''; return; }
    const A=window[S.code.replace(/\s/g,'')+'Assistant']; if(!A){ return; }
    const r=A.search(v), items=[];
    r.kb.filter(x=>x.s>=1.6).slice(0,3).forEach(x=>items.push(`<a href="${x.e.l}"><b>${esc(x.e.q)}</b>${esc(x.e.a)}<br><small>${esc(A.label(x.e.l))}</small></a>`));
    r.idx.filter(x=>x.s>=2&&!r.kb.slice(0,3).some(k=>k.e.l===x.e.l)).slice(0,4).forEach(x=>items.push(`<a href="${x.e.l}"><b>${esc(x.e.pt)} · ${esc(x.e.n)}</b><small>${esc(x.e.t)}</small></a>`));
    box.innerHTML=items.length?items.join(''):`<p class="mono" style="color:var(--muted)">Try one key word, or ask the assistant.</p>`;
    box.insertAdjacentHTML('beforeend',`<button type="button" class="btn" id="find-ask" style="justify-self:start">Ask me: “${esc(v)}”</button>`);
    $('find-ask').addEventListener('click',()=>A.open(v)); });
}
window.Hub={S,esc,header,wireTheme,faq,calendar,clos,links,subs,ledger,find};
})();
