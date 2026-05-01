# ProperHOA — Database Schema v1.1 (Self-Hosted)

**Version:** 1.1  
**Date:** 2026-05-01  
**Database:** PostgreSQL 16+ with **pgvector** extension  
**Auth:** NextAuth.js v5 (Auth.js) with PostgreSQL adapter  
**Multi-tenancy:** Row-Level Security (RLS) via community_id  
**Vector Search:** pgvector (768-dim embeddings, HNSW index)  

---

## 1. Setup

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create database
CREATE DATABASE properhoa OWNER properhoa_admin;

-- NextAuth.js requires these tables (auto-created by adapter)
-- - accounts
-- - sessions
-- - users (auth users)
-- - verification_tokens
```

---

## 2. Schema Overview

All application tables include:
- id — UUID primary key (gen_random_uuid())
- community_id — UUID foreign key to communities (RLS tenant discriminator)
- created_at — timestamptz default now()
- updated_at — timestamptz default now()

---

## 3. NextAuth.js Tables (Auto-Managed)

The NextAuth.js PostgreSQL adapter creates and manages these tables:

### `users` (Auth.js)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | Display name |
| email | VARCHAR(255) | UNIQUE |
| emailVerified | timestamptz | Verification timestamp |
| image | VARCHAR(255) | Avatar URL |

### `accounts` (Auth.js)
OAuth provider linkage (Google, Apple, etc.)

### `sessions` (Auth.js)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| userId | UUID | FK → users.id |
| expires | timestamptz | Session expiry |
| sessionToken | VARCHAR(255) | UNIQUE |

### `verification_tokens` (Auth.js)
Email magic link tokens.

---

## 4. Application Tables

### `app_users` — Extended User Profiles

**Note:** Separate from NextAuth.js `users` table. One-to-one mapping via `auth_user_id`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| auth_user_id | UUID | UNIQUE, FK → users.id | NextAuth.js user reference |
| community_id | UUID | FK → communities | Tenant |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'homeowner' | president, treasurer, secretary, board_member, homeowner |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| phone | VARCHAR(20) | | E.164 format |
| avatar_url | VARCHAR(500) | | Profile photo (MinIO path) |
| home_id | UUID | FK → homes | Resident's home |
| is_active | BOOLEAN | DEFAULT true | |
| notification_prefs | JSONB | DEFAULT '{}' | {email: true, push: true, sms: false} |
| last_login_at | timestamptz | | |

**Indexes:** community_id, role, home_id, is_active, auth_user_id

---

### `communities` — Tenant Root

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Community identifier |
| name | VARCHAR(255) | NOT NULL | Community name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| address | TEXT | | Physical address |
| state | VARCHAR(2) | NOT NULL | US state code |
| total_homes | INTEGER | NOT NULL, CHECK > 0 | Number of homes |
| monthly_dues | DECIMAL(10,2) | | Default monthly dues |
| fiscal_year_start | INTEGER | DEFAULT 1 | Month (1-12) fiscal year begins |
| timezone | VARCHAR(50) | DEFAULT 'America/New_York' | |
| plan | VARCHAR(20) | DEFAULT 'free' | free, essential, pro, enterprise |
| stripe_customer_id | VARCHAR(255) | | Stripe customer ID |
| stripe_subscription_id | VARCHAR(255) | | Stripe subscription ID |
| settings | JSONB | DEFAULT '{}' | Community-specific settings |
| status | VARCHAR(20) | DEFAULT 'active' | active, suspended, archived |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** slug (unique), status, state

---

### `homes` — Properties

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| unit_number | VARCHAR(50) | | House number, unit, lot |
| address | VARCHAR(255) | | Full address |
| owner_name | VARCHAR(255) | | Primary owner name |
| owner_email | VARCHAR(255) | | |
| owner_phone | VARCHAR(20) | | |
| is_rented | BOOLEAN | DEFAULT false | |
| tenant_name | VARCHAR(255) | | If rented |
| tenant_email | VARCHAR(255) | | |
| tenant_phone | VARCHAR(20) | | |
| status | VARCHAR(20) | DEFAULT 'occupied' | occupied, vacant, delinquent, foreclosure |
| notes | TEXT | | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, unit_number (unique per community), status

---

### `documents` — Document Hub

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| title | VARCHAR(255) | NOT NULL | Document title |
| type | VARCHAR(50) | NOT NULL | ccr, bylaw, rule, minutes, financial, insurance, vendor_contract, other |
| file_path | VARCHAR(500) | | MinIO path (e.g., "communities/{id}/documents/{filename}") |
| file_name | VARCHAR(255) | | Original filename |
| file_size | INTEGER | | Bytes |
| mime_type | VARCHAR(100) | | |
| content_text | TEXT | | Extracted text for search |
| uploaded_by | UUID | FK → app_users.id | |
| version | INTEGER | DEFAULT 1 | |
| is_public | BOOLEAN | DEFAULT false | Visible to homeowners? |
| expires_at | DATE | | For insurance, contracts |
| metadata | JSONB | DEFAULT '{}' | Custom metadata |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, type, is_public, expires_at
**Full-text search:** tsvector on title + content_text (for Meilisearch sync)

---

### `document_chunks` — Vector Embeddings for RAG

**New table for AI semantic search.** Each document is split into chunks, embedded, and stored here.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| document_id | UUID | FK → documents | |
| chunk_index | INTEGER | NOT NULL | Position in document |
| content | TEXT | NOT NULL | Chunk text |
| embedding | vector(768) | | **pgvector** — nomic-embed-text |
| metadata | JSONB | DEFAULT '{}' | Page number, section, etc. |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:**
- `document_id`
- HNSW index on embedding: `CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);`

**RLS:** Community isolation — users only see chunks from their community's documents.

---

### `meetings` — Meeting Management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| title | VARCHAR(255) | NOT NULL | |
| type | VARCHAR(50) | DEFAULT 'regular' | regular, special, annual, emergency |
| scheduled_at | timestamptz | NOT NULL | Meeting date/time |
| location | VARCHAR(255) | | Physical or virtual location |
| agenda | JSONB | DEFAULT '[]' | Ordered agenda items |
| minutes | TEXT | | Meeting minutes |
| minutes_published_at | timestamptz | | |
| status | VARCHAR(20) | DEFAULT 'scheduled' | scheduled, in_progress, completed, cancelled |
| created_by | UUID | FK → app_users.id | |
| attendees | JSONB | DEFAULT '[]' | Roll call |
| votes | JSONB | DEFAULT '[]' | Recorded votes |
| action_items | JSONB | DEFAULT '[]' | Follow-up tasks |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, scheduled_at, status

---

### `violations` — Violation Tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| home_id | UUID | FK → homes | Violating property |
| reported_by | UUID | FK → app_users.id | |
| type | VARCHAR(50) | NOT NULL | parking, noise, trash, landscaping, pet, architectural, other |
| description | TEXT | NOT NULL | |
| photos | JSONB | DEFAULT '[]' | Array of MinIO paths |
| location | VARCHAR(255) | | Where on property |
| status | VARCHAR(20) | DEFAULT 'open' | open, acknowledged, in_review, resolved, escalated |
| priority | VARCHAR(20) | DEFAULT 'normal' | low, normal, high, urgent |
| due_date | DATE | | Resolution deadline |
| resolved_at | timestamptz | | |
| resolution_notes | TEXT | | |
| fine_amount | DECIMAL(10,2) | | If applicable |
| reminder_count | INTEGER | DEFAULT 0 | Auto-reminder counter |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, home_id, status, priority, due_date

---

### `arc_requests` — Architectural Review

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| home_id | UUID | FK → homes | Requesting property |
| requested_by | UUID | FK → app_users.id | |
| project_type | VARCHAR(50) | | fence, deck, paint, roof, addition, landscaping, other |
| description | TEXT | NOT NULL | Project details |
| documents | JSONB | DEFAULT '[]' | Plans, photos, specs (MinIO paths) |
| status | VARCHAR(20) | DEFAULT 'submitted' | submitted, under_review, approved, approved_with_conditions, denied, withdrawn |
| review_deadline | DATE | | Auto-calculated from bylaws |
| approved_by | UUID | FK → app_users.id | Board approver |
| approved_at | timestamptz | | |
| conditions | TEXT | | Approval conditions |
| denial_reason | TEXT | | |
| votes | JSONB | DEFAULT '[]' | Board vote tally |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, home_id, status, review_deadline

---

### `invoices` — Dues & Assessments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| home_id | UUID | FK → homes | Billed property |
| invoice_number | VARCHAR(50) | NOT NULL, UNIQUE per community | Auto-generated |
| type | VARCHAR(30) | DEFAULT 'dues' | dues, special_assessment, fine, other |
| description | VARCHAR(255) | | |
| amount | DECIMAL(10,2) | NOT NULL | |
| balance_due | DECIMAL(10,2) | NOT NULL | Remaining balance |
| issued_at | DATE | NOT NULL | |
| due_at | DATE | NOT NULL | |
| paid_at | timestamptz | | |
| status | VARCHAR(20) | DEFAULT 'outstanding' | outstanding, partial, paid, overdue, cancelled |
| late_fee_applied | BOOLEAN | DEFAULT false | |
| late_fee_amount | DECIMAL(10,2) | | |
| stripe_invoice_id | VARCHAR(255) | | Stripe reference |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, home_id, status, due_at, stripe_invoice_id

---

### `payments` — Payment Records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| invoice_id | UUID | FK → invoices | |
| home_id | UUID | FK → homes | |
| paid_by | UUID | FK → app_users.id | |
| amount | DECIMAL(10,2) | NOT NULL | |
| method | VARCHAR(30) | | card, ach, check, cash, other |
| stripe_payment_intent_id | VARCHAR(255) | | Stripe reference |
| status | VARCHAR(20) | DEFAULT 'pending' | pending, succeeded, failed, refunded |
| paid_at | timestamptz | | |
| receipt_url | VARCHAR(500) | | Stripe receipt |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, invoice_id, home_id, stripe_payment_intent_id

---

### `transactions` — Bank Transactions (Manual Import)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| bank_account_id | UUID | FK → bank_accounts | |
| import_batch_id | UUID | FK → import_batches | Grouped upload |
| date | DATE | NOT NULL | |
| description | VARCHAR(255) | | Bank description |
| merchant_name | VARCHAR(255) | | Parsed merchant |
| amount | DECIMAL(10,2) | NOT NULL | Negative = debit, positive = credit |
| category | VARCHAR(50) | | Auto-categorized |
| reconciled | BOOLEAN | DEFAULT false | Matched to invoice? |
| matched_invoice_id | UUID | FK → invoices | |
| notes | TEXT | | Treasurer notes |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, bank_account_id, date, reconciled

---

### `import_batches` — CSV/OFX Import Tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| bank_account_id | UUID | FK → bank_accounts | |
| file_name | VARCHAR(255) | | Original filename |
| file_size | INTEGER | | Bytes |
| format | VARCHAR(10) | | csv, ofx, qfx |
| row_count | INTEGER | | Number of transactions |
| processed_count | INTEGER | DEFAULT 0 | Successfully imported |
| error_count | INTEGER | DEFAULT 0 | Failed rows |
| status | VARCHAR(20) | DEFAULT 'pending' | pending, processing, completed, failed |
| uploaded_by | UUID | FK → app_users.id | |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, bank_account_id, status

---

### `bank_accounts` — Connected Accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| account_name | VARCHAR(255) | | "HOA Checking", "Reserve Fund" |
| account_type | VARCHAR(30) | | checking, savings, other |
| bank_name | VARCHAR(255) | | "Wells Fargo", "Chase" |
| account_number_mask | VARCHAR(4) | | Last 4 digits |
| routing_number_mask | VARCHAR(4) | | Last 4 digits |
| opening_balance | DECIMAL(12,2) | | Balance at start of tracking |
| current_balance | DECIMAL(12,2) | | Calculated from transactions |
| currency | VARCHAR(3) | DEFAULT 'USD' | |
| notes | TEXT | | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, is_active

---

### `announcements` — Communications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| title | VARCHAR(255) | NOT NULL | |
| body | TEXT | NOT NULL | |
| type | VARCHAR(30) | DEFAULT 'general' | general, urgent, meeting_reminder, payment_reminder, violation_notice |
| target_audience | VARCHAR(30) | DEFAULT 'all' | all, board_only, homeowners, delinquent |
| published_by | UUID | FK → app_users.id | |
| published_at | timestamptz | NOT NULL | |
| expires_at | timestamptz | | |
| is_pinned | BOOLEAN | DEFAULT false | |
| read_count | INTEGER | DEFAULT 0 | Analytics |
| attachments | JSONB | DEFAULT '[]' | Document links |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, type, published_at, is_pinned

---

### `compliance_items` — Proactive Compliance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| type | VARCHAR(50) | NOT NULL | tax_filing, insurance_renewal, document_renewal, audit, meeting_requirement, other |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| due_date | DATE | NOT NULL | |
| reminder_days | INTEGER | DEFAULT 30 | Days before to start alerting |
| status | VARCHAR(20) | DEFAULT 'upcoming' | upcoming, due_soon, overdue, completed, dismissed |
| completed_at | timestamptz | | |
| completed_by | UUID | FK → app_users.id | |
| document_url | VARCHAR(500) | | MinIO path to proof |
| recurring | BOOLEAN | DEFAULT false | Annual recurring? |
| recurrence_rule | VARCHAR(100) | | iCal RRULE format |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, status, due_date, type

---

### `maintenance_requests` — Work Orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| home_id | UUID | FK → homes | Reporting property (nullable for common areas) |
| reported_by | UUID | FK → app_users.id | |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| photos | JSONB | DEFAULT '[]' | MinIO paths |
| category | VARCHAR(50) | | plumbing, electrical, landscaping, roofing, hvac, common_area, other |
| priority | VARCHAR(20) | DEFAULT 'normal' | low, normal, high, urgent |
| status | VARCHAR(20) | DEFAULT 'open' | open, assigned, in_progress, completed, cancelled |
| assigned_to | UUID | FK → app_users.id | Board member or vendor |
| vendor_name | VARCHAR(255) | | External contractor |
| vendor_phone | VARCHAR(20) | | |
| cost_estimate | DECIMAL(10,2) | | |
| actual_cost | DECIMAL(10,2) | | |
| opened_at | timestamptz | DEFAULT now() | |
| completed_at | timestamptz | | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, home_id, status, priority, assigned_to

---

### `chat_sessions` — AI Chat History

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| user_id | UUID | FK → app_users.id | |
| home_id | UUID | FK → homes | Optional context |
| session_type | VARCHAR(20) | DEFAULT 'general' | general, violation, arc, payment, meeting |
| messages | JSONB | NOT NULL | Array of {role, content, timestamp} |
| summary | TEXT | | AI-generated session summary |
| resolved | BOOLEAN | DEFAULT false | Did AI resolve the issue? |
| escalated_to_board | BOOLEAN | DEFAULT false | Human handoff needed? |
| escalation_reason | TEXT | | |
| feedback_rating | INTEGER | | 1-5 star rating |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, user_id, session_type, created_at

---

### `activity_logs` — Audit Trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| user_id | UUID | FK → app_users.id | |
| action | VARCHAR(50) | NOT NULL | create, update, delete, view, export, payment, login |
| entity_type | VARCHAR(50) | | invoice, meeting, violation, document, user, etc. |
| entity_id | UUID | | |
| changes | JSONB | | Before/after diff |
| ip_address | INET | | |
| user_agent | TEXT | | |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** community_id, user_id, action, entity_type, created_at
**Retention:** 2 years (auto-archive)

---

### `push_subscriptions` — Web Push Notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → app_users.id | |
| endpoint | VARCHAR(500) | NOT NULL | Push service endpoint |
| p256dh | VARCHAR(255) | NOT NULL | Public key |
| auth | VARCHAR(255) | NOT NULL | Auth secret |
| device_info | JSONB | | Browser, OS |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** user_id, is_active

---

## 5. Row-Level Security (RLS) Policies

### Base Policy Pattern

```sql
-- Enable RLS on all application tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Users can only see their community's data
CREATE POLICY "community_isolation" ON documents
FOR ALL
TO app_user
USING (community_id = current_setting('app.current_community_id')::UUID);

