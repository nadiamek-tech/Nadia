/* Casio-style scientific calculator (layout of the fx-82/fx-991 family) for the practice workspace.
   CASIO.mount(el) → uses the course calculator engine (assets/calc.js: CALC.tokenize/parse, no eval).
   Natural display: the entry on the top line, the result on the bottom line (10 significant digits),
   S⇔D switches the last result between a fraction and a decimal. Keyboard: digits, + − * / ^ ( ), Enter, Backspace, Esc. */
(function(){
  const css=`
.casio{background:#2c3038;border:2px solid #15171b;border-radius:22px;padding:14px 12px 12px;max-width:300px;width:100%;box-shadow:0 8px 20px rgba(0,0,0,.18);user-select:none;-webkit-user-select:none;touch-action:manipulation}
.casio .brand{display:flex;justify-content:space-between;color:#c9ced6;font:700 .7rem/1 Arial,sans-serif;letter-spacing:.06em;margin:0 4px 8px}
.casio .lcd{background:#c8d6bd;border:2px solid #1d2024;border-radius:8px;padding:8px 10px;min-height:86px;display:flex;flex-direction:column;justify-content:space-between;font-family:"JetBrains Mono",Consolas,monospace;color:#15181c;box-shadow:inset 0 2px 6px rgba(0,0,0,.18)}
.casio .in{font-size:.95rem;line-height:1.3;word-break:break-all;min-height:1.3em}
.casio .in .cur{display:inline-block;width:2px;height:1.05em;background:#15181c;vertical-align:-2px;animation:cblink 1s steps(1) infinite}
@keyframes cblink{50%{opacity:0}}
.casio .out{font-size:1.6rem;font-weight:700;text-align:right;line-height:1.2;min-height:1.2em}
.casio .out.err{font-size:.95rem;color:#8b1a1a}
.casio .ind{font-size:.62rem;letter-spacing:.06em;opacity:.7;height:.9em}
.casio .keys{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:12px}
.casio button{border:0;border-radius:7px;padding:9px 0;font:700 .92rem/1 Arial,sans-serif;cursor:pointer;color:#20232a;background:#e8e8e4;box-shadow:0 2px 0 #9a9a96}
.casio button:active{transform:translateY(1px);box-shadow:none}
.casio button.fn{background:#4a505b;color:#fff;box-shadow:0 2px 0 #1d2024;font-size:.82rem}
.casio button.cl{background:#d9862c;color:#fff;box-shadow:0 2px 0 #8a5317}
.casio button.eq{background:#c62828;color:#fff;box-shadow:0 2px 0 #7a1717}
.casio .row-gap{grid-column:1/-1;height:2px}
.casio:focus{outline:2px solid #7c9bff;outline-offset:2px}`;
  if(!document.getElementById('casio-css')){ const st=document.createElement('style'); st.id='casio-css'; st.textContent=css; document.head.appendChild(st); }
  const KEYS=[
    ['x²','²','fn'],['xʸ','^','fn'],['√','√(','fn'],['nCr','C','fn'],['S⇔D','sd','fn'],
    ['(','(','fn'],[')',')','fn'],['π','π','fn'],['(−)','−','fn'],['Ans','Ans','fn'],
    null,
    ['7','7'],['8','8'],['9','9'],['DEL','del','cl'],['AC','ac','cl'],
    ['4','4'],['5','5'],['6','6'],['×','×'],['÷','÷'],
    ['1','1'],['2','2'],['3','3'],['+','+'],['−','−'],
    ['0','0'],['.','.'],['×10ˣ','×10^'],['Ans','Ans'],['=','=','eq']];
  const sig10=v=>{ if(!isFinite(v)) return 'Math ERROR'; const a=Math.abs(v); if(a!==0&&(a>=1e10||a<1e-9)) return v.toExponential(9).replace(/\.?0+e/,'e').replace('e','×10^').replace('+',''); return String(parseFloat(v.toPrecision(10))).replace('-','−'); };
  const frac=v=>{ if(!isFinite(v)||Number.isInteger(v)) return null; let h1=1,h0=0,k1=0,k0=1,b=v; for(let i=0;i<20;i++){ const a=Math.floor(b), h2=a*h1+h0, k2=a*k1+k0; h0=h1;h1=h2;k0=k1;k1=k2; if(Math.abs(v-h1/k1)<1e-10) break; b=1/(b-a); if(!isFinite(b)) break; } if(k1>9999||Math.abs(v-h1/k1)>1e-10) return null; return (h1<0?'−':'')+Math.abs(h1)+'⌟'+k1; };
  function mount(el){
    let expr='', ans=0, last=null, showFrac=false;
    el.innerHTML=`<div class="casio" tabindex="0" aria-label="Scientific calculator"><div class="brand"><span>MTH 105</span><span>SCIENTIFIC</span></div>
      <div class="lcd"><div class="ind">D</div><div class="in" aria-live="polite"></div><div class="out" aria-live="polite">0</div></div>
      <div class="keys">${KEYS.map(k=>k?`<button type="button" data-v="${k[1]}" class="${k[2]||''}" aria-label="${k[0]}">${k[0]}</button>`:'<span class="row-gap"></span>').join('')}</div></div>`;
    const box=el.querySelector('.casio'), IN=el.querySelector('.in'), OUT=el.querySelector('.out');
    const draw=()=>{ IN.innerHTML=(expr.replace(/&/g,'&amp;').replace(/</g,'&lt;'))+'<span class="cur"></span>'; };
    const result=()=>{ if(last===null) return; OUT.classList.remove('err'); const f=showFrac&&frac(last); OUT.textContent=f||sig10(last); };
    const run=()=>{ if(!expr) return; try{ const v=CALC.parse(CALC.tokenize(expr.replace(/×10\^/g,'×10^'),ans)); last=v; ans=v; showFrac=false; result(); }catch(e){ OUT.textContent=/Missing|Unexpected|Incomplete/.test(e.message)?'Syntax ERROR':'Math ERROR'; OUT.classList.add('err'); } };
    const press=v=>{ if(v==='=') return run();
      if(v==='ac'){ expr=''; last=null; OUT.textContent='0'; OUT.classList.remove('err'); return draw(); }
      if(v==='del'){ for(const t of ['Ans','√(','×10^']) if(expr.endsWith(t)){ expr=expr.slice(0,-t.length); return draw(); } expr=expr.slice(0,-1); return draw(); }
      if(v==='sd'){ if(last!==null){ showFrac=!showFrac; result(); } return; }
      expr+=v; draw(); };
    box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ press(b.dataset.v); box.focus({preventScroll:true}); }));
    box.addEventListener('keydown',e=>{ const k=e.key; if(/^[0-9.+\-*/^()]$/.test(k)){ e.preventDefault(); press({'-':'−','*':'×','/':'÷'}[k]||k); } else if(k==='Enter'||k==='='){ e.preventDefault(); press('='); } else if(k==='Backspace'){ e.preventDefault(); press('del'); } else if(k==='Escape'){ press('ac'); } });
    draw();
    return {press,value:()=>last};
  }
  window.CASIO={mount};
})();
