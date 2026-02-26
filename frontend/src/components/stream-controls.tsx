import {
  Camera,
  Maximize2,
  Pause,
  Play,
  ScanFace,
  Box,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { DetectionStatus } from "@/lib/api"
import { snapshotUrl, VIDEO_FEED_URL } from "@/lib/api"

interface StreamControlsProps {
  playing: boolean
  onToggleStream: () => void
  detectionStatus: DetectionStatus
  onToggleDetection: (key: keyof DetectionStatus) => void
  detectionToggling: boolean
}

export function StreamControls({
  playing,
  onToggleStream,
  detectionStatus,
  onToggleDetection,
  detectionToggling,
}: StreamControlsProps) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="flex items-center gap-2 p-3 flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={playing ? "secondary" : "default"}
              size="sm"
              onClick={onToggleStream}
              className="gap-1.5"
            >
              {playing ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {playing ? "Pause stream" : "Start stream"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(snapshotUrl(), "_blank")}
              className="gap-1.5 text-muted-foreground"
            >
              <Camera className="w-3.5 h-3.5" /> Snapshot
            </Button>
          </TooltipTrigger>
          <TooltipContent>Take a snapshot</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(VIDEO_FEED_URL, "_blank")}
              className="gap-1.5 text-muted-foreground"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open fullscreen stream</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={detectionStatus.faces ? "default" : "ghost"}
              size="sm"
              onClick={() => onToggleDetection("faces")}
              disabled={detectionToggling}
              className={`gap-1.5 ${
                detectionStatus.faces
                  ? "bg-humid/15 text-humid hover:bg-humid/25 border border-humid/30"
                  : "text-muted-foreground"
              }`}
            >
              <ScanFace className="w-3.5 h-3.5" /> Faces
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {detectionStatus.faces ? "Disable" : "Enable"} face detection
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={detectionStatus.objects ? "default" : "ghost"}
              size="sm"
              onClick={() => onToggleDetection("objects")}
              disabled={detectionToggling}
              className={`gap-1.5 ${
                detectionStatus.objects
                  ? "bg-humid/15 text-humid hover:bg-humid/25 border border-humid/30"
                  : "text-muted-foreground"
              }`}
            >
              <Box className="w-3.5 h-3.5" /> Objects
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {detectionStatus.objects ? "Disable" : "Enable"} object detection
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  )
}
