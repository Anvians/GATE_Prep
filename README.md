# Prep Ledger — GATE ME 2027 Tracker

Same tracker as the CAT one, rebuilt for GATE Mechanical Engineering 2027
(IIT Madras). Plain HTML/CSS/JS on the frontend, Node.js + Express + MongoDB
on the backend.

## What it does

- Countdown to Feb 6, 2027 (first GATE exam day; your paper's exact date and
  shift are on your admit card)
- Five ledgers matching the syllabus sections: General Aptitude, Engineering
  Mathematics, Applied Mechanics & Design, Fluid Mechanics & Thermal Sciences,
  and Materials, Manufacturing & Industrial Engineering. Each topic cycles
  **not started → in progress → completed** and has a notes box (autosaves)
- Add or delete your own topics in any section
- Section-wise progress bars
- A mock test log: date, source, GA / Maths / AMD / FTS / MMI scores, total out
  of 100, percentile and notes, with a score trend chart and a 60-mark target line
- Everything is saved in MongoDB, so it persists across sessions

## 1. Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and run it (`mongod`), or
  - **Free cloud option**: create a free cluster at
    [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and copy its
    connection string

## 2. Setup

```bash
cd GATE_PREP
npm install
cp .env.example .env
```

Open `.env` and set `MONGODB_URI`:

```
# Local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/gate-tracker

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gate-tracker
```

## 3. Seed the initial topic list (optional but recommended)

This preloads the GATE ME topic checklist (built from the IIT Madras 2027 syllabus) so you don't start from
an empty board:

```bash
npm run seed
```

(Safe to skip — you can also add every topic manually from the UI.)

## 4. Run it

```bash
npm start
```

Then open **http://localhost:3000** in your browser.

## Project structure

```
gate-tracker/
├── server.js          # Express app entry point
├── seed.js             # Seeds the initial topic checklist
├── models/
│   ├── Topic.js         # section, name, status, notes
│   └── Mock.js          # date, scores, percentile, notes
├── routes/
│   ├── topics.js        # CRUD API for topics
│   └── mocks.js         # CRUD API for mock entries
└── public/
    ├── index.html
    ├── style.css
    └── script.js         # all frontend logic, vanilla JS, no framework
```

## Deploying publicly

The included `render.yaml` lets [Render](https://render.com) auto-configure a
free web service from this repo. Use a free
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster for
`MONGODB_URI`, since Render can't reach `localhost` on your machine.

## Notes

- The exam date and target score (60) are set in `server.js` (`/api/config`).
  Update the date once your admit card shows your paper's day.
- Section codes: GA, MATH, AMD, FTS, MMI (see `models/Topic.js`).
- If you already ran the CAT tracker, use a different database name
  (`gate-tracker`) so the two don't mix.
- To reseed topics from scratch, drop the `topics` collection in your DB
  first, then run `npm run seed` again.
