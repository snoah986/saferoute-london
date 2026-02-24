# Lifespring Chronicles — Implementation Plan


## 0) How to use this plan

This document is both an **implementation plan** and a **progress tracker** for Lifespring Chronicles.

Each phase contains tasks with explicit status tracking. Every task breaks down:
- **What will be done** — scope and deliverables
- **Screens/routes** — UI pages created or modified
- **CRUD & tables** — database operations and Supabase tables
- **Backend API** — Supabase queries, RPC functions, Edge Functions
- **Files/components** — specific files to create or modify

**Status Legend:**
- `Not started` — task hasn't begun
- `In progress` — currently being worked on
- `Done` — completed and tested
- `Blocked` — waiting on dependencies

**How to Use:**
1. Work through phases sequentially (Phase 0 → Phase 1 → etc.)
2. Update status as you complete tasks
3. Mark blockers and dependencies clearly
4. Each task should take 1-2 days maximum

---

## Phase 0 — Foundation & Setup

### Task 0.1 — Project Initialization
Status: `Not started`

What will be done:
- Initialize Lovable project with Vite + React + TypeScript
- Set up Tailwind CSS and shadcn/ui component library
- Configure Supabase client and connection
- Set up environment variables for Supabase URL/keys and Claude API key
- Create base folder structure per architecture

Screens/routes:
- `/` — Landing page (stub)
- `/game` — Main game view (stub)
- `/new-game` — Character creation (stub)
- `/legacy` — End-of-life legacy reveal (stub)

CRUD & tables:
- N/A (setup only)

Backend API:
- Initialize Supabase project
- Configure Row Level Security (RLS) policies for auth

Files/components:
```
src/
├── components/ui/         # shadcn components (button, card, etc.)
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── constants.ts      # Game constants
├── types/
│   └── index.ts          # TypeScript interfaces (stub)
├── pages/
│   ├── Landing.tsx       # Stub
│   ├── Game.tsx          # Stub
│   ├── NewGame.tsx       # Stub
│   └── Legacy.tsx        # Stub
└── App.tsx               # Router setup
```

---


### Task 0.2 — Core TypeScript Interfaces
Status: `Not started`

What will be done:
- Define all core TypeScript interfaces for game state, events, NPCs, stats, choices
- Create type definitions for life stages (0-10 enum)
- Define stat block interface (all 12 stats)
- Create NPC relationship types
- Define event trigger conditions and choice consequences

Screens/routes:
- N/A (types only)

CRUD & tables:
- N/A (types only)

Backend API:
- N/A (types only)

Files/components:
```
src/types/index.ts:
  - LifeStage (enum 0-10)
  - StatBlock (12 stats: Health, Happiness, Wealth, Intelligence, Social, Creativity, Fitness, Spirituality, Resilience, Wisdom, Reputation, Mental Health)
  - GameState (current age, stage, stats, financial state, regret index, legacy points, bucket list, is_alive)
  - Event (id, event_key, title, narrative, min_age, max_age, stage, is_milestone, random_chance, stat_triggers, required_prior_events, locked_by_events, choices[])
  - Choice (text, statDeltas, npcEffects, unlocksEvents, locksEvents, regretWeight, legacyPoints)
  - NPC (id, name, type, depth, trust, status, shared_memories, last_interaction_age, loyalty_to_player)
  - FinancialState (net_worth, income_sources, expenses, debts, investments)
  - LegacyScore (total_score, 8 category scores, epitaph, age_at_death)
  - EventHistory (game_state_id, event_id, age_occurred, choice_made, ai_narrative, stat_state_before, stat_state_after)
  - CareerPath (path_type, name, description, stat_bonuses, stat_costs, progression_tiers, unlocks_events)
```

---

### Task 0.3 — Supabase Database Schema
Status: `Not started`

What will be done:
- Create all database tables in Supabase
- Set up primary keys, foreign keys, and indexes
- Configure JSONB fields for complex data (stats, financial state, choices array)
- Set up Row Level Security policies for user isolation
- Create database triggers for updated_at timestamps

