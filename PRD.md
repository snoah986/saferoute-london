# Product Requirements Document: Lifespring Chronicles

## 1. Overview

### What Is Lifespring Chronicles?

Lifespring Chronicles is a narrative life simulation game where players experience a procedurally generated human life from birth (age 0) through death (age 80+). Unlike traditional games with win/loss conditions, Lifespring Chronicles measures success through a **Legacy Score** that evaluates the meaning, relationships, and impact of the life lived.

### Why It Exists

Current life simulation games lack the depth of interconnected systems and narrative weight that make each playthrough feel unique and emotionally resonant. Players want games where:
- Choices in childhood meaningfully affect adult outcomes
- Relationships require genuine investment and naturally drift if neglected
- Financial decisions have realistic consequences
- The journey from birth to death tells a complete, coherent story
- No two playthroughs are identical due to procedural generation and branching choices

### Target Users

**Primary:** Life simulation gamers who enjoy deep progression systems, narrative-driven experiences, and games like BitLife, The Sims, or Universal Paperclips that simulate complex systems over time.

**Secondary:** Story-driven game players who prioritize emotional engagement and thematic exploration of meaning, mortality, and relationships over action mechanics.

### Core Value Proposition

Experience a complete human life where every choice cascades through 12 interconnected stats, relationships naturally evolve or decay, and the ultimate measure of success is the legacy you leave behind—not the wealth you accumulated or the power you wielded.

---


## 2. Goals and Non-Goals

### Goals (In Scope for v1)

**MUST BUILD:**
- Complete 10-stage life progression system (birth through death)
- 12-stat dynamic system with decay curves and interdependencies
- Event engine that triggers contextually appropriate events based on stage, stats, NPC states, and prior choices
- Deep NPC relationship system with drift mechanics
- Real financial simulation tracking actual net worth
- Legacy Score calculation system at death
- Claude API integration for milestone event narration
- Save/load game system via Supabase
- Scrollable life history timeline
- 6 distinct post-school career paths with unique progression trees
- Optional parenting sub-simulation
- Bucket list mechanic (ages 51-65)

**SHOULD BUILD:**
- End-of-life review showing alternate outcomes of unchosen paths
- Event content editor for backend (to add/edit events post-launch without code changes)

### Non-Goals (Explicitly Out of Scope for v1)

**WILL NOT BUILD:**
- Multiplayer or co-op modes
- Real-time aging (game is turn-based event-driven, not time-based simulation)
- Character creator with visual customization (traits are procedurally generated at birth)
- Mod support or user-generated content
- Achievement system or Steam integration
- Voice acting or audio narration (text-based narrative only)
- Mobile app optimization (web-first, mobile responsive but not native)
- Tutorial system beyond initial tooltips (game loop should be intuitive)
- Social features (sharing scores, comparing legacies)

**FUTURE CONSIDERATIONS (v2+):**
- PC game expansion with enhanced graphics and deeper simulation
- Expanded event library (v1 targets ~150-200 events; v2 could add 300+)
- Historical setting variations (play different eras: 1920s, 1960s, etc.)
- Cultural/regional event variations
- Expanded NPC dialogue trees
- Memory replay system (watch your life as a film)

---


## 3. Features (DETAILED)

### Feature: 10 Life Stage Progression System
**Priority:** Must-have

**Description:**
Complete life simulation from age 0 (birth) through age 80+ (end of life), divided into 10 distinct stages. Each stage has unique events, player agency levels, and narrative tone. The player experiences childhood with limited control, gains full agency in young adulthood, and gradually transitions to reflection mode in senior years.

**User Stories:**
- As a player, I want to experience all 10 life stages from infancy to death with age-appropriate events at each stage
- As a player, I want my childhood choices to create lasting modifiers that affect my adult life outcomes
- As a player, I want player agency to gradually increase from childhood (parent-guided choices) to adulthood (full control) to end of life (reflection mode)
- As a player, I want the narrative tone to evolve from playful in childhood to elegiac in senior years

