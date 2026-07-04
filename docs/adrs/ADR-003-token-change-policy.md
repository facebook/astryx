# ADR-003: Design Language Change Policy

## Status

**Status:** Accepted  
**Date:** 2026-07-04  
**Decision Maker(s):** JEDI Foundation Program  
**Supersedes:** None

## Context

JEDI separates **platform architecture freeze** (packages, dependency graph) from **design language evolvability** (tokens, naming, hierarchy). During Gate 1 (Sprint 2), the design language is researched and validated before Architecture Freeze locks the v1.0 contract.

**In scope:** When and how token taxonomy, naming, hierarchy, and values may change.  
**Out of scope:** Package boundaries (ADR-002), npm publish versioning (post-v1.0).

## Decision Drivers

- Token changes are cheapest before component scale
- Architecture Freeze must produce a publishable contract
- Consumers need predictable migration rules after v1.0
- Gate 1 changes must eliminate uncertainty or reduce future migration cost

## Decision

**We will apply a two-phase change policy for the Design Language.**

### Gate 1 / v0.x (before Architecture Freeze)

| Change type | Allowed | Requirement |
|-------------|---------|-------------|
| Token values | Yes | Sprint note |
| New tokens | Yes | Tier classification per ADR-001 |
| Naming | Yes | ADR-003 reference in PR |
| Hierarchy / taxonomy | Yes | ADR + sprint research log |
| Breaking changes | Yes | Document in sprint note |

**Gate 1 decision filter:** Every architectural change must either **eliminate uncertainty** or **reduce future migration cost**. If it does neither, defer until after Architecture Freeze.

### Post-Freeze / v1.0+ (Stable)

| Change type | Allowed | Requirement |
|-------------|---------|-------------|
| Token values | Yes | Minor version |
| New tokens | Yes | Minor version; tier per ADR-001 |
| Naming | With migration | Deprecation aliases; ADR |
| Hierarchy / taxonomy | Rare | ADR + migration strategy + major version |
| Philosophy change | Rare | ADR + major version |

## Consequences

### Positive

- Clear window for inexpensive token refinement (Sprint 2)
- Explicit contract lock at Architecture Freeze
- Migration rules prevent silent breaking changes post-v1.0

### Negative / Trade-offs

- Two freeze levels require contributor literacy (platform vs design language)

### Operational Impact

- Sprint 2 research log records all Gate 1 token decisions
- Architecture Freeze (`ARCHITECTURE-FREEZE.md`) marks transition to Stable contract
- **Migration / rollback:** Pre-freeze changes revert via git; post-freeze requires deprecation path

### Risks

| Risk | Likelihood | Impact | Mitigation | Owner | Review Trigger |
|------|-----------|--------|------------|-------|----------------|
| "Nice improvements" creep into Gate 1 | Med | Med | Gate 1 decision filter in CONSTITUTION | Platform lead | Any Gate 1 PR without research log entry |

## Review Schedule

- **Next review:** Architecture Freeze (Sprint 2 exit)
- **Review owner:** Platform lead

## Related ADRs

- ADR-000 — Foundation Program (governance context)
- ADR-001 — Token architecture (tier model this policy governs)
- ADR-002 — Layer boundaries (orthogonal; packages frozen separately)

## References

- [CONSTITUTION.md](../CONSTITUTION.md)
- [LIFECYCLE.md](../LIFECYCLE.md)
- [ARCHITECTURE-FREEZE.md](../ARCHITECTURE-FREEZE.md) (created at Sprint 2 exit)
