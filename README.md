# Event Manager

A full-stack event ticketing platform where event creators can publish events, sell tickets, track analytics, and scan QR codes, while eventees can browse events, purchase tickets, and manage their tickets.

**Author:** Ofulue Chisom

## Tech Stack

### Backend

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis (Docker)
- **Auth:** JWT (JSON Web Tokens) + bcryptjs
- **Payments:** Paystack
- **QR Codes:** qrcode (generation + scan verification)
- **Email:** Nodemailer
- **Scheduling:** node-cron (reminder system)
- **Testing:** Jest + Supertest

### Frontend

- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **Build Tool:** Vite
- **HTTP Client:** Axios

### Infrastructure

- **Container:** Docker (Redis)
- **Database:** PostgreSQL

## Project Structure

```
Event Manager/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── events/      # EventCard, EventForm, ShareMenu, StatusBadge
│   │   │   ├── notifications/ # NotificationBell
│   │   │   ├── tickets/     # TicketCard
│   │   │   └── ui/          # Button, Card, Input, Modal, Alert, Spinner, etc.
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useApi, useAuth, useNotifications
│   │   ├── layouts/         # AppLayout, Navbar, Footer, Logo
│   │   ├── pages/           # All page components
│   │   ├── services/        # API service layer (axios client + services)
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Formatting, errors, pending payment helpers
│   └── .env                 # VITE_API_URL
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # Environment and database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── jobs/            # Cron jobs (reminders, event completion)
│   │   ├── middleware/       # Auth, rate limiting
│   │   ├── models/          # Data access layer
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # Business logic
│   │   ├── tests/           # Integration tests
│   │   └── utils/           # Helpers (QR, emails, errors)
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── .env                 # Environment variables
└── package.json             # Root dev dependencies
```

## Prerequisites

- Node.js (v18+)
- Docker Desktop (with Docker Compose)
- PostgreSQL (running locally or via Docker)
- Paystack account (for payment integration)

## Environment Variables

### Backend (`server/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/event_manager
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
PORT=4000

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
EMAIL_FROM=noreply@example.com

# Frontend URL (for share links)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

## Getting Started

### 1. Start Infrastructure

```bash
# Start Redis container
docker start redis

# Ensure PostgreSQL is running on localhost:5432
```

### 2. Install Dependencies

```bash
# Install root dev dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Set Up Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (if seed script exists)
npx prisma db seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend (from server/)
npm run dev

# Terminal 2 - Frontend (from client/)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:4000/api`.

## API Endpoints

### Authentication

| Method | Endpoint             | Auth Required | Description            |
|--------|----------------------|---------------|------------------------|
| POST   | /api/auth/register   | No            | Register a new user    |
| POST   | /api/auth/login      | No            | Login and receive JWT  |

### Events

| Method | Endpoint                   | Auth Required | Role          | Description                    |
|--------|----------------------------|---------------|---------------|--------------------------------|
| GET    | /api/events                | No            | Any           | List published events          |
| GET    | /api/events/:id            | No            | Any           | Get event details              |
| POST   | /api/events                | Yes           | EVENT_CREATOR | Create a new event             |
| GET    | /api/events/my-events      | Yes           | EVENT_CREATOR | List creator's events          |
| PATCH  | /api/events/:id            | Yes           | EVENT_CREATOR | Update event                   |
| PATCH  | /api/events/:id/cancel     | Yes           | EVENT_CREATOR | Cancel event                   |
| GET    | /api/events/:id/share      | No            | Any           | Get social share links         |

### Tickets

| Method | Endpoint              | Auth Required | Role    | Description              |
|--------|-----------------------|---------------|---------|--------------------------|
| POST   | /api/events/:id/tickets | Yes         | EVENTEE | Create ticket order      |
| GET    | /api/my-tickets       | Yes           | EVENTEE | List user's tickets      |

### Payments

| Method | Endpoint                      | Auth Required | Role | Description                      |
|--------|-------------------------------|---------------|------|----------------------------------|
| POST   | /api/payments/initialize      | Yes           | Any  | Initialize Paystack payment      |
| GET    | /api/payments/verify/:ref     | No            | Any  | Verify payment and create tickets |

### QR Codes

| Method | Endpoint                      | Auth Required | Role          | Description              |
|--------|-------------------------------|---------------|---------------|--------------------------|
| GET    | /api/qr/:ticketCode           | No            | Any           | Get QR code for ticket   |
| PATCH  | /api/qr/:ticketCode/verify    | Yes           | EVENT_CREATOR | Validate ticket (scan)   |
| POST   | /api/qr/scan                  | Yes           | EVENT_CREATOR | Scan ticket by code      |

### Analytics

| Method | Endpoint                  | Auth Required | Role          | Description                |
|--------|---------------------------|---------------|---------------|----------------------------|
| GET    | /api/analytics/events/:id | Yes           | EVENT_CREATOR | Get event analytics        |

### Notifications

| Method | Endpoint                   | Auth Required | Role | Description            |
|--------|----------------------------|---------------|------|------------------------|
| GET    | /api/notifications         | Yes           | Any  | List user notifications |
| PATCH  | /api/notifications/:id/read| Yes          | Any  | Mark notification read  |

## User Roles

- **EVENT_CREATOR** - Can create, edit, and manage events; view analytics; scan/validate tickets
- **EVENTEE** - Can browse events, purchase tickets, and view their tickets

## Key Features

- **Event Management** - Create, edit, cancel events with draft/published/completed states
- **Ticket Sales** - Paystack-powered payment processing with ticket generation
- **QR Code Tickets** - Unique QR codes per ticket for scanning and validation
- **Analytics Dashboard** - Tickets sold, revenue, capacity metrics for event creators
- **Notifications** - Real-time notifications for ticket purchases, event reminders, and updates
- **Social Sharing** - WhatsApp, Facebook, Twitter, LinkedIn, Instagram share links
- **Redis Caching** - Event and ticket data cached for performance
- **Rate Limiting** - Payment initialization rate-limited to prevent abuse
- **Responsive Design** - Mobile-first UI that works across all devices

## Docker

### Redis Container

```bash
# Start existing Redis container
docker start redis

# Redis runs on localhost:6379 with restart policy: unless-stopped
```

## Testing

```bash
cd server
npm test
```

## License

ISC
