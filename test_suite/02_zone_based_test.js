const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test Suite 2: Zone-Based Pricing Tests
const zoneBasedTests = [
  // Within Kolkata Zone Tests
  {
    name: 'Within Kolkata Zone - Short Distance',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'sedan',
      km_limit: 10,
      journey_date: '2024-08-10',
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
    name: 'Within Kolkata Zone - Medium Distance',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata Airport',
      drop_location: 'New Town',
      pickup_lat: 22.6547,
      pickup_lng: 88.4467,
      drop_lat: 22.5958,
      drop_lng: 88.4795,
      car_type: 'suv',
      km_limit: 25,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Dum Dum (Airport)',
      drop_zone: 'New Town'
    }
  },
  // Within Durgapur Zone Tests
  {
    name: 'Within Durgapur Zone - Local Trip',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Durgapur Steel Plant',
      drop_location: 'IIT Durgapur',
      pickup_lat: 23.5204,
      pickup_lng: 87.3119,
      drop_lat: 23.5204,
      drop_lng: 87.4119,
      car_type: 'sedan',
      km_limit: 15,
      journey_date: '2024-08-10',
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
  // Within Kharagpur Zone Tests
  {
    name: 'Within Kharagpur Zone - IIT Campus',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kharagpur Station',
      drop_location: 'IIT Kharagpur',
      pickup_lat: 22.3460,
      pickup_lng: 87.2320,
      drop_lat: 22.3149,
      drop_lng: 87.3105,
      car_type: 'sedan',
      km_limit: 8,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kharagpur',
      drop_zone: 'Kharagpur IIT'
    }
  },
  // Within Siliguri Zone Tests
  {
    name: 'Within Siliguri Zone - City Trip',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Siliguri Junction',
      drop_location: 'Siliguri Market',
      pickup_lat: 26.7271,
      pickup_lng: 88.3953,
      drop_lat: 26.7271,
      drop_lng: 88.3953,
      car_type: 'suv',
      km_limit: 12,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Siliguri',
      drop_zone: 'Siliguri'
    }
  },
  // Within Malda Zone Tests
  {
    name: 'Within Malda Zone - Local Trip',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Malda Station',
      drop_location: 'Malda City',
      pickup_lat: 25.0108,
      pickup_lng: 88.1411,
      drop_lat: 25.0108,
      drop_lng: 88.1411,
      car_type: 'sedan',
      km_limit: 10,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Malda',
      drop_zone: 'Malda'
    }
  },
  // Within Bardhaman Zone Tests
  {
    name: 'Within Bardhaman Zone - City Trip',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Bardhaman Station',
      drop_location: 'Bardhaman University',
      pickup_lat: 23.2324,
      pickup_lng: 87.8615,
      drop_lat: 23.2324,
      drop_lng: 87.8615,
      car_type: 'suv',
      km_limit: 18,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Bardhaman',
      drop_zone: 'Bardhaman'
    }
  },
  // Within Asansol Zone Tests
  {
    name: 'Within Asansol Zone - Industrial Trip',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Asansol Station',
      drop_location: 'Asansol Steel Plant',
      pickup_lat: 23.6889,
      pickup_lng: 86.9661,
      drop_lat: 23.6889,
      drop_lng: 86.9661,
      car_type: 'sedan',
      km_limit: 15,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Asansol',
      drop_zone: 'Asansol'
    }
  },
  // Within Haldia Zone Tests
  {
    name: 'Within Haldia Zone - Port Trip',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Haldia Port',
      drop_location: 'Haldia City',
      pickup_lat: 22.0257,
      pickup_lng: 88.0583,
      drop_lat: 22.0257,
      drop_lng: 88.0583,
      car_type: 'suv',
      km_limit: 12,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Haldia',
      drop_zone: 'Haldia'
    }
  },
  // Within Shantiniketan Zone Tests
  {
    name: 'Within Shantiniketan Zone - University Trip',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Shantiniketan University',
      drop_location: 'Bolpur Station',
      pickup_lat: 23.8711,
      pickup_lng: 87.7200,
      drop_lat: 23.6662,
      drop_lng: 87.7145,
      car_type: 'sedan',
      km_limit: 20,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Shantiniketan',
      drop_zone: 'Bolpur'
    }
  }
];

async function runZoneBasedTests() {
  console.log('🧪 TEST SUITE 2: Zone-Based Pricing Tests\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of zoneBasedTests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      
      const response = await axios.post(`${BASE_URL}/api/fare/estimate`, test.payload);
      
      const result = response.data.data.selected_car;
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
      
      // Validate fare calculation (should be reasonable for zone-based)
      if (result.estimated_fare < 100 || result.estimated_fare > 10000) {
        throw new Error(`Fare seems unreasonable: ₹${result.estimated_fare}`);
      }
      
      console.log(`   ✅ PASS - Fare: ₹${result.estimated_fare}, Type: ${result.pricing_type}`);
      console.log(`      Zones: ${result.zone_info.pickup_zone} → ${result.zone_info.drop_zone}`);
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

module.exports = { runZoneBasedTests, zoneBasedTests }; 