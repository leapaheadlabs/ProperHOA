# ProperHOA — Wireframes

**Version:** 1.0  
**Date:** 2026-05-01  
**Author:** Command (OpenClaw)  

---

## Wireframe Conventions

- `[  ]` = Button or interactive element
- `┌─┐` = Card or container
- `▶` = Active/selected state
- `...` = Truncated content
- `⇅` = Scrollable area
- Sizes: Mobile-first (375px width), desktop noted where different

---

## Screen 1: Board Dashboard (Command Center)

**Primary screen for board members. Opened 80% of sessions.**

```
┌─────────────────────────────┐  ← 375px width
│  🏠 Oakwood Estates    🔔3 💬│  ← Header: community name + notification badges
│─────────────────────────────│
│                             │
│  👋 Good morning, Jane!     │  ← Personalized greeting (time-based)
│                             │
│  ┌───────────────────────┐  │
│  │ 🤖 Ask the AI anything │  │  ← AI Chat CTA (prominent, always visible)
│  │ "Trash day? Dues?      │  │
│  │  Fence rules?"         │  │
│  └───────────────────────┘  │
│                             │
│  TODAY                      │  ← Date header
│  ┌───────────────────────┐  │
│  │ 📅 Board Meeting      │  │
│  │ Today, 7:00 PM        │  │
│  │ Clubhouse             │  │
│  │ [Join] [View Agenda]  │  │
│  └───────────────────────┘  │
│                             │
│  NEEDS ATTENTION            │  ← Priority section (color-coded urgency)
│  ┌───────────────────────┐  │
│  │ ⚠️ 2 Violations       │  │  ← Red badge = urgent
│  │ Due today             │  │
│  │ [Review →]            │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 🔨 3 ARC Requests     │  │  ← Yellow badge = pending
│  │ Pending approval      │  │
│  │ [Review →]            │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 💰 5 Overdue Payments │  │  ← Red badge = financial
│  │ $1,200 total          │  │
│  │ [Send Reminders]      │  │
│  └───────────────────────┘  │
│                             │
│  QUICK STATS                │  ← At-a-glance metrics
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 45  │ │ 3   │ │ 1   │  │
│  │Homes│ │Open │ │Meet │  │
│  └─────┘ └─────┘ └─────┘  │
│                             │
│  RECENT ACTIVITY            │  ← Scrollable feed
│  ┌───────────────────────┐  │
│  │ ✅ Unit 12 paid $150   │  │
│  │ 2 hours ago           │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 📢 Pool rules updated  │  │
│  │ Yesterday             │  │
│  └───────────────────────┘  │
│  ⇅                        │  ← Pull to refresh
│                             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐  │  ← Bottom Navigation
│  │ 🏠│ │ 💬│ │ 💰│ │ 👤│  │
│  │Home│ │Chat│ │Fin │ │Prof││
│  └───┘ └───┘ └───┘ └───┘  │
└─────────────────────────────┘
```

**Desktop (1280px+):**
- Left sidebar: Navigation (expanded with labels)
- Main area: Dashboard cards in 2-column grid
- Right sidebar: AI assistant panel (always visible)

---

## Screen 2: Homeowner Community Portal

**Primary screen for homeowners. Simple, informative, actionable.**

