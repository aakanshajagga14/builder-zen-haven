import { useCallback, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export type SiteStats = {
  hazardIndex: number;
  velocityAvg: number;
  activeRocks: number;
  confidence: number;
};

type Geo = {
  name: string;
  lat: number;
  lon: number;
  admin1?: string;
  country?: string;
};

async function geocode(name: string): Promise<Geo | null> {
  const candidates = [name, /india/i.test(name) ? name : `${name}, India`];
  // Try Open-Meteo first, then Nominatim, across both candidates
  for (const q of candidates) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list: any[] = json?.results || [];
        if (list.length) {
          const preferred =
            list.find((x) => /india/i.test(x.country || "")) || list[0];
          return {
            name: preferred.name,
            lat: preferred.latitude,
            lon: preferred.longitude,
            admin1: preferred.admin1,
            country: preferred.country,
          };
        }
      }
    } catch {}

    try {
      const url2 = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(q)}`;
      const res2 = await fetch(url2, {
        headers: { Accept: "application/json" },
      });
      if (res2.ok) {
        const arr = await res2.json();
        const hit = arr?.[0];
        if (hit) {
          const addr = hit.address || {};
          return {
            name: hit.display_name?.split(",")[0] || name,
            lat: parseFloat(hit.lat),
            lon: parseFloat(hit.lon),
            admin1: addr.state || addr.county,
            country: addr.country,
          };
        }
      }
    } catch {}
  }
  return null;
}

async function elevationAround(lat: number, lon: number): Promise<number[]> {
  try {
    const offsets = [-0.03, -0.015, 0, 0.015, 0.03];
    const pts: string[] = [];
    for (const dx of offsets)
      for (const dy of offsets)
        pts.push(`${(lat + dx).toFixed(5)},${(lon + dy).toFixed(5)}`);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${pts.join("|")}`,
      { signal: controller.signal },
    );
    clearTimeout(id);
    if (!res.ok) throw new Error("Elevation failed");
    const json = await res.json();
    return (json?.results || []).map((r: any) => r.elevation as number);
  } catch {
    return [];
  }
}

async function overpassCounts(
  lat: number,
  lon: number,
): Promise<{ cliff: number; quarry: number; cutting: number }> {
  try {
    const q = `[
      out:json][timeout:25];(
        node["natural"="cliff"](around:2500,${lat},${lon});
        way["natural"="cliff"](around:2500,${lat},${lon});
        relation["natural"="cliff"](around:2500,${lat},${lon});
        node["landuse"="quarry"](around:4000,${lat},${lon});
        way["landuse"="quarry"](around:4000,${lat},${lon});
        way["man_made"="cutting"](around:2500,${lat},${lon});
      );out body;`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 9000);
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: q,
      headers: { "Content-Type": "text/plain" },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) throw new Error("Overpass failed");
    const json = await res.json();
    let cliff = 0,
      quarry = 0,
      cutting = 0;
    for (const el of json?.elements || []) {
      const t = el.tags || {};
      if (t.natural === "cliff") cliff++;
      if (t.landuse === "quarry") quarry++;
      if (t.man_made === "cutting") cutting++;
    }
    return { cliff, quarry, cutting };
  } catch {
    return { cliff: 0, quarry: 0, cutting: 0 };
  }
}

function slopeFromElevations(elev: number[]): {
  slopePct: number;
  elevAvg: number;
  roughness: number;
} {
  if (!elev.length) return { slopePct: 0, elevAvg: 0, roughness: 0 };
  const elevAvg = elev.reduce((a, b) => a + b, 0) / elev.length;
  const min = Math.min(...elev),
    max = Math.max(...elev);
  const delta = max - min; // meters across ~6km span (approx)
  const spanMeters = 6000; // rough grid span
  const slope = (delta / spanMeters) * 100; // % grade
  const slopePct = Math.max(0, Math.min(100, slope * 4)); // amplify modest slopes, avoid saturation
  const variance =
    elev.reduce((acc, v) => acc + Math.pow(v - elevAvg, 2), 0) / elev.length;
  const std = Math.sqrt(variance);
  const roughness = Math.max(0, Math.min(100, (std / 80) * 100)); // 80m std => 100
  return { slopePct, elevAvg, roughness };
}

async function rainfall(lat: number, lon: number): Promise<{ rain24: number; rain72: number }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&past_days=3&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) return { rain24: 0, rain72: 0 };
  const json = await res.json();
  const hours: string[] = json?.hourly?.time || [];
  const prec: number[] = json?.hourly?.precipitation || [];
  if (!hours.length || !prec.length) return { rain24: 0, rain72: 0 };
  const now = Date.now();
  let rain24 = 0, rain72 = 0;
  for (let i = 0; i < hours.length; i++) {
    const t = new Date(hours[i]).getTime();
    const deltaH = (now - t) / (1000 * 60 * 60);
    if (deltaH >= 0 && deltaH <= 24) rain24 += prec[i] || 0;
    if (deltaH >= 0 && deltaH <= 72) rain72 += prec[i] || 0;
  }
  return { rain24, rain72 };
}

