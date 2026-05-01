# ProperHOA — API Specification v1.1 (Self-Hosted)

**Version:** 1.1  
**Date:** 2026-05-01  
**Base URL:** `https://api.properhoa.com` (production) / `https://api-staging.properhoa.com`  
**Protocol:** REST + WebSocket (Socket.io)  
**Auth:** Session cookie (NextAuth.js) or JWT Bearer (`Authorization: Bearer <token>`)  
**Content-Type:** `application/json`  

---

## 1. Authentication

### 1.1 Session-Based (Web)

NextAuth.js v5 session cookie:

```http
Cookie: next-auth.session-token=eyJhbGciOiJIUzI1NiIs...
```

### 1.2 JWT Bearer (Mobile / API Clients)

For mobile apps and programmatic API access:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The JWT contains:
- `sub` — app_user UUID
- `community_id` — user's community
- `role` — app_role (president, treasurer, etc.)
- `exp` — expiry

### 1.3 Token Refresh

- Web: Automatic via NextAuth.js session refresh
- Mobile: POST `/api/auth/refresh` with refresh token

---

## 2. Response Format

### Success

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

### Error

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

### 3.1 AI Assistant (Ollama)

#### `POST /api/ai/chat`

Initiates a streaming chat session with the self-hosted AI Board Assistant.

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
event: token
data: {"token": "Trash"}

event: token
data: {"token": " pickup"}

event: token
data: {"token": " is"}

event: done
data: {"session_id": "uuid", "sources": [{"doc": "Rules & Regulations", "page": 4}]}
```

**Backend Flow:**
```
POST /api/ai/chat
    → Validate user session
    → Set RLS context (community_id, role)
    → Generate embedding via Ollama (nomic-embed-text)
    → pgvector RAG query:
       SELECT content, document_id, metadata
       FROM document_chunks
       WHERE community_id = '...'
       ORDER BY embedding <=> query_embedding
       LIMIT 5;
    → Build prompt: "Context: [chunks...] Question: [message]"
    → POST to Ollama localhost:11434/api/generate
    → Stream response back via SSE
    → Log to chat_sessions table
```

**Error Codes:**
- `AI_RATE_LIMITED` — Too many requests (429)
- `AI_CONTEXT_TOO_LARGE` — Document context exceeded (413)
- `AI_UNAVAILABLE` — Ollama not responding (503)

---

#### `GET /api/ai/sessions`

List user's chat history.

**Query Params:**
- `limit` — default 20, max 100
- `offset` — default 0
- `session_type` — optional filter

---

#### `POST /api/ai/:session_id/feedback`

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

#### `GET /api/documents`

List community documents.

**Query Params:**
- `type` — filter by document type
- `is_public` — true/false
- `search` — full-text search query (passed to Meilisearch)
- `sort` — `created_at` | `title` | `updated_at`
- `order` — `asc` | `desc`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "CC&Rs - Original",
      "type": "ccr",
      "file_url": "https://properhoa.com/api/documents/uuid/download?token=signed",
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

#### `POST /api/documents`

Upload a new document.

**Request (multipart/form-data):**
```
file: <binary>
title: "Insurance Policy 2026"
type: "insurance"
is_public: false
expires_at: "2027-01-01"
```

**Process:**
1. Validate file (max 50MB, allowed types: pdf, doc, docx, jpg, png)
2. Upload to MinIO (bucket: `communities/{community_id}/documents/`)
3. Extract text via Node.js (pdf-parse, mammoth)
4. Chunk text (500-1000 chars with overlap)
5. Generate embeddings via Ollama (nomic-embed-text)
6. Store chunks in `document_chunks` with pgvector embedding
7. Sync to Meilisearch for full-text search
8. Return document metadata

---

#### `GET /api/documents/:id/download`

Get signed download URL (redirect to MinIO presigned URL).

---

#### `DELETE /api/documents/:id`

Soft delete (archives, removes from Meilisearch index).

---

### 3.3 Meetings

#### `GET /api/meetings`

List meetings.

**Query Params:**
- `status` — scheduled | completed | cancelled
- `from_date` — ISO date
- `to_date` — ISO date
- `type` — regular | special | annual

---

#### `POST /api/meetings`

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
  ],
  "auto_generate_agenda": false
}
```

