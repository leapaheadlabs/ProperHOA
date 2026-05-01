import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, address, city, state, zip } = await req.json();

    const slug = slugify(name) + "-" + Date.now().toString(36);
    const community = await prisma.community.create({
      data: { name, slug, address, city, state, zip, subscriptionTier: "free" },
    });

    await prisma.appUser.create({
      data: {
        authUserId: req.auth.user.id,
        communityId: community.id,
        role: "president",
        isBoardMember: true,
      },
    });

    return NextResponse.json({ community }, { status: 201 });
  } catch (error: any) {
    console.error("Onboarding community error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
