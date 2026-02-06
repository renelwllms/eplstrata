"use client";

import { Button } from "../ui/button";

export function PrintButton() {
  return (
    <Button size="sm" variant="outline" onClick={() => window.print()}>
      Print
    </Button>
  );
}
