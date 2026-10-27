/* ENT 141 · Project 1 poster engine.
   Poster.render(el,{mode:'edit'|'view', data})  the whole poster (edit = students type on it)
   Poster.zone(el, n, data)                       one part of the poster, read-only (used as the example image on the guide)
   Poster.thumb(n)                                small map of the poster with part n highlighted
   Poster.EX                                      the worked example (fictional team) */
(function(){
const KEY='ent141-poster-v2';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}};
const FEEL=['Very bad','Bad','OK','Good','Very good'];

const ZONES=[
  {n:1,key:'top',  title:'Title and problem', marks:'Marked in: process'},
  {n:2,key:'ints', title:'Interviews',        marks:'Marked in: interviews · 20'},
  {n:3,key:'emp',  title:'Empathy map',       marks:'Marked in: interviews · 20'},
  {n:4,key:'jm',   title:'Journey map',       marks:'Marked in: journey map · 20'},
  {n:5,key:'hmw',  title:'How might we…',     marks:'Marked in: process'},
  {n:6,key:'sol',  title:'Solutions',         marks:'Marked in: solutions · 20'},
  {n:7,key:'proto',title:'Prototype',         marks:'Marked in: prototype · 20'},
  {n:8,key:'fb',   title:'Feedback and changes', marks:'Marked in: process'}
];

const blank=()=>({title:'',team:'',members:'',sdg:'',problem:'',
  ints:[{who:'',q:''},{who:'',q:''},{who:'',q:''}],learnInt:'',
  emp:{who:'',says:'',thinks:'',does:'',feels:''},
  jm:[{s:'',f:2},{s:'',f:2},{s:'',f:2},{s:'',f:2},{s:'',f:2}],learnJm:'',
  hmw:'',sol:{risky:'',easy:'',fav:'',pick:'',why:''},proto:{img:'',desc:''},fb:{user:'',prof:'',changed:''}});

/* worked example: a fictional team, made up to show the format */
const EX={title:'Breakfast before 9',team:'Team Morning',members:'Student A · Student B · Student C · Student D',
  sdg:'SDG 3 · Target 3.4 · promote mental health and well-being',
  problem:'First-year students with 9 am classes skip breakfast, then feel tired and lose focus in class.',
  ints:[{who:'First-year student, commutes by bus',q:'I leave home at 7. There is no time to eat.'},
        {who:'First-year student, lives nearby',q:'The café queue at 8:50 is too long. I would be late.'},
        {who:'Second-year student',q:'By 11 I cannot focus. I just want the class to end.'}],
  learnInt:'Most skip breakfast because of time, not money. The queue is the real barrier.',
  emp:{who:'Sara, 18, first year',says:'“No time to eat.”',thinks:'“I will eat later, it is fine.”',does:'Buys an energy drink at the gate.',feels:'Rushed, tired, guilty.'},
  jm:[{s:'Wake up',f:2},{s:'Bus',f:1},{s:'Café queue',f:0},{s:'9 am class',f:1},{s:'11 am break',f:3}],
  learnJm:'The lowest point is the café queue: the problem is time at the right place, not the food.',
  hmw:'How might we help first-year students eat breakfast before a 9 am class without being late?',
  sol:{risky:'A breakfast vending machine at the bus stop.',easy:'A grab-and-go shelf in the café, no queue.',fav:'Pre-order breakfast in an app, pick it up at the HUB.',pick:'fav',
       why:'Interviews show the queue is the pain point. Pre-ordering removes the queue without new staff.'},
  proto:{img:'',sketch:true,desc:'Paper screens of the app: choose breakfast, choose a pick-up time, show the code at the HUB.'},
  fb:{user:'“I would use it if pick-up is near my class.”',prof:'Test the price with students first.',changed:'We moved pick-up from the café to the HUB lobby and dropped the vending machine.'}};

