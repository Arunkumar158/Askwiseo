"use client";

import { useState } from "react";
import { Check, Mail, Shield, Zap, Globe, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/usePlan";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  const { plan, startUpgrade } = usePlan();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planType: string) => {
    setLoading(planType);
    await startUpgrade(planType);
    setLoading(null);
  };

  const plans = [
    {
      name: "Free",
      tagline: "Perfect for students and occasional users",
      price: "₹0",
      priceUSD: "$0",
      features: [
        "10 PDFs storage",
        "20 questions / day",
        "Standard AI search",
        "Basic summaries",
        "150MB cloud storage",
        "Community support"
      ],
      buttonText: plan?.plan === "free" ? "Current Plan" : "Get Started Free",
      buttonVariant: "outline" as const,
      onClick: () => (window.location.href = "/signup"),
      disabled: plan?.plan === "free"
    },
    {
      name: "Starter",
      tagline: "Power up your research and analysis",
      price: "₹499",
      priceUSD: "$5.99",
      features: [
        "50 PDFs storage",
        "200 questions / day",
        "Deep AI insights",
        "Priority processing",
        "1.5GB cloud storage",
        "Email support",
        "AI-powered summaries"
      ],
      buttonText: plan?.plan === "starter" ? "Current Plan" : "Upgrade to Starter",
      buttonVariant: "default" as const,
      onClick: () => handleUpgrade("starter"),
      disabled: plan?.plan === "starter"
    },
    {
      name: "Pro",
      tagline: "Unlimited power for professionals",
      price: "₹1499",
      priceUSD: "$17.99",
      features: [
        "Unlimited PDFs",
        "Unlimited questions",
        "Advanced citations",
        "Multi-document search",
        "5GB cloud storage",
        "Priority 24/7 support",
        "Export capabilities"
      ],
      popular: true,
      buttonText: plan?.plan === "pro" ? "Current Plan" : "Upgrade to Pro",
      buttonVariant: "default" as const,
      onClick: () => handleUpgrade("pro"),
      disabled: plan?.plan === "pro"
    },
    {
      name: "Enterprise",
      tagline: "Dedicated infrastructure for teams",
      price: "Custom",
      priceUSD: "Custom",
      features: [
        "Everything in Pro",
        "Team workspaces",
        "Admin control panel",
        "SAML SSO & Security",
        "Custom storage limits",
        "Dedicated account manager",
        "API access"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      onClick: () => (window.location.href = "mailto:askwiseo@gmail.com"),
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20 px-4 py-1">Pricing Plans</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
            Scale your intelligence
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto">
            Choose the perfect plan to transform your static documents into an interactive knowledge base.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((p) => (
            <Card 
              key={p.name} 
              className={`relative overflow-hidden border transition-all duration-300 bg-[#0a0a0a] ${
                p.popular ? 'border-violet-500 shadow-[0_0_40px_-15px_rgba(124,58,237,0.3)]' : 'border-white/5 hover:border-white/10'
              }`}
            >
              {p.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
              )}
              {p.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-violet-600 text-white border-none text-[10px] uppercase font-bold tracking-widest">Most Popular</Badge>
                </div>
              )}
              
              <CardContent className="p-8 h-full flex flex-col">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                  <p className="text-zinc-500 text-sm h-10">{p.tagline}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-zinc-500">/mo</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-1">({p.priceUSD} for international)</div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start text-sm text-zinc-400 group">
                      <Check className="w-4 h-4 text-violet-500 mr-3 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={p.buttonVariant}
                  className={`w-full h-12 rounded-xl font-bold transition-all ${
                    p.popular 
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                  onClick={p.onClick}
                  disabled={p.disabled || !!loading}
                >
                  {loading === p.name ? <Zap className="w-4 h-4 animate-pulse" /> : p.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PayPal Trust Badge */}
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 text-center mb-24">
          <div className="flex items-center gap-6 mb-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <svg className="h-8 w-auto fill-current text-white" viewBox="0 0 24 24">
               <path d="M7 21h7.229c.523 0 .991-.304 1.205-.779l3.435-7.618a1.5 1.5 0 0 0-1.353-2.11H13.5l1-5h-3.5a1.5 1.5 0 0 0-1.472 1.21l-2.5 12.5a1.5 1.5 0 0 0 1.472 1.79zm1-12.5a.5.5 0 0 1 .49-.403h1.844l-.7 3.5h2.873a.5.5 0 0 1 .45.703l-3.085 6.84a.2.2 0 0 1-.182.117H8.5a.5.5 0 0 1-.49-.597z"/>
            </svg>
            <span className="text-xl font-bold tracking-tighter opacity-70">PayPal</span>
          </div>
          <p className="text-zinc-500 font-medium">Secure payments powered by PayPal. All transactions are encrypted and protected.</p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border-white/5 bg-[#0a0a0a] rounded-2xl px-6">
              <AccordionTrigger className="hover:no-underline py-6">Can I cancel anytime?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 pb-6">
                Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/5 bg-[#0a0a0a] rounded-2xl px-6">
              <AccordionTrigger className="hover:no-underline py-6">Is my data secure?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 pb-6">
                Absolutely. All your documents are private, encrypted at rest, and never used to train public models. You have full control over your data.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/5 bg-[#0a0a0a] rounded-2xl px-6">
              <AccordionTrigger className="hover:no-underline py-6">What happens when I hit the free limit?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 pb-6">
                Once you reach your PDF or question limit, you'll be prompted to upgrade to continue using the service. You can still access your existing documents.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-white/5 bg-[#0a0a0a] rounded-2xl px-6">
              <AccordionTrigger className="hover:no-underline py-6">Do you offer refunds?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 pb-6">
                Yes, we offer a 7-day money-back guarantee for any of our paid plans. If you're not satisfied, just contact our support team.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border-white/5 bg-[#0a0a0a] rounded-2xl px-6">
              <AccordionTrigger className="hover:no-underline py-6">Can I use this internationally?</AccordionTrigger>
              <AccordionContent className="text-zinc-400 pb-6">
                Yes, we accept PayPal payments worldwide and support multiple currencies through PayPal's secure checkout.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}