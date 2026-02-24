# Design System


## 1. Design Goals

**What "Good Design" Looks Like**

Lifespring Chronicles should feel like **flipping through a beautifully illustrated memoir**. The interface must fade into the background during routine events but elevate the experience during milestone moments. Good design here means:

- **Emotional resonance through color** — The palette shifts subtly with each life stage
- **Clarity without clutter** — Players see their stats, relationships, and choices at a glance
- **Respectful restraint** — No gamification tricks. This is a simulation about life, not a slot machine
- **Typography as voice** — The narrator's prose should feel literary, not like UI copy
- **Smooth temporal flow** — Animations reinforce the passage of time (stat decay, NPC drift, aging)

**Aesthetic Direction**

- **Literary minimalism** — Think *The Sims* meets *80 Days* meets a high-quality biography
- **Cinematic moments** — Legacy reveal, death scenes, and life review sequences feel like cutscenes
- **Warm and human** — Never cold or clinical, even when showing hard stats

**Key Design Principles**

1. **Life stage drives everything** — Color, spacing, animation speed all shift with age
2. **Consequence clarity** — Players must understand what a choice will cost before committing
3. **Relationship visibility** — NPCs are not icons; they're people with faces and histories
4. **Respect the weight** — Death, loss, and regret are handled with gravitas, not as throwaway events

---

## 2. Brand

**App Name:** Lifespring Chronicles

**Tagline:** "Every choice echoes. Every life matters."

**Brand Voice**

- **Narrative text:** Literary, vivid, second-person ("You stand at the door..."). Tone shifts by life stage: playful → raw → weighty → elegiac.
- **UI copy:** Clear, direct, warm. "Continue your life" not "Next". "Review your legacy" not "View score".
- **Button labels:** Conversational. "I choose to..." / "I forgive them" / "I walk away"

---


## 3. Color System

**Color Mode:** Dark mode only (easier to read narrative prose, supports intimate tone)

### Base Palette (Stage-Independent)

**Background**
- App background: `#0a0a0b` (near-black, soft)
- Surface level 1: `#1a1a1c` (event cards, panels)
- Surface level 2: `#2a2a2d` (raised elements, modals)

**Text**
- Primary: `#f5f5f0` (off-white, gentle on eyes)
- Secondary: `#b8b8a8` (muted for labels)
- Muted: `#6a6a62` (timestamps, fine print)

**Borders**
- Default: `#3a3a3d` (subtle separation)
- Hover: `#4a4a4d` (interactive elements)

**System Colors**
- Success: `#4a9b6f` (stat gains, positive outcomes)
- Warning: `#c9944a` (risk indicators)
- Danger: `#c94a4a` (stat losses, death, trauma)
- Info: `#4a7bb8` (neutral information)

### Life Stage Accent Palette

Each stage introduces an accent color used for:
- Active stat bars
- Choice button highlights
- Timeline stage markers
- NPC relationship pulses

| Stage | Age Range | Accent Color | Hex | Usage |
|-------|-----------|--------------|-----|-------|
| 0-1 | 0-7 | Soft Peach | `#f4b8a8` | Childhood warmth |
| 2-3 | 8-17 | Vibrant Coral | `#ff7b6b` | Teen intensity |
| 4 | 18 | Electric Blue | `#5ba3ff` | Fork in the road |
| 5 | 19-25 | Teal Green | `#4ac9a0` | Foundation years |
| 6 | 26-35 | Deep Teal | `#2a8c7a` | Identity crystallization |
| 7 | 36-50 | Navy Blue | `#3a5a7c` | Peak complexity |
| 8 | 51-65 | Muted Gold | `#b8944a` | Reckoning |
| 9 | 66-79 | Warm Grey | `#8a8a7a` | Legacy arc |
| 10 | 80+ | Sepia White | `#d4c4b0` | Final chapter |

**Color Rules**
- No gradients (too busy for prose-heavy UI)
- Use borders over shadows for depth
- Stage accent fades in/out over 2-second transition when advancing
- Stat bars animate color shift when crossing thresholds (Health < 30 shifts red)

**Stat Color Coding**
- Health: `#c94a4a` → `#4a9b6f` (low to high gradient)
- Happiness: `#f4b8a8` (warm)
- Wealth: `#b8944a` (gold)
- Intelligence: `#5ba3ff` (blue)
- Social: `#ff7b6b` (coral)
- Creativity: `#9b6fc9` (purple)
- Fitness: `#4ac97a` (green)
- Spirituality: `#c9b84a` (amber)
- Resilience: `#7a6f4a` (earth tone)
- Wisdom: `#d4c4b0` (sepia)
- Reputation: `#8a8a7a` (grey)
- Mental Health: `#4a7bb8` (calm blue)

---


## 4. Typography

**Font Families**

