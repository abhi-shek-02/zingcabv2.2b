/**
 * Vehicle Route
 * 
 * Handles vehicle management operations (CRUD)
 * 
 * @module routes/vehicle
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase.cjs');

/**
 * GET /api/vehicle
 * Get list of vehicles with pagination and search
 * Query params: page, limit, search, status, car_type
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const car_type = req.query.car_type || '';
    
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
      .from('vehicles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter (registration_number, car_type, model)
    if (search) {
      query = query.or(`registration_number.ilike.%${search}%,car_type.ilike.%${search}%,model.ilike.%${search}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply car_type filter
    if (car_type) {
      query = query.eq('car_type', car_type);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase vehicle list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicles',
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
    console.error('Vehicle list error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * GET /api/vehicle/:id
 * Get single vehicle by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required'
      });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }
      
      console.error('Supabase vehicle fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Vehicle fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * POST /api/vehicle
 * Create a new vehicle
 */
router.post('/', async (req, res) => {
  try {
    const {
      registration_number,
      car_type,
      model,
      status,
      assigned_driver,
      total_trips,
      last_service_date,
      next_service_date,
      fuel_type
    } = req.body;

    // Validation
    if (!registration_number || !car_type || !model) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide: registration_number, car_type, model'
      });
    }

    // Validate car_type
    const validCarTypes = ['Sedan', 'SUV', 'Hatchback', 'Innova Crysta', 'Scorpio'];
    if (!validCarTypes.includes(car_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid car_type. Must be one of: ${validCarTypes.join(', ')}`
      });
    }

    // Validate status
    const validStatuses = ['available', 'assigned', 'maintenance', 'unavailable'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Validate fuel_type
    const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'CNG'];
    if (fuel_type && !validFuelTypes.includes(fuel_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid fuel_type. Must be one of: ${validFuelTypes.join(', ')}`
      });
    }

    // Prepare vehicle data
    const vehicleData = {
      registration_number: registration_number.trim(),
      car_type: car_type.trim(),
      model: model.trim(),
      status: (status || 'available').trim(),
      assigned_driver: assigned_driver ? assigned_driver.trim() : null,
      total_trips: total_trips ? parseInt(total_trips) : 0,
      last_service_date: last_service_date || null,
      next_service_date: next_service_date || null,
      fuel_type: (fuel_type || 'Petrol').trim()
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (registration_number)
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Vehicle with this registration number already exists'
        });
      }

      console.error('Supabase vehicle create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create vehicle',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data
    });

  } catch (error) {
    console.error('Vehicle creation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * PUT /api/vehicle/:id
 * Update vehicle by ID
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      registration_number,
      car_type,
      model,
      status,
      assigned_driver,
      total_trips,
      last_service_date,
      next_service_date,
      fuel_type
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required'
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};

    if (registration_number !== undefined) {
      if (!registration_number || !registration_number.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Registration number cannot be empty'
        });
      }
      updateData.registration_number = registration_number.trim();
    }

    if (car_type !== undefined) {
      const validCarTypes = ['Sedan', 'SUV', 'Hatchback', 'Innova Crysta', 'Scorpio'];
      if (!validCarTypes.includes(car_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid car_type. Must be one of: ${validCarTypes.join(', ')}`
        });
      }
      updateData.car_type = car_type.trim();
    }

    if (model !== undefined) {
      if (!model || !model.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Model cannot be empty'
        });
      }
      updateData.model = model.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['available', 'assigned', 'maintenance', 'unavailable'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updateData.status = status;
    }

    if (assigned_driver !== undefined) {
      updateData.assigned_driver = assigned_driver ? assigned_driver.trim() : null;
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

    if (last_service_date !== undefined) {
      updateData.last_service_date = last_service_date || null;
    }

    if (next_service_date !== undefined) {
      updateData.next_service_date = next_service_date || null;
    }

    if (fuel_type !== undefined) {
      const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'CNG'];
      if (!validFuelTypes.includes(fuel_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid fuel_type. Must be one of: ${validFuelTypes.join(', ')}`
        });
      }
      updateData.fuel_type = fuel_type.trim();
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Vehicle with this registration number already exists'
        });
      }

      console.error('Supabase vehicle update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update vehicle',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data
    });

  } catch (error) {
    console.error('Vehicle update error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * DELETE /api/vehicle/:id
 * Delete vehicle by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required'
      });
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      console.error('Supabase vehicle delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete vehicle',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Vehicle delete error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

module.exports = router;

