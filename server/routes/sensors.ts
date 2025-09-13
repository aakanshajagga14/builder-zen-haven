import { RequestHandler } from "express";
import type { HardwareReading, SensorsLatestResponse } from "@shared/api";

let lastReading: HardwareReading | null = null;
let lastAt = 0;

function sample(): HardwareReading {
  const now = new Date().toISOString();
  return {
    accel_x: 0,
    accel_y: 0,
    accel_z: 1,
    gyro_x: 0,
    gyro_y: 0,
    gyro_z: 0,
    temperature_bme: 24 + Math.random() * 3,
    temperature_mpu: 30 + Math.random() * 2,
    humidity: 45 + Math.random() * 20,
    pressure: 1000 + Math.random() * 20,
    altitude: 250 + Math.random() * 10,
    rain_detected: Math.random() < 0.1 ? 1 : 0,
    soil_moisture_wet: Math.random() < 0.15 ? 1 : 0,
    vibration_detected: Math.random() < 0.2 ? 1 : 0,
    timestamp: now,
  };
}

export const getSensorsLatest: RequestHandler = (_req, res) => {
  const now = Date.now();
  const connected = lastReading != null && now - lastAt < 30_000;
  const reading = connected ? (lastReading as HardwareReading) : sample();
  const payload: SensorsLatestResponse = { connected, reading };
  res.json(payload);
};

export const postSensorsLatest: RequestHandler = (req, res) => {
  const body = req.body as Partial<HardwareReading>;
  const nowIso = new Date().toISOString();
  lastReading = {
    accel_x: body.accel_x ?? null,
    accel_y: body.accel_y ?? null,
    accel_z: body.accel_z ?? null,
    gyro_x: body.gyro_x ?? null,
    gyro_y: body.gyro_y ?? null,
    gyro_z: body.gyro_z ?? null,
    temperature_bme: body.temperature_bme ?? null,
    temperature_mpu: body.temperature_mpu ?? null,
    humidity: body.humidity ?? null,
    pressure: body.pressure ?? null,
    altitude: body.altitude ?? null,
    rain_detected: (body.rain_detected as any) ?? null,
    soil_moisture_wet: (body.soil_moisture_wet as any) ?? null,
    vibration_detected: (body.vibration_detected as any) ?? null,
    timestamp: body.timestamp ?? nowIso,
  };
  lastAt = Date.now();
  res.status(201).json({ ok: true });
};
