"use client";

import { ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export function MotionWrapper({
  children,
  className,
  ...motionProps
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
} 