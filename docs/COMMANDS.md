# Commands

The single source of truth for CLI commands. [CHECKLISTS.md](CHECKLISTS.md) references this file rather than repeating the commands.

Nx is installed at the root but not yet wired up (no `nx.json`/`project.json` per project) — until it is, run commands per-service with pnpm's `--filter`, or `cd` into the service/app directory directly.

## Infra

```bash
docker compose up -d          # start Postgres (provisions one DB per service)
docker compose down           # stop it
docker compose down -v        # stop it and wipe the volume (destructive)
```

## Per-service (NestJS: catalog, accounts, oms)

Run from `services/<name>/`, or `pnpm --filter <name> <script>` from the root once each service's `package.json` `name` field is set accordingly.

```bash
pnpm dev                # nest start --watch
pnpm build               # nest build
pnpm lint                # eslint --fix
pnpm format               # prettier --write

pnpm test                 # jest, unit tests
pnpm test:watch
pnpm test:cov              # jest --coverage
pnpm test:e2e              # jest --config ./test/jest-e2e.json
```

## Prisma (catalog, accounts, oms)

```bash
npx prisma migrate dev --name <migration-name>   # create + apply a migration locally
npx prisma migrate deploy                        # apply pending migrations (CI/prod)
npx prisma generate                              # regenerate the client into src/database/prisma
npx prisma studio                                # inspect the DB visually
npx prisma db seed                               # run prisma/seed.ts, where present
```

## Per-service (Express/Hono: payments, tms)

Exact script names will match whatever's set up when each service is scaffolded — expect the same shape as the Nest services (`dev`, `build`, `lint`, `test`, `test:e2e`), run via Vitest instead of Jest.

## Frontend apps (storefront, admin)

```bash
pnpm dev                  # astro dev / next dev
pnpm build
pnpm lint

pnpm test:e2e              # playwright test
```

## Git

```bash
git checkout -b <type>/<description>       # branch (see GIT_CONVENTIONS.md)
git add <specific files>                   # never git add -A — stage deliberately
git commit -m "<type>(<scope>): <subject>"
git push -u origin <branch>
gh pr create --fill                        # or with an explicit --title/--body
```

## See also

- [CHECKLISTS.md](CHECKLISTS.md) — when to run which of these
- [GIT_CONVENTIONS.md](GIT_CONVENTIONS.md) — branch/commit format
