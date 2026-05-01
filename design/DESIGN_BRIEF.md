# ProperHOA — Design Brief

**Version:** 1.0  
**Date:** 2026-05-01  
**Author:** Command (OpenClaw)  
**Status:** DRAFT — Pending Implementation Review  

---

## 1. Design Philosophy

> ProperHOA doesn't feel like software. It feels like a really organized neighbor who has your back.

Our design language is built on five principles derived from the BRD:

### 1.1 Automate, Don't Just Digitize

Every screen must answer: *"Does this reduce the board's workload, or just move it online?"*

- **Bad:** A digital form that replaces a paper form (same work, different medium)
- **Good:** An AI assistant that answers 70% of homeowner questions before they reach the board
- **Bad:** A meeting minutes template you fill out
- **Good:** Auto-generated minutes from live vote tracking and action item capture

### 1.2 Mobile-First, Not Mobile-After

Board members manage HOAs on evenings and weekends from their couch, their car, or the grocery store. The mobile experience is the primary experience. Desktop is secondary.

- **Primary breakpoint:** 375px (iPhone SE) — design starts here
- **Secondary breakpoint:** 768px (iPad) — tablet-optimized layouts
- **Tertiary breakpoint:** 1280px+ — desktop enhancements, not desktop-first

### 1.3 Minutes, Not Hours

The entire weekly HOA workflow should fit in a 10-minute session. This means:
- **Single-tap actions** for 80% of tasks
- **No nested menus** — everything reachable in 2 taps
- **Smart defaults** — the app guesses what you want based on context
- **Batch operations** — approve 5 ARC requests at once

### 1.4 Zero Training Required

If a feature needs a tutorial, tooltip, or onboarding walkthrough, it's too complex.

- **Self-evident icons** — no icon requires a label (but labels are shown anyway)
- **Progressive disclosure** — advanced options hidden behind "More options"
- **Consistent patterns** — once you learn how violations work, ARC requests work the same way
- **Forgiving interactions** — undo available for 30 seconds on destructive actions

### 1.5 Community, Not Corporate

Language, tone, and visuals should feel like a helpful neighbor, not enterprise software.

- **Warm color palette** — no cold blues or sterile grays
- **Conversational copy** — "Your dues are due Friday" not "Payment deadline notification"
- **Human avatars** — real faces, not generic silhouettes
- **Celebration moments** — confetti when a violation is resolved, gentle reminders not stern warnings

---

## 2. Visual Identity

### 2.1 Brand Attributes

| Attribute | Expression |
|-----------|------------|
| **Trustworthy** | Clear information hierarchy, consistent patterns, reliable notifications |
| **Friendly** | Warm colors, rounded corners, conversational copy, human imagery |
| **Efficient** | Minimal steps, smart defaults, batch actions, predictive UI |
| **Transparent** | Open finances, visible decision history, clear communication trails |
| **Neighborly** | Community-focused, not corporate. "We" not "the platform." |

### 2.2 Logo & Wordmark

**Concept:** A simple house silhouette with a checkmark integrated into the roofline — symbolizing "proper" management and community care.

**Usage:**
- App icon: house + checkmark, no wordmark
- Header: wordmark "ProperHOA" in semibold, house icon as favicon
- Splash screen: animated house + checkmark drawing itself

---

## 3. Color Palette

### 3.1 Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary-50` | `#f0fdf4` | Lightest backgrounds, hover states |
| `--color-primary-100` | `#dcfce7` | Subtle highlights |
| `--color-primary-200` | `#bbf7d0` | Secondary buttons, tags |
| `--color-primary-300` | `#86efac` | Progress bars, active states |
| `--color-primary-400` | `#4ade80` | Icons, accent elements |
| `--color-primary-500` | `#22c55e` | **Primary brand color** — CTAs, primary buttons, links |
| `--color-primary-600` | `#16a34a` | Hover states for primary |
| `--color-primary-700` | `#15803d` | Active/pressed states |
| `--color-primary-800` | `#166534` | Dark mode primary |
| `--color-primary-900` | `#14532d` | Text on light backgrounds |

**Why green?** Green = growth, trust, money, "go." It's the color of a well-managed community.

