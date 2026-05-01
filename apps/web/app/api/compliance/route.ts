import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const { type, title, description, dueDate, recurring, recurringInterval, documentId } = await req.json();

    if (!type || !title || !dueDate) {
      return NextResponse.json({ error: "Type, title, and due date required" }, { status: 400 });
    }

    const item = await prisma.complianceItem.create({
      data: {
        communityId,
        type,
        title,
        description,
        dueDate: new Date(dueDate),
        status: "upcoming",
        recurring: recurring || false,
        recurringInterval: recurringInterval || null,
        documentId: documentId || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth.user.id,
        action: "Compliance item created",
        entityType: "compliance_item",
        entityId: item.id,
        details: { title, type, dueDate },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error("Compliance creation error:", error);
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

    const items = await prisma.complianceItem.findMany({
      where,
      include: { document: true },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Compliance list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