Screens/routes:
- N/A (database only)

CRUD & tables:
- **Create tables:**
  - `game_states` (player save files)
  - `events` (all event definitions)
  - `event_history` (events experienced by player)
  - `npcs` (NPC relationship tracking)
  - `career_paths` (career progression trees)
  - `legacy_scores` (final legacy calculations)
  - `user_profiles` (auth extension)

Backend API:
- SQL migrations to create schema
- RLS policies: `game_states` only accessible by owner
- Database functions for stat calculations (if needed)

Files/components:
```
supabase/migrations/
  └── 001_initial_schema.sql
```

Schema (see SCHEMA.md for full details):
- `game_states`: id, player_id, current_age, current_stage, stats (jsonb), financial_state (jsonb), regret_index, legacy_points, bucket_list (jsonb), is_alive, created_at, last_saved_at
- `events`: id, event_key, title, narrative, min_age, max_age, stage, is_milestone, random_chance, stat_triggers (jsonb), required_prior_events (array), locked_by_events (array), choices (jsonb), created_at
- `event_history`: id, game_state_id (FK), event_id (FK), age_occurred, choice_made, ai_narrative, stat_state_before (jsonb), stat_state_after (jsonb), occurred_at
- `npcs`: id, game_state_id (FK), name, type (enum), depth, trust, status (enum), shared_memories (jsonb), last_interaction_age, loyalty_to_player, created_at_age
- `career_paths`: id, path_type (enum), name, description, stat_bonuses (jsonb), stat_costs (jsonb), progression_tiers (jsonb), unlocks_events (array)
- `legacy_scores`: id, game_state_id (FK), total_score, relationships_points, achievements_points, bucket_list_points, community_impact_points, mental_peace_points, wealth_legacy_points, wisdom_points, surprise_bonus_points, epitaph, age_at_death, calculated_at

---

## Phase 1 — Core Game Engine

### Task 1.1 — Zustand Game Store
Status: `Not started`

What will be done:
- Create Zustand store for client-side game state
- Implement actions for stat updates, age progression, event history tracking
- Add selectors for computed values (normalized Wealth stat, NPC relationship summaries)
- Set up autosave to Supabase on state changes

Screens/routes:
- N/A (state management only)

CRUD & tables:
- **Update:** `game_states` table (autosave current state)

Backend API:
- Supabase query: `UPDATE game_states SET ... WHERE id = ?`
- Insert into `event_history` when event completes

Files/components:
```
src/store/gameStore.ts:
  State:
    - currentGameState: GameState | null
    - loadedEvents: Event[]
    - currentEvent: Event | null
    - eventHistory: EventHistory[]
    - npcs: NPC[]
  Actions:
    - loadGame(gameId: string)
    - saveGame()
    - applyStatDeltas(deltas: Partial<StatBlock>)
    - progressAge(years: number)
    - addEventToHistory(event, choice)
    - updateNPC(npcId: string, updates: Partial<NPC>)
    - calculateLegacyScore()
```

---


### Task 1.2 — Stat Engine
Status: `Not started`

What will be done:
- Implement stat delta calculation and application logic
- Create decay curves for stats over time (age-based)
- Implement stat interdependencies (e.g., low Social affects Mental Health)
- Add stat threshold triggers for events
- Normalize financial net worth to 0-100 Wealth stat

Screens/routes:
- N/A (engine logic only)

CRUD & tables:
- **Read:** `game_states.stats` (current stat values)
- **Update:** `game_states.stats` (after deltas applied)

Backend API:
- N/A (client-side calculations, saved to Supabase on state change)

