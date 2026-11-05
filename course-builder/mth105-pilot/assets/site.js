/* Shared menu (same look as assets/portal.js header): MTH 105 · Introduction to Statistics · Home · Lectures · Labs · Exams · Theme.
   Put <div id="hub" data-cur="lectures"></div> first in <body>; styles are in assets/portal.css. */
(function(){
  const el=document.getElementById('hub'); if(!el||el.children.length) return; const cur=el.dataset.cur||'home';
  const L=[['index.html','Home','home'],['lectures.html','Lectures','lectures'],['lab.html','Labs','lab'],['exams.html','Exams','exams']];
  el.className='pt-hub'; el.innerHTML=`<div class="pt-hub-in"><a class="crs" href="index.html"><b>MTH 105</b><span>Introduction to Statistics</span></a><nav aria-label="Course">${L.map(([h,t,k])=>`<a href="${h}"${k===cur?' aria-current="page"':''}>${t}</a>`).join('')}</nav><button type="button" class="pt-theme" title="Light or dark">◐ Theme</button></div>`;
  el.querySelector('.pt-theme').addEventListener('click',()=>window.GED102Theme&&GED102Theme.toggle());
})();
