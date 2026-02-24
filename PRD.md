# SafeTrack London - Product Requirements Document

## 1. Overview

### What SafeTrack London Is

SafeTrack London is a London-specific navigation and journey safety application designed for young people who rely on public transport and active travel (walking, cycling) to navigate the city, particularly at night. Unlike general navigation apps that optimize solely for speed and distance, SafeTrack London provides comprehensive safety context before journeys begin.


### Why It Exists

SafeTrack London was conceived from real-world navigation failures. The founder experienced two critical incidents where Google Maps routed them through dangerous isolated areas at night:

1. **Brent River Park Underpass (3am)** - A pitch-black, completely isolated tunnel with no lighting, passing traffic, or other people
2. **Arnos Park, Southgate (night)** - An isolated dark park in an area with personal safety significance

In both cases, one piece of information would have changed everything: *"This route passes through an isolated unlit area. Alternative available."* That warning does not exist in any mainstream navigation app. SafeTrack London exists to provide it.

### Target Users

**Primary Users:**
- Young people aged 16-28 living in or travelling through London
- Students, workers, people travelling home after nights out
- Cyclists, late shift workers, regular public transport users
- People who have experienced navigation app failures or know someone who has

**User Problems:**
- Being routed through isolated, unlit, or unsafe areas without warning
- Unreliable bus times causing extended waits at potentially unsafe stops
- No ability to permanently avoid specific roads, stops, or areas
- No awareness of last service times until stranded
- No way to share live location with trusted contacts during journeys

### Key Value Proposition

**"Navigate safer, not just faster"**

SafeTrack London tells you everything about your route that Google Maps doesn't: isolated zones, unlit areas, real-time bus data, crime context, and provides live location sharing with trusted contacts. It permanently remembers every road, stop, and area you want to avoid.


## 2. Goals and Non-Goals

### In Scope (What We ARE Building)

**Core Safety Intelligence:**
- Pre-journey safety briefings identifying all isolated zones, unlit areas, and crime data
- Time-aware safety scoring (2am is different from 2pm)
- Plain English safety summaries before navigation starts

**London-Specific Transport Integration:**
- Real-time TfL bus arrivals (not scheduled times)
- Last service warnings 20 minutes before final departure
- Live tube line status and disruption alerts

**Personal Control:**
- Permanent blocking of specific roads, bus routes, stops, stations, or areas
- Time-sensitive blocks (e.g., "avoid after 9pm")
- Block management interface

**Trust Network:**
- Live location sharing with designated trustees during journeys
- Timestamped journey feeds
- Automatic alerts if user doesn't arrive within expected timeframe

**Web-First Implementation:**
- Mobile-responsive web app (HTML, CSS, JavaScript)
- Works on any phone through browser
- No native app required for v1

### Out of Scope (What We Are NOT Building)

**Not in v1:**
- Native iOS/Android apps (web app only initially)
- Turn-by-turn voice navigation (text-based routing only)
- Multi-city support (London only)
- Paid features or subscription models
- Social features beyond trustee sharing
- Integration with ride-sharing services
- Offline mode (requires internet connection)

**Explicitly NOT:**
- A Google Maps competitor at global scale
- A general-purpose navigation app
- A crime reporting platform
- A social network
- An emergency services replacement

**Future Considerations (Post-v1):**
- Native mobile apps for better performance
- Expansion to other UK cities
- Community safe route recommendations
- Integration with local council safety initiatives
- Apple Watch / wearable support


## 3. Features (DETAILED)

### Feature: Pre-Journey Route Safety Briefing

**Priority:** Must-have

**Description:**
Before the user starts any journey, the app generates a comprehensive plain English safety briefing containing: journey time/distance, number and location of isolated zones (parks, underpasses, unlit pathways), lighting assessment for each section, safety score out of 10, whether route matches personal avoidance list, alternative route option if safer one exists.

**Example Output:**
```
This is a 23 minute journey. One isolated section near the start — a 90 second walk through Brent River Park underpass. Well lit for the remainder. Last bus at 11.47pm. Overall safety score 6 out of 10. Safer alternative available, 4 minutes longer.
```

