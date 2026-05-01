# ProperHOA — API Specification

**Version:** 1.0  
**Date:** 2026-05-01  
**Base URL:** https://api.properhoa.com (production) / https://api-staging.properhoa.com  
**Protocol:** REST + WebSocket (Supabase Realtime)  
**Auth:** JWT Bearer (Authorization: Bearer <supabase_jwt>)  
**Content-Type:** application/json  

---

## 1. Authentication

All endpoints require a valid Supabase JWT token in the Authorization header.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The JWT contains:
- sub — user UUID
- community_id — user's community (custom claim)
- role — user role (custom claim)

**Token Refresh:** Handled automatically by Supabase client libraries.

---

## 2. Response Format

### Standard Success Response

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Standard Error Response

```json
{
  "error": {
    "code": "VIOLATION_NOT_FOUND",
    "message": "The requested violation does not exist or you don't have access",
    "status": 404
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (RLS denied) |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## 3. Core Endpoints

### 3.1 AI Assistant

#### POST /api/chat

Initiates a streaming chat session with the AI Board Assistant.

**Request:**
```json
{
  "message": "When is trash pickup?",
  "session_id": "uuid-or-null",
  "context": {
    "home_id": "uuid",
    "topic": "general"
  }
}
```

**Response (Streaming — SSE):**
```
data: {"token": "Trash"}
data: {"token": " pickup"}
data: {"token": " is"}
data: {"token": " every"}
data: {"token": " Tuesday"}
data: {"done": true, "session_id": "uuid", "sources": [{"doc": "Rules & Regulations", "page": 4}]}
```

**Error Codes:**
- AI_RATE_LIMITED — Too many requests (429)
- AI_CONTEXT_TOO_LARGE — Document context exceeded (413)
- AI_UNAVAILABLE — OpenAI service error (503)

---

#### GET /api/chat/sessions

List user's chat history.

**Query Params:**
- limit — default 20, max 100
- offset — default 0
- session_type — optional filter

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "session_type": "general",
      "summary": "Trash pickup schedule inquiry",
      "resolved": true,
      "created_at": "2026-05-01T14:30:00Z"
    }
  ]
}
```

---

#### POST /api/chat/:session_id/feedback

Rate AI response quality.

**Request:**
```json
{
  "rating": 5,
  "comment": "Very helpful!"
}
```

---

### 3.2 Documents

#### GET /api/documents

List community documents.

**Query Params:**
- type — filter by document type
- is_public — true/false
- search — full-text search query
- sort — created_at | title | updated_at
- order — asc | desc

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "CC&Rs - Original",
      "type": "ccr",
      "file_url": "https://storage.properhoa.com/...",
      "file_size": 245000,
      "is_public": true,
      "uploaded_by": { "id": "uuid", "first_name": "Jane", "last_name": "Smith" },
      "version": 1,
      "expires_at": null,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 45 }
}
```

---

#### POST /api/documents

Upload a new document.

**Request (multipart/form-data):**
```
file: <binary>
title: "Insurance Policy 2026"
type: "insurance"
is_public: false
expires_at: "2027-01-01"
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Insurance Policy 2026",
    "file_url": "https://storage.properhoa.com/...",
    "uploaded_by": { "id": "uuid", "first_name": "Jane" },
    "created_at": "2026-05-01T14:30:00Z"
  }
}
```

**Process:**
1. Validate file (max 50MB, allowed types: pdf, doc, docx, jpg, png)
2. Upload to Supabase Storage
3. Extract text via Edge Function (PDF/DOCX parsing)
4. Chunk + embed text → Pinecone
5. Return document metadata

---

#### GET /api/documents/:id

Get document details + download URL.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "CC&Rs",
    "file_url": "https://storage.properhoa.com/...?token=signed",
    "content_preview": "These Covenants, Conditions, and Restrictions...",
    "metadata": { "pages": 24, "word_count": 8500 }
  }
}
```

---

#### DELETE /api/documents/:id

