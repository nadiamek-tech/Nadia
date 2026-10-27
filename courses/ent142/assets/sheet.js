/* Lab worksheet engine.  Sheet.mount(spec): one worksheet, saved in this browser, printable, shareable as a file.
   spec = {id, title, week, lab, lead, layout:'card'|'report', blocks:[...], ex:{...}}
   block types: text · area · list · table · score · wall · pick · count · image · timer */
(function(){
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}};
const words=s=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
function blankOf(b){
  switch(b.type){
    case 'list': return Array(b.n||3).fill('');
    case 'table': return (b.rows?b.rows:Array(b.n||3).fill('')).map(()=>Array(b.cols.length).fill(''));
    case 'score': return Array(b.n||4).fill(0).map(()=>({name:'',s:b.crit.map(()=>0)}));
    case 'wall': return b.cols.map(()=>[]);
    default: return '';
  }
}
function has(b,v){
  if(v==null) return false;
  switch(b.type){
    case 'list': return v.some(x=>String(x).trim());
    case 'table': return v.some(r=>r.some(x=>String(x).trim()));
    case 'score': return v.some(r=>String(r.name).trim()&&r.s.some(Boolean));
    case 'wall': return v.some(c=>c.length);
    case 'timer': return true;
    default: return String(v).trim()!=='';
  }
}
function mount(spec){
  const KEY='sheet-'+spec.id, root=document.getElementById('sheet'), pr=document.getElementById('sprint'), wrap=document.getElementById('sw');
  const blank=()=>{ const o={}; spec.blocks.forEach(b=>o[b.key]=blankOf(b)); return o; };
  let S; try{ S=JSON.parse(store.get(KEY)||'null'); }catch(e){ S=null; }
  S=Object.assign(blank(),S||{});
  let mode='edit';
  const save=()=>store.set(KEY,JSON.stringify(S));
  const prog=()=>{ const need=spec.blocks.filter(b=>b.type!=='timer'), n=need.filter(b=>has(b,S[b.key])).length;
    document.getElementById('sprog').textContent=mode==='edit'?n+' of '+need.length+' parts filled':'';
    root.querySelectorAll('.sz').forEach(z=>{ const b=spec.blocks.find(x=>x.key===z.dataset.k); const t=z.querySelector('.tick'); if(b&&t) t.classList.toggle('on',has(b,(mode==='edit'?S:spec.ex)[b.key])); }); };
  function field(v,ph,area,ed,attrs){ if(!ed) return '<div class="sv'+(String(v).trim()?'':' empty')+'">'+(String(v).trim()?esc(v):'&nbsp;')+'</div>';
    return area?'<textarea class="sf" rows="'+(area===true?3:area)+'" placeholder="'+esc(ph||'')+'" '+attrs+'>'+esc(v)+'</textarea>':'<input class="sf" placeholder="'+esc(ph||'')+'" value="'+esc(v)+'" '+attrs+'>'; }
  function body(b,v,ed){
    const k=b.key;
    switch(b.type){
      case 'text': return field(v,b.ph,false,ed,'data-k="'+k+'"');
      case 'area': return field(v,b.ph,b.rows||3,ed,'data-k="'+k+'"')+(b.words?'<div class="wc" data-wc="'+k+'"></div>':'');
      case 'count': return field(v,b.ph,b.rows||8,ed,'data-k="'+k+'"')+'<div class="cnt"><span data-cn="'+k+'"></span><div class="bar"><i data-cb="'+k+'"></i></div><span>goal '+b.goal+'</span></div>';
      case 'list': return v.map((x,i)=>'<div style="display:flex;gap:6px;align-items:start;margin-bottom:5px"><span style="font:700 12px var(--f-mono);color:var(--pa);padding-top:8px">'+(i+1)+'</span>'+field(x,(b.ph||'')+(b.phs?' '+(i+1):''),b.area?2:false,ed,'data-k="'+k+'" data-i="'+i+'"')+'</div>').join('')+(ed&&b.add!==false?'<button type="button" class="add" data-add="'+k+'">+ add</button>':'');
      case 'table': return '<table class="stbl"><thead><tr>'+(b.rows?'<th></th>':'')+b.cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+v.map((r,i)=>'<tr>'+(b.rows?'<td class="rl">'+esc(b.rows[i])+'</td>':'')+r.map((c,j)=>'<td data-l="'+esc(b.cols[j])+'">'+field(c,b.ph&&b.ph[j]||'',b.area?2:false,ed,'data-k="'+k+'" data-i="'+i+'" data-j="'+j+'"')+'</td>').join('')+'</tr>').join('')+'</tbody></table>'+(ed&&!b.rows?'<button type="button" class="add" data-add="'+k+'">+ row</button>':'');
      case 'score': return '<table class="stbl"><thead><tr><th>'+esc(b.item||'Item')+'</th>'+b.crit.map(c=>'<th>'+esc(c)+'</th>').join('')+'<th>Total</th></tr></thead><tbody>'+v.map((r,i)=>'<tr><td data-l="'+esc(b.item||'Item')+'">'+field(r.name,b.ph||'',false,ed,'data-k="'+k+'" data-i="'+i+'" data-n="1"')+'</td>'+r.s.map((x,j)=>'<td data-l="'+esc(b.crit[j])+'">'+(ed?'<select class="sf" data-k="'+k+'" data-i="'+i+'" data-j="'+j+'"><option value="0">–</option>'+[1,2,3,4,5].map(n=>'<option'+(n===x?' selected':'')+'>'+n+'</option>').join('')+'</select>':'<div class="sv">'+(x||'–')+'</div>')+'</td>').join('')+'<td class="tot" data-l="Total" data-tot="'+k+'-'+i+'">'+r.s.reduce((a,c)=>a+c,0)+'</td></tr>').join('')+'</tbody></table><p class="sq" style="margin-top:6px">Score 1 (low) to 5 (high).'+(b.note?' '+esc(b.note):'')+'</p>'+(ed?'<button type="button" class="add" data-add="'+k+'">+ row</button>':'');
      case 'wall': return '<div class="wall">'+b.cols.map((c,j)=>'<div class="wcol"><b>'+esc(c)+'</b>'+v[j].map((n,i)=>'<div class="snote">'+esc(n)+(ed?'<button type="button" class="x" data-k="'+k+'" data-j="'+j+'" data-del="'+i+'" aria-label="Remove">×</button>':'')+'</div>').join('')+(ed?'<div class="nadd"><input class="sf" placeholder="One note" data-new="'+k+'" data-j="'+j+'"><button type="button" class="ubtn" data-k="'+k+'" data-j="'+j+'" data-put="1">+</button></div>':'')+'</div>').join('')+'</div>';
      case 'pick': return '<div class="picks">'+b.opts.map(o=>'<label class="'+(v===o?'on':'')+'">'+(ed?'<input type="radio" name="'+k+'" value="'+esc(o)+'" data-k="'+k+'"'+(v===o?' checked':'')+'>':'')+esc(o)+'</label>').join('')+'</div>';
      case 'image': return '<div class="simg">'+(v?'<img src="'+v+'" alt="'+esc(b.title)+'">':'<div class="sv empty" style="padding:20px">'+(ed?'Add a photo of your work.':'No photo')+'</div>')+'</div>'+(ed?'<div style="display:flex;gap:8px"><label class="ubtn">Add photo<input type="file" accept="image/*" hidden data-img="'+k+'"></label>'+(v?'<button type="button" class="ubtn ghost" data-rmimg="'+k+'">Remove</button>':'')+'</div>':'');
      case 'timer': return '<div class="timer"><span class="t" data-t="'+k+'">'+b.secs+'s</span><button type="button" class="ubtn" data-go="'+k+'">Start</button><button type="button" class="ubtn ghost" data-stop="'+k+'">Reset</button></div>';
    }
    return '';
  }
  function render(el,ed,D){
    let n=0;
    el.innerHTML='<div class="spaper '+(spec.layout==='report'?'report':'')+'"><div class="shd"><b>'+esc(spec.title)+'</b><span>'+esc(spec.course)+' · Week '+spec.week+' · '+esc(spec.lab)+'</span></div>'+spec.blocks.map(b=>{ n++;
      const q=b.q?(Array.isArray(b.q)?'<ul class="sq">'+b.q.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p class="sq">'+esc(b.q)+'</p>'):'';
      return '<section class="sz '+(b.span||spec.layout==='report'?'span':'')+(b.keyz?' key':'')+'" data-k="'+b.key+'"><span class="no">'+n+'</span>'+(b.type!=='timer'?'<span class="tick">✓</span>':'')+'<h4>'+esc(b.title)+'</h4>'+q+body(b,D[b.key],ed)+'</section>'; }).join('')+'</div>';
    if(ed) wire(el);
    counts(el,D);
    if(el===root&&window.Easy&&Easy.on()) easy(el);
  }
  /* Easy version: one part at a time, read aloud, sentence starter */
  let cur=0;
  function easy(el){
    const zs=[...el.querySelectorAll('.sz')]; if(!zs.length) return;
    el.querySelector('.spaper').classList.add('ezmode');
    zs.forEach((z,i)=>{ const h=z.querySelector('h4'), q=z.querySelector('.sq'); const b=document.createElement('button'); b.type='button'; b.className='say'; b.textContent='Listen';
      b.onclick=()=>Easy.say(h.textContent+'. '+(q?q.textContent:'')); h.appendChild(b); });
    if(spec.starter){ const s=document.createElement('p'); s.className='ezstart'; s.innerHTML='Sentence starter: <span>'+esc(spec.starter)+'</span>'; el.querySelector('.shd').after(s); }
    const nav=document.createElement('div'); nav.className='eznav';
    nav.innerHTML='<button type="button" class="ubtn ghost" data-ez="-1">← Back</button><span></span><button type="button" class="ubtn" data-ez="1">Next part →</button>';
    el.querySelector('.spaper').appendChild(nav);
    const show=()=>{ cur=Math.max(0,Math.min(zs.length-1,cur)); zs.forEach((z,i)=>z.classList.toggle('ezcur',i===cur)); nav.querySelector('span').textContent='Part '+(cur+1)+' of '+zs.length; nav.querySelector('[data-ez="-1"]').disabled=cur===0; nav.querySelector('[data-ez="1"]').textContent=cur===zs.length-1?'Done ✓':'Next part →'; };
    nav.addEventListener('click',e=>{ const b=e.target.closest('[data-ez]'); if(!b) return; cur+=+b.dataset.ez; show(); window.scrollTo({top:el.offsetTop-80,behavior:'smooth'}); });
    show();
  }
  function counts(el,D){
    spec.blocks.forEach(b=>{
      if(b.type==='count'){ const c=String(D[b.key]||'').split('\n').filter(x=>x.trim()).length; const a=el.querySelector('[data-cn="'+b.key+'"]'), bar=el.querySelector('[data-cb="'+b.key+'"]'); if(a){a.textContent=c+' ideas'; bar.style.width=Math.min(100,c/b.goal*100)+'%';} }
      if(b.type==='area'&&b.words){ const w=words(D[b.key]), e=el.querySelector('[data-wc="'+b.key+'"]'); if(e){ e.textContent=w+' / about '+b.words+' words'; e.classList.toggle('ok',w>=b.words*0.8); } }
    });
  }
  function wire(el){
    el.addEventListener('input',e=>{ const t=e.target, k=t.dataset.k; if(!k) return; const b=spec.blocks.find(x=>x.key===k);
      if(b.type==='list') S[k][+t.dataset.i]=t.value;
      else if(b.type==='table') S[k][+t.dataset.i][+t.dataset.j]=t.value;
      else if(b.type==='score'){ const r=S[k][+t.dataset.i]; if(t.dataset.n) r.name=t.value; else { r.s[+t.dataset.j]=+t.value; el.querySelector('[data-tot="'+k+'-'+t.dataset.i+'"]').textContent=r.s.reduce((a,c)=>a+c,0); } }
      else if(b.type==='pick'){ S[k]=t.value; el.querySelectorAll('input[name="'+k+'"]').forEach(x=>x.parentNode.classList.toggle('on',x.checked)); }
      else S[k]=t.value;
      save(); counts(el,S); prog(); });
    el.addEventListener('change',e=>{ const t=e.target;
      if(t.dataset.img){ const f=t.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{ const c=document.createElement('canvas'), s=Math.min(1,900/Math.max(im.width,im.height)); c.width=im.width*s; c.height=im.height*s; c.getContext('2d').drawImage(im,0,0,c.width,c.height); S[t.dataset.img]=c.toDataURL('image/jpeg',.8); save(); draw(); }; im.src=r.result; }; r.readAsDataURL(f); }
      else if(t.tagName==='SELECT'||t.type==='radio') el.dispatchEvent(new Event('input',{bubbles:true}))&&0; });
    el.addEventListener('click',e=>{ const t=e.target.closest('button,label'); if(!t) return;
      if(t.dataset.add){ const b=spec.blocks.find(x=>x.key===t.dataset.add), v=S[b.key];
        if(b.type==='list') v.push(''); else if(b.type==='table') v.push(Array(b.cols.length).fill('')); else if(b.type==='score') v.push({name:'',s:b.crit.map(()=>0)}); save(); draw(); }
      if(t.dataset.put){ const inp=el.querySelector('input[data-new="'+t.dataset.k+'"][data-j="'+t.dataset.j+'"]'); if(inp.value.trim()){ S[t.dataset.k][+t.dataset.j].push(inp.value.trim()); save(); draw(); } }
      if(t.dataset.del!=null){ S[t.dataset.k][+t.dataset.j].splice(+t.dataset.del,1); save(); draw(); }
      if(t.dataset.rmimg){ S[t.dataset.rmimg]=''; save(); draw(); }
      if(t.dataset.go){ const k=t.dataset.go, b=spec.blocks.find(x=>x.key===k), out=el.querySelector('[data-t="'+k+'"]'); clearInterval(window.__swt); let s=b.secs; out.textContent=s+'s'; window.__swt=setInterval(()=>{ s--; out.textContent=s+'s'; if(s<=0){ clearInterval(window.__swt); out.textContent='Time'; } },1000); }
      if(t.dataset.stop){ const k=t.dataset.stop, b=spec.blocks.find(x=>x.key===k); clearInterval(window.__swt); el.querySelector('[data-t="'+k+'"]').textContent=b.secs+'s'; }
    });
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.new){ e.preventDefault(); const b=el.querySelector('button[data-k="'+e.target.dataset.new+'"][data-j="'+e.target.dataset.j+'"][data-put]'); if(b) b.click(); } });
    el.querySelectorAll('select.sf').forEach(s=>s.addEventListener('change',()=>{ const r=S[s.dataset.k][+s.dataset.i]; r.s[+s.dataset.j]=+s.value; el.querySelector('[data-tot="'+s.dataset.k+'-'+s.dataset.i+'"]').textContent=r.s.reduce((a,c)=>a+c,0); save(); prog(); }));
    el.querySelectorAll('input[type=radio]').forEach(r=>r.addEventListener('change',()=>{ S[r.dataset.k]=r.value; el.querySelectorAll('input[name="'+r.dataset.k+'"]').forEach(x=>x.parentNode.classList.toggle('on',x.checked)); save(); prog(); }));
  }
  function draw(){ render(root,mode==='edit',mode==='edit'?S:spec.ex); wrap.classList.toggle('exmode',mode==='ex'); prog(); }
  document.querySelectorAll('.sseg button').forEach(b=>b.addEventListener('click',()=>{ mode=b.dataset.m; document.querySelectorAll('.sseg button').forEach(x=>x.setAttribute('aria-pressed',x===b)); draw(); }));
  document.getElementById('sprintbtn').addEventListener('click',()=>{ render(pr,false,mode==='edit'?S:spec.ex); window.print(); });
  document.getElementById('ssave').addEventListener('click',()=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify({sheet:spec.id,data:S})],{type:'application/json'})); a.download=spec.id+'.json'; document.body.appendChild(a); a.click(); a.remove(); });
  document.getElementById('sopen').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const d=JSON.parse(t); if(!d||d.sheet!==spec.id) throw 0; S=Object.assign(blank(),d.data); save(); mode='edit'; document.querySelectorAll('.sseg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.m==='edit')); draw(); }catch(x){ alert('This file is not this worksheet.'); } }); });
  draw();
}
window.Sheet={mount};
})();
