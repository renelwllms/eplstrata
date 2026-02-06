# Product Requirements Document (PRD)
## Product: EdgePoint Strata

### 1. Product Overview
EdgePoint Strata is a single-product, multi-tenant SaaS that replicates and improves upon WorkflowMax-style job, time, quote, and invoice management for service businesses, with NZ-first compliance (GST, NZD, Auckland timezone).

### 2. Scope
This PRD defines application requirements only.
Marketing website, AI automation, and accounting integrations are out of scope unless explicitly stated.

### 3. Architecture
- One SaaS product per codebase
- Multi-tenant via tenant_id
- PostgreSQL + Prisma
- Next.js App Router
- PWA-enabled

### 4. User Roles
- Platform Super Admin
- Tenant Owner
- Tenant Admin
- Staff

### 5. Core Modules
- Tenants & Settings
- Users & RBAC
- Clients
- Jobs
- Tasks
- Phases
- Time Tracking
- Costs
- Quotes
- Invoices
- Payments
- Reporting
- SaaS Billing

### 6. Functional Requirements
PRODUCT REQUIREMENTS DOCUMENT (PRD)
Product: EdgePoint Strata

Category: Job Management & Time Tracking SaaS
Inspiration / Benchmark: WorkflowMax
Architecture: Single-product SaaS (Option A)
Target Market: Agencies, IT firms, consultants, trades, professional services
Primary Region: New Zealand (GST, NZD, Xero-style accounting logic)

1. PRODUCT GOAL

Build a WorkflowMax-equivalent SaaS that allows service businesses to:

Track jobs, time, costs

Create quotes & invoices

Measure job profitability

Manage staff utilisation

Comply with NZ GST

Operate as a multi-tenant SaaS

Work offline via PWA

This product must reach WorkflowMax core parity before adding AI or automation.

2. SAAS FOUNDATIONS (MANDATORY)
2.1 Multi-Tenant Model

One codebase

One database

Tenant-isolated via tenant_id

No cross-tenant data access

2.2 User Roles

Platform Super Admin (EdgePoint)

Tenant Owner

Tenant Admin

Staff

2.3 Tenant Lifecycle

Trial

Active

Past Due

Suspended

Cancelled

3. CORE MODULES (WORKFLOWMAX PARITY)
3.1 CLIENTS (Customers)
Features

Create / edit clients

Client contact details

Billing address

Notes

Client status (Active / Archived)

Client links to:

Jobs

Quotes

Invoices

Time entries

Costs

3.2 STAFF (Users)
Staff profile

Name

Email

Role

Cost rate (internal hourly cost)

Billable rate (default)

Active / inactive

Permissions

Staff only see assigned jobs

Admins see all data

3.3 JOBS (Core Object)
Job fields

Job number (prefix-based)

Job name

Client

Status:

Quote

Active

On Hold

Completed

Cancelled

Start date

Due date

Assigned staff

Budget (optional)

Job contains:

Tasks

Phases

Time entries

Costs

Quotes

Invoices

3.4 TASKS
Task features

Task name

Default billable rate

Active / inactive

Assignable to jobs

Used in time tracking

3.5 PHASES (WorkflowMax-style)
Phase features

Phase name

Phase budget (hours or value)

Linked to job

Optional phase custom field

Phase logic

Time entries can be allocated to phases

Job progress auto-calculated from phase usage

Phase budget vs actual tracking

3.6 TIME TRACKING (CRITICAL)
Time Entry (Modal)

(From your screenshot)

Fields:

Date

Job

Task

Time (HH:MM)

Phase (optional)

Phase custom field

Notes

Billable toggle

Weekly Timesheet View

Mon–Sun grid

Daily totals

Weekly total

Editable rows

Filters (date, job, client)

Submit timesheet (locks entries)

Rules

Time rounding based on tenant settings

Default billable behaviour configurable

3.7 COSTS (Job Costs)
Cost entry

Job

Description

Quantity

Unit cost

Markup %

Billable / non-billable

Cost types

Materials

Subcontractors

Expenses

3.8 QUOTES
Quote features

Quote number auto-generated

Client + job linked

Line items:

Description

Quantity

Rate

Discount

Tax handling:

Tax before discount OR

Tax after discount (configurable)

Status:

Draft

Sent

Accepted

Declined

Conversion

Accepted quote → active job

Quote → invoice (partial or full)

3.9 INVOICES
Invoice features

Invoice number auto-generated

Billable time pulled from jobs

Billable costs pulled from jobs

Partial invoicing

Final invoicing

GST summary (NZ-compliant)

Invoice status

Draft

Sent

Paid

Overdue

Output

PDF

Email-ready

3.10 PAYMENTS (Basic)

Record manual payments

Payment date

Amount

Reference

Partial payments allowed

3.11 FINANCIAL REPORTING
Reports

Job profitability

