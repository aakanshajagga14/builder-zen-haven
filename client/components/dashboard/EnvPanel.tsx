import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer, Droplets, Wind, Cloud, CloudRain } from "lucide-react";

type Coords = { lat: number; lon: number };

type Place = { name?: string; admin1?: string; country?: string };

type Current = {
  temperature_2m?: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  precipitation?: number;
  cloud_cover?: number;
  weather_code?: number;
  time?: string;
};

function wc(code?: number) {
  if (code == null) return "Unknown";
  if ([0].includes(code)) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return `Code ${code}`;
}

export default function EnvPanel() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(() => {
    setLoading(true);
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setCoords({ lat, lon });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Location permission denied");
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        // Reverse geocode
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${coords.lat}&longitude=${coords.lon}&language=en&format=json`,
          { signal: controller.signal },
        );
        const geo = await geoRes.json();
        const first = geo?.results?.[0] || {};
        setPlace({ name: first.name, admin1: first.admin1, country: first.country });

        // Weather
        const params = new URLSearchParams({
          latitude: String(coords.lat),
          longitude: String(coords.lon),
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
          ].join(","),
          timezone: "auto",
        });
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { signal: controller.signal });
        const w = await wRes.json();
        setCurrent(w?.current || null);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to fetch environment");
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [coords]);

  const subtitle = useMemo(() => {
    if (place?.name) return `${place.name}${place.admin1 ? ", " + place.admin1 : ""}${place.country ? ", " + place.country : ""}`;
    if (coords) return `${coords.lat}, ${coords.lon}`;
    return "Permission required";
  }, [place, coords]);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4" /> Location & Weather</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {current?.weather_code != null && <Badge variant="secondary">{wc(current.weather_code)}</Badge>}
          <Button size="sm" onClick={detect} disabled={loading}>{coords ? "Refresh" : "Use my location"}</Button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Thermometer className="h-4 w-4" /> Temperature</div>
          <div className="mt-1 text-lg font-semibold">{current?.temperature_2m != null ? `${current.temperature_2m.toFixed(1)}°C` : "--"}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Droplets className="h-4 w-4" /> Humidity</div>
          <div className="mt-1 text-lg font-semibold">{current?.relative_humidity_2m != null ? `${current.relative_humidity_2m}%` : "--"}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wind className="h-4 w-4" /> Wind</div>
          <div className="mt-1 text-lg font-semibold">{current?.wind_speed_10m != null ? `${current.wind_speed_10m} m/s` : "--"}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><CloudRain className="h-4 w-4" /> Precipitation</div>
          <div className="mt-1 text-lg font-semibold">{current?.precipitation != null ? `${current.precipitation} mm` : "--"}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Cloud className="h-4 w-4" /> Cloud Cover</div>
          <div className="mt-1 text-lg font-semibold">{current?.cloud_cover != null ? `${current.cloud_cover}%` : "--"}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wind className="h-4 w-4" /> Wind Dir</div>
          <div className="mt-1 text-lg font-semibold">{current?.wind_direction_10m != null ? `${current.wind_direction_10m}°` : "--"}</div>
        </div>
      </div>
    </Card>
  );
}
