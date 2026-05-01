# ProperHOA — Security Model

**Version:** 1.0  
**Date:** 2026-05-01  
**Classification:** INTERNAL  
**Status:** DRAFT — Pending Security Review  

---

## 1. Security Architecture Overview

```
Client (Web/iOS/Android)
    → TLS 1.3 / HTTPS
    → Vercel Edge Network (DDoS / WAF / Rate Limit)
    → Next.js API Routes / Edge Functions
    → Supabase Auth (JWT / OAuth / MFA)
    → Row-Level Security (RLS) — Community Isolation
    → Supabase PostgreSQL / Storage (Encrypted at Rest)
    → Pinecone (Vector DB, No PII)
```

---

## 2. Authentication

### 2.1 Identity Provider: Supabase Auth

- Email/Password — Standard registration with email verification
- OAuth 2.0 — Google, Apple (critical for mobile SSO)
- Magic Link — Passwordless email login
- Phone/SMS — OTP-based (optional, for 2FA)
- MFA — TOTP (Google Authenticator) + Backup codes

### 2.2 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "community_id": "community-uuid",
  "app_role": "president",
  "exp": 1714587600,
  "iat": 1714584000,
  "aud": "authenticated"
}
```

**Token Lifetimes:**
- Access token: 60 minutes
- Refresh token: 7 days (sliding window)

### 2.3 Session Management

| Platform | Storage | Refresh Strategy |
|----------|---------|------------------|
| Web | httpOnly cookie + localStorage | Auto-refresh via interceptor |
| iOS | Keychain | Background refresh before expiry |
| Android | Keystore | Background refresh before expiry |

**Security Measures:**
- Refresh token rotation
- Device fingerprinting
- Concurrent session limit: 5 devices
- Forced logout on password change

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

**Core Principle:** Every database query is automatically filtered by community_id at the PostgreSQL level. Application bugs cannot leak cross-tenant data.

**RLS Policy Template:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_isolation" ON table_name
FOR ALL
TO authenticated
USING (
    community_id = (
        SELECT community_id FROM public.users 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "board_only_write" ON table_name
FOR INSERT
TO authenticated
WITH CHECK (
    community_id = (SELECT community_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) 
        IN ('president', 'treasurer', 'secretary', 'board_member')
);
```

---

## 4. Data Security

### 4.1 Encryption at Rest

| Data Type | Encryption Method | Key Management |
|-----------|-------------------|----------------|
| PostgreSQL data | AES-256 (Supabase managed) | Supabase AWS KMS |
| File storage | AES-256 (Supabase Storage) | Supabase managed |
| Backups | AES-256 | Supabase managed |
| Application secrets | AES-256-GCM | Vercel Environment Variables (encrypted) |
| Plaid tokens | AES-256 + app-level encryption | Custom key in Vercel secrets |

### 4.2 Encryption in Transit

- TLS 1.3 required for all connections
- HSTS headers enforced (max-age=31536000)
- Certificate pinning on mobile apps
- Supabase connection: SSL required, certificate verification enforced

### 4.3 Sensitive Data Handling

| Data Class | Storage | Access Log | Retention |
|------------|---------|------------|-----------|
| PII (names, emails, phones) | PostgreSQL + RLS | ✅ All access logged | Indefinite (until account deletion) |
| Financial (bank accounts, transactions) | PostgreSQL + RLS | ✅ All access logged | 7 years (IRS requirement) |
| Payment Cards | **Never stored** — Stripe tokens only | ✅ Stripe logs | N/A |
| Bank Credentials | **Never stored** — Plaid tokens only | ✅ Plaid logs | N/A |
| Documents | Supabase Storage + signed URLs | ✅ Download logged | Per community policy |
| Chat History | PostgreSQL + RLS | ✅ All queries logged | 2 years |
| Activity Logs | PostgreSQL | Immutable | 2 years |

### 4.4 Data Residency

- Primary: US East (Supabase US East region)
- Backup: US West (cross-region replication)
- CDN: Vercel Edge Network (global, cached only)
- AI Processing: OpenAI US regions (no data leaves US)

---

## 5. Payment Security (PCI DSS)

### 5.1 Scope Reduction Strategy

**Goal:** Achieve PCI SAQ A (simplest compliance) by never handling raw card data.

```
Homeowner enters card
    → Stripe Elements (iframe, Stripe's domain)
    → Stripe vaults card → returns token (pm_...)
    → Our server only sees token, never card number
    → Token used to create PaymentIntent
    → Stripe processes payment
```

### 5.2 Stripe Integration Security

- Stripe Elements: PCI-compliant UI components
- Webhook Verification: Stripe signature validation on all webhooks
- Idempotency Keys: Prevent duplicate charges
- 3D Secure: Required for European cards, enforced for suspicious transactions
- Fraud Detection: Stripe Radar enabled

### 5.3 Plaid Integration Security

- Plaid Link: Client-side token exchange (no credentials touch our servers)
- Access Tokens: Encrypted at application level before storage
- Webhook Verification: Plaid signature validation
- Token Rotation: Annual refresh of Plaid access tokens

---

## 6. AI Security

### 6.1 RAG Security Model

```
Homeowner asks: "What's the fence policy?"
    → AI query includes community_id in metadata
    → Pinecone search filters by community_id
    → Only this community's documents retrieved
    → GPT-4o generates answer from retrieved context
    → Response scoped to community, no cross-contamination
```

### 6.2 PII Protection in AI

