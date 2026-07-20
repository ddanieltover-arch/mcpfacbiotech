# Prompt Library

Ready-made prompts for common MCPFAC BIOTECH engineering tasks. Copy one,
fill in the bracketed parts, and send it — each is phrased to trigger the
right working mode (Volume 8) and pull in the right volumes/appendices
automatically.

---

## Build a New Feature

```
Build [feature name] for MCPFAC BIOTECH.

Context: [what this feature does and why, e.g. "customers need to see
estimated shipping cost before checkout"]

Scope: [Frontend / Backend / Database / Full-stack]

Constraints: [anything specific — must reuse X, must not touch Y,
performance target, etc.]
```

Triggers: Decision Framework (SKILL.md) → relevant volumes for the layers
touched → Appendices A–F for concrete conventions.

---

## Design a Database Schema Change

```
Design the schema change for [feature/entity].

New data needed: [fields, relationships]
Affects existing tables: [yes/no — which ones]
Needs RLS: [yes/no — who should access it]
```

Triggers: Database Mode (Volume 5) + Appendix E (Prisma Schema Standards).

---

## Build an API Endpoint

```
Build the [method] /api/v1/[resource] endpoint.

Purpose: [what it does]
Request: [body/query shape, or "design it"]
Response: [expected data shape]
Auth: [who can call it — role/ownership rules]
```

Triggers: Backend Mode (Volume 4) + Appendix C (API Standards).

---

## Build a UI Screen/Component

```
Build the [page/component name].

Purpose: [what the user is trying to do here]
Data needed: [what it displays/edits]
States to handle: [loading/empty/error — or "all standard states"]
Reference: [similar existing page/component to stay consistent with, if any]
```

Triggers: Frontend Mode (Volume 3) + Volume 2 (Design System) +
Appendix D (UI Component Standards).

---

## Fix a Bug

```
Bug: [what's happening]
Expected: [what should happen instead]
Steps to reproduce: [if known]
Where it likely lives: [module/page/endpoint, or "not sure"]
Error message / logs: [paste if available]
```

Triggers: Debug Mode (Volume 8) — reproduce → root cause → explain → minimal
fix → regression test, not a broad rewrite.

---

## Review Code

```
Review this code for [file/PR/diff — paste or describe].

Focus areas: [Security / Performance / Architecture / All]
```

Triggers: Review Mode (Volume 8) — checks against Appendix A (Coding
Standards) plus the relevant volume(s) for architectural fit.

---

## Refactor a Module

```
Refactor [module/file/area].

Problem: [duplication / hard to test / too large / inconsistent with
standards — be specific]
Must preserve: [behavior/contract that must not change]
```

Triggers: Refactor Mode (Volume 8) — preserves behavior, updates tests,
checked against Appendix A.

---

## Generate Tests

```
Generate tests for [service/component/endpoint].

Test types needed: [Unit / Integration / E2E / All]
Edge cases to cover: [if you already know some — otherwise "identify them"]
```

Triggers: Testing Mode (Volume 8) — coverage targets from Volume 8's Test
Coverage Targets table.

---

## Security Review

```
Security review of [module/feature/the whole checkout flow, etc.]

Specific concern (if any): [e.g. "can a customer see another customer's
invoices?"]
```

Triggers: Security Mode (Volume 8) — audits auth, validation, permissions,
file uploads per Volume 8's Security Hardening section.

---

## Performance Review

```
Performance review of [page/endpoint/query].

Symptom: [slow load / slow query / large bundle — if known]
Target: [Volume 8's performance objectives, or a specific number]
```

Triggers: Performance Mode (Volume 8) — measurable recommendations against
Volume 8's Performance Objectives table.

---

## Plan a Large/Architectural Change

```
I want to [big change — e.g. "add multi-warehouse inventory" or "add a
distributor portal"].

Why: [business reason]
Rough scope: [what you think it touches — or "not sure, help me scope it"]
```

Triggers: Architect Mode (Volume 8) — analyzes requirements and proposes
architecture *before* any code, checked against Future
Extensibility/Readiness sections already reserved for this in Volumes
4–8.

---

## Document a Feature

```
Document [feature/module] for [API docs / architecture notes / README /
developer guide].
```

Triggers: Documentation Mode (Volume 8) — output matches whichever
doc type you specify.

---

## Deploy / Release

```
Prepare release [vX.Y.Z] for deployment.

Includes: [list of features/fixes in this release, or "check what's on
develop"]
```

Triggers: Volume 8's CI/CD pipeline, Quality Gates, and Appendix F's
Release Checklist.

---

## Enterprise Project Management

```
Act as the Enterprise Project Manager for MCPFAC BIOTECH.

Goal: Manage the delivery of [Milestone / Phase / Feature].

Responsibilities:
1. Maintain the project backlog in task.md
2. Enforce engineering standards before closing tasks
3. Manage dependencies across the stack (Frontend/Backend/DB)
4. Record completed work in walkthrough.md
5. Ensure zero regressions and 100% completion before moving to the next phase.

Current status: [Brief description of where we are]
Next action: [What needs to happen next, or "Review current state and advise"]
```

Triggers: Orchestrator Mode (Volume 8) — focuses exclusively on process, standards compliance, task tracking, and milestone verification rather than writing code.
