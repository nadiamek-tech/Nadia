/* ENT 142 · Project 1 report lab (sections, data bank, drafts, figures). Shared by report-lab.html, project-1.html and report.html. */
const {W,B} = Lecture;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY = html=>`<div class="box exam"><b class="lbl">Investor lens</b>${html}</div>`;
const YEAR=new Date().getFullYear();

/* ================= state ================= */
const SKEY='ent142-studio-v1'; /* shared with the earlier Venture Studio, so no work is lost */
let S; try{ S=JSON.parse(localStorage.getItem(SKEY)||'null') }catch(e){ S=null }
if(!S) S={venture:{},data:[],sec:{}};
const save=()=>{ try{ localStorage.setItem(SKEY,JSON.stringify(S)) }catch(e){} };
const V=k=>S.venture[k]||'';
const sec=k=>(S.sec[k]=S.sec[k]||{});

/* ================= example (fictional venture, real data) ================= */
const EXAMPLE={
 venture:{name:'ShareBite',idea:'a mobile app that lets cafés sell their unsold meals at a discount before closing time',user:'university students and young workers in Dubai who eat out on a tight budget',problem:'cafés throw away good food every evening while many students find eating out expensive',sdg:'12',place:'Dubai'},
 data:[
  {id:'D1',kind:'stat',claim:'Food wasted worldwide in 2022',value:'1.05',unit:'billion tonnes',year:'2024',place:'World',org:'United Nations Environment Programme',title:'Food waste index report 2024',url:'https://www.unep.org/resources/publication/food-waste-index-report-2024',opened:true,cross:true,method:true},
  {id:'D2',kind:'stat',claim:'Share of food available to consumers that was wasted (retail, food service and households, 2022)',value:'19',unit:'%',year:'2024',place:'World',org:'United Nations Environment Programme',title:'Food waste index report 2024',url:'https://www.unep.org/resources/publication/food-waste-index-report-2024',opened:true,cross:true,method:true},
  {id:'D3',kind:'stat',claim:'Household food waste per person per year (world average, 2022)',value:'79',unit:'kg per person',year:'2024',place:'World',org:'United Nations Environment Programme',title:'Food waste index report 2024',url:'https://www.unep.org/resources/publication/food-waste-index-report-2024',opened:true,cross:true,method:true},
  {id:'D4',kind:'stat',claim:'Dubai population at the end of 2025',value:'4580000',unit:'people',year:'2026',place:'Dubai',org:'The National',title:'Dubai population surpassed 4.5 million by end of 2025',url:'https://www.thenationalnews.com/news/uae/2026/07/30/dubai-population-surpassed-45-million-by-end-of-2025',opened:true,cross:false,method:false},
  {id:'D5',kind:'fact',claim:'UAE Food Bank launched to collect surplus food from hotels, eateries, grocery chains and farms',value:'2017',unit:'launch year',year:'2017',place:'UAE',org:'UAE Cabinet',title:'Mohammed bin Rashid Al Maktoum launches first UAE Food Bank',url:'https://uaecabinet.ae/en/news/mohammed-bin-rashid-al-maktoum-launches-first-uae-food-bank',opened:true,cross:true,method:true}],
 sec:{
  concept:{opp:'Food prices and food waste are both rising concerns in the UAE, and smartphones already link cafés and customers every day',today:'cafés throw unsold food away or give a small amount to staff',benefit:'a full meal at up to 50% off near campus',impact:'less food in landfill and lower food costs for students',sim1:'UAE Food Bank',sim1what:'collects surplus food from hotels and restaurants for people in need',sim1data:'D5',sim2:'Too Good To Go (Europe)',sim2what:'sells surplus food from shops and cafés through an app',lesson:'Neither serves price-sensitive students buying from small cafés near campus in the evening'},
  customer:{who:'university students in Dubai, aged 18–25, who buy at least one meal a day on or near campus',pain:'meals cost more than their daily budget; healthy options sell out early',cope:'skip meals, eat fast food or bring food from home',size:'D4',painData:'D2',assumption:'students care most about price',result:'Partly confirmed',learned:'Waste data shows the supply side is large: almost a fifth of food is wasted. Price matters, but in our Week 5 prototype test students also asked about pickup times.',change:'we added pickup time slots to the first screen',still:'how many cafés near campus have regular surplus',next:'contact three cafés near campus and record their unsold meals for one week'},
  market:{industry:'food service and food-rescue technology',segment:'students and young workers near universities in Dubai',tam:'D4',samPct:'5',samWhy:'assumption: the share of Dubai residents who are students or young workers near university areas',somPct:'2',somWhy:'assumption: a realistic first-year reach for a student-run app',value:'720',valueWhy:'assumption: 4 meals a month × 15 AED × 12 months',attractive:'large, growing city population and strong public attention to food waste'},
  compet:{xA:'Price for the customer (high → low)',yA:'Convenience near campus (low → high)',youx:'4',youy:'4',c1:'UAE Food Bank',c1t:'Indirect',c1s:'Trusted, national scale',c1w:'Serves people in need, not paying students',c1x:'5',c1y:'2',c2:'Café closing-time discounts',c2t:'Substitute',c2s:'No app needed',c2w:'Customers must be there at the right minute',c2x:'3',c2y:'3',c3:'Food-delivery apps',c3t:'Indirect',c3s:'Huge choice, fast',c3w:'Delivery fees make meals expensive',c3x:'1',c3y:'5',barYou:'Cafés must trust a student start-up; delivery apps already own the café relationship',barOthers:'Delivery apps could add a surplus feature quickly',partners:'CUD student council and café owners near campus'},
  model:{payer:'Students pay the discounted meal price; cafés pay ShareBite a commission',s1:'15% commission per meal',p1:'2.25',v1:'2000',s2:'Monthly sustainability report for cafés',p2:'150',v2:'10',fixed:'3000',varPct:'5',people:'Number of affordable meals sold to students per month',planet:'Kilograms of food saved from landfill per month',risk:'Cafés may not list surplus food every day',test:'Run a 4-week pilot with three cafés and count meals listed per day'},
  learn:{m1:'Aisha (fictional)',m1b:'avoided speaking to managers',m1d:'contacted three café managers about surplus food',m1n:'prepare and lead a short business meeting',m2:'Omar (fictional)',m2b:'had never used open data',m2d:'built and verified our evidence bank',m2n:'check whether a statistic is trustworthy',m3:'Lina (fictional)',m3b:'only sketched ideas on paper',m3d:'turned our paper screens into a Canva mock-up',m3n:'design and test a clickable prototype',e141:'the design thinking process, especially empathy and testing',verdict:'Not yet',why:'the problem is backed by strong data, but our market size still relies on a news report; we will confirm it with the official source'},
  intro:{process:'used an empathy map and an idea-selection matrix in Week 2, then tested a paper prototype in Week 5',next:'run a four-week pilot with three cafés near campus'},
  proto:{tech:'Paper / digital prototype',assumption:'students will understand how to reserve and collect a meal in under one minute',v1:'three paper screens: browse meals, reserve, pickup code',testers:'12',what:'7 of 12 testers could not find the pickup time',change:'v2 (Canva mock-up) shows the pickup time on the first screen; 11 of 12 found it'}
 }};

/* ================= verification ================= */
const TRUST_OFFICIAL=[/\.gov\.ae$/,/\.gov$/,/\.gov\.[a-z]{2}$/,/(^|\.)u\.ae$/,/(^|\.)bayanat\.ae$/,/(^|\.)uaecabinet\.ae$/,/(^|\.)wam\.ae$/,/(^|\.)digitaldubai\.ae$/,/(^|\.)dubaipulse\.gov\.ae$/];
const TRUST_INTL=[/(^|\.)un\.org$/,/(^|\.)unep\.org$/,/(^|\.)who\.int$/,/(^|\.)worldbank\.org$/,/(^|\.)oecd\.org$/,/(^|\.)imf\.org$/,/(^|\.)ilo\.org$/,/(^|\.)fao\.org$/,/(^|\.)unesco\.org$/,/(^|\.)unicef\.org$/,/(^|\.)undp\.org$/,/(^|\.)irena\.org$/,/(^|\.)iea\.org$/,/(^|\.)ourworldindata\.org$/,/(^|\.)sdgindex\.org$/,/(^|\.)wto\.org$/];
const TRUST_ACAD=[/\.edu$/,/\.ac\.[a-z]{2}$/,/(^|\.)doi\.org$/,/(^|\.)springer\.com$/,/(^|\.)sciencedirect\.com$/,/(^|\.)hbr\.org$/,/(^|\.)jstor\.org$/,/(^|\.)tandfonline\.com$/,/(^|\.)wiley\.com$/,/(^|\.)nature\.com$/];
const NEWS=[/(^|\.)thenationalnews\.com$/,/(^|\.)gulfnews\.com$/,/(^|\.)khaleejtimes\.com$/,/(^|\.)reuters\.com$/,/(^|\.)bbc\.(com|co\.uk)$/,/(^|\.)arabianbusiness\.com$/,/(^|\.)zawya\.com$/,/(^|\.)bloomberg\.com$/,/(^|\.)ft\.com$/];
function host(u){ try{ return new URL(u).hostname.replace(/^www\./,'') }catch(e){ return '' } }
function tier(u){ const h=host(u); if(!h) return ['none','No valid link']; const m=a=>a.some(r=>r.test(h));
  if(m(TRUST_OFFICIAL)) return ['official','Official government source'];
  if(m(TRUST_INTL)) return ['intl','International organisation'];
  if(m(TRUST_ACAD)) return ['acad','Academic or research source'];
  if(m(NEWS)) return ['news','Reputable news: trace the original source'];
  return ['unknown','Unknown site: check who publishes it']; }
function verify(d){
  const t=tier(d.url); const yr=+d.year;
  const checks=[
    ['Publisher',!!(d.org&&d.org.trim())],
    ['Trusted source',['official','intl','acad'].includes(t[0])],
    ['Recent',d.kind==='fact'?true:(yr>=YEAR-6&&yr<=YEAR)],
    ['Value + unit',!!(String(d.value).trim()&&String(d.unit).trim())],
    ['Original opened',!!d.opened],
    ['Method known',!!d.method],
    ['Cross-checked',!!d.cross]];
  const n=checks.filter(c=>c[1]).length;
  const status=n===checks.length?['good','Verified']:((checks[1][1]||t[0]==='news')&&checks[0][1]&&checks[3][1])?['warn','Partly verified']:['bad','Not verified'];
  return {checks,n,status,tier:t};
}
const card=id=>S.data.find(d=>d.id===id);
const num=v=>{ const n=parseFloat(String(v).replace(/,/g,'')); return isFinite(n)?n:NaN; };
function nice(n){ if(!isFinite(n)) return '—'; const a=Math.abs(n);
  if(a>=1e9) return (n/1e9).toLocaleString('en-US',{maximumFractionDigits:2})+' billion';
  if(a>=1e6) return (n/1e6).toLocaleString('en-US',{maximumFractionDigits:2})+' million';
  return Math.round(n).toLocaleString('en-US'); }
