import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { DocumentForm } from "../../../../../components/app/forms/document-form";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const document = await prisma.document.findUnique({
    where: { id: id },
    select: { id: true, tenantId: true, title: true, description: true }
  });

  if (!document || document.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Document not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Documents</p>
        <h1 className="font-display text-3xl">Edit document</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Document details</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm documentId={document.id} initial={document} />
        </CardContent>
      </Card>
    </div>
  );
}
