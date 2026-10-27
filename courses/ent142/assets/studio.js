/* ENT 142 · Report Lab, chart-first steps. Needs assets/lab.js (window.LAB_NO_MOUNT=true).
   Same saved data and the same paragraph builders as the lab: only the way students enter it changes. */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const fmt=n=>isFinite(n)?nice(n):'—';

/* ---------- small controls ---------- */
function chips(s,id,opts,{other,multi}={}){
  const cur=String(s[id]||''); const sel=multi?cur.split('; ').filter(Boolean):[cur];
  const isOther=other&&cur&&!opts.some(o=>sel.includes(o[1]||o));
  return `<div class="chips2" data-chips="${id}" data-multi="${multi?1:''}">${opts.map(o=>{ const [t,v]=Array.isArray(o)?o:[o,o]; return `<button type="button" data-v="${esc(v)}" aria-pressed="${sel.includes(v)}">${t}</button>`; }).join('')}${other?`<button type="button" data-v="__o" aria-pressed="${isOther}">Other…</button>`:''}</div>
    ${other?`<input class="st-in" data-other="${id}" type="text" placeholder="${esc(other)}" value="${isOther?esc(cur):''}" ${isOther?'':'hidden'}>`:''}`;
}
function slider(s,id,label,min,max,step,unit,def){
  const v=s[id]!==undefined&&s[id]!==''?num(s[id]):def;
  return `<div class="sl"><label for="sl-${id}">${label}</label><output id="o-${id}">${fmt(v)}${unit}</output><input type="range" id="sl-${id}" data-sl="${id}" data-u="${unit}" min="${min}" max="${max}" step="${step}" value="${v}"></div>`;
}
const text=(s,id,label,ph)=>`<label for="tx-${id}">${label}</label><input class="st-in" id="tx-${id}" data-tx="${id}" type="text" value="${esc(s[id]||'')}" placeholder="${esc(ph||'')}">`;
const q=(n,title,done,body,hint)=>`<div class="st-q"><b><span class="n ${done?'done':''}" data-n="${n}">${done?'✓':n}</span>${title}</b>${hint?`<small>${hint}</small>`:''}${body}</div>`;

