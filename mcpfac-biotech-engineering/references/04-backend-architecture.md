# Volume 4 — Backend Architecture (NestJS, API Design, Business Logic, Services)

## Backend Mission

The backend is the core business engine: a secure, modular, scalable REST
API powering the website, customer dashboard, future mobile apps, and any
external integrations. It owns all business rules, workflows, validation,
document generation, and communication with the database and storage.

## Technology Stack

- Framework: NestJS
- Language: TypeScript
- Runtime: Node.js (LTS)
- Database: Supabase PostgreSQL
- ORM: Prisma
- Auth: Supabase Auth
- Storage: Supabase Storage
- Validation: class-validator
- Transformation: class-transformer
- Config: @nestjs/config
- Docs: Swagger/OpenAPI
- Logging: Pino
- Testing: Jest
- Package manager: pnpm

## Backend Principles

Clean Architecture, SOLID, Domain-Driven Design, Dependency Injection,
Single Responsibility, Feature-Based Modules, Repository Pattern, Service
Layer Pattern, DTO Pattern.

No business logic in controllers. Controllers receive requests → services
execute business rules → repositories access data.

## Project Structure

```
backend/
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── config/
    ├── common/
    │   ├── guards/
    │   ├── decorators/
    │   ├── filters/
    │   ├── interceptors/
    │   ├── pipes/
    │   └── middleware/
    ├── modules/
    ├── database/
    ├── storage/
    ├── mail/
    ├── documents/
    ├── utils/
    ├── types/
    ├── interfaces/
    ├── constants/
    ├── jobs/
    ├── templates/
    └── tests/
```

## Feature Modules

Each feature owns its own controller, service, DTOs, entities, repository,
validators, tests, and documentation.

## Core Modules

Authentication, Users, Products, Categories, Orders, Cart, Checkout,
Quotes, Invoices, Customers, Downloads, Documents, Storage, Research
Articles, Blog, FAQ, Messages, Support Tickets, Wishlist, Compare,
Notifications, Shipping, Settings, Dashboard, Analytics, Search, Uploads,
Health.

## Common Module

Base DTOs, response helpers, exceptions, enums, constants, utilities,
validation pipes, pagination helpers, authentication helpers, date helpers,
formatting helpers.

## Configuration

Centralized config supporting development / testing / production.
Environment variables must never be hardcoded.

## Environment Variables

Application URL, Frontend URL, Backend URL, Supabase URL, Supabase
anonymous key, Supabase service role key, JWT secret, SMTP host/port/
username/password, company email, storage bucket names.

## API Architecture

All endpoints versioned, e.g. `/api/v1/products`, `/api/v1/orders`,
`/api/v1/customers`. Future versions coexist without breaking existing
clients.

## API Response Format

**Success:** `success`, `message`, `data`, `metadata`, `timestamp`.
**Error:** `success`, `statusCode`, `message`, `errors`, `timestamp`.

## Authentication

Uses Supabase Auth. Backend responsibilities: validate access/refresh
tokens, resolve current user, apply role-based authorization, enforce
permissions. Never trust client-supplied user data.

## User Roles

Guest, Customer, Research Customer, Distributor, Wholesale Customer,
Support, Content Editor, Inventory Manager, Administrator, Super
Administrator. Permissions are role-driven.

## Authorization

Guards for: authenticated routes, admin-only routes, editor routes,
distributor routes, customer-ownership checks. Support role inheritance.

## Product Module

Create/update/delete/search products, categories, filters, sorting,
related products, frequently-bought-together, recently viewed, featured
products, availability, specifications, downloads.

## Category Module

Nested categories (unlimited depth), featured categories, sorting, SEO
fields (reserved), visibility, icons, images.

## Search Module

Global search across products, categories, blog, research articles,
downloads, FAQ; autocomplete, suggestions, pagination, filtering.

## Cart Module