```
┌─────────────────────────────┐
│  Oakwood Estates     👤 [≡] │  ← Tap profile for settings
│─────────────────────────────│
│                             │
│  ┌───────────────────────┐  │
│  │ 💬 Ask anything...    │  │  ← AI Chat bar (prominent)
│  └───────────────────────┘  │
│                             │
│  MY HOME (Unit 12)         │  ← Personal section header
│  ┌───────────────────────┐  │
│  │ 💰 Monthly Dues       │  │
│  │ $150 — Due May 15     │  │
│  │                       │  │
│  │ [Pay Now] [View Invoice]│
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ ⚠️ Trash Violation    │  │
│  │ Reported May 1        │  │
│  │ [View Details]        │  │
│  │ [I've Fixed It ✓]     │  │
│  └───────────────────────┘  │
│                             │
│  UPCOMING                   │
│  ┌───────────────────────┐  │
│  │ 📅 Board Meeting       │  │
│  │ May 15, 7:00 PM       │  │
│  │ [Add to Calendar]     │  │
│  └───────────────────────┘  │
│                             │
│  COMMUNITY NEWS             │
│  ┌───────────────────────┐  │
│  │ 📢 Pool Opening!       │  │
│  │ Memorial Day weekend   │
│  │ [Read More →]          │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 📄 New Bylaws Posted   │  │
│  │ Updated parking rules  │  │
│  │ [Read More →]          │  │
│  └───────────────────────┘  │
│                             │
│  QUICK LINKS                │
│  [Documents] [Directory]   │
│  [Contact Board] [Report]  │
│                             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
│  │ 🏠│ │ 💬│ │ 📄│ │ 👤│  │
│  │Home│ │Chat│ │Docs│ │Prof││
│  └───┘ └───┘ └───┘ └───┘  │
└─────────────────────────────┘
```

---

## Screen 3: AI Chat Interface

**The signature feature. Conversational, helpful, community-scoped.**

```
┌─────────────────────────────┐
│  [←] AI Assistant      [?]  │  ← Back button + help
│─────────────────────────────│
│                             │
│  ┌───────────────────────┐  │
│  │ 🤖 Hi! I'm your HOA │  │  ← Welcome message
│  │ assistant. Ask me     │  │    (only on first open)
│  │ anything about        │  │
│  │ Oakwood Estates!      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 💡 Suggested:          │  │
│  │ • When is trash day?   │  │
│  │ • What are the dues?  │  │
│  │ • Fence height rules? │  │
│  └───────────────────────┘  │
│                             │
│  ─────────────────────────  │  ← Chat history
│                             │
│  ┌───────────────────────┐  │
│  │ When is trash pickup? │  │  ← User message (right-aligned)
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🤖 Trash pickup is    │  │  ← AI response (left-aligned)
│  │ every Tuesday morning │  │
│  │ before 7 AM.         │  │
│  │                      │  │
│  │ 📄 Source: CC&Rs      │  │  ← Citation badge
│  │ Section 4.2, Page 12 │  │
│  │                      │  │
│  │ 👍  👎  [Follow-up?] │  │  ← Feedback + follow-up
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Can I pay my dues     │  │
│  │ online?               │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🤖 Yes! You can pay   │  │
│  │ your $150 monthly dues│  │
│  │ securely through the  │  │
│  │ app.                  │  │
│  │                      │  │
│  │ [Pay Now 💰]          │  │  ← Action button in chat
│  │                      │  │
│  │ 👍  👎  [Follow-up?] │  │
│  └───────────────────────┘  │
│                             │
│  🤖 is typing...            │  ← Typing indicator
│                             │
│─────────────────────────────│
│  🎤  [Ask anything...]  📎│  ← Input bar with voice + attachment
│                             │
└─────────────────────────────┘
```

**States:**
- **Empty state:** Welcome message + suggested questions
- **Loading state:** Typing indicator + pulsing avatar
- **Error state:** "I'm not sure about that. Let me connect you with the board." + [Escalate] button
- **Escalated state:** Board notification sent, user sees "The board will get back to you shortly."

---

## Screen 4: Dues & Payment Screen

**Clear, simple, trustworthy payment experience.**

