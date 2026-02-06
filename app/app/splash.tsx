"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function MobileSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const storageKey = "strata:splash:seen";
    let hasSeen = false;
    try {
      hasSeen = window.sessionStorage.getItem(storageKey) === "1";
    } catch (error) {
      hasSeen = false;
    }
    if (hasSeen) return;

    setVisible(true);
    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch (error) {
      // Ignore localStorage failures (private mode, blocked, etc.)
    }
    const timer = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="relative h-20 w-20">
        <Image src="/edgepoint-logo.png" alt="EdgePoint Strata" fill className="object-contain" />
      </div>
      <div className="mt-4 text-center">
        <p className="text-base font-semibold uppercase tracking-[0.32em] text-ink-700 animate-fade-in">
          STRATA
        </p>
        <p className="mt-1 text-xs text-ink-500">by EdgePoint</p>
      </div>
    </div>
  );
}
