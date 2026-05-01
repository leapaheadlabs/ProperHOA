import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.auth.user.id;
  const communityId = req.auth.user.communityId;

  try {
    const appUser = await prisma.appUser.findUnique({
      where: { authUserId: userId },
      include: { home: true },
    });

    // Dues status
    const invoices = await prisma.invoice.findMany({
      where: { communityId, homeId: appUser?.homeId || "", status: { in: ["sent", "overdue"] } },
      orderBy: { dueDate: "asc" },
    });

    // Open violations for this home
    const violations = await prisma.violation.findMany({
      where: { communityId, homeId: appUser?.homeId || "", status: { in: ["open", "escalated"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Upcoming meetings
    const meetings = await prisma.meeting.findMany({
      where: { communityId, status: "scheduled", scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    });

    // Announcements
    const announcements = await prisma.announcement.findMany({
      where: { communityId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    });

    // Recent documents
    const documents = await prisma.document.findMany({
      where: { communityId, isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      home: appUser?.home,
      dues: { totalDue: invoices.reduce((sum: number, i: any) => sum + Number(i.amount), 0), invoices },
      violations,
      meetings,
      announcements,
      documents,
    });
  } catch (error: any) {
    console.error("Portal data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});