import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceBadge } from "@/components/custom/compliance-badge";
import { EmptyState } from "@/components/custom/empty-state";
import { Calendar, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function CompliancePage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const items = await prisma.complianceItem.findMany({
    where: { communityId: session.user.communityId },
    include: { document: true },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcoming = items.filter((i: any) => i.status === "upcoming" && new Date(i.dueDate) > now);
  const dueSoon = items.filter((i: any) => i.status === "upcoming" && new Date(i.dueDate) <= thirtyDays && new Date(i.dueDate) >= now);
  const overdue = items.filter((i: any) => i.status !== "completed" && new Date(i.dueDate) < now);
  const completed = items.filter((i: any) => i.status === "completed");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance Calendar</h1>
          <p className="text-muted-foreground text-sm">Track deadlines and requirements</p>
        </div>
        <Button asChild>
          <Link href="/compliance/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold">{upcoming.length}</div>
          <div className="text-xs text-muted-foreground">Upcoming</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-yellow-500">{dueSoon.length}</div>
          <div className="text-xs text-muted-foreground">Due Soon</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{overdue.length}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-emerald-500">{completed.length}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="due_soon">Due Soon</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {items.length === 0 ? (
            <EmptyState icon={Calendar} title="No items" description="Add your first compliance deadline." />
          ) : (
            items.map((item: any) => (
              <ComplianceBadge
                key={item.id}
                type={item.type}
                status={item.status}
                title={item.title}
                dueDate={new Date(item.dueDate).toLocaleDateString()}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="due_soon" className="space-y-3">
          {dueSoon.length === 0 ? (
            <EmptyState icon={Clock} title="Nothing due soon" description="You're on top of things!" />
          ) : (
            dueSoon.map((item: any) => (
              <ComplianceBadge
                key={item.id}
                type={item.type}
                status="due_soon"
                title={item.title}
                dueDate={new Date(item.dueDate).toLocaleDateString()}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-3">
          {overdue.length === 0 ? (
            <EmptyState icon={CheckCircle} title="No overdue items" description="Great job staying compliant!" />
          ) : (
            overdue.map((item: any) => (
              <ComplianceBadge
                key={item.id}
                type={item.type}
                status="overdue"
                title={item.title}
                dueDate={new Date(item.dueDate).toLocaleDateString()}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completed.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No completed items" description="Complete some tasks to see them here." />
          ) : (
            completed.map((item: any) => (
              <ComplianceBadge
                key={item.id}
                type={item.type}
                status="completed"
                title={item.title}
                dueDate={new Date(item.dueDate).toLocaleDateString()}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
