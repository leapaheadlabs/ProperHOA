import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const PATCH = auth(async (req, ctx) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const params = await ctx.params;
  const meetingId = params?.id;

  try {
    const { status, agenda, minutes } = await req.json();

    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, communityId },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (agenda) updateData.agenda = JSON.stringify(agenda);
    if (minutes) updateData.minutes = JSON.stringify(minutes);
    updateData.updatedAt = new Date();

    const updated = await prisma.meeting.update({
      where: { id: meetingId },
      data: updateData,
    });

    if (status === "completed") {
      // Auto-create action items from agenda
      const agendaItems = updated.agenda
        ? (JSON.parse(updated.agenda) as any[])
        : [];
      for (const item of agendaItems) {
        if (item && item.actionRequired) {
          await prisma.complianceItem.create({
            data: {
              communityId,
              type: "annual_meeting",
              title: item.title || "Action item",
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: "upcoming",
            },
          });
        }
      }
    }

    return NextResponse.json({ meeting: updated });
  } catch (error: any) {
    console.error("Meeting update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const GET = auth(async (req, ctx) => {
  if (!req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const params = await ctx.params;
  const meetingId = params?.id;

  try {
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, communityId },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error("Meeting detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
