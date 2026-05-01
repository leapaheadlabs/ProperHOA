# ProperHOA — User Flows

**Version:** 1.0  
**Date:** 2026-05-01  
**Author:** Command (OpenClaw)  

---

## Flow 1: New Community Onboarding (<15 Minutes)

**Goal:** A new board president sets up their community and invites members in under 15 minutes.

**Primary Actor:** Overwhelmed Olivia (Board President)

```
1. OPEN APP
   → Splash screen with animated logo
   → "Run your HOA in minutes a week"
   
2. CHOOSE ROLE
   → "Are you setting up a new community?"
   → [Yes, let's do this] [No, I'm a homeowner]
   
3. CREATE ACCOUNT
   → Email + password (or Google/Apple OAuth)
   → Verify email (magic link or code)
   
4. COMMUNITY SETUP (Step 1 of 3)
   → Community name: "Oakwood Estates"
   → Address: [autocomplete via Google Places]
   → State: [dropdown]
   → Number of homes: [slider 1-200]
   → "Looks great! Let's set up your homes."
   
5. HOME SETUP (Step 2 of 3)
   → "How do you want to add homes?"
   → [Add one by one] [Upload CSV] [Import from spreadsheet]
   
   Option A — One by one:
   → Unit number + address + owner name/email
   → [+ Add another] (repeat until done)
   → "You can always add more later."
   
   Option B — CSV upload:
   → Download template CSV
   → Upload filled CSV
   → Preview + confirm import
   
6. BOARD SETUP (Step 3 of 3)
   → "Who's on your board?"
   → Assign roles from existing homeowners:
     - President (you, auto-assigned)
     - Treasurer [select homeowner]
     - Secretary [select homeowner]
     - Board Members [multi-select]
   → "Don't worry — you can change this anytime."
   
7. INVITE HOMEOWNERS
   → Auto-generated invitation email preview
   → "We'll send invites to 45 homeowners. Ready?"
   → [Send Invites] [I'll do this later]
   
8. FIRST DOCUMENT UPLOAD (Optional)
   → "Upload your CC&Rs and bylaws so our AI can answer homeowner questions."
   → Drag-and-drop zone or [Skip for now]
   → AI processes documents in background (shows progress)
   
9. ONBOARDING COMPLETE
   → Celebration animation 🎉
   → "Oakwood Estates is live!"
   → Quick tips carousel (3 slides):
     - "Tap the AI to answer homeowner questions"
     - "Your dashboard shows everything at a glance"
     - "We'll remind you about upcoming deadlines"
   → [Go to Dashboard]

TOTAL TIME TARGET: <15 minutes
```

---

## Flow 2: Board Member Weekly Workflow (<10 Minutes)

**Goal:** A board president completes their weekly HOA admin in under 10 minutes.

**Primary Actor:** Overwhelmed Olivia

