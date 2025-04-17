"use client";

import Link from "next/link";

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Test Page</h1>
      <div className="space-y-4">
        <Link href="/" className="block text-primary hover:underline">
          Go to Home
        </Link>
        <Link href="/contact" className="block text-primary hover:underline">
          Go to Contact
        </Link>
      </div>
    </div>
  );
} 