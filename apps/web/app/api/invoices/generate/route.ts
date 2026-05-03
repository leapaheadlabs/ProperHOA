import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.role || !["board", "admin"].includes(req.auth.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  if (!communityId) {
    return NextResponse.json({ error: "No community" }, { status: 400 });
  }

  try {
    const { amount, description, dueDate } = await req.json();
    if (!amount || !description || !dueDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get all homes in community
    const homes = await prisma.home.findMany({
      where: { communityId },
    });

    const now = new Date();
    const due = new Date(dueDate);

    // Create invoices for all homes
    const invoices = await Promise.all(
      homes.map((home: any, idx: number) =>
        prisma.invoice.create({
          data: {
            communityId,
            homeId: home.id,
            invoiceNumber: `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}-${String(idx+1).padStart(4,'0')}`,
            amount,
            balanceDue: amount,
            description,
            issuedAt: now,
            dueAt: due,
            status: "outstanding",
          },
        })
      )
    );

    // Log activity
    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth!.user.id,
        action: `Generated ${invoices.length} invoices`,
        entityType: "invoice",
        entityId: "batch",
        changes: { amount, description, count: invoices.length },
      },
    });

    return NextResponse.json({
      count: invoices.length,
      invoices: invoices.map((i) => ({ id: i.id, homeId: i.homeId })),
    });
  } catch (error: any) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
