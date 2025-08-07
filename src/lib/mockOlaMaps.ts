// Mock OLA Maps API for development when real API has CORS issues
interface MockPlace {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address_components: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface MockAutocompleteResponse {
  predictions: MockPlace[];
  status: string;
}

class MockOlaMapsAPI {
  private mockPlaces: MockPlace[] = [
    {
      place_id: "mock_1",
      display_name: "Kolkata Railway Station Front Gate, Canal Circular Road, Ultadanga, Kolkata, West Bengal 700004",
      lat: "22.5726",
      lon: "88.3639",
      address_components: {
        road: "Canal Circular Road",
        neighbourhood: "Ultadanga", 
        city: "Kolkata",
        state: "West Bengal",
        postcode: "700004",
        country: "India"
      }
    },
    {
      place_id: "mock_2", 
      display_name: "Salt Lake City, Sector V, Kolkata, West Bengal 700091",
      lat: "22.5744",
      lon: "88.4323",
      address_components: {
        neighbourhood: "Sector V",
        city: "Salt Lake City",
        state: "West Bengal", 
        postcode: "700091",
        country: "India"
      }
    },
    {
      place_id: "mock_3",
      display_name: "New Town, Rajarhat, Kolkata, West Bengal 700156", 
      lat: "22.6203",
      lon: "88.4636",
      address_components: {
        city: "New Town",
        neighbourhood: "Rajarhat",
        state: "West Bengal",
        postcode: "700156", 
        country: "India"
      }
    },
    {
      place_id: "mock_4",
      display_name: "Netaji Subhash Chandra Bose International Airport, Jessore Road, Dum Dum, Kolkata, West Bengal 700052",
      lat: "22.6546",
      lon: "88.4467",
      address_components: {
        road: "Jessore Road",
        city: "Dum Dum", 
        neighbourhood: "Airport Area",
        state: "West Bengal",
        postcode: "700052",
        country: "India"
      }
    },
    {
      place_id: "mock_5",
      display_name: "Siliguri Junction Railway Station, Hill Cart Road, Siliguri, West Bengal 734001",
      lat: "26.7271",
      lon: "88.3953",
      address_components: {
        road: "Hill Cart Road",
        city: "Siliguri",
        state: "West Bengal", 
        postcode: "734001",
        country: "India"
      }
    },
    {
      place_id: "mock_6",
      display_name: "Durgapur Steel Plant, Durgapur, West Bengal 713205",
      lat: "23.5204",
      lon: "87.3119",
      address_components: {
        city: "Durgapur",
        state: "West Bengal",
        postcode: "713205",
        country: "India"
      }
    },
    {
      place_id: "mock_7", 
      display_name: "Asansol Junction Railway Station, GT Road, Asansol, West Bengal 713301",
      lat: "23.6739",
      lon: "86.9524",
      address_components: {
        road: "GT Road",
        city: "Asansol",
        state: "West Bengal",
        postcode: "713301", 
        country: "India"
      }
    }
  ];

  async autocomplete(input: string): Promise<MockAutocompleteResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter places based on input
    const filtered = this.mockPlaces.filter(place => 
      place.display_name.toLowerCase().includes(input.toLowerCase())
    );
    
    return {
      predictions: filtered.slice(0, 5), // Return max 5 results
      status: "OK"
    };
  }

  async reverseGeocode(lat: number, lon: number): Promise<MockPlace | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find closest place (simplified)
    let closest = this.mockPlaces[0];
    let minDistance = this.calculateDistance(lat, lon, parseFloat(closest.lat), parseFloat(closest.lon));
    
    for (const place of this.mockPlaces) {
      const distance = this.calculateDistance(lat, lon, parseFloat(place.lat), parseFloat(place.lon));
      if (distance < minDistance) {
        minDistance = distance;
        closest = place;
      }
    }
    
    return closest;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const mockOlaMaps = new MockOlaMapsAPI(); 