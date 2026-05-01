import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get("stripe-signature");
  const idempotencyKey = headers().get("idempotency-key") || "";

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Idempotency: check if this event was already processed
  if (idempotencyKey) {
    const existing = await prisma.activityLog.findFirst({
      where: { entityType: "stripe_event", entityId: idempotencyKey },
    });
    if (existing) {
      return NextResponse.json({ received: true, idempotency: true });
    }
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    await prisma.activityLog.create({
      data: {
        action: "Stripe webhook verification failed",
        entityType: "stripe_event",
        entityId: "unknown",
        details: { error: err.message },
      },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Log event receipt for PCI audit trail
    await prisma.activityLog.create({
      data: {
        action: "Stripe webhook received",
        entityType: "stripe_event",
        entityId: event.id,
        details: { type: event.type, idempotencyKey },
      },
    });

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }
      case "invoice.payment_succeeded": {
        // Handle subscription invoice if needed
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { invoiceId, communityId, homeId } = paymentIntent.metadata || {};
  if (!invoiceId) return;

  // Update payment status
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: { status: "completed" },
  });

  // Update invoice status
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "paid" },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      communityId: communityId || "",
      userId: "stripe_webhook",
      action: "Payment completed",
      entityType: "payment",
      entityId: paymentIntent.id,
      details: { amount: paymentIntent.amount, invoiceId },
    },
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: { status: "failed" },
  });
}