function dval(d){ const n=num(d.value); return (isFinite(n)&&n>=10000?nice(n):d.value)+(String(d.unit).trim()==='%'?'%':' '+d.unit); }
const fact=d=>`${esc(d.claim)}: ${esc(dval(d))} ${cite(d)}`;
const shortOrg=o=>o.length>40?o.replace(/\s*\(.*\)\s*/,'').trim():o;
const cite=d=>d?`(${shortOrg(d.org)}, ${d.year})`:'';
const apa=d=>`${esc(d.org)}. (${esc(d.year)}). <i>${esc(d.title||d.claim)}</i>. ${esc(d.url)}`;
const apaTxt=d=>`${d.org}. (${d.year}). ${d.title||d.claim}. ${d.url}`;
const strong=id=>{ const d=card(id); return d&&verify(d).status[0]==='good'; };
const some=id=>{ const d=card(id); return d&&verify(d).status[0]!=='bad'; };
const hash=s=>{ let h=0; for(const c of String(s)) h=(h*31+c.charCodeAt(0))|0; return Math.abs(h); };
const pick=(arr)=>arr[hash(V('name')+arr.length)%arr.length];

/* ================= illustration palettes ================= */
const SCREEN={ink:'var(--ink)',muted:'var(--muted)',line:'var(--line)',bg:'var(--bg)',surf:'var(--surface)',wk:'var(--wk)',soft:'var(--wk-soft)',good:'var(--good)',warn:'var(--warn)',bad:'var(--bad)',onwk:'var(--on-wk)'};
const PRINT={ink:'#16202B',muted:'#5A6675',line:'#D6DDE5',bg:'#F3F5F8',surf:'#FFFFFF',wk:'#1F5E8C',soft:'#E3ECF4',good:'#1E7F4F',warn:'#A86200',bad:'#B4362F',onwk:'#FFFFFF'};
const FF='font-family="Schibsted Grotesk, Arial, sans-serif"';
const T=(x,y,t,P,o={})=>`<text x="${x}" y="${y}" ${FF} font-size="${o.s||13}" font-weight="${o.w||400}" fill="${o.c||P.ink}" text-anchor="${o.a||'start'}">${esc(t)}</text>`;
function wrap(t,max){ const w=String(t).split(/\s+/); const out=[]; let line=''; w.forEach(x=>{ if((line+' '+x).trim().length>max){ if(line) out.push(line); line=x; } else line=(line+' '+x).trim(); }); if(line) out.push(line); return out; }
const TL=(x,y,t,P,max,o={})=>wrap(t,max).slice(0,o.lines||3).map((l,i)=>T(x,y+i*(o.lh||16),l,P,o)).join('');

/* ================= generic form ================= */
function dataOptions(sel){ return `<option value="">— choose a data card —</option>`+S.data.map(d=>`<option value="${d.id}" ${d.id===sel?'selected':''}>[${d.id}] ${esc(dval(d))} · ${esc(d.claim).slice(0,60)}</option>`).join(''); }
function field(secKey,f){
  const v=sec(secKey)[f.id]||''; const id=`${secKey}-${f.id}`;
  let input;
  if(f.t==='area') input=`<textarea id="${id}" rows="${f.rows||2}" placeholder="${esc(f.ph||'')}">${esc(v)}</textarea>`;
  else if(f.t==='data') input=`<select id="${id}">${dataOptions(v)}</select>`;
  else if(f.t==='sel') input=`<select id="${id}"><option value="">— choose —</option>${f.o.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
  else input=`<input id="${id}" type="${f.t==='num'?'number':'text'}" ${f.t==='num'?'inputmode="decimal" step="any"':''} value="${esc(v)}" placeholder="${esc(f.ph||'')}">`;
  return `<div class="vs-f"><label for="${id}">${f.l}</label>${f.h?`<small>${f.h}</small>`:''}${input}</div>`;
}
function renderFields(secKey,fields){ return fields.map(f=>f.group?`<div class="vs-group"><b>${f.group}</b>${f.row?`<div class="vs-row">${f.fields.map(x=>field(secKey,x)).join('')}</div>`:f.fields.map(x=>field(secKey,x)).join('')}</div>`:f.row?`<div class="vs-row">${f.row.map(x=>field(secKey,x)).join('')}</div>`:field(secKey,f)).join(''); }
function allFields(fields){ const a=[]; fields.forEach(f=>{ if(f.fields) a.push(...f.fields); else if(f.row) a.push(...f.row); else a.push(f); }); return a; }

function downloadSVG(svg,name){
  const blob=new Blob([svg],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob); const img=new Image();
  img.onload=()=>{ const vb=svg.match(/viewBox="0 0 (\d+) (\d+)"/); const w=+vb[1]*2,h=+vb[2]*2; const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); x.fillStyle='#FFFFFF'; x.fillRect(0,0,w,h); x.drawImage(img,0,0,w,h);
    c.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name+'.png'; document.body.appendChild(a); a.click(); a.remove(); }); URL.revokeObjectURL(url); };
  img.src=url;
}
function copyText(btn,txt){ const ok=()=>{btn.textContent='Copied';setTimeout(()=>btn.textContent=btn.dataset.l,1500)}; const fail=()=>{ btn.textContent='Copy blocked: select the text'; }; try{ navigator.clipboard.writeText(txt).then(ok,fail) }catch(e){ fail() } }

/* builder: questions on top, generated paragraph + illustration below, updates live */
function builder(cfg){ return el=>{
  const s=sec(cfg.key);
  el.innerHTML=`<div class="vs"><div><h4>Answer the guided questions</h4><div class="vs-form">${renderFields(cfg.key,cfg.fields)}</div></div><div class="vs-out" aria-live="polite"></div></div>`;
  const out=el.querySelector('.vs-out');
  const draw=()=>{
    const r=cfg.gen(s);
    const refs=[...new Set(r.refs||[])].map(card).filter(Boolean);
    const svgS=cfg.illus?cfg.illus(s,SCREEN):'';
    out.innerHTML=`<h4 style="margin:0">Your draft · ${esc(cfg.title)}</h4>
      ${svgS?`<div>${svgS}</div>`:''}
      <p class="para">${r.html}</p>
      ${refs.length?`<div><h4>References used</h4><ul class="refs">${refs.map(d=>`<li>${apa(d)}</li>`).join('')}</ul></div>`:''}
      ${r.gaps&&r.gaps.length?`<div class="vs-gaps"><b>To validate this section</b><ul>${r.gaps.map(g=>`<li>${g}</li>`).join('')}</ul></div>`:`<div class="feedback"><span class="tag good">validated</span> Every claim in this draft is linked to verified data or your own test.</div>`}
      <div class="vs-tools"><button type="button" class="btn" data-l="Copy paragraph">Copy paragraph</button>${svgS?`<button type="button" class="btn ghost" data-l="Download image">Download image</button>`:''}</div>
      <p class="vs-note">A starting draft built from your answers. Rewrite it in your team's own words: every team starts from the same sentence patterns.</p>`;
    const bs=out.querySelectorAll('.vs-tools button');
    bs[0].addEventListener('click',()=>copyText(bs[0],r.text+(refs.length?'\n\nReferences\n'+refs.map(apaTxt).join('\n'):'')));
    if(bs[1]) bs[1].addEventListener('click',()=>downloadSVG(cfg.illus(s,PRINT).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '),`${(V('name')||'venture').replace(/\W+/g,'-')}-${cfg.key}`));
  };
  allFields(cfg.fields).forEach(f=>{ const i=el.querySelector('#'+cfg.key+'-'+f.id); i.addEventListener('input',()=>{ s[f.id]=i.value; save(); draw(); }); });
  draw();
};}
const strip=h=>h.replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
const out=(html,refs,gaps)=>({html,text:strip(html),refs,gaps});
const lc=t=>t&&/^[A-Z][a-z]/.test(t)?t.charAt(0).toLowerCase()+t.slice(1):t;
const ph=(v,label,low)=>{ v=String(v||'').trim().replace(/[.\s]+$/,''); return v?esc(low?lc(v):v):`<mark>[${label}]</mark>`; };
const name=()=>ph(V('name'),'venture name');
const SDGS=['1 No poverty','2 Zero hunger','3 Good health and well-being','4 Quality education','5 Gender equality','6 Clean water and sanitation','7 Affordable and clean energy','8 Decent work and economic growth','9 Industry, innovation and infrastructure','10 Reduced inequalities','11 Sustainable cities and communities','12 Responsible consumption and production','13 Climate action','14 Life below water','15 Life on land','16 Peace, justice and strong institutions','17 Partnerships for the goals'];
const sdgName=()=>{ const s=SDGS.find(x=>x.split(' ')[0]===V('sdg')); return s?`SDG ${s.split(' ')[0]} (${s.split(' ').slice(1).join(' ')})`:'<mark>[SDG]</mark>'; };

/* ================= venture profile ================= */
function profile(el){
  const F=[['name','Venture name','e.g. ShareBite'],['idea','The idea in one sentence','what it is (start with “a …”)'],['user','Primary customer','who exactly, where'],['problem','The problem','what goes wrong for them today'],['place','Where','city or country']];
  el.innerHTML=`<div class="vs"><div class="vs-form">${F.map(([k,l,h])=>`<div class="vs-f"><label for="v-${k}">${l}</label><small>${h}</small><input id="v-${k}" type="text" value="${esc(V(k))}"></div>`).join('')}
    <div class="vs-f"><label for="v-sdg">Main SDG</label><select id="v-sdg"><option value="">— choose —</option>${SDGS.map(s=>`<option value="${s.split(' ')[0]}" ${s.split(' ')[0]===V('sdg')?'selected':''}>SDG ${esc(s)}</option>`).join('')}</select></div></div>
    <div class="vs-tools"><button type="button" class="btn" id="v-ex">Load the example (ShareBite)</button><button type="button" class="btn ghost" id="v-clear">Clear everything</button></div>
    <div class="feedback" id="v-msg">${V('name')?`Saved in this browser: <b>${esc(V('name'))}</b>, ${S.data.length} data card(s).`:'Fill in your venture, or load the example to see how the studio works.'}</div>
    <p class="vs-note">The example venture ShareBite is fictional. Its data cards D1–D5 are real, published figures.</p></div>`;
  F.concat([['sdg']]).forEach(([k])=>{ const i=el.querySelector('#v-'+k); i.addEventListener('input',()=>{ S.venture[k]=i.value; save(); }); });
  el.querySelector('#v-ex').addEventListener('click',()=>{ S=JSON.parse(JSON.stringify(EXAMPLE)); save(); el.innerHTML=''; profile(el); el.querySelector('#v-msg').innerHTML='<b>Example loaded.</b> Move through the scenes to see each section built from verified data.'; });
  const clr=el.querySelector('#v-clear');
  clr.addEventListener('click',()=>{ if(clr.dataset.sure){ S={venture:{},data:[],sec:{}}; save(); el.innerHTML=''; profile(el); } else { clr.dataset.sure='1'; clr.textContent='Click again to delete all answers'; } });
}

