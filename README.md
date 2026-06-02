# DevConnect

A developer collaboration platform for building teams, launching projects, and growing together.

Built with React + TypeScript (Vite) on the frontend and Express + TypeScript + Prisma (PostgreSQL) on the backend.

## Features

- **Auth** — Email/password + OAuth (Google, GitHub), forgot/reset password, email verification, onboarding wizard, soft-delete with 30-day grace period, password change, account linking
- **Social** — Developer discovery with full-text search, advanced filters (availability, skills, country, collaboration score), collaboration requests (send/accept/reject), reviews/ratings with category scores, bookmarks, activity feed, follow/unfollow
- **Chat** — 1:1 direct messaging and team group chats via Socket.IO, file attachments in messages, message pagination, conversation search
- **Projects** — CRUD with skill tagging, team management, Kanban task board with drag-and-drop, auto-team builder (greedy algorithm), recommended team member matching
- **Admin** — Dashboard with user/project management, soft-delete enforcement, stats (users, projects, teams, reviews)
- **Notifications** — Real-time notification delivery via Socket.IO, pagination, delete, mark-all-read, sonner toast alerts, unread count badge
- **Moderation** — User blocking (mutual — hidden from search/chats), user reporting with reason
- **Matching** — Skill-based project-developer matching (≥50% match triggers auto-notification), team recommendation with complementary skill coverage
- **UI** — Enterprise-style auth page, animated error modals, skeleton loading, fully mobile responsive with bottom nav + hamburger menu, dark/light theme toggle, glassmorphism cards, Google Translate widget (Landing), ⌘K command palette, framer-motion page transitions

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
# Server tests (78 tests)
cd server && npm test

# Client tests (32 tests)
cd client && npm test
```

110 integration + component tests covering auth, search, matching, real-time notifications, chat, reviews, bookmarks, tasks, feed, and UI components.

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
| `GET /api/search?q=&type=&skill=&availability=&country=` | Full-text search with advanced filters |
| `POST /api/moderation/users/:userId/block` | Block a user |
| `DELETE /api/moderation/users/:userId/block` | Unblock a user |
| `GET /api/moderation/blocked` | List blocked users |
| `POST /api/moderation/users/:userId/report` | Report a user |
| `POST /api/follow/:userId` | Follow/unfollow a user |
| `GET /api/follow/following` | List users the current user follows |
| `GET /api/follow/followers` | List followers |
| `POST /api/conversations` | Create/start a conversation |
| `GET /api/conversations` | List conversations (paginated) |
| `GET /api/chat/messages/:conversationId?cursor=` | Get messages (cursor pagination) |
| `GET /api/notifications?cursor=&limit=` | Paginated notifications |
| `DELETE /api/notifications/:id` | Delete a notification |
| `GET /api/notifications/unread-count` | Unread notification count |
| `PATCH /api/notifications/:id/read` | Mark notification read |
| `POST /api/notifications/read-all` | Mark all notifications read |
| `GET /api/projects/:id/team` | Get project team |
| `POST /api/projects/:id/team` | Create team |
| `GET /api/teams/:id/messages` | Get team chat messages |
| `GET /api/match/projects/:id` | Get matching developers for project |
| `GET /api/match/projects/:id/team-recommendation` | Recommended team members |
| `GET /api/recommend/skills` | Recommended skills for user |
| `GET /api/feed` | Smart activity feed |
| `POST /api/upload/avatar` | Upload avatar |
| `POST /api/upload/message` | Upload message attachment |
| `POST /api/upload/project` | Upload project file |
| `POST /api/auth/change-password` | Change password |
| `POST /api/auth/send-verification` | Send email verification |
| `POST /api/auth/delete-account` | Soft-delete account |
| `POST /api/auth/cancel-deletion` | Cancel scheduled deletion |
| `GET /api/auth/deletion-status` | Check deletion status |
| `GET /api/auth/accounts` | List linked OAuth accounts |
| `GET /api/admin/stats` | Admin dashboard stats |
| `GET /api/admin/users` | Admin: list all users |
| `PATCH /api/admin/users/:id/role` | Admin: change user role |
| `POST /api/contact` | Submit contact form |
| `GET /api/health` | Health check |
