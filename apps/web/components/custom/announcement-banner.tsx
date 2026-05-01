import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Megaphone, X, Pin, Calendar } from "lucide-react"

interface AnnouncementBannerProps {
  title: string
  content: string
  priority?: "low" | "medium" | "high"
  isPinned?: boolean
  date?: string
  onDismiss?: () => void
  className?: string
}

const priorityConfig = {
  low: { variant: "secondary" as const, icon: "text-muted-foreground" },
  medium: { variant: "default" as const, icon: "text-primary" },
  high: { variant: "destructive" as const, icon: "text-destructive" },
}

export function AnnouncementBanner({
  title,
  content,
  priority = "medium",
  isPinned,
  date,
  onDismiss,
  className,
}: AnnouncementBannerProps) {
  const config = priorityConfig[priority]

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Megaphone className={cn("h-5 w-5 mt-0.5 shrink-0", config.icon)} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{title}</h4>
                <Badge variant={config.variant}>{priority}</Badge>
                {isPinned && <Pin className="h-3 w-3 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
              {date && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{date}</span>
                </div>
              )}
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
