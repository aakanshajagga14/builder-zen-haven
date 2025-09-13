/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type HardwareReading = {
  accel_x: number | null;
  accel_y: number | null;
  accel_z: number | null;
  gyro_x: number | null;
  gyro_y: number | null;
  gyro_z: number | null;
  temperature_bme: number | null;
  temperature_mpu: number | null;
  humidity: number | null;
  pressure: number | null;
  altitude: number | null;
  rain_detected: 0 | 1 | null;
  soil_moisture_wet: 0 | 1 | null;
  vibration_detected: 0 | 1 | null;
  timestamp: string | null;
};

export type SensorsLatestResponse = {
  connected: boolean;
  reading: HardwareReading;
};
