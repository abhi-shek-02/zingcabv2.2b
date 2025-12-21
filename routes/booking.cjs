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
 * GET /api/booking
 * Get list of bookings with pagination and filters
 * Query params: page, limit, search, ride_status, payment_status, car_type, service_type, start_date, end_date
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const ride_status = req.query.ride_status || '';
    const payment_status = req.query.payment_status || '';
    const car_type = req.query.car_type || '';
    const service_type = req.query.service_type || '';
    const start_date = req.query.start_date || '';
    const end_date = req.query.end_date || '';
    
    // Validate pagination
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page number must be greater than 0'
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('bookingtable')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter (booking_id, mobile_number, user_name, pick_up_location, drop_location)
    if (search) {
      // Build search conditions - handle numeric mobile_number separately
      const searchConditions = [
        `booking_id.ilike.%${search}%`,
        `user_name.ilike.%${search}%`,
        `pick_up_location.ilike.%${search}%`,
        `drop_location.ilike.%${search}%`
      ];
      
      // If search is numeric, also search in mobile_number
      if (/^\d+$/.test(search)) {
        searchConditions.push(`mobile_number.eq.${search}`);
      }
      
      query = query.or(searchConditions.join(','));
    }

    // Apply filters
    if (ride_status) {
      query = query.eq('ride_status', ride_status);
    }

    if (payment_status) {
      query = query.eq('payment_status', payment_status);
    }

    if (car_type) {
      query = query.eq('car_type', car_type);
    }

    if (service_type) {
      query = query.eq('service_type', service_type);
    }

    // Date range filter (journey_date)
    if (start_date) {
      query = query.gte('journey_date', start_date);
    }

    if (end_date) {
      query = query.lte('journey_date', end_date);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase booking list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Booking list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/booking/:id
 * Get single booking by ID (can use booking_id or id)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Try to find by booking_id (bookingtable doesn't have id column, only booking_id)
    let query = supabase
      .from('bookingtable')
      .select('*')
      .eq('booking_id', id)
      .limit(1);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase booking fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch booking',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('Booking fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

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

/**
 * PUT /api/booking/:id
 * Update booking by ID (can use booking_id or id)
 * Can update: ride_status, payment_status, estimated_fare, advance_amount_paid, 
 *             discount_amount, refund_amount, refund_status, and other fields
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ride_status,
      payment_status,
      estimated_fare,
      advance_amount_paid,
      discount_amount,
      refund_amount,
      refund_status,
      mobile_number,
      user_name,
      user_email,
      service_type,
      pick_up_location,
      drop_location,
      journey_date,
      return_date,
      pick_up_time,
      car_type,
      km_limit,
      booking_source,
      rental_booking_type
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};

    // Status updates
    if (ride_status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(ride_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ride_status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updateData.ride_status = ride_status;
    }

    if (payment_status !== undefined) {
      const validPaymentStatuses = ['pending', 'partial', 'paid', 'refunded'];
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
      updateData.payment_status = payment_status;
    }

    if (refund_status !== undefined) {
      const validRefundStatuses = ['not_applicable', 'pending', 'processed', 'failed'];
      if (!validRefundStatuses.includes(refund_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid refund_status. Must be one of: ${validRefundStatuses.join(', ')}`
        });
      }
      updateData.refund_status = refund_status;
    }

    // Financial updates
    if (estimated_fare !== undefined) {
      const fare = Number(estimated_fare);
      if (isNaN(fare) || fare < 0) {
        return res.status(400).json({
          success: false,
          message: 'estimated_fare must be a valid positive number'
        });
      }
      updateData.estimated_fare = fare;
    }

    if (advance_amount_paid !== undefined) {
      const amount = Number(advance_amount_paid);
      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'advance_amount_paid must be a valid positive number'
        });
      }
      updateData.advance_amount_paid = amount;
    }

    if (discount_amount !== undefined) {
      const discount = Number(discount_amount);
      if (isNaN(discount) || discount < 0) {
        return res.status(400).json({
          success: false,
          message: 'discount_amount must be a valid positive number'
        });
      }
      updateData.discount_amount = discount;
    }

    if (refund_amount !== undefined) {
      const refund = Number(refund_amount);
      if (isNaN(refund) || refund < 0) {
        return res.status(400).json({
          success: false,
          message: 'refund_amount must be a valid positive number'
        });
      }
      updateData.refund_amount = refund;
    }

    // Contact information updates
    if (mobile_number !== undefined) {
      if (!mobile_number || String(mobile_number).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'mobile_number cannot be empty'
        });
      }
      updateData.mobile_number = Number(mobile_number);
    }

    if (user_name !== undefined) {
      updateData.user_name = user_name ? user_name.trim() : null;
    }

    if (user_email !== undefined) {
      if (user_email && user_email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user_email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email address'
          });
        }
        updateData.user_email = user_email.trim().toLowerCase();
      } else {
        updateData.user_email = null;
      }
    }

    // Service details updates
    if (service_type !== undefined) {
      if (!service_type || service_type.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'service_type cannot be empty'
        });
      }
      updateData.service_type = service_type.trim();
    }

    if (pick_up_location !== undefined) {
      if (!pick_up_location || pick_up_location.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'pick_up_location cannot be empty'
        });
      }
      updateData.pick_up_location = pick_up_location.trim();
    }

    if (drop_location !== undefined) {
      updateData.drop_location = drop_location ? drop_location.trim() : null;
    }

    if (journey_date !== undefined) {
      if (!journey_date || journey_date.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'journey_date cannot be empty'
        });
      }
      updateData.journey_date = journey_date.trim();
    }

    if (return_date !== undefined) {
      updateData.return_date = return_date ? new Date(return_date).toISOString() : null;
    }

    if (pick_up_time !== undefined) {
      if (!pick_up_time || pick_up_time.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'pick_up_time cannot be empty'
        });
      }
      updateData.pick_up_time = pick_up_time.trim();
    }

    if (car_type !== undefined) {
      if (!car_type || car_type.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'car_type cannot be empty'
        });
      }
      updateData.car_type = car_type.trim();
    }

    if (km_limit !== undefined) {
      updateData.km_limit = km_limit ? String(km_limit) : null;
    }

    if (booking_source !== undefined) {
      updateData.booking_source = booking_source ? booking_source.trim() : 'web';
    }

    if (rental_booking_type !== undefined) {
      updateData.rental_booking_type = rental_booking_type ? rental_booking_type.trim() : null;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    // Find booking by booking_id (bookingtable doesn't have id column, only booking_id)
    const { data: existingBooking, error: findError } = await supabase
      .from('bookingtable')
      .select('booking_id')
      .eq('booking_id', id)
      .limit(1)
      .single();

    if (findError || !existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking using booking_id
    const { data, error } = await supabase
      .from('bookingtable')
      .update(updateData)
      .eq('booking_id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase booking update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update booking',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data
    });

  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;