/* ================= evidence bank ================= */
function bank(el){
  const draw=()=>{
    el.innerHTML=`<div class="vs">
      <div class="vs-group"><b>Add a data card</b>
        <div class="vs-f"><label for="d-claim">What does the number show?</label><input id="d-claim" type="text" placeholder="e.g. Food wasted worldwide in 2022"></div>
        <div class="vs-row">${[['value','Value','1.05'],['unit','Unit','billion tonnes'],['year','Year published','2024'],['place','Place','World / UAE / Dubai']].map(([k,l,p])=>`<div class="vs-f"><label for="d-${k}">${l}</label><input id="d-${k}" type="text" placeholder="${p}"></div>`).join('')}</div>
        <div class="vs-f"><label for="d-org">Publisher (organisation)</label><input id="d-org" type="text" placeholder="e.g. United Nations Environment Programme"></div>
        <div class="vs-f"><label for="d-title">Title of the page, table or report</label><input id="d-title" type="text" placeholder="e.g. Food waste index report 2024"></div>
        <div class="vs-f"><label for="d-url">Link</label><input id="d-url" type="url" placeholder="https://…"></div>
        <div class="vs-f"><label for="d-kind">Type</label><select id="d-kind"><option value="stat">Statistic (must be recent)</option><option value="fact">Fact or event (e.g. a launch date)</option></select></div>
        <div class="cks"><label><input type="checkbox" id="d-opened"> I opened the original publisher's page, not a copy of it</label><label><input type="checkbox" id="d-method"> I know how the number was measured (census, survey of N people, estimate…)</label><label><input type="checkbox" id="d-cross"> A second source gives the same or a similar figure</label></div>
        <div class="vs-tools"><button type="button" class="btn" id="d-add">Add card</button><span class="mono" id="d-err" style="color:var(--bad)"></span></div></div>
      <div><h4>Your evidence bank · ${S.data.length} card(s)</h4><div style="display:grid;gap:8px">${S.data.length?S.data.map(d=>{ const v=verify(d); return `<div class="dc"><div class="top"><span><span class="mono">[${d.id}]</span> <span class="val">${esc(dval(d))}</span></span><b class="st-${v.status[0]}">${v.status[1]} · ${v.n}/7</b></div><div>${esc(d.claim)} · ${esc(d.place)}</div><div class="src">${esc(d.org)} (${esc(d.year)}) · ${esc(v.tier[1])} · ${esc(host(d.url)||'no link')}</div><div class="chk">${v.checks.map(([l,ok])=>`<span class="${ok?'y':'n'}">${ok?'✓':'✗'} ${l}</span>`).join('')}</div><div class="row2"><button type="button" class="btn ghost" data-t="${d.id}" data-k="opened">${d.opened?'Untick':'Tick'} opened</button><button type="button" class="btn ghost" data-t="${d.id}" data-k="method">${d.method?'Untick':'Tick'} method</button><button type="button" class="btn ghost" data-t="${d.id}" data-k="cross">${d.cross?'Untick':'Tick'} cross-checked</button><button type="button" class="btn ghost" data-del="${d.id}">Delete</button></div></div>`; }).join(''):'<div class="feedback">No cards yet. Add your first verified number above, or load the example on the Start scene.</div>'}</div></div></div>`;
    el.querySelector('#d-add').addEventListener('click',()=>{
      const g=k=>el.querySelector('#d-'+k); const d={kind:g('kind').value,claim:g('claim').value.trim(),value:g('value').value.trim(),unit:g('unit').value.trim(),year:g('year').value.trim(),place:g('place').value.trim(),org:g('org').value.trim(),title:g('title').value.trim(),url:g('url').value.trim(),opened:g('opened').checked,method:g('method').checked,cross:g('cross').checked};
      if(!d.claim||!d.value||!d.org||!d.year){ g('err').textContent='Add at least: what it shows, value, year and publisher.'; return; }
      let n=1; while(S.data.some(x=>x.id==='D'+n)) n++; d.id='D'+n; S.data.push(d); save(); draw();
    });
    el.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>{ const d=card(b.dataset.t); d[b.dataset.k]=!d[b.dataset.k]; save(); draw(); }));
    el.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{ S.data=S.data.filter(d=>d.id!==b.dataset.del); save(); draw(); }));
  };
  draw();
}

/* ================= section generators ================= */
const CONCEPT={key:'concept',title:'Concept and Vision',fields:[
  {id:'opp',t:'area',l:'Why is this an opportunity now?',h:'What has changed: a trend, a rule, a technology, a gap.'},
  {id:'today',t:'text',l:'What do people use or do today instead?'},
  {id:'benefit',t:'text',l:'Main benefit for the customer'},
  {id:'impact',t:'text',l:'How it makes the world better',h:'People and planet'},
  {group:'Who has tried something similar?',fields:[
    {id:'sim1',t:'text',l:'Similar venture 1'},{id:'sim1what',t:'text',l:'What it does / what happened'},{id:'sim1data',t:'data',l:'Evidence card (optional)'},
    {id:'sim2',t:'text',l:'Similar venture 2'},{id:'sim2what',t:'text',l:'What it does / what happened'}]},
  {id:'lesson',t:'area',l:'Why is your opportunity still attractive?'}],
 gen(s){ const d=card(s.sim1data); const gaps=[];
  if(!s.sim1||!s.sim2) gaps.push('Name at least two similar ventures.'); if(!d) gaps.push('Link an evidence card for a similar venture.'); else if(!strong(s.sim1data)) gaps.push(`Finish verifying [${d.id}].`); if(!s.lesson) gaps.push('Explain why the opportunity is still attractive.');
  const vp=pick([`For ${ph(V('user'),'customer')}, ${name()} is ${ph(V('idea'),'idea')}.`,`${name()} is ${ph(V('idea'),'idea')}, designed for ${ph(V('user'),'customer')}.`]);
  const html=`${vp} Today, ${ph(s.today,'current alternative')}; ${name()} offers ${ph(s.benefit,'main benefit')}. The opportunity is timely: ${ph(s.opp,'why now',1)}. The venture supports ${sdgName()} through ${ph(s.impact,'impact',1)}. Similar initiatives exist: ${ph(s.sim1,'venture 1')} ${ph(s.sim1what,'what it does')}${d?` ${cite(d)}`:''}, and ${ph(s.sim2,'venture 2')} ${ph(s.sim2what,'what it does')}. ${ph(s.lesson,'why still attractive')}.`;
  return out(html,[s.sim1data],gaps); },
 illus(s,P){ const box=(x,t,h,c)=>`<rect x="${x}" y="40" width="190" height="120" rx="10" fill="${c==='wk'?P.wk:P.surf}" stroke="${c==='wk'?P.wk:P.line}"/>${T(x+12,64,h,P,{s:11,w:600,c:c==='wk'?P.onwk:P.muted})}${TL(x+12,86,t,P,26,{s:13,w:600,c:c==='wk'?P.onwk:P.ink,lines:4})}`;
  return `<svg viewBox="0 0 640 200" role="img" aria-label="Problem, solution and impact">${box(10,V('problem')||'The problem','PROBLEM')}<path d="M206 100h26" stroke="${P.muted}" stroke-width="2"/><path d="M228 94l8 6-8 6" fill="${P.muted}"/>${box(225+15,V('name')?V('name')+': '+(s.benefit||''):'Your solution','SOLUTION','wk')}<path d="M436 100h26" stroke="${P.muted}" stroke-width="2"/><path d="M458 94l8 6-8 6" fill="${P.muted}"/>${box(440+30,s.impact||'Impact','IMPACT · '+(V('sdg')?'SDG '+V('sdg'):'SDG'))}${T(320,190,'Value proposition: problem → solution → impact',P,{s:11,c:P.muted,a:'middle'})}</svg>`; }};

const CUSTOMER={key:'customer',title:'Customers and Customer Development',fields:[
  {id:'who',t:'area',l:'Who exactly is your primary customer?',h:'Age, place, situation. Not “everyone”.'},
  {id:'pain',t:'area',l:'Their main pain points'},
  {id:'cope',t:'text',l:'How do they deal with the problem today?'},
  {id:'size',t:'data',l:'Evidence: how many people are affected?',h:'A verified data card (e.g. population, students, households)'},
  {id:'painData',t:'data',l:'Evidence: the problem is real and important',h:'A verified data card about the problem'},
  {id:'assumption',t:'text',l:'Your original assumption about the customer'},
  {id:'result',t:'sel',l:'Did the data confirm it?',o:['Confirmed','Partly confirmed','Challenged']},
  {id:'learned',t:'area',l:'What the data (and your prototype test) taught you'},
  {id:'change',t:'text',l:'What you changed because of it'},
  {id:'still',t:'text',l:'What you still need to learn'},
  {id:'next',t:'text',l:'Next customer-development action'}],
 gen(s){ const a=card(s.size), b=card(s.painData), gaps=[];
  if(!a) gaps.push('Link a data card showing how many people are affected.'); else if(!strong(s.size)) gaps.push(`Finish verifying [${a.id}] (see the evidence bank).`);
  if(!b) gaps.push('Link a data card proving the problem is real.'); else if(!strong(s.painData)) gaps.push(`Finish verifying [${b.id}].`);
  if(!s.change) gaps.push('State what you changed (assumption → evidence → change).');
  const html=`Our primary customers are ${ph(s.who,'primary customer')}. Their main pain points: ${ph(s.pain,'pain points',1)}. Today they ${ph(s.cope,'current workaround',1)}. ${a?`The potential customer base is significant. ${fact(a)}.`:'<mark>[data on how many people are affected]</mark>'} ${b?`The problem is well documented. ${fact(b)}.`:'<mark>[data proving the problem]</mark>'} We first assumed that ${ph(s.assumption,'assumption')}. This assumption was ${ph((s.result||'').toLowerCase(),'confirmed / challenged')} by our desk research: ${ph(s.learned,'what you learned',1)}. As a result, ${ph(s.change,'what you changed')}. We still need to learn ${ph(s.still,'open question')}, so our next step is to ${ph(s.next,'next action')}.`;
  return out(html,[s.size,s.painData],gaps); },
 illus(s,P){ const a=card(s.size), b=card(s.painData);
  const tile=(x,d,lbl)=>`<rect x="${x}" y="96" width="190" height="96" rx="10" fill="${P.soft}" stroke="${P.wk}"/>${d?T(x+12,128,dval(d).length>16?dval(d).slice(0,18):dval(d),P,{s:20,w:800,c:P.wk})+TL(x+12,150,d.claim,P,28,{s:11,lines:2})+T(x+12,184,`${shortOrg(d.org)}, ${d.year}`,P,{s:10,c:P.muted}):T(x+12,140,'Add a data card',P,{c:P.muted})}${T(x+12,90,lbl,P,{s:10,c:P.muted,w:600})}`;
  return `<svg viewBox="0 0 640 210" role="img" aria-label="Customer profile with evidence">
   <rect x="10" y="10" width="620" height="60" rx="10" fill="${P.surf}" stroke="${P.line}"/><circle cx="44" cy="40" r="18" fill="${P.wk}"/>${T(44,46,(V('name')||'C').charAt(0).toUpperCase(),P,{s:16,w:800,c:P.onwk,a:'middle'})}
   ${T(72,34,'PRIMARY CUSTOMER',P,{s:10,w:600,c:P.muted})}${TL(72,52,s.who||V('user')||'Who is your customer?',P,78,{s:13,w:600,lines:1})}
   ${tile(10,a,'HOW MANY')}${tile(220,b,'PROBLEM EVIDENCE')}
   <rect x="430" y="96" width="200" height="96" rx="10" fill="${P.surf}" stroke="${P.line}"/>${T(442,90,'ASSUMPTION',P,{s:10,c:P.muted,w:600})}${TL(442,120,s.assumption||'—',P,30,{s:12,lines:2})}${T(442,170,(s.result||'not tested yet').toUpperCase(),P,{s:12,w:800,c:s.result==='Confirmed'?P.good:s.result?P.warn:P.muted})}</svg>`; }};