Soft delete (archives, doesn't remove from storage immediately).

---

### 3.3 Meetings

#### GET /api/meetings

List meetings.

**Query Params:**
- status — scheduled | completed | cancelled
- from_date — ISO date
- to_date — ISO date
- type — regular | special | annual

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Monthly Board Meeting - May",
      "type": "regular",
      "scheduled_at": "2026-05-15T19:00:00Z",
      "location": "Community Clubhouse",
      "status": "scheduled",
      "agenda": [
        { "order": 1, "item": "Call to Order", "duration_min": 5 },
        { "order": 2, "item": "Treasurer's Report", "duration_min": 15 }
      ],
      "attendee_count": 5,
      "created_by": { "first_name": "Jane", "last_name": "Smith" }
    }
  ]
}
```

---

#### POST /api/meetings

Create a meeting.

**Request:**
```json
{
  "title": "Monthly Board Meeting - June",
  "type": "regular",
  "scheduled_at": "2026-06-15T19:00:00Z",
  "location": "Community Clubhouse",
  "agenda": [
    { "order": 1, "item": "Call to Order", "duration_min": 5 },
    { "order": 2, "item": "Review Violations", "duration_min": 20 }
  ]
}
```

**Smart Agenda Feature:**
If auto_generate_agenda: true, the AI will:
1. Pull open action items from previous meeting
2. Add pending violations requiring review
3. Include pending ARC requests
4. Add standard items (treasurer report, old business)

---

#### POST /api/meetings/:id/start

Mark meeting as in-progress. Triggers:
- Realtime broadcast to attendees
- Timer tracking begins
- Minutes template loaded

---

#### POST /api/meetings/:id/minutes

Publish meeting minutes.

**Request:**
```json
{
  "minutes": "The meeting was called to order at 7:05 PM...",
  "votes": [
    { "item": "Budget Approval", "yes": 5, "no": 0, "abstain": 0 }
  ],
  "action_items": [
    { "task": "Get fence repair quote", "assigned_to": "uuid", "due_date": "2026-05-30" }
  ]
}
```

**Auto-publish:** If auto_publish: true, minutes are formatted and emailed to all homeowners.

---

### 3.4 Violations

#### GET /api/violations

List violations with filters.

**Query Params:**
- status — open | acknowledged | in_review | resolved | escalated
- priority — low | normal | high | urgent
- home_id — filter by property
- type — parking | noise | trash | landscaping | pet | architectural
- sort — created_at | due_date | priority

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "home": { "unit_number": "12", "address": "123 Main St" },
      "type": "trash",
      "description": "Trash cans left out past collection day",
      "photos": ["https://storage.../photo1.jpg"],
      "status": "open",
      "priority": "normal",
      "due_date": "2026-05-08",
      "days_open": 3,
      "reminder_count": 1,
      "reported_by": { "first_name": "Jane" }
    }
  ]
}
```

---

#### POST /api/violations

Create a violation report.

**Request (multipart/form-data):**
```
home_id: "uuid"
type: "trash"
description: "Trash cans left out"
photos[]: <binary files>
priority: "normal"
due_date: "2026-05-08"
```

**Auto-escalation:**
If violation is not resolved by due_date:
- Day 1: Email reminder to homeowner
- Day 3: Second reminder + board notification
- Day 7: Auto-escalate to "escalated" status + fine notice

---

#### POST /api/violations/:id/resolve

Mark violation as resolved.

**Request:**
```json
{
  "resolution_notes": "Homeowner corrected issue",
  "fine_amount": 0
}
```

---

### 3.5 ARC (Architectural Review)

#### GET /api/arc-requests

List architectural review requests.

