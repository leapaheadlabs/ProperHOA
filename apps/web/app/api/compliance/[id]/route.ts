import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const PATCH = auth(async (req, ctx) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const params = await ctx.params;
  const itemId = params?.id;

  try {
    const { status, documentId } = await req.json();

    const item = await prisma.complianceItem.findFirst({
      where: { id: itemId, communityId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
    }
    if (documentId) updateData.documentId = documentId;
    updateData.updatedAt = new Date();

    const updated = await prisma.complianceItem.update({
      where: { id: itemId },
      data: updateData,
    });

    // If recurring and completed, create next instance
    if (status === "completed" && item.recurring && item.recurringInterval) {
      const nextDue = new Date(item.dueDate);
      switch (item.recurringInterval) {
        case "monthly":
          nextDue.setMonth(nextDue.getMonth() + 1);
          break;
        case "quarterly":
          nextDue.setMonth(nextDue.getMonth() + 3);
          break;
        case "annually":
          nextDue.setFullYear(nextDue.getFullYear() + 1);
          break;
      }

      await prisma.complianceItem.create({
        data: {
          communityId,
          type: item.type,
          title: item.title,
          description: item.description,
          dueDate: nextDue,
          status: "upcoming",
          recurring: true,
          recurringInterval: item.recurringInterval,
        },
      });
    }

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    console.error("Compliance update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
