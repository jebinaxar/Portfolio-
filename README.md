# Portfolio Server (Express + MongoDB)

Backend API for auth, projects, contacts, and analytics.

## Features

- Admin auth with httpOnly cookie JWT
- Project workflow transitions:
  - `DRAFT -> REVIEW -> PUBLISHED -> ARCHIVED`
- Public project listing + detail endpoint
- Contact submissions with:
  - email validation
  - honeypot support
  - in-memory rate limiting
- Request logging middleware
- 404 + centralized error middleware
- Analytics event ingestion endpoint

## Requirements

- Node.js 18+
- MongoDB connection string

## Install

```bash
cd server
npm install
```

## Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
COOKIE_DOMAIN=
```

Notes:
- `CLIENT_ORIGIN` supports comma-separated values.
- In production, use `NODE_ENV=production`.
- `COOKIE_DOMAIN` is optional and typically used in production.

## Run

```bash
npm start
```

## Tests

Run unit + HTTP integration tests:

```bash
npm test
```

Run DB-backed integration tests as well:

```bash
$env:RUN_DB_TESTS="1"
$env:MONGO_DB_NAME="PortfolioCluster_test"
npm test
```

Notes:
- DB tests are skipped unless `RUN_DB_TESTS=1`.
- Use a dedicated test database name to avoid touching production data.

Health check:

```http
GET /
```

## API Summary

- Auth
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/logout`

- Projects
  - `GET /projects/public`
  - `GET /projects/public/:id`
  - `GET /projects/admin/all?page=&limit=&status=&q=` (admin)
  - `GET /projects/admin/drafts` (admin)
  - `POST /projects` (admin)
  - `PUT /projects/:id` (admin)
  - `POST /projects/:id/review` (admin)
  - `POST /projects/:id/publish` (admin)
  - `POST /projects/:id/archive` (admin)
  - `POST /projects/:id/restore` (admin)

- Contacts
  - `POST /contacts`
  - `GET /contacts` (admin)
  - `PUT /contacts/:id/review` (admin)

- Analytics
  - `POST /analytics/events`

## Deployment Checklist

1. Set strict `CLIENT_ORIGIN` values.
2. Set strong `JWT_SECRET`.
3. Use production MongoDB URI and least-privilege database user.
4. Enable `NODE_ENV=production`.
5. Monitor request logs and error logs from runtime.
