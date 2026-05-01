import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/custom/empty-state";
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function MaintenancePage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where: { communityId: session.user.communityId },
    include: { home: true },
    orderBy: { createdAt: "desc" },
  });

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    open: { label: "Open", icon: AlertTriangle, color: "text-destructive" },
    assigned: { label: "Assigned", icon: Clock, color: "text-yellow-500" },
    in_progress: { label: "In Progress", icon: Wrench, color: "text-blue-500" },
    completed: { label: "Completed", icon: CheckCircle, color: "text-emerald-500" },
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          <p className="text-muted-foreground text-sm">Track work orders and repairs</p>
        </div>
        <Button asChild>
          <Link href="/maintenance/new">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <EmptyState icon={Wrench} title="No requests" description="Submit your first maintenance request." />
        ) : (
          requests.map((req: any) => {
            const config = statusConfig[req.status] || statusConfig.open;
            const Icon = config.icon;
            return (
              <Card key={req.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{req.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{req.home?.address || "Community"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={req.priority === "high" ? "destructive" : req.priority === "medium" ? "secondary" : "outline"}>
                        {req.priority}
                      </Badge>
                      <div className={`flex items-center gap-1 text-sm ${config.color}`}>
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{req.description}</p>
                  {req.vendorName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Assigned to: {req.vendorName} {req.vendorPhone && `• ${req.vendorPhone}`}
                    </p>
                  )}
                  {req.cost && (
                    <p className="text-xs text-muted-foreground mt-1">Cost: ${Number(req.cost).toFixed(2)}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
