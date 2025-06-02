import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { successUrl } = await request.json();

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
            unit_amount: 399, // $3.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl + "?bypass-je.fit",
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
