"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function AiAssistantCta() {
  return (
    <Button asChild className="gap-2">
      <Link href="/chat">
        <Sparkles className="h-4 w-4" />
        AI Assistant
      </Link>
    </Button>
  );
}
