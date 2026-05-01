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
    const { invoiceId } = await req.json();

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
      amount: Math.round(Number(invoice.amount) * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        invoiceId: invoice.id,
        communityId,
        homeId: appUser?.homeId || "",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
});
