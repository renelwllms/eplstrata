# WorkflowMax Parity Backlog (EdgePoint Strata)

Status legend: `Planned` `In Progress` `Blocked` `Done`

## Milestone 0 — Foundations (Needed Before New Modules)
- Planned: Confirm RBAC for new modules (Lead Manager, Documents, Custom Fields)
- Planned: Add system-wide custom fields infrastructure (schema + UI patterns)
- Planned: Add notification engine for state transitions (jobs/leads)
- Planned: Add upload/storage abstraction (local + S3-compatible)

## Milestone 1 — Lead Manager (WorkflowMax Parity)
- Planned: Lead schema (lead, lead_stage, lead_activity, lead_template)
- Planned: Lead stages CRUD (tenant-configurable)
- Planned: Pipeline board view (stage columns + drag/drop)
- Planned: Lead list view + filters + search
- Planned: Lead detail page with timeline + activities
- Planned: Forecasting fields (expected close date, probability, weighted value)
- Planned: Activity scheduling + calendar view
- Planned: Convert lead → quote → job
- Planned: Public API endpoint for website lead capture

## Milestone 2 — Document Management (WorkflowMax Parity)
- Planned: Document schema (document, document_link)
- Planned: Attach documents to client/job/quote/invoice
- Planned: Upload UI + drag/drop + preview
- Planned: Job document drawer (per job, recent, tagged)
- Planned: Email-to-job ingestion (unique job address)
- Planned: Mobile upload flow (camera + gallery)
- Planned: Document permissions (role + tenant scoped)

## Milestone 3 — Customisation (WorkflowMax Parity)
- Planned: Custom fields per entity (jobs/clients/quotes/invoices/leads)
- Planned: Custom field types (text, number, date, select, checkbox)
- Planned: Custom job states (tenant-defined)
- Planned: State-based notifications
- Planned: Branded quote/invoice templates
- Planned: Merge fields for business details + terms
- Planned: Client/job/task billing rates (override hierarchy)

## Milestone 4 — Quoting Enhancements (WorkflowMax Parity)
- Planned: Quote templates (one-page + detailed)
- Planned: Optional tasks/costs per quote
- Planned: Multiple quotes per job + master accepted quote
- Planned: Quote margin/profitability view
- Planned: Quote approval flow

## Milestone 5 — Invoicing Enhancements (WorkflowMax Parity)
- Planned: Invoice templates (simple + detailed)
- Planned: Flexible billing options (progress, actual vs quoted, % of quote)
- Planned: Multi-job invoicing
- Planned: Central invoice hub + cashflow view
- Planned: Overdue automation + reminders

## Milestone 6 — Time Tracking Enhancements (WorkflowMax Parity)
- Planned: Start/stop timer
- Planned: Start/finish time entry option
- Planned: Entry from job/task/dashboard context
- Planned: Admin entry on behalf of staff
- Planned: Billable vs non-billable reporting
- Planned: Daily vs weekly entry modes

## Milestone 7 — Job Management Enhancements (WorkflowMax Parity)
- Planned: Milestones + schedule manager
- Planned: Recurring jobs
- Planned: Capacity planning (staff allocation view)
- Planned: Job profitability widget

## Milestone 8 — Integrations (Phase 2)
- Planned: Xero sync + export logs
- Planned: QuickBooks sync + export logs
- Planned: DMS integrations (Dropbox, Google Drive, Box)

## Acceptance Criteria (Parity)
- All Milestones 1–7 complete with a stable UI and API coverage.
- Feature set maps 1:1 with competitor pages (Lead Manager, Documents, Customisation, Quoting, Invoicing, Time, Jobs).
- Tenant isolation and RBAC enforced for all new entities and actions.
- PWA compatibility remains intact for time tracking and key job views.
