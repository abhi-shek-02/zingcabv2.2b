#!/bin/bash

# Test script for Booking and Contact APIs
# Make sure your local server is running on port 5000

BASE_URL="http://localhost:5000"

echo "=========================================="
echo "Testing Booking and Contact APIs"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Booking API
echo -e "${YELLOW}Test 1: Booking API${NC}"
echo "POST ${BASE_URL}/api/booking"
echo ""

curl -X POST "${BASE_URL}/api/booking" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
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
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Contact API
echo -e "${YELLOW}Test 2: Contact API${NC}"
echo "POST ${BASE_URL}/api/contact"
echo ""

curl -X POST "${BASE_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "name": "ABHISHEK SHAW",
    "email": "abhishekshaw2k20@gmail.com",
    "phone": "7003848501",
    "message": "Test message from curl",
    "subject": "general"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat

echo ""
echo "=========================================="
echo "Tests completed!"
echo "=========================================="

