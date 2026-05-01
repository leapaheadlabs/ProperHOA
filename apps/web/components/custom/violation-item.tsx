import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Camera, CheckCircle, Clock, MapPin } from "lucide-react"
type ViolationStatus = "open" | "escalated" | "resolved" | "appealed"
type ViolationPriority = "low" | "medium" | "high" | "critical"
interface ViolationItemProps {
  id: string
  type: string
  description: string
  status: ViolationStatus
  priority: ViolationPriority
  homeAddress: string
  reportedAt: string
  photoCount?: number
  onResolve?: () => void
  className?: string
}
const statusConfig: Record<ViolationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "default" },
  escalated: { label: "Escalated", variant: "destructive" },
  resolved: { label: "Resolved", variant: "secondary" },
  appealed: { label: "Appealed", variant: "outline" },
}
const priorityConfig: Record<ViolationPriority, string> = {
  low: "text-muted-foreground",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-destructive",
}
export function ViolationItem({ type, description, status, priority, homeAddress, reportedAt, photoCount, onResolve, className }: ViolationItemProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={statusConfig[status].variant}>{statusConfig[status].label}</Badge>
              <span className={cn("text-xs font-medium", priorityConfig[priority])}>{priority} priority</span>
            </div>
            <h4 className="font-semibold text-sm truncate">{type}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {homeAddress}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {reportedAt}</span>
              {photoCount ? <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> {photoCount}</span> : null}
            </div>
          </div>
          {status === "open" && (
            <Button size="sm" variant="outline" onClick={onResolve} className="shrink-0">
              <CheckCircle className="h-4 w-4 mr-1" /> Fix
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
