"use client";

import {motion, useScroll, useSpring} from "framer-motion";

export function ScrollProgress() {
  const {scrollYProgress} = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.2,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-[var(--accent)]"
      style={{scaleX}}
    />
  );
}
