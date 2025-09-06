import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

export default function ControlsPanel({ running, setRunning, showWireframe, setShowWireframe, showHeatmap, setShowHeatmap, showPit, setShowPit, showTunnels, setShowTunnels, showStructures, setShowStructures, showHills, setShowHills, hilliness, setHilliness, }: {
  running: boolean;
  setRunning: (v: boolean) => void;
  showWireframe: boolean;
  setShowWireframe: (v: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (v: boolean) => void;
  showPit: boolean;
  setShowPit: (v: boolean) => void;
  showTunnels: boolean;
  setShowTunnels: (v: boolean) => void;
  showStructures: boolean;
  setShowStructures: (v: boolean) => void;
  showHills: boolean;
  setShowHills: (v: boolean) => void;
  hilliness: number;
  setHilliness: (v: number) => void;
}) {
  const [heatmapIntensity, setHeatmapIntensity] = useState(60);

  useEffect(() => {
    document.documentElement.style.setProperty("--heatmap-intensity", `${heatmapIntensity}`);
  }, [heatmapIntensity]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Simulation</p>
          <p className="text-xs text-muted-foreground">Generate realtime rockfall events</p>
        </div>
        <Button variant={running ? "destructive" : "default"} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">AR Wireframe</p>
          <p className="text-xs text-muted-foreground">Show terrain mesh edges</p>
        </div>
        <Switch checked={showWireframe} onCheckedChange={setShowWireframe} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Heatmap Overlay</p>
          <p className="text-xs text-muted-foreground">Highlight high-risk zones</p>
        </div>
        <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
      </div>

      <div>
        <p className="text-sm font-medium">Heatmap Intensity</p>
        <Slider value={[heatmapIntensity]} max={100} step={1} onValueChange={(v) => setHeatmapIntensity(v[0] ?? 60)} />
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Mine Features</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Open-Pit Benches</p>
            <p className="text-xs text-muted-foreground">Terraced slopes + haul ramp</p>
          </div>
          <Switch checked={showPit} onCheckedChange={setShowPit} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Tunnels / Adits</p>
            <p className="text-xs text-muted-foreground">Underground entries in hillside</p>
          </div>
          <Switch checked={showTunnels} onCheckedChange={setShowTunnels} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Surface Structures</p>
            <p className="text-xs text-muted-foreground">Silo, headframe, buildings</p>
          </div>
          <Switch checked={showStructures} onCheckedChange={setShowStructures} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Surrounding Hills & Slopes</p>
            <p className="text-xs text-muted-foreground">Context terrain around the pit</p>
          </div>
          <Switch checked={showHills} onCheckedChange={setShowHills} />
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium">Hilliness</p>
          <Slider value={[hilliness]} max={100} step={1} onValueChange={(v) => setHilliness(v[0] ?? 50)} />
        </div>
      </div>
    </Card>
  );
}