Guest cart, customer cart, persistent cart, merge guest cart on login,
quantity updates, coupons (future), bulk pricing, shipping estimation.

## Checkout Module

Billing, shipping, payment method selection, order creation, quote
conversion, invoice creation, stock validation, confirmation, email
trigger.

## Order Module

Create/update/cancel/track order, order timeline, invoices, downloads,
status history, internal notes.

## Quote Module

Create quote, convert quote to order, bulk orders, distributor pricing,
MOQ validation, approval workflow, quote expiration, PDF quote.

## Invoice Module

Generate invoice, download PDF, email invoice, payment status, tax fields,
currency, invoice history.

## Document Module

Manage COA, MSDS, HPLC reports, certificates, research documents,
datasheets, download permissions, version control.

> As noted in earlier volumes: this module is about storage, permissions,
> versioning, and delivery of these documents — not authoring their
> regulatory/scientific content, which should come from the user's own lab
> or compliance sources.

## Storage Module

Supabase Storage buckets: products, documents, coa, msds, hplc, invoices,
blog, avatars, banners, media. All uploads validated.

## Blog Module

Categories, articles, authors, tags, featured posts, drafts, publishing,
related posts.

## FAQ Module

Categories, questions, answers, ordering, visibility, search.

## Support Module

Support tickets, replies, attachments, status, priority, assignment,
history, internal notes.

## Message Module

Customer conversations, unread counts, attachments, notifications, read
status.

## Shipping Module

Track orders, shipping methods, estimated delivery, carrier details,
tracking numbers, shipping documents.

## Email Module

Transactional emails: registration, password reset, order confirmation,
quote confirmation, invoice delivery, support replies, shipment updates,
newsletter (future). Use templated HTML emails.

## PDF Generation

Generate invoices, quotes, packing lists, order summaries, COA packages.
Documents must be branded consistently.

## Validation

Every request validates body, query, params, and headers where applicable.
Reject invalid input before it reaches services.

## Exception Handling

Global exception filters handling: validation errors, unauthorized,
forbidden, not found, conflict, database errors, unexpected exceptions.
Never expose stack traces in production.

## Logging

Structured logs capture: request ID, user ID, route, execution time,
warnings, errors, audit events. Never log sensitive data.

## File Uploads

Validate file type, file size, virus-scan hook (future), duplicate
detection, metadata. Store upload history.

## Pagination

Listing endpoints support `page`, `limit`, `sort`, `direction`, `filters`,
`search`. Responses return `items`, `page`, `limit`, `total`, `totalPages`.

## Background Jobs

Async jobs for email sending, PDF generation, image processing,
notifications, future integrations. Use queues to avoid long-running
requests.

## Health Module

Endpoints for API status, database status, storage status, version,
environment, uptime — suitable for deployment monitoring.

## Swagger

Complete OpenAPI docs. Every endpoint: summary, description, parameters,
responses, examples, auth requirements.

## Testing

Unit, integration, controller, service, repository, authentication,
validation, and error-handling tests. Aim for high coverage on business
logic.

## Backend Completion Checklist

DTOs created, validation implemented, service complete, repository
complete, controller complete, authentication enforced, authorization
verified, logging added, error handling implemented, tests written,
Swagger documented, type-safe, integrated with the frontend contract.

## Backend Mode

When working in Backend Mode:

1. Analyse the requested feature.
2. Design the module.
3. List affected files.
4. Generate production-ready NestJS code.
5. Include DTOs, services, controllers, repositories, tests, documentation.
6. Describe required environment variables/configuration.
7. End with integration notes for the frontend and follow-up tasks.

## Future Integration Readiness

Design so that adding any of the following later requires minimal changes:
Android app, iOS app, PWA, distributor portal, supplier portal, ERP
integration, CRM integration, payment gateways, AI assistants, LIMS,
inventory automation. New functionality should integrate through the
existing service/API layers rather than bypassing established
architecture.
