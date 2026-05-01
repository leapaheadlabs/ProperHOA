import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, Clock, MapPin, Users, Video } from "lucide-react"
type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled"
type MeetingType = "board" | "annual" | "special" | "committee"
interface MeetingCardProps {
  title: string
  type: MeetingType
  status: MeetingStatus
  date: string
  time: string
  location?: string
  attendeeCount?: number
  isVirtual?: boolean
  onJoin?: () => void
  className?: string
}
const statusConfig: Record<MeetingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Scheduled", variant: "secondary" },
  in_progress: { label: "Live Now", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}
const typeConfig: Record<MeetingType, string> = {
  board: "Board Meeting",
  annual: "Annual Meeting",
  special: "Special Meeting",
  committee: "Committee Meeting",
}
export function MeetingCard({ title, type, status, date, time, location, attendeeCount, isVirtual, onJoin, className }: MeetingCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{typeConfig[type]}</CardDescription>
          </div>
          <Badge variant={statusConfig[status].variant}>{statusConfig[status].label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{time}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              {isVirtual ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              <span>{location}</span>
            </div>
          )}
          {attendeeCount !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{attendeeCount} attending</span>
            </div>
          )}
        </div>
        {status === "in_progress" && onJoin && (
          <Button className="w-full mt-4" onClick={onJoin}>
            <Video className="h-4 w-4 mr-2" /> Join Meeting
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
