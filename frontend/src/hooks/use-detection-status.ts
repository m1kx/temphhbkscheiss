import { useCallback, useEffect, useState } from "react"
import {
  type DetectionStatus,
  fetchDetectionStatus,
  toggleDetection,
} from "@/lib/api"

interface UseDetectionStatusReturn {
  status: DetectionStatus
  toggling: boolean
  toggle: (key: keyof DetectionStatus) => void
}

export function useDetectionStatus(): UseDetectionStatusReturn {
  const [status, setStatus] = useState<DetectionStatus>({
    faces: false,
    objects: false,
  })
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchDetectionStatus()
      .then(setStatus)
      .catch(() => {})
  }, [])

  const toggle = useCallback(
    async (key: keyof DetectionStatus) => {
      setToggling(true)
      try {
        const updated = await toggleDetection({ [key]: !status[key] })
        setStatus(updated)
      } catch {
        // revert optimistic if needed
      } finally {
        setToggling(false)
      }
    },
    [status],
  )

  return { status, toggling, toggle }
}