- **Narrative/Events:** `"Lora", Georgia, serif` — Classical serif for all event narratives, NPC dialogue, and flavor text
- **UI/Stats:** `"Inter", "Helvetica Neue", sans-serif` — Clean sans for stat labels, buttons, metadata
- **Monospace (optional):** `"JetBrains Mono", monospace` — Only for age counters and numeric stats

**Type Scale**

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Display | 48px | 600 | 1.1 | Legacy score reveal |
| H1 | 36px | 600 | 1.2 | Stage transition headlines |
| H2 | 28px | 500 | 1.3 | Event titles |
| H3 | 20px | 500 | 1.4 | Section headers |
| Body Large | 18px | 400 | 1.6 | Event narrative text |
| Body | 16px | 400 | 1.5 | Standard UI text |
| Small | 14px | 400 | 1.4 | Stat labels, metadata |
| Tiny | 12px | 400 | 1.3 | Timestamps, legal |

**Line Heights**

- Narrative prose: `1.6` (generous for readability)
- UI elements: `1.4`
- Stat labels: `1.2` (tight for density)

---

## 5. Spacing & Layout

**Spacing Grid:** 8px base unit

**Common Spacing Values**
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

**Page Padding**
- Desktop: `64px` horizontal, `48px` vertical
- Tablet: `32px` horizontal, `32px` vertical
- Mobile: `16px` horizontal, `24px` vertical

**Component Spacing**
- EventCard padding: `24px`
- Stat panel padding: `16px`
- Button padding: `12px 24px`
- Modal padding: `32px`

**Border Radius Values**
- Small (buttons, tags): `6px`
- Medium (cards, panels): `12px`
- Large (modals): `16px`
- Round (avatar, icons): `50%`

---

## 6. Icons

**Icon Style:** Outline icons (not solid) — lighter visual weight, less distracting

**Icon Library:** Lucide React (`lucide-react`)

**Icon Sizes**
- Small: `16px` (inline with text)
- Medium: `20px` (buttons, labels)
- Large: `24px` (panel headers)
- XL: `32px` (empty states)

**Icon Colors**
- Default: Inherit text color
- Stat icons: Match stat color coding
- Interactive: Accent color on hover

**Key Icons**
- **Heart:** Relationships, Health
- **TrendingUp/Down:** Stat changes
- **Calendar:** Age, timeline events
- **Users:** Social stat, NPCs
- **DollarSign:** Wealth
- **Brain:** Intelligence
- **Sparkles:** Creativity
- **Activity:** Fitness
- **Lightbulb:** Wisdom
- **Shield:** Resilience
- **Star:** Legacy points
- **Clock:** Time passage

---


## 7. Motion & Animation

**Animation Principles**

1. **Temporal flow** — Transitions should feel like time passing (fade-ins for aging, slide-ups for new events)
2. **Consequence weight** — Bigger choices = more dramatic animation (stat bars pulse on major deltas)
3. **Respect grief** — Death events, loss, and trauma use slower, gentler animations
4. **No unnecessary motion** — Only animate when it communicates state change

**Standard Timings**

- **Instant:** `100ms` — Hover states, button press
- **Fast:** `200ms` — Tooltips, dropdowns
- **Standard:** `300ms` — Stat bar updates, panel transitions
- **Slow:** `500ms` — Stage transitions, modal open/close
- **Cinematic:** `800ms+` — Legacy score reveal, life review vignettes

**Easing Functions**

- **UI interactions:** `cubic-bezier(0.4, 0, 0.2, 1)` (standard ease-in-out)
- **Stat changes:** `cubic-bezier(0.25, 0.8, 0.25, 1)` (gentle bounce)
- **Stage transitions:** `cubic-bezier(0.65, 0, 0.35, 1)` (cinematic ease)

**What to Animate**

- Stat bars filling/draining (with number counter)
- Event cards sliding up from bottom
- Choice buttons scaling slightly on hover (1.02x)
- NPC relationship depth rings pulsing if deteriorating
- Timeline nodes appearing in sequence
- Age counter incrementing (typewriter effect)

**What NOT to Animate**

- Background color changes (instant to avoid motion sickness)
- Text content (no typewriter for event narratives — too slow)
- Scrolling (user-controlled)

---

## 8. App Layout

### Global Shell Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (fixed, 64px height)                            │
│ [Age: 34] [Stage: Adult] [Legacy: 2,340]    [Menu ⋮]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │                  │  │              │  │          │ │
│  │   STAT PANEL     │  │   EVENT      │  │ TIMELINE │ │
│  │   (left 280px)   │  │   CONTENT    │  │ (right   │ │
│  │                  │  │   (flex-1)   │  │  320px)  │ │
│  │ • 12 stat bars   │  │              │  │          │ │
│  │ • Quick stats    │  │ EventCard    │  │ Vertical │ │
│  │ • NPC avatars    │  │ ChoiceButtons│  │ scrolling│ │
│  │                  │  │              │  │ event log│ │
│  └──────────────────┘  └──────────────┘  └──────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Responsive Behavior**

