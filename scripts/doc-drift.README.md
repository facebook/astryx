# doc-drift — the documentation staleness gate

One deterministic check that keeps generated/authored documentation artifacts
consistent with their source of truth. Docs (`*.doc.mjs`) are what agents and
consumers read; when they drift from the component source, agents get the wrong
contract. This gate makes that drift un-mergeable.

## Model

Every drift class is the same shape — an **artifact** must stay consistent with
a **source of truth**, checked **deterministically** (no AI, structure only):

| Class                | Source of truth                       | Artifact                | Status                                                   |
| -------------------- | ------------------------------------- | ----------------------- | -------------------------------------------------------- |
| `props`              | `{Name}Props` (TS type checker)       | `doc.mjs` `props[]`     | ✅ implemented                                           |
| `theme-registry`     | `themeProps()` literals + doc targets | `KNOWN_COMPONENTS`      | gated by `build-theme.registry.test.mjs` (fold in later) |
| `theme-completeness` | core themeable token set              | each theme's `tokens{}` | planned                                                  |

The check validates **structure** — which props exist, whether they're required.
It never touches the human-authored prose (descriptions, guidance). So an AI (or
an author) may regenerate the descriptions freely; this gate blocks a doc whose
_skeleton_ disagrees with source, so a regen can never ship a structurally-wrong
doc.

## How the props check resolves types

- Builds **one** TS program over core `.tsx` (+ `index.ts`) and reuses the
  checker — resolves `interface extends`, `type` unions, `Omit`/`Pick`. (~5s;
  a program-per-file is ~10× slower.)
- Extracts only **component-declared** props: members whose declaration is not
  in `BaseProps.ts` / React / the DOM lib. Inherited HTML/`aria-*`/`data-*`
  attributes and raw DOM `on*` handlers are excluded (see `INFRA_PROPS` /
  `isInfraProp`) — docs don't enumerate the shared platform surface.
- When a `{Name}Props` symbol is declared in more than one file, the one under
  the doc's own directory wins.

## Usage

```
node scripts/doc-drift.mjs                 # human report of all drift
node scripts/doc-drift.mjs --check         # exit 1 on NEW (non-baselined) drift — CI
node scripts/doc-drift.mjs --json          # machine-readable
node scripts/doc-drift.mjs --only=props    # one class
node scripts/doc-drift.mjs --update-baseline   # accept current drift as the baseline
```

## Rollout (why there's a baseline)

The repo has pre-existing drift (~101 items at introduction). Turning the gate
straight to red would block every PR. Instead:

1. **Land with a baseline** (`doc-drift.baseline.json`) of today's known drift.
   CI is green; new PRs are gated against _new_ drift only.
2. **Burn the baseline down** — regenerate the drifted docs (ideal AI task:
   deterministic target, prose fill-in), then `--update-baseline` to shrink it.
3. When the baseline hits zero, delete it — the gate is now fully strict.

`--check` compares findings against the baseline: only **new** ids fail. Fixed
baseline items are reported so the baseline can be shrunk.

## Findings

- `missing-from-doc` / `required-mismatch` — high confidence, actionable.
- `phantom-in-doc` — a documented prop not found as a component-declared prop.
  Lower confidence: some docs legitimately document a _related_ type's surface
  (e.g. Toast documents the imperative `toast()` options, not just `ToastProps`).
  Review before acting.
- `unresolved` — no resolvable `{Name}Props` in source (informational, not drift;
  e.g. a doc whose props live on a differently-named type).
