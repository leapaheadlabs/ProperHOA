# ProperHOA Documentation

## Quick Start

```bash
# Clone the repository
git clone https://github.com/leapaheadlabs/ProperHOA.git
cd ProperHOA

# Set up environment
cp apps/web/.env.example apps/web/.env
# Edit .env with your values

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Run migrations
docker exec properhoa-web npx prisma migrate deploy

# Seed demo data
docker exec properhoa-web npm run db:seed
```

## Architecture

- **Frontend**: Next.js 14 App Router + shadcn/ui + Tailwind CSS
- **Backend**: Next.js API routes + Prisma ORM
- **Database**: PostgreSQL 16 + pgvector
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Search**: Meilisearch
- **AI**: Ollama (self-hosted Llama 3.1)
- **Auth**: NextAuth.js v5 with OAuth + magic links
- **Payments**: Stripe Elements
- **Monitoring**: Prometheus + Grafana + Loki
- **Proxy**: Caddy (auto HTTPS)

## User Roles

| Role | Permissions |
|------|-------------|
| President | Full access to all features |
| Treasurer | Financial dashboard, payments, reports |
| Secretary | Meetings, documents, compliance |
| Board Member | Dashboard, violations, ARC, documents |
| Homeowner | Portal, dues, chat, documents |

## Environment Variables

See `apps/web/.env.example` for all required and optional variables.

Critical secrets (must be strong, unique):
- `POSTGRES_PASSWORD` — min 16 characters
- `NEXTAUTH_SECRET` — min 32 characters
- `REDIS_PASSWORD` — min 16 characters
- `STRIPE_SECRET_KEY` — from Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` — from Stripe CLI

## API Endpoints

### Authentication
- `POST /api/auth/signin` — Email/password or OAuth
- `POST /api/auth/signup` — Create account
- `POST /api/auth/reset-password` — Request reset
- `GET /api/auth/session` — Get current session

### Dashboard
- `GET /api/dashboard` — Board dashboard stats

### Portal
- `GET /api/portal` — Homeowner dashboard data

### Violations
- `POST /api/violations` — Report violation
- `GET /api/violations` — List violations
- `PATCH /api/violations/[id]` — Update status

### ARC
- `POST /api/arc-requests` — Submit request
- `GET /api/arc-requests` — List requests
- `PATCH /api/arc-requests/[id]` — Board vote

### Meetings
- `POST /api/meetings` — Schedule meeting
- `GET /api/meetings` — List meetings
- `PATCH /api/meetings/[id]` — Update status

### Documents
- `POST /api/documents` — Upload
- `GET /api/documents` — List
- `GET /api/search` — Full-text search

### Payments
- `POST /api/payments/intent` — Create PaymentIntent
- `POST /api/webhooks/stripe` — Stripe webhooks

### AI
- `POST /api/ai/chat` — Chat with AI assistant
- `POST /api/ai/feedback` — Submit feedback
- `POST /api/ai/escalate` — Escalate to board

### Compliance
- `POST /api/compliance` — Create item
- `GET /api/compliance` — List items
- `PATCH /api/compliance/[id]` — Update status

### Maintenance
- `POST /api/maintenance` — Submit request
- `GET /api/maintenance` — List requests

### Directory
- `GET /api/directory` — Resident listing

### Finances
- `GET /api/finances` — Dashboard data
- `POST /api/transactions/import` — Import transactions

### Audit
- `GET /api/audit-logs` — Activity logs

### Health
- `GET /api/health` — Service health
- `GET /api/metrics` — Prometheus metrics

## Deployment

```bash
# Production deployment
cd docker
./deploy.sh production
```

See `docker/deploy.sh` for full deployment automation.

## Security

- Row-Level Security (RLS) on all database tables
- Rate limiting: 100 req/min per IP
- Security headers: HSTS, CSP, X-Frame-Options
- PCI DSS SAQ A-EP compliance
- Quarterly security audits

## Support

- GitHub Issues: https://github.com/leapaheadlabs/ProperHOA/issues
- Email: support@properhoa.com
- Security: security@properhoa.com

## License

MIT License — Copyright (c) 2024 LeapAhead Labs