function mkt(s){ const d=card(s.tam); const tam=d?num(d.value):NaN; const sam=tam*(num(s.samPct)/100), som=sam*(num(s.somPct)/100), val=num(s.value); return {d,tam,sam,som,rev:som*val,val}; }
const MARKET={key:'market',title:'Market Analysis',fields:[
  {id:'industry',t:'text',l:'Industry or sector'},
  {id:'segment',t:'text',l:'Segment you target'},
  {id:'tam',t:'data',l:'Total market (TAM): a verified data card',h:'A count of people, households or businesses'},
  {row:[{id:'samPct',t:'num',l:'SAM: % you can serve'},{id:'somPct',t:'num',l:'SOM: % of SAM reached in year 1'}]},
  {id:'samWhy',t:'text',l:'Why that SAM %?',h:'Say if it is an assumption, or link it to data'},
  {id:'somWhy',t:'text',l:'Why that SOM %?'},
  {id:'value',t:'num',l:'Spend per customer per year (AED)'},
  {id:'valueWhy',t:'text',l:'How you calculated it'},
  {id:'growth',t:'data',l:'Growth or trend data (optional)'},
  {id:'attractive',t:'text',l:'Why the market is attractive'}],
 gen(s){ const m=mkt(s), g=card(s.growth), gaps=[];
  if(!m.d) gaps.push('Link a verified data card for the total market (TAM).'); else if(!strong(s.tam)) gaps.push(`Finish verifying [${m.d.id}].`);
  if(!s.samWhy||!s.somWhy||!s.valueWhy) gaps.push('Explain every percentage and the spend figure; label assumptions as assumptions.');
  if(!g) gaps.push('Add growth or trend data, or the best analogous market data.');
  const html=`${name()} operates in ${ph(s.industry,'industry')}, targeting ${ph(s.segment,'segment')}. ${m.d?`The total addressable market is ${nice(m.tam)} ${esc(m.d.unit)} (${esc(m.d.claim)}) ${cite(m.d)}.`:'<mark>[total market from a verified source]</mark>'} We estimate a serviceable market of ${s.samPct?esc(s.samPct)+'%':'<mark>[SAM %]</mark>'}, about ${nice(m.sam)} ${m.d?esc(m.d.unit):''} (${ph(s.samWhy,'reason')}), and a first-year obtainable market of ${s.somPct?esc(s.somPct)+'%':'<mark>[SOM %]</mark>'} of that, about ${nice(m.som)} customers (${ph(s.somWhy,'reason')}). At ${s.value?nice(num(s.value))+' AED':'<mark>[spend]</mark>'} per customer per year (${ph(s.valueWhy,'calculation')}), this represents about <b>${isFinite(m.rev)?nice(m.rev)+' AED':'—'}</b> in yearly customer spending. ${g?`The trend supports growth. ${fact(g)}.`:''} The market is attractive because of ${ph(s.attractive,'reasons')}.`;
  return out(html,[s.tam,s.growth],gaps); },
 illus(s,P){ const m=mkt(s); const R=95; const r=v=>isFinite(v)&&m.tam>0?Math.max(R*Math.sqrt(v/m.tam),0):0; const r2=r(m.sam), r3=r(m.som); const minR=6; const clamped=r3<minR&&r3>0;
  const cy=110, cx=150;
  return `<svg viewBox="0 0 640 230" role="img" aria-label="Market size: TAM, SAM and SOM">
   <circle cx="${cx}" cy="${cy}" r="${R}" fill="${P.soft}" stroke="${P.wk}"/>
   ${r2?`<circle cx="${cx}" cy="${cy+R-r2}" r="${r2}" fill="${P.soft}" stroke="${P.wk}" stroke-width="1.5"/>`:''}
   ${r3?`<circle cx="${cx}" cy="${cy+R-Math.max(r3,minR)}" r="${Math.max(r3,minR)}" fill="${P.wk}"/>`:''}
   ${[['TAM',m.tam,'Total market'],['SAM',m.sam,'Serviceable'],['SOM',m.som,'Year-1 customers']].map(([k,v,l],i)=>`<circle cx="285" cy="${50+i*48}" r="6" fill="${i===2?P.wk:P.soft}" stroke="${P.wk}"/>${T(300,46+i*48,k+' · '+l,P,{s:11,c:P.muted,w:600})}${T(300,64+i*48,isFinite(v)?nice(v)+(m.d?' '+m.d.unit:''):'—',P,{s:16,w:800})}`).join('')}
   ${T(285,200,'Yearly customer spending in SOM',P,{s:11,c:P.muted,w:600})}${T(285,220,isFinite(m.rev)?nice(m.rev)+' AED':'—',P,{s:16,w:800,c:P.wk})}
   ${T(10,225,clamped?'Circle areas to scale; SOM enlarged to stay visible.':'Circle areas drawn to scale.',P,{s:10,c:P.muted})}</svg>`; }};

const COMPET={key:'compet',title:'Competition and Positioning',fields:[
  {row:[{id:'xA',t:'text',l:'Axis X (customers care about)',ph:'Price (high → low)'},{id:'yA',t:'text',l:'Axis Y',ph:'Convenience (low → high)'}]},
  {group:'Your venture (score 1–5)',row:true,fields:[{id:'youx',t:'num',l:'X'},{id:'youy',t:'num',l:'Y'}]},
  ...[1,2,3].map(i=>({group:`Competitor ${i}`,fields:[{id:`c${i}`,t:'text',l:'Name'},{id:`c${i}t`,t:'sel',l:'Type',o:['Direct','Indirect','Substitute']},{id:`c${i}s`,t:'text',l:'Strength'},{id:`c${i}w`,t:'text',l:'Weakness you can use'},{id:`c${i}x`,t:'num',l:'X score 1–5'},{id:`c${i}y`,t:'num',l:'Y score 1–5'}]})),
  {id:'evid',t:'data',l:'Evidence card about a competitor or the industry (optional)'},
  {id:'barYou',t:'area',l:'Barriers to entry for you'},
  {id:'barOthers',t:'text',l:'Barriers for future competitors'},
  {id:'partners',t:'text',l:'Partners or allies who help you'}],
 gen(s){ const cs=[1,2,3].filter(i=>s['c'+i]); const gaps=[]; const e=card(s.evid);
  if(cs.length<3) gaps.push('List three competitors (direct, indirect or substitute).');
  if(!s.xA||!s.yA) gaps.push('Name both axes of the positioning map.');
  const gapX=cs.every(i=>num(s.youx)>num(s['c'+i+'x'])), gapY=cs.every(i=>num(s.youy)>num(s['c'+i+'y']));
  const better=cs.filter(i=>num(s.youx)+num(s.youy)>num(s['c'+i+'x'])+num(s['c'+i+'y'])).length;
  if(cs.length&&better<cs.length) gaps.push('On the map, at least one competitor matches or beats you on both axes: explain your real advantage or rethink the position.');
  if(!s.partners) gaps.push('Name partners or allies.');
  const list=cs.map(i=>`${esc(s['c'+i])} (${esc((s['c'+i+'t']||'').toLowerCase()||'competitor')}; strength: ${ph(s['c'+i+'s'],'strength')}; weakness: ${ph(s['c'+i+'w'],'weakness')})`).join('; ');
  const html=`${name()} competes with ${list||'<mark>[competitors]</mark>'}. ${e?`${esc(e.claim)} (${esc(e.value)} ${esc(e.unit)}) ${cite(e)}. `:''}On a positioning map of ${ph(s.xA,'axis X')} and ${ph(s.yA,'axis Y')}, ${name()} ${better===cs.length&&cs.length?'occupies a clear gap':'sits close to existing players'}${gapX&&gapY?', ahead on both dimensions':gapX?`, leading on ${esc(s.xA)}`:gapY?`, leading on ${esc(s.yA)}`:''}. Barriers to entry for us include ${ph(s.barYou,'barriers for you',1)}; for future competitors, ${ph(s.barOthers,'barriers for others',1)}. Partnerships with ${ph(s.partners,'partners')} will help us overcome established players.`;
  return out(html,[s.evid],gaps); },
 illus(s,P){ const X=v=>70+(Math.min(5,Math.max(1,num(v)||1))-1)/4*520, Y=v=>200-(Math.min(5,Math.max(1,num(v)||1))-1)/4*170;
  const pts=[1,2,3].filter(i=>s['c'+i]).map(i=>`<circle cx="${X(s['c'+i+'x'])}" cy="${Y(s['c'+i+'y'])}" r="9" fill="${P.surf}" stroke="${P.muted}" stroke-width="2"/>${T(X(s['c'+i+'x'])+(X(s['c'+i+'x'])>480?-14:14),Y(s['c'+i+'y'])+4,s['c'+i],P,{s:12,a:X(s['c'+i+'x'])>480?'end':'start'})}`).join('');
  return `<svg viewBox="0 0 640 250" role="img" aria-label="Positioning map">
   <rect x="70" y="30" width="520" height="170" fill="${P.bg}" stroke="${P.line}"/><path d="M330 30v170M70 115h520" stroke="${P.line}" stroke-dasharray="4 4"/>
   ${T(330,228,(s.xA||'Axis X')+' →',P,{s:12,w:600,a:'middle',c:P.muted})}<text x="24" y="115" ${FF} font-size="12" font-weight="600" fill="${P.muted}" text-anchor="middle" transform="rotate(-90 24 115)">${esc((s.yA||'Axis Y')+' →')}</text>
   ${T(76,44,'1',P,{s:10,c:P.muted})}${T(584,214,'5',P,{s:10,c:P.muted,a:'end'})}
   ${pts}${s.youx&&s.youy?`<circle cx="${X(s.youx)}" cy="${Y(s.youy)}" r="12" fill="${P.wk}"/>${T(X(s.youx),Y(s.youy)-18,V('name')||'You',P,{s:13,w:800,a:'middle',c:P.wk})}`:''}
   ${T(70,20,'Scores 1–5 are the team’s judgement; justify each one in the text.',P,{s:10,c:P.muted})}</svg>`; }};

