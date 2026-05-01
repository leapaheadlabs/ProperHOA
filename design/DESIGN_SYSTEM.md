# ProperHOA — Design System

**Version:** 1.0  
**Date:** 2026-05-01  
**Author:** Command (OpenClaw)  
**Built on:** shadcn/ui + Radix UI + Tailwind CSS  

---

## 1. Design Tokens

### 1.1 Color Tokens

```css
:root {
  /* Primary — Green */
  --primary-50: #f0fdf4;
  --primary-100: #dcfce7;
  --primary-200: #bbf7d0;
  --primary-300: #86efac;
  --primary-400: #4ade80;
  --primary-500: #22c55e;
  --primary-600: #16a34a;
  --primary-700: #15803d;
  --primary-800: #166534;
  --primary-900: #14532d;

  /* Secondary — Blue */
  --secondary-50: #eff6ff;
  --secondary-100: #dbeafe;
  --secondary-200: #bfdbfe;
  --secondary-300: #93c5fd;
  --secondary-400: #60a5fa;
  --secondary-500: #3b82f6;
  --secondary-600: #2563eb;
  --secondary-700: #1d4ed8;
  --secondary-800: #1e40af;
  --secondary-900: #1e3a8a;

  /* Semantic */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  --danger-50: #fef2f2;
  --danger-500: #ef4444;
  --danger-600: #dc2626;
  
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-600: #2563eb;

  /* Neutral — Light mode */
  --background: #fafafa;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --popover: #ffffff;
  --popover-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #22c55e;
  --radius: 0.75rem;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #171717;
  --card-foreground: #fafafa;
  --popover: #171717;
  --popover-foreground: #fafafa;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --border: #262626;
  --input: #262626;
  --ring: #4ade80;
}
```

### 1.2 Spacing Tokens

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 1.3 Typography Tokens

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.8125rem;  /* 13px */
--text-base: 0.9375rem; /* 15px */
--text-lg: 1.0625rem;   /* 17px */
--text-xl: 1.125rem;    /* 18px */
--text-2xl: 1.375rem;   /* 22px */
--text-3xl: 1.75rem;    /* 28px */
--text-4xl: 2rem;       /* 32px */

--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
```

### 1.4 Shadow Tokens

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/* Dark mode shadows (subtle glow instead) */
.dark --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
```

### 1.5 Border Radius Tokens

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

---

## 2. Component Specifications

### 2.1 Buttons

#### Primary Button
```
Background: var(--primary-500)
Foreground: white
Border radius: var(--radius-lg) /* 12px */
Padding: 12px 24px
Font: 15px / 600 weight
Hover: var(--primary-600) + shadow-md + translateY(-1px)
Active: var(--primary-700) + scale(0.98)
Disabled: var(--primary-300) + opacity 0.5
Transition: all 200ms ease-in-out
```

#### Secondary Button
```
Background: var(--secondary-500)
Foreground: white
/* Same specs as primary */
```

#### Ghost Button
```
Background: transparent
Foreground: var(--foreground)
Border: 1px solid var(--border)
Hover: var(--muted) background
```

#### Danger Button
```
Background: var(--danger-500)
Foreground: white
Hover: var(--danger-600)
```

#### Icon Button
```
Size: 44x44px (min touch target)
Background: transparent
Hover: var(--muted)
Border radius: var(--radius-md)
Icon size: 20px
```

### 2.2 Inputs

#### Text Input
```
Height: 48px
Background: var(--card)
Border: 1px solid var(--input)
Border radius: var(--radius-lg)
Padding: 0 16px
Font: 15px / 400 weight
Placeholder: var(--muted-foreground)
Focus: border var(--ring) + ring-2 ring-offset-2
Error: border var(--danger-500) + danger icon
Transition: border-color 200ms
```

#### Textarea
```
Min-height: 120px
/* Same as text input */
Resize: vertical
```

#### Search Input
```
/* Text input + left search icon */
Padding-left: 44px /* space for icon */
Icon: Search, 20px, var(--muted-foreground)
Clear button: X icon appears when text entered
```

#### Select / Dropdown
```
Height: 48px
/* Same as text input */
Chevron icon: ChevronDown, 20px
Dropdown: popover with options list
Selected: var(--primary-500) background on option
```

### 2.3 Cards

