import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

export default function ControlsPanel({ running, setRunning, showWireframe, setShowWireframe, showHeatmap, setShowHeatmap }: {
  running: boolean;
  setRunning: (v: boolean) => void;
  showWireframe: boolean;
  setShowWireframe: (v: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (v: boolean) => void;
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
    </Card>
  );
}
