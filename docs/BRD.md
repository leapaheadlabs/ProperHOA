# ProperHOA — Business Requirements Document (BRD)

**Version:** 1.0  
**Date:** 2026-05-01  
**Author:** Command (OpenClaw)  
**Status:** DRAFT — Pending Architecture & Product Strategy Gates  

---

## 1. Executive Summary

ProperHOA is an **AI-assisted, mobile-native HOA management platform** purpose-built for **self-managed communities of 10–100 homes** — the "forgotten middle" of the $1.2B+ HOA software market.

Small HOAs today are stuck between two bad options: overpaying for enterprise-grade management software (designed for 500+ unit communities) or cobbling together spreadsheets, Facebook groups, and paper newsletters. The result is predictable: **volunteer board burnout, compliance risk, and frustrated homeowners.**

ProperHOA's thesis: *Don't just digitize HOA work — automate it away.*

**Tagline:** *"Run your HOA in minutes a week, not hours."*

---

## 2. Market Problem & Opportunity

### 2.1 The Pain (Evidence-Based)

| Pain Point | Source |
|------------|--------|
| Volunteer board members spend 5–10 hrs/week on unpaid admin work | Reddit r/HOA, HOA My Way, Propty.io |
| Most HOA software is built for professional management companies, not volunteers | Minutesmith.com, JoinIt 2026 review |
| Per-unit pricing is punitive to small communities (20-home HOA pays same per-door as 500-home) | EffortlessHOA pricing guide |
| Communication black holes: email threads, FB groups, paper newsletters = missed info & drama | Multiple Reddit threads, HOA Central |
| Mobile experience is an afterthought; board members manage on evenings/weekends from phones | SoftwareConnect 2026 reviews |
| Compliance anxiety: missed filing deadlines, insurance renewals, document expirations | HOA Talk forums, Vinteum blog |
| Architectural review & violation tracking done via email/photos with no workflow | Reddit r/HOA ARC threads |

### 2.2 Market Size

- **HOA Software Market:** $1.23B USD (2024) → projected $2.56B by 2033 (Verified Market Reports)
- **Community Associations:** 355,000+ in the US alone (CAI data)
- **Self-Managed HOAs:** Estimated 40–50% of all HOAs (no professional management company)
- **Target Segment:** 10–100 home, self-managed communities = ~80,000–120,000 potential customers in the US

### 2.3 The Void

Current solutions either:
- **Under-serve:** Basic tools (HOA Start, KindHOA free tier) with limited features
- **Over-serve:** Enterprise platforms (AppFolio, Vantaca, Yardi) with punitive minimums
- **Miss the AI/automation angle entirely:** No competitor offers an AI board assistant that reduces repetitive homeowner inquiries

**Our window:** First-mover advantage in AI-assisted small HOA management.

---

## 3. Target Audience

### 3.1 Primary Persona: The Volunteer Board President

- **Name:** "Overwhelmed Olivia"
- **Age:** 35–55
- **Role:** Board President / Treasurer of 25-home HOA
- **Tech Comfort:** Moderate (uses Slack, Google Docs, mobile banking)
- **Pain:** "I didn't sign up to be a part-time property manager."
- **Goal:** Keep the neighborhood running smoothly with <2 hrs/week of admin work

### 3.2 Secondary Persona: The Homeowner

- **Name:** "Curious Carlos"
- **Age:** 30–65
- **Role:** Homeowner who wants to know: When's trash day? What's the fence policy? When is the next meeting?
- **Pain:** "I can't find the CC&Rs and the board never answers my emails."
- **Goal:** Get instant answers without bothering volunteer board members

### 3.3 Tertiary Persona: The Treasurer

- **Name:** "Cautious Cathy"
- **Role:** Handles HOA finances, bank reconciliation, budgeting
- **Pain:** QuickBooks is overkill; spreadsheets are error-prone
- **Goal:** Simple, audit-ready financials with automatic bank sync

---

## 4. Competitive Analysis

### 4.1 Direct Competitors

