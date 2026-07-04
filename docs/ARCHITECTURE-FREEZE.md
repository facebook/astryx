# Architecture Freeze

**Date:** 2026-07-04  
**Gate:** Post Gate 1 (Sprint 2) — Design Language Research & Validation  
**Prerequisite:** [sprint-02-design-language-research.md](./sprints/sprint-02-design-language-research.md)

---

## Freeze Scope

Upon signing this document, the following become the **platform contract** for v1.0:

| Layer | Frozen artifact |
|-------|-----------------|
| Package boundaries | ADR-002 editorial exclusion; 10-package graph |
| Dependency graph | [ARCHITECTURE.md](./ARCHITECTURE.md) allowed-deps table |
| Public APIs | Per-package export surfaces (audit in Sprint 2) |
| Token hierarchy | Three-tier: core → semantic → component (ADR-001) |
| Token naming | dot-notation paths; `--jedi-{tier}-{path}` CSS vars |
| Theme contracts | `JediThemeContract`; default + high-contrast named themes |

**Change policy after freeze:** [ADR-003](./adrs/ADR-003-token-change-policy.md) v1.0+ rules.

---

## Architecture Freeze Questions

Answer without qualification. Any **Yes** (would change) → return to Sprint 2.

| # | Question | Answer | Rationale |
|---|----------|--------|-----------|
| 1 | Would I still choose this token hierarchy? | **No** | Three-tier model validated; fourth tier deferred without demonstrated gap |
| 2 | Would I redesign the semantic model? | **No** | surface/text/border/focus/status/interactive sufficient for v1.0; density deferred |
| 3 | Would I rename any package? | **No** | Capability mapping is clear and stable |
| 4 | Would I publish these public APIs? | **No** | Audit PASS; icon re-exports in react documented as composite DX |
| 5 | Would I change the dependency graph? | **No** | Graph enforced; no backward edges; icons via react only |

---

## Verdict

**ARCHITECTURE FROZEN** — 2026-07-04. Gate 1 complete. Proceed to **Gate 2 / Sprint 3** (Platform Health).

---

## What remains intentionally unfrozen (Gate 2+)

| Item | Gate |
|------|------|
| Token values (e.g. spacing.4 = 18px) | Gate 2 minor changes with metric tracking |
| Raw core refs in components → semantic | Gate 2 token-coverage metric |
| Smoke tests for icons/patterns/a11y/motion | Gate 2 |
| docs-app public-API expansion | Gate 3 |

---

## References

- [ADR-000](./adrs/ADR-000-foundation-program.md) — Foundation Program marker
- [ADR-001](./adrs/ADR-001-token-architecture.md) — Token hierarchy
- [ADR-003](./adrs/ADR-003-token-change-policy.md) — Change policy
- [ACCEPTANCE.md](./ACCEPTANCE.md) — Foundation Acceptance (complete)
