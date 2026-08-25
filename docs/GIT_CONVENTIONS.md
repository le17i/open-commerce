# Git Conventions

## Branches

`<type>/<short-description>`, or `<type>/<issue-number>-<short-description>` when a GitHub issue exists:

```
feat/product-variants
fix/42-offer-price-rounding
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `security`.

Never commit directly to `main`. One feature/fix per branch.

## Commits

Conventional Commits, imperative mood, ≤72 char subject, with a [gitmoji](https://gitmoji.dev) prefix matching the type:

```
<emoji> <type>(<scope>): <subject>

<optional body>

<optional footer, e.g. Closes #42>
```

| Type | Emoji | Code |
| --- | --- | --- |
| `feat` | ✨ | `:sparkles:` |
| `fix` | 🐛 | `:bug:` |
| `refactor` | ♻️ | `:recycle:` |
| `docs` | 📝 | `:memo:` |
| `test` | 🧪 | `:test_tube:` |
| `chore` | 🔧 | `:wrench:` |
| `perf` | ⚡️ | `:zap:` |
| `security` | 🔒 | `:lock:` |

The emoji is always paired with its `<type>()` — never one without the other, since the conventional-commit type is the part tooling (changelogs) actually depends on and the emoji is just a visual aid on top of it.

`<scope>` is the service or app the change touches (`catalog`, `payments`, `admin`, `storefront`, `docs`, `skills`). Example:

```
✨ feat(catalog): add product variant support

Adds parent/variant relation handling to ProductsService and
exposes variants on the product detail response.

Closes #42
```

## Pull requests

- Title: `<emoji> <type>(<scope>): <subject>`, matching the primary commit.
- Body: what changed, why, how it was tested, and `Closes #<issue>` if applicable.
- Passes the [CHECKLISTS.md](CHECKLISTS.md) gate before requesting review — the `smith` and `morpheus` skills exist to run this gate before a human ever looks at the diff.
- Rebase (not merge) onto `main` to resolve conflicts; squash fixup commits via interactive rebase before requesting review.

## See also

- [CHECKLISTS.md](CHECKLISTS.md) — pre-PR checklist
- [COMMANDS.md](COMMANDS.md) — the git/CLI commands themselves
