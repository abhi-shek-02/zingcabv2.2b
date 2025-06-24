const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Generate booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZC${timestamp.slice(-4)}${random}`;
};

// Create booking
router.post('/', async (req, res) => {
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
      estimated_fare,
      booking_source,
      return_date,
      rental_booking_type,
      advance_amount_paid
    } = req.body;

    // Validate required fields based on service type
    const requiredFields = ['mobile_number', 'service_type', 'pick_up_location', 'journey_date', 'car_type', 'estimated_fare'];
    
    // Add service-specific required fields
    if (service_type === 'roundtrip' && !return_date) {
      requiredFields.push('return_date');
    }
    if (service_type === 'rental' && !rental_booking_type) {
      requiredFields.push('rental_booking_type');
    }
    if (service_type !== 'rental' && !drop_location) {
      requiredFields.push('drop_location');
    }

    // Check for missing required fields
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobile_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number'
      });
    }

    // Validate service type
    const validServiceTypes = ['oneway', 'airport', 'roundtrip', 'rental'];
    if (!validServiceTypes.includes(service_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service type'
      });
    }

    const bookingId = generateBookingId();
    const bookingDate = new Date().toISOString().split('T')[0];

    const bookingData = {
      booking_id: bookingId,
      km_limit: parseInt(km_limit) || 300,
      mobile_number,
      service_type,
      pick_up_location,
      pick_up_time: pick_up_time || '09:00',
      journey_date,
      booking_date: bookingDate,
      car_type,
      drop_location: service_type === 'rental' ? null : drop_location,
      estimated_fare: parseFloat(estimated_fare),
      booking_source: booking_source || 'website',
      return_date: service_type === 'roundtrip' ? return_date : null,
      rental_booking_type: service_type === 'rental' ? rental_booking_type : null,
      advance_amount_paid: advance_amount_paid || 0,
      ride_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bookingtable')
      .insert([bookingData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking_id: bookingId,
        estimated_fare: parseFloat(estimated_fare),
        advance_amount: advance_amount_paid || 0,
        status: 'pending',
        pickup_date: journey_date,
        pickup_time: pick_up_time || '09:00',
        service_type,
        car_type,
        km_limit: parseInt(km_limit) || 300,
        booking_date: bookingDate
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get booking by ID
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { data, error } = await supabase
      .from('bookingtable')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookingtable')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings'
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;