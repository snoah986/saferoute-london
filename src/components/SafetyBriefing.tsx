import { IsolatedZone } from "@/lib/overpass";
import { AlertTriangle, TreePine, Route, Lightbulb, X, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SafetyBriefingProps {
  briefingTips: string[];
  zones: IsolatedZone[];
  onClose: () => void;
  onStartJourney: () => void;
}

const riskColors = {
  low: "text-safe",
  medium: "text-primary",
  high: "text-danger",
};

const riskBg = {
  low: "bg-safe/10 border-safe/20",
  medium: "bg-primary/10 border-primary/20",
  high: "bg-danger/10 border-danger/20",
};

const typeIcons: Record<IsolatedZone['type'], React.ReactNode> = {
  park: <TreePine className="w-4 h-4" />,
  underpass: <Route className="w-4 h-4" />,
  unlit_path: <Lightbulb className="w-4 h-4" />,
  alley: <AlertTriangle className="w-4 h-4" />,
  subway: <Route className="w-4 h-4" />,
};

export function SafetyBriefing({ briefingTips, zones, onClose, onStartJourney }: SafetyBriefingProps) {
  const [showZones, setShowZones] = useState(false);
  const highRisk = zones.filter(z => z.riskLevel === 'high').length;
  const overallRisk = highRisk >= 3 ? 'high' : highRisk >= 1 ? 'medium' : 'low';

  return (
    <div className="absolute inset-0 z-[1000] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col glow-amber">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${riskBg[overallRisk]}`}>
              <Shield className={`w-5 h-5 ${riskColors[overallRisk]}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Safety Briefing</h2>
              <p className="text-xs text-muted-foreground">Review before you go</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {briefingTips.map((tip, i) => (
            <div key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-foreground font-medium' : 'text-secondary-foreground'}`}>
              {tip}
            </div>
          ))}

          {/* Zone details toggle */}
          {zones.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setShowZones(!showZones)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                {showZones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showZones ? 'Hide' : 'Show'} {zones.length} detected zone{zones.length > 1 ? 's' : ''}
              </button>

              {showZones && (
                <div className="mt-3 space-y-2">
                  {zones.slice(0, 15).map((zone) => (
                    <div key={zone.id} className={`flex items-start gap-3 p-3 rounded-lg border ${riskBg[zone.riskLevel]}`}>
                      <span className={riskColors[zone.riskLevel]}>{typeIcons[zone.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{zone.name}</p>
                        <p className="text-xs text-muted-foreground">{zone.description}</p>
                      </div>
                      <span className={`text-xs font-medium uppercase ${riskColors[zone.riskLevel]}`}>
                        {zone.riskLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            Edit Route
          </button>
          <button
            onClick={onStartJourney}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Start Journey
          </button>
        </div>
      </div>
    </div>
  );
}