**Smart Agenda Feature:**
If `auto_generate_agenda: true`:
1. Pull open action items from previous meeting
2. Add pending violations requiring review
3. Include pending ARC requests
4. Add standard items (treasurer report, old business)
5. Format as ordered agenda items

---

#### `POST /api/meetings/:id/start`

Mark meeting as in-progress.

**Triggers Socket.io events:**
- `meeting:{id}:started` — Broadcast to all community members
- Realtime agenda updates enabled

---

#### `POST /api/meetings/:id/minutes`

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
  ],
  "auto_publish": true
}
```

**Auto-publish:** If `auto_publish: true`, minutes emailed to all homeowners via Nodemailer.

---

### 3.4 Violations

#### `GET /api/violations`

List violations with filters.

**Query Params:**
- `status` — open | acknowledged | in_review | resolved | escalated
- `priority` — low | normal | high | urgent
- `home_id` — filter by property
- `type` — parking | noise | trash | landscaping | pet | architectural
- `sort` — `created_at` | `due_date` | `priority`

---

#### `POST /api/violations`

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

**Auto-escalation (background job via pg_cron or BullMQ + Redis):**
- Day 1: Email reminder to homeowner
- Day 3: Second reminder + board notification
- Day 7: Auto-escalate to "escalated" status + fine notice

---

#### `POST /api/violations/:id/resolve`

Mark violation as resolved.

---

### 3.5 ARC (Architectural Review)

#### `GET /api/arc-requests`

List architectural review requests.

**Query Params:**
- `status` — submitted | under_review | approved | denied | withdrawn
- `home_id` — filter by property

---

#### `POST /api/arc-requests/:id/vote`

Board member votes on ARC request.

**Request:**
```json
{
  "vote": "approve",
  "conditions": "Must use cedar wood, max 6 feet",
  "denial_reason": null
}
```

---

### 3.6 Payments & Invoicing

#### `GET /api/invoices`

List invoices.

**Query Params:**
- `status` — outstanding | paid | overdue | partial
- `home_id` — filter by property
- `type` — dues | special_assessment | fine

---

#### `POST /api/invoices`

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
- Stripe invoice created via API
- Email notification sent to homeowner via Nodemailer
- Added to compliance calendar if recurring

---

#### `POST /api/payments`

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
4. Stripe webhook updates invoice status on success

---

#### `POST /api/payments/setup-autopay`

Set up automatic recurring payments.

---

### 3.7 Accounting (Manual Bank Import)

#### `GET /api/accounting/summary`

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

#### `POST /api/accounting/import`

Upload bank statement for import.

**Request (multipart/form-data):**
```
bank_account_id: "uuid"
file: <CSV or OFX file>
format: "csv"
```

**Process:**
1. Parse CSV/OFX headers and rows
2. Validate date format, amounts, required columns
3. Create `import_batch` record
4. Insert transactions into `transactions` table
5. Auto-suggest matches to existing invoices
6. Return summary: { imported: 45, matched: 38, errors: 2 }

---

#### `GET /api/accounting/import/:batch_id`

Get import status and details.

---

#### `POST /api/accounting/transactions/:id/reconcile`

Match a bank transaction to an invoice.

**Request:**
```json
{
  "invoice_id": "uuid",
  "match_type": "payment"
}
```

---

#### `GET /api/accounting/transactions`

Bank transactions (imported via CSV/OFX).

**Query Params:**
- `from_date` — ISO date
- `to_date` — ISO date
- `category` — filter by category
- `reconciled` — true/false

---

### 3.8 Compliance

#### `GET /api/compliance`

Upcoming compliance deadlines.

---

#### `POST /api/compliance/:id/complete`

Mark compliance item as complete.

**Request (multipart/form-data):**
```
document: <binary proof file>
notes: "Renewed with State Farm, policy #12345"
```

**Auto-action:** If `recurring: true`, auto-creates next year's item.

---

### 3.9 Announcements

#### `GET /api/announcements`

List announcements.

**Query Params:**
- `type` — general | urgent | meeting_reminder | payment_reminder
- `target_audience` — all | board_only | homeowners
- `is_pinned` — true/false

---

#### `POST /api/announcements`

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
- Socket.io broadcast to target audience
- Email broadcast via Nodemailer
- Web Push notifications (if subscribed)

---

### 3.10 Maintenance

#### `GET /api/maintenance`

List maintenance requests.

---

#### `POST /api/maintenance`

Create maintenance request.

---

### 3.11 Users & Community

#### `GET /api/users/me`

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
      "push": true,
      "sms": false
    }
  }
}
```

