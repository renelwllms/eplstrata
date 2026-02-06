"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Menu } from "lucide-react";
import { Bell, FileText, Receipt, Timer, Briefcase, Users, Settings, CreditCard, Target, Paperclip, ListChecks, CalendarClock, Gauge, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { InstallAppMenuItem } from "./install-app-menu-item";

export type IconKey =
  | "leads"
  | "quotes"
  | "clients"
  | "jobs"
  | "time"
  | "tasks"
  | "documents"
  | "schedule"
  | "capacity"
  | "invoices"
  | "billing"
  | "settings"
  | "notifications"
  | "userSettings";

type MenuItem = { href: string; label: string; icon: IconKey };
type MenuGroup = { label: string; items: MenuItem[] };

const iconMap = {
  leads: Target,
  quotes: FileText,
  clients: Users,
  jobs: Briefcase,
  time: Timer,
  tasks: ListChecks,
  documents: Paperclip,
  schedule: CalendarClock,
  capacity: Gauge,
  invoices: Receipt,
  billing: CreditCard,
  settings: Settings,
  notifications: Bell,
  userSettings: UserPlus
} as const;

export function MobileMenu({ groups }: { groups: MenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePopState = () => setOpen(false);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleSubmit = () => setOpen(false);
    window.addEventListener("submit", handleSubmit, true);
    return () => window.removeEventListener("submit", handleSubmit, true);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-sand-100 px-3 py-2 text-xs font-semibold text-ink-700"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-ink-700" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <InstallAppMenuItem />
        {groups.map((group) => (
          <div key={group.label}>
            <DropdownMenuItem className="text-xs font-semibold uppercase text-ink-500">
              {group.label === "Settings" ? "Account" : group.label}
            </DropdownMenuItem>
            {group.items.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  {(() => {
                    const ItemIcon = iconMap[item.icon] ?? Settings;
                    return <ItemIcon className="h-4 w-4 text-ink-700" />;
                  })()}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
