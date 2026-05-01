import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MeetingCard } from "@/components/custom/meeting-card";
import { EmptyState } from "@/components/custom/empty-state";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

export default async function MeetingsPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const meetings = await prisma.meeting.findMany({
    where: { communityId: session.user.communityId },
    orderBy: { scheduledAt: "desc" },
  });

  const upcoming = meetings.filter((m: any) => m.status === "scheduled" && new Date(m.scheduledAt) >= new Date());
  const past = meetings.filter((m: any) => m.status === "completed" || new Date(m.scheduledAt) < new Date());

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-muted-foreground text-sm">Schedule and manage community meetings</p>
        </div>
        <Button asChild>
          <Link href="/meetings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Meeting
          </Link>
        </Button>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming
          </h2>
          {upcoming.map((m: any) => (
            <Link key={m.id} href={`/meetings/${m.id}`}>
              <MeetingCard
                title={m.title}
                type={m.type}
                status={m.status}
                date={new Date(m.scheduledAt).toLocaleDateString()}
                time={new Date(m.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                location={m.location || undefined}
                isVirtual={m.isVirtual}
                className="hover:border-primary transition-colors"
              />
            </Link>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Past Meetings</h2>
          {past.slice(0, 5).map((m: any) => (
            <Link key={m.id} href={`/meetings/${m.id}`}>
              <MeetingCard
                title={m.title}
                type={m.type}
                status={m.status}
                date={new Date(m.scheduledAt).toLocaleDateString()}
                time={new Date(m.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                location={m.location || undefined}
                isVirtual={m.isVirtual}
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
        </div>
      )}

      {meetings.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No meetings"
          description="Schedule your first community meeting."
          actionLabel="Schedule Meeting"
          onAction={() => {}}
        />
      )}
    </div>
  );
}
