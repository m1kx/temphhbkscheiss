import { useState } from "react"
import { ClipboardList, Trash2, X, User, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { AccessLogEntry } from "@/lib/api"
import { accessLogImageUrl } from "@/lib/api"

interface AccessLogProps {
  logs: AccessLogEntry[]
  loading: boolean
  onRefresh: () => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

export function AccessLog({
  logs,
  loading,
  onRefresh,
  onDelete,
  onClearAll,
}: AccessLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
            <ClipboardList className="w-4 h-4" />
            Access Log
            {logs.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-amber-400/15 text-amber-400 border-0"
              >
                {logs.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                  className="h-7 px-2 text-xs text-muted-foreground"
                >
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh access logs</TooltipContent>
            </Tooltip>
            {logs.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete all log entries</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ClipboardList className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No access events recorded</p>
            <p className="text-xs opacity-60 mt-1">
              Events appear when a person is detected
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {logs.map((entry) => (
              <LogEntry
                key={entry.id}
                entry={entry}
                expanded={expandedId === entry.id}
                onToggle={() =>
                  setExpandedId(expandedId === entry.id ? null : entry.id)
                }
                onDelete={() => onDelete(entry.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LogEntry({
  entry,
  expanded,
  onToggle,
  onDelete,
}: {
  entry: AccessLogEntry
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const PersonIcon = entry.count > 1 ? Users : User

  return (
    <div className="rounded-lg border border-border/40 bg-background/50 overflow-hidden transition-colors hover:border-border/70">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-400/10 shrink-0">
          <PersonIcon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {entry.count > 1
                ? `${entry.count} persons detected`
                : "Person detected"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {entry.timestamp}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {entry.labels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {label}
            </Badge>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="relative rounded-md overflow-hidden bg-black/30">
            <img
              src={accessLogImageUrl(entry.id)}
              alt={`Detection snapshot ${entry.timestamp}`}
              className="w-full object-contain max-h-64"
              loading="lazy"
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive gap-1"
            >
              <X className="w-3 h-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
