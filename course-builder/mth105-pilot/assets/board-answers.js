/* Board model answers for practice: the professor's board method (same as the midterm revision page).
   Every group = {t:'title', lines:[html…], calc:[calculator entry, result shown]}; BA.board(groups) → html.
   Ready-made groups (numbers computed here, so board and calculator always agree):
     BA.mean(xs,{t,unit}) · BA.var(xs,{t}) (bracket method) · BA.sd(v,{t,inner}) · BA.cv(sd,mean,{t,lhs,sTxt,entry})
     BA.e(xs,ps,{t}) · BA.varX(xs,ps,{t})
   Build any other formula with Board.fr / Board.frac / Board.line / Board.dec (assets/board.js).
   Names used in class: Var (= s²), SD (= s), CV. Brackets and + / Σ are coloured automatically by Board. */
(function(){
  const B=window.Board, XB='<span class="xb">x</span>', sq2='<sup>2</sup>';
  const num=x=>String(parseFloat((+x).toFixed(4))).replace('-','−');
  const lcd=x=>String(parseFloat((+x).toPrecision(10))).replace('-','−');
  const r2=x=>num(Math.round(x*100)/100), r1=x=>num(Math.round(x*10)/10), r4=x=>num(Math.round(x*10000)/10000);
  const sum=a=>a.reduce((s,x)=>s+x,0);
  const NM=h=>B.line(`<span class="nm">${h}</span>`);
  const HOW='Method: as covered in class.';
  function mean(xs,o={}){ const n=xs.length, S=sum(xs), m=S/n, ex=Number.isInteger(m*10000);
    return {t:o.t,lines:[B.line(`x<sub>i</sub> = ${xs.map(num).join(', ')}`),
      B.fr(XB,'Σx<sub>i</sub>','n',{n:'list above',d:String(n)}),
      B.fr(XB,xs.map(num).join(' + '),String(n),{plain:true}),
      B.line(`${XB} = ${B.frac(num(S),String(n))} ${ex?'=':'≈'} <b>${ex?num(m):r2(m)}</b>${o.unit?' '+o.unit:''}`,'ans')],
      calc:[`(${xs.map(num).join('+')})÷${n}`,lcd(m)]}; }
  function variance(xs,o={}){ const n=xs.length, m=sum(xs)/n, S=sum(xs.map(x=>(x-m)**2)), M=num(m), v=S/(n-1), ex=Number.isInteger(v*10000);
    return {t:o.t,lines:[NM(`Var = s${sq2} (s${sq2} is the maths symbol, Var is what we use)`),
      B.fr('Var',`Σ(x − ${XB})${sq2}`,'n − 1',{n:`${XB} = ${M}`,d:`n = ${n}`}),
      B.line(`Var = [ ${xs.map(x=>`<span class="nw">(${num(x)} − ${M})${sq2}</span>`).join(' + ')} ] ÷ <span class="nw">(${n} − 1)</span>`),
      B.line(`Var = ${B.frac(num(S),String(n-1))} ${ex?'=':'≈'} <b>${ex?num(v):r2(v)}</b>`,'ans')],
      calc:[`(${xs.map(x=>`(${num(x)}−${M})²`).join('+')})÷(${n}−1)`,lcd(v)]}; }
  function sd(v,o={}){ const s=Math.sqrt(v), inner=o.inner||'Var', exact=Number.isInteger(s*10000);
    return {t:o.t,lines:(o.inner?[]:[NM('SD = s (s is the maths symbol, SD is what we use)')]).concat([B.line(`SD = √<span class="g">${inner}</span> <span class="g">&nbsp;⟶ ${num(v)}</span>`),B.line(`SD = √${num(v)} ${exact?'=':'≈'} <b>${exact?num(s):r2(s)}</b>`,'ans')]),calc:[`√(${num(v)})`,lcd(s)]}; }
  function cv(s,m,o={}){ const c=s/m*100, sTxt=o.sTxt||r2(s), L=o.lhs||'CV', ex=Number.isInteger(c*100);
    return {t:o.t,lines:[B.fr(L,'SD',XB,{n:sTxt,d:num(m),after:'× 100%'}),
      B.line(`${L} = ${B.frac(sTxt,num(m))} × 100% ${ex?'=':'≈'} <b>${ex?num(c):r1(c)}%</b>`,'ans')],
      calc:[`${o.entry||num(s)}÷${num(m)}×100`,lcd(c)]}; }
  function e(xs,ps,o={}){ const v=sum(xs.map((x,i)=>x*ps[i]));
    return {t:o.t,lines:[B.line(`E(X) = Σ <span class="g">x</span> · <span class="r">P(x)</span>`),B.dec([['x',xs.join(', ')],['P(x)',ps.join(', ')]]),
      B.line(`E(X) = ${xs.map((x,i)=>`<span class="nw">${x}(${ps[i]})</span>`).join(' + ')}`),B.line(`E(X) = <b>${num(v)}</b>`,'ans')],
      calc:[xs.map((x,i)=>`${x}×${ps[i]}`).join('+'),lcd(v)]}; }
  function varX(xs,ps,o={}){ const mu=sum(xs.map((x,i)=>x*ps[i])), V=sum(xs.map((x,i)=>(x-mu)**2*ps[i])), M=num(mu);
    return {t:o.t,lines:[B.line(`Var(X) = Σ(<span class="g">x</span> − <span class="r">μ</span>)${sq2} · P(x)`),B.dec([['x',xs.join(', ')],['μ = E(X)',M],['P(x)',ps.join(', ')]]),
      B.line(`Var(X) = ${xs.map((x,i)=>`<span class="nw">(${x} − ${M})${sq2}(${ps[i]})</span>`).join(' + ')}`),
      B.line(`Var(X) = <b>${num(V)}</b>`,'ans')],
      calc:[xs.map((x,i)=>`(${x}−${M})²×${ps[i]}`).join('+'),lcd(V)]}; }
  /* typed rows for the non-formula parts of a mixed answer (no method line) */
  const steps=a=>`<div class="mg">${a.map(([l,t])=>`<div${l==='Answer'?' class="fin"':''}><span>${l}</span><span>${t}</span></div>`).join('')}</div>`;
  const board=(groups,foot=HOW)=>B.make(groups,foot);
  /* two graphs/formulas next to each other (never stacked): BA.side([['Caption',html],['Caption',html]]) */
  const side=items=>`<div class="side2">${items.map(([c,h])=>`<div>${c?`<span class="s2-cap">${c}</span>`:''}${h}</div>`).join('')}</div><p class="side2-hint">Swipe to see the other one →</p>`;
  window.BA={side,XB,sq2,num,lcd,r1,r2,r4,sum,NM,HOW,mean,var:variance,sd,cv,e,varX,steps,board};
})();
