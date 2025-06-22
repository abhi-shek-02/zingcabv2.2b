# ZingCab API Documentation

## Overview
ZingCab is a professional intercity cab booking service with a complete backend API built using Node.js, Express, and Supabase. This documentation provides all endpoints needed to build an admin panel.

## Base URL
```
Development: http://localhost:3001
Production: https://your-production-domain.com
```

## Authentication
Currently, the API uses public endpoints. For admin panel security, implement authentication middleware.

## Database Schema

### Tables

#### 1. bookingtable
```sql
- id (int, primary key)
- booking_id (varchar, unique)
- user_name (varchar)
- user_email (varchar)
- mobile_number (varchar)
- service_type (varchar) — 'oneway', 'airport', 'roundtrip', 'rental'
- pick_up_location (varchar)
- pick_up_time (varchar)
- journey_date (date)
- booking_date (date)
- car_type (varchar) — 'hatchback', 'sedan', 'suv', 'crysta', 'scorpio'
- drop_location (varchar, nullable)
- estimated_fare (decimal)
- booking_source (varchar)
- return_date (date, nullable)
- rental_booking_type (varchar, nullable)
- driver_name (varchar, nullable)
- driver_mobile (varchar, nullable)
- vehicle_number (varchar, nullable)
- amount_paid_to_driver (decimal, nullable)
- advance_amount_paid (decimal)
- payment_id (varchar, nullable)
- payment_status (varchar, nullable) — 'paid', 'pending', 'failed'
- payment_method (varchar, nullable) — 'upi', 'card', 'cash', 'wallet'
- payment_date (timestamp, nullable)
- refund_status (varchar, nullable) — 'initiated', 'completed', 'failed'
- refund_amount (decimal, nullable)
- cancellation_reason (varchar, nullable)
- ride_status (varchar) — 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
- km_limit (int)
- discount_amount (decimal, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. contactustable
```sql
- id (int, primary key)
- name (varchar)
- email (varchar)
- phone (varchar)
- subject (varchar)
- message (text)
- created_at (timestamp)
```

## API Endpoints

### Health Check
**GET** `/health`
- **Description**: Check server status
- **Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

## Admin Booking Management

### 1. Calculate Fare Estimate (Admin Panel)
**POST** `/api/fare/estimate`
- **Description**: Calculate fare estimate for a trip (Admin panel will use this first)
- **Request Body**:
```json
{
  "km_limit": 300,
  "mobile_number": "9876543210",
  "service_type": "oneway",
  "pick_up_location": "Mumbai",
  "pick_up_time": "09:00",
  "journey_date": "2024-01-15",
  "car_type": "sedan",
  "drop_location": "Pune",
  "booking_source": "admin",
  "return_date": "2024-01-16", // Required for roundtrip
  "rental_booking_type": "4hr" // Required for rental
}
```

- **Response**:
```json
{
  "success": true,
  "data": {
    "selected_car": {
      "car_type": "sedan",
      "estimated_fare": 2500,
      "km_limit": 150,
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
        "estimated_fare": 2200,
        "km_limit": 150,
        "breakdown": { ... }
      },
      "sedan": {
        "estimated_fare": 2500,
        "km_limit": 150,
        "breakdown": { ... }
      },
      "suv": {
        "estimated_fare": 3200,
        "km_limit": 150,
        "breakdown": { ... }
      },
      "crysta": {
        "estimated_fare": 3800,
        "km_limit": 150,
        "breakdown": { ... }
      },
      "scorpio": {
        "estimated_fare": 4200,
        "km_limit": 150,
        "breakdown": { ... }
      }
    },
    "service_details": {
      "service_type": "oneway",
      "pick_up_location": "Mumbai",
      "drop_location": "Pune",
      "journey_date": "2024-01-15",
      "pick_up_time": "09:00",
      "return_date": null,
      "rental_duration": null,
      "distance": 150
    }
  }
}
```

### 2. Create Booking (Admin Panel)
**POST** `/api/booking`
- **Description**: Create a new booking (Admin panel will use this after fare calculation)
- **Request Body**:
```json
{
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "km_limit": 300,
  "mobile_number": "9876543210",
  "service_type": "oneway",
  "pick_up_location": "Mumbai",
  "pick_up_time": "09:00",
  "journey_date": "2024-01-15",
  "car_type": "sedan",
  "drop_location": "Pune",
  "estimated_fare": 2500,
  "booking_source": "admin",
  "return_date": "2024-01-16", // Required for roundtrip
  "rental_booking_type": "4hr", // Required for rental
  "advance_amount_paid": 500
}
```

- **Response** (201):
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": "ZC1234ABCD",
    "estimated_fare": 2500,
    "advance_amount": 500,
    "status": "pending",
    "pickup_date": "2024-01-15",
    "pickup_time": "09:00",
    "service_type": "oneway",
    "car_type": "sedan",
    "km_limit": 300,
    "booking_date": "2024-01-01"
  }
}
```

