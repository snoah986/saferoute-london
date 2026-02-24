# Project Overview

SafeTrack London is a London-specific navigation and journey safety web application built for young people who use public transport, cycling, and walking to navigate the city, particularly at night. Unlike Google Maps which optimizes purely for speed and distance, SafeTrack London provides comprehensive safety context before journeys begin.

**Core Mission:** Tell users everything about a route that Google Maps doesn't — isolated zones, unlit areas, real-time transport data, personal avoidances, and live location sharing with trusted contacts.

**Tech Stack:**
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Mapping: Leaflet.js with OpenStreetMap data
- Routing: OpenRouteService API
- Database/Auth: Firebase (Realtime Database + Authentication)
- APIs: TFL Unified API, UK Police API, Nominatim, Overpass API
- Deployment: Netlify or Vercel
- Version Control: GitHub

**Key Architectural Decisions:**
- Web-first (not native mobile) for speed, accessibility, and cross-platform compatibility
- Free APIs only — no paid services
- Beginner-friendly stack suitable for first-year computing student
- Mobile-first responsive design with dark mode as default
- Modular JavaScript architecture with separation of concerns (routing, safety analysis, UI)


---

# BEFORE YOU CODE

## Critical Pre-Implementation Checklist

**ALWAYS perform these checks before writing ANY code:**

1. **Read the Entire Codebase First**
   - Open and review ALL existing JavaScript files before creating new functions
   - Check `/components` directory for reusable UI components
   - Review `safety-engine.js` for existing analysis functions
   - Check `app.js` for existing map and routing logic

2. **Read All Documentation**
   - Read `PLAN.md` — feature roadmap and version sequencing
   - Read `DESIGN.md` — UI patterns, color schemes, component structure
   - Read `SCHEMA.md` — Firebase data structure and relationships
   - Read `PRD.md` — feature specifications and user stories

3. **Check for Existing Components**
   - Search for similar functionality before creating new components
   - Reuse existing map markers, panels, modals, buttons
   - Never duplicate UI components that already exist
   - If a component almost fits but needs modification, extend it rather than rebuild

4. **Verify API Usage**
   - Check `config.js` for API keys and endpoints before making API calls
   - Confirm rate limits haven't been exceeded
   - Use existing API wrapper functions if they exist
   - Never hardcode API keys in component files

5. **Check Firebase Schema**
   - Review existing data structure in `SCHEMA.md` before creating new collections
   - Understand relationships between User, BlockedElement, SavedRoute, TrusteeRelationship, LiveJourney
   - Use existing field names consistently
   - Never create duplicate or conflicting data structures

---

# NAMING CONVENTIONS

## Files

**Components:**
- Use kebab-case: `route-panel.js`, `safety-briefing.js`, `trustee-list.js`
- Location: `/components` directory
- Each component exports a single class or factory function

**Pages:**
- Use kebab-case: `index.html`, `profile.html`, `blocks-manager.html`
- Location: root directory
- One HTML file per major app screen

**Utilities:**
- Use kebab-case: `geocoding-utils.js`, `date-helpers.js`, `safety-scoring.js`
- Location: `/utils` directory
- Pure functions with no side effects

**Hooks/Services:**
- Use kebab-case: `firebase-service.js`, `location-service.js`
- Location: `/services` directory
- Singleton patterns for state management

## Variables and Functions

**Variables:**
```javascript
// Use camelCase
let routeGeometry;
let safetyScore;
let isolatedZoneCount;

// Constants in SCREAMING_SNAKE_CASE
const MAX_ROUTE_LENGTH = 50000;
const NIGHT_START_HOUR = 21;
const API_RATE_LIMIT = 60;

// Boolean variables prefixed with is/has/should
let isNightMode = false;
let hasActiveRoute = true;
let shouldShowWarning = false;
```

**Functions:**
```javascript
// Use camelCase verbs
function calculateSafetyScore() {}
function fetchCrimeData() {}
function displayBriefing() {}

// Async functions still use camelCase
async function geocodeLocation() {}
async function analyzeRoute() {}

// Event handlers prefixed with handle
function handleRouteSubmit() {}
function handleMarkerClick() {}
```

**Classes:**
```javascript
// Use PascalCase
class SafetyEngine {}
class RouteAnalyzer {}
class TrusteeManager {}
```

## Components

**File name matches class name:**
```javascript
// safety-briefing.js
class SafetyBriefing {
  constructor() {}
}

// route-panel.js  
class RoutePanel {
  constructor() {}
}
```

