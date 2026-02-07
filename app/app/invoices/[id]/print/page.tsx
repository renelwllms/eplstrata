import Link from "next/link";
import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { PrintButton } from "../../../../../components/app/print-button";
import { Button } from "../../../../../components/ui/button";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency }).format(value);
}

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const invoice = await prisma.invoice.findUnique({
    where: { id: id },
    include: { client: true, lineItems: true }
  });
  const settings = await prisma.tenantSettings.findUnique({ where: { tenantId: user.tenantId } });

  if (!invoice || invoice.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Invoice not found.</p>;
  }

  const currency = invoice.currency ?? settings?.currency ?? "NZD";
  const businessName = settings?.businessName ?? invoice.client?.name ?? "Company";
  const terms = settings?.defaultTermsInvoice ?? "Payment due as per agreed terms.";
  const address = settings?.businessAddress ?? "";

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-ink-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold">Invoice {invoice.number}</h1>
            <p className="text-sm text-ink-600">{invoice.client?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/app/invoices/${invoice.id}`}>Back to invoice</Link>
            </Button>
            <PrintButton />
          </div>
        </div>

        <div className="flex items-start justify-between gap-6 border-b border-sand-200 pb-6">
          <div>
            <h2 className="text-lg font-semibold">{businessName}</h2>
            {settings?.businessEmail && <p className="text-sm text-ink-600">{settings.businessEmail}</p>}
            {settings?.businessPhone && <p className="text-sm text-ink-600">{settings.businessPhone}</p>}
            {address && <p className="whitespace-pre-line text-sm text-ink-600">{address}</p>}
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Invoice</p>
            <p>Number: {invoice.number}</p>
            <p>Date: {invoice.createdAt.toLocaleDateString("en-NZ")}</p>
            <p>Status: {invoice.status}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Bill to</p>
          <p>{invoice.client?.name}</p>
          {invoice.client?.billingEmail && <p>{invoice.client.billingEmail}</p>}
          {invoice.client?.phone && <p>{invoice.client.phone}</p>}
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-sand-200 text-left">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Discount</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item) => {
              const qty = Number(item.quantity);
              const rate = Number(item.rate);
              const discount = Number(item.discountPercent);
              const amount = qty * rate * (1 - discount / 100);
              return (
                <tr key={item.id} className="border-b border-sand-100">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{qty}</td>
                  <td className="py-2 text-right">{formatCurrency(rate, currency)}</td>
                  <td className="py-2 text-right">{discount}%</td>
                  <td className="py-2 text-right">{formatCurrency(amount, currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(invoice.subtotal), currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{formatCurrency(Number(invoice.taxTotal), currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discounts</span>
              <span>{formatCurrency(Number(invoice.discountTotal), currency)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(Number(invoice.total), currency)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sm">
          <p className="font-semibold">Terms & conditions</p>
          <p className="mt-2 whitespace-pre-line text-ink-700">{terms}</p>
        </div>
      </div>
    </div>
  );
}
