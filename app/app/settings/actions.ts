"use server";

import { prisma } from "../../../lib/prisma";
import { requireWriteAccess } from "../../../lib/guards";
import { hasRole } from "../../../lib/rbac";
import { auditCrudStub } from "../../../lib/audit";
import type { TaxDiscountMode, TaxMode, TimesheetView } from "@prisma/client";
import { brandingSettingsSchema } from "../../../lib/validators";

export async function updateTenantSettings(formData: FormData) {
  const { user } = await requireWriteAccess("CUSTOMISATION");
  if (!user.role || !hasRole("ADMIN", user.role)) {
    throw new Error("Insufficient role");
  }

  const brandingPayload = brandingSettingsSchema.parse({
    businessName: formData.get("businessName") ?? undefined,
    businessEmail: formData.get("businessEmail") ?? undefined,
    businessPhone: formData.get("businessPhone") ?? undefined,
    businessWebsite: formData.get("businessWebsite") ?? undefined,
    businessAddress: formData.get("businessAddress") ?? undefined,
    logoUrl: formData.get("logoUrl") ?? undefined
  });

  await prisma.tenantSettings.upsert({
    where: { tenantId: user.tenantId },
    update: {
      businessName: brandingPayload.businessName,
      businessEmail: brandingPayload.businessEmail,
      businessPhone: brandingPayload.businessPhone,
      businessWebsite: brandingPayload.businessWebsite,
      businessAddress: brandingPayload.businessAddress,
      logoUrl: brandingPayload.logoUrl,
      currency: String(formData.get("currency") ?? "NZD"),
      timezone: String(formData.get("timezone") ?? "Pacific/Auckland"),
      gstRate: Number(formData.get("gstRate") ?? 0.15),
      taxMode: String(formData.get("taxMode") ?? "EXCLUSIVE") as TaxMode,
      taxDiscountMode: String(formData.get("taxDiscountMode") ?? "TAX_BEFORE_DISCOUNT") as TaxDiscountMode,
      timeRoundingMinutes: Number(formData.get("timeRoundingMinutes") ?? 15),
      defaultBillable: String(formData.get("defaultBillable") ?? "true") === "true",
      timesheetView: String(formData.get("timesheetView") ?? "WEEKLY") as TimesheetView,
      defaultTermsQuote: String(formData.get("defaultTermsQuote") ?? ""),
      defaultTermsInvoice: String(formData.get("defaultTermsInvoice") ?? "")
    },
    create: {
      tenantId: user.tenantId,
      businessName: brandingPayload.businessName,
      businessEmail: brandingPayload.businessEmail,
      businessPhone: brandingPayload.businessPhone,
      businessWebsite: brandingPayload.businessWebsite,
      businessAddress: brandingPayload.businessAddress,
      logoUrl: brandingPayload.logoUrl,
      currency: String(formData.get("currency") ?? "NZD"),
      timezone: String(formData.get("timezone") ?? "Pacific/Auckland"),
      gstRate: Number(formData.get("gstRate") ?? 0.15),
      taxMode: String(formData.get("taxMode") ?? "EXCLUSIVE") as TaxMode,
      taxDiscountMode: String(formData.get("taxDiscountMode") ?? "TAX_BEFORE_DISCOUNT") as TaxDiscountMode,
      timeRoundingMinutes: Number(formData.get("timeRoundingMinutes") ?? 15),
      defaultBillable: String(formData.get("defaultBillable") ?? "true") === "true",
      timesheetView: String(formData.get("timesheetView") ?? "WEEKLY") as TimesheetView,
      defaultTermsQuote: String(formData.get("defaultTermsQuote") ?? ""),
      defaultTermsInvoice: String(formData.get("defaultTermsInvoice") ?? "")
    }
  });

  await auditCrudStub({
    tenantId: user.tenantId,
    actorUserId: user.id,
    entityType: "TenantSettings",
    entityId: user.tenantId,
    operation: "UPDATE"
  });
}

export async function updateNumbering(formData: FormData) {
  const { user } = await requireWriteAccess("CUSTOMISATION");
  if (!user.role || !hasRole("ADMIN", user.role)) {
    throw new Error("Insufficient role");
  }

  const types = ["JOB", "QUOTE", "INVOICE"] as const;

  for (const type of types) {
    const prefix = String(formData.get(`${type.toLowerCase()}Prefix`) ?? "");
    const nextNumber = Number(formData.get(`${type.toLowerCase()}NextNumber`) ?? 1);

    await prisma.numberSequence.upsert({
      where: { tenantId_entityType: { tenantId: user.tenantId, entityType: type } },
      update: {
        prefix,
        nextNumber
      },
      create: {
        tenantId: user.tenantId,
        entityType: type,
        prefix,
        nextNumber
      }
    });
  }

  await auditCrudStub({
    tenantId: user.tenantId,
    actorUserId: user.id,
    entityType: "NumberSequence",
    entityId: user.tenantId,
    operation: "UPDATE"
  });
}