function money(s){ const r1=num(s.p1)*num(s.v1)||0, r2=num(s.p2)*num(s.v2)||0, rev=r1+r2, fixed=num(s.fixed)||0, varc=rev*(num(s.varPct)||0)/100, cost=fixed+varc, profit=rev-cost; const unit=num(s.p1)*(1-(num(s.varPct)||0)/100); const be=unit>0?Math.ceil(Math.max(0,fixed-r2*(1-(num(s.varPct)||0)/100))/unit):NaN; return {r1,r2,rev,fixed,varc,cost,profit,be}; }
const MODEL={key:'model',title:'Sustainable Business Model',fields:[
  {id:'payer',t:'area',l:'Who pays, and for what?'},
  {group:'Revenue stream 1',row:true,fields:[{id:'s1',t:'text',l:'Description'},{id:'p1',t:'num',l:'Price per unit (AED)'},{id:'v1',t:'num',l:'Units per month'}]},
  {group:'Revenue stream 2 (optional)',row:true,fields:[{id:'s2',t:'text',l:'Description'},{id:'p2',t:'num',l:'Price (AED)'},{id:'v2',t:'num',l:'Units per month'}]},
  {row:[{id:'fixed',t:'num',l:'Fixed costs per month (AED)',h:'hosting, marketing, salaries'},{id:'varPct',t:'num',l:'Variable costs (% of revenue)',h:'payment fees etc.'}]},
  {id:'costData',t:'data',l:'Evidence for a cost or price (optional data card)'},
  {id:'people',t:'text',l:'People: social impact indicator',h:'Something you can count'},
  {id:'planet',t:'text',l:'Planet: environmental indicator'},
  {id:'risk',t:'text',l:'Major risk to address right away'},
  {id:'test',t:'text',l:'First test to reduce that risk'}],
 gen(s){ const m=money(s), c=card(s.costData), gaps=[];
  if(!m.rev) gaps.push('Add at least one revenue stream with price and volume.'); if(!s.fixed) gaps.push('Estimate monthly fixed costs.');
  if(m.rev&&m.profit<0) gaps.push(`At these numbers the venture loses ${nice(-m.profit)} AED a month. Show how you reach break-even (about ${nice(m.be)} units of stream 1).`);
  if(!s.people||!s.planet) gaps.push('Add one people indicator and one planet indicator.'); if(!s.test) gaps.push('Name the first test that reduces the major risk.');
  const html=`${name()} turns the opportunity into a business as follows: ${ph(s.payer,'who pays')}. Revenue comes from ${ph(s.s1,'stream 1')} (${s.p1?esc(s.p1)+' AED':'—'} × ${s.v1?nice(num(s.v1)):'—'} per month)${s.s2?` and ${esc(s.s2)} (${esc(s.p2||'—')} AED × ${s.v2?nice(num(s.v2)):'—'} per month)`:''}, giving about <b>${nice(m.rev)} AED</b> per month against <b>${nice(m.cost)} AED</b> in costs, a monthly ${m.profit>=0?'surplus':'loss'} of ${nice(Math.abs(m.profit))} AED${isFinite(m.be)?`; break-even is reached at about ${nice(m.be)} units of the first stream per month`:''}. ${c?`${fact(c)}. `:''}The model follows the triple bottom line: for people we track ${ph((s.people||'').toLowerCase(),'social indicator')}; for the planet, ${ph((s.planet||'').toLowerCase(),'environmental indicator')}; and for profit, monthly surplus. The major risk is that ${ph((s.risk||'').charAt(0).toLowerCase()+(s.risk||'').slice(1),'major risk')}; our first step to reduce it is to ${ph((s.test||'').charAt(0).toLowerCase()+(s.test||'').slice(1),'first test')}.`;
  return out(html,[s.costData],gaps); },
 illus(s,P){ const m=money(s); const mx=Math.max(m.rev,m.cost,1); const w=v=>v/mx*300;
  const pill=(x,h,t)=>`<rect x="${x}" y="130" width="196" height="84" rx="10" fill="${P.surf}" stroke="${P.line}"/>${T(x+12,152,h,P,{s:10,w:600,c:P.wk})}${TL(x+12,172,t||'—',P,28,{s:12,lines:2})}`;
  return `<svg viewBox="0 0 640 225" role="img" aria-label="Monthly revenue versus cost, and triple bottom line">
   ${T(10,20,'MONTHLY (AED)',P,{s:10,w:600,c:P.muted})}
   ${T(10,48,'Revenue',P,{s:12,w:600})}<rect x="90" y="36" width="${w(m.rev)}" height="18" rx="3" fill="${P.wk}"/>${T(96+w(m.rev),50,nice(m.rev),P,{s:12,w:700})}
   ${T(10,80,'Costs',P,{s:12,w:600})}<rect x="90" y="68" width="${w(m.cost)}" height="18" rx="3" fill="${P.muted}"/>${T(96+w(m.cost),82,nice(m.cost),P,{s:12,w:700})}
   ${T(10,112,(m.profit>=0?'Surplus ':'Loss ')+nice(Math.abs(m.profit))+' AED'+(isFinite(m.be)?' · break-even ≈ '+nice(m.be)+' units/month':''),P,{s:12,w:800,c:m.profit>=0?P.good:P.bad})}
   ${pill(10,'PEOPLE',s.people)}${pill(222,'PLANET',s.planet)}${pill(434,'PROFIT',m.rev?`${m.profit>=0?'Surplus':'Loss'} of ${nice(Math.abs(m.profit))} AED a month`:'')}</svg>`; }};

const PROTO={key:'proto',title:'Prototype Development',fields:[
  {id:'tech',t:'sel',l:'Prototype technique',h:'Not sure? Ask the <a href="week-05.html#s3">Prototype Helper</a>.',o:['Sketch / mock-up','Paper / digital prototype','Physical model','Storyboard / role-play','Functional demo','Storyboard']},
  {id:'assumption',t:'text',l:'Assumption it tested'},
  {id:'v1',t:'text',l:'Version 1: what you built'},
  {row:[{id:'testers',t:'num',l:'Number of testers'}]},
  {id:'what',t:'text',l:'What testers did (the result)'},
  {id:'change',t:'text',l:'Version 2: what changed and the new result'}],
 gen(s){ const gaps=[]; if(!(num(s.testers)>=3)) gaps.push('Test with at least 3 people (classmates in the lab count).'); if(!s.change) gaps.push('Show what changed from version 1 to version 2.'); if(!s.assumption) gaps.push('State the assumption the prototype tested.');
  const html=`To test the assumption that ${ph(s.assumption,'assumption')}, we built a ${ph((s.tech||'').toLowerCase().replace(/\s*prototype$/,''),'technique')} prototype: ${ph(s.v1,'version 1')}. We tested it with ${s.testers?esc(s.testers):'<mark>[n]</mark>'} users in class; ${ph(s.what,'what happened')}. Based on this, ${ph(s.change,'version 2')}. Photos of both versions are shown in Figures X and Y.`;
  return out(html,[],gaps); },
 illus(s,P){ const step=(x,h,t,on)=>`<rect x="${x}" y="30" width="180" height="110" rx="10" fill="${on?P.wk:P.surf}" stroke="${on?P.wk:P.line}"/>${T(x+12,54,h,P,{s:10,w:600,c:on?P.onwk:P.muted})}${TL(x+12,76,t||'—',P,25,{s:12,w:600,lines:4,c:on?P.onwk:P.ink})}`;
  return `<svg viewBox="0 0 640 170" role="img" aria-label="Prototype version 1, test, version 2">${step(10,'VERSION 1 · '+(s.tech||'').toUpperCase().slice(0,20),s.v1)}<path d="M194 85h30" stroke="${P.muted}" stroke-width="2"/><path d="M220 79l8 6-8 6" fill="${P.muted}"/>${step(230,'TEST · '+(s.testers||'?')+' USERS',s.what)}<path d="M414 85h30" stroke="${P.muted}" stroke-width="2"/><path d="M440 79l8 6-8 6" fill="${P.muted}"/>${step(450,'VERSION 2',s.change,true)}${T(320,162,'Assumption tested: '+(s.assumption||'—').slice(0,70),P,{s:11,c:P.muted,a:'middle'})}</svg>`; }};

