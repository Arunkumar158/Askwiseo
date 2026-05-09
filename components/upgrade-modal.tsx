import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { createRazorpayOrder } from "@/lib/api";
import toast from "react-hot-toast";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: "pdf_limit" | "question_limit";
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
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
          onClose();
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

  const title = reason === "pdf_limit" ? "PDF Upload Limit Reached" : "Daily Question Limit Reached";
  const description = reason === "pdf_limit" 
    ? "You've reached the maximum number of PDFs for your current plan. Upgrade to upload more documents."
    : "You've reached your daily question limit. Upgrade for unlimited questions and more powerful features.";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Starter Plan */}
          <div className="border rounded-2xl p-6 flex flex-col bg-card">
            <h3 className="text-xl font-bold">Starter</h3>
            <div className="mt-4 flex items-baseline text-3xl font-extrabold">
              ₹499
              <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-6 space-y-4 flex-1">
              {["50 PDFs", "200 questions/month", "AI summaries", "15MB uploads"].map((feature) => (
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
              Get Started
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-violet-600 rounded-2xl p-6 flex flex-col relative bg-card">
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <h3 className="text-xl font-bold">Pro</h3>
            <div className="mt-4 flex items-baseline text-3xl font-extrabold">
              ₹1499
              <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-6 space-y-4 flex-1">
              {[
                "Unlimited PDFs",
                "Unlimited questions",
                "Priority processing",
                "Better citations",
                "AI insights",
                "Saved chats",
                "Multi-document querying",
                "50MB uploads"
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
      </DialogContent>
    </Dialog>
  );
}
