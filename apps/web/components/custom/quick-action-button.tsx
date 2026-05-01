import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Plus } from "lucide-react"

const quickActionVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10",
        sm: "h-8 text-xs",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface QuickActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof quickActionVariants> {
  icon?: React.ReactNode
  label: string
}

export function QuickActionButton({
  className,
  variant,
  size,
  icon,
  label,
  ...props
}: QuickActionButtonProps) {
  return (
    <Button
      className={cn(quickActionVariants({ variant, size }), className)}
      {...props}
    >
      {icon || <Plus className="h-4 w-4" />}
      {label}
    </Button>
  )
}