```
┌─────────────────────────────┐
│  [←] Payment           [?]  │
│─────────────────────────────│
│                             │
│  INVOICE #2026-0042         │
│  ┌───────────────────────┐  │
│  │ Monthly Dues           │  │
│  │                        │  │
│  │ Unit 12                │  │
│  │ Oakwood Estates        │  │
│  │                        │  │
│  │ Amount: $150.00        │  │
│  │ Due: May 15, 2026     │  │
│  │                        │  │
│  │ Late fee if after      │  │
│  │ May 30: $25.00         │  │
│  │                        │  │
│  │ Total Due: $150.00     │  │
│  │                        │  │
│  │ [Download PDF]         │  │
│  └───────────────────────┘  │
│                             │
│  PAYMENT METHOD             │
│  ┌───────────────────────┐  │
│  │ 💳 •••• 4242          │  │  ← Saved card (if any)
│  │ Visa — Exp 12/27       │  │
│  │ [Change]               │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ [Apple Pay]            │  │  ← Platform-native payment
│  │ [Google Pay]           │  │
│  │                        │  │
│  │ — or pay with card —   │  │
│  │                        │  │
│  │ [Card Number    ]      │  │
│  │ [MM/YY] [CVC] [ZIP]    │  │
│  │                        │  │
│  │ ☑ Save for next time   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │     [Pay $150.00]      │  │  ← Big primary CTA
│  └───────────────────────┘  │
│                             │
│  🔒 Secured by Stripe       │  ← Trust badge
│                             │
│  [Set up Auto-Pay]          │  ← Secondary CTA
│                             │
└─────────────────────────────┘
```

**Success state:**
```
┌─────────────────────────────┐
│                             │
│        ✅                  │
│                             │
│    Payment Complete!       │
│                             │
│    $150.00 received        │
│    Receipt #REC-2026-1042  │
│                             │
│    [View Receipt]          │
│    [Done]                  │
│                             │
└─────────────────────────────┘
```

---

## Screen 5: Meeting Manager

**Create, manage, and run meetings.**

### Meeting List
```
┌─────────────────────────────┐
│  [←] Meetings          [+]  │
│─────────────────────────────│
│                             │
│  UPCOMING                   │
│  ┌───────────────────────┐  │
│  │ 📅 Board Meeting       │  │
│  │ May 15, 7:00 PM        │  │
│  │ Clubhouse              │  │
│  │ 5 board members going  │  │
│  │ [View Agenda →]        │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 📅 Annual Meeting      │  │
│  │ Jun 20, 6:00 PM        │  │
│  │ Community Center       │  │
│  │ [View Agenda →]        │  │
│  └───────────────────────┘  │
│                             │
│  PAST                       │
│  ┌───────────────────────┐  │
│  │ ✅ Apr 15 Board Mtg    │  │
│  │ Minutes published      │  │
│  │ [View Minutes →]       │  │
│  └───────────────────────┘  │
│                             │
│  [+ Schedule New Meeting]   │
│                             │
└─────────────────────────────┘
```

### Live Meeting Screen
```
┌─────────────────────────────┐
│  🟢 LIVE  Board Meeting     │
│  0:32:15 elapsed       [End]│
│─────────────────────────────│
│                             │
│  AGENDA                     │
│  ✓ 1. Call to Order        │
│  ✓ 2. Treasurer's Report    │
│  ▶ 3. Violation Review     │  ← Current item highlighted
│  ○ 4. ARC Requests         │
│  ○ 5. New Business         │
│  ○ 6. Adjourn              │
│                             │
│  [Next Item →]              │
│                             │
│  CURRENT ITEM               │
│  ┌───────────────────────┐  │
│  │ Violation #14          │  │
│  │ Unit 12 — Trash cans   │  │
│  │ Days open: 14          │  │
│  │ [📷] [📷]             │  │
│  │                        │  │
│  │ [Mark Resolved]        │
│  │ [Extend 7 Days]        │
│  │ [Issue $50 Fine]       │
│  └───────────────────────┘  │
│                             │
│  ATTENDEES (5/5)            │
│  [Jane✓] [Mike✓] [Sarah✓] │
│  [Tom✓] [You✓]              │
│                             │
│  ACTION ITEMS               │
│  ├─ Get fence quote        │
│  │  Assigned: Mike, May 30  │
│  └─ [+ Add Action Item]    │
│                             │
│  VOTES                      │
│  Budget Approval:           │
│  [Approve] [Deny] [Abstain] │
│  Results: 4-0-0             │
│                             │
└─────────────────────────────┘
```

