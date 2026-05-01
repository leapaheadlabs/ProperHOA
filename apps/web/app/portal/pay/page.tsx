"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ clientSecret, invoiceId }: { clientSecret: string; invoiceId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/portal/pay/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
    } else {
      setIsSuccess(true);
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-xl font-semibold">Payment Successful!</h2>
        <p className="text-muted-foreground">Thank you for your payment.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={isLoading || !stripe}>
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

export default function PayPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        // Fetch current invoice
        const res = await fetch("/api/portal");
        const data = await res.json();
        const currentInvoice = data.dues?.invoices?.[0];
        setInvoice(currentInvoice);

        if (currentInvoice) {
          // Create payment intent
          const intentRes = await fetch("/api/payments/intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoiceId: currentInvoice.id }),
          });
          const intentData = await intentRes.json();
          setClientSecret(intentData.clientSecret);
        }
      } catch (error) {
        console.error("Payment init error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8 text-center">
        <h1 className="text-xl font-semibold">No pending invoices</h1>
        <p className="text-muted-foreground mt-2">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pay Dues</CardTitle>
          <CardDescription>
            {invoice.description} — ${Number(invoice.amount).toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm clientSecret={clientSecret} invoiceId={invoice.id} />
            </Elements>
          ) : (
            <Skeleton className="h-32" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
