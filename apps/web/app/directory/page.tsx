import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/custom/empty-state";
import { Users, Mail, Phone } from "lucide-react";

export default async function DirectoryPage() {
  const session = await auth();
  if (!session?.user?.communityId) {
    redirect("/auth/onboarding");
  }

  const appUsers = await prisma.appUser.findMany({
    where: { communityId: session.user.communityId },
    include: { home: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Community Directory</h1>
        <p className="text-muted-foreground text-sm">Opt-in resident contact sharing</p>
      </div>

      {appUsers.length === 0 ? (
        <EmptyState icon={Users} title="No residents" description="Invite residents to join the community." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {appUsers.map((user: any) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{(user.name || "R").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{user.name || "Resident"}</CardTitle>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.home && (
                  <p className="text-sm text-muted-foreground">
                    {user.home.address} {user.home.unitNumber && `Unit ${user.home.unitNumber}`}
                  </p>
                )}
                {user.isBoardMember && (
                  <Badge variant="secondary" className="w-fit">Board Member</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