### 3. Get All Bookings
**GET** `/api/booking`
- **Description**: Retrieve all bookings (for admin panel)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_id": "ZC1234ABCD",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "km_limit": 300,
      "mobile_number": "9876543210",
      "service_type": "oneway",
      "pick_up_location": "Mumbai",
      "pick_up_time": "09:00",
      "journey_date": "2024-01-15",
      "booking_date": "2024-01-01",
      "car_type": "sedan",
      "drop_location": "Pune",
      "estimated_fare": 2500,
      "booking_source": "admin",
      "return_date": null,
      "rental_booking_type": null,
      "driver_name": null,
      "driver_mobile": null,
      "vehicle_number": null,
      "amount_paid_to_driver": null,
      "advance_amount_paid": 500,
      "payment_id": null,
      "payment_status": null,
      "payment_method": null,
      "payment_date": null,
      "refund_status": null,
      "refund_amount": null,
      "cancellation_reason": null,
      "ride_status": "pending",
      "discount_amount": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. Get Booking by ID
**GET** `/api/booking/:bookingId`
- **Description**: Retrieve a specific booking
- **Parameters**: `bookingId` (string) - The booking ID
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": "ZC1234ABCD",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "km_limit": 300,
    "mobile_number": "9876543210",
    "service_type": "oneway",
    "pick_up_location": "Mumbai",
    "pick_up_time": "09:00",
    "journey_date": "2024-01-15",
    "booking_date": "2024-01-01",
    "car_type": "sedan",
    "drop_location": "Pune",
    "estimated_fare": 2500,
    "booking_source": "admin",
    "return_date": null,
    "rental_booking_type": null,
    "driver_name": null,
    "driver_mobile": null,
    "vehicle_number": null,
    "amount_paid_to_driver": null,
    "advance_amount_paid": 500,
    "payment_id": null,
    "payment_status": null,
    "payment_method": null,
    "payment_date": null,
    "refund_status": null,
    "refund_amount": null,
    "cancellation_reason": null,
    "ride_status": "pending",
    "discount_amount": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Contact Management

### 1. Get All Contact Submissions
**GET** `/api/contact`
- **Description**: Retrieve all contact submissions (for admin panel)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "subject": "General Inquiry",
      "message": "I would like to know more about your services.",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Service Types
- **oneway**: One-way trip
- **airport**: Airport transfer
- **roundtrip**: Round trip with return
- **rental**: Hourly/daily rental

## Car Types
- **hatchback**: Small car
- **sedan**: Standard sedan
- **suv**: SUV vehicle
- **crysta**: Toyota Innova Crysta
- **scorpio**: Mahindra Scorpio

## Ride Status Options
- **pending**: Booking created, awaiting confirmation
- **confirmed**: Booking confirmed by admin
- **in_progress**: Trip in progress
- **completed**: Trip completed
- **cancelled**: Booking cancelled

## Payment Status Options
- **paid**: Payment completed
- **pending**: Payment pending
- **failed**: Payment failed

## Payment Method Options
- **upi**: UPI payment
- **card**: Card payment
- **cash**: Cash payment
- **wallet**: Wallet payment

## Refund Status Options
- **initiated**: Refund initiated
- **completed**: Refund completed
- **failed**: Refund failed

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: mobile_number, service_type"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Booking not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Admin Panel Features to Implement

### 1. Dashboard
- Total bookings count
- Recent bookings
- Revenue statistics (use estimated_fare column)
- Contact form submissions count

### 2. Booking Management
**View All Bookings with Filters**
Filter by journey date, status, service type, car type, user mobile, booking source, and more.

**View Booking Details**
Full breakdown of each booking including user info, ride info, payment status, driver assignment, and audit logs.

**Update Booking Status**
Change ride status across stages: pending, confirmed, in_progress, completed, or cancelled.

**Update User Details Individually**
Update user_name or user_email for any booking using the booking ID — no need to update all fields together.

**Assign Driver Details (Independently)**
Assign or update the following fields one by one:
- driver_name
- driver_mobile
- vehicle_number
(These can be saved/updated separately against the booking_id.)

**Update Payment Details (Individually)**
Update or set any of the following fields independently:
- amount_paid_to_driver
- advance_amount_paid
- payment_id
- payment_status
- payment_method
- payment_date
- refund_status
- refund_amount

**Partial Update Capability**
All booking-related fields (user, driver, payment) can be updated independently — no requirement to save everything in one go.

**Export Bookings to CSV/Excel**
Export all filtered bookings with custom date range, service type, or status filters for analysis and reporting.

**Audit Trail / Change Logs (Optional)**
Track what was updated, when, and by whom (admin panel feature).

### 3. Contact Management
- View all contact submissions
- Mark as read/unread
- Reply to inquiries
- Export contact data

### 4. Analytics
- Booking trends
- Popular routes
- Revenue reports
- Service type distribution

### 5. Settings
- Fare rates configuration
- Service type management
- Car type management
- System settings

---

## Environment Variables Required
```env
PROJECT URL [https://ddpbdfxbqjydjptchvbm.supabase.co](https://ddpbdfxbqjydjptchvbm.supabase.co/)
API Key
anonpublic
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGJkZnhicWp5ZGpwdGNodmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTg3NTgsImV4cCI6MjA2NDg5NDc1OH0.tr-4BUPKwM2n57ekZ43-nM6ZhKSxIQTjS_rotN0_bc8
NODE_ENV=development
PORT=3001
```

## Rate Limiting
- 100 requests per 15 minutes per IP address

## CORS Configuration
- Development: All origins allowed
- Production: Specific domains only

This API documentation provides all the necessary endpoints and data structures to build a comprehensive admin panel for the ZingCab application. 