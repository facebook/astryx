# JEDI-003: Package boundaries

## Status

**Status:** Accepted  
**Date:** 2026-07-03  
**Decision Maker(s):** John Ohio (Owner/Maintainer)  
**Supersedes:** None

## Context

JEDI v0.1 introduces `@jedi/*` packages alongside the existing Astryx fork (`@astryxdesign/*`). Package responsibilities must be explicit to prevent circular dependencies and scope creep.

**In scope:** v0.1 package ownership and dependency direction.  
**Out of scope:** Renaming or removing `@astryxdesign/*` from the monorepo (upstream fork remains).

## Decision

### Package responsibilities

| Package        | Owns                                                   | May depend on                                                          |
| -------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `@jedi/core`   | `JediProviders`, theme mode contract, shared types     | `@jedi/themes`, `@astryxdesign/core` (internal)                        |
| `@jedi/react`  | Public component re-exports and JEDI-specific wrappers | `@jedi/core`, `@astryxdesign/core` (internal)                          |
| `@jedi/themes` | Theme objects, CSS entrypoints for gothic/neutral      | `@astryxdesign/theme-gothic`, `@astryxdesign/theme-neutral` (internal) |
| `@jedi/tokens` | Token bridge CSS, compatibility aliases                | None (CSS only in v0.1)                                                |
| `@jedi/icons`  | Icon surface (v0.1 stub)                               | TBD v0.2                                                               |
| `@jedi/motion` | Motion primitives (v0.1 stub)                          | TBD v0.2                                                               |
| `@jedi/utils`  | Non-React helpers (v0.1 stub)                          | `@jedi/core`                                                           |

### Dependency direction

```
Applications  →  @jedi/*  →  @astryxdesign/*  (JEDI-internal only)
```

Applications **never** import `@astryxdesign/*`.

### Versioning

- JEDI public packages share semver line `0.1.x` for v0.1 release series
- Portfolio V2.0 pins `0.1.x`; bumps when portfolio phase advances (see compatibility policy in portfolio ADR-075)

## Consequences

### Positive

- Clear home for each concern
- Stubs (`icons`, `motion`, `utils`) reserve namespace without blocking v0.1

### Negative / Trade-offs

- Dual namespace (`@jedi/*` + `@astryxdesign/*`) in monorepo until upstream sync strategy matures

## Related

- JEDI-001, JEDI-002
- [VISION.md](../VISION.md)