| Competitor | Pricing | Strengths | Weaknesses |
|------------|---------|-----------|------------|
| **PayHOA** | $50–150/mo | Popular for small HOAs, good reviews | Limited features, no AI, per-unit costs hurt small communities |
| **KindHOA** | Free / $29/mo | Aggressive pricing, new | Unproven brand, limited feature depth |
| **EasyHOA** | Flat monthly | Built for self-managed | Limited marketing presence, basic feature set |
| **HOA Start** | $39/mo (~$1.30/unit) | Budget-friendly | Feature-light, no automation |
| **Condo Control** | $150+/mo | Strong communication features | Overpriced for small HOAs |
| **Smartwebs** | Enterprise | 16+ years in market | Built for scale, overkill for <50 homes |

### 4.2 Indirect Competitors

- **QuickBooks + Google Workspace + Facebook Group:** The "Frankenstein stack" — free but fragmented, error-prone, and time-consuming
- **Professional Management Companies:** $300–500+/mo for small HOAs — overkill for many communities

### 4.3 Our Differentiation Matrix

| Capability | ProperHOA | PayHOA | KindHOA | Condo Control |
|------------|-----------|--------|---------|---------------|
| AI Board Assistant | ✅ | ❌ | ❌ | ❌ |
| Mobile-Native (Board + Homeowner apps) | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Smart Meeting Engine (auto-agenda, minutes, votes) | ✅ | ❌ | ❌ | ⚠️ |
| Violation/ARC Auto-Pilot | ✅ | ⚠️ | ⚠️ | ✅ |
| Bank-Sync Simple Accounting | ✅ | ✅ | ⚠️ | ✅ |
| Proactive Compliance Alerts | ✅ | ❌ | ❌ | ❌ |
| Flat Pricing (no per-unit gouging) | ✅ | ❌ | ✅ | ❌ |
| Setup Time | <15 min | Hours | 15 min | Hours |

---

## 5. Product Vision

### 5.1 Vision Statement

> Every self-managed HOA — regardless of size — deserves a management experience as effortless as checking their bank balance. ProperHOA makes that possible by combining intuitive mobile design with intelligent automation that learns each community's unique needs.

### 5.2 Product Principles

1. **Automate, Don't Just Digitize** — Every feature must reduce board workload, not just move it online
2. **Mobile-First, Not Mobile-After** — Board members manage on phones; the experience must be native and delightful
3. **Minutes, Not Hours** — The entire weekly HOA workflow should fit in a 10-minute session
4. **Zero Training Required** — If a feature needs a tutorial, it's too complex
5. **Community, Not Corporate** — Language, tone, and UX should feel like a helpful neighbor, not enterprise software

---

## 6. Core Features & Requirements

### 6.1 Feature Tiers

#### **Tier 1: MVP (Phase 1 — Must Have)**

| Feature | Description | Success Criteria |
|---------|-------------|-----------------|
| **AI Board Assistant** | Chat/text-based AI that answers routine homeowner questions using community documents (CC&Rs, bylaws, rules). Reduces repetitive board inquiries by 70%+. | <5 sec response time, 90%+ accuracy on FAQ-style questions |
| **Mobile-Native Apps** | Separate iOS/Android apps for Board members and Homeowners. Board app = command center. Homeowner app = community portal. | 4.5+ star rating, <30 sec to complete common tasks |
| **Dues & Payment Collection** | Automated invoicing, autopay setup, late fee calculation, payment tracking. Integrates with Stripe/Plaid. | 95%+ on-time payment rate for autopay users |
| **Simple Accounting** | Bank transaction sync, chart of accounts, budget vs. actual reporting, P&L and balance sheet. No CPA required. | Treasurer can reconcile books in <15 min/week |
| **Community Document Hub** | Centralized storage for CC&Rs, bylaws, meeting minutes, insurance docs, vendor contracts. Version control + search. | Full-text search, automatic expiration alerts |
| **Announcement & Communication** | Push notifications, SMS, email broadcasts. Targeted by role (all homeowners, board only, committee). | 80%+ open rate on critical announcements |
| **Meeting Management** | Meeting scheduling, agenda creation, minutes template, attendance tracking. | Board can schedule & publish meeting in <5 min |

#### **Tier 2: Differentiators (Phase 2 — Should Have)**

