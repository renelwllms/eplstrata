"use client";

import { useEffect } from "react";
import { Button } from "../../components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card-surface p-10">
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
  );
}
