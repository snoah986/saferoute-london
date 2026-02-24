import { useState, useCallback, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { geocodeLocation, GeocodingResult } from "@/lib/routing";

interface LocationSearchProps {
  label: string;
  placeholder: string;
  onSelect: (result: GeocodingResult) => void;
  value?: string;
}

export function LocationSearch({ label, placeholder, onSelect, value }: LocationSearchProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (q.length < 3) { setResults([]); setShowDropdown(false); return; }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await geocodeLocation(q);
      setResults(res);
      setShowDropdown(res.length > 0);
      setLoading(false);
    }, 400);
  }, []);

  const handleSelect = (result: GeocodingResult) => {
    const shortName = result.displayName.split(",").slice(0, 2).join(",").trim();
    setQuery(shortName);
    setShowDropdown(false);
    onSelect(result);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
      </div>
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-secondary transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground line-clamp-2">{r.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
