# JEDI Dogfood Applications

Application charter for the three workspace apps.

| App | Port | Role | Compliance |
|-----|------|------|------------|
| `apps/examples` | 3000 | API validation / component gallery | Gate 3 compliance target |
| `apps/docs-app` | 3001 | Documentation-heavy reference consumer | Gate 3 compliance target |
| `apps/playground` | 3002 | Experimentation sandbox | Not a compliance target |

## Public API Rules (compliance apps)

Compliance apps may depend only on:

| App | Allowed `@jedi/*` packages |
|-----|---------------------------|
| `examples` | foundation, react, themes, motion |
| `docs-app` | foundation, react, themes, patterns, docs |

**Forbidden:** direct `@jedi/tokens`, `@jedi/stylex` imports in package.json or source.

Enforced by: `node internal/check-app-boundaries.mjs`

## Gate 3 Definition of Done

- [x] docs-app builds complete doc UI from public packages only
- [x] examples validates components without token package dependency
- [x] App boundary checker PASS
- [x] Third theme toggle in docs-app via `@jedi/themes` only

## Component Adoption

| Package | examples | docs-app | playground |
|---------|----------|----------|------------|
| foundation | yes | yes | yes |
| react | yes | yes | yes |
| themes | yes | yes | yes |
| motion | yes | — | — |
| patterns | — | yes | yes |
| docs | — | yes | yes |
