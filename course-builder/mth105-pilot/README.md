# MTH 105 · Introduction to Statistics (CUD)

Interactive course site. Created and owned by Eng. Nadia Mek.

Live: https://nadiamek-tech.github.io/MTH105/

- `index.html`: course home (Lectures · Lab · Exams, search, FAQ, CLOs)
- `lectures.html`: lecture pages `week-01.html` … `week-13.html`, practice links, calculator and tools (`tools.html`)
- `lab.html`: Excel workbooks in `lab/` with step-by-step instructions (upload on Moodle)
- `exams.html`: important dates, assessment and CLOs, revision (`midterm-practice.html`), past papers
- `src/*.js` → `python3 tools/build.py` builds the lecture pages
- `python3 tools/lab.py` rebuilds the lab workbooks and `assets/lab-data.js`
- `python3 tools/narrate.py lines.json` regenerates the narration in `audio/`
- Moodle submission link: set `window.MTH105_MOODLE` in `lab.html`