WIP (Work in progress)

Invoice ageing

Revenue summary

GST summary (NZ)

Export

CSV

Accounting-system ready (future Xero sync)

3.12 DASHBOARD
Widgets

Active jobs

Time logged today / week

Unbilled time

Overdue invoices

Revenue this month

3.13 LEAD MANAGER (WORKFLOWMAX PARITY)
Lead records

Lead name

Company

Contact details

Estimated value

Expected close date

Lead owner

Lead categories / stages (customisable)

Pipeline views

Pipeline board

List view with filters

Forecasting

Conversion likelihood

Weighted pipeline value

Activities

Tasks, calls, meetings

Overdue activity list

Calendar view

Lead templates

Reusable lead templates for repeatable lead capture

Conversion

Lead → quote → job → invoice

API lead capture endpoint (for website forms)

3.14 DOCUMENT MANAGEMENT (WORKFLOWMAX PARITY)
Centralised job documents

Store documents against clients, jobs, quotes, and invoices

Email-to-job

Unique job email address to auto-attach messages and files

Cloud storage integrations (Phase 2)

Dropbox

Google Drive

Box

Mobile uploads

Photo upload from mobile devices to the correct job folder

3.15 CUSTOMISATION (WORKFLOWMAX PARITY)
Custom fields

Custom fields on jobs, clients, quotes, invoices, leads

Custom field reporting and grouping

Custom job states

Tenant-defined job stages

State-based notifications

Branding and templates

Custom quote and invoice templates

Logo, business details, and terms merge fields

Billing rates

Client-level and job-level billing rates

Task-level overrides

3.16 QUOTING ENHANCEMENTS (WORKFLOWMAX PARITY)
Quote templates

One-page and detailed template variants

Reusable templates per job type

Quote options

Optional tasks and costs

Multiple quotes per job

Single master accepted quote for invoicing

Quote profitability

Gross margin visibility at quote time

3.17 INVOICING ENHANCEMENTS (WORKFLOWMAX PARITY)
Invoice templates

Simple and detailed templates

Flexible billing

Progress invoices

Actual vs quoted time and costs

Percentage of quoted value

Multi-job invoicing

Cashflow view

Central invoice hub with overdue visibility

Accounting integration (Phase 2)

Xero sync

QuickBooks sync

Export logs

3.18 TIME TRACKING ENHANCEMENTS (WORKFLOWMAX PARITY)
Multiple entry methods

Start/stop timer

Start/finish time or total hours

Entry from job, task, dashboard

Mobile time entry

Admin entry

Admins can enter time on behalf of staff

Reporting

Customisable timesheet reports

Billable vs non-billable reporting

Daily or weekly entry modes

Time rounding options exposed in UI

4. SETTINGS (Tenant-Level)
Business settings

Logo

Business name

Contact details

Address

Financial settings

GST rate (default 15%)

Tax inclusive / exclusive

Quote & invoice T&Cs

Numbering

Job / Quote / Invoice / PO prefixes

Starting numbers

Time tracking

Rounding rules

Default billable behaviour

Weekly vs daily view

5. SAAS BILLING (APPLICATION-LEVEL)
Plans

Starter

Professional

Enterprise

Plan controls

User limits

Feature flags

Storage limits

Subscription enforcement

Disable features when exceeded

Read-only mode on non-payment

6. PWA REQUIREMENTS

Installable

Offline:

View jobs

Enter time

Sync queue with conflict handling

Tenant-branded icons & name

7. NON-FUNCTIONAL REQUIREMENTS

RBAC enforced everywhere

Tenant-scoped queries only

Audit logging

Soft deletes

Performance:

<2.5s LCP

Mobile-responsive UI

8. TECH STACK (FIXED)
Frontend

Next.js (App Router)

React

Tailwind

ShadCN

PWA enabled

Backend

Node.js

API routes

Prisma ORM

PostgreSQL

Auth

Auth.js / NextAuth

9. OUT OF SCOPE (PHASE 2+)

Payroll

Xero sync

AI automation

Bank feeds

10. SUCCESS CRITERIA

Feature parity with WorkflowMax core

Faster time entry UX

Clean GST handling

SaaS subscription enforcement

PWA install adoption

11. FINAL INSTRUCTION TO CODEX

Build EdgePoint Strata as a WorkflowMax-equivalent SaaS.
Do not add features beyond this PRD.
Prioritise correctness, tenant isolation, and billing enforcement.
Build in this order:

Data models

Auth & tenancy

Jobs & time tracking

Quotes & invoices

Reports

PWA

### 7. Non-Functional Requirements
- Tenant isolation
- Role-based access control
- Audit logging
- Performance and security

### 8. Out of Scope
- Payroll
- AI features

### 9. Build Rules
- Do not skip phases
- No UI before data models
- No feature invention
- This PRD is authoritative
