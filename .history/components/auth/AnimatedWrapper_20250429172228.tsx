"use client";

import { ReactNode } from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";

interface AnimatedWrapperProps {
  children: ReactNode;
}

export function AnimatedWrapper({ children }: AnimatedWrapperProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {children}
      </m.div>
    </LazyMotion>
  );
} 