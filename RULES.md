# Project Overview

Lifespring Chronicles is a narrative life simulation game where players experience a procedurally generated human life from birth (age 0) to death (age 80+). The game simulates an entire lifespan through 10 distinct life stages, where every choice cascades through 12 interconnected stat systems, deep NPC relationships, and a realistic financial simulation. The core gameplay loop is: Event → Choice → Consequence → New State → Next Event.

The player's goal is not to "win" but to build a meaningful life, measured by a Legacy Score (max 10,000 points) calculated at death based on relationships formed, goals achieved, community impact, and wisdom gained. No two playthroughs are identical due to procedural generation, random events, and branching career paths.

## Tech Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management:** Zustand for client-side game state
- **AI Integration:** Claude API (Anthropic) for dynamic narrative generation on milestone events only
- **Platform:** Lovable (integrated Vite deployment with Supabase)

## Key Architectural Decisions

1. **Event Data in Database:** All events stored in Supabase tables (not hardcoded) to support future PC game expansion and enable a content editor for adding events post-launch
2. **AI Cost Control:** Claude API limited to ~20 milestone events per playthrough (birth, age 18 career choice, marriage, death, etc.). Routine events use high-quality static narrative text
3. **Stat Normalization:** All stats are 0-100 scale. Financial system tracks real net worth separately, then normalizes to 0-100 Wealth stat for display
4. **Scalable Architecture:** Built to support future transition to full PC game with portable data structures
5. **Stage-Based Progression:** 10 life stages with distinct mechanics, events, and player agency levels appropriate to each age range

---

# BEFORE YOU CODE


## ALWAYS Read First

**Before implementing ANY feature:**

1. Read `PLAN.md` to understand the current build phase and dependencies
2. Read `DESIGN.md` to understand visual design system, color palettes per life stage, and component styling requirements
3. Read `SCHEMA.md` to understand database structure, relationships, and data flow
4. Read `PRD.md` to understand feature requirements, user stories, and acceptance criteria
5. **Scan the existing codebase** — check `/src/components`, `/src/engine`, `/src/hooks`, `/src/store` before creating new files

## ALWAYS Check for Existing Components

**Before creating a new component:**

1. Check `/src/components/ui/` for shadcn components (Button, Card, Dialog, etc.)
2. Check `/src/components/` for game-specific reusable components:
   - `StatBar.tsx` — animated stat display with delta indicators
   - `EventCard.tsx` — narrative event display container
   - `ChoiceButton.tsx` — choice option with hover preview of consequences
   - `NPCPanel.tsx` — relationship web visualization
   - `LifeTimeline.tsx` — scrollable life history log
   - `LegacyScreen.tsx` — end-of-life score reveal

3. **If a similar component exists, extend or compose it** — do NOT duplicate functionality

## ALWAYS Understand System Context

**Before modifying engine logic:**

1. Understand the 12-stat system and interdependencies (see `RULES.md` Section 4)
2. Understand NPC relationship mechanics (depth, trust, drift) (see `RULES.md` Section 5)
3. Understand event trigger types (stage gates, stat thresholds, random rolls, NPC states, prior choices)
4. Understand financial simulation (real net worth vs. normalized 0-100 Wealth stat)
5. **Read existing engine files** before changing calculation logic: `statEngine.ts`, `npcEngine.ts`, `eventEngine.ts`, `financialEngine.ts`, `legacyEngine.ts`

---

# NAMING CONVENTIONS

## File Naming

- **Components:** PascalCase with `.tsx` extension
  - `StatBar.tsx`, `EventCard.tsx`, `NPCPanel.tsx`
- **Pages:** PascalCase with `.tsx` extension
  - `Game.tsx`, `Legacy.tsx`, `NewGame.tsx`
- **Engines:** camelCase with `.ts` extension
  - `eventEngine.ts`, `statEngine.ts`, `npcEngine.ts`
- **Hooks:** camelCase with `use` prefix, `.ts` extension
  - `useGameEngine.ts`, `useAINarrator.ts`, `useEventTrigger.ts`
