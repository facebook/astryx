# Sprint 2 — Design Language Research & Validation (Gate 1)

**Date:** 2026-07-04  
**Capability:** `@jedi/tokens`, `@jedi/themes`  
**Gate:** Gate 1 — Design Language Research & Validation  
**Decision filter:** Every change must eliminate uncertainty or reduce future migration cost ([ADR-003](../adrs/ADR-003-token-change-policy.md))

---

## 1. Token Hierarchy Review (core → semantic → component)

| Criterion | Verdict | Finding |
|-----------|---------|---------|
| Three-tier model sufficient | **KEEP** | core, semantic, component cover current scale |
| Fourth tier (e.g. `decision`) | **DEFER** | No capability gap demonstrated; would add cost without reducing uncertainty |
| Core references raw values only | **PASS** | color, spacing, radius, font, elevation, motion, breakpoints |
| Semantic intent-based | **PASS** | surface, text, border, focus, status |
| Component tier minimal | **PASS** | button, input, card only |
| Component tokens necessary | **YES** | Semantic insufficient for padding/radius/font composition without repetition |

**Hierarchy decision:** Retain three-tier model through Architecture Freeze.

---

## 2. Naming Convention Audit

| Surface | Convention | Verdict |
|---------|------------|---------|
| Token paths | dot-notation (`color.blue.500`) | PASS — scales |
| CSS variables | `--jedi-{tier}-{path}` with hyphens | PASS — consistent |
| JSON schema | matches tier + path | PASS |
| Figma readiness | dot paths map to variable groups | PASS — no collisions found |

**Naming decision:** No rename required before freeze.

---

## 3. Taxonomy Review — Missing Tiers

| Domain | Current state | Gap | Gate 1 action |
|--------|---------------|-----|---------------|
| Motion | `core.motion` + `@jedi/motion` package | Motion not in semantic layer | **DEFER** — package delegation is intentional; semantic motion not needed yet |
| State / interactive | Missing `interactive.*` | Hover/focus states use core colors in components | **ADD** `semantic.interactive.hover` (independence experiment) |
| Elevation | `core.elevation.shadow.*` | Used via CSS vars in foundation | **KEEP** — no semantic elevation needed yet |
| Density | Not present | No density scale | **DEFER** — no consumer requires it |
| Typography | `core.font.*` | Some components use raw `--jedi-font-size-*` | Document; migrate post-freeze in Gate 2 token-coverage metric |

---

## 4. Theme Contract Validation

| Check | Verdict |
|-------|---------|
| `JediThemeContract` interface | PASS — modes + getSemanticTokens |
| Light/dark contracts | PASS |
| Third theme without component changes | **PASS** — `highContrastTheme` via `@jedi/themes` |
| `createTheme` accepts custom contracts | **PASS** — `createTheme(name, contracts?)` |

---

## 5. Public API Audit

| Package | Own capability only | Notes |
|---------|---------------------|-------|
| `@jedi/tokens` | PASS | Full token API — correct for layer |
| `@jedi/themes` | PASS | Theme application API |
| `@jedi/stylex` | PASS | Styling helpers |
| `@jedi/foundation` | PASS | Layout primitives |
| `@jedi/react` | PASS* | Re-exports icons — intentional composite DX; document at freeze |
| `@jedi/icons` | PASS | Icon components |
| `@jedi/patterns` | PASS | Layout patterns |
| `@jedi/docs` | PASS | Token re-exports removed at Foundation Acceptance |
| `@jedi/a11y` | PASS | A11y utilities |
| `@jedi/motion` | PASS | Wraps `core.motion` — own motion API surface |

**Leaks found:** None at package export boundary.

**Raw core references in components (token coverage debt — Gate 2 metric):**

| Location | Raw reference | Semantic alternative |
|----------|---------------|---------------------|
| `react/Button` | `--jedi-color-blue-600` | `semantic.interactive` or `semantic.text.link` (post-freeze) |
| `react/Checkbox`, `Spinner` | `--jedi-color-blue-600` | same |
| `docs/EvidencePanel` | `--jedi-color-blue-600` | `semantic.text.link` |
| `docs/ResearchCallout` | `--jedi-color-blue-500` | `semantic.focus.ring` or new `semantic.accent` |

These do not block Architecture Freeze — tracked for Gate 2 token-coverage metric.

---

## 6. Boundary Hardening

| Check | Status |
|-------|--------|
| Allowed dependency graph | PASS — `check-boundaries.mjs` enforces ALLOWED_DEPS |
| No Astryx runtime | PASS |
| Icons consumer restriction | PASS — only `@jedi/react` |
| Forbidden re-exports (`docs` → `tokens`) | PASS |
| Cycle detection | **PASS** — DFS cycle check in `check-boundaries.mjs` |
| General re-export scan | **PASS** — all packages; `react` → `icons` allowed |

---

## 7. Independence Experiments

| Experiment | Expected outcome | Status |
|------------|------------------|--------|
| Add `semantic.interactive.hover` | Theme injects; no component changes | **PASS** |
| Add third theme (`jedi-high-contrast`) | `createTheme()` only; components unchanged | **PASS** |
| Modify `spacing.4` (16px → 18px) | Component tokens using `spacing[4]` update; semantic spacing unaffected | **VALIDATED** via `component.button.paddingX` chain |
| Modify `font.size.300` | Core CSS vars update; semantic text unchanged | **VALIDATED** — semantic text uses explicit color refs not font.size.300 |

### Spacing experiment (analysis)

`component.button.paddingX` resolves to `spacing[4]`. Changing core `spacing.4` updates component tier without semantic edits. Components using semantic surface/text tokens remain unaffected.

### Typography experiment (analysis)

Semantic `text.*` tokens reference `color.*` not `font.size.*`. Changing `font.size.300` affects components referencing `--jedi-font-size-*` directly (react Heading, docs) — documented as token-coverage debt, not a hierarchy failure.

---

## 8. Gate 1 Code Changes Required

The following implement independence experiments and boundary hardening (not new components):

1. `packages/tokens/src/semantic/index.ts` — add `interactive.hover`, `highContrastThemeContracts`
2. `packages/tokens/src/index.ts` — export new contracts
3. `packages/themes/src/index.ts` — `createTheme(name, contracts?)`, export `highContrastTheme`
4. `packages/tokens/src/independence.test.ts` — four experiment tests
5. `internal/check-boundaries.mjs` — cycle detection, expanded re-export scan
6. `apps/examples/src/App.tsx` — theme selector for default vs high-contrast (validation only)

---

## Gate 1 Exit Checklist

- [x] ADR-003 accepted
- [x] CONSTITUTION + LIFECYCLE updated
- [x] Token hierarchy reviewed
- [x] Naming audited
- [x] Taxonomy gaps documented
- [x] Public API audited
- [x] Independence experiments coded + tested
- [x] Boundary hardening complete
- [x] Architecture Freeze document signed

**Gate 1:** PASS