export default function SitePredictor({
  onStats,
  onLocation,
}: {
  onStats: (s: SiteStats) => void;
  onLocation?: (name: string) => void;
}) {
  const [query, setQuery] = useState("Chhattisgarh, India");
  const [geo, setGeo] = useState<Geo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<{
    slopePct: number;
    elevAvg: number;
    roughness: number;
    cliff: number;
    quarry: number;
    cutting: number;
  } | null>(null);
  const [weightSlope, setWeightSlope] = useState(0.45);
  const [weightCliff, setWeightCliff] = useState(0.3);
  const [weightQuarry, setWeightQuarry] = useState(0.15);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const g = await geocode(query.trim());
      if (!g) {
        setError("Location not found");
        setGeo(null);
        setLast(null);
        return;
      }
      setGeo(g);
      const pretty = `${g.name}${g.admin1 ? ", " + g.admin1 : ""}${g.country ? ", " + g.country : ""}`;
      onLocation?.(pretty);
      const [elevs, osm] = await Promise.all([
        elevationAround(g.lat, g.lon),
        overpassCounts(g.lat, g.lon),
      ]);
      const { slopePct, elevAvg, roughness } = slopeFromElevations(elevs);
      const cliff = osm.cliff;
      const quarry = osm.quarry;
      const cutting = osm.cutting;
      const slopeScore = Math.min(100, slopePct);
      const geomFactor = Math.min(100, cliff * 6 + cutting * 4);
      const miningFactor = Math.min(100, quarry * 12);
      const roughnessFactor = Math.min(100, roughness);
      const hazard = Math.min(
        100,
        Math.round(
          5 +
            weightSlope * slopeScore +
            weightCliff * geomFactor +
            weightQuarry * miningFactor +
            0.1 * roughnessFactor,
        ),
      );
      const activeRocks = Math.round(
        cliff * 0.7 + cutting * 0.5 + quarry * 0.6,
      );
      const velocityAvg = Math.round((slopeScore / 100) * 6 * 10) / 10;
      const confidence = Math.min(
        100,
        35 +
          (elevs.length ? 25 : 0) +
          Math.min(40, (cliff + quarry + cutting) * 4) +
          Math.min(10, Math.round(roughnessFactor / 10)),
      );
      setLast({ slopePct, elevAvg, roughness, cliff, quarry, cutting });
      onStats({ hazardIndex: hazard, velocityAvg, activeRocks, confidence });
    } catch (e: any) {
      setError(e?.message || "Failed to predict");
    } finally {
      setLoading(false);
    }
  }, [query, onStats, weightSlope, weightCliff, weightQuarry]);

  const subtitle = useMemo(() => {
    if (!geo) return "Enter a location (e.g., Chhattisgarh, India)";
    return `${geo.name}${geo.admin1 ? ", " + geo.admin1 : ""}${geo.country ? ", " + geo.country : ""}`;
  }, [geo]);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Mine Location Scenario</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="secondary">Scenario</Badge>
      </div>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) run();
          }}
          placeholder="Chhattisgarh, India"
        />
        <Button onClick={run} disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Avg Elevation</p>
          <p className="text-lg font-semibold">
            {last ? Math.round(last.elevAvg) + " m" : "--"}
          </p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Slope Index</p>
          <p className="text-lg font-semibold">
            {last ? Math.round(last.slopePct) + "%" : "--"}
          </p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Cliff/Cut Features</p>
          <p className="text-lg font-semibold">
            {last ? last.cliff + last.cutting : "--"}
          </p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Quarries Nearby</p>
          <p className="text-lg font-semibold">{last ? last.quarry : "--"}</p>
        </div>
      </div>

      <div className="pt-2 border-t space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Model Weights
        </p>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Slope ({Math.round(weightSlope * 100)}%)
          </p>
          <Slider
            value={[weightSlope]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(v) => setWeightSlope(v[0] ?? 0.55)}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Cliffs/Cuttings ({Math.round(weightCliff * 100)}%)
          </p>
          <Slider
            value={[weightCliff]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(v) => setWeightCliff(v[0] ?? 0.3)}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Quarries ({Math.round(weightQuarry * 100)}%)
          </p>
          <Slider
            value={[weightQuarry]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(v) => setWeightQuarry(v[0] ?? 0.15)}
          />
        </div>
      </div>
    </Card>
  );
}
