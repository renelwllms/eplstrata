import { prisma } from "../../../../../lib/prisma";
import { requireFeature } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { getBillableSummary } from "../../../../../lib/services/billables";
import { billableSummarySchema } from "../../../../../lib/validators";
import { assertJobAccess } from "../../../../../lib/job-access";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("INVOICES");

    if (user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: id
      });
    }

    const summary = await getBillableSummary({
      tenantId: user.tenantId,
      jobId: id,
      client: prisma
    });

    return jsonOk({ data: summary });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("INVOICES");

    if (user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: id
      });
    }

    const body = await request.json();
    const payload = billableSummarySchema.parse(body);

    const summary = await getBillableSummary({
      tenantId: user.tenantId,
      jobId: id,
      client: prisma,
      timeEntryIds: payload.timeEntryIds,
      costEntryIds: payload.costEntryIds
    });

    return jsonOk({ data: summary });
  } catch (error) {
    return handleError(error);
  }
}
