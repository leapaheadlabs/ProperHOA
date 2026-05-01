# ProperHOA — Database Schema

**Version:** 1.0  
**Date:** 2026-05-01  
**Database:** Supabase PostgreSQL 15+  
**Multi-tenancy:** Row-Level Security (RLS) via community_id  

---

## 1. Schema Overview

All tables include:
- id — UUID primary key (gen_random_uuid())
- community_id — UUID foreign key to communities (RLS tenant discriminator)
- created_at — timestamptz default now()
- updated_at — timestamptz default now()

---

## 2. Core Tables

### communities — Tenant Root

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Community identifier |
| name | VARCHAR(255) | NOT NULL | Community name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| address | TEXT | | Physical address |
| state | VARCHAR(2) | NOT NULL | US state code |
| total_homes | INTEGER | NOT NULL, CHECK > 0 | Number of homes |
| monthly_dues | DECIMAL(10,2) | | Default monthly dues amount |
| fiscal_year_start | INTEGER | DEFAULT 1 | Month (1-12) fiscal year begins |
| timezone | VARCHAR(50) | DEFAULT 'America/New_York' | Community timezone |
| plan | VARCHAR(20) | DEFAULT 'free' | Subscription tier |
| stripe_customer_id | VARCHAR(255) | | Stripe customer ID |
| stripe_subscription_id | VARCHAR(255) | | Stripe subscription ID |
| settings | JSONB | DEFAULT '{}' | Community-specific settings |
| status | VARCHAR(20) | DEFAULT 'active' | active, suspended, archived |

**Indexes:** slug (unique), status, state

---

### users — Extended Supabase Auth

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | Supabase Auth user ID |
| community_id | UUID | FK → communities | Tenant (NULL for super admins) |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'homeowner' | president, treasurer, secretary, board_member, homeowner |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| phone | VARCHAR(20) | | E.164 format |
| avatar_url | VARCHAR(500) | | Profile photo |
| home_id | UUID | FK → homes | Resident's home (nullable for non-resident board) |
| is_active | BOOLEAN | DEFAULT true | |
| notification_prefs | JSONB | DEFAULT '{}' | Email, SMS, push preferences |
| last_login_at | timestamptz | | |

**Indexes:** community_id, role, home_id, is_active

---

### homes — Properties

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

**Indexes:** community_id, unit_number (unique per community), status

---

### documents — Document Hub

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| title | VARCHAR(255) | NOT NULL | Document title |
| type | VARCHAR(50) | NOT NULL | ccr, bylaw, rule, minutes, financial, insurance, vendor_contract, other |
| file_url | VARCHAR(500) | | Supabase Storage path |
| file_name | VARCHAR(255) | | Original filename |
| file_size | INTEGER | | Bytes |
| mime_type | VARCHAR(100) | | |
| content_text | TEXT | | Extracted text for search |
| uploaded_by | UUID | FK → users | |
| version | INTEGER | DEFAULT 1 | |
| is_public | BOOLEAN | DEFAULT false | Visible to homeowners? |
| expires_at | DATE | | For insurance, contracts |
| metadata | JSONB | DEFAULT '{}' | Custom metadata |

**Indexes:** community_id, type, is_public, expires_at
**Full-text search:** tsvector on title + content_text

---

### meetings — Meeting Management

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
| created_by | UUID | FK → users | |
| attendees | JSONB | DEFAULT '[]' | Roll call |
| votes | JSONB | DEFAULT '[]' | Recorded votes |
| action_items | JSONB | DEFAULT '[]' | Follow-up tasks |

**Indexes:** community_id, scheduled_at, status

---

### violations — Violation Tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| home_id | UUID | FK → homes | Violating property |
| reported_by | UUID | FK → users | |
| type | VARCHAR(50) | NOT NULL | parking, noise, trash, landscaping, pet, architectural, other |
| description | TEXT | NOT NULL | |
| photos | JSONB | DEFAULT '[]' | Array of image URLs |
| location | VARCHAR(255) | | Where on property |
| status | VARCHAR(20) | DEFAULT 'open' | open, acknowledged, in_review, resolved, escalated |
| priority | VARCHAR(20) | DEFAULT 'normal' | low, normal, high, urgent |
| due_date | DATE | | Resolution deadline |
| resolved_at | timestamptz | | |
| resolution_notes | TEXT | | |
| fine_amount | DECIMAL(10,2) | | If applicable |
| reminder_count | INTEGER | DEFAULT 0 | Auto-reminder counter |