#### Standard Card
```
Background: var(--card)
Border: 1px solid var(--border)
Border radius: var(--radius-xl) /* 16px */
Padding: var(--space-4) /* 16px */
Shadow: var(--shadow-sm)
Hover: var(--shadow) + border-color var(--primary-200)
Transition: all 200ms
```

#### Interactive Card
```
/* Standard card + */
Cursor: pointer
Active: scale(0.98)
Touch feedback: ripple or background darken
```

#### Stat Card
```
Background: var(--primary-50) (light) or var(--primary-900) (dark)
Border radius: var(--radius-lg)
Padding: var(--space-4)
Number: text-3xl / bold / var(--primary-600)
Label: text-sm / medium / var(--muted-foreground)
Icon: 24px, top-right, var(--primary-400)
```

### 2.4 Badges

```
Border radius: var(--radius-full)
Padding: 4px 12px
Font: 12px / 500 weight / 0.01em tracking

Variants:
- Success: bg-primary-100 text-primary-700
- Warning: bg-warning-50 text-warning-600
- Danger: bg-danger-50 text-danger-600
- Info: bg-info-50 text-info-600
- Neutral: bg-muted text-muted-foreground
```

### 2.5 Avatars

```
Sizes:
- xs: 24px, text-xs
- sm: 32px, text-sm
- md: 40px, text-base
- lg: 48px, text-lg
- xl: 64px, text-xl

Border radius: var(--radius-full)
Background: var(--primary-100) if no image
Fallback: Initials (first + last)
Border: 2px solid var(--card)
```

### 2.6 Lists

#### Standard List
```
Item height: 64px min
Padding: var(--space-3) var(--space-4)
Separator: 1px border-bottom var(--border)
Hover: var(--muted) background
Active: var(--primary-50) background
```

#### List with Actions
```
/* Standard list + */
Right side: action buttons or swipe actions
Swipe threshold: 100px
Swipe actions: [Edit] [Delete] revealed on swipe
```

### 2.7 Modals / Dialogs

```
Overlay: bg-black/50 backdrop-blur-sm
Container:
  - Mobile: full screen sheet (bottom up)
  - Desktop: centered modal, max-width 480px
Background: var(--card)
Border radius: var(--radius-xl)
Padding: var(--space-6)
Shadow: var(--shadow-xl
Animation: slide-up 250ms ease-out
Close: X button top-right + tap overlay + Esc key
```

### 2.8 Bottom Sheet

```
Trigger: Button tap or swipe up
Height: 60-90% of screen
Border radius: var(--radius-2xl) on top corners only
Handle: 36px wide, 4px tall, var(--muted-foreground), centered
Close: Swipe down, tap overlay, or drag handle
Content: scrollable if exceeds height
```

### 2.9 Toast / Notifications

```
Position: bottom-center (mobile), top-right (desktop)
Max-width: 400px
Border radius: var(--radius-lg)
Padding: var(--space-3) var(--space-4)
Shadow: var(--shadow-lg)
Animation: slide-up 300ms ease-out
Auto-dismiss: 4000ms
Progress bar: bottom, shrinks over time

Variants:
- Success: bg-primary-500 text-white
- Error: bg-danger-500 text-white
- Warning: bg-warning-500 text-white
- Info: bg-secondary-500 text-white
```

### 2.10 Progress / Loading

#### Linear Progress
```
Height: 4px
Background: var(--muted)
Fill: var(--primary-500)
Border radius: var(--radius-full)
Animation: indeterminate = shimmer effect
```

#### Circular Progress
```
Size: 24px or 40px
Stroke: var(--primary-500)
Track: var(--muted)
Stroke width: 3px
Animation: rotate 1s linear infinite
```

#### Skeleton
```
Background: linear-gradient(90deg, var(--muted) 25%, var(--muted-foreground/10%) 50%, var(--muted) 75%)
Background size: 200% 100%
Animation: shimmer 1.5s infinite
Border radius: var(--radius-md)
```

---

## 3. Form Patterns

### 3.1 Form Layout

```
Mobile:
- Single column, full width
- Label above input
- 16px gap between fields
- Submit button at bottom, sticky or scroll with form

Desktop:
- Max width 480px (centered) or 2-column grid
- Label above input or inline (side-by-side)
```

### 3.2 Field States

