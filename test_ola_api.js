// Test different OLA Maps API formats
const testApiKey = '0PW9DZICT72RRZ6TD4CZ';

const endpoints = [
  `https://api.olamaps.io/places/v1/autocomplete?input=kolkata&api_key=${testApiKey}`,
  `https://api.olamaps.io/places/v1/autocomplete?input=kolkata&key=${testApiKey}`,
  `https://maps.olakabs.com/api/places/v1/autocomplete?input=kolkata&api_key=${testApiKey}`,
];

console.log('Testing OLA Maps API endpoints...');
endpoints.forEach((url, i) => {
  console.log(`\nTest ${i+1}: ${url.substring(0, 80)}...`);
});
