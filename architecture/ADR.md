# ProperHOA — Architecture Decision Record (ADR) v1.2

**Version:** 1.2  
**Date:** 2026-05-01  
**Author:** Command (OpenClaw)  
**Status:** APPROVED — Product Owner confirmed self-hosted-first + Stripe + Plaid as core dependencies  

---

## 1. Philosophy

> We self-host everything we legally and technically can. The only exceptions are services that require banking partnerships, PCI DSS Level 1 infrastructure, or financial regulator contracts that would take years and millions to replicate. Stripe and Plaid stay because building a card processor or bank data aggregator is insane. Everything else runs on our metal.

---

## 2. Architecture Overview

```
Users (Web / iOS / Android)
    → Cloudflare (DNS + CDN + DDoS — free tier)
    → Caddy Reverse Proxy (auto HTTPS, Let's Encrypt)
    → Docker Compose Stack on VPS
        ├── Next.js App (web + API)
        ├── PostgreSQL 16 + pgvector (database + vectors)
        ├── Redis (cache + rate limiting + sessions)
        ├── MinIO (file storage, S3-compatible)
        ├── Meilisearch (full-text search)
        ├── Ollama (LLM inference, self-hosted AI)
        ├── Socket.io Server (realtime WebSockets)
        └── Grafana + Prometheus + Loki (monitoring)
    → Stripe (card tokenization only — unavoidable)
    → Plaid (bank transaction sync — Month 3-4 integration)
```

---

## 3. Technology Stack

### 3.1 Fully Self-Hosted

| Layer | Technology | Why |
|-------|-----------|-----|
| **Host** | Hetzner CX51 / DigitalOcean 4GB / Linode 4GB | $20-40/mo, 4 vCPU, 16GB RAM, 160GB NVMe |
| **Reverse Proxy** | Caddy v2 | Auto HTTPS, dead simple config, HTTP/3, rate limiting |
| **Container Orchestration** | Docker Compose | Simple, reproducible, no Kubernetes complexity needed |
| **Web Frontend** | Next.js 14 (App Router) | React ecosystem, SSR/SSG, file-based routing |
| **API / Backend** | Next.js API Routes (same container) | Colocated, no separate backend repo |
| **Database** | PostgreSQL 16 + **pgvector** | Industry standard, pgvector = vectors in same DB |
| **Auth** | **NextAuth.js v5** + PostgreSQL adapter | Self-hosted sessions, OAuth providers, email magic links |
| **File Storage** | **MinIO** | S3-compatible API, self-hosted, signed URLs, buckets per community |
| **Full-Text Search** | **Meilisearch** | Self-hosted, typo-tolerant, faceted search, <50ms queries |
| **Semantic / Vector Search** | **pgvector** (same PostgreSQL) | Store embeddings alongside relational data, single query for hybrid search |
| **AI / LLM** | **Ollama** — Llama 3.1 8B or Mistral 7B | Runs locally, zero API costs, no data leaves the server |
| **Embeddings** | **nomic-embed-text** via Ollama | 768-dim embeddings, runs on CPU instantly |
| **Realtime** | **Socket.io** | WebSocket pub/sub, presence, rooms per community |
| **Cache / Sessions / Rate Limit** | **Redis** | Key eviction, TTL, atomic counters |
| **Email** | **Nodemailer** + SMTP (Postfix or cheap relay) | Self-hosted or AWS SES relay at $0.10/1K |
| **Monitoring** | **Grafana + Prometheus + Loki** | Metrics, logs, alerts, dashboards |
| **CI/CD** | **GitHub Actions** → VPS deploy via SSH + Docker | No managed CI/CD vendor needed |
| **Backup** | **Restic** or **pgBackRest** | Encrypted backups to S3-compatible storage (MinIO or B2) |

### 3.2 Core External Services (Unavoidable)

| Service | What We Use Them For | What We DON'T Use Them For |
|---------|----------------------|---------------------------|
| **Stripe** | Card tokenization, PCI-compliant payment processing | We store ALL invoice, payment, and homeowner data in OUR database. Stripe only sees tokens. |
| **Plaid** | Automatic bank transaction sync from 12,000+ financial institutions | We store ALL transaction categorization, reconciliation logic, and reporting in OUR database. Plaid only delivers raw transaction data. |

