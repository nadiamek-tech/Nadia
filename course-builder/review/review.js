/* Course Builder · pilot review layer.
   Loaded on every page of a pilot copy. Each page gets a review box (typed or spoken comments);
   comments stay on the reviewer's device until they press "Send my review", which saves one HTML file
   (readable report + embedded data) for the course builder team. Config: window.PILOT (pilot.js). */
(function(){
  const P=window.PILOT||{}; if(!P.code) return;
  const KEY=`pilot-review:${P.code}:r${P.round}`, ME='pilot-reviewer';
  const page=(location.pathname.split('/').pop()||'index.html');
  const PAGES=P.pages||[]; const pinfo=PAGES.find(p=>p.file===page)||{file:page,title:document.title};
  const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  let S=ls.get(KEY,{pages:{}}); const save=()=>ls.set(KEY,S);
  let who=ls.get(ME,null);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const pg=()=>S.pages[page]||(S.pages[page]={comments:[],status:''});
  const TYPES=['Content','Accuracy','Design','Missing','Remove','Student experience'];

  /* ---------- styles ---------- */
  const css=`
  .pv,.pv *{box-sizing:border-box;font-family:"Segoe UI",system-ui,-apple-system,sans-serif}
  .pv{--pv-bg:#fff;--pv-ink:#17202a;--pv-mut:#5b6672;--pv-line:#d8dde3;--pv-soft:#f2f5f8;--pv-acc:#1f4f8f;--pv-acc-s:#e4edf8;--pv-ok:#1b6a4f;--pv-red:#b3261e;color:var(--pv-ink)}
  @media (prefers-color-scheme:dark){.pv{--pv-bg:#1b1f25;--pv-ink:#e8ebef;--pv-mut:#a3adb8;--pv-line:#323944;--pv-soft:#232932;--pv-acc:#8fb5ef;--pv-acc-s:#1b2a40;--pv-ok:#5fcaa0;--pv-red:#f08a7e}}
  .pv-strip{position:relative;z-index:5;background:#1f4f8f;color:#fff;font:600 12.5px/1.3 "Segoe UI",system-ui,sans-serif;padding:5px max(12px,env(safe-area-inset-left,0px));display:flex;gap:10px;align-items:center;justify-content:center;text-align:center}
  @media (min-width:1100px){html.pv-open body{margin-right:380px!important}}
  .pv-tab{position:fixed;right:max(0px,env(safe-area-inset-right,0px));top:42%;z-index:2147483601;writing-mode:vertical-rl;transform:rotate(180deg);background:var(--pv-acc);color:#fff;border:0;border-radius:0 10px 10px 0;padding:14px 9px;font:700 13px "Segoe UI",system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2)}
  .pv-tab b{display:inline-block;background:#fff;color:var(--pv-acc);border-radius:999px;padding:2px 5px;margin-top:6px;transform:rotate(90deg)}
  .pv-panel{position:fixed;top:0;right:0;bottom:0;width:min(380px,100vw);z-index:2147483602;background:var(--pv-bg);border-left:1px solid var(--pv-line);box-shadow:-8px 0 28px rgba(0,0,0,.14);display:flex;flex-direction:column}
  .pv-panel[hidden],.pv-tab[hidden]{display:none}
  .pv-hd{padding:14px 16px 10px;border-bottom:1px solid var(--pv-line);display:flex;gap:10px;align-items:flex-start}
  .pv-hd .t{flex:1;min-width:0}.pv-hd small{font:700 11px/1 "Segoe UI",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--pv-acc)}
  .pv-hd h2{margin:4px 0 0;font:700 16px/1.25 "Segoe UI",sans-serif;overflow-wrap:anywhere}
  .pv-x{all:unset;cursor:pointer;font:700 20px/1 sans-serif;color:var(--pv-mut);padding:2px 6px}
  .pv-bd{flex:1;overflow:auto;padding:14px 16px;display:grid;gap:12px;align-content:start}
  .pv-ft{border-top:1px solid var(--pv-line);padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));display:grid;gap:8px}
  .pv label{font:600 12.5px "Segoe UI",sans-serif;color:var(--pv-mut);display:block;margin-bottom:4px}
  .pv textarea,.pv input[type=text],.pv input[type=email],.pv select{width:100%;font:15px/1.45 "Segoe UI",sans-serif;color:var(--pv-ink);background:var(--pv-soft);border:1.5px solid var(--pv-line);border-radius:9px;padding:9px 11px}
  .pv textarea{min-height:110px;resize:vertical}
  .pv-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .pv-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;font:700 14px "Segoe UI",sans-serif;padding:9px 13px;border-radius:9px;border:1.5px solid var(--pv-line);background:var(--pv-bg);color:var(--pv-ink)}
  .pv-btn.main{background:var(--pv-acc);border-color:var(--pv-acc);color:#fff}
  .pv-btn.mic.on{background:var(--pv-red);border-color:var(--pv-red);color:#fff}
  .pv-btn:focus-visible,.pv-chip:focus-visible{outline:2px solid var(--pv-acc);outline-offset:2px}
  .pv-btn svg{width:17px;height:17px}
  .pv-chips{display:flex;gap:6px;flex-wrap:wrap}
  .pv-chip{all:unset;cursor:pointer;font:600 12.5px "Segoe UI",sans-serif;padding:4px 10px;border-radius:999px;border:1.5px solid var(--pv-line);color:var(--pv-mut)}
  .pv-chip[aria-pressed=true]{background:var(--pv-acc-s);border-color:var(--pv-acc);color:var(--pv-acc)}
  .pv-anchor{font-size:13px;color:var(--pv-mut);background:var(--pv-soft);border-radius:8px;padding:7px 9px;border-left:3px solid var(--pv-acc)}
  .pv-msg{font-size:13px;color:var(--pv-mut);min-height:1.2em}
  .pv-cm{border:1px solid var(--pv-line);border-radius:10px;padding:9px 11px;background:var(--pv-soft);font-size:14px}
  .pv-cm .m{display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--pv-mut);margin-bottom:4px}
  .pv-cm .m b{color:var(--pv-acc)}.pv-cm .m .must{color:var(--pv-red);font-weight:700}
  .pv-cm p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
  .pv-cm .a{display:flex;gap:12px;margin-top:6px}.pv-cm .a button{all:unset;cursor:pointer;font:700 12px "Segoe UI",sans-serif;color:var(--pv-acc)}
  .pv-cm .a .del{color:var(--pv-red)}
  .pv-prog{height:6px;border-radius:99px;background:var(--pv-soft);overflow:hidden}.pv-prog i{display:block;height:100%;background:var(--pv-ok)}
  .pv-status{display:flex;gap:6px;flex-wrap:wrap}
  .pv-pick-hl{outline:3px solid #1f4f8f!important;outline-offset:2px!important;cursor:crosshair!important}
  .pv-flash{animation:pvf 1.6s ease}@keyframes pvf{0%,60%{outline:3px solid #e0a100;outline-offset:3px}100%{outline:3px solid transparent}}
  .pv-pickbar{position:fixed;left:50%;transform:translateX(-50%);bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:2147483603;background:#17202a;color:#fff;font:600 14px "Segoe UI",sans-serif;padding:10px 14px;border-radius:999px;display:flex;gap:12px;align-items:center;box-shadow:0 6px 20px rgba(0,0,0,.3)}
  .pv-pickbar button{all:unset;cursor:pointer;text-decoration:underline}
  .pv-toast{position:fixed;left:50%;transform:translateX(-50%);top:16px;z-index:2147483604;background:#17202a;color:#fff;font:600 14px "Segoe UI",sans-serif;padding:10px 16px;border-radius:10px;max-width:min(520px,92vw);box-shadow:0 6px 20px rgba(0,0,0,.3)}
  .pv-modal{position:fixed;inset:0;z-index:2147483605;background:rgba(10,15,25,.5);display:grid;place-items:center;padding:16px}
  .pv-modal .box{background:var(--pv-bg);border-radius:14px;width:min(640px,100%);max-height:88vh;overflow:auto;padding:20px}
  .pv-modal h3{margin:0 0 6px;font:700 19px "Segoe UI",sans-serif}
  .pv-list{list-style:none;margin:12px 0;padding:0;display:grid;gap:6px}
  .pv-list li{display:flex;justify-content:space-between;gap:10px;align-items:center;border:1px solid var(--pv-line);border-radius:9px;padding:8px 11px;font-size:14px}
  .pv-list a{color:inherit;font-weight:600;text-decoration:none}.pv-list a:hover{text-decoration:underline}
  .pv-pill{font:700 11.5px "Segoe UI",sans-serif;padding:3px 8px;border-radius:999px;white-space:nowrap;background:var(--pv-soft);color:var(--pv-mut)}
  .pv-pill.c{background:var(--pv-acc-s);color:var(--pv-acc)}.pv-pill.ok{background:rgba(27,106,79,.12);color:var(--pv-ok)}
  @media (max-width:640px){.pv-panel{top:auto;height:72vh;width:100vw;border-left:0;border-top:1px solid var(--pv-line);border-radius:16px 16px 0 0}.pv-tab{top:auto;bottom:90px}}
  @media (prefers-reduced-motion:reduce){.pv-flash{animation:none}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  document.documentElement.classList.add('pv-on');
  const noindex=document.createElement('meta'); noindex.name='robots'; noindex.content='noindex,nofollow'; document.head.appendChild(noindex);

  const ICON={mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>'};

  /* ---------- UI shell ---------- */
  const root=document.createElement('div'); root.className='pv';
  const strip=document.createElement('div'); strip.className='pv pv-strip'; strip.setAttribute('role','note'); strip.textContent=`Pilot ${P.round} · review copy of ${P.course}. Not the live course: forms, Moodle and the student portal are turned off.`; document.body.prepend(strip);
  root.innerHTML=`<button class="pv-tab" type="button" aria-controls="pv-panel">Review this page <b id="pv-n">0</b></button>
  <aside class="pv-panel" id="pv-panel" aria-label="Review this page" hidden>
    <div class="pv-hd"><div class="t"><small>Pilot ${P.round} review · page ${Math.max(1,PAGES.findIndex(p=>p.file===page)+1)} of ${PAGES.length||1}</small><h2>${esc(pinfo.title)}</h2></div><button class="pv-x" type="button" aria-label="Close the review box">×</button></div>
    <div class="pv-bd" id="pv-bd"></div>
    <div class="pv-ft"><div class="pv-row" style="justify-content:space-between"><span class="pv-msg" id="pv-prog-t"></span><button class="pv-btn" type="button" id="pv-all">All pages</button></div><div class="pv-prog"><i id="pv-prog"></i></div>
      <button class="pv-btn main" type="button" id="pv-send">Send my review</button></div>
  </aside>`;
  document.body.appendChild(root);
  const $=s=>root.querySelector(s), panel=$('#pv-panel'), bd=$('#pv-bd');
  const toast=t=>{ const d=document.createElement('div'); d.className='pv-toast pv'; d.textContent=t; document.body.appendChild(d); setTimeout(()=>d.remove(),3600); };
  const open=v=>{ panel.hidden=!v; $('.pv-tab').hidden=!!v; document.documentElement.classList.toggle('pv-open',!!v); ls.set('pilot-panel-open',v); if(v) render(); };
  $('.pv-tab').onclick=()=>open(panel.hidden); $('.pv-x').onclick=()=>open(false);

  /* ---------- render panel ---------- */
  let draft={type:'',must:false,anchor:null}, rec=null, recOn=false;
  function render(){
    if(!who){ bd.innerHTML=`<p style="margin:0;font-size:15px">Before you start: your name appears on your review so the team knows who asked for each change.</p>
      <div><label for="pv-nm">Your name</label><input type="text" id="pv-nm" autocomplete="name"></div>
      <div><label for="pv-em">Your email (optional)</label><input type="email" id="pv-em" autocomplete="email"></div>
      <button class="pv-btn main" type="button" id="pv-go">Start reviewing</button>`;
      $('#pv-go').onclick=()=>{ const n=$('#pv-nm').value.trim(); if(!n){ $('#pv-nm').focus(); return; } who={name:n,email:$('#pv-em').value.trim()}; ls.set(ME,who); render(); };
      setTimeout(()=>$('#pv-nm')&&$('#pv-nm').focus(),50); progress(); return; }
    const g=pg();
    bd.innerHTML=`<div><label>This page</label><div class="pv-status" role="group" aria-label="Page status">
        <button class="pv-chip" type="button" data-s="ok" aria-pressed="${g.status==='ok'}">Looks good</button>
        <button class="pv-chip" type="button" data-s="changes" aria-pressed="${g.status==='changes'}">Needs changes</button></div></div>
      <div><label for="pv-tx">What should change on this page?</label><textarea id="pv-tx" placeholder="Speak or type. For example: the Week 4 example should use our own class data, and the formula box is too small."></textarea></div>
      <div class="pv-row"><button class="pv-btn mic" type="button" id="pv-mic">${ICON.mic}<span>Speak</span></button>
        <select id="pv-lang" aria-label="Speaking language" style="width:auto"><option value="en-US">English</option><option value="ar-AE">العربية</option><option value="fr-FR">Français</option></select>
        <button class="pv-btn" type="button" id="pv-pin">${ICON.pin}<span>Point to a part</span></button></div>
      <div id="pv-anc"></div>
      <div><label>Type of change</label><div class="pv-chips" id="pv-types">${TYPES.map(t=>`<button class="pv-chip" type="button" data-t="${t}" aria-pressed="${draft.type===t}">${t}</button>`).join('')}</div></div>
      <div class="pv-row"><label style="display:flex;gap:6px;align-items:center;margin:0;color:var(--pv-ink);font-size:14px"><input type="checkbox" id="pv-must" ${draft.must?'checked':''}> Must fix before the next pilot</label></div>
      <div class="pv-row"><button class="pv-btn main" type="button" id="pv-add">Save comment</button><span class="pv-msg" id="pv-msg" aria-live="polite"></span></div>
      <div><label>Saved on this page (${g.comments.length})</label><div id="pv-list" style="display:grid;gap:8px"></div></div>`;
    const tx=$('#pv-tx'); tx.value=draft.text||''; tx.oninput=()=>draft.text=tx.value;
    bd.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ g.status=g.status===b.dataset.s?'':b.dataset.s; save(); render(); });
    bd.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ draft.type=draft.type===b.dataset.t?'':b.dataset.t; bd.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.t===draft.type)); });
    $('#pv-must').onchange=e=>draft.must=e.target.checked;
    $('#pv-lang').value=ls.get('pilot-lang','en-US'); $('#pv-lang').onchange=e=>ls.set('pilot-lang',e.target.value);
    $('#pv-mic').onclick=toggleMic; $('#pv-pin').onclick=pickStart; $('#pv-add').onclick=addComment;
    showAnchor(); list(); progress();
  }
  function showAnchor(){ const a=$('#pv-anc'); if(!a) return; a.innerHTML=draft.anchor?`<div class="pv-anchor"><b>About:</b> ${esc(draft.anchor.section?draft.anchor.section+' · ':'')}“${esc(draft.anchor.text)}” <button class="pv-chip" type="button" id="pv-unpin" style="margin-left:6px">Remove</button></div>`:''; const u=$('#pv-unpin'); if(u) u.onclick=()=>{ draft.anchor=null; showAnchor(); }; }
  function list(){ const g=pg(), L=$('#pv-list'); if(!L) return;
    L.innerHTML=g.comments.length?'':'<p class="pv-msg" style="margin:0">No comments on this page yet.</p>';
    g.comments.forEach((c,i)=>{ const d=document.createElement('div'); d.className='pv-cm';
      d.innerHTML=`<div class="m">${c.type?`<b>${esc(c.type)}</b>`:''}${c.must?'<span class="must">Must fix</span>':''}${c.anchor?`<span>· ${esc(c.anchor.section||'')} “${esc(c.anchor.text.slice(0,50))}”</span>`:''}</div><p></p><div class="a">${c.anchor?'<button type="button" class="go">Show on page</button>':''}<button type="button" class="ed">Edit</button><button type="button" class="del">Delete</button></div>`;
      d.querySelector('p').textContent=c.text;
      const go=d.querySelector('.go'); if(go) go.onclick=()=>flash(c.anchor);
      d.querySelector('.ed').onclick=()=>{ draft={text:c.text,type:c.type,must:c.must,anchor:c.anchor}; g.comments.splice(i,1); save(); render(); $('#pv-tx').focus(); };
      d.querySelector('.del').onclick=()=>{ g.comments.splice(i,1); save(); list(); progress(); };
      L.appendChild(d); }); }
  function addComment(){ const t=($('#pv-tx').value||'').trim(); if(!t){ $('#pv-msg').textContent='Write or speak a comment first.'; return; }
    if(recOn) toggleMic(); const g=pg();
    g.comments.push({text:t,type:draft.type,must:draft.must,anchor:draft.anchor,at:new Date().toISOString()}); if(!g.status) g.status='changes';
    save(); draft={type:'',must:false,anchor:null}; render(); $('#pv-msg').textContent='Saved.'; }
  function progress(){ const done=PAGES.filter(p=>{const x=S.pages[p.file];return x&&(x.status||x.comments.length)}).length, n=PAGES.length||1;
    const t=$('#pv-prog-t'); if(t) t.textContent=`${done} of ${n} pages reviewed`; const b=$('#pv-prog'); if(b) b.style.width=(done/n*100)+'%';
    $('#pv-n').textContent=pg().comments.length; }

  /* ---------- voice ---------- */
  function toggleMic(){ const SR=window.SpeechRecognition||window.webkitSpeechRecognition, btn=$('#pv-mic');
    if(!SR){ $('#pv-msg').textContent='Voice typing works in Chrome, Edge and Safari. You can also use the microphone key on your keyboard.'; return; }
    if(recOn){ try{rec.stop()}catch(e){} return; }
    rec=new SR(); rec.lang=$('#pv-lang').value; rec.continuous=true; rec.interimResults=true;
    const tx=$('#pv-tx'), base=tx.value?tx.value.replace(/\s*$/,' '):''; let fin='';
    rec.onresult=e=>{ let inter=''; for(let i=e.resultIndex;i<e.results.length;i++){ const r=e.results[i]; if(r.isFinal) fin+=r[0].transcript+' '; else inter+=r[0].transcript; } tx.value=base+fin+inter; draft.text=tx.value; };
    rec.onstart=()=>{ recOn=true; btn.classList.add('on'); btn.querySelector('span').textContent='Stop'; $('#pv-msg').textContent='Listening…'; };
    rec.onend=()=>{ recOn=false; btn.classList.remove('on'); btn.querySelector('span').textContent='Speak'; $('#pv-msg').textContent=''; };
    rec.onerror=e=>{ $('#pv-msg').textContent=e.error==='not-allowed'?'Allow the microphone for this site to speak your comments.':'Voice typing stopped. Press Speak again.'; };
    try{ rec.start(); }catch(e){} }

  /* ---------- point to a part of the page ---------- */
  let picking=false, hl=null, bar=null;
  const pickable=el=>{ while(el&&el!==document.body){ if(el.closest('.pv')) return null; if(/^(SECTION|ARTICLE|FIGURE|TABLE|P|LI|H1|H2|H3|H4|IMG|CANVAS|SVG|PRE|BLOCKQUOTE)$/i.test(el.tagName)||el.classList.contains('card')) return el; el=el.parentElement; } return null; };
  const pathOf=el=>{ const p=[]; while(el&&el!==document.body){ const par=el.parentElement; p.unshift([...par.children].indexOf(el)); el=par; } return p; };
  const byPath=p=>{ let el=document.body; for(const i of p){ el=el&&el.children[i]; } return el; };
  const sectionOf=el=>{ let e=el; while(e&&e!==document.body){ let s=e; while(s){ if(/^H[1-3]$/.test(s.tagName)) return (s.innerText||s.textContent).replace(/\s+/g,' ').trim().slice(0,70); s=s.previousElementSibling; } e=e.parentElement; } return ''; };
  function pickStart(){ picking=true; panel.hidden=true; bar=document.createElement('div'); bar.className='pv-pickbar pv'; bar.innerHTML='Click the part of the page your comment is about <button type="button">Cancel</button>'; document.body.appendChild(bar); bar.querySelector('button').onclick=pickEnd; }
  function pickEnd(){ picking=false; if(hl) hl.classList.remove('pv-pick-hl'); hl=null; if(bar) bar.remove(); bar=null; panel.hidden=false; render(); }
  document.addEventListener('mouseover',e=>{ if(!picking) return; const el=pickable(e.target); if(hl&&hl!==el) hl.classList.remove('pv-pick-hl'); hl=el; if(el) el.classList.add('pv-pick-hl'); },true);
  document.addEventListener('click',e=>{ if(!picking||e.target.closest('.pv')) return; const el=pickable(e.target); if(!el) return; e.preventDefault(); e.stopPropagation();
    const txt=(el.innerText||el.getAttribute('alt')||el.getAttribute('aria-label')||el.tagName).replace(/\s+/g,' ').trim().slice(0,140);
    draft.anchor={text:txt||el.tagName.toLowerCase(),section:sectionOf(el),path:pathOf(el)}; pickEnd(); },true);
  function flash(a){ const el=a&&a.path&&byPath(a.path); if(!el) return toast('That part of the page has moved or changed.'); el.scrollIntoView({behavior:'smooth',block:'center'}); el.classList.remove('pv-flash'); void el.offsetWidth; el.classList.add('pv-flash'); }

  /* ---------- links that would reach real services ---------- */
  const OFF=[[/forms\.(cloud\.)?microsoft|forms\.office/i,'the real Microsoft Form'],[/my\.cud\.ac\.ae|moodle/i,'the real Moodle course'],[/cudportal/i,'the real student portal'],[/^mailto:/i,'an email to the professor']];
  document.addEventListener('click',e=>{ if(picking) return; const a=e.target.closest&&e.target.closest('a[href]'); if(!a||a.closest('.pv')) return; const h=a.getAttribute('href');
    const hit=OFF.find(([re])=>re.test(h)); if(hit){ e.preventDefault(); e.stopPropagation(); toast(`Pilot copy: this link opens ${hit[1]}, so it is turned off here.`); return; }
    const f=h.split(/[?#]/)[0]; if(f&&!/^(https?:|\/\/)/.test(f)&&/\.html$/.test(f)&&PAGES.length&&!PAGES.some(p=>p.file===f.split('/').pop())){ e.preventDefault(); e.stopPropagation(); toast('This page is not part of the pilot copy.'); } },true);
  document.addEventListener('submit',e=>{ if(e.target.closest('.pv')) return; const act=e.target.getAttribute('action')||''; if(OFF.some(([re])=>re.test(act))){ e.preventDefault(); toast('Pilot copy: sending is turned off here.'); } },true);

  /* ---------- all pages overview ---------- */
  function overview(){ const m=document.createElement('div'); m.className='pv-modal pv';
    m.innerHTML=`<div class="box" role="dialog" aria-modal="true" aria-label="All pages"><h3>All pages · Pilot ${P.round}</h3><p class="pv-msg" style="margin:0">Open each page and leave comments, or mark it “Looks good”.</p>
      <ul class="pv-list">${PAGES.map(p=>{ const x=S.pages[p.file]||{comments:[]}; const n=x.comments.length;
        const pill=n?`<span class="pv-pill c">${n} comment${n>1?'s':''}</span>`:x.status==='ok'?'<span class="pv-pill ok">Looks good</span>':'<span class="pv-pill">Not reviewed</span>';
        return `<li><a href="${esc(p.file)}">${esc(p.title)}</a>${pill}</li>`; }).join('')}</ul>
      <div class="pv-row"><button class="pv-btn" type="button" data-close>Close</button></div></div>`;
    document.body.appendChild(m); m.onclick=e=>{ if(e.target===m||e.target.dataset.close!==undefined) m.remove(); }; }
  $('#pv-all').onclick=overview;

  /* ---------- send: one HTML file ---------- */
  $('#pv-send').onclick=()=>{ if(!who){ open(true); return; }
    const total=PAGES.reduce((a,p)=>a+((S.pages[p.file]||{comments:[]}).comments.length),0);
    const reviewed=PAGES.filter(p=>{const x=S.pages[p.file];return x&&(x.status||x.comments.length)}).length;
    const m=document.createElement('div'); m.className='pv-modal pv';
    m.innerHTML=`<div class="box" role="dialog" aria-modal="true" aria-label="Send my review"><h3>Send my review</h3>
      <p style="margin:0 0 8px;font-size:15px">${total} comment${total===1?'':'s'} on ${reviewed} of ${PAGES.length} pages.${reviewed<PAGES.length?' Pages you have not opened are listed as “Not reviewed”.':''}</p>
      <ol style="margin:0 0 12px;padding-left:20px;font-size:15px;line-height:1.6"><li>Save the review file.</li><li>Email it to <b>${esc(P.sendTo||'')}</b>.</li></ol>
      <div class="pv-row"><button class="pv-btn main" type="button" id="pv-dl">Save the review file</button><button class="pv-btn" type="button" id="pv-cp">Copy the email address</button><button class="pv-btn" type="button" data-close>Close</button></div>
      <p class="pv-msg" id="pv-sm" aria-live="polite"></p></div>`;
    document.body.appendChild(m); m.onclick=e=>{ if(e.target===m||e.target.dataset.close!==undefined) m.remove(); };
    m.querySelector('#pv-dl').onclick=()=>{ const f=reportFile(); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([f.html],{type:'text/html'})); a.download=f.name; document.body.appendChild(a); a.click(); a.remove(); m.querySelector('#pv-sm').textContent=`Saved as ${f.name}. Now email it to ${P.sendTo}.`; };
    m.querySelector('#pv-cp').onclick=()=>{ navigator.clipboard.writeText(P.sendTo||'').then(()=>m.querySelector('#pv-sm').textContent='Email address copied.').catch(()=>m.querySelector('#pv-sm').textContent=P.sendTo); };
  };
  function reportFile(){
    const when=new Date(), d=when.toISOString().slice(0,10);
    const data={kind:'course-builder-review',course:P.course,code:P.code,round:P.round,reviewer:who,saved:when.toISOString(),pages:PAGES.map(p=>({file:p.file,title:p.title,...(S.pages[p.file]||{comments:[],status:''})}))};
    const must=data.pages.reduce((a,p)=>a+p.comments.filter(c=>c.must).length,0), total=data.pages.reduce((a,p)=>a+p.comments.length,0);
    const sec=data.pages.map((p,i)=>{ const st=p.comments.length?`${p.comments.length} comment${p.comments.length>1?'s':''}`:p.status==='ok'?'Looks good':'Not reviewed';
      return `<section><h2><span>${i+1}</span>${esc(p.title)}</h2><p class="st ${p.comments.length?'c':p.status==='ok'?'ok':''}">${st} · <code>${esc(p.file)}</code></p>${p.comments.map(c=>`<div class="cm"><div class="m">${c.type?`<b>${esc(c.type)}</b>`:''}${c.must?'<em>Must fix</em>':''}${c.anchor?`<span>About: ${esc(c.anchor.section?c.anchor.section+' · ':'')}“${esc(c.anchor.text)}”</span>`:''}</div><p>${esc(c.text)}</p></div>`).join('')}</section>`; }).join('');
    const name=`${P.code.toUpperCase()}_Pilot${P.round}_Review_${(who.name||'Reviewer').replace(/[^A-Za-z0-9]+/g,'-')}_${d}.html`;
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(P.course)} · Pilot ${P.round} review · ${esc(who.name)}</title>
<style>:root{--bg:#f4f5f7;--card:#fff;--ink:#17202a;--mut:#5b6672;--line:#d8dde3;--acc:#1f4f8f;--red:#b3261e;--ok:#1b6a4f}
@media (prefers-color-scheme:dark){:root{--bg:#121519;--card:#1b1f25;--ink:#e8ebef;--mut:#a3adb8;--line:#323944;--acc:#8fb5ef;--red:#f08a7e;--ok:#5fcaa0}}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 "Segoe UI",system-ui,sans-serif}main{max-width:860px;margin:0 auto;padding:28px max(16px,env(safe-area-inset-left,0px)) 48px}
header small{font:700 12px/1 sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--acc)}h1{font-size:28px;margin:6px 0 4px}.sum{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 22px}.sum div{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px}.sum b{display:block;font-size:22px}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-top:12px}h2{font-size:17px;margin:0;display:flex;gap:10px;align-items:baseline}h2 span{font:700 12px monospace;color:var(--mut)}
.st{margin:4px 0 0;font-size:13px;color:var(--mut)}.st.c{color:var(--acc)}.st.ok{color:var(--ok)}.cm{border-left:3px solid var(--acc);background:var(--bg);border-radius:8px;padding:9px 12px;margin-top:10px}.cm .m{display:flex;gap:8px;flex-wrap:wrap;font-size:12.5px;color:var(--mut)}.cm .m b{color:var(--acc)}.cm em{color:var(--red);font-style:normal;font-weight:700}.cm p{margin:4px 0 0;white-space:pre-wrap}</style></head>
<body><main><header><small>Course Builder · Pilot ${P.round} review</small><h1>${esc(P.course)}</h1><p style="margin:0;color:var(--mut)">Reviewed by <b style="color:var(--ink)">${esc(who.name)}</b>${who.email?` · ${esc(who.email)}`:''} · ${when.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p></header>
<div class="sum"><div><b>${total}</b>comments</div><div><b>${must}</b>must fix</div><div><b>${data.pages.filter(p=>p.comments.length||p.status).length}/${data.pages.length}</b>pages reviewed</div></div>
${sec}</main><script type="application/json" id="review-data">${JSON.stringify(data).replace(/</g,'\\u003c')}</script></body></html>`;
    return {name,html}; }

  render(); progress(); if(ls.get('pilot-panel-open',innerWidth>=1100)) open(true);
})();