---

## Screen 6: Violation Tracker

**Report, track, and resolve violations.**

### Violation List
```
┌─────────────────────────────┐
│  [←] Violations       [+]  │
│  [All] [Open] [Resolved]    │  ← Filter tabs
│─────────────────────────────│
│                             │
│  ┌───────────────────────┐  │
│  │ ⚠️ Unit 12 — Trash   │  │
│  │ 3 days overdue        │  │
│  │ 🔴 High priority       │
│  │ [📷] Photo attached    │
│  │ [Resolve] [Escalate]   │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ ⚠️ Unit 8 — Parking    │  │
│  │ Due tomorrow            │
│  │ 🟡 Normal priority      │
│  │ [📷]                   │
│  │ [Resolve] [Extend]     │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ ✅ Unit 5 — Noise      │  │
│  │ Resolved yesterday      │
│  │ 🟢 Low priority         │
│  │ [View Details →]        │
│  └───────────────────────┘  │
│                             │
│  [+ Report Violation]       │
│                             │
└─────────────────────────────┘
```

### Violation Detail
```
┌─────────────────────────────┐
│  [←] Violation #14          │
│─────────────────────────────│
│                             │
│  STATUS: 🔴 Overdue         │
│                             │
│  ┌───────────────────────┐  │
│  │ 📷 [Photo 1] [Photo 2]│  │
│  └───────────────────────┘  │
│                             │
│  Type: Trash                │
│  Location: Unit 12 curb     │
│  Reported: May 1 by Jane    │
│  Due: May 8 (3 days ago)    │
│                             │
│  Description:               │
│  Trash cans left at curb    │
│  past pickup day.           │
│                             │
│  REMINDER HISTORY           │
│  ├─ May 1: Initial notice │
│  ├─ May 5: Reminder sent    │
│  └─ May 8: Fine warning     │
│                             │
│  HOMEOWNER RESPONSE         │
│  "I'll fix it tonight"      │
│  — Carlos, May 5            │
│                             │
│  ACTIONS                    │
│  [✓ Mark Resolved]          │
│  [⚡ Escalate + Fine]       │
│  [📧 Send Reminder]         │
│  [✏️ Edit]                  │
│                             │
└─────────────────────────────┘
```

---

## Screen 7: ARC Request Form & Approval

**Homeowners submit, board members approve architectural changes.**

### Submit ARC (Homeowner)
```
┌─────────────────────────────┐
│  [←] ARC Request       [?]  │
│─────────────────────────────│
│                             │
│  PROJECT TYPE               │
│  [Fence ▼]                  │
│                             │
│  DESCRIPTION                │
│  [6-foot privacy fence     │
│   along back property line  │
│   ...                      │]
│                             │
│  DIMENSIONS                 │
│  Height: [6] ft             │
│  Length: [40] ft            │
│                             │
│  MATERIALS                  │
│  [Cedar ▼]                  │
│                             │
│  PLANS / PHOTOS             │
│  ┌───────────────────────┐  │
│  │ [+] [📷] [📷]        │  │  ← Upload or take photos
│  └───────────────────────┘  │
│                             │
│  TIMELINE                   │
│  Start: [Date picker]       │
│  End: [Date picker]         │
│                             │
│  ┌───────────────────────┐  │
│  │   [Submit Request]     │  │
│  └───────────────────────┘  │
│                             │
│  "You'll hear back within   │
│   14 days"                  │
│                             │
└─────────────────────────────┘
```

