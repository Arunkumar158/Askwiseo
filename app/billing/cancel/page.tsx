"use client";

import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-8">
        <XCircle className="w-10 h-10 text-zinc-500" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight mb-4">Payment Cancelled</h1>
      <p className="text-zinc-400 max-w-md mb-12">
        The payment process was cancelled and your plan has not been changed. 
        If you had any issues, feel free to try again or contact support.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => router.push("/pricing")} 
          className="bg-white text-black hover:bg-zinc-200 rounded-xl px-8 h-12 font-semibold"
        >
          Try Again
        </Button>
        <Button 
          variant="ghost"
          onClick={() => router.push("/")} 
          className="text-zinc-400 hover:text-white rounded-xl px-8 h-12"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
