/**
 * Contact Route
 * 
 * Handles contact form submissions
 * 
 * @module routes/contact
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase.cjs');

/**
 * GET /api/contact
 * Get list of contacts with pagination and search
 * Query params: page, limit, search, subject
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const subject = req.query.subject || '';
    
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
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter (name, email, phone, message)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`);
    }

    // Apply subject filter
    if (subject) {
      query = query.eq('subject', subject);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase contact list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch contacts',
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
    console.error('Contact list error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * GET /api/contact/:id
 * Get single contact by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Contact ID is required'
      });
    }

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }
      
      console.error('Supabase contact fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch contact',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Contact fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/contact
 * Submit contact form
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      subject
    } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide: name, email, message'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Store contact form submission in database
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        message: message.trim(),
        subject: (subject || 'general').trim()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase contact error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit contact form',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Log successful submission
    console.log('Contact form submission saved:', { id: data.id, name, email, subject });

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        subject: data.subject,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/contact/:id
 * Update contact by ID
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      message,
      subject
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Contact ID is required'
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
    
    if (email !== undefined) {
      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email cannot be empty'
        });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address'
        });
      }
      updateData.email = email.trim().toLowerCase();
    }
    
    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }
    
    if (message !== undefined) {
      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message cannot be empty'
        });
      }
      updateData.message = message.trim();
    }
    
    if (subject !== undefined) {
      updateData.subject = (subject || 'general').trim();
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }
      
      console.error('Supabase contact update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update contact',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data
    });

  } catch (error) {
    console.error('Contact update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;

