export interface RouteResult {
  coordinates: [number, number][]; // [lat, lon]
  distanceKm: number;
  durationMin: number;
}

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lon: number;
}

export async function geocodeLocation(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'gb',
    viewbox: '-0.5103,51.2868,0.3340,51.6919',
    bounded: '1',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'SafeTrackLondon/2.0' },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.map((item: any) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}

export async function getRoute(
  startLat: number, startLon: number,
  endLat: number, endLon: number
): Promise<RouteResult | null> {
  // OSRM uses lon,lat order
  const url = `https://router.project-osrm.org/route/v1/foot/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.routes || data.routes.length === 0) return null;

  const route = data.routes[0];
  // GeoJSON is [lon, lat], we need [lat, lon]
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    ([lon, lat]: [number, number]) => [lat, lon] as [number, number]
  );

  return {
    coordinates,
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  };
}
