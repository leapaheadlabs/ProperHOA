import { useState } from "react";
import Link from "next/link";
import { Home, FileText, MessageSquare, CreditCard, Bell } from "lucide-react";

export function MobileNav() {
  const [active, setActive] = useState("home");

  const items = [
    { id: "home", label: "Home", href: "/portal", icon: Home },
    { id: "documents", label: "Docs", href: "/documents", icon: FileText },
    { id: "chat", label: "AI Chat", href: "/chat", icon: MessageSquare },
    { id: "pay", label: "Pay", href: "/portal/pay", icon: CreditCard },
    { id: "alerts", label: "Alerts", href: "/portal", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActive(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
