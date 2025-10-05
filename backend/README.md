Campus Connect - Backend (scaffold)

This folder contains a minimal Express backend scaffold to support the Campus Connect frontend during development.

Quick start (dev):

1. cd backend
2. npm install
3. npm run dev

By default the server runs on http://localhost:4000 and uses an in-memory store (no DB). The routes implemented:
- POST /api/auth/signup { name, email, password }
- POST /api/auth/login { email, password }
- GET /api/events (auth required)
- POST /api/events (auth + faculty/admin)
- POST /api/events/:id/rsvp (auth)
- GET /api/users (auth)
- POST /api/connections/request (auth)
- POST /api/connections/respond (auth)
- GET /api/mentorship/recommendations (auth)
- POST /api/feedback/event (auth)

To enable Prisma/Postgres: set DATABASE_URL and run `npm run prisma:migrate` and `npm run seed`.
