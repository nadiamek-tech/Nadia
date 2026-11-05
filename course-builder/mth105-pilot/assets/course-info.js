/* MTH 105 · course settings for the course portal (assets/portal.js).
   To update the site, edit only this file. Empty links show "coming soon" until you paste them. */
window.COURSE={
  code:'MTH 105', title:['Introduction to','Statistics'], eyebrow:'MTH 105 · Fall 2026 · 3 credit hours · on campus',
  instructor:'Eng. Nadia Mek',
  pages:{lectures:'lectures.html', labs:'lab.html', exams:'exams.html'},
  blurbs:{lectures:'Notes to review each class: formulas step by step, practice, calculator.', labs:'Excel workbooks with step-by-step guides.', exams:'Dates, what each exam includes, revision.'},

  links:{
    booking:'',     /* optional booking page; empty = students email to book */
    moodle:''
  },
  /* email, office hours, schedule, portal and form links come from assets/professor.js */

  ask:()=>window.MTH105Assistant&&MTH105Assistant.open(),
  search:q=>{ const A=window.MTH105Assistant; if(!A||!A.search) return []; const r=A.search(q);
    return r.kb.slice(0,3).map(x=>({t:x.e.q,s:x.e.a,l:x.e.l})).concat(r.idx.slice(0,4).map(x=>({t:x.e.pt+' · '+x.e.n,s:x.e.t,l:x.e.l}))); },

  /* assessments: type is Lecture or Lab. date is the start, Dubai time. submit = Moodle submission. */
  assess:[
    {id:'quiz1',name:'Quiz 1',type:'Lecture',weight:'10%',when:'End of Week 5',covers:['Weeks 1–5: describing data, centre and spread, probability'],clos:'1, 2',format:'In class, on paper'},
    {id:'mid',name:'Midterm Examination',short:'Midterm',type:'Lecture',weight:'20%',date:'2026-10-19T09:30:00+04:00',timeText:'9:30–11:00 AM',place:'HUB-Yard Zones A, B, D',
      covers:['Section 1 · Descriptive statistics: graphs, centre, spread','Section 2 · Probability: rules, tree diagrams, discrete distributions','Weeks 1–7'],
      format:'In class, on paper · 90 minutes · closed book · standard calculator · no phones',clos:'1, 2',revise:[['Midterm revision','midterm-practice.html']]},
    {id:'quiz2',name:'Quiz 2',type:'Lecture',weight:'10%',when:'End of Week 12',covers:['Sampling distributions and confidence intervals','Contingency tables and chi-square'],clos:'3, 4',format:'In class, on paper'},
    {id:'proj',name:'Lab Project',short:'Lab project',type:'Lab',weight:'20%',when:'Due end of Week 14',covers:['Excel analysis of a data set across the lab topics','Upload your workbook on Moodle'],clos:'1–5',
      submit:{link:'',due:'',dueText:'End of Week 14'},revise:[['Lab guides','lab.html']]},
    {id:'labq',name:'Lab Quiz',short:'Lab quiz',type:'Lab',weight:'10%',when:'End of Week 15',format:'In the computer lab, in Excel',covers:['Excel skills from the labs: descriptive statistics, confidence intervals, correlation, regression'],clos:'1, 3, 5',
      submit:{link:'',due:'',dueText:'End of Week 15'},revise:[['Lab guides','lab.html']]},
    {id:'final',name:'Final Examination',short:'Final',type:'Lecture',weight:'30%',when:'Week 16 · date from the Registrar',covers:['Whole course, more weight on the material after the midterm'],format:'In class, on paper · closed book · standard calculator',clos:'2–5'}
  ],

  /* semester calendar: [title, link] (no link = not open yet) */
  weeks:[
    {w:'1', lec:['Introduction to Statistics','week-01.html'], lab:['Getting started with data and Excel','lab.html#lab-01']},
    {w:'2', lec:['Describing and organizing data','week-02.html'], lab:['Questions and variables','lab.html#lab-02']},
    {w:'3', lec:['Central tendency and position','week-03.html'], lab:['Visualizing data','lab.html#lab-03']},
    {w:'4', lec:['Measures of dispersion','week-04.html'], lab:['Descriptive statistics in Excel','lab.html#lab-04']},
    {w:'5', lec:['Probability theory','week-05.html'], lab:['Data cleaning and coding','lab.html#lab-05'], ev:['quiz1']},
    {w:'6', lec:['Discrete random variables','week-06.html'], lab:['Probability and discrete distributions','lab.html#lab-06']},
    {w:'7', lec:['Bernoulli and binomial distributions','week-07.html'], lab:['Binomial distribution in Excel','lab.html#lab-07']},
    {w:'8', lec:['The normal distribution','week-08.html'], lab:['Normal distribution and z-scores','lab.html#lab-08'], ev:['mid']},
    {w:'9', lec:'The standard normal distribution · z-scores', lab:['Central Limit Theorem in Excel','lab.html#lab-09']},
    {w:'10', lec:'Sampling distribution of the mean', lab:['Confidence intervals','lab.html#lab-10']},
    {w:'11', lec:'Confidence intervals', lab:['Confidence intervals','lab.html#lab-10']},
    {w:'12', lec:'Contingency tables · chi-square', lab:['Chi-square test in Excel','lab.html#lab-12'], ev:['quiz2']},
    {w:'13', lec:'Correlation and regression line', lab:['Correlation analysis','lab.html#lab-13']},
    {w:'14', lec:'Simple linear regression', lab:['Simple linear regression','lab.html#lab-14'], ev:['proj']},
    {w:'15', lec:'Interpreting regression', lab:['Simple linear regression','lab.html#lab-14'], ev:['labq']},
    {w:'16', lec:'Final examination period', ev:['final']}
  ],

  clos:[
    ['CLO 1','Explain data sets graphically, in tabular form, and through sample statistics.'],
    ['CLO 2','Interpret the computed probabilities using popular discrete and continuous probability distributions.'],
    ['CLO 3','Analyze sample statistics to estimate population parameters and construct confidence intervals.'],
    ['CLO 4','Assess simple hypotheses testing to determine statistical significance.'],
    ['CLO 5','Create models for simple linear regression and critically interpret their coefficients.']
  ],

  faqExtra:[
    ['What is the textbook?','Gould, Ryan &amp; Wong (2020) <i>Introductory Statistics: Exploring the World Through Data</i>, 3rd edition.'],
    ['What is the grading scale?','90–100 A+ · 80–89 A · 75–79 B+ · 70–74 B · 65–69 C+ · 60–64 C · 55–59 D+ · 50–54 D · below 50 F.'],
    ['What about academic integrity?','Cheating and plagiarism are sanctioned as per the CUD Academic Integrity Policy. Turnitin similarity must stay under 20%.']
  ]
};