**Why Stripe stays:**
- Building a card processor requires PCI DSS Level 1 certification ($500K+), banking partnerships, fraud detection ML, chargeback handling, and regulatory compliance in all 50 states.
- Stripe Elements puts the card form in an iframe on Stripe's domain. Our servers never touch raw card numbers. We only store the Stripe customer ID and payment method tokens.

**Why Plaid stays:**
- Bank APIs are fragmented, heavily regulated, and require individual contracts with each financial institution.
- Plaid provides unified access to 12,000+ banks via a single integration.
- This is a **major selling point** for treasurers — automatic bank sync turns "vibes into ROI talk."
- We store all transaction categorization, reconciliation logic, and financial reporting ourselves. Plaid only delivers raw data.

---

## 4. Key Architecture Decisions

### ADR-101: VPS + Docker Compose Over Kubernetes

**Decision:** Single VPS running Docker Compose, not Kubernetes cluster.

**Rationale:**
- 10-100 home HOAs = low concurrent user count. A single 4-core/16GB VPS handles 500+ concurrent users easily.
- Docker Compose is simpler to reason about, debug, and recover.
- Horizontal scaling (k8s) is premature optimization for MVP. We can migrate later if needed.
- Restic backups + Docker volumes = easy disaster recovery.

**Trade-offs:**
- Single point of failure — mitigated by nightly backups, database replication to secondary VPS for warm standby
- No auto-scaling — mitigated by VPS upgrade path (Hetzner CX51 → CPX41 → CPX51)

---

### ADR-102: PostgreSQL + pgvector for All Data Including Vectors

**Decision:** Use a single PostgreSQL instance with pgvector extension for both relational data AND vector embeddings.

**Rationale:**
- One database to backup, replicate, and monitor.
- Hybrid search in a single query: `SELECT * FROM documents WHERE community_id = 'x' ORDER BY embedding <-> query_vec LIMIT 5;`
- No network hop to separate vector database = lower latency.
- pgvector supports HNSW indexes for fast approximate nearest neighbor search at scale.

**Trade-offs:**
- PostgreSQL is not purpose-built for vectors — mitigated by HNSW index + reasonable embedding count (~10K per community = trivial)

---

### ADR-103: Ollama for Self-Hosted AI

**Decision:** Run Ollama on the same VPS (or a dedicated inference box) with Llama 3.1 8B or Mistral 7B.

**Rationale:**
- Zero per-request costs. One-time GPU cost or CPU inference.
- No data leaves our server. Homeowner questions, CC&Rs, and bylaws never touch a third-party API.
- Ollama provides model management (pull, switch, quantize) via simple CLI.
- Llama 3.1 8B is competitive with GPT-3.5 for FAQ-style question answering. Fine-tuning on community docs improves accuracy.

**Architecture:**
```
Homeowner asks: "When is trash pickup?"
    → Next.js API
    → pgvector RAG: SELECT content FROM document_chunks 
                     WHERE community_id = '...' 
                     ORDER BY embedding <-> query_embedding LIMIT 5;
    → POST to Ollama localhost:11434/api/generate
      { model: "llama3.1", prompt: "Context: [...] Question: When is trash pickup?", stream: true }
    → Stream response back via Server-Sent Events
    → Log interaction to PostgreSQL
```

**Hardware Options:**

| Setup | Cost | Response Time | Notes |
|-------|------|---------------|-------|
| CPU only (VPS 4-core/16GB) | $0 extra | 8-15 sec | Llama 3.1 8B Q4_K_M, acceptable for MVP |
| GPU instance (NVIDIA T4) | +$40-80/mo | 2-4 sec | Rent from Vast.ai or Lambda Labs |
| Dedicated inference box | $600 one-time | 1-2 sec | RTX 3060 12GB in home/office, no monthly cost |
| Apple Silicon Mac Mini M2 | $600 one-time | 1-2 sec | 16GB unified memory, whisper-quiet, runs Ollama perfectly |

