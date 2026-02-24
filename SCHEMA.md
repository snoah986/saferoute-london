# Database Schema

This document defines the complete data model for Lifespring Chronicles, optimized for Supabase PostgreSQL with support for future content expansion and scalability to a full PC game.

## Overview

The schema is designed around three core principles:

1. **Event-Driven Architecture** - Events stored as data (not code) to enable runtime content updates
2. **Snapshot-Based Game State** - Complete game state captured in single records for reliable save/load
3. **Relationship-First Design** - NPCs and their relationships are first-class entities with deep tracking


## Core Tables

### `game_states`

Represents a complete playthrough snapshot. Primary player data entity.

```sql
CREATE TABLE game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Life Progress
  current_age INTEGER NOT NULL CHECK (current_age >= 0 AND current_age <= 120),
  current_stage INTEGER NOT NULL CHECK (current_stage >= 0 AND current_stage <= 10),
  
  -- Core Stats (all 0-100 scale)
  stats JSONB NOT NULL DEFAULT '{
    "health": 75,
    "happiness": 50,
    "wealth": 50,
    "intelligence": 50,
    "social": 50,
    "creativity": 50,
    "fitness": 75,
    "spirituality": 50,
    "resilience": 50,
    "wisdom": 0,
    "reputation": 50,
    "mental_health": 75
  }'::jsonb,
  
  -- Financial System (real values, not 0-100)
  financial_state JSONB NOT NULL DEFAULT '{
    "net_worth": 0,
    "income_sources": [],
    "expenses": {},
    "debts": [],
    "investments": []
  }'::jsonb,
  
  -- Birth Circumstances (set at Stage 0, immutable)
  birth_traits JSONB DEFAULT '{
    "temperament": "calm",
    "body_type": "average",
    "inherited_iq_range": [90, 110],
    "family_wealth": "middle",
    "family_structure": "two_parent",
    "siblings": "none"
  }'::jsonb,
  
  -- Career Path (locked at age 18)
  career_path_id UUID REFERENCES career_paths(id),
  career_progression JSONB DEFAULT '{
    "current_tier": "entry",
    "years_in_field": 0,
    "promotions": 0,
    "career_switches": 0
  }'::jsonb,
  
  -- Progression Tracking
  regret_index INTEGER DEFAULT 0 CHECK (regret_index >= 0),
  legacy_points INTEGER DEFAULT 0,
  peace_index INTEGER DEFAULT 50 CHECK (peace_index >= 0 AND peace_index <= 100),
  
  -- Bucket List (unlocks at age 51-65)
  bucket_list JSONB DEFAULT '[]'::jsonb,
  bucket_list_unlocked BOOLEAN DEFAULT false,
  
  -- State Flags
  is_alive BOOLEAN DEFAULT true,
  has_children BOOLEAN DEFAULT false,
  is_married BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_saved_at TIMESTAMPTZ DEFAULT NOW(),
  last_event_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_stats CHECK (
    (stats->>'health')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'happiness')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'wealth')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'intelligence')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'social')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'creativity')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'fitness')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'spirituality')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'resilience')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'wisdom')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'reputation')::INTEGER BETWEEN 0 AND 100 AND
    (stats->>'mental_health')::INTEGER BETWEEN 0 AND 100
  )
);

-- Indexes for common queries
CREATE INDEX idx_game_states_player ON game_states(player_id);
CREATE INDEX idx_game_states_stage ON game_states(current_stage);
CREATE INDEX idx_game_states_alive ON game_states(is_alive);
CREATE INDEX idx_game_states_age ON game_states(current_age);

-- Enable Row Level Security
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Players can only access their own game states
CREATE POLICY "Users can view own game states"
  ON game_states FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own game states"
  ON game_states FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update own game states"
  ON game_states FOR UPDATE
  USING (auth.uid() = player_id);

CREATE POLICY "Users can delete own game states"
  ON game_states FOR DELETE
  USING (auth.uid() = player_id);
```


### `events`

Static event definitions. This is the content database that powers the entire game narrative.

