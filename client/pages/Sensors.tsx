import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const sensors = [
  {
    key: "rain",
    name: "Rain Sensor",
    desc: "Measures rainfall to correlate with slope instability and flooding risk.",
    tags: ["Precipitation", "Hydrology"],
  },
  {
    key: "soil-moisture",
    name: "Soil Moisture Sensor",
    desc: "Tracks water content in soil to anticipate landslides and slope failures.",
    tags: ["Soil", "Landslide"],
  },
  {
    key: "sw420",
    name: "SW-420 Vibration Sensor",
    desc: "Detects vibrations indicative of rockfall, blasting, or ground movement.",
    tags: ["Vibration", "Rockfall"],
  },
  {
    key: "mpu6050",
    name: "MPU6050: Motion Tracking Sensor",
    desc: "6‑axis IMU for motion/orientation sensing on equipment or structures.",
    tags: ["IMU", "Motion"],
  },
  {
    key: "bme280",
    name: "BME280 Environmental Sensor",
    desc: "Temperature, humidity, and pressure for environmental context and gas risk.",
    tags: ["Env", "Pressure"],
  },
] as const;

export default function SensorsPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Connect Sensors</h1>
          <p className="text-sm text-muted-foreground">
            Select a sensor to connect and stream data into the dashboard.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensors.map((s) => (
          <Card key={s.key} className="p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium">{s.name}</p>
                <div className="flex gap-1">
                  {s.tags.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/settings")}>Configure</Button>
              <Button onClick={() => navigate(`/sensors/${s.key}`)}>Connect</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
