"use client";

import {useEffect} from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
