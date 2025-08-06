const fs = require('fs');
const path = require('path');

// Load routes configuration
const routes = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/routes.json'), 'utf8'));

// Season definitions
const SEASONS = {
  summer: { start: 3, end: 6 }, // March to June
  monsoon: { start: 7, end: 9 }, // July to September
  winter: { start: 12, end: 2 } // December to February
};

// Event definitions
const EVENTS = {
  beach_season: { start: '03-01', end: '06-30' },
  religious_festival: { start: '10-01', end: '11-30' },
  iskcon_festival: { start: '02-01', end: '03-31' },
  makar_sankranti: { start: '01-10', end: '01-20' }
};

// Time slot definitions
const TIME_SLOTS = {
  peak_hours: { start: 7, end: 10 }, // 7 AM to 10 AM
  evening_peak: { start: 17, end: 20 } // 5 PM to 8 PM
};

/**
 * Get current season based on date
 */
function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1; // 0-indexed to 1-indexed
  
  for (const [season, range] of Object.entries(SEASONS)) {
    if (range.start <= range.end) {
      // Same year season
      if (month >= range.start && month <= range.end) {
        return season;
      }
    } else {
      // Cross-year season (like winter: Dec-Feb)
      if (month >= range.start || month <= range.end) {
        return season;
      }
    }
  }
  
  return null; // No specific season
}

/**
 * Check if current date falls in an event period
 */
function getCurrentEvents(date = new Date()) {
  const currentEvents = [];
  const currentMonth = date.getMonth() + 1;
  const currentDay = date.getDate();
  
  for (const [eventName, period] of Object.entries(EVENTS)) {
    const [startMonth, startDay] = period.start.split('-').map(Number);
    const [endMonth, endDay] = period.end.split('-').map(Number);
    
    if (startMonth <= endMonth) {
      // Same year period
      if ((currentMonth === startMonth && currentDay >= startDay) ||
          (currentMonth === endMonth && currentDay <= endDay) ||
          (currentMonth > startMonth && currentMonth < endMonth)) {
        currentEvents.push(eventName);
      }
    } else {
      // Cross-year period
      if ((currentMonth >= startMonth && currentDay >= startDay) ||
          (currentMonth <= endMonth && currentDay <= endDay)) {
        currentEvents.push(eventName);
      }
    }
  }
  
  return currentEvents;
}

/**
 * Check if current time falls in a time slot
 */
function getCurrentTimeSlot(time) {
  const hour = parseInt(time.split(':')[0]);
  
  for (const [slotName, range] of Object.entries(TIME_SLOTS)) {
    if (hour >= range.start && hour <= range.end) {
      return slotName;
    }
  }
  
  return null;
}

/**
 * Find fixed route with enhanced pricing logic
 */
function findFixedRoute(startZone, endZone, serviceType, carType, options = {}) {
  const {
    date = new Date(),
    time = '09:00',
    demandLevel = 'normal'
  } = options;
  
  // Find matching route
  const route = routes.find(r => 
    r.start === startZone && 
    r.end === endZone && 
    r.service_type === serviceType &&
    r.active === true
  );
  
  if (!route) {
    return null;
  }
  
  // Get base fare
  let fare = route.fares[carType];
  if (!fare) {
    return null;
  }
  
  // Apply seasonal pricing
  const currentSeason = getCurrentSeason(date);
  if (route.conditions?.seasonal?.[currentSeason]?.[carType]) {
    fare = route.conditions.seasonal[currentSeason][carType];
  }
  
  // Apply event-based pricing
  const currentEvents = getCurrentEvents(date);
  for (const event of currentEvents) {
    if (route.conditions?.events?.[event]?.[carType]) {
      fare = route.conditions.events[event][carType];
      break; // Use the first matching event
    }
  }
  
  // Apply time-based pricing
  const currentTimeSlot = getCurrentTimeSlot(time);
  if (route.conditions?.time_slots?.[currentTimeSlot]?.[carType]) {
    fare = route.conditions.time_slots[currentTimeSlot][carType];
  }
  
  return {
    route_id: route.id,
    route_type: route.route_type,
    base_fare: route.fares[carType],
    final_fare: fare,
    pricing_type: 'fixed_route',
    conditions_applied: {
      season: currentSeason,
      events: currentEvents,
      time_slot: currentTimeSlot
    },
    route_priority: route.priority
  };
}

/**
 * Get all routes for a specific route type
 */
function getRoutesByType(routeType) {
  return routes.filter(route => route.route_type === routeType && route.active);
}

/**
 * Get all active routes
 */
function getAllActiveRoutes() {
  return routes.filter(route => route.active);
}

/**
 * Add a new route
 */
function addRoute(routeData) {
  const newRoute = {
    id: routeData.id || `${routeData.start}-${routeData.end}`,
    ...routeData,
    active: true
  };
  
  routes.push(newRoute);
  saveRoutes();
  return newRoute;
}

/**
 * Update an existing route
 */
function updateRoute(routeId, updates) {
  const routeIndex = routes.findIndex(r => r.id === routeId);
  if (routeIndex === -1) {
    throw new Error(`Route with ID ${routeId} not found`);
  }
  
  routes[routeIndex] = { ...routes[routeIndex], ...updates };
  saveRoutes();
  return routes[routeIndex];
}

/**
 * Deactivate a route
 */
function deactivateRoute(routeId) {
  return updateRoute(routeId, { active: false });
}

/**
 * Activate a route
 */
function activateRoute(routeId) {
  return updateRoute(routeId, { active: true });
}

/**
 * Delete a route
 */
function deleteRoute(routeId) {
  const routeIndex = routes.findIndex(r => r.id === routeId);
  if (routeIndex === -1) {
    throw new Error(`Route with ID ${routeId} not found`);
  }
  
  routes.splice(routeIndex, 1);
  saveRoutes();
  return true;
}

/**
 * Save routes to file
 */
function saveRoutes() {
  fs.writeFileSync(
    path.join(__dirname, '../config/routes.json'),
    JSON.stringify(routes, null, 2)
  );
}

/**
 * Get route statistics
 */
function getRouteStats() {
  const stats = {
    total_routes: routes.length,
    active_routes: routes.filter(r => r.active).length,
    route_types: {},
    seasonal_routes: 0,
    event_based_routes: 0,
    time_based_routes: 0
  };
  
  routes.forEach(route => {
    // Count by route type
    stats.route_types[route.route_type] = (stats.route_types[route.route_type] || 0) + 1;
    
    // Count routes with conditions
    if (route.conditions?.seasonal) stats.seasonal_routes++;
    if (route.conditions?.events) stats.event_based_routes++;
    if (route.conditions?.time_slots) stats.time_based_routes++;
  });
  
  return stats;
}

module.exports = {
  findFixedRoute,
  getRoutesByType,
  getAllActiveRoutes,
  addRoute,
  updateRoute,
  deactivateRoute,
  activateRoute,
  deleteRoute,
  getRouteStats,
  getCurrentSeason,
  getCurrentEvents,
  getCurrentTimeSlot
}; 