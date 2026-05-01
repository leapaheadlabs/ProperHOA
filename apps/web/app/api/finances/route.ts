import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    // Dashboard stats
    const totalRevenue = await prisma.transaction.aggregate({
      where: { communityId, amount: { gt: 0 } },
      _sum: { amount: true },
    });

    const totalExpenses = await prisma.transaction.aggregate({
      where: { communityId, amount: { lt: 0 } },
      _sum: { amount: true },
    });

    const balance = (totalRevenue._sum.amount || 0) + (totalExpenses._sum.amount || 0);

    // Monthly data for charts
    const transactions = await prisma.transaction.findMany({
      where: { communityId },
      orderBy: { date: "desc" },
      take: 100,
    });

    // Category breakdown
    const categories = await prisma.transaction.groupBy({
      by: ["category"],
      where: { communityId },
      _sum: { amount: true },
    });

    // Recent transactions
    const recent = await prisma.transaction.findMany({
      where: { communityId },
      orderBy: { date: "desc" },
      take: 20,
      include: { invoice: true, bankAccount: true },
    });

    // Unreconciled count
    const unreconciled = await prisma.transaction.count({
      where: { communityId, isReconciled: false },
    });

    // Bank accounts
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { communityId },
    });

    return NextResponse.json({
      stats: {
        balance,
        revenue: totalRevenue._sum.amount || 0,
        expenses: Math.abs(totalExpenses._sum.amount || 0),
        net: (totalRevenue._sum.amount || 0) + (totalExpenses._sum.amount || 0),
        unreconciled,
      },
      transactions: transactions.reverse(),
      categories: categories.map((c: any) => ({
        name: c.category || "Uncategorized",
        amount: Math.abs(c._sum.amount || 0),
      })),
      recent,
      bankAccounts,
    });
  } catch (error: any) {
    console.error("Finances error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});