```
DASHBOARD (Landing Screen)
┌─────────────────────────────────────┐
│ 🏠 Oakwood Estates      🔔 3  💬 5 │
├─────────────────────────────────────┤
│                                     │
│  [AI Assistant]  [Quick Actions ▼] │
│                                     │
│  TODAY                              │
│  ├─ 📅 Board Meeting — 7PM         │
│  ├─ ⚠️ 2 violations due today      │
│  └─ 📢 Pool closing reminder sent  │
│                                     │
│  NEEDS ATTENTION                    │
│  ├─ 🔨 3 ARC requests pending      │
│  ├─ 💰 5 homes haven't paid        │
│  └─ 📄 Insurance expires in 14 days │
│                                     │
│  RECENT ACTIVITY                    │
│  ├─ Jane paid $150 dues            │
│  └─ New violation: Unit 12 trash   │
│                                     │
└─────────────────────────────────────┘

STEP 1: CHECK NOTIFICATIONS (1 min)
→ Tap bell icon → Review 3 notifications
→ Swipe to dismiss handled items
→ Tap to jump to relevant screen

STEP 2: REVIEW VIOLATIONS (2 min)
→ Tap "2 violations due today" card
→ Violations list with quick actions:
  ├─ [Resolve] — mark as fixed
  ├─ [Extend] — add 7 days to deadline
  └─ [Escalate] — send fine notice
→ Batch select → [Resolve 2 violations] → Confirm

STEP 3: APPROVE ARC REQUESTS (2 min)
→ Tap "3 ARC requests pending" card
→ ARC detail screen:
  ├─ Photo gallery of project
  ├─ Project description
  ├─ Auto-check against CC&Rs (AI suggestion)
  └─ [Approve] [Approve with Conditions] [Deny]
→ Swipe through all 3, approve with 2 taps each

STEP 4: CHECK FINANCES (3 min)
→ Tap 💰 icon → Financial Dashboard
→ Quick stats: balance, outstanding, overdue
→ "Looks good — 40/45 homes paid this month"
→ Scroll recent transactions (auto-imported from bank)
→ [No action needed] — tap back

STEP 5: AI CHECK-IN (2 min)
→ Tap AI assistant icon
→ "Any homeowner questions I couldn't answer?"
→ Review 2 escalated questions
→ Quick reply or delegate to board member
→ "All caught up! 🎉"

STEP 6: DONE
→ Dashboard shows "You're all caught up!"
→ Time elapsed: 8 minutes 42 seconds
→ [Schedule next check-in] or close app
```

---

## Flow 3: Homeowner Journey

**Goal:** A homeowner gets instant answers, pays dues, and stays informed without bothering the board.

**Primary Actor:** Curious Carlos

```
1. OPEN APP
→ Community splash screen
→ "Welcome to Oakwood Estates"

2. HOME SCREEN (Community Portal)
┌─────────────────────────────────────┐
│  Oakwood Estates         👤 Profile │
├─────────────────────────────────────┤
│                                     │
│  [💬 Ask the AI anything...]         │
│                                     │
│  MY HOME (Unit 12)                  │
│  ├─ 💰 Dues: $150 due May 15      │
│  │   [Pay Now]                     │
│  ├─ ⚠️ 1 open violation            │
│  └─ 📅 Next meeting: May 15, 7PM   │
│                                     │
│  COMMUNITY                          │
│  ├─ 📢 Pool opening this weekend    │
│  ├─ 📄 Updated bylaws posted        │
│  └─ 🔨 Landscaping scheduled        │
│                                     │
│  QUICK LINKS                        │
│  [Documents] [Directory] [Contact]  │
│                                     │
└─────────────────────────────────────┘

3. ASK AI QUESTION (30 seconds)
→ Tap AI chat bar
→ "When is trash pickup?"
→ AI responds instantly:
  "Trash pickup is every Tuesday morning. 
   Make sure cans are out by 7 AM. 
   — From CC&Rs Section 4.2"
→ [👍 Helpful] [👎 Not helpful] [Ask follow-up]

4. PAY DUES (2 minutes)
→ Tap "Pay Now" on dues card
→ Review invoice details
→ Tap payment method (saved card or add new)
→ Apple Pay / Google Pay / Card
→ Confirm → Payment processing → Success!
→ "Thank you! Receipt sent to your email."
→ Dues card updates: "Paid — Thank you! 🎉"

5. VIEW ANNOUNCEMENT (1 minute)
→ Tap "Pool opening this weekend"
→ Full announcement with details, hours, rules
→ [Add to Calendar] [Share with neighbor]
→ Swipe back to home

6. DONE
→ Close app feeling informed and satisfied
→ Total time: 3-4 minutes
→ Zero board member time consumed
```

---

## Flow 4: Treasurer Workflow

**Goal:** A treasurer reconciles books, sends invoices, and reviews payments efficiently.

**Primary Actor:** Cautious Cathy

