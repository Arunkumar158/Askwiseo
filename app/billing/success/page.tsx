"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PartyPopper, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";
import { apiFetch } from "@/lib/api";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refetch } = usePlan();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscription_id = searchParams.get("subscription_id") || searchParams.get("token"); // PayPal sometimes uses token
  const plan_type = searchParams.get("plan_type");

  useEffect(() => {
    async function verify() {
      if (!subscription_id || !plan_type) {
        setLoading(false);
        return;
      }

      try {
        await apiFetch(`/api/billing/success?subscription_id=${subscription_id}&plan_type=${plan_type}`);
        await refetch();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7c3aed", "#4f46e5", "#ffffff"]
        });
      } catch (err: any) {
        setError(err.message || "Failed to confirm subscription");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [subscription_id, plan_type, refetch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-6" />
        <h1 className="text-2xl font-bold tracking-tight">Confirming payment...</h1>
        <p className="text-zinc-500 mt-2">Please don't close this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8">
          <CheckCircle2 className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Something went wrong</h1>
        <p className="text-zinc-400 max-w-md mb-8">{error}</p>
        <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-zinc-200 rounded-xl px-8 h-12">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
        <div className="relative w-24 h-24 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-premium-glow">
          <PartyPopper className="w-12 h-12 text-violet-400" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
        Payment Successful!
      </h1>
      <p className="text-zinc-400 text-lg max-w-md mb-12">
        Your plan has been upgraded to <span className="text-white font-bold uppercase">{plan_type}</span>. 
        You now have access to premium features and increased limits.
      </p>

      <div className="flex gap-4">
        <Button 
          onClick={() => router.push("/")} 
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-10 h-14 font-bold text-lg shadow-lg shadow-violet-500/20 group"
        >
          <Home className="mr-2 h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <SuccessContent />
    </Suspense>
  );
}
