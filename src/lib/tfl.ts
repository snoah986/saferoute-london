export interface BusArrival {
  id: string;
  lineId: string;
  lineName: string;
  destinationName: string;
  stationName: string;
  naptanId: string;
  expectedArrival: string;
  timeToStation: number; // seconds
  isCancelled: boolean;
}

export interface BusStop {
  naptanId: string;
  commonName: string;
  lat: number;
  lon: number;
  distance: number;
}

export interface TubeLineStatus {
  id: string;
  name: string;
  statusSeverity: number;
  statusSeverityDescription: string;
  reason?: string;
}

// Find bus stops near route coordinates
export async function fetchNearbyBusStops(
  routeCoords: [number, number][],
  radiusMeters: number = 200
): Promise<BusStop[]> {
  // Sample a few points along the route
  const step = Math.max(1, Math.floor(routeCoords.length / 8));
  const sampled = routeCoords.filter((_, i) => i % step === 0);

  const allStops: BusStop[] = [];
  const seenIds = new Set<string>();

  for (const [lat, lon] of sampled) {
    try {
      const res = await fetch(
        `https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&lat=${lat}&lon=${lon}&radius=${radiusMeters}`
      );
      if (!res.ok) continue;
      const data = await res.json();

      for (const stop of data.stopPoints || []) {
        if (seenIds.has(stop.naptanId)) continue;
        seenIds.add(stop.naptanId);
        allStops.push({
          naptanId: stop.naptanId,
          commonName: stop.commonName,
          lat: stop.lat,
          lon: stop.lon,
          distance: stop.distance || 0,
        });
      }
    } catch (e) {
      console.error('TFL stop fetch error:', e);
    }
  }

  return allStops.slice(0, 10); // Limit to 10 stops
}

// Fetch live arrivals for a bus stop
export async function fetchBusArrivals(naptanId: string): Promise<BusArrival[]> {
  try {
    const res = await fetch(`https://api.tfl.gov.uk/StopPoint/${naptanId}/Arrivals`);
    if (!res.ok) return [];
    const data = await res.json();

    return data
      .map((a: any) => ({
        id: a.id,
        lineId: a.lineId,
        lineName: a.lineName,
        destinationName: a.destinationName,
        stationName: a.stationName,
        naptanId: a.naptanId,
        expectedArrival: a.expectedArrival,
        timeToStation: a.timeToStation,
        isCancelled: a.isCancelled === true,
      }))
      .sort((a: BusArrival, b: BusArrival) => a.timeToStation - b.timeToStation)
      .slice(0, 3);
  } catch (e) {
    console.error('TFL arrivals error:', e);
    return [];
  }
}

// Fetch tube line statuses
export async function fetchTubeStatus(): Promise<TubeLineStatus[]> {
  try {
    const res = await fetch('https://api.tfl.gov.uk/Line/Mode/tube/Status');
    if (!res.ok) return [];
    const data = await res.json();

    return data.map((line: any) => {
      const status = line.lineStatuses?.[0] || {};
      return {
        id: line.id,
        name: line.name,
        statusSeverity: status.statusSeverity ?? 10,
        statusSeverityDescription: status.statusSeverityDescription || 'Unknown',
        reason: status.reason,
      };
    });
  } catch (e) {
    console.error('TFL tube status error:', e);
    return [];
  }
}

// Get status color class based on severity
export function getStatusColor(severity: number): 'safe' | 'primary' | 'danger' {
  if (severity === 10) return 'safe'; // Good Service
  if (severity >= 6) return 'primary'; // Minor Delays
  return 'danger'; // Severe / Suspended
}

// Format seconds to minutes display
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return 'Due';
  return `${mins} min`;
}
