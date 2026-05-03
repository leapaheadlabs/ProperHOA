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

    const messages = Array.isArray(chatSession.messages) ? (chatSession.messages as any[]) : [];
    if (messages[messageIndex]) {
      messages[messageIndex].feedback = type;
    }

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messages: messages as any,
        feedbackRating: type === "up" ? 1 : type === "down" ? -1 : 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
