# ProperHOA

> **AI-assisted, mobile-native HOA management platform for self-managed communities of 10–100 homes.**

**Tagline:** *"Run your HOA in minutes a week, not hours."*

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 20+ (for local development)

### Run with Docker Compose (Recommended)

```bash
# Clone the repo
git clone https://github.com/leapaheadlabs/ProperHOA.git
cd ProperHOA

# Copy environment template
cp apps/web/.env.example apps/web/.env

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to start, then visit:
# Web app:    http://localhost:3000
# MinIO:      http://localhost:9001 (minioadmin/minioadmin)
# Meilisearch: http://localhost:7700
# Grafana:    http://localhost:3001 (admin/admin)
```

### Local Development

```bash
# Install dependencies
cd apps/web
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Architecture

ProperHOA is built on a **self-hosted-first** architecture:

| Layer | Technology |
|-------|-----------|
| **Web App** | Next.js 14 + TypeScript + Tailwind CSS |
| **UI Components** | shadcn/ui + Radix UI + Lucide icons |
| **Database** | PostgreSQL 16 + pgvector |
| **Auth** | NextAuth.js v5 + PostgreSQL adapter |
| **ORM** | Prisma |
| **File Storage** | MinIO (S3-compatible) |
| **Search** | Meilisearch |
| **AI / LLM** | Ollama (self-hosted) |
| **Realtime** | Socket.io |
| **Cache** | Redis |
| **Payments** | Stripe (tokenization only) |
| **Bank Sync** | Plaid (Month 3-4) |
| **Proxy** | Caddy (auto HTTPS) |
| **Monitoring** | Grafana + Prometheus + Loki |

### Infrastructure

```
Users
  → Caddy (reverse proxy + HTTPS)
  → Next.js App
  → PostgreSQL + pgvector (data + vectors)
  → Redis (sessions + cache)
  → MinIO (files)
  → Meilisearch (search)
  → Ollama (AI inference)
  → Stripe (payments)
```

---

## Project Structure

```
ProperHOA/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router pages
│       ├── components/         # React components
│       ├── lib/                # Utilities, config
│       ├── prisma/
│       │   └── schema.prisma   # Database schema
│       └── public/             # Static assets
├── docker/
│   ├── docker-compose.yml      # Full stack orchestration
│   ├── caddy/
│   │   └── Caddyfile           # Reverse proxy config
│   ├── monitoring/             # Grafana, Prometheus, Loki
│   └── init-scripts/           # Database initialization
├── docs/
│   └── BRD.md                  # Business Requirements
├── architecture/               # ADR, API spec, schema, security
├── design/                     # Design brief, flows, wireframes
└── README.md                   # This file
```

---

## Features (MVP)

- ✅ **AI Board Assistant** — Self-hosted Ollama answers homeowner questions
- ✅ **Mobile-Native** — iOS, Android, and web apps
- ✅ **Dues & Payments** — Stripe-powered autopay and invoicing
- ✅ **Simple Accounting** — Bank sync + reconciliation
- ✅ **Document Hub** — CC&Rs, bylaws, minutes with full-text search
- ✅ **Meeting Management** — Smart agendas, live meetings, auto-minutes
- ✅ **Violation Tracking** — Photo-based reports, auto-escalation
- ✅ **ARC Requests** — Architectural review with board voting
- ✅ **Compliance Calendar** — Proactive deadline alerts
- ✅ **Community Directory** — Opt-in resident contact sharing

---

## Tech Stack Details

### Frontend
- **Next.js 14** (App Router, SSR/SSG)
- **TypeScript** — Type-safe everywhere
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Accessible component primitives
- **Lucide React** — Consistent iconography

### Backend
- **Next.js API Routes** — Serverless functions
- **Prisma ORM** — Type-safe database queries
- **NextAuth.js v5** — Authentication with OAuth, magic links

### Database
- **PostgreSQL 16** — Relational data
- **pgvector** — Vector embeddings for AI RAG
- **Redis** — Sessions, cache, rate limiting

### AI
- **Ollama** — Self-hosted LLM inference
- **Llama 3.1 8B** — Default model for Q&A
- **nomic-embed-text** — Document embeddings

### Storage & Search
- **MinIO** — S3-compatible object storage
- **Meilisearch** — Full-text search engine

### Payments
- **Stripe** — Card processing (PCI-compliant)
- **Plaid** — Bank transaction sync (Month 3-4)

---

## Documentation

| Document | Description |
|----------|-------------|
| [BRD](docs/BRD.md) | Business Requirements |
| [ADR](architecture/ADR.md) | Architecture Decisions |
| [Database Schema](architecture/database-schema.md) | PostgreSQL + pgvector schema |
| [API Spec](architecture/api-spec.md) | REST + WebSocket API |
| [Security Model](architecture/security-model.md) | Security architecture |
| [Design Brief](design/DESIGN_BRIEF.md) | Visual identity, colors, typography |
| [User Flows](design/USER_FLOWS.md) | 8 detailed user workflows |
| [Wireframes](design/WIREFRAMES.md) | 13 screen layouts |
| [Design System](design/DESIGN_SYSTEM.md) | Component specs, tokens |

---

## Environment Variables

See [apps/web/.env.example](apps/web/.env.example) for all required and optional environment variables.

Key variables:
- `DATABASE_URL` — PostgreSQL connection
- `NEXTAUTH_SECRET` — Session encryption
- `REDIS_URL` — Redis connection
- `MINIO_*` — Object storage credentials
- `MEILISEARCH_*` — Search engine credentials
- `OLLAMA_HOST` — AI inference endpoint
- `STRIPE_*` — Payment processing
- `PLAID_*` — Bank sync (optional for MVP)

---

## Development

```bash
# Install dependencies
cd apps/web && npm install

# Run Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Run tests
npm test

# Lint
npm run lint
```

---

## Deployment

### VPS (Recommended)

```bash
# On your VPS
git clone https://github.com/leapaheadlabs/ProperHOA.git
cd ProperHOA
cp apps/web/.env.example apps/web/.env
# Edit .env with production values
docker-compose -f docker/docker-compose.yml up -d
```

### Caddy HTTPS

Caddy automatically provisions Let's Encrypt certificates. Update the `Caddyfile` with your domain:

```
yourdomain.com {
    reverse_proxy web:3000
}
```

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

TBD — Pending Product Strategy decision.

---

Built by [Leap Ahead Labs](https://github.com/leapaheadlabs) with OpenClaw.

*"The best HOA software is the one you forget you're using."*