**Acceptance Criteria:**
- [ ] All 10 stages are implemented with distinct age ranges: Stage 0 (0-2), Stage 1 (3-7), Stage 2 (8-12), Stage 3 (13-17), Stage 4 (18), Stage 5 (19-25), Stage 6 (26-35), Stage 7 (36-50), Stage 8 (51-65), Stage 9 (66-79), Stage 10 (80+)
- [ ] Player control scales appropriately: Stage 0 = narrative only, Stages 1-2 = 2-3 choices, Stages 3-9 = full 4-choice branching, Stage 10 = minimal control with life review
- [ ] Stage transitions trigger mandatory story beat events
- [ ] Visual UI updates to reflect current life stage (color palette shifts, typography changes)
- [ ] Timeline component shows all stages with current stage highlighted

**How to Implement:**

**Frontend:**
- Create `LifeStageIndicator.tsx` component showing current stage, age, and visual progress bar
- Implement `StageTransitionModal.tsx` that appears when entering new stage with narrated summary
- Add stage-based CSS classes to root element that modify color palette (e.g., `.stage-0`, `.stage-1`, etc.)
- Build `GameView.tsx` main container that conditionally renders different UI layouts based on stage (e.g., Stage 10 has memory vignettes instead of full event cards)

**Backend:**
- Store `current_stage` (enum 0-10) in `game_state` table
- Store `current_age` (integer) in `game_state` table
- Create Supabase function `advance_stage()` that:
  - Checks if current age crosses stage threshold
  - Updates `current_stage` in game state
  - Triggers mandatory stage transition event from `events` table where `is_stage_transition = true`
  - Returns new stage data and next event

**Database:**
- Add `stage` column to `events` table (enum 0-10)
- Add `min_age` and `max_age` columns to `events` table
- Add `is_stage_transition` boolean column to flag mandatory stage gate events

**Validation:**
- Stage can only increment by 1 (no skipping stages)
- Age must be within valid range for current stage
- Stage transitions cannot be triggered manually by player

**Error Handling:**
- If stage transition event is missing from database, log error and show fallback generic transition text
- If age calculation becomes inconsistent with stage, auto-correct to lowest valid age for current stage

**Edge Cases:**
- Player loads save from old stage → check if age now requires stage advancement and trigger catch-up transition
- Random death event fires before Stage 10 → force immediate transition to Stage 10 (End of Life)
- Player reaches age 100+ → cap at Stage 10, continue with senior events until health-based death

**Dependencies:**
- Event Engine must be functional to trigger stage transition events
- Stat System must exist to carry modifiers between stages

---

### Feature: 12-Stat Dynamic System
**Priority:** Must-have

**Description:**
Comprehensive stat tracking system managing 12 interconnected stats on a 0-100 scale: Health, Happiness, Wealth, Intelligence, Social, Creativity, Fitness, Spirituality, Resilience, Wisdom, Reputation, Mental Health. Stats decay over time, respond to events, and have interdependencies (e.g., low Mental Health accelerates Health decay; high Social boosts Happiness).

**User Stories:**
- As a player, I want to see how my choices affect multiple interconnected stats simultaneously with immediate visual feedback
- As a player, I want stats to decay or grow naturally over time based on my behavior patterns (e.g., Fitness decays if I choose sedentary activities)
- As a player, I want hidden stats like Mental Health to surface through events when they reach critical thresholds
- As a player, I want Wisdom stat to unlock only in later life stages (51+) as a unique senior-years mechanic

**Acceptance Criteria:**
- [ ] All 12 stats display in a persistent sidebar with animated bars showing 0-100 values
- [ ] Stat changes show delta indicators (+/- values) with brief animation
- [ ] Mental Health is hidden by default but surfaces in stat bar when value drops below 40 or specific events reveal it
- [ ] Wisdom stat is locked/grayed out until Stage 8 (age 51+)
- [ ] Stat decay occurs automatically every game cycle (calculated in background)
- [ ] Hovering over a stat shows tooltip with interdependencies and current modifiers
- [ ] Color coding indicates stat health: 0-30 red, 31-60 yellow, 61-100 green

**How to Implement:**

