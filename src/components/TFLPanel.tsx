import { useState, useEffect, useCallback } from "react";
import { Bus, Train, Clock, AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import {
  BusArrival,
  BusStop,
  TubeLineStatus,
  fetchNearbyBusStops,
  fetchBusArrivals,
  fetchTubeStatus,
  getStatusColor,
  formatCountdown,
} from "@/lib/tfl";
import { Badge } from "@/components/ui/badge";

interface TFLPanelProps {
  routeCoords: [number, number][];
  visible: boolean;
}

const tubeLineColors: Record<string, string> = {
  bakerloo: '#B36305',
  central: '#E32017',
  circle: '#FFD300',
  district: '#00782A',
  'hammersmith-city': '#F3A9BB',
  jubilee: '#A0A5A9',
  metropolitan: '#9B0056',
  northern: '#000000',
  piccadilly: '#003688',
  victoria: '#0098D4',
  'waterloo-city': '#95CDBA',
  elizabeth: '#6950A1',
};

export function TFLPanel({ routeCoords, visible }: TFLPanelProps) {
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [arrivals, setArrivals] = useState<Record<string, BusArrival[]>>({});
  const [tubeStatus, setTubeStatus] = useState<TubeLineStatus[]>([]);
  const [showBus, setShowBus] = useState(false);
  const [showTube, setShowTube] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastServiceAlert, setLastServiceAlert] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!visible || routeCoords.length < 2) return;
    setLoading(true);

    const [stops, tube] = await Promise.all([
      fetchNearbyBusStops(routeCoords),
      fetchTubeStatus(),
    ]);

    setBusStops(stops);
    setTubeStatus(tube);

    // Fetch arrivals for each stop
    const arrMap: Record<string, BusArrival[]> = {};
    await Promise.all(
      stops.slice(0, 5).map(async (stop) => {
        arrMap[stop.naptanId] = await fetchBusArrivals(stop.naptanId);
      })
    );
    setArrivals(arrMap);

    // Check for last service alerts
    checkLastServiceAlerts(arrMap);

    setLoading(false);
  }, [visible, routeCoords]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  function checkLastServiceAlerts(arrMap: Record<string, BusArrival[]>) {
    for (const [, arrs] of Object.entries(arrMap)) {
      for (const arr of arrs) {
        const minsToArrival = arr.timeToStation / 60;
        // If this is the last bus and it's within 20 min
        if (minsToArrival <= 20 && minsToArrival > 0) {
          // Simple heuristic: if only 1 arrival left for this line, it might be the last
          const sameLine = arrs.filter(a => a.lineId === arr.lineId);
          if (sameLine.length === 1) {
            setLastServiceAlert(
              `⚠️ Last ${arr.lineName} bus to ${arr.destinationName} departs in ${Math.round(minsToArrival)} min from ${arr.stationName}`
            );
            return;
          }
        }
      }
    }
    setLastServiceAlert(null);
  }

  if (!visible) return null;

  return (
    <div className="absolute top-4 right-4 z-[900] w-80 space-y-2">
      {/* Last service alert banner */}
      {lastServiceAlert && (
        <div className="bg-danger/90 backdrop-blur-md text-danger-foreground text-xs font-medium px-4 py-2.5 rounded-xl border border-danger/40 animate-pulse">
          {lastServiceAlert}
        </div>
      )}

      {/* Bus Arrivals */}
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowBus(!showBus)}
          className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Live Bus Arrivals</span>
            {loading && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
          </div>
          {showBus ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showBus && (
          <div className="border-t border-border max-h-64 overflow-y-auto">
            {busStops.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">No bus stops found near route.</p>
            ) : (
              busStops.slice(0, 5).map((stop) => (
                <div key={stop.naptanId} className="p-3 border-b border-border/50 last:border-0">
                  <p className="text-xs font-medium text-foreground truncate">{stop.commonName}</p>
                  <div className="mt-1.5 space-y-1">
                    {(arrivals[stop.naptanId] || []).length === 0 ? (
                      <p className="text-[10px] text-muted-foreground">No arrivals data</p>
                    ) : (
                      (arrivals[stop.naptanId] || []).map((arr) => (
                        <div key={arr.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                              {arr.lineName}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              → {arr.destinationName}
                            </span>
                          </div>
                          {arr.isCancelled ? (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                              CANCELLED
                            </Badge>
                          ) : (
                            <span className="text-[10px] font-semibold text-safe whitespace-nowrap flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatCountdown(arr.timeToStation)}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tube Status */}
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowTube(!showTube)}
          className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Tube Status</span>
          </div>
          {showTube ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showTube && (
          <div className="border-t border-border max-h-72 overflow-y-auto">
            {tubeStatus.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">Loading tube status…</p>
            ) : (
              tubeStatus.map((line) => {
                const statusType = getStatusColor(line.statusSeverity);
                return (
                  <div key={line.id} className="flex items-center gap-2.5 px-3 py-2 border-b border-border/50 last:border-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tubeLineColors[line.id] || '#888' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{line.name}</p>
                    </div>
                    <span className={`text-[10px] font-semibold text-${statusType} whitespace-nowrap`}>
                      {line.statusSeverityDescription}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
