"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: "Free Plan",
      price: isYearly ? "₹0/year" : "₹0/month",
      description: "Perfect for getting started with document intelligence",
      features: [
        { text: "Upload up to 10 PDFs", included: true },
        { text: "Ask 50 AI queries/month", included: true },
        { text: "Basic insights", included: true },
        { text: "No priority support", included: false },
        { text: "No export features", included: false },
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro Plan",
      price: isYearly ? "₹38,390/year" : "₹3,999/month",
      description: "Most popular for professionals and small teams",
      features: [
        { text: "Upload up to 500 PDFs", included: true },
        { text: "Unlimited AI queries", included: true },
        { text: "Chat export to PDF/Markdown", included: true },
        { text: "Smart tagging and summaries", included: true },
        { text: "Priority processing", included: true },
        { text: "Team sharing (up to 5 users)", included: true },
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Enterprise Plan",
      price: "Custom Pricing",
      description: "For large organizations with advanced needs",
      features: [
        { text: "Unlimited everything", included: true },
        { text: "Custom integrations (Slack, API)", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Advanced security and support", included: true },
        { text: "Custom training and onboarding", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  const addOns = [
    {
      name: "Additional PDFs",
      price: "₹499/month",
      description: "Per additional 100 PDFs",
    },
    {
      name: "Multilingual Support",
      price: "₹999/month",
      description: "For multilingual document support",
    },
  ]

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
    },
    {
      question: "What happens if I hit my query limit?",
      answer: "If you reach your monthly query limit, you'll be notified and can upgrade your plan to continue using the service.",
    },
    {
      question: "Do you store my PDFs securely?",
      answer: "Yes, all documents are encrypted at rest and in transit. We use industry-standard security practices to protect your data.",
    },
    {
      question: "Can I switch between plans?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans if you're not satisfied with our service.",
    },
  ]

  return (
    <div className="container py-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500">
          Unlock the Full Power of Document Intelligence
        </h1>
        <p className="text-xl text-muted-foreground">
          From chaos to clarity — Askwiseo turns your PDFs into answers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 transition-all duration-300">
            Start Free Trial
          </Button>
          <p className="text-sm text-muted-foreground flex items-center justify-center">
            No credit card required
          </p>
        </div>
      </section>

      {/* Pricing Toggle */}
      <div className="flex items-center justify-center space-x-2">
        <Label htmlFor="billing-toggle" className={cn("text-sm", !isYearly && "text-foreground font-medium")}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-violet-600"
        />
        <Label htmlFor="billing-toggle" className={cn("text-sm", isYearly && "text-foreground font-medium")}>
          Yearly
          <span className="ml-1 text-xs text-violet-600 font-medium">Save 20%</span>
        </Label>
      </div>

      {/* Pricing Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "relative flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
              plan.popular && "border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            )}
          >
            {plan.popular && (
              <Badge className="absolute top-0 right-0 m-4 bg-violet-600 hover:bg-violet-700">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                {isYearly && plan.name !== "Enterprise Plan" && (
                  <span className="text-sm text-muted-foreground ml-2">billed annually</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-violet-600 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    )}
                    <span className={cn("text-sm", !feature.included && "text-muted-foreground")}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={cn(
                  "w-full",
                  plan.popular 
                    ? "bg-violet-600 hover:bg-violet-700" 
                    : plan.name === "Enterprise Plan"
                    ? "bg-secondary hover:bg-secondary/80"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* Add-ons Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Add-ons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {addOns.map((addon) => (
            <Card key={addon.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{addon.name}</CardTitle>
                <CardDescription>{addon.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-2xl font-bold">{addon.price}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Add to Plan</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-secondary/30 rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Trust & Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-medium">Data Encrypted</h3>
            <p className="text-sm text-muted-foreground">At rest and in transit</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-medium">SOC2 Compliance</h3>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-medium">Powered by</h3>
            <p className="text-sm text-muted-foreground">Firebase and OpenAI</p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
} 