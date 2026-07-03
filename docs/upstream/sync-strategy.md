# Upstream Sync Strategy

## Architectural Independence

**Target:** JEDI v0.2 (end of Sprint 2 — Platform Infrastructure)

**Status:** ✅ **ACHIEVED** — 2026-07-04

**Criteria:**

- ✅ Zero `@astryxdesign/*` runtime imports in any JEDI package
- ✅ All public APIs owned by JEDI
- ✅ Token values are JEDI-native
- ✅ Build pipeline is JEDI-owned

Verified via `pnpm check:boundaries`.

## Ongoing Reference Policy

After Architectural Independence:

- Astryx is **optional reading**, never a requirement
- Evaluate upstream changes per [UPSTREAM.md](./UPSTREAM.md)
- Log all decisions in [decision-log.md](./decision-log.md)
- No scheduled sync cadence — read when building a new capability

## Local Reference

Clone `facebook/astryx` alongside the JEDI repo for read-only reference:

```bash
git clone --depth 1 https://github.com/facebook/astryx.git astryx
```

Do not add astryx as a workspace dependency.
