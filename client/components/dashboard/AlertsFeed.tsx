import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type AlertItem = {
  id: number;
  level: "info" | "warning" | "critical";
  message: string;
  time: number;
};

export default function AlertsFeed({
  hazard,
  enabled = true,
  minIntervalSec = 20,
  activeRocks = 0,
  site,
}: {
  hazard: number;
  enabled?: boolean;
  minIntervalSec?: number;
  activeRocks?: number;
  site?: string;
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const lastId = useRef(0);
  const lastAlertAt = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const tick = setInterval(() => {
      const now = Date.now();
      const cooldown = (minIntervalSec ?? 20) * 1000;
      if (now - lastAlertAt.current < cooldown) return;
      const p = Math.min(0.95, Math.pow(hazard / 100, 2));
      if (Math.random() < p) {
        lastAlertAt.current = now;
        const id = ++lastId.current;
        const level: AlertItem["level"] = hazard >= 85 ? "critical" : hazard >= 60 ? "warning" : "info";
        const base =
          level === "critical"
            ? `Critical rockfall risk (${Math.round(hazard)}%).`
            : level === "warning"
              ? `Elevated rockfall risk (${Math.round(hazard)}%).`
              : `Minor activity (${Math.round(hazard)}%).`;
        const where = site ? ` at ${site}` : "";
        const withSite = `${base}${where}`.trim();
        const fullMessage = activeRocks ? `${withSite} • Active rocks: ${activeRocks}.` : withSite;
        setAlerts((prev) => [
          { id, level, message: fullMessage, time: now },
          ...prev,
        ].slice(0, 10));
        toast(fullMessage, {
          description: new Date(now).toLocaleTimeString(),
          className:
            level === "critical"
              ? "bg-destructive text-destructive-foreground"
              : "",
        });
      }
    }, 2000);
    return () => clearInterval(tick);
  }, [hazard, activeRocks, enabled, minIntervalSec]);

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
            <div
              key={a.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border p-2"
            >
              <div>
                <p className="text-sm font-medium">{a.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.time).toLocaleTimeString()}
                </p>
              </div>
              <Badge
                variant={
                  a.level === "critical"
                    ? "destructive"
                    : a.level === "warning"
                      ? "default"
                      : "secondary"
                }
              >
                {a.level}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
