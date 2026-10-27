/* ENT 141 shared helpers: storage, SDG picker, triple bottom line, assessment weights, pitch timer, rubric renderer. */
(function(){
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SDGS=['No poverty','Zero hunger','Good health and well-being','Quality education','Gender equality','Clean water and sanitation','Affordable and clean energy','Decent work and economic growth','Industry, innovation and infrastructure','Reduced inequalities','Sustainable cities and communities','Responsible consumption and production','Climate action','Life below water','Life on land','Peace, justice and strong institutions','Partnerships for the goals'];

/* assessment weights (syllabus section 8) */
const ASSESS=[['Project 1 · Poster',30,'Week 9'],['Project 1 · Presentation',10,'Week 9'],['Project 2 · Idea Validation Report',40,'Week 16'],['Activity 1 · video pitch',10,'Week 4'],['Activity 2 · article or case',10,'Week 11']];
function weights(el){
  let x=0; const cols=['var(--wk)','color-mix(in srgb,var(--wk) 55%,var(--bg))','color-mix(in srgb,var(--wk) 30%,var(--bg))','var(--muted)','color-mix(in srgb,var(--muted) 55%,var(--bg))'];
  el.innerHTML=`<svg viewBox="0 0 600 60" style="width:100%;height:auto" role="img" aria-label="Assessment weights">${ASSESS.map(([t,w],i)=>{ const r=`<rect x="${x*6}" y="6" width="${w*6-2}" height="40" rx="4" fill="${cols[i]}"/><text x="${x*6+w*3}" y="32" text-anchor="middle" font-family="Schibsted Grotesk,Arial" font-weight="700" font-size="14" fill="${i<1?'var(--on-wk)':'var(--ink)'}">${w}%</text>`; x+=w; return r; }).join('')}</svg>
  <table class="tbl" style="margin-top:8px"><thead><tr><th>Assessment</th><th>Weight</th><th>Due</th></tr></thead><tbody>${ASSESS.map(a=>`<tr><td>${a[0]}</td><td>${a[1]}%</td><td>${a[2]}</td></tr>`).join('')}</tbody></table>`;
}

/* SDG picker: one main goal + up to two secondary goals */
function sdgPicker(el,key){
  key=key||'ent141-sdg'; let st={p:null,s:[]}; try{st=JSON.parse(store.get(key)||'null')||st}catch(e){}
  const draw=()=>{
    el.innerHTML=`<p class="mono" style="color:var(--muted);margin:0 0 8px">First click = main goal. Next clicks = up to 2 secondary goals. Click again to remove.</p><div class="sdg">${SDGS.map((t,i)=>{ const n=i+1; return `<button type="button" data-n="${n}" aria-pressed="${st.p===n}" class="${st.s.includes(n)?'sec':''}"><b>${n}</b>${t}</button>`; }).join('')}</div>
     <div class="feedback" style="margin-top:10px">${st.p?`<b>Main goal: SDG ${st.p}, ${SDGS[st.p-1]}.</b>${st.s.length?` Secondary: ${st.s.map(n=>'SDG '+n).join(', ')}.`:''}<br>Read its <b>targets</b> at <a href="https://sdgs.un.org/goals/goal${st.p}" target="_blank" rel="noopener">sdgs.un.org/goals/goal${st.p}</a> and pick the one your team's problem relates to.`:'Choose your main goal.'}</div>`;
    el.querySelectorAll('.sdg button').forEach(b=>b.addEventListener('click',()=>{ const n=+b.dataset.n;
      if(st.p===n){ st.p=st.s.shift()||null; } else if(st.s.includes(n)){ st.s=st.s.filter(x=>x!==n); } else if(!st.p){ st.p=n; } else if(st.s.length<2){ st.s.push(n); }
      store.set(key,JSON.stringify(st)); draw(); }));
  };
  draw();
}

/* triple bottom line triangle with sliders */
function tbl(el,key,init){
  key=key||'ent141-tbl'; let st; try{st=JSON.parse(store.get(key)||'null')}catch(e){}
  if(!st) st=init||{people:{v:3,t:'People: who benefits, and how many?'},planet:{v:3,t:'Planet: what harm is reduced?'},profit:{v:3,t:'Profit: who pays, and why?'}};
  const P=[['people','People'],['planet','Planet'],['profit','Profit']];
  el.innerHTML=`<div class="tbl3">${P.map(([k,l])=>`<div class="r"><b>${l}</b><input type="text" id="t-${k}" value="${esc(st[k].t)}" aria-label="${l} indicator"><span><input type="range" id="r-${k}" min="1" max="5" value="${st[k].v}" aria-label="${l} score"> <span class="mono" id="v-${k}">${st[k].v}</span></span></div>`).join('')}<div id="tri"></div><div class="feedback" id="tri-o"></div></div>`;
  const draw=()=>{ const cx=170,cy=150,R=110; const ang=[-90,30,150].map(a=>a*Math.PI/180); const pt=(i,v)=>[cx+Math.cos(ang[i])*R*v/5,cy+Math.sin(ang[i])*R*v/5];
    const grid=[1,2,3,4,5].map(g=>`<polygon points="${[0,1,2].map(i=>pt(i,g).join(',')).join(' ')}" fill="none" stroke="var(--line)"/>`).join('');
    const vals=P.map(([k])=>st[k].v); const poly=`<polygon points="${vals.map((v,i)=>pt(i,v).join(',')).join(' ')}" fill="var(--wk)" fill-opacity=".3" stroke="var(--wk)" stroke-width="2"/>`;
    const lab=P.map(([k,l],i)=>{ const [x,y]=pt(i,6.1); return `<text x="${x}" y="${y+4}" text-anchor="middle" font-family="Schibsted Grotesk,Arial" font-weight="700" font-size="13" fill="var(--ink)">${l} ${st[k].v}</text>`; }).join('');
    el.querySelector('#tri').innerHTML=`<svg viewBox="0 0 340 300" role="img" aria-label="Triple bottom line triangle">${grid}${poly}${lab}</svg>`;
    const low=P.filter(([k])=>st[k].v<=2).map(p=>p[1]); el.querySelector('#tri-o').innerHTML=low.length?`Weak on <b>${low.join(' and ')}</b>. A sustainable idea needs all three. What would raise it?`:`Balanced. Back each score with something you can count.`; store.set(key,JSON.stringify(st)); };
  P.forEach(([k])=>{ el.querySelector('#r-'+k).addEventListener('input',e=>{ st[k].v=+e.target.value; el.querySelector('#v-'+k).textContent=st[k].v; draw(); }); el.querySelector('#t-'+k).addEventListener('input',e=>{ st[k].t=e.target.value; draw(); }); });
  draw();
}

/* pitch timer: phases [[label, seconds, tip]] */
function timer(el,PH){
  const T=PH.reduce((a,p)=>a+p[1],0);
  el.innerHTML=`<div class="tm"><div class="clock">${T}</div><div class="bar">${PH.map(p=>`<i style="width:${p[1]/T*100}%"></i>`).join('')}</div><div class="now">Press Start and speak.</div><div class="row"><button type="button" class="btn go">Start</button><button type="button" class="btn ghost rs">Reset</button></div></div>`;
  let t=T,iv=null; const c=el.querySelector('.clock'),n=el.querySelector('.now'),bars=[...el.querySelectorAll('.bar i')];
  const show=()=>{ c.textContent=t; let e=T-t,acc=0,k=PH.length-1; for(let i=0;i<PH.length;i++){ acc+=PH[i][1]; if(e<acc){k=i;break;} } bars.forEach((b,i)=>b.classList.toggle('on',i<=k)); n.innerHTML=t>0?`${PH[k][0]}<small>${PH[k][2]}</small>`:'Time. Stop here.'; };
  el.querySelector('.go').addEventListener('click',()=>{ if(iv) return; iv=setInterval(()=>{ t--; show(); if(t<=0){ clearInterval(iv); iv=null; } },1000); show(); });
  el.querySelector('.rs').addEventListener('click',()=>{ clearInterval(iv); iv=null; t=T; c.textContent=T; bars.forEach(b=>b.classList.remove('on')); n.textContent='Press Start and speak.'; });
}

/* rubric: {bands:[...], rows:[[criterion, [cells]]], foot} */
const rubHTML=r=>`<div class="rub">${r.rows.map(([t,cells],i)=>`<details ${i===0?'open':''}><summary>${t}</summary><dl>${cells.map((c,j)=>`<dt>${r.bands[j]}</dt><dd>${c}</dd>`).join('')}</dl></details>`).join('')}${r.foot?`<p class="mono" style="color:var(--muted)">${r.foot}</p>`:''}</div>`;

/* Project 1 poster rubric (syllabus section 12, verbatim) */
const RUB_POSTER={bands:['Poor Level','Acceptable Level','Excellent Level'],rows:[
 ['Part 1 · Demonstrated understanding/ application of design thinking Process. (5 points)',['Poor understanding of the design thinking process. (0-1 point)','Average understanding of the design thinking process. (2-3 points)','Excellent understanding of the design thinking process. (4-5 points)']],
 ['Part 1 · Did the entire process. (5 points)',['Many elements are missing. (0-1 point)','Have done most of the process. (2-3 points)','Have achieved all the processes. (4-5 points)']],
 ['Part 1 · Did you take risks? Did you change directions? Did you try many ideas? (5 points)',['You took no risks. You just have stated the obvious. (0-1 point)','You took minimum risks. (2-3 points)','You tried many ideas and took some risks. (4-5 points)']],
 ['Part 1 · Did you learn from feedback? (5 points)',['You did not listen to the guidelines, to the Professor, or to the person you did an interview. (0-1 point)','You listened to the guidelines, or to the Professor or to the Person you did interview (but you ignored 1 out of 3). (2-3 points)','You listened to everyone: guidelines, Professor, and interviewee. (4-5 points)']],
 ['Part 2: Interviews · You did interviews. (6 points)',['You did 0 interviews. (0-2 points)','You did 1 interview. (3-4 points)','You did many interviews. (5-6 points)']],
 ['Part 2: Interviews · Quality of the interview. (7 points)',['Superficial (not many questions, no deep answers). (0-2 points)','Average- correct. (3-5 points)','Excellent (many questions, deep answers). (6-7 points)']],
 ['Part 2: Interviews · You seemed to have learned from the interview. (7 points)',['You just did the minimum work. (0- 2 points)','Average. It was just an interview. You did not analyze it. (3-5 points)','You have listened to the interviewee. You have developed empathy. (6-8 points)']],
 ['Part 3: Journey Maps · Quality of the Journey map. (10 points)',['Did not do it, or very badly. (0-3 points)','Did the minimum-average work. (4-6 points)','Excellent journey map. (7-10 points)']],
 ['Part 3: Journey Maps · What did you learn from the journey map? (10 points)',['Nothing. (0-3 points)','Obvious comments. (4-6 points)','Good analysis. (7-10 points)']],
 ['Part 4: Solutions · Variety & quality of solutions. (10 points)',['Not enough solutions. (0-3 points)','3 obvious solutions, missing 1 of the criteria (risky, easy, favourite) (4-6 points)','3 or more solutions (risky, easy, favourite). (7-10 points)']],
 ['Part 4: Solutions · Why did you choose this solution? (10 points)',['Absence of justification (or absence of choice). (0-3 points)','Obvious Justification. (4-6 points)','Interesting justification. (7-10 points)']],
 ['Part 5: Prototype · Initial prototype generation (drawing/design). (20 points)',['No prototype or bad quality. (0-9 points)','Average prototype. (10-16 points)','Excellent prototype. (17-20 points)']]],
 foot:'Maximum Marks: 100 · Adjusted for 30%'};
const RUB_PRES={bands:['Poor Level','Acceptable Level','Excellent Level'],rows:[
 ['Quality of the Presentation (5% | 5 marks)',['The team did not present this in an appropriate format with limited use of colours, language, and no visualizations. Only a few students presented in the group. (0-1 points)','The team presented this in a logical format with a clear sequence between their slides but with a lack of clear visualizations. Most students presented in the group. (2-3 points)','The team presented their work in an excellent format with excellent use of colours, language, and visualizations. All students presented equally in a group. (4-5 points)']],
 ['Panel Engagement (5% | 5 marks)',['The student did not engage with the panel/was very rude and unprofessional in the response. (0-1 points)','The student responded to the questions but was not able to clarify the answer/unable to answer fully. (2-3 points)','The student responded very well to the questions and provided answers in a professional manner. (4-5 points)']]],
 foot:'Maximum Marks = 10'};
const RUB_ACT1={bands:['10 Marks (100 – 81%)','8 Marks (80 – 61%)','6 Marks (60 – 41%)','4 Marks (40 – 21%)','2 Marks (20 – 11%)','0 Marks (10 – 0%)'],rows:[
 ['Video Submission (Activity 1) · (10% | 10 marks)',['The student has evaluated all aspects of learning and presented this in a pitch and referred to the key learning points. The forum post has been submitted prior to the deadline.','The student has evaluated most aspects of the pitch and made reference to the key learning points. The forum post has been submitted prior to the deadline.','The student has analyzed some of the key learning points. The forum post has been submitted prior to the deadline.','The student has described some of the key learning points. The forum post has been submitted prior to the deadline.','The student has described at least two learning points. The forum post has been submitted after the deadline.','The student has not submitted a video pitch.']]]};


/* empathy map: who + Says / Thinks / Does / Feels */
const EQ=[['says','Says','Quotes, word for word'],['thinks','Thinks','What they may not say aloud'],['does','Does','Actions you observed'],['feels','Feels','Emotions you noticed']];
function empathyMap(el,{key,init,onchange}={}){
  let st; try{st=JSON.parse(store.get(key)||'null')}catch(e){} if(!st) st=Object.assign({who:'',says:'',thinks:'',does:'',feels:''},init||{});
  el.innerHTML=`<div class="ins" style="margin-bottom:8px"><label for="em-who">Who? (one real person or a user group)</label><input type="text" id="em-who" value="${esc(st.who)}"></div><div class="emp">${EQ.map(([k,l,h])=>`<div class="q"><b>${l}</b><textarea data-k="${k}" aria-label="${l}" placeholder="${h}">${esc(st[k])}</textarea></div>`).join('')}<div class="who" id="em-c">${esc(st.who)||'User'}</div></div>`;
  const save=()=>{ store.set(key,JSON.stringify(st)); if(onchange) onchange(st); };
  el.querySelector('#em-who').addEventListener('input',e=>{ st.who=e.target.value; el.querySelector('#em-c').textContent=st.who||'User'; save(); });
  el.querySelectorAll('.emp textarea').forEach(a=>a.addEventListener('input',()=>{ st[a.dataset.k]=a.value; save(); }));
}

/* journey map: stages with action, feeling (-2..+2) and pain point; draws the emotion curve */
function journeyMap(el,{key,init,onchange}={}){
  let st; try{st=JSON.parse(store.get(key)||'null')}catch(e){} if(!st) st=init||{stages:[{s:'',a:'',f:0,p:''},{s:'',a:'',f:0,p:''},{s:'',a:'',f:0,p:''},{s:'',a:'',f:0,p:''}]};
  const face=v=>['😣','🙁','😐','🙂','😀'][v+2];
  const draw=()=>{
    const n=st.stages.length, W0=640, H=170, x=i=>40+i*(W0-80)/Math.max(n-1,1), y=v=>H/2-v*32;
    const pts=st.stages.map((s,i)=>[x(i),y(s.f)]);
    const path=pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
    const low=st.stages.map((s,i)=>[s,i]).filter(([s])=>s.f<0);
    el.querySelector('.jm-svg').innerHTML=`<svg viewBox="0 0 ${W0} ${H+30}" style="width:100%;height:auto" role="img" aria-label="Emotion curve across the journey">
      <line x1="20" x2="${W0-20}" y1="${H/2}" y2="${H/2}" stroke="var(--line)" stroke-dasharray="4 4"/>
      <text x="20" y="16" font-family="JetBrains Mono,monospace" font-size="10" fill="var(--muted)">positive</text><text x="20" y="${H-4}" font-family="JetBrains Mono,monospace" font-size="10" fill="var(--muted)">negative</text>
      <path d="${path}" fill="none" stroke="var(--wk)" stroke-width="3"/>
      ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${st.stages[i].f<0?9:6}" fill="${st.stages[i].f<0?'var(--bad,#C2410C)':'var(--wk)'}"/><text x="${p[0]}" y="${H+22}" text-anchor="middle" font-family="Schibsted Grotesk,Arial" font-weight="700" font-size="12" fill="var(--ink)">${esc((st.stages[i].s||'Stage '+(i+1)).slice(0,18))}</text>`).join('')}</svg>
      <div class="feedback">${low.length?`Pain points at: <b>${low.map(([s,i])=>esc(s.s||'Stage '+(i+1))).join(', ')}</b>. The lowest point is usually where your “How might we…” question starts.`:'Move a feeling slider below zero where the user struggles.'}</div>`;
    store.set(key,JSON.stringify(st)); if(onchange) onchange(st);
  };
  const rows=()=>{ el.querySelector('.jm-rows').innerHTML=st.stages.map((s,i)=>`<div class="jm-r" data-i="${i}"><b class="mono">${i+1}</b><input type="text" data-f="s" placeholder="Stage" value="${esc(s.s)}" aria-label="Stage ${i+1} name"><input type="text" data-f="a" placeholder="What they do" value="${esc(s.a)}" aria-label="Stage ${i+1} action"><input type="text" data-f="p" placeholder="Pain point or quote" value="${esc(s.p)}" aria-label="Stage ${i+1} pain point"><span class="jm-f"><input type="range" min="-2" max="2" value="${s.f}" data-f="f" aria-label="Stage ${i+1} feeling"><span>${face(s.f)}</span></span></div>`).join('');
    el.querySelectorAll('.jm-r input').forEach(inp=>inp.addEventListener('input',()=>{ const i=+inp.closest('.jm-r').dataset.i, f=inp.dataset.f; st.stages[i][f]=f==='f'?+inp.value:inp.value; if(f==='f') inp.nextElementSibling.textContent=face(+inp.value); draw(); })); };
  el.innerHTML=`<div class="jm-rows ins"></div><div class="row" style="margin:8px 0"><button type="button" class="btn ghost jm-add">+ Stage</button><button type="button" class="btn ghost jm-del">− Stage</button></div><div class="jm-svg"></div>`;
  el.querySelector('.jm-add').addEventListener('click',()=>{ if(st.stages.length<7){ st.stages.push({s:'',a:'',f:0,p:''}); rows(); draw(); } });
  el.querySelector('.jm-del').addEventListener('click',()=>{ if(st.stages.length>3){ st.stages.pop(); rows(); draw(); } });
  rows(); draw();
}

window.ENT141={empathyMap,journeyMap,store,esc,SDGS,ASSESS,weights,sdgPicker,tbl,timer,rubHTML,RUB_POSTER,RUB_PRES,RUB_ACT1};
})();