Files/components:
```
src/engine/statEngine.ts:
  Functions:
    - applyStatDeltas(currentStats: StatBlock, deltas: Partial<StatBlock>): StatBlock
    - calculateDecay(stats: StatBlock, age: number, stage: LifeStage): Partial<StatBlock>
    - calculateStatInterdependencies(stats: StatBlock): Partial<StatBlock>
      // Example: if Social < 30, Mental Health decays faster
    - normalizeWealthStat(netWorth: number): number
      // Maps -$100k to +$5M onto 0-100 scale
    - getStatThresholdTriggers(stats: StatBlock): string[]
      // Returns event_keys that should fire based on stat values
```

---

### Task 1.3 — Event Engine Core
Status: `Not started`

What will be done:
- Implement event firing logic based on stage gates, stat thresholds, random rolls
- Query Supabase `events` table for eligible events
- Filter events by age range, stage, prior event requirements
- Handle event locks/unlocks based on player choices
- Calculate event probability weights

Screens/routes:
- N/A (engine logic only)

CRUD & tables:
- **Read:** `events` table (query by stage, age range, stat triggers)
- **Read:** `event_history` (check prior events for unlock logic)

Backend API:
- Supabase query: `SELECT * FROM events WHERE stage = ? AND min_age <= ? AND max_age >= ?`
- Optional Supabase RPC function: `get_eligible_events(game_state_id, current_age, current_stats)`

Files/components:
```
src/engine/eventEngine.ts:
  Functions:
    - getNextEvent(gameState: GameState, eventHistory: EventHistory[]): Event | null
    - checkStageGateEvents(stage: LifeStage): Event[]
      // Mandatory events for stage progression
    - checkStatThresholdEvents(stats: StatBlock): Event[]
      // Events triggered by stat values (e.g., Wealth < 20 → financial crisis)
    - checkRandomEvents(stage: LifeStage, age: number): Event | null
      // Weighted random roll for surprise events
    - isEventUnlocked(event: Event, eventHistory: EventHistory[]): boolean
      // Check required_prior_events and locked_by_events
    - calculateEventProbability(event: Event, gameState: GameState): number
```

---

### Task 1.4 — UI Components — StatBar & EventCard
Status: `Not started`

What will be done:
- Create animated StatBar component showing all 12 stats (or subset based on stage)
- Implement delta animations (+/- flash with color-coded indicators)
- Create EventCard component displaying narrative, age, stage, and life context
- Add hover tooltips for stat explanations
- Design responsive layout for desktop and mobile

Screens/routes:
- `/game` — displays StatBar and EventCard

CRUD & tables:
- N/A (UI only, reads from Zustand store)

Backend API:
- N/A

Files/components:
```
src/components/StatBar.tsx:
  Props:
    - stats: StatBlock
    - deltas?: Partial<StatBlock> (for animation)
    - visibleStats: string[] (e.g., hide Wisdom before age 51)
  Features:
    - Horizontal bars with gradient fills
    - Color-coded by stat type (Health = red, Happiness = yellow, Wealth = green, etc.)
    - Delta animation: flash +green or -red when stat changes
    - Tooltip on hover with stat description

src/components/EventCard.tsx:
  Props:
    - event: Event
    - currentAge: number
    - currentStage: LifeStage
  Features:
    - Card layout with title, narrative text, age/stage badge
    - Typography: serif font for narrative, sans for UI elements
    - Color theme based on life stage (see DESIGN.md)
    - Fade-in animation when new event loads
```

---

### Task 1.5 — UI Components — ChoiceButton
Status: `Not started`

What will be done:
- Create ChoiceButton component showing choice text and hover preview
- Display stat consequence preview on hover (e.g., "Health -10, Happiness +15")
- Add click handler to select choice and trigger stat application
- Implement visual feedback (disabled state after selection, loading state)

Screens/routes:
- `/game` — displays 2-4 ChoiceButtons per event

CRUD & tables:
- **Update:** `event_history` (record choice made)
- **Update:** `game_states.stats` (apply stat deltas)

Backend API:
- N/A (handled by Zustand store actions)

