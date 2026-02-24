# SafeTrack London Design System

## Design Goals

SafeTrack London prioritizes **clarity, urgency, and trust** over aesthetic polish. This is a safety tool first, used frequently at night, often in stressful situations. Good design for this app means:

- **Immediate comprehension** — critical information (safety scores, warnings, route options) visible at a glance
- **High contrast and legibility** — readable on phone screens in darkness or bright daylight
- **Minimal cognitive load** — no unnecessary decoration, every element serves a purpose
- **Trust through transparency** — show data sources, explain scores, never hide complexity behind vague language

The aesthetic direction is **utilitarian dark mode**. Think emergency services dashboards, not consumer social apps. Serious, functional, reliable.

### Key Design Principles

1. **Information density over whitespace** — users need to scan multiple data points quickly
2. **Color as signal, not decoration** — red/amber/green mean something specific
3. **Text hierarchy through weight and size, not color alone** — remains accessible in all conditions
4. **Progressive disclosure** — critical info first, details on demand
5. **No animations except loading states** — respect battery life and reduce distraction


## Brand

**App Name:** SafeTrack London  
**Tagline:** Navigate safer, not just faster

### Brand Voice

- **Direct and honest** — "This route passes through an unlit underpass" not "Some areas may have reduced visibility"
- **Calm but clear about risk** — no alarmism, but no sugar-coating
- **Local and specific** — "Brent River Park underpass" not "isolated zone 1"
- **Respectful of user intelligence** — explain *why* something matters, don't just warn

Examples:
- ✅ "6 crimes reported in this area in the past month"
- ❌ "This area has some safety concerns"

- ✅ "Last bus departs in 18 minutes"
- ❌ "Service ending soon"

## Color System

**Color Mode:** Dark-only by default (app frequently used at night, dark mode reduces battery drain and screen glare in low light).

### Background Colors

```css
--bg-app: #0a0a0a;           /* Main app background */
--bg-surface: #111111;       /* Panels, cards, header */
--bg-surface-elevated: #1a1a1a; /* Inputs, selected states */
--bg-overlay: rgba(0, 0, 0, 0.9); /* Modals, sheets */
```

### Text Colors

```css
--text-primary: #ffffff;     /* Body text, headings */
--text-secondary: #cccccc;   /* Supporting text */
--text-muted: #888888;       /* Timestamps, metadata */
--text-disabled: #555555;    /* Disabled states */
```

### Border Colors

```css
--border-default: #333333;   /* Standard borders */
--border-subtle: #222222;    /* Section dividers */
--border-focus: #0066ff;     /* Input focus rings */
```


### Action & Status Colors

```css
/* Safety Scores */
--safety-high: #00cc66;      /* Score 8-10 */
--safety-medium: #ffaa00;    /* Score 5-7 */
--safety-low: #ff3333;       /* Score 0-4 */

/* Primary Actions */
--action-primary: #0066ff;   /* Route button, primary CTA */
--action-primary-hover: #0052cc;
--action-primary-active: #003d99;

/* Secondary Actions */
--action-secondary: #333333;
--action-secondary-hover: #444444;

/* Destructive Actions */
--action-destructive: #cc0000;
--action-destructive-hover: #990000;

/* Data Visualization */
--crime-marker: #ff0000;     /* Crime data points */
--route-primary: #0066ff;    /* Main route line */
--route-alternative: #00cc66; /* Safer alternative route */
--zone-warning: rgba(255, 51, 51, 0.2); /* Isolated zones */
```

### Color Rules

