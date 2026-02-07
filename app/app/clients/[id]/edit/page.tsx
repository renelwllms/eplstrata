import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { ClientForm } from "../../../../../components/app/forms/client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const client = await prisma.client.findUnique({
    where: { id: id },
    select: {
      id: true,
      tenantId: true,
      name: true,
      status: true,
      billingEmail: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
      notes: true
    }
  });

  if (!client || client.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Client not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Clients</p>
        <h1 className="font-display text-3xl">Edit client</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm
            mode="edit"
            clientId={client.id}
            initial={client}
          />
        </CardContent>
      </Card>
    </div>
  );
}
