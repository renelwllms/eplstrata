import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { InvoiceForm } from "../../../../components/app/forms/invoice-form";

export default async function NewInvoicePage() {
  const user = await requireTenant();
  const [clients, jobs, templates] = await Promise.all([
    prisma.client.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.job.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, clientId: true }
    }),
    prisma.invoiceTemplate.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Invoices</p>
        <h1 className="font-display text-3xl">New invoice</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm clients={clients} jobs={jobs} templates={templates} />
        </CardContent>
      </Card>
    </div>
  );
}
