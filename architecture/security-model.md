# ProperHOA — Security Model v1.1 (Self-Hosted)

**Version:** 1.1  
**Date:** 2026-05-01  
**Classification:** INTERNAL  
**Status:** DRAFT — Pending Security Review  

---

## 1. Security Architecture Overview

```
Users (Web/iOS/Android)
    → Cloudflare (DNS + DDoS, free tier)
    → Caddy (TLS 1.3, auto HTTPS, rate limiting)
    → Docker Compose Stack
        ├── Next.js App (web + API)
        ├── PostgreSQL + pgvector (encrypted at rest via LUKS)
        ├── Redis (auth sessions, rate limiting)
        ├── MinIO (file storage, bucket policies)
        ├── Meilisearch (search index, no PII)
        ├── Ollama (LLM inference, no external API)
        ├── Socket.io (WebSocket auth)
        └── Grafana + Prometheus (monitoring, internal only)
    → Stripe (card tokenization only — iframe, our servers never touch card data)
```

---

## 2. Authentication

### 2.1 Identity Provider: NextAuth.js v5 (Auth.js)

Self-hosted authentication with PostgreSQL session storage:

- **Email/Password** — Bcrypt-hashed passwords (salt rounds: 12)
- **OAuth 2.0** — Google, Apple (via Auth.js providers)
- **Magic Link** — Time-limited signed tokens (15 min expiry)
- **Session** — Encrypted JWT or database sessions (configurable)

### 2.2 Session Management

| Platform | Storage | Transport |
|----------|---------|-----------|
| Web | httpOnly cookie (signed, SameSite=Lax) | TLS 1.3 |
| Mobile | JWT Bearer token (short-lived) | TLS 1.3 |

**Security Measures:**
- Session expiry: 30 days (web), 7 days (mobile)
- Concurrent session limit: 5 per user
- Forced logout on password change
- Device fingerprinting (user agent + IP subnet logging)

### 2.3 Password Policy

- Minimum 10 characters
- No common passwords (check against Have I Been Pwned API at registration)
- Bcrypt with salt rounds 12 (resistant to GPU cracking)
- Optional MFA via TOTP (Google Authenticator)

---

## 3. Authorization

### 3.1 Role-Based Access Control (RBAC)

```
SUPER_ADMIN → Platform admin (Leap Ahead Labs)
    ↓
PRESIDENT → Full community control
TREASURER → Financial + read all
SECRETARY → Meetings + docs + read all
BOARD_MEMBER → Read all + create violations/ARC
    ↓
HOMEOWNER → Own home data + community public info
```

### 3.2 Permission Matrix

| Feature | Super Admin | President | Treasurer | Secretary | Board Member | Homeowner |
|---------|:-----------:|:---------:|:---------:|:---------:|:------------:|:---------:|
| Manage Community Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Users / Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Financials | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Invoices | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Own Home Invoices | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Meetings | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Edit Meeting Minutes | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Create Violations | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View All Violations | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Vote on ARC | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Upload Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Public Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Private Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Post Announcements | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Use AI Assistant | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Directory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 3.3 Row-Level Security (RLS)

**Core Principle:** Every database query is automatically filtered by `community_id` at the PostgreSQL level.

**Implementation:**
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_isolation" ON documents
FOR ALL
TO app_user
USING (community_id = current_setting('app.current_community_id')::UUID);

