import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { DeleteButton } from "../../../../components/app/forms/delete-button";
import { InlineEditPanel } from "../../../../components/app/forms/inline-edit-panel";
import { DocumentForm } from "../../../../components/app/forms/document-form";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const document = await prisma.document.findUnique({
    where: { id: id },
    include: { upload: true }
  });

  if (!document || document.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Document not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Documents</p>
          <h1 className="font-display text-3xl">{document.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton
            endpoint={`/api/documents/${document.id}`}
            confirmText="Delete this document?"
            redirectTo="/app/documents"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-ink-700">
          <p>File: {document.upload.filename}</p>
          <p>Type: {document.upload.mimeType}</p>
          <p>Size: {document.upload.sizeBytes} bytes</p>
          {document.description && <p>Description: {document.description}</p>}
          {document.upload.url && (
            <a className="text-sm font-semibold text-ink-700 underline" href={document.upload.url}>
              View file
            </a>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit document</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineEditPanel label="Edit document">
            <DocumentForm documentId={document.id} initial={document} />
          </InlineEditPanel>
        </CardContent>
      </Card>
    </div>
  );
}
