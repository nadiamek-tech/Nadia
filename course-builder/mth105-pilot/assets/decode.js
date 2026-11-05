/* Formula breakdown, Mind the Gap method: read the formula, decode each symbol, substitute, press the keys, answer.
   F.decode(el, {f, parts:[[key, meaning]], sub, keys, ans}) — build f with F.T(key, html), F.fr, F.sq, F.SG, F.XB. */
(function(){
  const T=(k,h)=>`<span class="tk" data-k="${k}">${h}</span>`;
  const fr=(n,d)=>`<span class="frac"><span class="num">${n}</span><span class="den">${d}</span></span>`;
  const sq=h=>`<span class="sqr"><span class="rt">√</span><span class="in">${h}</span></span>`;
  const SG='<span class="sig"><span class="S">Σ</span></span>';
  const XB='<span class="xb">x</span>';
  const PH='<span class="ph">p</span>';
  const v=s=>`<span class="v">${s}</span>`;
  const OPS=new Set(['+','−','×','÷','(',')','√','x²','^','-','/','*']);
  const keys=s=>`<div class="keys">${s.split(' ').filter(Boolean).map(k=>`<kbd class="${k==='='?'eq':OPS.has(k)?'op':''}">${k}</kbd>`).join('')}</div>`;

  function decode(el, o){
    const steps=[{tab:'Read',f:o.f,m:o.read||'Read it first. Which symbols do you know?'}];
    o.parts.forEach(([k,m])=>steps.push({tab:'Decode',f:o.f,hl:k,m}));
    steps.push({tab:'Substitute',f:o.sub,m:o.subNote||'Put the numbers in place of the symbols.'});
    if(o.keys) steps.push({tab:'Calculator',f:keys(o.keys),m:o.keyNote||'Type it exactly like this. Brackets matter.',raw:true});
    steps.push({tab:'Answer',f:o.ans,m:o.ansNote||'',raw:!!o.ansRaw});
    const tabs=[...new Set(steps.map(s=>s.tab))];
    el.innerHTML=`<div class="dc"><div class="dc-tabs">${tabs.map(t=>`<span data-t="${t}">${t}</span>`).join('')}</div><div class="stg"><div class="m"></div></div><div class="dc-meaning"></div>
      <div class="dc-nav"><button type="button" class="btn ghost prev">← Back</button><div class="dots">${steps.map(()=>'<i></i>').join('')}</div><button type="button" class="btn next">Next →</button></div></div>`;
    const m=el.querySelector('.m'), mean=el.querySelector('.dc-meaning'), prev=el.querySelector('.prev'), next=el.querySelector('.next'), dots=[...el.querySelectorAll('.dots i')], tb=[...el.querySelectorAll('.dc-tabs span')];
    let i=0;
    const show=()=>{ const s=steps[i];
      if(s.raw){ m.className=''; m.innerHTML=s.f; } else { m.className='m'+(s.hl?' focus':''); m.innerHTML=s.f; }
      if(s.hl) m.querySelectorAll(`.tk[data-k="${s.hl}"]`).forEach(t=>{ t.classList.add('hl'); t.querySelectorAll('.tk').forEach(c=>c.classList.add('lit')); let p=t.parentElement&&t.parentElement.closest('.tk'); while(p){ p.classList.add('anc'); p=p.parentElement&&p.parentElement.closest('.tk'); } });
      mean.innerHTML=s.m; dots.forEach((d,j)=>d.classList.toggle('on',j<=i)); tb.forEach(t=>t.classList.toggle('on',t.dataset.t===s.tab));
      prev.disabled=i===0; next.disabled=i===steps.length-1; next.textContent=i===steps.length-2?'Show answer →':'Next →'; };
    prev.addEventListener('click',()=>{ if(i>0){ i--; show(); } });
    next.addEventListener('click',()=>{ if(i<steps.length-1){ i++; show(); } });
    show();
  }
  window.F={T,fr,sq,SG,XB,PH,v,keys,decode};
})();
