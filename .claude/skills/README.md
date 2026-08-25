# Skills

Claude Code skills for `open-commerce`, one persona per pipeline stage. See [docs/GUIDE.md](../../docs/GUIDE.md) for the full workflow these implement and the principles they follow.

| Skill | Persona | Stage | Purpose |
|---|---|---|---|
| `oracle` | Oracle | Orchestrator | Runs every stage below in order, enforcing gates and loop-backs. Invoke this for anything non-trivial. |
| `niobe` | Niobe | Branch / Ship | Branch creation, commits, PR opening — [docs/GIT_CONVENTIONS.md](../../docs/GIT_CONVENTIONS.md). Invoked twice: once to branch, once to ship. |
| `merovingian` | Merovingian | Test plan / Test validation | Mode A: writes the test matrix before code exists. Mode B: runs and validates tests after implementation — [docs/TESTING_UNIT.md](../../docs/TESTING_UNIT.md), [docs/TESTING_E2E.md](../../docs/TESTING_E2E.md). |
| `neo` | Neo | Architecture | Designs service boundaries, data model, API contract, and Inngest reliability properties before implementation — [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md). |
| `trinity` | Trinity | Backend implementation | Implements NestJS+Prisma, Express+Inngest, or Express+Hono code, stack-aware per service — [docs/DATA_LAYER.md](../../docs/DATA_LAYER.md), [docs/API_LAYER.md](../../docs/API_LAYER.md). |
| `link` | Link | Frontend implementation | Implements Astro storefront or Next.js admin code — [docs/FRONTEND.md](../../docs/FRONTEND.md). |
| `morpheus` | Morpheus | Code review | Architecture/pattern conformance, code quality, test coverage review. P1/P2/P3 findings, can apply fixes. |
| `smith` | Smith | Security review | AuthN/authZ, validation, injection, secrets, dependency review. CRITICAL/HIGH/MEDIUM/LOW findings, can apply fixes. |
| `tank` | Tank | Docs | Updates service/app READMEs and the project-wide `docs/CODEBASE.md`/`docs/SCHEMA.md` indexes after implementation. |

## Pipeline order

```
oracle
 → niobe (branch)
 → merovingian (test plan)
 → neo (architecture)
 → trinity / link (implementation)
 → merovingian (test validation)
 → morpheus (code review)
 → smith (security review)
 → tank (docs)
 → niobe (ship)
```

Every arrow is a gate — see [docs/GUIDE.md](../../docs/GUIDE.md#the-skill-pipeline) for the loop-back rules on failure.

## Using a skill standalone

Any skill can be invoked directly (`/neo`, `/trinity`, `/morpheus`, ...) for a scoped task where the full pipeline is overkill. See [docs/GUIDE.md](../../docs/GUIDE.md#driving-a-feature) for when that's appropriate.