### 3.2 Secondary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-secondary-50` | `#eff6ff` | Info backgrounds |
| `--color-secondary-100` | `#dbeafe` | Info highlights |
| `--color-secondary-500` | `#3b82f6` | **Secondary brand color** — links, info alerts, AI assistant accents |
| `--color-secondary-600` | `#2563eb` | Hover states |
| `--color-secondary-700` | `#1d4ed8` | Active states |

**Why blue?** Blue = information, calm, trustworthy. Used for AI assistant (the "helpful" color) and informational contexts.

### 3.3 Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success-500` | `#22c55e` | Payment received, task completed, violation resolved |
| `--color-warning-500` | `#f59e0b` | Due soon, pending review, approaching deadline |
| `--color-danger-500` | `#ef4444` | Overdue, violation, payment failed, urgent |
| `--color-info-500` | `#3b82f6` | Announcement, new feature, general information |

### 3.4 Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-neutral-50` | `#fafafa` | Page background |
| `--color-neutral-100` | `#f5f5f5` | Card backgrounds |
| `--color-neutral-200` | `#e5e5e5` | Borders, dividers |
| `--color-neutral-300` | `#d4d4d4` | Disabled states |
| `--color-neutral-400` | `#a3a3a3` | Placeholder text |
| `--color-neutral-500` | `#737373` | Secondary text |
| `--color-neutral-600` | `#525252` | Body text |
| `--color-neutral-700` | `#404040` | Headings |
| `--color-neutral-800` | `#262626` | Strong headings |
| `--color-neutral-900` | `#171717` | Maximum contrast text |

### 3.5 Dark Mode Palette

Dark mode inverts the neutral scale and adjusts primaries for contrast:

| Token | Light | Dark |
|-------|-------|------|
| Background | `#fafafa` | `#0a0a0a` |
| Card | `#ffffff` | `#171717` |
| Border | `#e5e5e5` | `#262626` |
| Text (primary) | `#171717` | `#fafafa` |
| Text (secondary) | `#737373` | `#a3a3a3` |
| Primary | `#22c55e` | `#4ade80` |
| Secondary | `#3b82f6` | `#60a5fa` |

---

## 4. Typography

### 4.1 Font Stack

**Primary:** Inter (Google Fonts) — clean, modern, excellent legibility at small sizes, great for UI  
**Monospace:** JetBrains Mono — for invoice numbers, transaction IDs, code snippets  
**Fallback:** system-ui, -apple-system, BlinkMacSystemFont, sans-serif

### 4.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-hero` | 32px | 700 | 1.1 | -0.02em | Splash screen, empty state headlines |
| `text-h1` | 28px | 700 | 1.2 | -0.02em | Page titles |
| `text-h2` | 22px | 600 | 1.25 | -0.01em | Section headers |
| `text-h3` | 18px | 600 | 1.3 | -0.01em | Card titles, list headers |
| `text-h4` | 16px | 600 | 1.35 | 0 | Subsection headers |
| `text-body` | 15px | 400 | 1.5 | 0 | Body text, descriptions |
| `text-body-sm` | 13px | 400 | 1.5 | 0 | Secondary text, metadata |
| `text-caption` | 12px | 500 | 1.4 | 0.01em | Labels, timestamps, badges |
| `text-button` | 15px | 600 | 1 | 0.01em | Button labels |
| `text-overline` | 11px | 600 | 1.2 | 0.05em | Category labels, status indicators |

**Mobile-first scaling:** Hero and H1 scale down by 10% on screens <375px.

---

## 5. Spacing System

Based on a 4px grid unit:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline spacing, icon padding |
| `space-2` | 8px | Tight gaps, small button padding |
| `space-3` | 12px | Default inline spacing |
| `space-4` | 16px | Default padding, card padding |
| `space-5` | 20px | Section padding |
| `space-6` | 24px | Card margin, list item gap |
| `space-8` | 32px | Section margin, page padding |
| `space-10` | 40px | Large section gaps |
| `space-12` | 48px | Page-level spacing |
| `space-16` | 64px | Hero sections, major dividers |

**Touch targets:** Minimum 44x44px for all interactive elements (Apple HIG compliant).

---

## 6. Component Library

### 6.1 shadcn/ui Base Components

We use shadcn/ui as the foundation. These components are unstyled primitives that we theme with our tokens:

