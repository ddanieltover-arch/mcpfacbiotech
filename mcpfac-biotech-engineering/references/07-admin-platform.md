# Volume 7 — Enterprise Administration Platform (CMS, Operations Console, Workflow Management)

## Admin Platform Mission

The central operating system for MCPFAC BIOTECH: lets authorized staff
manage products, scientific documents, customers, quotations, orders,
inventory, support, reports, and company settings through a secure,
role-based interface. Should feel like a modern enterprise SaaS app, not a
traditional CMS.

## Admin Design Principles

Clean, fast, information-dense, highly searchable, keyboard-friendly,
role-driven, responsive, modular. Consistent with the public design system
but optimized for productivity.

## Admin Layout

Global header, left navigation sidebar, breadcrumb, page header, action
toolbar, main workspace, optional context panel, footer, notification
center, command palette (future).

## Admin Dashboard

Real-time metrics: today's orders, pending quotes, pending shipments, open
support tickets, inventory alerts, recent downloads, recent customers,
recent messages, revenue overview, top-selling products, recent activity
feed, system health.

## Sidebar Navigation

Dashboard, Products, Categories, Inventory, Customers, Quotes, Orders,
Invoices, Documents, Media Library, Research Articles, Blog, FAQ, Support,
Messages, Reports, Analytics, Users, Roles, Settings, System Logs.

## Quick Actions

Create product, upload COA/MSDS/HPLC, create quote, create invoice, create
customer, create blog post, open support ticket, send announcement, export
report.

## Product Management

Create, edit, duplicate, archive, publish, schedule publishing products;
manage pricing, variants, specifications; assign categories/tags; upload
images/documents; manage related & featured products; preview; bulk edit.

## Product Editor

Sections: general information, scientific information, pricing, inventory,
images, documents, SEO placeholder, related products, publishing, audit
history, preview. Autosave drafts at regular intervals.

## Category Management

Create categories, nested categories, category images/banners, ordering,
visibility, featured categories, bulk operations.

## Document Management

Centralized management for COA, MSDS, HPLC, technical datasheets, research
articles, certificates, laboratory documentation. Capabilities: versioning,
approval workflow, bulk upload, metadata editing, download permissions,
expiry dates, replacement history.

> As throughout: this is the management UI for storing/versioning/
> permissioning these documents — content authoring stays with the user's
> lab/compliance sources.

## Media Library

Images, PDF files, videos (future), scientific graphics, company assets.
Organization: folders, tags, search, filters, preview, bulk delete/move,
storage statistics.

## Inventory Management

Track current/reserved/incoming stock, minimum threshold, reorder level,
warehouse notes (future), inventory history, stock adjustments, manual
corrections.

## Customer Management

Profile includes: account details, organization, contact persons,
addresses, customer group, purchase history, quotes, orders, invoices,
downloads, support tickets, messages, activity timeline. Admins can
suspend/reactivate accounts.

## Customer Groups

Retail, Research, University, Distributor, Wholesale, VIP, Government,
Institution — determine pricing, permissions, and workflows.

## Quote Management

Create, edit, approve, reject, revise quotes; convert to orders; generate
PDF; send by email; view timeline; track customer responses.

## Order Management

Workspace: customer, items, status, payments, shipping, tracking,
documents, notes, timeline, audit history. Actions: confirm, process,
pack, ship, cancel, reopen, refund (future).

## Invoice Management

Create, edit, regenerate PDF, mark paid/unpaid, send email, export, view
history, payment tracking.

## Shipping Management

Manage carriers, tracking numbers, shipping labels (future), packing
lists, shipment status, estimated delivery, shipping notes.

## Support Management

Views: open, assigned, pending-response, closed tickets, priority queue,
support analytics. Actions: assign agent, reply, escalate, merge tickets,
close ticket, internal notes.

## Message Center

Unified hub: customer messages, system messages, internal notes, unread
messages, attachments, conversation history, search.

## Blog Management