| State | Visual |
|-------|--------|
| Default | Border var(--input), bg var(--card) |
| Focus | Border var(--ring), ring-2 ring-offset-2 |
| Valid | Border var(--primary-500), checkmark icon |
| Invalid | Border var(--danger-500), danger icon, error text below |
| Disabled | Opacity 0.5, cursor not-allowed |
| Loading | Skeleton placeholder |

### 3.3 Error Handling

```
Input with error:
┌─────────────────────────┐
│ Email                   │
├─────────────────────────┤
│ john@email              │  ← Border: danger-500
├─────────────────────────┤
│ ⚠ Please enter a valid │  ← Error text: danger-500, 13px
│   email address         │
└─────────────────────────┘
```

### 3.4 Validation Patterns

- **Inline validation:** On blur (not on every keystroke)
- **Form submission validation:** All fields validated on submit
- **Error summary:** Top of form if multiple errors
- **Field-level errors:** Below each invalid field

---

## 4. Data Visualization

### 4.1 Charts

**Library:** Recharts (React) or Chart.js (lightweight)

#### Bar Chart (Revenue vs Expenses)
```
Colors:
- Revenue: var(--primary-500)
- Expenses: var(--danger-500)
- Net: var(--secondary-500)

Grid: horizontal only, var(--border), dashed
Axis labels: 12px, var(--muted-foreground)
Tooltip: card style, shadow-md, rounded-lg
Animation: 400ms ease-out on mount
```

#### Donut Chart (Budget Breakdown)
```
Colors: primary-500, secondary-500, warning-500, info-500, neutral-400
Inner radius: 60%
Center text: Total budget amount, text-lg bold
Legend: right side, 12px labels
Hover: segment expands slightly + tooltip
```

#### Sparkline (Trend Mini Charts)
```
Height: 40px
Width: 120px
Line color: var(--primary-500)
Fill: var(--primary-500) with 10% opacity
No axis labels
Smooth curve
```

### 4.2 Tables

```
Container: card with overflow-x-auto
Header: bg-muted, text-sm font-medium, uppercase tracking-wide
Row: 56px height, hover:bg-muted/50
Cell padding: 16px
Border: 1px border-bottom var(--border)
Sorted column: var(--primary-500) text + chevron icon
Empty: empty state illustration + CTA
Loading: 5 skeleton rows
```

### 4.3 Status Indicators

| Status | Badge | Icon | Color |
|--------|-------|------|-------|
| Active | "Active" | ● | primary-500 |
| Pending | "Pending" | ○ | warning-500 |
| Overdue | "Overdue" | ! | danger-500 |
| Completed | "Done" | ✓ | primary-500 |
| Cancelled | "Cancelled" | ✕ | neutral-400 |
| Urgent | "Urgent" | ! | danger-500 |

---

## 5. Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Large phones, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile-First Strategy

```
Base (0-639px):
- Single column
- Bottom navigation
- Full-width cards
- Stacked layouts
- Touch-optimized (44px min targets)

sm (640px+):
- 2-column card grids
- Side-by-side buttons
- Larger touch targets

md (768px+):
- Sidebar navigation (if desktop)
- 2-3 column layouts
- Inline forms
- Hover states enabled

lg (1024px+):
- 3-4 column grids
- Persistent side panels
- Data tables (instead of cards)

xl (1280px+):
- AI chat panel persistent on right
- Dashboard 3-column layout
- Full financial charts
```

---

## 6. Animation Specifications

### 6.1 Transitions

```css
/* Standard transitions */
--transition-all: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-colors: background-color, border-color, color, fill, stroke 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-transform: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-opacity: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 6.2 Key Animations

```css
/* Page transition */
@keyframes page-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
duration: 200ms; easing: ease-out;

/* Modal / Sheet enter */
@keyframes sheet-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
duration: 250ms; easing: cubic-bezier(0.32, 0.72, 0, 1);

/* Toast enter */
@keyframes toast-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
duration: 300ms; easing: ease-out;

/* Toast exit */
@keyframes toast-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-16px); }
}
duration: 200ms; easing: ease-in;

/* Skeleton shimmer */
@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
duration: 1.5s; easing: linear; iteration: infinite;

