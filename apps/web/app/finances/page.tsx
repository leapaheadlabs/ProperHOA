import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/custom/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, Wallet, AlertCircle, Download, Upload } from "lucide-react";
import Link from "next/link";

// Import recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default async function FinancesPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const communityId = session.user.communityId;

  // Fetch financial data
  const totalRevenue = await prisma.transaction.aggregate({
    where: { communityId, amount: { gt: 0 } },
    _sum: { amount: true },
  });

  const totalExpenses = await prisma.transaction.aggregate({
    where: { communityId, amount: { lt: 0 } },
    _sum: { amount: true },
  });

  const balance = (totalRevenue._sum.amount || 0) + (totalExpenses._sum.amount || 0);

  const recentTransactions = await prisma.transaction.findMany({
    where: { communityId },
    orderBy: { date: "desc" },
    take: 20,
    include: { invoice: true },
  });

  const categories = await prisma.transaction.groupBy({
    by: ["category"],
    where: { communityId },
    _sum: { amount: true },
  });

  const unreconciled = await prisma.transaction.count({
    where: { communityId, isReconciled: false },
  });

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { communityId },
  });

  // Monthly aggregation (simplified — last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await prisma.transaction.findMany({
    where: { communityId, date: { gte: sixMonthsAgo } },
    orderBy: { date: "asc" },
  });

  // Group by month for chart
  const monthlyGrouped: Record<string, { revenue: number; expenses: number }> = {};
  for (const t of monthlyData) {
    const month = new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthlyGrouped[month]) monthlyGrouped[month] = { revenue: 0, expenses: 0 };
    if (Number(t.amount) > 0) {
      monthlyGrouped[month].revenue += Number(t.amount);
    } else {
      monthlyGrouped[month].expenses += Math.abs(Number(t.amount));
    }
  }

  const chartData = Object.entries(monthlyGrouped).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    expenses: data.expenses,
  }));

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground text-sm">Treasurer view of community finances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/finances/import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              +${(totalRevenue._sum.amount || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -${Math.abs(totalExpenses._sum.amount || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unreconciled</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreconciled}</div>
            {unreconciled > 0 && (
              <Badge variant="secondary" className="mt-1">Needs attention</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyState icon={DollarSign} title="No data" description="Import transactions to see charts." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#22c55e" />
                  <Bar dataKey="expenses" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyState icon={DollarSign} title="No categories" description="Categorize transactions to see breakdown." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categories.map((c: any) => ({
                      name: c.category || "Uncategorized",
                      value: Math.abs(c._sum.amount || 0),
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {categories.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts */}
      {bankAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bankAccounts.map((account: any) => (
                <div key={account.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">****{account.mask}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(account.balance || 0).toFixed(2)}</p>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <EmptyState icon={DollarSign} title="No transactions" description="Import bank statements to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.category || "Uncategorized"}</TableCell>
                    <TableCell>
                      <Badge variant={t.isReconciled ? "default" : "secondary"}>
                        {t.isReconciled ? "Reconciled" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${Number(t.amount) >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {Number(t.amount) >= 0 ? "+" : ""}${Number(t.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
