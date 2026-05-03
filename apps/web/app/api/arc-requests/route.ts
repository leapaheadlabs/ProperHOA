import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const { homeId, projectType, description, documents } = await req.json();

    if (!projectType || !description) {
      return NextResponse.json({ error: "Project type and description required" }, { status: 400 });
    }

    const arc = await prisma.arcRequest.create({
      data: {
        communityId,
        homeId: homeId || null,
        requestedBy: req.auth.user.id,
        projectType,
        description,
        documents: documents || [],
        status: "submitted",
        votes: [],
      },
    });

    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth.user.id,
        action: "ARC request submitted",
        entityType: "arc_request",
        entityId: arc.id,
        changes: { projectType, homeId },
      },
    });

    return NextResponse.json({ arc }, { status: 201 });
  } catch (error: any) {
    console.error("ARC creation error:", error);
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

    const arcs = await prisma.arcRequest.findMany({
      where,
      include: { home: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ arcs });
  } catch (error: any) {
    console.error("ARC list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