-- Public documents visible to all community members
CREATE POLICY "public_documents" ON documents
FOR SELECT
TO app_user
USING (
    community_id = current_setting('app.current_community_id')::UUID
    AND is_public = true
);

-- Board members can see all documents in their community
CREATE POLICY "board_full_access" ON documents
FOR ALL
TO app_user
USING (
    community_id = current_setting('app.current_community_id')::UUID
    AND current_setting('app.current_role')::VARCHAR 
        IN ('president', 'treasurer', 'secretary', 'board_member')
);
```

**Note:** `app.current_community_id` and `app.current_role` are set per-request by the application layer based on the authenticated user's session.

---

## 6. Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| communities | slug | Unique lookup |
| app_users | community_id, role | Filtering by role |
| app_users | auth_user_id | NextAuth linkage |
| homes | community_id, unit_number | Unique per community |
| documents | community_id, type | Type filtering |
| documents | tsvector(title, content_text) | Full-text search |
| document_chunks | document_id | Chunk lookup |
| document_chunks | embedding (HNSW) | Semantic search |
| meetings | community_id, scheduled_at | Upcoming meetings |
| violations | community_id, status, priority | Dashboard filtering |
| invoices | community_id, status, due_at | Overdue reporting |
| transactions | community_id, date | Date range queries |
| import_batches | community_id, bank_account_id | Import tracking |
| compliance_items | community_id, due_date | Upcoming deadlines |
| chat_sessions | community_id, created_at | Recent chats |
| activity_logs | community_id, created_at | Audit queries |
| push_subscriptions | user_id, is_active | Active subscriptions |

---

## 7. Triggers & Functions

### Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Auto-increment violation reminder_count

```sql
CREATE OR REPLACE FUNCTION increment_violation_reminder()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reminder_count = OLD.reminder_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Compliance recurring auto-creation

