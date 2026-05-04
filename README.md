# Job Board

A full-stack job board application where users can post jobs, browse listings, and track applications.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, React Router 7, Axios, Vite |
| Backend | Express 5, TypeScript, Zod, JWT (HTTP-only cookies) |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | bcrypt password hashing, JWT tokens |
| Testing | Vitest, Supertest, React Testing Library |
| Infra | Docker Compose |

## Features

- **Browse jobs** — filter by category, see salary ranges, deadlines, and employment type
- **Post jobs** — authenticated users can create job listings
- **Apply** — submit applications with an optional cover letter
- **Track applications** — view status updates and withdraw applications
- **User profiles** — edit name, headline, bio, location, and website

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) 16 **or** [Docker](https://www.docker.com/) (recommended)

---

## Quick Start (Docker)

The easiest way to run the full stack is with Docker Compose. This starts PostgreSQL and the API server.

```bash
# 1. Clone the repo
git clone <repo-url>
cd <repo-dir>

# 2. Create the root .env file from the example
cp .env.example .env
# Edit .env and set a strong JWT_SECRET (min 32 chars)
# openssl rand -hex 32

# 3. Start the database and API
docker compose up --build

# 4. In a separate terminal, run database migrations
docker exec -it jobboard-api npx prisma migrate deploy

# 5. Start the frontend development server
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Manual Setup

### 1. Environment variables

**Server** — create `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/jobboard"
JWT_SECRET="a-random-string-that-is-at-least-32-characters-long"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

Generate a secure secret:
```bash
openssl rand -hex 32
```

**Client** — create `client/.env`:

```env
VITE_API_URL="http://localhost:4000/api"
```

### 2. Database

Start PostgreSQL (or use Docker just for the DB):

```bash
docker compose up postgres -d
```

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Run migrations and generate the Prisma client

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 5. Start development servers

Run the server and client in separate terminals:

```bash
# Terminal 1 — API server (http://localhost:4000)
cd server
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client
npm run dev
```

---

## Project Structure

```
.
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Layout, ProtectedRoute, ApplyModal, Footer
│       ├── context/         # AuthContext, useAuth
│       ├── lib/             # Axios API client
│       ├── pages/           # HomePage, LoginPage, RegisterPage, …
│       └── types/           # TypeScript interfaces
│
├── server/                  # Express API
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── src/
│       ├── config/          # Environment variable validation (Zod)
│       ├── lib/             # Prisma client, userSelect helper
│       ├── middleware/       # requireAuth, validate, errorHandler
│       ├── modules/         # auth, user, job, application (routes/controller/service/schema)
│       ├── types/           # Express.Request augmentation
│       └── utils/           # AppError, JWT helpers
│
├── docker-compose.yml
└── .env.example
```

---

## API Reference

All API routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | No | Create account. Body: `{ email, password, name }` |
| `POST` | `/login` | No | Sign in. Body: `{ email, password }` |
| `POST` | `/logout` | No | Clear auth cookie |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/me` | Yes | Get authenticated user |
| `PATCH` | `/me` | Yes | Update profile. Body: `{ name?, bio?, headline?, location?, website? }` |

### Jobs — `/api/jobs`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | List all jobs. Query: `?category=ENGINEERING` |
| `GET` | `/:id` | No | Get a single job |
| `POST` | `/` | Yes | Create a job listing |

### Applications — `/api/applications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/jobs/:jobId` | Yes | Apply to a job. Body: `{ coverLetter? }` |
| `GET` | `/me` | Yes | List my applications |
| `GET` | `/me/job-ids` | Yes | Get IDs of jobs I've applied to |
| `GET` | `/:id` | Yes | Get a specific application |
| `PATCH` | `/:id/withdraw` | Yes | Withdraw an application |

### Job Categories

`ENGINEERING` · `DESIGN` · `MARKETING` · `SALES` · `FINANCE` · `HR` · `OPERATIONS` · `PRODUCT` · `DATA` · `OTHER`

### Employment Types

`FULL_TIME` · `PART_TIME` · `CONTRACT` · `INTERNSHIP`

---

## Running Tests

Tests run without a live database — Prisma is fully mocked.

```bash
# Server tests (unit + integration) — 117 tests
cd server
npm test

# Client tests (components + context) — 27 tests
cd client
npm test
```

### Test coverage

**Server**
- Zod validation schemas (auth, job, application, user)
- `AppError` class and JWT utilities
- Middleware: `requireAuth`, `validate`, `errorHandler`
- Services: `authService`, `jobService`, `applicationService`, `userService`
- Integration: all 14 API endpoints via Supertest

**Client**
- `LoginPage` — render, submit, error, loading state
- `RegisterPage` — render, submit, navigation, error, loading state
- `ProtectedRoute` — loading, redirect, authenticated render
- `ApplyModal` — render, submit, error, close
- `useAuth` hook — provider requirement, context access

---

## Production Build

```bash
# Build the server
cd server && npm run build

# Build the client
cd client && npm run build
# Static files land in client/dist — serve with any static file host

# Run the compiled server
cd server && npm start
```

---

## Database Schema

```
User         — id, email, passwordHash, name, bio, headline, location, website
Job          — id, title, description, category, companyName, companyLogo,
               location, salaryMin, salaryMax, employmentType, deadline, postedById
Application  — id, coverLetter, status, userId, jobId
               unique(userId, jobId)
```

Application statuses: `SUBMITTED` → `IN_REVIEW` → `INTERVIEW` → `OFFERED` / `REJECTED` / `WITHDRAWN`
