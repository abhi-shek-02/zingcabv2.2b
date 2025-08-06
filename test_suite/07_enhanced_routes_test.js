const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

// Test data
const testScenarios = [
  // Basic fixed route test
  {
    name: 'Basic Fixed Route - Kolkata to Digha',
    data: {
      start: 'Kolkata',
      end: 'Digha',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-01-15',
      time: '09:00'
    }
  },
  // Seasonal pricing test - Summer
  {
    name: 'Summer Seasonal Pricing - Kolkata to Digha',
    data: {
      start: 'Kolkata',
      end: 'Digha',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-05-15', // Summer
      time: '09:00'
    }
  },
  // Seasonal pricing test - Monsoon
  {
    name: 'Monsoon Seasonal Pricing - Kolkata to Digha',
    data: {
      start: 'Kolkata',
      end: 'Digha',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-08-15', // Monsoon
      time: '09:00'
    }
  },
  // Event-based pricing test - Beach Season
  {
    name: 'Beach Season Event Pricing - Kolkata to Digha',
    data: {
      start: 'Kolkata',
      end: 'Digha',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-04-15', // Beach season
      time: '09:00'
    }
  },
  // Time-based pricing test - Peak Hours
  {
    name: 'Peak Hours Time Pricing - Kolkata to Digha',
    data: {
      start: 'Kolkata',
      end: 'Digha',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-01-15',
      time: '08:00' // Peak hours
    }
  },
  // Religious festival pricing
  {
    name: 'Religious Festival Pricing - Kolkata to Tarapith',
    data: {
      start: 'Kolkata',
      end: 'Tarapith',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-10-15', // Religious festival period
      time: '09:00'
    }
  },
  // ISKCON festival pricing
  {
    name: 'ISKCON Festival Pricing - Kolkata to Mayapur',
    data: {
      start: 'Kolkata',
      end: 'Mayapur',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-02-15', // ISKCON festival period
      time: '09:00'
    }
  },
  // Makar Sankranti pricing
  {
    name: 'Makar Sankranti Pricing - Kolkata to Gangasagar',
    data: {
      start: 'Kolkata',
      end: 'Gangasagar',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-01-15', // Makar Sankranti period
      time: '09:00'
    }
  },
  // Winter seasonal pricing
  {
    name: 'Winter Seasonal Pricing - Kolkata to Shantiniketan',
    data: {
      start: 'Kolkata',
      end: 'Shantiniketan',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-01-15', // Winter
      time: '09:00'
    }
  },
  // Business route (no special pricing)
  {
    name: 'Business Route - Kolkata to Durgapur',
    data: {
      start: 'Kolkata',
      end: 'Durgapur',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-01-15',
      time: '09:00'
    }
  }
];

async function testEnhancedRoutes() {
  console.log('🚀 Testing Enhanced Fixed Route System\n');
  
  // Test current conditions
  try {
    console.log('📅 Current Conditions:');
    const currentInfo = await axios.get(`${BASE_URL}/routes/info/current`);
    console.log(JSON.stringify(currentInfo.data, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.log('❌ Failed to get current conditions:', error.message);
  }
  
  // Test route statistics
  try {
    console.log('📊 Route Statistics:');
    const stats = await axios.get(`${BASE_URL}/routes/stats`);
    console.log(JSON.stringify(stats.data, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.log('❌ Failed to get route statistics:', error.message);
  }
  
  // Test each scenario
  for (const scenario of testScenarios) {
    try {
      console.log(`🧪 Testing: ${scenario.name}`);
      console.log(`📋 Data: ${JSON.stringify(scenario.data)}`);
      
      const response = await axios.post(`${BASE_URL}/routes/test-pricing`, scenario.data);
      
      console.log('✅ Result:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Show pricing breakdown
      if (response.data.success && response.data.data) {
        const result = response.data.data;
        console.log('\n💰 Pricing Breakdown:');
        console.log(`   Route ID: ${result.route_id}`);
        console.log(`   Route Type: ${result.route_type}`);
        console.log(`   Base Fare: ₹${result.base_fare}`);
        console.log(`   Final Fare: ₹${result.final_fare}`);
        console.log(`   Pricing Type: ${result.pricing_type}`);
        console.log(`   Priority: ${result.route_priority}`);
        
        if (result.conditions_applied) {
          console.log('   Conditions Applied:');
          console.log(`     Season: ${result.conditions_applied.season || 'None'}`);
          console.log(`     Events: ${result.conditions_applied.events?.join(', ') || 'None'}`);
          console.log(`     Time Slot: ${result.conditions_applied.time_slot || 'None'}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n' + '-'.repeat(80) + '\n');
  }
  
  // Test route management operations
  console.log('🔧 Testing Route Management Operations:\n');
  
  // Test adding a new route
  try {
    console.log('➕ Adding new route: Digha to Mandarmani');
    const newRoute = {
      start: 'Digha',
      end: 'Mandarmani',
      service_type: 'oneway',
      route_type: 'tourist',
      fares: {
        sedan: 1499,
        suv: 1999
      },
      conditions: {
        seasonal: {
          summer: {
            sedan: 1699,
            suv: 2199
          }
        }
      },
      priority: 2
    };
    
    const addResponse = await axios.post(`${BASE_URL}/routes`, newRoute);
    console.log('✅ Route added successfully');
    console.log(JSON.stringify(addResponse.data, null, 2));
    
    // Test updating the route
    console.log('\n✏️ Updating route with new pricing');
    const updateData = {
      fares: {
        sedan: 1599,
        suv: 2099
      }
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/routes/digha-mandarmani`, updateData);
    console.log('✅ Route updated successfully');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    
    // Test the new route
    console.log('\n🧪 Testing new route');
    const testNewRoute = await axios.post(`${BASE_URL}/routes/test-pricing`, {
      start: 'Digha',
      end: 'Mandarmani',
      service_type: 'oneway',
      car_type: 'sedan',
      date: '2024-01-15',
      time: '09:00'
    });
    console.log('✅ New route test result:');
    console.log(JSON.stringify(testNewRoute.data, null, 2));
    
    // Test deactivating the route
    console.log('\n⏸️ Deactivating route');
    const deactivateResponse = await axios.patch(`${BASE_URL}/routes/digha-mandarmani/deactivate`);
    console.log('✅ Route deactivated successfully');
    console.log(JSON.stringify(deactivateResponse.data, null, 2));
    
    // Test reactivating the route
    console.log('\n▶️ Reactivating route');
    const activateResponse = await axios.patch(`${BASE_URL}/routes/digha-mandarmani/activate`);
    console.log('✅ Route activated successfully');
    console.log(JSON.stringify(activateResponse.data, null, 2));
    
    // Test deleting the route
    console.log('\n🗑️ Deleting route');
    const deleteResponse = await axios.delete(`${BASE_URL}/routes/digha-mandarmani`);
    console.log('✅ Route deleted successfully');
    console.log(JSON.stringify(deleteResponse.data, null, 2));
    
  } catch (error) {
    console.log(`❌ Route management test failed: ${error.response?.data?.message || error.message}`);
  }
  
  console.log('\n🎉 Enhanced Route System Testing Complete!');
}

// Run the test
testEnhancedRoutes().catch(console.error); 