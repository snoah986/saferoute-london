# 0) How to use this plan

This document serves as both your **implementation roadmap** and **progress tracker** for SafeTrack London.

## Structure

Each phase contains clearly defined tasks with:
- **Status tracking** — track your progress as you build
- **What will be done** — clear objectives for each task
- **Screens/routes** — UI components and navigation
- **CRUD & tables** — database operations
- **Backend API** — Firebase operations, external API calls
- **Files/components** — specific files to create or modify

## Status Legend

- **Not started** — Task not yet begun
- **In progress** — Currently being worked on
- **Done** — Task completed and tested
- **Blocked** — Task cannot proceed (dependency or issue)

## Working with this plan

1. Start with Phase 0 (Foundation)
2. Complete tasks in order within each phase
3. Update status as you progress
4. Test thoroughly before marking as "Done"
5. Move to next phase only when current phase is complete

---


# Phase 0 — Foundation & Setup

**Goal:** Establish development environment, repository structure, and core technical infrastructure before building features.

---

## Task 0.1 — Development Environment Setup
Status: Not started

What will be done:
- Configure Spck Editor for mobile development workflow
- Set up Legion Go development environment when available
- Test file editing and preview on both devices
- Verify ability to switch between environments seamlessly

Screens/routes:
- N/A (environment setup only)

CRUD & tables:
- N/A

Backend API:
- N/A

Files/components:
- Initial project folder structure

---

## Task 0.2 — GitHub Repository & Version Control
Status: Not started

What will be done:
- Create public GitHub repository `safetrack-london`
- Initialize with comprehensive README documenting origin story
- Set up proper .gitignore for web project
- Establish commit message conventions
- Create initial commit with project structure

Screens/routes:
- N/A

CRUD & tables:
- N/A

Backend API:
- N/A

Files/components:
- `README.md` — project overview, origin story, technical stack
- `.gitignore` — exclude node_modules, API keys, IDE files
- `LICENSE` — appropriate open source license

---

## Task 0.3 — API Key Registration & Configuration
Status: Not started

What will be done:
- Register for OpenRouteService free API key
- Verify TFL Unified API access (no key required but test endpoints)
- Test UK Police API access (no authentication required)
- Test OpenStreetMap Overpass API access
- Create secure configuration file structure

Screens/routes:
- N/A

CRUD & tables:
- N/A

Backend API:
- OpenRouteService: routing queries
- TFL Unified API: test basic endpoint call
- UK Police API: test crime data retrieval
- Overpass API: test OSM data queries

Files/components:
- `config.js` — API keys and configuration constants
- `config.example.js` — template for other developers (no real keys)

---


## Task 0.4 — Firebase Project Setup
Status: Not started

What will be done:
- Create new Firebase project via console.firebase.google.com
- Enable Firebase Authentication with phone number and email/password providers
- Set up Firebase Realtime Database with initial security rules
- Configure Firebase Cloud Messaging for push notifications
- Add Firebase SDK to project via CDN

Screens/routes:
- N/A (backend setup)

CRUD & tables:
- Database structure initialization (empty, rules only)

Backend API:
- Firebase Authentication initialization
- Firebase Realtime Database connection
- Firebase Cloud Messaging setup

Files/components:
- `firebase-config.js` — Firebase initialization and configuration
- `firebase-rules.json` — Realtime Database security rules

---

## Task 0.5 — Core HTML/CSS Structure
Status: Not started

What will be done:
- Create base HTML structure with semantic markup
- Implement mobile-first responsive CSS
- Establish dark mode color palette and typography
- Create reusable CSS components (buttons, inputs, panels)
- Test on phone viewport sizes

Screens/routes:
- Basic shell of main navigation interface

CRUD & tables:
- N/A

Backend API:
- N/A

Files/components:
- `index.html` — base HTML structure
- `style.css` — core styles, dark mode theme, responsive layout
- `reset.css` — CSS reset for cross-browser consistency

---

## Task 0.6 — Mapping Foundation with Leaflet.js
Status: Not started

