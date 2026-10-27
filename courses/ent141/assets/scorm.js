/* Minimal SCORM 1.2 hook: marks the course as opened/completed in Moodle. Does nothing outside an LMS. */
(function(){
  function findAPI(w){ let n=0; while(w&&n<10){ try{ if(w.API) return w.API; }catch(e){} if(w.parent===w) break; w=w.parent; n++; } try{ if(window.opener&&window.opener.API) return window.opener.API; }catch(e){} return null; }
  const api=findAPI(window); if(!api) return;
  try{ api.LMSInitialize(''); const s=api.LMSGetValue('cmi.core.lesson_status'); if(s!=='completed'&&s!=='passed'){ api.LMSSetValue('cmi.core.lesson_status','completed'); } api.LMSCommit(''); }catch(e){}
  addEventListener('pagehide',()=>{ try{ api.LMSFinish(''); }catch(e){} });
})();
