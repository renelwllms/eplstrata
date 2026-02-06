"use client";

import { useEffect } from "react";
import { Button } from "../components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="app-shell-bg min-h-screen flex items-center justify-center p-6">
        <div className="card-surface max-w-md p-8">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-ink-700">{error.message}</p>
          <div className="mt-4 rounded-2xl border border-sand-100 bg-sand-50 p-4 text-sm text-ink-700">
            <p className="font-semibold">Need help?</p>
            <p className="mt-1">Call 0800334376 or email suppor@edgepoint.co.nz</p>
          </div>
          <Button className="mt-6" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
