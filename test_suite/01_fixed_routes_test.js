const axios = require('axios');
// Add delay function to prevent rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}// Add delay function to prevent rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const BASE_URL = 'http://localhost:3002';

// Test Suite 1: Fixed Route Pricing Tests
const fixedRouteTests = [
  // Kolkata to Digha Route Tests
  {
    name: 'Kolkata to Digha - Sedan',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.8000,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 3899,
      pickup_zone: 'Kolkata',
      drop_zone: 'Digha'
    }
  },
  {
    name: 'Kolkata to Digha - SUV',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.8000,
      car_type: 'suv',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 4499,
      pickup_zone: 'Kolkata',
      drop_zone: 'Digha'
    }
  },
  {
    name: 'Digha to Kolkata - Sedan (Bidirectional)',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Digha',
      drop_location: 'Kolkata',
      pickup_lat: 21.6291,
      pickup_lng: 87.8000,
      drop_lat: 22.5726,
      drop_lng: 88.3639,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 3899,
      pickup_zone: 'Digha',
      drop_zone: 'Kolkata'
    }
  },
  // Kolkata to Durgapur Route Tests
  {
    name: 'Kolkata to Durgapur - Sedan',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Durgapur',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 23.5204,
      drop_lng: 87.3119,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 3399,
      pickup_zone: 'Kolkata',
      drop_zone: 'Durgapur'
    }
  },
  {
    name: 'Durgapur to Kolkata - SUV (Bidirectional)',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Durgapur',
      drop_location: 'Kolkata',
      pickup_lat: 23.5204,
      pickup_lng: 87.3119,
      drop_lat: 22.5726,
      drop_lng: 88.3639,
      car_type: 'suv',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 4499,
      pickup_zone: 'Durgapur',
      drop_zone: 'Kolkata'
    }
  },
  // Kolkata to Kolaghat Route Tests (Lowest Price)
  {
    name: 'Kolkata to Kolaghat - Sedan (Lowest Price)',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Kolaghat',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.4330,
      drop_lng: 87.8696,
      car_type: 'sedan',
      km_limit: 80,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 1999,
      pickup_zone: 'Kolkata',
      drop_zone: 'Kolaghat'
    }
  },
  // Kolkata to Tarapith Route Tests (Highest Price)
  {
    name: 'Kolkata to Tarapith - SUV (Highest Price)',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Tarapith',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 24.1047,
      drop_lng: 87.8519,
      car_type: 'suv',
      km_limit: 250,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 5699,
      pickup_zone: 'Kolkata',
      drop_zone: 'Tarapith'
    }
  },
  // Kolkata to Kharagpur Route Tests
  {
    name: 'Kolkata to Kharagpur - Sedan',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Kharagpur',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.3460,
      drop_lng: 87.2320,
      car_type: 'sedan',
      km_limit: 120,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 2399,
      pickup_zone: 'Kolkata',
      drop_zone: 'Kharagpur'
    }
  },
  // Kolkata to Asansol Route Tests
  {
    name: 'Kolkata to Asansol - SUV',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Asansol',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 23.6889,
      drop_lng: 86.9661,
      car_type: 'suv',
      km_limit: 200,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 4899,
      pickup_zone: 'Kolkata',
      drop_zone: 'Asansol'
    }
  },
  // Kolkata to Haldia Route Tests
  {
    name: 'Kolkata to Haldia - Sedan',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Haldia',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.0257,
      drop_lng: 88.0583,
      car_type: 'sedan',
      km_limit: 100,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      pricing_type: 'fixed_route',
      estimated_fare: 2999,
      pickup_zone: 'Kolkata',
      drop_zone: 'Haldia'
    }
  }
];

async function runFixedRouteTests() {
  console.log('🧪 TEST SUITE 1: Fixed Route Pricing Tests\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of fixedRouteTests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      
      const response = await axios.post(`${BASE_URL}/api/fare/estimate`, test.payload);
      await delay(100); // Add 100ms delay between API calls      await delay(100); // Add 100ms delay between API calls      
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
      
      // Validate estimated fare
      if (result.estimated_fare !== test.expected.estimated_fare) {
        throw new Error(`Expected estimated_fare: ${test.expected.estimated_fare}, Got: ${result.estimated_fare}`);
      }
      
      // Validate zones
      if (result.zone_info.pickup_zone !== test.expected.pickup_zone) {
        throw new Error(`Expected pickup_zone: ${test.expected.pickup_zone}, Got: ${result.zone_info.pickup_zone}`);
      }
      
      if (result.zone_info.drop_zone !== test.expected.drop_zone) {
        throw new Error(`Expected drop_zone: ${test.expected.drop_zone}, Got: ${result.zone_info.drop_zone}`);
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

module.exports = { runFixedRouteTests, fixedRouteTests }; 