```sql
CREATE TYPE life_stage AS ENUM (
  'birth_infancy',      -- 0: Age 0-2
  'early_childhood',    -- 1: Age 3-7
  'middle_childhood',   -- 2: Age 8-12
  'teen_years',         -- 3: Age 13-17
  'late_teen',          -- 4: Age 18
  'young_adult_1',      -- 5: Age 19-25
  'young_adult_2',      -- 6: Age 26-35
  'adult_peak',         -- 7: Age 36-50
  'middle_age',         -- 8: Age 51-65
  'senior',             -- 9: Age 66-79
  'end_of_life'         -- 10: Age 80+
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event Identity
  event_key TEXT UNIQUE NOT NULL, -- machine-readable ID like "first_day_school"
  title TEXT NOT NULL,
  narrative TEXT NOT NULL, -- Static prose or template for AI
  
  -- Trigger Conditions
  min_age INTEGER NOT NULL CHECK (min_age >= 0),
  max_age INTEGER NOT NULL CHECK (max_age >= min_age),
  stage life_stage NOT NULL,
  
  -- Event Type
  is_milestone BOOLEAN DEFAULT false, -- True = use AI narrator
  is_mandatory BOOLEAN DEFAULT false, -- True = stage gate event
  random_chance DECIMAL(3,2) CHECK (random_chance >= 0 AND random_chance <= 1),
  
  -- Advanced Triggers (stored as JSONB for flexibility)
  stat_triggers JSONB DEFAULT '{}'::jsonb,
  -- Example: {"health": {"operator": "lt", "value": 30}, "wealth": {"operator": "gte", "value": 70}}
  
  -- Event Dependencies
  required_prior_events TEXT[] DEFAULT ARRAY[]::TEXT[], -- event_keys that must have occurred
  locked_by_events TEXT[] DEFAULT ARRAY[]::TEXT[],      -- event_keys that prevent this from firing
  requires_career_path UUID REFERENCES career_paths(id), -- null = available to all paths
  requires_has_children BOOLEAN,                        -- null = doesn't matter
  requires_is_married BOOLEAN,                          -- null = doesn't matter
  
  -- Choices (array of choice objects)
  choices JSONB NOT NULL,
  -- Example structure:
  -- [
  --   {
  --     "text": "Defend the bullied kid",
  --     "stat_deltas": {"social": 10, "resilience": 5, "happiness": -5},
  --     "npc_effects": [{"type": "friend", "depth": 15, "trust": 10}],
  --     "unlocks_events": ["loyal_friend_event"],
  --     "locks_events": ["coward_reputation_event"],
  --     "regret_weight": 0,
  --     "legacy_points": 50,
  --     "narrative_consequence": "You earned a lifelong friend that day."
  --   }
  -- ]
  
  -- Content Management
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true, -- Allows soft-delete of events
  
  -- Metadata for content editor
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT -- Internal notes for content creators
);

-- Indexes for event queries
CREATE INDEX idx_events_stage ON events(stage);
CREATE INDEX idx_events_age_range ON events(min_age, max_age);
CREATE INDEX idx_events_milestone ON events(is_milestone);
CREATE INDEX idx_events_mandatory ON events(is_mandatory);
CREATE INDEX idx_events_career_path ON events(requires_career_path);
CREATE INDEX idx_events_active ON events(is_active);

-- Full-text search on event content
CREATE INDEX idx_events_search ON events USING GIN(to_tsvector('english', title || ' ' || narrative));

-- RLS: Events are public read (everyone sees same events)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  USING (is_active = true);

-- Only admins can modify events (implement admin role separately)
CREATE POLICY "Only admins can modify events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```


### `event_history`

Records of events experienced by players. This creates the life timeline.