**Frontend:**
- Create `StatBar.tsx` component with:
  - Animated progress bar using Framer Motion or CSS transitions
  - Delta indicator span that appears for 2 seconds on change
  - Conditional rendering for Mental Health (only show if `mental_health_revealed = true` in game state)
  - Conditional lock icon for Wisdom if stage < 8
- Create `StatPanel.tsx` container holding all 12 StatBars
- Implement tooltip component showing stat formula: "Health = base + Fitness*0.3 + Mental Health*0.2 - Age*0.1"
- Add pulsing animation to stat bars when value drops below 20 (critical warning)

**Backend:**
- Store stats as JSONB in `game_state.stats` column:
  ```json
  {
    "health": 75,
    "happiness": 60,
    "wealth": 45,
    "intelligence": 70,
    "social": 55,
    "creativity": 40,
    "fitness": 65,
    "spirituality": 30,
    "resilience": 50,
    "wisdom": 0,
    "reputation": 60,
    "mental_health": 55
  }
  ```
- Create Supabase Edge Function `calculate_stat_decay()` that runs on every event resolution:
  - Apply decay formulas (e.g., Fitness -= 0.5 per year after age 30)
  - Calculate interdependencies (e.g., if mental_health < 40, health -= 5)
  - Apply age-based modifiers (e.g., Intelligence peaks at 40, then -0.2/year)
  - Clamp all values to 0-100 range
- Create function `apply_stat_deltas(stat_changes: Partial<Stats>)` that:
  - Takes stat changes from event choice
  - Applies them to current stats
  - Logs before/after snapshots to event_history table
  - Returns updated stats object

**Database:**
- `game_state.stats` (JSONB) — current stat values
- `game_state.mental_health_revealed` (boolean) — whether Mental Health stat is visible
- `event_history.stat_state_before` (JSONB) — snapshot before event
- `event_history.stat_state_after` (JSONB) — snapshot after event
- Add `stat_triggers` column to `events` table (JSONB) — e.g., `{"health": {"min": 30, "max": 100}}` to trigger event only if Health is 30-100

**Validation:**
- All stat values must remain in 0-100 range after any operation
- Stat deltas from events cannot exceed ±30 in single event (prevent extreme swings)
- Wisdom cannot increase if stage < 8

