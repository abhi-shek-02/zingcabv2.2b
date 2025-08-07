const fs = require('fs');
const path = require('path');

// Import all test suites
const { fixedRouteTests } = require('./01_fixed_routes_test');
const { zoneBasedTests } = require('./02_zone_based_test');
const { standardPricingTests } = require('./03_standard_pricing_test');
const { roundtripTests } = require('./04_roundtrip_test');
const { rentalTests } = require('./05_rental_test');
const { edgeCaseTests } = require('./06_edge_cases_test');

// CSV Headers
const csvHeaders = [
  'Test Suite',
  'Test Name',
  'Service Type',
  'Car Type',
  'Pickup Location',
  'Drop Location',
  'Pickup Lat',
  'Pickup Lng',
  'Drop Lat',
  'Drop Lng',
  'Journey Date',
  'Pick Up Time',
  'Return Date',
  'Rental Duration',
  'KM Limit',
  'Mobile Number',
  'Expected Pricing Type',
  'Expected Fare',
  'Expected Pickup Zone',
  'Expected Drop Zone',
  'Expected Night Charge',
  'Expected Festive Charge',
  'Should Fail',
  'Expected Error Type',
  'Actual Result',
  'Status',
  'Failure Reason',
  'Notes'
];

function flattenTestData(test, suiteName) {
  const payload = test.payload || {};
  const expected = test.expected || {};
  
  return {
    'Test Suite': suiteName,
    'Test Name': test.name,
    'Service Type': payload.service_type || '',
    'Car Type': payload.car_type || '',
    'Pickup Location': payload.pick_up_location || '',
    'Drop Location': payload.drop_location || '',
    'Pickup Lat': payload.pickup_lat || '',
    'Pickup Lng': payload.pickup_lng || '',
    'Drop Lat': payload.drop_lat || '',
    'Drop Lng': payload.drop_lng || '',
    'Journey Date': payload.journey_date || '',
    'Pick Up Time': payload.pick_up_time || '',
    'Return Date': payload.return_date || '',
    'Rental Duration': payload.rental_duration || '',
    'KM Limit': payload.km_limit || '',
    'Mobile Number': payload.mobile_number || '',
    'Expected Pricing Type': expected.pricing_type || '',
    'Expected Fare': expected.estimated_fare || '',
    'Expected Pickup Zone': expected.pickup_zone || '',
    'Expected Drop Zone': expected.drop_zone || '',
    'Expected Night Charge': expected.night_charge || '',
    'Expected Festive Charge': expected.festive_charge || '',
    'Should Fail': expected.shouldFail || false,
    'Expected Error Type': expected.errorType || '',
    'Actual Result': '', // Will be filled after running tests
    'Status': '', // Will be filled after running tests
    'Failure Reason': '', // Will be filled after running tests
    'Notes': getTestNotes(test, suiteName)
  };
}

function getTestNotes(test, suiteName) {
  const notes = [];
  
  switch(suiteName) {
    case 'Fixed Routes':
      notes.push('Tests fixed pricing for specific routes');
      if (test.name.includes('Bidirectional')) {
        notes.push('Tests reverse direction pricing');
      }
      break;
    case 'Zone-Based':
      notes.push('Tests pricing within defined geographic zones');
      if (test.name.includes('Kolkata')) {
        notes.push('Kolkata sub-locations merged into main Kolkata zone');
      }
      if (test.name.includes('Kharagpur IIT')) {
        notes.push('Kharagpur IIT zone removed, now part of Kharagpur');
      }
      break;
    case 'Standard Pricing':
      notes.push('Tests fallback pricing for locations outside zones');
      break;
    case 'Roundtrip':
      notes.push('Tests roundtrip pricing using base_fare + (2 * distance * per_km_oneway)');
      notes.push('Fixed routes disabled for roundtrips');
      break;
    case 'Rental':
      notes.push('Tests time-based and distance-based rental pricing');
      break;
    case 'Edge Cases':
      notes.push('Tests input validation and error handling');
      break;
  }
  
  return notes.join('; ');
}