## Routes and URLs

**URL structure:**
- `/` — main map view
- `/profile` — user settings
- `/blocks` — blocked elements manager
- `/trustees` — trustee management
- `/journey/:journeyId` — live journey view
- `/postcode/:postcode` — postcode safety profile

## Database Fields

**Firebase collections:**
- `users` — user accounts
- `blockedElements` — personal avoidances
- `savedRoutes` — verified safe routes
- `trusteeRelationships` — trustee connections
- `liveJourneys` — active shared journeys

**Field naming:**
```javascript
// Use camelCase for all fields
{
  userId: "string",
  phoneNumber: "string",
  nightModeStartHour: 21,
  defaultSharingMode: "always_on_night",
  createdAt: timestamp
}

// Enums use snake_case
{
  elementType: "bus_route" | "bus_stop" | "tube_station",
  blockType: "permanent" | "temporary" | "time_sensitive",
  status: "pending" | "active" | "paused"
}
```


---

# CODE ORGANIZATION

## Directory Structure

```
safetrack-london/
├── index.html                 # Main app entry point
├── profile.html              # User settings
├── blocks.html               # Blocked elements manager
├── trustees.html             # Trustee management
├── style.css                 # Global styles
├── config.js                 # API keys and configuration
├── app.js                    # Main application logic
├── components/
│   ├── route-panel.js        # Route input UI
│   ├── safety-briefing.js    # Safety briefing display
│   ├── map-controls.js       # Map interaction controls
│   ├── trustee-list.js       # Trustee management UI
│   └── block-manager.js      # Block creation/editing UI
├── services/
│   ├── firebase-service.js   # Firebase CRUD operations
│   ├── location-service.js   # Geolocation handling
│   ├── notification-service.js # Push notifications
│   └── storage-service.js    # Local storage wrapper
├── utils/
│   ├── geocoding.js          # Address to coordinates
│   ├── routing.js            # OpenRouteService wrapper
│   ├── crime-data.js         # UK Police API wrapper
│   ├── tfl-api.js            # TFL integration
│   ├── safety-scoring.js     # Safety calculation logic
│   └── date-helpers.js       # Time/date utilities
└── safety-engine.js          # Core safety analysis engine
```

## Where Code Belongs

**app.js — Main application orchestration:**
- Map initialization
- Event listener registration
- Route between components
- Global state management
- DO NOT put business logic here

**safety-engine.js — Safety analysis only:**
- Isolated zone detection
- Crime data aggregation
- Safety score calculation
- Warning generation
- DO NOT put UI code here

**Components — UI rendering and user interaction:**
- DOM manipulation
- User input handling
- Display formatting
- Component-specific state
- DO NOT put API calls directly here — use services

**Services — External integrations:**
- API calls
- Firebase operations
- Browser APIs (geolocation, notifications)
- Data transformation for external systems
- DO NOT put UI logic here

**Utils — Pure helper functions:**
- Data transformation
- Calculations
- Formatting
- Validation
- NO side effects, NO API calls, NO state modification

## Import Ordering

**Always import in this order:**

```javascript
// 1. Configuration
import { CONFIG } from './config.js';

// 2. Services
import { firebaseService } from './services/firebase-service.js';
import { locationService } from './services/location-service.js';

// 3. Utils
import { geocode } from './utils/geocoding.js';
import { formatDistance, formatDuration } from './utils/formatting.js';

// 4. Components
import { RoutePanel } from './components/route-panel.js';
import { SafetyBriefing } from './components/safety-briefing.js';

// 5. Core engines
import { safetyEngine } from './safety-engine.js';
```

**Within each category, alphabetical order.**

---

# COMPONENT RULES

## When to Create New Components

**Create a new component when:**
- The UI element appears in multiple places
- The element has significant internal state
- The element has 3+ event handlers
- The element is conceptually distinct (e.g., "Route Panel" vs "Safety Briefing")

**DO NOT create a new component when:**
- It's a one-time UI element used once
- It's a simple wrapper (just use a function)
- A similar component already exists (extend instead)

## Reusing Existing Components

**Before creating any UI component, check these first:**

1. **route-panel.js** — for any input forms
2. **safety-briefing.js** — for any informational displays
3. **map-controls.js** — for any map interaction buttons
4. **modal patterns** — for any overlay dialogs

**If a component is 70% similar to what you need, extend it:**