/* ================= validation scorecard ================= */
function score(){
  const c=sec('customer'), m=sec('market'), k=sec('compet'), b=sec('model'), p=sec('proto'), cc=sec('concept');
  const lvl=(a,b2)=>a?2:b2?1:0;
  const mk=mkt(m), mo=money(b);
  const cs=[1,2,3].filter(i=>k['c'+i]);
  const ahead=cs.length>0&&cs.every(i=>num(k.youx)+num(k.youy)>num(k['c'+i+'x'])+num(k['c'+i+'y']));
  return [
   ['The problem is real',lvl(strong(c.painData),some(c.painData)||!!V('problem')),'Verified data shows the problem exists'],
   ['Enough customers exist',lvl(strong(c.size)&&!!c.who,some(c.size)||!!c.who),'Verified count of people affected'],
   ['The market is worth it',lvl(strong(m.tam)&&isFinite(mk.rev)&&!!m.samWhy,!!card(m.tam)),'TAM verified; SAM/SOM explained'],
   ['We can stand out',lvl(cs.length>=3&&ahead,cs.length>=1),'3 competitors and a clear gap on the map'],
   ['The model can sustain itself',lvl(mo.rev>0&&mo.profit>=0&&!!b.people&&!!b.planet,mo.rev>0),'Covers costs; impact measured'],
   ['The solution works for users',lvl(num(p.testers)>=3&&!!p.change,!!p.v1),'Prototype tested and improved'],
   ['Others prove the concept',lvl(!!cc.sim1&&!!cc.sim2&&strong(cc.sim1data),!!cc.sim1),'Similar ventures, with evidence']];
}
function summaryBuild(el){
  const rows=score(); const tot=rows.reduce((a,r)=>a+r[1],0), max=rows.length*2;
  const verdict=tot>=13?['good','Validated: proceed']:tot>=7?['warn','Proceed with conditions']:['bad','Not validated yet'];
  const weak=rows.filter(r=>r[1]<2).map(r=>r[0].toLowerCase());
  const c=sec('customer'), m=sec('market'), b=sec('model'), p=sec('proto'); const pc=card(c.painData), mk=mkt(m), mo=money(b);
  const html=`${name()} addresses a problem confirmed by verified evidence.${pc?` ${fact(pc)}.`:''} ${mk.d?`From a total market of ${nice(mk.tam)} ${esc(mk.d.unit)} ${cite(mk.d)}, we target about ${nice(mk.som)} customers in year one, worth about ${nice(mk.rev)} AED in yearly spending.`:''} ${mo.rev?`The business model generates about ${nice(mo.rev)} AED a month against ${nice(mo.cost)} AED in costs.`:''} ${num(p.testers)?`Our prototype was tested with ${esc(p.testers)} users and improved: ${esc(p.change||'')}.`:''} Overall, the idea scores ${tot} out of ${max} on our validation scorecard: <b>${verdict[1].toLowerCase()}</b>.${weak.length?` To strengthen next: ${weak.map(w=>'“'+w+'”').join(' and ')}.`:' Every key assumption is supported by evidence.'}`;
  const refs=[...new Set([c.size,c.painData,m.tam,m.growth,sec('concept').sim1data,sec('compet').evid,b.costData].filter(Boolean))].map(card).filter(Boolean);
  const svg=P=>`<svg viewBox="0 0 640 ${rows.length*34+70}" role="img" aria-label="Validation scorecard">${rows.map((r,i)=>{ const y=20+i*34; const col=r[1]===2?P.good:r[1]===1?P.warn:P.bad; return `${T(10,y+16,r[0],P,{s:13,w:600})}${[0,1].map(j=>`<rect x="${240+j*58}" y="${y+2}" width="52" height="20" rx="4" fill="${j<r[1]?col:P.bg}" stroke="${j<r[1]?col:P.line}"/>`).join('')}${T(366,y+16,r[1]===2?'Strong':r[1]===1?'Partial':'Missing',P,{s:12,w:700,c:col})}${T(430,y+16,r[2],P,{s:10,c:P.muted})}`; }).join('')}
    <rect x="10" y="${rows.length*34+26}" width="620" height="34" rx="8" fill="${verdict[0]==='good'?P.good:verdict[0]==='warn'?P.warn:P.bad}"/>${T(320,rows.length*34+48,`${V('name')||'Venture'} · ${tot}/${max} · ${verdict[1]}`,P,{s:14,w:800,a:'middle',c:'#FFFFFF'})}</svg>`;
  el.innerHTML=`<div class="vs"><div class="vs-out"><h4 style="margin:0">Validation scorecard</h4>${svg(SCREEN)}<p class="para">${html}</p>${refs.length?`<div><h4>References used</h4><ul class="refs">${refs.map(d=>`<li>${apa(d)}</li>`).join('')}</ul></div>`:''}
    <div class="vs-tools"><button type="button" class="btn" data-l="Copy summary">Copy summary</button><button type="button" class="btn ghost" data-l="Download image">Download image</button><button type="button" class="btn ghost" data-l="Copy all drafts">Copy all drafts</button></div>
    <p class="vs-note">Each line scores 2 (strong: verified evidence), 1 (partial) or 0 (missing). Use the summary as a base for your Executive Summary, in your own words.</p></div></div>`;
  const bs=el.querySelectorAll('.vs-tools button');
  bs[0].addEventListener('click',()=>copyText(bs[0],strip(html)+(refs.length?'\n\nReferences\n'+refs.map(apaTxt).join('\n'):'')));
  bs[1].addEventListener('click',()=>downloadSVG(svg(PRINT).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '),`${(V('name')||'venture').replace(/\W+/g,'-')}-scorecard`));
  bs[2].addEventListener('click',()=>{ const parts=[CONCEPT,CUSTOMER,MARKET,COMPET,MODEL,PROTO].map(c=>`${c.title}\n${c.gen(sec(c.key)).text}`); const all=S.data; copyText(bs[2],`${V('name')} · drafts\n\n`+parts.join('\n\n')+'\n\nValidation summary\n'+strip(html)+'\n\nReferences\n'+all.map(apaTxt).sort().join('\n')); });
}

/* ---------- Rubrics (verbatim) ---------- */
const RUB_SYL={bands:['21-25 marks','17-20 marks','14-17 marks','9-13 marks','5-8 marks','1-4 marks'],rows:[
 ['Knowledge and understanding · 25 marks – 25%','',[`Thorough application of an extensive knowledge base to all aspects of the Business Plan.  Fully identifies relevant external factors and appreciates their impact.`,`Excellent application of a broad knowledge base to all areas of the Business Plan. Clear identification of external factors and their impact.`,`Has a good knowledge base and is able to apply this consistently throughout the business plan.  Identifies appropriate external factors and has an appreciation of their likely impact.`,`Has a working knowledge and generally applies this consistently to the business plan; some areas may lack coherence.  External factors may be identified, but the likely impact is not fully considered. There may be a few areas of weakness Some areas may not be fully developed.`,`Identifies knowledge related to study but lacks coherence. External factors largely identified but some confusion in application. Some weak areas, lacks development and focus.`,`Limited knowledge base with little application. External factors little considered and only limited attempt to apply to context. Inaccurate or inappropriate information.`]],
 ['Analysis · 25 marks- 25%','',[`Excellent presentation of findings relevant to assignment. A wide range of information critically analyzed and applied to justify group’s proposal. Theories relating to the business framework fully considered.`,`Clear presentation of findings relevant to assignment. A range of information critically analyzed and applied to justify group’s proposal. Theories relating to the business framework well considered.`,`A good presentation of findings relevant to the assignment.  A range of sources of information are considered, analyzed and used to justify the proposal.  There is some integration of theory into the business plan`,`A generally good presentation of the group’s findings although some areas may lack clarity.  Analysis used to develop proposal but there may be occasional inconsistencies. Analysis may not be fully developed in some areas.`,`A range of information analyzed but lacks clarity. Analysis used to develop proposal but not always consistent. Analysis insufficiently developed in some areas.`,`Little information gathered/ or irrelevant. Analysis very limited or inappropriate in most areas. Limited understanding of purpose of assignment or context of a small business.`]],
 ['Synthesis and Creativity · 25 marks – 25%','',[`Deals with business potential creatively whilst recognizing limitations.  Selects and imaginatively develops product/concept/ operation within limitations of brief. Information given fully supports proposal.`,`Has a realistic appreciation of the business potential.  Knowledge is applied creatively whilst recognizing limitations.  Selects and logically develops product/concept/ operation within limitations of brief. Information given to support proposal.`,`Has an appreciation of the potential of the business and recognizes limitations.  The product/concept/ operation developed is consistent with the information presented.  The plan conforms to the brief.`,`Well-developed proposal.  The business is recognized but may be a little unrealistic.  The product/concept/ operation proposed is generally consistent with the information presented. Information is generally considered creatively. Generally, meets the requirements of the brief.`,`Most aspects of proposal well developed and appropriate but some inconsistencies. Information creativity considered in most areas.`,`Data generally poorly interpreted. Little creativity and generally poor application.  Proposed product/ concept/operation is not justified and limited development of proposal.  Does not conform to the brief.`]],
 ['Evaluation and Validation · 25 marks – 25%','',[`Very detailed and accurate assessment of impact of proposal in light of the information gathered. Justification and viability clearly evident throughout business plan. Rigorous attention to detail.`,`Accurately assesses impact of proposal in light of the information gathered. Justification and viability evident throughout business plan and rigorous attention to detail.`,`Considers the impact of the proposal in light of the information found.  The plan is generally well justified, and the business proposal is viable.  Good attention to detail.`,`Evaluates key information well and uses this to develop a well-supported rationale for the business plan.  Proposals are well justified and there is generally good attention to detail, although a few areas could be more fully developed.`,`Appropriate evaluation of key information used to develop rationale for business plan. Justification incorporated into proposal, but some sections lack clarity.`,`Evaluation of information gathered is weak.  There is little justification of the business proposal.  The business plan is incomplete, and the proposal lacks viability/ credibility.`]]],
 foot:'Total Marks 100% · Adjusted for 40%'};
const RUB_DECK={bands:['100-80 · 19-20 marks','79-70 · 16-18 marks','69-60 · 12-15 marks','59-50 · 8-11 marks','49-40 · 4-7 marks','39-20 · 1-3 marks','19-0 · 0 marks'],rows:[
 ['KNOWLEDGE AND UNDERSTANDING · 20 marks – 20%',`This criterion demonstrates comprehensive/ detailed knowledge with specialization in depth and an awareness of the provisional nature of the state of knowledge.`,[`Extensive range, depth, and complexity of relevant material.`,`Clearly defined range and depth of relevant material in all areas.`,`Clearly defined range and depth of relevant material in most areas.`,`Comprehensive and relevant detail but lacking depth in some areas.`,`Has good working knowledge and relevant detail but lacking depth in most areas.`,`Moderate range with some relevant material, little depth.`,`Poor and limited use of relevant material.`]],
 ['APPLICATION OF KNOWLEDGE · 20 marks- 20%',`Demonstration of knowledge through the use of models/ examples.`,[`Shows detailed application of relevant concepts and theories to issues of study.`,`All relevant concepts are covered and applied and are relevant to the area of study.`,`Most relevant concepts are covered and applied and are relevant to the area of study.`,`Understands most concepts which are related to study.`,`Understands some concepts which are related to study.`,`Understands concepts but application is incomplete or inappropriate.`,`Very limited use of concepts and theories. Application is not given or considered.`]],
 ['ANALYSIS AND EVALUATION · 20 marks- 20%',`This criterion focuses on the analysis and evaluation of new and/or abstract data and situations without guidance using a wide range of techniques appropriate to the subject. Use of appropriate references to support the arguments.`,[`Well integrated study within depth original and critical analysis. In depth and critical evaluation of material. Draws detailed conclusions relevant to study.`,`Well integrated study with original and critical analysis. Critical evaluation of data. All conclusions relevant to study.`,`Largely integrated study with a good level of original and critical analysis. Critical evaluation of most data. Most conclusions relevant to study.`,`Largely integrated study with some original and critical analysis. Evaluates using selected techniques, judging value of information. Some conclusions do not follow on from data.`,`Shows an acceptable level of original and critical analysis. Evaluates using selected techniques judging value of most information.  Conclusions do not follow on from data.`,`Mainly descriptive, some level of originality and critical analysis. Unable to make judgements about relevance and significance of data.`,`Wholly descriptive. Unable to judge the value of information.`]],
 ['COMMUNICATION/ PRESENTATION · 20 marks – 20%',`This criterion focuses on the use of professional language, visualizations, format, and referencing style.`,[`Always communicates effectively and excellently in an appropriate format/ language in a clear and concise manner.`,`Always communicates effectively in an appropriate format/language in a clear and concise manner.`,`Usually communicates effectively in an appropriate format/language. Usually presents information in a clear and concise manner.`,`Usually communicates in an appropriate format/language. Usually presents information in a clear and mostly concise manner.`,`Meaning is clear and format conforms to basic requirements. May either lack detail or include a considerable amount of irrelevant material.`,`Meaning is largely clear, but use of language and format is inappropriate.`,`Does not communicate effectively. Unclear and rambling.  Does not use appropriate format/ language.`]]],
 foot:'Project 1 Part A: Report · rubric shown in the Week 5 briefing'};
const RUB_PRES={bands:['Exemplary (4 Marks)','Proficient (3 Marks)','Novice (2 Marks)','Poor (1-0 Marks)'],rows:[
 ['Content (4 Marks)','',[`Information is completely presented, and content is strongly supported and laid out`,`A good amount of information is presented, and content is well supported and laid out`,`Lack of information and content is not well supported`,`Presentation lacks any important information and lacks any content`]],
 ['Thinking and Communication (4 Marks)','',[`The presentation shows extensive work, preparation and thought in development. Presentation is excellently communicated to the audience`,`The presentation shows a good amount of work, thought and time was put into it Presentation was well communicated to the audience`,`The presentation shows a barely adequate time or thought was placed Audience not convinced by presentation`,`Very little or no real effort placed Presentation lacks form. Points are confusing`]],
 ['Illustration (4 Marks)','',[`Presentation supported by many aids and information`,`Presentation was supported by an adequate amount of material`,`Presentation not real supported by many aids at all`,`No aids were utilized in the presentation`]],
 ['Presentation (4 Marks)','',[`Excellent presentation. Clear and confident. Points clearly expressed and grasped audience attention`,`Good presentation. Clear and confident. Points are well expressed and grasped audience attention for a period of time`,`Presentation lacks substance, but points are presented. Audience somewhat bored or lost`,`Poor presentation skill. Unclear and not confident in what is being expressed. Audience uninterested`]],
 ['Question & Answers (4 Marks)','',[`Excellent response to question. Clear and confident while answering. Points clearly elaborate with logical evidence. Additional examples given in response to questions`,`Very good response to question. Clear and confident while answering. Points clearly elaborate with logical evidence.`,`Response lacking evidence to question. Not so much clear and confident while answering. Points are somewhat elaborate with reasons.`,`Poor response to question. Unclear and not confident in what is being expressed. Audience is uninterested.`]]],
 foot:'Maximum Marks (20) · Marks Adjusted to 10%'};
const rubHTML=r=>`<div class="rub">${r.rows.map(([t,d,cells],i)=>`<details ${i===0?'open':''}><summary>${t}</summary>${d?`<p class="desc">${d}</p>`:''}<dl>${cells.map((c,j)=>`<dt>${r.bands[j]}</dt><dd>${c}</dd>`).join('')}</dl></details>`).join('')}<p class="mono" style="color:var(--muted)">${r.foot}</p></div>`;
/* ================= lab additions ================= */
const DONE=k=>!!(S.done&&S.done[k]);
function tickBox(key,label){ return `<label class="ck"><input type="checkbox" data-done="${key}" ${DONE(key)?'checked':''}><span>${label}</span></label>`; }
function wireTick(el,after){ el.querySelectorAll('[data-done]').forEach(i=>i.addEventListener('change',()=>{ S.done=S.done||{}; S.done[i.dataset.done]=i.checked; save(); if(after) after(); })); }
const words=t=>String(t||'').trim().split(/\s+/).filter(Boolean).length;

/* step 1 · venture gaps */
function ventureGaps(){ const g=[]; ['name','idea','user','problem','sdg'].forEach(k=>{ if(!V(k)) g.push({name:'venture name',idea:'the idea in one sentence',user:'primary customer',problem:'the problem',sdg:'main SDG'}[k]); }); return g.length?['Fill in: '+g.join(', ')+'.']:[]; }
function dataGaps(){ const v=S.data.filter(d=>verify(d).status[0]==='good').length; const g=[]; if(S.data.length<5) g.push(`Add at least 5 data cards (you have ${S.data.length}).`); if(v<5) g.push(`Verify at least 5 cards fully (verified now: ${v}).`); return g; }

/* step 9 · learning and adaptation */
const LEARN={key:'learn',title:'Learning and Adaptation',fields:[
  ...[1,2,3,4,5].map(i=>({group:`Member ${i}`+(i>3?' (if any)':''),fields:[{id:`m${i}`,t:'text',l:'Name'},{id:`m${i}b`,t:'text',l:'Before ENT 141/142, I could not / found it hard to…'},{id:`m${i}d`,t:'text',l:'What I did in the project (a specific task or moment)'},{id:`m${i}n`,t:'text',l:'What I can do now'}]})),
  {id:'e141',t:'text',l:'What the team learned from ENT 141 that we used here'},
  {id:'verdict',t:'sel',l:'Is this idea a true opportunity?',o:['Yes','Not yet','No']},
  {id:'why',t:'area',l:'Why? Use your evidence (scorecard, data, prototype test)'}],
 gen(s){ const ms=[1,2,3,4,5].filter(i=>s['m'+i]); const gaps=[];
  if(ms.length<3) gaps.push('Every member writes their own lines (at least 3 members).');
  ms.forEach(i=>{ if(!s['m'+i+'b']||!s['m'+i+'d']||!s['m'+i+'n']) gaps.push(`${esc(s['m'+i])}: complete before / did / now.`); });
  if(!s.verdict||!s.why) gaps.push('Answer “Is this a true opportunity?” with a reason.');
  const html=ms.map(i=>`<b>${esc(s['m'+i])}:</b> before this course I ${ph(s['m'+i+'b'],'before',1)}. In the project I ${ph(s['m'+i+'d'],'what I did',1)}. Now I ${ph(s['m'+i+'n'],'what I can do now',1)}.`).join('<br>')+`<br>From ENT 141 we applied ${ph(s.e141,'ENT 141 learning',1)}. Is ${name()} a true opportunity? <b>${ph(s.verdict,'yes / not yet / no')}</b>: ${ph(s.why,'reason',1)}.`;
  return out(html,[],gaps); }};

/* step 10 · introduction + executive summary */
const INTRO={key:'intro',title:'Introduction and Executive Summary',fields:[
  {id:'process',t:'area',l:'Creative process: how did you arrive at the idea?',h:'Name the methods: e.g. empathy map, idea-selection matrix (Week 2), MVP (Week 3), prototype test (Week 5).'},
  {id:'next',t:'text',l:'Next step for the venture'}],
 gen(s){ const c=sec('customer'), pc=card(c.painData), m=mkt(sec('market')), mo=money(sec('model')), p=sec('proto'); const gaps=[];
  if(!pc) gaps.push('Finish Step 4 (Customers): the introduction opens with your problem data.');
  if(!s.process) gaps.push('Describe the creative process.');
  const intro=`${pc?fact(pc)+'. ':''}In ${ph(V('place'),'place')}, ${ph(V('problem'),'problem',1)}. Our team ${ph(s.process,'creative process',1)}. This led to ${name()}, ${ph(V('idea'),'idea')}, which supports ${sdgName()}. This report presents the concept, market, customers, competition, business model and prototype of ${name()}, and what our team learned.`;
  const iw=words(strip(intro)); if(iw>250) gaps.push(`Introduction is ${iw} words: cut to 250 or fewer.`);
  const exec=`${name()} is ${ph(V('idea'),'idea')} for ${ph(V('user'),'customer')}. ${pc?fact(pc)+'. ':''}${m.d?`From a total market of ${nice(m.tam)} ${esc(m.d.unit)} ${cite(m.d)}, we target about ${nice(m.som)} customers in year one. `:''}${mo.rev?`The model earns about ${nice(mo.rev)} AED a month against ${nice(mo.cost)} AED in costs. `:''}${num(p.testers)?`A prototype tested with ${esc(p.testers)} users led us to improve the design. `:''}The venture supports ${sdgName()}. Next step: ${ph(s.next,'next step',1)}.`;
  const html=`<b>Introduction</b> (${iw} words, limit 250)<br>${intro}<br><br><b>Executive summary</b> (one page maximum, not counted)<br>${exec}`;
  return out(html,[c.painData,sec('market').tam],gaps); }};

const REPORT_ORDER=[['Executive Summary',null,0],['Introduction','intro',250],['Concept and Vision','concept',450],['Market Analysis','market',650],['Customers and Customer Development','customer',800],['Competition and Positioning','compet',550],['Sustainable Business Model','model',550],['Prototype Development','proto',400],['Learning and Adaptation','learn',350]];
const GENS={concept:CONCEPT,customer:CUSTOMER,market:MARKET,compet:COMPET,model:MODEL,proto:PROTO,learn:LEARN,intro:INTRO};
function introParts(){ const t=INTRO.gen(sec('intro')).text; const [a,b]=t.split('Executive summary'); return {intro:a.replace(/^Introduction \(\d+ words, limit 250\)/,'').trim(),exec:(b||'').replace(/^\s*\(one page maximum, not counted\)/,'').trim()}; }

/* steps list for overview */
const STEPS=[
 ['Venture card',1,()=>ventureGaps(),'v'],
 ['Verified data',2,()=>dataGaps(),'data'],
 ['Concept and Vision',3,()=>CONCEPT.gen(sec('concept')).gaps,'concept'],
 ['Customers',4,()=>CUSTOMER.gen(sec('customer')).gaps,'customer'],
 ['Market',5,()=>MARKET.gen(sec('market')).gaps,'market'],
 ['Competition',6,()=>COMPET.gen(sec('compet')).gaps,'compet'],
 ['Business model',7,()=>MODEL.gen(sec('model')).gaps,'model'],
 ['Prototype',8,()=>PROTO.gen(sec('proto')).gaps,'proto'],
 ['Learning and Adaptation',9,()=>LEARN.gen(sec('learn')).gaps,'learn'],
 ['Introduction + summary',10,()=>INTRO.gen(sec('intro')).gaps,'intro'],
 ['Assemble and submit',11,()=>finalGaps(),'final']];
const FINAL_CHECKS=['One Word file for the whole group, with Heading styles.','Cover page: CUD logo, title, names + student IDs, course name and code, word count.','Table of contents generated in Word; page numbers match.','Drafts rewritten in our own words and expanded to about 4000 counted words.','Prototype photos inside the report, with captions.','Every number has an in-text citation; references in APA, no bare links.','Uploaded on Moodle by 27 October; presentation ready for the same day.'];
function finalGaps(){ const f=(S.final||[]); const n=FINAL_CHECKS.filter((_,i)=>f[i]).length; return n<FINAL_CHECKS.length?[`${FINAL_CHECKS.length-n} submission check(s) left.`]:[]; }
function stepState(st){ const g=st[2](); if(g.length) return ['todo',`${g.length} to fix`]; if(st[3]!=='v'&&st[3]!=='data'&&st[3]!=='final'&&!DONE(st[3])) return ['warn','paste into report']; return ['good','done']; }

function overview(el){
  el.innerHTML=`<div class="vs"><div class="req">${[['Type','Group report (4–5)'],['File','Word document'],['Length','4000 words'],['Due','Tue 27 Oct 2026 · Moodle'],['Weight','Report 40% · Pitch 10%'],['Evidence','Verified open data + prototype test']].map(([a,b])=>`<div><b>${a}</b><span>${b}</span></div>`).join('')}</div>
   <div class="tblw"><table class="tbl"><thead><tr><th>Step</th><th>You produce</th><th>Status</th></tr></thead><tbody>${STEPS.map(st=>{ const s=stepState(st); return `<tr><td><a href="#s${st[1]}" data-go="${st[1]}">${st[1]}. ${st[0]}</a></td><td>${['One-line value proposition','5+ verified data cards','Section draft + figure','Section draft + figure','Section draft + TAM/SAM/SOM figure','Section draft + positioning map','Section draft + revenue/TBL figure','Section draft + v1→v2 figure','One paragraph per member','Introduction + executive summary','Full report text, checked'][st[1]-1]}</td><td><span class="tag ${s[0]==='good'?'good':s[0]==='warn'?'warn':''}">${s[1]}</span></td></tr>`; }).join('')}</tbody></table></div>
   <p class="vs-note">Work saves in this browser. One laptop per team, or copy each draft into your team document as you go.</p></div>`;
  el.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const b=document.querySelectorAll('.toc ol li button')[+a.dataset.go]; if(b) b.click(); }));
}

