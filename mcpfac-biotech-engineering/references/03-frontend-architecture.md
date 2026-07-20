# Volume 3 — Frontend Architecture (Next.js 15, Customer Experience, Routing, State Management)

## Frontend Mission

Deliver a world-class scientific e-commerce experience: fast-loading,
intuitive, presenting complex laboratory information cleanly. Should feel
comparable to enterprise biotech sites with the responsiveness/polish of a
modern SaaS app.

## Frontend Stack

- Framework: Next.js 15, App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI components: shadcn/ui
- Animations: Framer Motion
- Icons: Lucide React
- Forms: React Hook Form
- Validation: Zod
- Client state: Zustand
- Server state: TanStack Query
- Tables: TanStack Table
- Charts: Recharts
- Notifications: Sonner
- Dates: date-fns
- Images: next/image
- Fonts: next/font

## Project Structure

```
src/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── providers/
├── services/
├── stores/
├── types/
├── utils/
├── constants/
├── config/
├── styles/
└── middleware.ts
```

Keep it modular — never put business logic inside UI components.

## App Router Structure

Top-level routes: `/`, `/about`, `/products`, `/categories`, `/research`,
`/blog`, `/downloads`, `/faq`, `/contact`, `/quote`, `/cart`, `/checkout`,
`/login`, `/register`, `/forgot-password`, `/wishlist`, `/compare`,
`/account`, `/orders`, `/invoices`, `/downloads` (customer-scoped),
`/messages`, `/support`, `/tracking`, `/settings`, `/admin` (future), plus
`/api`, `not-found`, `loading`, `error`. Use route groups where it clarifies
layout boundaries.

## Root Layout

Should include: SEO metadata, global providers (theme, toast, query, auth),
global fonts, navigation, footer, scroll restoration, analytics placeholder,
cookie banner placeholder.

## Route Groups

`(public)`, `(auth)`, `(customer)`, `(marketing)`, `(shared)` — each with its
own layout where appropriate.

## Public Pages

Home, About, Products, Categories, Product Detail, Research, Knowledge
Base, Blog, Downloads, FAQ, Shipping, Returns, Privacy, Terms, Contact,
Quote Request.

## Authentication Pages

Login, Register, Forgot Password, Reset Password, Verify Email — integrated
with Supabase Auth.

## Customer Portal

Authenticated users get: Dashboard, Orders, Invoices, Downloads, Messages,
Support Tickets, Wishlist, Product Comparison, Addresses, Tracking, Account
Settings, Quote Requests, Notifications, Security Settings.

## Page Structure Standard

Every page: Breadcrumb → Page Header → Page Description → Main Content →
Related Content → Call To Action → Footer. Keep this consistent everywhere.

## Homepage Structure

Hero Banner → Company Introduction → Featured Categories → Featured
Products → Research Areas → Why Choose MCPFAC → Quality Assurance →
Certificates → Research Documentation → Latest Articles → Testimonials →
Global Shipping → Newsletter → Footer.

## Header

Sticky, responsive, subtle glass effect. Contains: logo, navigation, mega
menu, search, wishlist, compare, cart, login, profile, contact, request
quote.

## Mega Menu

Sections: Peptides, Research Chemicals, Growth Hormones, Custom Synthesis,
Research Services, Research Documentation, Knowledge Base, Support. Each
section supports featured products and quick links.

## Search Experience

Instant search, autocomplete, search history, popular searches, category
suggestions, recently viewed, empty-state suggestions, keyboard navigation,
debounced requests.

## Product Listing Page

Breadcrumb, category header, description, filter sidebar, search, sorting,
view toggle, pagination, optional infinite scroll, product cards, FAQ,
related categories, newsletter.

## Product Detail Page

Breadcrumb, gallery with image zoom, product information, purchase panel,
downloads, specifications, laboratory data, related products, frequently
bought together, recently viewed, research disclaimer, FAQ, reviews,
shipping information.

## Shopping Experience

Shopping cart, mini cart, persistent cart, guest cart, authenticated cart,
saved cart, coupon support, bulk pricing, quantity selector, shipping
calculator placeholder.

## Checkout Flow

