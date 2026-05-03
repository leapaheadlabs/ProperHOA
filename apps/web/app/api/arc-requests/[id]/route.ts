import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const PATCH = auth(async (req, ctx) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const params = await ctx.params;
  const arcId = params?.id;
  const userId = req.auth.user.id;

  try {
    const { vote, conditions } = await req.json();

    const arc = await prisma.arcRequest.findFirst({
      where: { id: arcId, communityId },
    });

    if (!arc) {
      return NextResponse.json({ error: "ARC request not found" }, { status: 404 });
    }

    const votes = Array.isArray(arc.votes) ? (arc.votes as any[]) : [];
    const existingVote = votes.find((v: any) => v.userId === userId);

    if (existingVote) {
      existingVote.vote = vote;
      existingVote.conditions = conditions;
      existingVote.updatedAt = new Date().toISOString();
    } else {
      votes.push({
        userId,
        vote,
        conditions,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if majority reached
    const totalBoard = await prisma.appUser.count({
      where: { communityId, role: { in: ["board", "admin"] } },
    });

    const approveCount = votes.filter((v: any) => v.vote === "approve").length;
    const denyCount = votes.filter((v: any) => v.vote === "deny").length;
    const majority = Math.floor(totalBoard / 2) + 1;

    let newStatus = arc.status;
    if (approveCount >= majority) {
      newStatus = "approved";
    } else if (denyCount >= majority) {
      newStatus = "denied";
    }

    const updated = await prisma.arcRequest.update({
      where: { id: arcId },
      data: {
        votes: votes as any,
        status: newStatus,
        conditions: conditions || arc.conditions,
        approvedAt: newStatus === "approved" ? new Date() : arc.approvedAt,
        approvedBy: newStatus === "approved" ? userId : arc.approvedBy,
        denialReason: newStatus === "denied" ? conditions : arc.denialReason,
      },
    });

    return NextResponse.json({ arc: updated });
  } catch (error: any) {
    console.error("ARC vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
