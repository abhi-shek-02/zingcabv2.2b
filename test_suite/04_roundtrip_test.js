const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test Suite 4: Roundtrip Service Tests
const roundtripTests = [
  // Fixed Route Roundtrip Tests
  {
    name: 'Kolkata to Digha Roundtrip - Sedan',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      return_date: '2024-08-12',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      pickup_zone: 'Kolkata',
      drop_zone: 'Digha'
    }
  },
  {
    name: 'Durgapur to Kolkata Roundtrip - SUV',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Durgapur',
      drop_location: 'Kolkata',
      pickup_lat: 23.5204,
      pickup_lng: 87.3119,
      drop_lat: 22.5726,
      drop_lng: 88.3639,
      car_type: 'suv',
      km_limit: 180,
      journey_date: '2024-08-10',
      return_date: '2024-08-15',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      pickup_zone: 'Durgapur',
      drop_zone: 'Kolkata'
    }
  },
  // Zone-Based Roundtrip Tests
  {
    name: 'Within Kolkata Zone Roundtrip - Sedan',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'sedan',
      km_limit: 10,
      journey_date: '2024-08-10',
      return_date: '2024-08-11',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City'
    }
  },
  {
    name: 'Within Durgapur Zone Roundtrip - SUV',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Durgapur Steel Plant',
      drop_location: 'IIT Durgapur',
      pickup_lat: 23.5204,
      pickup_lng: 87.3119,
      drop_lat: 23.5204,
      drop_lng: 87.4119,
      car_type: 'suv',
      km_limit: 15,
      journey_date: '2024-08-10',
      return_date: '2024-08-13',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Durgapur',
      drop_zone: 'Durgapur'
    }
  },
  // Standard Roundtrip Tests
  {
    name: 'Outside Zones Roundtrip - Sedan',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Unknown Location 1',
      drop_location: 'Unknown Location 2',
      pickup_lat: 20.0000,
      pickup_lng: 85.0000,
      drop_lat: 20.0100,
      drop_lng: 85.0100,
      car_type: 'sedan',
      km_limit: 10,
      journey_date: '2024-08-10',
      return_date: '2024-08-12',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'standard',
      pickup_zone: null,
      drop_zone: null
    }
  },
  // Night Time Roundtrip Tests
  {
    name: 'Night Time Roundtrip - Kolkata to Digha',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      return_date: '2024-08-12',
      pick_up_time: '23:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      pickup_zone: 'Kolkata',
      drop_zone: 'Digha',
      night_charge: true
    }
  },
  {
    name: 'Night Time Roundtrip - Zone Based',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'suv',
      km_limit: 10,
      journey_date: '2024-08-10',
      return_date: '2024-08-11',
      pick_up_time: '02:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City',
      night_charge: true
    }
  },
  // Festive Period Roundtrip Tests
  {
    name: 'Festive Period Roundtrip - Durga Puja',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-10-12',
      return_date: '2024-10-15',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      pickup_zone: 'Kolkata',
      drop_zone: 'Digha',
      festive_charge: true
    }
  },
  {
    name: 'Festive Period Roundtrip - Diwali',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Durgapur',
      drop_location: 'Kolkata',
      pickup_lat: 23.5204,
      pickup_lng: 87.3119,
      drop_lat: 22.5726,
      drop_lng: 88.3639,
      car_type: 'suv',
      km_limit: 180,
      journey_date: '2024-11-10',
      return_date: '2024-11-12',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      pickup_zone: 'Durgapur',
      drop_zone: 'Kolkata',
      festive_charge: true
    }
  },
  // Long Distance Roundtrip Tests
  {
    name: 'Long Distance Roundtrip - Kolkata to Tarapith',
    payload: {
      service_type: 'roundtrip',
      pick_up_location: 'Kolkata',
      drop_location: 'Tarapith',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 24.1047,
      drop_lng: 87.8519,
      car_type: 'suv',
      km_limit: 250,
      journey_date: '2024-08-10',
      return_date: '2024-08-20',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      pickup_zone: 'Kolkata',
      drop_zone: 'Tarapith'
    }
  }
];

async function runRoundtripTests() {
  console.log('🧪 TEST SUITE 4: Roundtrip Service Tests\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of roundtripTests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      
      const response = await axios.post(`${BASE_URL}/api/fare/estimate`, test.payload);
      
      const result = response.data.data.selected_car;
      const serviceDetails = response.data.data.service_details;
      const isSuccess = response.data.success;
      
      // Validate response structure
      if (!isSuccess) {
        throw new Error('API returned success: false');
      }
      
      // Validate pricing type
      if (result.pricing_type !== test.expected.pricing_type) {
        throw new Error(`Expected pricing_type: ${test.expected.pricing_type}, Got: ${result.pricing_type}`);
      }
      
      // Validate zones
      if (result.zone_info.pickup_zone !== test.expected.pickup_zone) {
        throw new Error(`Expected pickup_zone: ${test.expected.pickup_zone}, Got: ${result.zone_info.pickup_zone}`);
      }
      
      if (result.zone_info.drop_zone !== test.expected.drop_zone) {
        throw new Error(`Expected drop_zone: ${test.expected.drop_zone}, Got: ${result.zone_info.drop_zone}`);
      }
      
      // Validate night charge if expected
      if (test.expected.night_charge && !serviceDetails.night_charge_applied) {
        throw new Error('Expected night charge to be applied');
      }
      
      // Validate festive charge if expected
      if (test.expected.festive_charge && !serviceDetails.festive_charge_applied) {
        throw new Error('Expected festive charge to be applied');
      }
      
      // Validate fare calculation (roundtrip should be higher than oneway)
      if (result.estimated_fare < 100 || result.estimated_fare > 50000) {
        throw new Error(`Fare seems unreasonable: ₹${result.estimated_fare}`);
      }
      
      console.log(`   ✅ PASS - Fare: ₹${result.estimated_fare}, Type: ${result.pricing_type}`);
      console.log(`      Zones: ${result.zone_info.pickup_zone} → ${result.zone_info.drop_zone}`);
      console.log(`      Night Charge: ${serviceDetails.night_charge_applied}, Festive Charge: ${serviceDetails.festive_charge_applied}`);
      passed++;
      
    } catch (error) {
      console.log(`   ❌ FAIL - ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`🎯 SUCCESS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return { passed, failed };
}

module.exports = { runRoundtripTests, roundtripTests }; 