```sql
CREATE TABLE event_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  game_state_id UUID NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id),
  
  -- Event Context
  age_occurred INTEGER NOT NULL CHECK (age_occurred >= 0),
  stage_occurred life_stage NOT NULL,
  
  -- Player Action
  choice_index INTEGER NOT NULL, -- Index in the event's choices array
  choice_text TEXT NOT NULL,     -- Denormalized for timeline display
  
  -- AI-Generated Content (only for milestone events)
  ai_narrative TEXT,
  ai_prompt_used TEXT, -- For debugging/improvement
  ai_generation_cost DECIMAL(10,4), -- Track API costs
  
  -- State Snapshots (for the life review feature)
  stats_before JSONB NOT NULL,
  stats_after JSONB NOT NULL,
  
  -- Consequences Applied
  stat_deltas JSONB NOT NULL,
  npc_effects JSONB, -- Which NPCs were affected and how
  events_unlocked TEXT[] DEFAULT ARRAY[]::TEXT[],
  events_locked TEXT[] DEFAULT ARRAY[]::TEXT[],
  legacy_points_gained INTEGER DEFAULT 0,
  regret_added INTEGER DEFAULT 0,
  
  -- Metadata
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- For alternate path revelation at end of life
  unchosen_paths JSONB -- Store what would have happened with other choices
);

-- Indexes
CREATE INDEX idx_event_history_game ON event_history(game_state_id);
CREATE INDEX idx_event_history_event ON event_history(event_id);
CREATE INDEX idx_event_history_age ON event_history(age_occurred);
CREATE INDEX idx_event_history_timestamp ON event_history(occurred_at);

-- RLS: Players can only see history for their own games
ALTER TABLE event_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event history"
  ON event_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_states
      WHERE game_states.id = event_history.game_state_id
      AND game_states.player_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own event history"
  ON event_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_states
      WHERE game_states.id = event_history.game_state_id
      AND game_states.player_id = auth.uid()
    )
  );
```

## Relationship System


### `npcs`

Non-player characters in the player's life. Core to the relationship system and Mental Health stat.

```sql
CREATE TYPE npc_type AS ENUM (
  'family',   -- Parent, sibling, grandparent
  'friend',   -- Platonic relationship
  'partner',  -- Romantic relationship
  'rival',    -- Antagonistic relationship
  'mentor',   -- Teacher, boss, guide
  'child'     -- Player's offspring
);

CREATE TYPE npc_status AS ENUM (
  'alive',
  'estranged',
  'deceased',
  'lost_touch'
);

CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership
  game_state_id UUID NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  type npc_type NOT NULL,
  
  -- Relationship Metrics (0-100)
  depth INTEGER DEFAULT 0 CHECK (depth BETWEEN 0 AND 100),
  trust INTEGER DEFAULT 50 CHECK (trust BETWEEN 0 AND 100),
  loyalty INTEGER DEFAULT 50 CHECK (loyalty BETWEEN 0 AND 100),
  
  -- State
  status npc_status DEFAULT 'alive',
  
  -- Interaction Tracking
  last_interaction_age INTEGER, -- Player's age at last meaningful interaction
  total_interactions INTEGER DEFAULT 0,
  shared_memories JSONB DEFAULT '[]'::jsonb, -- Array of event IDs
  
  -- Drift Mechanics
  drift_rate INTEGER DEFAULT 5, -- Points lost per year of no interaction
  drift_threshold_years INTEGER DEFAULT 3, -- Years before drift starts
  
  -- Lifecycle
  created_at_age INTEGER NOT NULL, -- Player's age when NPC entered life
  relationship_started_at TIMESTAMPTZ DEFAULT NOW(),
  relationship_ended_at TIMESTAMPTZ,
  
  -- Special NPC Data (for children, partners)
  special_data JSONB DEFAULT '{}'::jsonb,
  -- Example for child: {"child_age": 5, "child_wellbeing": 75, "parenting_quality": 60}
  -- Example for partner: {"marriage_date": "2045-06-15", "years_together": 12}
  
  -- Metadata
  notes TEXT -- For debugging/content
);

-- Indexes
CREATE INDEX idx_npcs_game ON npcs(game_state_id);
CREATE INDEX idx_npcs_type ON npcs(type);
CREATE INDEX idx_npcs_status ON npcs(status);
CREATE INDEX idx_npcs_depth ON npcs(depth); -- For legacy score queries

-- RLS
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage NPCs in own games"
  ON npcs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM game_states
      WHERE game_states.id = npcs.game_state_id
      AND game_states.player_id = auth.uid()
    )
  );
```

### `npc_interactions`

Detailed log of NPC interactions. Used for drift calculations and Memory Vignettes feature.