/* lab builder = builder + "pasted" tick */
function labBuilder(cfg){ const b=builder(cfg); return el=>{ b(el); const o=el.querySelector('.vs');
  const t=document.createElement('div'); t.className='gate'; t.innerHTML=tickBox(cfg.key,'We rewrote this draft in our own words and pasted it, with the figure, into our report document.'); o.appendChild(t); wireTick(t); }; }

function stepData(el){
  const inner=document.createElement('div'); el.appendChild(inner); bank(inner);
  const g=document.createElement('div'); el.appendChild(g);
  const upd=()=>{ const gaps=dataGaps(); g.innerHTML=gaps.length?`<div class="vs-gaps" style="margin-top:12px"><b>To complete this step</b><ul>${gaps.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:`<div class="feedback" style="margin-top:12px"><span class="tag good">done</span> 5 or more verified data cards.</div>`; };
  upd(); new MutationObserver(upd).observe(inner,{childList:true});
}
function stepVenture(el){ const inner=document.createElement('div'); el.appendChild(inner); profile(inner); const g=document.createElement('div'); el.appendChild(g);
  const upd=()=>{ const gaps=ventureGaps(); g.innerHTML=gaps.length?`<div class="vs-gaps" style="margin-top:12px">${gaps[0]}</div>`:`<div class="feedback" style="margin-top:12px"><b>Value proposition:</b> ${esc(V('name'))} is ${esc(V('idea'))} for ${esc(V('user'))}. It addresses this problem: ${esc(V('problem'))}.</div>`; };
  el.addEventListener('input',upd); el.addEventListener('click',()=>setTimeout(upd,50)); upd(); }

function assemble(el){
  const ip=introParts(); const parts=REPORT_ORDER.map(([h,k,target])=>{ const txt=k===null?ip.exec:k==='intro'?ip.intro:GENS[k].gen(sec(k)).text; return {h,txt,target,w:words(txt)}; });
  const refs=S.data.slice().sort((a,b)=>a.org.localeCompare(b.org));
  const full=`${V('name')||'Venture'}: Social Enterprise Project\n\n`+parts.map(p=>`${p.h}\n${p.txt}`).join('\n\n')+`\n\nReferences\n`+refs.map(apaTxt).join('\n');
  const f=S.final||[];
  el.innerHTML=`<div class="vs"><div class="tblw"><table class="tbl"><thead><tr><th>Section</th><th>Draft words</th><th>Target in final report</th></tr></thead><tbody>${parts.map(p=>`<tr><td>${p.h}</td><td>${p.w}</td><td>${p.target?'≈ '+p.target+(p.h==='Introduction'?' (max)':''):'not counted · max 1 page'}</td></tr>`).join('')}<tr><td><b>References</b></td><td colspan="2">${refs.length} data source(s) in APA format</td></tr></tbody></table></div>
   <div class="vs-tools"><button type="button" class="btn" data-l="Copy the full report draft">Copy the full report draft</button></div>
   <p class="vs-note">The drafts are short on purpose: expand each one with your own analysis and figures to reach about 4000 words.</p>
   <div class="gate"><h4>Before you submit</h4>${FINAL_CHECKS.map((c,i)=>`<label class="ck"><input type="checkbox" data-f="${i}" ${f[i]?'checked':''}><span>${c}</span></label>`).join('')}</div><div id="fin-st"></div></div>`;
  const b=el.querySelector('.vs-tools button'); b.addEventListener('click',()=>copyText(b,full));
  const st=el.querySelector('#fin-st'); const upd=()=>{ const g=finalGaps(); st.innerHTML=g.length?`<p class="vs-note">${g[0]}</p>`:`<div class="feedback"><span class="tag good">ready</span> Submit on Moodle.</div>`; };
  el.querySelectorAll('[data-f]').forEach(i=>i.addEventListener('change',()=>{ S.final=S.final||[]; S.final[+i.dataset.f]=i.checked; save(); upd(); })); upd();
}

function marking(el){
  const tabs=[['Report · syllabus rubric',()=>rubHTML(RUB_SYL)],['Report · briefing rubric',()=>rubHTML(RUB_DECK)],['Presentation (1B)',()=>`<div class="brief"><p><b>1-minute</b> individual presentation + <b>2 minutes</b> Q&amp;A (7 minutes per group) · PowerPoint · same day as the report, 27 October · graded individually.</p><b>Outline</b><ol><li>Cover slide with team name, and students' names/ID numbers</li><li>Introduction of each member of the team</li><li>The Problem &amp; Solution</li><li>Market Opportunity and Innovation</li><li>Impact of the Solution</li><li>Presentation and Pitch</li></ol></div>${rubHTML(RUB_PRES)}`]];
  el.innerHTML=`<div class="seg2">${tabs.map((t,i)=>`<button type="button" data-i="${i}" aria-pressed="${i===0}">${t[0]}</button>`).join('')}</div><div id="mk"></div>`;
  const mk=el.querySelector('#mk'), bs=el.querySelectorAll('.seg2 button');
  const show=i=>{ bs.forEach((b,j)=>b.setAttribute('aria-pressed',j===i)); mk.innerHTML=tabs[i][1](); };
  bs.forEach(b=>b.addEventListener('click',()=>show(+b.dataset.i))); show(0);
}

const TASK=(task,outp,tip)=>[`<b>Task:</b> ${task}`,`<b>Output:</b> ${outp}`].concat(tip?[`<span class="mono" style="color:var(--muted)">${tip}</span>`]:[]);

if(!window.LAB_NO_MOUNT) Lecture.mount({
  id:'ent142-lab', week:'P1', course:'ENT 142', short:'Report Lab', eyebrow:'Project 1 · Report Lab', endLabel:'End of lab',
  title:'Report Lab', meta:'Social Enterprise Project · step by step',
  scenes:[
  { nav:'Overview', title:'Report Lab · 11 steps to your report', kind:'activity', full:true,
    narration:TASK('Register your team, then work through the steps in order. Each step ends with a draft section and a check.','A complete, evidence-based report draft.').concat([`${window.ENT142_REG?`<a class="btn" href="${window.ENT142_REG}" target="_blank" rel="noopener">Register your team (CUD account) →</a>`:`<span class="tag">Team registration link: coming soon</span>`}`]),
    fig:{label:'Requirements · your progress', build:overview} },

  { nav:'1 · Venture card', title:'Step 1 · Venture card', kind:'activity', minutes:10, full:true,
    narration:TASK('Describe your venture in five fields.','Your one-line value proposition.','Exploring first? Load the example: a fictional venture with real data.'),
    fig:{label:'Venture card', build:stepVenture} },

  { nav:'2 · Verified data', title:'Step 2 · Collect verified data', kind:'activity', minutes:30, full:true,
    narration:[
     `<b>Task:</b> find at least 5 numbers about your problem, customers and market on trusted sites. Add each as a data card.`,
     `<b>Where:</b> UAE: fcsc.gov.ae · bayanat.ae · Dubai Data and Statistics Establishment · scad.gov.ae · ministries (*.gov.ae). World: data.worldbank.org · unstats.un.org/sdgs/dataportal · unep.org · who.int/data · ourworldindata.org. Research: Google Scholar, CUD library.`,
     `<b>Search:</b> <code>food waste site:gov.ae</code> · <code>"statistical yearbook" Dubai filetype:pdf</code>. News and Wikipedia only to find the original source. Chatbots are not sources.`,
     `<b>Verify:</b> who published it · year of the data · how it was measured · original page · a second source agrees.`],
    fig:{label:'Evidence bank', build:stepData} },

  { nav:'3 · Concept', title:'Step 3 · Concept and Vision', kind:'activity', minutes:20, full:true,
    narration:TASK('Answer the questions. Name two similar ventures and link one data card.','Concept and Vision draft + problem → solution → impact figure.'),
    fig:{label:'Concept and Vision', build:labBuilder(CONCEPT)} },

  { nav:'4 · Customers', title:'Step 4 · Customers and Customer Development', kind:'activity', minutes:25, full:true,
    narration:TASK('Describe your customer, link one card for how many people are affected and one for how serious the problem is, then show assumption → evidence → change.','Customer draft + customer profile figure.'),
    fig:{label:'Customers', build:labBuilder(CUSTOMER)} },

  { nav:'5 · Market', title:'Step 5 · Market Analysis', kind:'activity', minutes:25, full:true,
    narration:TASK('Pick a verified total (TAM), set SAM % and SOM %, and the yearly spend per customer. Label assumptions.','Market draft + TAM/SAM/SOM figure with year-1 value.'),
    fig:{label:'Market', build:labBuilder(MARKET)} },

  { nav:'6 · Competition', title:'Step 6 · Competition and Positioning', kind:'activity', minutes:25, full:true,
    narration:TASK('List 3 competitors (direct, indirect, substitute). Score everyone 1–5 on two things customers care about.','Competition draft + positioning map.'),
    fig:{label:'Competition', build:labBuilder(COMPET)} },

  { nav:'7 · Business model', title:'Step 7 · Sustainable Business Model', kind:'activity', minutes:25, full:true,
    narration:TASK('Enter who pays, prices, monthly volumes and costs, one people and one planet indicator, and your biggest risk.','Business model draft + revenue vs cost and triple-bottom-line figure.'),
    fig:{label:'Business model', build:labBuilder(MODEL)} },

  { nav:'8 · Prototype', title:'Step 8 · Prototype Development', kind:'activity', minutes:15, full:true,
    narration:TASK('Report your Week 5 prototype: assumption, test, result, version 2. Unsure of the technique? Use the <a href="week-05.html#s3">Prototype Helper</a>.','Prototype draft + v1 → test → v2 figure.'),
    fig:{label:'Prototype', build:labBuilder(PROTO)} },

  { nav:'9 · Learning', title:'Step 9 · Learning and Adaptation', kind:'activity', minutes:20, full:true,
    narration:TASK('Each member completes their own three lines. Then answer as a team: is this a true opportunity?','One paragraph per member + team verdict.'),
    fig:{label:'Learning and Adaptation', build:labBuilder(LEARN)} },

  { nav:'10 · Intro + summary', title:'Step 10 · Introduction and Executive Summary', kind:'activity', minutes:15, full:true,
    narration:TASK('Describe your creative process and next step. The rest is built from Steps 1–9.','Introduction (max 250 words) + executive summary (max 1 page).'),
    fig:{label:'Introduction and Executive Summary', build:labBuilder(INTRO)} },

  { nav:'11 · Assemble', title:'Step 11 · Assemble, check and submit', kind:'check', minutes:20, full:true,
    narration:TASK('Copy the full draft into Word in the brief\'s order, expand it to about 4000 words, add cover page and contents, and tick every check.','Your submitted report.'),
    fig:{label:'Report draft · final checks', build:assemble} },

  { nav:'Scorecard', title:'Validation scorecard', kind:'review', full:true,
    narration:TASK('Read your score. Strengthen any red or amber line before you submit.','Evidence for “Is this a true opportunity?” (Step 9).'),
    fig:{label:'Scorecard', build:summaryBuild} },

  { nav:'Marking', title:'How it is marked', kind:'review', full:true,
    narration:[`Rubrics as written in the syllabus and the Week 5 briefing, plus the presentation brief.`],
    fig:{label:'Rubrics', build:marking} }
  ]
});