### Review ARC (Board)
```
┌─────────────────────────────┐
│  [←] ARC #23             [?]│
│─────────────────────────────│
│                             │
│  FROM: Unit 15 — Mike       │
│  SUBMITTED: May 2           │
│  TYPE: Fence                │
│                             │
│  ┌───────────────────────┐  │
│  │ [📷 Plan] [📷 Photo]  │  │
│  └───────────────────────┘  │
│                             │
│  DESCRIPTION                │
│  6-foot cedar privacy fence │
│  along back property line.  │
│  Dimensions: 6ft × 40ft     │
│                             │
│  🤖 AI COMPLIANCE CHECK     │
│  ┌───────────────────────┐  │
│  │ ✅ Compliant with     │  │
│  │ CC&R Section 7.3      │
│  │ Max height: 6ft ✓     │
│  │ Setback: 2ft ✓        │
│  │ Material: Cedar ✓     │
│  └───────────────────────┘  │
│                             │
│  VOTES                      │
│  Jane: [Approve] [Deny]     │
│  Mike: [Approve] [Deny]     │
│  You: [Approve ▼]           │  ← Your vote
│                             │
│  CONDITIONS (if approving)   │
│  [Must stain within 30     │
│   days...                  │]
│                             │
│  DENIAL REASON (if denying)  │
│  [                          │]
│                             │
│  ┌───────────────────────┐  │
│  │ [Submit Vote]          │  │
│  └───────────────────────┘  │
│                             │
│  RESULT: 3 Approve, 0 Deny  │
│  Status: Approved             │
│  [Notify Homeowner →]       │
│                             │
└─────────────────────────────┘
```

---

## Screen 8: Document Hub

**Centralized document storage with search and version control.**

```
┌─────────────────────────────┐
│  [←] Documents    [🔍] [+]  │
│─────────────────────────────│
│  [All] [CC&Rs] [Bylaws]     │
│  [Minutes] [Financial]      │
│  [Insurance] [Other]        │
│─────────────────────────────│
│                             │
│  ┌───────────────────────┐  │
│  │ 🔍 Search documents   │  │
│  │ "trash, fence, pool..."│  │
│  └───────────────────────┘  │
│                             │
│  📄 CC&Rs (Original)         │
│  ┌───────────────────────┐  │
│  │ [PDF icon]             │
│  │ CC&Rs — Oakwood Estates│
│  │ Updated: Jan 15, 2026  │
│  │ 24 pages               │
│  │ Public ✓               │
│  │ [View] [Download]      │
│  └───────────────────────┘  │
│                             │
│  📄 Bylaws                  │
│  ┌───────────────────────┐  │
│  │ [PDF icon]             │
│  │ Bylaws — Oakwood       │
│  │ Updated: Mar 1, 2026   │
│  │ 12 pages               │
│  │ Public ✓               │
│  │ [View] [Download]      │
│  └───────────────────────┘  │
│                             │
│  📄 Insurance Policy 2026   │
│  ┌───────────────────────┐  │
│  │ [PDF icon]             │
│  │ General Liability      │
│  │ Expires: Jun 15, 2027  │
│  │ 🔴 Expires in 45 days  │
│  │ Board Only             │
│  │ [View] [Download]      │
│  └───────────────────────┘  │
│                             │
│  📄 Feb Board Minutes       │
│  ┌───────────────────────┐  │
│  │ [PDF icon]             │
│  │ Board Meeting Minutes  │
│  │ Feb 15, 2026           │
│  │ Public ✓               │
│  │ [View] [Download]      │
│  └───────────────────────┘  │
│                             │
│  [+ Upload Document]        │
│                             │
└─────────────────────────────┘
```

---

## Screen 9: Financial Dashboard

**Treasurer's command center. Clear, audit-ready, no CPA required.**

