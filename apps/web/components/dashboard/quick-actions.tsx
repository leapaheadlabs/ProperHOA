"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Calendar, Megaphone } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: AlertTriangle, label: "Violation", href: "/violations/new" },
    { icon: Calendar, label: "Meeting", href: "/meetings/new" },
    { icon: Megaphone, label: "Announcement", href: "/announcements/new" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen &&
        actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            className="gap-2 shadow-lg"
            asChild
            onClick={() => setIsOpen(false)}
          >
            <Link href={action.href}>
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className={`h-6 w-6 transition-transform ${isOpen ? "rotate-45" : ""}`} />
      </Button>
    </div>
  );
}
