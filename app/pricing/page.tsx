"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRazorpayOrder } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const order = await createRazorpayOrder(planId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: order.amount,
        currency: order.currency,
        name: "Askwiseo",
        description: "Upgrade Plan",
        order_id: order.order_id,
        handler: function (response: any) {
          toast.success("Payment successful! Your plan will be updated shortly.");
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your document analysis needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Free Plan */}
        <div className="border rounded-2xl p-6 flex flex-col bg-card">
          <h3 className="text-xl font-bold">Free</h3>
          <p className="text-sm text-muted-foreground mt-2">Perfect to try out Askwiseo</p>
          <div className="mt-4 flex items-baseline text-3xl font-extrabold">
            ₹0
            <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
          </div>
          <ul className="mt-6 space-y-4 flex-1">
            {["10 PDFs", "20 questions/day", "Basic AI Chat", "50MB Storage limit"].map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="h-5 w-5 text-violet-500 shrink-0 mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="w-full mt-8">
            <Link href="/">Get Started Free</Link>
          </Button>
        </div>

        {/* Starter Plan */}
        <div className="border rounded-2xl p-6 flex flex-col bg-card">
          <h3 className="text-xl font-bold">Starter</h3>
          <p className="text-sm text-muted-foreground mt-2">For regular document analysis</p>
          <div className="mt-4 flex items-baseline text-3xl font-extrabold">
            ₹499
            <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
          </div>
          <ul className="mt-6 space-y-4 flex-1">
            {["50 PDFs", "200 questions/month", "AI summaries", "15MB max file size", "Priority processing"].map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="h-5 w-5 text-violet-500 shrink-0 mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full mt-8 bg-violet-600 hover:bg-violet-700"
            onClick={() => handleUpgrade("starter")}
            disabled={!!loading}
          >
            {loading === "starter" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Upgrade Now
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-violet-600 rounded-2xl p-6 flex flex-col relative bg-card shadow-lg lg:scale-105 z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </span>
          </div>
          <h3 className="text-xl font-bold">Pro</h3>
          <p className="text-sm text-muted-foreground mt-2">For power users and professionals</p>
          <div className="mt-4 flex items-baseline text-3xl font-extrabold">
            ₹1499
            <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
          </div>
          <ul className="mt-6 space-y-4 flex-1">
            {[
              "Unlimited PDFs",
              "Unlimited questions",
              "50MB max file size",
              "Priority processing",
              "Better citations",
              "AI insights",
              "Saved chats",
              "Multi-document querying"
            ].map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="h-5 w-5 text-violet-500 shrink-0 mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full mt-8 bg-violet-600 hover:bg-violet-700"
            onClick={() => handleUpgrade("pro")}
            disabled={!!loading}
          >
            {loading === "pro" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Upgrade Now
          </Button>
        </div>

        {/* Enterprise Plan */}
        <div className="border rounded-2xl p-6 flex flex-col bg-card">
          <h3 className="text-xl font-bold">Enterprise</h3>
          <p className="text-sm text-muted-foreground mt-2">For teams and large organizations</p>
          <div className="mt-4 flex items-baseline text-3xl font-extrabold">
            Custom
          </div>
          <ul className="mt-6 space-y-4 flex-1">
            {[
              "Everything in Pro",
              "Team workspaces",
              "Admin dashboard",
              "API access",
              "Audit logs",
              "Dedicated support"
            ].map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="h-5 w-5 text-violet-500 shrink-0 mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full mt-8"
            onClick={() => window.location.href = "mailto:sales@askwiseo.com"}
          >
            Contact Sales
          </Button>
        </div>
      </div>

      <div className="mt-24 max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="group border rounded-lg p-4 bg-card">
            <summary className="flex cursor-pointer items-center justify-between font-medium">
              <span>Can I cancel anytime?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-muted-foreground mt-4 group-open:animate-fadeIn">
              Yes, you can cancel your subscription at any time. Your current plan will remain active until the end of your billing cycle.
            </p>
          </details>
          <details className="group border rounded-lg p-4 bg-card">
            <summary className="flex cursor-pointer items-center justify-between font-medium">
              <span>Is my data secure?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-muted-foreground mt-4 group-open:animate-fadeIn">
              Absolutely. We use industry-standard encryption for all data in transit and at rest. Your documents are private and only accessible by you.
            </p>
          </details>
          <details className="group border rounded-lg p-4 bg-card">
            <summary className="flex cursor-pointer items-center justify-between font-medium">
              <span>What happens when I hit the free limit?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-muted-foreground mt-4 group-open:animate-fadeIn">
              Once you hit your free limit, you will be prompted to upgrade to a paid plan to continue uploading documents or asking questions.
            </p>
          </details>
          <details className="group border rounded-lg p-4 bg-card">
            <summary className="flex cursor-pointer items-center justify-between font-medium">
              <span>Do you offer refunds?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-muted-foreground mt-4 group-open:animate-fadeIn">
              We do not offer refunds for partial months of service. If you are unsatisfied, please contact support and we will do our best to resolve your issue.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}