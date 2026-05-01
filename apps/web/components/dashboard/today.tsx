"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingCard } from "@/components/custom/meeting-card";
import { Calendar, Clock } from "lucide-react";
import { EmptyState } from "@/components/custom/empty-state";

interface TodaySectionProps {
  meetings: Array<any>;
}

export function TodaySection({ meetings }: TodaySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nothing scheduled"
            description="No meetings or events today."
          />
        ) : (
          meetings.map((m) => (
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
  );
}
