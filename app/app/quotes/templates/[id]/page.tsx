import Link from "next/link";
import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { DeleteButton } from "../../../../../components/app/forms/delete-button";

export default async function QuoteTemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const template = await prisma.quoteTemplate.findUnique({
    where: { id: id }
  });

  if (!template || template.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Template not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Quotes</p>
          <h1 className="font-display text-3xl">{template.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/quotes/templates" className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-sand-50">
            Back
          </Link>
          <DeleteButton
            endpoint={`/api/quote-templates/${template.id}`}
            confirmText="Delete this template?"
            redirectTo="/app/quotes/templates"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-ink-700">
          <p>Layout: {template.layout}</p>
          <p>Created: {template.createdAt.toISOString().slice(0, 10)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