**Recommendation for MVP:** CPU inference on the VPS. Upgrade to GPU when you have 50+ active communities and the latency complaints start.

---

### ADR-104: NextAuth.js v5 Over Supabase Auth

**Decision:** Use NextAuth.js v5 (Auth.js) with the PostgreSQL adapter for session management.

**Rationale:**
- Fully self-hosted. No external auth service.
- Supports OAuth (Google, Apple), email magic links, credentials (password), and custom providers.
- Session data stored in our PostgreSQL = queryable, auditable, ours.
- No vendor lock-in. Can swap adapters without touching user data.

**Trade-offs:**
- Need to implement email verification, password reset, MFA ourselves — mitigated by Auth.js built-in flows + community packages
- No built-in Realtime/Websocket auth integration — mitigated by Socket.io + session cookie validation

---

### ADR-105: MinIO Over S3 / Supabase Storage

**Decision:** Use MinIO as self-hosted S3-compatible object storage.

**Rationale:**
- Drop-in S3 API replacement. Libraries built for AWS S3 work with MinIO with zero code changes.
- Buckets per community for logical isolation.
- Signed URL generation for secure file access.
- Image transforms via MinIO's built-in capabilities or Sharp (Node.js) on the server.

---

### ADR-106: Meilisearch Over Algolia / Typesense

**Decision:** Use Meilisearch for full-text search across documents, announcements, and directory.

**Rationale:**
- Self-hosted, single binary, low memory footprint.
- Typo-tolerant, faceted, and fast (<50ms).
- Simple REST API. Can be queried directly from frontend for public data.
- Replaces both Supabase full-text search and Algolia/Typesense.

---

### ADR-107: Socket.io Over Supabase Realtime

**Decision:** Use Socket.io server for WebSocket realtime updates.

