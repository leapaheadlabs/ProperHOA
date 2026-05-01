# ProperHOA — Architecture Decision Record (ADR)

**Version:** 1.0  
**Date:** 2026-05-01  
**Author:** Command (OpenClaw)  
**Status:** APPROVED — Product Owner confirmed Vercel + Supabase + Design System constraints  

---

## 1. Architecture Overview

```
Client (Web/iOS/Android)
    → TLS 1.3
    → Vercel Edge Network (CDN + WAF)
    → Next.js App Router / API Routes
    → Supabase Auth (JWT)
    → Row-Level Security (RLS)
    → Supabase PostgreSQL / Realtime / Storage
    ↓
    → Vercel AI SDK + OpenAI GPT-4o (Edge Functions)
    → Pinecone (Vector DB for RAG)
    → Stripe (Payments)
    → Plaid (Bank Sync)
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend (Web)** | Next.js 14+ (App Router) | Vercel-native, SSR/SSG, React ecosystem |
| **Frontend (Mobile)** | Expo + React Native | Single codebase iOS/Android, shares React logic with web |
| **API / Backend** | Next.js API Routes + Edge Functions | Colocated with frontend, zero cold start on Vercel |
| **Database** | Supabase PostgreSQL | Managed Postgres, RLS, realtime subscriptions |
| **Auth** | Supabase Auth | Built-in JWT, OAuth, MFA, session management |
| **Realtime** | Supabase Realtime | Native WebSocket, no extra vendor |
| **File Storage** | Supabase Storage | S3-compatible, signed URLs, image transforms |
| **Search** | Supabase Full-Text + Pinecone | Postgres tsvector for documents, Pinecone for semantic/AI |
| **AI** | Vercel AI SDK + OpenAI GPT-4o | Streaming UI, RAG pipeline, tool calling |
| **Vector DB** | Pinecone | Low-latency semantic search, metadata filtering |
| **Payments** | Stripe + Plaid | Stripe for dues, Plaid for bank sync |
| **Hosting** | Vercel | Edge network, preview deployments, zero-config CI/CD |
| **Design System** | Radix UI + Tailwind CSS + shadcn/ui | Accessible primitives, custom theming |

---

## 3. Key Architecture Decisions

### ADR-001: Next.js + Vercel for Full-Stack

**Decision:** Use Next.js App Router with API Routes on Vercel for both web UI and backend API.

**Rationale:**
- Single codebase for frontend and API
- Vercel edge network provides <50ms latency globally
- Serverless functions auto-scale, zero ops overhead
- Preview deployments per PR = rapid iteration

**Trade-offs:**
- Function execution limits (60s hobby, 300s pro) — mitigated by Supabase Edge Functions for long-running tasks
- Cold starts rare on Vercel but possible — mitigated by Edge Functions for AI/chat

---

### ADR-002: Supabase as Backend Platform

**Decision:** Use Supabase for database, auth, realtime, and storage.

**Rationale:**
- Managed PostgreSQL with RLS = built-in multi-tenancy
- Realtime subscriptions out of the box
- Auth with OAuth, MFA, passwordless
- Storage with signed URLs and image transforms
- Same vendor = unified billing

**Trade-offs:**
- Vendor lock-in — mitigated by standard PostgreSQL (can migrate)
- Realtime connection limits — mitigated by connection pooling

---

### ADR-003: Expo + React Native for Mobile

**Decision:** Use Expo (managed workflow) with React Native for iOS and Android.

**Rationale:**
- Shared business logic with Next.js web app
- OTA updates without App Store review
- Expo SDK provides camera, push notifications, filesystem
- Faster to MVP than native Swift/Kotlin

**Alternative considered:** Flutter — rejected due to team's React expertise and desire to share code with web.

---

### ADR-004: Vercel AI SDK + OpenAI for AI Assistant

**Decision:** Use Vercel AI SDK with OpenAI GPT-4o (gpt-4o-mini for cost-sensitive ops).

**Rationale:**
- Vercel AI SDK provides streaming UI components
- Built-in RAG support
- Tool calling for actions ("schedule meeting", "create violation")
- OpenAI leads on speed/price for GPT-4o class

**Architecture:**
```
Homeowner Question
    → Vercel Edge Function
    → Retrieve relevant docs from Pinecone (RAG, filtered by community_id)
    → OpenAI GPT-4o with system prompt + context
    → Stream response back to user
    → Log interaction for refinement
```

**Trade-offs:**
- OpenAI dependency — mitigated by fallback to Claude via AWS Bedrock
- Cost at scale — mitigated by caching common responses, using gpt-4o-mini for 80% of queries

---

### ADR-005: Pinecone for Vector Search

**Decision:** Use Pinecone as dedicated vector database for semantic document search.

**Rationale:**
- Purpose-built for vector search (vs pgvector which is slower at scale)
- Hybrid search (keyword + semantic) out of the box
- Metadata filtering (by community_id, document type, date range)
- Serverless tier = pay per query, scales to zero

**Data Flow:**
```
Document Upload (CC&R, Bylaw)
    → Supabase Storage
    → Trigger: Supabase Edge Function
    → Parse text (PDF/DOCX → text)
    → Chunk + embed via OpenAI text-embedding-3-small
    → Upsert to Pinecone (with community_id metadata)
