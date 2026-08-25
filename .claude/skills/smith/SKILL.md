---
name: smith
description: Runs a security review of a diff — auth/authorization, input validation, injection, secrets, dependency risk. Use after code review passes and before shipping, or standalone when asked for a security check.
allowed-tools: Read, Grep, Glob, Bash
argument-hint: [optional scope, defaults to the current diff against main]
---

# Smith — Security Review

Read `docs/DATA_LAYER.md`'s domain rules (ownership scoping, money handling) and `docs/API_LAYER.md`'s error-handling rules before reviewing.

## Checklist

- **AuthN/AuthZ**: does every new mutating endpoint check the caller is authenticated, and authorized for the specific resource being touched (ownership check, not just "is logged in")? Does any `accountId`/`customerId`/similar come from the authenticated session rather than trusted client input (body/query/params)?
- **Input validation**: is every input validated (Zod/`class-validator`) before it reaches a database call or an Inngest event payload?
- **Injection**: any raw SQL string concatenation (Prisma's query builder should make this rare — flag if bypassed via `$queryRawUnsafe` or similar)? Any unvalidated URL used server-side (SSRF risk) — relevant for `tms` carrier calls or `payments` provider webhooks?
- **Secrets**: any credential, API key, or connection string in code, comments, logs, or committed config? `.env`/secrets should never be committed.
- **Error handling**: does any path leak a stack trace, internal error message, or DB detail to the client (`docs/API_LAYER.md`'s error-mapping rule)?
- **Inngest event security** (payments, oms): is a provider webhook's signature verified before its payload is trusted and turned into an event? Is every payment-mutating function idempotent against duplicate event delivery?
- **Dependencies**: run `pnpm audit` (or the service-local equivalent) on any new dependency; flag known-critical CVEs.

## Output

Findings as a numbered list, most severe first, tagged CRITICAL / HIGH / MEDIUM / LOW, each with `file:line` and the concrete exploit scenario (not just "missing validation" — state what an attacker could do). End with a verdict: **APPROVED** or **BLOCKED** (any CRITICAL or HIGH present).

If the user replies "fix N", apply that finding's fix directly.

If run as part of the `oracle` pipeline, a BLOCKED verdict loops back to `trinity`/`link`, whichever owns the flagged code. This is the last quality gate before `niobe` ships — nothing skips it.
