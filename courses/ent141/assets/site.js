/* ENT 141 · course settings. This is the only file to edit for dates, links and contact details.
   Empty strings show "to be announced" on the site. */
window.SITE={
  code:'ENT 141', title:'Innovation & Entrepreneurship 1', subtitle:'from a real problem to an idea you can defend',
  meta:'1-2-2 · 1-hour lecture + 2-hour lab · Year 1', logo:false,
  instructor:'Eng. Nadia Mek',
  contact:{email:'', hours:'', room:'', booking:''},
  portal:'',            /* student portal link (grades) */
  reg:'',               /* team registration form link */
  moodle:'',            /* Moodle course page */
  buttons:[['Lectures','lectures.html'],['Labs','lab.html'],['Assignments','assignments.html']],
  clos:[
    ['CLO 1','Explain the basic concepts of innovation, entrepreneurship, and sustainability, and their value to the society and economy.'],
    ['CLO 2','Demonstrate skills of effective teamwork and presentation.'],
    ['CLO 3','Evaluate ideas and viable opportunities using the design thinking process.'],
    ['CLO 4','Identify key elements of the sustainability framework in the proposed innovative opportunities.']],
  /* assessments: id, name, weight, week, date ('' = on Moodle), type, who, what is included, Moodle submission link */
  assess:[
    {id:'a1',name:'Activity 1 · Video pitch',weight:10,week:4,date:'',type:'In-class activity',who:'Individual',
     includes:['30–45 second video pitch on the topic your instructor assigns','Posted on the Moodle forum before the deadline'],guide:'week-04.html#s5',moodle:''},
    {id:'p1',name:'Project 1 · Poster',weight:30,week:9,date:'',type:'Project',who:'Team',
     includes:['Empathy map and journey map from your interviews','“How might we…” questions','At least 3 solutions (risky, easy, favourite) and your choice','Prototype (drawing or design)'],guide:'project-1.html',moodle:''},
    {id:'p1p',name:'Project 1 · Presentation',weight:10,week:9,date:'',type:'Presentation',who:'Graded individually',
     includes:['Present the poster with your team','Answer the panel’s questions'],guide:'project-1.html#s10',moodle:''},
    {id:'a2',name:'Activity 2 · Article or case',weight:10,week:11,date:'',type:'In-class activity',who:'Individual',
     includes:['Analysis of a journal article or case study assigned by the instructor','Requirements published later'],guide:'',moodle:''},
    {id:'p2',name:'Project 2 · Idea Validation Report',weight:40,week:16,date:'',type:'Project',who:'Team',
     includes:['Three social innovation ideas','Market analysis, idea evaluation and selection','Requirements published later'],guide:'',moodle:''}],
  /* weeks: n, title, subtopics, reading, page ('' = in preparation) */
  weeks:[
    [1,'Overview of the Course · Introduction to Entrepreneurship',['Course Material','Course Assignments','Groups formation','What is Entrepreneurship?','Role of Entrepreneurs in the Society'],'Byers et al (2019) Ch. 1','week-01.html'],
    [2,'Introduction to Innovation · Introduction to Creativity',['What is Innovative Thinking','Innovation V/S Invention','What is Creativity?','How is creativity linked to innovative thinking and entrepreneurship?'],'Byers et al (2019) Ch. 8, Lubberink et al (2017)','week-02.html'],
    [3,'Introduction to Sustainability',['The Triple Bottom-line Framework','United Nations Sustainable Development Goals','Understanding Sustainable Entrepreneurship','Sustainability in the UAE'],'Pradeep and Shaw (2022) Ch. 1, Krzymowski, (2020)','week-03.html'],
    [4,'Design Thinking Process (DTP) for Sustainable Innovation',['Introduction to Design Thinking Process','Building an Innovative Mindset'],'Kummitha (2019)','week-04.html'],
    [5,'DTP Step 1: Empathy',['Empathy Map','Journey Map'],'Ch. 2, Stanford DPG','week-05.html'],
    [6,'DTP Step 2: Defining',['Primary Data Collection Methods','How Might We (HMW) Questions','Problem Definition & Sustainability'],'Byers et al (2019) Ch. 2, Stanford DPG','week-06.html'],
    [7,'DTP Step 3: Ideation',['What is Ideation?','Ideation Methods and Techniques'],'Byers et al (2019) Ch. 2,3, Stanford DPG',''],
    [8,'Idea Evaluation',['Assessing the Ideas – Risky, Easy, and Favorite','How to align the Idea to the Problem?'],'Traifeh et al (2021)',''],
    [9,'Defending the Idea · Presenting the Idea',['Providing Rationale for the Ideas','Refining the Ideas','How to pitch the project?','Presentation Techniques'],'Byers et al (2019) Ch. 19',''],
    [10,'Entrepreneurial Strategy',['Entrepreneurial Vision & Mission','Goals, Objectives, and Tactics'],'Byers et al (2019) Ch. 3',''],
    [11,'Overview of Entrepreneurial Strategies',['Communicating the Mission and Vision','Reviewing the Strategy'],'HBR',''],
    [12,'Market/Industry Analysis',['What is a Market?','PESTLE Analysis'],'Byers et al (2019) Ch. 2, 3',''],
    [13,'Value Proposition Canvas (Part 1)',['Customer Portfolio and Analysis'],'Byers et al (2019) Ch. 3',''],
    [14,'Value Proposition Canvas (Part 2)',['Product Offering and Evaluation'],'Byers et al (2019) Ch. 3',''],
    [15,'Product Differentiation (Part 1)',['Communicating the features and benefits.'],'Byers et al (2019) Ch. 4',''],
    [16,'Product Differentiation (Part 2)',['Communicating the features and benefits.'],'Byers et al (2019) Ch. 4','']],
  faq:['How do I contact the professor?','What are the office hours?','How do I book office hours?','What if I miss an activity or the presentation?','How is the course graded?','Are there exams in this course?','Where do I submit my work?','Where do I see my grades?','How do I find a project idea?','How do I check my idea fits an SDG?','Where do I find data?','Can I use ChatGPT or AI?']
};
