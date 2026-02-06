import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { DeleteButton } from "../../../../components/app/forms/delete-button";
import { DuplicateButton } from "../../../../components/app/forms/duplicate-button";
import { InlineEditPanel } from "../../../../components/app/forms/inline-edit-panel";
import { InvoiceForm } from "../../../../components/app/forms/invoice-form";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const user = await requireTenant();
  const [invoice, clients, jobs, templates, jobLinks] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: params.id },
      include: { client: true, lineItems: true }
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
      where: { tenantId: user.tenantId, invoiceId: params.id },
      select: { jobId: true }
    })
  ]);

  if (!invoice || invoice.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Invoice not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Invoices</p>
          <h1 className="font-display text-3xl">{invoice.number}</h1>
          <p className="text-sm text-ink-700">{invoice.client.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <DuplicateButton endpoint={`/api/invoices/${invoice.id}/duplicate`} redirectBase="/app/invoices" />
          <Button asChild variant="outline" size="sm">
            <Link href={`/app/invoices/${invoice.id}/print`} target="_blank">
              Print
            </Link>
          </Button>
          <DeleteButton
            endpoint={`/api/invoices/${invoice.id}`}
            confirmText="Delete this invoice?"
            redirectTo="/app/invoices"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm text-ink-700">
          <Badge variant={invoice.status === "PAID" ? "success" : "default"}>{invoice.status}</Badge>
          <span>Billing mode: {invoice.billingMode}</span>
          <span>Total: NZ$ {Number(invoice.total).toFixed(2)}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {invoice.lineItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/70 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.description}</span>
                  <span>NZ$ {Number(item.rate).toFixed(2)}</span>
                </div>
                <p className="text-xs text-ink-700">
                  Qty {Number(item.quantity)} · Discount {Number(item.discountPercent)}%
                </p>
              </div>
            ))}
            {invoice.lineItems.length === 0 && (
              <p className="text-sm text-ink-700">No line items.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineEditPanel label="Edit invoice">
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
          </InlineEditPanel>
        </CardContent>
      </Card>
    </div>
  );
}