/* Success checkmark */
@keyframes checkmark {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
duration: 400ms; easing: cubic-bezier(0.65, 0, 0.45, 1);

/* Button press */
@keyframes button-press {
  from { transform: scale(1); }
  to { transform: scale(0.97); }
}
duration: 100ms; easing: ease-in-out;
```

### 6.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. shadcn/ui Configuration

### 7.1 Installation

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input textarea select checkbox radio-group switch dialog sheet popover accordion tabs badge avatar skeleton toast progress slider calendar table
```

### 7.2 Customization (`tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 7.3 CSS Variables (`globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 98%;
    --foreground: 0 0% 9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;
    --primary: 142 71% 45%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217 91% 60%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 142 71% 45%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 98%;
    --primary: 142 71% 55%;
    --primary-foreground: 0 0% 4%;
    --secondary: 217 91% 70%;
    --secondary-foreground: 0 0% 4%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 65%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 142 71% 55%;
  }
}
```

---

## 8. Custom ProperHOA Components

### 8.1 CommunityCard

```tsx
// Dashboard overview card
interface CommunityCardProps {
  community: {
    name: string;
    totalHomes: number;
    openViolations: number;
    upcomingMeetings: number;
    currentBalance: number;
  };
}
```

**Layout:**
```
┌─────────────────────────────┐
│  Oakwood Estates      [⚙️]  │
│  45 homes                   │
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │  3  │ │  1  │ │ $12K│  │
│  │Viol │ │Meet │ │Bal  │  │
│  └─────┘ └─────┘ └─────┘  │
│                             │
│  [View Full Dashboard →]    │
└─────────────────────────────┘
```

### 8.2 ViolationItem

```tsx
interface ViolationItemProps {
  violation: {
    id: string;
    unitNumber: string;
    type: string;
    description: string;
    status: 'open' | 'overdue' | 'resolved';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    dueDate: Date;
    photoUrl?: string;
    daysOpen: number;
  };
  onResolve: () => void;
  onEscalate: () => void;
}
```

**Layout:**
```
┌─────────────────────────────┐
│  [📷]  Unit 12 — Trash     │
│        3 days overdue       │
│        🔴 High priority     │
│                             │
│  [Resolve] [Escalate]       │
└─────────────────────────────┘
```

### 8.3 AIChatBubble

```tsx
interface AIChatBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: { document: string; page: number }[];
  };
  onFeedback: (rating: 1 | -1) => void;
  onFollowUp: () => void;
}
```

**Layout:** See WIREFRAMES.md Screen 3.

### 8.4 QuickActionButton (FAB)

```tsx
interface QuickActionButtonProps {
  actions: {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
  }[];
}
```

**Layout:**
```
          ┌───┐
          │ + │  ← Main FAB (primary-500)
          └───┘
         /  |  \
    ┌───┐ ┌───┐ ┌───┐
    │📄 │ │💰 │ │📅 │
    └───┘ └───┘ └───┘
```

### 8.5 EmptyState

```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Layout:**
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
│    [+ Report Violation]     │
│                             │
└─────────────────────────────┘
```

---

## 9. Accessibility Checklist

### 9.1 Per-Component

| Component | ARIA | Focus | Screen Reader |
|-----------|------|-------|---------------|
| Button | role="button", aria-pressed | Visible ring | Announces action |
| Input | aria-label, aria-describedby | Visible ring | Announces label + error |
| Select | aria-expanded, aria-selected | Trap focus in list | Announces options |
| Dialog | aria-modal, aria-labelledby | Trap focus | Announces title |
| Toast | aria-live="polite/assertive" | No focus | Announces message |
| Tabs | aria-selected, aria-controls | Arrow navigation | Announces tab name |
| Accordion | aria-expanded | Enter/Space toggle | Announces state |
| Chat | aria-live="polite" | Auto-focus input | Announces new messages |

### 9.2 Global Requirements

- [ ] Skip link to main content
- [ ] Focus visible on all interactive elements
- [ ] Color contrast 4.5:1 minimum (7:1 for large text)
- [ ] Touch targets 44x44px minimum
- [ ] Reduced motion support
- [ ] Text scaling to 200%
- [ ] Screen reader tested (VoiceOver, TalkBack, NVDA)
- [ ] Keyboard navigation complete (Tab, Enter, Space, Escape, Arrows)

---

*Design system prepared for ProperHOA v1.0 MVP*  
*Built on shadcn/ui + Radix UI + Tailwind CSS*  
*Community, not corporate.*