**User Stories:**
- As a user planning a journey, I want to see all safety concerns before I start so I can make an informed decision
- As a night traveller, I want to know about isolated zones and unlit areas on my route
- As a user, I want to see a safety score and alternative routes so I can choose the safest option
- As a local who knows certain areas, I want the app to validate or challenge my route choices with data

**Acceptance Criteria:**
- [ ] Briefing displays before navigation begins, not during journey
- [ ] All isolated zones on route are identified with specific locations
- [ ] Safety score is calculated consistently and displayed as X/10
- [ ] Alternative routes are automatically generated if safety score < 7
- [ ] Briefing appears in under 5 seconds after route generation
- [ ] Text is readable at mobile font sizes without zooming
- [ ] User can expand/collapse detailed warnings

**How to Implement:**

**Frontend:**
- Component: `SafetyBriefingPanel` displays analysis results
- Shows in modal overlay before route starts
- Includes: distance, duration, isolated zones list, crime count, safety score, warnings array, recommendation text
- "Show Alternative" button if alternative exists
- "Start Navigation" button to proceed
- State management: store `currentAnalysis` object globally

**Backend:**
- `SafetyEngine.analyzeRoute()` function receives route geometry and properties
- Returns structured analysis object:
```javascript
{
  distance: "2.3",
  duration: 23,
  isolatedZones: [{type, name, tags}],
  crimeCount: 14,
  safetyScore: 6.5,
  timeOfDay: "night",
  warnings: ["⚠️ message"],
  recommendation: "✅ / ⚠️ / 🔴 message"
}
```

**APIs Used:**
1. **OpenStreetMap via Overpass API** - identifies isolated zones using OSM tags:
   - `way["highway"="path"]["lit"="no"]` - unlit paths
   - `way["highway"="footway"]["tunnel"="yes"]` - tunnels
   - `way["amenity"="underpass"]` - underpasses
   - `way["leisure"="park"]` - parks
   - `way["natural"="wood"]` - wooded areas

2. **UK Police API** - crime data along route corridor:
   - Sample 5 points along route
   - Query crimes at each point: `crimes-street/all-crime?lat={lat}&lng={lng}`
   - Deduplicate crimes by ID
   - Rate limit: 200ms between requests

3. **London Datastore** (where available) - street lighting data
   - Fallback: use time-of-day + OSM `lit=no` tags

**Validation:**
- Route must have valid geometry (array of coordinates)
- Coordinates must be within London bounding box
- Isolated zone checks only run if Overpass API responds in < 10 seconds
- Crime checks timeout after 30 seconds total
- If any check fails, display partial analysis with warning

**Error Handling:**
- **Overpass API timeout:** Display "Unable to check isolated zones" warning, continue with crime data
- **Police API failure:** Display "Crime data unavailable" warning, calculate score without crime factor
- **Invalid route geometry:** Show error "Route cannot be analyzed, please try different locations"
- **Network failure:** Cache last successful analysis for 5 minutes, show with "Using cached data" notice

**Safety Score Calculation:**
```javascript
Starting score: 10

Deductions:
- Isolated zones: -2 per zone
- Isolated zones at night: -1 additional
- Crime count >20: -3
- Crime count 11-20: -2
- Crime count 6-10: -1
- Travelling at night: -0.5

Final score = Math.max(0, Math.min(10, calculated_score))
```

**Edge Cases:**
- Very short routes (<500m): Skip isolated zone analysis, focus on immediate area crime data
- Routes with no data: Default to neutral score 7/10 with "Insufficient data" warning
- Multiple isolated zones in quick succession: Group into single warning "Extended isolated section"
- User already in flagged area when planning: Alert "You are currently in a flagged zone"

**Dependencies:**
- OpenRouteService route generation must complete first
- Requires active internet connection
- Browser geolocation permission if time-of-day detection needs current location

---

### Feature: Real-Time TfL Integration

**Priority:** Must-have

**Description:**
Shows live bus arrival times (not scheduled), alerts when bus is cancelled or delayed, shows last service time for every bus and tube, sends proactive alert 20 minutes before last service departs, calculates safest alternative if last service is missed, shows live tube line status.

