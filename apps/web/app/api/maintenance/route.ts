import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const { title, description, category, priority, homeId, photos } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category required" }, { status: 400 });
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        communityId,
        homeId: homeId || null,
        reportedBy: req.auth.user.id,
        title,
        description,
        category,
        priority: priority || "medium",
        status: "open",
        photos: photos ? (Array.isArray(photos) ? photos : [photos]) : [],
      },
    });

    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth.user.id,
        action: "Maintenance request submitted",
        entityType: "maintenance_request",
        entityId: request.id,
        changes: { title, category, priority },
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error: any) {
    console.error("Maintenance creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const GET = auth(async (req) => {
  if (!req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const requests = await prisma.maintenanceRequest.findMany({
      where: { communityId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Maintenance list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
