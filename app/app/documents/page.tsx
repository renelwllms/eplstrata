import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { BulkList } from "../../../components/app/lists/bulk-list";

export default async function DocumentsPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const hasAccess = billing.featureFlags.has("DOCUMENTS") || user.platformRole === "SUPER_ADMIN";

  const documents = hasAccess
    ? await prisma.document.findMany({
        where: { tenantId: user.tenantId },
        include: { upload: true, links: true },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    : [];

  const jobs = await prisma.job.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Documents</p>
          <h1 className="font-display text-3xl">Job files</h1>
          <p className="text-sm text-ink-700">Store and track documents against work.</p>
        </div>
      </div>

      {!hasAccess && (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-700">
              Document management is not available on your current plan.
            </p>
          </CardContent>
        </Card>
      )}

      {hasAccess && (
        <Card>
          <CardHeader>
            <CardTitle>Upload a document</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action="/api/documents"
              method="post"
              encType="multipart/form-data"
              className="grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Title</label>
                <input
                  name="title"
                  className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
                  placeholder="Document title"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Job</label>
                <select
                  name="entityId"
                  className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
                  required
                >
                  <option value="">Select job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.name}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="entityType" value="JOB" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-ink-700">File</label>
                <input name="file" type="file" required className="mt-1 block w-full text-sm" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={billing.readOnly}>
                  Upload document
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {hasAccess && (
        <Card>
          <CardHeader>
            <CardTitle>Recent documents</CardTitle>
          </CardHeader>
          <CardContent>
            <BulkList
              resource="documents"
              emptyText="No documents yet."
              items={documents.map((doc) => ({
                id: doc.id,
                title: doc.title,
                subtitle: doc.upload.filename,
                meta: doc.upload.mimeType,
                href: `/app/documents/${doc.id}`
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
