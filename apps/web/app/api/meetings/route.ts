import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const { title, description, scheduledAt, location, isVirtual, meetingLink, type } = await req.json();

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Title and date required" }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        communityId,
        title,
        scheduledAt: new Date(scheduledAt),
        location,
        isVirtual: isVirtual || false,
        meetingLink,
        type: type || "board",
        status: "scheduled",
        agenda: "[]",
        minutes: "[]",
        createdBy: req.auth.user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth.user.id,
        action: "Meeting created",
        entityType: "meeting",
        entityId: meeting.id,
        changes: { title, scheduledAt },
      },
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: any) {
    console.error("Meeting creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const GET = auth(async (req) => {
  if (!req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const where: any = { communityId };
    if (status) where.status = status;

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error("Meeting list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