- **Desktop (1280px+):** Three-column layout as shown
- **Tablet (768px-1279px):** Timeline collapses to modal (icon in header), two-column layout
- **Mobile (<768px):** Single column, stat panel becomes collapsible drawer

**Navigation Pattern**

- Main game view has no traditional nav (immersive)
- Header contains:
  - Current age (large, monospace)
  - Life stage indicator
  - Legacy score (running total)
  - Menu button (⋮) → Settings, Save/Load, New Game

---

## 9. Key Screens

### 9.1 New Game (Character Creation)

**Layout:** Centered modal, dark overlay

**Components:**
- Stage 0 birth narrative (serif, 18px)
- Random trait display (cards showing Temperament, Family Wealth, Siblings)
- "Begin Your Life" button (accent color, large)

**Visual:** Soft peach accent (Stage 0 color)

### 9.2 Main Game View

**Layout:** Three-column as described in Section 8

**Components:**
- StatPanel (left)
- EventCard (center) — the narrative heart
- LifeTimeline (right)

**State-Dependent Visuals:**
- Accent color shifts per life stage
- Stat bars animate on delta
- NPC avatars show relationship health (green glow = thriving, red pulse = drift)

### 9.3 Choice Moment

**Layout:** EventCard expands to show 2-4 ChoiceButtons

**Components:**
- Event narrative (Lora, 18px, 1.6 line-height)
- Hover preview tooltip showing stat deltas before click
- Confirmation step for major life forks (marriage, children, career change)

### 9.4 Stage Transition

**Layout:** Full-screen overlay, 2-second fade

**Components:**
- Stage number and age range (H1)
- Brief thematic quote (serif, muted)
- Background subtly shifts to new accent color

**Animation:** Stage name slides up, age counter increments with typewriter effect

### 9.5 Legacy Score Reveal

**Layout:** Full-screen cinematic sequence

**Components:**
- Memory vignettes (3-5 key events shown in sepia tone)
- Score categories reveal one by one (800ms delay between each)
- Total score animates up with sound effect
- Epitaph text (serif, 28px, centered)
- "Reflect on Your Life" button → full stats review
- "Begin a New Life" button → new game

**Visual:** Sepia white accent, slow cross-fade transitions

### 9.6 Life Review (Stage 10)

**Layout:** Single-column narrative flow

**Components:**
- Memory vignette cards (past events)
- "What If" branching overlays (show unchosen path outcomes in ghosted style)
- Minimal player choices (acceptance/reflection type)

**Visual:** Muted gold to sepia transition, slow animations

---

## 10. Component Library

### 10.1 Buttons

**Variants:**

- **Primary:** Filled with stage accent color, white text
  - Hover: 5% lighter, slight scale (1.02x)
  - Pressed: 10% darker, scale (0.98x)
  - Disabled: 50% opacity, no hover

- **Secondary:** Outlined with border color, text matches accent
  - Hover: Background fills with 10% accent opacity
  - Pressed: 20% accent opacity

- **Ghost:** Text only, no background
  - Hover: 10% accent background
  - Used for "View Details", "Skip", etc.

**Sizes:**
- Small: `32px` height, `12px 16px` padding
- Medium: `40px` height, `12px 24px` padding
- Large: `48px` height, `16px 32px` padding

**States:**
- Default
- Hover
- Pressed
- Disabled
- Loading (spinner icon, 50% opacity text)

### 10.2 StatBar

**Structure:**
- Label (stat name, small text)
- Value (current/100, monospace)
- Bar (100% width background, filled to stat value)
- Delta indicator (+5, -10 floats up and fades out on change)

**Colors:** Stat-specific (see Section 3)

**Animation:** Bar fill animates over 300ms with ease-in-out, number counts up/down

### 10.3 EventCard

**Structure:**
- Age badge (top-left, monospace, accent color)
- Event title (H2)
- Narrative text (Lora, 18px, 1.6 line-height)
- ChoiceButtons grid (2x2 or 1x4 depending on choice count)

**Padding:** `24px`

**Border:** `1px solid border color`, `12px` radius

**Background:** Surface level 1

**Hover:** None (not interactive, choices are)

### 10.4 ChoiceButton

**Structure:**
- Choice text (body text, left-aligned)
- Stat preview (hover tooltip, shows deltas in color-coded grid)
- Optional warning icon (if regret weight > 50 or danger outcome)

**Padding:** `16px`

**Border:** `2px solid` border color, `8px` radius

**Hover:** Border changes to accent color, tooltip appears

**Layout:** Full width, 16px gap between buttons

### 10.5 NPCPanel