```javascript
// Good: Extend existing component
class ExtendedRoutePanel extends RoutePanel {
  addTrusteeField() {
    // Add new functionality
  }
}

// Bad: Copy-paste entire component with small changes
class RouteWithTrusteePanel {
  // Duplicated code from RoutePanel
}
```

## Component File Structure

**Every component file follows this structure:**

```javascript
// 1. Imports
import { CONFIG } from '../config.js';
import { formatDistance } from '../utils/formatting.js';

// 2. Component class
class ComponentName {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.state = {};
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    // DOM manipulation
  }
  
  attachEventListeners() {
    // Event binding
  }
  
  // Public methods
  updateData(newData) {}
  
  // Private methods
  _privateHelper() {}
}

// 3. Export
export { ComponentName };
```

## Props Interface Requirements

**Every component constructor must accept:**

```javascript
constructor(containerId, options = {})
```

**Options object always includes:**

```javascript
const defaultOptions = {
  theme: 'dark',        // Always support light/dark
  onUpdate: null,       // Callback for data changes
  onError: null,        // Callback for errors
  readOnly: false,      // Whether component is editable
  ...customOptions      // Component-specific options
};

this.options = { ...defaultOptions, ...options };
```

**Example:**

```javascript
class SafetyBriefing {
  constructor(containerId, options = {}) {
    const defaults = {
      theme: 'dark',
      showAlternatives: true,
      onRouteSelect: null,
      onError: null
    };
    
    this.options = { ...defaults, ...options };
  }
}
```


---

# STYLING RULES

## CSS/Tailwind Conventions

**We use plain CSS, NOT Tailwind.** (Despite earlier suggestions, this is simpler for the beginner developer.)

**CSS structure:**

```css
/* 1. CSS Variables */
:root {
  --color-primary: #0066ff;
  --color-bg: #0a0a0a;
  --color-surface: #111;
  --color-text: #fff;
  --color-text-secondary: #888;
  --color-success: #00ff88;
  --color-warning: #ffaa00;
  --color-danger: #ff0055;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --border-radius: 8px;
  --border-width: 1px;
}

/* 2. Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 3. Global styles */
body { }
a { }

/* 4. Layout components */
.app-container { }
.route-panel { }

/* 5. Utility classes */
.hidden { display: none; }
.loading { }
```

## Color Usage

**Reference DESIGN.md for all colors.**

