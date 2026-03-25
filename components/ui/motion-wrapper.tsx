"use client";

import { ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function MotionWrapper({
  children,
  className,
  delay = 0,
  ...motionProps
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}