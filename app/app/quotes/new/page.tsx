import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { QuoteForm } from "../../../../components/app/forms/quote-form";

export default async function NewQuotePage() {
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
      select: { id: true, name: true }
    }),
    prisma.quoteTemplate.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Quotes</p>
        <h1 className="font-display text-3xl">New quote</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quote details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteForm clients={clients} jobs={jobs} templates={templates} />
        </CardContent>
      </Card>
    </div>
  );
}
