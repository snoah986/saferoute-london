import { useState, useCallback } from "react";
import { Shield, Navigation, AlertTriangle, Loader2 } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { SafeTrackMap } from "@/components/SafeTrackMap";
import { SafetyBriefing } from "@/components/SafetyBriefing";
import { JourneyStatusBar } from "@/components/JourneyStatusBar";
import { TFLPanel } from "@/components/TFLPanel";
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

      const detectedZones = await fetchIsolatedZones(routeResult.coordinates);
      setZones(detectedZones);

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

  const handleStopJourney = useCallback(() => {
    setJourneyStarted(false);
    setRoute(null);
    setZones([]);
    setBriefingTips([]);
    setShowBriefing(false);
    setError(null);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map */}
      <SafeTrackMap
        routeCoords={route?.coordinates || []}
        zones={journeyStarted ? zones : []}
        startCoord={startLocation ? [startLocation.lat, startLocation.lon] : undefined}
        endCoord={endLocation ? [endLocation.lat, endLocation.lon] : undefined}
      />

      {/* Top Bar — hidden during journey */}
      {!journeyStarted && (
        <div className="absolute top-0 left-0 right-0 z-[900] p-4">
          <div className="max-w-lg mx-auto">
            <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 glow-amber">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground tracking-tight">SafeTrack London</h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">V3 — Live TFL Integration</p>
                </div>
              </div>

              <div className="space-y-3">
                <LocationSearch label="From" placeholder="e.g. King's Cross Station" onSelect={setStartLocation} />
                <LocationSearch label="To" placeholder="e.g. Camden Town" onSelect={setEndLocation} />
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-danger">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

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
      )}

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

      {/* TFL Panel — visible during journey */}
      <TFLPanel
        routeCoords={route?.coordinates || []}
        visible={journeyStarted}
      />

      {/* Bottom status bar during journey */}
      {journeyStarted && (
        <JourneyStatusBar
          destinationName={endLocation?.displayName || 'Destination'}
          zoneCount={zones.length}
          onStopJourney={handleStopJourney}
        />
      )}
    </div>
  );
}
