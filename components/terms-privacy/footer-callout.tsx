"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FooterCallout() {
  return (
    <div className="bg-muted/50">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold">Still have questions?</h2>
        <p className="mt-4 text-muted-foreground">
          Our support team is here to help you with any questions about our terms and privacy policy.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => window.location.href = "mailto:support@askwiseo.com"}
        >
          <Mail className="mr-2 h-4 w-4" />
          support@askwiseo.com
        </Button>
      </div>
    </div>
  );
} 