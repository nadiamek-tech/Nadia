# Course Builder (GED AI Education Pilot)

- `index.html` — faculty intake: profile, syllabus, materials, comments, teaching approach (voice or typed), course-site parts. Exports one build-package HTML file (readable summary + files + JSON in `#build-data`).
- `review/review.js` — pilot review layer. Any pilot copy loads `pilot.js` (course, round, pages, send-to) then this script: a review box on every page (voice dictation, "point to a part", type, must-fix), page status, progress over all pages, and "Send my review", which saves one HTML report with the data in `#review-data`.
- `mth105-pilot/` — Pilot 1 test copy of MTH 105 (student-facing pages only; no professor area, no graded quizzes). Its live board has its own key and room, separate from the real class board.

Workflow: Bring → Build → Pilot 1 review → Pilot 2 review → Final. For Pilot 2, rebuild the copy and set `round: 2` in `pilot.js` (reviews are stored per round).