Files/components:
```
src/components/ChoiceButton.tsx:
  Props:
    - choice: Choice
    - onSelect: (choice: Choice) => void
    - disabled: boolean
  Features:
    - Button with choice text
    - Hover popover showing:
      - Stat deltas (colored +/- indicators)
      - NPC effects (if any)
      - Legacy points (if any)
    - Click animation (scale down, then trigger onSelect)
    - Disabled state (greyed out after choice made)
```

---

## Phase 2 — Life Stage Progression (Stages 0-4)


### Task 2.1 — Stage 0 (Birth & Infancy) Events
Status: `Not started`

What will be done:
- Create 5-8 Stage 0 events in Supabase (narrative-only, no player choices)
- Define random trait seed logic (Temperament, Body Type, IQ range, birth circumstances)
- Implement birth circumstances rolls (wealthy/middle/poor family, single parent, twins, etc.)
- Apply starting stat modifiers based on birth circumstances

Screens/routes:
- `/new-game` — triggers Stage 0 event sequence
- `/game` — displays Stage 0 events as narrative cards

CRUD & tables:
- **Insert:** `events` table (Stage 0 event definitions)
- **Insert:** `game_states` (new game with starting stats)
- **Insert:** `event_history` (birth events)

Backend API:
- Supabase query: `INSERT INTO events (stage, min_age, max_age, narrative, choices, ...) VALUES (0, 0, 2, ...)`
- Supabase query: `INSERT INTO game_states (current_age, current_stage, stats, ...) VALUES (0, 0, {...}, ...)`

Files/components:
```
src/data/events/stage0.json (if using JSON, but actually stored in Supabase):
  Events:
    - "Birth Announcement" (narrative only)
    - "Family Wealth Roll" (wealthy/middle/poor → Wealth stat modifier)
    - "Temperament Seed" (calm/anxious/bold → Resilience, Social modifiers)
    - "Early Health Event" (random illness → Health modifier)
    - "Family Structure" (two-parent/single/extended → Social, Mental Health modifiers)

src/pages/NewGame.tsx:
  - UI to start new game
  - Trigger Stage 0 event sequence
  - Display birth summary and starting stats
  - Button to advance to Stage 1
```

---

### Task 2.2 — Stage 1 (Early Childhood, Age 3-7) Events
Status: `Not started`

What will be done:
- Create 8-12 Stage 1 events in Supabase (binary or 3-choice events)
- Implement first player-influenced choices (introvert/extrovert axis, empathy seeds)
- Add first friendship NPCs (2-3 simple NPCs with basic depth/trust tracking)
- Create stage progression logic (auto-advance to Stage 2 at age 8)

Screens/routes:
- `/game` — Stage 1 events with 2-3 choices per event

CRUD & tables:
- **Insert:** `events` table (Stage 1 event definitions)
- **Insert:** `npcs` table (first friend NPCs)
- **Update:** `game_states.current_stage` (advance to Stage 2 at age 8)

Backend API:
- Supabase query: `INSERT INTO events (stage, min_age, max_age, narrative, choices, ...) VALUES (1, 3, 7, ...)`
- Supabase query: `INSERT INTO npcs (game_state_id, name, type, depth, trust, ...) VALUES (?, 'Emma', 'friend', 30, 40, ...)`

Files/components:
```
Events (stored in Supabase):
  - "First Day of School" (3 choices: hide/watch/join kids → Social, Creativity modifiers)
  - "Playground Bully" (2 choices: defend victim/ignore → Empathy seed, Social)
  - "Parent Conflict" (2 choices: intervene/hide → Resilience, Mental Health)
  - "Pet Dies" (2 choices: grieve openly/suppress → Emotional regulation seed)
  - "Teacher Praise" (narrative event → Intelligence +5, Happiness +10)

src/engine/stageEngine.ts:
  Functions:
    - checkStageProgression(age: number, currentStage: LifeStage): LifeStage
      // Auto-advance to next stage at age thresholds
```

---

### Task 2.3 — Stage 2 (Middle Childhood, Age 8-12) Events
Status: `Not started`

