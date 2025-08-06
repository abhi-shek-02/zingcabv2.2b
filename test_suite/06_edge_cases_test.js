const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test Suite 6: Edge Cases and Error Scenarios
const edgeCaseTests = [
  // Missing Required Fields Tests
  {
    name: 'Missing Service Type',
    payload: {
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Missing Car Type',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Missing Drop Location for Oneway',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Missing Return Date for Roundtrip',
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
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Missing Rental Type for Rental',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  // Invalid Data Types Tests
  {
    name: 'Invalid Car Type',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'invalid_car',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Invalid Service Type',
    payload: {
      service_type: 'invalid_service',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Invalid Coordinates - String Values',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 'invalid',
      pickup_lng: 'invalid',
      drop_lat: 'invalid',
      drop_lng: 'invalid',
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  // Boundary Value Tests
  {
    name: 'Zero Distance',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Kolkata',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5726,
      drop_lng: 88.3639,
      car_type: 'sedan',
      km_limit: 0,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: false,
      pricing_type: 'zone_based'
    }
  },
  {
    name: 'Very Large Distance',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Very Far Location',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 35.0000,
      drop_lng: 100.0000,
      car_type: 'suv',
      km_limit: 5000,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: false,
      pricing_type: 'standard'
    }
  },
  // Invalid Date/Time Tests
  {
    name: 'Invalid Date Format',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: 'invalid-date',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Invalid Time Format',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '25:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  // Invalid Phone Number Tests
  {
    name: 'Invalid Phone Number - Too Short',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '123',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Invalid Phone Number - Non-Numeric',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: 'abc123def',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  // Empty String Tests
  {
    name: 'Empty Pickup Location',
    payload: {
      service_type: 'oneway',
      pick_up_location: '',
      drop_location: 'Digha',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  },
  {
    name: 'Empty Drop Location',
    payload: {
      service_type: 'oneway',
      pick_up_location: 'Kolkata',
      drop_location: '',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      km_limit: 180,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website'
    },
    expected: {
      shouldFail: true,
      errorType: 'validation'
    }
  }
];

async function runEdgeCaseTests() {
  console.log('🧪 TEST SUITE 6: Edge Cases and Error Scenarios\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of edgeCaseTests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      
      const response = await axios.post(`${BASE_URL}/api/fare/estimate`, test.payload);
      
      // If test expects to fail
      if (test.expected.shouldFail) {
        if (response.data.success) {
          throw new Error('Expected test to fail but it succeeded');
        }
        console.log(`   ✅ PASS - Correctly failed with error: ${response.data.message || 'Validation error'}`);
        passed++;
      } else {
        // If test expects to succeed
        const result = response.data.data.selected_car;
        const isSuccess = response.data.success;
        
        if (!isSuccess) {
          throw new Error(`Expected success but got error: ${response.data.message}`);
        }
        
        // Validate pricing type if specified
        if (test.expected.pricing_type && result.pricing_type !== test.expected.pricing_type) {
          throw new Error(`Expected pricing_type: ${test.expected.pricing_type}, Got: ${result.pricing_type}`);
        }
        
        console.log(`   ✅ PASS - Successfully processed with fare: ₹${result.estimated_fare}`);
        passed++;
      }
      
    } catch (error) {
      if (test.expected.shouldFail && error.response?.status === 400) {
        console.log(`   ✅ PASS - Correctly failed with validation error`);
        passed++;
      } else {
        console.log(`   ❌ FAIL - ${error.message}`);
        failed++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`🎯 SUCCESS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return { passed, failed };
}

module.exports = { runEdgeCaseTests, edgeCaseTests }; 