import { useCallback, useEffect, useRef, useState } from "react"
import { type SensorReading, fetchReading } from "@/lib/api"

const POLL_INTERVAL = 10_000

interface UseSensorDataReturn {
  data: SensorReading | null
  error: string | null
  loading: boolean
  refresh: () => void
}

export function useSensorData(): UseSensorDataReturn {
  const [data, setData] = useState<SensorReading | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const reading = await fetchReading()
      if (reading.success) {
        setData(reading)
        setError(null)
      } else {
        setError(reading.error ?? "Sensor read failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error")
    } finally {
      setLoading(false)
    }
  }, [])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(load, POLL_INTERVAL)
  }, [load])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    load()
    startPolling()

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        load()
        startPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      stopPolling()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [load, startPolling, stopPolling])

  return { data, error, loading, refresh: load }
}
