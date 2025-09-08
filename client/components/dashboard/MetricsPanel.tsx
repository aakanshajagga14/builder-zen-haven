import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type MetricSnapshot = {
  t: number;
  hazard: number;
  velocity: number;
};

export default function MetricsPanel({
  hazard,
  velocityAvg,
  activeRocks,
  confidence,
}: {
  hazard: number;
  velocityAvg: number;
  activeRocks: number;
  confidence: number;
}) {
  const [series, setSeries] = useState<MetricSnapshot[]>([]);

  useEffect(() => {
    const now = Date.now();
    setSeries((prev) => [
      ...prev.slice(-120),
      { t: now, hazard, velocity: velocityAvg },
    ]);
  }, [hazard, velocityAvg]);

  const chartData = useMemo(
    () =>
      series.map((d) => ({
        time: new Date(d.t).toLocaleTimeString([], {
          minute: "2-digit",
          second: "2-digit",
        }),
        hazard: Math.round(d.hazard),
        velocity: Math.round(d.velocity * 10),
      })),
    [series],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <p className="text-xs text-muted-foreground">Rockfall Probability</p>
        <div className="mt-2 flex items-end gap-2">
          <span
            className={cn(
              "text-3xl font-bold",
              hazard > 70
                ? "text-destructive"
                : hazard > 40
                  ? "text-warning-foreground"
                  : "text-brand",
            )}
          >
            {Math.round(hazard)}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-brand to-cyan-400"
              style={{ width: `${Math.min(100, hazard)}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground">Avg Rock Velocity</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">
            {velocityAvg.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">m/s</span>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground">Active Rockfall</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">
            {activeRocks}
          </span>
          <span className="text-xs text-muted-foreground">tracked</span>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground">Model Confidence</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">
            {Math.round(confidence)}%
          </span>
        </div>
      </Card>

      <Card className="col-span-1 md:col-span-4 p-2">
        <ChartContainer
          className="h-56"
          config={{
            hazard: { label: "Probability", color: "var(--color-hazard, #22c55e)" },
            velocity: {
              label: "Velocity x10",
              color: "var(--color-velocity, #06b6d4)",
            },
          }}
        >
          <AreaChart
            data={chartData}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis hide domain={[0, 100]} />
            <Area
              type="monotone"
              dataKey="hazard"
              stroke="hsl(var(--brand))"
              fill="hsl(var(--brand))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="velocity"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.12}
              strokeWidth={2}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          </AreaChart>
        </ChartContainer>
      </Card>
    </div>
  );
}
