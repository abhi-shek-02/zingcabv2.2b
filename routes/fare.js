const express = require('express');
const router = express.Router();
const {
  findZone,
  findFixedRoute,
  calculateZoneBasedFare,
  applyMultipliers,
  buildFareBreakdown,
  calculateDistance
} = require('../utils/geoUtils');
const carTypes = require('../config/car_types.json');
const { getCurrentTimeSlot, getCurrentEvents } = require('../utils/routeManager');

// Legacy functions removed - now using geoUtils.js

// Calculate fare estimate with geolocation-based zoning
router.post('/estimate', async (req, res) => {
  try {
    const {
      km_limit,
      mobile_number,
      service_type,
      pick_up_location,
      pick_up_time,
      journey_date,
      car_type,
      drop_location,
      booking_source,
      return_date,
      rental_booking_type,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng
    } = req.body;

    // Validate required fields
    const requiredFields = ['service_type', 'car_type'];
    if (service_type !== 'rental' && !drop_location) {
      requiredFields.push('drop_location');
    }
    if (service_type === 'roundtrip' && !return_date) {
      requiredFields.push('return_date');
    }
    if (service_type === 'rental' && !rental_booking_type) {
      requiredFields.push('rental_booking_type');
    }
    
    // Validate coordinates if provided
    if (pickup_lat && pickup_lng && drop_lat && drop_lng) {
      requiredFields.push('pickup_lat', 'pickup_lng', 'drop_lat', 'drop_lng');
    }
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Zone detection
    const pickupZone = pickup_lat && pickup_lng ? findZone(pickup_lat, pickup_lng) : null;
    const dropZone = drop_lat && drop_lng ? findZone(drop_lat, drop_lng) : null;
    
    // Calculate actual distance if coordinates provided
    let actualDistance = Number(km_limit);
    if (pickup_lat && pickup_lng && drop_lat && drop_lng) {
      actualDistance = Math.round(calculateDistance(pickup_lat, pickup_lng, drop_lat, drop_lng));
    }

    // Check for night and festive periods (simplified for Phase 1)
    const isNight = false; // Phase 1: No night charges
    const isFestive = false; // Phase 1: No festive charges

    // Pricing logic decision
    let pricingType, baseFare, estimatedFare;
    
    if (pickupZone === dropZone && pickupZone) {
      // Same zone - local pricing
      pricingType = 'zone_based';
      baseFare = calculateZoneBasedFare(pickupZone, dropZone, car_type, actualDistance, service_type);
    } else if (pickupZone && dropZone) {
      // Different zones - check fixed route first
      const fixedFare = findFixedRoute(pickupZone, dropZone, service_type, car_type);
      if (fixedFare) {
        pricingType = 'fixed_route';
        baseFare = Number(fixedFare.final_fare); // Ensure it's a number
        estimatedFare = fixedFare; // Keep the full object for response
      } else {
        pricingType = 'zone_based';
        baseFare = calculateZoneBasedFare(pickupZone, dropZone, car_type, actualDistance, service_type);
        estimatedFare = applyMultipliers(baseFare, service_type, isNight, isFestive);
      }
    } else {
      // Outside zones - standard pricing
      pricingType = 'standard';
      baseFare = calculateZoneBasedFare(null, null, car_type, actualDistance, service_type);
      estimatedFare = applyMultipliers(baseFare, service_type, isNight, isFestive);
    }

    // Apply multipliers (only for non-fixed routes)
    if (pricingType !== 'fixed_route') {
      estimatedFare = applyMultipliers(baseFare, service_type, isNight, isFestive);
    }
    
    // Build breakdown
    let breakdown;
    if (pricingType === 'fixed_route') {
      // For fixed routes, use the fare amount for breakdown calculation
      breakdown = buildFareBreakdown(baseFare, service_type, isNight, isFestive, baseFare);
    } else {
      breakdown = buildFareBreakdown(baseFare, service_type, isNight, isFestive, estimatedFare);
    }

    // Calculate fares for all car types
    const allCarFares = {};
    Object.keys(carTypes).forEach(carType => {
      let carBaseFare, carFinalFare, carBreakdown;
      
      if (pricingType === 'fixed_route') {
        const carFixedFare = findFixedRoute(pickupZone, dropZone, service_type, carType);
        if (carFixedFare) {
          carBaseFare = Number(carFixedFare.final_fare); // Ensure it's a number
          carFinalFare = carFixedFare;
          carBreakdown = buildFareBreakdown(carBaseFare, service_type, isNight, isFestive, carBaseFare);
        } else {
          carBaseFare = calculateZoneBasedFare(pickupZone, dropZone, carType, actualDistance, service_type);
          carFinalFare = applyMultipliers(carBaseFare, service_type, isNight, isFestive);
          carBreakdown = buildFareBreakdown(carBaseFare, service_type, isNight, isFestive, carFinalFare);
        }
      } else {
        carBaseFare = calculateZoneBasedFare(pickupZone, dropZone, carType, actualDistance, service_type);
        carFinalFare = applyMultipliers(carBaseFare, service_type, isNight, isFestive);
        carBreakdown = buildFareBreakdown(carBaseFare, service_type, isNight, isFestive, carFinalFare);
      }
      
      allCarFares[carType] = {
        estimated_fare: carFinalFare,
        km_limit: actualDistance,
        breakdown: carBreakdown
      };
    });

    const fareData = {
      selected_car: {
        car_type,
        estimated_fare: estimatedFare,
        pricing_type: pricingType,
        zone_info: {
          pickup_zone: pickupZone,
          drop_zone: dropZone
        },
        km_limit: actualDistance,
        breakdown: breakdown
      },
      all_car_fares: allCarFares,
      service_details: {
        service_type,
        pick_up_location,
        drop_location: service_type === 'rental' ? null : drop_location,
        journey_date,
        pick_up_time: pick_up_time || '09:00',
        return_date: service_type === 'roundtrip' ? return_date : null,
        rental_duration: service_type === 'rental' ? rental_booking_type : null,
        distance: actualDistance,
        pricing_logic: pricingType,
        night_charge_applied: isNight,
        festive_charge_applied: isFestive
      }
    };

    res.json({
      success: true,
      data: fareData
    });

  } catch (error) {
    console.error('Fare calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get fare calculator with zone support
router.post('/calculator', async (req, res) => {
  try {
    const {
      distance,
      service_type,
      car_type,
      rental_hours,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      pick_up_time,
      journey_date
    } = req.body;

    if (!distance || !service_type || !car_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: distance, service_type, car_type'
      });
    }

    // Zone detection if coordinates provided
    const pickupZone = pickup_lat && pickup_lng ? findZone(pickup_lat, pickup_lng) : null;
    const dropZone = drop_lat && drop_lng ? findZone(drop_lat, drop_lng) : null;
    
    // Check for night and festive periods
    const isNight = pick_up_time ? isNightTime(pick_up_time) : false;
    const isFestive = journey_date ? isFestivePeriod(journey_date) : false;

    // Pricing logic decision
    let pricingType, baseFare;
    
    if (pickupZone === dropZone && pickupZone) {
      // Same zone - local pricing
      pricingType = 'zone_based';
      baseFare = calculateZoneBasedFare(pickupZone, dropZone, car_type, distance, service_type);
    } else if (pickupZone && dropZone) {
      // Different zones - check fixed route first
      const fixedFare = findFixedRoute(pickupZone, dropZone, service_type, car_type);
      if (fixedFare) {
        pricingType = 'fixed_route';
        baseFare = fixedFare;
      } else {
        pricingType = 'zone_based';
        baseFare = calculateZoneBasedFare(pickupZone, dropZone, car_type, distance, service_type);
      }
    } else {
      // Outside zones - standard pricing
      pricingType = 'standard';
      baseFare = calculateZoneBasedFare(null, null, car_type, distance, service_type);
    }

    // Apply multipliers
    const estimatedFare = applyMultipliers(baseFare, service_type, isNight, isFestive);
    
    // Build breakdown
    const breakdown = buildFareBreakdown(baseFare, service_type, isNight, isFestive, estimatedFare);

    res.json({
      success: true,
      data: {
        estimated_fare: estimatedFare,
        pricing_type: pricingType,
        zone_info: {
          pickup_zone: pickupZone,
          drop_zone: dropZone
        },
        breakdown: breakdown,
        calculation_details: {
          distance: `${distance}km`,
          service_type,
          car_type,
          rental_hours: service_type === 'rental' ? (rental_hours || 4) : null,
          night_charge_applied: isNight,
          festive_charge_applied: isFestive
        }
      }
    });

  } catch (error) {
    console.error('Fare calculator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Export for use in routes
module.exports = router;