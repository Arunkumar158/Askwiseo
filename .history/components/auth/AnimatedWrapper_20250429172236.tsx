"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedWrapperProps {
  children: ReactNode;
}

export function AnimatedWrapper({ children }: AnimatedWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "w-full max-w-md space-y-6 transition-all duration-500",
        isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
    >
      {children}
    </div>
  );
} 