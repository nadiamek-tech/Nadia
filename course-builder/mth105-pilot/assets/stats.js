/* MTH 105 shared statistics tools. Every tool computes live so students can check their own work.
   Exposes window.ST. Needs assets/course.js (Lecture.W) loaded first. */
(function(){
const W = window.Lecture ? Lecture.W : {esc:s=>String(s)};
const esc = W.esc;
const r2 = v => (Math.round(v*100)/100).toString();
const r4 = v => (Math.round(v*10000)/10000).toString();
const FT = 'font-family="Schibsted Grotesk,Arial"';
const MONO = 'font-family="JetBrains Mono,monospace"';
/* ---------- SVG helpers ---------- */
function hist(freqs, edges, o={}){
  const Wd=o.w||520, Hd=o.h||220, L=34, R=12, T=12, B=36, k=freqs.length;
  const ymax=o.ymax||Math.max(...freqs)+1, bw=(Wd-L-R)/(k+(o.pad?2:0)), x0=L+(o.pad?bw:0);
  const Y=v=>T+(Hd-T-B)*(1-v/ymax);
  let s=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${esc(o.aria||'Histogram')}">`;
  for(let g=0; g<=ymax; g+=Math.ceil(ymax/5)) s+=`<line x1="${L}" x2="${Wd-R}" y1="${Y(g)}" y2="${Y(g)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(g)+4}" text-anchor="end" ${MONO} font-size="10" fill="var(--muted)">${g}</text>`;
  if(!o.hideBars) freqs.forEach((f,i)=>{ s+=`<rect x="${x0+i*bw}" y="${Y(f)}" width="${bw}" height="${Y(0)-Y(f)}" fill="var(--wk-soft)" stroke="var(--wk)" stroke-width="1.2"/>`; });
  (edges||[]).forEach((e,i)=>{ s+=`<text x="${x0+i*bw}" y="${Hd-B+16}" text-anchor="middle" ${MONO} font-size="10" fill="var(--muted)">${e}</text>`; });
  if(o.xlabel) s+=`<text x="${(L+Wd-R)/2}" y="${Hd-4}" text-anchor="middle" ${FT} font-size="11" fill="var(--muted)">${esc(o.xlabel)}</text>`;
  s+=`<line x1="${L}" x2="${Wd-R}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--ink)"/>`;
  if(o.poly){ const pts=[[x0-bw/2,0],...freqs.map((f,i)=>[x0+i*bw+bw/2,f]),[x0+k*bw+bw/2,0]];
    s+=`<polyline points="${pts.map(([x,f])=>`${x},${Y(f)}`).join(' ')}" fill="none" stroke="var(--c2)" stroke-width="2.4"/>`+pts.map(([x,f])=>`<circle cx="${x}" cy="${Y(f)}" r="4" fill="var(--c2)"/>`).join(''); }
  if(o.lines) o.lines.forEach(([pos,lab,col],j)=>{ const x=x0+pos*bw; s+=`<line x1="${x}" x2="${x}" y1="${T}" y2="${Y(0)}" stroke="${col}" stroke-width="2.4" stroke-dasharray="${j?'6 4':''}"/><text x="${x+(j?6:-6)}" y="${T+12+j*16}" text-anchor="${j?'start':'end'}" ${FT} font-weight="700" font-size="12" fill="${col}">${lab}</text>`; });
  return s+'</svg>';
}
function boxSVG(f, lo, hi, step, o={}){
  const Wd=520, Hd=o.out&&o.out.length?150:130, L=20, R=20, X=v=>L+(Wd-L-R)*(v-lo)/(hi-lo), cy=52;
  const [mn,q1,md,q3,mx]=f;
  let s=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${esc(o.aria||'Boxplot')}">`;
  for(let v=lo; v<=hi+1e-9; v+=step) s+=`<line x1="${X(v)}" x2="${X(v)}" y1="14" y2="94" stroke="var(--line)"/><text x="${X(v)}" y="110" text-anchor="middle" ${MONO} font-size="10" fill="var(--muted)">${v}</text>`;
  s+=`<line x1="${X(mn)}" x2="${X(q1)}" y1="${cy}" y2="${cy}" stroke="var(--ink)" stroke-width="2"/><line x1="${X(q3)}" x2="${X(mx)}" y1="${cy}" y2="${cy}" stroke="var(--ink)" stroke-width="2"/>`;
  s+=`<line x1="${X(mn)}" x2="${X(mn)}" y1="${cy-12}" y2="${cy+12}" stroke="var(--ink)" stroke-width="2"/><line x1="${X(mx)}" x2="${X(mx)}" y1="${cy-12}" y2="${cy+12}" stroke="var(--ink)" stroke-width="2"/>`;
  s+=`<rect x="${X(q1)}" y="${cy-22}" width="${X(q3)-X(q1)}" height="44" fill="var(--wk-soft)" stroke="var(--ink)" stroke-width="2"/><line x1="${X(md)}" x2="${X(md)}" y1="${cy-22}" y2="${cy+22}" stroke="var(--wk)" stroke-width="3"/>`;
  (o.out||[]).forEach(v=>{ s+=`<circle cx="${X(v)}" cy="${cy}" r="5" fill="none" stroke="var(--wk)" stroke-width="2"/>`; });
  if(o.labels) [['Min',mn],['Q1',q1],['Median',md],['Q3',q3],['Max',mx]].forEach(([t,v],i)=>{ s+=`<text x="${X(v)}" y="${i%2?cy-28:cy+36}" text-anchor="middle" ${FT} font-weight="700" font-size="11" fill="${t==='Median'?'var(--wk)':'var(--ink)'}">${t}</text>`; });
  if(o.xlabel) s+=`<text x="${Wd/2}" y="${Hd-6}" text-anchor="middle" ${FT} font-size="11" fill="var(--muted)">${esc(o.xlabel)}</text>`;
  return s+'</svg>';
}
const nums = t => String(t).split(/[\s,;]+/).map(Number).filter(v=>t!==''&&!isNaN(v)&&isFinite(v));
const median = a => { const s=[...a].sort((x,y)=>x-y), n=s.length; return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2; };
function fiveNum(a){ const s=[...a].sort((x,y)=>x-y), n=s.length, h=Math.floor(n/2);
  return {s, min:s[0], q1:median(s.slice(0,h)), med:median(s), q3:median(s.slice(n%2?h+1:h)), max:s[n-1]}; }

/* ---------- Tool 1: shape ---------- */
function shapeTool(el){
  const SETS={'Symmetric':[2,5,9,12,9,5,2],'Right-skewed (positive)':[7,12,10,6,4,2,1],'Left-skewed (negative)':[1,2,4,6,10,12,7]};
  el.innerHTML=`<div class="tool"><div class="seg2">${Object.keys(SETS).map((k,i)=>`<button type="button" aria-pressed="${i===1}">${k}</button>`).join('')}</div><div class="pic"></div><div class="feedback"></div></div>`;
  const draw=k=>{ const f=SETS[k], n=f.reduce((a,b)=>a+b,0); const xs=[]; f.forEach((c,i)=>{ for(let j=0;j<c;j++) xs.push(i+.5); });
    const mean=xs.reduce((a,b)=>a+b,0)/n, med=median(xs);
    el.querySelector('.pic').innerHTML=hist(f,[],{aria:k+' histogram',lines:[[mean,'mean','var(--wk)'],[med,'median','var(--c2)']]});
    el.querySelector('.feedback').innerHTML= k[0]==='S'?'<b>Symmetric:</b> mean = median. No long tail.':k[0]==='R'?'<b>Tail to the right:</b> a few large values pull the mean up, so mean &gt; median.':'<b>Tail to the left:</b> a few small values pull the mean down, so mean &lt; median.'; };
  el.querySelectorAll('.seg2 button').forEach(b=>b.addEventListener('click',()=>{ el.querySelectorAll('.seg2 button').forEach(x=>x.setAttribute('aria-pressed',x===b)); draw(b.textContent); }));
  draw('Right-skewed (positive)');
}

/* ---------- Tool 2: polygon vs ogive ---------- */
function polyTool(el){
  const f=[3,6,9,5,2], edges=['9.5','19.5','29.5','39.5','49.5','59.5'];
  el.innerHTML=`<div class="tool"><div class="seg2"><button type="button" aria-pressed="true">Frequency polygon</button><button type="button" aria-pressed="false">Ogive</button></div><div class="pic"></div><div class="feedback"></div>
  <table class="tbl"><tr><th>Class</th><td>10–19</td><td>20–29</td><td>30–39</td><td>40–49</td><td>50–59</td></tr><tr><th>f</th>${f.map(v=>`<td>${v}</td>`).join('')}</tr><tr><th>Midpoint</th><td>14.5</td><td>24.5</td><td>34.5</td><td>44.5</td><td>54.5</td></tr><tr><th>Cum. f</th><td>3</td><td>9</td><td>18</td><td>23</td><td>25</td></tr></table></div>`;
  const pic=el.querySelector('.pic'), fb=el.querySelector('.feedback');
  const draw=m=>{ if(m===0){ pic.innerHTML=hist(f,edges,{pad:true,poly:true,xlabel:'Class boundaries',aria:'Histogram with frequency polygon',ymax:10}); fb.innerHTML='Points at the <b>midpoints</b> (14.5 … 54.5), height = frequency. The line starts at 4.5 and ends at 64.5 on the axis.'; }
    else { const Wd=520,Hd=220,L=34,R=12,T=12,B=36, cum=[0,3,9,18,23,25], X=i=>L+(Wd-L-R)*i/5, Y=v=>T+(Hd-T-B)*(1-v/25);
      let s=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Ogive">`; [0,5,10,15,20,25].forEach(g=>{ s+=`<line x1="${L}" x2="${Wd-R}" y1="${Y(g)}" y2="${Y(g)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(g)+4}" text-anchor="end" ${MONO} font-size="10" fill="var(--muted)">${g}</text>`; });
      edges.forEach((e,i)=>{ s+=`<text x="${X(i)}" y="${Hd-B+16}" text-anchor="middle" ${MONO} font-size="10" fill="var(--muted)">${e}</text>`; });
      s+=`<polyline points="${cum.map((c,i)=>`${X(i)},${Y(c)}`).join(' ')}" fill="none" stroke="var(--c3)" stroke-width="2.4"/>`+cum.map((c,i)=>`<circle cx="${X(i)}" cy="${Y(c)}" r="4" fill="var(--c3)"/>`).join('');
      s+=`<text x="${(L+Wd-R)/2}" y="${Hd-4}" text-anchor="middle" ${FT} font-size="11" fill="var(--muted)">Upper class boundaries · y = cumulative frequency</text></svg>`;
      pic.innerHTML=s; fb.innerHTML='Points at the <b>upper boundaries</b>, height = <b>cumulative</b> frequency. It always rises and ends at n = 25.'; } };
  el.querySelectorAll('.seg2 button').forEach((b,i)=>b.addEventListener('click',()=>{ el.querySelectorAll('.seg2 button').forEach(x=>x.setAttribute('aria-pressed',x===b)); draw(i); }));
  draw(0);
}

/* ---------- Tool 3: boxplot ---------- */
function boxTool(el){
  el.innerHTML=`<div class="tool"><label for="bx-in">Type or paste your data (spaces or commas)</label><textarea id="bx-in" rows="2">12 15 17 18 20 21 22 24 26 29 41</textarea><div class="pic"></div><div class="out"></div><div class="feedback"></div></div>`;
  const ta=el.querySelector('textarea');
  const run=()=>{ const a=nums(ta.value); const out=el.querySelector('.out'), fb=el.querySelector('.feedback'), pic=el.querySelector('.pic');
    if(a.length<4){ out.innerHTML=''; pic.innerHTML=''; fb.innerHTML='<span class="warn">Enter at least 4 numbers.</span>'; return; }
    const F=fiveNum(a), iqr=F.q3-F.q1, lf=F.q1-1.5*iqr, uf=F.q3+1.5*iqr, outl=F.s.filter(v=>v<lf||v>uf), inl=F.s.filter(v=>v>=lf&&v<=uf);
    const span=F.max-F.min||1, step=Math.pow(10,Math.floor(Math.log10(span/4))); const st=[1,2,5,10].map(m=>m*step).find(v=>span/v<=8)||step*10;
    const lo=Math.floor(F.min/st)*st, hi=Math.ceil(F.max/st)*st;
    pic.innerHTML=boxSVG([inl[0],F.q1,F.med,F.q3,inl[inl.length-1]],lo,hi===lo?lo+st:hi,st,{labels:true,out:outl});
    out.innerHTML=[['n',a.length],['Sorted',F.s.join(', ')],['Min',F.min],['Q1',r2(F.q1)],['Median',r2(F.med)],['Q3',r2(F.q3)],['Max',F.max],['Range',r2(F.max-F.min)],['IQR',r2(iqr)],['Lower fence',r2(lf)],['Upper fence',r2(uf)]].map(([k,v])=>`<div ${k==='Sorted'?'style="grid-column:1/-1"':''}><small>${k}</small><b>${v}</b></div>`).join('');
    fb.innerHTML=outl.length?`<b>Outlier${outl.length>1?'s':''}: ${outl.join(', ')}</b> (outside the fences). The whisker stops at the last value inside.`:'No outliers: every value is inside the fences.'; };
  ta.addEventListener('input',run); run();
}

/* ---------- Tool 4: centre and spread ---------- */
function spreadTool(el, link){
  el.innerHTML=`<div class="tool"><label for="sp-in">Sample data</label><textarea id="sp-in" rows="2">6 8 9 9 13</textarea><div class="tb" style="overflow-x:auto"></div><div class="out"></div>${link?`<p class="mono" style="margin:0">${link}</p>`:''}</div>`;
  const ta=el.querySelector('textarea');
  const run=()=>{ const a=nums(ta.value), n=a.length, tb=el.querySelector('.tb'), out=el.querySelector('.out');
    if(n<2){ tb.innerHTML='<span class="warn">Enter at least 2 numbers.</span>'; out.innerHTML=''; return; }
    const sum=a.reduce((p,q)=>p+q,0), m=sum/n, d=a.map(x=>x-m), sq=d.map(v=>v*v), ss=sq.reduce((p,q)=>p+q,0), v=ss/(n-1), s=Math.sqrt(v);
    const cnt={}; a.forEach(x=>cnt[x]=(cnt[x]||0)+1); const mx=Math.max(...Object.values(cnt)); const modes=mx>1?Object.keys(cnt).filter(k=>cnt[k]===mx).map(Number).sort((p,q)=>p-q):[];
    tb.innerHTML=n<=12?`<table class="tbl"><tr><th>x</th>${a.map(x=>`<td>${x}</td>`).join('')}<th>Σ</th></tr><tr><th>x − x̄</th>${d.map(x=>`<td>${r2(x)}</td>`).join('')}<td>0</td></tr><tr><th>(x − x̄)²</th>${sq.map(x=>`<td>${r2(x)}</td>`).join('')}<td><b>${r2(ss)}</b></td></tr></table>`:'';
    out.innerHTML=[['n',n],['Σx',r2(sum)],['Mean x̄',r4(m)],['Median',r2(median(a))],['Mode',modes.length?modes.join(', '):'none'],['Σ(x − x̄)²',r4(ss)],['s² = Σ ÷ (n − 1)',r4(v)],['s = √s²',r4(s)],['CV = s ÷ x̄ × 100%',m? r2(s/m*100)+'%':'—']].map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join(''); };
  ta.addEventListener('input',run); run();
}

/* ---------- Tool 5: Venn ---------- */
function vennTool(el){
  el.innerHTML=`<div class="tool"><div class="inrow"><div><label for="vn">Total</label><input type="number" id="vn" value="120" min="1"></div><div><label for="va">n(A)</label><input type="number" id="va" value="50" min="0"></div><div><label for="vb">n(B)</label><input type="number" id="vb" value="40" min="0"></div><div><label for="vab">n(A and B)</label><input type="number" id="vab" value="15" min="0"></div></div><div class="pic"></div><div class="out"></div><div class="feedback"></div></div>`;
  const g=id=>+el.querySelector('#'+id).value;
  const run=()=>{ const N=g('vn'),A=g('va'),B=g('vb'),AB=g('vab'), pic=el.querySelector('.pic'), out=el.querySelector('.out'), fb=el.querySelector('.feedback');
    const bad=AB>Math.min(A,B)?'n(A and B) cannot be bigger than n(A) or n(B).':A+B-AB>N?'A and B together are bigger than the total. Check your numbers.':N<=0?'Total must be positive.':'';
    if(bad){ fb.innerHTML=`<span class="warn">${bad}</span>`; out.innerHTML=''; pic.innerHTML=''; return; }
    const a=A-AB,b=B-AB,ne=N-A-B+AB, P=v=>r4(v/N);
    pic.innerHTML=`<svg viewBox="0 0 520 230" role="img" aria-label="Venn diagram"><rect x="6" y="6" width="508" height="218" rx="10" fill="none" stroke="var(--ink)" stroke-width="1.5"/><text x="20" y="28" ${FT} font-weight="700" font-size="14" fill="var(--ink)">S = ${N}</text>
      <circle cx="210" cy="118" r="88" fill="var(--wk-soft)" stroke="var(--wk)" stroke-width="2"/><circle cx="310" cy="118" r="88" fill="rgba(31,99,181,.08)" stroke="var(--c2)" stroke-width="2"/>
      <text x="160" y="40" ${FT} font-weight="700" font-size="14" fill="var(--wk)">A</text><text x="352" y="40" ${FT} font-weight="700" font-size="14" fill="var(--c2)">B</text>
      ${[[165,a,'A only'],[260,AB,'A and B'],[355,b,'B only'],[470,ne,'neither']].map(([x,v,t],i)=>`<text x="${x}" y="${i===3?200:122}" text-anchor="middle" ${FT} font-weight="800" font-size="22" fill="var(--ink)">${v}</text><text x="${x}" y="${i===3?216:140}" text-anchor="middle" ${FT} font-size="11" fill="var(--muted)">${t}</text>`).join('')}</svg>`;
    out.innerHTML=[['P(A)',P(A)],['P(B)',P(B)],['P(A and B)',P(AB)],['P(A or B)',P(A+B-AB)],['P(A only)',P(a)],['P(exactly one)',P(a+b)],['P(neither)',P(ne)]].map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('');
    fb.innerHTML=`Check: ${a} + ${AB} + ${b} + ${ne} = <b>${a+AB+b+ne}</b> = total ✓`; };
  el.querySelectorAll('input').forEach(i=>i.addEventListener('input',run)); run();
}

/* ---------- Tool 6: tree ---------- */
function treeTool(el){
  el.innerHTML=`<div class="tool"><div class="sl"><label for="pa">P(A)</label><input type="range" id="pa" min="0" max="1" step="0.05" value="0.7"><b class="mono" id="pav"></b></div><div class="sl"><label for="pb">P(B)</label><input type="range" id="pb" min="0" max="1" step="0.05" value="0.4"><b class="mono" id="pbv"></b></div><div class="pic"></div><div class="out"></div><p class="mono" style="margin:0;color:var(--muted)">A and B independent. A′ = “not A”.</p></div>`;
  const run=()=>{ const pa=+el.querySelector('#pa').value, pb=+el.querySelector('#pb').value; el.querySelector('#pav').textContent=r2(pa); el.querySelector('#pbv').textContent=r2(pb);
    const br=(x1,y1,x2,y2,p)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--wk)" stroke-width="2"/><text x="${(x1+x2)/2}" y="${(y1+y2)/2-6}" text-anchor="middle" ${MONO} font-size="12" font-weight="600" fill="var(--wk)">${r2(p)}</text>`;
    const nd=(x,y,t)=>`<rect x="${x-18}" y="${y-13}" width="36" height="26" rx="7" fill="var(--surface)" stroke="var(--ink)"/><text x="${x}" y="${y+5}" text-anchor="middle" ${FT} font-weight="700" font-size="13" fill="var(--ink)">${t}</text>`;
    let s=`<svg viewBox="0 0 520 230" role="img" aria-label="Tree diagram">`; const paths=[];
    [['A',pa,60],["A′",1-pa,170]].forEach(([t,p,y])=>{ s+=br(40,115,150,y,p)+nd(168,y,t);
      [['B',pb,y-30],["B′",1-pb,y+30]].forEach(([u,q,y2])=>{ s+=br(186,y,300,y2,q)+nd(318,y2,u); const pr=p*q; paths.push([t+' and '+u,pr]); s+=`<text x="346" y="${y2+5}" ${MONO} font-size="12" fill="var(--ink)">${r2(p)} × ${r2(q)} = <tspan font-weight="700">${r4(pr)}</tspan></text>`; }); });
    s+=nd(30,115,'•')+'</svg>'; el.querySelector('.pic').innerHTML=s;
    el.querySelector('.out').innerHTML=[['P(A and B)',paths[0][1]],['P(neither)',paths[3][1]],['P(at least one)',1-paths[3][1]],['P(exactly one)',paths[1][1]+paths[2][1]],['Sum of paths',paths.reduce((p,q)=>p+q[1],0)]].map(([k,v])=>`<div><small>${k}</small><b>${r4(v)}</b></div>`).join(''); };
  el.querySelectorAll('input').forEach(i=>i.addEventListener('input',run)); run();
}

/* ---------- Tool 7: discrete distribution ---------- */
function distTool(el){
  const P=[0.10,0.20,0.40,0.20,0.10];
  el.innerHTML=`<div class="tool"><table class="tbl"><tr><th>x</th>${P.map((_,i)=>`<td>${i}</td>`).join('')}</tr><tr><th>P(x)</th>${P.map((p,i)=>`<td><input type="text" inputmode="decimal" value="${p}" aria-label="P(${i})"></td>`).join('')}</tr><tr><th>x·P(x)</th>${P.map(()=>'<td class="xp"></td>').join('')}</tr><tr><th>P(X ≤ x)</th>${P.map(()=>'<td class="cp"></td>').join('')}</tr></table><div class="pic"></div><div class="out"></div><div class="feedback"></div></div>`;
  const ins=[...el.querySelectorAll('input')];
  const run=()=>{ const p=ins.map(i=>+i.value||0), sum=p.reduce((a,b)=>a+b,0), fb=el.querySelector('.feedback');
    const neg=p.some(v=>v<0||v>1), ok=!neg&&Math.abs(sum-1)<1e-9;
    let c=0; el.querySelectorAll('.xp').forEach((t,i)=>t.textContent=r2(i*p[i])); el.querySelectorAll('.cp').forEach((t,i)=>{ c+=p[i]; t.textContent=r2(c); });
    const Wd=520,Hd=170,L=34,B=28,T=10,X=i=>L+20+i*((Wd-L-40)/4), Y=v=>T+(Hd-T-B)*(1-Math.min(v,1)/0.6);
    el.querySelector('.pic').innerHTML=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Probability bar chart">${[0,.2,.4,.6].map(g=>`<line x1="${L}" x2="${Wd-10}" y1="${Y(g)}" y2="${Y(g)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(g)+4}" text-anchor="end" ${MONO} font-size="10" fill="var(--muted)">${g}</text>`).join('')}${p.map((v,i)=>`<rect x="${X(i)-20}" y="${Y(Math.max(v,0))}" width="40" height="${Y(0)-Y(Math.max(v,0))}" fill="var(--wk)" opacity=".8"/><text x="${X(i)}" y="${Hd-8}" text-anchor="middle" ${MONO} font-size="11" fill="var(--ink)">${i}</text>`).join('')}</svg>`;
    if(!ok){ fb.innerHTML=`<span class="warn">Not valid: ${neg?'every P(x) must be between 0 and 1.':`ΣP(x) = ${r4(sum)}, not 1.`}</span>`; el.querySelector('.out').innerHTML=''; return; }
    const E=p.reduce((a,v,i)=>a+i*v,0), E2=p.reduce((a,v,i)=>a+i*i*v,0), V=p.reduce((a,v,i)=>a+(i-E)**2*v,0);
    fb.innerHTML='<span class="okk">Valid: 0 ≤ P(x) ≤ 1 and ΣP(x) = 1 ✓</span>';
    el.querySelector('.out').innerHTML=[['E(X) = Σx·P(x)',r4(E)],['E(X²)',r4(E2)],['Var(X)',r4(V)],['SD = √Var',r4(Math.sqrt(V))]].map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join(''); };
  ins.forEach(i=>i.addEventListener('input',run)); run();
}


/* ---------- maths ---------- */
function erf(x){ const s=x<0?-1:1; x=Math.abs(x); const t=1/(1+0.3275911*x); const y=1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return s*y; }
const phi = z => 0.5*(1+erf(z/Math.SQRT2));
const tab = z => Math.round(phi(Math.round(z*100)/100)*10000)/10000;   /* z-table value, 4 d.p. */
const f4 = v => v.toFixed(4);
function choose(n,k){ let r=1; for(let i=1;i<=k;i++) r=r*(n-k+i)/i; return Math.round(r); }
const CHI={1:[2.706,3.841,6.635],2:[4.605,5.991,9.210],3:[6.251,7.815,11.345],4:[7.779,9.488,13.277],5:[9.236,11.070,15.086],6:[10.645,12.592,16.812],7:[12.017,14.067,18.475],8:[13.362,15.507,20.090],9:[14.684,16.919,21.666],10:[15.987,18.307,23.209]};
const ZC={'90':1.645,'95':1.96,'99':2.576};
const outBox = rows => rows.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('');

/* ---------- Week 2: frequency distribution builder ---------- */
function freqTool(el, def){
  el.innerHTML=`<div class="tool"><label for="fq-in">Data (whole numbers)</label><textarea id="fq-in" rows="2">${def||'45 52 58 62 65 68 70 72 75 78 80 82 85 88 90 92 95 96 98 100'}</textarea>
   <div class="inrow"><div><label for="fq-k">Classes</label><input type="number" id="fq-k" value="5" min="3" max="10"></div></div>
   <div class="steps fq-w"></div><div class="tblwrap"><table class="tbl fq-t"></table></div>
   <div class="seg2"><button type="button" aria-pressed="true">Histogram</button><button type="button" aria-pressed="false">Polygon</button><button type="button" aria-pressed="false">Ogive</button></div><div class="pic"></div></div>`;
  let mode=0;
  const run=()=>{ const a=nums(el.querySelector('#fq-in').value).map(Math.round), k=Math.max(2,Math.min(12,+el.querySelector('#fq-k').value||5));
    if(a.length<4){ el.querySelector('.fq-w').innerHTML='<span class="warn">Enter at least 4 numbers.</span>'; return; }
    const mn=Math.min(...a), mx=Math.max(...a), R=mx-mn, w=Math.floor(R/k)+1;
    el.querySelector('.fq-w').innerHTML=`Range = ${mx} − ${mn} = ${R}<br>Width = ${R} ÷ ${k} = ${r2(R/k)} → round up: <b>${w}</b>`;
    const cls=[...Array(k)].map((_,i)=>{ const lo=mn+i*w, hi=lo+w-1; return {lo,hi,f:a.filter(x=>x>=lo&&x<=hi).length}; });
    let c=0; cls.forEach(q=>{ c+=q.f; q.cf=c; });
    el.querySelector('.fq-t').innerHTML=`<tr><th>Class</th><th>Boundaries</th><th>Midpoint</th><th>f</th><th>rf</th><th>Cum. f</th></tr>`+cls.map(q=>`<tr><td>${q.lo}–${q.hi}</td><td>${q.lo-.5}–${q.hi+.5}</td><td>${(q.lo+q.hi)/2}</td><td>${q.f}</td><td>${r2(q.f/a.length)}</td><td>${q.cf}</td></tr>`).join('')+`<tr><th colspan="3">Total</th><th>${a.length}</th><th>1</th><th></th></tr>`;
    const f=cls.map(q=>q.f), edges=[...cls.map(q=>q.lo-.5),cls[k-1].hi+.5];
    if(mode<2) el.querySelector('.pic').innerHTML=hist(f,edges,{pad:mode===1,poly:mode===1,hideBars:false,xlabel:'Class boundaries',ymax:Math.max(...f)+1});
    else { const Wd=520,Hd=220,L=34,R0=12,T=12,B=36, cum=[0,...cls.map(q=>q.cf)], n=a.length, X=i=>L+(Wd-L-R0)*i/k, Y=v=>T+(Hd-T-B)*(1-v/n);
      let s=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Ogive">`; [0,.25,.5,.75,1].forEach(g=>{ const v=Math.round(g*n); s+=`<line x1="${L}" x2="${Wd-R0}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" ${MONO} font-size="10" fill="var(--muted)">${v}</text>`; });
      edges.forEach((e,i)=>{ s+=`<text x="${X(i)}" y="${Hd-B+16}" text-anchor="middle" ${MONO} font-size="10" fill="var(--muted)">${e}</text>`; });
      s+=`<polyline points="${cum.map((v,i)=>`${X(i)},${Y(v)}`).join(' ')}" fill="none" stroke="var(--c3)" stroke-width="2.4"/>`+cum.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="var(--c3)"/>`).join('')+`<text x="${(L+Wd-R0)/2}" y="${Hd-4}" text-anchor="middle" ${FT} font-size="11" fill="var(--muted)">Upper boundaries · cumulative frequency</text></svg>`;
      el.querySelector('.pic').innerHTML=s; } };
  el.querySelectorAll('.seg2 button').forEach((b,i)=>b.addEventListener('click',()=>{ mode=i; el.querySelectorAll('.seg2 button').forEach(x=>x.setAttribute('aria-pressed',x===b)); run(); }));
  el.querySelectorAll('textarea,input').forEach(x=>x.addEventListener('input',run)); run();
}

/* ---------- Week 6-7: binomial ---------- */
function binomTool(el){
  el.innerHTML=`<div class="tool"><div class="sl"><label for="bn-n">n (trials)</label><input type="range" id="bn-n" min="1" max="20" value="10"><b class="mono" id="bn-nv"></b></div>
   <div class="sl"><label for="bn-p">p (success)</label><input type="range" id="bn-p" min="0.05" max="0.95" step="0.05" value="0.3"><b class="mono" id="bn-pv"></b></div>
   <div class="sl"><label for="bn-k">x</label><input type="range" id="bn-k" min="0" max="10" value="3"><b class="mono" id="bn-kv"></b></div>
   <div class="pic"></div><div class="steps"></div><div class="out"></div></div>`;
  const g=id=>+el.querySelector('#'+id).value;
  const run=()=>{ const n=g('bn-n'), p=g('bn-p'), kk=el.querySelector('#bn-k'); kk.max=n; const k=Math.min(g('bn-k'),n); kk.value=k; const q=1-p;
    el.querySelector('#bn-nv').textContent=n; el.querySelector('#bn-pv').textContent=r2(p); el.querySelector('#bn-kv').textContent=k;
    const P=[...Array(n+1)].map((_,x)=>choose(n,x)*p**x*q**(n-x)), mx=Math.max(...P);
    const Wd=520,Hd=170,L=10,B=24,bw=(Wd-2*L)/(n+1);
    el.querySelector('.pic').innerHTML=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Binomial probabilities">${P.map((v,x)=>{ const h=(Hd-B-12)*v/mx; return `<rect x="${L+x*bw+bw*.12}" y="${Hd-B-h}" width="${bw*.76}" height="${h}" fill="${x===k?'var(--wk)':'var(--c2)'}" opacity="${x===k?1:.45}"/><text x="${L+x*bw+bw/2}" y="${Hd-8}" text-anchor="middle" ${MONO} font-size="10" fill="var(--ink)">${x}</text>`; }).join('')}</svg>`;
    el.querySelector('.steps').innerHTML=`P(X = ${k}) = C(${n}, ${k}) × ${r2(p)}<sup>${k}</sup> × ${r2(q)}<sup>${n-k}</sup><br>= ${choose(n,k)} × ${f4(p**k)} × ${f4(q**(n-k))} = <b>${f4(P[k])}</b>`;
    const le=P.slice(0,k+1).reduce((a,b)=>a+b,0);
    el.querySelector('.out').innerHTML=outBox([['P(X ≤ '+k+')',f4(le)],['P(X ≥ '+k+')',f4(1-le+P[k])],['E(X) = np',r4(n*p)],['Var(X) = npq',r4(n*p*q)],['SD = √npq',r4(Math.sqrt(n*p*q))]]); };
  el.querySelectorAll('input').forEach(i=>i.addEventListener('input',run)); run();
}

/* ---------- Week 8-9: normal areas ---------- */
function normalCurve(mu,sd,lo,hi,marks){
  const Wd=520,Hd=190,L=14,R=14,B=34, a=mu-3.6*sd, b=mu+3.6*sd, X=x=>L+(Wd-L-R)*(x-a)/(b-a), pk=1/(sd*Math.sqrt(2*Math.PI)), Y=y=>Hd-B-(Hd-B-12)*y/pk;
  const pdf=x=>Math.exp(-(((x-mu)/sd)**2)/2)/(sd*Math.sqrt(2*Math.PI));
  const pts=[]; for(let i=0;i<=160;i++){ const x=a+(b-a)*i/160; pts.push([x,pdf(x)]); }
  const l=Math.max(lo,a), h=Math.min(hi,b); let area='';
  if(h>l){ const ap=[[l,0]]; for(let i=0;i<=80;i++){ const x=l+(h-l)*i/80; ap.push([x,pdf(x)]); } ap.push([h,0]); area=`<polygon points="${ap.map(([x,y])=>`${X(x)},${Y(y)}`).join(' ')}" fill="var(--wk)" opacity=".35"/>`; }
  let s=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Normal curve">${area}<polyline points="${pts.map(([x,y])=>`${X(x)},${Y(y)}`).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="2"/><line x1="${L}" x2="${Wd-R}" y1="${Hd-B}" y2="${Hd-B}" stroke="var(--ink)"/>`;
  for(let k=-3;k<=3;k++){ const x=mu+k*sd; s+=`<line x1="${X(x)}" x2="${X(x)}" y1="${Hd-B}" y2="${Hd-B+5}" stroke="var(--muted)"/><text x="${X(x)}" y="${Hd-B+17}" text-anchor="middle" ${MONO} font-size="10" fill="var(--muted)">${r2(x)}</text><text x="${X(x)}" y="${Hd-4}" text-anchor="middle" ${MONO} font-size="9" fill="var(--c2)">${k===0?'z = 0':(k>0?'+':'')+k}</text>`; }
  (marks||[]).forEach(x=>{ if(x>a&&x<b) s+=`<line x1="${X(x)}" x2="${X(x)}" y1="12" y2="${Hd-B}" stroke="var(--wk)" stroke-width="2" stroke-dasharray="5 4"/>`; });
  return s+'</svg>';
}
function zRow(z){ const zr=Math.round(z*100)/100, base=Math.trunc(zr*10)/10, col=Math.round(Math.abs(zr-base)*100);
  const cells=[...Array(10)].map((_,c)=>{ const zz=base<0||Object.is(base,-0)||zr<0? base-c/100 : base+c/100; return `<td class="${c===col?'hi':''}">${f4(tab(zz)).slice(1)}</td>`; }).join('');
  return `<div class="tblwrap"><table class="tbl"><tr><th>z</th>${[...Array(10)].map((_,c)=>`<th>.0${c}</th>`).join('')}</tr><tr><th>${zr<0&&base===0?'−0.0':base.toFixed(1).replace('-','−')}</th>${cells}</tr></table></div>`; }
function normalTool(el){
  el.innerHTML=`<div class="tool"><div class="seg2"><button type="button" aria-pressed="true">P(X &lt; a)</button><button type="button" aria-pressed="false">P(X &gt; a)</button><button type="button" aria-pressed="false">P(a &lt; X &lt; b)</button></div>
   <div class="inrow"><div><label for="nm-mu">μ (mean)</label><input type="number" id="nm-mu" value="70"></div><div><label for="nm-sd">σ (SD)</label><input type="number" id="nm-sd" value="10" min="0.01"></div><div><label for="nm-a">a</label><input type="number" id="nm-a" value="85"></div><div class="nb"><label for="nm-b">b</label><input type="number" id="nm-b" value="90"></div></div>
   <div class="pic"></div><div class="steps"></div><div class="zr"></div></div>`;
  let mode=0; const g=id=>+el.querySelector('#'+id).value;
  const run=()=>{ const mu=g('nm-mu'), sd=g('nm-sd'), a=g('nm-a'), b=g('nm-b'); el.querySelector('.nb').style.visibility=mode===2?'visible':'hidden';
    if(!(sd>0)){ el.querySelector('.steps').innerHTML='<span class="warn">σ must be positive.</span>'; return; }
    const za=Math.round((a-mu)/sd*100)/100, zb=Math.round((b-mu)/sd*100)/100, Pa=tab(za), Pb=tab(zb);
    let lo,hi,txt;
    if(mode===0){ lo=-1e9; hi=a; txt=`z = (${a} − ${mu}) ÷ ${sd} = <b>${za.toFixed(2)}</b><br>P(X &lt; ${a}) = P(Z &lt; ${za.toFixed(2)}) = table value = <b>${f4(Pa)}</b>`; }
    else if(mode===1){ lo=a; hi=1e9; txt=`z = (${a} − ${mu}) ÷ ${sd} = <b>${za.toFixed(2)}</b><br>P(X &gt; ${a}) = 1 − P(Z &lt; ${za.toFixed(2)}) = 1 − ${f4(Pa)} = <b>${f4(1-Pa)}</b>`; }
    else { lo=Math.min(a,b); hi=Math.max(a,b); const z1=Math.min(za,zb), z2=Math.max(za,zb); txt=`z₁ = ${z1.toFixed(2)}, z₂ = ${z2.toFixed(2)}<br>P = ${f4(tab(z2))} − ${f4(tab(z1))} = <b>${f4(tab(z2)-tab(z1))}</b>`; }
    el.querySelector('.pic').innerHTML=normalCurve(mu,sd,lo,hi,mode===2?[a,b]:[a]);
    el.querySelector('.steps').innerHTML=txt; el.querySelector('.zr').innerHTML=`<p class="mono" style="margin:0 0 4px;color:var(--muted)">Z-table row for z = ${za.toFixed(2)}</p>`+zRow(za); };
  el.querySelectorAll('.seg2 button').forEach((b,i)=>b.addEventListener('click',()=>{ mode=i; el.querySelectorAll('.seg2 button').forEach(x=>x.setAttribute('aria-pressed',x===b)); run(); }));
  el.querySelectorAll('input').forEach(i=>i.addEventListener('input',run)); run();
}
function ruleTool(el){
  el.innerHTML=`<div class="tool"><div class="seg2"><button type="button" aria-pressed="true">±1σ · 68%</button><button type="button" aria-pressed="false">±2σ · 95%</button><button type="button" aria-pressed="false">±3σ · 99.7%</button></div><div class="pic"></div><div class="feedback"></div></div>`;
  const draw=k=>{ el.querySelector('.pic').innerHTML=normalCurve(70,10,70-k*10,70+k*10,[]); el.querySelector('.feedback').innerHTML=`Exam scores, μ = 70, σ = 10: about <b>${['68%','95%','99.7%'][k-1]}</b> score between <b>${70-k*10}</b> and <b>${70+k*10}</b>.`; };
  el.querySelectorAll('.seg2 button').forEach((b,i)=>b.addEventListener('click',()=>{ el.querySelectorAll('.seg2 button').forEach(x=>x.setAttribute('aria-pressed',x===b)); draw(i+1); })); draw(1);
}

/* ---------- Week 10-11: CLT and confidence intervals ---------- */
function cltTool(el){
  el.innerHTML=`<div class="tool"><div class="sl"><label for="cl-n">Sample size n</label><input type="range" id="cl-n" min="1" max="50" value="2"><b class="mono" id="cl-nv"></b></div><div class="pic"></div><div class="out"></div><p class="mono" style="margin:0;color:var(--muted)">Population: waiting times, right-skewed, μ = 10, σ = 10 (illustrative).</p></div>`;
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const run=()=>{ const n=+el.querySelector('#cl-n').value; el.querySelector('#cl-nv').textContent=n; seed=7;
    const M=800, means=[...Array(M)].map(()=>{ let s=0; for(let i=0;i<n;i++) s+=-10*Math.log(1-rnd()); return s/n; });
    const lo=0, hi=30, k=30, w=(hi-lo)/k, f=Array(k).fill(0); means.forEach(m=>{ const i=Math.floor((m-lo)/w); if(i>=0&&i<k) f[i]++; });
    const Wd=520,Hd=180,L=10,B=24, mx=Math.max(...f), bw=(Wd-2*L)/k;
    el.querySelector('.pic').innerHTML=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Histogram of sample means">${f.map((v,i)=>`<rect x="${L+i*bw}" y="${Hd-B-(Hd-B-10)*v/mx}" width="${bw-1}" height="${(Hd-B-10)*v/mx}" fill="var(--c2)" opacity=".7"/>`).join('')}<line x1="${L+(10/w)*bw}" x2="${L+(10/w)*bw}" y1="6" y2="${Hd-B}" stroke="var(--wk)" stroke-width="2" stroke-dasharray="5 4"/>${[0,5,10,15,20,25,30].map(v=>`<text x="${L+(v/w)*bw}" y="${Hd-8}" text-anchor="middle" ${MONO} font-size="10" fill="var(--muted)">${v}</text>`).join('')}</svg>`;
    const mm=means.reduce((a,b)=>a+b,0)/M, sdm=Math.sqrt(means.reduce((a,b)=>a+(b-mm)**2,0)/(M-1));
    el.querySelector('.out').innerHTML=outBox([['Mean of x̄',r2(mm)],['SD of x̄ (simulated)',r2(sdm)],['σ ÷ √n',r2(10/Math.sqrt(n))]]); };
  el.querySelector('input').addEventListener('input',run); run();
}
function ciTool(el){
  el.innerHTML=`<div class="tool"><div class="seg2"><button type="button" aria-pressed="true">Mean</button><button type="button" aria-pressed="false">Proportion</button></div>
   <div class="inrow m1"><div><label for="ci-x">x̄</label><input type="number" id="ci-x" value="54"></div><div><label for="ci-s">σ</label><input type="number" id="ci-s" value="6"></div><div><label for="ci-n">n</label><input type="number" id="ci-n" value="50"></div><div><label for="ci-c">Confidence</label><select id="ci-c"><option>90</option><option selected>95</option><option>99</option></select></div></div>
   <div class="inrow m2" hidden><div><label for="ci-xp">x (successes)</label><input type="number" id="ci-xp" value="120"></div><div><label for="ci-np">n</label><input type="number" id="ci-np" value="200"></div><div><label for="ci-cp">Confidence</label><select id="ci-cp"><option>90</option><option selected>95</option><option>99</option></select></div></div>
   <div class="steps"></div><div class="pic"></div></div>`;
  let mode=0; const g=id=>+el.querySelector('#'+id).value;
  const run=()=>{ el.querySelector('.m1').hidden=mode!==0; el.querySelector('.m2').hidden=mode!==1;
    let c,z,E,mid,txt;
    if(mode===0){ const x=g('ci-x'), s=g('ci-s'), n=g('ci-n'); c=el.querySelector('#ci-c').value; z=ZC[c]; if(!(n>0&&s>0)) return; const se=s/Math.sqrt(n); E=z*se; mid=x;
      txt=`SE = σ ÷ √n = ${s} ÷ √${n} = ${r4(se)}<br>E = z × SE = ${z} × ${r4(se)} = <b>${r4(E)}</b><br>CI = ${x} ± ${r4(E)} = (<b>${r4(x-E)}</b>, <b>${r4(x+E)}</b>)`; }
    else { const x=g('ci-xp'), n=g('ci-np'); c=el.querySelector('#ci-cp').value; z=ZC[c]; if(!(n>0&&x>=0&&x<=n)) return; const p=x/n, se=Math.sqrt(p*(1-p)/n); E=z*se; mid=p;
      txt=`p̂ = ${x} ÷ ${n} = ${r4(p)}<br>SE = √(p̂(1 − p̂) ÷ n) = ${r4(se)}<br>E = ${z} × ${r4(se)} = <b>${r4(E)}</b><br>CI = (<b>${r4(p-E)}</b>, <b>${r4(p+E)}</b>)`; }
    el.querySelector('.steps').innerHTML=`z for ${c}% = <b>${z}</b><br>`+txt;
    const Wd=520,Hd=70,L=30,R=30, span=E*3, X=v=>L+(Wd-L-R)*(v-(mid-span))/(2*span);
    el.querySelector('.pic').innerHTML=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Confidence interval"><line x1="${L}" x2="${Wd-R}" y1="40" y2="40" stroke="var(--line)"/><line x1="${X(mid-E)}" x2="${X(mid+E)}" y1="40" y2="40" stroke="var(--wk)" stroke-width="6" stroke-linecap="round"/><circle cx="${X(mid)}" cy="40" r="6" fill="var(--ink)"/><text x="${X(mid-E)}" y="64" text-anchor="middle" ${MONO} font-size="11" fill="var(--ink)">${r2(mid-E)}</text><text x="${X(mid+E)}" y="64" text-anchor="middle" ${MONO} font-size="11" fill="var(--ink)">${r2(mid+E)}</text><text x="${X(mid)}" y="22" text-anchor="middle" ${FT} font-size="12" font-weight="700" fill="var(--ink)">${mode?'p̂':'x̄'} = ${r4(mid)}</text></svg>`; };
  el.querySelectorAll('.seg2 button').forEach((b,i)=>b.addEventListener('click',()=>{ mode=i; el.querySelectorAll('.seg2 button').forEach(x=>x.setAttribute('aria-pressed',x===b)); run(); }));
  el.querySelectorAll('input,select').forEach(i=>i.addEventListener('input',run)); run();
}

/* ---------- Week 12: chi-square test of independence ---------- */
function chiTool(el, init){
  let st=init?JSON.parse(JSON.stringify(init)):{rows:['Study alone','Study in group'],cols:['Pass','Fail'],O:[[70,30],[80,20]]};
  el.innerHTML=`<div class="tool"><div class="row" style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn ghost ar">+ row</button><button type="button" class="btn ghost ac">+ column</button><button type="button" class="btn ghost rr">− row</button><button type="button" class="btn ghost rc">− column</button>
    <label for="ch-a" style="margin-left:auto">α <select id="ch-a"><option value="0">0.10</option><option value="1" selected>0.05</option><option value="2">0.01</option></select></label></div>
    <div class="tblwrap"><table class="tbl ch-o"></table></div><p class="mono" style="margin:0;color:var(--muted)">Expected E = row total × column total ÷ grand total</p><div class="tblwrap"><table class="tbl ch-e"></table></div><div class="steps"></div></div>`;
  const draw=()=>{ const R=st.O.length, C=st.O[0].length;
    el.querySelector('.ch-o').innerHTML=`<tr><th>Observed</th>${st.cols.map((c,j)=>`<th><input aria-label="Column ${j+1} name" data-c="${j}" value="${esc(c)}"></th>`).join('')}<th>Total</th></tr>`+st.O.map((r,i)=>`<tr><th><input aria-label="Row ${i+1} name" data-r="${i}" value="${esc(st.rows[i])}"></th>${r.map((v,j)=>`<td><input inputmode="numeric" aria-label="Observed row ${i+1} column ${j+1}" data-i="${i}" data-j="${j}" value="${v}"></td>`).join('')}<td class="rt"></td></tr>`).join('')+`<tr><th>Total</th>${st.cols.map(()=>'<td class="ct"></td>').join('')}<td class="gt"></td></tr>`;
    el.querySelectorAll('.ch-o input[data-i]').forEach(inp=>inp.addEventListener('input',()=>{ st.O[+inp.dataset.i][+inp.dataset.j]=+inp.value||0; calc(); }));
    el.querySelectorAll('.ch-o input[data-r]').forEach(inp=>inp.addEventListener('input',()=>{ st.rows[+inp.dataset.r]=inp.value; calc(); }));
    el.querySelectorAll('.ch-o input[data-c]').forEach(inp=>inp.addEventListener('input',()=>{ st.cols[+inp.dataset.c]=inp.value; calc(); }));
    calc(); };
  const calc=()=>{ const O=st.O, R=O.length, C=O[0].length, rt=O.map(r=>r.reduce((a,b)=>a+b,0)), ct=O[0].map((_,j)=>O.reduce((a,r)=>a+r[j],0)), G=rt.reduce((a,b)=>a+b,0);
    el.querySelectorAll('.ch-o .rt').forEach((t,i)=>t.textContent=rt[i]); el.querySelectorAll('.ch-o .ct').forEach((t,j)=>t.textContent=ct[j]); el.querySelector('.ch-o .gt').textContent=G;
    if(!G){ return; }
    const E=O.map((r,i)=>r.map((_,j)=>rt[i]*ct[j]/G)); let chi=0; const parts=[];
    O.forEach((r,i)=>r.forEach((o,j)=>{ const e=E[i][j], t=e?(o-e)**2/e:0; chi+=t; parts.push(r4(t)); }));
    el.querySelector('.ch-e').innerHTML=`<tr><th>Expected</th>${st.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>`+E.map((r,i)=>`<tr><th>${esc(st.rows[i])}</th>${r.map(e=>`<td class="${e<5?'hi':''}">${r2(e)}</td>`).join('')}</tr>`).join('');
    const df=(R-1)*(C-1), ai=+el.querySelector('#ch-a').value, crit=(CHI[df]||[])[ai], low=E.flat().some(e=>e<5);
    el.querySelector('.steps').innerHTML=`χ² = Σ (O − E)² ÷ E = ${parts.join(' + ')} = <b>${r4(chi)}</b><br>df = (${R} − 1)(${C} − 1) = <b>${df}</b> · critical value (α = ${['0.10','0.05','0.01'][ai]}) = <b>${crit??'—'}</b><br>${crit==null?'':chi>crit?'<b>χ² &gt; critical → Reject H₀</b>: the variables are related.':'χ² ≤ critical → <b>Fail to reject H₀</b>: no evidence of a relationship.'}${low?'<br><span class="warn">Some E &lt; 5: the test may not be valid.</span>':''}`; };
  el.querySelector('#ch-a').addEventListener('input',calc);
  el.querySelector('.ar').addEventListener('click',()=>{ if(st.O.length<4){ st.O.push(st.O[0].map(()=>10)); st.rows.push('Row '+st.O.length); draw(); } });
  el.querySelector('.ac').addEventListener('click',()=>{ if(st.O[0].length<4){ st.O.forEach(r=>r.push(10)); st.cols.push('Col '+st.O[0].length); draw(); } });
  el.querySelector('.rr').addEventListener('click',()=>{ if(st.O.length>2){ st.O.pop(); st.rows.pop(); draw(); } });
  el.querySelector('.rc').addEventListener('click',()=>{ if(st.O[0].length>2){ st.O.forEach(r=>r.pop()); st.cols.pop(); draw(); } });
  draw();
}

/* ---------- Week 13-15: regression ---------- */
function regStats(x,y){ const n=x.length, Sx=x.reduce((a,b)=>a+b,0), Sy=y.reduce((a,b)=>a+b,0), Sxx=x.reduce((a,v)=>a+v*v,0), Syy=y.reduce((a,v)=>a+v*v,0), Sxy=x.reduce((a,v,i)=>a+v*y[i],0);
  const nb=n*Sxy-Sx*Sy, dx=n*Sxx-Sx*Sx, dy=n*Syy-Sy*Sy, b=nb/dx, a=(Sy-b*Sx)/n, r=nb/Math.sqrt(dx*dy); return {n,Sx,Sy,Sxx,Syy,Sxy,nb,dx,dy,b,a,r}; }
function regTool(el, def){
  el.innerHTML=`<div class="tool"><label for="rg-in">One pair per line: x, y</label><textarea id="rg-in" rows="5">${def||'1, 2\n2, 4\n3, 5\n4, 4\n5, 5'}</textarea><div class="pic"></div><div class="tblwrap"><table class="tbl rg-t"></table></div><div class="steps"></div>
   <div class="inrow"><div><label for="rg-x0">Predict at x =</label><input type="number" id="rg-x0" value="3.5"></div></div><div class="feedback rg-p"></div></div>`;
  const run=()=>{ const pr=el.querySelector('#rg-in').value.split('\n').map(l=>nums(l)).filter(p=>p.length>=2), x=pr.map(p=>p[0]), y=pr.map(p=>p[1]);
    if(pr.length<3){ el.querySelector('.steps').innerHTML='<span class="warn">Enter at least 3 pairs.</span>'; return; }
    const S=regStats(x,y); if(!S.dx){ el.querySelector('.steps').innerHTML='<span class="warn">x values must not all be equal.</span>'; return; }
    el.querySelector('.rg-t').innerHTML=`<tr><th>x</th><th>y</th><th>x²</th><th>xy</th><th>y²</th></tr>`+pr.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td><td>${r2(a*a)}</td><td>${r2(a*b)}</td><td>${r2(b*b)}</td></tr>`).join('')+`<tr><th>Σx = ${r2(S.Sx)}</th><th>Σy = ${r2(S.Sy)}</th><th>Σx² = ${r2(S.Sxx)}</th><th>Σxy = ${r2(S.Sxy)}</th><th>Σy² = ${r2(S.Syy)}</th></tr>`;
    el.querySelector('.steps').innerHTML=`b = (n·Σxy − Σx·Σy) ÷ (n·Σx² − (Σx)²) = ${r4(S.nb)} ÷ ${r4(S.dx)} = <b>${r4(S.b)}</b><br>a = (Σy − b·Σx) ÷ n = <b>${r4(S.a)}</b><br><b>ŷ = ${r4(S.a)} ${S.b<0?'−':'+'} ${r4(Math.abs(S.b))}x</b><br>r = ${r4(S.nb)} ÷ √(${r4(S.dx)} × ${r4(S.dy)}) = <b>${S.dy?r4(S.r):'—'}</b> · r² = <b>${S.dy?r4(S.r*S.r):'—'}</b>`;
    const Wd=520,Hd=230,L=40,R=14,T=12,B=30, x0=Math.min(...x), x1=Math.max(...x), y0=Math.min(...y), y1=Math.max(...y), px=(x1-x0)*.1||1, py=(y1-y0)*.15||1;
    const X=v=>L+(Wd-L-R)*(v-(x0-px))/((x1-x0)+2*px), Y=v=>T+(Hd-T-B)*(1-(v-(y0-py))/((y1-y0)+2*py));
    el.querySelector('.pic').innerHTML=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Scatter plot with regression line"><line x1="${L}" x2="${L}" y1="${T}" y2="${Hd-B}" stroke="var(--ink)"/><line x1="${L}" x2="${Wd-R}" y1="${Hd-B}" y2="${Hd-B}" stroke="var(--ink)"/>
      <line x1="${X(x0-px)}" y1="${Y(S.a+S.b*(x0-px))}" x2="${X(x1+px)}" y2="${Y(S.a+S.b*(x1+px))}" stroke="var(--wk)" stroke-width="2.4"/>${pr.map(([a,b])=>`<circle cx="${X(a)}" cy="${Y(b)}" r="5" fill="var(--c2)"/>`).join('')}
      <text x="${L}" y="${Hd-10}" ${MONO} font-size="10" fill="var(--muted)">${r2(x0)}</text><text x="${Wd-R}" y="${Hd-10}" text-anchor="end" ${MONO} font-size="10" fill="var(--muted)">${r2(x1)}</text><text x="${L-4}" y="${Y(y1)+4}" text-anchor="end" ${MONO} font-size="10" fill="var(--muted)">${r2(y1)}</text><text x="${L-4}" y="${Y(y0)+4}" text-anchor="end" ${MONO} font-size="10" fill="var(--muted)">${r2(y0)}</text></svg>`;
    const x0v=+el.querySelector('#rg-x0').value; el.querySelector('.rg-p').innerHTML=`ŷ = ${r4(S.a)} ${S.b<0?'−':'+'} ${r4(Math.abs(S.b))} × ${x0v} = <b>${r4(S.a+S.b*x0v)}</b>${x0v<x0||x0v>x1?' <span class="warn">(outside the data: extrapolation)</span>':''}`; };
  el.querySelectorAll('textarea,input').forEach(i=>i.addEventListener('input',run)); run();
}

/* ---------- static tree diagram: every step splits into 2 equal branches ---------- */
function treeSVG(levels, opt={}){
  const L=levels.length, leaves=2**L, Wd=600, rowH=L===3?26:42, Hd=leaves*rowH+20, labW=62, colW=(Wd-200-14)/L, hl=opt.hl||[];
  const X=lvl=>14+lvl*colW, y=(lvl,i)=>10+(i+.5)*(Hd-20)/(2**lvl);
  let s=`<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Tree diagram"><circle cx="${X(0)}" cy="${y(0,0)}" r="4" fill="var(--ink)"/>`;
  for(let lvl=1;lvl<=L;lvl++) for(let i=0;i<2**lvl;i++){ const pi=Math.floor(i/2), x1=lvl===1?X(0)+4:X(lvl-1)+labW, y1=y(lvl-1,pi), x2=X(lvl)-4, y2=y(lvl,i);
    s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--wk)" stroke-width="1.8"/><text x="${(x1+x2)/2}" y="${(y1+y2)/2+(i%2?14:-6)}" text-anchor="middle" ${MONO} font-size="11" font-weight="600" fill="var(--wk)">1/2</text>`;
    s+=`<text x="${X(lvl)}" y="${y2+4}" ${FT} font-weight="700" font-size="12" fill="var(--ink)">${esc(levels[lvl-1][i%2])}</text>`; }
  for(let i=0;i<leaves;i++){ let path=[], k=i; for(let lvl=L;lvl>=1;lvl--){ path.unshift(levels[lvl-1][k%2]); k=Math.floor(k/2); }
    const lab=path.join(', '), on=hl.includes(lab);
    s+=`<text x="${X(L)+labW+6}" y="${y(L,i)+4}" ${MONO} font-size="11" fill="${on?'var(--wk)':'var(--muted)'}" font-weight="${on?700:400}">(${esc(lab)}) · 1/${leaves}</text>`; }
  return s+'</svg>';
}

window.ST={treeSVG,hist,boxSVG,nums,median,fiveNum,shapeTool,polyTool,boxTool,spreadTool,vennTool,treeTool,distTool,freqTool,binomTool,normalTool,normalCurve,ruleTool,zRow,cltTool,ciTool,chiTool,regTool,regStats,phi,tab,choose,CHI,r2,r4};
})();
