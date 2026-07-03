# ADR-002: Layer Boundaries

## Status

**Status:** Accepted  
**Date:** 2026-07-04  
**Decision Maker(s):** JEDI Foundation Program  
**Supersedes:** None

## Context

JEDI is a platform, not a portfolio. Editorial and application-specific components must not enter design system packages.

**In scope:** Package boundary rules, editorial exclusion.  
**Out of scope:** Portfolio implementation.

## Decision

**Editorial components live in Portfolio V2.0 only.**

Excluded from JEDI: `FlagshipHero`, `EvidenceModule`, `CaseStudySection`, `LeadershipQuote`, `ProjectSidebar`.

Templates (page layouts for portfolio, case studies) are application-owned.

## Consequences

### Positive

- JEDI packages remain reusable across applications
- Clear consumption boundary: Portfolio → JEDI, never reverse

### Negative / Trade-offs

- Some UI used only in portfolio must be maintained separately

## References

- [CONSTITUTION.md](../CONSTITUTION.md) Principle 7
