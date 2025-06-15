"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadStripe } from "@stripe/stripe-js";
import { X } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentComponentProps {
  setShowPayment: (show: boolean) => void;
  age?: string;
}

export function PaymentComponent({
  setShowPayment,
  age,
}: PaymentComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Track when payment component is shown
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'payment_component_shown', {
        'event_category': 'Payment',
        'event_label': `Age: ${age || 'unknown'}`
      });
    }
  }, [age]);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // Track payment initiation
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'payment_initiated', {
          'event_category': 'Payment',
          'event_label': `Age: ${age || 'unknown'}`
        });
      }

      // Create a checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/`,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error("Payment error:", error);
        // Track payment error
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'payment_error', {
            'event_category': 'Payment',
            'event_label': error.message
          });
        }
      }
    } catch (err) {
      console.error("Error:", err);
      // Track general error
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'payment_error', {
          'event_category': 'Payment',
          'event_label': err instanceof Error ? err.message : 'Unknown error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-between items-center relative">
            <div className="w-6" /> {/* Spacer for balance */}
            <h2 className="text-xl font-semibold absolute left-1/2 -translate-x-1/2">
              Unlock Full Access
            </h2>
            <button
              onClick={() => setShowPayment(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-400">
            Your workout history is older than {age ?? "2"} years or you want to
            remove watermark. Pay a small fee to process your complete workout
            history.
          </p>
          <p className="text-2xl font-bold">$2.99</p>
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
