/* Prototype Helper: a rule-based chat that recommends a prototype type.
   It answers ONLY from the ENT 142 Week 5 lecture (Prototyping). No AI, no internet.
   Usage: ProtoBot(el) */
(function(){
  const css=`
.pb{display:grid;gap:10px;font-family:var(--f-display)}
.pb-log{display:flex;flex-direction:column;gap:8px;max-height:460px;overflow-y:auto;padding:4px 2px;scroll-behavior:smooth}
.pb-msg{max-width:88%;padding:9px 12px;border-radius:12px;font-size:.92rem;line-height:1.45;min-width:0;overflow-wrap:anywhere}
.pb-msg.bot{align-self:flex-start;background:var(--sunk);border-bottom-left-radius:4px}
.pb-msg.me{align-self:flex-end;background:var(--wk);color:var(--on-wk);border-bottom-right-radius:4px}
.pb-msg ul{margin:.3em 0 0;padding-left:1.1em}
.pb-msg .pb-src{display:block;margin-top:6px;font-family:var(--f-mono);font-size:.7rem;color:var(--muted)}
.pb-card{align-self:stretch;max-width:100%;background:var(--surface);border:1px solid var(--wk);border-radius:12px;padding:12px 14px;font-size:.92rem}
.pb-card h5{margin:0 0 2px;font-size:1.2rem;color:var(--wk);font-family:var(--f-display)}
.pb-card h6{margin:10px 0 2px;font-family:var(--f-mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:400}
.pb-card p{margin:0}
.pb-card ul{margin:0;padding-left:1.1em}
.pb-quick{display:flex;flex-wrap:wrap;gap:6px}
.pb-quick button{text-align:left;border:1px solid var(--wk);background:var(--wk-soft);color:var(--ink);border-radius:999px;padding:6px 12px;cursor:pointer;font:inherit;font-size:.86rem}
.pb-quick button:hover{background:var(--wk);color:var(--on-wk)}
.pb-in{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}
.pb-in input{min-width:0;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);font:inherit;font-size:.92rem}
.pb-note{font-family:var(--f-mono);font-size:.7rem;color:var(--muted);margin:0}
.pb-dots{display:inline-flex;gap:3px}.pb-dots i{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:pbd 1s infinite}
.pb-dots i:nth-child(2){animation-delay:.15s}.pb-dots i:nth-child(3){animation-delay:.3s}
@keyframes pbd{0%,80%,100%{opacity:.3}40%{opacity:1}}
@media (prefers-reduced-motion:reduce){.pb-dots i{animation:none}.pb-log{scroll-behavior:auto}}`;
  if(!document.getElementById('pb-css')){ const s=document.createElement('style'); s.id='pb-css'; s.textContent=css; document.head.appendChild(s); }

  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const SRC='Source: ENT 142 Week 5 lecture · Prototyping';

  /* ---- Knowledge: only what the Week 5 lecture teaches ---- */
  const TYPES={
    digital:{label:'Digital app or website',words:['app','application','website','web','platform','online','portal','software','dashboard','digital','whatsapp','instagram','tiktok','marketplace','booking','chatbot','game']},
    physical:{label:'Physical product',words:['product','bottle','box','bag','device','furniture','bench','packaging','material','wearable','clothing','kit','container','toy','made from','recycled','fibre','fiber','plastic','cup','filter','tool','station','bin','shelter']},
    service:{label:'Service or experience',words:['service','tutoring','tutor','mentoring','mentor','delivery','workshop','training','program','programme','volunteer','event','club','community','support','care','visit','class','course','consulting','collection','pickup','pick-up','rental','sharing']},
    tech:{label:'New technology',words:['sensor','iot','ai','artificial intelligence','machine learning','solar','robot','smart','automatic','automated','battery','drone','3d print','algorithm','blockchain','vr','ar']},
    campaign:{label:'Awareness campaign',words:['campaign','awareness','poster','social media','video','brand','advert','message','petition','media']}
  };
  // From the slide "Choose the prototype that answers your question"
  const NEEDS={
    looks:{q:'How it looks',tech:'Sketch / mock-up'},
    interact:{q:'How users interact with it',tech:'Paper / digital prototype'},
    physical:{q:'Whether the physical product works',tech:'Physical model'},
    service:{q:'How the service runs',tech:'Storyboard / role-play'},
    tech:{q:'Whether the technology works',tech:'Functional demo'},
    journey:{q:'The user journey from start to end',tech:'Storyboard'}
  };
  const SUGGEST_NEED={digital:'interact',physical:'physical',service:'service',tech:'tech',campaign:'looks'};
  const BUILD={
    'Sketch / mock-up':{how:['Sketch 2–3 versions on paper in 10 minutes each.','Pick the best and make a cleaner mock-up in Canva or slides.'],mat:'paper, pens, Canva, slides',test:'Show it to 5 people for 10 seconds, then ask: “What is this, and who is it for?”',case:null},
    'Paper / digital prototype':{how:['Draw each screen on paper or a sticky note (start with 3 screens).','A user “taps” with a finger; a teammate swaps the paper screen.','When the flow works, rebuild it as clickable screens in Canva, slides or Figma (free plan).'],mat:'paper, sticky notes, Canva, slides, Figma (free)',test:'Give 5 users one task (e.g. “book a pickup”). Do not help. Note where they get stuck.',case:'Dropbox: a short demo video showed how the product would work; the beta waiting list grew from 5,000 to 75,000 overnight.'},
    'Physical model':{how:['Build a rough model at about real size from cardboard, foam or LEGO.','Focus on size, shape and how people hold or use it, not on looks.','Upgrade to a 3D print only after the rough model teaches you all it can.'],mat:'cardboard, foam, tape, LEGO, 3D print later',test:'Let 5 users hold and use it for a real task. Watch what they do before they say anything.',case:'PalmPilot: Jeff Hawkins carried a wooden model in his pocket, used a chopstick as a stylus, and counted the steps for common tasks.'},
    'Storyboard / role-play':{how:['Draw 4–6 frames: the user before, during and after the service.','Then act it out: one teammate is the user, others play the service.','Run the service by hand for a few real users before building any system.'],mat:'paper, a phone, a table, real people',test:'Run the service for 3–5 real users. Time each step and note where it breaks.',case:'Zappos: the founder photographed shoes in local stores and posted them online; when someone ordered, he bought and shipped the pair by hand.'},
    'Functional demo':{how:['Build the smallest version that really works, with only one feature.','Fake everything else (Wizard of Oz: a person does it behind the scenes).','Show it working once, end to end.'],mat:'a simple kit, a spreadsheet, a free no-code tool, a teammate behind the scenes',test:'Let 5 users try the one working feature. Record whether it works and whether they care.',case:'Embrace infant warmer: early prototypes tested whether a heated pouch could keep a baby warm for hours without electricity.'},
    'Storyboard':{how:['Draw 4–6 comic-style frames from the user\'s point of view.','Show the moment of the problem, finding your solution, using it, and the result.','Add one sentence under each frame.'],mat:'paper, pens, or Canva',test:'Show it to 5 users and ask them to retell the story in their words. Where they hesitate is where your journey is unclear.',case:'Embrace: observing rural families in Nepal changed the journey, so the team added a home model for mothers.'}
  };
  const FIDELITY={
    today:'You have under an hour: stay <b>low fidelity</b> (paper, sketch, role-play). Fast and free.',
    week:'You have a week: start low fidelity, test, then build one improved version 2.',
    long:'You have more time: still start low. Climb the fidelity ladder only when the cheap version has taught you all it can.'
  };
  const FAQ=[
    {k:['what is a prototype','define prototype','prototype mean','meaning of prototype'],a:'A <b>prototype</b> is a simple representation of your solution that lets you <b>see</b> it, <b>explain</b> it and <b>test</b> it before you fully develop it. The goal is not perfection. The goal is learning.'},
    {k:['fidelity','low fi','high fi','lo-fi','hi-fi'],a:'<b>Low fidelity</b> = rough, fast, cheap (sketch, paper screens, role-play). <b>High fidelity</b> = closer to the real product (clickable mock-up, working demo), slower and more costly. Start low; climb only when needed.'},
    {k:['how many','number of users','how many people','test with'],a:'The lecture suggests testing with about <b>5 real users</b> (not teammates). Watch what they do, not only what they say.'},
    {k:['technique','types','kinds','options'],a:'Six techniques: <b>Sketch</b> (show the idea) · <b>Storyboard</b> (show the user journey) · <b>Paper</b> (simulate interaction) · <b>Digital</b> (show screens) · <b>Physical</b> (show the product) · <b>Role-play</b> (simulate the service).'},
    {k:['assumption','biggest assumption','riskiest'],a:'Your <b>biggest assumption</b> is the thing that must be true for your idea to work (e.g. “cafés will list food every evening”). Choose the prototype that tests that assumption first.'},
    {k:['project 1','report','evidence'],a:'Your prototype becomes evidence in the <b>Prototype Development</b> section of Project 1: show photos, the assumption it tested, who tested it, what happened and what changed in version 2.'},
    {k:['material','tools','canva','figma','what can i use','cardboard'],a:'Build it with what you have: <b>paper · Canva · slides · cardboard · mock-up · role-play</b>. Prefer free tools.'},
    {k:['palm','palmpilot'],a:'Jeff Hawkins tested the PalmPilot design with a wooden model and a chopstick stylus, took pretend notes in meetings, and counted the steps for common tasks.'},
    {k:['dropbox'],a:'Dropbox\'s founder made a short demo video of the product; he said the beta waiting list went from 5,000 to 75,000 overnight. It tested demand before the product was finished.'},
    {k:['zappos'],a:'Zappos tested online shoe selling by photographing shoes in stores and buying and shipping each order by hand: the service was simulated before any system existed.'},
    {k:['embrace','incubator','infant'],a:'Embrace (Stanford, 2007): a low-cost infant warmer, designed to cost about $200 versus up to $20,000 for an incubator. Field observation in Nepal led to a home model for rural mothers.'}
  ];

  window.ProtoBot=function(el){
    const box=document.createElement('div'); box.className='pb';
    box.innerHTML=`<div class="pb-log" role="log" aria-live="polite"></div><div class="pb-quick"></div>
      <form class="pb-in"><input type="text" id="pb-text" aria-label="Type your message" placeholder="Describe your idea…" autocomplete="off"><button class="btn" type="submit">Send</button></form>
      <p class="pb-note">Prototype Helper uses fixed rules from the Week 5 lecture only. It is not AI and does not search the internet. Check your choice with your instructor.</p>`;
    el.appendChild(box);
    const log=box.querySelector('.pb-log'), quick=box.querySelector('.pb-quick'), form=box.querySelector('form'), input=box.querySelector('#pb-text');
    const st={idea:'',type:null,need:null,time:null,stage:'idea'};

    const add=(html,who='bot',cls='')=>{ const d=document.createElement('div'); d.className=(cls||'pb-msg '+who); d.innerHTML=html; log.appendChild(d); log.scrollTop=log.scrollHeight; return d; };
    const say=(html,after,cls)=>{ const t=add('<span class="pb-dots"><i></i><i></i><i></i></span>'); setTimeout(()=>{ t.remove(); add(html,'bot',cls); if(after) after(); },450); };
    const chips=(opts)=>{ quick.innerHTML=''; opts.forEach(([label,fn])=>{ const b=document.createElement('button'); b.type='button'; b.textContent=label; b.addEventListener('click',()=>{ add(esc(label),'me'); quick.innerHTML=''; fn(); }); quick.appendChild(b); }); };

    function guessType(t){ t=' '+t.toLowerCase()+' '; let best=null,score=0; for(const k in TYPES){ const s=TYPES[k].words.filter(w=>new RegExp('[^a-z]'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^a-z]').test(t)).length; if(s>score){score=s;best=k;} } return best; }
    function faq(t){ t=t.toLowerCase(); return FAQ.find(f=>f.k.some(k=>t.includes(k))); }

    function askType(){
      st.stage='type';
      const g=st.type;
      say(g?`It sounds like a <b>${TYPES[g].label.toLowerCase()}</b>. Is that right? If not, choose the closest type.`:`Which of these is closest to your idea?`,()=>chips(Object.keys(TYPES).map(k=>[TYPES[k].label+(k===g?' ✓':''),()=>{ st.type=k; askNeed(); }])));
    }
    function askNeed(){
      st.stage='need';
      const s=SUGGEST_NEED[st.type];
      say(`What is the <b>biggest thing your team needs to learn</b> right now? Think of your biggest assumption: the thing that must be true for the idea to work.<br><span class="pb-src">For a ${esc(TYPES[st.type].label.toLowerCase())}, teams often start with: “${esc(NEEDS[s].q)}”.</span>`,()=>chips(Object.keys(NEEDS).map(k=>[NEEDS[k].q,()=>{ st.need=k; askTime(); }])));
    }
    function askTime(){
      st.stage='time';
      say(`How much time do you have to build the first version?`,()=>chips([['Today, under 1 hour',()=>{st.time='today';recommend();}],['This week',()=>{st.time='week';recommend();}],['Two weeks or more',()=>{st.time='long';recommend();}]]));
    }
    function recommend(){
      st.stage='done';
      const tech=NEEDS[st.need].tech, b=BUILD[tech];
      const mismatch=st.type==='service'&&!/Storyboard/.test(tech);
      const html=`<span class="eyebrow">Recommended first prototype</span><h5>${esc(tech)}</h5>
        <p>You need to learn <b>${esc(NEEDS[st.need].q.toLowerCase())}</b>, so the lecture's rule is: <b>${esc(NEEDS[st.need].q)} → ${esc(tech)}</b>.</p>
        <h6>How to build it</h6><ul>${b.how.map(x=>`<li>${x}</li>`).join('')}</ul>
        <p style="margin-top:8px"><b>Remember:</b> there is no single right type. Pick the fastest, cheapest, easiest version that tests this assumption and your SDG impact.</p>
        <h6>Materials</h6><p>${esc(b.mat)}${tech==='Physical model'?'. Quick 3D look: Meshy AI or Tinkercad (free).':''}</p>
        <h6>How to test it</h6><p>${esc(b.test)}</p>
        <h6>Fidelity</h6><p>${FIDELITY[st.time]}</p>
        ${b.case?`<h6>Example from the lecture</h6><p>${esc(b.case)}</p>`:''}
        ${mismatch?`<h6>Note</h6><p>Your idea is a service, so also storyboard the user journey.</p>`:''}
        <h6>For Project 1</h6><p>Take photos of every version and write down what testers did. This becomes your Prototype Development evidence.</p>
        <div class="row" style="margin-top:10px"><button type="button" class="btn ghost pb-copy">Copy this plan</button></div>
        <span class="pb-src">${SRC} · slide “Choose the prototype that answers your question”</span>`;
      say(html,()=>{
        const card=log.lastElementChild; const btn=card.querySelector('.pb-copy');
        const txt=`Prototype plan\nIdea: ${st.idea}\nType: ${TYPES[st.type].label}\nWe need to learn: ${NEEDS[st.need].q}\nFirst prototype: ${tech}\nHow: ${b.how.join(' ')}\nMaterials: ${b.mat}\nTest: ${b.test}`;
        btn.addEventListener('click',()=>{ const ok=()=>btn.textContent='Copied'; const fail=()=>{ btn.textContent='Copy blocked: select the plan text above'; }; try{ navigator.clipboard.writeText(txt).then(ok,fail);}catch(e){fail();} });
        chips([['Try another idea',restart],['Choose a different need',()=>askNeed()],['What is fidelity?',()=>answer('fidelity')],['How many users should test it?',()=>answer('how many')]]);
      },'pb-card');
    }
    function answer(t){
      const f=faq(t);
      if(f) say(f.a+`<span class="pb-src">${SRC}</span>`);
      else say(`I can only answer from the Week 5 lecture on prototyping. Try asking about: <i>what a prototype is, the six techniques, fidelity, your biggest assumption, materials, how many users to test with, or the PalmPilot, Dropbox, Zappos and Embrace cases</i>. Or type <b>new idea</b> to start again.`);
    }
    const EX=['An app that lets campus cafés sell surplus meals to students at a discount','A reusable lunch box made from date-palm fibre for university students','A weekend tutoring service where university students teach coding to refugee children','A smart sensor that tells building managers when water is leaking','A social media campaign to cut single-use plastic bottles on campus'];
    function examples(){ quick.innerHTML='<span class="pb-note" style="width:100%">Click an example to load it, then edit it:</span>'; EX.forEach(t=>{ const b=document.createElement('button'); b.type='button'; b.textContent=t; b.addEventListener('click',()=>{ input.value=t; input.focus(); input.setSelectionRange(t.length,t.length); }); quick.appendChild(b); }); }
    function restart(){ st.idea='';st.type=null;st.need=null;st.time=null;st.stage='idea'; say(`Describe your idea in one or two sentences: <b>what</b> it is and <b>who</b> it is for.`,examples); input.focus(); }

    form.addEventListener('submit',e=>{
      e.preventDefault(); const t=input.value.trim(); if(!t) return; input.value=''; add(esc(t),'me'); quick.innerHTML='';
      if(/^(new idea|restart|start again|reset)$/i.test(t)) return restart();
      if(st.stage==='idea'){
        const f=faq(t); const looksQ=/\?\s*$/.test(t)||/^(what|how|why|which|who|when|can|should|do|is)\b/i.test(t);
        if(looksQ && f) return answer(t);
        if(t.split(/\s+/).length<4) return say(`Tell me a bit more: <b>what</b> is the idea and <b>who</b> is it for? (e.g. “An app that lets cafés sell surplus meals to students at a discount.”)`);
        st.idea=t; st.type=guessType(t); return askType();
      }
      answer(t);
    });

    add(`Hi! I'm the <b>Prototype Helper</b>. Describe your team's idea and I'll suggest the best <b>first prototype</b>, using what we covered in the Week 5 lecture.`);
    add(`Describe your idea in one or two sentences: <b>what</b> it is and <b>who</b> it is for.`);
    examples();
  };
})();
