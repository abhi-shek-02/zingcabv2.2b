const express = require('express');
const router = express.Router();

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

    // Calculate distance
    let distance = 0;
    if (service_type === 'rental') {
      distance = parseInt(String(km_limit || '40').replace(/km/i, ''));
    } else {
      distance = calculateDistance(pick_up_location, drop_location);
    }

    // Base fare calculation for different car types
    const carTypeRates = {
      'hatchback': { base: 12, premium: 1.0 },
      'sedan': { base: 15, premium: 1.2 },
      'suv': { base: 18, premium: 1.5 },
      'crysta': { base: 20, premium: 1.8 },
      'scorpio': { base: 22, premium: 2.0 }
    };

    // Service type multipliers
    const serviceMultipliers = {
      'oneway': 1.0,
      'airport': 1.3,
      'roundtrip': 1.8,
      'rental': 1.5
    };

    // Calculate fares for all car types
    const allCarFares = {};
    Object.keys(carTypeRates).forEach(carType => {
      const rate = carTypeRates[carType];
    let baseFare = 0;
      let kmLimit = 300;

    switch (service_type) {
        case 'oneway':
          baseFare = distance * rate.base * serviceMultipliers.oneway;
          kmLimit = distance;
        break;
      
      case 'airport':
          baseFare = distance * rate.base * serviceMultipliers.airport;
          kmLimit = distance;
        break;
      
      case 'roundtrip':
          baseFare = distance * rate.base * serviceMultipliers.roundtrip;
          kmLimit = distance * 2;
        break;
      
        case 'rental':
          const hours = parseInt(rental_booking_type?.split('hr')[0] || '4');
          baseFare = hours * rate.base * 50 * serviceMultipliers.rental; // ₹50 per km per hour
          kmLimit = parseInt(km_limit) || 40;
          break;
    }

      // Add additional charges
    const tollCharges = (service_type === 'oneway' || service_type === 'airport') ? 200 : 0;
    const stateTax = (service_type === 'oneway' || service_type === 'airport') ? 150 : 0;
    const gst = Math.round(baseFare * 0.18);
      const driverAllowance = service_type === 'roundtrip' ? 500 : 200;
    
      const totalFare = baseFare + tollCharges + stateTax + gst + driverAllowance;

      allCarFares[carType] = {
        estimated_fare: Math.round(totalFare),
      km_limit: kmLimit,
      breakdown: {
          base_fare: Math.round(baseFare),
        toll_charges: tollCharges,
        state_tax: stateTax,
          gst: gst,
          driver_allowance: driverAllowance
        }
      };
    });

    // Get the selected car type fare
    const selectedCarFare = allCarFares[car_type] || allCarFares['sedan'];

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
        distance: distance
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

module.exports = router;