What will be done:
- Integrate Leaflet.js via CDN
- Initialize map centered on London (51.5074, -0.1278)
- Add dark mode tile layer from CartoDB
- Implement basic map controls and zoom
- Test touch interactions on mobile

Screens/routes:
- Main map view (full screen interactive map)

CRUD & tables:
- N/A

Backend API:
- N/A (client-side only)

Files/components:
- `map-init.js` — Leaflet initialization and configuration
- `index.html` — add Leaflet CDN links and map container div

---

## Task 0.7 — Deployment Pipeline Setup
Status: Not started

What will be done:
- Connect GitHub repository to Netlify
- Configure build settings for static site deployment
- Set up environment variables for API keys in Netlify dashboard
- Test deployment with basic map interface
- Verify live URL accessibility from phone

Screens/routes:
- All existing routes deployed live

CRUD & tables:
- N/A

Backend API:
- N/A

Files/components:
- `netlify.toml` — deployment configuration (optional)
- Update README with live URL once deployed

---

# Phase 1 — Core Routing & Safety Analysis

**Goal:** Implement the fundamental routing system and Pre-Journey Safety Briefing — the core differentiator from Google Maps.

---

## Task 1.1 — Basic A-to-B Routing
Status: Not started

What will be done:
- Implement geocoding for address/location input using Nominatim
- Integrate OpenRouteService for pedestrian routing
- Display route on map as colored polyline
- Show basic route information (distance, duration)
- Add start/end markers with custom icons

Screens/routes:
- Main map view with route input panel
- Route displayed as polyline overlay

CRUD & tables:
- N/A (client-side only)

Backend API:
- Nominatim Geocoding API: `GET /search` for address-to-coordinates conversion
- OpenRouteService Directions API: `POST /v2/directions/foot-walking` for route calculation

Files/components:
- `routing.js` — geocoding and route fetching functions
- `app.js` — route display logic
- `index.html` — add input fields for start/destination
- `style.css` — style route input panel

---

## Task 1.2 — Safety Analysis Engine Foundation
Status: Not started

What will be done:
- Create SafetyEngine class structure
- Implement safety score calculation algorithm
- Create weighting system for isolated zones, crime, lighting, time of day
- Build route bounding box generator for API queries
- Implement basic scoring tests with mock data

Screens/routes:
- N/A (backend logic only)

CRUD & tables:
- N/A

Backend API:
- N/A (internal calculations)

Files/components:
- `safety-engine.js` — core safety analysis class and methods
- `config.js` — add safety scoring weight constants

---


## Task 1.3 — Isolated Zone Detection
Status: Not started

What will be done:
- Build Overpass API query for OpenStreetMap isolated features
- Query for: unlit paths, underpasses, tunnels, parks, wooded areas
- Implement route-feature intersection detection
- Tag each zone with type (underpass/tunnel, unlit path, park, etc.)
- Generate human-readable zone descriptions

Screens/routes:
- N/A (data processing only)

CRUD & tables:
- N/A

Backend API:
- OpenStreetMap Overpass API: `POST /api/interpreter` with custom query for:
  - `way["highway"="path"]["lit"="no"]` — unlit paths
  - `way["highway"="footway"]["tunnel"="yes"]` — pedestrian tunnels
  - `way["amenity"="underpass"]` — underpasses
  - `way["leisure"="park"]["access"="yes"]` — public parks
  - `way["natural"="wood"]` — wooded areas
  - `way["man_made"="tunnel"]` — tunnels

Files/components:
- `safety-engine.js` — add `findIsolatedZones()` method
- `osm-helpers.js` — OpenStreetMap query building utilities

---

## Task 1.4 — Crime Data Integration
Status: Not started

What will be done:
- Implement UK Police API crime data fetching
- Sample route at regular intervals for crime queries
- Aggregate crime data along route corridor
- Deduplicate crime incidents using location coordinates
- Implement rate limiting (200ms between requests) per API guidelines
- Calculate crime density score

Screens/routes:
- N/A (data processing only)

CRUD & tables:
- N/A