**Structure:**
- NPC avatar (48px circle, generated or default icon)
- Name (body text)
- Type label (family/friend/partner, small text)
- Depth bar (0-100, compact version of StatBar)
- Status indicator (alive/estranged/deceased icon + color)

**Layout:** Vertical stack, 12px gap

**Interaction:** Click to expand full relationship history modal

**Visual Cues:**
- Green glow outline if depth > 70
- Red pulse if depth declining
- Greyscale filter if deceased

### 10.6 LifeTimeline

**Structure:**
- Vertical line (center, muted color)
- Event nodes (circular, accent color for current stage, muted for past)
- Age labels (left of node, monospace)
- Event title (right of node, small text)

**Scroll:** Vertical, auto-scroll to current age on new event

**Interaction:** Click node to review that event in modal

**Visual:** Current event node is larger (24px) and pulses

### 10.7 LifeTimeline (Continued)

**Density:** Events shown at scale (more events = tighter spacing, min 32px gap)

### 10.8 Modal

**Structure:**
- Dark overlay (80% opacity black)
- Centered panel (max 800px width)
- Close button (top-right, ghost style)
- Content area with scroll if needed

**Padding:** `32px`

**Border Radius:** `16px`

**Animation:** Scale up from 0.95 to 1.0 over 300ms, fade in overlay

### 10.9 Tooltip

**Structure:**
- Small panel (max 280px width)
- Body small text
- Arrow pointer to trigger element

**Background:** Surface level 2

**Border:** `1px solid` border color

**Padding:** `8px 12px`

**Animation:** Fade in over 200ms

**Position:** Auto-calculate based on trigger location (prefer bottom, fallback top)

### 10.10 Toast Notification

**Structure:**
- Small panel (right side, bottom stacked)
- Icon (success/warning/danger)
- Message text (body small)
- Auto-dismiss after 4s

**Background:** Surface level 2

**Border:** Left border `4px solid` matching icon color

**Animation:** Slide in from right, fade out on dismiss

### 10.11 Loading State

**Structure:**
- Spinner icon (24px, accent color)
- Optional "Loading..." text (small, muted)

**Animation:** 360° rotation, 1s duration, infinite loop

**Usage:** Used during:
- AI narrator calls (milestone events)
- Save/load operations
- Stage transitions

### 10.12 Empty State

**Structure:**
- Large icon (32px, muted)
- Heading (H3, muted)
- Optional description (body small, muted)
- Optional CTA button

**Example:** "No events yet" in Timeline before first event fires

---

## 11. Accessibility

**Focus Indicators**

- All interactive elements have `2px solid` outline in accent color on focus
- Outline offset: `2px` (prevents overlap with element border)
- Never remove focus styles (critical for keyboard navigation)

**Minimum Touch Targets**

- All buttons: `44px` minimum height (WCAG AAA standard)
- ChoiceButtons: `48px` height on mobile (larger for important choices)
- Timeline nodes: `32px` tap target (visual can be smaller)

**Screen Reader Considerations**

- All stat values announced with units ("Health: 65 out of 100")
- Event narratives read in full before choices announced
- NPC relationship changes announced ("Sarah's trust increased by 10")
- Stage transitions announced ("Entering Stage 5: Young Adult I")
- Legacy score breakdown read category by category

**Color Contrast**

- All text meets WCAG AA minimum (4.5:1 for body, 3:1 for large text)
- Stat deltas include + and - symbols, not just color
- NPC status uses icon + text label, not just color glow

**Keyboard Navigation**

- Tab order: Header → Stat Panel → Event Choices → Timeline
- Enter key activates buttons
- Escape key closes modals
- Arrow keys navigate Timeline nodes

**Reduced Motion**

- Respect `prefers-reduced-motion` media query
- Disable stat bar animations, stage transitions
- Replace fade/scale with instant show/hide

---

## Design System Implementation Notes

**Lovable Platform Specifics**

- Use Tailwind CSS classes for all spacing/colors
- Define stage accent colors as CSS custom properties in `:root`
- Use shadcn/ui components as base (Button, Card, Dialog, Tooltip)
- Extend shadcn variants for life-stage-specific styling

**Component Naming Convention**

- `EventCard`, `ChoiceButton`, `StatBar` (PascalCase)
- Variants: `<Button variant="primary">` not `<PrimaryButton>`

**Animation Implementation**

- Use Tailwind's `transition-*` utilities for simple animations
- Use Framer Motion for complex animations (stat bars, stage transitions)
- Never animate on initial render (causes flash)

**Responsive Breakpoints**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Use Lovable's responsive utilities: `md:hidden`, `lg:grid-cols-3`, etc.

---

**End of Design System Document**

This design system is optimized for Lifespring Chronicles' narrative-driven, emotionally resonant gameplay. All specifications are implementation-ready for the Lovable platform (Vite + React + TypeScript + Tailwind + shadcn/ui).