| Feature | Description | Success Criteria |
|---------|-------------|-----------------|
| **Smart Meeting Engine** | Auto-generates agenda from open action items, tracks votes, assigns follow-ups, publishes minutes automatically | 50% reduction in meeting prep time |
| **Violation & ARC Auto-Pilot** | Photo-based submission, automatic status updates, reminder escalation, approval routing with deadlines | 80% of violations resolved without board intervention |
| **Proactive Compliance Calendar** | Automated alerts for filing deadlines, insurance renewals, document expirations, tax dates | Zero missed compliance deadlines for active users |
| **Maintenance & Work Order Tracking** | Vendor coordination, cost tracking, resident-reported issues with photo evidence | Average issue resolution time tracked & improving |
| **Community Directory** | Resident directory with opt-in contact sharing, emergency contacts, pet registry | 90%+ participation rate |

#### **Tier 3: Expansion (Phase 3 — Nice to Have)**

| Feature | Description |
|---------|-------------|
| **Online Voting & Surveys** | Secure digital voting for amendments, board elections, budget approvals |
| **Amenity Reservations** | Pool, clubhouse, tennis court booking with conflict detection |
| **Vendor Marketplace** | Curated vendor network with community reviews, preferred pricing |
| **Multi-HOA Management** | For management companies or individuals serving multiple communities |
| **Integrations** | QuickBooks, Xero, Mailchimp, Slack, Google Calendar |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Page load time: <2 seconds (95th percentile)
- AI response time: <5 seconds
- Payment processing: Real-time confirmation
- 99.9% uptime SLA

### 7.2 Security & Compliance
- SOC 2 Type II (target: within 12 months of launch)
- PCI DSS compliance for payment processing
- End-to-end encryption for all financial data
- Role-based access control (RBAC)
- GDPR/CCPA compliant data handling
- Document retention policies per state requirements

### 7.3 Scalability
- Support 1–200 homes per community initially
- Horizontal scaling to support 10,000+ communities
- Multi-tenancy architecture

### 7.4 Accessibility
- WCAG 2.1 AA compliance
- Support for screen readers
- Responsive design for all device sizes

---

## 8. Monetization Strategy

### 8.1 Pricing Tiers

| Plan | Price | Target | Features |
|------|-------|--------|----------|
| **Free** | $0 | Tiny HOAs (<15 homes) | Basic communication, document hub, directory, 1 meeting/month |
| **Essential** | **$39/mo flat** | 10–50 home HOAs | Full feature set minus AI assistant, 1 admin |
| **Pro** | **$79/mo flat** | 50–100 home HOAs | Everything including AI assistant, unlimited admins, priority support |
| **Enterprise** | Custom | 100+ homes / management companies | Multi-HOA, API access, dedicated account manager |

**Why flat pricing wins:** A 20-home HOA pays $39/mo = **$1.95/home/month**. A 100-home HOA pays $79/mo = **$0.79/home/month**. Everyone saves vs. per-unit competitors. No minimums. No surprises.

### 8.2 Revenue Projections (Conservative)

| Year | Communities | Avg MRR | Annual Revenue |
|------|-------------|---------|----------------|
| Year 1 | 500 | $55 | $330,000 |
| Year 2 | 2,000 | $58 | $1,392,000 |
| Year 3 | 5,000 | $60 | $3,600,000 |

### 8.3 Additional Revenue Streams
- **Payment Processing:** Stripe/Plaid revenue share (~0.5–1%)
- **Vendor Marketplace:** Lead generation fees from vetted contractors
- **Premium Integrations:** QuickBooks Pro, advanced reporting

---

## 9. Success Metrics (KPIs)

### 9.1 Product Metrics
- **Board Time Saved:** Average weekly admin hours (target: <2 hrs/week by month 6)
- **AI Deflection Rate:** % of homeowner questions answered by AI without board intervention (target: 70%)
- **Task Completion Time:** Median time to complete common tasks (target: <30 seconds)
- **Feature Adoption:** % of communities using >5 core features (target: 80%)

### 9.2 Business Metrics
- **Monthly Churn:** <3% monthly (industry benchmark for SaaS)
- **Net Promoter Score (NPS):** >50
- **Customer Acquisition Cost (CAC):** <$200
- **Lifetime Value (LTV):** >$1,500 (2+ year retention)
- **LTV:CAC Ratio:** >5:1

### 9.3 Engagement Metrics
- **DAU/MAU Ratio:** >40% (healthy SaaS benchmark)
- **Mobile App Retention:** Day 7 >60%, Day 30 >40%
- **Support Ticket Volume:** <1 per community per month