Backend API:
- UK Police API: `GET /crimes-street/all-crime?lat={lat}&lng={lng}` for crime data by location
- Multiple parallel requests with rate limiting

Files/components:
- `safety-engine.js` — add `getCrimeAlongRoute()` method
- `crime-helpers.js` — crime data aggregation and deduplication logic

---

## Task 1.5 — Pre-Journey Safety Briefing UI
Status: Not started

What will be done:
- Design and build safety briefing panel component
- Display plain English safety summary
- Show isolated zone warnings with locations
- Display crime count and level (low/moderate/high)
- Show overall safety score (0-10) with color coding
- Generate recommendations based on score
- Add loading states during analysis

Screens/routes:
- Main map view with expandable safety briefing panel (below map or overlay)

CRUD & tables:
- N/A

Backend API:
- N/A (displays data from safety engine)

Files/components:
- `index.html` — add briefing panel HTML structure
- `style.css` — briefing panel styles with dark mode theme
- `app.js` — add `displaySafetyBriefing()` function
- `briefing-ui.js` — briefing formatting and display logic

---

## Task 1.6 — Time-of-Day Safety Adjustments
Status: Not started

What will be done:
- Detect current time and categorize as day/night/twilight
- Apply night penalty to isolated zone scores (configurable in config.js)
- Adjust safety recommendations based on time
- Add time-sensitive warning messages ("Travelling at night — extra caution")
- Allow user to set custom night mode start hour (default 9pm)

Screens/routes:
- Settings panel (add to existing UI or create modal)

CRUD & tables:
- User preferences table:
  - userId (string)
  - nightModeStartHour (number, default 21)

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/preferences/nightModeStartHour` — read/write user preference

Files/components:
- `safety-engine.js` — add `getTimeCategory()` and time-based scoring
- `config.js` — add `NIGHT_START_HOUR` and `NIGHT_END_HOUR` constants
- `settings-ui.js` — settings panel for user preferences
- `index.html` — add settings button/modal

---

## Task 1.7 — Alternative Route Generation
Status: Not started

What will be done:
- Request alternative route from OpenRouteService with `alternative_routes` parameter
- Run safety analysis on alternative route
- Compare safety scores between primary and alternative
- Display comparison in briefing ("Safer alternative available — adds 4 minutes, avoids underpass")
- Allow user to switch to alternative route with one tap

Screens/routes:
- Briefing panel — add alternative route comparison section
- Map view — toggle between primary and alternative route display

CRUD & tables:
- N/A

Backend API:
- OpenRouteService Directions API: `POST /v2/directions/foot-walking` with `alternative_routes=1` parameter

Files/components:
- `routing.js` — add `getAlternativeRoute()` function
- `app.js` — add route switching logic
- `briefing-ui.js` — add alternative route display
- `style.css` — style alternative route differently on map (e.g., dashed line)

---

# Phase 2 — Personal Avoidance Engine

**Goal:** Build the Dynamic Personal Avoidance Engine — allowing users to permanently block specific roads, bus routes, stops, stations, and areas.

---

## Task 2.1 — User Authentication
Status: Not started

What will be done:
- Implement Firebase phone number authentication flow
- Add email/password authentication as fallback
- Create username registration during onboarding
- Build login/signup screens with dark mode UI
- Store authenticated user state in app
- Implement logout functionality

Screens/routes:
- `/login` — login screen (phone or email/password)
- `/signup` — account creation with username
- `/phone-verify` — phone verification code entry

CRUD & tables:
- Users table (Firebase Authentication manages this, but we store additional data):
  - Create user profile on signup
  - Read user profile on login
  - Update username

Backend API:
- Firebase Authentication:
  - `firebase.auth().signInWithPhoneNumber()` — phone auth
  - `firebase.auth().createUserWithEmailAndPassword()` — email auth
  - `firebase.auth().onAuthStateChanged()` — auth state listener
- Firebase Realtime Database:
  - `users/{userId}` — create/read/update user profile

Files/components:
- `auth.js` — Firebase authentication logic
- `login.html` — login screen
- `signup.html` — signup screen
- `auth-ui.js` — UI logic for auth screens
- `style.css` — auth screen styles

---

## Task 2.2 — Block Creation via Tap-and-Hold
Status: Not started

What will be done:
- Implement long-press gesture on map (detect 500ms+ touch)
- Show context menu on long-press with "Block This Road" option
- Extract road/feature information from map layer at touch point
- Create block entry with OpenStreetMap way ID
- Save block to Firebase under user's blocks collection
- Show visual confirmation (toast/snackbar) when block added

Screens/routes:
- Main map view — add long-press interaction

CRUD & tables:
- BlockedElements table:
  - Create new block entry
  - Fields: blockId, userId, elementType (road), elementId (OSM way ID), elementName, blockType (permanent), createdAt

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/blocks/{blockId}` — create new block
- OpenStreetMap Overpass API:
  - Query to get road/feature details at coordinates

