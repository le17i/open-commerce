# Open Commerce — Development Guide

Read this first. It indexes every other doc and defines how a feature moves from idea to merged PR, whether a human drives it directly or through the Claude Code skill pipeline in `.claude/skills/`.

## Doc index

| Doc | Covers |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System map, per-service layering, import boundaries |
| [DATA_LAYER.md](DATA_LAYER.md) | Schemas, DTOs, service-method conventions, domain rules |
| [API_LAYER.md](API_LAYER.md) | Controller/route conventions per framework, Next.js Server Actions |
| [FRONTEND.md](FRONTEND.md) | Astro storefront and Next.js admin conventions |
| [SCHEMA.md](SCHEMA.md) | Current database schema per service |
| [CODEBASE.md](CODEBASE.md) | Current service functions per domain |
| [TESTING_UNIT.md](TESTING_UNIT.md) | Unit test conventions |
| [TESTING_E2E.md](TESTING_E2E.md) | E2E test conventions |
| [GIT_CONVENTIONS.md](GIT_CONVENTIONS.md) | Branch/commit/PR format |
| [COMMANDS.md](COMMANDS.md) | Every CLI command used across the project |
| [CHECKLISTS.md](CHECKLISTS.md) | The pre-PR quality gate |

## Core principles

1. **Domain-driven boundaries.** Organize by business domain (product, order, payment, shipment), not by technical layer. A domain's controller/route, service, schema, and tests live together.
2. **Separation of concerns.** API layer orchestrates, service layer decides, schema layer defines shape. See [ARCHITECTURE.md](ARCHITECTURE.md)'s layering per framework.
3. **Type safety.** TypeScript strict, no `any`. Types are derived from the schema (Prisma-generated or Zod-inferred), never hand-duplicated.
4. **Testing.** >80% unit coverage on service logic, E2E coverage on every critical user journey.
5. **Security by default.** Every mutating action authenticates and authorizes; every input is validated; nothing leaks internal errors.
6. **Independently deployable services.** A service never reaches into another service's database or source code — HTTP or Inngest events only.

All code, comments, commit messages, and docs are written in English.

## The skill pipeline

`.claude/skills/` implements the same Matrix-persona pipeline for every feature, regardless of which service(s) it touches:

```
oracle (orchestrator)
  → niobe    branch created
  → merovingian (mode A)   test plan written
  → neo      architecture designed
  → trinity / link   backend / frontend implemented (stack-aware)
  → merovingian (mode B)   tests run and pass
  → morpheus   code review
  → smith      security review
  → tank       docs updated
  → niobe      commit, push, PR
```

Each arrow is a gate: the next stage doesn't start until the current one's checklist passes. On failure, work loops back to the stage that owns the problem (e.g. a `morpheus` finding about business logic loops back to `trinity`, not to `neo`), up to a small retry budget before it's handed back to a human.

See `.claude/skills/README.md` for what each persona skill actually does and its `SKILL.md` file for its exact process.

## Driving a feature

**Through `oracle` (recommended for anything non-trivial):**

```
/oracle <a GitHub issue reference, or a free-text description of the feature>
```

`oracle` runs every stage above in order. Pass `--skip-stages <list>` to skip stages you've already done by hand (e.g. skip `neo` if you're handing it an already-agreed architecture).

**Invoking a single stage directly** — reasonable for a small, well-understood change (a one-file bugfix, a docs typo) where the full pipeline is overkill:

```
/neo <question>          # just the architecture design
/trinity <task>          # just the backend implementation
/morpheus                # just review the current diff
```

A human is always free to do any stage's job by hand instead of invoking the skill — the skills exist to make the standard process fast and consistent, not to gate what a human is allowed to do directly. What a human should never skip: the [CHECKLISTS.md](CHECKLISTS.md) gate before opening a PR, whether it was run by `morpheus`/`smith` or manually.

## Cross-service features

For a feature spanning multiple services (e.g. checkout: `oms` + `payments` + `tms`):

1. `neo` designs the whole interaction once — which service owns what, what's synchronous (HTTP) vs. asynchronous (Inngest event), in a single architecture pass covering all affected services.
2. Implementation still happens as separate changes per service — one branch/PR per service, each independently reviewable and revertable, even though they came from one design pass.
3. Land the producing side of an async interaction before or together with the consuming side (e.g. `oms` emitting `order.paid` lands with or before `payments`/`tms` code that listens for it), so nothing depends on code that doesn't exist yet.

## Human vs. skill responsibility

- **Skills own**: following the documented conventions exactly, running the checklist mechanically, producing a first draft of every artifact (plan, code, tests, docs, PR).
- **Humans own**: approving the architecture before implementation starts on anything non-trivial, resolving genuine ambiguity a skill surfaces (an open question `neo` couldn't answer from the docs), and final PR approval. A skill's "APPROVED" verdict at a gate is a recommendation, not a merge.
