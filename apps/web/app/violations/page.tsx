import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ViolationItem } from "@/components/custom/violation-item";
import { EmptyState } from "@/components/custom/empty-state";
import { AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";

export default async function ViolationsPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const violations = await prisma.violation.findMany({
    where: { communityId: session.user.communityId },
    include: { home: true },
    orderBy: { createdAt: "desc" },
  });

  const isBoard = ["president", "treasurer", "secretary", "board_member"].includes(session.user.role || "");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Violations</h1>
          <p className="text-muted-foreground text-sm">Track and manage community violations</p>
        </div>
        <Button asChild>
          <Link href="/violations/new">
            <Plus className="h-4 w-4 mr-2" />
            Report Violation
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {["open", "escalated", "resolved", "appealed"].map((status) => {
          const count = violations.filter((v: any) => v.status === status).length;
          return (
            <div key={status} className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground capitalize">{status}</div>
            </div>
          );
        })}
      </div>

      {/* Violations List */}
      <div className="space-y-3">
        {violations.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No violations"
            description="Your community is in good standing!"
          />
        ) : (
          violations.map((v: any) => (
            <ViolationItem
              key={v.id}
              id={v.id}
              type={v.type}
              description={v.description}
              status={v.status}
              priority={v.priority}
              homeAddress={v.home?.address || "Unknown"}
              reportedAt={new Date(v.createdAt).toLocaleDateString()}
              photoCount={v.photos ? JSON.parse(v.photos).length : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
