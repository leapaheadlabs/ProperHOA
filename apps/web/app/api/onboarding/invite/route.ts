import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { emails } = await req.json();
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "emails array is required" },
        { status: 400 }
      );
    }

    // Validate emails
    const validEmails = emails
      .map((e: string) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
      .filter((e: string) => e.includes("@") && e.includes("."));

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: "No valid emails provided" },
        { status: 400 }
      );
    }

    // Look up the user's community
    const appUser = await prisma.appUser.findUnique({
      where: { authUserId: req.auth.user.id },
      include: { community: true },
    });

    if (!appUser?.communityId) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Store invites as pending homes with owner emails
    // In production, this would send emails via SMTP/SendGrid/etc.
    const community = appUser.community;
    const results = await Promise.allSettled(
      validEmails.map((email: string) =>
        prisma.home.create({
          data: {
            communityId: community.id,
            ownerEmail: email,
            status: "invited",
          },
        })
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Log activity
    await prisma.activityLog.create({
      data: {
        communityId: community.id,
        userId: appUser.id,
        action: "invites_sent",
        entityType: "home",
        changes: { count: succeeded, emails: validEmails },
      },
    });

    return NextResponse.json({
      success: true,
      invited: succeeded,
      failed,
      note: "Email sending is not yet configured. Invitations will be sent when SMTP is set up.",
    });
  } catch (error: any) {
    console.error("Onboarding invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