What will be done:
- Create 10-15 Stage 2 events (3-choice branching)
- Implement hobby selection event (Sport/Art/Science/Music/Gaming → stat bonuses)
- Add hobby stat tracking (becomes ongoing stat modifier)
- Introduce academic track branching (gifted/standard/struggling)
- Add parental divorce event (random 30% chance, major NPC impact)

Screens/routes:
- `/game` — Stage 2 events with 3-4 choices

CRUD & tables:
- **Insert:** `events` table (Stage 2 event definitions)
- **Update:** `game_states.stats` (hobby stat bonuses applied)

Backend API:
- Supabase query for hobby selection event
- Supabase RPC function: `apply_hobby_bonus(game_state_id, hobby_type)`

Files/components:
```
Events:
  - "Choose Your Hobby" (5 choices: Sport/Art/Science/Music/Gaming → Fitness, Creativity, Intelligence modifiers)
  - "Parental Divorce" (random 30%, major event → Mental Health -20, Resilience check)
  - "First Real Failure" (3 choices: learn/give up/blame others → Resilience, Growth Mindset seed)
  - "Discover Passion" (narrative milestone → unlocks future events)
  - "Moral Dilemma: Stealing" (3 choices → Reputation, Moral Compass seed)

src/engine/hobbyEngine.ts (optional):
  - applyHobbyStatBonus(hobby: string, stats: StatBlock): StatBlock
    // Ongoing stat modifiers based on hobby chosen
```

---

### Task 2.4 — Stage 3 (Teen Years, Age 13-17) Events
Status: `Not started`

What will be done:
- Create 15-20 Stage 3 events (4-choice branching with hidden consequences)
- Introduce Reputation system (School, Family, Social sub-stats)
- Add first romantic interest NPC (optional, based on Social stat)
- Implement rebellion index tracking (affects adult relationship patterns)
- Create pivotal mentor/teacher NPC event (unlocks career path advice)

Screens/routes:
- `/game` — Stage 3 events with full 4-choice system

CRUD & tables:
- **Insert:** `events` table (Stage 3 event definitions)
- **Insert:** `npcs` table (romantic interest, mentor NPCs)
- **Update:** `game_states.stats` (add Reputation sub-stat)

Backend API:
- Supabase query for teen events
- Supabase query to create romantic interest NPC if Social > 50

Files/components:
```
Events:
  - "First Crush" (4 choices: pursue/ignore/confess/friendship → Social, Happiness)
  - "Party Invitation" (4 choices: go wild/go safe/skip/host your own → Rebellion Index, Reputation)
  - "Academic Pressure" (4 choices: cheat/study hard/give up/ask for help → Intelligence, Mental Health)
  - "Stand Up to Authority" (3 choices: rebel/comply/negotiate → Rebellion Index, Reputation)
  - "Mentor Teacher Appears" (narrative milestone → unlocks career advice events)

src/engine/reputationEngine.ts:
  - calculateReputationImpact(choice: Choice, currentRep: number): number
    // Reputation changes based on choice and context
```

---

### Task 2.5 — Stage 4 (Age 18 Career Fork) System
Status: `Not started`

What will be done:
- Create major career path selection event (6 paths: University, Trade, Workforce, Gap Year, Military, Entrepreneurship)
- Display detailed stat trade-offs for each path (bonuses and costs)
- Implement career path locking (irreversible choice)
- Insert career path definitions into Supabase `career_paths` table
- Unlock career-specific event trees based on path chosen

Screens/routes:
- `/game` — Major decision screen with 6 large choice cards
- Custom UI for career path selection (more prominent than normal events)

CRUD & tables:
- **Read:** `career_paths` table (all 6 paths with stat bonuses/costs)
- **Update:** `game_states.stats` (apply career path stat deltas)
- **Update:** `game_states` (record chosen career path)

Backend API:
- Supabase query: `SELECT * FROM career_paths`
- Supabase RPC function: `apply_career_path(game_state_id, path_type)`

