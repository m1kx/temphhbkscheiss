import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SensorCardProps {
  icon: LucideIcon
  label: string
  value: string
  unit: string
  subtitle?: string
  accentClass: string
}

export function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  subtitle,
  accentClass,
}: SensorCardProps) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm group hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center gap-2 text-sm font-medium ${accentClass}`}>
            <Icon className="w-4 h-4" />
            {label}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl font-semibold tracking-tight font-mono tabular-nums ${accentClass}`}>
              {value}
            </span>
            <span className="text-lg text-muted-foreground font-medium">
              {unit}
            </span>
          </div>

          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
