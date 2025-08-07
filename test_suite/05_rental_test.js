const axios = require('axios');
// Add delay function to prevent rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const BASE_URL = 'http://localhost:3002';

// Test Suite 5: Rental Service Tests
const rentalTests = [
  // Zone-Based Rental Tests
  {
    name: 'Within Kolkata Zone Rental - Sedan (40km)',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'sedan',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '8_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City',
      rental_package: 599
    }
  },
  {
    name: 'Within Kolkata Zone Rental - SUV (40km)',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata Airport',
      drop_location: 'New Town',
      pickup_lat: 22.6547,
      pickup_lng: 88.4467,
      drop_lat: 22.5958,
      drop_lng: 88.4795,
      car_type: 'suv',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '8_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Dum Dum (Airport)',
      drop_zone: 'New Town',
      rental_package: 799
    }
  },
  // Rental with Extra KM Tests
  {
    name: 'Rental with Extra KM - Sedan (60km)',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'sedan',
      km_limit: 60,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '8_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City',
      rental_package: 599,
      extra_km: 20
    }
  },
  {
    name: 'Rental with Extra KM - SUV (80km)',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Durgapur Steel Plant',
      drop_location: 'IIT Durgapur',
      pickup_lat: 23.5204,
      pickup_lng: 87.3119,
      drop_lat: 23.5204,
      drop_lng: 87.4119,
      car_type: 'suv',
      km_limit: 80,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '8_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Durgapur',
      drop_zone: 'Durgapur',
      rental_package: 799,
      extra_km: 40
    }
  },
  // Different Rental Durations
  {
    name: 'Rental 4 Hours - Sedan',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'sedan',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '4_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City'
    }
  },
  {
    name: 'Rental 12 Hours - SUV',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Durgapur Steel Plant',
      drop_location: 'IIT Durgapur',
      pickup_lat: 23.5204,
      pickup_lng: 87.3119,
      drop_lat: 23.5204,
      drop_lng: 87.4119,
      car_type: 'suv',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '12_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Durgapur',
      drop_zone: 'Durgapur'
    }
  },
  {
    name: 'Rental 24 Hours - Sedan',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'sedan',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '24_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City'
    }
  },
  // Standard Rental Tests (Outside Zones)
  {
    name: 'Outside Zones Rental - Sedan',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Unknown Location 1',
      drop_location: 'Unknown Location 2',
      pickup_lat: 20.0000,
      pickup_lng: 85.0000,
      drop_lat: 20.0100,
      drop_lng: 85.0100,
      car_type: 'sedan',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '8_hours'
    },
    expected: {
      pricing_type: 'standard',
      pickup_zone: null,
      drop_zone: null
    }
  },
  // Night Time Rental Tests
  {
    name: 'Night Time Rental - Kolkata Zone',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'sedan',
      km_limit: 40,
      journey_date: '2024-08-10',
      pick_up_time: '23:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '8_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City',
      night_charge: true
    }
  },
  // Festive Period Rental Tests
  {
    name: 'Festive Period Rental - Durga Puja',
    payload: {
      service_type: 'rental',
      pick_up_location: 'Kolkata City Center',
      drop_location: 'Salt Lake City',
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 22.5802,
      drop_lng: 88.4376,
      car_type: 'suv',
      km_limit: 40,
      journey_date: '2024-10-12',
      pick_up_time: '10:00',
      mobile_number: '9876543210',
      booking_source: 'website',
      rental_booking_type: '8_hours'
    },
    expected: {
      pricing_type: 'zone_based',
      pickup_zone: 'Kolkata',
      drop_zone: 'Salt Lake City',
      festive_charge: true
    }
  }
];

async function runRentalTests() {
  console.log('🧪 TEST SUITE 5: Rental Service Tests\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of rentalTests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      
      const response = await axios.post(`${BASE_URL}/api/fare/estimate`, test.payload);
      await delay(100); // Add 100ms delay between API calls      
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
      
      // Validate rental package if specified
      if (test.expected.rental_package) {
        const breakdown = result.breakdown;
        if (!breakdown || breakdown.base_fare < test.expected.rental_package) {
          throw new Error(`Expected rental package minimum: ₹${test.expected.rental_package}, Got base fare: ₹${breakdown?.base_fare || 'N/A'}`);
        }
      }
      
      // Validate night charge if expected
      if (test.expected.night_charge && !serviceDetails.night_charge_applied) {
        throw new Error('Expected night charge to be applied');
      }
      
      // Validate festive charge if expected
      if (test.expected.festive_charge && !serviceDetails.festive_charge_applied) {
        throw new Error('Expected festive charge to be applied');
      }
      
      // Validate fare calculation (rental should be reasonable)
      if (result.estimated_fare < 100 || result.estimated_fare > 20000) {
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

module.exports = { runRentalTests, rentalTests }; 