function load(){ let s=null; try{s=JSON.parse(store.get(KEY)||'null')}catch(e){}
  if(!s){ s=blank(); migrate(s); }
  const b=blank(); for(const k in b){ if(s[k]==null) s[k]=b[k]; }
  return s; }
function save(s){ return store.set(KEY,JSON.stringify(s)); }

/* bring over what students typed in the old Poster Lab */
function migrate(s){
  let o=null,e=null,j=null; try{o=JSON.parse(store.get('ent141-poster-v1')||'null'); e=JSON.parse(store.get('ent141-lab-emp')||'null'); j=JSON.parse(store.get('ent141-lab-jm')||'null');}catch(x){}
  if(o){ const t=o.team||{}; s.team=t.name||''; s.members=t.members||''; s.sdg=t.sdg||''; s.problem=t.pain||'';
    (o.ints||[]).slice(0,3).forEach((x,i)=>{ s.ints[i]={who:x.who||'',q:x.quotes||''}; }); s.learnInt=o.learnInt||''; s.learnJm=o.learnJm||'';
    s.hmw=(o.hmw||'').split('\n').filter(l=>l.trim()).slice(0,2).join('\n');
    const ideas=o.ideas||[]; ideas.forEach((x,i)=>{ const k=x.tag==='favourite'?'fav':x.tag; if(k&&s.sol[k]==='') s.sol[k]=x.t; if(i===o.chosen&&k) s.sol.pick=k; }); s.sol.why=o.why||'';
    if(o.proto){ s.proto.img=o.proto.img||''; s.proto.desc=o.proto.desc||''; }
    if(o.fb){ s.fb.user=o.fb.user||''; s.fb.prof=o.fb.prof||''; s.fb.changed=o.fb.changed||''; } }
  if(e) Object.assign(s.emp,{who:e.who||'',says:e.says||'',thinks:e.thinks||'',does:e.does||'',feels:e.feels||''});
  if(j&&j.stages) j.stages.slice(0,5).forEach((x,i)=>{ s.jm[i]={s:x.s||'',f:Math.max(0,Math.min(4,(x.f|0)+2))}; });
}

/* is a part filled? */
const has=v=>String(v||'').trim().length>0;
const DONE={
  top:s=>has(s.title)&&has(s.team)&&has(s.sdg)&&has(s.problem),
  ints:s=>s.ints.filter(i=>has(i.q)).length>=3&&has(s.learnInt),
  emp:s=>['who','says','thinks','does','feels'].every(k=>has(s.emp[k])),
  jm:s=>s.jm.filter(x=>has(x.s)).length>=4&&has(s.learnJm),
  hmw:s=>/how might we/i.test(s.hmw),
  sol:s=>has(s.sol.risky)&&has(s.sol.easy)&&has(s.sol.fav)&&has(s.sol.pick)&&has(s.sol.why),
  proto:s=>(has(s.proto.img)||s.proto.sketch)&&has(s.proto.desc),
  fb:s=>has(s.fb.user)&&has(s.fb.prof)&&has(s.fb.changed)
};

