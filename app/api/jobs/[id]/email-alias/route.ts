import { prisma } from "../../../../../lib/prisma";
import { requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { auditCrudStub } from "../../../../../lib/audit";

function buildAlias(jobNumber: string) {
  const slug = jobNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `job-${slug}@inbound.local`;
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("DOCUMENTS");
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { id: true, tenantId: true, jobNumber: true, inboundEmail: true }
    });

    if (!job || job.tenantId !== user.tenantId) {
      throw new Error("Job not found");
    }

    if (job.inboundEmail) {
      return jsonOk({ data: { inboundEmail: job.inboundEmail } });
    }

    const inboundEmail = buildAlias(job.jobNumber);
    const updated = await prisma.job.update({
      where: { id: job.id },
      data: { inboundEmail }
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Job",
      entityId: updated.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: { inboundEmail: updated.inboundEmail } }, 201);
  } catch (error) {
    return handleError(error);
  }
}
