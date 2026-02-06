"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallAppMenuItem() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <DropdownMenuItem asChild>
      <button type="button" className="flex w-full items-center gap-2" onClick={handleInstall}>
        <Download className="h-4 w-4 text-ink-700" />
        Install App
      </button>
    </DropdownMenuItem>
  );
}
