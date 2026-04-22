# ATS-Lite: Smart Job Application Tracker — PRD

## Original problem statement
Build a full-stack web app that helps users track and manage job applications
through the hiring process. Authenticated users can create, update, filter and
delete applications and move them through stages: Applied → Interview → Offer → Rejected.

## User choices (from kickoff)
- Backend: FastAPI + MongoDB (instead of Node/Express)
- Authentication: JWT-based custom auth with bcrypt
- Extras: None — keep it minimal
- Design: Dark modern dashboard

## Architecture
- **Backend**: FastAPI, Motor (async MongoDB), PyJWT, bcrypt. All routes under `/api`.
- **Frontend**: React + React Router + Axios, shadcn/UI, framer-motion, phosphor-icons,
  Outfit + IBM Plex Sans fonts, dark theme with HSL `221 83% 53%` primary.
- **Auth**: Bearer tokens stored in localStorage; access token 7-day expiry.

## Core requirements (static)
- Register / Login with JWT
- Protected routes (only logged-in users manage their own jobs)
- Add job (title, company, location, link, status)
- View jobs (own only), filter by status, pagination
- Update status via dropdown (Applied/Interview/Offer/Rejected)
- Delete job

## User personas
- **Active job seeker** tracking 10–50 applications across companies.
- **Career coach / bootcamp student** organising a structured pipeline.

## What's been implemented (2026-02)
- `/api/auth/register`, `/api/auth/login`, `/api/auth/me` (Bearer token)
- `/api/jobs` POST, GET (status + search + pagination + counts_by_status), PATCH, DELETE
- Seeded admin user (`admin@example.com` / `admin123`)
- Dark modern dashboard: stats strip, filter tabs with counts, search,
  job cards with status badge + change-status dropdown + delete,
  Add Job dialog, pagination, staggered framer-motion entry animations,
  empty-state illustration.
- Login, Register, ProtectedRoute, Logout.
- MongoDB indexes: `users.email` unique, `jobs.created_by`, compound `(created_by, status)`.
- Pydantic schema validation, user-scoped queries (created_by == user.id).
- Test credentials documented at `/app/memory/test_credentials.md`.
- Backend tested 17/17 passing via testing agent.

## Prioritised backlog

### P1 (next, if user asks)
- Forgot / reset password flow
- Edit full job (title/company/location/link) via dialog, not only status
- Notes field per job

### P2 (nice to have)
- CSV export
- Applied-date custom picker
- Analytics chart (recharts) with stage funnel over time
- Drag-and-drop Kanban view

### P3 (stretch)
- LinkedIn / job-board URL parse-on-paste
- Email reminders for stale applications
- Shared pipeline board with coach
