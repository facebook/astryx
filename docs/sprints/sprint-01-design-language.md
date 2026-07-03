# Sprint 1 — Design Language

**Date:** 2026-07-04  
**Capability:** `@jedi/tokens`

## What JEDI owns

Three-tier token system expressing Design Language: color, typography, spacing, elevation, motion.

## Astryx reference

Studied token cascade in `packages/themes/` — **Adapted** tier model with JEDI-native values. Logged in decision-log.md.

## Deliverables

- [x] Token taxonomy (core / semantic / component)
- [x] JSON schema (`schema/tokens.schema.json`)
- [x] CSS variable generation
- [x] Theme contracts interface
- [x] Unit tests (Capability + Quality)
- [x] ADR-001, package README (Knowledge)

## Architectural Fitness

PASS — `@jedi/tokens` resolves tokens and emits CSS vars without themes or React.

## Token Hierarchy Review (2026-07-04)

Manual review of `core/` and `semantic/` against ADR-001:

| Criterion | Verdict | Notes |
|-----------|---------|-------|
| Three-tier model (core → semantic → component) | PASS | All tiers present |
| Core references raw values only | PASS | color, spacing, radius, font, elevation, motion |
| Semantic is intent-based | PASS | surface, text, border, focus, status |
| Component tier minimal | PASS | button, input, card only — justified overrides |
| Theme contracts interface | PASS | `JediThemeContract` in contracts/theme |
| CSS variable generation | PASS | `getAllCssVars`, `tokenToCssVar` |
| JSON schema validation | PASS | `schema/tokens.schema.json` |
| Naming scales | PASS | dot-notation, tier-prefixed CSS vars |

**Semantic layer completeness:** Surface, text, border, focus, and status cover current component needs. No gaps identified for v0.3 components.

**Component tokens necessity:** Retained for button, input, card sizing — semantic layer insufficient for padding/radius composition without repetition.

**Theme contracts:** Light/dark semantic maps feel correct; `applyTheme` consumes contract as designed.

**Living period observations:** Token architecture is stable for Commit 5 (foundation). No token changes required before layout primitives land.

## Pillars

| Pillar | Status |
|--------|--------|
| Capability | PASS |
| Quality | PASS — tests green |
| Knowledge | PASS — ADR-001, README, this note |