**Query Params:**
- status — submitted | under_review | approved | denied | withdrawn
- home_id — filter by property

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "home": { "unit_number": "15" },
      "project_type": "fence",
      "description": "6-foot privacy fence along back property line",
      "documents": ["https://storage.../plans.pdf"],
      "status": "under_review",
      "review_deadline": "2026-05-22",
      "days_remaining": 15,
      "votes": { "yes": 2, "no": 0, "pending": 3 }
    }
  ]
}
```

---

#### POST /api/arc-requests/:id/vote

Board member votes on ARC request.

**Request:**
```json
{
  "vote": "approve",
  "conditions": "Must use cedar wood, max 6 feet",
  "denial_reason": null
}
```

**Auto-approval:** If auto_approve: true and all board members have voted, status auto-updates.

---

### 3.6 Payments & Invoicing

#### GET /api/invoices

List invoices.

**Query Params:**
- status — outstanding | paid | overdue | partial
- home_id — filter by property
- type — dues | special_assessment | fine

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoice_number": "2026-0042",
      "home": { "unit_number": "12" },
      "type": "dues",
      "amount": 150.00,
      "balance_due": 150.00,
      "due_at": "2026-05-01",
      "status": "overdue",
      "days_overdue": 5,
      "late_fee_applied": false
    }
  ]
}
```

---

#### POST /api/invoices

Create an invoice (board only).

**Request:**
```json
{
  "home_id": "uuid",
  "type": "special_assessment",
  "description": "Roof repair fund",
  "amount": 500.00,
  "due_at": "2026-06-01"
}
```

**Auto-actions:**
- Stripe invoice created automatically
- Email notification sent to homeowner
- Added to compliance calendar if recurring

---

#### POST /api/payments

Initiate a payment.

**Request:**
```json
{
  "invoice_id": "uuid",
  "amount": 150.00,
  "method": "card"
}
```

**Response:**
```json
{
  "data": {
    "payment_intent_id": "pi_...",
    "client_secret": "pi_..._secret_...",
    "status": "requires_action"
  }
}
```

**Flow:**
1. Create Stripe PaymentIntent
2. Return client_secret to frontend
3. Frontend uses Stripe Elements to confirm
4. Webhook updates invoice status on success

---

#### POST /api/payments/setup-autopay

Set up automatic recurring payments.

**Request:**
```json
{
  "home_id": "uuid",
  "payment_method_id": "pm_...",
  "start_date": "2026-06-01"
}
```

---

### 3.7 Accounting

#### GET /api/accounting/summary

Financial dashboard data.

**Response:**
```json
{
  "data": {
    "current_balance": 12500.00,
    "monthly_revenue": 3750.00,
    "monthly_expenses": 2100.00,
    "outstanding_invoices": 4500.00,
    "overdue_invoices": 1200.00,
    "budget_vs_actual": {
      "total_budget": 45000.00,
      "spent_ytd": 18900.00,
      "remaining": 26100.00
    },
    "recent_transactions": [
      { "date": "2026-04-28", "description": "Landscaping", "amount": -450.00 }
    ]
  }
}
```

---

#### GET /api/accounting/transactions

Bank transactions (Plaid sync).

**Query Params:**
- from_date — ISO date
- to_date — ISO date
- category — filter by category
- reconciled — true/false

---

#### POST /api/accounting/transactions/:id/reconcile

Match a bank transaction to an invoice/bill.

**Request:**
```json
{
  "invoice_id": "uuid",
  "match_type": "payment"
}
```

---

### 3.8 Compliance

#### GET /api/compliance

