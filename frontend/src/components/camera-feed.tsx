import { Video, VideoOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface CameraFeedProps {
  streamUrl: string | null
  playing: boolean
}

export function CameraFeed({ streamUrl, playing }: CameraFeedProps) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-0 relative">
        <div className="relative aspect-video bg-black/40 flex items-center justify-center overflow-hidden rounded-t-lg">
          {streamUrl ? (
            <img
              src={streamUrl}
              alt="Live camera feed"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <VideoOff className="w-10 h-10" />
              <span className="text-sm font-medium">Stream paused</span>
            </div>
          )}

          {playing && (
            <Badge
              variant="default"
              className="absolute top-3 left-3 bg-red-500/90 text-white border-0 gap-1.5 text-xs font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </Badge>
          )}

          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-black/50 text-white/80 border-0 text-xs backdrop-blur-sm"
          >
            <Video className="w-3 h-3 mr-1" />
            720p
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
