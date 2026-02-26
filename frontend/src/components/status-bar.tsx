import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

type ConnectionState = "online" | "loading" | "error"

interface StatusBarProps {
  state: ConnectionState
  timestamp: string | null
  error: string | null
  loading: boolean
  onRefresh: () => void
}

function stateConfig(state: ConnectionState) {
  switch (state) {
    case "online":
      return {
        dotClass: "bg-success shadow-[0_0_8px_var(--success)]",
        label: "Sensor online",
        Icon: Wifi,
      }
    case "loading":
      return {
        dotClass: "bg-muted-foreground animate-pulse",
        label: "Connecting…",
        Icon: Wifi,
      }
    case "error":
      return {
        dotClass: "bg-destructive shadow-[0_0_8px_var(--destructive)]",
        label: "Connection error",
        Icon: WifiOff,
      }
  }
}

export function StatusBar({
  state,
  timestamp,
  error,
  loading,
  onRefresh,
}: StatusBarProps) {
  const { dotClass, label, Icon } = stateConfig(state)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-xl bg-card/80 border border-border/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          {timestamp && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              &middot; {timestamp}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="gap-1.5 text-muted-foreground"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
