import { mockOlaMaps } from './mockOlaMaps';

// Define interfaces for OLA Maps API responses
interface OlaPlace {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address_components?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface OlaAutocompleteResponse {
  predictions: OlaPlace[];
  status: string;
}

// Check if we should use mock API (for development)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_OLA_MAPS === 'true' || 
                    !import.meta.env.VITE_OLAMAPS_API_KEY || 
                    import.meta.env.VITE_OLAMAPS_API_KEY.includes('your_') ||
                    import.meta.env.VITE_OLAMAPS_API_KEY.includes('_here');

export async function getDistanceInKm(origin: {lat: number, lng: number}, destination: {lat: number, lng: number}, apiKey: string): Promise<string | null> {
  try {
    // If using mock API or API key is invalid, return mock distance
    if (USE_MOCK_API) {
      console.log('🔧 Using mock distance calculation (OLA Maps API not available)');
      // Calculate straight-line distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (destination.lat - origin.lat) * Math.PI / 180;
      const dLon = (destination.lng - origin.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Add some randomness to make it more realistic (10-30% longer than straight line)
      const roadFactor = 1.1 + Math.random() * 0.2;
      return (distance * roadFactor).toFixed(2);
    }

    // Try real OLA Maps API
    const origins = `${origin.lat},${origin.lng}`;
    const destinations = `${destination.lat},${destination.lng}`;
    const url = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&api_key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OLA Maps API error: ${res.status}`);
    
    const data = await res.json();
    if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0] || typeof data.rows[0].elements[0].distance !== 'number') {
      throw new Error('No distance in matrix response');
    }
    return (data.rows[0].elements[0].distance / 1000).toFixed(2);
  } catch (err) {
    console.error('Distance fetch error:', err);
    console.log('🔄 Falling back to mock distance calculation');
    
    // Fallback to mock calculation
    const R = 6371;
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    const roadFactor = 1.15 + Math.random() * 0.15;
    return (distance * roadFactor).toFixed(2);
  }
}

export async function searchPlaces(input: string, apiKey?: string): Promise<OlaPlace[]> {
  try {
    // If using mock API or API key is invalid, use mock data
    if (USE_MOCK_API) {
      console.log('🔧 Using mock places search (OLA Maps API not available)');
      const response = await mockOlaMaps.autocomplete(input);
      return response.predictions;
    }

    // Try real OLA Maps API
    if (!apiKey) {
      throw new Error('API key required for real OLA Maps API');
    }

    const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OLA Maps API error: ${res.status}`);
    
    const data: OlaAutocompleteResponse = await res.json();
    return data.predictions || [];
  } catch (err) {
    console.error('Places search error:', err);
    console.log('🔄 Falling back to mock places search');
    
    // Fallback to mock API
    const response = await mockOlaMaps.autocomplete(input);
    return response.predictions;
  }
}

export async function reverseGeocode(lat: number, lng: number, apiKey?: string): Promise<OlaPlace | null> {
  try {
    // If using mock API or API key is invalid, use mock data
    if (USE_MOCK_API) {
      console.log('🔧 Using mock reverse geocoding (OLA Maps API not available)');
      return await mockOlaMaps.reverseGeocode(lat, lng);
    }

    // Try real OLA Maps API
    if (!apiKey) {
      throw new Error('API key required for real OLA Maps API');
    }

    const url = `https://api.olamaps.io/places/v1/reverse?lat=${lat}&lng=${lng}&api_key=${apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OLA Maps API error: ${res.status}`);
    
    const data = await res.json();
    return data.results?.[0] || null;
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    console.log('🔄 Falling back to mock reverse geocoding');
    
    // Fallback to mock API
    return await mockOlaMaps.reverseGeocode(lat, lng);
  }
}

// Utility function to check if we're using mock API
export function isUsingMockAPI(): boolean {
  return USE_MOCK_API;
} 