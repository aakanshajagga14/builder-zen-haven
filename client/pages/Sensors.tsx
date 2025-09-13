import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { HardwareReading, SensorsLatestResponse } from "@shared/api";

const sensors = [
  { key: "rain", name: "Rain Sensor", desc: "Measures rainfall to correlate with slope instability and flooding risk." },
  { key: "soil-moisture", name: "Soil Moisture Sensor", desc: "Tracks water content in soil to anticipate landslides and slope failures." },
  { key: "sw420", name: "SW-420 Vibration Sensor", desc: "Detects vibrations indicative of rockfall, blasting, or ground movement." },
  { key: "mpu6050", name: "MPU6050: Motion Tracking Sensor", desc: "6‑axis IMU for motion/orientation sensing on equipment or structures." },
  { key: "bme280", name: "BME280 Environmental Sensor", desc: "Temperature, humidity, and pressure for environmental context and gas risk." },
] as const;

function computeHazard(r: HardwareReading | null): number {
  if (!r) return 0;
  let h = 10;
  if (r.rain_detected) h += 25;
  if (r.soil_moisture_wet) h += 20;
  if (r.vibration_detected) h += 30;
  const ax = r.accel_x ?? 0, ay = r.accel_y ?? 0, az = r.accel_z ?? 0;
  const accelMag = Math.sqrt(ax * ax + ay * ay + az * az);
  h += Math.min(20, Math.max(0, (accelMag - 1) * 10));
  const gyroMag = Math.sqrt((r.gyro_x ?? 0) ** 2 + (r.gyro_y ?? 0) ** 2 + (r.gyro_z ?? 0) ** 2);
  h += Math.min(10, gyroMag / 50);
  if ((r.humidity ?? 0) > 70) h += 5;
  return Math.max(0, Math.min(100, Math.round(h)));
}

export default function SensorsPage() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [reading, setReading] = useState<HardwareReading | null>(null);
  const timerRef = useRef<number | null>(null);

  const hazard = useMemo(() => computeHazard(reading), [reading]);

  const fetchLatest = async () => {
    try {
      const res = await fetch("/api/sensors/latest");
      const json = (await res.json()) as SensorsLatestResponse;
      setConnected(Boolean(json.connected));
      setReading(json.reading);
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const toggle = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      setConnected(false);
      return;
    }
    fetchLatest();
    timerRef.current = window.setInterval(fetchLatest, 3000) as unknown as number;
  };

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Connect Sensors</h1>
          <p className="text-sm text-muted-foreground">POST your device payloads to /api/sensors/latest (JSON). This page polls every 3s and computes rockfall risk from rain, soil moisture, vibration and IMU motion.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={toggle}>{timerRef.current ? "Disconnect" : "Connect"}</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Connection</p>
            <p className="text-xs text-muted-foreground">Status: {connected || timerRef.current ? "Connected" : "Disconnected"}</p>
            <p className="text-xs text-muted-foreground">Updated: {reading?.timestamp || "--"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Predicted Rockfall Risk</p>
            <p className="text-2xl font-extrabold">{hazard}%</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensors.map((s) => (
          <Card key={s.key} className="p-4">
            <div className="flex items-center justify-start mb-2">
              <p className="text-base font-medium">{s.name}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
            {s.key === "rain" && (
              <p className="text-sm">Rain detected: <span className="font-semibold">{reading?.rain_detected ? "Yes" : "No"}</span></p>
            )}
            {s.key === "soil-moisture" && (
              <p className="text-sm">Soil moisture wet: <span className="font-semibold">{reading?.soil_moisture_wet ? "Yes" : "No"}</span></p>
            )}
            {s.key === "sw420" && (
              <p className="text-sm">Vibration detected: <span className="font-semibold">{reading?.vibration_detected ? "Yes" : "No"}</span></p>
            )}
            {s.key === "mpu6050" && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-muted-foreground">Accel X</p><p className="font-medium">{reading?.accel_x ?? "--"}</p></div>
                <div><p className="text-muted-foreground">Accel Y</p><p className="font-medium">{reading?.accel_y ?? "--"}</p></div>
                <div><p className="text-muted-foreground">Accel Z</p><p className="font-medium">{reading?.accel_z ?? "--"}</p></div>
                <div><p className="text-muted-foreground">Gyro X</p><p className="font-medium">{reading?.gyro_x ?? "--"}</p></div>
                <div><p className="text-muted-foreground">Gyro Y</p><p className="font-medium">{reading?.gyro_y ?? "--"}</p></div>
                <div><p className="text-muted-foreground">Gyro Z</p><p className="font-medium">{reading?.gyro_z ?? "--"}</p></div>
              </div>
            )}
            {s.key === "bme280" && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-muted-foreground">Temp</p><p className="font-medium">{reading?.temperature_bme != null ? `${reading.temperature_bme.toFixed(1)}°C` : "--"}</p></div>
                <div><p className="text-muted-foreground">Humidity</p><p className="font-medium">{reading?.humidity != null ? `${reading.humidity.toFixed(0)}%` : "--"}</p></div>
                <div><p className="text-muted-foreground">Pressure</p><p className="font-medium">{reading?.pressure != null ? `${reading.pressure.toFixed(0)} hPa` : "--"}</p></div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <p className="text-sm font-medium mb-1">How it works</p>
        <p className="text-sm text-muted-foreground">Your device POSTs JSON (accel/gyro/rain/moisture/vibration, etc.) to /api/sensors/latest. The app polls that endpoint and computes a risk score combining rain, moisture and vibration, plus IMU motion. This feeds the dashboard and alerts.</p>
      </Card>
    </div>
  );
}
