import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const { transactions, format, fileName, bankAccountId } = await req.json();

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Transactions array required" }, { status: 400 });
    }

    // Create import batch
    const batch = await prisma.importBatch.create({
      data: {
        communityId,
        bankAccountId: bankAccountId || null,
        format: format || "csv",
        fileName: fileName || "import.csv",
        recordCount: transactions.length,
        status: "processing",
      },
    });

    // Insert transactions
    const created = await Promise.all(
      transactions.map((t: any) =>
        prisma.transaction.create({
          data: {
            communityId,
            bankAccountId: bankAccountId || null,
            importBatchId: batch.id,
            date: new Date(t.date),
            description: t.description,
            amount: Number(t.amount),
            category: t.category || null,
            isReconciled: false,
          },
        })
      )
    );

    // Update batch status
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: { status: "completed" },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth.user.id,
        action: `Imported ${created.length} transactions`,
        entityType: "import_batch",
        entityId: batch.id,
        details: { format, fileName, count: created.length },
      },
    });

    return NextResponse.json({
      batchId: batch.id,
      imported: created.length,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
});
