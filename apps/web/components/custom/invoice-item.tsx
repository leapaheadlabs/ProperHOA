import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DollarSign, Calendar, Home, FileText } from "lucide-react"
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"
interface InvoiceItemProps {
  id: string
  homeAddress: string
  amount: number
  status: InvoiceStatus
  dueDate: string
  description: string
  onPay?: () => void
  className?: string
}
const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
}
export function InvoiceItem({ homeAddress, amount, status, dueDate, description, onPay, className }: InvoiceItemProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={statusConfig[status].variant}>{statusConfig[status].label}</Badge>
              <span className="text-xs text-muted-foreground">Due {dueDate}</span>
            </div>
            <h4 className="font-semibold text-sm">{description}</h4>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Home className="h-3 w-3" /> {homeAddress}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {dueDate}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold">${amount.toFixed(2)}</div>
            {(status === "sent" || status === "overdue") && onPay && (
              <Button size="sm" className="mt-1" onClick={onPay}>
                <DollarSign className="h-3 w-3 mr-1" /> Pay
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
