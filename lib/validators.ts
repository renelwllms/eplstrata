import { z } from "zod";

export const idSchema = z.string().min(1);

export const clientCreateSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  billingEmail: z.string().email().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional()
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const taskCreateSchema = z.object({
  name: z.string().min(1),
  defaultBillableRate: z.number().nonnegative().optional(),
  isActive: z.boolean().optional()
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const jobCreateSchema = z.object({
  clientId: idSchema,
  jobNumber: z.string().min(1).optional(),
  name: z.string().min(1),
  status: z.enum(["QUOTE", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  budgetMinutes: z.number().int().positive().optional(),
  assigneeIds: z.array(idSchema).optional()
});

export const jobUpdateSchema = jobCreateSchema.partial();

export const phaseCreateSchema = z.object({
  name: z.string().min(1),
  budgetMinutes: z.number().int().positive().optional(),
  customField: z.string().optional()
});

export const phaseUpdateSchema = phaseCreateSchema.partial();

export const jobMilestoneCreateSchema = z.object({
  name: z.string().min(1),
  dueDate: z.string().optional(),
  isComplete: z.boolean().optional()
});

export const jobMilestoneUpdateSchema = jobMilestoneCreateSchema.partial();

export const jobRecurrenceCreateSchema = z.object({
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  interval: z.number().int().positive().optional(),
  startDate: z.string().min(10),
  endDate: z.string().optional()
});

export const jobRecurrenceUpdateSchema = jobRecurrenceCreateSchema.partial();

export const timeEntryCreateSchema = z.object({
  userId: idSchema.optional(),
  jobId: idSchema,
  taskCatalogId: idSchema,
  phaseId: idSchema.optional(),
  date: z.string().min(10),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  source: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  billable: z.boolean().optional(),
  notes: z.string().optional()
});

export const timeEntryUpdateSchema = timeEntryCreateSchema.partial();

export const weekQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const costCreateSchema = z.object({
  jobId: idSchema,
  description: z.string().min(1),
  qty: z.number().positive(),
  unitCost: z.number().nonnegative(),
  markupPercent: z.number().nonnegative(),
  billable: z.boolean().optional()
});

export const costUpdateSchema = costCreateSchema.partial();

export const quoteLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  discountPercent: z.number().nonnegative().optional(),
  isOptional: z.boolean().optional()
});

export const quoteCreateSchema = z.object({
  clientId: idSchema,
  jobId: idSchema.optional(),
  templateId: idSchema.optional(),
  number: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "DECLINED"]).optional(),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  isMaster: z.boolean().optional(),
  lineItems: z.array(quoteLineItemSchema).min(1)
});

export const quoteUpdateSchema = quoteCreateSchema.partial();

export const invoiceLineItemSchema = quoteLineItemSchema;

export const invoiceCreateSchema = z.object({
  clientId: idSchema,
  jobId: idSchema.optional(),
  jobIds: z.array(idSchema).optional(),
  templateId: idSchema.optional(),
  number: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"]).optional(),
  billingMode: z.enum(["ACTUAL", "QUOTED", "PROGRESS", "PERCENT_QUOTE"]).optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  lineItems: z.array(invoiceLineItemSchema).min(1)
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial();

export const paymentCreateSchema = z.object({
  invoiceId: idSchema,
  amount: z.number().positive(),
  paymentDate: z.string().min(10),
  reference: z.string().optional()
});

export const paymentUpdateSchema = paymentCreateSchema.partial();

export const billableSummarySchema = z.object({
  timeEntryIds: z.array(idSchema).optional(),
  costEntryIds: z.array(idSchema).optional()
});

export const customFieldCreateSchema = z.object({
  entityType: z.enum(["CLIENT", "JOB", "QUOTE", "INVOICE", "LEAD"]),
  name: z.string().min(1),
  key: z.string().min(1),
  fieldType: z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "MULTI_SELECT", "CHECKBOX"]),
  required: z.boolean().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().optional()
});

export const customFieldUpdateSchema = customFieldCreateSchema.partial();

export const notificationCreateSchema = z.object({
  userId: idSchema,
  type: z.enum(["SYSTEM", "JOB_STATUS", "LEAD_STATUS", "BILLING", "DOCUMENT"]).optional(),
  title: z.string().min(1),
  body: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional()
});

export const uploadCreateSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  contentBase64: z.string().min(1),
  provider: z.enum(["LOCAL"]).optional()
});

export const leadStageCreateSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isClosed: z.boolean().optional(),
  isWon: z.boolean().optional()
});

export const leadStageUpdateSchema = leadStageCreateSchema.partial();

export const leadCreateSchema = z.object({
  stageId: idSchema.optional(),
  ownerUserId: idSchema.optional(),
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  estimatedValue: z.number().nonnegative().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional()
});

export const leadUpdateSchema = leadCreateSchema.partial();

export const leadActivityCreateSchema = z.object({
  type: z.enum(["TASK", "CALL", "MEETING", "EMAIL", "NOTE"]).optional(),
  title: z.string().min(1),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  completedAt: z.string().optional()
});

export const leadActivityUpdateSchema = leadActivityCreateSchema.partial();

export const leadTemplateCreateSchema = z.object({
  name: z.string().min(1),
  defaults: z.record(z.string(), z.unknown()).optional()
});

export const leadTemplateUpdateSchema = leadTemplateCreateSchema.partial();

export const leadCaptureSchema = z.object({
  tenantId: idSchema,
  token: z.string().min(1),
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  estimatedValue: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  source: z.string().optional()
});

export const documentCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  entityType: z.enum(["CLIENT", "JOB", "QUOTE", "INVOICE", "LEAD"]),
  entityId: idSchema,
  provider: z.enum(["LOCAL"]).optional()
});

export const documentUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional()
});

export const quoteTemplateCreateSchema = z.object({
  name: z.string().min(1),
  layout: z.string().optional(),
  defaults: z.record(z.string(), z.unknown()).optional()
});

export const quoteTemplateUpdateSchema = quoteTemplateCreateSchema.partial();

export const invoiceTemplateCreateSchema = z.object({
  name: z.string().min(1),
  layout: z.string().optional(),
  defaults: z.record(z.string(), z.unknown()).optional()
});

export const invoiceTemplateUpdateSchema = invoiceTemplateCreateSchema.partial();

export const jobStageCreateSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isClosed: z.boolean().optional()
});

export const jobStageUpdateSchema = jobStageCreateSchema.partial();

export const brandingSettingsSchema = z.object({
  businessName: z.string().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().optional(),
  businessAddress: z.string().optional(),
  logoUrl: z.string().optional()
});
