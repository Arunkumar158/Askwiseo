"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Have questions, feedback, or just want to say hi? We'd love to hear from you.
        </p>
        <div className="mt-8">
          <Link href="/" className="text-primary hover:underline">
            Test Link: Go back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 