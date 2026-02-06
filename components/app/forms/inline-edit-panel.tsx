"use client";

import { useState } from "react";
import { Button } from "../../ui/button";

export function InlineEditPanel({
  label = "Edit",
  children
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button type="button" variant="outline" onClick={() => setOpen((prev) => !prev)}>
        {open ? "Close" : label}
      </Button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
