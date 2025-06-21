const express = require('express');
const router = express.Router();

// Calculate fare estimate
router.post('/estimate', async (req, res) => {
  try {
    const {
      service_type,
      pick_up_location,
      drop_location,
      car_type,
      rental_booking_type
    } = req.body;

    // Validate required fields
    if (!service_type || !pick_up_location || !car_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Mock fare calculation logic
    let baseFare = 0;
    let kmLimit = '300km';

    switch (service_type) {
      case 'local':
        const hours = parseInt(rental_booking_type?.split('hr')[0] || '4');
        baseFare = hours * 300; // ₹300 per hour
        kmLimit = rental_booking_type?.split('/')[1] || '40km';
        break;
      
      case 'airport':
        baseFare = car_type === 'suv' || car_type === 'crysta' || car_type === 'scorpio' ? 1200 : 800;
        kmLimit = '50km';
        break;
      
      case 'roundtrip':
        baseFare = car_type === 'suv' || car_type === 'crysta' || car_type === 'scorpio' ? 4500 : 3600;
        kmLimit = '600km';
        break;
      
      default: // oneway
        baseFare = car_type === 'suv' || car_type === 'crysta' || car_type === 'scorpio' ? 2500 : 2000;
        kmLimit = '300km';
    }

    // Calculate breakdown
    const tollCharges = (service_type === 'oneway' || service_type === 'airport') ? 200 : 0;
    const stateTax = (service_type === 'oneway' || service_type === 'airport') ? 150 : 0;
    const gst = Math.round(baseFare * 0.18);
    
    const totalFare = baseFare + tollCharges + stateTax + gst;

    const fareData = {
      estimated_fare: totalFare,
      km_limit: kmLimit,
      breakdown: {
        base_fare: baseFare,
        toll_charges: tollCharges,
        state_tax: stateTax,
        gst: gst
      },
      service_details: {
        service_type,
        car_type,
        pick_up_location,
        drop_location: service_type === 'local' ? null : drop_location,
        rental_duration: service_type === 'local' ? rental_booking_type : null
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

module.exports = router;