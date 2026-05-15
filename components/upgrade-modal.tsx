import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Zap } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { Badge } from "@/components/ui/badge";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: "pdf_limit" | "question_limit";
}

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { plan, startUpgrade } = usePlan();

  const handleUpgrade = async (planType: string) => {
    setLoading(planType);
    await startUpgrade(planType);
    setLoading(null);
  };

  const title = reason === "pdf_limit" ? "You've reached your PDF limit" : "You've reached your daily question limit";
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl bg-[#0a0a0a] border-white/10 text-white rounded-[2rem] overflow-hidden">
        <DialogHeader className="pt-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-violet-400" />
          </div>
          <DialogTitle className="text-3xl font-bold text-center tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-center text-zinc-400 text-lg mt-2">
            Upgrade your plan to unlock more potential and continue your research.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pb-8">
          {/* Free Plan */}
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-3xl" />
            <div className="relative h-full bg-[#111] rounded-3xl p-6 flex flex-col border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Free</h3>
                {plan?.plan === "free" && (
                  <Badge className="bg-white/10 text-white border-none text-[10px] uppercase tracking-widest font-bold">Current</Badge>
                )}
              </div>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-zinc-500 ml-1">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "10 PDFs",
                  "20 questions per day",
                  "Basic AI search",
                  "Standard processing"
                ].map((f) => (
                  <li key={f} className="flex items-center text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-violet-500 mr-3 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button disabled variant="outline" className="w-full rounded-xl border-white/10 bg-white/5 text-zinc-500">
                Current Plan
              </Button>
            </div>
          </div>

          {/* Starter Plan */}
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-b from-violet-500/20 to-transparent rounded-3xl" />
            <div className="relative h-full bg-[#111] rounded-3xl p-6 flex flex-col border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Starter</h3>
              </div>
              <div className="flex items-baseline mb-1">
                <span className="text-4xl font-bold">₹499</span>
                <span className="text-zinc-500 ml-1">/month</span>
              </div>
              <div className="text-xs text-zinc-500 mb-6">$5.99/mo international</div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "50 PDFs",
                  "200 questions / day",
                  "AI summaries",
                  "Basic insights",
                  "15MB uploads"
                ].map((f) => (
                  <li key={f} className="flex items-center text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-violet-500 mr-3 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handleUpgrade("starter")}
                disabled={!!loading}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold h-12"
              >
                {loading === "starter" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade to Starter"}
              </Button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-b from-violet-500 to-indigo-500 rounded-3xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative h-full bg-[#111] rounded-3xl p-6 flex flex-col border border-violet-500/50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Pro</h3>
                <Badge className="bg-violet-600 text-white border-none text-[10px] uppercase tracking-widest font-bold">Most Popular</Badge>
              </div>
              <div className="flex items-baseline mb-1">
                <span className="text-4xl font-bold">₹1499</span>
                <span className="text-zinc-500 ml-1">/month</span>
              </div>
              <div className="text-xs text-zinc-500 mb-6">$17.99/mo international</div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Unlimited PDFs",
                  "Unlimited questions",
                  "Priority processing",
                  "Advanced insights",
                  "Multi-document search",
                  "50MB uploads"
                ].map((f) => (
                  <li key={f} className="flex items-center text-sm text-zinc-200 font-medium">
                    <Check className="w-4 h-4 text-violet-400 mr-3 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handleUpgrade("pro")}
                disabled={!!loading}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold h-12 shadow-lg shadow-violet-500/20"
              >
                {loading === "pro" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-center pb-8">
          <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4 fill-current text-blue-500" viewBox="0 0 24 24"><path d="M20.007 21.003H3.993c-.55 0-1-.45-1-1V3.997c0-.55.45-1 1-1h16.014c.55 0 1 .45 1 1v16.006c0 .55-.45 1-1 1zM4.993 19.003h14.014V3.997H4.993v15.006z"/><path d="M11.5 15h1v1h-1zm2.5 0h1v1h-1zm-5 0h1v1h-1zm2.5-3h1v1h-1zm2.5 0h1v1h-1zm-5 0h1v1h-1zm2.5-3h1v1h-1zm2.5 0h1v1h-1zm-5 0h1v1h-1z"/></svg>
            Payments processed securely by PayPal. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
