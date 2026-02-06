"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

type Tenant = {
  id: string;
  name: string;
};

export function TenantSwitcher({
  tenants,
  activeTenantId,
  onSwitch
}: {
  tenants: Tenant[];
  activeTenantId?: string | null;
  onSwitch: (formData: FormData) => void;
}) {
  const active = tenants.find((tenant) => tenant.id === activeTenantId) ?? tenants[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <span className="text-sm font-semibold">{active?.name ?? "Select tenant"}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Active tenant</DropdownMenuLabel>
        {tenants.map((tenant) => (
          <DropdownMenuItem key={tenant.id} asChild>
            <form action={onSwitch} className="w-full">
              <input type="hidden" name="tenantId" value={tenant.id} />
              <button
                type="submit"
                className={`w-full text-left ${tenant.id === activeTenantId ? "font-semibold" : ""}`}
              >
                {tenant.name}
              </button>
            </form>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