```sql
CREATE TABLE npc_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  npc_id UUID NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  game_state_id UUID NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  event_history_id UUID REFERENCES event_history(id), -- null if interaction outside event
  
  player_age_at_interaction INTEGER NOT NULL,
  
  interaction_type TEXT NOT NULL, -- "supportive", "conflict", "quality_time", "neglect"
  depth_change INTEGER DEFAULT 0,
  trust_change INTEGER DEFAULT 0,
  
  memory_quality TEXT, -- "forgettable", "meaningful", "pivotal"
  
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_npc_interactions_npc ON npc_interactions(npc_id);
CREATE INDEX idx_npc_interactions_game ON npc_interactions(game_state_id);

ALTER TABLE npc_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own NPC interactions"
  ON npc_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_states
      WHERE game_states.id = npc_interactions.game_state_id
      AND game_states.player_id = auth.uid()
    )
  );
```

## Career System

### `career_paths`

The six post-age-18 career trajectories.

```sql
CREATE TYPE career_path_type AS ENUM (
  'university',
  'trade_vocational',
  'workforce',
  'gap_year',
  'military',
  'entrepreneurship'
);

CREATE TABLE career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  path_type career_path_type UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Initial Impact (when chosen at age 18)
  stat_bonuses JSONB NOT NULL,
  -- Example: {"intelligence": 20, "social": 10}
  stat_costs JSONB NOT NULL,
  -- Example: {"wealth": -30, "happiness": -10}
  
  -- Career Progression Tiers
  progression_tiers JSONB NOT NULL,
  -- Example:
  -- [
  --   {
  --     "tier": "entry",
  --     "age_range": [19, 25],
  --     "salary_range": [30000, 50000],
  --     "title_examples": ["Junior Developer", "Intern"]
  --   },
  --   {
  --     "tier": "mid",
  --     "age_range": [26, 40],
  --     "salary_range": [60000, 120000],
  --     "title_examples": ["Senior Developer", "Manager"]
  --   },
  --   {
  --     "tier": "senior",
  --     "age_range": [41, 65],
  --     "salary_range": [100000, 300000],
  --     "title_examples": ["CTO", "Principal Engineer"]
  --   }
  -- ]
  
  -- Event Unlocking
  unlocks_events TEXT[] DEFAULT ARRAY[]::TEXT[], -- event_keys made available
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data (insert the 6 paths)
INSERT INTO career_paths (path_type, name, description, stat_bonuses, stat_costs, progression_tiers, unlocks_events) VALUES
('university', 'University Education', 'Four-year academic track leading to professional careers', 
  '{"intelligence": 20, "social": 10}'::jsonb,
  '{"wealth": -30, "fitness": -5}'::jsonb,
  '[{"tier": "entry", "age_range": [22, 28], "salary_range": [40000, 60000]}, {"tier": "mid", "age_range": [29, 45], "salary_range": [70000, 150000]}, {"tier": "senior", "age_range": [46, 65], "salary_range": [120000, 400000]}]'::jsonb,
  ARRAY['grad_school_opportunity', 'research_grant', 'academic_network']
),
('trade_vocational', 'Trade / Vocational Training', 'Skilled labor path with immediate earnings',
  '{"fitness": 10, "wealth": 15}'::jsonb,
  '{"reputation": -5}'::jsonb,
  '[{"tier": "entry", "age_range": [19, 25], "salary_range": [35000, 50000]}, {"tier": "mid", "age_range": [26, 40], "salary_range": [55000, 90000]}, {"tier": "senior", "age_range": [41, 65], "salary_range": [70000, 150000]}]'::jsonb,
  ARRAY['union_leadership', 'start_own_business', 'master_craftsman']
),
('workforce', 'Enter Workforce Directly', 'Immediate employment without higher education',
  '{"wealth": 10, "resilience": 15}'::jsonb,
  '{"intelligence": 0}'::jsonb,
  '[{"tier": "entry", "age_range": [18, 25], "salary_range": [25000, 40000]}, {"tier": "mid", "age_range": [26, 40], "salary_range": [45000, 70000]}, {"tier": "senior", "age_range": [41, 65], "salary_range": [60000, 100000]}]'::jsonb,
  ARRAY['workplace_promotion', 'career_pivot', 'late_education']
),
('gap_year', 'Gap Year / Travel', 'World exploration and self-discovery',
  '{"creativity": 15, "social": 20}'::jsonb,
  '{"wealth": -20}'::jsonb,
  '[{"tier": "entry", "age_range": [20, 28], "salary_range": [30000, 55000]}, {"tier": "mid", "age_range": [29, 45], "salary_range": [60000, 110000]}, {"tier": "senior", "age_range": [46, 65], "salary_range": [80000, 180000]}]'::jsonb,
  ARRAY['cultural_insight', 'international_network', 'language_mastery']
),
('military', 'Military Service', 'Structured discipline and national service',
  '{"fitness": 20, "resilience": 25}'::jsonb,
  '{"mental_health": -15, "happiness": -10}'::jsonb,
  '[{"tier": "entry", "age_range": [18, 25], "salary_range": [30000, 50000]}, {"tier": "mid", "age_range": [26, 40], "salary_range": [55000, 90000]}, {"tier": "senior", "age_range": [41, 60], "salary_range": [70000, 140000]}]'::jsonb,
  ARRAY['combat_deployment', 'ptsd_struggle', 'veteran_network', 'gi_bill']
),
('entrepreneurship', 'Start a Business', 'High-risk, high-reward path of building something',
  '{"creativity": 15, "resilience": 20}'::jsonb,
  '{"wealth": -30, "mental_health": -10}'::jsonb,
  '[{"tier": "entry", "age_range": [18, 30], "salary_range": [-20000, 60000]}, {"tier": "mid", "age_range": [31, 45], "salary_range": [0, 200000]}, {"tier": "senior", "age_range": [46, 65], "salary_range": [50000, 1000000]}]'::jsonb,
  ARRAY['startup_funding', 'business_failure', 'ipo_windfall', 'serial_entrepreneur']
);

-- Public read access
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Career paths are publicly readable"
  ON career_paths FOR SELECT
  USING (true);
```

