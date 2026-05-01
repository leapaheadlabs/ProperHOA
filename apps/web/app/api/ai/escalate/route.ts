import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const userId = req.auth.user.id;

  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Create escalation activity log entry
    await prisma.activityLog.create({
      data: {
        communityId,
        userId,
        action: "AI question escalated to board",
        entityType: "chat_session",
        entityId: sessionId,
        details: JSON.parse(chatSession.messages || "[]"),
      },
    });

    // TODO: Send notification to board members via email/push
    // For now, we just log it
    console.log(`Escalation: Session ${sessionId} in community ${communityId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Escalation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
