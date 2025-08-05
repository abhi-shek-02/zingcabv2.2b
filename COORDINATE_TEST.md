# 🧪 Coordinate Functionality Test Guide

## Frontend Testing (http://localhost:5173)

### 1. **Basic Coordinate Collection Test**

#### **Test Steps:**
1. Open the booking form
2. Start typing "Kolkata" in the pickup location
3. Select "Kolkata, West Bengal, India" from suggestions
4. Start typing "Durgapur" in the drop location  
5. Select "Durgapur, West Bengal, India" from suggestions

#### **Expected Results:**
- ✅ Distance should be calculated automatically
- ✅ Location status should show "Precise location pricing available" (green)
- ✅ Debug section should show coordinates:
  - Pickup: ~22.5726, 88.3639 (Kolkata)
  - Dropoff: ~23.5204, 87.3119 (Durgapur)

### 2. **API Payload Test**

#### **Test Steps:**
1. Fill in all required fields
2. Click "Check Fare Instantly"
3. Open browser developer tools (F12)
4. Check Console for payload logs

#### **Expected Console Output:**
```javascript
Fare estimation payload with coordinates: {
  service_type: "oneway",
  pick_up_location: "Kolkata, West Bengal, India",
  drop_location: "Durgapur, West Bengal, India",
  pickup_lat: 22.5726,
  pickup_lng: 88.3639,
  drop_lat: 23.5204,
  drop_lng: 87.3119,
  car_type: "sedan",
  km_limit: 180,
  // ... other fields
}
```

### 3. **Partial Coordinate Test**

#### **Test Steps:**
1. Select only pickup location (Kolkata)
2. Leave drop location empty
3. Check location status indicator

#### **Expected Results:**
- ⚠️ Location status should show "Partial location data" (yellow)
- ✅ Only pickup coordinates should appear in debug section

### 4. **No Coordinate Test**

#### **Test Steps:**
1. Manually type locations without selecting from suggestions
2. Check location status indicator

#### **Expected Results:**
- ⚠️ Location status should show "Standard pricing will be used" (gray)
- ❌ No coordinates in debug section

### 5. **Popular Routes Test**

#### **Test Steps:**
1. Click on "Kolkata → Durgapur" popular route button
2. Verify coordinates are automatically set
3. Check fare calculation

#### **Expected Results:**
- ✅ Coordinates should be automatically populated
- ✅ Distance should be calculated
- ✅ Fare should be estimated with coordinates

## Backend Testing (When Implemented)

### 1. **Fare Estimation API Test**

#### **Request:**
```bash
curl -X POST http://localhost:3001/api/fare/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "service_type": "oneway",
    "pick_up_location": "Kolkata",
    "drop_location": "Durgapur",
    "pickup_lat": 22.5726,
    "pickup_lng": 88.3639,
    "drop_lat": 23.5204,
    "drop_lng": 87.3119,
    "car_type": "sedan",
    "km_limit": 180,
    "journey_date": "2024-08-10",
    "mobile_number": "9876543210"
  }'
```

#### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "selected_car": {
      "car_type": "sedan",
      "estimated_fare": 1400,
      "pricing_type": "fixed_interzone",
      "zone_info": {
        "pickup_zone": {
          "zoneId": "kolkata_metro",
          "zoneName": "Kolkata Metropolitan Area"
        },
        "drop_zone": {
          "zoneId": "durgapur_zone", 
          "zoneName": "Durgapur Industrial Zone"
        }
      }
    }
  }
}
```

### 2. **Booking API Test**

#### **Request:**
```bash
curl -X POST http://localhost:3001/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9876543210",
    "service_type": "oneway",
    "pick_up_location": "Kolkata",
    "drop_location": "Durgapur",
    "pickup_lat": 22.5726,
    "pickup_lng": 88.3639,
    "drop_lat": 23.5204,
    "drop_lng": 87.3119,
    "car_type": "sedan",
    "estimated_fare": 1400,
    "km_limit": 180,
    "journey_date": "2024-08-10",
    "pick_up_time": "10:00 AM",
    "booking_source": "website"
  }'
```

## 🐛 Common Issues & Solutions

### 1. **Coordinates Not Appearing**
- **Cause**: Ola Maps API key issue or network problem
- **Solution**: Check browser console for API errors

### 2. **Distance Not Calculating**
- **Cause**: One or both coordinates missing
- **Solution**: Ensure both locations are selected from suggestions

### 3. **API Errors**
- **Cause**: Backend not updated for coordinate parameters
- **Solution**: Implement backend coordinate handling

### 4. **Location Status Not Updating**
- **Cause**: State management issue
- **Solution**: Check React component state updates

## 📱 Mobile Testing

### **Test on Mobile Devices:**
1. Open booking form on mobile browser
2. Test location selection with mobile keyboard
3. Verify coordinate collection works on touch devices
4. Check responsive design for location status indicators

## 🔍 Debug Information

### **Browser Console Commands:**
```javascript
// Check current coordinates
console.log('Pickup:', pickupCoords);
console.log('Dropoff:', dropoffCoords);

// Check distance
console.log('Distance:', distance);

// Check form data
console.log('Form Data:', formData);
```

### **Network Tab:**
- Monitor API calls to `/api/fare/estimate`
- Verify coordinate parameters are sent
- Check response for zone information

---

**Test Status**: ✅ Frontend ready for testing
**Backend Status**: 🔄 Implementation required 