**Primary colors:**
- `--color-primary` (#0066ff) — CTA buttons, active routes
- `--color-success` (#00ff88) — Safe routes, positive indicators
- `--color-warning` (#ffaa00) — Moderate risk, caution states
- `--color-danger` (#ff0055) — High risk, blocked elements

**Background colors:**
- `--color-bg` (#0a0a0a) — Page background
- `--color-surface` (#111) — Panels, cards
- `--color-surface-raised` (#1a1a1a) — Modals, overlays

**Text colors:**
- `--color-text` (#fff) — Primary text
- `--color-text-secondary` (#888) — Secondary/muted text
- `--color-text-tertiary` (#555) — Disabled/placeholder text

**NEVER hardcode hex values in component files. Always use CSS variables.**

```css
/* Good */
.safety-briefing {
  background: var(--color-surface);
  color: var(--color-text);
}

/* Bad */
.safety-briefing {
  background: #111;
  color: #fff;
}
```

## Spacing Conventions

**Use spacing variables consistently:**

```css
/* Component spacing */
.route-panel {
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}

/* Margin between sections */
.section + .section {
  margin-top: var(--spacing-lg);
}

/* Form inputs */
input {
  padding: var(--spacing-md) var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}
```

**Spacing scale:**
- `--spacing-xs` (4px) — Icon padding, tight gaps
- `--spacing-sm` (8px) — Form element gaps, list item spacing
- `--spacing-md` (16px) — Default component padding, button padding
- `--spacing-lg` (24px) — Section spacing, panel margins
- `--spacing-xl` (32px) — Major section dividers

---

# STATE MANAGEMENT

## When to Use Local vs Global State

**Local state (within component):**
- UI-only state (dropdown open/closed, input focus)
- Temporary form data before submission
- Component-specific loading states
- Animation states

```javascript
class RoutePanel {
  constructor() {
    this.state = {
      isExpanded: false,
      inputFocused: false,
      tempStartLocation: ''
    };
  }
}
```

**Global state (in app.js or service):**
- Current user data
- Active route and journey
- Blocked elements list
- Trustee relationships
- Map viewport state

```javascript
// app.js
const appState = {
  currentUser: null,
  activeRoute: null,
  activeJourney: null,
  blockedElements: [],
  trustees: []
};
```

**Firebase state (persisted remotely):**
- User account data
- Saved routes
- Block list
- Trustee connections
- Live journey data

## State Naming Conventions

```javascript
// Boolean states: is/has/should prefix
let isLoading = false;
let hasActiveRoute = true;
let shouldShowWarning = false;

// Counts: use explicit plural or count suffix
let isolatedZoneCount = 0;
let crimes = [];
let trusteeList = [];

// Current/Active entities: prefix with current/active
let currentUser = null;
let activeJourney = null;
let selectedRoute = null;

// Collections: always plural
let blockedElements = [];
let savedRoutes = [];
let trustees = [];
```

## Data Fetching Patterns

**ALWAYS follow this pattern for API calls:**

```javascript
async function fetchData() {
  // 1. Set loading state
  state.isLoading = true;
  state.error = null;
  updateUI();
  
  try {
    // 2. Make API call
    const response = await fetch(url);
    
    // 3. Check response
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // 4. Parse data
    const data = await response.json();
    
    // 5. Update state
    state.data = data;
    state.isLoading = false;
    
    // 6. Update UI
    updateUI();
    
    return data;
    
  } catch (error) {
    // 7. Handle error
    state.error = error.message;
    state.isLoading = false;
    updateUI();
    
    // 8. Log for debugging
    console.error('Fetch error:', error);
    
    throw error;
  }
}
```

**NEVER:**
- Make API calls without error handling
- Forget to set loading states
- Leave UI in loading state after error
- Swallow errors silently

---

# ERROR HANDLING

## How to Handle Errors

**All async functions MUST have try-catch:**

```javascript
// Good
async function geocode(location) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding failed');
    return await response.json();
  } catch (error) {
    console.error('Geocoding error:', error);
    showUserError('Could not find location. Please check spelling.');
    throw error;
  }
}

// Bad - no error handling
async function geocode(location) {
  const response = await fetch(url);
  return await response.json();
}
```

## Error Message Format

**User-facing errors:**

```javascript
// Good - clear, actionable
"Could not find location. Please check spelling and try again."
"Route calculation failed. Check your internet connection."
"Unable to load crime data. This area may not be covered."

// Bad - technical jargon
"Geocoding API returned 404"
"Promise rejected in route calculation"
"Crime data fetch timeout"
```

**Error severity levels:**

```javascript
const ErrorLevel = {
  INFO: 'info',      // Informational, no action needed
  WARNING: 'warning', // Something's not ideal but app still works
  ERROR: 'error',    // Feature failed but app still usable
  CRITICAL: 'critical' // App cannot function
};
```

**Display errors appropriately:**

```javascript
function showUserError(message, level = 'error') {
  const errorPanel = document.getElementById('error-panel');
  
  errorPanel.className = `error-panel ${level}`;
  errorPanel.textContent = message;
  errorPanel.classList.remove('hidden');
  
  // Auto-hide info and warnings after 5 seconds
  if (level !== 'error' && level !== 'critical') {
    setTimeout(() => {
      errorPanel.classList.add('hidden');
    }, 5000);
  }
}
```

## Logging Requirements

**Console logging levels:**

```javascript
// Development: verbose logging
console.log('Route calculation started', { start, end });

// Production: only errors and warnings
console.error('Critical: Firebase connection failed', error);
console.warn('Crime API rate limit approaching', { remaining: 5 });

// Debug information: use console.debug
console.debug('Safety score calculation', { 
  isolatedZones: 2, 
  crimes: 14, 
  score: 6.5 
});
```

**NEVER log sensitive data:**

```javascript
// Bad - exposes user data
console.log('User data:', userData);
console.log('API key:', CONFIG.API_KEY);

// Good - log safe metadata only
console.log('User loaded', { userId: user.id });
console.log('API call made', { endpoint: '/crimes', method: 'GET' });
```


---

# NEVER DO (Anti-patterns)

## Code Anti-patterns

**NEVER:**

1. **Hardcode API keys in source files**
   ```javascript
   // Never do this
   const API_KEY = '5b3ce3597851110001cf62489e8c9d6d';
   
   // Always do this
   import { CONFIG } from './config.js';
   const API_KEY = CONFIG.OPENROUTE_API_KEY;
   ```

2. **Make API calls without rate limiting**
   ```javascript
   // Never do this
   for (let point of points) {
     await fetch(crimeAPI + point);
   }
   
   // Always do this
   for (let point of points) {
     await fetch(crimeAPI + point);
     await sleep(200); // Rate limit
   }
   ```

3. **Mutate function parameters**
   ```javascript
   // Never do this
   function processRoute(route) {
     route.analyzed = true; // Mutating input
     route.score = calculateScore(route);
     return route;
   }
   
   // Always do this
   function processRoute(route) {
     return {
       ...route,
       analyzed: true,
       score: calculateScore(route)
     };
   }
   ```

4. **Use var for variable declarations**
   ```javascript
   // Never use var
   var userId = '123';
   
   // Always use const or let
   const userId = '123';
   let currentRoute = null;
   ```

5. **Create deeply nested callbacks**
   ```javascript
   // Never do this
   geocode(start, function(startCoords) {
     geocode(end, function(endCoords) {
       getRoute(startCoords, endCoords, function(route) {
         analyzeRoute(route, function(analysis) {
           displayBriefing(analysis);
         });
       });
     });
   });
   
   // Always use async/await
   async function planRoute() {
     const startCoords = await geocode(start);
     const endCoords = await geocode(end);
     const route = await getRoute(startCoords, endCoords);
     const analysis = await analyzeRoute(route);
     displayBriefing(analysis);
   }
   ```

6. **Write functions longer than 50 lines**
   - If a function exceeds 50 lines, break it into smaller functions
   - Each function should do ONE thing

7. **Use innerHTML for user input**
   ```javascript
   // Never do this - XSS vulnerability
   element.innerHTML = userInput;
   
   // Always do this
   element.textContent = userInput;
   ```

8. **Fetch data in a loop without Promise.all**
   ```javascript
   // Never do this - slow sequential requests
   for (let id of ids) {
     const data = await fetch(url + id);
   }
   
   // Always do this - parallel requests
   const promises = ids.map(id => fetch(url + id));
   const results = await Promise.all(promises);
   ```

9. **Store sensitive data in localStorage**
   ```javascript
   // Never do this
   localStorage.setItem('apiKey', apiKey);
   localStorage.setItem('userPassword', password);
   
   // Only store non-sensitive UI preferences
   localStorage.setItem('darkMode', 'true');
   localStorage.setItem('lastViewedRoute', routeId);
   ```

10. **Create components without cleanup**
    ```javascript
    // Never forget cleanup
    class Component {
      constructor() {
        this.interval = setInterval(this.update, 1000);
        // No cleanup method!
      }
    }
    
    // Always provide cleanup
    class Component {
      constructor() {
        this.interval = setInterval(this.update, 1000);
      }
      
      destroy() {
        clearInterval(this.interval);
        this.removeEventListeners();
      }
    }
    ```

---

# ALWAYS DO (Required patterns)

## Required Checks and Validations

**ALWAYS:**

1. **Validate user input before processing**
   ```javascript
   function planRoute(start, end) {
     // Always validate first
     if (!start || !end) {
       throw new Error('Both locations required');
     }
     
     if (typeof start !== 'string' || typeof end !== 'string') {
       throw new Error('Locations must be strings');
     }
     
     if (start.trim() === '' || end.trim() === '') {
       throw new Error('Locations cannot be empty');
     }
     
     // Now process
     return calculateRoute(start.trim(), end.trim());
   }
   ```

2. **Check if elements exist before manipulating DOM**
   ```javascript
   function updateBriefing(data) {
     const panel = document.getElementById('briefing-panel');
     
     // Always check element exists
     if (!panel) {
       console.error('Briefing panel not found');
       return;
     }
     
     // Now safe to manipulate
     panel.textContent = data.summary;
   }
   ```

3. **Provide loading states for async operations**
   ```javascript
   async function loadData() {
     // Always show loading
     showLoadingState(true);
     
     try {
       const data = await fetchData();
       displayData(data);
     } catch (error) {
       showError(error);
     } finally {
       // Always hide loading
       showLoadingState(false);
     }
   }
   ```

4. **Add defensive checks for API responses**
   ```javascript
   async function getCrimeData(location) {
     const response = await fetch(url);
     
     // Always check response validity
     if (!response.ok) {
       throw new Error(`HTTP ${response.status}`);
     }
     
     const data = await response.json();
     
     // Always check data structure
     if (!Array.isArray(data)) {
       throw new Error('Invalid crime data format');
     }
     
     // Always filter out invalid records
     return data.filter(crime => 
       crime.location && 
       crime.location.latitude && 
       crime.location.longitude
     );
   }
   ```

5. **Comment complex logic**
   ```javascript
   function calculateSafetyScore(zones, crimes, time) {
     let score = 10;
     
     // Deduct 2 points per isolated zone
     score -= zones.length * 2;
     
     // Extra penalty for night travel through isolated zones
     if (time === 'night' && zones.length > 0) {
       score -= 1;
     }
     
     // Crime density penalties (tiered)
     if (crimes > 20) score -= 3;
     else if (crimes > 10) score -= 2;
     else if (crimes > 5) score -= 1;
     
     // Clamp score to valid range [0, 10]
     return Math.max(0, Math.min(10, score));
   }
   ```

6. **Use semantic HTML**
   ```html
   <!-- Always use semantic tags -->
   <header>
     <h1>SafeTrack London</h1>
   </header>
   
   <nav>
     <a href="/">Map</a>
     <a href="/blocks">Blocks</a>
   </nav>
   
   <main>
     <section class="route-panel">
       <!-- Content -->
     </section>
   </main>
   
   <!-- Never use div soup -->
   <div class="header">
     <div class="title">SafeTrack London</div>
   </div>
   ```

7. **Make all buttons keyboard accessible**
   ```html
   <!-- Always include proper button semantics -->
   <button 
     type="button" 
     aria-label="Plan route"
     onclick="handleRouteSubmit()">
     Plan Route
   </button>
   
   <!-- Never use div as button -->
   <div onclick="handleRouteSubmit()">Plan Route</div>
   ```

8. **Debounce rapid user input**
   ```javascript
   // Always debounce search and input events
   let searchTimeout;
   
   searchInput.addEventListener('input', (e) => {
     clearTimeout(searchTimeout);
     searchTimeout = setTimeout(() => {
       performSearch(e.target.value);
     }, 300);
   });
   ```

9. **Clean up event listeners**
   ```javascript
   class Component {
     constructor() {
       // Always store bound handlers for cleanup
       this.handleClick = this.handleClick.bind(this);
       this.button.addEventListener('click', this.handleClick);
     }
     
     destroy() {
       // Always remove listeners when component destroyed
       this.button.removeEventListener('click', this.handleClick);
     }
   }
   ```

10. **Version control commits**
    ```bash
    # Always write clear commit messages
    git commit -m "Add isolated zone detection to safety engine"
    git commit -m "Fix: Crime data not loading for routes near borough boundaries"
    git commit -m "Refactor: Extract geocoding into separate utility module"
    
    # Never write vague commits
    git commit -m "updates"
    git commit -m "fix"
    git commit -m "changes"
    ```

---

# HANDLING UNCERTAINTY

## When to Ask for Clarification

**Ask before implementing if:**

1. **A feature requirement is ambiguous**
   - "Should the safety score update in real-time as the user moves?"
   - "When a trustee rejects an invitation, should we notify the sender?"
   - "What happens if both routes have the same safety score?"

2. **Multiple implementation approaches are valid**
   - "Should we use Firebase Realtime Database or Firestore for live journey tracking?"
   - "Store blocked elements client-side or server-side?"
   - "Calculate safety scores client-side or use Cloud Functions?"

3. **A technical constraint conflicts with a feature**
   - "OpenStreetMap doesn't have lighting data for this area - how should we handle it?"
   - "TFL API rate limit is 500 calls/hour - is this enough for expected usage?"
   - "User wants offline mode but Firebase requires connection - what's the priority?"

4. **Security or privacy implications exist**
   - "Should trustees see the full journey history or just live location?"
   - "Do we need user consent before sharing anonymized safe routes?"
   - "Should we store crime data locally or always fetch fresh?"

## When to Make Assumptions

**You MAY make assumptions and document them when:**

1. **UI/UX details not specified**
   - Assume dark mode is default (stated in constraints)
   - Assume mobile-first layout (stated in constraints)
   - Assume standard button sizes and spacing
   - **Document:** "Assumed 16px base font size for readability on mobile"

2. **Edge cases with obvious reasonable defaults**
   - If geocoding returns multiple results, use the first one
   - If crime data is unavailable, show "Data unavailable" not an error
   - If route calculation fails, offer walking directions as fallback
   - **Document:** "Assumed walking fallback when public transport route fails"

3. **Technical implementation details**
   - Use debouncing for search inputs (300ms standard)
   - Cache API responses for 5 minutes to reduce calls
   - Use localStorage for non-sensitive preferences
   - **Document:** "Implemented 300ms debounce on search input for performance"

4. **Reasonable inferences from context**
   - User wants fastest route when multiple equal-safety options exist