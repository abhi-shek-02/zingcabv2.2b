# Zone-Based Pricing Implementation - Product Specification

**Product:** ZingCab Intercity Cab Booking Platform  
**Feature:** Zone-Based Pricing System  
**Version:** 1.0  
**Date:** December 2024  
**Status:** Planning Phase

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Business Requirements](#business-requirements)
4. [Technical Architecture](#technical-architecture)
5. [Repository Structure & Branch Management](#-repository-structure--branch-management)
6. [Database Schema](#database-schema)
7. [Backend Implementation Plan](#backend-implementation-plan)
8. [Frontend Implementation Plan](#frontend-implementation-plan)
9. [API Specifications](#api-specifications)
10. [Edge Cases & Business Rules](#edge-cases--business-rules)
11. [Testing Strategy](#testing-strategy)
12. [Rollout Plan](#rollout-plan)
13. [Success Metrics](#success-metrics)

---

## 🎯 Executive Summary

### Problem Statement
Currently, ZingCab uses distance-based pricing for all routes. While this works, it doesn't allow for:
- Competitive fixed pricing on popular routes
- Better margin control on high-demand routes
- Predictable pricing for customers on common journeys

### Solution
Implement a hybrid pricing system that combines:
1. **Zone-Based Pricing**: Fixed prices for routes between defined zones (20km radius around city centers)
2. **Distance-Based Pricing**: Existing fallback system for routes outside zones

### Business Value
- **Revenue**: Better margin control on popular routes
- **Competitiveness**: Fixed pricing for key routes (Kolkata-Digha, Kolkata-Kharagpur, etc.)
- **Customer Experience**: Predictable pricing for frequent routes
- **Scalability**: Easy to add new zones and routes without code changes

---

## 📖 Product Overview

### Feature Description
Zone-based pricing allows ZingCab to offer fixed, competitive prices for popular intercity routes within West Bengal. The system uses geofencing (20km radius) to identify zones and applies fixed pricing when both pickup and drop locations fall within defined zones.

### Key Features
1. **Geofencing-Based Zone Detection**: Uses lat/lng coordinates to determine if location is within 20km of a zone center
2. **Bidirectional Pricing**: Same price for route in both directions (Kolkata→Kharagpur = Kharagpur→Kolkata)
3. **Car Type Specific**: Different prices for sedan, SUV, hatchback, etc.
4. **Automatic Fallback**: Uses distance-based pricing when zones don't match
5. **Pricing Transparency**: Shows customers which pricing method is being used

### User Stories

**As a Customer:**
- I want to see fixed prices for popular routes so I know exactly what I'll pay
- I want to see if my route qualifies for zone pricing or distance pricing
- I want the same price whether I'm going from A→B or B→A

**As a Business:**
- I want to set competitive fixed prices for popular routes
- I want to easily add new zones and routes
- I want to see which pricing method is being used for analytics

---

## 💼 Business Requirements

### Functional Requirements

#### FR1: Zone Definition
- **Requirement**: System must support defining zones as city centers with 20km radius
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Admin can define zone with city name, lat, lng, and radius
  - System can identify if a location (lat/lng) falls within a zone
  - Zone detection must be accurate within 20km radius

#### FR2: Zone Pricing Management
- **Requirement**: System must support fixed pricing for zone-to-zone routes
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Admin can set prices for route pairs (Zone A → Zone B)
  - Pricing is bidirectional (A→B = B→A)
  - Different prices for different car types
  - Prices can be updated without code deployment

#### FR3: Hybrid Pricing Logic
- **Requirement**: System must intelligently choose between zone and distance pricing
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - If both pickup and drop are in zones → use zone pricing
  - If either location is outside zones → use distance pricing
  - System returns which pricing method was used
  - Pricing calculation is fast (< 500ms)

#### FR4: Pricing Display
- **Requirement**: Frontend must clearly show pricing method to users
- **Priority**: P1 (High)
- **Acceptance Criteria**:
  - Display badge/indicator showing "Zone-Based Pricing" or "Distance-Based Pricing"
  - Show zone names when zone pricing is applied
  - Maintain existing fare breakdown display

### Non-Functional Requirements

#### NFR1: Performance
- Zone detection must complete in < 100ms
- Fare calculation API response time < 500ms
- Support 1000+ concurrent requests

#### NFR2: Accuracy
- Zone detection accuracy: 99.9% (within 20km radius)
- Distance calculation using Haversine formula
- Handle edge cases (boundary conditions, overlaps)

#### NFR3: Scalability
- Support 50+ zones
- Support 200+ zone-to-zone route pairs
- Easy to add new zones without downtime

#### NFR4: Maintainability
- Database-driven (no hardcoded zones/prices)
- Admin-friendly data structure
- Clear logging for debugging

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)    │
│                 │
│  - OLA API      │──┐
│    (lat/lng)    │  │
└─────────────────┘  │
         │           │
         │ API Call  │
         ▼           │
┌─────────────────┐  │
│   Backend API   │  │
│  (Node.js/      │  │
│   Express)      │  │
└─────────────────┘  │
         │           │
         │           │
    ┌────┴────┐      │
    │         │      │
    ▼         ▼      │
┌────────┐ ┌────────┐│
│ Zone   │ │Distance││
│Pricing │ │Pricing ││
│Logic   │ │Logic   ││
└────────┘ └────────┘│
    │         │      │
    └────┬────┘      │
         │           │
         ▼           │
┌─────────────────┐  │
│   Supabase DB   │  │
│                 │  │
│ - zones table   │  │
│ - zone_pricing  │  │
│   table         │  │
└─────────────────┘  │
```

### Data Flow

1. **User selects locations** → Frontend calls OLA API → Gets lat/lng
2. **Frontend sends booking request** → Backend receives lat/lng for pickup and drop
3. **Backend zone detection**:
   - Calculate distance from pickup to all zone centers
   - Calculate distance from drop to all zone centers
   - Identify zones (if within 20km)
4. **Backend pricing logic**:
   - If both in zones → Lookup zone pricing
   - Else → Use distance-based pricing
5. **Backend returns** → Fare data + pricing method used
6. **Frontend displays** → Fare + pricing type badge

---

## 🌿 Repository Structure & Branch Management

### Repository Overview

**Repository:** `https://github.com/abhi-shek-02/zingcabv2.2b.git`

This is a **monorepo** with branch-based separation:
- **`main` branch** → Frontend code (React/Vite application)
- **`backend` branch** → Backend code (Node.js/Express API)

### Branch Structure

```
zingcabv2.2b/
├── main (branch)               → Frontend Code
│   ├── src/                    # Frontend React code
│   ├── public/                 # Frontend assets
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts          # Frontend build config
│
└── backend (branch)            → Backend Code
    ├── routes/                 # Backend API routes
    ├── config/                 # Backend configuration
    ├── services/               # Backend business logic
    ├── server.js               # Backend entry point
    └── package.json            # Backend dependencies
```

### Quick Reference: Branch Commands

#### Check Current Branch
```bash
git branch                    # Show current branch
git branch -a                 # Show all branches
```

#### Switch Between Branches
```bash
# Work on frontend
git checkout main

# Work on backend
git checkout backend
```

#### Server Deployment Commands

**Backend Server** (`/var/www/api.zingcab.in`):
```bash
cd /var/www/api.zingcab.in
git checkout backend
git pull origin backend
npm install                    # If new dependencies
pm2 restart zingcab-api
```

**Frontend Server** (`/var/www/zcab`):
```bash
cd /var/www/zcab
git checkout main
git pull origin main
npm install                    # If new dependencies
npm run build:prod
# Deploy dist/ folder
```

### Implementation Strategy Across Branches

#### Phase 1: Backend Implementation (Database + Code Combined)
**Branch:** `backend`  
**Rationale:** Database setup is part of backend work, so keep everything in one branch for better organization.

**Database Setup (Day 1-2):**
- Create SQL migration scripts in `database/migrations/` directory
- Run SQL scripts in Supabase Dashboard
- Insert initial zone and pricing data
- Commit SQL scripts to `backend` branch

**Backend Code (Day 3-4):**
- `routes/fare.js` - Update fare calculation logic
- `services/zoneService.js` - NEW: Zone detection service
- `config/supabase.js` - Already exists, no changes needed
- `server.js` - No changes needed (unless adding new routes)

**Workflow:**
1. Checkout `backend` branch: `git checkout backend`
2. Create `database/migrations/create_zones_tables.sql`
3. Run SQL in Supabase, commit SQL script to `backend` branch
4. Create new files in `services/` directory
5. Modify `routes/fare.js`
6. Test locally
7. Commit and push to `backend` branch
8. Deploy backend from `backend` branch

**Why Combined?**
- ✅ Database setup is backend responsibility
- ✅ SQL scripts belong with backend code
- ✅ Easier to track and deploy together
- ✅ Single branch for all backend work

#### Phase 2: Frontend Implementation
**Branch:** `main`

**Files to Modify:**
- `src/components/BookingForm.tsx` - Update fare display
- `src/pages/Pricing.tsx` - Optional updates
- `src/lib/supabase.ts` - No changes (already configured)

**Workflow:**
1. Checkout `main` branch: `git checkout main`
2. Modify frontend components
3. Test locally
4. Commit and push to `main` branch
5. Build and deploy frontend from `main` branch

### Development Workflow

#### For Backend Developer

```bash
# 1. Clone repository (if not already)
git clone https://github.com/abhi-shek-02/zingcabv2.2b.git
cd zingcabv2.2b

# 2. Checkout backend branch
git checkout backend

# 3. Create feature branch (optional but recommended)
git checkout -b feature/zone-pricing-backend

# 4. Make changes
# - Create services/zoneService.js
# - Update routes/fare.js
# - Add tests

# 5. Commit changes
git add .
git commit -m "feat: implement zone-based pricing backend"

# 6. Push to backend branch
git push origin backend
# OR if using feature branch:
git push origin feature/zone-pricing-backend
# Then create PR to merge into backend branch
```

#### For Frontend Developer

```bash
# 1. Clone repository (if not already)
git clone https://github.com/abhi-shek-02/zingcabv2.2b.git
cd zingcabv2.2b

# 2. Checkout main branch
git checkout main

# 3. Create feature branch (optional but recommended)
git checkout -b feature/zone-pricing-frontend

# 4. Make changes
# - Update src/components/BookingForm.tsx
# - Update UI to show pricing type
# - Test with backend API

# 5. Commit changes
git add .
git commit -m "feat: add zone pricing display in frontend"

# 6. Push to main branch
git push origin main
# OR if using feature branch:
git push origin feature/zone-pricing-frontend
# Then create PR to merge into main branch
```

### Coordination Between Branches

#### Critical: API Contract Agreement

**Before starting development:**
1. **Backend team** defines API response structure (with `pricing_type` and `zone_info`)
2. **Frontend team** reviews and confirms API structure
3. **Both teams** agree on response format
4. **Backend** implements API first
5. **Frontend** implements UI to consume API

#### Development Order (Recommended)

**Week 1: Backend First (Combined Database + Code)**
1. Day 1-4: Backend developer works on `backend` branch
   - **Day 1-2:** Database setup (SQL scripts, table creation, data insertion)
   - **Day 3-4:** Zone service implementation, API updates, testing
   - All work committed to `backend` branch
2. Day 5: Frontend developer works on `main` branch
   - Update UI components
   - Integrate with new API response
   - Test with deployed backend API

**Why Backend First?**
- Frontend needs API response structure to implement UI
- Backend can be tested independently
- Database setup is part of backend work (logical grouping)
- Frontend can mock API responses while backend is in development
- Single branch for all backend work simplifies deployment

### Deployment Strategy

#### Backend Deployment

**Server Location:** `/var/www/api.zingcab.in`

```bash
# On server
cd /var/www/api.zingcab.in

# Pull latest backend branch
git fetch origin
git checkout backend
git pull origin backend

# Install dependencies (if needed)
npm install

# Restart backend
pm2 restart zingcab-api
```

#### Frontend Deployment

**Server Location:** `/var/www/zcab`

```bash
# On server
cd /var/www/zcab

# Pull latest main branch
git fetch origin
git checkout main
git pull origin main

# Install dependencies (if needed)
npm install

# Build production bundle
npm run build:prod

# Deploy dist/ folder to web server
# (Depends on your hosting setup)
```

### Branch Synchronization

#### Shared Files (if any)

**If you have shared files** (like database schemas, configs):
- Option 1: Keep in both branches (maintain separately)
- Option 2: Use a `shared` branch and merge into both
- Option 3: Keep in `backend` branch, frontend references it

**For this project:**
- **Database schema:** Keep in `backend` branch (SQL files in `database/migrations/`)
  - ✅ SQL scripts are part of backend work
  - ✅ All backend-related files in one branch
  - ✅ Easier to deploy and track changes
- **Environment variables:** Separate `.env` files per branch
- **No shared code files expected**

### Testing Across Branches

#### Integration Testing

**Local Testing:**
1. Backend running on `localhost:5000` (from `backend` branch)
2. Frontend running on `localhost:5173` (from `main` branch)
3. Frontend calls backend API
4. Test end-to-end flow

**Staging Testing:**
1. Deploy backend from `backend` branch to staging
2. Deploy frontend from `main` branch to staging
3. Test integration
4. Verify zone pricing works end-to-end

### Version Control Best Practices

#### Commit Messages

**Backend commits:**
```
feat(backend): add zone detection service
feat(backend): integrate zone pricing in fare calculation
fix(backend): handle edge case for zone boundaries
```

**Frontend commits:**
```
feat(frontend): display zone pricing type badge
feat(frontend): show zone information in fare breakdown
fix(frontend): update API response handling
```

#### Branch Protection

**Recommendations:**
- Protect `main` and `backend` branches
- Require PR reviews before merging
- Run tests before allowing merge
- Keep feature branches for new work

### Conflict Resolution

#### If Changes Conflict

**Scenario:** Both branches modify same file (unlikely but possible)

**Solution:**
- Frontend and backend are in separate branches
- No shared code files expected
- If conflicts occur, coordinate with team
- Use feature branches to isolate work

### Deployment Checklist

#### Backend Deployment
- [ ] Code committed to `backend` branch
- [ ] Tests passing
- [ ] Pull latest on server: `git pull origin backend`
- [ ] Install dependencies: `npm install`
- [ ] Restart service: `pm2 restart zingcab-api`
- [ ] Verify API health: `curl http://localhost:5000/health`
- [ ] Test zone pricing endpoint

#### Frontend Deployment
- [ ] Code committed to `main` branch
- [ ] Tests passing
- [ ] Pull latest on server: `git pull origin main`
- [ ] Install dependencies: `npm install`
- [ ] Build production: `npm run build:prod`
- [ ] Deploy `dist/` folder
- [ ] Verify frontend loads
- [ ] Test zone pricing display

### Rollback Strategy

#### If Backend Has Issues

```bash
# On server
cd /var/www/api.zingcab.in
git checkout backend
git log  # Find previous working commit
git reset --hard <previous-commit-hash>
pm2 restart zingcab-api
```

#### If Frontend Has Issues

```bash
# On server
cd /var/www/zcab
git checkout main
git log  # Find previous working commit
git reset --hard <previous-commit-hash>
npm run build:prod
# Redeploy dist/ folder
```

### Team Coordination

#### Daily Standup Topics

**Backend Developer:**
- What zone pricing features completed?
- Any API changes needed?
- Blockers or dependencies?

**Frontend Developer:**
- What UI components updated?
- API integration status?
- Need backend changes?

#### Communication Protocol

1. **API Changes**: Backend must communicate API response changes
2. **UI Requirements**: Frontend must communicate UI needs
3. **Breaking Changes**: Coordinate before deploying
4. **Testing**: Test together before production deployment

---

## 🗄️ Database Schema

### Table 1: `zones`

**Purpose**: Store zone definitions (city centers with coordinates)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique zone identifier |
| zone_name | TEXT | NOT NULL, UNIQUE | Zone name (e.g., "Kolkata", "Kharagpur") |
| center_lat | NUMERIC(10,7) | NOT NULL | Latitude of zone center |
| center_lng | NUMERIC(10,7) | NOT NULL | Longitude of zone center |
| radius_km | NUMERIC(5,2) | NOT NULL, DEFAULT 20 | Radius in kilometers (default 20km) |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Whether zone is active |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Index on `zone_name` for quick lookups
- Index on `is_active` for filtering active zones

**Sample Data:**
```
Kolkata: lat=22.5726, lng=88.3639, radius=20km
Kharagpur: lat=22.3460, lng=87.2320, radius=20km
Digha: lat=21.6269, lng=87.5090, radius=20km
Durgapur: lat=23.5204, lng=87.3119, radius=20km
```

### Table 2: `zone_pricing`

**Purpose**: Store fixed prices for zone-to-zone routes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique pricing entry ID |
| from_zone_id | UUID | NOT NULL, FK → zones.id | Source zone |
| to_zone_id | UUID | NOT NULL, FK → zones.id | Destination zone |
| car_type | TEXT | NOT NULL | Car type (sedan, suv, hatchback, etc.) |
| fixed_price | NUMERIC(10,2) | NOT NULL | Fixed price in INR |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Whether pricing is active |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Composite index on `(from_zone_id, to_zone_id, car_type)` for fast lookups
- Index on `is_active` for filtering

**Business Rules:**
- Pricing is bidirectional: If A→B exists, B→A should have same price
- Can store both directions or use lookup logic to find reverse
- Different prices for different car types

**Sample Data:**
```
Kolkata → Kharagpur, sedan: ₹2,399
Kolkata → Kharagpur, suv: ₹3,499
Kolkata → Digha, sedan: ₹3,699
Kolkata → Digha, suv: ₹4,499
```

### Table 3: `zone_pricing_log` (Optional - for analytics)

**Purpose**: Log which pricing method was used for analytics

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| booking_id | VARCHAR | Reference to booking |
| pricing_method | TEXT | 'zone_based' or 'distance_based' |
| from_zone | TEXT | Pickup zone (if zone-based) |
| to_zone | TEXT | Drop zone (if zone-based) |
| distance_km | NUMERIC | Actual distance |
| created_at | TIMESTAMP | Log timestamp |

---

## 🔧 Backend Implementation Plan

### Phase 1: Database Setup

#### Step 1.1: Create Zones Table
- Create `zones` table in Supabase
- Add indexes for performance
- Insert initial zone data (Kolkata, Kharagpur, Digha, Durgapur, etc.)
- Set up auto-update trigger for `updated_at`

#### Step 1.2: Create Zone Pricing Table
- Create `zone_pricing` table in Supabase
- Add foreign key constraints
- Add composite index for fast lookups
- Insert pricing data from Pricing.tsx routes

#### Step 1.3: Create Helper Functions
- Function: `get_zone_from_coordinates(lat, lng)` → Returns zone name or null
- Function: `calculate_distance_km(lat1, lng1, lat2, lng2)` → Returns distance
- Function: `get_zone_pricing(from_zone, to_zone, car_type)` → Returns price

### Phase 2: Core Zone Detection Logic

#### Step 2.1: Create Zone Service Module
**File**: `services/zoneService.js`

**Functions to implement:**
1. `detectZone(lat, lng)` 
   - Input: Coordinates
   - Process: Calculate distance to all active zone centers
   - Output: Zone name if within radius, null otherwise
   - Algorithm: Haversine formula for distance calculation

2. `getZonePricing(fromZone, toZone, carType)`
   - Input: Zone names and car type
   - Process: Query zone_pricing table (check both directions)
   - Output: Fixed price or null

3. `calculateZoneBasedFare(pickupLat, pickupLng, dropLat, dropLng, carType)`
   - Input: Coordinates and car type
   - Process: 
     - Detect pickup zone
     - Detect drop zone
     - If both zones exist → get zone pricing
     - Return result with pricing method
   - Output: { fare, pricing_method, from_zone, to_zone } or null

#### Step 2.2: Distance Calculation
- Implement Haversine formula for accurate distance calculation
- Handle edge cases (same location, invalid coordinates)
- Cache zone centers in memory for performance

### Phase 3: Integrate with Existing Fare Logic

#### Step 3.1: Modify Fare Route
**File**: `routes/fare.js`

**Changes:**
1. Import zone service
2. In `/estimate` endpoint:
   - First, try zone-based pricing (if coordinates provided)
   - If zone pricing returns null → fallback to distance-based
   - Return pricing method in response

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "selected_car": {
      "car_type": "sedan",
      "estimated_fare": 2399,
      "km_limit": 120,
      "pricing_type": "zone_based",  // NEW
      "zone_info": {                  // NEW
        "pickup_zone": "Kolkata",
        "drop_zone": "Kharagpur"
      }
    },
    "all_car_fares": {...},
    "service_details": {...}
  }
}
```

#### Step 3.2: Update Booking Route
**File**: `routes/booking.js`

**Changes:**
- Store pricing method in booking record
- Store zone information if zone-based pricing was used
- This helps with analytics and customer support

### Phase 4: API Enhancements

#### Step 4.1: Update Fare Estimate Endpoint
- Accept `pickup_lat`, `pickup_lng`, `drop_lat`, `drop_lng` in request
- These are already being sent from frontend (from OLA API)
- Use these coordinates for zone detection

#### Step 4.2: Add Zone Information Endpoint (Optional)
**Endpoint**: `GET /api/zones`
- Returns list of all active zones
- Can be used by frontend to show zone coverage
- Useful for admin dashboard

### Phase 5: Error Handling & Edge Cases

#### Step 5.1: Handle Edge Cases
- Location exactly on 20km boundary → Include in zone
- Location between two zones → Use closest zone
- Same zone for pickup and drop → Use distance-based (local travel)
- Invalid coordinates → Fallback to distance-based
- Zone pricing not found → Fallback to distance-based

#### Step 5.2: Logging
- Log zone detection results for debugging
- Log pricing method used for analytics
- Log edge cases for monitoring

---

## 🎨 Frontend Implementation Plan

### Phase 1: Update Booking Form

#### Step 1.1: Ensure Coordinates are Sent
**File**: `src/components/BookingForm.tsx`

**Current State**: Already sending `pickup_lat`, `pickup_lng`, `drop_lat`, `drop_lng`

**Verification:**
- Confirm coordinates are being captured from OLA API
- Ensure coordinates are included in fare estimate API call
- Ensure coordinates are included in booking API call

#### Step 1.2: Display Pricing Type
**Location**: After fare calculation, before booking button

**UI Component:**
- Badge/indicator showing pricing method
- Zone names if zone-based pricing
- Color coding: Blue for zone-based, Green for distance-based

**Example:**
```
Fare Estimate: ₹2,399
🎯 Zone-Based Pricing
Kolkata → Kharagpur
```

### Phase 2: Update Fare Display

#### Step 2.1: Enhance Fare Breakdown
**File**: `src/components/BookingForm.tsx`

**Changes:**
- Show pricing type badge
- Show zone information if available
- Keep existing fare breakdown display
- Add tooltip explaining zone vs distance pricing

#### Step 2.2: Update Pricing Page
**File**: `src/pages/Pricing.tsx`

**Changes:**
- Add indicator showing which routes have zone pricing
- Can keep existing hardcoded routes for display
- Add note: "Fixed zone-based pricing available"

### Phase 3: User Experience Enhancements

#### Step 3.1: Zone Coverage Indicator (Optional)
- Show map or list of zones covered
- Help users understand if their route qualifies
- Can be added in About or Services page

#### Step 3.2: Pricing Transparency
- Clear explanation of zone vs distance pricing
- FAQ section explaining the difference
- Help users understand when they get fixed prices

---

## 📡 API Specifications

### Updated Endpoint: POST `/api/fare/estimate`

#### Request Body
```json
{
  "service_type": "oneway",
  "pick_up_location": "Kolkata, West Bengal, India",
  "drop_location": "Kharagpur, West Bengal, India",
  "pick_up_time": "2025-12-16T09:00:00",
  "km_limit": 120,
  "car_type": "sedan",
  "journey_date": "2025-12-16",
  "mobile_number": "7003848501",
  "booking_source": "website",
  "pickup_lat": 22.5726,      // NEW - from OLA API
  "pickup_lng": 88.3639,      // NEW - from OLA API
  "drop_lat": 22.3460,        // NEW - from OLA API
  "drop_lng": 87.2320         // NEW - from OLA API
}
```

#### Response Body (Zone-Based Pricing)
```json
{
  "success": true,
  "data": {
    "selected_car": {
      "car_type": "sedan",
      "estimated_fare": 2399,
      "km_limit": 120,
      "pricing_type": "zone_based",
      "zone_info": {
        "pickup_zone": "Kolkata",
        "drop_zone": "Kharagpur"
      },
      "breakdown": {
        "base_fare": 2399,
        "zone_pricing_applied": true
      }
    },
    "all_car_fares": {
      "sedan": {
        "estimated_fare": 2399,
        "km_limit": 120,
        "pricing_type": "zone_based"
      },
      "suv": {
        "estimated_fare": 3499,
        "km_limit": 120,
        "pricing_type": "zone_based"
      }
    },
    "service_details": {
      "service_type": "oneway",
      "pricing_logic": "zone_based",
      "distance": 120
    }
  }
}
```

#### Response Body (Distance-Based Pricing - Fallback)
```json
{
  "success": true,
  "data": {
    "selected_car": {
      "car_type": "sedan",
      "estimated_fare": 3578,
      "km_limit": 180.68,
      "pricing_type": "distance_based",
      "zone_info": {
        "pickup_zone": null,
        "drop_zone": null
      }
    },
    "service_details": {
      "service_type": "oneway",
      "pricing_logic": "distance_based",
      "distance": 180.68
    }
  }
}
```

---

## ⚠️ Edge Cases & Business Rules

### Edge Case 1: Location on Zone Boundary
**Scenario**: Location is exactly 20.0km or 20.1km from zone center

**Rule**: 
- If distance ≤ 20km → Include in zone
- If distance > 20km → Outside zone, use distance-based pricing
- Use strict 20km threshold (no buffer)

### Edge Case 2: Location Between Two Zones
**Scenario**: Location is within 20km of multiple zones

**Rule**:
- Use closest zone (minimum distance)
- If distances are equal → Use first zone found
- Log for monitoring

### Edge Case 3: Same Zone for Pickup and Drop
**Scenario**: Both locations are in the same zone (e.g., both in Kolkata zone)

**Rule**:
- Use distance-based pricing (local travel within zone)
- Zone pricing is only for inter-zone travel
- Return `pricing_type: "distance_based"` with note

### Edge Case 4: One Location in Zone, Other Outside
**Scenario**: Pickup in zone, drop outside (or vice versa)

**Rule**:
- Use distance-based pricing
- Zone pricing requires both locations in zones
- Return `pricing_type: "distance_based"`

### Edge Case 5: Zone Pricing Not Found
**Scenario**: Both in zones, but pricing not defined for that route

**Rule**:
- Fallback to distance-based pricing
- Log missing zone pricing for admin review
- Return `pricing_type: "distance_based"` with warning

### Edge Case 6: Invalid Coordinates
**Scenario**: Missing or invalid lat/lng values

**Rule**:
- Fallback to distance-based pricing
- Use location names for distance calculation (existing logic)
- Log coordinate issues

### Edge Case 7: Bidirectional Pricing
**Scenario**: User books Kharagpur → Kolkata (reverse route)

**Rule**:
- Lookup pricing for both directions
- If A→B exists, use same price for B→A
- Store both directions in database or use lookup logic

### Business Rules Summary

1. **Zone Detection**: 20km radius, strict boundary (≤20km = in zone)
2. **Pricing Priority**: Zone pricing first, distance-based fallback
3. **Bidirectional**: Same price for A→B and B→A
4. **Same Zone**: Always use distance-based (local travel)
5. **Partial Match**: Always use distance-based (one location outside zone)
6. **Missing Pricing**: Fallback to distance-based, log for admin

---

## 🧪 Testing Strategy

### Unit Tests

#### Backend Tests
1. **Zone Detection Tests**
   - Location within 20km → Returns zone name
   - Location at exactly 20km → Returns zone name
   - Location at 20.1km → Returns null
   - Location between zones → Returns closest zone
   - Invalid coordinates → Returns null

2. **Zone Pricing Tests**
   - Valid zone pair → Returns price
   - Reverse zone pair → Returns same price
   - Missing pricing → Returns null
   - Inactive pricing → Returns null

3. **Fare Calculation Tests**
   - Both in zones with pricing → Returns zone price
   - Both in zones without pricing → Returns distance price
   - One in zone → Returns distance price
   - Neither in zone → Returns distance price
   - Same zone → Returns distance price

### Integration Tests

1. **API Endpoint Tests**
   - Test `/api/fare/estimate` with zone coordinates
   - Test `/api/fare/estimate` with non-zone coordinates
   - Test `/api/fare/estimate` with missing coordinates
   - Verify response structure includes pricing_type

2. **Database Tests**
   - Test zone lookup queries
   - Test zone pricing queries
   - Test bidirectional lookup
   - Test performance with 50+ zones

### Manual Testing Checklist

#### Test Case 1: Zone-Based Pricing (Happy Path)
- [ ] Select Kolkata as pickup (within zone)
- [ ] Select Kharagpur as drop (within zone)
- [ ] Verify zone pricing is applied
- [ ] Verify correct price displayed (₹2,399 for sedan)
- [ ] Verify "Zone-Based Pricing" badge shown
- [ ] Verify zone names displayed

#### Test Case 2: Distance-Based Pricing (Fallback)
- [ ] Select location outside all zones
- [ ] Select another location outside zones
- [ ] Verify distance-based pricing is applied
- [ ] Verify "Distance-Based Pricing" badge shown
- [ ] Verify fare calculated correctly

#### Test Case 3: Partial Zone Match
- [ ] Select Kolkata (in zone) as pickup
- [ ] Select location 25km from any zone as drop
- [ ] Verify distance-based pricing is applied
- [ ] Verify correct fallback behavior

#### Test Case 4: Same Zone
- [ ] Select two locations both in Kolkata zone
- [ ] Verify distance-based pricing is applied
- [ ] Verify local travel logic works

#### Test Case 5: Bidirectional Pricing
- [ ] Test Kolkata → Kharagpur
- [ ] Test Kharagpur → Kolkata
- [ ] Verify same price for both directions

#### Test Case 6: Edge Cases
- [ ] Test location exactly at 20km boundary
- [ ] Test location between two zones
- [ ] Test missing coordinates
- [ ] Test invalid coordinates

### Performance Tests

1. **Zone Detection Performance**
   - Test with 50+ zones
   - Target: < 100ms per detection
   - Test concurrent requests

2. **Database Query Performance**
   - Test zone lookup queries
   - Test zone pricing queries
   - Verify indexes are used
   - Target: < 50ms per query

3. **End-to-End Performance**
   - Test full fare calculation flow
   - Target: < 500ms total response time
   - Test under load (1000+ concurrent)

---

## 🚀 Rollout Plan

### Phase 1: Development & Testing (Week 1)

#### Day 1-4: Backend Implementation (Database + Code)
**Branch:** `backend`  
**Location:** `/var/www/api.zingcab.in` (on server) + Supabase Dashboard

**Setup:**
```bash
# Checkout backend branch
git checkout backend
```

**Day 1-2: Database Setup**
- Create SQL script: `database/migrations/create_zones_tables.sql`
- Create zones table in Supabase (run SQL script)
- Create zone_pricing table in Supabase
- Add indexes for performance
- Add foreign key constraints
- Add triggers for updated_at
- Insert initial zone data (5-10 zones: Kolkata, Kharagpur, Digha, Durgapur, etc.)
- Insert initial pricing data (from Pricing.tsx routes)
- Test database queries
- Verify indexes and performance
- Commit SQL scripts to `backend` branch

**Day 3-4: Backend Code Implementation**
- Create `services/zoneService.js` with zone detection logic
- Implement Haversine distance calculation
- Implement zone pricing lookup function
- Update `routes/fare.js` to integrate zone pricing
- Add `pricing_type` and `zone_info` to API response
- Handle edge cases (boundaries, same zone, etc.)
- Add logging for analytics
- Write unit tests
- Test API endpoints locally
- Commit and push to `backend` branch

**Why Combined?**
- Database setup is part of backend work
- SQL scripts belong in backend branch
- All backend-related work in one place
- Easier to track and deploy together

#### Day 5: Frontend Updates
**Branch:** `main`  
**Location:** `/var/www/zcab` (on server)

**Setup:**
```bash
# Checkout main branch
git checkout main
```

**Tasks:**
- Update `src/components/BookingForm.tsx` to display pricing type
- Add zone information display in fare breakdown
- Add pricing type badge/indicator (Zone-Based / Distance-Based)
- Update `src/pages/Pricing.tsx` (optional - add zone pricing note)
- Add tooltips/explanations for pricing types
- Test with backend API (ensure backend is deployed first)
- Integration tests
- Commit and push to `main` branch

### Phase 2: Staging Testing (Week 2)

#### Day 1-3: Comprehensive Testing
- Run all test cases
- Performance testing
- Edge case testing
- Bug fixes

#### Day 4-5: Stakeholder Review
- Demo to team
- Gather feedback
- Final adjustments

### Phase 3: Production Rollout (Week 3)

#### Day 1: Soft Launch

**Backend Deployment** (`backend` branch):
```bash
# On server
cd /var/www/api.zingcab.in
git checkout backend
git pull origin backend
npm install  # if new dependencies
pm2 restart zingcab-api
```

**Frontend Deployment** (`main` branch):
```bash
# On server
cd /var/www/zcab
git checkout main
git pull origin main
npm install  # if new dependencies
npm run build:prod
# Deploy dist/ folder
```

**Actions:**
- Deploy backend first (API must be ready)
- Deploy frontend after backend is live
- Enable for 10% of traffic (if using feature flags)
- Monitor logs and errors
- Verify zone detection accuracy
- Test end-to-end flow

#### Day 2-3: Gradual Rollout

**Monitoring:**
- Check backend logs: `pm2 logs zingcab-api`
- Check frontend console for errors
- Monitor API response times
- Check zone detection accuracy
- Review customer feedback

**If Issues Found:**
- Backend issues → Fix in `backend` branch, redeploy
- Frontend issues → Fix in `main` branch, rebuild and redeploy
- Database issues → Fix in Supabase, no code deployment needed

**Actions:**
- Increase to 50% of traffic (if using feature flags)
- Monitor performance metrics
- Check customer feedback
- Fix any issues found
- Document learnings

#### Day 4-5: Full Launch

**Final Deployment:**
- Ensure all fixes are deployed
- Enable for 100% of traffic
- Monitor closely for first 24 hours
- Document any issues
- Update documentation
- Celebrate! 🎉

**Post-Launch:**
- Monitor zone pricing adoption rate
- Track revenue impact
- Gather customer feedback
- Plan for zone expansion

### Rollback Plan

**If issues occur:**
1. Disable zone pricing feature flag
2. All requests fallback to distance-based pricing
3. Investigate issues
4. Fix and re-deploy

**Feature Flag:**
- Add `ENABLE_ZONE_PRICING=true/false` in .env
- Easy to toggle without code changes

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

#### Business Metrics
1. **Zone Pricing Adoption Rate**
   - Target: 30% of bookings use zone pricing
   - Measure: % of bookings with pricing_type = "zone_based"

2. **Revenue Impact**
   - Target: 5-10% increase in margin on zone routes
   - Measure: Compare zone pricing routes vs distance-based

3. **Customer Satisfaction**
   - Target: Positive feedback on fixed pricing
   - Measure: Customer reviews, support tickets

#### Technical Metrics
1. **API Performance**
   - Target: < 500ms response time
   - Measure: Average response time for fare estimate

2. **Zone Detection Accuracy**
   - Target: 99.9% accuracy
   - Measure: % of correct zone detections

3. **System Reliability**
   - Target: 99.9% uptime
   - Measure: Error rate, downtime

### Monitoring & Analytics

#### What to Monitor
1. **Zone Detection Rate**: How many requests qualify for zone pricing
2. **Fallback Rate**: How often distance-based is used
3. **Missing Pricing**: Routes that should have zone pricing but don't
4. **Performance Metrics**: Response times, query performance
5. **Error Rates**: Zone detection errors, pricing lookup errors

#### Analytics Dashboard
- Zone pricing usage by route
- Revenue comparison (zone vs distance)
- Popular zone routes
- Routes needing zone pricing

---

## 📝 Implementation Checklist

### Backend Checklist (`backend` branch)

**Branch:** `backend`  
**Location:** `/var/www/api.zingcab.in` on server

- [x] **Database Setup** ✅ COMPLETED
  - [x] Create zones table in Supabase (SQL script in backend branch)
  - [x] Create zone_pricing table in Supabase
  - [x] Add indexes for performance
  - [x] Add foreign key constraints
  - [x] Add triggers for updated_at
  - [x] Insert initial zone data (Kolkata, Kharagpur, Digha, Durgapur, etc.) - 15 zones
  - [x] Insert zone pricing data from Pricing.tsx - All routes with bidirectional pricing
  - [x] Verify data integrity - SQL script includes validation
  - [x] Test queries performance ✅ Database deployed and tested

- [x] **Code Implementation** ✅ COMPLETED
  - [x] Create `services/zoneService.js` with zone detection logic
  - [x] Implement Haversine distance calculation
  - [x] Implement `getZonePricing()` function with bidirectional lookup
  - [x] Update `routes/fare.js` to use zone pricing
  - [x] Add `pricing_type` to API response
  - [x] Add `zone_info` to API response
  - [x] Handle edge cases (boundaries, same zone, invalid coordinates, etc.)
  - [x] Add logging for analytics

- [x] **Testing** ✅ COMPLETED
  - [x] Write unit tests for zone detection - Test cases documented in TEST_CASES.md
  - [x] Write unit tests for zone pricing lookup - Test cases documented
  - [x] Write integration tests for API endpoints - Automated test script created (test_zone_pricing.sh)
  - [x] Local testing completed - All 8 tests passed (100%)
  - [x] Performance testing (< 500ms response time) - ✅ PASS: Average 0.45s (cached)
  - [x] Price verification - ✅ PASS: Sedan ₹2399, SUV ₹3499 (correct)
  - [x] Response structure validation - ✅ PASS: All fields present

- [ ] **Deployment**
  - [ ] Commit changes to `backend` branch
  - [ ] Push to remote: `git push origin backend`
  - [ ] On server: `cd /var/www/api.zingcab.in && git pull origin backend`
  - [ ] Restart backend: `pm2 restart zingcab-api`
  - [ ] Verify API health: `curl http://localhost:5000/health`

### Frontend Checklist (`main` branch)

**Branch:** `main`  
**Location:** `/var/www/zcab` on server

- [ ] **Code Implementation**
  - [ ] Verify coordinates are being sent to API (already done)
  - [ ] Update `src/components/BookingForm.tsx` to display pricing_type
  - [ ] Add zone information display in fare breakdown
  - [ ] Add pricing type badge/indicator (Zone-Based / Distance-Based)
  - [ ] Update `src/pages/Pricing.tsx` (optional - add zone pricing note)
  - [ ] Add tooltips/explanations for pricing types

- [ ] **Testing**
  - [ ] Test UI on mobile and desktop
  - [ ] Test all edge cases in UI
  - [ ] Test with backend API (integration testing)
  - [ ] Verify zone pricing badge displays correctly
  - [ ] Verify distance-based pricing badge displays correctly

- [ ] **Deployment**
  - [ ] Commit changes to `main` branch
  - [ ] Push to remote: `git push origin main`
  - [ ] On server: `cd /var/www/zcab && git pull origin main`
  - [ ] Build production: `npm run build:prod`
  - [ ] Deploy `dist/` folder to web server
  - [ ] Verify frontend loads and works correctly

### Cross-Branch Coordination Checklist

- [ ] **API Contract Agreement**
  - [ ] Backend team defines API response structure
  - [ ] Frontend team reviews and confirms
  - [ ] Both teams agree on response format
  - [ ] Document API changes

- [ ] **Development Coordination**
  - [ ] Backend team works on `backend` branch (Week 1, Day 1-4)
    - [ ] Database setup + Backend code (combined in one branch)
    - [ ] SQL scripts committed to `backend` branch
    - [ ] Backend API ready and tested
  - [ ] Frontend team works on `main` branch (Week 1, Day 5)
    - [ ] Frontend implements UI after backend API is ready
    - [ ] Frontend can test with deployed backend API
  - [ ] Both teams test integration together
  - [ ] Coordinate deployment timing (backend first, then frontend)

- [ ] **Testing Coordination**
  - [ ] Backend tests API independently
  - [ ] Frontend tests with mock API responses
  - [ ] Integration testing with both deployed
  - [ ] End-to-end testing before production

### Deployment Checklist

- [ ] **Backend Deployment** (`backend` branch)
  - [ ] Code committed and pushed to `backend` branch
  - [ ] Tests passing
  - [ ] Update `.env.production` if needed
  - [ ] Pull latest on server: `cd /var/www/api.zingcab.in && git pull origin backend`
  - [ ] Install dependencies: `npm install`
  - [ ] Restart service: `pm2 restart zingcab-api`
  - [ ] Verify API health: `curl http://localhost:5000/health`
  - [ ] Test zone pricing endpoint

- [ ] **Frontend Deployment** (`main` branch)
  - [ ] Code committed and pushed to `main` branch
  - [ ] Tests passing
  - [ ] Update `.env.production` if needed
  - [ ] Pull latest on server: `cd /var/www/zcab && git pull origin main`
  - [ ] Install dependencies: `npm install`
  - [ ] Build production: `npm run build:prod`
  - [ ] Deploy `dist/` folder
  - [ ] Verify frontend loads
  - [ ] Test zone pricing display

- [ ] **Integration Verification**
  - [ ] Test end-to-end flow (frontend → backend → database)
  - [ ] Verify zone pricing works correctly
  - [ ] Verify fallback to distance-based works
  - [ ] Monitor logs for errors
  - [ ] Check performance metrics

---

## 🔐 Security & Privacy Considerations

### Data Privacy
- Zone centers are public data (city coordinates)
- No PII stored in zone tables
- Pricing data is business information (not sensitive)

### Access Control
- Zone and pricing data: Admin-only access
- Read access for API (anon/authenticated roles)
- Write access: Service role only

### Rate Limiting
- Zone detection queries: Rate limit to prevent abuse
- Pricing lookup: Cache results for performance

---

## 📚 Documentation Requirements

### Technical Documentation
- [ ] API documentation update
- [ ] Database schema documentation
- [ ] Zone service code documentation
- [ ] Deployment guide

### User Documentation
- [ ] FAQ about zone vs distance pricing
- [ ] Help article explaining pricing
- [ ] Customer support training

### Admin Documentation
- [ ] How to add new zones
- [ ] How to update zone pricing
- [ ] How to monitor zone pricing usage

---

## 🎯 Future Enhancements (Post-Launch)

### Phase 2 Features
1. **Dynamic Zone Pricing**: Time-based pricing (peak/off-peak)
2. **Zone Expansion**: Add more zones based on demand
3. **Admin Dashboard**: UI to manage zones and pricing
4. **Zone Analytics**: Detailed analytics on zone usage
5. **A/B Testing**: Test different pricing strategies

### Phase 3 Features
1. **Predictive Pricing**: ML-based pricing optimization
2. **Demand-Based Pricing**: Adjust prices based on demand
3. **Multi-Zone Routes**: Support for routes with multiple zones
4. **Zone Recommendations**: Suggest zones to customers

---

## ✅ Acceptance Criteria

### Must Have (P0)
- [ ] Zone detection works accurately (20km radius)
- [ ] Zone pricing lookup works for defined routes
- [ ] Fallback to distance-based pricing works
- [ ] Pricing type is displayed to users
- [ ] Bidirectional pricing works (A→B = B→A)
- [ ] API response time < 500ms
- [ ] All edge cases handled correctly

### Should Have (P1)
- [ ] Zone information displayed in UI
- [ ] Clear pricing type indicators
- [ ] Analytics logging implemented
- [ ] Performance optimized

### Nice to Have (P2)
- [ ] Admin dashboard for zone management
- [ ] Zone coverage map
- [ ] Advanced analytics

---

## 👥 Team Responsibilities

### Backend Developer
- **Database Setup** (on `backend` branch)
  - Create database schema (zones, zone_pricing tables)
  - Write SQL migration scripts
  - Insert initial zone and pricing data
- **Code Implementation** (on `backend` branch)
  - Implement zone detection service
  - Integrate with fare calculation
  - Database queries and optimization
  - API updates
- **Testing**
  - Unit tests for zone detection
  - Integration tests for API endpoints
  - Performance testing

### Frontend Developer
- Update UI to show pricing type
- Display zone information
- Update BookingForm component
- Testing

### Product Manager
- Define zones and pricing
- Review and approve implementation
- Coordinate testing
- Monitor metrics

### QA Engineer
- Test all scenarios
- Edge case testing
- Performance testing
- User acceptance testing

---

## 📞 Support & Maintenance

### Ongoing Maintenance
- Monitor zone detection accuracy
- Add new zones as business expands
- Update pricing as needed
- Performance optimization
- Bug fixes

### Support Escalation
- Zone detection issues → Backend team
- Pricing display issues → Frontend team
- Database issues → Backend/DBA team
- Business logic questions → Product team

---

## 📅 Timeline Summary

| Phase | Duration | Branch | Key Deliverables |
|-------|----------|--------|------------------|
| Backend Development | Week 1, Day 1-4 | `backend` | Database setup + Backend API implementation |
| Frontend Development | Week 1, Day 5 | `main` | Frontend UI updates |
| Testing | Week 2 | Both branches | Comprehensive testing, bug fixes |
| Rollout | Week 3 | Both branches | Gradual production rollout |

**Total Timeline: 3 weeks**

**Note:** Database setup and backend code are combined in the `backend` branch for better organization and easier deployment.

---

## 🎉 Success Definition

**The feature is successful when:**
1. Zone-based pricing works accurately for defined routes
2. 30%+ of bookings use zone pricing
3. Customer feedback is positive
4. System performance is maintained (< 500ms)
5. No critical bugs in production
6. Easy to add new zones and pricing

---

**Document Version:** 1.1  
**Last Updated:** December 16, 2024  
**Owner:** Product Team  
**Status:** Backend Implementation Complete ✅

## 🎯 Implementation Status

### ✅ Backend Implementation (COMPLETED)
- **Database Schema:** ✅ SQL migration script created with zones and zone_pricing tables
- **Database Deployment:** ✅ SQL migration executed in Supabase - zones and zone_pricing tables created
- **Zone Service:** ✅ Complete with Haversine distance calculation, zone detection, and bidirectional pricing lookup
- **Fare Route:** ✅ Integrated zone pricing with distance-based fallback
- **API Response:** ✅ Includes pricing_type and zone_info fields
- **Edge Cases:** ✅ All handled (same zone, invalid coordinates, missing pricing, etc.)
- **Error Handling:** ✅ Comprehensive error handling and logging
- **Documentation:** ✅ BACKEND_README.md and TEST_CASES.md created

### ✅ Local Testing (COMPLETED)
- **Test Results:** 8/8 tests passed (100%)
- **Zone-Based Pricing:** ✅ Working correctly (₹2399 sedan, ₹3499 SUV)
- **Bidirectional Pricing:** ✅ Working correctly
- **Distance-Based Fallback:** ✅ Working correctly
- **Error Handling:** ✅ Working correctly (400 for invalid input)
- **Performance:** ✅ Acceptable (< 500ms after cache warm-up)
- **Response Structure:** ✅ Correct (includes pricing_type and zone_info)

### ⏳ Pending
- **Server Deployment:** Code tested and ready, needs deployment to production server
- **Frontend Integration:** Pending (on `main` branch)
- **Production Testing:** Re-run tests after deployment

### 📋 Test Cases
- **Test Script:** `test_zone_pricing.sh` created with 8 comprehensive test cases
- **Test Documentation:** `TEST_CASES.md` with 14 detailed test scenarios
- **Ready for Testing:** Once server is deployed, run `./test_zone_pricing.sh [base_url]`

---

*This document is a living document and will be updated as implementation progresses.*