function wire(el,s,redraw){
  el.querySelectorAll('[data-chips]').forEach(g=>{ const id=g.dataset.chips, multi=!!g.dataset.multi;
    g.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const v=b.dataset.v, o=el.querySelector(`[data-other="${id}"]`);
      if(v==='__o'){ g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b)); if(o){ o.hidden=false; o.focus(); s[id]=o.value; } }
      else if(multi){ const on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',on); s[id]=[...g.querySelectorAll('button[aria-pressed=true]')].map(x=>x.dataset.v).filter(x=>x!=='__o').join('; '); }
      else { g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b)); if(o) o.hidden=true; s[id]=v; }
      save(); redraw(); }); });
  el.querySelectorAll('[data-other]').forEach(i=>i.addEventListener('input',()=>{ s[i.dataset.other]=i.value; save(); redraw(); }));
  el.querySelectorAll('[data-sl]').forEach(r=>r.addEventListener('input',()=>{ s[r.dataset.sl]=r.value; el.querySelector('#o-'+r.dataset.sl).textContent=fmt(num(r.value))+r.dataset.u; save(); redraw(); }));
  el.querySelectorAll('[data-tx]').forEach(i=>i.addEventListener('input',()=>{ s[i.dataset.tx]=i.value; save(); redraw(); }));
}
/* paragraph + what is missing, folded under the chart */
function para(cfg,s){ const r=cfg.gen(s); const g=r.gaps||[];
  return `<details class="st-para"><summary>Our paragraph for the report <span class="miss ${g.length?'':'ok'}">${g.length?g.length+' to fix':'ready'}</span></summary>${g.length?`<ul>${g.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}<p>${r.html}</p><button type="button" class="st-copy" data-l="Copy paragraph">Copy paragraph</button></details>`; }
function keepPara(box,cfg,s){ const open=box.querySelector('.st-para')?.open; box.querySelector('.st-para-slot').innerHTML=para(cfg,s); const d=box.querySelector('.st-para'); if(open) d.open=true;
  d.querySelector('.st-copy').addEventListener('click',e=>copyText(e.target,cfg.gen(s).text)); }

const statCards=()=>S.data.filter(d=>d.kind!=='fact'&&!/year/i.test(d.unit||'')&&!/%/.test(d.unit||'')&&isFinite(num(d.value))&&num(d.value)>=100);
const noData=()=>`<div class="st-empty">You need at least one verified number first. <a href="report-lab.html#s2">Add data cards →</a> or <button type="button" class="b-ex" style="background:none;border:none;text-decoration:underline;cursor:pointer;padding:0">try it with the example</button>.</div>`;

/* ================= Step 5 · Market ================= */
function market(el){
  const s=sec('market'); if(s.samPct==null||s.samPct==='') s.samPct='5'; if(s.somPct==null||s.somPct==='') s.somPct='2';
  if(!s.freq) s.freq='4'; if(!s.price) s.price='15';
  const C=statCards();
  el.innerHTML=`<div class="st-grid"><div class="st-ctl">
    ${q(1,'Start from a verified total',!!s.tam,C.length?chips(s,'tam',C.map(d=>[`${esc(nice(num(d.value)))} <small>${esc(d.unit)} · ${esc(d.org)}</small>`,d.id])):noData(),'TAM: everyone who could have the problem.')}
    ${q(2,'Who can you really serve?',!!s.samWhy,slider(s,'samPct','SAM: share of the total',0.5,50,0.5,'%',5)+chips(s,'samWhy',[['Only students and young workers','assumption: only students and young workers near universities'],['Only our area','assumption: only residents of our area of the city'],['Only app users','assumption: only people who already order through apps']],{other:'assumption: …'}),'Slide, then pick the reason.')}
    ${q(3,'How many in year one?',!!s.somWhy,slider(s,'somPct','SOM: share you reach in year 1',0.5,20,0.5,'%',2)+chips(s,'somWhy',[['Realistic for a new venture','assumption: a realistic first-year reach for a new student venture'],['Free marketing only','assumption: what our team can reach with free marketing'],['Like a similar venture','based on the first-year reach of a similar venture']],{other:'assumption: …'}))}
    ${q(4,'What does one customer spend?',true,slider(s,'freq','Times a month',1,30,1,'',4)+slider(s,'price','Price each (AED)',1,200,1,' AED',15)+`<div class="calc" id="calc"></div>`)}
    <details class="st-more"><summary>Words for the report <small>· 3 short answers</small></summary>${text(s,'industry','Industry','e.g. food service technology')}${text(s,'segment','Segment','e.g. students near universities in Dubai')}${text(s,'attractive','Why the market is attractive','e.g. a growing city and strong attention to food waste')}</details>
  </div><div class="st-chart"><span class="lbl">Your market · updates as you move</span><div id="mk-svg"></div><div class="st-big" id="mk-big"></div><div class="st-para-slot"></div></div></div>`;
  const draw=()=>{ const fq=num(s.freq), pr=num(s.price); s.value=String(fq*pr*12); s.valueWhy=`assumption: ${fq} times a month × ${pr} AED × 12 months`; save();
    $('#calc',el).textContent=`${fq} × ${pr} AED × 12 months = ${fmt(fq*pr*12)} AED a year`;
    $('#mk-svg',el).innerHTML=MARKET.illus(s,SCREEN);
    const m=mkt(s); $('#mk-big',el).innerHTML=`<div><span>Total (TAM)</span><b>${fmt(m.tam)}</b></div><div><span>Year-1 customers</span><b>${fmt(m.som)}</b></div><div class="wk"><span>Year-1 spending</span><b>${fmt(m.rev)} AED</b></div>`;
    keepPara(el,MARKET,s); };
  wire(el,s,()=>{ draw(); refreshNums(el,s); }); draw();
}

/* ================= Step 6 · Competition (drag the dots) ================= */
const AX=[['Price','Price for the customer (high → low)'],['Convenience','Convenience (low → high)'],['Quality','Quality (low → high)'],['Speed','Speed (slow → fast)'],['Sustainability','Sustainability (low → high)'],['Trust','Trust (low → high)']];
function compet(el){
  const s=sec('compet'); const D={you:[4,4],1:[2,4],2:[3,2],3:[4.5,1.5]};
  if(!s.youx){ s.youx=String(D.you[0]); s.youy=String(D.you[1]); }
  [1,2,3].forEach(i=>{ if(!s['c'+i+'x']){ s['c'+i+'x']=String(D[i][0]); s['c'+i+'y']=String(D[i][1]); } });
  const row=i=>`<div style="margin-top:${i>1?10:0}px"><input class="st-in" data-tx="c${i}" type="text" value="${esc(s['c'+i]||'')}" placeholder="Competitor ${i}: name" aria-label="Competitor ${i}">${chips(s,'c'+i+'t',['Direct','Indirect','Substitute'])}</div>`;
  el.innerHTML=`<div class="st-grid"><div class="st-ctl">
    ${q(1,'What do customers care about most?',!!(s.xA&&s.yA),`<small style="margin:0 0 4px">Across →</small>${chips(s,'xA',AX)}<small style="margin:10px 0 4px">Up ↑</small>${chips(s,'yA',AX)}`)}
    ${q(2,'Who else solves the problem?',[1,2,3].every(i=>s['c'+i]),row(1)+row(2)+row(3),'Direct: same solution. Indirect: different solution. Substitute: what people do today.')}
    ${q(3,'Drag every dot on the map',true,'<span class="drag-hint">Put each one where customers would place it. Find your gap.</span>')}
    <details class="st-more"><summary>Words for the report <small>· strengths, barriers, partners</small></summary>${[1,2,3].map(i=>`${text(s,'c'+i+'s',`${s['c'+i]||'Competitor '+i}: strength`,'')}${text(s,'c'+i+'w',`${s['c'+i]||'Competitor '+i}: weakness you can use`,'')}`).join('')}${text(s,'barYou','Barriers to entry for you','')}${text(s,'barOthers','Barriers for future competitors','')}${text(s,'partners','Partners or allies','e.g. student council, café owners')}</details>
  </div><div class="st-chart"><span class="lbl">Positioning map · drag the dots</span><div id="pm"></div><div class="st-para-slot"></div></div></div>`;
  const W=innerWidth<600?420:640,H=420,x0=50,x1=W-16,y0=24,y1=360;
  const X=v=>x0+(clamp(num(v)||1,1,5)-1)/4*(x1-x0), Y=v=>y1-(clamp(num(v)||1,1,5)-1)/4*(y1-y0);
  const draw=()=>{
    const pts=[['you',V('name')||'Our venture',s.youx,s.youy,true]].concat([1,2,3].map(i=>[i,s['c'+i]||'Competitor '+i,s['c'+i+'x'],s['c'+i+'y'],false,!s['c'+i]]));
    const beat=[1,2,3].filter(i=>s['c'+i]).every(i=>num(s.youx)>=num(s['c'+i+'x'])&&num(s.youy)>=num(s['c'+i+'y']));
    $('#pm',el).innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Positioning map">
      <rect x="${(x0+x1)/2}" y="${y0}" width="${(x1-x0)/2}" height="${(y1-y0)/2}" fill="var(--wk-soft)"/>
      <text x="${x1-8}" y="${y0+18}" text-anchor="end" font-size="12" font-weight="700" fill="var(--wk)" font-family="Schibsted Grotesk,Arial">${beat?'Your gap':'Best place to be'}</text>
      <rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" fill="none" stroke="var(--line)"/>
      <path d="M${(x0+x1)/2} ${y0}V${y1}M${x0} ${(y0+y1)/2}H${x1}" stroke="var(--line)" stroke-dasharray="4 4"/>
      <text x="${(x0+x1)/2}" y="${y1+34}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--muted)" font-family="Schibsted Grotesk,Arial">${esc((s.xA||'Choose the axis across')+' →')}</text>
      <text x="22" y="${(y0+y1)/2}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--muted)" font-family="Schibsted Grotesk,Arial" transform="rotate(-90 22 ${(y0+y1)/2})">${esc((s.yA||'Choose the axis up')+' →')}</text>
      ${pts.map(([k,n,x,y,you,ghost])=>`<g class="dot" data-k="${k}" opacity="${ghost?.45:1}"><circle cx="${X(x)}" cy="${Y(y)}" r="${you?16:12}" fill="${you?'var(--wk)':'var(--surface)'}" stroke="${you?'var(--wk)':'var(--muted)'}" stroke-width="2.5"/><circle cx="${X(x)}" cy="${Y(y)}" r="26" fill="transparent"/><text x="${X(x)}" y="${Y(y)-(you?24:20)}" text-anchor="middle" font-size="${you?14:13}" font-weight="${you?800:700}" fill="${you?'var(--wk)':'var(--ink)'}" font-family="Schibsted Grotesk,Arial">${esc(n)}</text></g>`).join('')}
    </svg>`;
    const svg=$('#pm svg',el);
    svg.querySelectorAll('.dot').forEach(g=>g.addEventListener('pointerdown',e=>{ e.preventDefault(); const k=g.dataset.k; svg.setPointerCapture(e.pointerId);
      const mv=ev=>{ const p=svg.createSVGPoint(); p.x=ev.clientX; p.y=ev.clientY; const c=p.matrixTransform(svg.getScreenCTM().inverse());
        const vx=clamp(1+(c.x-x0)/(x1-x0)*4,1,5), vy=clamp(1+(y1-c.y)/(y1-y0)*4,1,5); const kx=k==='you'?'youx':'c'+k+'x', ky=k==='you'?'youy':'c'+k+'y';
        s[kx]=vx.toFixed(1); s[ky]=vy.toFixed(1); const cs=g.querySelectorAll('circle'), t=g.querySelector('text');
        cs.forEach(ci=>{ ci.setAttribute('cx',X(vx)); ci.setAttribute('cy',Y(vy)); }); t.setAttribute('x',X(vx)); t.setAttribute('y',Y(vy)-(k==='you'?24:20)); };
      const up=()=>{ svg.removeEventListener('pointermove',mv); svg.removeEventListener('pointerup',up); save(); draw(); };
      svg.addEventListener('pointermove',mv); svg.addEventListener('pointerup',up); }));
    keepPara(el,COMPET,s); };
  wire(el,s,()=>{ draw(); refreshNums(el,s); }); draw();
}

