# Database Schema

## Overview

SafeTrack London uses **Firebase Realtime Database** as its primary data store. This is a NoSQL document database that provides real-time synchronization and works seamlessly with Firebase Authentication. The schema is designed to support the core safety features while remaining simple enough for a first-year computing student to understand and maintain.


## Database Technology Choice

**Primary Database:** Firebase Realtime Database

**Rationale:**
- **Free tier sufficient** for student project (1GB storage, 10GB/month bandwidth)
- **Real-time sync** essential for live trustee journey sharing feature
- **No server management** required - fully managed by Google
- **Excellent documentation** suitable for beginner developers
- **Built-in authentication** integration with Firebase Auth
- **Works from phone and desktop** - consistent API across environments

**Alternative Considered:** Firestore (Firebase's newer document database) was considered but Realtime Database chosen for simpler data structure and lower learning curve.

---

## Core Principles

1. **Flat where possible** - minimize nesting to simplify queries from beginner-level code
2. **User-centric structure** - all personal data (blocks, routes, relationships) organized under user IDs
3. **Real-time optimized** - structure supports Firebase's real-time listeners for live journey tracking
4. **No complex joins** - denormalize data where needed to avoid complicated queries
5. **Indexing for common queries** - optimize for route planning, block checking, and trustee lookups


---

## Schema Structure

### Root Level Organization

```
safetrack-london/
├── users/
├── blockedElements/
├── savedRoutes/
├── trusteeRelationships/
├── liveJourneys/
└── communityBlocks/
```

---

## Entity Definitions

### 1. Users

**Path:** `/users/{userId}`

**Purpose:** Store user account data, preferences, and settings.

**Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `userId` | string | ✅ | Firebase Auth UID | Primary key, auto-generated |
| `phoneNumber` | string | ❌ | User's phone number | E.164 format, used for trustee invitations |
| `username` | string | ❌ | App username | Unique, 3-20 chars, used for trustee connections |
| `nightModeStartHour` | number | ❌ | When night mode begins | 0-23, default 21 (9pm) |
| `nightModeEndHour` | number | ❌ | When night mode ends | 0-23, default 6 (6am) |
| `defaultSharingMode` | string | ❌ | Auto-sharing preference | `always_on_night`, `manual`, `auto_flagged_zones` |
| `createdAt` | timestamp | ✅ | Account creation time | Firebase ServerValue.TIMESTAMP |
| `lastActive` | timestamp | ❌ | Last app usage | Firebase ServerValue.TIMESTAMP |

**Example:**

```json
{
  "users": {
    "abc123uid": {
      "userId": "abc123uid",
      "phoneNumber": "+447700900123",
      "username": "safetraveller_ldn",
      "nightModeStartHour": 21,
      "nightModeEndHour": 6,
      "defaultSharingMode": "always_on_night",
      "createdAt": 1704067200000,
      "lastActive": 1704153600000
    }
  }
}
```

**Indexes:**
- `username` - for trustee search by username
- `phoneNumber` - for trustee invitations by phone

**Authorization Rules:**
```javascript
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

---

### 2. BlockedElements

**Path:** `/blockedElements/{userId}/{blockId}`

**Purpose:** Store roads, routes, stops, stations, or areas a user wants to avoid permanently or temporarily.


**Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `blockId` | string | ✅ | Unique block identifier | Auto-generated push ID |
| `userId` | string | ✅ | Owner of this block | Firebase Auth UID |
| `elementType` | string | ✅ | Type of blocked element | `road`, `bus_route`, `bus_stop`, `tube_station`, `area`, `postcode` |
| `elementId` | string | ✅ | External identifier | OSM way ID, TFL route/stop code, or postcode |
| `elementName` | string | ✅ | Human-readable name | Display name for UI |
| `blockType` | string | ✅ | Block duration/scope | `permanent`, `temporary`, `time_sensitive`, `community` |
| `startHour` | number | ❌ | Time-sensitive start | 0-23, only for `time_sensitive` blocks |
| `endHour` | number | ❌ | Time-sensitive end | 0-23, only for `time_sensitive` blocks |
| `expiresAt` | timestamp | ❌ | Auto-expiry time | Required for `temporary` and `community` blocks (2 hours) |
| `notes` | string | ❌ | User's reason for blocking | Max 500 chars |
| `geometry` | GeoJSON | ❌ | Area polygon | Required for `area` type blocks |
| `createdAt` | timestamp | ✅ | Block creation time | Firebase ServerValue.TIMESTAMP |

**Example:**

```json
{
  "blockedElements": {
    "abc123uid": {
      "block_xyz789": {
        "blockId": "block_xyz789",
        "userId": "abc123uid",
        "elementType": "road",
        "elementId": "osm_way_123456",
        "elementName": "Brent River Park Underpass",
        "blockType": "permanent",
        "notes": "Pitch black at night, completely isolated",
        "createdAt": 1704067200000
      },
      "block_abc456": {
        "blockId": "block_abc456",
        "userId": "abc123uid",
        "elementType": "bus_route",
        "elementId": "tfl_route_266",
        "elementName": "Bus 266",
        "blockType": "time_sensitive",
        "startHour": 22,
        "endHour": 5,
        "notes": "Avoid late at night - route through unsafe area",
        "createdAt": 1704070800000
      }
    }
  }
}
```

**Indexes:**
- `elementType` - filter blocks by type when routing
- `blockType` - separate permanent from temporary blocks
- `expiresAt` - query for expired temporary blocks to clean up

**Authorization Rules:**
```javascript
{
  "rules": {
    "blockedElements": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        "$blockId": {
          ".validate": "newData.child('userId').val() === $userId"
        }
      }
    }
  }
}
```

---

### 3. SavedRoutes

**Path:** `/savedRoutes/{userId}/{routeId}`

**Purpose:** Store routes users have personally verified as safe from their own experience.

**Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `routeId` | string | ✅ | Unique route identifier | Auto-generated push ID |
| `userId` | string | ✅ | User who saved this route | Firebase Auth UID |
| `routeName` | string | ✅ | User-given name | Max 100 chars |
| `startLocation` | string | ✅ | Starting point name | Human-readable address |
| `endLocation` | string | ✅ | Destination name | Human-readable address |
| `startCoords` | object | ✅ | Start coordinates | `{lat: number, lng: number}` |
| `endCoords` | object | ✅ | End coordinates | `{lat: number, lng: number}` |
| `geometry` | GeoJSON | ✅ | Route path | LineString from OpenRouteService |
| `notes` | string | ❌ | User's safety notes | Max 500 chars, e.g., "Well lit, always busy" |
| `safetyScore` | number | ❌ | Score when saved | 0-10, calculated at save time |
| `isPublic` | boolean | ✅ | Share with community | Default false |
| `useCount` | number | ✅ | Times route used | Incremented each use, default 0 |
| `createdAt` | timestamp | ✅ | Save time | Firebase ServerValue.TIMESTAMP |
| `lastUsedAt` | timestamp | ❌ | Most recent use | Firebase ServerValue.TIMESTAMP |

**Example:**

```json
{
  "savedRoutes": {
    "abc123uid": {
      "route_safe123": {
        "routeId": "route_safe123",
        "userId": "abc123uid",
        "routeName": "Home to BCU - Safe Night Route",
        "startLocation": "Harlesden, London",
        "endLocation": "Birmingham City University",
        "startCoords": { "lat": 51.5369, "lng": -0.2649 },
        "endCoords": { "lat": 52.4862, "lng": -1.8904 },
        "geometry": { "type": "LineString", "coordinates": [[...]] },
        "notes": "Well lit entire way, main roads only, late night buses available",
        "safetyScore": 8.5,
        "isPublic": true,
        "useCount": 47,
        "createdAt": 1704067200000,
        "lastUsedAt": 1704153600000
      }
    }
  }
}
```

**Indexes:**
- `isPublic` - query community-shared routes
- `useCount` - sort by popularity for recommendations

**Authorization Rules:**
```javascript
{
  "rules": {
    "savedRoutes": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        "$routeId": {
          ".validate": "newData.child('userId').val() === $userId"
        }
      }
    }
  }
}
```

---

### 4. TrusteeRelationships

**Path:** `/trusteeRelationships/{userId}/trustees/{relationshipId}`  
**Path:** `/trusteeRelationships/{userId}/trustingMe/{relationshipId}`

**Purpose:** Manage bidirectional trust relationships for live journey sharing.

**Note:** This uses a **denormalized structure** - each relationship is stored twice (once for each user) to enable efficient queries from both perspectives without complex joins.

**Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `relationshipId` | string | ✅ | Unique relationship ID | Auto-generated push ID |
| `userId` | string | ✅ | User sharing location | Firebase Auth UID |
| `trusteeUserId` | string | ✅ | Trustee viewing location | Firebase Auth UID |
| `trusteeName` | string | ✅ | Trustee display name | From User.username or phone |
| `status` | string | ✅ | Relationship state | `pending`, `active`, `paused` |
| `createdAt` | timestamp | ✅ | Invitation time | Firebase ServerValue.TIMESTAMP |
| `acceptedAt` | timestamp | ❌ | When trustee accepted | Firebase ServerValue.TIMESTAMP |

**Example:**

```json
{
  "trusteeRelationships": {
    "abc123uid": {
      "trustees": {
        "rel_trust001": {
          "relationshipId": "rel_trust001",
          "userId": "abc123uid",
          "trusteeUserId": "def456uid",
          "trusteeName": "Mum",
          "status": "active",
          "createdAt": 1704067200000,
          "acceptedAt": 1704070800000
        }
      },
      "trustingMe": {
        "rel_trust002": {
          "relationshipId": "rel_trust002",
          "userId": "xyz789uid",
          "trusteeUserId": "abc123uid",
          "trusteeName": "safetraveller_ldn",
          "status": "active",
          "createdAt": 1704067200000,
          "acceptedAt": 1704070800000
        }
      }
    }
  }
}
```

**Indexes:**
- `status` - filter active relationships
- `trusteeUserId` - lookup relationships by trustee

**Authorization Rules:**
```javascript
{
  "rules": {
    "trusteeRelationships": {
      "$userId": {
        "trustees": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        },
        "trustingMe": {
          ".read": "$userId === auth.uid",
          "$relationshipId": {
            ".read": "data.child('trusteeUserId').val() === auth.uid",
            ".write": "data.child('trusteeUserId').val() === auth.uid"
          }
        }
      }
    }
  }
}
```

---

### 5. LiveJourneys

**Path:** `/liveJourneys/{journeyId}`

**Purpose:** Store active journeys being shared with trustees in real-time. This is the most frequently updated entity.


**Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `journeyId` | string | ✅ | Unique journey identifier | Auto-generated push ID |
| `userId` | string | ✅ | User making journey | Firebase Auth UID |
| `userName` | string | ✅ | Display name | For trustee UI |
| `startLocation` | object | ✅ | Journey origin | `{name: string, lat: number, lng: number}` |
| `endLocation` | object | ✅ | Destination | `{name: string, lat: number, lng: number}` |
| `currentLocation` | object | ✅ | Live position | `{lat: number, lng: number}`, updated every 10-30 seconds |
| `plannedRoute` | GeoJSON | ✅ | Original route | LineString geometry |
| `startedAt` | timestamp | ✅ | Journey start time | Firebase ServerValue.TIMESTAMP |
| `estimatedArrival` | timestamp | ✅ | Expected arrival | Calculated from route duration |
| `lastUpdateAt` | timestamp | ✅ | Last location update | Firebase ServerValue.TIMESTAMP |
| `status` | string | ✅ | Journey state | `active`, `completed`, `delayed` |
| `trustees` | array | ✅ | Authorized viewers | Array of trustee user IDs |
| `flaggedZoneEntries` | array | ❌ | Zone events | Array of `{zoneName, enteredAt, clearedAt}` |
| `batteryLevel` | number | ❌ | Phone battery % | 0-100, triggers low battery alerts |
| `safetyScore` | number | ❌ | Route safety score | 0-10, from pre-journey briefing |

**Example:**

```json
{
  "liveJourneys": {
    "journey_live001": {
      "journeyId": "journey_live001",
      "userId": "abc123uid",
      "userName": "safetraveller_ldn",
      "startLocation": {
        "name": "Wembley Stadium",
        "lat": 51.5560,
        "lng": -0.2795
      },
      "endLocation": {
        "name": "Harlesden Station",
        "lat": 51.5369,
        "lng": -0.2649
      },
      "currentLocation": {
        "lat": 51.5465,
        "lng": -0.2722
      },
      "plannedRoute": {
        "type": "LineString",
        "coordinates": [[...]]
      },
      "startedAt": 1704150000000,
      "estimatedArrival": 1704151380000,
      "lastUpdateAt": 1704150780000,
      "status": "active",
      "trustees": ["def456uid", "xyz789uid"],
      "flaggedZoneEntries": [
        {
          "zoneName": "Brent River Park",
          "enteredAt": 1704150300000,
          "clearedAt": 1704150390000
        }
      ],
      "batteryLevel": 45,
      "safetyScore": 6.5
    }
  }
}
```

**Indexes:**
- `userId` - query user's active journeys
- `status` - filter active vs completed
- `estimatedArrival` - check for delayed arrivals

**Authorization Rules:**
```javascript
{
  "rules": {
    "liveJourneys": {
      "$journeyId": {
        ".read": "auth.uid === data.child('userId').val() || data.child('trustees').val().contains(auth.uid)",
        ".write": "auth.uid === data.child('userId').val()",
        ".validate": "newData.child('userId').val() === auth.uid"
      }
    }
  }
}
```

---

### 6. CommunityBlocks (Temporary Shared Blocks)

**Path:** `/communityBlocks/{blockId}`

**Purpose:** Store temporary blocks shared anonymously across users (e.g., live incidents, temporary road closures). Auto-expire after 2 hours.

**Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `blockId` | string | ✅ | Unique block identifier | Auto-generated push ID |
| `elementType` | string | ✅ | What's blocked | `road`, `area`, `bus_stop` |
| `elementId` | string | ✅ | External identifier | OSM way ID or TFL code |
| `elementName` | string | ✅ | Human-readable name | Display name |
| `geometry` | GeoJSON | ❌ | Area if applicable | Point or Polygon |
| `reason` | string | ❌ | Why blocked | Max 200 chars, e.g., "Police incident" |
| `createdAt` | timestamp | ✅ | Block created | Firebase ServerValue.TIMESTAMP |
| `expiresAt` | timestamp | ✅ | Auto-removal time | createdAt + 2 hours |
| `reportCount` | number | ✅ | Verification count | Users who confirmed this block, default 1 |

**Example:**

```json
{
  "communityBlocks": {
    "comm_block_001": {
      "blockId": "comm_block_001",
      "elementType": "road",
      "elementId": "osm_way_789012",
      "elementName": "High Street, Harlesden",
      "geometry": {
        "type": "Point",
        "coordinates": [-0.2649, 51.5369]
      },
      "reason": "Road closure - avoid area",
      "createdAt": 1704150000000,
      "expiresAt": 1704157200000,
      "reportCount": 3
    }
  }
}
```

**Indexes:**
- `expiresAt` - query for expired blocks to clean up
- `elementType` - filter by block type

**Authorization Rules:**
```javascript
{
  "rules": {
    "communityBlocks": {
      ".read": "auth != null",
      "$blockId": {
        ".write": "auth != null && (!data.exists() || newData.child('reportCount').val() === data.child('reportCount').val() + 1)",
        ".validate": "newData.child('expiresAt').val() <= now + 7200000"
      }
    }
  }
}
```

---

## Relationships Summary

```
User (1) ────── (many) BlockedElements
User (1) ────── (many) SavedRoutes
User (1) ────── (many) TrusteeRelationships (as trustee)
User (1) ────── (many) TrusteeRelationships (as user being tracked)
User (1) ────── (many) LiveJourneys (as creator)
LiveJourney (1) ────── (many) Users (as trustees)
```

---

## Data Flow Examples

### Planning a Safe Route

```javascript
// 1. Fetch user's personal blocks
const blocksRef = firebase.database().ref(`blockedElements/${userId}`);
const blocksSnapshot = await blocksRef.once('value');
const userBlocks = blocksSnapshot.val();

