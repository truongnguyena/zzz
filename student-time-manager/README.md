## Student Time Manager (NAVER Vietnam AI Hackathon – Preliminary Assignment)

A simple, fast web app that helps Vietnamese university students manage tasks, see upcoming deadlines on a calendar, and understand their productivity patterns. Built with React + Vite + TypeScript and IndexedDB (Dexie) for offline-friendly persistence.

### How this meets the requirements
- Full CRUD: Create, read, update, delete tasks via the Focus view
- Persistent storage: IndexedDB via Dexie with seeding for 20+ tasks
- Three views of same data: Focus (list), Calendar (by due date), Analytics (time usage)
- Time/date handling: Due dates, formatting, urgency and procrastination-aware sorting
- 20+ items support: Seed data, search/filter, and snappy rendering

### Quick start
```bash
npm install
npm run dev
```
Open the local URL printed in the terminal.

### Production build
```bash
npm run build
npm run preview
```

### Deploy
- Vercel: Import this repo, set framework to Vite, default build (`npm run build`) and output directory `dist`
- Netlify: Build command `npm run build`, publish directory `dist`

### Features
- Focus view: add/edit/delete tasks, mark done, search, urgency highlighting
- Calendar view: weekly grid showing tasks by due date
- Analytics view: simple bar chart of focused minutes per day and average actual/estimate ratio
- Procrastination coefficient: sorts tasks accounting for how long you actually take on average

### Tech stack
- React, React Router
- Dexie (IndexedDB)
- date-fns for time utilities
- Recharts for simple analytics
- Vite + TypeScript

### Customization hints
- Edit `src/db.ts` to adjust seeding or add more fields
- Extend `src/types.ts` for categories/tags
- Improve scheduling logic in `src/utils/time.ts`

### Notes
- All data is stored locally in your browser. Clearing site data will reset it.
- This is intentionally lightweight and focused on reliability for the assignment.
