# Appendix C — API Standards

Fills in the concrete contract behind Volume 4's "API Discipline" and "API
Response Format" sections.

## Versioning

- All routes under `/api/v1/...`. A breaking change gets `/api/v2/...`
  alongside the still-running v1 — never mutate v1's contract in place.

## Response Envelope

**Success:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { "...": "..." },
  "metadata": { "requestId": "...", "timestamp": "2026-07-18T12:00:00Z" }
}
```

**Paginated success:**
```json
{
  "success": true,
  "message": "Products retrieved",
  "data": {
    "items": [ "..." ],
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8
  },
  "metadata": { "requestId": "...", "timestamp": "..." }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "sku", "message": "SKU already exists" }
  ],
  "timestamp": "2026-07-18T12:00:00Z"
}
```

Every response — success or error — uses this shape. No endpoint returns a
bare array or bare object.

## HTTP Status Codes

| Code | Use |
|---|---|
| 200 | Successful GET/PATCH/PUT |
| 201 | Successful POST that created a resource |
| 204 | Successful DELETE (no body) |
| 400 | Malformed request |
| 401 | Missing/invalid auth |
| 403 | Authenticated but not authorized (role/permission) |
| 404 | Resource not found |
| 409 | Conflict (duplicate SKU, quote already converted, etc.) |
| 422 | Validation failure (body/query passes JSON parsing but fails rules) |
| 429 | Rate limited |
| 500 | Unexpected server error (never expose internals here) |

## Request Rules

- Every mutating endpoint (`POST`/`PATCH`/`PUT`/`DELETE`) validates via a
  DTO with `class-validator` decorators — reject before hitting the
  service layer.
- Query params for listing endpoints: `page`, `limit` (default 20, max
  100), `sort`, `direction` (`asc`/`desc`), plus resource-specific filters
  (e.g. `category`, `purity`, `availability` for products per Volume 6).
- Idempotency: `PUT`/`PATCH` on the same resource with the same payload
  produces the same result — no side effects beyond the update itself.

## Authentication & Authorization

- Every route is `@UseGuards(AuthGuard)` by default; public routes are the
  explicit exception (`@Public()` decorator), not the other way around.
- Role/permission checks happen in a guard or decorator, never inline in
  the controller body with an `if` statement buried in business logic.
- Ownership checks (a customer can only see their own orders/invoices)
  happen server-side against the authenticated user's ID — never trust an
  ID passed in the request body/query for "which record is mine."

## Errors & Logging

- Global exception filter maps all thrown exceptions to the error
  envelope above. Stack traces never reach the client, only structured
  logs (per Volume 8's logging strategy).
- Log the `requestId` on both the request and its corresponding error so
  logs can be correlated.

## Swagger / OpenAPI

- Every endpoint: `@ApiOperation`, `@ApiResponse` for each status code it
  can return, and a request/response DTO with `@ApiProperty` on every
  field (so generated docs are complete, not just a bare route list).
- Tag endpoints by module (`@ApiTags('products')`) matching the Core
  Modules list in Volume 4.

## Rate Limiting

- Sensible default (e.g. 100 req/min per IP) on public endpoints; tighter
  limits on auth endpoints (login, password reset) to blunt brute-force
  attempts; quote/order submission endpoints rate-limited per
  authenticated customer, not just per IP.

## Deprecation

- Deprecated fields/endpoints marked `@deprecated` in Swagger with a
  removal-target version, kept functional for at least one full release
  cycle before deletion.
