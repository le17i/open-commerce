<!--
Title: <emoji> <type>(<scope>): <subject>  — see docs/GIT_CONVENTIONS.md
e.g. ✨ feat(catalog): add product variant support
-->

## What changed

## Why

## How it was tested

## Related issue

Closes #

## Pre-PR checklist

Full gate: [docs/CHECKLISTS.md](../docs/CHECKLISTS.md)

- [ ] Branch name and commit messages follow [GIT_CONVENTIONS.md](../docs/GIT_CONVENTIONS.md)
- [ ] Branch is rebased on current `main`, no merge conflicts
- [ ] `pnpm lint` and `pnpm build` pass
- [ ] Tests added/updated for the change, `pnpm test:cov` at or above 80% for the touched service
- [ ] No secrets, tokens, or connection strings in code or logs
- [ ] Mutating endpoints check auth + ownership; all input validated before touching the database