// 2. Check for active community blocks
const communityRef = firebase.database().ref('communityBlocks')
  .orderByChild('expiresAt')
  .startAt(Date.now());
const communitySnapshot = await communityRef.once('value');
const communityBlocks = communitySnapshot.val();

// 3. Combine blocks and pass to routing engine
const allBlocks = [...userBlocks, ...communityBlocks];

// 4. Generate route avoiding blocked elements
const route = await openRouteService.getRoute(start, end, {
  avoid: allBlocks.map(b => b.elementId)
});
```

### Starting Live Journey Sharing

```javascript
// 1. Get user's active trustees
const trusteesRef = firebase.database().ref(`trusteeRelationships/${userId}/trustees`);
const trusteesSnapshot = await trusteesRef.once('value');
const trustees = trusteesSnapshot.val();

// 2. Create live journey
const journeyRef = firebase.database().ref('liveJourneys').push();
await journeyRef.set({
  journeyId: journeyRef.key,
  userId: userId,
  userName: currentUser.username,
  startLocation: startPoint,
  endLocation: endPoint,
  currentLocation: startPoint,
  plannedRoute: routeGeometry,
  startedAt: firebase.database.ServerValue.TIMESTAMP,
  estimatedArrival: Date.now() + durationMs,
  lastUpdateAt: firebase.database.ServerValue.TIMESTAMP,
  status: 'active',
  trustees: Object.keys(trustees),
  batteryLevel: navigator.getBattery().level * 100,
  safetyScore: calculatedScore
});