```
1. OPEN FINANCIAL DASHBOARD
→ Tap 💰 from main nav

FINANCIAL DASHBOARD
┌─────────────────────────────────────┐
│  FINANCES            [+ Invoice ▼] │
├─────────────────────────────────────┤
│                                     │
│  CURRENT BALANCE                    │
│  $12,500.00                         │
│  ↑ 3.2% from last month            │
│                                     │
│  THIS MONTH                         │
│  ├─ Revenue: $3,750                │
│  ├─ Expenses: $2,100               │
│  └─ Net: +$1,650                   │
│                                     │
│  [View Reports] [Budget vs Actual] │
│                                     │
│  OUTSTANDING INVOICES               │
│  ├─ 5 invoices outstanding         │
│  ├─ $4,500 total                   │
│  └─ $1,200 overdue                 │
│                                     │
│  RECENT TRANSACTIONS                │
│  ├─ -$450  Landscaping (Apr 28)    │
│  ├─ +$150  Dues Unit 12 (Apr 27)   │
│  └─ -$200  Insurance (Apr 25)      │
│                                     │
│  BANK ACCOUNTS                      │
│  ├─ HOA Checking: $8,500           │
│  └─ Reserve Fund: $4,000           │
│  [Sync Now]                        │
│                                     │
└─────────────────────────────────────┘

STEP 1: SYNC BANK TRANSACTIONS (2 min)
→ Tap [Sync Now] next to bank account
→ If Plaid connected: Auto-syncs in background
→ If manual: "Upload latest bank statement"
   → Select CSV/OFX file
   → Auto-parse preview
   → Review matched transactions
   → Confirm import

STEP 2: RECONCILE (3 min)
→ Tap "Reconcile" on unmatched transactions
→ Smart suggestions:
   "This $150 payment matches Invoice #2026-0042?"
   → [Yes, match] [No, categorize] [Skip]
→ Bulk confirm suggested matches
→ Review remaining uncategorized items
→ Assign categories (Dues, Maintenance, Insurance, etc.)

STEP 3: SEND INVOICES (2 min)
→ Tap [+ Invoice ▼] → "Send monthly dues"
→ Auto-generates invoices for all homes:
   ├─ Amount: $150 each
   ├─ Due date: 1st of next month
   ├─ Late fee: $25 after 15th
   └─ Total: 45 invoices × $150 = $6,750
→ Preview invoice template
→ [Send All] → Confirmation → Sent!
→ Notifications sent to all homeowners

STEP 4: REVIEW PAYMENTS (2 min)
→ Filter transactions by "Payments Received"
→ Review new payments since last check
→ Confirm auto-matched payments
→ Flag any discrepancies for board review

STEP 5: CHECK BUDGET (1 min)
→ Tap [Budget vs Actual]
→ Visual chart showing spending by category
→ Green: under budget | Yellow: approaching limit | Red: over budget
→ "We're 15% under budget on landscaping — nice!"
→ Export PDF report for next meeting

STEP 6: DONE
→ Dashboard shows "Books are balanced! ✓"
→ Time: 10 minutes
→ Close app confidently
```

---

## Flow 5: Meeting Workflow

**Goal:** A board secretary creates, runs, and publishes a meeting with minimal effort.

**Primary Actor:** Secretary Sarah (Board Secretary)

