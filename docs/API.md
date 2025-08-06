# 📚 ZingCab API Documentation

## Overview

ZingCab provides a comprehensive RESTful API for cab booking services with advanced geolocation-based pricing, route management, and booking operations.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.zingcab.in/api`

## Authentication

Currently, the API uses simple authentication. For production, implement JWT tokens.

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Core Endpoints

### 1. Fare Estimation

#### POST `/api/fare/estimate`

Calculate fare estimate with geolocation-based pricing.

**Request Body:**
```json
{
  "pickup_lat": 22.5726,
  "pickup_lng": 88.3639,
  "drop_lat": 21.6291,
  "drop_lng": 87.5325,
  "car_type": "sedan",
  "service_type": "oneway",
  "pickup_time": "09:00",
  "journey_date": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimated_fare": 3699,
    "pricing_type": "fixed_route",
    "pickup_zone": "Kolkata",
    "drop_zone": "Digha",
    "distance_km": 185.5,
    "breakdown": {
      "base_fare": 3699,
      "night_charge": 0,
      "festive_charge": 0,
      "gst": 666,
      "driver_allowance": 200,
      "total": 4565
    },
    "all_car_fares": {
      "hatchback": 3299,
      "sedan": 3699,
      "suv": 4499,
      "crysta": 4999
    }
  }
}
```

### 2. Route Management

#### GET `/api/routes`

Get all active routes.

**Query Parameters:**
- `type`: Filter by route type (tourist, business, religious, educational)
- `active`: Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "kolkata-digha",
      "start": "Kolkata",
      "end": "Digha",
      "route_type": "tourist",
      "fares": { "sedan": 3699, "suv": 4499 },
      "active": true,
      "priority": 1
    }
  ],
  "count": 28
}
```

#### POST `/api/routes`

Add a new route.

**Request Body:**
```json
{
  "start": "Digha",
  "end": "Mandarmani",
  "service_type": "oneway",
  "route_type": "tourist",
  "fares": {
    "sedan": 1499,
    "suv": 1999
  },
  "conditions": {
    "seasonal": {
      "summer": {
        "sedan": 1699,
        "suv": 2199
      }
    }
  },
  "priority": 2
}
```

#### PUT `/api/routes/:id`

Update an existing route.

#### DELETE `/api/routes/:id`

Delete a route.

#### GET `/api/routes/stats`

Get route statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_routes": 28,
    "active_routes": 28,
    "route_types": {
      "tourist": 6,
      "business": 14,
      "religious": 6,
      "educational": 2
    },
    "seasonal_routes": 8,
    "event_based_routes": 8,
    "time_based_routes": 2
  }
}
```

#### POST `/api/routes/test-pricing`

Test route pricing with conditions.

**Request Body:**
```json
{
  "start": "Kolkata",
  "end": "Digha",
  "service_type": "oneway",
  "car_type": "sedan",
  "date": "2024-05-15",
  "time": "09:00"
}
```

#### GET `/api/routes/info/current`

Get current season, events, and time slots.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_date": "2024-08-06T07:20:52.179Z",
    "current_time": "12:50",
    "current_season": "monsoon",
    "current_events": [],
    "current_time_slot": null
  }
}
```

### 3. Booking Management

#### POST `/api/booking`

Create a new booking.

**Request Body:**
```json
{
  "mobile_number": "9876543210",
  "service_type": "oneway",
  "pick_up_location": "Kolkata",
  "drop_location": "Digha",
  "journey_date": "2024-01-20",
  "pick_up_time": "09:00",
  "car_type": "sedan",
  "estimated_fare": 3699,
  "pickup_lat": 22.5726,
  "pickup_lng": 88.3639,
  "drop_lat": 21.6291,
  "drop_lng": 87.5325,
  "name": "John Doe",
  "email": "john@example.com",
  "advance_amount_paid": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": "ZC123456ABC",
    "estimated_fare": 3699,
    "advance_amount": 500,
    "status": "pending",
    "pickup_date": "2024-01-20",
    "pickup_time": "09:00",
    "service_type": "oneway",
    "car_type": "sedan",
    "booking_date": "2024-01-15"
  }
}
```

#### GET `/api/booking/:bookingId`

Get booking details by booking ID.

#### GET `/api/booking`

Get all bookings (admin endpoint).

### 4. Contact Management

#### POST `/api/contact`

