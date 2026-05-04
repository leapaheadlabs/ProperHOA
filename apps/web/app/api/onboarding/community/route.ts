import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, address, city, state, zip, totalHomes } = body;

    if (!name || !state) {
      return NextResponse.json(
        { error: "Community name and state are required" },
        { status: 400 }
      );
    }

    // Check if user already has an appUser (community already created)
    const existingAppUser = await prisma.appUser.findUnique({
      where: { authUserId: req.auth.user.id },
    });

    if (existingAppUser) {
      // Update existing community instead of creating new one
      await prisma.community.update({
        where: { id: existingAppUser.communityId },
        data: {
          name,
          address: [address, city, zip].filter(Boolean).join(", "),
          state,
          ...(totalHomes ? { totalHomes } : {}),
        },
      });
      return NextResponse.json({ communityId: existingAppUser.communityId }, { status: 200 });
    }

    const slug = slugify(name) + "-" + Date.now().toString(36);

    // Build address string
    const fullAddress = [address, city, state, zip].filter(Boolean).join(", ");

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        address: fullAddress || null,
        state,
        ...(totalHomes ? { totalHomes } : {}),
      },
    });

    const nameParts = (req.auth.user.name || "").split(" ");
    await prisma.appUser.create({
      data: {
        authUserId: req.auth.user.id,
        communityId: community.id,
        role: "homeowner", // Will be updated in role step
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
      },
    });

    return NextResponse.json({ community }, { status: 201 });
  } catch (error: any) {
    console.error("Onboarding community error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
