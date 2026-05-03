import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  return typeof val === "number" ? val : Number(val);
}

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

    const revenue = toNumber(totalRevenue._sum.amount);
    const expenses = toNumber(totalExpenses._sum.amount);
    const balance = revenue + expenses;

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
    });

    // Unreconciled count
    const unreconciled = await prisma.transaction.count({
      where: { communityId, reconciled: false },
    });

    // Bank accounts
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { communityId },
    });

    return NextResponse.json({
      stats: {
        balance,
        revenue,
        expenses: Math.abs(expenses),
        net: balance,
        unreconciled,
      },
      transactions: transactions.reverse(),
      categories: categories.map((c: any) => ({
        name: c.category || "Uncategorized",
        amount: Math.abs(toNumber(c._sum.amount)),
      })),
      recent,
      bankAccounts,
    });
  } catch (error: any) {
    console.error("Finances error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