```
┌─────────────────────────────┐
│  [←] Finances        [+ ▼]  │
│─────────────────────────────│
│                             │
│  CURRENT BALANCE            │
│  $12,500.00                 │
│  ↑ $850 from last month    │
│                             │
│  ┌───────────────────────┐  │
│  │ 📊 Monthly Overview    │  │
│  │                        │  │
│  │ [Bar chart: Revenue    │  │
│  │  vs Expenses by month] │  │
│  │                        │  │
│  │ Revenue:  $3,750       │  │
│  │ Expenses: -$2,100      │  │
│  │ ───────────────        │  │
│  │ Net:      +$1,650      │  │
│  └───────────────────────┘  │
│                             │
│  OUTSTANDING                │
│  ┌───────────────────────┐  │
│  │ 💰 5 invoices          │  │
│  │ $4,500 total           │
│  │ 🔴 $1,200 overdue      │
│  │ [View All →]           │
│  └───────────────────────┘  │
│                             │
│  BUDGET VS ACTUAL           │
│  ┌───────────────────────┐  │
│  │ [Donut chart]          │  │
│  │ Total Budget: $45,000  │  │
│  │ Spent: $18,900 (42%)   │
│  │ Remaining: $26,100     │
│  │                        │  │
│  │ Landscaping: $3,200/$5K│  │
│  │ Insurance: $2,400/$2.4K│  │
│  │ Maintenance: $1,800/$3K │  │
│  └───────────────────────┘  │
│                             │
│  RECENT TRANSACTIONS        │
│  ┌───────────────────────┐  │
│  │ -$450  Landscaping     │  │
│  │ Apr 28 — Reconciled ✓  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ +$150  Dues Unit 12    │  │
│  │ Apr 27 — Reconciled ✓  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ -$200  Insurance       │  │
│  │ Apr 25 — Reconciled ✓  │  │
│  └───────────────────────┘  │
│                             │
│  BANK ACCOUNTS              │
│  ┌───────────────────────┐  │
│  │ 🏦 HOA Checking       │  │
│  │ $8,500.00              │
│  │ Last sync: 2 hours ago │  │
│  │ [Sync Now]             │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 🏦 Reserve Fund       │  │
│  │ $4,000.00              │
│  │ Last sync: 2 hours ago │  │
│  │ [Sync Now]             │
│  └───────────────────────┘  │
│                             │
│  [+ ▼] New Invoice          │
│  [Import Bank Statement]      │
│                             │
└─────────────────────────────┘
```

---

## Screen 10: Compliance Calendar

**Proactive deadline tracking. Never miss a filing again.**

```
┌─────────────────────────────┐
│  [←] Compliance        [+]  │
│─────────────────────────────│
│  [Upcoming] [Due Soon]      │
│  [Overdue] [Completed]      │
│─────────────────────────────│
│                             │
│  MAY 2026                   │
│  ┌───────────────────────┐  │
│  │ 📅 15                  │  │
│  │ Tax Filing Due         │  │
│  │ Form 1120-H            │
│  │ 🔴 14 days left        │
│  │ [View Details →]       │
│  └───────────────────────┘  │
│                             │
│  JUNE 2026                  │
│  ┌───────────────────────┐  │
│  │ 📅 15                  │  │
│  │ Insurance Renewal      │  │
│  │ General Liability      │
│  │ 🟡 45 days left        │
│  │ [View Details →]       │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 📅 30                  │  │
│  │ Annual Meeting         │
│  │ Required by bylaws       │
│  │ 🟢 60 days left        │
│  │ [View Details →]       │
│  └───────────────────────┘  │
│                             │
│  [+ Add Compliance Item]    │
│                             │
│  LEGEND                     │
│  🟢 30+ days  🟡 <30 days   │
│  🔴 <14 days  ⚫ Overdue    │
│                             │
└─────────────────────────────┘
```

---

## Screen 11: Community Directory

**Opt-in resident contact sharing.**

