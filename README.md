# PunchTrack

A dead-simple punch in/punch out app for part-time workers to track their hours and verify they're being paid correctly.

No more guessing if your paycheck is right — punch in, punch out, done.

## Features (MVP)

- **Punch In** — timestamp the start of a shift with one tap
- **Punch Out** — timestamp the end, auto-calculates hours worked
- **Work Locations** — tag each shift with the location it was worked at (e.g. Downtown Store, North Branch, Remote)
- **Daily Log** — see every shift you've worked
- **Weekly/Monthly Totals** — total hours over a period
- **Pay Calculator** — hours × your hourly rate = expected pay

## Design Principle

Extremely simple. Two main buttons. Clean numbers. Should be faster to use than opening Instagram.

## Screens

| Screen | Purpose |
|---|---|
| **Timer** | Punch in/out, today's stats (hours/week/pay), today's log, current location |
| **History** | Weekly totals, earnings, full shift history |
| **Profile** | Set hourly rate, manage work locations |

## Design

<img width="1156" height="727" alt="image" src="https://github.com/user-attachments/assets/b432dbf3-451c-4c2a-a8ed-a19e845c8dd6" />

Design mockups: [https://www.figma.com/design/7h4aYLfVOqwqA7wvBib0BL/Puch-Track?node-id=0-1&t=pINgeLVAHEPKjUXS-1]

## Tech Stack

| Layer | Tech |
|---|---|
| Mobile app | React Native (Expo) |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| Hosting | Railway / Supabase |

## Project Structure

```
Puch-IN/
├── backend/           # FastAPI app (routers, crud, services, models)
├── frontend/           # React Native (Expo) app
├── design/             # Screenshots / exported design assets
└── README.md
```

## Status

🚧 Work in progress — building backend and database schema first, then frontend.

## Getting Started (Local Dev)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

## Author

Built by a QUT CS/IT student as a personal project and learning exercise in full-stack + mobile development.