| Rule | Implementation |
|------|----------------|
| No PII in prompts | Strip names, addresses, phone numbers before sending to AI |
| No financial data | Never include payment amounts, account numbers in AI context |
| Context isolation | Each query only sees its own community's documents |
| Response filtering | Post-process AI responses to remove any leaked PII |
| Logging | AI queries logged without PII, used for model improvement |

### 6.3 AI Rate Limiting

| Tier | Requests/Day | Max Context Tokens |
|------|--------------|-------------------|
| Free | 50 | 4,000 |
| Essential | 200 | 8,000 |
| Pro | 1,000 | 16,000 |
| Enterprise | Unlimited | 32,000 |

---

## 7. API Security

### 7.1 Rate Limiting

| Endpoint | Limit | Window | Action on Exceed |
|----------|-------|--------|----------------|
| General API | 100 req | 1 min | 429 + exponential backoff |
| Auth (login/register) | 10 req | 1 min | 429 + CAPTCHA required |
| AI Chat | 10 req | 1 min | 429 + "Try again later" |
| File Upload | 10 req | 1 min | 429 |
| Payments | 30 req | 1 min | 429 + email alert |

**Implementation:** Upstash Redis + Vercel Edge Middleware

### 7.2 Input Validation

- Zod schemas for all API request validation
- SQL injection prevention: Parameterized queries only
- XSS prevention: Output encoding, Content Security Policy headers
- File upload validation: MIME type check, size limit (50MB), virus scan

### 7.3 CORS Policy

```
Allowed Origins:
  - https://properhoa.com
  - https://app.properhoa.com
  - https://*.vercel.app (preview deployments)
  
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
| Biometric auth | Face ID / Touch ID for sensitive actions |
| Secure storage | iOS Keychain / Android Keystore for tokens |
| Certificate pinning | Expo SSL pinning for API calls |
| Deep link validation | URL scheme registered, validation required |

### 8.2 Push Notification Security

- Expo Push Tokens: Scoped to device, revocable
- Notification Content: Never include PII or financial data
- Actionable Notifications: Require auth confirmation for destructive actions

---

## 9. Operational Security

### 9.1 Secret Management

| Secret | Storage | Rotation |
|--------|---------|----------|
| Supabase service role key | Vercel Environment | Quarterly |
| Stripe secret key | Vercel Environment | Quarterly |
| Plaid client ID/secret | Vercel Environment | Quarterly |
| OpenAI API key | Vercel Environment | Monthly |
| Pinecone API key | Vercel Environment | Quarterly |
| Plaid access tokens (per community) | PostgreSQL + AES-256 | Annually |
| JWT signing secret | Supabase managed | N/A (managed) |

### 9.2 Logging & Monitoring

| Layer | Tool | What We Log |
|-------|------|-------------|
| Application errors | Sentry | Exceptions, stack traces, user context |
| API access | Vercel Analytics + Supabase Logs | Request path, status, latency, user ID |
| Database queries | Supabase Logs | Slow queries, RLS violations, failed auth |
| Security events | Custom audit log | Login attempts, role changes, data exports |
| AI interactions | Custom log | Query content (anonymized), response, tokens used |

**Alerting:**
- Failed login threshold: >10 attempts in 5 minutes → Slack alert
- RLS violation: Immediate alert to security channel
- Payment failure spike: >5% failure rate → PagerDuty

### 9.3 Incident Response

| Severity | Response Time | Escalation |
|----------|--------------|------------|
| Critical (data breach) | 15 minutes | All hands + legal |
| High (payment outage) | 30 minutes | Engineering lead |
| Medium (feature down) | 2 hours | On-call engineer |
| Low (performance degradation) | 4 hours | Next business day |

---

## 10. Compliance Roadmap

### 10.1 PCI DSS (Payment Card Industry)

| Milestone | Target Date | Approach |
|-----------|-------------|----------|
| SAQ A Self-Assessment | Month 3 | Stripe Elements = scope reduction |
| Quarterly security scan | Ongoing | Approved scanning vendor |
| Penetration test | Month 6 | Third-party assessment |

### 10.2 SOC 2

| Milestone | Target Date | Approach |
|-----------|-------------|----------|
| Type I | Month 9 | Vanta/Drata automation |
| Type II | Month 15 | 6-month observation period |

### 10.3 Privacy (GDPR/CCPA)

| Requirement | Implementation |
|-------------|----------------|
| Right to access | GET /api/export — full data dump |
| Right to delete | DELETE /api/account — cascade delete + Stripe/Plaid cleanup |
| Right to portability | JSON export of all user data |
| Consent management | Checkbox on registration, granular notification prefs |
| Data retention | Auto-delete chat history after 2 years, activity logs after 2 years |
| Breach notification | 72-hour internal process, 72-hour regulatory notification |

---

## 11. Security Checklist (Pre-Launch)

- [ ] All RLS policies enabled and tested
- [ ] Penetration test completed (third-party)
- [ ] Dependency vulnerability scan (Snyk/Dependabot)
- [ ] Stripe webhook signature verification implemented
- [ ] Plaid webhook signature verification implemented
- [ ] Rate limiting configured and tested
- [ ] MFA enabled for all admin accounts
- [ ] Backup and disaster recovery tested
- [ ] Incident response plan documented
- [ ] Security training completed for all team members
- [ ] Bug bounty program launched (HackerOne or similar)

---

*Security model designed for ProperHOA v1.0 MVP*  
*Defense in depth: Edge → Auth → RLS → Encryption → Monitoring*
