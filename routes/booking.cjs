/**
 * Booking Route
 * 
 * Handles booking creation and management
 * 
 * @module routes/booking
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase.cjs');

/**
 * POST /api/booking
 * Create a new booking
 */
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
      estimated_fare,
      km_limit,
      booking_source,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      rental_booking_type,
      user_email,
      user_name
    } = req.body;

    // Validation
    if (!mobile_number || !service_type || !pick_up_location || !car_type || !journey_date || !pick_up_time || !estimated_fare) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide: mobile_number, service_type, pick_up_location, car_type, journey_date, pick_up_time, estimated_fare'
      });
    }

    // Prepare booking data for bookingtable
    const bookingData = {
      mobile_number: Number(mobile_number),
      user_email: user_email || null,
      user_name: user_name || null,
      service_type: service_type,
      pick_up_location: pick_up_location,
      drop_location: drop_location || null,
      pick_up_time: pick_up_time,
      journey_date: journey_date,
      booking_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      car_type: car_type,
      estimated_fare: Number(estimated_fare),
      km_limit: km_limit ? String(km_limit) : null,
      ride_status: 'pending',
      advance_amount_paid: 0,
      booking_source: booking_source || 'web',
      return_date: return_date ? new Date(return_date).toISOString() : null,
      rental_booking_type: rental_booking_type || null,
      payment_status: 'pending',
      refund_status: 'not_applicable',
      discount_amount: 0,
      refund_amount: 0
    };

    // Insert into bookingtable
    const { data, error } = await supabase
      .from('bookingtable')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Supabase booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }

    // Return success response with booking data
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking_id: data.booking_id,
        mobile_number: data.mobile_number,
        service_type: data.service_type,
        pick_up_location: data.pick_up_location,
        drop_location: data.drop_location,
        journey_date: data.journey_date,
        car_type: data.car_type,
        estimated_fare: data.estimated_fare,
        ride_status: data.ride_status,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;

