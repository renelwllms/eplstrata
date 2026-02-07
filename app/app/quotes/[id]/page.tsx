import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { DeleteButton } from "../../../../components/app/forms/delete-button";
import { DuplicateButton } from "../../../../components/app/forms/duplicate-button";
import { InlineEditPanel } from "../../../../components/app/forms/inline-edit-panel";
import { QuoteForm } from "../../../../components/app/forms/quote-form";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const [quote, clients, jobs, templates] = await Promise.all([
    prisma.quote.findUnique({
      where: { id: id },
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
      select: { id: true, name: true }
    }),
    prisma.quoteTemplate.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true }
    })
  ]);

  if (!quote || quote.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Quote not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Quotes</p>
          <h1 className="font-display text-3xl">{quote.number}</h1>
          <p className="text-sm text-ink-700">{quote.client.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <DuplicateButton endpoint={`/api/quotes/${quote.id}/duplicate`} redirectBase="/app/quotes" />
          <Button asChild variant="outline" size="sm">
            <Link href={`/app/quotes/${quote.id}/print`} target="_blank">
              Print
            </Link>
          </Button>
          <DeleteButton
            endpoint={`/api/quotes/${quote.id}`}
            confirmText="Delete this quote?"
            redirectTo="/app/quotes"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm text-ink-700">
          <Badge variant={quote.status === "ACCEPTED" ? "success" : "default"}>{quote.status}</Badge>
          <span>Approval: {quote.approvalStatus}</span>
          <span>Total: NZ$ {Number(quote.total).toFixed(2)}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {quote.lineItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/70 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.description}</span>
                  <span>NZ$ {Number(item.rate).toFixed(2)}</span>
                </div>
                <p className="text-xs text-ink-700">
                  Qty {Number(item.quantity)} · Discount {Number(item.discountPercent)}% · {item.isOptional ? "Optional" : "Required"}
                </p>
              </div>
            ))}
            {quote.lineItems.length === 0 && (
              <p className="text-sm text-ink-700">No line items.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit quote</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineEditPanel label="Edit quote">
            <QuoteForm
              mode="edit"
              quoteId={quote.id}
              clients={clients}
              jobs={jobs}
              templates={templates}
              initial={{
                number: quote.number,
                clientId: quote.clientId,
                jobId: quote.jobId,
                templateId: quote.templateId,
                status: quote.status,
                approvalStatus: quote.approvalStatus,
                isMaster: quote.isMaster,
                lineItems: quote.lineItems.map((item) => ({
                  description: item.description,
                  quantity: Number(item.quantity),
                  rate: Number(item.rate),
                  discountPercent: Number(item.discountPercent),
                  isOptional: item.isOptional
                }))
              }}
            />
          </InlineEditPanel>
        </CardContent>
      </Card>
    </div>
  );
}