/* ---------- small drawings ---------- */
function curve(jm){
  const W=SOLO||innerWidth<720?440:860,H=130,n=jm.length, x=i=>40+i*(W-80)/(n-1), y=f=>H-16-f*(H-36)/4;
  const pts=jm.map((s,i)=>[x(i),y(s.f)]), low=Math.min(...jm.map(s=>s.f));
  return `<svg class="pz-curve" viewBox="0 0 ${W} ${H+26}" role="img" aria-label="Feelings across the journey">
    <text x="4" y="14" class="ax">good</text><text x="4" y="${H-8}" class="ax">bad</text>
    <line x1="34" x2="${W-10}" y1="${y(2)}" y2="${y(2)}" class="mid"/>
    <path d="${pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')}" class="ln"/>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${jm[i].f===low&&low<2?8:5.5}" class="${jm[i].f===low&&low<2?'low':'pt'}"/><text x="${p[0]}" y="${H+20}" text-anchor="middle" class="lb">${esc((jm[i].s||'Stage '+(i+1)).slice(0,16))}</text>`).join('')}
    ${low<2?(()=>{ const i=jm.findIndex(s=>s.f===low); return `<text x="${pts[i][0]}" y="${pts[i][1]-14}" text-anchor="middle" class="pain">pain point</text>`; })():''}</svg>`;
}
/* example prototype: three paper app screens */
const SKETCH=`<svg class="pz-sketch" viewBox="0 0 330 170" role="img" aria-label="Sketch of three app screens">
  ${[[10,'Choose','Croissant','Labneh wrap','Fruit cup'],[120,'Pick-up','8:30','8:40','8:50'],[230,'Your code','','HUB lobby','']].map(([x,h,a,b,c],k)=>`<rect x="${x}" y="6" width="90" height="158" rx="12" class="ph"/><rect x="${x+30}" y="12" width="30" height="4" rx="2" class="sk"/><text x="${x+45}" y="34" text-anchor="middle" class="h">${h}</text>`
  +(k===2?`<rect x="${x+20}" y="50" width="50" height="50" class="sk2"/><path d="M${x+28} 58h10v10h-10zM${x+52} 58h10v10h-10zM${x+28} 82h10v10h-10zM${x+50} 80l10 10M${x+60} 80l-10 10" class="sk"/><text x="${x+45}" y="122" text-anchor="middle" class="t">${b}</text><rect x="${x+16}" y="134" width="58" height="18" rx="9" class="btn"/><text x="${x+45}" y="147" text-anchor="middle" class="bt">Collected</text>`
    :[a,b,c].map((t,i)=>`<rect x="${x+10}" y="${48+i*30}" width="70" height="22" rx="5" class="${i===1&&k===1?'on':'sk2'}"/><text x="${x+45}" y="${63+i*30}" text-anchor="middle" class="t">${t}</text>`).join('')+`<rect x="${x+16}" y="140" width="58" height="16" rx="8" class="btn"/><text x="${x+45}" y="152" text-anchor="middle" class="bt">Next</text>`)).join('')}
