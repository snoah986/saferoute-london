import { MapPin, AlertTriangle, XCircle } from "lucide-react";

interface JourneyStatusBarProps {
  destinationName: string;
  zoneCount: number;
  onStopJourney: () => void;
}

export function JourneyStatusBar({ destinationName, zoneCount, onStopJourney }: JourneyStatusBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[900] p-4">
      <div className="max-w-lg mx-auto bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 glow-amber">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-xl shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{destinationName}</p>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {zoneCount} zone{zoneCount !== 1 ? 's' : ''} detected
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onStopJourney}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-danger text-danger-foreground font-semibold text-xs hover:opacity-90 transition-opacity shrink-0"
          >
            <XCircle className="w-3.5 h-3.5" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