**User Stories:**
- As a bus user, I want to see actual live arrival times not scheduled times so I know if my bus is coming
- As a late-night traveller, I want to be warned before the last bus leaves so I'm never stranded
- As a commuter, I want to know about tube delays before I reach the station
- As someone waiting at a stop, I want to know immediately if my bus is cancelled

**Acceptance Criteria:**
- [ ] Live arrival times update every 30 seconds
- [ ] Cancelled buses display with clear "CANCELLED" badge
- [ ] Last service time shows for all routes on journey
- [ ] 20-minute warning triggers automatically (push notification if permitted)
- [ ] Alternative route calculates automatically if last service missed
- [ ] Tube line status displays with severity indicators (Good Service, Minor Delays, Severe Delays, Suspended)
- [ ] Disruption descriptions are shown in plain English

**How to Implement:**

**Frontend:**
- Component: `TfLStatusPanel` displays bus/tube information
- Shows in route planning screen and during active navigation
- Auto-refreshes every 30 seconds using `setInterval()`
- Visual indicators: 🟢 On time, 🟡 Delayed, 🔴 Cancelled, ⚠️ Last service soon
- Notification permission requested on first route plan

**Backend:**
- `TfLService.getBusArrivals(stopId)` - gets live arrivals for specific stop
- `TfLService.getLineStatus(lineIds)` - gets tube line statuses
- `TfLService.getLastServiceTime(routeId, stopId)` - extracts last departure from timetable
- `TfLService.calculateAlternative(start, end)` - generates walking/cycling route if last service missed

**TfL API Endpoints:**
```
Base: https://api.tfl.gov.uk

1. Live bus arrivals:
GET /StopPoint/{stopId}/Arrivals
Returns: Array of arrivals with timeToStation, vehicleId, destinationName

2. Line status:
GET /Line/{lineIds}/Status
Returns: Array of line statuses with statusSeverity, statusSeverityDescription, reason

3. Stop information:
GET /StopPoint/{stopId}
Returns: Stop details including lat/lng, stop name, lines serving

4. Journey planning:
GET /Journey/JourneyResults/{from}/to/{to}
Returns: Journey options including last service times

All require: ?app_key={YOUR_KEY}
```

