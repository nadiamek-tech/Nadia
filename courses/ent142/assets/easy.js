/* Easy version for students of determination: short steps, sentence starters, read-aloud, one part at a time.
   One switch in Learning supports (or the Easy version button). Nothing is sent; it stays in this browser. */
(function(){
  const KEY='learning-supports', SET=['easy','words','catchup','voice','font','space'];
  const get=()=>{ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } };
  window.Easy={on:()=>document.documentElement.hasAttribute('data-sup-easy'),
    toggle(){ const s=get(), on=!s.easy; SET.forEach(k=>{ if(on) s[k]=1; else delete s[k]; }); try{ localStorage.setItem(KEY,JSON.stringify(s)); }catch(e){}
      SET.forEach(k=>{ if(on) document.documentElement.setAttribute('data-sup-'+k,''); else document.documentElement.removeAttribute('data-sup-'+k); });
      location.reload(); },
    say(t){ if(!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang='en-GB'; u.rate=.92; speechSynthesis.speak(u); }};
  if(get().easy) document.documentElement.setAttribute('data-sup-easy','');
  function ui(){
    if(!document.body) return setTimeout(ui,50);
    if(!document.querySelector('.ezchip')){ const c=document.createElement('div'); c.className='ezchip'; c.innerHTML='Easy version on<button type="button">Turn off</button>'; c.querySelector('button').onclick=()=>Easy.toggle(); document.body.appendChild(c); }
    document.querySelectorAll('[data-say]').forEach(b=>{ if(b.__w) return; b.__w=1; b.onclick=()=>Easy.say(b.dataset.say); });
    document.querySelectorAll('.ezbtn').forEach(b=>{ if(b.__w) return; b.__w=1; b.onclick=()=>Easy.toggle(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ui); else ui();
  setTimeout(ui,800);
})();