Create/edit articles, drafts, publishing, scheduling, featured posts,
categories, tags, authors, media, preview.

## Research Article Management

Manage research library, scientific articles, technical guides,
application notes, reference material, download permissions, version
history.

## FAQ Management

Create categories, questions, answers, ordering, visibility, analytics,
search.

## Reports

Sales, orders, quotes, downloads, customers, inventory, support, products,
shipping, invoices.

## Analytics

Revenue, conversion rate, top products, customer growth, downloads, search
terms, product views, cart abandonment (future), geographic distribution,
traffic sources (future).

## User Management

Create/deactivate users, reset passwords, assign roles/permissions, view
activity, lock accounts, manage MFA (future).

## Role Management

Roles: Super Administrator, Administrator, Product Manager, Inventory
Manager, Sales, Support, Content Editor, Marketing, Finance, Read Only,
Custom Roles.

## Permission System

Granular per-module permissions (Products, Customers, Orders, Quotes,
Invoices, Documents, Media, Users, Reports, Settings, Support, Messages,
Analytics), each supporting: View, Create, Update, Delete, Approve,
Export.

## Settings

Company information, email settings, storage settings, invoice settings,
shipping settings, document settings, customer settings, system
preferences, feature flags, future integrations.

## Notification Center

Shows: new orders, new quotes, inventory alerts, support tickets, failed
uploads, system warnings, user activity, announcements. Filterable and
dismissible.

## Search

Global admin search covers: products, customers, orders, quotes, invoices,
documents, articles, users, support tickets, messages.

## Bulk Operations

Bulk publish, archive, delete, export, assign category/tags, move
documents, change status, update pricing, inventory adjustments. Require
confirmation before destructive actions.

## Import / Export

CSV import/export, Excel export, PDF export, JSON export, template
downloads. Validate imported data before processing.

## Approval Workflows

For products, scientific documents, quotes, research articles, blog posts.
States: Draft → Pending Approval → Approved / Rejected → Published →
Archived.

## Audit Logs

Record login events, user actions, price changes, document uploads,
inventory changes, role changes, settings changes, exports, deletes. Each
entry: user, action, target, timestamp, IP address.

## System Health

Widgets: API status, database status, storage usage, upload queue,
background jobs, recent errors, application version, environment.

## Admin Accessibility

Keyboard navigation, focus indicators, ARIA labels, high contrast,
responsive layout, screen reader compatibility.

## Security

Admins never bypass business rules. Enforce role validation, permission
checks, CSRF protection, rate limiting, input validation, file validation,
secure audit trails. Sensitive actions require confirmation.

## Performance

Support thousands of products, large document libraries, concurrent
administrators, fast search, lazy loading, server-side pagination,
caching, optimized queries.

## Admin Testing

Test role permissions, CRUD operations, bulk actions, imports, exports,
search, filters, reports, document uploads, approval workflows, audit
logging.

## Admin Documentation

Every module documents: purpose, permissions, data flow, dependencies, API
endpoints, business rules, testing procedures, future extension points.

## Admin Completion Checklist

Permissions enforced, validation implemented, audit logging enabled,
search supported, bulk actions available where appropriate, responsive,
accessible, tested, documented, integrated with backend services and
database schema.

## Admin Mode

When working in Admin Mode:

1. Analyse the requested administrative feature.
2. Identify affected business modules.
3. Define permissions and workflow.
4. Design frontend screens.
5. Design backend services.
6. Update database schema if required.
7. Generate production-ready code.
8. Include tests.
9. Update documentation.
10. Verify compatibility with the existing architecture.

## Future Operations Readiness

Support without major restructuring: multi-warehouse inventory, supplier
management, purchase order processing, LIMS, ERP integration, CRM
integration, multi-company operation, multi-region administration,
AI-assisted content generation, AI-assisted inventory forecasting,
automated document classification, business intelligence dashboards. New
capabilities should extend existing modules and the permission system
rather than replacing them.
