"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertTriangle, Calendar, DollarSign } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalHomes: number;
    openViolations: number;
    upcomingMeetings: number;
    currentBalance: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    { label: "Total Homes", value: stats.totalHomes, icon: Home, color: "text-primary" },
    { label: "Open Violations", value: stats.openViolations, icon: AlertTriangle, color: "text-destructive" },
    { label: "Upcoming Meetings", value: stats.upcomingMeetings, icon: Calendar, color: "text-secondary" },
    { label: "Current Balance", value: `$${stats.currentBalance.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