Files/components:
- `map-interactions.js` — long-press detection and context menu
- `blocks.js` — block creation and management logic
- `app.js` — integrate block creation into map
- `style.css` — context menu styles

---

## Task 2.3 — Block by Search (Roads, Bus Routes, Stops, Stations)
Status: Not started

What will be done:
- Build search interface for finding blockable elements
- Implement search for: road names (via Nominatim), bus route numbers (via TFL API), bus stops (via TFL API), tube/overground stations (via TFL API)
- Display search results with "Block" button next to each
- Save block with appropriate elementType and elementId
- Show blocked elements in search results (visual indicator)

Screens/routes:
- `/search` — search and block screen (can be modal or separate page)

CRUD & tables:
- BlockedElements table:
  - Create block for searched element
  - Read existing blocks to show in search results

Backend API:
- Nominatim: `GET /search?q={query}` for road names
- TFL Unified API:
  - `GET /Line/Mode/bus/Route` for bus routes
  - `GET /StopPoint/Search/{query}` for bus stops
  - `GET /StopPoint/Mode/tube` for tube stations
- Firebase Realtime Database:
  - `users/{userId}/blocks` — create new block

Files/components:
- `search.html` — search interface
- `search.js` — search logic for different element types
- `blocks.js` — add search-based block creation
- `style.css` — search UI styles

---


## Task 2.4 — Geographic Area Blocking
Status: Not started

What will be done:
- Implement circle drawing tool on map (tap center, drag to set radius)
- Implement polygon drawing tool for custom shapes (optional, circle is MVP)
- Implement postcode blocking via search
- Store area geometry as GeoJSON in Firebase
- Pass area blocks as avoid polygons to OpenRouteService
- Show blocked areas on map with semi-transparent overlay

Screens/routes:
- Main map view — add "Draw Block Area" button/mode
- Search screen — add postcode blocking

CRUD & tables:
- BlockedElements table:
  - Create area block with geometry field (GeoJSON)
  - elementType: "area" or "postcode"

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/blocks/{blockId}` — store with geometry field
- OpenRouteService:
  - Pass blocked areas as `options.avoid_polygons` parameter
- Nominatim:
  - Geocode postcode to bounding box coordinates

Files/components:
- `area-blocking.js` — circle/polygon drawing logic
- `blocks.js` — area block creation
- `map-interactions.js` — integrate drawing mode into map
- `style.css` — blocked area overlay styles

---

## Task 2.5 — Time-Sensitive Blocks
Status: Not started

What will be done:
- Add time parameters to block creation UI (start hour, end hour)
- Validate time ranges (e.g., "9pm to 6am")
- Filter active blocks based on current time before routing
- Show time-sensitive blocks differently in blocks list ("Active after 9pm")
- Allow user to edit time parameters

Screens/routes:
- Block creation modal — add time picker inputs
- Blocks management screen — show time restrictions

CRUD & tables:
- BlockedElements table:
  - Add fields: startHour (number 0-23), endHour (number 0-23)
  - Update block creation to include time parameters

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/blocks/{blockId}` — store with time fields

Files/components:
- `blocks.js` — add time-based filtering logic
- `block-ui.js` — time picker component
- `routing.js` — filter blocks by current time before applying to route