- **Button** — Primary, secondary, ghost, danger variants
- **Input** — Text, email, password, number, search
- **Textarea** — Multi-line text, auto-resize
- **Select** — Dropdown selection
- **Checkbox** — Multi-select, terms agreement
- **RadioGroup** — Single select from options
- **Switch** — Toggle settings on/off
- **Dialog** — Modal overlays, confirmations
- **Sheet** — Bottom sheet (mobile), side panel (desktop)
- **Popover** — Dropdown menus, tooltips, date pickers
- **Accordion** — FAQ, expandable sections
- **Tabs** — Content switching
- **Badge** — Status indicators, counts
- **Avatar** — User profile pictures
- **Skeleton** — Loading placeholders
- **Toast** — Notifications, confirmations
- **Progress** — Upload progress, completion indicators
- **Slider** — Range selection
- **Calendar** — Date picking
- **Table** — Data display with sorting

### 6.2 Custom ProperHOA Components

Built on top of shadcn/ui primitives:

#### `CommunityCard`
Community overview with stats (homes, open violations, upcoming meetings, balance).

#### `ViolationItem`
Violation list item with photo thumbnail, status badge, due date countdown, quick actions.

#### `MeetingCard`
Meeting card with agenda preview, attendance count, live status indicator.

#### `InvoiceItem`
Invoice row with amount, status, due date, pay now button.

#### `AnnouncementBanner`
Pinned announcement with type icon, title, expand/collapse.

#### `AIChatBubble`
Message bubble with avatar, timestamp, feedback buttons (👍 👎).

#### `ComplianceBadge`
Deadline indicator with color-coded urgency (green/yellow/red).

#### `QuickActionButton`
Floating action button for one-tap common actions.

#### `EmptyState`
Illustration + headline + CTA for empty lists.

#### `LoadingState`
Skeleton screens matching content shape.

#### `ErrorState`
Friendly error message with retry action.

---

## 7. Iconography

**Library:** Lucide React (consistent, lightweight, open source)

**Icon Rules:**
- Use filled icons for active/selected states
- Use outline icons for inactive/default states
- Icon + label always visible (never icon-only on primary actions)
- Icon size: 20px default, 24px for navigation, 16px for inline

**Key Icons:**
- 🏠 Home / Dashboard: `Home`
- 💬 Chat / AI: `MessageSquare` (filled for active)
- 📄 Documents: `FileText`
- 💰 Finances: `DollarSign`
- 📅 Meetings: `Calendar`
- ⚠️ Violations: `AlertTriangle`
- 🔨 ARC: `Hammer`
- 📢 Announcements: `Megaphone`
- 🔧 Maintenance: `Wrench`
- 👥 Directory: `Users`
- ⚙️ Settings: `Settings`
- ✓ Complete: `CheckCircle2`
- ✗ Delete: `XCircle`
- ➕ Add: `Plus`
- 📎 Attach: `Paperclip`
- 📷 Photo: `Camera`

---

## 8. Motion & Animation

### 8.1 Philosophy

Motion should feel natural and purposeful, never decorative. Animations guide attention, confirm actions, and reduce cognitive load.

### 8.2 Principles

| Principle | Implementation |
|-----------|---------------|
| **Subtle** | 200-300ms duration, ease-in-out curves |
| **Purposeful** | Every animation communicates state change |
| **Performant** | Use transform and opacity only, avoid layout triggers |
| **Respectful** | Honor `prefers-reduced-motion` media query |

### 8.3 Patterns

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Page transition | 200ms | ease-out | Screen navigation |
| Modal/sheet enter | 250ms | cubic-bezier(0.32, 0.72, 0, 1) | Bottom sheet, dialogs |
| Button press | 100ms | ease-in-out | Scale to 0.97 on press |
| List item enter | 150ms | ease-out | New items appearing |
| Toast enter/exit | 300ms | ease-out | Notification slide |
| Skeleton shimmer | 1500ms | linear infinite | Loading placeholders |
| Success checkmark | 400ms | cubic-bezier(0.65, 0, 0.45, 1) | Task completion |
| Pull to refresh | 200ms | ease-out | List refresh gesture |

### 8.4 Micro-interactions

