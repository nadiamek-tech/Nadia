/* Narrated lecture engine (shared across Nadia's CUD courses; first built for GED 102).
   A week page calls Lecture.mount({...}) with its scenes. Each scene:
   { title, kind:'lecture'|'activity'|'check', minutes, narration:[html...], think, notes:[...], src,
     fig:{label, html?, build?(el, W)}, wide:bool } */
(function(){
  const store = {
    get(k){ try{ return localStorage.getItem(k) }catch(e){ return null } },
    set(k,v){ try{ localStorage.setItem(k,v) }catch(e){} }
  };
  const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const h = (tag, attrs={}, html='') => { const e=document.createElement(tag); for(const k in attrs){ if(k==='class') e.className=attrs[k]; else if(k.startsWith('on')) e.addEventListener(k.slice(2),attrs[k]); else e.setAttribute(k,attrs[k]); } if(html) e.innerHTML=html; return e; };

  /* ---------- theme (shared with hub) ---------- */
  function applyTheme(t){ if(t==='light'||t==='dark') document.documentElement.setAttribute('data-theme',t); else document.documentElement.removeAttribute('data-theme'); }
  function currentDark(){ const t=document.documentElement.getAttribute('data-theme'); if(t) return t==='dark'; return matchMedia('(prefers-color-scheme: dark)').matches; }
  applyTheme(store.get('ged102-theme'));
  function toggleTheme(){ const t=currentDark()?'light':'dark'; applyTheme(t); store.set('ged102-theme',t); }

  /* ---------- widgets ---------- */
  const W = {
    esc, h,
    quiz(el, qs){
      const wrap=h('div',{class:'quiz'}); let answered=0, right=0;
      const score=h('p',{class:'score'},`Score: 0 / ${qs.length}`);
      qs.forEach((q,qi)=>{
        const box=h('div',{class:'q'}); box.appendChild(h('h4',{},`${qi+1}. ${q.q}`));
        const opts=h('div',{class:'opts'}); const why=h('div',{class:'why feedback',hidden:''});
        q.o.forEach((o,oi)=>{
          const b=h('button',{class:'opt',type:'button'},esc(o));
          b.addEventListener('click',()=>{
            opts.querySelectorAll('button').forEach((x,xi)=>{x.disabled=true; if(xi===q.a) x.classList.add('right');});
            if(oi!==q.a) b.classList.add('wrong'); else right++;
            answered++; why.hidden=false; why.innerHTML=(oi===q.a?'<b>Correct.</b> ':'<b>Not quite.</b> ')+q.why;
            score.textContent=`Score: ${right} / ${qs.length}`+(answered===qs.length?(right===qs.length?' · full marks':' · review the scenes you missed'):'');
          });
          opts.appendChild(b);
        });
        box.append(opts,why); wrap.appendChild(box);
      });
      wrap.appendChild(score); el.appendChild(wrap);
    },
    sort(el, {buckets, items, reveal='Show suggested answers'}){
      const wrap=h('div',{class:'sort'}); const picks=new Array(items.length).fill(null);
      items.forEach((it,i)=>{
        const row=h('div',{class:'item'}); row.appendChild(h('p',{},it.t));
        const ch=h('div',{class:'choices'});
        buckets.forEach((b,bi)=>{ const bt=h('button',{type:'button','aria-pressed':'false'},esc(b)); bt.addEventListener('click',()=>{picks[i]=bi; ch.querySelectorAll('button').forEach((x,xi)=>x.setAttribute('aria-pressed',xi===bi))}); ch.appendChild(bt); });
        const why=h('div',{class:'why',hidden:''});
        row.append(ch,why); wrap.appendChild(row); it._why=why;
      });
      const btn=h('button',{class:'btn ghost',type:'button'},reveal);
      btn.addEventListener('click',()=>{ items.forEach((it,i)=>{ const ok=picks[i]===it.a; it._why.hidden=false; it._why.innerHTML=`<span class="tag ${picks[i]==null?'':ok?'good':'warn'}">${picks[i]==null?'not sorted':ok?'matches':'different view'}</span> Suggested: <b>${esc(buckets[it.a])}</b>. ${it.why}`; }); });
      wrap.appendChild(h('div',{class:'row'})).appendChild(btn);
      el.appendChild(wrap);
    },
    worksheet(el, {id, fields, title='Worksheet'}){
      const wrap=h('div',{class:'ws'}); const key='ged102-ws-'+id;
      let saved={}; try{ saved=JSON.parse(store.get(key)||'{}') }catch(e){}
      fields.forEach((f,i)=>{ const d=h('div',{class:'f'}); const fid=`${id}-${i}`;
        d.appendChild(h('label',{for:fid},esc(f.l))); if(f.hint) d.appendChild(h('small',{},esc(f.hint)));
        const ta=h('textarea',{id:fid,rows:f.rows||2}); ta.value=saved[i]||''; ta.placeholder=f.ph||'';
        ta.addEventListener('input',()=>{saved[i]=ta.value; store.set(key,JSON.stringify(saved));});
        d.appendChild(ta); wrap.appendChild(d); });
      const out=h('div',{class:'feedback',hidden:''});
      const copy=h('button',{class:'btn',type:'button'},'Copy my answers');
      copy.addEventListener('click',()=>{
        const txt=title+'\n\n'+fields.map((f,i)=>`${f.l}\n${(wrap.querySelector('#'+id+'-'+i).value||'—')}`).join('\n\n');
        const done=()=>{out.hidden=false; out.textContent='Copied. Paste it into your Moodle submission or group document.';};
        const fallback=()=>{ out.hidden=false; out.innerHTML=''; const ta=h('textarea',{rows:6}); ta.value=txt; out.append('Copying is blocked here. Select the text below and copy it:',ta); ta.select(); };
        try{ navigator.clipboard.writeText(txt).then(done,fallback);}catch(e){fallback()}
      });
      wrap.append(h('div',{class:'row'}),out); wrap.children[wrap.children.length-2].appendChild(copy);
      el.appendChild(wrap);
    },
    agenda(el, rows){
      const total=rows.reduce((a,r)=>a+r[1],0); let acc=0;
      const col=k=>k==='a'?'var(--wk)':k==='b'?'var(--line)':k==='c'?'var(--good)':'var(--muted)';
      el.innerHTML=`<div class="stack ui">${rows.map(([t,m,k])=>{ const s=acc; acc+=m; return `<div style="display:grid;grid-template-columns:minmax(0,1fr) 46px;gap:8px;align-items:center"><div><div style="font-size:.86rem;margin-bottom:3px">${t}</div><div style="height:10px;background:var(--sunk);border-radius:3px;position:relative"><div style="position:absolute;left:${s/total*100}%;width:${m/total*100}%;top:0;bottom:0;border-radius:3px;background:${col(k)}"></div></div></div><span class="mono" style="text-align:right">${m}′</span></div>`; }).join('')}
       <div class="legend" style="margin-top:4px"><span><i style="background:var(--muted)"></i>lecture</span><span><i style="background:var(--wk)"></i>activity</span><span><i style="background:var(--good)"></i>check</span><span>Total ${total} min</span></div></div>`;
    },
    picker(el, groups, hint='Select any item to see a real example.'){
      const keys=Object.keys(groups);
      el.innerHTML=`<div class="picker">${keys.map(k=>`<div><h4>${k}</h4>${groups[k].map((x,i)=>`<button type="button" data-k="${esc(k)}" data-i="${i}" aria-pressed="false">${x[0]}</button>`).join('')}</div>`).join('')}</div><div class="pick-detail">${hint}</div>`;
      const bs=el.querySelectorAll('.picker button'), d=el.querySelector('.pick-detail');
      bs.forEach(b=>b.addEventListener('click',()=>{ bs.forEach(x=>x.setAttribute('aria-pressed',x===b)); const [t,body]=groups[b.dataset.k][+b.dataset.i]; d.innerHTML=`<b>${t}</b>${keys.length>1?` · <span class="tag">${b.dataset.k}</span>`:''}<p>${body}</p>`; }));
      if(bs[0]) bs[0].click();
    },
    accordion(el, items){
      el.innerHTML=`<div class="acc">${items.map((it,i)=>`<details ${i===0?'open':''}><summary>${it.t}</summary>${it.s?`<p class="mono" style="color:var(--muted)">${it.s}</p>`:''}<p>${it.d}</p>${it.l?`<p><span class="tag good">Lesson</span> ${it.l}</p>`:''}</details>`).join('')}</div>`;
    },
    practice(el, items, opts={}){
      const label=opts.label||'Show hint', prefix=opts.prefix===undefined?'<b>A strong answer includes:</b> ':opts.prefix, qn=opts.numbered===false?'':'Q';
      const LS=window.LearningSupports, on=k=>!!(LS&&LS.on(k));
      const guided=on('guided'), single=on('single'), calm=on('calmstart'), aloud=on('voice');
      const say=t=>{ if(!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t.replace(/x̄/g,'x bar').replace(/σ/g,'sigma').replace(/Σ/g,'sum of').replace(/√/g,'square root of').replace(/≤/g,'less than or equal to').replace(/≥/g,'greater than or equal to').replace(/−/g,' minus ').replace(/×/g,' times ').replace(/÷/g,' divided by ')); speechSynthesis.speak(u); };
      const spk=`<button type="button" class="btn ghost spk" title="Read aloud" aria-label="Read aloud"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg></button>`;
      const store=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
      const gk=i=>'gate:'+location.pathname+':'+(opts.key||'p')+'-'+i, pk=i=>'pad:'+location.pathname+':'+(opts.key||'p')+'-'+i;
      const fieldHTML=(f,j)=>`<label class="gf"><span>${f.l||'Result'}</span>${f.opts?`<select data-j="${j}"><option value="">Choose…</option>${f.opts.map(o=>`<option>${o}</option>`).join('')}</select>`:`<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" data-j="${j}" aria-label="${(f.l||'Result').replace(/<[^>]+>/g,'')}">`}${f.u?`<em>${f.u}</em>`:''}<i class="gm" aria-hidden="true"></i></label>`;
      const gateHTML=(it,i)=>`<div class="gate" data-i="${i}"><div class="gs g1"><b>1</b><span>Solve it first: write your working in the pad (<b>Write</b>) and press <b>Save my working</b>, or work on paper.</span><label class="paper"><input type="checkbox"> I solved it on paper</label></div>
        <fieldset class="gs g2" disabled><b>2</b><span>Enter your result${it.check.length>1?'s':''}. Use your calculator.</span><div class="gfs">${it.check.map(fieldHTML).join('')}</div><button type="button" class="btn gchk">Check my result</button></fieldset><p class="gmsg" aria-live="polite"></p></div>`;
      const toNum=t=>{ t=String(t).trim().replace(/,/g,'.').replace(/\s+/g,''); if(!t) return null; const pct=/%$/.test(t); t=t.replace(/%$/,''); try{ const v=CALC.parse(CALC.tokenize(t,0)); return isFinite(v)?{v,pct}:null; }catch(e){ return null; } };
      const okField=(f,raw)=>{ if(f.opts) return String(raw)===String(f.v); const r=toNum(raw); if(!r) return false; const target=+f.v, tol=f.tol!=null?f.tol:(Math.abs(target)<1?0.0006:Math.max(0.01,Math.abs(target)*0.001));
        const cands=[r.v]; if(r.pct) cands.push(r.v/100); if(f.pct) cands.push(r.v*100); return cands.some(c=>Math.abs(c-target)<=tol+1e-12); };
      el.innerHTML=`<div class="prac${single?' single':''}">${calm?`<details class="calm-start" open><summary>Before you start · 2 minutes</summary><p>Write down any worries about this topic. Nobody sees it and it is not saved. Writing worries down before a test frees working memory for the maths (Ramirez &amp; Beilock, 2011).</p><textarea rows="3" aria-label="Your worries (not saved)"></textarea><p class="re">A faster heartbeat means your body is getting ready to perform. Mistakes here are expected: this is practice, not a test.</p><button type="button" class="btn calm-go">Start</button></details>`:''}${single?`<div class="pnav"><button type="button" class="btn ghost pv">← Previous</button><span class="pc"></span><button type="button" class="btn ghost nx">Next →</button></div>`:''}${items.map((it,i)=>`<div class="pq" data-i="${i}"><div class="row"><span class="qt">${qn?`<b>Q${i+1}</b> `:''}${it.type?`<span class="tag">${it.type}</span> `:''}${it.q}</span><span class="qb"><button type="button" class="btn ghost wbtn" title="Write your working with a finger or stylus">Write</button>${aloud?spk:''}${guided?'':`<button type="button" class="btn ghost show" data-i="${i}"${it.check?' disabled title="Enter the correct result first"':''}>${it.check?'Model answer (locked)':calm?'Compare with model working':label}</button>`}</span></div>${it.check?gateHTML(it,i):''}${guided?`<div class="guide"${it.check?' hidden':''}></div>`:''}<div class="padbox" hidden></div><div class="hint" hidden>${prefix}${it.hint}</div>${single?`<div class="selfmon"><span>Before moving on:</span><label><input type="checkbox"> I wrote what is given and what is asked</label><label><input type="checkbox"> I wrote the formula before the numbers</label><label><input type="checkbox"> I checked my answer makes sense</label></div>`:''}</div>`).join('')}</div>`;
      el.querySelectorAll('.pq .show').forEach(b=>b.addEventListener('click',()=>{ const h=b.closest('.pq').querySelector('.hint'); h.hidden=!h.hidden; b.textContent=h.hidden?(calm?'Compare with model working':label):'Hide'; }));
      el.querySelectorAll('.pq .wbtn').forEach(b=>b.addEventListener('click',()=>{ const pq=b.closest('.pq'), i=+pq.dataset.i, box=pq.querySelector('.padbox'); box.hidden=!box.hidden; b.textContent=box.hidden?'Write':'Hide writing';
        if(!box.hidden&&!box.dataset.on&&window.Pad){ box.dataset.on=1;
          box.innerHTML=`<div class="wspace"><div class="wpad"></div><div class="wcalc"></div></div>${items[i].check?'<button type="button" class="btn wsave">Save my working</button> <span class="wsaved" aria-live="polite"></span>':''}`;
          Pad.create(box.querySelector('.wpad'),{key:(opts.key||'p')+'-'+i,bg:'grid',name:'practice-'+(i+1),height:320,open:true});
          if(window.CASIO&&window.CALC) CASIO.mount(box.querySelector('.wcalc'));
          const sv=box.querySelector('.wsave'); if(sv) sv.addEventListener('click',()=>{ let n=0; try{ n=JSON.parse(localStorage.getItem(pk(i))||'[]').length; }catch(e){}
            const msg=box.querySelector('.wsaved'); if(!n){ msg.textContent='Write your working in the pad first.'; return; } msg.textContent='Saved on this device.'; step2(pq); }); } }));
      const step2=pq=>{ const g=pq.querySelector('.gate'); if(!g) return; g.querySelector('.g1').classList.add('done'); g.querySelector('.g2').disabled=false; };
      const unlock=(pq,i,fromStore,recap)=>{ const g=pq.querySelector('.gate'); g.classList.add('open'); if(recap) g.classList.add('recap'); g.querySelector('.g1').classList.add('done'); g.querySelector('.g2').disabled=true;
        g.querySelector('.gmsg').innerHTML=fromStore?'The model answer is open.':'<b>Correct.</b> Now compare your working with the model answer.';
        const sb=pq.querySelector('.show'); if(sb){ sb.disabled=false; sb.removeAttribute('title'); sb.textContent=label; }
        const gd=pq.querySelector('.guide'); if(gd) gd.hidden=false; };
      el.querySelectorAll('.pq').forEach(pq=>{ const i=+pq.dataset.i, it=items[i], g=pq.querySelector('.gate'); if(!g) return;
        let prof=false; try{ prof=localStorage.getItem('mth105-prof')==='1'; }catch(e){}
        if(prof||store(gk(i))==='open'){ unlock(pq,i,true); return; }
        g.querySelector('.paper input').addEventListener('change',e=>{ if(e.target.checked) step2(pq); });
        let tries=0;
        g.querySelector('.gchk').addEventListener('click',()=>{ let all=true;
          it.check.forEach((f,j)=>{ const inp=g.querySelector(`[data-j="${j}"]`), ok=okField(f,inp.value); inp.closest('.gf').classList.toggle('ok',ok); inp.closest('.gf').classList.toggle('bad',!ok); all=all&&ok; });
          if(all){ store(gk(i),'open'); unlock(pq,i); return; }
          tries++;
          if(tries<3){ g.querySelector('.gmsg').innerHTML=`<b>Not yet.</b> Check the ${it.check.length>1?'results marked in red':'result'}: go back to your working, then try again. <span class="gtries">Try ${tries} of 3.</span>`; return; }
          /* third wrong try: short recap of what to revise, then the model answer opens */
          store(gk(i),'open'); unlock(pq,i,false,true);
          g.querySelector('.gmsg').innerHTML=`<div class="grecap"><b>Revise this first</b><div>${it.revise||'Go back to the formula for this question in the lecture: write it, decode each symbol, then put the numbers in with brackets.'}</div>${it.see?`<a href="${it.see.href}">${it.see.t} →</a>`:''}<p>Then compare your working with the model answer below, line by line.</p></div>`;
          const sb=pq.querySelector('.show'), h=pq.querySelector('.hint'); if(sb&&h&&h.hidden){ h.hidden=false; sb.textContent='Hide'; } }); });
      el.querySelectorAll('.pq .spk').forEach(b=>b.addEventListener('click',()=>{ const pq=b.closest('.pq'); say(pq.querySelector('.qt').innerText); }));
      if(calm){ const c=el.querySelector('.calm-go'); c.addEventListener('click',()=>{ const d=el.querySelector('.calm-start'); d.querySelector('textarea').value=''; d.open=false; }); }
      if(guided) el.querySelectorAll('.pq').forEach(pq=>{
        const hint=pq.querySelector('.hint'), g=pq.querySelector('.guide');
        const tmp=document.createElement('div'); tmp.innerHTML=hint.innerHTML;
        let parts; const mg=tmp.querySelector('.mg');
        const bds=[...tmp.querySelectorAll('.bd-g')];
        if(bds.length) parts=[...tmp.children].flatMap(c=>c.classList.contains('bd')?[...c.querySelectorAll('.bd-g')].map(g=>`<div class="bd">${g.outerHTML}</div>`):c.classList.contains('mg')?[...c.children].filter(x=>!x.classList.contains('how')).map(x=>`<div class="mg">${x.outerHTML}</div>`):c.classList.contains('bd-foot')?[]:[c.outerHTML]);
        else if(mg) parts=[...mg.children].filter(c=>!c.classList.contains('how')).map(c=>c.outerHTML);
        else { const blocks=[...tmp.children].filter(c=>/^(DIV|P|UL|OL|TABLE)$/.test(c.tagName)); parts=blocks.length>1?blocks.map(c=>c.outerHTML):tmp.innerHTML.split(/(?<=[.:])\s+(?=[A-Z<])/).filter(x=>x.trim()); }
        const stages=[
          ['Read','What is given? What is asked? Say it in your own words.'],
          ['Plan','Which formula or rule fits? Write it in symbols before using any numbers.'],
          ['Estimate','Roughly how big should the answer be?'],
          ['Solve','Work it out on paper, then compare one step at a time. For each step, say which rule it uses.'],
          ['Check','Does your answer match your estimate? Are the units right?']];
        let st=0, k=0;
        const draw=()=>{ g.innerHTML=`<ol class="gsteps">${stages.map(([t,d],i)=>`<li class="${i<st?'done':i===st?'cur':'todo'}"><b>${t}</b>${i<=st?` <span>${d}</span>`:''}${i===3&&st>=3?`<div class="wsteps">${parts.slice(0,k).map(x=>`<div class="ws">${x}</div>`).join('')}</div>`:''}</li>`).join('')}</ol><div class="gbtn">${
            st<3?`<button type="button" class="btn g-next">Done: next stage →</button>`:st===3?(k<parts.length?`<button type="button" class="btn g-step">Show worked step ${k+1} of ${parts.length}</button>`:`<button type="button" class="btn g-next">Done: check →</button>`):'<span class="gok">Finished. Try the next question without the steps.</span>'}${aloud?' '+spk:''}</div>`;
          const n=g.querySelector('.g-next'); if(n) n.onclick=()=>{ st++; draw(); };
          const s2=g.querySelector('.g-step'); if(s2) s2.onclick=()=>{ k++; draw(); };
          const sp=g.querySelector('.spk'); if(sp) sp.onclick=()=>{ const c=g.querySelector('li.cur')||g.querySelector('li:last-child'); say(c.innerText); };
        };
        draw();
      });
      if(single){ const qs=[...el.querySelectorAll('.pq')]; let c=0; const pc=el.querySelector('.pc');
        const show=()=>{ qs.forEach((q,i)=>q.hidden=i!==c); pc.textContent=`Question ${c+1} of ${qs.length}`; el.querySelector('.pv').disabled=c===0; el.querySelector('.nx').disabled=c===qs.length-1; };
        el.querySelector('.pv').onclick=()=>{ if(c>0){ c--; show(); } }; el.querySelector('.nx').onclick=()=>{ if(c<qs.length-1){ c++; show(); } }; show(); }
    },
    flashcards(el, cards){
      el.innerHTML=`<div class="fc-tools"><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" class="fc-mode"> Self-test: hide the meanings</label><span class="mono fc-score"></span></div><div class="fc">${cards.map(([t,d])=>`<button type="button"><b>${t}</b><span>${d}</span></button>`).join('')}</div>`;
      const grid=el.querySelector('.fc'), score=el.querySelector('.fc-score');
      const upd=()=>{ const k=grid.querySelectorAll('.known').length; score.textContent=grid.classList.contains('test')?`${k} / ${cards.length} known`:''; };
      el.querySelector('.fc-mode').addEventListener('change',e=>{ grid.classList.toggle('test',e.target.checked); grid.querySelectorAll('button').forEach(b=>b.classList.remove('open','known')); upd(); });
      grid.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ if(!grid.classList.contains('test')) return; if(b.classList.contains('open')) b.classList.toggle('known'); else b.classList.add('open'); upd(); }));
    },
    order(el, items, prompt='Click the events in the order they happened, oldest first.'){
      const sorted=[...items].sort((a,b)=>a.y-b.y); let next=0;
      const shuffled=[...items].sort(()=>Math.random()-.5);
      el.innerHTML=`<p class="ui" style="margin:0 0 8px">${prompt}</p><div class="order">${shuffled.map(it=>`<button type="button" data-y="${it.y}">${it.t}</button>`).join('')}</div><div class="feedback" style="margin-top:10px"></div>`;
      const fb=el.querySelector('.feedback'); let miss=0;
      fb.textContent=`0 of ${items.length} placed`;
      el.querySelectorAll('.order button').forEach(b=>b.addEventListener('click',()=>{
        if(b.classList.contains('done')) return;
        if(+b.dataset.y===sorted[next].y){ b.classList.add('done'); b.innerHTML=`<span class="yr">${b.dataset.y}</span> · ${b.innerHTML}`; next++; fb.textContent= next===items.length?`Done with ${miss} wrong click${miss===1?'':'s'}.`:`${next} of ${items.length} placed`; }
        else { miss++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); }
      }));
    },
    video(el, v){
      const embed=!/claude|anthropic/.test(location.hostname);
      const url=`https://www.youtube.com/watch?v=${v.id}${v.start?`&t=${v.start}s`:''}`;
      const box=h('div',{class:'video'});
      box.innerHTML=(embed?`<div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}${v.start?`?start=${v.start}`:''}" title="${esc(v.title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
        :`<a class="vcard" href="${url}" target="_blank" rel="noopener"><span class="vplay">▶</span><span><b>Watch on YouTube ↗</b><small>Opens in a new tab</small></span></a>`)
        +`<div class="vmeta"><span class="eyebrow">Watch · ${esc(v.by)}</span><b>${esc(v.title)}</b>${v.why?`<p>${v.why}</p>`:''}${embed?`<a href="${url}" target="_blank" rel="noopener">Open on YouTube ↗</a>`:''}</div>`;
      el.appendChild(box);
    },
    flow(el, steps, opts={}){
      const wrap=h('div',{class:'flow ui'});
      wrap.innerHTML=`<div class="fsteps">${steps.map((s,i)=>`<button type="button" class="fstep" data-i="${i}"><span class="fn">${i+1}</span><b>${s.t}</b>${s.s?`<small>${s.s}</small>`:''}</button>`).join('<span class="farrow" aria-hidden="true">→</span>')}</div>
        <div class="row" style="margin-top:10px"><button type="button" class="btn fplay">▶ Play the flow</button>${opts.note?`<span class="mono" style="color:var(--muted)">${opts.note}</span>`:''}</div><div class="fdetail feedback" style="margin-top:8px">Press play, or click any step.</div>`;
      const bs=[...wrap.querySelectorAll('.fstep')], d=wrap.querySelector('.fdetail'); let timer=null;
      const show=i=>{ bs.forEach((b,j)=>{ b.classList.toggle('on',j===i); b.classList.toggle('done',j<i); }); d.innerHTML=`<b>Step ${i+1} · ${steps[i].t}.</b> ${steps[i].d||''}`; };
      bs.forEach((b,i)=>b.addEventListener('click',()=>{ clearInterval(timer); timer=null; show(i); }));
      wrap.querySelector('.fplay').addEventListener('click',()=>{ clearInterval(timer); let i=0; show(0); timer=setInterval(()=>{ i++; if(i>=steps.length){ clearInterval(timer); timer=null; return; } show(i); },2200); });
      el.appendChild(wrap);
    },
    mindmap(el, {center, branches}){
      const wrap=h('div',{class:'mmap'}); el.appendChild(wrap); let sel=0;
      const narrow=()=> (el.clientWidth||600) < 560;
      const draw=()=>{
        if(narrow()){
          wrap.innerHTML=`<div class="mm-center">${esc(center)}</div><div class="acc">${branches.map((b,i)=>`<details ${i===sel?'open':''}><summary>${esc(b.t)}</summary><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul></details>`).join('')}</div>`; return; }
        const W0=660, n=branches.length, H=Math.max(300, n*58+40), cy=H/2;
        const by=i=>40+(H-80)*(n===1?.5:i/(n-1));
        const leaves=branches[sel].items, m=leaves.length, ly=j=>cy+(j-(m-1)/2)*Math.min(46,(H-40)/Math.max(m,1));
        let svg=`<svg viewBox="0 0 ${W0} ${H}" role="img" aria-label="Mind map: ${esc(center)}">`;
        branches.forEach((b,i)=>{ svg+=`<path d="M150 ${cy} C200 ${cy} 190 ${by(i)} 240 ${by(i)}" fill="none" stroke="${i===sel?'var(--wk)':'var(--line)'}" stroke-width="${i===sel?3:2}"/>`; });
        leaves.forEach((x,j)=>{ svg+=`<path d="M410 ${by(sel)} C440 ${by(sel)} 430 ${ly(j)} 462 ${ly(j)}" fill="none" stroke="var(--wk)" stroke-width="1.5" opacity=".7"/>`; });
        svg+=`<rect x="14" y="${cy-34}" width="136" height="68" rx="34" fill="var(--wk)"/><foreignObject x="20" y="${cy-30}" width="124" height="60"><div xmlns="http://www.w3.org/1999/xhtml" class="mm-c">${esc(center)}</div></foreignObject>`;
        branches.forEach((b,i)=>{ svg+=`<g class="mm-b" data-i="${i}" tabindex="0" role="button" aria-pressed="${i===sel}"><rect x="240" y="${by(i)-20}" width="170" height="40" rx="10" fill="${i===sel?'var(--wk-soft)':'var(--bg)'}" stroke="${i===sel?'var(--wk)':'var(--line)'}" stroke-width="1.5"/><foreignObject x="246" y="${by(i)-18}" width="158" height="36"><div xmlns="http://www.w3.org/1999/xhtml" class="mm-t">${esc(b.t)}</div></foreignObject></g>`; });
        leaves.forEach((x,j)=>{ svg+=`<circle cx="466" cy="${ly(j)}" r="4" fill="var(--wk)"/><foreignObject x="474" y="${ly(j)-21}" width="182" height="42"><div xmlns="http://www.w3.org/1999/xhtml" class="mm-l">${x}</div></foreignObject>`; });
        svg+='</svg>'; wrap.innerHTML=svg+`<p class="mono" style="color:var(--muted);margin:4px 0 0">Click a branch to open it.</p>`;
        wrap.querySelectorAll('.mm-b').forEach(g=>{ const go=()=>{ sel=+g.dataset.i; draw(); }; g.addEventListener('click',go); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();go();} }); });
      };
      draw(); requestAnimationFrame(draw); let rt; addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ if(document.body.contains(wrap)) draw(); },150); });
    },
    poll(el, {q, opts, reveal}){
      const wrap=h('div',{class:'poll ui'}); wrap.appendChild(h('p',{style:'margin:0 0 4px;font-weight:600'},esc(q)));
      const msg=h('div',{class:'feedback',hidden:''});
      opts.forEach((o,i)=>{ const b=h('button',{class:'o',type:'button','aria-pressed':'false'},`<span>${esc(o)}</span><span class="tag">${String.fromCharCode(65+i)}</span>`);
        b.addEventListener('click',()=>{ wrap.querySelectorAll('button.o').forEach(x=>x.setAttribute('aria-pressed',x===b)); msg.hidden=false; msg.innerHTML=reveal(i); });
        wrap.appendChild(b); });
      wrap.appendChild(msg); el.appendChild(wrap);
    }
  };

  /* ---------- narration (Web Speech API) ---------- */
  const synth = window.speechSynthesis;
  let speaking=false, queue=[], qi=0, voice=null;
  function pickVoice(){ if(!synth) return; const vs=synth.getVoices(); voice=vs.find(v=>/en-GB/.test(v.lang)&&/female|Serena|Kate|Libby|Sonia|Google UK English Female/i.test(v.name))||vs.find(v=>/^en/.test(v.lang))||null; }
  if(synth){ pickVoice(); synth.onvoiceschanged=pickVoice; }

  /* ---------- mount ---------- */
  const box=(cls,lbl)=>html=>`<div class="box ${cls}"><b class="lbl">${lbl}</b>${html}</div>`;
  const B = { plain:box('plain','In plain words'), ex:box('ex','Simple example'), exam:box('exam','Remember for the exam'), risk:box('plain','Risks and ethics') };
  window.Lecture = { W, B, mount(cfg){ if(window.Lecture.__noLogo) cfg.noLogo=true;
    document.title = cfg.pageTitle || document.title;
    const S = cfg.scenes; let cur = 0;
    const seen = new Set(JSON.parse(store.get('ged102-seen-'+cfg.id)||'[]'));
    document.body.dataset.layout = 'even';
    if(store.get('ged102-teacher')==='1') document.body.classList.add('teacher');

    const bar=h('header',{class:'bar'});
    bar.innerHTML=`<div class="bar-in">
      <a class="brand" href="${cfg.home||'index.html'}" title="Back"><b>${esc(cfg.course||'GED 102')}</b><span>← ${esc(cfg.homeLabel||'Course map')} · ${esc(cfg.short)}</span></a>
      <div class="controls">
        <button type="button" class="pill listen" id="listen" aria-pressed="false" title="Reads each scene aloud and moves on to the next; press again to pause">▶ Listen</button>
        ${cfg.noTeacher?'':'<button type="button" class="pill" id="teach" aria-pressed="false" title="Show timings and facilitation notes">Teacher notes</button>'}
        <button type="button" class="pill" id="theme" title="Switch light or dark">◐ Theme</button>
      </div></div><div class="progress"><i></i></div>`;
    document.body.appendChild(bar);

    const shell=h('div',{class:'shell'});
    const toc=h('nav',{class:'toc','aria-label':'Scenes'});
    toc.innerHTML=`<div class="eyebrow">${cfg.eyebrow||`Week ${cfg.week} · CLO ${cfg.clo}`}</div><h1>${esc(cfg.title)}</h1>
      <div class="meta">${esc(cfg.meta)}</div><div class="meta">Instructor: <b>${esc(cfg.instructor||'Eng. Nadia Mek')}</b></div>`;
    const ol=h('ol'); toc.appendChild(ol);
    S.forEach((s,i)=>{ const li=h('li'); const b=h('button',{type:'button'},`<span class="n">${String(i).padStart(2,'0')}</span><span class="t">${esc(s.nav||s.title)}${s.kind&&s.kind!=='lecture'?`<span class="kind">${{check:'quiz',activity:'activity',exam:'exam',review:'review'}[s.kind]}</span>`:''}</span>`); b.addEventListener('click',()=>go(i)); li.appendChild(b); ol.appendChild(li); });
    const stage=h('main',{class:'stage',id:'stage'});
    shell.append(toc,stage); document.body.appendChild(shell);
    document.body.appendChild(h('p',{class:'support-note'},'This website is interactive course support. It does not replace classes, attendance or class activities.'));

    // controls
    const segBtns=bar.querySelectorAll('.seg button');
    const setLayout=l=>{ document.body.dataset.layout=l; };
    
    const teach=bar.querySelector('#teach');
    if(teach){ const syncTeach=()=>teach.setAttribute('aria-pressed',document.body.classList.contains('teacher'));
    teach.addEventListener('click',()=>{document.body.classList.toggle('teacher'); store.set('ged102-teacher',document.body.classList.contains('teacher')?'1':'0'); syncTeach();}); syncTeach(); }
    else document.body.classList.remove('teacher');
    bar.querySelector('#theme').addEventListener('click',toggleTheme);
    const listen=bar.querySelector('#listen');
    listen.addEventListener('click',()=>{ speaking?stop():speak(); });

    // Natural recorded narration (Kokoro TTS, pre-generated into audio/) with browser speech as fallback.
    const pageKey=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'');
    let rec=null, player=null;
    fetch('audio/manifest.json').then(r=>r.ok?r.json():null).then(m=>{ if(m&&m.pages&&m.pages[pageKey]){ rec=m.pages[pageKey]; listen.title='Natural narration'; } }).catch(()=>{});
    const paras=()=>[...stage.querySelectorAll('.narr .para, .narr .think')].filter(e=>!e.querySelector('table'));
    const clear=()=>stage.querySelectorAll('.speaking').forEach(e=>e.classList.remove('speaking'));

    function stop(){ speaking=false; if(synth) synth.cancel(); if(player){ player.pause(); player.onended=null; player=null; } listen.setAttribute('aria-pressed','false'); listen.textContent='▶ Listen'; clear(); }
    function speak(){
      const files=rec&&rec[cur];
      if(!files&&!synth){ listen.textContent='Narration not supported in this browser'; return; }
      if(synth) synth.cancel(); speaking=true; listen.setAttribute('aria-pressed','true'); listen.textContent='❚❚ Pause';
      if(document.body.dataset.layout==='diagram') setLayout('even');
      queue=paras(); qi=0;
      (files&&files.length===queue.length) ? nextRec(files) : next();
    }
    function finish(){
      clear();
      if(cur<S.length-1){ go(cur+1); setTimeout(speak,500); }
      else stop();
    }
    function nextRec(files){
      clear(); if(!speaking) return;
      if(qi>=queue.length){ finish(); return; }
      const el=queue[qi]; const src='audio/'+files[qi]; qi++;
      el.classList.add('speaking'); el.scrollIntoView({block:'nearest',behavior:'smooth'});
      player=new Audio(src); player.onended=()=>{ if(speaking) nextRec(files); };
      player.play().catch(()=>{ player=null; qi--; next(); });
    }
    function next(){
      clear();
      if(!speaking) return;
      if(qi>=queue.length){ finish(); return; }
      if(!synth){ stop(); return; }
      const el=queue[qi++]; el.classList.add('speaking'); el.scrollIntoView({block:'nearest',behavior:'smooth'});
      const u=new SpeechSynthesisUtterance(el.innerText.replace(/^Pause and think\s*/i,'Pause and think. ')); if(voice) u.voice=voice; u.rate=0.98;
      u.onend=()=>{ if(speaking) next(); }; u.onerror=()=>{ if(speaking) next(); };
      synth.speak(u);
    }

    function render(){
      const s=S[cur]; stop(); stage.innerHTML='';
      const kindLabel={lecture:'Lecture',activity:'In-class activity',check:'Check your understanding',exam:'Exam takeaways',review:'Review'}[s.kind||'lecture'];
      const head=h('div',{class:'scene-head'});
      head.innerHTML=`<div><div class="eyebrow">Scene ${cur} of ${S.length-1}</div><h2>${s.title}</h2></div>
        <div class="chips"><span class="chip k-${s.kind||'lecture'}">${kindLabel}</span>${s.minutes?`<span class="chip">${s.minutes} min</span>`:''}</div>`;
      stage.appendChild(head);
      const split=h('div',{class:'split'+(s.fig?'':' nofig')+(s.wide?' wide':'')+(s.full?' full':'')});
      const narr=h('div',{class:'narr'});
      (s.narration||[]).forEach((p,i)=>{ const isList=/^\s*<(ul|div|table)/.test(p); const d=h('div',{class:'para'+(i===0&&!isList?' lead':'')}); d.innerHTML=p; narr.appendChild(d); });
      if(s.think) narr.appendChild(h('div',{class:'think'},`<span class="eyebrow">Pause and think</span>${s.think}`));
      if(s.video){ const vd=h('div',{class:'videos'}); [].concat(s.video).forEach(v=>W.video(vd,v)); narr.appendChild(vd); }
      if(s.src) narr.appendChild(h('div',{class:'src'},s.src));
      if(s.notes) narr.appendChild(h('div',{class:'notes'},`<span class="eyebrow">Teacher notes${s.minutes?` · ${s.minutes} min`:''}</span><ul>${s.notes.map(n=>`<li>${n}</li>`).join('')}</ul>`));
      split.appendChild(narr);
      if(s.fig){ const f=h('figure',{class:'fig',style:'margin:0'}); if(s.fig.label) f.appendChild(h('span',{class:'eyebrow'},esc(s.fig.label)));
        if(s.fig.mindmap){ const mm=h('div',{style:'margin-bottom:18px'}); f.appendChild(mm); W.mindmap(mm,s.fig.mindmap); }
        if(s.fig.flow){ const fl=h('div',{style:'margin-bottom:18px'}); f.appendChild(fl); W.flow(fl,s.fig.flow,{note:s.fig.flowNote}); }
        const body=h('div'); if(s.fig.html) body.innerHTML=s.fig.html; f.appendChild(body); if(s.fig.caption) f.appendChild(h('figcaption',{class:'caption'},s.fig.caption)); split.appendChild(f); if(s.fig.build) s.fig.build(body,W); }
      stage.appendChild(split);
      const pager=h('div',{class:'pager'});
      const prev=h('button',{type:'button',class:'prev'},`<small>← Previous</small>${cur>0?esc(S[cur-1].nav||S[cur-1].title):'Start'}`); prev.disabled=cur===0; prev.addEventListener('click',()=>go(cur-1));
      const nxt=h('button',{type:'button',class:'next'},`<small>Next →</small>${cur<S.length-1?esc(S[cur+1].nav||S[cur+1].title):(cfg.endLabel||'End of lecture')}`); nxt.disabled=cur===S.length-1; nxt.addEventListener('click',()=>go(cur+1));
      pager.append(prev,h('span',{class:'kbd'},'← → keys'),nxt); stage.appendChild(pager);
      ol.querySelectorAll('li').forEach((li,i)=>{ li.querySelector('button').setAttribute('aria-current',i===cur); li.classList.toggle('seen',seen.has(i)); });
      const cb=ol.children[cur].querySelector('button'); if(cb.scrollIntoView && innerWidth<900) cb.scrollIntoView({block:'nearest',inline:'center'});
      bar.querySelector('.progress i').style.width=(cur/(S.length-1)*100)+'%';
      seen.add(cur); store.set('ged102-seen-'+cfg.id,JSON.stringify([...seen]));
    }
    function go(i,fromHash){ if(i<0||i>=S.length) return; cur=i; render(); if(!fromHash) try{ history.replaceState(null,'','#s'+i);}catch(e){} window.scrollTo({top:0}); }
    addEventListener('keydown',e=>{ if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; if(e.key==='ArrowRight') go(cur+1); if(e.key==='ArrowLeft') go(cur-1); });
    const m=location.hash.match(/^#s(\d+)$/); go(m?Math.min(+m[1],S.length-1):0,true);
  }};
  window.GED102Theme = { toggle: toggleTheme };
})();