---

## Task 2.6 — Temporary & Community Blocks
Status: Not started

What will be done:
- Add "Temporary Block" option to block creation (2 hour expiry)
- Add "Share with Community" checkbox for temporary blocks
- Implement auto-expiry by setting expiresAt timestamp
- Create community blocks collection (anonymized, no user attribution)
- Display community blocks on map (different color than personal blocks)
- Implement background job to clean up expired blocks (Cloud Function or client-side check)

Screens/routes:
- Block creation modal — add temporary/community options
- Map view — show community blocks layer

CRUD & tables:
- BlockedElements table:
  - Add fields: expiresAt (timestamp), isSharedWithCommunity (boolean)
- CommunityBlocks table (separate from user blocks):
  - blockId, elementType, elementId, geometry, expiresAt, reportedAt
  - No userId (anonymized)

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/blocks/{blockId}` — personal blocks with expiry
  - `communityBlocks/{blockId}` — shared temporary blocks
  - Query for community blocks in area: read communityBlocks, filter by non-expired and within map bounds
- Firebase Cloud Function (optional for cleanup):
  - Scheduled function to delete expired blocks every hour

Files/components:
- `blocks.js` — add temporary block logic and expiry handling
- `community-blocks.js` — fetch and display community blocks
- `app.js` — integrate community blocks layer
- `cleanup-function.js` — Firebase Cloud Function for expired block cleanup (if using)

---

## Task 2.7 — Blocks Management Screen
Status: Not started

What will be done:
- Build full-screen blocks management interface
- List all user's blocks (roads, routes, stops, areas)
- Show block details: what it is, when added, type (permanent/temporary/time-sensitive)
- Group blocks by type for easier navigation
- Add "Remove Block" button for each entry (swipe-to-delete on mobile)
- Show active vs. inactive time-sensitive blocks
- Add search/filter for finding specific blocks

Screens/routes:
- `/blocks` — blocks management screen

CRUD & tables:
- BlockedElements table:
  - Read all blocks for current user
  - Delete specific block by blockId

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/blocks` — read all blocks
  - `users/{userId}/blocks/{blockId}` — delete block

Files/components:
- `blocks-manager.html` — blocks management screen
- `blocks-manager.js` — UI logic for listing and deleting blocks
- `style.css` — blocks list styles

---

## Task 2.8 — Route Calculation with Personal Avoidances
Status: Not started

What will be done:
- Fetch user's active blocks before every route calculation
- Filter blocks by current time (apply only time-sensitive blocks that are active now)
- Convert road blocks to avoid waypoints for OpenRouteService
- Convert area blocks to avoid polygons
- Handle TFL-specific blocks separately (filter bus routes/stops from TFL API results)
- Display "Route respects your avoidances" confirmation in briefing

Screens/routes:
- Main map view — routing now respects all blocks

