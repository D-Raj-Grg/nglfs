"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ProgressiveBlurProps {
  children: React.ReactNode;
  className?: string;
  maxBlur?: number;
}

export function ProgressiveBlur({
  children,
  className = "",
  maxBlur = 10,
}: ProgressiveBlurProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const blur = useTransform(scrollYProgress, [0, 1], [0, maxBlur]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        filter: useTransform(blur, (value) => `blur(${value}px)`),
        opacity,
      }}
    >
      {children}
    </motion.div>
  );
}
