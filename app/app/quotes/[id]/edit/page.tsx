import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { QuoteForm } from "../../../../../components/app/forms/quote-form";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const [quote, clients, jobs, templates] = await Promise.all([
    prisma.quote.findUnique({
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
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Quotes</p>
        <h1 className="font-display text-3xl">Edit quote</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quote details</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
