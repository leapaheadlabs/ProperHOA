import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    // Only show opted-in users with their public info
    const users = await prisma.appUser.findMany({
      where: { communityId },
      include: { home: true },
      orderBy: { createdAt: "desc" },
    });

    // Filter to only show opted-in and basic info
    const directory = users.map((u: any) => ({
      id: u.id,
      name: u.name || "Resident",
      role: u.role,
      homeAddress: u.home?.address,
      homeUnit: u.home?.unitNumber,
      isBoardMember: u.isBoardMember,
    }));

    return NextResponse.json({ directory });
  } catch (error: any) {
    console.error("Directory error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