**Indexes:** community_id, home_id, status, priority, due_date

---

### arc_requests — Architectural Review

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| home_id | UUID | FK → homes | Requesting property |
| requested_by | UUID | FK → users | |
| project_type | VARCHAR(50) | | fence, deck, paint, roof, addition, landscaping, other |
| description | TEXT | NOT NULL | Project details |
| documents | JSONB | DEFAULT '[]' | Plans, photos, specs |
| status | VARCHAR(20) | DEFAULT 'submitted' | submitted, under_review, approved, approved_with_conditions, denied, withdrawn |
| review_deadline | DATE | | Auto-calculated from bylaws |
| approved_by | UUID | FK → users | Board approver |
| approved_at | timestamptz | | |
| conditions | TEXT | | Approval conditions |
| denial_reason | TEXT | | |
| votes | JSONB | DEFAULT '[]' | Board vote tally |

**Indexes:** community_id, home_id, status, review_deadline

---

### invoices — Dues & Assessments

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

**Indexes:** community_id, home_id, status, due_at, stripe_invoice_id

---

### payments — Payment Records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| invoice_id | UUID | FK → invoices | |
| home_id | UUID | FK → homes | |
| paid_by | UUID | FK → users | |
| amount | DECIMAL(10,2) | NOT NULL | |
| method | VARCHAR(30) | | card, ach, check, cash, other |
| stripe_payment_intent_id | VARCHAR(255) | | Stripe reference |
| status | VARCHAR(20) | DEFAULT 'pending' | pending, succeeded, failed, refunded |
| paid_at | timestamptz | | |
| receipt_url | VARCHAR(500) | | Stripe receipt |

**Indexes:** community_id, invoice_id, home_id, stripe_payment_intent_id

---

### transactions — Bank Sync (Plaid)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| plaid_transaction_id | VARCHAR(255) | UNIQUE | Plaid unique ID |
| account_id | UUID | FK → bank_accounts | |
| amount | DECIMAL(10,2) | NOT NULL | Negative = debit, positive = credit |
| date | DATE | NOT NULL | |
| description | VARCHAR(255) | | Raw Plaid description |
| merchant_name | VARCHAR(255) | | |
| category | VARCHAR(50) | | Auto-categorized |
| reconciled | BOOLEAN | DEFAULT false | Matched to invoice/bill? |
| metadata | JSONB | DEFAULT '{}' | Raw Plaid data |

**Indexes:** community_id, plaid_transaction_id, date, account_id, reconciled

---

### bank_accounts — Connected Accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| plaid_access_token | VARCHAR(500) | ENCRYPTED | Plaid access (encrypted at application level) |
| plaid_account_id | VARCHAR(255) | | Plaid account reference |
| account_name | VARCHAR(255) | | "HOA Checking", "Reserve Fund" |
| account_type | VARCHAR(30) | | checking, savings, other |
| mask | VARCHAR(4) | | Last 4 digits |
| balance | DECIMAL(12,2) | | Current balance (cached) |
| currency | VARCHAR(3) | DEFAULT 'USD' | |
| last_synced_at | timestamptz | | |
| is_active | BOOLEAN | DEFAULT true | |

**Indexes:** community_id, is_active

---

### announcements — Communications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| title | VARCHAR(255) | NOT NULL | |
| body | TEXT | NOT NULL | |
| type | VARCHAR(30) | DEFAULT 'general' | general, urgent, meeting_reminder, payment_reminder, violation_notice |
| target_audience | VARCHAR(30) | DEFAULT 'all' | all, board_only, homeowners, delinquent |
| published_by | UUID | FK → users | |
| published_at | timestamptz | NOT NULL | |
| expires_at | timestamptz | | |
| is_pinned | BOOLEAN | DEFAULT false | |
| read_count | INTEGER | DEFAULT 0 | Analytics |
| attachments | JSONB | DEFAULT '[]' | Document links |

**Indexes:** community_id, type, published_at, is_pinned

---

### compliance_items — Proactive Compliance

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
| completed_by | UUID | FK → users | |
| document_url | VARCHAR(500) | | Proof of completion |
| recurring | BOOLEAN | DEFAULT false | Annual recurring? |
| recurrence_rule | VARCHAR(100) | | iCal RRULE format |

**Indexes:** community_id, status, due_date, type

---