**Validation:**
- Stop IDs must be valid TfL format (numeric for buses, text+numeric for tubes)
- Line IDs must match TfL line names exactly (case-sensitive)
- Refresh rate maximum 30 seconds (don't exceed TfL rate limits)
- Cache responses for 20 seconds to avoid duplicate requests

**Error Handling:**
- **TfL API down:** Display "Live data temporarily unavailable, showing cached data" with timestamp
- **Invalid stop ID:** Show "Stop not found, please check route"
- **Rate limit exceeded:** Back off to 60-second refresh interval, display warning
- **Network timeout:** Retry once after 5 seconds, then show error state

**Last Service Alert Logic:**
```javascript
Current time: 23:30
Last service: 23:50

If (lastService - currentTime) <= 20 minutes:
  - Display prominent warning banner
  - Trigger push notification if permitted
  - Calculate alternative walking/cycling route
  - Show: "Last bus in 20 minutes. Alternative route ready."

If (currentTime > lastService):
  - Remove bus from route options
  - Auto-switch to walking/cycling
  - Show: "Last service departed. Showing walking route."
```

**Edge Cases:**
- Bus arrives earlier than expected: Show "Bus arriving NOW" in red
- Multiple buses on same route: Display next 3 arrivals
- Bus shows 0 minutes arrival time: Change to "ARRIVING"
- 24-hour routes: Skip last service warning
- Night bus alternatives: Suggest N-routes if available after hours
- Stop serves 10+ routes: Show dropdown to select specific routes to monitor

**Dependencies:**
- TfL API key (free registration required)
- Routes must include TfL stop points
- Browser supports push notifications (graceful degradation if not)
- Clock synchronization with TfL servers (use server time in API response)

---

### Feature: Dynamic Personal Avoidance Engine

**Priority:** Must-have

**Description:**
Users can permanently or temporarily block any road, bus route, bus stop, tube station, or geographic area. App never routes through blocked elements again. Supports: specific roads (tap and hold), specific bus routes by number, specific bus stops, tube/overground stations, geographic areas/postcodes (draw circle or select postcode), time-sensitive blocks (e.g. after 9pm only), temporary community blocks (shared anonymously, expire after 2 hours).

**User Stories:**
- As a user, I want to permanently block roads I know are unsafe so the app never routes me there
- As a local, I want to block specific bus stops or routes I want to avoid
- As a user, I want time-sensitive blocks so certain areas are avoided only at night
- As a community member, I want to temporarily share live incidents with other users
- As someone who experienced harassment at a location, I want to block that exact spot forever

**Acceptance Criteria:**
- [ ] User can block roads by tap-and-hold on map
- [ ] User can block by searching for road/route/stop name
- [ ] Blocks persist across sessions (stored in Firebase)
- [ ] Blocked elements never appear in generated routes
- [ ] User can view all blocks in management screen
- [ ] User can remove blocks with one tap
- [ ] Time-sensitive blocks only apply during specified hours
- [ ] Community blocks expire automatically after 2 hours
- [ ] Alternative route is auto-calculated when blocking during active navigation

**How to Implement:**

**Frontend:**
- Component: `BlockManager` handles all blocking UI
- Three blocking methods:
  1. **Tap-and-hold on map:** Shows context menu with "Block this road/area" option
  2. **Search interface:** Search bar with autocomplete, "Block" button next to results
  3. **During navigation:** "Avoid" button in nav bar, immediately reroutes

- Component: `BlockList` displays all active blocks
  - Grouped by type (Roads, Bus Routes, Stations, Areas)
  - Shows: element name, block type (permanent/temporary/time-sensitive), creation date
  - Swipe-to-delete or tap "Remove" button

**Backend/Database:**
- **BlockedElement table:**
```javascript
{
  blockId: "unique_id",
  userId: "user_id",
  elementType: "road | bus_route | bus_stop | tube_station | area | postcode",
  elementId: "osm_way_id | tfl_route_code | stop_id | postcode",
  elementName: "Human readable name",
  blockType: "permanent | temporary | time_sensitive | community",
  startHour: null | 0-23, // for time_sensitive
  endHour: null | 0-23,   // for time_sensitive
  expiresAt: null | timestamp, // for temporary/community
  notes: "User's reason for blocking",
  geometry: null | GeoJSON, // for area blocks
  createdAt: timestamp
}
```

**Routing Integration:**

OpenRouteService accepts `avoid_polygons` parameter:
```javascript
POST https://api.openrouteservice.org/v2/directions/foot-walking
{
  coordinates: [[start_lng, start_lat], [end_lng, end_lat]],
  options: {
    avoid_polygons: {
      type: "MultiPolygon",
      coordinates: [
        // Array of blocked area geometries
      ]
    }
  }
}
```

For road-level blocks:
- Get OSM way IDs from blocked roads
- Convert to polygon buffers (10m radius)
- Include in `avoid_polygons`

For bus route blocks:
- Filter out blocked route numbers before calling TfL Journey API
- Pass remaining routes as `via` parameter

**Three Blocking Methods Implementation:**

**Method 1: Tap and Hold**
```javascript
map.on('contextmenu', async (e) => {
  const latlng = e.latlng;
  
  // Query OSM for features at this point
  const features = await queryOSMAtPoint(latlng);
  
  // Show menu with blockable features
  showBlockMenu(features, latlng);
});

function showBlockMenu(features, latlng) {
  const menu = features.map(f => ({
    label: `Block ${f.name || f.type}`,
    action: () => createBlock(f, latlng)
  }));
  
  displayContextMenu(menu, latlng);
}
```

**Method 2: Search and Block**
```javascript
async function searchAndBlock(query) {
  // Search roads
  const roads = await nominatim.search(query);
  
  // Search bus routes
  const routes = await tfl.searchRoutes(query);
  
  // Search stations
  const stations = await tfl.searchStations(query);
  
  // Display results with "Block" button
  displaySearchResults([...roads, ...routes, ...stations]);
}
```

**Method 3: Avoid During Navigation**
```javascript
avoidButton.onclick = async () => {
  const currentSegment = getCurrentRouteSegment();
  
  // Create block for current segment
  await createBlock({
    type: 'road',
    id: currentSegment.osmId,
    name: currentSegment.name
  });
  
  // Immediately recalculate route
  const newRoute = await recalculateRoute(startPoint, endPoint, allBlocks);
  
  // Update map
  displayNewRoute(newRoute);
};
```

**Time-Sensitive Block Check:**
```javascript
function isBlockActive(block) {
  if (block.blockType === 'temporary' || block.blockType === 'community') {
    return Date.now() < block.expiresAt;
  }
  
  if (block.blockType === 'time_sensitive') {
    const currentHour = new Date().getHours();
    
    // Handle overnight blocks (e.g., 21:00 - 06:00)
    if (block.startHour > block.endHour) {
      return currentHour >= block.startHour || currentHour < block.endHour;
    }
    
    return currentHour >= block.startHour && currentHour < block.endHour;
  }
  
  return true; // permanent blocks always active
}
```

**Validation:**
- Road blocks must have valid OSM way ID
- Bus route blocks must have valid TfL route number
- Area blocks must have valid GeoJSON geometry
- Time-sensitive blocks: startHour and endHour both 0-23
- Temporary blocks: expiresAt must be future timestamp
- Community blocks: auto-expire at createdAt + 2 hours

**Error Handling:**
- **Block creation fails:** Show "Unable to save block, please try again", retain in local storage as draft
- **Invalid element ID:** Show "Cannot block this element, please select a valid road/route/area"
- **Conflicting blocks:** Merge similar blocks (e.g., if user blocks same road twice)
- **Routing with blocks fails:** Try without blocks, warn user "Some blocks had to be ignored for this route"
- **Too many blocks:** Warn if user has 50+ blocks: "Many blocks may impact route quality"

**Edge Cases:**
- Blocking element currently on: Warn "You are currently on this road/route, block will apply to future routes"
- Blocking entire area: Confirm "This will block a large area, proceed?"
- Overlapping time-sensitive blocks: Use most restrictive block
- Expired temporary blocks: Auto-remove from database daily via scheduled cleanup
- Block makes destination unreachable: Show error "Destination cannot be reached with current blocks, consider removing blocks"
- Community block conflicts with personal block: Personal block takes precedence

**Dependencies:**
- Firebase for block storage
- OSM data for road identification
- TfL API for route/stop identification
- OpenRouteService avoid_polygons feature
- Browser geolocation for "block here" function

---

### Feature: Isolated Zone Warning System

**Priority:** Must-have

**Description:**
Identifies every isolated zone on a route and warns user before they start. Isolated zones include: parks requiring passing through, underpasses and tunnels, unlit pathways and cut-throughs, dead end streets with no through traffic, areas with no overlooking buildings, industrial areas empty at night, canal towpaths. Uses OpenStreetMap tags to identify these elements. Time-sensitive: isolated zone warnings elevated after dark.

**User Stories:**
- As a night traveller, I want to know about underpasses and tunnels on my route before I start
- As a cyclist, I want warnings about isolated canal paths and unlit cut-throughs
- As a user, I want time-aware warnings that understand 2am is different from 2pm
- As someone unfamiliar with an area, I want to know which sections have no other people around

**Acceptance Criteria:**
- [ ] All isolated zones on route are identified before journey starts
- [ ] Each zone shows: type, name, estimated duration passing through
- [ ] Warnings are more prominent after 9pm (user-configurable)
- [ ] Map visually highlights isolated sections in orange/red
- [ ] User can tap zone for more details
- [ ] Warning includes whether alternative route avoids zone
- [ ] Multiple consecutive zones grouped as "extended isolated section"

**How to Implement:**

**Frontend:**
- Component: `IsolatedZoneOverlay` renders zones on map
- Visual style: Orange dashed line for isolated sections
- Popup on tap: Zone type, OSM tags, approximate time in zone
- Component: `ZoneWarningList` in safety briefing shows all zones with icons

**Backend:**
- Function: `findIsolatedZones(routeGeometry)` queries OpenStreetMap
- Uses Overpass API to find features along route corridor
- Returns array of zone objects with type, name, tags, geometry

**OpenStreetMap Query:**
```
[out:json][timeout:25];
(
  // Unlit paths
  way["highway"="path"]["lit"="no"](bbox);
  way["highway"="footway"]["lit"="no"](bbox);
  way["highway"="cycleway"]["lit"="no"](bbox);
  
  // Tunnels and underpasses
  way["highway"]["tunnel"="yes"](bbox);
  way["amenity"="underpass"](bbox);
  way["man_made"="tunnel"](bbox);
  
  // Parks and green spaces
  way["leisure"="park"]["access"!="no"](bbox);
  way["natural"="wood"](bbox);
  way["landuse"="forest"](bbox);
  
  // Canal paths
  way["waterway"="canal"](bbox);
  way["highway"="path"]["canal"="yes"](bbox);
  
  // Industrial areas
  way["landuse"="industrial"](bbox);
  
  // Dead end streets
  way["highway"]["noexit"="yes"](bbox);
);
out geom;
```

**Zone Type Classification:**
```javascript
function classifyZone(osmTags) {
  if (osmTags.tunnel === 'yes' || osmTags.amenity === 'underpass') {
    return {
      type: 'underpass_tunnel',
      severity: 'high',
      icon: '🚇',
      description: 'Underpass or tunnel'
    };
  }
  
  if (osmTags.lit === 'no') {
    return {
      type: 'unlit_path',
      severity: 'high',
      icon: '🌑',
      description: 'Unlit pathway'
    };
  }
  
  if (osmTags.leisure === 'park' || osmTags.natural === 'wood') {
    return {
      type: 'green_space',
      severity: 'medium',
      icon: '🌳',
      description: 'Park or wooded area'
    };
  }
  
  if (osmTags.waterway === 'canal') {
    return {
      type: 'canal_path',
      severity: 'medium',
      icon: '🌊',
      description: 'Canal towpath'
    };
  }
  
  if (osmTags.landuse === 'industrial') {
    return {
      type: 'industrial',
      severity: 'medium',
      icon: '🏭',
      description: 'Industrial area'
    };
  }
  
  return {
    type: 'other_isolated',
    severity: 'low',
    icon: '⚠️',
    description: 'Isolated area'
  };
}
```

**Route Intersection Logic:**
```javascript
function routeIntersectsZone(routeCoords, zoneGeometry) {
  // Convert route to Turf.js lineString
  const routeLine = turf.lineString(routeCoords);
  
  // Convert zone to polygon if needed
  const zonePolygon = turf.polygon(zoneGeometry.coordinates);
  
  // Check intersection
  const intersection = turf.booleanIntersects(routeLine, zonePolygon);
  
  if (intersection) {
    // Calculate approximate time in zone
    const intersectionSegment = turf.lineIntersect(routeLine, zonePolygon);
    const segmentLength = turf.length(intersectionSegment, {units: 'meters'});
    const timeInZone = Math.ceil(segmentLength / 1.4); // Walking speed ~1.4 m/s
    
    return {
      intersects: true,
      durationSeconds: timeInZone
    };
  }
  
  return {intersects: false};
}
```

**Time-Based Severity Adjustment:**
```javascript
function adjustSeverityForTime(zone, timeOfDay) {
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 6;
  
  if (isNight && zone.type === 'unlit_path') {
    zone.severity = 'critical';
    zone.warning = 'UNLIT AREA AT NIGHT - STRONGLY AVOID';
  }
  
  if (isNight && zone.type === 'underpass_tunnel') {
    zone.severity = 'critical';
    zone.warning = 'ISOLATED UNDERPASS AT NIGHT - FIND ALTERNATIVE';
  }
  
  if (isNight && zone.type === 'industrial') {
    zone.severity = 'high';
    zone.warning = 'Area likely empty at night';
  }
  
  return zone;
}
```

**Validation:**
- Route coordinates must be valid lat/lng pairs
- Overpass API query must return within 25 seconds
- Zone geometries must be valid GeoJSON
- Duration calculations must be positive integers

**Error Handling:**
- **Overpass timeout:** Show "Unable to check isolated zones, proceed with caution"
- **Invalid zone geometry:** Skip that zone, continue with others
- **No zones found:** Display "No isolated zones detected on this route" (positive message)
- **API rate limit:** Cache zone data for 1 hour per route corridor

**Edge Cases:**
- Route is entirely within isolated zone (e.g., long park path): Warn "Entire route is isolated, consider alternatives"
- Multiple zones back-to-back: Group as "Extended isolated section - 5 minutes total"
- Very short intersection (<30 seconds): Still warn but lower severity
- Zone has no name: Use generic description "Unnamed [type]"
- User blocks zone during planning: Remove from warnings, adjust safety score upward

**Dependencies:**
- Overpass API for OSM data
- Turf.js for geometric calculations (or equivalent)
- Route geometry from OpenRouteService
- Current time for severity adjustment

---

### Feature: Lighting Layer

**Priority:** Should-have

**Description:**
Routes assessed for street lighting coverage. Uses London borough open data for street lighting where available. After set time (default 9pm, user adjustable), routing algorithm adds penalty to unlit sections, preferring lit alternatives even if slightly longer. Visual display shows lit sections in one color, unlit sections flagged clearly.

**User Stories:**
- As a night walker, I want to see which parts of my route are lit and which are dark
- As a user, I want the app to prefer lit routes after dark even if slightly longer
- As someone planning ahead, I want to see how lighting changes along my full route

**Acceptance Criteria:**
- [ ] Map displays lighting data as color-coded route overlay
- [ ] Lit sections shown in blue/white
- [ ] Unlit sections shown in dark gray/black
- [ ] Legend explains colors
- [ ] Night mode automatically activates at user-set time (default 9pm)
- [ ] Routing penalty applied to unlit sections (adds ~20% to cost)
- [ ] User can toggle lighting layer on/off

**How to Implement:**

**Frontend:**
- Component: `LightingLayer` renders color-coded route
- Segmented route display: lit sections in `#4A90E2`, unlit in `#2C2C2C`
- Toggle button: "Show/Hide Lighting"
- Settings: User can adjust night mode start time

**Backend:**
- Function: `assessLighting(routeCoords)` checks lighting for each segment
- Sources (in order of preference):
  1. London Datastore street lighting CSV/JSON
  2. OpenStreetMap `lit` tag
  3. Fallback: assume major roads lit, minor roads unlit after dark

**Data Integration:**

**London Datastore:**
```javascript
// Example: Westminster street lighting data
// https://data.london.gov.uk/dataset/street-lighting

async function fetchLightingData(borough) {
  const url = `https://data.london.gov.uk/download/${borough}/street-lighting.csv`;
  const response = await fetch(url);
  const csvData = await response.text();
  
  // Parse CSV to array of {lat, lng, type, status}
  return parseCSV(csvData);
}