## Legacy System

### `legacy_scores`

Final life evaluation calculated at death.

```sql
CREATE TABLE legacy_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  game_state_id UUID UNIQUE NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  
  -- Total Score (0-10,000)
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 10000),
  
  -- Category Breakdown
  relationships_points INTEGER DEFAULT 0 CHECK (relationships_points BETWEEN 0 AND 3000),
  achievements_points INTEGER DEFAULT 0 CHECK (achievements_points BETWEEN 0 AND 2000),
  bucket_list_points INTEGER DEFAULT 0 CHECK (bucket_list_points BETWEEN 0 AND 1500),
  community_impact_points INTEGER DEFAULT 0 CHECK (community_impact_points BETWEEN 0 AND 1000),
  mental_peace_points INTEGER DEFAULT 0 CHECK (mental_peace_points BETWEEN 0 AND 1000),
  wealth_legacy_points INTEGER DEFAULT 0 CHECK (wealth_legacy_points BETWEEN 0 AND 500),
  wisdom_points INTEGER DEFAULT 0 CHECK (wisdom_points BETWEEN 0 AND 500),
  surprise_bonus_points INTEGER DEFAULT 0 CHECK (surprise_bonus_points BETWEEN 0 AND 500),
  
  -- Narrative Output
  epitaph TEXT NOT NULL,
  
  -- Context
  age_at_death INTEGER NOT NULL,
  cause_of_death TEXT,
  deathbed_attendees JSONB, -- Array of NPC IDs who were present
  
  -- Detailed Breakdown (for stats screen)
  calculation_details JSONB NOT NULL,
  -- Example:
  -- {
  --   "relationships": {
  --     "npc_count": 12,
  --     "deep_relationships": 5,
  --     "average_depth": 67,
  --     "points_formula": "..."
  --   },
  --   "bucket_list": {
  --     "goals_set": 5,
  --     "goals_completed": 3,
  --     "completion_rate": 0.6
  --   }
  -- }
  
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_legacy_game ON legacy_scores(game_state_id);
CREATE INDEX idx_legacy_total_score ON legacy_scores(total_score); -- For leaderboards

-- RLS
ALTER TABLE legacy_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own legacy scores"
  ON legacy_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_states
      WHERE game_states.id = legacy_scores.game_state_id
      AND game_states.player_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own legacy scores"
  ON legacy_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_states
      WHERE game_states.id = legacy_scores.game_state_id
      AND game_states.player_id = auth.uid()
    )
  );
```

## Indexes for Cross-Table Queries

