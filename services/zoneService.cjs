/**
 * Zone Service
 * 
 * Handles zone detection and zone-based pricing logic
 * Uses Haversine formula for accurate distance calculation
 * 
 * @module services/zoneService
 */

const supabase = require('../config/supabase.cjs');

// Cache for zone centers (in-memory cache for performance)
let zoneCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Validate coordinates
  if (
    typeof lat1 !== 'number' || typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lng2 !== 'number' ||
    isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)
  ) {
    return null;
  }

  // Validate latitude range (-90 to 90)
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
    return null;
  }

  // Validate longitude range (-180 to 180)
  if (lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Load zones from database (with caching)
 * 
 * @returns {Promise<Array>} Array of zone objects
 */
async function loadZones() {
  const now = Date.now();
  
  // Return cached zones if still valid
  if (zoneCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return zoneCache;
  }

  try {
    const { data, error } = await supabase
      .from('zones')
      .select('id, zone_name, center_lat, center_lng, radius_km')
      .eq('is_active', true);

    if (error) {
      console.error('Error loading zones:', error);
      return zoneCache || []; // Return cached data if available
    }

    // Update cache
    zoneCache = data || [];
    cacheTimestamp = now;
    
    return zoneCache;
  } catch (error) {
    console.error('Exception loading zones:', error);
    return zoneCache || []; // Return cached data if available
  }
}

/**
 * Detect which zone a location belongs to (if any)
 * 
 * @param {number} lat - Latitude of location
 * @param {number} lng - Longitude of location
 * @returns {Promise<Object|null>} Zone object with zone_name, or null if not in any zone
 */
async function detectZone(lat, lng) {
  // Validate coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.warn('Invalid coordinates for zone detection:', { lat, lng });
    return null;
  }

  // Validate latitude range
  if (lat < -90 || lat > 90) {
    console.warn('Latitude out of range:', lat);
    return null;
  }

  // Validate longitude range
  if (lng < -180 || lng > 180) {
    console.warn('Longitude out of range:', lng);
    return null;
  }

  try {
    const zones = await loadZones();
    
    if (!zones || zones.length === 0) {
      console.warn('No active zones found in database');
      return null;
    }

    let closestZone = null;
    let minDistance = Infinity;

    // Check distance to each zone center
    for (const zone of zones) {
      const distance = calculateDistance(
        lat,
        lng,
        parseFloat(zone.center_lat),
        parseFloat(zone.center_lng)
      );

      if (distance === null) {
        continue; // Skip invalid distance calculation
      }

      // Check if within radius (strict boundary: <= radius_km)
      const radius = parseFloat(zone.radius_km) || 20;
      if (distance <= radius) {
        // If multiple zones match, use closest one
        if (distance < minDistance) {
          minDistance = distance;
          closestZone = {
            id: zone.id,
            zone_name: zone.zone_name,
            center_lat: parseFloat(zone.center_lat),
            center_lng: parseFloat(zone.center_lng),
            radius_km: radius,
            distance: distance
          };
        }
      }
    }

    if (closestZone) {
      console.log(`Zone detected: ${closestZone.zone_name} (distance: ${closestZone.distance.toFixed(2)}km)`);
      return closestZone;
    }

    return null;
  } catch (error) {
    console.error('Error detecting zone:', error);
    return null;
  }
}

/**
 * Get zone pricing for a route (bidirectional lookup)
 * 
 * @param {string} fromZoneName - Source zone name
 * @param {string} toZoneName - Destination zone name
 * @param {string} carType - Car type (sedan, suv, hatchback, etc.)
 * @returns {Promise<number|null>} Fixed price or null if not found
 */
