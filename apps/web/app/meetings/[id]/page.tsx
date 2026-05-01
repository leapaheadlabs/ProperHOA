import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Video, FileText, CheckCircle } from "lucide-react";

export default async function MeetingDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const meeting = await prisma.meeting.findFirst({
    where: { id: params.id, communityId: session.user.communityId },
  });

  if (!meeting) {
    redirect("/meetings");
  }

  const agenda = JSON.parse(meeting.agenda || "[]");
  const minutes = JSON.parse(meeting.minutes || "[]");
  const isBoard = ["president", "treasurer", "secretary", "board_member"].includes(session.user.role || "");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={meeting.status === "in_progress" ? "default" : meeting.status === "completed" ? "outline" : "secondary"}>
              {meeting.status}
            </Badge>
            <Badge variant="outline">{meeting.type}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <p className="text-muted-foreground">{meeting.description}</p>
        </div>
        {isBoard && meeting.status === "scheduled" && (
          <Button>Start Meeting</Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(meeting.scheduledAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            {meeting.isVirtual ? <Video className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-primary" />}
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{meeting.location || "Virtual"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agenda">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda" className="space-y-3">
          {agenda.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No agenda items yet</p>
          ) : (
            agenda.map((item: any, i: number) => (
              <Card key={i}>
                <CardContent className="flex items-start gap-3 py-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    {item.duration && <p className="text-xs text-muted-foreground mt-1">{item.duration} min</p>}
                  </div>
                  {item.completed && <CheckCircle className="h-5 w-5 text-primary" />}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="minutes" className="space-y-3">
          {minutes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Minutes will be available after the meeting</p>
          ) : (
            minutes.map((item: any, i: number) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <p className="font-medium">{item.topic}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                  {item.vote && (
                    <Badge className="mt-2" variant={item.vote === "approved" ? "default" : "destructive"}>
                      {item.vote}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="attendance">
          <p className="text-muted-foreground text-center py-8">Attendance tracking coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