- **No gradients** — flat colors only for clarity and performance
- **No pure black (#000000)** — use `--bg-app` for depth and eye comfort
- **Borders over shadows** — shadows expensive to render, borders work in all conditions
- **Text on colored backgrounds must meet WCAG AA contrast** — minimum 4.5:1 ratio

## Typography

### Font Families

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
```

Use system fonts for performance (no web font loading) and native feel on all platforms.

### Type Scale

```css
--text-display: 32px;   /* App title, large headings */
--text-h1: 24px;        /* Page titles */
--text-h2: 20px;        /* Section headings */
--text-h3: 18px;        /* Component titles */
--text-body: 16px;      /* Primary body text */
--text-small: 14px;     /* Supporting text, labels */
--text-micro: 12px;     /* Metadata, timestamps */
```

### Line Heights

```css
--leading-tight: 1.2;   /* Headings, scores */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.75; /* Long-form content (rare in this app) */
```

### Font Weights

```css
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

Use weight differentiation for hierarchy — reserve bold for critical warnings and scores.


## Spacing & Layout

### Spacing Grid

8px base unit for consistency and alignment.

```css
--space-1: 4px;   /* Micro spacing, icon padding */
--space-2: 8px;   /* Tight spacing, inline elements */
--space-3: 12px;  /* Standard spacing, form fields */
--space-4: 16px;  /* Section spacing, card padding */
--space-6: 24px;  /* Large section breaks */
--space-8: 32px;  /* Page padding */
```

### Component Spacing

- **Input fields:** 12px vertical padding, 12px horizontal padding
- **Buttons:** 12px vertical, 16px horizontal
- **Cards/panels:** 16px padding
- **Page margins:** 16px on mobile, 24px on tablet+

### Border Radius

```css
--radius-sm: 6px;   /* Small elements, tags */
--radius-md: 8px;   /* Buttons, inputs, cards */
--radius-lg: 12px;  /* Large panels, modals */
--radius-full: 9999px; /* Pills, circular icons */
```

Consistent rounding creates polish without being overly playful.

### Minimum Touch Targets

- **Buttons:** minimum 44px height (iOS Human Interface Guidelines)
- **Tap areas:** minimum 40px × 40px even if visual element is smaller
- **Interactive list items:** minimum 48px height

## Icons

### Icon Style

**Outline style only** — consistent with utilitarian design, better visibility on dark backgrounds, scales well at small sizes.

### Icon Library

**Lucide Icons** (lucide.dev) — open source, consistent design language, extensive coverage of needed icons.

Core icon set needed:
- Navigation: `map-pin`, `navigation`, `route`, `compass`
- Safety: `alert-triangle`, `shield`, `shield-check`, `alert-circle`
- Transport: `bus`, `train`, `bike`, `footprints`
- Actions: `search`, `settings`, `user-plus`, `x`, `check`, `chevron-right`
- Time: `clock`, `moon`, `sun`
- Data: `bar-chart-2`, `trending-up`, `trending-down`

### Icon Sizing

```css
--icon-sm: 16px;   /* Inline with text */
--icon-md: 20px;   /* Standard UI icons */
--icon-lg: 24px;   /* Feature icons */
--icon-xl: 32px;   /* Hero icons, empty states */
```

### Icon Color Rules

- Icons inherit text color by default
- Use `--safety-*` colors for status icons only
- Never use decorative icons — every icon must have clear meaning

## Motion & Animation

### Animation Principles

1. **Functional only** — animations explain state changes, not decoration
2. **Respect battery life** — minimize DOM repaints, use transform/opacity only
3. **Respect user preferences** — honor `prefers-reduced-motion`

### Standard Timings

```css
--duration-instant: 0ms;     /* No animation needed */
--duration-fast: 150ms;      /* Hover states, button presses */
--duration-normal: 250ms;    /* Component entrances */
--duration-slow: 400ms;      /* Large state changes, route drawing */
```

### Easing

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1); /* Standard easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);        /* Exits */
--ease-out: cubic-bezier(0, 0, 0.2, 1);       /* Entrances */
```

### What NOT to Animate

- ❌ Background colors on scroll
- ❌ Text color transitions
- ❌ Border color fades
- ❌ Loading spinners that rotate continuously (use pulse instead)

### What TO Animate

- ✅ Button press feedback (scale)
- ✅ Panel slide-in from bottom
- ✅ Route drawing on map (stroke-dashoffset)
- ✅ Loading skeleton pulses

## App Layout

### Global Shell Structure

```
┌─────────────────────────┐
│ Header (fixed)          │ 64px height
├─────────────────────────┤
│ Route Input Panel       │ Variable, collapses when route active
├─────────────────────────┤
│                         │
│ Map Container (flex)    │ Fills remaining space
│                         │
├─────────────────────────┤
│ Safety Briefing Panel   │ Slide up from bottom, variable height
└─────────────────────────┘
```

### Navigation Pattern

**Single-screen with slide-over panels** — no traditional navigation bar. User stays on map, additional features accessed via:
- Header icon buttons (Settings, Blocks Management)
- Action sheets (slide up from bottom)
- Context menus (long press on map)

### Responsive Breakpoints

```css
--breakpoint-mobile: 0px;      /* Default, phone */
--breakpoint-tablet: 768px;    /* Tablet landscape, small laptops */
--breakpoint-desktop: 1024px;  /* Desktop (rare for this app) */
```

App is **mobile-first** — desktop views exist but are not primary focus.


## Key Screens

### 1. Home / Route Planning

**Primary state when app opens**

**Layout:**
- Map fills viewport
- Header overlay at top
- Route input panel overlay at bottom until route is planned
- Search suggestions appear below input fields

**Components:**
- `Header` (app title, settings icon, blocks icon)
- `RouteInputPanel` (start input, destination input, route button)
- `MapView` (Leaflet map, user location marker)
- `SearchSuggestions` (dropdown list)

### 2. Route Briefing View

**After route is calculated, before navigation starts**

**Layout:**
- Map shows full route with markers
- Safety briefing panel slides up covering bottom 40% of screen
- User can swipe down to dismiss or tap "Start Navigation"

**Components:**
- `MapView` (route line, start/end markers, isolated zone overlays)
- `SafetyBriefingPanel`:
  - Distance and duration
  - Safety score badge
  - Isolated zone warnings list
  - Crime data summary
  - Alternative route button (if available)
  - Start navigation button

### 3. Active Navigation

**During a journey**

**Layout:**
- Map follows user location (auto-pan enabled)
- Compact route info bar at top shows ETA and next waypoint
- Trustees can see this view in real-time

**Components:**
- `MapView` (live location dot, route line, progress indicator)
- `NavigationBar` (ETA, distance remaining, end journey button)
- `TrusteeIndicator` (small badge showing who's watching)

### 4. Blocks Management

**User's personal avoidance list**

**Layout:**
- Full-screen sheet slides from right
- List of all active blocks grouped by type (roads, bus routes, areas, stations)
- Each item swipeable to delete

**Components:**
- `SheetHeader` (title, close button)
- `BlocksList` (grouped list)
- `BlockItem` (element name, block type badge, delete action)
- `EmptyState` (if no blocks)

### 5. Trustees Management

**Add and manage trusted contacts**

**Layout:**
- Full-screen sheet
- List of current trustees with status indicators
- Add trustee button at top
- Each trustee shows last shared journey time

**Components:**
- `SheetHeader`
- `TrusteeList`
- `TrusteeItem` (name, phone/username, status, sharing mode, remove button)
- `AddTrusteeButton` (opens phone contact picker or username search)

### 6. Settings

**App configuration**

**Layout:**
- Full-screen sheet
- Grouped settings list

**Components:**
- `SettingsGroup` (grouped by category)
- `SettingToggle` (on/off switches)
- `SettingPicker` (night mode start time, default sharing mode)
- `SettingLink` (about, privacy policy, data sources)

### 7. Postcode Safety Profile

**Safety research for unfamiliar areas**

**Layout:**
- Full-screen sheet
- Postcode input at top
- Profile card with scores and trends
- Map showing postcode boundary

**Components:**
- `PostcodeInput`
- `SafetyProfileCard`:
  - Crime trend chart
  - Time-of-day breakdown
  - Comparison to nearby areas
  - Plain English summary
- `MiniMap` (postcode boundary highlighted)

## Component Library

### Buttons

#### Primary Button
```css
background: var(--action-primary);
color: var(--text-primary);
padding: 12px 16px;
border-radius: var(--radius-md);
font-weight: var(--weight-semibold);
font-size: var(--text-body);
min-height: 44px;
```

**States:**
- Hover: `background: var(--action-primary-hover)`
- Active: `background: var(--action-primary-active)`, slight scale down
- Disabled: `opacity: 0.5`, no pointer events

**Variants:**
- `button-primary` — main actions (Plan Route, Start Navigation)
- `button-secondary` — secondary actions (Show Alternative, View Details)
- `button-destructive` — dangerous actions (Remove Block, End Journey)
- `button-ghost` — subtle actions (Cancel, Dismiss)

#### Icon Button
```css
width: 44px;
height: 44px;
border-radius: var(--radius-md);
background: transparent;
```

Used for header actions and map controls.

### Form Elements

#### Text Input
```css
background: var(--bg-surface-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 12px;
color: var(--text-primary);
font-size: var(--text-body);
```

**States:**
- Focus: `border-color: var(--border-focus)`, no box-shadow
- Error: `border-color: var(--safety-low)`
- Disabled: `opacity: 0.5`, greyed out

#### Select / Dropdown
Same styling as text input. Native `<select>` element on mobile for best UX.

### Data Display

#### Safety Score Badge
```css
display: inline-flex;
align-items: center;
padding: 8px 12px;
border-radius: var(--radius-md);
font-weight: var(--weight-bold);
font-size: var(--text-h3);
```

**Colors based on score:**
- 8-10: `background: var(--safety-high)`, `color: #000`
- 5-7: `background: var(--safety-medium)`, `color: #000`
- 0-4: `background: var(--safety-low)`, `color: #fff`

#### Warning Card
```css
background: rgba(255, 51, 51, 0.1);
border-left: 4px solid var(--safety-low);
padding: 12px 16px;
border-radius: var(--radius-md);
```

Contains icon, heading, and description text. Used for isolated zone warnings.

#### Info Card
```css
background: var(--bg-surface);
border: 1px solid var(--border-default);
padding: 16px;
border-radius: var(--radius-md);
```

Generic container for grouped information.

#### List Item
```css
padding: 12px 16px;
border-bottom: 1px solid var(--border-subtle);
min-height: 48px;
display: flex;
align-items: center;
justify-content: space-between;
```

**Interactive variant:**
- Tap feedback: background flash to `--bg-surface-elevated`
- Right chevron icon for navigable items

### Feedback Components

#### Toast Notification
```css
position: fixed;
bottom: 80px;
left: 16px;
right: 16px;
background: var(--bg-surface-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 12px 16px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
```

Appears briefly for ephemeral feedback (route saved, block added).

**Variants:**
- Default: neutral
- Success: left border green
- Error: left border red
- Warning: left border amber

#### Loading State

**Skeleton screens** for route planning:
- Pulse animation on placeholder elements
- Grey blocks where content will appear
- No spinners

**Inline loading** for actions:
- Button text changes to "Loading..."
- Button disabled
- Optional spinner icon in button

#### Alert Dialog
```css
background: var(--bg-overlay);
/* Centers content card */
```

**Content card:**
```css
background: var(--bg-surface);
border-radius: var(--radius-lg);
padding: 24px;
max-width: 320px;
```

Used for destructive confirmations (remove trustee, delete saved route).

### Navigation Components

#### Bottom Sheet
```css
position: fixed;
bottom: 0;
left: 0;
right: 0;
background: var(--bg-surface);
border-top-left-radius: var(--radius-lg);
border-top-right-radius: var(--radius-lg);
padding: 16px;
box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.5);
```

Slides up from bottom. Used for safety briefing, route alternatives.

**Handle bar** at top for swiping down to dismiss.

#### Side Sheet
```css
position: fixed;
top: 0;
right: 0;
bottom: 0;
width: 100%;
max-width: 400px;
background: var(--bg-surface);
box-shadow: -2px 0 12px rgba(0, 0, 0, 0.5);
```

Slides in from right. Used for settings, blocks management, trustees.

## Accessibility

### Focus Indicators
```css
outline: 2px solid var(--border-focus);
outline-offset: 2px;
```

Never remove focus outlines. Keyboard navigation critical for accessibility.

### Touch Targets
- Minimum 44px × 44px for all interactive elements
- Padding extends beyond visual element if needed
- Test with "Show touch" developer option on Android

### Screen Reader Considerations
- All images and icons have `alt` or `aria-label`
- Form inputs have associated `<label>` elements
- Button text describes action clearly (not just "OK" or "Submit")
- Map markers have descriptive text for screen readers
- Safety scores announced with context ("Safety score: 6 out of 10, use caution")

### Color Contrast
All text meets WCAG AA standards:
- Body text on background: 15:1 ratio (#fff on #0a0a0a)
- Muted text on background: 5.6:1 ratio (#888 on #0a0a0a)
- Action buttons have tested contrast in all states

### Motion Sensitivity
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Respects system preference for reduced motion.

---

## Implementation Notes

This design system is built for:
- **HTML/CSS/JavaScript** — no framework dependencies
- **Mobile-first responsive** — scales up to tablet/desktop but optimized for phone
- **Dark mode only** — light mode not planned for v1
- **Performance-conscious** — minimal repaints, CSS over JS animations, lazy loading

CSS variables are defined in a single `theme.css` file. Components reference these variables, never hard-coded colors.

All interactive states tested on:
- iOS Safari (primary target)
- Chrome Android (secondary target)
- Desktop Chrome (tertiary)