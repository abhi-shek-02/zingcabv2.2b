const fs = require('fs');
const path = require('path');
const routeManager = require('./routeManager');

// Load configurations
const zones = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/zones.json'), 'utf8'));
const carTypes = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/car_types.json'), 'utf8'));
const multipliers = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/multipliers.json'), 'utf8'));
const policy = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/policy.json'), 'utf8'));

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find zone for given coordinates (updated for district-based structure)
function findZone(lat, lng) {
  // Flatten the district-based structure to get all locations
  const allLocations = [];
  zones.forEach(district => {
    district.locations.forEach(location => {
      allLocations.push({
        name: location.name,
        center: location.center,
        radius_km: location.radius_km,
        district: district.district
      });
    });
  });

  // Find the closest zone within radius
  for (const location of allLocations) {
    const distance = calculateDistance(lat, lng, location.center.lat, location.center.lng);
    if (distance <= location.radius_km) {
      return location.name;
    }
  }
  return null; // Outside all zones
}

// Find fixed route fare using enhanced route manager
function findFixedRoute(startZone, endZone, serviceType, carType, options = {}) {
  return routeManager.findFixedRoute(startZone, endZone, serviceType, carType, options);
}

// Calculate zone-based fare
function calculateZoneBasedFare(pickupZone, dropZone, carType, distance, serviceType) {
  const car = carTypes[carType];
  if (!car) return 0;
  
  let fare = 0;
  
  if (serviceType === 'oneway' || serviceType === 'airport') {
    fare = car.base_fare + (car.per_km_oneway * distance);
  } else if (serviceType === 'roundtrip') {
    fare = car.base_fare + (car.per_km_roundtrip * distance * 2);
  } else if (serviceType === 'rental') {
    if (distance <= car.rental_included_km) {
      fare = car.rental_package;
    } else {
      const extraKm = distance - car.rental_included_km;
      fare = car.rental_package + (extraKm * car.rental_extra_per_km);
    }
  }
  
  return Math.round(fare);
}

// Apply multipliers to fare (simplified for Phase 1)
function applyMultipliers(baseFare, serviceType, isNight, isFestive) {
  // Phase 1: All multipliers disabled, return base fare
  if (!multipliers.enable_night && !multipliers.enable_festive) {
    return baseFare;
  }
  
  let finalFare = baseFare;
  
  // Apply night multiplier (if enabled)
  if (multipliers.enable_night && isNight && policy.night_charge[serviceType]) {
    const nightMultiplier = multipliers.night[serviceType];
    finalFare = finalFare * nightMultiplier;
  }
  
  // Apply festive multiplier (if enabled)
  if (multipliers.enable_festive && isFestive && policy.festive_charge[serviceType]) {
    const festiveMultiplier = multipliers.festive[serviceType];
    finalFare = finalFare * festiveMultiplier;
  }
  
  return Math.round(finalFare);
}

// Build fare breakdown (simplified for Phase 1)
function buildFareBreakdown(baseFare, serviceType, isNight, isFestive, finalFare) {
  const breakdown = {
    base_fare: baseFare,
    night_charge: 0,
    festive_charge: 0,
    gst: Math.round(finalFare * (policy.gst_percent / 100)),
    driver_allowance: policy.driver_allowance[serviceType] || policy.driver_allowance.default,
    total: finalFare + Math.round(finalFare * (policy.gst_percent / 100)) + (policy.driver_allowance[serviceType] || policy.driver_allowance.default)
  };
  
  // Phase 1: No additional charges
  if (multipliers.enable_night && isNight && policy.night_charge[serviceType]) {
    breakdown.night_charge = Math.round(baseFare * (multipliers.night[serviceType] - 1));
  }
  
  if (multipliers.enable_festive && isFestive && policy.festive_charge[serviceType]) {
    breakdown.festive_charge = Math.round(baseFare * (multipliers.festive[serviceType] - 1));
  }
  
  return breakdown;
}

module.exports = {
  calculateDistance,
  findZone,
  findFixedRoute,
  calculateZoneBasedFare,
  applyMultipliers,
  buildFareBreakdown,
  routeManager // Export route manager for direct access
}; 