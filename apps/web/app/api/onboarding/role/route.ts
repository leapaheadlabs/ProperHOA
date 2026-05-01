import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { role } = await req.json();
    const appUser = await prisma.appUser.findUnique({
      where: { authUserId: req.auth.user.id },
    });

    if (!appUser) {
      return NextResponse.json({ error: "App user not found" }, { status: 404 });
    }

    await prisma.appUser.update({
      where: { id: appUser.id },
      data: {
        role,
        isBoardMember: role !== "homeowner",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Onboarding role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
