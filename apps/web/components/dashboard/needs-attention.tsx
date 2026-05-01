"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ViolationItem } from "@/components/custom/violation-item";
import { AlertTriangle, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface NeedsAttentionProps {
  data: {
    violationsDueToday: number;
    pendingArcs: number;
    overduePayments: number;
    violations: Array<any>;
  };
}

export function NeedsAttention({ data }: NeedsAttentionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Needs Attention
          </CardTitle>
          <Badge variant="destructive">{data.violationsDueToday + data.pendingArcs + data.overduePayments}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted p-2">
            <div className="text-lg font-bold text-destructive">{data.violationsDueToday}</div>
            <div className="text-xs text-muted-foreground">Violations</div>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <div className="text-lg font-bold">{data.pendingArcs}</div>
            <div className="text-xs text-muted-foreground">ARCs</div>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <div className="text-lg font-bold text-destructive">{data.overduePayments}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>

        {data.violations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Violations</h4>
            {data.violations.map((v) => (
              <ViolationItem
                key={v.id}
                id={v.id}
                type={v.type}
                description={v.description}
                status={v.status}
                priority={v.priority}
                homeAddress={v.home?.address || "Unknown"}
                reportedAt={new Date(v.createdAt).toLocaleDateString()}
                photoCount={v.photos?.length}
              />
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full" asChild>
          <Link href="/violations">View All Violations</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
