import { useState, useCallback } from "react";
import { Shield, Navigation, AlertTriangle, Loader2 } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { SafeTrackMap } from "@/components/SafeTrackMap";
import { SafetyBriefing } from "@/components/SafetyBriefing";
import { GeocodingResult, getRoute, RouteResult } from "@/lib/routing";
import { fetchIsolatedZones, generateSafetyBriefing, IsolatedZone } from "@/lib/overpass";

export default function Index() {
  const [startLocation, setStartLocation] = useState<GeocodingResult | null>(null);
  const [endLocation, setEndLocation] = useState<GeocodingResult | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [zones, setZones] = useState<IsolatedZone[]>([]);
  const [briefingTips, setBriefingTips] = useState<string[]>([]);
  const [showBriefing, setShowBriefing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanRoute = useCallback(async () => {
    if (!startLocation || !endLocation) return;

    setLoading(true);
    setError(null);
    setJourneyStarted(false);

    try {
      const routeResult = await getRoute(
        startLocation.lat, startLocation.lon,
        endLocation.lat, endLocation.lon
      );

      if (!routeResult) {
        setError("Could not find a walking route. Try different locations.");
        setLoading(false);
        return;
      }

      setRoute(routeResult);

      // Fetch isolated zones along the route
      const detectedZones = await fetchIsolatedZones(routeResult.coordinates);
      setZones(detectedZones);

      // Generate briefing
      const tips = generateSafetyBriefing(detectedZones, routeResult.distanceKm, routeResult.durationMin);
      setBriefingTips(tips);
      setShowBriefing(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startLocation, endLocation]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map */}
      <SafeTrackMap
        routeCoords={route?.coordinates || []}
        zones={journeyStarted ? zones : []}
        startCoord={startLocation ? [startLocation.lat, startLocation.lon] : undefined}
        endCoord={endLocation ? [endLocation.lat, endLocation.lon] : undefined}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[900] p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 glow-amber">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground tracking-tight">SafeTrack London</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">V2 — Isolation Zone Warnings</p>
              </div>
            </div>

            {/* Search inputs */}
            <div className="space-y-3">
              <LocationSearch
                label="From"
                placeholder="e.g. King's Cross Station"
                onSelect={setStartLocation}
              />
              <LocationSearch
                label="To"
                placeholder="e.g. Camden Town"
                onSelect={setEndLocation}
              />
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-danger">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Plan Route Button */}
            <button
              onClick={handlePlanRoute}
              disabled={!startLocation || !endLocation || loading}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning route…
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Scan & Plan Route
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Safety Briefing Panel */}
      {showBriefing && (
        <SafetyBriefing
          briefingTips={briefingTips}
          zones={zones}
          onClose={() => setShowBriefing(false)}
          onStartJourney={() => {
            setShowBriefing(false);
            setJourneyStarted(true);
          }}
        />
      )}

      {/* Journey active indicator */}
      {journeyStarted && zones.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[900]">
          <button
            onClick={() => setShowBriefing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-card/95 backdrop-blur-md border border-border rounded-full glow-amber"
          >
            <AlertTriangle className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-sm font-medium text-foreground">
              {zones.length} zone{zones.length > 1 ? 's' : ''} detected
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