// 3. Send notifications to trustees
trustees.forEach(trustee => {
  sendPushNotification(trustee.trusteeUserId, {
    title: `${currentUser.username} started a journey`,
    body: `Travelling from ${startPoint.name} to ${endPoint.name}`
  });
});
```

### Updating Live Location

```javascript
// Real-time location updates (every 10-30 seconds while journey active)
const journeyRef = firebase.database().ref(`liveJourneys/${journeyId}`);

// Update current position
await journeyRef.update({
  currentLocation: {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  },
  lastUpdateAt: firebase.database.ServerValue.TIMESTAMP,
  batteryLevel: await getBatteryLevel()
});

// Trustees automatically receive update via Firebase real-time listener
```

---

## Indexing Strategy

### Firebase Realtime Database Indexes

Add to `firebase.json`:

```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "indexes": [
    {
      "path": "users",
      "indexOn": ["username", "phoneNumber"]
    },
    {
      "path": "blockedElements/$userId",
      "indexOn": ["elementType", "blockType", "expiresAt"]
    },
    {
      "path": "savedRoutes/$userId",
      "indexOn": ["isPublic", "useCount"]
    },
    {
      "path": "trusteeRelationships/$userId/trustees",
      "indexOn": ["status", "trusteeUserId"]
    },
    {
      "path": "liveJourneys",
      "indexOn": ["userId", "status", "estimatedArrival"]
    },
    {
      "path": "communityBlocks",
      "indexOn": ["expiresAt", "elementType"]
    }
  ]
}
```

### Index Usage Examples

**Find expired community blocks:**
```javascript
firebase.database().ref('communityBlocks')
  .orderByChild('expiresAt')
  .endAt(Date.now())
  .once('value')
