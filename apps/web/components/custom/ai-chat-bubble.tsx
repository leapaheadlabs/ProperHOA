import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react"

interface AIChatBubbleProps {
  message: string
  isUser?: boolean
  citations?: Array<{ document: string; page?: number }>
  onFeedback?: (type: "up" | "down") => void
  onEscalate?: () => void
  isLoading?: boolean
  className?: string
}

export function AIChatBubble({
  message,
  isUser,
  citations,
  onFeedback,
  onEscalate,
  isLoading,
  className,
}: AIChatBubbleProps) {
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row", className)}>
      <Avatar className={cn("h-8 w-8 shrink-0", isUser ? "bg-primary" : "bg-secondary")}>
        <AvatarFallback className={cn("text-xs font-bold", isUser ? "text-primary-foreground" : "text-secondary-foreground")}>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground border"
          )}
        >
          {isLoading ? (
            <div className="flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          ) : (
            message
          )}
        </div>
        {!isUser && citations && citations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {citations.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {c.document} {c.page && `p.${c.page}`}
              </span>
            ))}
          </div>
        )}
        {!isUser && !isLoading && (
          <div className="flex items-center gap-2">
            {onFeedback && (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onFeedback("up")}>
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onFeedback("down")}>
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </>
            )}
            {onEscalate && (
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={onEscalate}>
                <AlertCircle className="h-3 w-3" /> Escalate to Board
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
