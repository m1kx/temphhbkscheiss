import { Droplets, Thermometer } from "lucide-react"
import { Header } from "@/components/header"
import { CameraFeed } from "@/components/camera-feed"
import { StreamControls } from "@/components/stream-controls"
import { SensorCard } from "@/components/sensor-card"
import { StatusBar } from "@/components/status-bar"
import { AccessLog } from "@/components/access-log"
import { useSensorData } from "@/hooks/use-sensor-data"
import { useDetectionStatus } from "@/hooks/use-detection-status"
import { useStream } from "@/hooks/use-stream"
import { useAccessLogs } from "@/hooks/use-access-logs"

export function Dashboard() {
  const { data, error, loading, refresh } = useSensorData()
  const { status: detection, toggling, toggle } = useDetectionStatus()
  const { playing, streamUrl, toggleStream } = useStream()
  const accessLogs = useAccessLogs()

  const connectionState = loading && !data
    ? "loading" as const
    : error
      ? "error" as const
      : "online" as const

  const tempC = data?.temperature_celsius?.toFixed(1) ?? "—"
  const tempF = data?.temperature_fahrenheit?.toFixed(1) ?? "—"
  const humidity = data?.humidity_percent?.toFixed(1) ?? "—"

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(74,224,255,0.04),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(255,107,74,0.04),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <CameraFeed streamUrl={streamUrl} playing={playing} />
            <StreamControls
              playing={playing}
              onToggleStream={toggleStream}
              detectionStatus={detection}
              onToggleDetection={toggle}
              detectionToggling={toggling}
            />
          </div>

          <div className="space-y-4">
            <SensorCard
              icon={Thermometer}
              label="Temperature"
              value={tempC}
              unit="°C"
              subtitle={data ? `${tempF} °F` : undefined}
              accentClass="text-temp"
            />
            <SensorCard
              icon={Droplets}
              label="Humidity"
              value={humidity}
              unit="%"
              subtitle="Relative humidity"
              accentClass="text-humid"
            />
          </div>
        </div>

        <div className="mt-4">
          <AccessLog
            logs={accessLogs.logs}
            loading={accessLogs.loading}
            onRefresh={accessLogs.refresh}
            onDelete={accessLogs.remove}
            onClearAll={accessLogs.clearAll}
          />
        </div>

        <div className="mt-4">
          <StatusBar
            state={connectionState}
            timestamp={data?.timestamp ?? null}
            error={error}
            loading={loading}
            onRefresh={refresh}
          />
        </div>
      </div>
    </div>
  )
}