Files/components:
```
src/components/CareerPathSelector.tsx:
  Props:
    - careerPaths: CareerPath[]
    - onSelect: (path: CareerPath) => void
  Features:
    - Grid layout of 6 large cards
    - Each card shows:
      - Path name and description
      - Stat bonuses (green +indicators)
      - Stat costs (red -indicators)
      - Progression tiers preview
    - Hover to highlight card
    - Confirm modal before locking in choice

Events:
  - "The Fork in the Road: Age 18" (milestone event, calls CareerPathSelector)

career_paths table data:
  - University (Intelligence +20, Network +10, Wealth -30, Time -4yrs)
  - Trade/Vocational (Fitness +10, Wealth +15, Prestige -5)
  - Workforce (Wealth +10, Independence +15, Intelligence slow-growth)
  - Gap Year (Creativity +15, Openness +20, Wealth -20, Career delay)
  - Military (Discipline +25, Fitness +20, Trauma risk +30%, Freedom -15)
  - Entrepreneurship (Ambition +20, high risk, Wealth volatile)
```

---

## Phase 3 — Advanced Life Stages (Stages 5-10)

### Task 3.1 — Stage 5 (Young Adult I, Age 19-25) Events
Status: `Not started`

What will be done:
- Create 20-30 Stage 5 events (career progression, relationships, independence)
- Implement first job events (based on career path chosen)
- Add romantic relationship depth tracking (partner NPC with depth/trust curves)
- Introduce financial crisis events (debt, first apartment, student loans)
- Add mental health check-in events (surfaces hidden Mental Health stat)

Screens/routes:
- `/game` — Stage 5 events with full simulation

CRUD & tables:
- **Insert:** `events` table (Stage 5 event definitions)
- **Insert:** `npcs` table (partner candidates, work mentor, best friend, rival)
- **Update:** `game_states.financial_state` (debt tracking begins)

Backend API:
- Supabase query for career-specific events based on `game_states.chosen_career_path`
- Supabase query to create partner NPC if Social > 60 and prior romantic interest event succeeded

Files/components:
```
Events:
  - "First Real Job" (career-specific, based on path)
  - "Move Out of Parents' Home" (Wealth -15, Independence +20, Happiness +10)
  - "First Heartbreak" (partner NPC depth drops to 0, Mental Health -15, Resilience check)
  - "Student Loan Debt" (if University path, Wealth -25, Financial stress)
  - "Mental Health Crisis" (if Mental Health < 40, triggers therapy event)
  - "Best Friend Conflict" (NPC depth/trust test)

src/engine/financialEngine.ts:
  Functions:
    - applyDebt(gameState: GameState, debtAmount: number, debtType: string)
    - calculateMonthlyExpenses(gameState: GameState): number
    - updateNetWorth(gameState: GameState)
```

---


### Task 3.2 — Stage 6 (Young Adult II, Age 26-35) Events & Parenting Mode
Status: `Not started`