```
┌─────────────────────────────┐
│  [←] Directory       [🔍]   │
│─────────────────────────────│
│  [All] [Owners] [Renters]  │
│─────────────────────────────│
│                             │
│  ┌───────────────────────┐  │
│  │ 🔍 Search residents   │  │
│  └───────────────────────┘  │
│                             │
│  Unit 12                    │
│  ┌───────────────────────┐  │
│  │ [👤] John & Jane Doe   │  │
│  │ Owners                  │
│  │ 📧 john@email.com       │
│  │ 📱 +1-555-123-4567      │
│  │ 🐕 2 pets              │  │
│  │ [Message] [Call]      │
│  └───────────────────────┘  │
│                             │
│  Unit 15                    │
│  ┌───────────────────────┐  │
│  │ [👤] Mike Smith        │  │
│  │ Owner (Board President) │
│  │ 📧 mike@email.com       │
│  │ 📱 +1-555-987-6543      │
│  │ [Message] [Call]      │
│  └───────────────────────┘  │
│                             │
│  Unit 8                     │
│  ┌───────────────────────┐  │
│  │ [👤] Renter            │
│  │ (Contact via owner)    │
│  │ Owner: Sarah Johnson    │
│  │ [Message Owner]        │
│  └───────────────────────┘  │
│                             │
│  [Edit My Info]             │
│                             │
└─────────────────────────────┘
```

---

## Screen 12: Empty States

**Friendly, actionable empty states for every list.**

### No Violations
```
┌─────────────────────────────┐
│                             │
│         🎉                  │
│                             │
│    No Open Violations!      │
│                             │
│    Your community is        │
│    looking great.           │
│                             │
│    [+ Report Violation]   │
│                             │
└─────────────────────────────┘
```

### No Meetings Scheduled
```
┌─────────────────────────────┐
│                             │
│         📅                  │
│                             │
│    No Upcoming Meetings     │
│                             │
│    Time to schedule your    │
│    next board meeting?        │
│                             │
│    [Schedule Meeting]       │
│                             │
└─────────────────────────────┘
```

### No Documents
```
┌─────────────────────────────┐
│                             │
│         📄                  │
│                             │
│    No Documents Yet         │
│                             │
│    Upload your CC&Rs and    │
│    bylaws to get started.   │
│                             │
│    [Upload First Document]  │
│                             │
└─────────────────────────────┘
```

---

## Screen 13: Mobile Navigation Patterns

### Bottom Tab Bar (Primary)
```
┌─────────────────────────────┐
│                             │
│         (content)           │
│                             │
│─────────────────────────────│
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
│  │ 🏠│ │ 💬│ │ 💰│ │ 👤│  │
│  │Home│ │Chat│ │Fin │ │Prof││
│  └───┘ └───┘ └───┘ └───┘  │
│      ▲                      │  ← Active tab highlighted
└─────────────────────────────┘
```

### Bottom Tab Bar (Board Member — 5 tabs)
```
┌─────────────────────────────┐
│─────────────────────────────│
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐       │
│  │🏠│ │💬│ │📄│ │💰│ │👤│     │
│  │H  │ │C  │ │D  │ │F  │ │P  │
│  └──┘ └──┘ └──┘ └──┘ └──┘  │
└─────────────────────────────┘
```

### Top Navigation (Secondary screens)
```
┌─────────────────────────────┐
│  [←] Title           [⋯]   │
│─────────────────────────────│
│                             │
│  [←] Back button          │
│  [Title] Screen name       │
│  [⋯] Overflow menu (sort,  │
│      filter, settings)     │
│                             │
└─────────────────────────────┘
```

### Floating Action Button
```
┌─────────────────────────────┐
│                             │
│         (content)           │
│                             │
│              ┌───┐          │
│              │ + │          │  ← FAB for primary create action
│              └───┘          │
│─────────────────────────────│
│  (bottom tab bar)           │
└─────────────────────────────┘
```

### Pull to Refresh
```
┌─────────────────────────────┐
│        ↓ Pull to refresh    │  ← Swipe down gesture
│                             │
│         🔄                  │
│      Syncing...             │
│                             │
└─────────────────────────────┘
```

---

*Wireframes designed for ProperHOA v1.0 MVP*  
*Mobile-first, community-focused, minutes-not-hours.*