```sql
CREATE OR REPLACE FUNCTION create_recurring_compliance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.recurring = true AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO compliance_items (
            community_id, type, title, description,
            due_date, reminder_days, recurring, recurrence_rule
        ) VALUES (
            NEW.community_id, NEW.type, NEW.title, NEW.description,
            NEW.due_date + INTERVAL '1 year', NEW.reminder_days,
            true, NEW.recurrence_rule
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Transaction balance recalculation

```sql
CREATE OR REPLACE FUNCTION recalculate_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bank_accounts
    SET current_balance = opening_balance + (
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE bank_account_id = NEW.bank_account_id
    )
    WHERE id = NEW.bank_account_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Migrations Strategy

1. **Prisma ORM** for schema management and migrations
2. **Git-tracked** schema in `prisma/schema.prisma`
3. **CI/CD** runs `prisma migrate deploy` on deploy
4. **Zero-downtime** — additive changes only in production

```bash
# Local development
npx prisma migrate dev --name add_violations_table

# Deploy
npx prisma migrate deploy
```

**Prisma Schema includes:**
- All application tables
- NextAuth.js adapter models (auto-added)
- pgvector support via custom field types

---

*Database designed for ProperHOA v1.1 — Self-Hosted Edition*  
*PostgreSQL 16 + pgvector + NextAuth.js + Row-Level Security*