**Error Handling:**
- If JSONB stats object is malformed, reset to default starting values for current stage
- If stat decay calculation fails, log error and skip decay for that cycle (don't block game)
- If interdependency creates infinite loop (A affects B affects A), break loop after 3 iterations and log warning

**Edge Cases:**
- Player reaches Fitness = 100 → apply diminishing returns (further gains require exponentially more effort)
- Multiple stats hit 0 simultaneously → prioritize Health = 0 (triggers death event)
- Stat bar animation interrupted by rapid consecutive events → batch animations to prevent visual glitches
- Wisdom unlocks mid-game (loading old save at Stage 8) → initialize Wisdom at base value (20) and show tutorial tooltip

**Dependencies:**
- Event Engine must pass stat deltas to this system
- NPC Relationship System affects Mental Health and Social stats
- Financial System affects Wealth stat

---

### Feature: Dynamic Event Generation System
**Priority:** Must-have

**Description:**
Event engine that selects and triggers events based on multiple contextual factors: life stage gates, stat thresholds, random probability rolls, NPC relationship states, and prior player choices. Events offer 2-4 branching choices with immediate stat consequences and long-term event tree effects (unlocking or locking future events).

**User Stories:**
- As a player, I want to encounter events appropriate to my current life stage and stat levels (no job loss event at age 10, no puberty event at age 40)
- As a player, I want my choices in events to unlock or lock future event paths (choosing "Join the military" at 18 prevents "Go to university" path)
- As a player, I want both mandatory story beats (stage transitions, career fork at 18) and random surprises
- As a player, I want to see immediate stat changes and long-term consequences of my decisions

**Acceptance Criteria:**
- [ ] Event fires every game turn based on priority: stage gate events → stat threshold events → NPC state events → random events
- [ ] Event card displays narrative text (static or AI-generated for milestones), 2-4 choice buttons, and current age/stage context
- [ ] Hovering over choice shows preview of stat changes before selection
- [ ] After choice is made, stat bars animate to show changes
- [ ] Event history is recorded in timeline with choice made
- [ ] Future events check player's event history to determine availability
- [ ] Approximately 20% of events are milestone events (use AI narrator), 80% use static narrative text

**How to Implement:**

**Frontend:**
- Create `EventCard.tsx` component with:
  - Title, age indicator, stage badge
  - Narrative text area (3-5 sentences, serif font)
  - 2-4 `ChoiceButton` components with hover state showing stat preview
  - "Next" button that appears after choice is made (triggers stat application and next event)
- Create `ChoiceButton.tsx` with:
  - Choice text
  - Tooltip on hover showing stat deltas (e.g., "+10 Intelligence, -5 Wealth")
  - Disabled state if choice is locked by prior events
- Build `useGameEngine.ts` hook that:
  - Calls backend `get_next_event()` function
  - Manages event state (current event, choices, selected choice)
  - Handles choice submission and stat updates
  - Advances to next event

**Backend:**
- Create Supabase function `get_next_event(game_state_id: uuid)`:
  1. Load current game state (age, stage, stats, event history, NPC states)
  2. Query `events` table for eligible events:
     - Match stage
     - Match age range (min_age <= current_age <= max_age)
     - Check stat triggers (e.g., only fire if Health < 30)
     - Check required_prior_events (must have experienced Event A before Event B fires)
     - Check locked_by_events (if Event C occurred, Event D can never fire)
     - Exclude events already in event_history (unless event is repeatable)
  3. From eligible events, prioritize:
     - Stage gate events (is_stage_transition = true) → highest priority
     - Stat threshold events (stat_triggers defined) → second
     - NPC state events (e.g., partner trust < 30) → third
     - Random events (roll against random_chance) → fourth
  4. If milestone event (is_milestone = true), call Claude API for AI narration
  5. Return event object with narrative, choices, and metadata
  
- Create function `process_choice(event_id, choice_index, game_state_id)`:
  1. Load choice data from event definition
  2. Apply stat deltas to game state
  3. Process NPC effects (depth changes, trust changes, add shared memory)
  4. Update event history (record event_id, age_occurred, choice_made, stat snapshots)
  5. Process unlocksEvents and locksEvents arrays (mark future events as available/unavailable)
  6. Update Regret Index based on unchosen choices' regret weights
  7. Add Legacy Points from choice
  8. Save updated game state
  9. Return next event

**Database:**
- `events` table structure:
  ```sql
  id (uuid)
  event_key (text, unique) -- e.g., "first_day_school"
  title (text)
  narrative (text) -- static template or AI prompt instructions
  min_age (integer)
  max_age (integer)
  stage (enum 0-10)
  is_milestone (boolean) -- use AI narrator
  random_chance (float) -- 0.0-1.0, null if not random event
  stat_triggers (jsonb) -- {"health": {"min": 0, "max": 30}}
  required_prior_events (text[]) -- array of event_keys
  locked_by_events (text[]) -- array of event_keys
  choices (jsonb) -- array of choice objects
  created_at (timestamp)
  ```
- `event_history` table:
  ```sql
  id (uuid)
  game_state_id (uuid, foreign key)
  event_id (uuid, foreign key)
  age_occurred (integer)
  choice_made (integer) -- index of choice selected
  ai_narrative (text, nullable) -- AI-generated narrative if milestone
  stat_state_before (jsonb)
  stat_state_after (jsonb)
  occurred_at (timestamp)
  ```

**Validation:**
- Event can only fire once per game unless explicitly marked repeatable
- Choice index must be valid (0 to choices.length - 1)
- Stat deltas cannot reduce any stat below 0 or above 100
- Required prior events must exist in player's event history

**Error Handling:**
- If no eligible events found, log error and generate fallback "quiet day" event (minimal stat changes, neutral choices)
- If AI narrator API fails, fall back to static narrative text
- If stat delta causes stat to exceed bounds, clamp to 0 or 100 and log warning
- If event history write fails, retry 3 times, then show error modal to player

**Edge Cases:**
- Player's stat combination creates zero eligible events → generate procedural "reflection" event (player contemplates life, makes philosophical choice)
- Two events have equal priority → use random selection with seed based on player's game_state_id for consistency
- Event fires but player quits before making choice → on reload, resume from same event (don't skip)
- Rapid consecutive events (e.g., chain reactions from prior choices) → batch stat animations to prevent UI overload

**Dependencies:**
- Stat System must exist to apply deltas
- NPC System must exist to process relationship effects
- AI Narrator integration must be functional for milestone events
- Event content must be seeded in Supabase events table

---


### Feature: Deep NPC Relationship System
**Priority:** Must-have

**Description:**
System tracking relationships with family members, friends, romantic partners, rivals, mentors, and children. Each NPC has depth (intimacy 0-100), trust (0-100), loyalty (0-100), status (alive/estranged/deceased/lost touch), and shared memories array. Relationships naturally drift if not maintained. High-depth relationships unlock unique events and affect player's Mental Health stat.

**User Stories:**
- As a player, I want to build deep relationships with NPCs that evolve over time based on my choices
- As a player, I want neglected relationships to drift and degrade naturally (depth/trust decay if not interacted with for 3-5 years)
- As a player, I want relationship quality to unlock unique events (deep friendships unlock "vacation together" event) and affect my Mental Health stat
- As a player, I want to see which NPCs attend my deathbed based on relationship depth scores (threshold: depth > 60 or family)

**Acceptance Criteria:**
- [ ] NPCPanel displays all active NPCs with avatars, names, relationship type, depth bar, and status indicator
- [ ] Clicking an NPC shows detailed relationship card with trust, loyalty, shared memories, last interaction age
- [ ] NPCs automatically drift if lastInteraction age gap exceeds 3 years: depth -= 2/year, trust -= 3/year
- [ ] Events involving NPCs update depth/trust based on choice quality
- [ ] Estranged NPCs (depth < 20) show visual warning in NPCPanel
- [ ] Deathbed event (Stage 10) displays only NPCs with depth > 60 or family type
- [ ] Mental Health stat decreases if Social Network Quality (average NPC depth) falls below 40

**How to Implement:**

**Frontend:**
- Create `NPCPanel.tsx` component with:
  - Grid of `NPCCard` mini components (avatar, name, type badge, depth bar)
  - Pulsing red border if NPC is drifting (lastInteraction > 3 years ago)
  - Glow effect if NPC depth > 70 (thriving relationship)
- Create `NPCDetailModal.tsx` triggered on NPC card click:
  - Full stats: depth, trust, loyalty (each 0-100)
  - Status badge (alive/estranged/deceased/lost touch)
  - Shared memories list (event titles from event_history where NPC was involved)
  - Last interaction info (age, years ago)
  - "Reach out" button (fires NPC-specific reconnection event if available)
- Add NPC avatars using shadcn Avatar component with type-based color coding (family=blue, friends=green, partners=pink, rivals=red, mentors=purple, children=yellow)

**Backend:**
- Store NPCs in `npcs` table:
  ```sql
  id (uuid)
  game_state_id (uuid, foreign key)
  name (text)
  type (enum: family, friend, partner, rival, mentor, child)
  depth (integer 0-100) -- intimacy score
  trust (integer 0-100)
  loyalty (integer 0-100)
  status (enum: alive, estranged, deceased, lost_touch)
  shared_memories (jsonb) -- array of event_ids
  last_interaction_age (integer) -- player age at last meaningful interaction
  created_at_age (integer) -- player age when NPC entered life
  ```
- Create function `process_npc_drift()` called after every event:
  1. Load all NPCs for current game state
  2. For each NPC where status = 'alive':
     - Calculate years since last interaction: `current_age - last_interaction_age`
     - If gap > 3 years:
       - depth -= 2 * (gap - 3)
       - trust -= 3 * (gap - 3)
       - If depth < 20, set status = 'estranged'
       - If depth < 10, set status = 'lost_touch'
  3. Save updated NPC states
  4. Recalculate Social Network Quality (average depth of all alive NPCs)
  5. If Social Network Quality < 40, apply Mental Health penalty (-5)

- Create function `update_npc_relationship(npc_id, depth_delta, trust_delta, add_memory)`:
  1. Load NPC record
  2. Apply deltas: depth += depth_delta, trust += trust_delta (clamp 0-100)
  3. Update last_interaction_age = current age
  4. Append event_id to shared_memories array
  5. If depth crosses threshold (40→50, 60→70, 80→90), unlock tier-specific events
  6. Save updated NPC

**Database:**
- `npcs` table (see structure above)
- Add `npc_effects` field to event choices (JSONB):
  ```json
  {
    "npc_id": "uuid-of-specific-npc",
    "depth_delta": 10,
    "trust_delta": 5,
    "add_shared_memory": true
  }
  ```
- Add `social_network_quality` calculated field to game_state (not stored, computed on load)

**Validation:**
- Depth, trust, loyalty must remain in 0-100 range
- lastInteraction age cannot exceed current age
- NPC type cannot change once created (family stays family)
- Status transitions must follow logical flow: alive → estranged → lost_touch (or alive → deceased)

**Error Handling:**
- If NPC drift calculation fails, log warning and skip drift for that cycle
- If shared_memories array becomes corrupted, reset to empty array and log issue
- If event references non-existent NPC ID, show generic "someone important" text instead of crashing

**Edge Cases:**
- Player neglects all NPCs → Mental Health plummets, unlock "isolation" event at age 40+ (therapist NPC introduced)
- NPC dies (random or scripted event) → set status = 'deceased', depth/trust frozen at death values, show memorial event
- Player reunites with estranged NPC → special reconciliation event fires, depth partially restored (max +30)
- Children NPCs age alongside player → when child reaches age 18, transition from 'child' type to 'adult_child', relationship dynamics change

**Dependencies:**
- Event Engine must process NPC effects from event choices
- Stat System must allow NPCs to affect Mental Health
- Death events must check NPC states for deathbed attendee list

---

### Feature: Real Financial System
**Priority:** Must-have

**Description:**
Tracks player's actual net worth (not just 0-100 stat) with income sources (salary, investments, rental, business, inheritance), expense categories (housing, family, health, lifestyle, debt repayment), debt types (student loan, mortgage, credit card, business), and investment mechanics with risk tiers. Net worth is normalized to 0-100 Wealth stat for display in stat panel.

**User Stories:**
- As a player, I want to manage realistic finances with monthly income, recurring expenses, and major financial events
- As a player, I want financial events (market crash, inheritance, unexpected medical bill) to impact my actual net worth and Wealth stat
- As a player, I want to make investment decisions with different risk/reward profiles (Safe 3% annual, Balanced 6%, Aggressive 10% with volatility)
- As a player, I want my wealth to affect available life choices (can't buy house if net worth < $50k) and contribute to Legacy Score

**Acceptance Criteria:**
- [ ] Financial dashboard displays: Net Worth (actual $), Wealth stat (0-100), Monthly Income, Monthly Expenses, Debt Total, Investment Portfolio
- [ ] Income sources tracked separately: Salary, Investment Returns, Rental Income, Business Profit, Inheritance/Gifts
- [ ] Expenses tracked by category: Housing (rent/mortgage), Family (children costs), Health (insurance, medical), Lifestyle, Debt Payments
- [ ] Debt types tracked: Student Loans (interest rate, balance), Mortgage, Credit Card (high interest), Business Debt
- [ ] Investment system allows allocation across 3 tiers: Safe (3% annual, low volatility), Balanced (6%, medium), Aggressive (10%, high volatility)
- [ ] Net worth normalized to Wealth stat: $-100k = 0, $0 = 30, $100k = 50, $500k = 70, $1M+ = 90, $5M+ = 100
- [ ] Financial events can trigger based on net worth thresholds (bankruptcy if < -$50k, inheritance event random)

**How to Implement:**

**Frontend:**
- Create `FinancialDashboard.tsx` component with:
  - NetWorthCard showing current $ value with trend arrow (up/down from last year)
  - IncomeBreakdown chart (pie chart of income sources)
  - ExpenseBreakdown chart (bar chart by category)
  - DebtTracker list (each debt type with balance and monthly payment)
  - InvestmentPortfolio showing allocation sliders (Safe/Balanced/Aggressive) with projected annual return
- Create `InvestmentModal.tsx` for making investment decisions:
  - Current allocation display
  - Sliders to adjust % in each tier (must sum to 100%)
  - Projected return calculator
  - Risk warning tooltip for Aggressive tier
  - "Confirm Investment" button (applies changes to game state)

**Backend:**
- Store financial state in `game_state.financial_state` (JSONB):
  ```json
  {
    "net_worth": 25000,
    "income": {
      "salary": 45000,
      "investment_returns": 2000,
      "rental": 0,
      "business": 0
    },
    "expenses": {
      "housing": 15000,
      "family": 5000,
      "health": 6000,
      "lifestyle": 8000,
      "debt_payments": 6000
    },
    "debts": [
      {"type": "student_loan", "balance": 30000, "rate": 0.05, "monthly_payment": 300},
      {"type": "mortgage", "balance": 200000, "rate": 0.04, "monthly_payment": 1200}
    ],
    "investments": {
      "safe": 10000,
      "balanced": 5000,
      "aggressive": 2000
    }
  }
  ```
- Create function `calculate_annual_financial_update()` called at each birthday event:
  1. Calculate annual income total
  2. Calculate annual expenses total
  3. Apply investment returns with volatility:
     - Safe: fixed 3%
     - Balanced: 6% ± random(-2%, +2%)
     - Aggressive: 10% ± random(-5%, +10%)
  4. Apply debt interest charges
  5. Update net_worth = previous_net_worth + income - expenses + investment_returns - debt_interest
  6. Normalize net_worth to Wealth stat using formula:
     ```
     if net_worth < 0: wealth = max(0, 30 + (net_worth / 100000 * 30))
     elif net_worth < 100000: wealth = 30 + (net_worth / 100000 * 20)
     elif net_worth < 500000: wealth = 50 + ((net_worth - 100000) / 400000 * 20)
     elif net_worth < 1000000: wealth = 70 + ((net_worth - 500000) / 500000 * 20)
     else: wealth = min(100, 90 + ((net_worth - 1000000) / 4000000 * 10))
     ```
  7. Save updated financial state

- Create function `process_financial_event(event_type, amount, debt_data)`:
  - Handles one-time events: inheritance (+$50k), medical bill (-$20k), market crash (-30% investments), business windfall (+$100k)
  - Updates net_worth and relevant financial state fields
  - Recalculates Wealth stat
  - Can add new debt entries if event requires borrowing

**Database:**
- `game_state.financial_state` (JSONB, see structure above)
- Add `financial_triggers` to events table (JSONB) to fire events based on net worth thresholds:
  ```json
  {
    "net_worth": {"min": -50000, "max": 0}
  }
  ```
- Add `financial_effects` to event choices (JSONB):
  ```json
  {
    "net_worth_delta": -25000,
    "add_debt": {"type": "credit_card", "balance": 10000, "rate": 0.18}
  }
  ```

**Validation:**
- Investment allocation percentages must sum to 100%
- Debt balances cannot be negative
- Monthly payment on debt must be > 0
- Net worth can be negative (debt > assets) but capped at -$500k (prevent absurd values)

**Error Handling:**
- If investment return calculation fails, use fallback 0% return for that cycle
- If debt data is malformed, reset to empty debts array and log issue
- If expense exceeds income consistently (3+ years), trigger mandatory financial crisis event

**Edge Cases:**
- Player reaches net worth $10M+ → unlock "philanthropist" event path, allow massive charitable donations
- Aggressive investment loses 50% in market crash → show special event narrative about financial resilience test
- Player dies with massive debt → deduct from Legacy Score in "Wealth Legacy" category
- Career change events modify salary → update income.salary and recalculate monthly budget

**Dependencies:**
- Stat System must display Wealth stat normalized from net worth
- Event Engine must check financial triggers to fire wealth-based events
- Career Path System affects base salary income

---

### Feature: Legacy Score Calculation System
**Priority:** Must-have

**Description:**
End-