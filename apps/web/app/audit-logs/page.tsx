import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/custom/empty-state";
import { Shield, Clock, User, FileText } from "lucide-react";

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  // Only board members can view audit logs
  const isBoard = ["president", "treasurer", "secretary", "board_member"].includes(session.user.role || "");
  if (!isBoard) {
    redirect("/unauthorized");
  }

  const logs = await prisma.activityLog.findMany({
    where: { communityId: session.user.communityId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalCount = await prisma.activityLog.count({
    where: { communityId: session.user.communityId },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">Security and compliance activity trail</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{totalCount}</span> entries
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState icon={Shield} title="No activity yet" description="Actions will be logged here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.user?.name || "System"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{log.action}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {log.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {JSON.stringify(log.details).slice(0, 80)}...
                      </p>
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
