import Link from "next/link";
import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { PrintButton } from "../../../../../components/app/print-button";
import { Button } from "../../../../../components/ui/button";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency }).format(value);
}

export default async function QuotePrintPage({ params }: { params: { id: string } }) {
  const user = await requireTenant();
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { client: true, lineItems: true }
  });
  const settings = await prisma.tenantSettings.findUnique({ where: { tenantId: user.tenantId } });

  if (!quote || quote.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Quote not found.</p>;
  }

  const currency = quote.currency ?? settings?.currency ?? "NZD";
  const businessName = settings?.businessName ?? quote.client?.name ?? "Company";
  const terms = settings?.defaultTermsQuote ?? "Quote valid as per agreed terms.";
  const address = settings?.businessAddress ?? "";

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-ink-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold">Quote {quote.number}</h1>
            <p className="text-sm text-ink-600">{quote.client?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/app/quotes/${quote.id}`}>Back to quote</Link>
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
            <p className="font-semibold">Quote</p>
            <p>Number: {quote.number}</p>
            <p>Date: {quote.createdAt.toLocaleDateString("en-NZ")}</p>
            <p>Status: {quote.status}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Prepared for</p>
          <p>{quote.client?.name}</p>
          {quote.client?.billingEmail && <p>{quote.client.billingEmail}</p>}
          {quote.client?.phone && <p>{quote.client.phone}</p>}
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
            {quote.lineItems.map((item) => {
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
              <span>{formatCurrency(Number(quote.subtotal), currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{formatCurrency(Number(quote.taxTotal), currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discounts</span>
              <span>{formatCurrency(Number(quote.discountTotal), currency)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(Number(quote.total), currency)}</span>
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
