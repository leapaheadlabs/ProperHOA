import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ViolationItem } from "@/components/custom/violation-item";
import { MeetingCard } from "@/components/custom/meeting-card";
import { AnnouncementBanner } from "@/components/custom/announcement-banner";
import { EmptyState } from "@/components/custom/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { DollarSign, FileText, Users, MessageSquare, AlertTriangle, Home as HomeIcon } from "lucide-react";
import Link from "next/link";

async function getPortalData(userId: string, communityId: string) {
  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: userId },
    include: { home: true },
  });

  const [invoices, violations, meetings, announcements, documents] = await Promise.all([
    prisma.invoice.findMany({
      where: { communityId, homeId: appUser?.homeId || "", status: { in: ["sent", "overdue"] } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.violation.findMany({
      where: { communityId, homeId: appUser?.homeId || "", status: { in: ["open", "escalated"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.meeting.findMany({
      where: { communityId, status: "scheduled", scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    }),
    prisma.announcement.findMany({
      where: { communityId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.document.findMany({
      where: { communityId, isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { home: appUser?.home, invoices, violations, meetings, announcements, documents };
}

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const data = await getPortalData(session.user.id, session.user.communityId);

  const totalDue = data.invoices.reduce((sum: number, i: any) => sum + Number(i.amount), 0);
  const hasOverdue = data.invoices.some((i: any) => i.status === "overdue");

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Home</h1>
          <p className="text-muted-foreground text-sm">{data.home?.address || "No home assigned"}</p>
        </div>

        {/* Dues Status */}
        <Card className={hasOverdue ? "border-destructive" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Dues Status
              </CardTitle>
              {hasOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${totalDue.toFixed(2)}</span>
              <span className="text-muted-foreground">total due</span>
            </div>
            {data.invoices.length > 0 && (
              <div className="mt-3 space-y-2">
                {data.invoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <span>{inv.description}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={inv.status === "overdue" ? "destructive" : "secondary"}>
                        {inv.status}
                      </Badge>
                      <span className="font-medium">${Number(inv.amount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalDue > 0 && (
              <Button className="w-full mt-4" asChild>
                <Link href="/portal/pay">Pay Now</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Violations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Violations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.violations.length === 0 ? (
              <EmptyState icon={HomeIcon} title="No violations" description="Your home is in good standing!" />
            ) : (
              data.violations.map((v: any) => (
                <ViolationItem
                  key={v.id}
                  id={v.id}
                  type={v.type}
                  description={v.description}
                  status={v.status}
                  priority={v.priority}
                  homeAddress={data.home?.address || ""}
                  reportedAt={new Date(v.createdAt).toLocaleDateString()}
                  photoCount={v.photos?.length}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming meetings</p>
            ) : (
              data.meetings.map((m: any) => (
                <MeetingCard
                  key={m.id}
                  title={m.title}
                  type={m.type}
                  status={m.status}
                  date={new Date(m.scheduledAt).toLocaleDateString()}
                  time={new Date(m.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  location={m.location}
                  isVirtual={m.isVirtual}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Community News */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Community News</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.announcements.map((a: any) => (
              <AnnouncementBanner
                key={a.id}
                title={a.title}
                content={a.content}
                priority={a.priority}
                isPinned={a.isPinned}
                date={new Date(a.createdAt).toLocaleDateString()}
              />
            ))}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href="/documents">
              <FileText className="h-6 w-6" />
              <span className="text-xs">Documents</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href="/directory">
              <Users className="h-6 w-6" />
              <span className="text-xs">Directory</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href="/chat">
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs">AI Chat</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href="/portal/report">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-xs">Report Issue</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-around py-2">
            <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2" asChild>
              <Link href="/portal">
                <HomeIcon className="h-5 w-5" />
                <span className="text-[10px]">Home</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2" asChild>
              <Link href="/chat">
                <MessageSquare className="h-5 w-5" />
                <span className="text-[10px]">Chat</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2" asChild>
              <Link href="/documents">
                <FileText className="h-5 w-5" />
                <span className="text-[10px]">Docs</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2" asChild>
              <Link href="/portal/profile">
                <Users className="h-5 w-5" />
                <span className="text-[10px]">Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}