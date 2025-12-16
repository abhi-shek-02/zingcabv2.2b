/**
 * Fare Estimation Route
 * 
 * Handles fare calculation with zone-based and distance-based pricing
 * 
 * @module routes/fare
 */

const express = require('express');
const router = express.Router();
const zoneService = require('../services/zoneService.cjs');
const fareConfig = require('../config/fareConfig.cjs');

/**
 * Calculate distance-based fare (existing logic)
 * This function should match your existing fare calculation
 */
function calculateDistanceBasedFare(carType, kmLimit, tripType) {
  // Get fare configuration for the car type
  const carConfig = fareConfig.carTypes[carType];
  if (!carConfig) {
    throw new Error(`Invalid car type: ${carType}`);
  }

  // Calculate base fare
  const baseFare = carConfig.baseFare || 0;
  const perKmRate = carConfig.perKmRate || 0;
  
  // Calculate total fare
  let totalFare = baseFare + (perKmRate * kmLimit);

  // Apply trip type multipliers if needed
  if (tripType === 'roundtrip') {
    totalFare = totalFare * 1.8; // Round trip is typically 1.8x one-way
  } else if (tripType === 'rental') {
    // Rental pricing might have different logic
    // Adjust based on your rental pricing strategy
  }

  // Round to nearest integer
  return Math.round(totalFare);
}

/**
 * POST /api/fare/estimate
 * 
 * Estimate fare for a trip with zone-based or distance-based pricing
 */
router.post('/estimate', async (req, res) => {
  try {
    const {
      service_type,
      pick_up_location,
      drop_location,
      pick_up_time,
      km_limit,
      car_type,
      journey_date,
      mobile_number,
      booking_source,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      return_date,
      rental_booking_type
    } = req.body;

    // Validate required fields
    if (!service_type || !pick_up_location || !drop_location || !car_type || !km_limit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: service_type, pick_up_location, drop_location, car_type, km_limit'
      });
    }

    // Validate car type
    const validCarTypes = ['hatchback', 'sedan', 'suv', 'crysta', 'scorpio'];
    if (!validCarTypes.includes(car_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid car type. Must be one of: ${validCarTypes.join(', ')}`
      });
    }

    // Feature flag: Enable/disable zone pricing
    const ENABLE_ZONE_PRICING = process.env.ENABLE_ZONE_PRICING !== 'false'; // Default: true

    let pricingType = 'distance_based';
    let zoneInfo = {
      pickup_zone: null,
      drop_zone: null
    };
    let zoneBasedFare = null;

    // Try zone-based pricing if coordinates are provided and feature is enabled
    if (ENABLE_ZONE_PRICING && pickup_lat && pickup_lng && drop_lat && drop_lng) {
      try {
        const zoneResult = await zoneService.calculateZoneBasedFare(
          parseFloat(pickup_lat),
          parseFloat(pickup_lng),
          parseFloat(drop_lat),
          parseFloat(drop_lng),
          car_type.toLowerCase()
        );

        if (zoneResult && zoneResult.fare) {
          zoneBasedFare = zoneResult.fare;
          pricingType = 'zone_based';
          zoneInfo = {
            pickup_zone: zoneResult.from_zone,
            drop_zone: zoneResult.to_zone
          };
          
          console.log(`Zone-based pricing applied: ${zoneInfo.pickup_zone} → ${zoneInfo.drop_zone}, ${car_type}: ₹${zoneBasedFare}`);
        } else {
          console.log('Zone pricing not applicable, falling back to distance-based pricing');
        }
      } catch (zoneError) {
        console.error('Error in zone-based pricing calculation:', zoneError);
        // Fallback to distance-based pricing on error
      }
    } else {
      if (!pickup_lat || !pickup_lng || !drop_lat || !drop_lng) {
        console.log('Coordinates not provided, using distance-based pricing');
      }
    }

    // Calculate fares for all car types
    const allCarFares = {};
    const selectedCarFare = {};

    // Get all car types from config
    const allCarTypes = Object.keys(fareConfig.carTypes || {});

    for (const carType of allCarTypes) {
      let estimatedFare;
      let carPricingType = pricingType;
      let carZoneInfo = { ...zoneInfo };

      // If zone pricing was found for the selected car type, use it
      if (pricingType === 'zone_based' && carType === car_type.toLowerCase()) {
        // Get zone pricing for this specific car type
        if (zoneInfo.pickup_zone && zoneInfo.drop_zone) {
          const carZonePrice = await zoneService.getZonePricing(
            zoneInfo.pickup_zone,
            zoneInfo.drop_zone,
            carType
          );
          
          if (carZonePrice) {
            estimatedFare = carZonePrice;
            carPricingType = 'zone_based';
          } else {
            // Fallback to distance-based for this car type
            estimatedFare = calculateDistanceBasedFare(carType, parseFloat(km_limit) * 1.1, service_type);
            carPricingType = 'distance_based';
            carZoneInfo = { pickup_zone: null, drop_zone: null };
          }
        } else {
          estimatedFare = calculateDistanceBasedFare(carType, parseFloat(km_limit) * 1.1, service_type);
          carPricingType = 'distance_based';
        }
      } else {
        // For other car types or when zone pricing not available, use distance-based
        estimatedFare = calculateDistanceBasedFare(carType, parseFloat(km_limit) * 1.1, service_type);
        carPricingType = 'distance_based';
        carZoneInfo = { pickup_zone: null, drop_zone: null };
      }

      allCarFares[carType] = {
        car_type: carType,
        estimated_fare: estimatedFare,
        km_limit: parseFloat(km_limit),
        pricing_type: carPricingType,
        zone_info: carZoneInfo,
        breakdown: {},
        message: ''
      };

      // Store selected car fare
      if (carType === car_type.toLowerCase()) {
        selectedCarFare.car_type = carType;
        selectedCarFare.estimated_fare = estimatedFare;
        selectedCarFare.km_limit = parseFloat(km_limit);
        selectedCarFare.pricing_type = carPricingType;
        selectedCarFare.zone_info = carZoneInfo;
        selectedCarFare.breakdown = {};
        selectedCarFare.message = '';
      }
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        selected_car: selectedCarFare,
        all_car_fares: allCarFares,
        service_details: {
          service_type: service_type,
          pick_up_location: pick_up_location,
          drop_location: drop_location,
          journey_date: journey_date,
          pick_up_time: pick_up_time,
          return_date: return_date || null,
          rental_duration: rental_booking_type || null,
          distance: parseFloat(km_limit),
          pricing_logic: pricingType
        }
      }
    };

    // Log pricing method for analytics
    console.log(`Fare estimate completed: ${pricingType} pricing, ${car_type}, ₹${selectedCarFare.estimated_fare}`);

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in fare estimation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to estimate fare',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

