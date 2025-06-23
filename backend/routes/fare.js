const express = require('express');
const router = express.Router();
const fareConfig = require('../config/fareConfig');

// Calculate distance between two locations (mock function)
const calculateDistance = (pickup, drop) => {
  // Mock distance calculation - in real implementation, use Google Maps API
  const distances = {
    'Mumbai': { 'Pune': 150, 'Nashik': 180, 'Goa': 600 },
    'Pune': { 'Mumbai': 150, 'Nashik': 200, 'Goa': 450 },
    'Nashik': { 'Mumbai': 180, 'Pune': 200, 'Goa': 650 },
    'Goa': { 'Mumbai': 600, 'Pune': 450, 'Nashik': 650 }
  };
  
  return distances[pickup]?.[drop] || Math.floor(Math.random() * 200) + 50;
};

function calculateZingCabFare({ car_type, km_limit, trip_type }) {
  const car = fareConfig.carTypes[car_type];
  if (!car) return 0;
  let fare = 0;
  if (trip_type === 'oneway' || trip_type === 'airport') {
    fare = car.baseFare + (car.perKmOneway * km_limit);
  } else if (trip_type === 'roundtrip') {
    fare = car.baseFare + (car.perKmRoundtrip * km_limit);
  } else if (trip_type === 'rental') {
    // Rental: flat for up to 40km, extra km at flat rate
    if (km_limit <= fareConfig.rentalIncludedKm) {
      fare = car.rentalPackage;
    } else {
      const extraKm = km_limit - fareConfig.rentalIncludedKm;
      fare = car.rentalPackage + (extraKm * fareConfig.rentalExtraPerKm);
    }
  }
  return Math.round(fare);
}

// Calculate fare estimate
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
      rental_booking_type
    } = req.body;

    // Validate required fields
    const requiredFields = ['service_type', 'pick_up_location', 'car_type'];
    if (service_type !== 'rental' && !drop_location) {
      requiredFields.push('drop_location');
    }
    if (service_type === 'roundtrip' && !return_date) {
      requiredFields.push('return_date');
    }
    if (service_type === 'rental' && !rental_booking_type) {
      requiredFields.push('rental_booking_type');
    }
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Use km_limit from payload for all car types
    const allCarFares = {};
    Object.keys(fareConfig.carTypes).forEach(carType => {
      const calcKm = Number(km_limit) * 1.1; // Add 10% buffer for calculation only
      allCarFares[carType] = {
        estimated_fare: calculateZingCabFare({ car_type: carType, km_limit: calcKm, trip_type: service_type }),
        km_limit: Number(km_limit), // Always return the original km_limit
        breakdown: {},
        message: ''
      };
    });

    // Get the selected car type fare
    const selectedCarFare = allCarFares[car_type] || allCarFares['sedan'];
    selectedCarFare.km_limit = Number(km_limit);

    const fareData = {
      selected_car: {
        car_type,
        ...selectedCarFare
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
        distance: Number(km_limit)
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

// Get fare calculator
router.post('/calculator', async (req, res) => {
  try {
    const {
      distance,
      service_type,
      car_type,
      rental_hours
    } = req.body;

    if (!distance || !service_type || !car_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: distance, service_type, car_type'
      });
    }

    const carTypeRates = {
      'hatchback': { base: 12, premium: 1.0 },
      'sedan': { base: 15, premium: 1.2 },
      'suv': { base: 18, premium: 1.5 },
      'crysta': { base: 20, premium: 1.8 },
      'scorpio': { base: 22, premium: 2.0 }
    };

    const serviceMultipliers = {
      'oneway': 1.0,
      'airport': 1.3,
      'roundtrip': 1.8,
      'rental': 1.5
    };

    const rate = carTypeRates[car_type] || carTypeRates['sedan'];
    const multiplier = serviceMultipliers[service_type] || 1.0;

    let baseFare = 0;
    if (service_type === 'rental') {
      const hours = rental_hours || 4;
      baseFare = hours * rate.base * 50 * multiplier;
    } else {
      baseFare = distance * rate.base * multiplier;
    }

    const tollCharges = (service_type === 'oneway' || service_type === 'airport') ? 200 : 0;
    const stateTax = (service_type === 'oneway' || service_type === 'airport') ? 150 : 0;
    const gst = Math.round(baseFare * 0.18);
    const driverAllowance = service_type === 'roundtrip' ? 500 : 200;
    
    const totalFare = baseFare + tollCharges + stateTax + gst + driverAllowance;

    res.json({
      success: true,
      data: {
        estimated_fare: Math.round(totalFare),
        breakdown: {
          base_fare: Math.round(baseFare),
          toll_charges: tollCharges,
          state_tax: stateTax,
          gst: gst,
          driver_allowance: driverAllowance
        },
        calculation_details: {
          distance: `${distance}km`,
          service_type,
          car_type,
          rental_hours: service_type === 'rental' ? (rental_hours || 4) : null
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