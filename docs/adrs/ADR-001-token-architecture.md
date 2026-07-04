# ADR-001: Token Architecture

## Status

**Status:** Accepted  
**Date:** 2026-07-04  
**Decision Maker(s):** JEDI Foundation Program  
**Supersedes:** None

## Context

JEDI separates Design Language from Design System. Tokens express the design language — color, typography, spacing, elevation, motion — as a typed, governable system consumed by themes and components.

**In scope:** Token tier model, naming, CSS variable generation, theme contracts.  
**Out of scope:** Theme implementation (ADR follows in Sprint 2), component tokens beyond initial set.

## Decision Drivers

- Tokens must be consumable without React
- Semantic tokens are the default component consumption surface
- JEDI-native naming — not Astryx-renamed values
- Theme contracts define the interface between tokens and themes

## Decision

**We will use a three-tier token model: core → semantic → component.**

- **Core** — Raw design language values (`color.blue.500`, `spacing.4`, `font.size.300`)
- **Semantic** — Intent-based aliases (`surface.primary`, `text.secondary`)
- **Component** — Component-specific overrides (`button.background`, `button.padding`)

Core is the only tier referencing raw values. Semantic is the default for components. Component tokens exist only where semantic is insufficient.

## Consequences

### Positive

- Clear governance boundary per tier
- Themes map semantic → core per mode (light/dark)
- CSS variables generated from resolved token tree

### Negative / Trade-offs

- More indirection than flat token files — mitigated by typed exports and schema validation

### Operational Impact

- All new tokens require tier classification before merge
- **Migration / rollback:** N/A — greenfield

### Risks

| Risk | Likelihood | Impact | Mitigation | Owner | Review Trigger |
|------|-----------|--------|------------|-------|----------------|
| Token sprawl in component tier | Med | Med | Require justification in PR; prefer semantic first | Platform lead | >20 component tokens without semantic equivalent |

## Review Schedule

- **Next review:** JEDI v1.0 release
- **Review owner:** Platform lead

## Related ADRs

- ADR-002 — Layer boundaries (editorial exclusion)
- ADR-003 — Design language change policy (when tiers may evolve)

## References

- [CONSTITUTION.md](../CONSTITUTION.md)
- SeamKit design thinking (principles only, not assets)
