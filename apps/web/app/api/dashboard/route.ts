import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCached, setCache, invalidateCache, cacheKey } from "@/lib/cache";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const cacheKeyName = cacheKey("dashboard", communityId);

  // Try cache first (30 seconds for dashboard)
  const cached = await getCached(cacheKeyName);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Stats
    const totalHomes = await prisma.home.count({ where: { communityId } });
    const openViolations = await prisma.violation.count({
      where: { communityId, status: { in: ["open", "escalated"] } },
    });
    const upcomingMeetings = await prisma.meeting.count({
      where: { communityId, status: "scheduled", scheduledAt: { gte: new Date() } },
    });
    const currentBalance = await prisma.transaction.aggregate({
      where: { communityId },
      _sum: { amount: true },
    });

    // Needs Attention
    const violationsDueToday = await prisma.violation.findMany({
      where: { communityId, status: "open", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      include: { home: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    const pendingArcs = await prisma.arcRequest.count({
      where: { communityId, status: "pending" },
    });
    const overduePayments = await prisma.invoice.count({
      where: { communityId, status: "overdue" },
    });

    // Today
    const todaysMeetings = await prisma.meeting.findMany({
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

    // Recent Activity
    const recentActivity = await prisma.activityLog.findMany({
      where: { communityId },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const result = {
      stats: {
        totalHomes,
        openViolations,
        upcomingMeetings,
        currentBalance: currentBalance._sum.amount || 0,
      },
      needsAttention: {
        violationsDueToday: violationsDueToday.length,
        pendingArcs,
        overduePayments,
        violations: violationsDueToday,
      },
      today: {
        meetings: todaysMeetings,
      },
      recentActivity,
    };

    // Cache for 30 seconds
    await setCache(cacheKeyName, result, 30);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
