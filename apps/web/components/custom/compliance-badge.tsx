import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react"

type ComplianceStatus = "upcoming" | "due_soon" | "overdue" | "completed"
type ComplianceType = "tax_filing" | "insurance_renewal" | "document_renewal" | "audit" | "annual_meeting" | "amendment"

interface ComplianceBadgeProps {
  type: ComplianceType
  status: ComplianceStatus
  title: string
  dueDate: string
  className?: string
}

const statusConfig: Record<ComplianceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  upcoming: { label: "Upcoming", variant: "secondary", icon: <Calendar className="h-4 w-4" /> },
  due_soon: { label: "Due Soon", variant: "default", icon: <Clock className="h-4 w-4" /> },
  overdue: { label: "Overdue", variant: "destructive", icon: <AlertTriangle className="h-4 w-4" /> },
  completed: { label: "Completed", variant: "outline", icon: <CheckCircle className="h-4 w-4" /> },
}

const typeConfig: Record<ComplianceType, string> = {
  tax_filing: "Tax Filing",
  insurance_renewal: "Insurance Renewal",
  document_renewal: "Document Renewal",
  audit: "Audit",
  annual_meeting: "Annual Meeting",
  amendment: "Amendment",
}

export function ComplianceBadge({ type, status, title, dueDate, className }: ComplianceBadgeProps) {
  const config = statusConfig[status]

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3", className)}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      )}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{title}</span>
          <Badge variant={config.variant} className="shrink-0">{config.label}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {typeConfig[type]} • Due {dueDate}
        </div>
      </div>
    </div>
  )
}
