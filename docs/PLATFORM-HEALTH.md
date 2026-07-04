# Platform Health Dashboard

**Gate:** Gate 2 — Platform Health (Sprint 3)  
**Baseline date:** 2026-07-04  
**Prerequisite:** [ARCHITECTURE-FREEZE.md](./ARCHITECTURE-FREEZE.md)

---

## Summary

| Metric | Status | Baseline |
|--------|--------|----------|
| Test suite | PASS | 40 tests, 11 files |
| Build | PASS | 10 packages + 3 apps |
| Boundary checker | PASS | Graph + cycles + re-exports |
| Bundle size | PASS | Largest: `@jedi/tokens` 25.8 KB |
| Token coverage | WARN | 5 raw core color refs (baseline) |
| API snapshot | PASS | 10 packages tracked |
| Architectural Fitness | PASS | Per ACCEPTANCE.md |

**Gate 2 exit:** Platform measurable.

---

## Test Coverage

| Package | Tests | Status |
|---------|-------|--------|
| `@jedi/tokens` | 21 | PASS |
| `@jedi/themes` | 7 | PASS |
| `@jedi/stylex` | 4 | PASS |
| `@jedi/foundation` | 2 | PASS |
| `@jedi/react` | 1 | PASS |
| `@jedi/docs` | 1 | PASS |
| `@jedi/icons` | 1 | PASS (smoke) |
| `@jedi/patterns` | 1 | PASS (smoke) |
| `@jedi/a11y` | 1 | PASS (smoke) |
| `@jedi/motion` | 1 | PASS (smoke) |

---

## Bundle Size by Package

| Package | Size (dist) | Target |
|---------|-------------|--------|
| `@jedi/tokens` | 25.8 KB | < 50 KB |
| `@jedi/react` | 10.2 KB | < 50 KB |
| `@jedi/docs` | 6.0 KB | < 50 KB |
| `@jedi/patterns` | 4.9 KB | < 50 KB |
| `@jedi/foundation` | 4.1 KB | < 50 KB |
| `@jedi/stylex` | 4.0 KB | < 50 KB |
| `@jedi/themes` | 2.7 KB | < 50 KB |
| `@jedi/a11y` | 2.1 KB | < 50 KB |
| `@jedi/icons` | 1.9 KB | < 50 KB |
| `@jedi/motion` | 1.4 KB | < 50 KB |

Run: `pnpm metrics:bundle`

---

## Token Coverage

Raw core color references (should migrate to semantic tokens):

| Package | File | Count | References |
|---------|------|-------|------------|
| `@jedi/react` | index.tsx | 3 | `--jedi-color-blue-600` |
| `@jedi/docs` | index.tsx | 2 | `--jedi-color-blue-600`, `--jedi-color-blue-500` |

**Target:** 0 raw core color refs in component packages (Gate 3+ migration).

Run: `pnpm metrics:tokens`

---

## Public API Stability

Snapshot stored at `internal/metrics/api-snapshot.json`. CI compares export surface on each run.

Run: `pnpm metrics:api`

---

## CI Pipeline

```yaml
pnpm install → pnpm test → pnpm build → pnpm check:boundaries → pnpm metrics
```

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Local: `pnpm ci`

---

## Commands

```bash
pnpm test              # 40 tests
pnpm build             # full workspace
pnpm check:boundaries  # architecture enforcement
pnpm metrics           # bundle + token coverage + API snapshot
pnpm ci                # all of the above
```

---

## Next Gate

**Gate 3 — Reference Consumer Validation:** docs-app + examples public-API-only proof.
