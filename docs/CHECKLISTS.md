# Pre-PR Checklist

The gate every change passes before it's marked ready for human review. The `morpheus` and `smith` skills run this checklist mechanically; a human driving a change without the pipeline should run it manually. Commands referenced here are defined in [COMMANDS.md](COMMANDS.md).

## Data layer
- [ ] Schema changes have a migration (`prisma migrate dev`), no manual DB edits.
- [ ] DTOs/Zod schemas composed from a base schema, not rebuilt field-by-field ([DATA_LAYER.md](DATA_LAYER.md)).
- [ ] New service methods use an object-param signature (existing `catalog` positional-arg methods aren't refactored — see [DATA_LAYER.md](DATA_LAYER.md)).
- [ ] Money fields are integer cents. Ownership-scoped queries actually scope by the authenticated identity, not a client-supplied id.

## Backend
- [ ] Controller/route handler does one service call plus response shaping — no business logic in the API layer ([API_LAYER.md](API_LAYER.md)).
- [ ] No cross-service or cross-domain internal imports ([ARCHITECTURE.md](ARCHITECTURE.md)).
- [ ] Errors are typed `AppError` subclasses, mapped to HTTP status by the shared error handler — nothing leaks a stack trace.

## Frontend
- [ ] Data fetched server-side (Astro frontmatter / Next.js Server Component), not via client-side `fetch()` for initial render.
- [ ] Every interactive element has a `data-testid`.
- [ ] Loading and error states exist for every data-fetching route segment (admin).

## Tests
- [ ] Unit tests cover happy path + validation errors + business-rule errors + not-found ([TESTING_UNIT.md](TESTING_UNIT.md)), `pnpm test:cov` at or above 80% for the touched service.
- [ ] E2E test added/updated for any new or changed user journey ([TESTING_E2E.md](TESTING_E2E.md)).
- [ ] `pnpm lint` and `pnpm build` pass with no errors.

## Security
- [ ] Every mutating endpoint checks the caller is authenticated and authorized for the resource.
- [ ] All input is validated (Zod/`class-validator`) before touching the database.
- [ ] No secrets, tokens, or connection strings in code or logs.
- [ ] Dependency additions checked against `pnpm audit` for known-critical CVEs.

## Git & PR
- [ ] Branch name and commit messages follow [GIT_CONVENTIONS.md](GIT_CONVENTIONS.md).
- [ ] Branch is rebased on current `main`, no merge conflicts.
- [ ] PR description states what changed, why, and how it was tested.
