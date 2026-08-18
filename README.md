# NCRS — Nepal Crime Reporting System

A fully functional crime reporting web app for Nepal: citizens report crimes with GPS + evidence, police
investigate assigned cases, and admins manage users, officers, reports and analytics. Built to match the
NCRS product poster (Nepal flag colors, three-role system, live crime map, case tracking, SOS button).

## Stack

- **Backend:** Node.js + Express, JWT auth, bcrypt password hashing, Multer file uploads
- **Database:** Plain JSON files in [`backend/database/`](backend/database) — no external DB required
- **Frontend:** React (Vite), React Router, Chart.js, Leaflet/OpenStreetMap for the crime map

## Project structure

```
backend/
  database/        JSON "database" (users, reports, districts, categories, stations, notifications, case history)
  routes/           Express route handlers (auth, reports, users, notifications, meta, analytics)
  middleware/        JWT auth + role-based authorization
  utils/            JSON read/write helper, file-upload config
  uploads/          Uploaded evidence files (photos/videos/PDFs)
  seed.js           Seeds demo accounts + sample reports
  server.js         App entry point

frontend/
  src/
    api/            fetch-based API client
    context/        AuthContext (login/register/logout, current user)
    components/     Sidebar, Topbar, StatCard, CrimeMap, badges, etc.
    pages/
      auth/          Login, Register
      citizen/        Dashboard, Report Crime, My Reports
      police/         Dashboard, Assigned Cases
      admin/          Dashboard (charts), Manage Reports/Officers/Citizens
      (shared)        Report/Case Detail, Crime Map, Notifications, Profile
    styles/theme.css  Nepal-flag themed design system (navy/crimson/blue)
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
npm run seed     # creates database/users.json, reports.json, etc. with demo data
npm start        # http://localhost:5000
```

### 2. Frontend (development)

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173 (proxies /api and /uploads to :5000)
```

### 3. Production (single server)

```bash
cd frontend && npm run build
cd ../backend && npm start
```

Once `frontend/dist` exists, `backend/server.js` serves the built app directly, so the whole product runs
from **one process on http://localhost:5000**.

## Accounts (created by `npm run seed`)

| Role    | Name             | Email                     | Password       |
|---------|-------------------|----------------------------|-----------------|
| Admin   | Roshan Khatiwada  | riteshrooson@gmail.com    | roshan1a2b3c    |
| Police  | Hari Bahadur Thapa| haribadur@gmail.com       | hari1a2b3c      |
| Citizen | Bipin Bhandari    | bipin@gmail.com           | bipin1a2b3c     |

Two additional citizen/police accounts (`ramesh.gurung@example.com`, `kabita.rai@ncrs.gov.np`, both
password-protected in `backend/seed.js`) exist only to give the sample reports some variety — they're not
meant to be advertised on the login page.

## Features implemented

- **Citizen:** register/login, report a crime (category, description, GPS location, evidence upload), track
  case status on a timeline, live nationwide crime map, notifications, profile/password, one-tap Emergency SOS.
- **Police:** dashboard with case-load stats, assigned case list, update investigation status with notes,
  view evidence and reporter contact.
- **Admin:** system-wide dashboard (monthly report trend line chart, crime-category donut chart, per-district
  breakdown), manage reports (assign officers, override status), manage police officers (create/suspend/delete),
  manage citizen accounts.
- Nepal reference data: all 7 provinces / 77 districts, 10 crime categories, 10 sample police stations.

## Image credits

`frontend/public/images/` holds real photography used on the landing/auth pages:

- `nepal-flag.svg` — Flag of Nepal, public domain (Wikimedia Commons).
- `himalaya-hero.jpg` — Annapurna range from Pokhara, by Ranjan20ranjan, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (Wikimedia Commons).
- `boudhanath-stupa.jpg` — Boudhanath Stupa, Kathmandu, by Bernard Gagnon, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (Wikimedia Commons).

Attribution is included in the landing page footer.

## Known trade-offs

- `npm audit` reports two moderate-severity advisories that require breaking major-version upgrades
  (Vite 5→6/7 for a dev-server-only esbuild CORS issue, and react-router-dom 6→7 for an open-redirect CVE that
  needs an attacker-controlled navigation target — this app never passes user input into `Link`/`navigate`).
  Left as-is to avoid an unscoped rewrite; revisit if this goes to production.
- The JSON "database" is fine for a demo/portfolio app but has no transactional guarantees under concurrent
  writes — swap in a real database before handling real production traffic.
