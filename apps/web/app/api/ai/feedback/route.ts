import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, messageIndex, type } = await req.json();
    if (!sessionId || typeof messageIndex !== "number" || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages = JSON.parse(chatSession.messages || "[]");
    if (messages[messageIndex]) {
      messages[messageIndex].feedback = type;
    }

    // Build feedback entry
    const feedback = JSON.parse(chatSession.feedback || "[]");
    feedback.push({
      messageIndex,
      type,
      timestamp: new Date().toISOString(),
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messages: JSON.stringify(messages),
        feedback: JSON.stringify(feedback),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
