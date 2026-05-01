"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const roles = [
  { value: "president", label: "President" },
  { value: "treasurer", label: "Treasurer" },
  { value: "secretary", label: "Secretary" },
  { value: "board_member", label: "Board Member" },
  { value: "homeowner", label: "Homeowner" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"community" | "role">("community");
  const [communityName, setCommunityName] = useState("");
  const [communityAddress, setCommunityAddress] = useState("");
  const [communityCity, setCommunityCity] = useState("");
  const [communityState, setCommunityState] = useState("");
  const [communityZip, setCommunityZip] = useState("");
  const [role, setRole] = useState("homeowner");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: communityName,
          address: communityAddress,
          city: communityCity,
          state: communityState,
          zip: communityZip,
        }),
      });
      if (!res.ok) throw new Error("Failed to create community");
      setStep("role");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to set role");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === "community" ? "Create your community" : "What is your role?"}
          </CardTitle>
          <CardDescription>
            {step === "community"
              ? "Set up your HOA community profile"
              : "Tell us your role in the community"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          {step === "community" ? (
            <form onSubmit={handleCommunitySubmit} className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Community Name</Label>
                <Input id="name" placeholder="Willow Creek Estates" value={communityName} onChange={(e) => setCommunityName(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Willow Creek Drive" value={communityAddress} onChange={(e) => setCommunityAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Austin" value={communityCity} onChange={(e) => setCommunityCity(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="TX" maxLength={2} value={communityState} onChange={(e) => setCommunityState(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input id="zip" placeholder="78701" value={communityZip} onChange={(e) => setCommunityZip(e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRoleSubmit} className="grid gap-4">
              <RadioGroup value={role} onValueChange={setRole} className="grid gap-3">
                {roles.map((r) => (
                  <div key={r.value} className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value={r.value} id={r.value} />
                    <Label htmlFor={r.value} className="flex-1 cursor-pointer font-normal">
                      {r.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Get Started"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