- **Types:** camelCase with `.ts` extension, or grouped in `types/index.ts`
- **Store:** camelCase with `Store` suffix
  - `gameStore.ts`

## Variable and Function Naming

- **Variables:** camelCase
  - `currentAge`, `legacyPoints`, `npcDepth`, `statDeltas`
- **Constants:** UPPER_SNAKE_CASE for true constants, camelCase for configuration objects
  - `MAX_LEGACY_SCORE = 10000`, `STAT_DECAY_RATE = 0.02`
  - `defaultStats = { health: 70, happiness: 60, ... }`
- **Functions:** camelCase, verb-first
  - `calculateStatDeltas()`, `triggerEvent()`, `updateNPCRelationship()`, `applyAging()`
- **Boolean variables/functions:** `is`, `has`, `should` prefix
  - `isAlive`, `hasMilestone`, `shouldTriggerEvent()`
- **Event handlers:** `handle` prefix
  - `handleChoiceSelect()`, `handleEventComplete()`, `handleStatDecay()`

## Component Naming

- **UI Components (shadcn):** PascalCase, semantic names
  - `Button`, `Card`, `Dialog`, `Progress`, `Separator`
- **Game Components:** PascalCase, descriptive names
  - `StatBar`, `EventCard`, `ChoiceButton`, `NPCCard`, `LifeStageIndicator`
- **Component props interfaces:** ComponentName + `Props`
  - `StatBarProps`, `EventCardProps`, `ChoiceButtonProps`

## Route Naming

- **Pages:** Root level routes, lowercase with hyphens if multi-word
  - `/` — main menu/landing
  - `/game` — active game view
  - `/legacy` — end-of-life legacy screen
  - `/new-game` — character creation

## Database Field Naming

- **Tables:** snake_case, plural
  - `game_states`, `events`, `event_history`, `npcs`, `career_paths`, `legacy_scores`
- **Columns:** snake_case
  - `id`, `player_id`, `current_age`, `current_stage`, `created_at`, `last_saved_at`
- **JSONB fields:** snake_case keys inside JSON objects
  - `stats: { health: 70, happiness: 60, wealth: 40, ... }`
  - `financial_state: { net_worth: 50000, salary: 60000, ... }`
- **Enum types:** snake_case with descriptive suffix
  - `life_stage_enum`, `npc_type_enum`, `career_path_type_enum`

---

# CODE ORGANIZATION


## Directory Structure Rules

```
src/
├── components/
│   ├── ui/                  # shadcn/ui components ONLY
│   ├── game/                # Game-specific reusable components
│   │   ├── StatBar.tsx
│   │   ├── EventCard.tsx
│   │   ├── ChoiceButton.tsx
│   │   ├── NPCPanel.tsx
│   │   ├── NPCCard.tsx
│   │   ├── LifeTimeline.tsx
│   │   └── LegacyScreen.tsx
│   └── layout/              # Layout components (Header, Footer, Sidebar)
├── engine/                  # Core game logic engines
│   ├── eventEngine.ts       # Event firing logic, trigger evaluation
│   ├── statEngine.ts        # Stat delta calculations, decay curves
│   ├── npcEngine.ts         # NPC drift, relationship updates
│   ├── financialEngine.ts   # Wealth simulation, income/expense tracking
│   └── legacyEngine.ts      # Legacy score calculation at death
├── hooks/                   # Custom React hooks
│   ├── useGameEngine.ts     # Main game loop orchestrator
│   ├── useAINarrator.ts     # Claude API integration
│   ├── useEventTrigger.ts   # Event trigger evaluation
│   └── useStatDecay.ts      # Periodic stat decay application
├── store/                   # Zustand state management
│   └── gameStore.ts         # Full game state (stats, NPCs, history, etc.)
├── types/                   # TypeScript type definitions
│   └── index.ts             # All interfaces and types
├── lib/                     # Utility functions, helpers
│   ├── supabase.ts          # Supabase client initialization
│   ├── constants.ts         # Game constants (MAX_AGE, STAT_MAX, etc.)
│   └── utils.ts             # General utilities (clamp, randomInt, etc.)
├── pages/                   # Top-level page components
│   ├── Game.tsx             # Main game view
│   ├── Legacy.tsx           # End-of-life legacy reveal screen
│   ├── NewGame.tsx          # Character creation / birth setup
│   └── MainMenu.tsx         # Landing page / main menu
└── integrations/            # Third-party API integrations
    └── supabase/            # Supabase queries, mutations
        ├── queries.ts       # Read operations (fetch events, load game)
        └── mutations.ts     # Write operations (save game, update NPC)
```

