import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type AlertItem = { id: number; level: "info" | "warning" | "critical"; message: string; time: number };

export default function AlertsFeed({ hazard, enabled = true, minIntervalSec = 20 }: { hazard: number; enabled?: boolean; minIntervalSec?: number }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const lastId = useRef(0);
  const lastBucket = useRef<string>("");
  const lastAlertAt = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const bucket = hazard >= 80 ? "critical" : hazard >= 60 ? "warning" : "";
    const now = Date.now();
    const cooldown = (minIntervalSec ?? 20) * 1000;
    if (bucket && bucket !== lastBucket.current && now - lastAlertAt.current >= cooldown) {
      lastBucket.current = bucket;
      lastAlertAt.current = now;
      const id = ++lastId.current;
      const time = now;
      const level = bucket as AlertItem["level"];
      const message = level === "critical" ? `Critical hazard spike detected (${Math.round(hazard)})` : `Elevated hazard level (${Math.round(hazard)})`;
      setAlerts((prev) => [{ id, level, message, time }, ...prev].slice(0, 10));
      toast(message, { description: new Date(time).toLocaleTimeString(), className: level === "critical" ? "bg-destructive text-destructive-foreground" : "" });
    }
  }, [hazard, enabled, minIntervalSec]);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Realtime Alerts</p>
        <Badge variant="secondary">{enabled ? "Live" : "Off"}</Badge>
      </div>
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {alerts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No alerts yet</p>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-2 rounded-md border border-border p-2">
              <div>
                <p className="text-sm font-medium">{a.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleTimeString()}</p>
              </div>
              <Badge variant={a.level === "critical" ? "destructive" : a.level === "warning" ? "default" : "secondary"}>{a.level}</Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
