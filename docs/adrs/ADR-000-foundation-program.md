# ADR-000: JEDI Foundation Program

## Status

**Status:** Accepted  
**Date:** 2026-07-04  
**Decision Maker(s):** JEDI Foundation Program  
**Supersedes:** None

## Context

JEDI began as a portfolio refresh exercise, evolved into an Astryx wrapper fork (`legacy-wrapper` branch), and progressed through platform strategy before converging on an independent capability-driven platform.

The wrapper architecture created coupling problems: GitHub Packages friction, Vercel deployment issues, runtime dependency on `@astryxdesign/*`, and portfolio editorial components bleeding into reusable packages.

**In scope:** Re-founding JEDI as an independent platform; governance model; architecture freeze before implementation.  
**Out of scope:** Portfolio V2.0 implementation; npm publishing; upstream Astryx contributions.

## Decision Drivers

- JEDI must be a real platform, not a derivative wrapper
- Astryx is upstream reference only — never a runtime requirement
- Design Language must be separated from Design System
- Governance must precede implementation velocity
- Architecture must be frozen before component expansion

## Options Considered

### Option A: Continue Astryx Wrapper

- **Description:** Maintain fork as thin wrapper over `@astryxdesign/*` packages with JEDI branding.
- **Pros:** Faster initial component coverage; upstream parity
- **Cons:** Runtime coupling; cannot evolve token architecture independently; portfolio coupling
- **Effort:** Low
- **Notes:** Preserved on `legacy-wrapper` branch as historical reference

### Option B: Foundation Program (Independent Platform)

- **Description:** Re-found JEDI with capability-driven packages, constitution governance, ADRs, and zero runtime Astryx dependencies.
- **Pros:** Independent evolution; clear layer boundaries; open-source viability
- **Cons:** Higher upfront investment; must rebuild primitives
- **Effort:** High
- **Notes:** Active on `foundation-program` branch

## Decision

**We will use Option B — the Foundation Program — because JEDI must stand as an independent platform with frozen architecture before implementation continues.**

The [CONSTITUTION.md](../CONSTITUTION.md) is the governing document. Significant changes require ADRs, not ad-hoc redesign.

This ADR marks the transition:

```text
Legacy Wrapper Era  →  Foundation Program Era
```

Architecture is **frozen** as of this ADR. Implementation follows:

```text
Capability → Architecture → API → Implementation
```

## Consequences

### Positive

- Clear historical marker for contributors understanding the repository transformation
- Constitution and ADRs establish durable governance
- `legacy-wrapper` preserved; `foundation-program` is the active line of development

### Negative / Trade-offs

- Existing Astryx wrapper work is not carried forward on main development path

### Operational Impact

- All contributors read CONSTITUTION.md and LIFECYCLE.md before opening PRs
- **Migration / rollback:** N/A — greenfield re-foundation; rollback means returning to `legacy-wrapper`

### Risks

| Risk | Likelihood | Impact | Mitigation | Owner | Review Trigger |
|------|-----------|--------|------------|-------|----------------|
| Contributors confuse wrapper and foundation branches | Med | Med | README branch strategy; this ADR linked from CONTRIBUTING | Platform lead | New contributor onboarding |

## Review Schedule

- **Next review:** JEDI v1.0 merge to `main`
- **Review owner:** Platform lead

## Related ADRs

- ADR-001 — Token architecture (depends on this re-foundation)
- ADR-002 — Layer boundaries (depends on this re-foundation)
- ADR-003 — Design language change policy (Gate 1 evolvability rules)

## References

- [CONSTITUTION.md](../CONSTITUTION.md)
- [LIFECYCLE.md](../LIFECYCLE.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- `legacy-wrapper` branch — frozen wrapper era
- `foundation-program` branch — active platform development