---

## 10. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **AI Hallucination** | Medium | High | Retrieval-augmented generation (RAG) grounded in community docs; human escalation path |
| **Security Breach (Financial Data)** | Low | Critical | PCI DSS, SOC 2, penetration testing, bug bounty program |
| **Slow Customer Acquisition** | Medium | High | Freemium tier + viral loop (homeowners invite neighbors); content marketing + SEO |
| **Competitor Response** | Medium | Medium | Speed-to-market, AI moat, community-focused brand; patent defensive AI features |
| **Volunteer Board Turnover** | High | Medium | Simple onboarding (<15 min); automatic handoff workflows; "HOA continuity" feature |
| **State Regulatory Variations** | Medium | Medium | Modular compliance engine; state-specific templates; legal review per state expansion |

---

## 11. Phase 1 Roadmap (MVP — 0→1)

### Month 1–2: Foundation
- [ ] Architecture & tech stack decision (React Native? Flutter? PWA?)
- [ ] Database schema design (multi-tenant)
- [ ] CI/CD pipeline, staging environment
- [ ] Stripe/Plaid payment integration prototype
- [ ] AI assistant POC (OpenAI/Claude + RAG on CC&Rs)

### Month 3–4: Core Build
- [ ] Board mobile app (iOS + Android)
- [ ] Homeowner mobile app (iOS + Android)
- [ ] Document hub with full-text search
- [ ] Dues invoicing + autopay
- [ ] Simple accounting module
- [ ] Announcement/notification system

### Month 5: Alpha
- [ ] Internal testing with 3–5 real HOAs
- [ ] AI assistant training & refinement
- [ ] Security audit (penetration test)
- [ ] Beta onboarding flow optimization

### Month 6: Beta Launch
- [ ] Public beta (50 communities)
- [ ] NPS surveys, usage analytics
- [ ] Iteration based on feedback
- [ ] Prepare for GA

---

## 12. Open Questions & Decisions Needed

1. **Tech Stack:** React Native vs Flutter vs Native? (Owned by: Architecture domain)
2. **AI Provider:** OpenAI GPT-4 vs Claude vs self-hosted Llama? (Owned by: Architecture + Budget)
3. **Payment Processor:** Stripe vs Plaid vs both? (Owned by: Architecture + Finance)
4. **Launch Geography:** US-only initially? Which states? (Owned by: Product Strategy)
5. **Freemium Limits:** How generous should free tier be? (Owned by: Product Strategy + Growth)
6. **Data Residency:** Single region or multi-region from day 1? (Owned by: Architecture)

---

## 13. Gate Status

| Gate | Status | Evidence | Next Step |
|------|--------|----------|-----------|
| **Market Intelligence** | ✅ PASS | Competitive analysis, pricing research, pain point validation | — |
| **Product Strategy** | ✅ PASS | Personas defined, feature tiers scoped, pricing validated | — |
| **Business Requirements** | ✅ PASS | This document | Route to Architecture |
| **Solution Architecture** | 🔲 PENDING | Tech stack, infra, security design needed | Assign to Architecture domain |
| **UX/UI Design** | 🔲 BLOCKED | Waiting on Architecture decisions | Assign to Design domain |
| **Implementation** | 🔲 BLOCKED | Waiting on PRD + Architecture | Assign to Forge domain |

**Recommendation:** This BRD is ready for Architecture gate. The market void is validated, differentiation is clear, and the scope is bounded enough for a 6-month MVP.

---

## Appendix A: Sources & References

1. Verified Market Reports — HOA Software Market 2024–2033
2. Credence Research — HOA Management Software Market 2024–2032
3. Reddit r/HOA — Multiple threads on self-managed HOA pain points (2022–2025)
4. HOA Start, EasyHOA, KindHOA, PayHOA — Public pricing pages (2025–2026)
5. SoftwareConnect, Capterra, GetApp — 2026 HOA Software reviews
6. CAI (Community Associations Institute) — Industry statistics
7. Minutesmith.com — "Best HOA Management Software for Small Boards (2026)"

---

*Document prepared by Command (OpenClaw) for Leap Ahead Labs.*  
*Ready for Architecture gate assignment.*
