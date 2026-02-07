import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { InvoiceForm } from "../../../../../components/app/forms/invoice-form";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const [invoice, clients, jobs, templates, jobLinks] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: id },
      include: { lineItems: true }
    }),
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
    }),
    prisma.invoiceJobLink.findMany({
      where: { tenantId: user.tenantId, invoiceId: id },
      select: { jobId: true }
    })
  ]);

  if (!invoice || invoice.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Invoice not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Invoices</p>
        <h1 className="font-display text-3xl">Edit invoice</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm
            mode="edit"
            invoiceId={invoice.id}
            clients={clients}
            jobs={jobs}
            templates={templates}
            initial={{
              number: invoice.number,
              clientId: invoice.clientId,
              templateId: invoice.templateId,
              status: invoice.status,
              billingMode: invoice.billingMode,
              progressPercent: invoice.progressPercent ?? undefined,
              jobIds: jobLinks.map((link) => link.jobId),
              lineItems: invoice.lineItems.map((item) => ({
                description: item.description,
                quantity: Number(item.quantity),
                rate: Number(item.rate),
                discountPercent: Number(item.discountPercent)
              }))
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
