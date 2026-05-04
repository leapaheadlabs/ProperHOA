"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "properhoa_onboarding_draft";

const roles = [
  {
    value: "president",
    label: "President",
    desc: "I lead the HOA board and oversee operations",
    emoji: "👑",
  },
  {
    value: "treasurer",
    label: "Treasurer",
    desc: "I manage finances, dues, and budgets",
    emoji: "💰",
  },
  {
    value: "secretary",
    label: "Secretary",
    desc: "I handle records, meetings, and communications",
    emoji: "📝",
  },
  {
    value: "board_member",
    label: "Board Member",
    desc: "I serve on the board in another capacity",
    emoji: "🏛️",
  },
  {
    value: "homeowner",
    label: "Homeowner / Resident",
    desc: "I live in the community",
    emoji: "🏠",
  },
];

interface FormData {
  communityName: string;
  communityAddress: string;
  communityCity: string;
  communityState: string;
  communityZip: string;
  unitCount: string;
  role: string;
  invites: string[];
}

const defaultFormData: FormData = {
  communityName: "",
  communityAddress: "",
  communityCity: "",
  communityState: "",
  communityZip: "",
  unitCount: "",
  role: "homeowner",
  invites: [],
};

type Step = "community" | "role" | "invite" | "complete";

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: "community", label: "Community", number: 1 },
  { key: "role", label: "Your Role", number: 2 },
  { key: "invite", label: "Invite", number: 3 },
  { key: "complete", label: "Done", number: 4 },
];

function loadDraft(): FormData {
  if (typeof window === "undefined") return defaultFormData;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultFormData, ...JSON.parse(saved) };
  } catch {
    /* ignore */
  }
  return defaultFormData;
}

