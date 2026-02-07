import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { DeleteButton } from "../../../../components/app/forms/delete-button";
import { InlineEditPanel } from "../../../../components/app/forms/inline-edit-panel";
import { ClientForm } from "../../../../components/app/forms/client-form";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const client = await prisma.client.findUnique({
    where: { id: id }
  });

  if (!client || client.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Client not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Clients</p>
          <h1 className="font-display text-3xl">{client.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton
            endpoint={`/api/clients/${client.id}`}
            confirmText="Delete this client?"
            redirectTo="/app/clients"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-ink-700">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-ink-500">Email</p>
              <p>{client.billingEmail ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-500">Phone</p>
              <p>{client.phone ?? "—"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-ink-500">Address</p>
            <p>
              {[client.addressLine1, client.addressLine2, client.city, client.region, client.postalCode, client.country]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
          </div>
          {client.notes && (
            <div>
              <p className="text-xs uppercase text-ink-500">Notes</p>
              <p>{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit client</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineEditPanel label="Edit client">
            <ClientForm
              mode="edit"
              clientId={client.id}
              initial={client}
            />
          </InlineEditPanel>
        </CardContent>
      </Card>
    </div>
  );
}
