"use client";

import { useState, useEffect } from "react";

export function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateWindowWidth = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 0;
      setWindowWidth(width);
      setIsDesktop(width >= 768);
    };

    updateWindowWidth(); // ✅ Ensure the correct initial width

    window.addEventListener("resize", updateWindowWidth);
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []); // ✅ No dependencies needed

  return { windowWidth, isDesktop };
}
