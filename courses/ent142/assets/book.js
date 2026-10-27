/* textbook first: shown right under the course title on the home page */
(function(){
  const C=window.COURSE||{}, B=C.textbook; if(!B) return;
  function go(){ const hero=document.querySelector('.pt-hero'); if(!hero) return setTimeout(go,80); if(document.querySelector('.pt-book')) return;
    const el=document.createElement('section'); el.className='pt-book'; el.id='textbook';
    el.innerHTML='<div class="cover" aria-hidden="true"><b>'+B.title+'</b><span>'+(B.short||'')+'</span></div><div><span class="eb">Textbook</span><h3>'+B.title+'</h3><p>'+B.by+'</p><p>'+B.note+'</p><p>'+B.use+'</p>'+(B.also?'<p>'+B.also+'</p>':'')+(B.url?'<a class="go" href="'+B.url+'" target="_blank" rel="noopener">Open the textbook ↗</a>':'')+'</div>';
    hero.after(el);
    const ez=document.createElement('div'); ez.innerHTML='<button type="button" class="ezbtn">Easy version · short steps, starters, read aloud</button>'; el.after(ez); }
  go();
})();
