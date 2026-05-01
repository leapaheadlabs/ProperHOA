import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/custom/empty-state";
import { CheckCircle, XCircle, HelpCircle, Plus } from "lucide-react";
import Link from "next/link";

export default async function ArcPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const arcs = await prisma.arcRequest.findMany({
    where: { communityId: session.user.communityId },
    include: { home: true },
    orderBy: { createdAt: "desc" },
  });

  const isBoard = ["president", "treasurer", "secretary", "board_member"].includes(session.user.role || "");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ARC Requests</h1>
          <p className="text-muted-foreground text-sm">Architectural Review Committee requests</p>
        </div>
        <Button asChild>
          <Link href="/arc/new">
            <Plus className="h-4 w-4 mr-2" />
            Submit Request
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {arcs.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No ARC requests"
            description="Submit your first architectural review request."
          />
        ) : (
          arcs.map((arc: any) => (
            <Card key={arc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{arc.projectType}</CardTitle>
                    <p className="text-sm text-muted-foreground">{arc.home?.address || "No home"}</p>
                  </div>
                  <Badge
                    variant={
                      arc.status === "approved"
                        ? "default"
                        : arc.status === "denied"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {arc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{arc.description}</p>
                {arc.dimensions && <p className="text-xs text-muted-foreground">Dimensions: {arc.dimensions}</p>}
                {arc.materials && <p className="text-xs text-muted-foreground">Materials: {arc.materials}</p>}

                {/* Board Vote Summary */}
                {isBoard && arc.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <XCircle className="h-3 w-3" /> Deny
                    </Button>
                  </div>
                )}

                {arc.decisionNotes && (
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    Decision: {arc.decisionNotes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
