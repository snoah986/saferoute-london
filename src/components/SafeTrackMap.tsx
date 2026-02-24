import { useEffect, useRef } from "react";
import L from "leaflet";
import { IsolatedZone } from "@/lib/overpass";

interface SafeTrackMapProps {
  routeCoords: [number, number][];
  zones: IsolatedZone[];
  startCoord?: [number, number];
  endCoord?: [number, number];
}

const zoneColors: Record<IsolatedZone['riskLevel'], string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

export function SafeTrackMap({ routeCoords, zones, startCoord, endCoord }: SafeTrackMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [51.5074, -0.1278],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    layersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layers
  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // Route
    if (routeCoords.length > 1) {
      // Glow
      L.polyline(routeCoords, { color: '#f59e0b', weight: 6, opacity: 0.3 }).addTo(layers);
      // Line
      L.polyline(routeCoords, { color: '#f59e0b', weight: 3, opacity: 0.9 }).addTo(layers);

      map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50] });
    }

    // Start marker
    if (startCoord) {
      L.marker(startCoord, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;background:#22c55e;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px rgba(34,197,94,0.5);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      }).addTo(layers);
    }

    // End marker
    if (endCoord) {
      L.marker(endCoord, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;background:#ef4444;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px rgba(239,68,68,0.5);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      }).addTo(layers);
    }

    // Zones
    zones.forEach((zone) => {
      const circle = L.circleMarker([zone.lat, zone.lon], {
        radius: 8,
        color: zoneColors[zone.riskLevel],
        fillColor: zoneColors[zone.riskLevel],
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(layers);

      circle.bindTooltip(`<strong>${zone.name}</strong><br/>${zone.description}`, {
        direction: 'top',
        offset: [0, -10],
      });
    });
  }, [routeCoords, zones, startCoord, endCoord]);

  return <div ref={containerRef} className="w-full h-full" />;
}
