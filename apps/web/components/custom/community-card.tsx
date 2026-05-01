import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, Home, Calendar } from "lucide-react"
interface CommunityCardProps {
  name: string
  address?: string
  homeCount: number
  memberCount: number
  upcomingMeetings: number
  className?: string
}
export function CommunityCard({ name, address, homeCount, memberCount, upcomingMeetings, className }: CommunityCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="secondary">Active</Badge>
        </div>
        {address && <CardDescription>{address}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">{homeCount}</span>
            <span className="text-xs text-muted-foreground">Homes</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">{memberCount}</span>
            <span className="text-xs text-muted-foreground">Members</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">{upcomingMeetings}</span>
            <span className="text-xs text-muted-foreground">Meetings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