- **Button hover:** Slight lift (translateY -2px) + shadow increase
- **Card hover:** Border color transition to primary
- **Input focus:** Border + shadow glow in primary color
- **Toggle switch:** Smooth slide with color transition
- **Checkbox:** Check draws itself (SVG stroke animation)
- **Badge pulse:** Subtle scale pulse for urgent items

---

## 9. Accessibility

### 9.1 Standards

Target: **WCAG 2.1 Level AA** compliance.

### 9.2 Requirements

| Requirement | Implementation |
|-------------|---------------|
| **Color contrast** | All text meets 4.5:1 ratio (7:1 for large text) |
| **Touch targets** | Minimum 44x44px |
| **Screen reader** | All interactive elements have aria-labels |
| **Focus states** | Visible focus rings on all interactive elements |
| **Keyboard nav** | Full tab navigation, Enter/Space activation |
| **Motion** | Respect `prefers-reduced-motion` |
| **Text scaling** | Layout supports 200% text zoom |
| **Alt text** | All images and icons have descriptive alt text |

### 9.3 Accessibility Patterns

- **Forms:** Label + input always associated. Error messages linked via aria-describedby.
- **Dialogs:** Focus trap + escape to close + aria-modal="true".
- **Live regions:** AI chat messages announced via aria-live="polite".
- **Status updates:** Toast notifications use aria-live="assertive".

---

## 10. Dark Mode

### 10.1 Strategy

- **System preference default:** Follow `prefers-color-scheme`
- **Manual override:** Toggle in Settings
- **Persistent:** Save preference to localStorage
- **Transition:** Smooth 200ms color transition when switching

### 10.2 Implementation

Use Tailwind's `dark:` modifier with CSS variables:

```css
:root {
  --background: #fafafa;
  --foreground: #171717;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
}
```

### 10.3 Dark Mode Considerations

- **Green primary** becomes brighter (`#4ade80`) for visibility on dark backgrounds
- **Images** maintain opacity (no dimming filters)
- **Shadows** become lighter glows instead of dark shadows
- **Charts** use high-contrast palettes
- **Photos** in violation reports maintain full brightness

---

## 11. Platform-Specific Guidelines

### 11.1 iOS

- **Safe areas:** Respect iPhone notch, home indicator, dynamic island
- **Navigation:** Bottom tab bar (Apple HIG pattern)
- **Pull to refresh:** Standard iOS gesture
- **Haptic feedback:** Light tap on button press, medium on action completion
- **Swipe actions:** Right swipe for quick actions on list items
- **Share sheet:** Use iOS native share for document export

### 11.2 Android

- **Navigation:** Bottom navigation bar (Material 3 pattern)
- **Back button:** Hardware/software back always returns to previous screen
- **Pull to refresh:** Standard Android gesture
- **Vibration:** Light feedback on interactions
- **Long press:** Context menus on list items
- **Share:** Android Sharesheet for document export

### 11.3 Web

- **PWA:** Installable web app with offline capability
- **Shortcuts:** Keyboard shortcuts for power users (G = go to, / = search)
- **Print styles:** Financial reports and meeting minutes print cleanly
- **Responsive:** Fluid layout from 320px to 2560px

---

## 12. Content & Voice

### 12.1 Tone Guidelines

| Do | Don't |
|----|-------|
| "Your dues are due Friday" | "Payment deadline notification: 05/15/2026" |
| "Great job! Violation resolved." | "Violation status updated to RESOLVED" |
| "Ask me anything about your community" | "Initiate AI query session" |
| "3 homes haven't paid yet" | "3 outstanding receivables detected" |
| "Need help? I can explain your bylaws." | "Access document knowledge base" |

### 12.2 Error Messages

| Scenario | Message |
|----------|---------|
| Payment failed | "Hmm, that didn't go through. Let's try again or use a different card." |
| AI can't answer | "I'm not sure about that one. Let me connect you with the board." |
| Upload too large | "That file's a bit big. Try something under 50MB?" |
| Network error | "Looks like you're offline. We'll save this and send it when you're back." |
| Session expired | "Your session took a nap. Log back in to keep going." |

---

*Design brief prepared for ProperHOA v1.0 MVP*  
*Community, not corporate. Minutes, not hours.*
