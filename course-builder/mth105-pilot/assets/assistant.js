/* MTH 105 course assistant: answers only from the course (assets/kb.js) and the page index (assets/search-index.js).
   No AI, no internet. Always points the student somewhere useful. */
(function(){
  const KB=window.MTH105_KB||[], IDX=window.MTH105_INDEX||[];
  const page=(location.pathname.split('/').pop()||'index.html').replace(/^$/,'index.html');
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const STOP=new Set('a an the is are was were be do does did i we you our my me to of in on for and or what how why when where which who can should will with it this that about if your there any much many need tell explain please'.split(' '));
  const stem=w=>w.replace(/(ings|ing|ies|es|s|ed)$/,m=>m==='ies'?'y':'');
  const toks=s=>String(s).toLowerCase().replace(/[^a-z0-9.%\s]/g,' ').split(/\s+/).filter(w=>w&&!STOP.has(w)).map(stem);
  KB.forEach(e=>{ e._q=new Set(toks(e.q)); e._k=new Set(toks(e.k)); });
  IDX.forEach(e=>{ e._t=new Set(toks(e.t+' '+e.n)); e._x=new Set(toks(e.x)); });

  function scoreKB(qt,raw){ return KB.map(e=>{ let s=0; qt.forEach(t=>{ if(e._k.has(t)) s+=2; if(e._q.has(t)) s+=1.5; }); if(raw.length>5&&e.q.toLowerCase().includes(raw)) s+=3; return {e,s:s/Math.sqrt(qt.length||1)}; }).filter(r=>r.s>0).sort((a,b)=>b.s-a.s); }
  function scoreIdx(qt){ return IDX.map(e=>{ let s=0; qt.forEach(t=>{ if(e._t.has(t)) s+=2; if(e._x.has(t)) s+=1; }); return {e,s}; }).filter(r=>r.s>0).sort((a,b)=>b.s-a.s); }
  function search(q){ const raw=String(q).toLowerCase().trim(), qt=toks(q); return {kb:scoreKB(qt,raw),idx:scoreIdx(qt)}; }
  const label=l=>{ const [p,h]=l.split('#'); const it=IDX.find(e=>e.l===l); if(it) return `${it.pt} · ${it.n}`; return p==='index.html'?'Course home':p==='lab.html'?'Lab':p==='exams.html'?'Exams':p==='tools.html'?'Calculator and tools':p==='lectures.html'?'Lectures':/MindTheGap/.test(p)?'Mind the Gap · Workshop 2':p; };

  /* ---------- styles ---------- */
  const css=`
.ca-btn{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:10px 16px 10px 10px;background:var(--wk,#2F5BD3);color:var(--on-wk,#fff);font:700 .95rem var(--f-display,Arial,sans-serif);cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.18)}
.ca-btn .face{line-height:0}
.ca-panel{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:61;width:min(380px,calc(100vw - 32px));max-height:min(620px,calc(100vh - 110px));display:flex;flex-direction:column;background:var(--surface,#fff);color:var(--ink,#16202B);border:1px solid var(--line,#D6DDE5);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);overflow:hidden;font-family:var(--f-display,Arial,sans-serif)}
.ca-panel[hidden]{display:none}
.ca-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line,#D6DDE5)}
.ca-head b{flex:1;font-size:1rem}
.ca-head button{border:0;background:none;font-size:1.3rem;cursor:pointer;color:var(--muted,#5A6675)}
.ca-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.ca-m{max-width:90%;padding:9px 12px;border-radius:12px;font-size:.92rem;line-height:1.45;overflow-wrap:anywhere}
.ca-m.bot{align-self:flex-start;background:var(--sunk,#E9EDF2);border-bottom-left-radius:4px}
.ca-m.me{align-self:flex-end;background:var(--wk,#2F5BD3);color:var(--on-wk,#fff);border-bottom-right-radius:4px}
.ca-m a{color:inherit;font-weight:700}
.ca-m .ref{display:block;margin-top:5px;font:400 .72rem var(--f-mono,monospace);color:var(--muted,#5A6675)}
.ca-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 8px}
.ca-chips button{border:1px solid var(--wk,#2F5BD3);background:var(--wk-soft,rgba(47,91,211,.1));color:var(--ink,#16202B);border-radius:999px;padding:5px 10px;font:inherit;font-size:.82rem;cursor:pointer;text-align:left}
.ca-in{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;padding:10px 12px;border-top:1px solid var(--line,#D6DDE5)}
.ca-in input{min-width:0;padding:9px 11px;border:1px solid var(--line,#D6DDE5);border-radius:10px;background:var(--bg,#F3F5F8);color:var(--ink,#16202B);font:inherit;font-size:.92rem}
.ca-in button{border:0;border-radius:10px;padding:0 14px;background:var(--wk,#2F5BD3);color:var(--on-wk,#fff);font:inherit;font-weight:700;cursor:pointer}
@media (max-width:480px){.ca-btn .lbl{display:none}.ca-btn{padding:10px}}
@media print{.ca-btn,.ca-panel{display:none}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  /* ---------- page suggestions ---------- */
  const SUGGEST={'index.html':['When is the midterm?','How is the course graded?','How do I find the IQR?'],
    'week-01.html':['What is a parameter?','What are the types of data?','What is an outlier?'],
    'week-02.html':['How do I find the class width?','What is an ogive?','How do I know if a histogram is skewed?'],
    'week-03.html':['How do I find the mean?','How do I find the median?','How do I find Q1 and Q3?'],
    'week-05.html':['What is the addition rule?','How do I fill a Venn diagram?','What is the multiplication rule?'],
    'week-04.html':['How do I find the sample variance?','What is the coefficient of variation?','How do I find the IQR?'],
    'week-06.html':['How do I find E(X)?','How do I find k in a probability table?','How do I find Var(X)?'],
    'lectures.html':['Which lectures are available?','How do I find E(X)?','Is there an online calculator?'],
    'lab.html':['How do I turn on the Analysis ToolPak?','How do I submit my lab work?','Which Excel function gives the sample SD?'],
    'exams.html':['When is the midterm?','What does the midterm cover?','What is on the final exam?'],
    'tools.html':['How do I find the IQR?','How do I find the sample variance?','How do I find E(X)?'],
    'midterm-practice.html':['What is the addition rule?','How do I find Var(X)?','How do I use a tree diagram?']};
  const TOPICS=['Midterm date','Grading','Skewness','IQR','Variance','CV','Venn diagram','Tree diagram','Expected value'];

  /* ---------- UI ---------- */
  let panel,log,chips,input,opened=false;
  function go(l){ const [p,h]=l.split('#'); const n=h&&+h.replace('s','');
    if((p||'index.html')===page&&h&&!isNaN(n)){ const b=document.querySelectorAll('.toc ol li button')[n]; if(b){ b.click(); return; } }
    location.href=l; }
  function msg(html,who){ const d=document.createElement('div'); d.className='ca-m '+(who||'bot'); d.innerHTML=html; log.appendChild(d); log.scrollTop=log.scrollHeight; d.querySelectorAll('a[data-go]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); go(a.dataset.go); })); return d; }
  function setChips(list){ chips.innerHTML=''; list.forEach(t=>{ const b=document.createElement('button'); b.type='button'; b.textContent=t; b.addEventListener('click',()=>ask(t)); chips.appendChild(b); }); }
  const link=(l,txt)=>`<a href="${esc(l)}" data-go="${esc(l)}">${esc(txt||'Open: '+label(l))} →</a>`;

  function ask(q){
    q=String(q).trim(); if(!q) return; msg(esc(q),'me');
    const r=search(q), top=r.kb[0];
    if(top&&top.s>=1.6){
      msg(`${esc(top.e.a)}<br>${link(top.e.l)}${top.e.r?`<span class="ref">Read more: ${esc(top.e.r)}</span>`:''}`);
      setChips(r.kb.slice(1,4).filter(x=>x.s>=1).map(x=>x.e.q).concat(r.kb.length<2?(SUGGEST[page]||SUGGEST['index.html']):[]).slice(0,3));
      return; }
    const places=r.idx.filter(x=>x.s>=3).slice(0,3);
    if(places.length||(top&&top.s>=1)){
      msg(`Here is where the course covers that:${places.length?'<br>'+places.map(p=>'• '+link(p.e.l,`${p.e.pt} · ${p.e.n}`)).join('<br>'):''}${top?`<br><br>Closest answer: ${esc(top.e.a)} ${link(top.e.l,'More')}`:''}`);
      setChips((top?r.kb.slice(0,3).map(x=>x.e.q):[]).concat(SUGGEST[page]||[]).slice(0,3)); return; }
    msg(`Not found in this course. Pick a topic, or ask with a key word like “IQR”, “z-score” or “binomial”.`);
    setChips(TOPICS);
  }
  function build(){
    const btn=document.createElement('button'); btn.className='ca-btn'; btn.type='button'; btn.setAttribute('aria-label','Open the course assistant'); btn.innerHTML='<span class="face"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span><span class="lbl">Ask me</span>';
    panel=document.createElement('div'); panel.className='ca-panel'; panel.hidden=true; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Course assistant');
    panel.innerHTML=`<div class="ca-head"><b>Course assistant</b><button type="button" aria-label="Close">×</button></div><div class="ca-log" role="log" aria-live="polite"></div><div class="ca-chips"></div><form class="ca-in"><input type="text" id="ca-q" placeholder="Ask about the course…" aria-label="Your question" autocomplete="off"><button type="submit">Ask</button></form>`;
    document.body.append(btn,panel);
    log=panel.querySelector('.ca-log'); chips=panel.querySelector('.ca-chips'); input=panel.querySelector('#ca-q');
    const toggle=open=>{ panel.hidden=!open; if(open){ if(!opened){ opened=true; msg(`Ask about any topic, formula or date in the course. I point you to the right page.`); setChips(SUGGEST[page]||SUGGEST['index.html']); } input.focus(); } };
    btn.addEventListener('click',()=>toggle(panel.hidden));
    panel.querySelector('.ca-head button').addEventListener('click',()=>toggle(false));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!panel.hidden) toggle(false); });
    panel.querySelector('form').addEventListener('submit',e=>{ e.preventDefault(); const q=input.value; input.value=''; ask(q); });
    window.MTH105Assistant.open=q=>{ toggle(true); if(q) ask(q); };
  }
  window.MTH105Assistant={search,label,open:()=>{}};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