Submit a contact form inquiry.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "subject": "General Inquiry",
  "message": "I would like to know more about your services."
}
```

#### GET `/api/contact`

Get all contact submissions (admin endpoint).

## Service Types

1. **oneway**: One-way journey
2. **airport**: Airport pickup/drop
3. **roundtrip**: Round trip with return date
4. **rental**: Hourly/daily rental service

## Car Types

The system supports 15+ vehicle types:

| Vehicle Type | Base Fare | Per KM (One-way) | Per KM (Round-trip) | Rental Package |
|--------------|-----------|------------------|-------------------|----------------|
| hatchback    | ₹149      | ₹14              | ₹12               | ₹499           |
| sedan        | ₹199      | ₹17              | ₹15               | ₹599           |
| suv          | ₹249      | ₹18              | ₹17               | ₹799           |
| crysta       | ₹299      | ₹20              | ₹18               | ₹899           |
| scorpio      | ₹279      | ₹19              | ₹17               | ₹849           |
| innova       | ₹289      | ₹19              | ₹18               | ₹879           |
| xylo         | ₹269      | ₹18              | ₹17               | ₹829           |
| ertiga       | ₹229      | ₹17              | ₹16               | ₹699           |
| xuv500       | ₹259      | ₹18              | ₹17               | ₹799           |
| fortuner     | ₹349      | ₹22              | ₹20               | ₹999           |
| safari       | ₹289      | ₹19              | ₹18               | ₹879           |
| bolero       | ₹199      | ₹16              | ₹14               | ₹599           |
| tempo_traveller | ₹399   | ₹25              | ₹23               | ₹1199          |
| mini_bus     | ₹499      | ₹30              | ₹28               | ₹1499          |
| luxury_sedan | ₹399      | ₹25              | ₹23               | ₹1199          |
| premium_suv  | ₹449      | ₹28              | ₹26               | ₹1299          |

## Pricing Logic

### Fixed Route Pricing
1. Check for exact route match
2. Apply seasonal pricing if applicable
3. Apply event-based pricing if applicable
4. Apply time-based pricing if applicable

### Zone-Based Pricing
1. Detect pickup and drop zones
2. Calculate distance between zones
3. Apply per-km rates based on car type
4. Apply service type multipliers

### Standard Pricing (Fallback)
1. Use distance-based calculation
2. Apply base fare + per-km rates
3. Add service-specific charges

### Multipliers
- **Night Charge**: 10% extra (10 PM - 6 AM)
- **Festive Charge**: 15% extra (during festivals)
- **Peak Hours**: 5% extra (7 AM - 10 AM, 5 PM - 8 PM)

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (validation errors) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

- **100 requests per 15 minutes** per IP address
- **1000 requests per hour** per IP address

## Examples

### Example 1: Fixed Route Booking

```bash
curl -X POST http://localhost:3001/api/fare/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_lat": 22.5726,
    "pickup_lng": 88.3639,
    "drop_lat": 21.6291,
    "drop_lng": 87.5325,
    "car_type": "sedan",
    "service_type": "oneway",
    "pickup_time": "09:00",
    "journey_date": "2024-01-15"
  }'
```

### Example 2: Add New Route

```bash
curl -X POST http://localhost:3001/api/routes \
  -H "Content-Type: application/json" \
  -d '{
    "start": "Digha",
    "end": "Mandarmani",
    "service_type": "oneway",
    "route_type": "tourist",
    "fares": {
      "sedan": 1499,
      "suv": 1999
    }
  }'
```

### Example 3: Create Booking

```bash
curl -X POST http://localhost:3001/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9876543210",
    "service_type": "oneway",
    "pick_up_location": "Kolkata",
    "drop_location": "Digha",
    "journey_date": "2024-01-20",
    "pick_up_time": "09:00",
    "car_type": "sedan",
    "estimated_fare": 3699,
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

## SDKs and Libraries

### JavaScript/Node.js

```javascript
const axios = require('axios');

const zingcabAPI = {
  baseURL: 'http://localhost:3001/api',
  
  async estimateFare(data) {
    const response = await axios.post(`${this.baseURL}/fare/estimate`, data);
    return response.data;
  },
  
  async createBooking(data) {
    const response = await axios.post(`${this.baseURL}/booking`, data);
    return response.data;
  }
};
```

### Python

```python
import requests

class ZingCabAPI:
    def __init__(self, base_url="http://localhost:3001/api"):
        self.base_url = base_url
    
    def estimate_fare(self, data):
        response = requests.post(f"{self.base_url}/fare/estimate", json=data)
        return response.json()
    
    def create_booking(self, data):
        response = requests.post(f"{self.base_url}/booking", json=data)
        return response.json()
```

## Support

For API support and questions:
- **Email**: api-support@zingcab.in
- **Documentation**: [https://docs.zingcab.in](https://docs.zingcab.in)
- **Status Page**: [https://status.zingcab.in](https://status.zingcab.in) 