import Link from "next/link";
import Image from "next/image";
import { Bell, LayoutGrid, FileText, Receipt, Timer, Briefcase, Users, Settings, CreditCard, Target, Paperclip, ChevronDown, ListChecks, CalendarClock, Gauge, UserPlus } from "lucide-react";
import { TenantSwitcher } from "./tenant-switcher";
import { UserMenu } from "./user-menu";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MobileMenu, type IconKey } from "./mobile-menu";

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
  notifications: Bell
  ,
  userSettings: UserPlus
} as const;

const navGroups: MenuGroup[] = [
  {
    label: "Sales",
    items: [
      { href: "/app/leads", label: "Leads", icon: "leads" },
      { href: "/app/quotes", label: "Quotes", icon: "quotes" },
      { href: "/app/clients", label: "Clients", icon: "clients" }
    ]
  },
  {
    label: "Operations",
    items: [
      { href: "/app/jobs", label: "Jobs", icon: "jobs" },
      { href: "/app/jobs/schedule", label: "Schedule", icon: "schedule" },
      { href: "/app/jobs/capacity", label: "Capacity", icon: "capacity" },
      { href: "/app/time", label: "Time", icon: "time" },
      { href: "/app/tasks", label: "Tasks", icon: "tasks" },
      { href: "/app/documents", label: "Documents", icon: "documents" }
    ]
  },
  {
    label: "Finance",
    items: [
      { href: "/app/invoices", label: "Invoices", icon: "invoices" },
      { href: "/app/billing", label: "Billing", icon: "billing" }
    ]
  },
  {
    label: "Settings",
    items: [
      { href: "/app/settings", label: "Settings", icon: "settings" },
      { href: "/app/settings/users", label: "Users", icon: "userSettings" },
      { href: "/app/notifications", label: "Notifications", icon: "notifications" }
    ]
  }
];

export function TopNav({
  tenants,
  activeTenantId,
  onSwitch,
  user,
  billingStatus,
  readOnly,
  isSuperAdmin,
  impersonationTenantName
}: {
  tenants: { id: string; name: string }[];
  activeTenantId?: string | null;
  onSwitch: (formData: FormData) => void;
  user: { name?: string | null; email?: string | null };
  billingStatus?: string;
  readOnly?: boolean;
  isSuperAdmin?: boolean;
  impersonationTenantName?: string | null;
}) {
  const adminItem: MenuItem = { href: "/app/admin/tenants", label: "Admin", icon: "settings" };
  const groups = navGroups.map((group) => ({
    ...group,
    items:
      isSuperAdmin && group.label === "Settings"
        ? [...group.items, adminItem]
        : [...group.items]
  }));

  return (
    <div className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href="/app/dashboard" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-3xl bg-white shadow-soft">
            <Image
              src="/edgepoint-logo.png"
              alt="EdgePoint Strata"
              fill
              className="object-contain"
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink-700">
              STRATA
            </p>
            <p className="text-xs text-ink-500">by EdgePoint</p>
          </div>
        </Link>

        <div className="flex flex-1 items-center gap-3">
          <div className="lg:hidden">
            <MobileMenu groups={groups} />
          </div>
          {isSuperAdmin && !impersonationTenantName ? (
            <Link
              href="/app/admin/tenants"
              className="hidden shrink-0 items-center gap-2 rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-900 hover:text-sand-50 lg:flex"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          ) : (
            <>
              <Link
                href="/app/dashboard"
                className="hidden shrink-0 items-center gap-2 rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-900 hover:text-sand-50 lg:flex"
              >
                <LayoutGrid className="h-4 w-4" />
                Dashboard
              </Link>
              {groups.map((group) => (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hidden shrink-0 items-center gap-2 rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-900 hover:text-sand-50 lg:flex"
                    >
                      {group.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                {group.items.map((item) => {
                  const ItemIcon = iconMap[item.icon as keyof typeof iconMap] ?? Settings;
                  return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <ItemIcon className="h-4 w-4 text-ink-700" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
            </>
          )}
          {isSuperAdmin && impersonationTenantName && (
            <Link
              href="/app/admin/tenants"
              className="hidden shrink-0 items-center rounded-2xl bg-amber-100 px-3 py-1.5 text-[11px] font-semibold text-amber-700 lg:flex"
            >
              <span className="flex flex-col leading-tight">
                <span className="uppercase tracking-[0.22em] text-[9px]">Impersonating</span>
                <span className="text-[11px]">{impersonationTenantName}</span>
              </span>
            </Link>
          )}
          {billingStatus && (
            <span
              className={`hidden shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold lg:flex ${
                readOnly ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {readOnly ? "Read-only" : billingStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
              <Link href="/app/admin/tenants">Admin</Link>
            </Button>
          )}
          {!isSuperAdmin && (
            <div className="hidden lg:block">
              <TenantSwitcher tenants={tenants} activeTenantId={activeTenantId} onSwitch={onSwitch} />
            </div>
          )}
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link href="/app/notifications" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Link>
          </Button>
          <UserMenu name={user.name} email={user.email} />
        </div>
      </div>
    </div>
  );
}