```

---

### ADR-006: Stripe + Plaid for Payments & Accounting

**Decision:** Use Stripe for payment processing and Plaid for bank account sync.

**Rationale:**
- Stripe = industry standard for recurring billing, invoicing, autopay
- Stripe Elements = pre-built, PCI-compliant UI components
- Plaid = connects to 12,000+ financial institutions for automatic transaction import

**Flow:**
```
Dues Invoice Created
    → Stripe generates invoice + payment link
    → Homeowner pays via Stripe (card/ACH)
    → Webhook updates Supabase (payment status)
    → Plaid syncs bank transactions nightly
    → Treasurer sees reconciled books
```

---

### ADR-007: Multi-Tenancy via Row-Level Security

**Decision:** Implement multi-tenancy using PostgreSQL RLS with community_id as the tenant discriminator.

**Rationale:**
- True data isolation at the database level
- Supabase RLS policies are declarative and enforceable
- Single database = simpler ops, shared resources = lower cost

**RLS Policy Example:**
```sql
CREATE POLICY "Users can only see their community's data"
ON homeowners
FOR ALL
USING (community_id = (
    SELECT community_id FROM users WHERE id = auth.uid()
));
```

---

## 4. Database Schema (Summary)

See `database-schema.md` for full schema with indexes, constraints, and RLS policies.

**Core Tables:**
- `communities` — Tenant root
- `users` — Board members & homeowners (Supabase Auth users extended)
- `homes` — Individual properties within a community
- `documents` — CC&Rs, bylaws, minutes, contracts
- `meetings` — Scheduled meetings, agendas, minutes
- `violations` — Violation reports, status, photos
- `arc_requests` — Architectural review requests
- `invoices` — Dues, special assessments, fines
- `payments` — Payment records linked to Stripe
- `transactions` — Bank transactions synced via Plaid
- `announcements` — Community-wide communications
- `compliance_items` — Filing deadlines, insurance renewals, etc.

---

## 5. API Design

See `api-spec.md` for full OpenAPI-style specification.

**Pattern:** Next.js API Routes with app/api/ colocated handlers.
**Auth:** JWT from Supabase Auth, passed as Authorization: Bearer <token>.
**Key Endpoints:**
- POST /api/chat — AI assistant (streaming)
- GET /api/documents — List/search documents
- POST /api/violations — Create violation report
- GET /api/meetings — List meetings
- POST /api/payments — Initiate payment (Stripe)
- GET /api/accounting/summary — Financial dashboard data
- GET /api/compliance — Upcoming deadlines

---

## 6. Security Model

See `security-model.md` for full security architecture.

**Layers:**
1. Transport: TLS 1.3 everywhere
2. Auth: Supabase Auth (JWT, OAuth, MFA)
3. Authorization: RLS policies per table + API middleware
4. Data: Encrypted at rest (Supabase AES-256), encrypted in transit
5. Payments: Stripe Elements (PCI DSS scope reduction), never touch raw card data
6. AI: No PII in AI prompts, RAG context scoped to community

---

## 7. Deployment Architecture

```
Developer Push
    → GitHub
    → GitHub Actions (test, lint, typecheck)
    → Vercel Preview Deployment (per PR)
    → Merge to main
    → Vercel Production Deployment
    → Supabase Migrations Applied
    → Edge Functions Deployed
```

**Environments:**
- production — Live app, Supabase prod project
- staging — Mirror of prod, Supabase staging project
- preview — Per-PR deployment, ephemeral database

---

## 8. Compliance Roadmap

| Compliance | Target | Approach |
|------------|--------|----------|
| PCI DSS | Month 3 | Stripe Elements (SAQ A), never store card data |
| SOC 2 Type I | Month 9 | Vanta/Drata automation, policies, evidence |
| SOC 2 Type II | Month 15 | 6-month observation period |
| GDPR/CCPA | Month 3 | Data retention policies, export/delete APIs, consent |
| State-specific | Ongoing | Modular compliance engine, state templates |

---

## 9. Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| API response (p95) | <200ms | Edge caching, connection pooling, optimized queries |
| AI response (first token) | <500ms | Edge Functions, streaming, cached embeddings |
| Page load (LCP) | <2s | Next.js SSR/SSG, image optimization, Vercel Edge |
| Mobile app launch | <3s | Hermes, code splitting, lazy loading |
| Uptime | 99.9% | Vercel + Supabase SLA, health checks, alerting |

---

## 10. Cost Model (Month 6 Projection)

| Service | Tier | Est. Monthly |
|---------|------|-------------|
| Vercel Pro | Team plan | $40 |
| Supabase Pro | 8GB compute, 100GB storage | $25 |
| Pinecone Serverless | ~1M vectors | $25 |
| OpenAI API | ~50K requests/month | $50 |
| Stripe | 2.9% + 30¢ per transaction | Variable |
| Plaid | Production | ~$100 |
| Postmark / Resend | ~10K emails | $10 |
| Sentry | Team plan | $26 |
| Twilio | ~500 SMS | $5 |
| **Total Fixed** | | **~$180/mo** |

---

## 11. Open Questions

1. Background Jobs: Use Supabase Edge Functions + queues, or Vercel Cron + Edge Functions? (Decision: Supabase pg_cron + Edge Functions)
2. Push Notifications: Expo Push (free) vs OneSignal vs Firebase? (Decision: Expo Push for MVP, Firebase for scale)
3. Document Parsing: AWS Textract vs self-hosted Tika vs Supabase function? (Decision: Supabase Edge Function + pdf-parse)
4. Caching: Vercel KV vs Upstash Redis vs Supabase? (Decision: Upstash Redis for AI cache + rate limiting)

---

*Approved by: Product Owner (larrylegendrr)*  
*Date: 2026-05-01*  
*Next Gate: UX/UI Design → Implementation (Forge)*
