import { Activity } from "lucide-react"

export function Header() {
  return (
    <header className="flex items-center gap-3 py-6">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-temp/20 to-humid/20 border border-temp/20">
        <Activity className="w-5 h-5 text-temp" />
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Pi Monitor
        </h1>
        <p className="text-sm text-muted-foreground">
          Raspberry Pi 4 &middot; DHT22 &middot; Camera
        </p>
      </div>
    </header>
  )
}