```
1. CREATE MEETING (3 minutes)
→ Tap [+ Meeting] from dashboard
→ Meeting details:
  ├─ Title: "Monthly Board Meeting — June"
  ├─ Date/Time: [Date picker] [Time picker]
  ├─ Location: "Community Clubhouse" (or "Virtual — Zoom")
  └─ Type: [Regular] [Special] [Annual] [Emergency]

→ "Want me to build the agenda?"
→ Tap [Auto-Generate Agenda] 🤖
→ AI creates agenda from:
  ├─ Open action items from last meeting
  ├─ Pending violations requiring review
  ├─ Pending ARC requests
  ├─ Treasurer's report slot
  ├─ Old business / New business
  └─ Next meeting scheduling
→ Review and edit agenda items
→ Drag to reorder
→ [Save Draft] [Publish]

→ Publish triggers:
  ├─ Email to all homeowners
  ├─ Push notification
  ├─ Added to community calendar
  └─ RSVP tracking enabled

2. LIVE MEETING (Duration varies)
→ Tap meeting card → [Start Meeting]
→ Live meeting screen:
┌─────────────────────────────────────┐
│  🟢 LIVE — Board Meeting              │
│  Elapsed: 0:32:15                   │
├─────────────────────────────────────┤
│                                     │
│  AGENDA                             │
│  ✓ 1. Call to Order                │
│  ✓ 2. Treasurer's Report           │
│  ▶ 3. Violation Review (current)   │
│  ○ 4. ARC Requests                 │
│  ○ 5. New Business                 │
│  ○ 6. Adjourn                      │
│                                     │
│  ATTENDEES (5/5 board)             │
│  [Jane] [Mike] [Sarah] [Tom] [You] │
│                                     │
│  CURRENT ITEM                       │
│  Violation #14 — Unit 12 trash      │
│  Photos: [📷] [📷]                │
│  Days open: 14                      │
│                                     │
│  [Mark Resolved] [Extend] [Escalate]│
│                                     │
│  VOTES (if needed)                  │
│  ├─ Jane: Approve                   │
│  ├─ Mike: Approve                   │
│  └─ [Cast Vote]                     │
│                                     │
│  ACTION ITEMS                       │
│  ├─ Get fence quote (Mike, May 30) │
│  └─ [+ Add Action Item]            │
│                                     │
└─────────────────────────────────────┘

→ Tap agenda items to advance
→ Record votes in real-time
→ Add action items with assignments
→ Board members join via app (attendance auto-tracked)
→ Homeowners can watch live stream (optional)

3. PUBLISH MINUTES (2 minutes)
→ Tap [End Meeting] → "Publish minutes?"
→ Auto-generated minutes from:
  ├─ Agenda items + duration
  ├─ Vote tallies
  ├─ Action items with owners and deadlines
  ├─ Attendance record
  └─ Notes taken during meeting
→ Review and edit
→ [Publish to Community]
→ Minutes emailed to all homeowners
→ Stored in document hub
→ Action items added to compliance calendar

4. FOLLOW-UP
→ Dashboard shows action items from meeting
→ Reminders auto-sent to assigned board members
→ Next meeting auto-suggested based on bylaws
```

---

## Flow 6: Violation & ARC Workflow

**Goal:** A complete violation or ARC request flows from report to resolution without board overwhelm.

### Violation Flow

```
1. REPORT VIOLATION (Reporter — anyone)
→ Tap [+ Violation] or AI chat: "Unit 12 left trash cans out"
→ Auto-detects home from context, or select manually
→ Violation type: [Trash] [Parking] [Noise] [Landscaping] [Pet] [Other]
→ Take photo(s) — camera opens directly
→ Description: "Trash cans left at curb past pickup day"
→ Priority: [Low] [Normal] [High] [Urgent]
→ Submit → Auto-assigned deadline (7 days default)

2. BOARD NOTIFICATION (President)
→ Push notification: "New violation reported"
→ Tap → Review violation details
→ [Acknowledge] → Homeowner gets: "Your report is being reviewed"

3. HOMEOWNER NOTIFICATION (Violating home)
→ Email + push: "Trash violation reported. Please resolve by May 8."
→ Link to violation details + photo evidence
→ [I've Fixed It] button for homeowner self-resolution

4. AUTO-ESCALATION (System)
→ Day 3 (no resolution): Reminder email to homeowner
→ Day 5: Board notification + fine warning
→ Day 7: Auto-escalate status, fine notice generated
→ Fine amount based on community settings

5. RESOLUTION
→ Homeowner fixes issue → taps [I've Fixed It]
→ Board reviews → [Confirm Resolution] or [Not Fixed]
→ If confirmed: Violation marked resolved
→ Confetti animation 🎉
→ "Violation resolved! Nice work."
→ If fine applied: Invoice auto-generated

6. ANALYTICS
→ Dashboard shows: "3 violations this month (down from 5 last month)"
→ Trend graph by type
→ "Trash violations are your #1 issue — consider reminder signs?"
```

