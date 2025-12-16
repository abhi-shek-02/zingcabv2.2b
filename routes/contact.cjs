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

    // Store contact form submission
    // Note: You may want to create a 'contacts' table in Supabase for this
    // For now, we'll just return success (you can add email notification later)
    
    // If you have a contacts table, uncomment this:
    /*
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name: name,
        email: email,
        phone: phone || null,
        message: message,
        subject: subject || 'general',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase contact error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit contact form',
        error: error.message
      });
    }
    */

    // For now, just return success
    // TODO: Add email notification or store in database
    console.log('Contact form submission:', { name, email, phone, message, subject });

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.'
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

module.exports = router;