## Where Different Types of Code Belong

- **Game Logic Engines:** `/src/engine/` — pure TypeScript functions, NO React hooks, NO JSX
- **React Hooks:** `/src/hooks/` — hooks that use engines, call APIs, or manage effects
- **UI Components:** `/src/components/` — presentational components with minimal logic
- **State Management:** `/src/store/` — Zustand stores ONLY
- **Type Definitions:** `/src/types/index.ts` — all interfaces, types, enums in ONE file for easy imports
- **Constants:** `/src/lib/constants.ts` — magic numbers, configuration values
- **Database Operations:** `/src/integrations/supabase/` — Supabase queries and mutations
- **Utilities:** `/src/lib/utils.ts` — pure functions (clamp, randomInt, formatCurrency, etc.)

## Import Ordering Rules

**Order imports in this sequence:**

1. React and React ecosystem (react, react-dom)
2. Third-party libraries (zustand, @supabase/supabase-js)
3. Local aliases — absolute imports using `@/` alias
4. Components (from `/components`)
5. Hooks (from `/hooks`)
6. Engine logic (from `/engine`)
7. Store (from `/store`)
8. Types (from `/types`)
9. Constants and utilities (from `/lib`)

**Example:**

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party
import { create } from 'zustand';

// 3. Components
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/game/EventCard';

// 4. Hooks
import { useGameEngine } from '@/hooks/useGameEngine';

// 5. Engine
import { calculateStatDeltas } from '@/engine/statEngine';

// 6. Store
import { useGameStore } from '@/store/gameStore';

// 7. Types
import type { GameState, LifeEvent, Choice } from '@/types';

// 8. Constants
import { MAX_STAT_VALUE, STAT_DECAY_RATE } from '@/lib/constants';
```

---

# COMPONENT RULES

## When to Create New Components vs. Reuse Existing

**Create a NEW component if:**

- The UI pattern is used in 2+ places (DRY principle)
- The component has 50+ lines of JSX (extract for readability)
- The component has distinct internal state or complex logic
- The component represents a semantic game concept (e.g., `EventCard`, `StatBar`)

**Reuse existing components if:**

- A component already exists that serves 80%+ of the need
- You can pass props to customize behavior (prefer composition over duplication)
- The existing component is in `/src/components/game/` or `/src/components/ui/`

**Example:** If you need to display a stat bar with a different color, do NOT create `StatBarRed.tsx`. Instead, pass a `color` prop to `StatBar.tsx`.

## Props Interface Requirements

**Every component MUST have a TypeScript interface for props:**

```typescript
interface StatBarProps {
  statName: string;
  value: number;           // 0-100
  maxValue: number;        // Usually 100
  delta?: number;          // Optional: +/- change to animate
  color?: string;          // Optional: override default color
  showLabel?: boolean;     // Optional: default true
}

export function StatBar({ 
  statName, 
  value, 
  maxValue, 
  delta, 
  color = 'blue', 
  showLabel = true 
}: StatBarProps) {
  // ...
}
```

**Rules:**

- Use descriptive prop names (`statName`, not `name`)
- Mark optional props with `?`
- Provide default values for optional props
- Document complex props with JSDoc comments if needed

## Component File Structure

**Standard component file structure:**

```typescript
// 1. Imports (follow import ordering rules)
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { GameState } from '@/types';

