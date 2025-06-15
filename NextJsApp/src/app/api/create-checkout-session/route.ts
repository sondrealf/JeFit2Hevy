import { NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const encryptDate = () => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const encryptionKey = 'ciciciakkakaskdkasd';
  
  // Create SHA-256 hash of the date using the key
  return crypto
    .createHmac('sha256', encryptionKey)
    .update(today)
    .digest('hex');
};

export async function POST(request: Request) {
  try {
    const { successUrl } = await request.json();
    const encryptedDate = encryptDate();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "JeFit to Hevy Full Access",
              description: "Process your complete workout history",
            },
            unit_amount: 299, // $2.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${successUrl}?${encryptedDate}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
