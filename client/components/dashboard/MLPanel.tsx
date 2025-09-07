import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { inferImageBlob, RFBox } from "@/lib/roboflow";

export type MLStats = {
  hazardIndex: number;
  velocityAvg: number;
  activeRocks: number;
  confidence: number;
};

export default function MLPanel({
  onStats,
  onEnabledChange,
}: {
  onStats: (s: MLStats) => void;
  onEnabledChange?: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [classesStr, setClassesStr] = useState("rock, rockfall, falling_rock");
  const [fps, setFps] = useState(2);
  const [confThresh, setConfThresh] = useState(0.6);
  const [smoothAlpha, setSmoothAlpha] = useState(0.35); // EMA factor
  const [status, setStatus] = useState<string>("Idle");
  const [modelId, setModelId] = useState("object-detection-fbtj0/2");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastCentersRef = useRef<{ x: number; y: number }[]>([]);
  const lastTsRef = useRef<number>(0);
  const prevStatsRef = useRef<MLStats>({ hazardIndex: 0, velocityAvg: 0, activeRocks: 0, confidence: 50 });

  const classes = useMemo(
    () =>
      classesStr
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    [classesStr],
  );

  const start = useCallback(async () => {
    try {
      setStatus("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("Running inference");
      lastCentersRef.current = [];
      lastTsRef.current = 0;
    } catch (e: any) {
      setStatus(e?.message || "Camera error");
      setEnabled(false);
    }
  }, []);

  const stop = useCallback(() => {
    const v = videoRef.current;
    const stream = v && (v.srcObject as MediaStream);
    stream?.getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
    setStatus("Stopped");
  }, []);

  useEffect(() => {
    if (enabled) start();
    else stop();
    onEnabledChange?.(enabled);
    return () => stop();
  }, [enabled, start, stop, onEnabledChange]);

  useEffect(() => {
    let raf = 0;
    const tick = async () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!enabled || !v || !c || v.readyState < 2) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      const minDt = 1000 / Math.max(1, fps);
      if (now - lastTsRef.current < minDt) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastTsRef.current = now;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const blob = await new Promise<Blob | null>((res) =>
        c.toBlob((b) => res(b), "image/jpeg", 0.85),
      );
      if (!blob) {
        raf = requestAnimationFrame(tick);
        return;
      }
      try {
        const out = await inferImageBlob(blob, modelId);
        const preds: RFBox[] = (out?.predictions || [])
          .filter((p) => p.confidence >= confThresh)
          .filter((p) => classes.length === 0 || classes.includes(p.class.toLowerCase()));
        const centers = preds.map((p) => ({ x: p.x, y: p.y }));
        // naive match: nearest previous center
        let totalDisp = 0;
        centers.forEach((c1) => {
          let best = Infinity;
          let jBest = -1;
          lastCentersRef.current.forEach((c0, j) => {
            const d = Math.hypot(c1.x - c0.x, c1.y - c0.y);
            if (d < best) {
              best = d;
              jBest = j;
            }
          });
          if (jBest >= 0) totalDisp += best;
        });
        const pxPerSec = (totalDisp / Math.max(1, centers.length)) * fps;
        const rawVelocity = isFinite(pxPerSec) ? pxPerSec / 100 : 0;
        const rawActive = preds.length;
        const rawConf = preds.length ? preds.reduce((s, p) => s + p.confidence, 0) / preds.length : 0;

        const prev = prevStatsRef.current;
        const a = Math.min(0.95, Math.max(0.05, smoothAlpha));
        const velocityAvg = prev.velocityAvg + a * (rawVelocity - prev.velocityAvg);
        const activeRocks = prev.activeRocks + a * (rawActive - prev.activeRocks);
        const confidence = prev.confidence + a * ((rawConf * 100) - prev.confidence);

        const hazardTarget = Math.min(100, Math.max(0, activeRocks * 10 + (confidence / 100) * 40 + velocityAvg * 20));
        const maxDeltaPerSec = 10;
        const maxStep = maxDeltaPerSec / Math.max(1, fps);
        const hazardIndex = prev.hazardIndex + Math.max(-maxStep, Math.min(maxStep, hazardTarget - prev.hazardIndex));

        const stats = { hazardIndex, velocityAvg, activeRocks, confidence } as MLStats;
        prevStatsRef.current = stats;
        onStats(stats);
        lastCentersRef.current = centers;
        setStatus(`Detections: ${activeRocks}`);
      } catch (e: any) {
        setStatus(e?.message || "Inference error");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, fps, modelId, classes, onStats]);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">ML Inference (Roboflow)</p>
          <p className="text-xs text-muted-foreground">{status}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Model ID</label>
          <Input value={modelId} onChange={(e) => setModelId(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">
            Falling Classes (comma-separated)
          </label>
          <Input
            value={classesStr}
            onChange={(e) => setClassesStr(e.target.value)}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">FPS</p>
          <Slider
            value={[fps]}
            min={1}
            max={8}
            step={1}
            onValueChange={(v) => setFps(v[0] ?? 2)}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Confidence Threshold ({Math.round(confThresh*100)}%)</p>
          <Slider value={[confThresh]} min={0} max={1} step={0.05} onValueChange={(v) => setConfThresh(v[0] ?? 0.6)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Smoothing (EMA α = {smoothAlpha.toFixed(2)})</p>
          <Slider value={[smoothAlpha]} min={0.05} max={0.8} step={0.05} onValueChange={(v) => setSmoothAlpha(v[0] ?? 0.35)} />
        </div>
        <div className="hidden">
          <video ref={videoRef} playsInline muted />
          <canvas ref={canvasRef} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Webcam</Badge>
          <Badge variant="secondary">Serverless</Badge>
        </div>
      </div>
    </Card>
  );
}
