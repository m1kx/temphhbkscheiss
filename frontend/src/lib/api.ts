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

export interface AccessLogEntry {
  id: string
  timestamp: string
  labels: string[]
  count: number
  image: string
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

export async function fetchAccessLogs(limit = 100): Promise<AccessLogEntry[]> {
  const res = await fetch(`/access-logs?limit=${limit}`)
  if (!res.ok) throw new Error(`Access logs error: ${res.status}`)
  return res.json()
}

export async function deleteAccessLog(id: string): Promise<void> {
  const res = await fetch(`/access-logs/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error(`Delete log error: ${res.status}`)
}

export async function clearAccessLogs(): Promise<void> {
  const res = await fetch("/access-logs", { method: "DELETE" })
  if (!res.ok) throw new Error(`Clear logs error: ${res.status}`)
}

export function accessLogImageUrl(id: string): string {
  return `/access-logs/${id}/image`
}

export const VIDEO_FEED_URL = "/video_feed"

export function snapshotUrl(): string {
  return `/snapshot?t=${Date.now()}`
}
