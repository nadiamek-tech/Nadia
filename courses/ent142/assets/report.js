/* ENT 142 · Project 1 report template. Needs assets/lab.js loaded first (with window.LAB_NO_MOUNT=true).
   Report.render(el,{mode:'edit'|'view', example:false|true})   the whole report as pages
   Report.page(el,key,example)                                   one section page (example image on the guide)
   Report.thumb(key)                                             map of the report with that page highlighted
   Report.SECS                                                   sections in the brief's order */
(function(){
const SECS=[
  {key:'exec',  h:'Executive Summary',                 target:0,   lab:10},
  {key:'intro', h:'Introduction',                      target:250, lab:10, max:true},
  {key:'concept',h:'Concept and Vision',               target:450, lab:3},
  {key:'market',h:'Market Analysis',                   target:650, lab:5},
  {key:'customer',h:'Customers and Customer Development',target:800,lab:4},
  {key:'compet',h:'Competition and Positioning',       target:550, lab:6},
  {key:'model', h:'Sustainable Business Model',        target:550, lab:7},
  {key:'proto', h:'Prototype Development',             target:400, lab:8},
  {key:'learn', h:'Learning and Adaptation',           target:350, lab:9}
];
const byKey=k=>SECS.find(s=>s.key===k);
const e=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* run fn with the example (or the team's work) as the lab's data */
function withData(example,fn){ const keep=S; if(example) S=JSON.parse(JSON.stringify(EXAMPLE)); try{ return fn(); } finally{ S=keep; } }
const filled=k=>{ const o=(S.sec||{})[k]; return !!o&&Object.values(o).some(v=>String(v||'').trim()); };

function section(k){
  const cfg=byKey(k);
  if(k==='exec'||k==='intro'){ const ip=introParts(); const t=k==='exec'?ip.exec:ip.intro; return {cfg,text:t,html:e(t).replace(/\n/g,'<br>'),svg:'',refs:[],ok:filled('intro')}; }
  const G=GENS[k], s=sec(k), r=G.gen(s);
  return {cfg,text:r.text,html:r.html,svg:G.illus&&filled(k)?G.illus(s,PRINT):'',refs:(r.refs||[]).map(card).filter(Boolean),ok:filled(k)};
}

function pageHTML(k,mode,n){
  const x=section(k), c=x.cfg, w=words(x.text);
  const tgt=c.target?`${c.max?'max ':'≈ '}${c.target} words`:'max 1 page · not counted';
  const write=mode==='edit'?`<a class="rp-w" href="report-lab.html#s${c.lab}">${x.ok?'Edit':'Write'} this section →</a>`:'';
  return `<section class="rp-pg" id="r-${k}"><header class="rp-hd"><span class="rp-n">${n}</span><h3>${e(c.h)}</h3><span class="rp-t">${tgt}${x.ok?` · draft ${w}`:''}</span></header>
    ${x.ok?`${x.svg?`<figure class="rp-fig">${x.svg}<figcaption>Figure: ${e(c.h)}</figcaption></figure>`:''}<p class="rp-p">${x.html}</p>`
      :`<div class="rp-empty"><span></span><span></span><span></span><span class="s"></span></div><p class="rp-p empty">Not written yet.</p>`}
    ${write}</section>`;
}

function cover(mode){
  const name=V('name'), L=sec('learn'), mem=[L.m1,L.m2,L.m3].filter(Boolean);
  const total=SECS.filter(c=>c.target).reduce((a,c)=>{ const x=section(c.key); return a+(x.ok?words(x.text):0); },0);
  return `<section class="rp-pg rp-cover"><img src="assets/cud-logo.png" alt="Canadian University Dubai" class="rp-logo">
    <div class="rp-ct"><span class="rp-k">Social Enterprise Project</span><h2>${e(name||'Venture name')}</h2><p>${e(V('idea')||'One line: what your venture is')}</p></div>
    <dl class="rp-meta"><dt>Team</dt><dd>${mem.length?mem.map(e).join('<br>'):'Names and student IDs'}</dd><dt>Course</dt><dd>ENT 142 · Fundamentals of Innovation and Entrepreneurship 2</dd><dt>Instructor</dt><dd>Eng. Nadia Mek</dd><dt>Word count</dt><dd>${total} of 4000 ${mode==='edit'?'(drafts; expand in Word)':''}</dd></dl>
    ${mode==='edit'?`<a class="rp-w" href="report-lab.html#s1">Edit the venture card →</a>`:''}</section>`;
}
function contents(){
  return `<section class="rp-pg"><header class="rp-hd"><h3>Contents</h3></header><ol class="rp-toc">${SECS.map(c=>`<li><a href="#r-${c.key}">${e(c.h)}</a><span>${c.target?(c.max?'max ':'≈ ')+c.target:'1 page'}</span></li>`).join('')}<li><a href="#r-refs">References</a><span>APA</span></li></ol></section>`;
}
function refs(){
  const R=S.data.slice().sort((a,b)=>a.org.localeCompare(b.org));
  return `<section class="rp-pg" id="r-refs"><header class="rp-hd"><h3>References</h3><span class="rp-t">APA 7</span></header>${R.length?`<ul class="rp-refs">${R.map(d=>`<li>${apa(d)}</li>`).join('')}</ul>`:'<p class="rp-p empty">Your verified data cards appear here.</p>'}</section>`;
}

function render(el,{mode='view',example=false}={}){
  withData(example,()=>{ el.innerHTML=`<div class="rp ${mode}">${cover(mode)}${contents()}${SECS.map((c,i)=>pageHTML(c.key,mode,i+1)).join('')}${refs()}</div>`; });
}
function page(el,k,example=true){ withData(example,()=>{ const i=SECS.findIndex(c=>c.key===k); el.innerHTML=`<div class="rp solo">${pageHTML(k,'view',i+1)}</div>`; }); }
function cov(el,example=true){ withData(example,()=>{ el.innerHTML=`<div class="rp solo">${cover('view')}</div>`; }); }
function done(k){ return withData(false,()=>filled(k==='exec'?'intro':k)); }

/* report map: cover, contents, 9 sections, references */
function thumb(k){
  const P=[['C','cover'],['≡','toc']].concat(SECS.map((c,i)=>[String(i+1),c.key])).concat([['R','refs']]);
  return `<svg class="rthumb" viewBox="0 0 132 140" role="img" aria-label="Where this section sits in the report">${P.map(([t,key],i)=>{ const x=4+(i%4)*32, y=4+Math.floor(i/4)*45, on=key===k;
    return `<rect x="${x}" y="${y}" width="28" height="40" rx="3" class="${on?'on':'off'}"/><text x="${x+14}" y="${y+25}" text-anchor="middle" class="${on?'ton':'toff'}">${t}</text>`; }).join('')}</svg>`;
}
window.Report={SECS,render,page,cover:cov,thumb,done,withData};
})();
