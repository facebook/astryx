# JEDI-001: Public API surface and internal boundary

## Status

**Status:** Accepted  
**Date:** 2026-07-03  
**Decision Maker(s):** John Ohio (Owner/Maintainer)  
**Supersedes:** None

## Context

JEDI is a platform consumed by multiple applications (portfolio as reference application, future demos, tools). Without a strict public/internal boundary, applications will import upstream Astryx packages or monorepo-relative paths, coupling them to implementation details and preventing independent versioning.

**In scope:** What applications may import from JEDI.  
**Out of scope:** Internal Astryx fork structure; portfolio application ADRs.

## Decision

**Applications import only published `@jedi/*` packages.** No `@astryxdesign/*`, no `@jedi/internal/*`, no relative paths into `packages/`.

### Public packages (v0.1)

| Package        | Surface                                                      |
| -------------- | ------------------------------------------------------------ |
| `@jedi/core`   | `JediProviders`, theme mode types, provider contracts        |
| `@jedi/react`  | React UI primitives (Button, Card, Badge, Link, layout, nav) |
| `@jedi/themes` | Theme objects and CSS entrypoints                            |
| `@jedi/tokens` | Token bridge CSS and token utilities                         |

### Internal (never imported by applications)

- `@astryxdesign/*` — upstream; JEDI-internal only
- `internal/*` — monorepo tooling
- Unpublished packages (`lab`, `vega`) — Storybook/sandbox only

### Enforcement

- ESLint `no-restricted-imports` in consumer applications
- Package boundary checks in JEDI CI (`check:package-boundaries`)

## Consequences

### Positive

- Replaceability: swapping Astryx affects JEDI only
- Clear semver contract between JEDI and applications
- Second applications can be built without fork access

### Negative / Trade-offs

- Thin re-export layer adds indirection until JEDI diverges from upstream
- Every new public component requires explicit export from `@jedi/react`

## Related

- [VISION.md](../VISION.md)
- JEDI-002 (theme architecture)
- JEDI-003 (package boundaries)