### maintenance_requests — Work Orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| home_id | UUID | FK → homes | Reporting property (nullable for common areas) |
| reported_by | UUID | FK → users | |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| photos | JSONB | DEFAULT '[]' | |
| category | VARCHAR(50) | | plumbing, electrical, landscaping, roofing, hvac, common_area, other |
| priority | VARCHAR(20) | DEFAULT 'normal' | low, normal, high, urgent |
| status | VARCHAR(20) | DEFAULT 'open' | open, assigned, in_progress, completed, cancelled |
| assigned_to | UUID | FK → users | Board member or vendor |
| vendor_name | VARCHAR(255) | | External contractor |
| vendor_phone | VARCHAR(20) | | |
| cost_estimate | DECIMAL(10,2) | | |
| actual_cost | DECIMAL(10,2) | | |
| opened_at | timestamptz | DEFAULT now() | |
| completed_at | timestamptz | | |

**Indexes:** community_id, home_id, status, priority, assigned_to

---

### chat_sessions — AI Chat History

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| user_id | UUID | FK → users | |
| home_id | UUID | FK → homes | | Optional context |
| session_type | VARCHAR(20) | DEFAULT 'general' | general, violation, arc, payment, meeting |
| messages | JSONB | NOT NULL | Array of {role, content, timestamp} |
| summary | TEXT | | AI-generated session summary |
| resolved | BOOLEAN | DEFAULT false | Did AI resolve the issue? |
| escalated_to_board | BOOLEAN | DEFAULT false | Human handoff needed? |
| escalation_reason | TEXT | | |
| feedback_rating | INTEGER | | 1-5 star rating |

**Indexes:** community_id, user_id, session_type, created_at

---

### activity_logs — Audit Trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| community_id | UUID | FK → communities | |
| user_id | UUID | FK → users | |
| action | VARCHAR(50) | NOT NULL | create, update, delete, view, export, payment, login |
| entity_type | VARCHAR(50) | | invoice, meeting, violation, document, user, etc. |
| entity_id | UUID | | |
| changes | JSONB | | Before/after diff |
| ip_address | INET | | |
| user_agent | TEXT | | |

**Indexes:** community_id, user_id, action, entity_type, created_at
**Retention:** 2 years (auto-archive)

---

## 3. Row-Level Security (RLS) Policies

### Default Pattern

Every table has:
1. community_id column
2. RLS enabled
3. Policy: users can only access rows where community_id matches their community

### Example Policies

```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their community's data
CREATE POLICY "community_isolation" ON documents
FOR ALL
USING (community_id = (
    SELECT community_id FROM users WHERE id = auth.uid()
));

-- Public documents visible to all community members
CREATE POLICY "public_documents" ON documents
FOR SELECT
USING (
    community_id = (SELECT community_id FROM users WHERE id = auth.uid())
    AND is_public = true
);

-- Board members can see all documents in their community
CREATE POLICY "board_full_access" ON documents
FOR ALL
USING (
    community_id = (SELECT community_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) 
        IN ('president', 'treasurer', 'secretary', 'board_member')
);
```

---

## 4. Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| communities | slug | Unique lookup |
| users | community_id, role | Filtering by role |
| homes | community_id, unit_number | Unique per community |
| documents | community_id, type | Type filtering |
| documents | tsvector(title, content_text) | Full-text search |
| meetings | community_id, scheduled_at | Upcoming meetings |
| violations | community_id, status, priority | Dashboard filtering |
| invoices | community_id, status, due_at | Overdue reporting |
| transactions | community_id, date | Date range queries |
| compliance_items | community_id, due_date | Upcoming deadlines |
| chat_sessions | community_id, created_at | Recent chats |

---

## 5. Triggers & Functions

### Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_updated_at_trigger
    BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Auto-increment reminder_count on violations

```sql
CREATE OR REPLACE FUNCTION increment_violation_reminder()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reminder_count = OLD.reminder_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Compliance deadline auto-creation

```sql
-- When a compliance item with recurring=true is marked completed,
-- auto-create next year's item
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

---

## 6. Migrations Strategy

1. Supabase CLI for local development and migrations
2. Git-tracked SQL files in /supabase/migrations/
3. CI/CD applies migrations automatically on deploy
4. Zero-downtime — additive changes only in production

```bash
# Local development
supabase start
supabase migration new add_violations_table
supabase db reset

# Deploy
supabase link --project-ref <project-ref>
supabase db push
```

---

*Database designed for ProperHOA v1.0 MVP*  
*Multi-tenancy via RLS, optimized for Supabase PostgreSQL*
