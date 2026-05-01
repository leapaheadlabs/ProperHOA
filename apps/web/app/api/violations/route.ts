import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const { homeId, type, description, priority, photos } = await req.json();

    if (!type || !description) {
      return NextResponse.json({ error: "Type and description required" }, { status: 400 });
    }

    const violation = await prisma.violation.create({
      data: {
        communityId,
        homeId: homeId || null,
        reportedBy: req.auth.user.id,
        type,
        description,
        priority: priority || "medium",
        status: "open",
        photos: photos ? JSON.stringify(photos) : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth.user.id,
        action: "Violation reported",
        entityType: "violation",
        entityId: violation.id,
        details: { type, priority, homeId },
      },
    });

    return NextResponse.json({ violation }, { status: 201 });
  } catch (error: any) {
    console.error("Violation creation error:", error);
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
  const priority = searchParams.get("priority");

  try {
    const where: any = { communityId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const violations = await prisma.violation.findMany({
      where,
      include: { home: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ violations });
  } catch (error: any) {
    console.error("Violation list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});