import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Rocket } from "lucide-react";

const checklist = [
  { category: "Infrastructure", items: [
    { name: "VPS Provisioned", status: "pending" },
    { name: "Domain & DNS", status: "pending" },
    { name: "SSL/TLS (Caddy)", status: "pending" },
    { name: "Docker Compose Stack", status: "ready" },
    { name: "Health Checks", status: "ready" },
    { name: "Monitoring (Grafana)", status: "ready" },
  ]},
  { category: "Security", items: [
    { name: "Env Variables Configured", status: "ready" },
    { name: "Stripe Webhook Secret", status: "ready" },
    { name: "OAuth Credentials", status: "ready" },
    { name: "Rate Limiting", status: "ready" },
    { name: "Security Headers", status: "ready" },
    { name: "RLS Policies", status: "ready" },
  ]},
  { category: "Core Features", items: [
    { name: "Authentication", status: "ready" },
    { name: "Board Dashboard", status: "ready" },
    { name: "Homeowner Portal", status: "ready" },
    { name: "AI Assistant", status: "ready" },
    { name: "Dues & Payments", status: "ready" },
    { name: "Document Hub", status: "ready" },
    { name: "Meeting Manager", status: "ready" },
    { name: "Violations & ARC", status: "ready" },
    { name: "Compliance Calendar", status: "ready" },
    { name: "Directory & Maintenance", status: "ready" },
  ]},
  { category: "Quality", items: [
    { name: "TypeScript Clean", status: "ready" },
    { name: "Unit Tests", status: "ready" },
    { name: "E2E Tests", status: "ready" },
    { name: "CI/CD Pipeline", status: "ready" },
    { name: "Documentation", status: "ready" },
  ]},
];

function StatusIcon({ status }: { status: string }) {
  if (status === "ready") return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  if (status === "pending") return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  return <XCircle className="h-5 w-5 text-destructive" />;
}

export default function GoLivePage() {
  const totalItems = checklist.flatMap(c => c.items).length;
  const readyItems = checklist.flatMap(c => c.items).filter(i => i.status === "ready").length;
  const percentage = Math.round((readyItems / totalItems) * 100);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <Rocket className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Go-Live Status</h1>
        <p className="text-muted-foreground">ProperHOA v1.0.0 Launch Readiness</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{percentage}%</div>
              <p className="text-muted-foreground">{readyItems} of {totalItems} items ready</p>
            </div>
            <Badge variant={percentage >= 90 ? "default" : "secondary"} className="text-lg px-4 py-2">
              {percentage >= 90 ? "READY FOR LAUNCH" : "IN PROGRESS"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {checklist.map((section) => (
        <Card key={section.category}>
          <CardHeader>
            <CardTitle>{section.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === "ready" ? "default" : "outline"}>
                      {item.status}
                    </Badge>
                    <StatusIcon status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center text-sm text-muted-foreground">
        <p>See docs/GO_LIVE.md for full checklist and launch procedures.</p>
      </div>
    </div>
  );
}