// 2. Props interface
interface ComponentNameProps {
  // props
}

// 3. Component definition
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // 4. State hooks (useState, useReducer)
  const [localState, setLocalState] = useState(0);

  // 5. Context/Store hooks (Zustand, Context API)
  const gameState = useGameStore((state) => state.gameState);

  // 6. Effect hooks (useEffect, useLayoutEffect)
  useEffect(() => {
    // side effects
  }, [dependencies]);

  // 7. Event handlers
  const handleClick = () => {
    // handle event
  };

  // 8. Derived/computed values
  const computedValue = prop1 * 2;

  // 9. Early returns (loading, error states)
  if (!gameState) return <div>Loading...</div>;

  // 10. JSX return
  return (
    <Card>
      {/* component JSX */}
    </Card>
  );
}
```

---

# STYLING RULES


## CSS/Tailwind Conventions

**Use Tailwind utility classes for ALL styling — no custom CSS files.**

**Class Ordering (use Prettier plugin `prettier-plugin-tailwindcss`):**

1. Layout (flex, grid, block, inline)
2. Positioning (relative, absolute, top, left)
3. Sizing (w-, h-, max-w-, min-h-)
4. Spacing (m-, p-)
5. Typography (text-, font-, leading-)
6. Colors (bg-, text-, border-)
7. Effects (shadow-, opacity-, hover:, focus:)

**Example:**

```tsx
<div className="flex flex-col items-center gap-4 p-6 bg-slate-900 text-white rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
  {/* content */}
</div>
```

## Color Usage (Reference DESIGN.md)

**Life Stage Color Palettes (use these consistently):**

- **Stage 0-1 (Birth, Early Childhood):** Warm pastels — `bg-pink-100`, `text-amber-700`, `border-yellow-300`
- **Stage 2-3 (Middle Childhood, Teen):** Vibrant colors — `bg-blue-500`, `text-purple-600`, `border-green-400`
- **Stage 4-5 (Late Teen, Young Adult):** Bold, saturated — `bg-indigo-600`, `text-cyan-500`, `border-rose-400`
- **Stage 6-7 (Adult, Peak Complexity):** Deep teals/navies — `bg-teal-800`, `text-slate-200`, `border-cyan-700`
- **Stage 8-9 (Middle Age, Senior):** Muted golds/greys — `bg-amber-900`, `text-gray-400`, `border-stone-600`
- **Stage 10 (End of Life):** Soft white/sepia — `bg-stone-50`, `text-sepia-800`, `border-amber-200`

**Stat Bar Colors (consistent across app):**

```typescript
const STAT_COLORS = {
  health: 'bg-red-500',
  happiness: 'bg-yellow-500',
  wealth: 'bg-green-500',
  intelligence: 'bg-blue-500',
  social: 'bg-purple-500',
  creativity: 'bg-pink-500',
  fitness: 'bg-orange-500',
  spirituality: 'bg-indigo-500',
  resilience: 'bg-teal-500',
  wisdom: 'bg-amber-500',
  reputation: 'bg-cyan-500',
  mental_health: 'bg-violet-500',
};
```

## Spacing Conventions

**Use Tailwind's spacing scale consistently:**

- `gap-2` (8px) — tight spacing between related items
- `gap-4` (16px) — default spacing between components
- `gap-6` (24px) — section spacing
- `gap-8` (32px) — major section breaks

**Padding:**

- `p-4` — card/container padding
- `p-6` — page padding
- `p-8` — major section padding

**Margins:**

- Prefer `gap` in flex/grid layouts over `margin`
- Use `space-y-4` or `space-x-4` for child spacing in stacks

---

# STATE MANAGEMENT

## When to Use Local vs. Global State

**Use LOCAL state (useState, useReducer) for:**

- UI-only state (modal open/closed, form input, hover state)
- Temporary derived state (computed values from props)
- Component-specific state that doesn't affect other components

**Use GLOBAL state (Zustand gameStore) for:**

- Game state (currentAge, currentStage, stats, NPCs, financial state)
- Player history (event history, choices made)
- Persistent data that needs to be saved to Supabase
- State shared across multiple components or pages

**Example:**

```typescript
// LOCAL: Modal open state (UI-only, not saved)
const [isModalOpen, setIsModalOpen] = useState(false);

