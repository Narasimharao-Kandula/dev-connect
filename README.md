# DevConnect

A developer collaboration platform for building teams, launching projects, and growing together.

Built with React + TypeScript (Vite) on the frontend and Express + TypeScript + Prisma (PostgreSQL) on the backend.

## Features

- **Auth** — Email/password + OAuth (Google, GitHub), forgot/reset password, email verification, onboarding wizard, soft-delete with 30-day grace period
- **Social** — Developer discovery with full-text search, collaboration requests (send/accept/reject), reviews/ratings, bookmarks, activity feed, follow/unfollow
- **Chat** — 1:1 direct messaging and team group chats via Socket.IO, file attachments in messages
- **Projects** — CRUD with skill tagging, team management, Kanban task board with drag-and-drop
- **Admin** — Dashboard with user/project management, soft-delete enforcement
- **Notifications** — Real-time notification delivery via Socket.IO, mark-all-read, toast alerts
- **UI** — Enterprise-style auth page, animated error modals, skeleton loading, fully mobile responsive with hamburger navigation, dark theme

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion, Socket.IO client |
| Backend | Node.js, Express 4, TypeScript, Prisma ORM, Socket.IO, Passport.js, Nodemailer, multer |
| Database | PostgreSQL 16 |
| Auth | JWT (access tokens), Passport.js (Google OAuth 2.0, GitHub OAuth) |
| Search | PostgreSQL full-text search (tsvector/tsquery) |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Setup

```bash
# Clone and install
git clone <repo-url> && cd DevTinder
cd server && npm install
cd ../client && npm install

# Start PostgreSQL
docker compose up -d

# Set up environment
cp server/.env.example server/.env   # edit as needed

# Run migrations and seed
cd ../server
npx prisma migrate dev
npx tsx src/seed.ts

# Start dev servers
npx tsx src/index.ts          # API on :5000
cd ../client && npm run dev   # UI on :5173
```

### Test Users

| Email | Password | Role |
|---|---|---|
| rahul@example.com | password123 | Admin |
| john@example.com | password123 | User |
| priya@example.com | password123 | User |
| alex@example.com | password123 | User |
| sarah@example.com | password123 | User |

### Running Tests

```bash
cd server && npm test
```

78 integration tests covering all 8 phases of development.

## Project Structure

```
DevTinder/
├── client/              # React + Vite SPA
│   ├── src/
│   │   ├── api/         # axios client + upload helpers
│   │   ├── components/  # UI components (layout, forms, ui)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route pages (lazy loaded)
│   │   ├── store/       # Zustand stores
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Helpers
│   └── vite.config.ts
├── server/              # Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/      # Environment config
│   │   ├── lib/         # Prisma, email, errors, dates
│   │   ├── middleware/   # Auth, rate limiting
│   │   ├── modules/     # Feature modules (auth, users, projects, etc.)
│   │   ├── test/        # Vitest integration tests
│   │   └── types/       # TypeScript types
│   └── uploads/         # Uploaded files
└── docker-compose.yml
```

## Environment Variables

### Server (`server/.env`)

```
DATABASE_URL=postgresql://devconnect:devconnect@localhost:5432/devconnect
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=604800
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-client-secret>
```

## API Overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register |
| `POST /api/auth/login` | Login (rate-limited) |
| `GET /api/auth/me` | Current user |
| `POST /api/auth/oauth/:provider` | OAuth (google, github) |
| `GET/POST/PATCH/DELETE /api/projects` | Project CRUD |
| `GET/POST /api/tasks/:projectId` | Task CRUD |
| `GET/POST /api/requests` | Collaboration requests |
| `POST /api/upload/:type` | File uploads (avatar, message, project) |
| `GET /api/notifications` | Notifications |
| `GET /api/chat` | Conversations |
| `GET /api/search?q=` | Full-text search |