---

#### `GET /api/community`

Community details + stats.

---

#### `GET /api/community/directory`

Resident directory (opt-in only).

---

### 3.12 Push Notifications

#### `POST /api/push/subscribe`

Register Web Push subscription.

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "device_info": { "browser": "Chrome", "os": "Android" }
}
```

---

#### `POST /api/push/unsubscribe`

Remove push subscription.

---

## 4. Realtime Events (Socket.io)

**Connection:** `wss://api.properhoa.com/socket.io`

**Authentication:** JWT token passed in connection handshake:
```javascript
const socket = io('wss://api.properhoa.com', {
  auth: { token: 'jwt-token' }
});
```

### 4.1 Community Room

```javascript
socket.emit('join_community', communityId);

socket.on('announcement', (data) => { ... });
socket.on('violation_update', (data) => { ... });
socket.on('meeting_scheduled', (data) => { ... });
```

### 4.2 Meeting Room (Live Meeting)

```javascript
socket.emit('join_meeting', meetingId);

socket.on('agenda_updated', (data) => { ... });
socket.on('vote_cast', (data) => { ... });
socket.on('attendee_joined', (data) => { ... });
```

### 4.3 Personal Notifications

```javascript
socket.on('notification', (data) => { ... });
```

---

## 5. Rate Limiting (Redis)

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| General API | 100 | 1 minute |
| Auth (login/register) | 10 | 1 minute |
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

**Endpoint:** `POST /api/webhooks/stripe`

**Events Handled:**
- `invoice.payment_succeeded` → Mark invoice as paid
- `invoice.payment_failed` → Mark invoice as failed, notify homeowner
- `customer.subscription.updated` → Update community plan
- `charge.refunded` → Handle refund

**Verification:** Stripe signature validation required.

---

## 7. Mobile API Notes

The mobile app (Expo/React Native) uses the same API as the web app.

**Differences:**
1. **Push Notifications:** Register Web Push token via `POST /api/push/subscribe` (or native Expo Push if using Expo Notifications)
2. **File Uploads:** Use `expo-image-picker` + multipart upload
3. **Offline Support:** Cache key data via SQLite + sync on reconnect
4. **Deep Links:** `properhoa://community/:slug/meeting/:id`
5. **Auth:** JWT Bearer instead of session cookie (mobile can't reliably use httpOnly cookies)

---

## 8. Meilisearch Integration

Documents are synced to Meilisearch for full-text search:

```javascript
// On document creation/update
documentsIndex.addDocuments({
  id: document.id,
  title: document.title,
  content: document.content_text,
  type: document.type,
  community_id: document.community_id,
  is_public: document.is_public,
  updated_at: document.updated_at
});
```

**Search endpoint:** `GET /api/search?q=trash+pickup&type=rule`

**Meilisearch filters:** `community_id = '...' AND (is_public = true OR role IN ('president', ...))`

---

*API designed for ProperHOA v1.1 — Self-Hosted Edition*  
*REST + Socket.io + Streaming AI via Ollama*  
*NextAuth.js + RLS for security*