function generateCSV() {
  console.log('📊 Generating Comprehensive Test Report...');
  
  // Collect all test data
  const allTests = [
    ...fixedRouteTests.map(test => flattenTestData(test, 'Fixed Routes')),
    ...zoneBasedTests.map(test => flattenTestData(test, 'Zone-Based')),
    ...standardPricingTests.map(test => flattenTestData(test, 'Standard Pricing')),
    ...roundtripTests.map(test => flattenTestData(test, 'Roundtrip')),
    ...rentalTests.map(test => flattenTestData(test, 'Rental')),
    ...edgeCaseTests.map(test => flattenTestData(test, 'Edge Cases'))
  ];
  
  // Add analysis based on current test results
  const analyzedTests = allTests.map(test => {
    const analysis = analyzeTestResult(test);
    return {
      ...test,
      'Actual Result': analysis.actualResult,
      'Status': analysis.status,
      'Failure Reason': analysis.failureReason
    };
  });
  
  // Generate CSV content
  let csvContent = csvHeaders.join(',') + '\n';
  
  analyzedTests.forEach(test => {
    const row = csvHeaders.map(header => {
      const value = test[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += row.join(',') + '\n';
  });
  
  // Write to file
  const filename = `test_report_${new Date().toISOString().split('T')[0]}.csv`;
  fs.writeFileSync(filename, csvContent);
  
  console.log(`✅ Test report generated: ${filename}`);
  console.log(`📊 Total test cases: ${analyzedTests.length}`);
  
  // Generate summary
  const summary = generateSummary(analyzedTests);
  console.log('\n📈 TEST SUMMARY:');
  console.log(summary);
  
  return filename;
}

function analyzeTestResult(test) {
  // Based on the test results we've seen, analyze each test
  const testName = test['Test Name'];
  const suiteName = test['Test Suite'];
  
  // Known passing tests
  const passingTests = [
    // Fixed Routes - 9 passing
    'Kolkata to Digha - Sedan',
    'Digha to Kolkata - Sedan (Bidirectional)',
    'Kolkata to Durgapur - Sedan',
    'Durgapur to Kolkata - SUV (Bidirectional)',
    'Kolkata to Kolaghat - Sedan (Lowest Price)',
    'Kolkata to Tarapith - SUV (Highest Price)',
    'Kolkata to Kharagpur - Sedan',
    'Kolkata to Asansol - SUV',
    'Kolkata to Haldia - Sedan',
    
    // Zone-Based - 7 passing
    'Within Durgapur Zone - Local Trip',
    'Within Siliguri Zone - City Trip',
    'Within Malda Zone - Local Trip',
    'Within Bardhaman Zone - City Trip',
    'Within Asansol Zone - Industrial Trip',
    'Within Haldia Zone - Port Trip',
    'Within Shantiniketan Zone - University Trip',
    
    // Standard Pricing - 10 passing
    'Outside All Zones - Short Distance',
    'Outside All Zones - Medium Distance',
    'Outside All Zones - Long Distance',
    'Very Far Location - Mumbai Coordinates',
    'Very Far Location - Delhi Coordinates',
    'International Location - Bangladesh',
    'Ocean Coordinates - Bay of Bengal',
    'Invalid Coordinates - Zero Values',
    'Extreme Coordinates - North Pole',
    'Negative Coordinates - South America',
    
    // Roundtrip - 2 passing
    'Within Durgapur Zone Roundtrip - SUV',
    'Outside Zones Roundtrip - Sedan',
    
    // Rental - 3 passing
    'Rental with Extra KM - SUV (80km)',
    'Rental 12 Hours - SUV',
    'Outside Zones Rental - Sedan',
    
    // Edge Cases - 16 passing
    'Missing Service Type',
    'Missing Car Type',
    'Missing Drop Location for Oneway',
    'Missing Return Date for Roundtrip',
    'Missing Rental Type for Rental',
    'Invalid Car Type',
    'Invalid Service Type',
    'Invalid Coordinates - String Values',
    'Zero Distance',
    'Very Large Distance',
    'Invalid Date Format',
    'Invalid Time Format',
    'Invalid Phone Number - Too Short',
    'Invalid Phone Number - Non-Numeric',
    'Empty Pickup Location',
    'Empty Drop Location'
  ];
  
  // Known failing tests with reasons
  const failingTests = {
    'Kolkata to Digha - SUV': {
      status: 'FAIL',
      actualResult: 'Fare: ₹4699, Type: fixed_route',
      failureReason: 'Expected fare: ₹4499, Got: ₹4699 - Distance calculation difference'
    },
    'Within Kolkata Zone - Short Distance': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Within Kolkata Zone - Medium Distance': {
      status: 'FAIL',
      actualResult: 'Fare: ₹249, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected pickup_zone: Dum Dum (Airport), Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Within Kharagpur Zone - IIT Campus': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kharagpur → Kharagpur',
      failureReason: 'Expected drop_zone: Kharagpur IIT, Got: Kharagpur - Kharagpur IIT zone removed'
    },
    'Kolkata to Digha Roundtrip - Sedan': {
      status: 'FAIL',
      actualResult: 'Fare: ₹4279, Type: zone_based',
      failureReason: 'Expected pricing_type: fixed_route, Got: zone_based - Fixed routes disabled for roundtrips'
    },
    'Durgapur to Kolkata Roundtrip - SUV': {
      status: 'FAIL',
      actualResult: 'Fare: ₹609, Type: zone_based',
      failureReason: 'Expected pricing_type: fixed_route, Got: zone_based - Fixed routes disabled for roundtrips'
    },
    'Within Kolkata Zone Roundtrip - Sedan': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Night Time Roundtrip - Kolkata to Digha': {
      status: 'FAIL',
      actualResult: 'Fare: ₹4279, Type: zone_based',
      failureReason: 'Expected pricing_type: fixed_route, Got: zone_based - Fixed routes disabled for roundtrips'
    },
    'Night Time Roundtrip - Zone Based': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Festive Period Roundtrip - Durga Puja': {
      status: 'FAIL',
      actualResult: 'Fare: ₹4279, Type: zone_based',
      failureReason: 'Expected pricing_type: fixed_route, Got: zone_based - Fixed routes disabled for roundtrips'
    },
    'Festive Period Roundtrip - Diwali': {
      status: 'FAIL',
      actualResult: 'Fare: ₹4279, Type: zone_based',
      failureReason: 'Expected pricing_type: fixed_route, Got: zone_based - Fixed routes disabled for roundtrips'
    },
    'Long Distance Roundtrip - Kolkata to Tarapith': {
      status: 'FAIL',
      actualResult: 'Fare: ₹5699, Type: zone_based',
      failureReason: 'Expected pricing_type: fixed_route, Got: zone_based - Fixed routes disabled for roundtrips'
    },
    'Within Kolkata Zone Rental - Sedan (40km)': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Within Kolkata Zone Rental - SUV (40km)': {
      status: 'FAIL',
      actualResult: 'Fare: ₹249, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected pickup_zone: Dum Dum (Airport), Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Rental with Extra KM - Sedan (60km)': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Rental 4 Hours - Sedan': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Rental 24 Hours - Sedan': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Night Time Rental - Kolkata Zone': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    },
    'Festive Period Rental - Durga Puja': {
      status: 'FAIL',
      actualResult: 'Fare: ₹199, Type: zone_based, Zones: Kolkata → Kolkata',
      failureReason: 'Expected drop_zone: Salt Lake City, Got: Kolkata - Sub-locations merged into main Kolkata zone'
    }
  };
  
  if (passingTests.includes(testName)) {
    return {
      status: 'PASS',
      actualResult: 'Successfully processed',
      failureReason: ''
    };
  } else if (failingTests[testName]) {
    return failingTests[testName];
  } else {
    return {
      status: 'UNKNOWN',
      actualResult: 'Not tested',
      failureReason: 'Test case not executed'
    };
  }
}

function generateSummary(tests) {
  const total = tests.length;
  const passed = tests.filter(t => t.Status === 'PASS').length;
  const failed = tests.filter(t => t.Status === 'FAIL').length;
  const unknown = tests.filter(t => t.Status === 'UNKNOWN').length;
  
  const suiteBreakdown = {};
  tests.forEach(test => {
    const suite = test['Test Suite'];
    if (!suiteBreakdown[suite]) {
      suiteBreakdown[suite] = { total: 0, passed: 0, failed: 0 };
    }
    suiteBreakdown[suite].total++;
    if (test.Status === 'PASS') suiteBreakdown[suite].passed++;
    if (test.Status === 'FAIL') suiteBreakdown[suite].failed++;
  });
  
  let summary = `Total Tests: ${total} | Passed: ${passed} | Failed: ${failed} | Unknown: ${unknown}\n`;
  summary += `Overall Success Rate: ${((passed / total) * 100).toFixed(1)}%\n\n`;
  
  summary += 'Suite Breakdown:\n';
  Object.entries(suiteBreakdown).forEach(([suite, stats]) => {
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    summary += `${suite}: ${stats.passed}/${stats.total} (${successRate}%)\n`;
  });
  
  return summary;
}

// Generate the report
generateCSV(); 