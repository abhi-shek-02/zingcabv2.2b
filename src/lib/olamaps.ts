export async function getDistanceInKm(origin: {lat: number, lng: number}, destination: {lat: number, lng: number}, apiKey: string): Promise<string | null> {
  try {
    // Build the query string as required by the endpoint
    const origins = `${origin.lat},${origin.lng}`;
    const destinations = `${destination.lat},${destination.lng}`;
    const url = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&api_key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch distance matrix');
    const data = await res.json();
    if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0] || typeof data.rows[0].elements[0].distance !== 'number') {
      throw new Error('No distance in matrix response');
    }
    return (data.rows[0].elements[0].distance / 1000).toFixed(2);
  } catch (err) {
    console.error('Distance fetch error:', err);
    return null;
  }
} 