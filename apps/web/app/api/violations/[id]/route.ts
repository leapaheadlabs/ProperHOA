import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const PATCH = auth(async (req, ctx) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const params = await ctx.params;
  const violationId = params?.id;

  try {
    const { status, resolution, fineAmount } = await req.json();

    const violation = await prisma.violation.findFirst({
      where: { id: violationId, communityId },
    });

    if (!violation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (resolution) updateData.resolution = resolution;
    if (fineAmount) updateData.fineAmount = fineAmount;
    if (status === "resolved") updateData.resolvedAt = new Date();
    updateData.updatedAt = new Date();

    const updated = await prisma.violation.update({
      where: { id: violationId },
      data: updateData,
    });

    // Auto-create fine invoice on escalation
    if (status === "escalated" && fineAmount) {
      await prisma.invoice.create({
        data: {
          communityId,
          homeId: violation.homeId || "",
          amount: fineAmount,
          description: `Fine for violation: ${violation.type}`,
          status: "sent",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdBy: req.auth.user.id,
        },
      });
    }

    return NextResponse.json({ violation: updated });
  } catch (error: any) {
    console.error("Violation update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