// GLOBAL: Player's current age (game state, saved to DB)
const currentAge = useGameStore((state) => state.gameState.currentAge);
```

## State Naming Conventions

**Global state (Zustand) structure:**

```typescript
interface GameStoreState {
  // Core game state
  gameState: GameState | null;
  
  // Loading/error states
  isLoading: boolean;
  error: string | null;
  
  // Actions (functions that modify state)
  setGameState: (state: GameState) => void;
  updateStats: (deltas: Partial<StatBlock>) => void;
  triggerEvent: (eventId: string) => void;
  makeChoice: (eventId: string, choiceIndex: number) => void;
  saveGame: () => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
}
```

**State naming rules:**

- State values: camelCase nouns (`gameState`, `currentAge`, `npcList`)
- Action functions: camelCase verbs (`setGameState`, `updateStats`, `triggerEvent`)
- Boolean flags: `is` or `has` prefix (`isLoading`, `hasError`, `isAlive`)

## Data Fetching Patterns

**Use Supabase queries for all database operations:**

```typescript
// In /src/integrations/supabase/queries.ts
export async function fetchEventsByStage(stage: number) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('stage', stage);
  
  if (error) throw error;
  return data;
}

// In component or hook
const { data: events, isLoading, error } = useQuery({
  queryKey: ['events', currentStage],
  queryFn: () => fetchEventsByStage(currentStage),
});
```

**Rules:**

- All database queries go in `/src/integrations/supabase/queries.ts`
- All database mutations go in `/src/integrations/supabase/mutations.ts`
- Use Tanstack Query (React Query) for data fetching and caching
- Handle loading and error states in UI components

---

# ERROR HANDLING

## How to Handle Errors

**Engine functions (in `/src/engine/`):**

- Throw errors with descriptive messages
- Do NOT catch errors in engine functions (let caller handle)

```typescript
export function calculateStatDeltas(choice: Choice, currentStats: StatBlock): StatBlock {
  if (!choice.statDeltas) {
    throw new Error('Choice missing statDeltas');
  }
  // calculation logic
}
```

**Hooks and Components:**

- Catch errors and display user-friendly messages
- Log errors to console in development

```typescript
try {
  const newStats = calculateStatDeltas(choice, currentStats);
  updateStats(newStats);
} catch (error) {
  console.error('Error calculating stat deltas:', error);
  toast.error('Failed to apply choice consequences. Please try again.');
}
```

**Supabase Operations:**

- Check for `error` from Supabase responses
- Throw custom errors with context

```typescript
export async function saveGameState(gameState: GameState) {
  const { error } = await supabase
    .from('game_states')
    .upsert(gameState);
  
  if (error) {
    throw new Error(`Failed to save game: ${error.message}`);
  }
}
```

## Error Message Format

**User-facing errors (toasts, alerts):**

- Use plain language, no technical jargon
- Provide actionable next steps if possible

```typescript
// BAD
toast.error('ERR_STAT_CALC_FAILED: NullPointerException in statEngine.ts line 42');

