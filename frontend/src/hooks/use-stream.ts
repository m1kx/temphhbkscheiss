import { useCallback, useEffect, useState } from "react"
import { VIDEO_FEED_URL } from "@/lib/api"

interface UseStreamReturn {
  playing: boolean
  streamUrl: string | null
  toggleStream: () => void
}

export function useStream(): UseStreamReturn {
  const [playing, setPlaying] = useState(true)

  const streamUrl = playing ? VIDEO_FEED_URL : null

  const toggleStream = useCallback(() => {
    setPlaying((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setPlaying(false)
      } else {
        setPlaying(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  return { playing, streamUrl, toggleStream }
}
