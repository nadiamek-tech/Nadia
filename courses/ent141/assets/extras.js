/* Suggested course: textbook strip, key words first and catch-up steps on reused lecture pages */
(function(){
  const X=window.EXTRA; if(!X) return;
  function go(){
    const head=document.querySelector('.op-head'); if(!head){ return setTimeout(go,120); }
    if(document.querySelector('.tbstrip')) return;
    const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const tb=document.createElement('div'); tb.className='tbstrip';
    tb.innerHTML='<b>Textbook</b><span>'+X.book+'</span>'+(X.url?'<a href="'+X.url+'" target="_blank" rel="noopener">Open ↗</a>':'');
    head.appendChild(tb);
    if(X.short&&X.short.length){ const ez=document.createElement('div'); ez.className='ez easy';
      ez.innerHTML='<b>In short <button type="button" class="say" data-say="'+esc(X.short.join(' '))+'">Listen</button></b><ol class="esteps">'+X.short.map((x,i)=>'<li><i>'+(i+1)+'</i>'+esc(x)+'</li>').join('')+'</ol><p class="starter">Then open the <a href="'+X.lab+'">lab</a>.</p>';
      head.appendChild(ez); }
    if(X.kw&&X.kw.length){ const k=document.createElement('section'); k.className='lkw'; k.id='key-words';
      k.innerHTML='<span class="eyebrow">Key words for this week</span><p class="lkw-lead">Read these first.</p><div class="lkw-grid">'+X.kw.map((x,i)=>'<div class="lkw-c"><div class="lkw-w"><b>'+x[0]+'</b>'+(window.speechSynthesis?'<button type="button" class="lkw-say" data-i="'+i+'" aria-label="Listen: '+esc(x[0])+'">🔊</button>':'')+'</div><p>'+x[1]+'</p><p class="lkw-x">'+x[2]+'</p></div>').join('')+'</div>';
      k.querySelectorAll('.lkw-say').forEach(b=>b.onclick=()=>{ const x=X.kw[+b.dataset.i]; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(x[0]+'. '+x[1]); u.lang='en-GB'; speechSynthesis.speak(u); });
      head.after(k); }
    const PR=window.PROF||{}, secs=[...document.querySelectorAll('.op-sec')];
    const mc=document.createElement('div'); mc.className='lmissed';
    mc.innerHTML='<span class="eyebrow">Missed this class?</span><p class="lm-lead">No problem. Catch up at your own pace, in this order:</p><ol>'
      +'<li><b>Read the key words</b> at the <a href="#key-words">top of this page</a>, then the textbook pages above.</li>'
      +'<li><b>Go through the topics</b>, one at a time: '+secs.map(s=>{const h=s.querySelector('h2,h3');return h?'<a href="#'+s.id+'">'+esc(h.textContent)+'</a>':'';}).filter(Boolean).join(' · ')+'.</li>'
      +'<li><b>Open this week\'s lab guide</b>: <a href="'+X.lab+'">'+esc(X.labName)+'</a>. Ask your team what they did.</li>'
      +'<li><b>Bring your questions</b> to office hours'+(PR.officeHours?': '+esc(PR.officeHours):'')+'. Every question is welcome.</li></ol>';
    const last=secs[secs.length-1]; (last||head).after(mc);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(go,60)); else setTimeout(go,60);
})();