Cart → Shipping Details → Billing Details → Payment → Order Review →
Confirmation → Order Success → Invoice Generation → Quote Conversion.

## Wishlist

Add, remove, move to cart, share wishlist, bulk add, availability alerts.

## Product Comparison

Compare across: purity, sequence, CAS number, storage, molecular weight,
applications, price, availability, download documents.

## Customer Dashboard

Widgets: recent orders, recent downloads, invoices, support tickets,
messages, wishlist, quote requests, account status, order statistics,
recent activity.

## Order Management

Customer can: view orders, track orders, download invoice, reorder, cancel
pending orders, contact support.

## Download Center

Users can download: COA, MSDS, HPLC, invoices, research documentation.
Downloads should be searchable.

> As in Volume 1/2: this is a document-delivery feature (upload, store,
> search, permission, serve files). The content of COA/MSDS/HPLC documents
> themselves comes from the user's own lab/compliance sources, not
> generated by Claude.

## Messages

Conversation view, attachments, notifications, read status, support
replies.

## Support Tickets

Open ticket, reply, attachments, status, priority, category, resolution
history.

## Account Settings

Profile, password, email, addresses, communication preferences, newsletter,
security, delete-account request.

## Component Organization

```
components/
├── layout/
├── navigation/
├── footer/
├── buttons/
├── cards/
├── forms/
├── inputs/
├── tables/
├── charts/
├── dialogs/
├── product/
├── cart/
├── checkout/
├── customer/
├── dashboard/
├── blog/
├── download/
├── research/
└── shared/
```

## Feature Organization

```
features/
├── authentication/
├── products/
├── categories/
├── cart/
├── checkout/
├── wishlist/
├── compare/
├── quotes/
├── orders/
├── invoices/
├── downloads/
├── research/
├── support/
├── blog/
└── account/
```

Each feature owns its own components, hooks, API calls, validation, types,
and utilities.

## State Management

**Zustand** for: shopping cart, wishlist, compare, sidebar, search, theme,
notifications, user preferences. Never use Zustand for server data.

**TanStack Query** for server state: products, orders, categories,
downloads, quotes, invoices, research articles, customer data, support
tickets, messages. Cache appropriately.

## Forms

Every form needs: validation, loading state, success state, error state,
accessible labels, keyboard support, field-level validation, server
validation, reset logic.

## Loading Experience

Skeleton screens, loading indicators, progress bars, lazy loading,
optimistic updates, smooth transitions.

## Error Handling

Each page should define handling for: 404, 500, network error,
unauthorized, empty results, retry button, fallback UI.

## Responsiveness

Desktop-first, tablet-optimized, mobile-optimized, landscape-optimized. No
horizontal scrolling.

## Performance Rules

Lazy-load components, dynamic imports, optimized images, code splitting,
memoization, streaming, Server Components by default, Client Components
only when required.

## Reusable Hooks

Build reusable hooks for: authentication, products, categories, cart,
wishlist, compare, orders, downloads, invoices, messages, support, search,
pagination, filters, infinite scroll, media query, debounce, clipboard.

## API Client

All frontend requests go through a centralized API layer — never call
backend services directly from UI components. Implement: request wrapper,
error handling, retry logic, auth tokens, typed responses.

## Code Quality

Every component: reusable, strongly typed, descriptive props, no duplicated
logic, presentation separated from business logic, independently testable.

## Testing Requirements

Cover: component rendering, form validation, navigation, authentication,
cart, checkout, wishlist, downloads, responsive layout, accessibility.

## Frontend Documentation

Each major feature should document: purpose, dependencies, component
hierarchy, data flow, API endpoints used, state management, testing notes,
future extension points.

## Frontend Completion Checklist

Before marking a feature complete: responsive on all breakpoints,
accessible, type-safe, optimized, tested, error-handled, loading states
implemented, empty states implemented, reusable components only, consistent
with the design system, integrated with backend APIs, fully documented.

## Frontend Mode

When working in Frontend Mode, focus exclusively on the Next.js
application — don't generate backend code unless explicitly requested. Each
frontend task should conclude with: architecture summary, files
created/modified, complete production-ready code, testing instructions,
integration notes, next recommended frontend task.
