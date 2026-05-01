import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.auth.user.id;
  const communityId = req.auth.user.communityId;

  try {
    const { invoiceId, amount, paymentMethodId } = await req.json();

    // Verify invoice belongs to user's home
    const appUser = await prisma.appUser.findUnique({
      where: { authUserId: userId },
      include: { home: true },
    });

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, communityId, homeId: appUser?.homeId || "" },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(invoice.amount) * 100), // cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        invoiceId: invoice.id,
        communityId,
        homeId: appUser?.homeId || "",
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        communityId,
        homeId: appUser?.homeId || "",
        amount: Number(invoice.amount),
        stripePaymentIntentId: paymentIntent.id,
        status: paymentIntent.status === "succeeded" ? "completed" : "pending",
        paymentMethod: "card",
      },
    });

    // Update invoice status if payment succeeded
    if (paymentIntent.status === "succeeded") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "paid" },
      });
    }

    return NextResponse.json({
      success: paymentIntent.status === "succeeded",
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      payment: { id: payment.id, status: payment.status },
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message || "Payment processing failed" },
      { status: 500 }
    );
  }
});