// GOOD
toast.error('Unable to calculate stat changes. Please try selecting a different choice.');
```

**Console errors (for developers):**

- Include function name, input values, and stack trace
- Use `console.error()` or `console.warn()`

```typescript
console.error('calculateStatDeltas failed:', {
  choice,
  currentStats,
  error,
});
```

## Logging Requirements

**Development mode:**

- Log game state changes (events triggered, choices made, stats updated)
- Log AI narrator requests and responses
- Log Supabase queries and mutations

**Production mode:**

- Only log critical errors and warnings
- Do NOT log sensitive player data

**Use structured logging:**

```typescript
console.log('[EventEngine] Triggered event:', {
  eventId: event.id,
  age: currentAge,
  stage: currentStage,
  isMilestone: event.isMilestone,
});
```

---

# NEVER DO (Anti-Patterns to Avoid)

1. **NEVER hardcode event data in components or pages**
   - All events must be in Supabase `events` table
   - Use `fetchEventsByStage()` to load events dynamically

2. **NEVER mutate state directly**
   - BAD: `gameState.stats.health = 50;`
   - GOOD: `updateStats({ health: 50 });` (via Zustand action)

3. **NEVER create duplicate components for minor variations**
   - If two components are 80%+ similar, use props to customize
   - Example: Do NOT create `StatBarBlue.tsx` and `StatBarRed.tsx` — use `<StatBar color="blue" />` and `<StatBar color="red" />`

4. **NEVER use inline styles or `<style>` tags**
   - Use Tailwind utility classes for ALL styling
   - If you need custom CSS, discuss with team first

5. **NEVER mix UI and business logic in the same file**
   - Game logic (stat calculations, event triggers) belongs in `/src/engine/`
   - UI components (JSX, styling) belong in `/src/components/`

6. **NEVER call Supabase directly from components**
   - Use query/mutation functions from `/src/integrations/supabase/`
   - Wrap Supabase calls in Tanstack Query hooks

7. **NEVER store sensitive data in client state**
   - API keys, secrets, admin credentials must be in environment variables
   - Never commit `.env` files to Git

8. **NEVER use magic numbers**
   - BAD: `if (age > 80) { ... }`
   - GOOD: `if (age > MAX_LIFESPAN_AGE) { ... }` (constant from `/src/lib/constants.ts`)

9. **NEVER ignore TypeScript errors**
   - Do NOT use `@ts-ignore` or `any` type to bypass errors
   - If a type is unclear, define a proper interface in `/src/types/index.ts`

10. **NEVER create circular dependencies**
    - Engine files should NOT import from hooks or components
    - Hooks can import from engines
    - Components can import from hooks

11. **NEVER use `console.log()` for error handling**
    - Use `console.error()` or `console.warn()` for errors
    - Use proper error boundaries for React errors

12. **NEVER call Claude API for non-milestone events**
    - AI narrator is limited to ~20 milestone events per playthrough (cost control)
    - Check `event.isMilestone` before calling `useAINarrator`

---

# ALWAYS DO (Required Patterns)

1. **ALWAYS validate input data at function boundaries**
   - Check for null/undefined before using values
   - Use TypeScript type guards and runtime checks

   ```typescript
   export function calculateLegacyScore(gameState: GameState): number {
     if (!gameState || !gameState.stats) {
       throw new Error('Invalid game state for legacy calculation');
     }
     // calculation logic
   }
   ```

2. **ALWAYS clamp stat values to 0-100 range**
   - After every stat delta application, clamp to valid range
   - Use `clamp(value, 0, 100)` utility function

   ```typescript
   const newHealth = clamp(currentStats.health + delta, 0, 100);
   ```

3. **ALWAYS normalize financial data to 0-100 Wealth stat**
   - Track real net worth in `gameState.financial_state.net_worth`
   - Calculate 0-100 Wealth stat for display using normalization curve

   ```typescript
   const wealthStat = normalizeNetWorth(gameState.financial_state.net_worth);
   ```

4. **ALWAYS save game state after each event**
   - Call `saveGame()` action after player makes a choice
   - Prevent loss of progress if player closes browser

   ```typescript
   const handleChoiceSelect = async (choiceIndex: number) => {
     makeChoice(currentEvent.id, choiceIndex);
     await saveGame(); // Persist to Supabase
   };
   ```

5. **ALWAYS apply stat decay on age advancement**
   - Stats decay gradually over time (Fitness, Health, Creativity, etc.)
   - Use `useStatDecay` hook to apply decay curves

   ```typescript
   useEffect(() => {
     if (shouldApplyDecay(currentAge)) {
       applyStatDecay(currentStats, currentAge);
     }
   }, [currentAge]);
   ```

6. **ALWAYS update NPC drift on relationship interactions**
   - If NPC not interacted with for 3-5 years, depth and trust decay
   - Use `npcEngine.applyDrift()` after each event

   ```typescript
   if (currentAge - npc.lastInteraction > 3) {
     applyNPCDrift(npc, currentAge);
   }
   ```

7. **ALWAYS provide loading and error UI states**
   - Show skeletons or spinners during data fetches
   - Show error messages with retry options on failures

   ```typescript
   if (isLoading) return <Skeleton />;
   if (error) return <ErrorMessage error={error} onRetry={refetch} />;
   return <EventCard event={event} />;
   ```

8. **ALWAYS type Supabase queries with TypeScript**
   - Use generated Supabase types from `supabase gen types`
   - Type query responses explicitly

   ```typescript
   const { data, error } = await supabase
     .from('events')
     .select('*')
     .returns<Event[]>(); // Type the response
   ```

9. **ALWAYS use semantic HTML and ARIA attributes**
   - Use proper heading hierarchy (h1 > h2 > h3)
   - Add `aria-label` to interactive elements without visible text

   ```tsx
   <button aria-label="Close modal" onClick={handleClose}>
     <XIcon />
   </button>
   ```

10. **ALWAYS extract reusable logic into custom hooks**
    - If logic is used in 2+ components, create a custom hook
    - Example: `useStatDecay`, `useEventTrigger`, `useAINarrator`

11. **ALWAYS document complex game mechanics with comments**
    - Explain WHY, not just WHAT
    - Document algorithms, formulas, and non-obvious logic

    ```typescript
    // Legacy score for relationships: depth × trust × type weight
    // Type weights: partner=2.0, child=1.8, friend=1.5, family=1.3, mentor=1.2, rival=0.5
    const relationshipScore = npcs.reduce((total, npc) => {
      const weight = NPC_TYPE_WEIGHTS[npc.type];
      return total + (npc.depth * npc.trust * weight / 100);
    }, 0);
    ```

12. **ALWAYS test stat calculations with edge cases**
    - Test with min values (0), max values (100), negative deltas, overflow
    - Verify clamping works correctly

13. **ALWAYS use TypeScript enums for life stages, NPC types, career paths**
    - Do NOT use string literals (risk of typos)
    - Define enums in `/src/types/index.ts`

    ```typescript
    export enum LifeStage {
      BIRTH = 0,
      EARLY_CHILDHOOD = 1,
      MIDDLE_CHILDHOOD = 2,
      TEEN_YEARS = 3,
      // ...
    }
    ```

---

# HANDLING UNCERTAINTY

## When to Ask for Clarification

**Ask before implementing if:**

- A feature requirement is ambiguous or contradicts another requirement
- The database schema doesn't match the described data model
- A calculation formula is not specified (e.g., "How is Wisdom stat calculated from Reflection choices?")
- An edge case is unclear (e.g., "What happens if all NPCs are deceased before Stage 10?")
- The visual design is not specified in DESIGN.md (colors, spacing, animations)

**Examples of unclear requirements:**

- "Add a 'surprise bonus' to Legacy Score" — What triggers this? How is it calculated?
- "Apply NPC drift if not interacted with" — What is the drift rate per year? Linear or exponential decay?

## When to Make Assumptions

**You MAY make assumptions if:**

- The assumption is a standard industry practice (e.g., password hashing, HTTPS)
- The assumption is a minor UI/UX detail not specified in DESIGN.md (e.g., button hover states, animation duration)
- The assumption simplifies implementation without affecting core gameplay (e.g., "Events with the same title are considered duplicates")

**Examples of acceptable assumptions:**

- Assuming stat bars animate over 300ms if not specified
- Assuming NPC names are auto-generated if no name is provided
- Assuming stat decay is linear if no curve is specified

## How to Document Assumptions

**When making an assumption:**

1. Add a `// ASSUMPTION:` comment in the code
2. Document the assumption in the relevant function's JSDoc comment
3. If the assumption affects gameplay, add a note in