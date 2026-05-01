"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, FileText, AlertTriangle, Calendar, UserPlus } from "lucide-react";

interface RecentActivityProps {
  activity: Array<any>;
}

const actionIcons: Record<string, React.ElementType> = {
  payment: DollarSign,
  invoice: FileText,
  violation: AlertTriangle,
  meeting: Calendar,
  user: UserPlus,
  default: Activity,
};

const actionColors: Record<string, string> = {
  payment: "text-emerald-500 bg-emerald-50",
  invoice: "text-blue-500 bg-blue-50",
  violation: "text-destructive bg-destructive/10",
  meeting: "text-secondary bg-secondary/10",
  user: "text-primary bg-primary/10",
  default: "text-muted-foreground bg-muted",
};

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => {
              const Icon = actionIcons[item.entityType] || actionIcons.default;
              const colorClass = actionColors[item.entityType] || actionColors.default;
              return (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.entityType} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
