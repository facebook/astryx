---
'@astryxdesign/cli': patch
---

[fix] Make `foundation/` a true bottom layer: it no longer imports `api/`, and ESLint now enforces that direction alongside the existing `authoring/` and `api/` rules.

Two things were reaching upward. `Project` pulled template discovery out of `api/template`, whose adapter imported `Project` straight back — a dependency cycle across the layer boundary, in which `Project.templates()` triggered a second `Project.load()` whose integration templates it then discarded. And both `Project` and `integration-warnings` imported `validateLoadedIntegration` from the `validate-integration` command.

Neither was really misplaced logic, just misplaced files: the template adapter had no `api/` imports at all, and the contribution validators are shared infra. The adapter now lives at `foundation/discovery/template-adapter.mjs` and the validators at `foundation/integrations/validate-contributions.mjs`, so both sit with their callers and the cycle is gone.

Internal only — no public API change, and no behavior change: the CLI's observable surface (help, command output, error paths, exit codes) is byte-identical across 84 invocations.
@josephfarina
