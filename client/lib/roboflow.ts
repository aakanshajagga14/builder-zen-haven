export type RFBox = { x: number; y: number; width: number; height: number; class: string; confidence: number };
export type RFResult = { predictions: RFBox[] };

export async function inferImageBlob(blob: Blob, modelId: string, apiKey?: string): Promise<RFResult> {
  const key = apiKey || import.meta.env.VITE_ROBOFLOW_API_KEY;
  if (!key) throw new Error("Missing VITE_ROBOFLOW_API_KEY");
  const url = `https://detect.roboflow.com/${modelId}?api_key=${encodeURIComponent(key)}&format=json`;
  const res = await fetch(url, { method: "POST", body: blob });
  if (!res.ok) throw new Error(`Roboflow error ${res.status}`);
  const json = await res.json();
  return json as RFResult;
}