### ARC Request Flow

```
1. SUBMIT REQUEST (Homeowner)
→ Tap [+ ARC Request]
→ Project type: [Fence] [Deck] [Paint] [Roof] [Addition] [Other]
→ Description + dimensions + materials
→ Upload plans/photos
→ Expected start/end dates
→ Submit → "Your request is under review. You'll hear back within 14 days."

2. BOARD REVIEW (Board)
→ Notification: "New ARC request from Unit 15"
→ Review details + plans
→ AI suggestion: "Compliant with CC&R Section 7.3. Max height 6ft."
→ Vote: [Approve] [Approve with Conditions] [Deny]
→ If conditions: "Must use cedar wood, setback 2ft from property line"
→ If deny: Reason required

3. HOMEOWNER NOTIFICATION
→ Email + push: "Your fence request was approved with conditions"
→ View conditions + approval document
→ [Accept Conditions] or [Withdraw Request]

4. COMPLETION TRACKING
→ Homeowner can mark project complete with photos
→ Board final inspection (optional)
→ Record stored in document hub
→ Future resale: "All ARCs on file, compliant"
```

---

## Flow 7: Emergency / Urgent Flow

**Goal:** Handle urgent situations quickly with clear escalation paths.

```
URGENT ANNOUNCEMENT (Board President)
→ Tap [+ Announcement] → Select type: [Urgent]
→ Title: "Water main break — water shut off until 6PM"
→ Body: Details + estimated resolution
→ Target: [All residents] [Board only]
→ [Send Immediately]

IMMEDIATE DELIVERY:
→ Push notification (high priority, bypasses quiet hours)
→ SMS (if opted in)
→ Email
→ Socket.io broadcast (realtime for active users)
→ Announcement pinned to top of community feed

HOMEOWNER EXPERIENCE:
→ Phone buzzes with urgent notification
→ Opens app → Full announcement on screen
→ "Got it" button to dismiss
→ Unread count on bell icon cleared

BOARD FOLLOW-UP:
→ Dashboard tracks: "45/45 residents acknowledged"
→ 2 not acknowledged → Auto-SMS reminder
→ Update posted: "Water restored at 5:30PM"
→ Residents get update notification
```

---

## Flow 8: Settings & Administration

**Goal:** Board members manage community settings, users, and integrations.

```
SETTINGS MENU
├─ Community Profile
│  ├─ Name, address, logo
│  ├─ Fiscal year settings
│  └─ Timezone
├─ Members
│  ├─ Invite new homeowner
│  ├─ Manage board roles
│  ├─ Deactivate/resident
│  └─ Export directory
├─ Dues & Billing
│  ├─ Set monthly dues amount
│  ├─ Late fee rules
│  ├─ Special assessment templates
│  └─ Stripe account settings
├─ Bank Accounts
│  ├─ Connect bank (Plaid)
│  ├─ Manual account setup
│  └─ Import transactions
├─ Documents
│  ├─ Upload CC&Rs, bylaws
│  ├─ Document categories
│  └─ Public vs private settings
├─ Notifications
│  ├─ Default notification rules
│  ├─ Quiet hours
│  └─ Urgent override settings
├─ Integrations
│  ├─ Stripe (connected ✓)
│  ├─ Plaid (connect)
│  ├─ Google Calendar
│  └─ QuickBooks (future)
├─ Compliance
│  ├─ Upcoming deadlines
│  ├─ Recurring items
│  └─ State-specific requirements
└─ Danger Zone
   ├─ Reset community data
   ├─ Transfer ownership
   └─ Delete community

ROLE-BASED ACCESS:
- President: Full access
- Treasurer: Finances, bank accounts, invoices
- Secretary: Meetings, documents, announcements
- Board Member: Read-only settings
- Homeowner: Profile, notifications, payment methods only
```

---

*User flows designed for ProperHOA v1.0 MVP*  
*Minutes, not hours. Community, not corporate.*
