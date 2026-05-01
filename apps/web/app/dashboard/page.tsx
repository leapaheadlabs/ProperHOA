import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/dashboard/stats";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { TodaySection } from "@/components/dashboard/today";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AiAssistantCta } from "@/components/dashboard/ai-assistant-cta";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Skeleton } from "@/components/ui/skeleton";

async function getDashboardData(communityId: string) {
  const [totalHomes, openViolations, upcomingMeetings, balanceAgg, pendingArcs, overduePayments] = await Promise.all([
    prisma.home.count({ where: { communityId } }),
    prisma.violation.count({ where: { communityId, status: { in: ["open", "escalated"] } } }),
    prisma.meeting.count({ where: { communityId, status: "scheduled", scheduledAt: { gte: new Date() } } }),
    prisma.transaction.aggregate({ where: { communityId }, _sum: { amount: true } }),
    prisma.arcRequest.count({ where: { communityId, status: "pending" } }),
    prisma.invoice.count({ where: { communityId, status: "overdue" } }),
  ]);

  const violations = await prisma.violation.findMany({
    where: { communityId, status: { in: ["open", "escalated"] } },
    include: { home: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const meetings = await prisma.meeting.findMany({
    where: {
      communityId,
      scheduledAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
    take: 3,
    orderBy: { scheduledAt: "asc" },
  });

  const activity = await prisma.activityLog.findMany({
    where: { communityId },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return {
    stats: { totalHomes, openViolations, upcomingMeetings, currentBalance: balanceAgg._sum.amount || 0 },
    needsAttention: { violationsDueToday: violations.length, pendingArcs, overduePayments, violations },
    today: { meetings },
    activity,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: session.user.id },
    include: { community: true },
  });

  const data = await getDashboardData(session.user.communityId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Good {getGreeting()}, {session.user.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-muted-foreground text-sm">
              {appUser?.community?.name} • {appUser?.role}
            </p>
          </div>
          <AiAssistantCta />
        </div>

        {/* Stats */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats stats={data.stats} />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Needs Attention */}
          <Suspense fallback={<CardSkeleton />}>
            <NeedsAttention data={data.needsAttention} />
          </Suspense>

          {/* Today */}
          <Suspense fallback={<CardSkeleton />}>
            <TodaySection meetings={data.today.meetings} />
          </Suspense>
        </div>

        {/* Recent Activity */}
        <Suspense fallback={<CardSkeleton />}>
          <RecentActivity activity={data.activity} />
        </Suspense>
      </div>

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return <Skeleton className="h-64 rounded-xl" />;
}