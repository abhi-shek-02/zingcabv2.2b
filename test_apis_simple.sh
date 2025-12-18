#!/bin/bash

# Simple test script for Booking and Contact APIs (no jq required)
# Make sure your local server is running: NODE_ENV=development node server.cjs

BASE_URL="http://localhost:5000"

echo "=========================================="
echo "Testing Booking and Contact APIs"
echo "=========================================="
echo ""

# Test 1: Health Check (verify server is running)
echo "Test 0: Health Check"
echo "GET ${BASE_URL}/health"
echo ""
curl -s "${BASE_URL}/health"
echo ""
echo "----------------------------------------"
echo ""

# Test 1: Booking API
echo "Test 1: Booking API"
echo "POST ${BASE_URL}/api/booking"
echo ""
curl -X POST "${BASE_URL}/api/booking" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "7003848501",
    "service_type": "oneway",
    "pick_up_location": "Kolkata, Kolkata, West Bengal, India",
    "drop_location": "Mandarmani, RamNagar II, Purba Medinipur District, West Bengal, India",
    "journey_date": "2025-12-17",
    "return_date": null,
    "pick_up_time": "09:00 AM",
    "car_type": "suv",
    "estimated_fare": 4499,
    "km_limit": 166.21,
    "booking_source": "website",
    "pickup_lat": 22.529923,
    "pickup_lng": 88.346142,
    "drop_lat": 21.670449,
    "drop_lng": 87.69484
  }'
echo ""
echo ""
echo "----------------------------------------"
echo ""

# Test 2: Contact API
echo "Test 2: Contact API"
echo "POST ${BASE_URL}/api/contact"
echo ""
curl -X POST "${BASE_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABHISHEK SHAW",
    "email": "abhishekshaw2k20@gmail.com",
    "phone": "7003848501",
    "message": "Test message from curl",
    "subject": "general"
  }'
echo ""
echo ""
echo "=========================================="
echo "Tests completed!"
echo "=========================================="