// Check if point is near lit street light
function isPointLit(coord, lightingData) {
  const nearbyLights = lightingData.filter(light => {
    const distance = getDistance(coord, [light.lat, light.lng]);
    return distance < 30; // Within 30 meters
  });
  
  return nearbyLights.some(light => light.status === 'working');
}
```

**OpenStreetMap Fallback:**
```javascript
// Query OSM for lit tag
async function checkOSMLighting(routeSegment) {
  const query = `
    [out:json];
    way(${segmentBbox})["highway"]["lit"="yes"];
    out geom;
  `;
  
  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    body: query
  });
  
  const data = await response.json();
  return data.elements.length > 0; // True if segment has lit=yes
}
```

**Route Segmentation:**
```javascript
function segmentRouteByLighting(routeCoords, lightingData) {
  const segments = [];
  let currentSegment = {
    isLit: false,
    coords: []
  };
  
  routeCoords.forEach(coord => {
    const lit = isPointLit(coord, lightingData);
    
    if (lit !== currentSegment.isLit) {
      // Lighting changed, start new segment
      if (currentSegment.coords.length > 0) {
        segments.push(currentSegment);
      }
      
      currentSegment = {
        isLit: lit,
        coords: [coord]
      };
    } else {
      currentSegment.coords.push(coord);
    }
  });