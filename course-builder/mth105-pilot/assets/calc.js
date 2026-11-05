/* Scientific calculator for MTH 105 (no eval). CALC.mount(el). Supports + − × ÷ ^ ( ) x² n! nCr √ ln log π e Ans. */
(function(){
  const FN={'√':Math.sqrt,'ln':Math.log,'log':Math.log10};
  function fact(n){ if(n<0||!Number.isInteger(n)||n>170) throw Error('n! needs a whole number from 0 to 170'); let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
  function ncr(n,r){ if(!Number.isInteger(n)||!Number.isInteger(r)||r<0||n<0||r>n) throw Error('nCr needs whole numbers with r ≤ n'); let v=1; for(let i=1;i<=r;i++) v=v*(n-r+i)/i; return Math.round(v); }
  function tokenize(s,ans){ const t=[]; let i=0;
    while(i<s.length){ const c=s[i];
      if(/\s/.test(c)){ i++; continue; }
      if(/[0-9.]/.test(c)){ let j=i; while(j<s.length&&/[0-9.]/.test(s[j])) j++; const v=s.slice(i,j); if((v.match(/\./g)||[]).length>1) throw Error('Two decimal points in one number'); t.push({k:'n',v:+v}); i=j; continue; }
      if(s.startsWith('Ans',i)){ t.push({k:'n',v:ans}); i+=3; continue; }
      if(s.startsWith('ln',i)){ t.push({k:'f',v:'ln'}); i+=2; continue; }
      if(s.startsWith('log',i)){ t.push({k:'f',v:'log'}); i+=3; continue; }
      if(c==='√'){ t.push({k:'f',v:'√'}); i++; continue; }
      if(c==='π'){ t.push({k:'n',v:Math.PI}); i++; continue; }
      if(c==='e'){ t.push({k:'n',v:Math.E}); i++; continue; }
      if(s.startsWith('nCr',i)||c==='C'){ t.push({k:'o',v:'C'}); i+=s.startsWith('nCr',i)?3:1; continue; }
      const map={'+':'+','-':'−','−':'−','*':'×','×':'×','/':'÷','÷':'÷','^':'^','(':'(',')':')','²':'²','!':'!'};
      if(map[c]){ t.push({k:'o',v:map[c]}); i++; continue; }
      throw Error('Unknown key: '+c); }
    return t; }
  function parse(t){ let p=0; const peek=()=>t[p], take=()=>t[p++];
    const isStart=x=>x&&(x.k==='n'||x.k==='f'||(x.k==='o'&&x.v==='('));
    function expr(){ let v=term(); while(peek()&&peek().k==='o'&&(peek().v==='+'||peek().v==='−')){ const o=take().v, r=term(); v=o==='+'?v+r:v-r; } return v; }
    function term(){ let v=comb(); for(;;){ const x=peek(); if(x&&x.k==='o'&&(x.v==='×'||x.v==='÷')){ take(); const r=comb(); if(x.v==='÷'&&r===0) throw Error('Cannot divide by 0'); v=x.v==='×'?v*r:v/r; } else if(isStart(x)){ v*=comb(); } else break; } return v; }
    function comb(){ let v=unary(); while(peek()&&peek().k==='o'&&peek().v==='C'){ take(); v=ncr(v,unary()); } return v; }
    function unary(){ const x=peek(); if(x&&x.k==='o'&&(x.v==='−'||x.v==='+')){ take(); const v=unary(); return x.v==='−'?-v:v; } return power(); }
    function power(){ const b=post(); if(peek()&&peek().k==='o'&&peek().v==='^'){ take(); return Math.pow(b,unary()); } return b; }
    function post(){ let v=prim(); while(peek()&&peek().k==='o'&&(peek().v==='²'||peek().v==='!')){ v=take().v==='²'?v*v:fact(v); } return v; }
    function prim(){ const x=take(); if(!x) throw Error('Incomplete expression');
      if(x.k==='n') return x.v;
      if(x.k==='f'){ let a; if(peek()&&peek().v==='('){ take(); a=expr(); if(!peek()||peek().v!==')') throw Error('Missing )'); take(); } else a=post();
        if((x.v==='√')&&a<0) throw Error('√ of a negative number'); if((x.v==='ln'||x.v==='log')&&a<=0) throw Error(x.v+' needs a positive number'); return FN[x.v](a); }
      if(x.v==='('){ const v=expr(); if(peek()&&peek().v===')') take(); return v; }
      throw Error('Unexpected '+x.v); }
    const v=expr(); if(p<t.length) throw Error('Unexpected '+t[p].v); return v; }
  const fmt=v=>{ if(!isFinite(v)) return 'Math error'; const a=Math.abs(v); if(a!==0&&(a>=1e10||a<1e-6)) return v.toExponential(6).replace('e','×10^'); return String(Math.round(v*1e10)/1e10); };
  function mount(el){
    let expr='', ans=0, hist=[];
    const K=[['x²','²'],['xʸ','^'],['√','√('],['n!','!'],['nCr','C'],['(','('],[')',')'],['ln','ln('],['log','log('],['π','π'],
             ['7','7'],['8','8'],['9','9'],['DEL','del'],['AC','ac'],['4','4'],['5','5'],['6','6'],['×','×'],['÷','÷'],['1','1'],['2','2'],['3','3'],['+','+'],['−','−'],['0','0'],['.','.'],['(−)','−'],['Ans','Ans'],['=','=']];
    el.innerHTML=`<div class="calc"><div class="cdisp" aria-live="polite"><div class="cexp" id="c-exp">&nbsp;</div><div class="cres" id="c-res">0</div></div>
      <div class="ckeys">${K.map(([l,v])=>`<button type="button" data-v="${v}" class="${/^[0-9.]$/.test(v)?'d':v==='='?'eq':v==='ac'||v==='del'?'cl':'f'}">${l}</button>`).join('')}</div>
      <div class="chist" id="c-hist"></div><p class="cnote">Keyboard works too: digits, + − * / ^ ( ), Enter, Backspace.</p></div>`;
    const E=el.querySelector('#c-exp'), R=el.querySelector('#c-res'), H=el.querySelector('#c-hist');
    const show=()=>{ E.textContent=expr||' '; };
    const calc=()=>{ if(!expr) return; try{ const v=parse(tokenize(expr,ans)); const s=fmt(v); R.textContent=s; R.classList.remove('err'); if(isFinite(v)){ ans=v; hist.unshift([expr,s]); hist=hist.slice(0,6); H.innerHTML=hist.map(([e,r])=>`<button type="button" data-e="${e.replace(/"/g,'&quot;')}">${e} = <b>${r}</b></button>`).join(''); H.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ expr=b.dataset.e; show(); })); expr=''; show(); } }catch(e){ R.textContent=e.message; R.classList.add('err'); } };
    const press=v=>{ if(v==='=') return calc(); if(v==='ac'){ expr=''; R.textContent='0'; R.classList.remove('err'); return show(); } if(v==='del'){ expr=expr.endsWith('Ans')?expr.slice(0,-3):expr.endsWith('ln(')?expr.slice(0,-3):expr.endsWith('log(')?expr.slice(0,-4):expr.slice(0,-1); return show(); } expr+=v; show(); };
    el.querySelectorAll('.ckeys button').forEach(b=>b.addEventListener('click',()=>press(b.dataset.v)));
    el.addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT') return; const k=e.key; if(/^[0-9.+\-*/^()!]$/.test(k)){ e.preventDefault(); press({'-':'−','*':'×','/':'÷'}[k]||k); } else if(k==='Enter'||k==='='){ e.preventDefault(); press('='); } else if(k==='Backspace'){ e.preventDefault(); press('del'); } else if(k==='Escape'){ press('ac'); } });
    el.tabIndex=0;
  }
  window.CALC={mount,parse,tokenize,fmt};
})();
