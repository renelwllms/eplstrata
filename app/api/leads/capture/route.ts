import { prisma } from "../../../../lib/prisma";
import { jsonOk, handleError } from "../../../../lib/api";
import { leadCaptureSchema } from "../../../../lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = leadCaptureSchema.parse(body);

    const tenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId },
      include: {
        settings: true,
        subscriptions: {
          include: { plan: { include: { features: true } } },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        leadStages: { orderBy: { sortOrder: "asc" }, take: 1 }
      }
    });

    if (!tenant?.settings?.leadCaptureToken) {
      throw new Error("Lead capture not configured");
    }
    if (tenant.settings.leadCaptureToken !== payload.token) {
      throw new Error("Invalid lead capture token");
    }

    const subscription = tenant.subscriptions[0];
    const hasLeads = subscription?.plan.features.some((feature) => feature.code === "LEADS");
    if (!hasLeads) {
      throw new Error("Lead capture not available on current plan");
    }

    const stageId = tenant.leadStages[0]?.id;
    if (!stageId) {
      throw new Error("Lead stages not configured");
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        stageId,
        name: payload.name,
        company: payload.company,
        email: payload.email,
        phone: payload.phone,
        estimatedValue: payload.estimatedValue,
        notes: payload.notes,
        source: payload.source ?? "Lead capture"
      }
    });

    return jsonOk({ data: lead }, 201);
  } catch (error) {
    return handleError(error);
  }
}