```sql
-- Efficient event triggering queries
CREATE INDEX idx_events_trigger_lookup ON events(stage, min_age, max_age, is_active)
  WHERE is_active = true;

-- Fast NPC relationship summaries for legacy calculation
CREATE INDEX idx_npcs_depth_summary ON npcs(game_state_id, depth, status)
  WHERE status = 'alive';

-- Event history timeline queries
CREATE INDEX idx_event_history_timeline ON event_history(game_state_id, age_occurred, occurred_at);
```

## Database Functions

### Calculate Wealth Stat from Net Worth

```sql
CREATE OR REPLACE FUNCTION calculate_wealth_stat(net_worth NUMERIC)
RETURNS INTEGER AS $$
BEGIN
  -- Map net worth to 0-100 scale
  -- Assumes: -50000 = 0, 0 = 50, 1000000 = 100
  RETURN GREATEST(0, LEAST(100, 
    CASE
      WHEN net_worth <= -50000 THEN 0
      WHEN net_worth >= 1000000 THEN 100
      WHEN net_worth < 0 THEN 50 + (net_worth / 1000)
      ELSE 50 + (net_worth / 20000)
    END
  ))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Apply NPC Relationship Drift

```sql
CREATE OR REPLACE FUNCTION apply_npc_drift(
  p_npc_id UUID,
  p_current_player_age INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_npc RECORD;
  v_years_since_interaction INTEGER;
  v_drift_amount INTEGER;
BEGIN
  SELECT * INTO v_npc FROM npcs WHERE id = p_npc_id;
  
  v_years_since_interaction := p_current_player_age - v_npc.last_interaction_age;
  
  IF v_years_since_interaction >= v_npc.drift_threshold_years THEN
    v_drift_amount := (v_years_since_interaction - v_npc.drift_threshold_years) * v_npc.drift_rate;
    
    UPDATE npcs
    SET 
      depth = GREATEST(0, depth - v_drift_amount),
      trust = GREATEST(0, trust - v_drift_amount),
      status = CASE
        WHEN depth - v_drift_amount <= 10 THEN 'lost_touch'::npc_status
        WHEN depth - v_drift_amount <= 30 THEN 'estranged'::npc_status
        ELSE status
      END
    WHERE id = p_npc_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Get Available Events for Game State

```sql
CREATE OR REPLACE FUNCTION get_available_events(p_game_state_id UUID)
RETURNS TABLE(event_id UUID, event_key TEXT, title TEXT, is_milestone BOOLEAN) AS $$
DECLARE
  v_state RECORD;
BEGIN
  SELECT * INTO v_state FROM game_states WHERE id = p_game_state_id;
  
  RETURN QUERY
  SELECT 
    e.id,
    e.event_key,
    e.title,
    e.is_milestone
  FROM events e
  WHERE 
    e.is_active = true
    AND e.stage = v_state.current_stage::life_stage
    AND v_state.current_age BETWEEN e.min_age AND e.max_age
    -- Not already experienced
    AND NOT EXISTS (
      SELECT 1 FROM event_history eh
      WHERE eh.game_state_id = p_game_state_id
      AND eh.event_id = e.id
    )
    -- Required prior events met
    AND (
      e.required_prior_events = ARRAY[]::TEXT[]
      OR e.required_prior_events <@ (
        SELECT array_agg(ev.event_key)
        FROM event_history eh
        JOIN events ev ON ev.id = eh.event_id
        WHERE eh.game_state_id = p_game_state_id
      )
    )
    -- Not locked by prior events
    AND (
      e.locked_by_events = ARRAY[]::TEXT[]
      OR NOT (e.locked_by_events && (
        SELECT array_agg(ev.event_key)
        FROM event_history eh
        JOIN events ev ON ev.id = eh.event_id
        WHERE eh.game_state_id = p_game_state_id
      ))
    )
    -- Career path matches
    AND (
      e.requires_career_path IS NULL
      OR e.requires_career_path = v_state.career_path_id
    )
    -- Family status matches
    AND (
      e.requires_has_children IS NULL
      OR e.requires_has_children = v_state.has_children
    )
    AND (
      e.requires_is_married IS NULL
      OR e.requires_is_married = v_state.is_married
    );
END;
$$