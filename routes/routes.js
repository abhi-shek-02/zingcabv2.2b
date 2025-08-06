const express = require('express');
const router = express.Router();
const routeManager = require('../utils/routeManager');

// Get all routes
router.get('/', (req, res) => {
  try {
    const { type, active } = req.query;
    let routes;
    
    if (type) {
      routes = routeManager.getRoutesByType(type);
    } else if (active !== undefined) {
      routes = active === 'true' ? routeManager.getAllActiveRoutes() : routeManager.getAllActiveRoutes().filter(r => !r.active);
    } else {
      routes = routeManager.getAllActiveRoutes();
    }
    
    res.json({
      success: true,
      data: routes,
      count: routes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get route statistics
router.get('/stats', (req, res) => {
  try {
    const stats = routeManager.getRouteStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get route by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const routes = routeManager.getAllActiveRoutes();
    const route = routes.find(r => r.id === id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add new route
router.post('/', (req, res) => {
  try {
    const routeData = req.body;
    
    // Validate required fields
    const requiredFields = ['start', 'end', 'service_type', 'fares'];
    const missingFields = requiredFields.filter(field => !routeData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const newRoute = routeManager.addRoute(routeData);
    
    res.status(201).json({
      success: true,
      message: 'Route added successfully',
      data: newRoute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update route
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedRoute = routeManager.updateRoute(id, updates);
    
    res.json({
      success: true,
      message: 'Route updated successfully',
      data: updatedRoute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Activate route
router.patch('/:id/activate', (req, res) => {
  try {
    const { id } = req.params;
    
    const activatedRoute = routeManager.activateRoute(id);
    
    res.json({
      success: true,
      message: 'Route activated successfully',
      data: activatedRoute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Deactivate route
router.patch('/:id/deactivate', (req, res) => {
  try {
    const { id } = req.params;
    
    const deactivatedRoute = routeManager.deactivateRoute(id);
    
    res.json({
      success: true,
      message: 'Route deactivated successfully',
      data: deactivatedRoute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete route
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    routeManager.deleteRoute(id);
    
    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test route pricing with conditions
router.post('/test-pricing', (req, res) => {
  try {
    const { start, end, service_type, car_type, date, time } = req.body;
    
    // Validate required fields
    const requiredFields = ['start', 'end', 'service_type', 'car_type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const options = {
      date: date ? new Date(date) : new Date(),
      time: time || '09:00'
    };
    
    const result = routeManager.findFixedRoute(start, end, service_type, car_type, options);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No fixed route found for the given parameters'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current season and events
router.get('/info/current', (req, res) => {
  try {
    const currentDate = new Date();
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const currentSeason = routeManager.getCurrentSeason(currentDate);
    const currentEvents = routeManager.getCurrentEvents(currentDate);
    const currentTimeSlot = routeManager.getCurrentTimeSlot(currentTime);
    
    res.json({
      success: true,
      data: {
        current_date: currentDate.toISOString(),
        current_time: currentTime,
        current_season: currentSeason,
        current_events: currentEvents,
        current_time_slot: currentTimeSlot
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 