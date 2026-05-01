"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSuccess(true);
    } catch {
      // silently fail
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>We sent a verification link to {email || "your email"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="rounded-md bg-primary/10 p-4 text-sm">
            <p className="font-medium text-primary">Check your inbox</p>
            <p className="text-muted-foreground mt-1">Click the link in the email to verify your account</p>
          </div>

          {resendSuccess ? (
            <p className="text-sm text-primary">Verification email resent!</p>
          ) : (
            <Button variant="ghost" onClick={handleResend} disabled={isResending}>
              {isResending ? "Resending..." : "Resend email"}
            </Button>
          )}

          <div className="text-sm text-muted-foreground">
            <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
