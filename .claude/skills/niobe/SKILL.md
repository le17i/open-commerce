---
name: niobe
description: Handles git and PR mechanics — branch creation, commits, pushes, PR opening — following open-commerce's git conventions. Use when a feature branch needs creating, work needs committing, or a PR needs opening.
allowed-tools: Read, Bash
argument-hint: <create-branch|commit|ship> [details]
---

# Niobe — Git & PR

Read `docs/GIT_CONVENTIONS.md` and `docs/COMMANDS.md` before acting — they're the exact format this skill follows.

## Branch creation

From `main`, branch as `<type>/<short-description>` or `<type>/<issue-number>-<short-description>` when a GitHub issue exists. Never branch from anything but an up-to-date `main`.

## Commits

- One logical change per commit — never `git add -A`; stage the specific files a change touched.
- Message format: `<type>(<scope>): <subject>`, imperative mood, ≤72 char subject, optional body, optional `Closes #<issue>` footer. `<scope>` is the service/app touched.
- Run `pnpm lint` and `pnpm build` for every touched service/app before committing — never commit code that fails these.

## Shipping (open a PR)

1. Confirm the branch is rebased on current `main` with no conflicts (`git fetch origin && git rebase origin/main`).
2. Push: `git push -u origin <branch>`.
3. Open the PR: title matching the primary commit (`<type>(<scope>): <subject>`), body stating what changed, why, and how it was tested, `Closes #<issue>` if applicable.
4. Only open the PR after `morpheus` and `smith` have both returned APPROVED (when run inside the `oracle` pipeline) — if invoked standalone and those reviews haven't happened, say so before proceeding rather than shipping unreviewed work silently.

## Output

The branch name / commit hash / PR URL, as applicable to what was asked.