What will be done:
- Create 25-35 Stage 6 events (career growth, marriage, children decision, property)
- Implement major "Have Children?" decision event (yes/no branch point)
- If yes, activate Parenting Mode sub-simulation:
  - Track child NPC aging through life stages (mirroring player's journey)
  - Implement parenting stat trade-offs (Fitness, Social, Career decay; Happiness, Spirituality gain)
  - Add parenting events (child's first day of school, teenage rebellion, etc.)
- Add marriage/long-term partnership mechanics (relationship depth affects Mental Health)
- Introduce property/asset tracking (first home purchase)

Screens/routes:
- `/game` — Stage 6 events with optional Parenting Mode UI
- Parenting Mode: sidebar panel showing child's age, stats, and wellbeing score

CRUD & tables:
- **Insert:** `events` table (Stage 6 event definitions)
- **Insert:** `npcs` table (child NPCs if parenting chosen)
- **Update:** `game_states.financial_state` (property assets)

Backend API:
- Supabase query for marriage events based on partner NPC depth
- Supabase RPC function: `activate_parenting_mode(game_state_id)`
- Supabase query to create child NPC with initial stats

Files/components:
```
src/components/ParentingPanel.tsx:
  Props:
    - children: NPC[] (child NPCs)
  Features:
    - Compact sidebar showing each child's:
      - Age and current life stage
      - Wellbeing score (0-100)
      - Recent events affecting child
    - Visual indicator if child needs attention

Events:
  - "Marriage Proposal" (if partner depth > 70)
  - "Have Children Decision" (major fork, irreversible)
  - "First Child Born" (if yes, activate Parenting Mode)
  - "Career Promotion vs. Family Time" (stat trade-off event)
  - "Quarter-Life Crisis" (Mental Health check-in)
  - "Buy First Home" (Wealth -40, Assets +property, Stability +15)

src/engine/parentingEngine.ts:
  Functions:
    - createChildNPC(gameState: GameState): NPC
    - ageChildNPC(child: NPC, parentAge: number)
    - calculateParentingStatTradeoffs(gameState: GameState): Partial<StatBlock>
      // Ongoing stat modifiers while parenting active
    - getChildEvents(child: NPC): Event[]
      // Child-specific events based on child's age
```

---

### Task 3.3 — Stage 7 (Adult, Age 36-50) Peak Complexity Events
Status: `Not started`

What will be done:
- Create 30-40 Stage 7 events (most complex stage, all threads converge)
- Implement career peak/plateau events (leadership vs. stagnation)
- Add marital health decay/growth system (relationship drift if neglected)
- If parenting active, add teen-stage child events (mirroring Stage 3)
- Introduce aging parent care events (NPC parents enter late life)
- Add major financial events (windfall, market crash, inheritance)
- Implement mid-life crisis trigger (if Happiness < 50 and age > 40)
- Begin mortality shadow events (health scares)

Screens/routes:
- `/game` — Stage 7 events with full complexity

CRUD & tables:
- **Insert:** `events` table (Stage 7 event definitions)
- **Update:** `npcs` table (partner relationship drift, child NPCs aging, parent NPCs aging)
- **Update:** `game_states.stats` (Health decay curve begins)

Backend API:
- Supabase query for career peak events based on prior career path
- Supabase query for marital events based on partner NPC depth/trust
- Supabase query for aging parent events (if parent NPCs exist and player age > 40)

Files/components:
```
Events:
  - "Promotion to Leadership" (career peak, Wealth +20, Stress +15)
  - "Career Redundancy" (random 20% if Workforce path, Wealth -30, Mental Health -20)
  - "Affair Opportunity" (if partner trust < 50, major moral choice)
  - "Teen Child Crisis" (if parenting active, child NPC depth test)
  - "Parent's Illness" (parent NPC status → ill, care decision event)
  - "Market Crash" (financial event, Wealth -25)
  - "Inheritance Windfall" (random, Wealth +40)
  - "Mid-Life Crisis" (trigger if Happiness < 50, pursue passion vs. stay stable)
  - "First Heart Attack Scare" (Health -15, mortality awareness)

src/engine/relationshipEngine.ts:
  Functions:
    - calculateRelationshipDrift(npc: NPC, currentAge: number): number
      // If last_interaction_age gap > 3 years, depth/trust decay
    - checkMaritalHealth(partner: NPC): boolean
      // Returns true if relationship at risk
```

---

### Task 3.4 — Stage 8 (Middle Age, Age 51-65) Events & Bucket List
Status: `Not started`

What will be done:
- Create 20-30 Stage 8 events (health management, career wind-down, empty nest, reflection)
- Introduce Wisdom stat (unlocks at age 51, only grows in this stage)
- Implement Bucket List mechanic: player sets 5 life goals at age 51
- Track bucket list completion (contributes 1,500 points to Legacy Score)
- Add health management events (chronic conditions, lifestyle changes)
-