```

**Find user's time-sensitive blocks active now:**
```javascript
const hour = new Date().getHours();
firebase.database().ref(`blockedElements/${userId}`)
  .orderByChild('blockType')
  .equalTo('time_sensitive')
  .once('value')
  .then(snapshot => {
    // Filter in memory by startHour/endHour
  })
```

---

## Data Validation Rules

### Complete Firebase Rules File

**database.rules.json:**

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        ".validate": "newData.hasChildren(['userId', 'createdAt'])",
        "userId": {
          ".validate": "newData.val() === $userId"
        },
        "username": {
          ".validate": "newData.isString() && newData.val().length >= 3 && newData.val().length <= 20"
        },
        "phoneNumber": {
          ".validate": "newData.isString() && newData.val().matches(/^\\+[1-9]\\d{10,14}$/)"
        },
        "nightModeStartHour": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 23"
        },
        "nightModeEndHour": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 23"
        },
        "defaultSharingMode": {
          ".validate": "newData.isString() && (newData.val() === 'always_on_night' || newData.val() === 'manual' || newData.val() === 'auto_flagged_zones')"
        }
      }
    },
    
    "blockedElements": {
      "$userId": {
        ".read": "$userId === auth.uid",
        "$blockId": {
          ".write": "$userId === auth.uid",
          ".validate": "newData.hasChildren(['blockId', 'userId', 'elementType', 'elementId', 'elementName', 'blockType', 'createdAt'])",
          "userId": {
            ".validate": "newData.val() === $userId"
          },
          "elementType": {
            ".validate": "newData.isString() && (newData.val() === 'road' || newData.val() === 'bus_route' || newData.val() === 'bus_stop' || newData.val() === 'tube_station' || newData.val() === 'area' || newData.val() === 'postcode')"
          },
          "blockType": {
            ".validate": "newData.isString() && (newData.val() === 'permanent' || newData.val() === 'temporary' || newData.val() === 'time_sensitive' || newData.val() === 'community')"
          },
          "notes": {
            ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 500)"
          }
        }
      }
    },
    
    "savedRoutes": {
      "$userId": {
        ".read": "$userId === auth.uid",
        "$routeId": {
          ".write": "$userId === auth.uid",
          ".validate": "newData.hasChildren(['routeId', 'userId', 'routeName', 'startLocation', 'endLocation', 'geometry', 'isPublic', 'useCount', 'createdAt'])",
          "userId": {
            ".validate": "newData.val() === $userId"
          },
          "routeName": {
            ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 100"
          },
          "safetyScore": {
            ".validate": "!newData.exists() || (newData.isNumber() && newData.val() >= 0 && newData.val() <= 10)"
          }
        }
      }
    },
    
    "trusteeRelationships": {
      "$userId": {
        "trustees": {
          ".read": "$userId === auth.uid",
          "$relationshipId": {
            ".write": "$userId === auth.uid",
            ".validate": "newData.hasChildren(['relationshipId', 'userId', 'trusteeUserId', 'status', 'createdAt'])",
            "userId": {
              ".validate": "newData.val() === $userId"
            },
            "status": {
              ".validate": "newData.isString() && (newData.val() === 'pending' || newData.val() === 'active' || newData.val() === 'paused')"
            }
          }
        },
        "trustingMe": {
          ".read": "$userId === auth.uid",
          "$relationshipId": {
            ".read": "data.child('trusteeUserId').val() === auth.uid",
            ".write": "data.child('trusteeUserId').val() === auth.uid || newData.child('userId').val() === auth.uid"
          }
        }
      }
    },
    
    "liveJourneys": {
      "$journeyId": {
        ".read": "auth.uid === data.child('userId').val() || data.child('trustees').val().contains(auth.uid)",
        ".write": "auth.uid === data.child('userId').val() || (auth.uid === newData.child('userId').val() && !data.exists())",
        ".validate": "newData.hasChildren(['journeyId', 'userId', 'startLocation', 'endLocation', 'currentLocation', 'plannedRoute', 'startedAt', 'estimatedArrival', 'lastUpdateAt', 'status', 'trustees'])",
        "userId": {
          ".validate": "newData.val() === auth.uid"
        },
        "status": {
          ".validate": "newData.isString() && (newData.val() === 'active' || newData.val() === 'completed' || newData.val() === 'delayed')"
        },
        "batteryLevel": {
          ".validate": "!newData.exists() || (newData.isNumber() && newData.val() >= 0 && newData.val() <= 100)"
        }
      }
    },
    
    "communityBlocks": {
      ".read": "auth != null",
      "$blockId": {
        ".write": "auth != null && (!data.exists() || newData.child('reportCount').val() === data.child('reportCount').val() + 1)",
        ".validate": "newData.hasChildren(['blockId', 'elementType', 'elementId', 'elementName', 'createdAt', 'expiresAt', 'reportCount']) && newData.child('expiresAt').val() <= (now + 7200000)",
        "expiresAt": {
          ".validate": "newData.isNumber