function saveDraft(data: FormData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function getStepIndex(step: Step): number {
  return STEPS.findIndex((s) => s.key === step);
}

function getProgress(step: Step): number {
  const idx = getStepIndex(step);
  return Math.round(((idx + 1) / STEPS.length) * 100);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("community");
  const [form, setForm] = useState<FormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Load draft on mount
  useEffect(() => {
    setForm(loadDraft());
    setHydrated(true);
  }, []);

  // Save draft on change
  useEffect(() => {
    if (hydrated) saveDraft(form);
  }, [form, hydrated]);

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addInvite = useCallback(() => {
    const email = inviteInput.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    if (form.invites.includes(email)) {
      setError("This email is already in the list");
      return;
    }
    updateField("invites", [...form.invites, email]);
    setInviteInput("");
    setError("");
  }, [inviteInput, form.invites, updateField]);

  const removeInvite = useCallback(
    (email: string) => {
      updateField(
        "invites",
        form.invites.filter((e) => e !== email)
      );
    },
    [form.invites, updateField]
  );

  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.communityName,
          address: form.communityAddress,
          city: form.communityCity,
          state: form.communityState,
          zip: form.communityZip,
          totalHomes: form.unitCount ? parseInt(form.unitCount) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create community");
      }
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
        body: JSON.stringify({ role: form.role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to set role");
      }
      setStep("invite");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    setError("");
    setIsLoading(true);
    try {
      if (form.invites.length > 0) {
        const res = await fetch("/api/onboarding/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: form.invites }),
        });
        // Non-blocking — if it fails we still proceed
        if (!res.ok) console.warn("Invite send failed, continuing onboarding");
      }
      setStep("complete");
    } catch {
      // Non-blocking
      setStep("complete");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    clearDraft();
    router.push("/dashboard");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  const progress = getProgress(step);

  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold text-sm">
              P
            </div>
            <span className="font-bold text-gray-900">ProperHOA</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Step {getStepIndex(step) + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className="h-full bg-green-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator dots */}
      <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 px-4">
        {STEPS.map((s, i) => {
          const currentIdx = getStepIndex(step);
          const isCompleted = i < currentIdx;
          const isCurrent = s.key === step;
          return (
            <div key={s.key} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isCompleted && "bg-green-600 text-white",
                  isCurrent && "bg-green-600 text-white ring-2 ring-green-200",
                  !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? "✓" : s.number}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 w-8 sm:w-12",
                    i < currentIdx ? "bg-green-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex flex-1 items-start justify-center px-4 py-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === "community" && "Set up your community"}
              {step === "role" && "What's your role?"}
              {step === "invite" && "Invite neighbors"}
              {step === "complete" && "You're all set! 🎉"}
            </CardTitle>
            <CardDescription>
              {step === "community" &&
                "Tell us about your HOA so we can configure things for you"}
              {step === "role" &&
                "This helps us show you the right tools and dashboards"}
              {step === "invite" &&
                "Add neighbors so everyone can stay connected (optional)"}
              {step === "complete" &&
                "Your community is ready. Here's what to do next."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Step 1: Community Info */}
            {step === "community" && (
              <form
                onSubmit={handleCommunitySubmit}
                className="grid gap-4"
              >
                <div className="grid gap-1.5">
                  <Label htmlFor="name">
                    HOA / Community Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Willow Creek Estates"
                    value={form.communityName}
                    onChange={(e) => updateField("communityName", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Willow Creek Drive"
                    value={form.communityAddress}
                    onChange={(e) =>
                      updateField("communityAddress", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Austin"
                      value={form.communityCity}
                      onChange={(e) =>
                        updateField("communityCity", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="TX"
                      maxLength={2}
                      value={form.communityState}
                      onChange={(e) =>
                        updateField(
                          "communityState",
                          e.target.value.toUpperCase()
                        )
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      placeholder="78701"
                      value={form.communityZip}
                      onChange={(e) =>
                        updateField("communityZip", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="units">Number of Homes / Units</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="e.g. 42"
                    value={form.unitCount}
                    onChange={(e) => updateField("unitCount", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Communities under 25 homes are free forever
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Continue →"}
                </Button>
              </form>
            )}

            {/* Step 2: Role Selection */}
            {step === "role" && (
              <form onSubmit={handleRoleSubmit} className="grid gap-4">
                <RadioGroup
                  value={form.role}
                  onValueChange={(v) => updateField("role", v)}
                  className="grid gap-3"
                >
                  {roles.map((r) => (
                    <label
                      key={r.value}
                      htmlFor={r.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                        form.role === r.value
                          ? "border-green-600 bg-green-50"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <RadioGroupItem
                        value={r.value}
                        id={r.value}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{r.emoji}</span>
                          <span className="font-medium">{r.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("community")}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Continue →"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Invite Members */}
            {step === "invite" && (
              <div className="grid gap-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="neighbor@email.com"
                    value={inviteInput}
                    onChange={(e) => {
                      setInviteInput(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInvite();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addInvite}
                    disabled={!inviteInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {form.invites.length > 0 && (
                  <div className="space-y-2">
                    {form.invites.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span className="text-sm">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeInvite(email)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {form.invites.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    <p className="text-2xl mb-2">📬</p>
                    <p>
                      No invites yet. Add emails above or skip this step — you
                      can always invite later.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("role")}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-muted-foreground"
                    onClick={handleInviteSubmit}
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                    onClick={handleInviteSubmit}
                  >
                    {isLoading ? "Sending..." : "Send Invites →"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === "complete" && (
              <div className="grid gap-4">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-4xl mb-2">🎊</div>
                  <h3 className="font-semibold text-green-800">
                    Welcome to ProperHOA!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your community{" "}
                    <strong>{form.communityName || "is set up"}</strong> is ready
                    to go.
                  </p>
                </div>

                <div className="grid gap-3 text-sm">
                  <h4 className="font-medium text-muted-foreground uppercase tracking-wider text-xs">
                    What's next?
                  </h4>
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="text-lg">📋</span>
                    <div>
                      <p className="font-medium">Add your homes</p>
                      <p className="text-muted-foreground text-xs">
                        Set up the homes/units in your community for accurate
                        tracking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="text-lg">📄</span>
                    <div>
                      <p className="font-medium">Upload your documents</p>
                      <p className="text-muted-foreground text-xs">
                        Upload CC&amp;Rs, bylaws, and rules so the AI can answer
                        questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="text-lg">🗓️</span>
                    <div>
                      <p className="font-medium">Schedule your first meeting</p>
                      <p className="text-muted-foreground text-xs">
                        Get everyone together to kick things off
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleFinish}
                >
                  Go to Dashboard →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