CRUD & tables:
- BlockedElements table:
  - Read user blocks before routing

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/blocks` — fetch all active blocks
- OpenRouteService:
  - `POST /v2/directions/foot-walking` with `options.avoid_features`, `options.avoid_polygons` parameters
- TFL Unified API:
  - Filter results by blocked bus routes and stops before displaying

Files/components:
- `routing.js` — integrate block filtering into route calculation
- `blocks.js` — add `getActiveBlocksForRouting()` function
- `tfl-integration.js` — filter TFL results by blocked elements

---

# Phase 3 — Real-Time TFL Integration

**Goal:** Integrate live TFL bus/tube data, last service warnings, and real-time disruption alerts.

---

## Task 3.1 — TFL API Integration Setup
Status: Not started

What will be done:
- Register for TFL Unified API app key at api.tfl.gov.uk
- Test basic API endpoints (line status, stop arrivals)
- Implement rate limiting and caching (TFL has rate limits)
- Build error handling for API failures
- Create TFL API service layer

Screens/routes:
- N/A (backend setup)

CRUD & tables:
- N/A

Backend API:
- TFL Unified API:
  - `GET /Line/Mode/{mode}/Status` — line status
  - `GET /StopPoint/{stopId}/Arrivals` — live arrivals
  - Test endpoints with registered app key

Files/components:
- `config.js` — add TFL API key
- `tfl-service.js` — TFL API wrapper with rate limiting

---

## Task 3.2 — Live Bus Arrival Times
Status: Not started

What will be done:
- Identify bus stops along route using TFL StopPoint API
- Fetch live arrival times for each stop
- Display arrivals in route briefing ("Next bus in 4 minutes")
- Show countdown timer for imminent arrivals
- Update arrivals every 30 seconds when user is viewing route
- Handle "no arrivals" case (show scheduled times as fallback)

Screens/routes:
- Route briefing panel — add "Bus Arrivals" section

CRUD & tables:
- N/A (real-time data, not stored)

Backend API:
- TFL Unified API:
  - `GET /StopPoint/{stopId}/Arrivals` for each stop on route
  - `GET /Line/{lineId}/Arrivals/{stopId}` for specific line arrivals

Files/components:
- `tfl-service.js` — add `getLiveArrivals()` method
- `briefing-ui.js` — display live arrival times
- `app.js` — add auto-refresh for arrivals

---

## Task 3.3 — Last Service Alerts
Status: Not started

What will be done:
- Query TFL API for last departure times for buses and tubes on route
- Calculate time until last service
- Display last service times prominently in briefing
- Send push notification 20 minutes before last service (requires Firebase Cloud Messaging setup)
- Suggest alternative route if approaching last service time

Screens/routes:
- Route briefing panel — add "Last Services" warning section
- Push notification — "Last bus in 20 minutes"

CRUD & tables:
- N/A

Backend API:
- TFL Unified API:
  - `GET /Line/{lineId}/Timetable/{fromStopId}/to/{toStopId}` — timetable data
  - Parse for last service of the day
- Firebase Cloud Messaging:
  - Send push notification to user's device token

Files/components:
- `tfl-service.js` — add `getLastServiceTimes()` method
- `notifications.js` — push notification logic
- `briefing-ui.js` — display last service warnings

---

## Task 3.4 — Tube Line Status
Status: Not started

What will be done:
- Fetch live status for all tube lines
- Display disruptions in route briefing if route uses affected line
- Show severity (good service, minor delays, severe delays, etc.)
- Link to TFL status page for details
- Auto-refresh status every 2 minutes

Screens/routes:
- Route briefing panel — add "Tube Status" section (if route includes tube)

CRUD & tables:
- N/A

Backend API:
- TFL Unified API:
  - `GET /Line/Mode/tube/Status` — all tube line statuses
  - `GET /Line/{lineId}/Status` — specific line status

Files/components:
- `tfl-service.js` — add `getTubeLineStatus()` method
- `briefing-ui.js` — display tube status

---

## Task 3.5 — Cancelled/Delayed Bus Notifications
Status: Not started

What will be done:
- Compare expected arrival time vs. live arrival time
- Detect significant delays (>10 minutes) or cancellations (no live data)
- Show prominent alert in briefing ("⚠️ Bus 18 delayed 12 minutes")
- Suggest alternative bus routes automatically
- Send push notification for delays on watched routes

Screens/routes:
- Route briefing panel — delay/cancellation alerts
- Push notification — "Bus 18 delayed — alternative available"

CRUD & tables:
- N/A

Backend API:
- TFL Unified API:
  - Compare scheduled vs. live arrival times from arrivals endpoint
- Firebase Cloud Messaging:
  - Push notification for delays

Files/components:
- `tfl-service.js` — add delay detection logic
- `notifications.js` — delay notification
- `briefing-ui.js` — display delay alerts

---

## Task 3.6 — TFL Integration with Personal Avoidances
Status: Not started

What will be done:
- Filter bus routes by user's blocked routes
- Filter stops by user's blocked stops
- Filter stations by user's blocked stations
- Only show TFL options that respect user blocks
- Display message in briefing: "Route respects your avoidances"

Screens/routes:
- Route briefing panel — confirmation of respected avoidances

CRUD & tables:
- BlockedElements table:
  - Read user blocks, filter by TFL-related elementTypes (bus_route, bus_stop, tube_station)

Backend API:
- Firebase Realtime Database:
  - `users/{userId}/blocks` — fetch TFL-related blocks
- TFL Unified API:
  - Filter API results client-side by blocked elements

Files/components:
- `tfl-service.js` — add block filtering before returning results
- `blocks.js` — helper to get TFL blocks
- `briefing-ui.js` — show avoidance confirmation

---

# Phase 4 — Trustee Journey Sharing

**Goal:** Build live location sharing with trusted contacts (trustees) for night travel and flagged zones.

---

## Task 4.1 — Trustee Relationship Management
Status: Not started

What will be done:
- Build UI to add trustees by phone number or username
- Search for users by username in Firebase
- Send trustee invitation (push notification or in-app)
- Accept/decline trustee invitations
- List all trustees (who can see my location)
- List all users I'm trustee for (whose location I can see)
- Remove trustee relationships

Screens/routes:
- `/trustees` — trustee management screen
- `/add-trustee` — search and invite trustees

CRUD & tables:
- TrusteeRelationships table:
  - Create relationship (pending status initially)
  - Update status (pending → active)
  - Read all relationships for user
  - Delete relationship (remove trustee)

Backend API:
- Firebase Realtime Database:
  - `trusteeRelationships/{relationshipId}` — create/read/update/delete
  - `users/{userId}/username` — search users by username
- Firebase Cloud Messaging:
  - Send trustee invitation notification

Files/components:
- `trustees-manager.html` — trustee management screen
- `trustees.js` — trustee relationship logic
- `user-search.js` — username search
- `style.css` — trustee UI styles

---


## Task 4.2 — Live Location Tracking
Status: Not started

What will be done:
- Implement browser Geolocation API for position tracking
- Set up location update interval (every 10 seconds during active journey)
- Store live position in Firebase Realtime Database under LiveJourneys
- Implement location permission request with clear explanation
- Handle location permission denial gracefully
- Show user's live position on their own map during journey

Screens/routes:
- Main map view — show user's live position (blue dot)

CRUD & tables:
- LiveJourneys table:
  - Create journey when sharing starts
  - Update currentLocation field every 10 seconds

Backend API:
- Browser Geolocation API:
  - `navigator.geolocation.watchPosition()` for continuous tracking
- Firebase Realtime Database:
  - `liveJourneys/{journeyId}/currentLocation` — update location

Files/components:
- `location-tracking.js` — geolocation API logic
- `live-journey.js` — journey creation and updates
- `app.js` — integrate live tracking into journey flow

---

## Task 4.3 — Journey Sharing Activation
Status: Not started

What will be done:
- Add "Start Sharing" button to route briefing
- Implement three sharing modes: Always on for night journeys, Manual activation, Automatic in flagged zones
- Store user's default sharing mode preference
- Create LiveJourney entry in Firebase when sharing starts
- Send quiet notification to all trustees ("User started journey to [destination]")
- Show "Sharing Active" indicator on user's screen

Screens/routes:
- Route briefing panel — add "Start Sharing" button
- Settings — sharing mode preference
- Active journey view — sharing status indicator

CRUD & tables:
- LiveJourneys table:
  - Create journey entry with: userId, startLocation, endLocation, plannedRoute, startedAt, estimatedArrival, status (active)
- User preferences:
  - defaultSharingMode field

Backend API:
- Firebase Realtime Database:
  - `liveJourneys/{journeyId}` — create journey
  - `users/{userId}/preferences/defaultSharingMode` — read preference
- Firebase Cloud Messaging:
  - Notify trustees when journey starts

Files/components:
- `live-journey.js` — journey activation logic
- `briefing-ui.js` — add sharing controls
- `notifications.js` — trustee journey start notification

---

## Task 4.4 — Trustee Live View
Status: Not started

What will be done:
- Build trustee dashboard showing all active journeys they can view
- Display live map with user's moving position