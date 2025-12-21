/**
 * Driver Route
 * 
 * Handles driver management operations (CRUD)
 * 
 * @module routes/driver
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase.cjs');

/**
 * GET /api/driver
 * Get list of drivers with pagination and search
 * Query params: page, limit, search, status
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    
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
      .from('drivers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter (name, phone, license_number)
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,license_number.ilike.%${search}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase driver list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch drivers',
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
    console.error('Driver list error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * GET /api/driver/:id
 * Get single driver by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required'
      });
    }

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }
      
      console.error('Supabase driver fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch driver',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Driver fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * POST /api/driver
 * Create a new driver
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      license_number,
      status,
      assigned_vehicle,
      total_trips,
      rating,
      joined_date
    } = req.body;

    // Validation
    if (!name || !phone || !license_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide: name, phone, license_number'
      });
    }

    // Validate status
    const validStatuses = ['available', 'on_trip', 'off_duty', 'unavailable'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Validate rating
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5'
      });
    }

    // Prepare driver data
    const driverData = {
      name: name.trim(),
      phone: phone.trim(),
      license_number: license_number.trim(),
      status: (status || 'available').trim(),
      assigned_vehicle: assigned_vehicle ? assigned_vehicle.trim() : null,
      total_trips: total_trips ? parseInt(total_trips) : 0,
      rating: rating ? parseFloat(rating) : 0.00,
      joined_date: joined_date || new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('drivers')
      .insert([driverData])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (license_number)
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Driver with this license number already exists'
        });
      }

      console.error('Supabase driver create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create driver',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data
    });

  } catch (error) {
    console.error('Driver creation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * PUT /api/driver/:id
 * Update driver by ID
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      license_number,
      status,
      assigned_vehicle,
      total_trips,
      rating,
      joined_date
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required'
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty'
        });
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone || !phone.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Phone cannot be empty'
        });
      }
      updateData.phone = phone.trim();
    }

    if (license_number !== undefined) {
      if (!license_number || !license_number.trim()) {
        return res.status(400).json({
          success: false,
          message: 'License number cannot be empty'
        });
      }
      updateData.license_number = license_number.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['available', 'on_trip', 'off_duty', 'unavailable'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updateData.status = status;
    }

    if (assigned_vehicle !== undefined) {
      updateData.assigned_vehicle = assigned_vehicle ? assigned_vehicle.trim() : null;
    }

    if (total_trips !== undefined) {
      const trips = parseInt(total_trips);
      if (isNaN(trips) || trips < 0) {
        return res.status(400).json({
          success: false,
          message: 'Total trips must be a valid non-negative number'
        });
      }
      updateData.total_trips = trips;
    }

    if (rating !== undefined) {
      const ratingValue = parseFloat(rating);
      if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 0 and 5'
        });
      }
      updateData.rating = ratingValue;
    }

    if (joined_date !== undefined) {
      updateData.joined_date = joined_date;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    const { data, error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Driver with this license number already exists'
        });
      }

      console.error('Supabase driver update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update driver',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data
    });

  } catch (error) {
    console.error('Driver update error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * DELETE /api/driver/:id
 * Delete driver by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required'
      });
    }

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      console.error('Supabase driver delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete driver',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });

  } catch (error) {
    console.error('Driver delete error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

module.exports = router;

