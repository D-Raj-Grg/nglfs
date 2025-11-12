"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -20 },
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Slide transitions for specific use cases
export function SlideTransition({
  children,
  direction = "right",
  className = "",
}: PageTransitionProps & { direction?: "left" | "right" | "up" | "down" }) {
  const pathname = usePathname();

  const slideVariants = {
    hidden: {
      opacity: 0,
      x: direction === "right" ? 100 : direction === "left" ? -100 : 0,
      y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
    },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: {
      opacity: 0,
      x: direction === "right" ? -100 : direction === "left" ? 100 : 0,
      y: direction === "up" ? -100 : direction === "down" ? 100 : 0,
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={slideVariants}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.3,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
