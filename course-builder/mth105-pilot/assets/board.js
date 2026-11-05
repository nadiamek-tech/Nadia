/* Board-style model answers: written in marker like the professor's whiteboard, with a drawn calculator
   that shows the exact entry (brackets included) and the result.
   Board.make(groups, foot) → html. A group = {t:'(a)', lines:[html…], calc:[entry, result]}.
   Line helpers: Board.line(html,'ans'), Board.fr(lhs, num, den, {n, d, after, plain}), Board.frac(n, d),
   Board.dec([[symbol, value]…]), Board.tb(head, rows, foot). Colours: green = top of the fraction, red = bottom, purple = brackets, orange = + and Σ. */
(function(){
  const css=`
@font-face{font-family:BoardHand;src:url(assets/fonts/patrick-hand-latin-400-normal.woff2) format('woff2');font-display:swap}
.bd{--bi:#1c3a9c;--bg2:#15803d;--br:#c62828;background:#fbfaf5;color:var(--bi);border:1px solid #d6d2c6;border-radius:10px;box-shadow:inset 0 0 50px rgba(0,0,0,.04);padding:6px 18px;margin:10px 0;font-family:BoardHand,'Segoe Print','Bradley Hand',cursive;font-size:1.42rem;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.bd-g{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:6px 22px;align-items:center;padding:12px 0}
.bd-g+.bd-g{border-top:2px dashed #d6d2c6}
.bd-g.nocalc{grid-template-columns:minmax(0,1fr)}
.bd-t{grid-column:1/-1;color:var(--br);font-weight:700;margin-bottom:-4px}
.bd-w{min-width:0;overflow-x:auto}
.bd-l{margin:.3em 0}
.bd-l.ans b{color:var(--bi);border-bottom:3px solid var(--br);padding:0 .1em}
.bd b{font-weight:700}.bd .nw{white-space:nowrap}
.bd .nm{font-size:.78em;color:#5b6b8c}.bd .kb{color:#8e24aa;font-weight:700}.bd .ks{color:#e8590c;font-weight:700}.bd .g{color:var(--bg2)}.bd .r{color:var(--br)}
.bfx{display:flex;align-items:center;gap:.35em;margin:.35em 0;white-space:nowrap}
.bfr{display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;margin:0 .1em}
.bfr>span{text-align:center;padding:0 .25em;line-height:1.35}
.bfr>span+span{border-top:2.5px solid var(--bi);border-radius:2px}
.bnote{display:inline-flex;flex-direction:column;justify-content:space-between;align-self:stretch;margin-left:.9em;font-size:.92em}
.bdec div{margin:.1em 0 .1em .4em;white-space:nowrap}
.btb{border-collapse:collapse;margin:.35em 0;font-size:.95em}
.btb th,.btb td{white-space:nowrap;border:2px solid var(--bi);padding:.05em .7em;text-align:center;font-weight:400}
.btb th{border-top:0}.btb tr>*:first-child{border-left:0}.btb tr>*:last-child{border-right:0}.btb tr:last-child>*{border-bottom:0}
.btb tfoot td{color:var(--br)}
.bd .xb{font-style:normal}.bd .xb::before{left:0;right:0;top:.38em;border-top-width:2px}
.bcalc{border:2.5px solid var(--br);border-radius:12px 18px 10px 16px;padding:6px 8px 8px;text-align:center}
.bcalc>span{display:block;color:var(--br);font-size:1.05rem;margin-bottom:2px}
.bcalc svg{width:100%;max-width:200px;height:auto;display:block;margin:0 auto}
.bd-foot{font-family:var(--f-mono);font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:2px 0 8px}
@media (max-width:640px){.bd{padding:4px 12px;font-size:1.25rem}.bd-g{grid-template-columns:minmax(0,1fr)}.bcalc{max-width:220px;margin:4px auto 0}}
@media print{.bd{break-inside:avoid;box-shadow:none}.bd-g{grid-template-columns:minmax(0,1fr) 190px}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  const frac=(n,d)=>`<span class="bfr"><span>${n}</span><span>${d}</span></span>`;
  const line=(h,c='')=>`<div class="bd-l ${c}">${h}</div>`;
  const fr=(lhs,num,den,o={})=>`<div class="bfx"><span>${lhs} =</span><span class="bfr"><span class="${o.plain?'':'g'}">${num}</span><span class="${o.plain?'':'r'}">${den}</span></span>${o.after?`<span>${o.after}</span>`:''}${o.n||o.d?`<span class="bnote"><span class="g">${o.n?'⟶ '+o.n:''}</span><span class="r">${o.d?'⟶ '+o.d:''}</span></span>`:''}</div>`;
  const dec=pairs=>`<div class="bdec">${pairs.map(([s,v],i)=>`<div class="${['g','r','g'][i%3]}">${s} ⟶ ${v}</div>`).join('')}</div>`;
  const tb=(h,rows,foot)=>`<table class="btb"><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>${foot?`<tfoot><tr>${foot.map(x=>`<td>${x}</td>`).join('')}</tr></tfoot>`:''}</table>`;

  /* calculator drawing: the screen shows the full entry (wrapped) and the result */
  function calc(entry,res){
    const tok=entry.split(/(?<=[+])/), lines=[]; let cur='';
    tok.forEach(t=>{ if((cur+t).length>22&&cur){ lines.push(cur); cur=t; } else cur+=t; }); if(cur) lines.push(cur);
    const sh=lines.length*17+36, ky=16+sh+14, K=[['(',')','x²','√','^'],['7','8','9','DEL','AC'],['4','5','6','×','÷'],['1','2','3','+','−'],['0','.','×10ˣ','Ans','=']];
    const H=ky+K.length*24+10;
    let s=`<svg viewBox="0 0 210 ${H}" role="img" aria-label="Calculator: ${entry} = ${res}"><rect x="1" y="1" width="208" height="${H-2}" rx="18" fill="#2c3038" stroke="#15171b" stroke-width="2"/>
      <rect x="14" y="16" width="182" height="${sh}" rx="7" fill="#c8d6bd" stroke="#1d2024" stroke-width="2"/>`;
    lines.forEach((l,i)=>{ s+=`<text x="22" y="${36+i*17}" font-family="JetBrains Mono,Consolas,monospace" font-size="13" fill="#15181c" xml:space="preserve">${l.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`; });
    s+=`<text x="188" y="${16+sh-10}" text-anchor="end" font-family="JetBrains Mono,Consolas,monospace" font-size="${String(res).length>9?(String(res).length>11?14:16):19}" font-weight="700" fill="#15181c">${res}</text>`;
    K.forEach((row,r)=>row.forEach((k,c)=>{ const x=14+c*37, y=ky+r*24, eq=k==='=', fn=r===0||k==='DEL'||k==='AC';
      s+=`<rect x="${x}" y="${y}" width="33" height="18" rx="5" fill="${eq?'#c62828':fn?'#4a505b':'#e8e8e4'}"/><text x="${x+16.5}" y="${y+13}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${k.length>2?8.5:11}" font-weight="700" fill="${eq||fn?'#fff':'#20232a'}">${k}</text>`; }));
    return s+'</svg>';
  }
  /* one colour for brackets, one for + and Σ (the adding signs), everywhere on the board */
  const tint=h=>h.replace(/>([^<]+)</g,(m,t)=>'>'+t.replace(/[()[\]]/g,c=>`<span class="kb">${c}</span>`).replace(/[+Σ]/g,c=>`<span class="ks">${c}</span>`)+'<');
  const make=(groups,foot)=>`<div class="bd">${groups.map(g=>`<div class="bd-g${g.calc?'':' nocalc'}">${g.t?`<div class="bd-t">${g.t}</div>`:''}<div class="bd-w">${tint(g.lines.join(''))}</div>${g.calc?`<div class="bcalc"><span>Calculator</span>${calc(g.calc[0],g.calc[1])}</div>`:''}</div>`).join('')}</div>${foot?`<p class="bd-foot">${foot}</p>`:''}`;
  window.Board={make,line,fr,frac,dec,tb,calc};
})();
