import { useCallback, useEffect, useRef, useState } from "react"
import {
  type AccessLogEntry,
  fetchAccessLogs,
  deleteAccessLog,
  clearAccessLogs,
} from "@/lib/api"

const POLL_INTERVAL = 5_000

export function useAccessLogs() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setLogs(await fetchAccessLogs())
    } catch {
      /* keep stale data visible */
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteAccessLog(id)
    setLogs((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearAll = useCallback(async () => {
    await clearAccessLogs()
    setLogs([])
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

  return { logs, loading, refresh: load, remove, clearAll }
}