async function getZonePricing(fromZoneName, toZoneName, carType) {
  // Validate inputs
  if (!fromZoneName || !toZoneName || !carType) {
    return null;
  }

  // Same zone check (should use distance-based pricing)
  if (fromZoneName === toZoneName) {
    console.log('Same zone detected, should use distance-based pricing');
    return null;
  }

  try {
    // First, get zone IDs
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, zone_name')
      .in('zone_name', [fromZoneName, toZoneName])
      .eq('is_active', true);

    if (zonesError) {
      console.error('Error fetching zones:', zonesError);
      return null;
    }

    if (!zones || zones.length !== 2) {
      console.warn('Zones not found:', { fromZoneName, toZoneName });
      return null;
    }

    const fromZone = zones.find(z => z.zone_name === fromZoneName);
    const toZone = zones.find(z => z.zone_name === toZoneName);

    if (!fromZone || !toZone) {
      return null;
    }

    // Try direct direction first (A → B)
    let { data: pricing, error: pricingError } = await supabase
      .from('zone_pricing')
      .select('fixed_price')
      .eq('from_zone_id', fromZone.id)
      .eq('to_zone_id', toZone.id)
      .eq('car_type', carType.toLowerCase())
      .eq('is_active', true)
      .single();

    // If not found, try reverse direction (B → A) for bidirectional pricing
    if (pricingError || !pricing) {
      const { data: reversePricing, error: reverseError } = await supabase
        .from('zone_pricing')
        .select('fixed_price')
        .eq('from_zone_id', toZone.id)
        .eq('to_zone_id', fromZone.id)
        .eq('car_type', carType.toLowerCase())
        .eq('is_active', true)
        .single();

      if (!reverseError && reversePricing) {
        pricing = reversePricing;
        console.log(`Using reverse direction pricing: ${toZoneName} → ${fromZoneName}`);
      }
    }

    if (pricing && pricing.fixed_price) {
      const price = parseFloat(pricing.fixed_price);
      console.log(`Zone pricing found: ${fromZoneName} → ${toZoneName}, ${carType}: ₹${price}`);
      return price;
    }

    console.warn(`Zone pricing not found: ${fromZoneName} → ${toZoneName}, ${carType}`);
    return null;
  } catch (error) {
    console.error('Error fetching zone pricing:', error);
    return null;
  }
}

/**
 * Calculate zone-based fare for a route
 * 
 * @param {number} pickupLat - Pickup latitude
 * @param {number} pickupLng - Pickup longitude
 * @param {number} dropLat - Drop latitude
 * @param {number} dropLng - Drop longitude
 * @param {string} carType - Car type
 * @returns {Promise<Object|null>} Fare result with pricing info, or null if zone pricing not applicable
 */
async function calculateZoneBasedFare(pickupLat, pickupLng, dropLat, dropLng, carType) {
  // Validate coordinates
  if (
    typeof pickupLat !== 'number' || typeof pickupLng !== 'number' ||
    typeof dropLat !== 'number' || typeof dropLng !== 'number' ||
    isNaN(pickupLat) || isNaN(pickupLng) || isNaN(dropLat) || isNaN(dropLng)
  ) {
    console.warn('Invalid coordinates for zone-based fare calculation');
    return null;
  }

  // Detect pickup zone
  const pickupZone = await detectZone(pickupLat, pickupLng);
  if (!pickupZone) {
    console.log('Pickup location not in any zone');
    return null;
  }

  // Detect drop zone
  const dropZone = await detectZone(dropLat, dropLng);
  if (!dropZone) {
    console.log('Drop location not in any zone');
    return null;
  }

  // Same zone check - use distance-based pricing for local travel
  if (pickupZone.zone_name === dropZone.zone_name) {
    console.log('Both locations in same zone, using distance-based pricing');
    return null;
  }

  // Get zone pricing
  const price = await getZonePricing(pickupZone.zone_name, dropZone.zone_name, carType);
  if (!price) {
    console.log('Zone pricing not found, falling back to distance-based');
    return null;
  }

  // Return zone-based fare result
  return {
    fare: price,
    pricing_method: 'zone_based',
    from_zone: pickupZone.zone_name,
    to_zone: dropZone.zone_name,
    zone_info: {
      pickup_zone: pickupZone.zone_name,
      drop_zone: dropZone.zone_name
    }
  };
}

/**
 * Clear zone cache (useful for testing or when zones are updated)
 */
function clearZoneCache() {
  zoneCache = null;
  cacheTimestamp = null;
  console.log('Zone cache cleared');
}

module.exports = {
  detectZone,
  getZonePricing,
  calculateZoneBasedFare,
  calculateDistance,
  loadZones,
  clearZoneCache
};

