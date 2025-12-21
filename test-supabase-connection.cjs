// Test Supabase connection directly
require('dotenv').config({ 
  path: process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env.development' 
});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'NOT SET');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Check if contacts table exists
console.log('1. Testing contacts table...');
supabase.from('contacts').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('   ❌ Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
    } else {
      console.log('   ✓ Contacts table accessible');
    }
    return supabase.from('drivers').select('count').limit(1);
  })
  .then(({ data, error }) => {
    console.log('');
    console.log('2. Testing drivers table...');
    if (error) {
      console.error('   ❌ Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
    } else {
      console.log('   ✓ Drivers table accessible');
    }
    return supabase.from('vehicles').select('count').limit(1);
  })
  .then(({ data, error }) => {
    console.log('');
    console.log('3. Testing vehicles table...');
    if (error) {
      console.error('   ❌ Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
    } else {
      console.log('   ✓ Vehicles table accessible');
    }
    return supabase.from('bookingtable').select('count').limit(1);
  })
  .then(({ data, error }) => {
    console.log('');
    console.log('4. Testing bookingtable...');
    if (error) {
      console.error('   ❌ Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
    } else {
      console.log('   ✓ Bookingtable accessible');
    }
    console.log('');
    console.log('✅ Connection test complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('');
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  });

