const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Generate booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ZC${timestamp.slice(-6)}${random}`;
};

// Create booking
router.post('/', async (req, res) => {
  try {
    const {
      mobile_number,
      service_type,
      pick_up_location,
      drop_location,
      journey_date,
      return_date,
      pick_up_time,
      car_type,
      rental_booking_type,
      estimated_fare,
      km_limit
    } = req.body;

    // Validate required fields
    if (!mobile_number || !service_type || !pick_up_location || !journey_date || !car_type || !estimated_fare) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
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

    const bookingId = generateBookingId();
    const bookingDate = new Date().toISOString().split('T')[0];

    const bookingData = {
      booking_id: bookingId,
      mobile_number,
      service_type,
      pick_up_location,
      drop_location: service_type === 'local' ? null : drop_location,
      journey_date,
      return_date: service_type === 'roundtrip' ? return_date : null,
      pick_up_time: pick_up_time || '09:00',
      booking_date: bookingDate,
      car_type,
      rental_booking_type: service_type === 'local' ? rental_booking_type : null,
      estimated_fare: parseFloat(estimated_fare),
      booking_source: 'website',
      km_limit: km_limit || (service_type === 'local' ? '40km' : '300km'),
      ride_status: 'pending',
      advance_amount_paid: 0,
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
        advance_amount: 500,
        status: 'pending',
        pickup_date: journey_date,
        pickup_time: pick_up_time || '09:00',
        service_type,
        car_type
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

module.exports = router;