CREATE POLICY "public_documents" ON documents
FOR SELECT
TO app_user
USING (
    community_id = current_setting('app.current_community_id')::UUID
    AND is_public = true
);
```

**Per-Request Context:**
```typescript
// Next.js middleware sets RLS context
await prisma.$executeRaw`SET app.current_community_id = '${user.communityId}'`;
await prisma.$executeRaw`SET app.current_role = '${user.role}'`;
```

---

## 4. Data Security

### 4.1 Encryption at Rest

| Data Type | Encryption Method | Key Management |
|-----------|-------------------|----------------|
| VPS disk | **LUKS full-disk encryption** | Hetzner/DigitalOcean admin console |
| PostgreSQL data | LUKS (at filesystem level) | VPS provider |
| Application secrets | **AES-256-GCM** | Environment variables, Docker secrets |
| MinIO objects | Server-side encryption (SSE-S3) | MinIO admin key |
| Backup archives | **AES-256 + Restic** | Password stored in password manager |
| Plaid tokens (if ever added) | AES-256 + app-level encryption | Custom key in Docker secrets |

### 4.2 Encryption in Transit

- **TLS 1.3** required for all connections (Caddy auto-HTTPS)
- **HSTS** headers enforced (max-age=31536000)
- **Certificate pinning** on mobile apps (Expo SSL pinning)
- **PostgreSQL connection:** SSL required, certificate verification
- **MinIO connection:** HTTPS, signed URLs with expiry

### 4.3 Sensitive Data Handling

| Data Class | Storage | Access Log | Retention |
|------------|---------|------------|-----------|
| PII (names, emails, phones) | PostgreSQL + RLS | ✅ All access logged | Indefinite (until account deletion) |
| Financial (bank accounts, transactions) | PostgreSQL + RLS | ✅ All access logged | 7 years (IRS requirement) |
| Payment Cards | **Never stored** — Stripe tokens only | ✅ Stripe logs | N/A |
| Bank Credentials | **Never stored** — CSV import only | N/A (manual upload) | N/A |
| Documents | MinIO + bucket policies + signed URLs | ✅ Download logged | Per community policy |
| Chat History | PostgreSQL + RLS | ✅ All queries logged | 2 years |
| Activity Logs | PostgreSQL | Immutable | 2 years |
| AI Prompts/Responses | PostgreSQL + RLS | ✅ All interactions logged | 2 years |

### 4.4 Data Sovereignty

- **Primary:** Self-hosted VPS (US East or operator's choice)
- **Backup:** Backblaze B2 or self-hosted MinIO secondary bucket
- **CDN:** Cloudflare (caches only, no data storage)
- **AI Processing:** Ollama on same VPS or dedicated inference box — **no data leaves our infrastructure**

---

## 5. Payment Security (PCI DSS)

### 5.1 Scope Reduction Strategy

**Goal:** Achieve PCI SAQ A (simplest compliance) by never handling raw card data.

```
Homeowner enters card
    → Stripe Elements (iframe, Stripe's domain, their PCI scope)
    → Stripe vaults card → returns token (pm_...)
    → Our server only sees token
    → Token used to create PaymentIntent
    → Stripe processes payment
```

### 5.2 Stripe Integration Security

- **Stripe Elements:** PCI-compliant UI components in iframe
- **Webhook Verification:** Stripe signature validation on all webhooks
- **Idempotency Keys:** Prevent duplicate charges
- **3D Secure:** Required for suspicious transactions
- **Fraud Detection:** Stripe Radar enabled

### 5.3 What We Store (Our Database)

```json
{
  "stripe_customer_id": "cus_...",
  "stripe_payment_method_id": "pm_...",
  "stripe_subscription_id": "sub_...",
  "invoice_amount": 150.00,
  "payment_status": "succeeded",
  "paid_at": "2026-05-01T14:30:00Z"
}
```

**We NEVER store:** Card numbers, CVV, expiry dates, bank account numbers, routing numbers.

---

## 6. AI Security (Ollama)

### 6.1 Zero External AI Data Leakage

**Critical:** Because we use self-hosted Ollama, NO homeowner data, CC&Rs, bylaws, or prompts ever leave our infrastructure.

```
Homeowner asks: "What's the fence policy?"
    → Next.js API (our server)
    → pgvector RAG query (our database)
    → Ollama localhost:11434 (our server)
    → Response streamed back
    → All data stays on our metal
```

### 6.2 RAG Security Model

```sql
-- Embedding query is scoped by community_id
SELECT content FROM document_chunks
WHERE community_id = 'user-community-uuid'
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

**Guarantee:** A user from Community A cannot retrieve documents from Community B because the `WHERE community_id = ...` clause is enforced at the database level before the vector search executes.

### 6.3 PII Protection in AI

| Rule | Implementation |
|------|----------------|
| No PII in prompts | Strip names, addresses, phone numbers before sending to Ollama |
| No financial data | Never include payment amounts in AI context |
| Context isolation | Each query only sees its own community's documents |
| Response filtering | Post-process AI responses to remove any leaked PII |
| Logging | AI queries logged without PII, used for model improvement |

### 6.4 AI Rate Limiting

| Tier | Requests/Day | Max Context Tokens |
|------|--------------|-------------------|
| Free | 50 | 4,000 |
| Essential | 200 | 8,000 |
| Pro | 1,000 | 16,000 |
| Enterprise | Unlimited | 32,000 |

**Enforcement:** Redis counters per user per day.

---

## 7. API Security

### 7.1 Rate Limiting (Redis)

| Endpoint | Limit | Window | Action |
|----------|-------|--------|--------|
| General API | 100 req | 1 min | 429 + exponential backoff |
| Auth (login/register) | 10 req | 1 min | 429 + CAPTCHA |
| AI Chat | 10 req | 1 min | 429 |
| File Upload | 10 req | 1 min | 429 |
| Payments | 30 req | 1 min | 429 + email alert |

### 7.2 Input Validation

- **Zod schemas** for all API request validation
- **SQL injection prevention:** Prisma ORM (parameterized queries only)
- **XSS prevention:** Output encoding, Content Security Policy headers
- **File upload validation:** MIME type check, size limit (50MB), ClamAV scan (if installed)

### 7.3 CORS Policy

```
Allowed Origins:
  - https://properhoa.com
  - https://app.properhoa.com
  - https://*.properhoa.com
  
Allowed Methods: GET, POST, PUT, DELETE, PATCH
Credentials: true (cookies)
Max Age: 86400
```

---

## 8. Mobile Security

### 8.1 App Hardening

| Measure | Implementation |
|---------|----------------|
| Code obfuscation | Enabled in production builds |
| Root/jailbreak detection | Expo Security module |
| Screenshot prevention | iOS: UIApplication.shared.isIdleTimerDisabled |
| Biometric auth | Face ID / Touch ID for payments |
| Secure storage | iOS Keychain / Android Keystore for tokens |
| Certificate pinning | Expo SSL pinning for API calls |
| Deep link validation | URL scheme registered |

### 8.2 Push Notification Security

- **Web Push:** VAPID keys for browser push, subscription stored in our database
- **Native Push:** Expo Push Tokens or Firebase (optional), never include PII in notification body

---

## 9. Operational Security

### 9.1 Secret Management

| Secret | Storage | Rotation |
|--------|---------|----------|
| NextAuth secret | Docker secrets / environment | Quarterly |
| PostgreSQL password | Docker secrets | Quarterly |
| Redis password | Docker secrets | Quarterly |
| MinIO access/secret keys | Docker secrets | Quarterly |
| Stripe secret key | Docker secrets | Quarterly |
| Meilisearch master key | Docker secrets | Quarterly |
| Ollama API (if exposed) | Docker network only (no external exposure) | N/A |
| Backup encryption key | Password manager | Annually |
| JWT signing secret | Docker secrets | Quarterly |

### 9.2 Logging & Monitoring

| Layer | Tool | What We Log |
|-------|------|-------------|
| Application errors | Sentry (self-hosted or cloud) | Exceptions, stack traces |
| API access | Promtail → Loki → Grafana | Request path, status, latency, user ID |
| Database queries | PostgreSQL slow query log | Queries >100ms, RLS violations |
| Security events | Custom audit table | Login attempts, role changes, data exports |
| AI interactions | Custom table | Query content (anonymized), response, model used |
| File access | MinIO audit log | Uploads, downloads, signed URL generation |

**Alerts (Grafana Alerting → Email/Discord):**
- Failed login threshold: >10 attempts in 5 minutes
- RLS violation detected
- Payment failure spike: >5%
- Disk usage >80%
- Ollama model not responding
- Backup failure

### 9.3 Incident Response

| Severity | Response Time | Escalation |
|----------|--------------|------------|
| Critical (data breach) | 15 minutes | All hands + legal |
| High (payment outage) | 30 minutes | Engineering lead |
| Medium (feature down) | 2 hours | On-call engineer |
| Low (performance degradation) | 4 hours | Next business day |

---

## 10. Compliance Roadmap

### 10.1 PCI DSS

| Milestone | Target Date | Approach |
|-----------|-------------|----------|
| SAQ A Self-Assessment | Month 3 | Stripe Elements = scope reduction |
| Quarterly security scan | Ongoing | OpenVAS or third-party |
| Penetration test | Month 6 | Third-party assessment |

### 10.2 SOC 2

| Milestone | Target Date | Approach |
|-----------|-------------|----------|
| Type I | Month 9 | Self-hosted evidence collection |
| Type II | Month 15 | 6-month observation period |

### 10.3 Privacy (GDPR/CCPA)

| Requirement | Implementation |
|-------------|----------------|
| Right to access | GET /api/export — full data dump |
| Right to delete | DELETE /api/account — cascade delete + Stripe cleanup |
| Right to portability | JSON export of all user data |
| Consent management | Checkbox on registration, granular notification prefs |
| Data retention | Auto-delete chat history after 2 years, activity logs after 2 years |
| Breach notification | 72-hour internal process, 72-hour regulatory notification |

---

## 11. Security Checklist (Pre-Launch)

- [ ] LUKS full-disk encryption enabled on VPS
- [ ] All RLS policies enabled and tested
- [ ] Penetration test completed (third-party)
- [ ] Dependency vulnerability scan (Snyk/Dependabot/npm audit)
- [ ] Stripe webhook signature verification implemented
- [ ] Rate limiting configured and tested
- [ ] MFA enabled for all admin accounts
- [ ] Backup and disaster recovery tested (restore from Restic backup)
- [ ] Incident response plan documented
- [ ] Security training completed for all team members
- [ ] Bug bounty program launched (HackerOne or similar)
- [ ] Ollama not exposed to public internet (Docker network only)
- [ ] MinIO buckets properly ACL'd (no public access)
- [ ] Redis not exposed to public (bind to Docker network only)

---

*Security model designed for ProperHOA v1.1 — Self-Hosted Edition*  
*Defense in depth: Edge → TLS → Auth → RLS → Encryption → Monitoring*  
*Zero external AI data leakage — all intelligence runs on our metal*
