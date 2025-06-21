# ZingCab Backend API Documentation

## Overview
This is the backend API for ZingCab, a cab booking service. The API handles booking management, fare calculation, and contact form submissions.

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

## Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
SUPABASE_URL=https://ddpbdfxbqjydjptchvbm.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
NODE_ENV=development
```

## API Endpoints

### 1. Contact Form API

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

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "submitted_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET `/api/contact`
Get all contact submissions (admin endpoint).

#### GET `/api/contact/:id`
Get a specific contact submission by ID.

### 2. Booking API

#### POST `/api/booking`
Create a new booking.

**Request Body (One-way/Airport):**
```json
{
  "km_limit": "150km",
  "mobile_number": "9876543210",
  "service_type": "oneway",
  "pick_up_location": "Mumbai",
  "pick_up_time": "09:00",
  "journey_date": "2024-01-20",
  "car_type": "sedan",
  "drop_location": "Pune",
  "estimated_fare": 2500,
  "booking_source": "website",
  "name": "John Doe",
  "email": "john@example.com",
  "advance_amount_paid": 500
}
```

**Request Body (Round Trip):**
```json
{
  "km_limit": "300km",
  "mobile_number": "9876543210",
  "service_type": "roundtrip",
  "pick_up_location": "Mumbai",
  "pick_up_time": "09:00",
  "journey_date": "2024-01-20",
  "car_type": "suv",
  "drop_location": "Pune",
  "estimated_fare": 4500,
  "booking_source": "website",
  "return_date": "2024-01-22"
}
```

**Request Body (Rental):**
```json
{
  "mobile_number": "9876543210",
  "service_type": "rental",
  "pick_up_location": "Mumbai",
  "pick_up_time": "09:00",
  "journey_date": "2024-01-20",
  "car_type": "sedan",
  "rental_booking_type": "8hr/80km",
  "estimated_fare": 1200,
  "booking_source": "website",
  "km_limit": "80km"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": "ZC123456ABC",
    "estimated_fare": 2500,
    "advance_amount": 500,
    "status": "pending",
    "pickup_date": "2024-01-20",
    "pickup_time": "09:00",
    "service_type": "oneway",
    "car_type": "sedan",
    "km_limit": "150km",
    "booking_date": "2024-01-15"
  }
}
```

#### GET `/api/booking/:bookingId`
Get booking details by booking ID.

#### GET `/api/booking`
Get all bookings (admin endpoint).

### 3. Fare Calculation API

#### POST `/api/fare/estimate`
Calculate fare estimate for all car types.

**Request Body:**
```json
{
  "km_limit": "150km",
  "mobile_number": "9876543210",
  "service_type": "oneway",
  "pick_up_location": "Mumbai",
  "pick_up_time": "09:00",
  "journey_date": "2024-01-20",
  "car_type": "sedan",
  "drop_location": "Pune",
  "booking_source": "website"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "selected_car": {
      "car_type": "sedan",
      "estimated_fare": 2500,
      "km_limit": "150km",
      "breakdown": {
        "base_fare": 1800,
        "toll_charges": 200,
        "state_tax": 150,
        "gst": 324,
        "driver_allowance": 200
      }
    },
    "all_car_fares": {
      "hatchback": {
        "estimated_fare": 2000,
        "km_limit": "150km",
        "breakdown": { ... }
      },
      "sedan": {
        "estimated_fare": 2500,
        "km_limit": "150km",
        "breakdown": { ... }
      },
      "suv": {
        "estimated_fare": 3000,
        "km_limit": "150km",
        "breakdown": { ... }
      }
    },
    "service_details": {
      "service_type": "oneway",
      "pick_up_location": "Mumbai",
      "drop_location": "Pune",
      "journey_date": "2024-01-20",
      "pick_up_time": "09:00",
      "distance": "150km"
    }
  }
}
```

#### POST `/api/fare/calculator`
Simple fare calculator.

**Request Body:**
```json
{
  "distance": 150,
  "service_type": "oneway",
  "car_type": "sedan",
  "rental_hours": 8
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimated_fare": 2500,
    "breakdown": {
      "base_fare": 1800,
      "toll_charges": 200,
      "state_tax": 150,
      "gst": 324,
      "driver_allowance": 200
    },
    "calculation_details": {
      "distance": "150km",
      "service_type": "oneway",
      "car_type": "sedan"
    }
  }
}
```

## Service Types

1. **oneway**: One-way journey
2. **airport**: Airport pickup/drop
3. **roundtrip**: Round trip with return date
4. **rental**: Hourly/daily rental service

## Car Types

1. **hatchback**: Small car
2. **sedan**: Medium car
3. **suv**: Sports Utility Vehicle
4. **crysta**: Toyota Innova Crysta
5. **scorpio**: Mahindra Scorpio

## Fare Calculation Logic

### Base Rates (per km)
- Hatchback: ₹12/km
- Sedan: ₹15/km
- SUV: ₹18/km
- Crysta: ₹20/km
- Scorpio: ₹22/km

### Service Multipliers
- One-way: 1.0x
- Airport: 1.3x
- Round trip: 1.8x
- Rental: 1.5x

### Additional Charges
- Toll charges: ₹200 (one-way/airport)
- State tax: ₹150 (one-way/airport)
- GST: 18% of base fare
- Driver allowance: ₹200 (one-way/airport), ₹500 (round trip)

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error

## Running the Server

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

## Database Schema

### bookingtable
- booking_id (primary key)
- mobile_number
- service_type
- pick_up_location
- drop_location
- journey_date
- return_date
- pick_up_time
- booking_date
- car_type
- rental_booking_type
- estimated_fare
- booking_source
- km_limit
- name
- email
- advance_amount_paid
- ride_status
- created_at
- updated_at

### contactustable
- id (primary key)
- name
- email
- phone
- subject
- message
- status
- created_at 