</svg>`;

/* ---------- fields ---------- */
let MODE='view', DATA=null, onChange=null, SOLO=false;
function get(path){ return path.split('.').reduce((o,k)=>o==null?o:o[k],DATA); }
function f(path,ph,rows,cls){
  const v=get(path);
  if(MODE!=='edit') return has(v)?`<div class="pv ${cls||''}">${esc(v).replace(/\n/g,'<br>')}</div>`:`<div class="pv empty ${cls||''}">${esc(ph)}</div>`;
  return rows?`<textarea class="pf ${cls||''}" data-p="${path}" rows="${rows}" placeholder="${esc(ph)}" aria-label="${esc(ph)}">${esc(v)}</textarea>`
             :`<input class="pf ${cls||''}" data-p="${path}" type="text" value="${esc(v)}" placeholder="${esc(ph)}" aria-label="${esc(ph)}">`;
}
const head=z=>`<span class="no">${z.n}</span><h4>${esc(z.title)}</h4>${MODE==='edit'?`<span class="tick ${DONE[z.key](DATA)?'on':''}" title="Filled">✓</span>`:''}`;

const ZH={
  top:z=>`<div class="pz pz-top" id="z1">${head(z)}
    <div class="ttl">${f('title','Project title: short and clear',0,'big')}</div>
    <div class="meta">${f('team','Team name')}${f('members','Members: names of the team')}${f('sdg','SDG and target, e.g. SDG 4 · Target 4.4')}</div>
    <div class="prob"><b>The problem</b>${f('problem','Who has the problem, and what goes wrong for them? One or two sentences.',2)}</div></div>`,
  ints:z=>`<div class="pz" id="z2">${head(z)}
    ${DATA.ints.map((x,i)=>`<div class="qt"><span class="qm">“</span>${f(`ints.${i}.q`,`Quote ${i+1}: their words, exactly`,2)}${f(`ints.${i}.who`,'Who said it (role, no full name)',0,'who')}</div>`).join('')}
    <div class="lrn"><b>What we learned</b>${f('learnInt','The pattern across people, in one or two sentences',2)}</div></div>`,
  emp:z=>`<div class="pz" id="z3">${head(z)}
    <div class="emp4">${[['says','Says','Their words'],['thinks','Thinks','What they may not say'],['does','Does','What you saw them do'],['feels','Feels','Their emotions']].map(([k,l,h])=>`<div class="q q-${k}"><b>${l}</b>${f('emp.'+k,h,2)}</div>`).join('')}
    <div class="who">${f('emp.who','The user',0,'c')}</div></div></div>`,
  jm:z=>`<div class="pz pz-wide" id="z4">${head(z)}
    ${curve(DATA.jm)}
    ${MODE==='edit'?`<div class="jm5">${DATA.jm.map((x,i)=>`<div><input class="pf" data-p="jm.${i}.s" type="text" value="${esc(x.s)}" placeholder="Stage ${i+1}" aria-label="Stage ${i+1}"><select class="pf" data-p="jm.${i}.f" aria-label="Feeling at stage ${i+1}">${FEEL.map((t,k)=>`<option value="${k}" ${+x.f===k?'selected':''}>${t}</option>`).join('')}</select></div>`).join('')}</div>`:''}
    <div class="lrn"><b>What we learned</b>${f('learnJm','Where does it hurt most, and why? What does that mean for the problem?',2)}</div></div>`,
  hmw:z=>`<div class="pz pz-hmw" id="z5">${head(z)}${f('hmw','How might we … ? Write one or two questions.',4,'hmwq')}</div>`,
  sol:z=>`<div class="pz" id="z6">${head(z)}
    ${[['risky','Risky','Bold, uncertain'],['easy','Easy','Quick to do'],['fav','Favourite','The team’s favourite']].map(([k,l,h])=>`<div class="sl ${DATA.sol.pick===k?'pick':''}"><span class="tg">${l}</span>${f('sol.'+k,h+' solution')}${MODE==='edit'?`<label class="pk"><input type="radio" name="pick" value="${k}" ${DATA.sol.pick===k?'checked':''}> our choice</label>`:DATA.sol.pick===k?'<span class="pk on">our choice</span>':''}</div>`).join('')}
    <div class="lrn"><b>Why this one</b>${f('sol.why','Link your choice to the interviews and the journey map',2)}</div></div>`,
  proto:z=>`<div class="pz" id="z7">${head(z)}
    <div class="img">${DATA.proto.img?`<img src="${DATA.proto.img}" alt="Our prototype">`:DATA.proto.sketch?SKETCH:`<div class="ph-empty">${MODE==='edit'?'Add a photo of your drawing, model or screens':'Photo of the prototype'}</div>`}</div>
    ${MODE==='edit'?`<div class="up"><label class="ubtn">Add photo<input type="file" accept="image/*" hidden></label>${DATA.proto.img?'<button type="button" class="ubtn ghost rm">Remove</button>':''}</div>`:''}
    ${f('proto.desc','What is it? What does the user see or do?',2)}</div>`,
  fb:z=>`<div class="pz" id="z8">${head(z)}
    <div class="fb3"><div><b>From users</b>${f('fb.user','What people said when they saw the prototype',2)}</div><div><b>From the Professor</b>${f('fb.prof','What your professor advised',2)}</div></div>
    <div class="lrn chg"><b>What we changed</b>${f('fb.changed','We first thought … then we changed to …',2)}</div></div>`
};
const byN=n=>ZONES[n-1];

function render(el,{mode='view',data,onchange}={}){
  MODE=mode; DATA=data; onChange=onchange;
  const Z=k=>ZH[k](ZONES.find(z=>z.key===k));
  el.innerHTML=`<article class="pstr ${mode}">${Z('top')}<div class="prow">${Z('ints')}${Z('emp')}</div>${Z('jm')}<div class="prow">${Z('hmw')}${Z('sol')}</div><div class="prow">${Z('proto')}${Z('fb')}</div>
    <footer class="pfoot"><span>ENT 141 · Project 1 · Canadian University Dubai</span><span>Instructor: Eng. Nadia Mek</span></footer></article>`;
  if(mode==='edit') wire(el);
}
function zone(el,n,data){ MODE='view'; DATA=data||EX; SOLO=true; const z=byN(n); el.innerHTML=`<div class="pstr solo view">${ZH[z.key](z)}</div>`; SOLO=false; }

function wire(el){
  const grow=t=>{ if(t.tagName==='TEXTAREA'){ t.style.height='auto'; t.style.height=t.scrollHeight+2+'px'; } };
  const set=(path,v)=>{ const ks=path.split('.'); let o=DATA; ks.slice(0,-1).forEach(k=>o=o[k]); o[ks.at(-1)]=v; };
  const refreshTicks=()=>el.querySelectorAll('.pz').forEach((p,i)=>{ const t=p.querySelector('.tick'); if(t) t.classList.toggle('on',DONE[ZONES[i].key](DATA)); });
  const changed=()=>{ save(DATA); refreshTicks(); onChange&&onChange(DATA); };
  el.querySelectorAll('.pf').forEach(t=>{ grow(t);
    t.addEventListener('input',()=>{ set(t.dataset.p,t.tagName==='SELECT'?+t.value:t.value); grow(t);
      if(/^jm\./.test(t.dataset.p)) el.querySelector('.pz-curve').outerHTML=curve(DATA.jm);
      changed(); }); });
  el.querySelectorAll('input[name=pick]').forEach(r=>r.addEventListener('change',()=>{ DATA.sol.pick=r.value; el.querySelectorAll('.sl').forEach(s=>s.classList.toggle('pick',s.querySelector('input[name=pick]').checked)); changed(); }));
  const fi=el.querySelector('.up input[type=file]');
  if(fi) fi.addEventListener('change',()=>{ const file=fi.files[0]; if(!file) return; const r=new FileReader();
    r.onload=()=>{ const im=new Image(); im.onload=()=>{ const k=Math.min(1,1000/Math.max(im.width,im.height)); const c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k); c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      DATA.proto.img=c.toDataURL('image/jpeg',.8); if(!save(DATA)){ DATA.proto.img=c.toDataURL('image/jpeg',.5); save(DATA); } changed(); render(el,{mode:'edit',data:DATA,onchange:onChange}); };
      im.src=r.result; }; r.readAsDataURL(file); });
  const rm=el.querySelector('.up .rm'); if(rm) rm.addEventListener('click',()=>{ DATA.proto.img=''; changed(); render(el,{mode:'edit',data:DATA,onchange:onChange}); });
}

/* poster map: A[1] B[2|3] C[4] D[5|6] E[7|8] */
function thumb(n){
  const R={1:[6,6,108,30],2:[6,40,52,34],3:[62,40,52,34],4:[6,78,108,26],5:[6,108,52,30],6:[62,108,52,30],7:[6,142,52,30],8:[62,142,52,30]};
  return `<svg class="pthumb" viewBox="0 0 120 180" role="img" aria-label="Where part ${n} sits on the poster"><rect x="1" y="1" width="118" height="178" rx="5" class="pg"/>${Object.entries(R).map(([k,[x,y,w,h]])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="${+k===n?'on':'off'}"/><text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" class="${+k===n?'ton':'toff'}">${k}</text>`).join('')}</svg>`;
}

window.Poster={KEY,ZONES,EX,DONE,blank,load,save,render,zone,thumb,esc};
})();
