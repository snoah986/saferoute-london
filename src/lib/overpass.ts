export interface IsolatedZone {
  id: number;
  type: 'park' | 'underpass' | 'unlit_path' | 'alley' | 'subway';
  name: string;
  lat: number;
  lon: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// Build Overpass query for isolated zones near a route
function buildOverpassQuery(routeCoords: [number, number][], bufferMeters: number = 150): string {
  // Sample route points to avoid huge query (take every Nth point)
  const step = Math.max(1, Math.floor(routeCoords.length / 20));
  const sampled = routeCoords.filter((_, i) => i % step === 0 || i === routeCoords.length - 1);

  // Build a poly for "around" filter
  const coordStr = sampled.map(([lat, lon]) => `${lat} ${lon}`).join(' ');

  return `
[out:json][timeout:15];
(
  // Parks and gardens
  way["leisure"="park"](around:${bufferMeters},${coordStr});
  relation["leisure"="park"](around:${bufferMeters},${coordStr});
  way["leisure"="garden"](around:${bufferMeters},${coordStr});
  
  // Underpasses and tunnels
  way["tunnel"="yes"](around:${bufferMeters},${coordStr});
  node["highway"="subway_entrance"](around:${bufferMeters},${coordStr});
  way["layer"~"^-"](around:${bufferMeters},${coordStr});
  
  // Alleys and paths
  way["highway"="path"](around:${bufferMeters},${coordStr});
  way["highway"="footway"]["lit"="no"](around:${bufferMeters},${coordStr});
  way["highway"="service"]["service"="alley"](around:${bufferMeters},${coordStr});
  
  // Unlit roads
  way["highway"]["lit"="no"](around:${bufferMeters},${coordStr});
);
out center 50;
`;
}

function classifyElement(tags: Record<string, string>): { type: IsolatedZone['type']; description: string; riskLevel: IsolatedZone['riskLevel'] } {
  if (tags.leisure === 'park' || tags.leisure === 'garden') {
    return {
      type: 'park',
      description: 'Park or green space — may be poorly lit at night',
      riskLevel: 'medium',
    };
  }
  if (tags.tunnel === 'yes' || (tags.layer && parseInt(tags.layer) < 0)) {
    return {
      type: 'underpass',
      description: 'Underpass or tunnel — limited visibility and escape routes',
      riskLevel: 'high',
    };
  }
  if (tags.highway === 'subway_entrance') {
    return {
      type: 'subway',
      description: 'Subway entrance — isolated access point',
      riskLevel: 'medium',
    };
  }
  if (tags.service === 'alley') {
    return {
      type: 'alley',
      description: 'Alleyway — narrow and potentially unmonitored',
      riskLevel: 'high',
    };
  }
  // Unlit paths
  return {
    type: 'unlit_path',
    description: 'Unlit footpath — no street lighting confirmed',
    riskLevel: tags.highway === 'footway' || tags.highway === 'path' ? 'high' : 'medium',
  };
}

export async function fetchIsolatedZones(routeCoords: [number, number][]): Promise<IsolatedZone[]> {
  if (routeCoords.length < 2) return [];

  const query = buildOverpassQuery(routeCoords);

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) {
    console.error('Overpass API error:', response.status);
    return [];
  }

  const data = await response.json();
  const zones: IsolatedZone[] = [];
  const seen = new Set<string>();

  for (const element of data.elements || []) {
    const tags = element.tags || {};
    const lat = element.center?.lat || element.lat;
    const lon = element.center?.lon || element.lon;

    if (!lat || !lon) continue;

    const key = `${Math.round(lat * 1000)}_${Math.round(lon * 1000)}_${tags.leisure || tags.highway || tags.tunnel || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { type, description, riskLevel } = classifyElement(tags);
    const name = tags.name || tags['name:en'] || `Unnamed ${type.replace('_', ' ')}`;

    zones.push({ id: element.id, type, name, lat, lon, description, riskLevel });
  }

  return zones;
}

export function generateSafetyBriefing(zones: IsolatedZone[], distanceKm: number, durationMin: number): string[] {
  const tips: string[] = [];

  const highRisk = zones.filter(z => z.riskLevel === 'high');
  const medRisk = zones.filter(z => z.riskLevel === 'medium');
  const parks = zones.filter(z => z.type === 'park');
  const underpasses = zones.filter(z => z.type === 'underpass');
  const unlitPaths = zones.filter(z => z.type === 'unlit_path');
  const alleys = zones.filter(z => z.type === 'alley');

  tips.push(`Your route is ${distanceKm.toFixed(1)} km and should take about ${Math.round(durationMin)} minutes on foot.`);

  if (zones.length === 0) {
    tips.push("No isolated zones detected along this route. It appears to follow well-lit, open streets.");
    return tips;
  }

  tips.push(`We detected ${zones.length} isolated zone${zones.length > 1 ? 's' : ''} near your route.`);

  if (highRisk.length > 0) {
    tips.push(`⚠️ ${highRisk.length} high-risk area${highRisk.length > 1 ? 's' : ''}: ${highRisk.map(z => z.name).slice(0, 3).join(', ')}. Stay alert and keep to main roads where possible.`);
  }

  if (parks.length > 0) {
    tips.push(`🌳 ${parks.length} park${parks.length > 1 ? 's' : ''} nearby. Parks can be poorly lit after dark — consider walking around them rather than through.`);
  }

  if (underpasses.length > 0) {
    tips.push(`🚇 ${underpasses.length} underpass${underpasses.length > 1 ? 'es' : ''} on or near your route. These have limited visibility — move quickly and stay aware of your surroundings.`);
  }

  if (unlitPaths.length > 0) {
    tips.push(`🔦 ${unlitPaths.length} unlit path${unlitPaths.length > 1 ? 's' : ''} detected. Use your phone torch and stick to the middle of the path.`);
  }

  if (alleys.length > 0) {
    tips.push(`🏚️ ${alleys.length} alley${alleys.length > 1 ? 's' : ''} nearby. Alleys can be narrow and unmonitored — avoid if possible.`);
  }

  if (medRisk.length > 0 && highRisk.length === 0) {
    tips.push("Overall this route has moderate isolation. Stay on well-lit paths and keep your phone charged.");
  }

  tips.push("💡 General tip: Share your live location with a trusted contact before starting your journey.");

  return tips;
}