**Rationale:**
- Self-hosted, no external realtime service.
- Room-based subscriptions (per community, per meeting).
- Presence tracking (who's online in a meeting).
- Falls back to HTTP long-polling if WebSocket blocked.

**Events:**
- `community:<id>:announcement` — New announcement posted
- `community:<id>:violation` — Violation status changed
- `meeting:<id>:agenda` — Live agenda updates during meeting
- `meeting:<id>:vote` — Live vote tally

---

### ADR-108: Plaid Integration (Month 3-4)

**Decision:** Integrate Plaid for automatic bank transaction sync by Month 3-4.

**Rationale:**
- This is a **major selling point** for the treasurer persona.
- Automatic transaction import eliminates manual CSV downloads and imports.
- Real-time balance tracking and reconciliation suggestions.
- Plaid delivers raw data; we own all categorization, reconciliation, and reporting logic.

**Integration Timeline:**
- **Month 1-2 (MVP):** Manual CSV/OFX import with smart reconciliation UI
- **Month 3-4:** Add Plaid Link + webhooks for automatic sync
- **Month 5+:** Multi-account support, investment account tracking

**Data Flow:**
```
Treasurer connects bank account
    → Plaid Link (client-side, no credentials touch our server)
    → Plaid access token returned
    → Encrypt token, store in PostgreSQL
    → Nightly cron job calls Plaid /transactions/get
    → New transactions inserted into our transactions table
    → Auto-categorize based on description patterns
    → Suggest matches to existing invoices
    → Treasurer reviews and confirms
```

**Security:**
- Plaid access tokens encrypted at application level before storage (AES-256-GCM)
- Token rotation every 90 days
- Webhook signature verification on all Plaid callbacks
- No bank credentials ever touch our servers (Plaid Link handles this)

---

## 5. Database Schema (Summary)

See `database-schema.md` for full schema with indexes, constraints, and RLS policies.

**Core Tables:**
- `communities` — Tenant root
- `users` (NextAuth.js) — Auth users
- `app_users` — Extended profiles with roles
- `homes` — Properties
- `documents` — CC&Rs, bylaws, minutes, contracts
- `document_chunks` — Vector embeddings for RAG
- `meetings` — Scheduled meetings, agendas, minutes
- `violations` — Violation reports, status, photos
- `arc_requests` — Architectural review requests
- `invoices` — Dues, special assessments, fines
- `payments` — Payment records linked to Stripe
- `transactions` — Bank transactions (manual import + Plaid sync)
- `import_batches` — CSV/OFX upload tracking
- `bank_accounts` — Connected accounts (Plaid-linked or manual)
- `announcements` — Community-wide communications
- `compliance_items` — Filing deadlines, insurance renewals, etc.
- `maintenance_requests` — Work orders
- `chat_sessions` — AI chat history
- `activity_logs` — Audit trail
- `push_subscriptions` — Web Push notifications

---

## 6. API Design

See `api-spec.md` for full OpenAPI-style specification.

**Pattern:** Next.js API Routes with `app/api/` colocated handlers.
**Auth:** NextAuth.js session cookie + JWT for mobile.
**Key Endpoints:**
- `POST /api/ai/chat` — AI assistant (streaming from Ollama)
- `GET /api/documents` — List/search documents (Meilisearch + pgvector)
- `POST /api/violations` — Create violation report
- `GET /api/meetings` — List meetings
- `POST /api/payments` — Initiate payment (Stripe)
- `GET /api/accounting/summary` — Financial dashboard data
- `POST /api/accounting/import` — CSV/OFX bank import
- `POST /api/plaid/connect` — Initiate Plaid Link
- `POST /api/plaid/sync` — Trigger manual Plaid sync
- `GET /api/compliance` — Upcoming deadlines

---

## 7. Security Model

See `security-model.md` for full security architecture.

**Layers:**
1. Transport: TLS 1.3 everywhere (Caddy auto-HTTPS)
2. Auth: NextAuth.js (JWT, OAuth, MFA)
3. Authorization: RLS policies per table + API middleware
4. Data: LUKS full-disk encryption + PostgreSQL at rest
5. Payments: Stripe Elements (PCI DSS scope reduction), never touch raw card data
6. Bank Sync: Plaid tokens encrypted at app level, no credentials touch our servers
7. AI: No PII in prompts, RAG context scoped to community, all inference on our metal

---

## 8. Deployment Architecture

```
Developer Push
    → GitHub
    → GitHub Actions (test, lint, typecheck, build Docker image)
    → Docker image pushed to GitHub Container Registry (free)
    → SSH to VPS + docker-compose pull + docker-compose up -d
    → Database migrations run via Prisma Migrate
    → Zero-downtime deploy via Caddy health checks + Docker restart
```

**Environments:**
- **production** — Live VPS, live domain
- **staging** — Second cheap VPS or Docker on local machine
- **local** — Docker Compose on developer machine (identical to prod)

---

## 9. Monitoring & Observability

| Tool | Purpose | Access |
|------|---------|--------|
| **Grafana** | Dashboards for all metrics | https://grafana.properhoa.com (auth required) |
| **Prometheus** | Metrics collection | Internal only |
| **Loki** | Log aggregation | Grafana integration |
| **Node Exporter** | VPS CPU, memory, disk metrics | Prometheus target |
| **cAdvisor** | Docker container metrics | Prometheus target |
| **Uptime Kuma** | External uptime monitoring | Checks API every 60 seconds |

**Alerts (via Grafana Alerting → Email/Discord):**
- API response time >500ms for 5 minutes
- PostgreSQL connections >80% of max
- Disk usage >80%
- Ollama model not responding
- Backup failure
- Plaid sync failure (if enabled)

---

## 10. Backup & Disaster Recovery

| Data | Method | Frequency | Retention |
|------|--------|-----------|-----------|
| PostgreSQL | pg_dump + Restic to B2/MinIO | Daily | 30 days |
| MinIO objects | MinIO bucket replication | Realtime | 30 days |
| Ollama models | Tarball to B2 | Monthly | 2 versions |
| Configuration | Git repo + encrypted secrets | Every deploy | Git history |

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours (daily backups)

**Warm Standby:**
- Secondary cheap VPS ($10/mo) with streaming PostgreSQL replication
- In production failure, promote standby + update DNS = <30 min recovery

---

## 11. Compliance Roadmap

| Compliance | Target | Approach |
|------------|--------|----------|
| **PCI DSS** | Month 3 | Stripe Elements (SAQ A), no card data touches our servers |
| **SOC 2 Type I** | Month 9 | Evidence collection on self-hosted infra |
| **SOC 2 Type II** | Month 15 | 6-month observation period |
| **GDPR/CCPA** | Month 3 | Data retention policies, export/delete APIs, consent |
| **State-specific** | Ongoing | Modular compliance engine, state templates |

---

## 12. Cost Model (Month 6 Projection)

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Primary VPS (Hetzner CX51) | $20 | 4 vCPU, 16GB RAM, 160GB NVMe |
| Backup VPS / Warm Standby | $10 | 2 vCPU, 4GB RAM |
| Domain + Cloudflare | $0 | Cloudflare free tier |
| Backblaze B2 (backups) | ~$2 | ~50GB stored |
| Stripe | Variable | 2.9% + 30¢ per transaction |
| Plaid | ~$100-150 | Production tier, per-account pricing |
| **Total Fixed** | **~$132-182/mo** | |

**Optional upgrades:**
- GPU instance for AI: +$40-80/mo (when needed)
- Dedicated inference box: $600 one-time

---

## 13. What We Own vs. What We Rent

| Category | What We Own | What We Rent (Unavoidable) |
|----------|-------------|---------------------------|
| **Compute** | VPS hardware (rented, but we control the stack) | N/A |
| **Database** | PostgreSQL, pgvector, all data | N/A |
| **Auth** | NextAuth.js, session store, passwords | N/A |
| **Storage** | MinIO, all files | N/A |
| **AI** | Ollama, Llama weights, prompts, embeddings | N/A |
| **Search** | Meilisearch index | N/A |
| **Monitoring** | Grafana, Prometheus, logs | N/A |
| **Payments** | Invoice data, homeowner data, payment records | Stripe tokenization only |
| **Bank Sync** | Transaction categorization, reconciliation, reporting | Plaid raw data delivery |

**Data Sovereignty:** 99% of user data never leaves infrastructure we control.

---

## 14. Migration Path from Managed to Self-Hosted

If we ever need to migrate FROM a managed service TO self-hosted:

| From | To | Effort |
|------|-----|--------|
| Supabase PostgreSQL | Self-hosted PostgreSQL | Low — pg_dump / pg_restore |
| Supabase Auth | NextAuth.js + PostgreSQL | Medium — user migration script, password reset required |
| Supabase Storage | MinIO | Low — S3-compatible, copy objects |
| OpenAI | Ollama | Low — swap API endpoint, same prompt format |
| Pinecone | pgvector | Medium — export vectors, create HNSW index |
| Vercel | VPS + Docker | Medium — Dockerize Next.js, Caddy config |

**We're building on the destination architecture from day one. No migration needed.**

---

## 15. Phase 1 vs Phase 2 Features

### Phase 1 (Months 1-2): MVP

| Feature | Stack | Status |
|---------|-------|--------|
| Web app (Next.js) | Self-hosted | Core |
| Mobile app (Expo) | Self-hosted | Core |
| Auth (NextAuth.js) | Self-hosted | Core |
| Database (PostgreSQL + pgvector) | Self-hosted | Core |
| AI Assistant (Ollama) | Self-hosted | Core |
| File storage (MinIO) | Self-hosted | Core |
| Search (Meilisearch) | Self-hosted | Core |
| Realtime (Socket.io) | Self-hosted | Core |
| Payments (Stripe) | External | Core |
| Manual bank import (CSV/OFX) | Self-hosted | Core |

### Phase 2 (Months 3-4): Differentiation

| Feature | Stack | Status |
|---------|-------|--------|
| Plaid bank sync | External | **Major selling point** |
| Smart Meeting Engine | Self-hosted | Differentiator |
| Violation/ARC Auto-Pilot | Self-hosted | Differentiator |
| Proactive Compliance Alerts | Self-hosted | Differentiator |
| Web Push Notifications | Self-hosted | Enhancement |

---

*Approved by: Product Owner (larrylegendrr)*  
*Date: 2026-05-01*  
*Next Gate: UX/UI Design → Implementation (Forge)*