/* ================= Step 7 · Business model (break-even) ================= */
function model(el){
  const s=sec('model'); const d={p1:'2',v1:'1000',fixed:'3000',varPct:'5'}; for(const k in d) if(s[k]==null||s[k]==='') s[k]=d[k];
  el.innerHTML=`<div class="st-grid"><div class="st-ctl">
    ${q(1,'Who pays?',!!s.payer,chips(s,'payer',[['Customers per purchase','customers pay for each purchase'],['Businesses, as a commission','partner businesses pay a commission on each sale'],['Monthly subscription','users pay a monthly subscription'],['Sponsors or grants','sponsors and grants fund part of the service']],{multi:true}),'Pick one or more.')}
    ${q(2,'What do you sell, and how many?',!!s.s1,`<input class="st-in" data-tx="s1" type="text" value="${esc(s.s1||'')}" placeholder="e.g. 15% commission per meal" aria-label="What you sell">`+slider(s,'p1','Price per unit',0.5,200,0.5,' AED',2)+slider(s,'v1','Units a month',0,10000,50,'',1000))}
    ${q(3,'What does it cost?',true,slider(s,'fixed','Fixed costs a month',0,50000,250,' AED',3000)+slider(s,'varPct','Variable costs',0,60,1,'% of revenue',5),'Fixed: rent, hosting, salaries. Variable: payment fees, packaging.')}
    <details class="st-more"><summary>Impact and risk <small>· 4 short answers</small></summary>${text(s,'people','People: what you will count','e.g. affordable meals sold per month')}${text(s,'planet','Planet: what you will count','e.g. kg of food saved from landfill per month')}${text(s,'risk','Biggest risk','e.g. cafés may not list food every day')}${text(s,'test','First test to reduce it','e.g. a 4-week pilot with three cafés')}</details>
  </div><div class="st-chart"><span class="lbl">Revenue and costs by units sold · break-even</span><div id="be"></div><div class="st-big" id="be-big"></div><div class="st-para-slot"></div></div></div>`;
  const draw=()=>{
    const m=money(s), p=num(s.p1)||0, vp=(num(s.varPct)||0)/100, F=num(s.fixed)||0, r2=m.r2, cur=num(s.v1)||0;
    const xmax=Math.max(100,Math.ceil(Math.max(cur,isFinite(m.be)?m.be:0)*1.4/100)*100);
    const rev=x=>p*x+r2, cost=x=>F+vp*rev(x); const ymax=Math.max(rev(xmax),cost(xmax),1)*1.08;
    const W=640,H=330,x0=70,x1=620,y0=16,y1=280, X=x=>x0+x/xmax*(x1-x0), Y=y=>y1-y/ymax*(y1-y0);
    const be=m.be, profit=m.profit, ticks=[0,.25,.5,.75,1].map(t=>t*xmax), yt=[0,.5,1].map(t=>t*ymax);
    $('#be',el).innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Break-even chart">
      ${yt.map(v=>`<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${x0-8}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="JetBrains Mono,monospace">${nice(v)}</text>`).join('')}
      ${ticks.map(v=>`<text x="${X(v)}" y="${y1+18}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="JetBrains Mono,monospace">${nice(v)}</text>`).join('')}
      <text x="${(x0+x1)/2}" y="${H-4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--muted)" font-family="Schibsted Grotesk,Arial">Units sold a month →</text>
      ${isFinite(be)&&be<=xmax?`<polygon points="${X(be)},${Y(rev(be))} ${X(xmax)},${Y(rev(xmax))} ${X(xmax)},${Y(cost(xmax))}" fill="var(--good)" opacity=".14"/><polygon points="${X(0)},${Y(rev(0))} ${X(be)},${Y(rev(be))} ${X(0)},${Y(cost(0))}" fill="var(--bad)" opacity=".12"/>`:''}
      <line x1="${X(0)}" y1="${Y(cost(0))}" x2="${X(xmax)}" y2="${Y(cost(xmax))}" stroke="var(--muted)" stroke-width="3"/>
      <line x1="${X(0)}" y1="${Y(rev(0))}" x2="${X(xmax)}" y2="${Y(rev(xmax))}" stroke="var(--wk)" stroke-width="3"/>
      <text x="${x1}" y="${Y(rev(xmax))-8}" text-anchor="end" font-size="12" font-weight="800" fill="var(--wk)" font-family="Schibsted Grotesk,Arial">Revenue</text>
      <text x="${x1}" y="${Y(cost(xmax))+(cost(xmax)>rev(xmax)?-8:18)}" text-anchor="end" font-size="12" font-weight="800" fill="var(--muted)" font-family="Schibsted Grotesk,Arial">Costs</text>
      ${isFinite(be)&&be<=xmax?`<circle cx="${X(be)}" cy="${Y(rev(be))}" r="7" fill="var(--ink)"/><text x="${X(be)+10}" y="${Y(rev(be))+22}" font-size="12" font-weight="800" fill="var(--ink)" font-family="Schibsted Grotesk,Arial">Break-even ≈ ${nice(be)}</text>`:''}
      <line x1="${X(cur)}" x2="${X(cur)}" y1="${y0}" y2="${y1}" stroke="${profit>=0?'var(--good)':'var(--bad)'}" stroke-width="2" stroke-dasharray="5 4"/>
      <text x="${X(cur)+(X(cur)>x1-120?-6:6)}" y="${y0+12}" text-anchor="${X(cur)>x1-120?'end':'start'}" font-size="12" font-weight="800" fill="${profit>=0?'var(--good)':'var(--bad)'}" font-family="Schibsted Grotesk,Arial">You: ${nice(cur)}</text>
    </svg>`;
    $('#be-big',el).innerHTML=`<div class="wk"><span>Revenue / month</span><b>${fmt(m.rev)}</b></div><div><span>Costs / month</span><b>${fmt(m.cost)}</b></div><div class="${profit>=0?'good':'bad'}"><span>${profit>=0?'Surplus':'Loss'} / month</span><b>${fmt(Math.abs(profit))}</b></div>`;
    keepPara(el,MODEL,s); };
  wire(el,s,()=>{ draw(); refreshNums(el,s); }); draw();
}

/* tick the numbered circles as answers arrive */
function refreshNums(el,s){ /* lightweight: re-evaluate the done state of each question by its chips/inputs */
  el.querySelectorAll('.st-q').forEach(qq=>{ const n=qq.querySelector('.n'); const ids=[...qq.querySelectorAll('[data-chips],[data-tx]')].map(x=>x.dataset.chips||x.dataset.tx);
    if(!ids.length) return; const ok=ids.every(id=>String(s[id]||'').trim()); n.classList.toggle('done',ok); n.textContent=ok?'✓':n.dataset.n; }); }

window.Studio={market,compet,model};
})();
