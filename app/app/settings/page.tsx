import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";
import { updateNumbering, updateTenantSettings } from "./actions";

export default async function SettingsPage() {
  const user = await requireTenant();
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId: user.tenantId }
  });
  const numbering = await prisma.numberSequence.findMany({
    where: { tenantId: user.tenantId }
  });

  const getSequence = (entityType: string) =>
    numbering.find((item) => item.entityType === entityType);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Settings</p>
        <h1 className="font-display text-3xl">Tenant configuration</h1>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="defaults">Tax + defaults</TabsTrigger>
          <TabsTrigger value="numbering">Numbering</TabsTrigger>
          <TabsTrigger value="customize">Customization</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business details</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateTenantSettings} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Business name</label>
                    <Input name="businessName" defaultValue={settings?.businessName ?? ""} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Business email</label>
                    <Input name="businessEmail" defaultValue={settings?.businessEmail ?? ""} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Business phone</label>
                    <Input
                      name="businessPhone"
                      placeholder="04 123 4567"
                      defaultValue={settings?.businessPhone ?? ""}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Business website</label>
                    <Input name="businessWebsite" defaultValue={settings?.businessWebsite ?? ""} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Business address</label>
                  <Textarea name="businessAddress" defaultValue={settings?.businessAddress ?? ""} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Logo URL</label>
                  <Input name="logoUrl" defaultValue={settings?.logoUrl ?? ""} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Currency</label>
                    <Input name="currency" defaultValue={settings?.currency ?? "NZD"} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Timezone</label>
                    <Input name="timezone" defaultValue={settings?.timezone ?? "Pacific/Auckland"} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle>Tax + defaults</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateTenantSettings} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">GST rate</label>
                    <Input
                      name="gstRate"
                      type="number"
                      step="0.01"
                      defaultValue={Number(settings?.gstRate ?? 0.15)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Tax mode</label>
                    <select
                      name="taxMode"
                      defaultValue={settings?.taxMode ?? "EXCLUSIVE"}
                      className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
                    >
                      <option value="EXCLUSIVE">Exclusive</option>
                      <option value="INCLUSIVE">Inclusive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Tax discount mode</label>
                    <select
                      name="taxDiscountMode"
                      defaultValue={settings?.taxDiscountMode ?? "TAX_BEFORE_DISCOUNT"}
                      className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
                    >
                      <option value="TAX_BEFORE_DISCOUNT">Tax before discount</option>
                      <option value="TAX_AFTER_DISCOUNT">Tax after discount</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Default quote terms</label>
                    <Textarea
                      name="defaultTermsQuote"
                      defaultValue={settings?.defaultTermsQuote ?? ""}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Default invoice terms</label>
                    <Textarea
                      name="defaultTermsInvoice"
                      defaultValue={settings?.defaultTermsInvoice ?? ""}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Time rounding (min)</label>
                    <Input
                      name="timeRoundingMinutes"
                      type="number"
                      defaultValue={settings?.timeRoundingMinutes ?? 15}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Default billable</label>
                    <select
                      name="defaultBillable"
                      defaultValue={String(settings?.defaultBillable ?? true)}
                      className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
                    >
                      <option value="true">Billable</option>
                      <option value="false">Non-billable</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Timesheet view</label>
                    <select
                      name="timesheetView"
                      defaultValue={settings?.timesheetView ?? "WEEKLY"}
                      className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numbering">
          <Card>
            <CardHeader>
              <CardTitle>Numbering</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateNumbering} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Job prefix</label>
                    <Input name="jobPrefix" defaultValue={getSequence("JOB")?.prefix ?? "J-"} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Quote prefix</label>
                    <Input name="quotePrefix" defaultValue={getSequence("QUOTE")?.prefix ?? "Q-"} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Invoice prefix</label>
                    <Input name="invoicePrefix" defaultValue={getSequence("INVOICE")?.prefix ?? "INV-"} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Next job #</label>
                    <Input name="jobNextNumber" type="number" defaultValue={getSequence("JOB")?.nextNumber ?? 1000} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Next quote #</label>
                    <Input name="quoteNextNumber" type="number" defaultValue={getSequence("QUOTE")?.nextNumber ?? 2000} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-700">Next invoice #</label>
                    <Input name="invoiceNextNumber" type="number" defaultValue={getSequence("INVOICE")?.nextNumber ?? 3000} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline">Update numbering</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom fields</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-700">
                  Define custom fields for jobs, clients, quotes, invoices, and leads. Coming soon.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Field name" disabled />
                  <select
                    disabled
                    className="h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm text-ink-500"
                  >
                    <option>Field type</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job stages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-700">
                  Manage custom job stages for your workflow. Coming soon.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Stage name" disabled />
                  <select
                    disabled
                    className="h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm text-ink-500"
                  >
                    <option>Status</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing rates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-700">
                  Override billing rates at the client, job, or task level. Coming soon.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Client default rate" disabled />
                  <Input placeholder="Job override rate" disabled />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-700">
                  Configure state-based alerts for jobs and leads. Coming soon.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Notification name" disabled />
                  <select
                    disabled
                    className="h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm text-ink-500"
                  >
                    <option>Trigger</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-700">
                  Upload storage is currently set to local filesystem. Provider settings coming soon.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Provider" defaultValue="Local filesystem" disabled />
                  <Input placeholder="Base path" defaultValue="/public/uploads" disabled />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