Upcoming compliance deadlines.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "insurance_renewal",
      "title": "General Liability Insurance Renewal",
      "due_date": "2026-06-15",
      "days_remaining": 45,
      "status": "upcoming",
      "reminder_days": 30
    },
    {
      "id": "uuid",
      "type": "tax_filing",
      "title": "Annual Tax Filing (Form 1120-H)",
      "due_date": "2026-05-15",
      "days_remaining": 14,
      "status": "due_soon"
    }
  ]
}
```

---

#### POST /api/compliance/:id/complete

Mark compliance item as complete.

**Request (multipart/form-data):**
```
document: <binary proof file>
notes: "Renewed with State Farm, policy #12345"
```

**Auto-action:** If recurring: true, auto-creates next year's item.

---

### 3.9 Announcements

#### GET /api/announcements

List announcements.

**Query Params:**
- type — general | urgent | meeting_reminder | payment_reminder
- target_audience — all | board_only | homeowners
- is_pinned — true/false

---

#### POST /api/announcements

Create announcement (board only).

**Request:**
```json
{
  "title": "Pool Opening This Saturday",
  "body": "The community pool will open for the season on May 3rd...",
  "type": "general",
  "target_audience": "all",
  "expires_at": "2026-05-10T00:00:00Z",
  "is_pinned": false,
  "attachments": ["uuid-of-document"]
}
```

**Auto-actions:**
- Push notification to target audience
- Email broadcast
- SMS for urgent types

---

### 3.10 Maintenance

#### GET /api/maintenance

List maintenance requests.

**Query Params:**
- status — open | assigned | in_progress | completed
- priority — low | normal | high | urgent
- assigned_to — filter by assignee

---

#### POST /api/maintenance

Create maintenance request.

**Request (multipart/form-data):**
```
title: "Leaking faucet in unit 12"
description: "Kitchen sink faucet dripping constantly"
photos[]: <binary>
category: "plumbing"
priority: "normal"
```

---

### 3.11 Users & Community

#### GET /api/users/me

Current user profile.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "president",
    "community": {
      "id": "uuid",
      "name": "Oakwood Estates",
      "slug": "oakwood-estates",
      "plan": "pro"
    },
    "home": { "unit_number": "15" },
    "notification_prefs": {
      "email": true,
      "sms": true,
      "push": true
    }
  }
}
```

---

#### GET /api/community

Community details + stats.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Oakwood Estates",
    "total_homes": 45,
    "active_homeowners": 42,
    "board_members": 5,
    "monthly_dues": 150.00,
    "current_balance": 12500.00,
    "open_violations": 3,
    "upcoming_meetings": 1,
    "overdue_invoices": 5,
    "compliance_deadlines": 2
  }
}
```

---

#### GET /api/community/directory

Resident directory (opt-in only).

**Response:**
```json
{
  "data": [
    {
      "home": { "unit_number": "12" },
      "owner_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "is_rented": false
    }
  ]
}
```

---

## 4. Realtime Events (WebSocket)

Subscribe via Supabase Realtime:

```javascript
const channel = supabase
  .channel('community:' + communityId)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, callback)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'violations' }, callback)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, callback)
  .subscribe();
```

**Broadcast Channels:**
- community:<id> — All community events
- meeting:<id> — Live meeting updates (agenda changes, votes)
- user:<id> — Personal notifications

---

## 5. Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| General API | 100 | 1 minute |
| AI Chat | 10 | 1 minute |
| File Uploads | 10 | 1 minute |
| Payment Operations | 30 | 1 minute |

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1714587600
```

---

## 6. Webhooks

### 6.1 Stripe Webhooks

**Endpoint:** POST /api/webhooks/stripe

**Events Handled:**
- invoice.payment_succeeded → Mark invoice as paid
- invoice.payment_failed → Mark invoice as failed, notify homeowner
- customer.subscription.updated → Update community plan
- charge.refunded → Handle refund

### 6.2 Plaid Webhooks

**Endpoint:** POST /api/webhooks/plaid

**Events Handled:**
- TRANSACTIONS_SYNC → Sync new bank transactions
- PENDING_EXPIRATION → Alert on pending transactions

---

## 7. Mobile API Notes

The mobile app (Expo/React Native) uses the same API as the web app. Differences:

1. Push Notifications: Register device token via POST /api/push/register
2. File Uploads: Use expo-image-picker + multipart upload
3. Offline Support: Cache key data via SQLite + sync on reconnect
4. Deep Links: properhoa://community/:slug/meeting/:id

---

*API designed for ProperHOA v1.0 MVP*  
*REST + Realtime + Streaming AI*  
*Supabase Auth + RLS for security*
