export interface SensorReading {
  success: boolean
  temperature_celsius: number
  temperature_fahrenheit: number
  humidity_percent: number
  timestamp: string
  error?: string
}

export interface DetectionStatus {
  faces: boolean
  objects: boolean
}

export interface HealthStatus {
  status: string
  timestamp: string
}

export async function fetchReading(): Promise<SensorReading> {
  const res = await fetch("/reading")
  if (!res.ok) throw new Error(`Sensor error: ${res.status}`)
  return res.json()
}

export async function fetchDetectionStatus(): Promise<DetectionStatus> {
  const res = await fetch("/detection/status")
  if (!res.ok) throw new Error(`Detection status error: ${res.status}`)
  return res.json()
}

export async function toggleDetection(
  updates: Partial<DetectionStatus>,
): Promise<DetectionStatus> {
  const res = await fetch("/detection/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(`Toggle error: ${res.status}`)
  return res.json()
}

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch("/health")
  if (!res.ok) throw new Error(`Health error: ${res.status}`)
  return res.json()
}

export const VIDEO_FEED_URL = "/video_feed"

export function snapshotUrl(): string {
  return `/snapshot?t=${Date.now()}`
}
