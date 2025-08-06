const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test Suite 3: Standard Pricing Tests (Outside Zones)
const standardPricingTests = [
  // Outside All Zones Tests
  {
    name: 'Outside All Zones - Short Distance',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Unknown Location 1',
      drop_location: 'Unknown Location 2',
      pickup_lat: 20.0000,
      pickup_lng: 85.0000,
      drop_lat: 20.0100,
      drop_lng: 85.0100,
      car_type: 'sedan',
      km_limit: 10,
      journey_date: '2024-08-10',
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
  {
    name: 'Outside All Zones - Medium Distance',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Remote Location 1',
      drop_location: 'Remote Location 2',
      pickup_lat: 19.0000,
      pickup_lng: 84.0000,
      drop_lat: 19.0500,
      drop_lng: 84.0500,
      car_type: 'suv',
      km_limit: 50,
      journey_date: '2024-08-10',
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
  {
    name: 'Outside All Zones - Long Distance',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Far Location 1',
      drop_location: 'Far Location 2',
      pickup_lat: 18.0000,
      pickup_lng: 83.0000,
      drop_lat: 18.1000,
      drop_lng: 83.1000,
      car_type: 'sedan',
      km_limit: 150,
      journey_date: '2024-08-10',
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
  // Edge Cases - Very Far Locations
  {
    name: 'Very Far Location - Mumbai Coordinates',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Mumbai',
      drop_location: 'Pune',
      pickup_lat: 19.0760,
      pickup_lng: 72.8777,
      drop_lat: 18.5204,
      drop_lng: 73.8567,
      car_type: 'suv',
      km_limit: 150,
      journey_date: '2024-08-10',
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
  {
    name: 'Very Far Location - Delhi Coordinates',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Delhi',
      drop_location: 'Gurgaon',
      pickup_lat: 28.7041,
      pickup_lng: 77.1025,
      drop_lat: 28.4595,
      drop_lng: 77.0266,
      car_type: 'sedan',
      km_limit: 30,
      journey_date: '2024-08-10',
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
  // Edge Cases - International Coordinates
  {
    name: 'International Location - Bangladesh',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Dhaka',
      drop_location: 'Chittagong',
      pickup_lat: 23.8103,
      pickup_lng: 90.4125,
      drop_lat: 22.3419,
      drop_lng: 91.8132,
      car_type: 'sedan',
      km_limit: 300,
      journey_date: '2024-08-10',
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
  // Edge Cases - Ocean Coordinates
  {
    name: 'Ocean Coordinates - Bay of Bengal',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Ocean Point 1',
      drop_location: 'Ocean Point 2',
      pickup_lat: 15.0000,
      pickup_lng: 90.0000,
      drop_lat: 15.0100,
      drop_lng: 90.0100,
      car_type: 'suv',
      km_limit: 100,
      journey_date: '2024-08-10',
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
  // Edge Cases - Invalid Coordinates
  {
    name: 'Invalid Coordinates - Zero Values',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Invalid Location 1',
      drop_location: 'Invalid Location 2',
      pickup_lat: 0,
      pickup_lng: 0,
      drop_lat: 0,
      drop_lng: 0,
      car_type: 'sedan',
      km_limit: 10,
      journey_date: '2024-08-10',
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
  // Edge Cases - Extreme Coordinates
  {
    name: 'Extreme Coordinates - North Pole',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'North Pole',
      drop_location: 'Arctic Point',
      pickup_lat: 90.0000,
      pickup_lng: 0.0000,
      drop_lat: 89.9000,
      drop_lng: 0.1000,
      car_type: 'suv',
      km_limit: 50,
      journey_date: '2024-08-10',
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
  // Edge Cases - Negative Coordinates
  {
    name: 'Negative Coordinates - South America',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Brazil Point 1',
      drop_location: 'Brazil Point 2',
      pickup_lat: -23.5505,
      pickup_lng: -46.6333,
      drop_lat: -23.5505,
      drop_lng: -46.6333,
      car_type: 'sedan',
      km_limit: 20,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'standard',
      pickup_zone: null,
      drop_zone: null
    }
  }
];

async function runStandardPricingTests() {
  console.log('🧪 TEST SUITE 3: Standard Pricing Tests (Outside Zones)\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of standardPricingTests) {
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
      
      // Validate zones (should be null for outside zones)
      if (result.zone_info.pickup_zone !== test.expected.pickup_zone) {
        throw new Error(`Expected pickup_zone: ${test.expected.pickup_zone}, Got: ${result.zone_info.pickup_zone}`);
      }
      
      if (result.zone_info.drop_zone !== test.expected.drop_zone) {
        throw new Error(`Expected drop_zone: ${test.expected.drop_zone}, Got: ${result.zone_info.drop_zone}`);
      }
      
      // Validate fare calculation (should be reasonable for standard pricing)
      if (result.estimated_fare < 100 || result.estimated_fare > 50000) {
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

module.exports = { runStandardPricingTests, standardPricingTests }; 